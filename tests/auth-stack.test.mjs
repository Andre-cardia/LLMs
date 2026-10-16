import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {MARKER, PATHS, READER_MARKER, bundleReader, readReaderModules, renderAuthStack, renderFromRepo, toCommonJs} from '../scripts/render-auth-stack.mjs';

const generated = await readFile(PATHS.output, 'utf8');
const template = await readFile(PATHS.template, 'utf8');
const source = await readFile(PATHS.source, 'utf8');
const modules = await readReaderModules();

// Sem pacote de YAML: o template usa indentação fixa de dois espaços, então cada recurso é
// o bloco entre `  Nome:` e o próximo cabeçalho do mesmo nível.
function section(text, name) {
  const match = text.match(new RegExp(`^${name}:\\n([\\s\\S]*?)(?=^\\S|(?![\\s\\S]))`, 'm'));
  assert.ok(match, `seção ${name}`);
  return match[1];
}
function blocks(body) {
  const out = {};
  const re = /^ {2}([A-Za-z0-9]+):\n([\s\S]*?)(?=^ {2}[A-Za-z0-9]+:\n|(?![\s\S]))/gm;
  for (const [, name, block] of body.matchAll(re)) out[name] = block;
  return out;
}
const resources = blocks(section(generated, 'Resources'));
const typed = type => Object.entries(resources).filter(([, b]) => b.includes(`Type: ${type}\n`));
function only(type) {
  const found = typed(type);
  assert.equal(found.length, 1, `exatamente um ${type}`);
  return found[0];
}
// Dois handlers (AD-27): recursos do mesmo tipo são achados pelo nome.
function named(type, name) {
  const found = typed(type).find(([resource]) => resource === name);
  assert.ok(found, `${type} ${name}`);
  return found;
}
const zipCode = fn => fn.split('ZipFile: |\n')[1].split('\n').map(line => line.replace(/^ {10}/, '')).join('\n');
const has = (block, re, label) => assert.match(block, re, label);

test('template gerado está atualizado com o template e o handler', async () => {
  assert.equal(await renderFromRepo(), generated);
  assert.equal(renderAuthStack({template, source, modules}), generated, 'render é determinístico');
  assert.ok(!generated.includes(MARKER));
  assert.ok(!generated.includes(READER_MARKER));
});

test('ZipFile contém o handler inteiro, convertido só na linha de export', () => {
  assert.equal(typed('AWS::Lambda::Function').length, 2, 'owner-gate e snapshot-reader');
  const [, fn] = named('AWS::Lambda::Function', 'OwnerGateFunction');
  const zip = fn.split('ZipFile: |\n')[1];
  assert.ok(zip, 'ZipFile inline');
  const code = zip.split('\n').map(line => line.replace(/^ {10}/, '')).join('\n').trim();
  assert.equal(code, toCommonJs(source).trim());
  assert.match(code, /^module\.exports = \{handler, createOwnerGate, parseOwnerSubs\};$/m);
  assert.doesNotMatch(code, /^\s*(import|export)\s/m);
});

test('código inline roda como CommonJS e preserva a regra do dono', async () => {
  const [, fn] = named('AWS::Lambda::Function', 'OwnerGateFunction');
  const code = fn.split('ZipFile: |\n')[1].split('\n').map(l => l.replace(/^ {10}/, '')).join('\n');
  const module = {exports: {}};
  vm.runInNewContext(code, {module, exports: module.exports, process: {env: {OWNER_SUBS: ' a , ,b ', APP_CLIENT_ID: 'cid'}}, JSON, Set, Object});
  const ev = c => ({requestContext: {requestId: 'r', authorizer: {jwt: {claims: c}}}});
  const ok = await module.exports.handler(ev({token_use: 'access', client_id: 'cid', sub: 'b'}));
  assert.equal(ok.statusCode, 200);
  assert.equal(ok.headers['cache-control'], 'private, no-store');
  assert.equal((await module.exports.handler(ev({token_use: 'id', client_id: 'cid', sub: 'b'}))).statusCode, 403);
});

