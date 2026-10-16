import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {MARKER, PATHS, PUBLISHER_ENTRY, PUBLISHER_MARKER, READER_MARKER, bundleReader, readReaderModules, readerModuleOrder, renderAuthStack, renderFromRepo, toCommonJs} from '../scripts/render-auth-stack.mjs';

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
// Bloco literal do ZipFile: termina na primeira linha não vazia com menos de 10 espaços
// (um comentário de seção depois do recurso não faz parte do código).
const zipCode = fn => { const lines = fn.split('ZipFile: |\n')[1].split('\n'); const end = lines.findIndex(line => line !== '' && !line.startsWith(' '.repeat(10)));
  return (end === -1 ? lines : lines.slice(0, end)).map(line => line.replace(/^ {10}/, '')).join('\n'); };
const has = (block, re, label) => assert.match(block, re, label);

test('template gerado está atualizado com o template e o handler', async () => {
  assert.equal(await renderFromRepo(), generated);
  assert.equal(renderAuthStack({template, source, modules}), generated, 'render é determinístico');
  assert.ok(!generated.includes(MARKER));
  assert.ok(!generated.includes(READER_MARKER));
  assert.ok(!generated.includes(PUBLISHER_MARKER));
});

test('ZipFile contém o handler inteiro, convertido só na linha de export', () => {
  assert.deepEqual(typed('AWS::Lambda::Function').map(([name]) => name).sort(), ['OwnerGateFunction', 'SnapshotPublisherFunction', 'SnapshotReaderFunction']);
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
  assert.equal(statements.length, 4);
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
  // Escrita condicional imposta (Q2): PutObject sem If-None-Match em slices/* e manifest/revisions/* é negado.
  const conditional = statements.find(s => s.startsWith('DenyUnconditionalImmutablePut'));
  assert.ok(conditional, 'nega PutObject incondicional');
  has(conditional, /Effect: Deny\n/);
  has(conditional, /Principal: '\*'\n/);
  has(conditional, /Action: 's3:PutObject'\n/);
  assert.deepEqual([...conditional.matchAll(/^\s+- (!Sub '.*')$/gm)].map(m => m[1]),
    [`!Sub '\${${bucketName}.Arn}/slices/*'`, `!Sub '\${${bucketName}.Arn}/manifest/revisions/*'`]);
  has(conditional, /'Null':\n\s+s3:if-none-match: 'true'\n/);
  // Ponteiro e lease só mudam por escrita condicional: nega quando faltam If-Match e If-None-Match.
  const blind = statements.find(s => s.startsWith('DenyBlindPointerAndLeasePut'));
  assert.ok(blind, 'nega PutObject cego no ponteiro e no lease');
  has(blind, /Effect: Deny\n/);
  has(blind, /Action: 's3:PutObject'\n/);
  assert.deepEqual([...blind.matchAll(/^\s+- (!Sub '.*')$/gm)].map(m => m[1]),
    [`!Sub '\${${bucketName}.Arn}/manifest/current.json'`, `!Sub '\${${bucketName}.Arn}/control/*'`]);
  has(blind, /'Null':\n\s+s3:if-match: 'true'\n\s+s3:if-none-match: 'true'\n/);
  assert.doesNotMatch(conditional, /current\.json|control\//, 'ponteiro e lease usam If-Match, fora da negação');
});

test('saídas alimentam a configuração pública do shell', () => {
  const outputs = blocks(section(generated, 'Outputs'));
  assert.deepEqual(Object.keys(outputs).sort(), ['ApiOrigin', 'AppClientId', 'CognitoDomain', 'SnapshotBucketName', 'UserPoolId']);
});

test('fora do escopo: sem DynamoDB nem agendador; só a snapshot-publisher escreve no bucket', () => {
  assert.doesNotMatch(generated, /AWS::DynamoDB|AWS::Scheduler|AWS::Events/);
  // As únicas ações S3 concedidas (Allow) em todo o stack: leitura na snapshot-reader e publicação na snapshot-publisher.
  const allowed = Object.entries(resources).filter(([, b]) => b.includes('Type: AWS::IAM::Role\n'))
    .flatMap(([name, b]) => [...b.matchAll(/^\s+- (s3:[A-Za-z*]+)$/gm)].map(m => `${name}:${m[1]}`));
  // Nenhum papel apaga objetos: o release do lease é uma escrita condicional (vence o lease).
  assert.deepEqual(allowed.sort(), ['SnapshotPublisherRole:s3:GetObject', 'SnapshotPublisherRole:s3:PutObject', 'SnapshotReaderRole:s3:GetObject']);
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
  // O pacote do leitor leva só o que ele alcança, sem o Publicador nem o dataset.
  assert.deepEqual(readerModuleOrder(modules).sort(), ['src/adapters/lambda/owner-gate.mjs', 'src/adapters/lambda/snapshot-reader.mjs', 'src/contracts/manifest.mjs', 'src/contracts/primitives.mjs']);
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

// ---------- Publicação no S3 (Q2) ----------

test('snapshot-publisher: nodejs24.x arm64, timeout 30 s, só o bucket no ambiente', () => {
  const [, fn] = named('AWS::Lambda::Function', 'SnapshotPublisherFunction');
  has(fn, /Runtime: nodejs24\.x\n/);
  has(fn, /Architectures:\n\s+- arm64\n/);
  has(fn, /Handler: index\.handler\n/);
  has(fn, /Timeout: 30\n/);
  has(fn, /Role: !GetAtt SnapshotPublisherRole\.Arn\n/);
  has(fn, /LogGroup: !Ref SnapshotPublisherLogGroup\n/);
  has(fn, /SNAPSHOT_BUCKET: !Ref SnapshotBucket\n/);
  assert.doesNotMatch(fn, /OWNER_SUBS|APP_CLIENT_ID/, 'sem regra de dono: não há requisição HTTP');
});

test('snapshot-publisher: papel com Get/Put em slices/*, manifest/* e control/*, sem DeleteObject', () => {
  const [, role] = named('AWS::IAM::Role', 'SnapshotPublisherRole');
  const actions = [...role.matchAll(/^\s+- ([a-z0-9]+:[A-Za-z*]+)$/gm)].map(m => m[1]);
  assert.deepEqual(actions.filter(a => a !== 'sts:AssumeRole'), ['logs:CreateLogStream', 'logs:PutLogEvents', 's3:GetObject', 's3:PutObject']);
  assert.doesNotMatch(role, /s3:DeleteObject/);
  assert.doesNotMatch(role, /ManagedPolicyArns|dynamodb:|- s3:ListBucket|s3:\*|Resource: '?\*'?\n/);
  has(role, /Resource: !GetAtt SnapshotPublisherLogGroup\.Arn\n/);
  const resourcesAfter = marker => { const rest = role.slice(role.indexOf(marker)); const end = rest.indexOf('- Effect:', 1); return [...(end === -1 ? rest : rest.slice(0, end)).matchAll(/^\s+- (!Sub '.*')$/gm)].map(m => m[1]); };
  assert.deepEqual(resourcesAfter('- s3:GetObject'), ["!Sub '${SnapshotBucket.Arn}/slices/*'", "!Sub '${SnapshotBucket.Arn}/manifest/*'", "!Sub '${SnapshotBucket.Arn}/control/*'"]);
  has(role, /RoleName: !Sub 'llms-\$\{EnvironmentName\}-snapshot-publisher-\$\{AWS::Region\}'\n/);
});

test('snapshot-publisher: sem rota HTTP, integração nem permissão de invocação', () => {
  assert.equal(typed('AWS::Lambda::Permission').some(([, b]) => b.includes('SnapshotPublisherFunction')), false);
  assert.equal(typed('AWS::ApiGatewayV2::Integration').some(([, b]) => b.includes('SnapshotPublisherFunction')), false);
  assert.doesNotMatch(generated, /RouteKey: (POST|PUT|PATCH|DELETE)/);
});

// SDK S3 falso, fiel à escrita condicional: If-None-Match '*' e If-Match <etag> → 412.
function fakeS3Sdk() {
  const objects = new Map(); const sent = []; let version = 0;
  const commands = Object.fromEntries(['GetObjectCommand', 'PutObjectCommand', 'DeleteObjectCommand'].map(name => [name, class { constructor(input) { this.name = name; this.input = input; } }]));
  const failed = (name, status) => Object.assign(new Error(name), {name, $metadata: {httpStatusCode: status}});
  class S3Client {
    async send(command) {
      const {Key, IfNoneMatch, IfMatch, Body} = command.input; sent.push({command: command.name, ...command.input});
      const found = objects.get(Key);
      if (command.name === 'GetObjectCommand') {
        if (!found) throw failed('AccessDenied', 403);
        return {ETag: found.etag, Body: {transformToString: async encoding => { assert.equal(encoding, 'utf-8'); return found.text; }}};
      }
      if ((IfNoneMatch === '*' && found) || (IfMatch !== undefined && found?.etag !== IfMatch)) throw failed('PreconditionFailed', 412);
      if (command.name === 'DeleteObjectCommand') { objects.delete(Key); return {}; }
      const etag = `"e${version += 1}"`; objects.set(Key, {text: Body, etag}); return {ETag: etag};
    }
  }
  return {sdk: {S3Client, ...commands}, objects, sent};
}

function loadPublisher(sdkFake, env = {SNAPSHOT_BUCKET: 'bucket'}) {
  const [, fn] = named('AWS::Lambda::Function', 'SnapshotPublisherFunction');
  const module = {exports: {}}; const logs = []; const requires = [];
  vm.runInNewContext(zipCode(fn), {module, exports: module.exports, require: name => { requires.push(name); assert.equal(name, '@aws-sdk/client-s3'); return sdkFake.sdk; },
    console: {log: line => logs.push(line), warn: line => logs.push(line), error: line => logs.push(line)},
    // Só o que o runtime nodejs24.x oferece como global; os built-ins são os do próprio contexto.
    process: {env}, structuredClone, crypto: globalThis.crypto, TextEncoder, URL});
  return {handler: module.exports.handler, logs, requires};
}

test('aceite: pacote inline da publicação, num contexto limpo com SDK S3 falso, grava slices, manifesto e ponteiro com os cabeçalhos condicionais', async () => {
  const {SYNTHETIC_WORKSPACE} = await import('../src/contracts/synthetic-workspace.mjs');
  const {envelopeBytes, SLICES: NAMES} = await import('../src/contracts/snapshot.mjs');
  const {sha256Text} = await import('../src/adapters/memory-snapshots.mjs');
  const fake = fakeS3Sdk();
  const {handler, logs, requires} = loadPublisher(fake);
  const result = await handler({}, {awsRequestId: 'req-pub-1'});
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.deepEqual(requires, ['@aws-sdk/client-s3']);
  const puts = fake.sent.filter(c => c.command === 'PutObjectCommand');
  const putOf = key => puts.find(c => c.Key === key);
  for (const slice of NAMES) {
    const bytes = envelopeBytes(slice, SYNTHETIC_WORKSPACE[slice]);
    const put = putOf(`slices/${sha256Text(bytes)}`);
    assert.ok(put, slice); assert.equal(put.IfNoneMatch, '*'); assert.equal(put.IfMatch, undefined); assert.equal(put.Body, bytes);
    assert.equal(put.Bucket, 'bucket');
  }
  const manifestPut = putOf(`manifest/revisions/${result.revision}.json`);
  assert.equal(manifestPut.IfNoneMatch, '*'); assert.equal(manifestPut.IfMatch, undefined);
  const pointerPut = putOf('manifest/current.json');
  assert.equal(pointerPut.IfNoneMatch, '*', 'primeira publicação: ponteiro criado com If-None-Match');
  assert.deepEqual(JSON.parse(pointerPut.Body), {schemaVersion: 1, revision: result.revision, readableRevisions: [result.revision]});
  const leasePut = putOf('control/lease.json');
  assert.equal(leasePut.IfNoneMatch, '*');
  assert.equal(JSON.parse(leasePut.Body).owner, 'req-pub-1');
  // Ordem do AD-6: lease, slices, manifesto, ponteiro; o release regrava o próprio lease vencido com If-Match.
  assert.deepEqual(puts.map(c => c.Key.split('/')[0] === 'slices' ? 'slices' : c.Key), ['control/lease.json', 'slices', 'slices', 'slices', `manifest/revisions/${result.revision}.json`, 'manifest/current.json', 'control/lease.json']);
  assert.equal(fake.sent.some(c => c.command === 'DeleteObjectCommand'), false, 'nada é apagado');
  const release = puts.at(-1);
  assert.equal(release.IfMatch, '"e1"', 'release com If-Match no ETag do próprio lease');
  assert.ok(Date.parse(JSON.parse(release.Body).expiresAt) <= Date.now(), 'lease liberado = vencido');

  // Segunda invocação: slices repetidas (412 aceito, sem sobrescrita) e ponteiro por If-Match no ETag lido.
  const pointerEtag = fake.objects.get('manifest/current.json').etag;
  const sliceEtags = [...fake.objects].filter(([k]) => k.startsWith('slices/')).map(([k, v]) => [k, v.etag]);
  fake.sent.length = 0;
  const second = await handler({}, {awsRequestId: 'req-pub-2'});
  assert.equal(second.ok, true, JSON.stringify(second));
  assert.equal(second.fencingToken, 2, 'lease liberado continua no bucket: o fencing cresce entre publicações');
  assert.equal(fake.sent.find(c => c.command === 'PutObjectCommand' && c.Key === 'manifest/current.json').IfMatch, pointerEtag);
  for (const [key, etag] of sliceEtags) assert.equal(fake.objects.get(key).etag, etag, 'slice não sobrescrita');
  assert.deepEqual([...second.readableRevisions], [second.revision, result.revision]);
  assert.equal(logs.some(line => /Laborat|example\.invalid/.test(line)), false, 'log sem conteúdo');
});

test('snapshot-publisher inline: evento HTTP recusado sem tocar o S3; sem bucket → erro', async () => {
  const fake = fakeS3Sdk();
  const {handler} = loadPublisher(fake);
  const plain = value => JSON.parse(JSON.stringify(value));
  assert.deepEqual(plain(await handler({routeKey: 'POST /x', requestContext: {}}, {awsRequestId: 'r'})), {ok: false, error: 'PUBLISH_EVENT_NOT_ALLOWED'});
  assert.deepEqual(fake.sent, []);
  const none = loadPublisher(fake, {});
  assert.deepEqual(plain(await none.handler({}, {awsRequestId: 'r'})), {ok: false, error: 'SNAPSHOT_BUCKET_MISSING'});
  assert.deepEqual(none.requires, []);
});

test('render do publicador: pacote leva o Publicador, os contratos e o dataset, sem src/ui nem módulos node:', () => {
  const order = readerModuleOrder(modules, PUBLISHER_ENTRY);
  assert.ok(order.includes('src/adapters/s3-snapshots.mjs'));
  assert.ok(order.includes('src/contracts/synthetic-workspace.mjs'));
  assert.equal(order.some(path => path.startsWith('src/ui/') || path.includes('memory-')), false);
  const [, fn] = named('AWS::Lambda::Function', 'SnapshotPublisherFunction');
  assert.equal(zipCode(fn).trim(), bundleReader(modules, PUBLISHER_ENTRY).trim());
  assert.doesNotMatch(zipCode(fn), /^\s*(import|export)\s/m);
  const big = {...modules, 'src/contracts/provenance.mjs': `export const pad = '${'x'.repeat(100000)}';\n${modules['src/contracts/provenance.mjs']}`};
  assert.throws(() => renderAuthStack({template, source, modules: big}), /PUBLISHER_TOO_LARGE/);
});