test('render recusa template sem marcador, handler com import ou sem export final', () => {
  assert.throws(() => renderAuthStack({template: 'a: 1\n', source}), /AUTH_STACK_MARKER_REQUIRED/);
  assert.throws(() => renderAuthStack({template, source: `import x from 'y';\n${source}`}), /OWNER_GATE_IMPORT_NOT_ALLOWED/);
  assert.throws(() => renderAuthStack({template, source: 'const a = 1;\n'}), /OWNER_GATE_EXPORT_LINE_REQUIRED/);
  assert.throws(() => renderAuthStack({template, source: `export const z = 1;\n${source}`}), /OWNER_GATE_UNEXPECTED_EXPORT/);
});

test('parâmetros por ambiente e origem', () => {
  const params = blocks(section(generated, 'Parameters'));
  assert.deepEqual(Object.keys(params).sort(), ['AppOrigin', 'CognitoDomainPrefix', 'EnvironmentName', 'OwnerSubs']);
  has(params.EnvironmentName, /AllowedValues:\n\s+- preview\n\s+- prod\n/);
  has(params.OwnerSubs, /Default: ''\n/, 'lista vazia permitida');
  has(params.AppOrigin, /AllowedPattern: '\^https:\/\//, 'só HTTPS');
  const origin = new RegExp(params.AppOrigin.match(/AllowedPattern: '(.*)'/)[1]);
  assert.ok(origin.test('https://preview.example.com'));
  for (const bad of ['http://preview.example.com', 'https://preview.example.com/', 'https://preview.example.com/app']) assert.ok(!origin.test(bad), bad);
});

test('Cognito: só admin cria usuário, managed login v2, client público com code e escopos da API', () => {
  const [, pool] = only('AWS::Cognito::UserPool');
  has(pool, /AdminCreateUserConfig:\n\s+AllowAdminCreateUserOnly: true\n/);
  const [, domain] = only('AWS::Cognito::UserPoolDomain');
  has(domain, /ManagedLoginVersion: 2\n/);
  has(domain, /Domain: !Ref CognitoDomainPrefix\n/);
  const [, server] = only('AWS::Cognito::UserPoolResourceServer');
  has(server, /Identifier: llms-api\n/);
  has(server, /ScopeName: read\n/);
  has(server, /ScopeName: write\n/);

  const [clientName, client] = only('AWS::Cognito::UserPoolClient');
  assert.equal(clientName, 'AppClient');
  has(client, /GenerateSecret: false\n/);
  has(client, /AllowedOAuthFlowsUserPoolClient: true\n/);
  has(client, /AllowedOAuthFlows:\n\s+- code\n(?!\s+- )/, 'só code');
  assert.doesNotMatch(client, /implicit|client_credentials/);
  has(client, /AllowedOAuthScopes:\n\s+- llms-api\/read\n\s+- llms-api\/write\n(?!\s+- )/);
  assert.doesNotMatch(generated, /aws\.cognito\.signin\.user\.admin/);
  assert.doesNotMatch(client, /\bopenid\b|\bprofile\b|\bemail\b/);
  has(client, /SupportedIdentityProviders:\n\s+- COGNITO\n(?!\s+- )/);
  has(client, /PreventUserExistenceErrors: ENABLED\n/);
  has(client, /EnableTokenRevocation: true\n/);
  has(client, /CallbackURLs:\n\s+- !Sub '\$\{AppOrigin\}\/app\/auth\/callback'\n(?!\s+- )/);
  has(client, /LogoutURLs:\n\s+- !Sub '\$\{AppOrigin\}\/app\/'\n(?!\s+- )/);
});

test('HTTP API: CORS só da origem, authorizer JWT com Audience = client, rota exige llms-api/read', () => {
  const [, api] = only('AWS::ApiGatewayV2::Api');
  has(api, /ProtocolType: HTTP\n/);
  has(api, /AllowOrigins:\n\s+- !Ref AppOrigin\n(?!\s+- )/);
  has(api, /AllowMethods:\n\s+- GET\n(?!\s+- )/);
  has(api, /AllowHeaders:\n\s+- Authorization\n(?!\s+- )/);
  assert.doesNotMatch(api, /AllowCredentials: true/);

  const [authName, auth] = only('AWS::ApiGatewayV2::Authorizer');
  has(auth, /AuthorizerType: JWT\n/);
  has(auth, /IdentitySource:\n\s+- \$request\.header\.Authorization\n/);
  has(auth, /Issuer: !Sub 'https:\/\/cognito-idp\.\$\{AWS::Region\}\.amazonaws\.com\/\$\{UserPool\}'\n/);
  has(auth, /Audience:\n\s+- !Ref AppClient\n(?!\s+- )/);

  const routes = typed('AWS::ApiGatewayV2::Route');
  // /whoami e as duas rotas de leitura do AD-27; nenhuma rota OPTIONS (CORS fica no gateway).
  assert.deepEqual(routes.map(([, b]) => b.match(/RouteKey: (.*)\n/)[1]).sort(),
    ['GET /api/v1/snapshot', 'GET /api/v1/snapshots/{revision}/{slice}', 'GET /api/v1/whoami']);
  assert.doesNotMatch(generated, /RouteKey: OPTIONS|RouteKey: \$default|RouteKey: ANY/);
  const [, route] = named('AWS::ApiGatewayV2::Route', 'WhoamiRoute');
  has(route, /RouteKey: GET \/api\/v1\/whoami\n/);
  for (const [, block] of routes) {
    has(block, /AuthorizationType: JWT\n/);
    has(block, new RegExp(`AuthorizerId: !Ref ${authName}\\n`));
    has(block, /AuthorizationScopes:\n\s+- llms-api\/read\n(?!\s+- )/);
  }
  has(route, /Target: !Sub 'integrations\/\$\{OwnerGateIntegration\}'\n/);
  for (const name of ['SnapshotManifestRoute', 'SnapshotSliceRoute']) has(named('AWS::ApiGatewayV2::Route', name)[1], /Target: !Sub 'integrations\/\$\{SnapshotReaderIntegration\}'\n/);

  const integrations = typed('AWS::ApiGatewayV2::Integration');
  assert.deepEqual(integrations.map(([name]) => name).sort(), ['OwnerGateIntegration', 'SnapshotReaderIntegration']);
  for (const [, integration] of integrations) has(integration, /PayloadFormatVersion: '2\.0'\n/);

  const [, stage] = only('AWS::ApiGatewayV2::Stage');
  has(stage, /StageName: \$default\n/);
  has(stage, /AutoDeploy: true\n/);
  has(stage, /ThrottlingBurstLimit: \d+\n/);
  has(stage, /ThrottlingRateLimit: \d+\n/);
});

test('Lambda nodejs24.x arm64 com ambiente do dono e papel só de logs', () => {
  const [, fn] = named('AWS::Lambda::Function', 'OwnerGateFunction');
  has(fn, /Runtime: nodejs24\.x\n/);
  has(fn, /Architectures:\n\s+- arm64\n/);
  has(fn, /Handler: index\.handler\n/);
  has(fn, /OWNER_SUBS: !Ref OwnerSubs\n/);
  has(fn, /APP_CLIENT_ID: !Ref AppClient\n/);
  const timeout = Number(fn.match(/Timeout: (\d+)\n/)[1]);
  assert.ok(timeout <= 5, 'timeout curto');

  const [, role] = named('AWS::IAM::Role', 'OwnerGateRole');
  const actions = [...role.matchAll(/^\s+- ([a-z0-9]+:[A-Za-z*]+)$/gm)].map(m => m[1]);
  assert.deepEqual(actions.filter(a => a !== 'sts:AssumeRole'), ['logs:CreateLogStream', 'logs:PutLogEvents']);
  assert.doesNotMatch(role, /ManagedPolicyArns|s3:|dynamodb:/);
  // O papel só escreve no log group da própria função.
  assert.doesNotMatch(role, /Resource: '?\*'?\n/);
  has(role, /Resource: !GetAtt OwnerGateLogGroup\.Arn\n/);
  has(role, /RoleName: !Sub 'llms-\$\{EnvironmentName\}-owner-gate-\$\{AWS::Region\}'\n/, 'nome de papel inclui a região');
});

test('S3: bloqueio público total, BucketOwnerEnforced, SSE-S3, versionamento, nega sem TLS e presigned', () => {
  const [bucketName, bucket] = only('AWS::S3::Bucket');
  for (const flag of ['BlockPublicAcls', 'BlockPublicPolicy', 'IgnorePublicAcls', 'RestrictPublicBuckets']) has(bucket, new RegExp(`${flag}: true\\n`));
  has(bucket, /ObjectOwnership: BucketOwnerEnforced\n/);
  has(bucket, /SSEAlgorithm: AES256\n/);
  has(bucket, /VersioningConfiguration:\n\s+Status: Enabled\n/);

  const [, policy] = only('AWS::S3::BucketPolicy');
  has(policy, new RegExp(`Bucket: !Ref ${bucketName}\\n`));
  const statements = policy.split(/\n\s+- Sid: /).slice(1).map(s => `${s.trimEnd()}\n`);
  assert.equal(statements.length, 2);
  const tls = statements.find(s => s.includes('aws:SecureTransport'));
  const presigned = statements.find(s => s.includes('s3:authType'));
  for (const s of [tls, presigned]) {
    has(s, /Effect: Deny\n/);
    has(s, /Principal: '\*'\n/);
    has(s, /Action: 's3:\*'\n/);
    has(s, new RegExp(`- !GetAtt ${bucketName}\\.Arn\\n`));
    has(s, new RegExp(`- !Sub '\\$\\{${bucketName}\\.Arn\\}/\\*'\\n`));
  }
  has(tls, /Bool:\n\s+aws:SecureTransport: 'false'\n/);
  has(presigned, /StringEquals:\n\s+s3:authType: REST-QUERY-STRING\n/);
});

test('saídas alimentam a configuração pública do shell', () => {
  const outputs = blocks(section(generated, 'Outputs'));
  assert.deepEqual(Object.keys(outputs).sort(), ['ApiOrigin', 'AppClientId', 'CognitoDomain', 'SnapshotBucketName', 'UserPoolId']);
});

test('fora do escopo: sem DynamoDB, agendador nem escrita no bucket', () => {
  assert.doesNotMatch(generated, /AWS::DynamoDB|AWS::Scheduler|AWS::Events/);
  // Publicação é Q2: a única ação S3 concedida (Allow) em todo o stack é s3:GetObject, no papel da snapshot-reader.
  const allowed = Object.entries(resources).filter(([, b]) => b.includes('Type: AWS::IAM::Role\n'))
    .flatMap(([name, b]) => [...b.matchAll(/^\s+- (s3:[A-Za-z*]+)$/gm)].map(m => `${name}:${m[1]}`));
  assert.deepEqual(allowed, ['SnapshotReaderRole:s3:GetObject']);
  // A bucket policy só nega; nenhuma concessão por recurso.
  const [, policy] = only('AWS::S3::BucketPolicy');
  assert.doesNotMatch(policy, /Effect: Allow/);
});

test('sem segredo, token ou ID real no template', () => {
  const forbidden = [
    [/AKIA[0-9A-Z]{16}/, 'access key'],
    [/(?<![\w-])\d{12}(?![\w-])/, 'ID de conta'],
    [/[a-z]{2}-[a-z]+-\d_[0-9A-Za-z]{9}/, 'user pool ID'],
    [/\b[a-z0-9]{26}\b/, 'client id'],
    [/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, 'sub/UUID'],
    [/eyJ[A-Za-z0-9_-]{10,}/, 'JWT'],
    [/arn:aws:/, 'ARN literal'],
    [/execute-api\.[a-z0-9-]+\.amazonaws\.com/, 'endpoint real'],
    [/ClientSecret|SecretString/, 'segredo'],
  ];
  for (const text of [generated, template]) for (const [re, label] of forbidden) assert.doesNotMatch(text, re, label);
  const params = blocks(section(generated, 'Parameters'));
  for (const [name, block] of Object.entries(params)) {
    const value = block.match(/Default: (.*)\n/)?.[1];
    if (value !== undefined) assert.equal(value, "''", `${name} sem default real`);
  }
});

test('revisão: render recusa handler grande demais, com tab, import() ou require()', () => {
  const big = `const pad = '${'x'.repeat(5000)}';\n${source}`;
  assert.throws(() => renderAuthStack({template, source: big, modules}), /OWNER_GATE_TOO_LARGE/);
  assert.throws(() => renderAuthStack({template, source: `\tconst t = 1;\n${source}`, modules}), /OWNER_GATE_TAB_NOT_ALLOWED/);
  assert.throws(() => renderAuthStack({template, source: `const m = import('x');\n${source}`, modules}), /OWNER_GATE_IMPORT_NOT_ALLOWED/);
  assert.throws(() => renderAuthStack({template, source: `const m = require('x');\n${source}`, modules}), /OWNER_GATE_IMPORT_NOT_ALLOWED/);
  // Comentário citando import não é import.
  assert.doesNotThrow(() => renderAuthStack({template, source: `// import x from 'y' é proibido aqui\n${source}`, modules}));
});

test('revisão: render produz o mesmo template a partir de checkout com CRLF', () => {
  const crlf = text => text.replace(/\n/g, '\r\n');
  const crlfModules = Object.fromEntries(Object.entries(modules).map(([path, text]) => [path, crlf(text)]));
  assert.equal(renderAuthStack({template: crlf(template), source: crlf(source), modules: crlfModules}), generated);
});

test('revisão: prefixo do domínio recusa aws, amazon e cognito já na validação de parâmetros', () => {
  const params = blocks(section(generated, 'Parameters'));
  const pattern = new RegExp(params.CognitoDomainPrefix.match(/AllowedPattern: '([^']+)'/)[1]);
  for (const bad of ['my-aws-app', 'amazon', 'llms-cognito']) assert.equal(pattern.test(bad), false, bad);
  for (const ok of ['llms-preview-andre', 'a1']) assert.equal(pattern.test(ok), true, ok);
});

test('revisão: invocação da Lambda limitada à rota whoami desta API', () => {
  const [, permission] = named('AWS::Lambda::Permission', 'OwnerGateInvokePermission');
  has(permission, /Principal: apigateway\.amazonaws\.com\n/);
  has(permission, /SourceArn: !Sub 'arn:\$\{AWS::Partition\}:execute-api:\$\{AWS::Region\}:\$\{AWS::AccountId\}:\$\{HttpApi\}\/\*\/GET\/api\/v1\/whoami'\n/);
});

test('revisão: proteções de exclusão, MFA em prod, senha, plano e tokens', () => {
  const [, pool] = only('AWS::Cognito::UserPool');
  has(pool, /DeletionProtection: !If \[IsProd, ACTIVE, INACTIVE\]\n/);
  has(pool, /MfaConfiguration: !If \[IsProd, 'ON', 'OPTIONAL'\]\n/);
  has(pool, /- SOFTWARE_TOKEN_MFA\n/);
  has(pool, /MinimumLength: 14\n/);
  has(pool, /UserPoolTier: ESSENTIALS\n/);
  const [, bucket] = only('AWS::S3::Bucket');
  has(bucket, /DeletionPolicy: Retain\n/);
  has(bucket, /UpdateReplacePolicy: Retain\n/);
  has(bucket, /NoncurrentVersionExpiration:\n\s+NoncurrentDays: \d+\n/);
  has(bucket, /AbortIncompleteMultipartUpload:\n\s+DaysAfterInitiation: \d+\n/);
});

test('revisão: stage registra acesso sem token nem claims', () => {
  const [, stage] = only('AWS::ApiGatewayV2::Stage');
  has(stage, /AccessLogSettings:\n\s+DestinationArn: !GetAtt ApiAccessLogGroup\.Arn\n/);
  const format = stage.match(/Format: '([^']+)'/)[1];
  assert.doesNotMatch(format, /authorization|claims|jwt/i);
  has(format, /\$context\.requestId/);
  has(format, /\$context\.authorizer\.error/);
});

// ---------- Leitura de snapshot (AD-27) ----------

test('snapshot-reader: nodejs24.x arm64, ambiente do dono e do bucket', () => {
  const [, fn] = named('AWS::Lambda::Function', 'SnapshotReaderFunction');
  has(fn, /Runtime: nodejs24\.x\n/);
  has(fn, /Architectures:\n\s+- arm64\n/);
  has(fn, /Handler: index\.handler\n/);
  has(fn, /Role: !GetAtt SnapshotReaderRole\.Arn\n/);
  has(fn, /OWNER_SUBS: !Ref OwnerSubs\n/);
  has(fn, /APP_CLIENT_ID: !Ref AppClient\n/);
  has(fn, /SNAPSHOT_BUCKET: !Ref SnapshotBucket\n/);
  has(fn, /LogGroup: !Ref SnapshotReaderLogGroup\n/);
  assert.ok(Number(fn.match(/Timeout: (\d+)\n/)[1]) <= 6, 'timeout curto');
});

test('snapshot-reader: papel com logs e só s3:GetObject em manifest/* e slices/* do bucket', () => {
  const [, role] = named('AWS::IAM::Role', 'SnapshotReaderRole');
  const actions = [...role.matchAll(/^\s+- ([a-z0-9]+:[A-Za-z*]+)$/gm)].map(m => m[1]);
  assert.deepEqual(actions.filter(a => a !== 'sts:AssumeRole'), ['logs:CreateLogStream', 'logs:PutLogEvents', 's3:GetObject']);
  assert.doesNotMatch(role, /ManagedPolicyArns|dynamodb:|Resource: '?\*'?\n/);
  has(role, /Resource: !GetAtt SnapshotReaderLogGroup\.Arn\n/);
  const s3 = role.slice(role.indexOf('- s3:GetObject'));
  const resourcesOf = [...s3.matchAll(/^\s+- (!Sub '.*')$/gm)].map(m => m[1]);
  assert.deepEqual(resourcesOf, ["!Sub '${SnapshotBucket.Arn}/manifest/*'", "!Sub '${SnapshotBucket.Arn}/slices/*'"]);
  has(role, /RoleName: !Sub 'llms-\$\{EnvironmentName\}-snapshot-reader-\$\{AWS::Region\}'\n/);
});

test('snapshot-reader: invocação limitada às duas rotas de snapshot desta API, sem curinga de sufixo', () => {
  const prefix = "SourceArn: !Sub 'arn:${AWS::Partition}:execute-api:${AWS::Region}:${AWS::AccountId}:${HttpApi}/*/GET/api/v1/";
  for (const [name, route] of [['SnapshotReaderManifestPermission', 'snapshot'], ['SnapshotReaderSlicePermission', 'snapshots/*/*']]) {
    const [, permission] = named('AWS::Lambda::Permission', name);
    has(permission, /FunctionName: !Ref SnapshotReaderFunction\n/);
    has(permission, /Principal: apigateway\.amazonaws\.com\n/);
    assert.ok(permission.includes(`${prefix}${route}'\n`), name);
  }
  assert.doesNotMatch(generated, /GET\/api\/v1\/snapshot\*'/);
});

test('snapshot-reader: ZipFile é o pacote dos imports locais e roda como CommonJS com a regra do dono', async () => {
  const [, fn] = named('AWS::Lambda::Function', 'SnapshotReaderFunction');
  const code = zipCode(fn);
  assert.equal(code.trim(), bundleReader(modules).trim());
  assert.doesNotMatch(code, /^\s*(import|export)\s/m);
  assert.deepEqual(Object.keys(modules).sort(), ['src/adapters/lambda/owner-gate.mjs', 'src/adapters/lambda/snapshot-reader.mjs', 'src/contracts/manifest.mjs', 'src/contracts/primitives.mjs']);
  const requires = [];
  const module = {exports: {}};
  vm.runInNewContext(code, {module, exports: module.exports, require: name => { requires.push(name); throw new Error('sem SDK no teste'); },
    process: {env: {OWNER_SUBS: 'owner-a', APP_CLIENT_ID: 'cid', SNAPSHOT_BUCKET: 'bucket'}}, JSON, Set, Map, Object, Array, String, Number, Date, RegExp, Reflect, TypeError, Error, BigInt, Symbol, structuredClone});
  const ev = (c, routeKey = 'GET /api/v1/snapshot') => ({routeKey, requestContext: {requestId: 'r', authorizer: {jwt: {claims: c}}}});
  const outsider = await module.exports.handler(ev({token_use: 'access', client_id: 'cid', sub: 'b'}));
  assert.equal(outsider.statusCode, 403);
  assert.deepEqual(requires, [], 'não dono não carrega o SDK nem lê o S3');
  const owner = await module.exports.handler(ev({token_use: 'access', client_id: 'cid', sub: 'owner-a'}));
  assert.equal(owner.statusCode, 503);
  assert.equal(owner.headers['cache-control'], 'private, no-store');
  assert.deepEqual(requires, ['@aws-sdk/client-s3']);
});

test('revisão: pacote inline completo com SDK S3 falso serve manifesto e bytes exatos; chave ausente é 404', async () => {
  const {fakeBucket, mirrorPublications} = await import('./helpers/snapshot-bucket.mjs');
  const {workspace, publish} = await import('./helpers/local-fixtures.mjs');
  const work = workspace(); publish(work);
  const bucket = fakeBucket();
  const [revision] = mirrorPublications(work, bucket, [work.control.read().snapshotRevision]);
  class GetObjectCommand { constructor(input) { this.input = input; } }
  const sdk = {GetObjectCommand, S3Client: class {
    async send(command) {
      const text = bucket.objects.get(command.input.Key);
      if (text === undefined) { const error = new Error('denied'); error.name = 'AccessDenied'; throw error; }
      return {Body: {transformToString: async encoding => { assert.equal(encoding, 'utf-8'); return text; }}};
    }
  }};
  const [, fn] = named('AWS::Lambda::Function', 'SnapshotReaderFunction');
  const module = {exports: {}};
  const logs = [];
  vm.runInNewContext(zipCode(fn), {module, exports: module.exports, require: name => { assert.equal(name, '@aws-sdk/client-s3'); return sdk; },
    console: {warn: line => logs.push(line), error: line => logs.push(line)},
    // Só o que o runtime do Lambda injeta; os built-ins são os do próprio contexto,
    // como num único realm (passar Object/JSON do host quebraria a checagem de protótipo).
    process: {env: {OWNER_SUBS: 'owner-a', APP_CLIENT_ID: 'cid', SNAPSHOT_BUCKET: 'bucket'}}, structuredClone});
  const claims = {token_use: 'access', client_id: 'cid', sub: 'owner-a'};
  const ev = (routeKey, pathParameters) => ({routeKey, pathParameters, requestContext: {requestId: 'r', authorizer: {jwt: {claims}}}});
  const manifest = await module.exports.handler(ev('GET /api/v1/snapshot'));
  assert.equal(manifest.statusCode, 200, `logs: ${logs.join(' | ')}`);
  const body = JSON.parse(manifest.body);
  assert.equal(body.revision, revision);
  assert.equal(Object.values(body.slices).some(ref => 'objectKey' in ref), false);
  const slice = await module.exports.handler(ev('GET /api/v1/snapshots/{revision}/{slice}', {revision, slice: 'catalog'}));
  assert.equal(slice.statusCode, 200);
  assert.equal(slice.body, work.snapshots.readSlice(revision, 'catalog', work.owner));
  bucket.objects.clear();
  const missing = await module.exports.handler(ev('GET /api/v1/snapshot'));
  assert.equal(missing.statusCode, 404);
  assert.ok(logs.some(line => line.includes('AccessDenied')), 'nome do erro do S3 vai ao log');
  assert.equal(logs.some(line => /owner-a|eyJ|catalog/.test(line)), false, 'log sem sub nem conteúdo');
});

test('render do leitor recusa import fora da forma, require não permitido, ciclo e módulo ausente', async () => {
  const entry = 'src/adapters/lambda/snapshot-reader.mjs';
  const withEntry = text => ({...modules, [entry]: text});
  assert.throws(() => bundleReader(withEntry(`import x from './owner-gate.mjs';\n${modules[entry]}`)), /READER_IMPORT_NOT_ALLOWED/);
  assert.throws(() => bundleReader(withEntry(`const m = import('./x.mjs');\n${modules[entry]}`)), /READER_IMPORT_NOT_ALLOWED/);
  assert.throws(() => bundleReader(withEntry(`const fs = require('node:fs');\n${modules[entry]}`)), /READER_REQUIRE_NOT_ALLOWED/);
  assert.throws(() => bundleReader(withEntry(`import {a} from './missing.mjs';\n${modules[entry]}`)), /READER_MODULE_MISSING/);
  const cyclic = {...modules, 'src/contracts/primitives.mjs': `import {SLICES} from './manifest.mjs';\n${modules['src/contracts/primitives.mjs']}`};
  assert.throws(() => bundleReader(cyclic), /READER_IMPORT_CYCLE/);
  assert.throws(() => bundleReader({...modules, 'src/contracts/primitives.mjs': `export * from './x.mjs';\n`}), /READER_EXPORT_NOT_ALLOWED/);
  const big = {...modules, 'src/contracts/primitives.mjs': `export const pad = '${'x'.repeat(40000)}';\n${modules['src/contracts/primitives.mjs']}`};
  assert.throws(() => renderAuthStack({template, source, modules: big}), /READER_TOO_LARGE/);
});
