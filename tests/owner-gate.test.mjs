import test from 'node:test';
import assert from 'node:assert/strict';
import {createOwnerGate, handler, parseOwnerSubs} from '../src/adapters/lambda/owner-gate.mjs';

const CLIENT = 'test-client-id';
const claims = overrides => ({token_use: 'access', client_id: CLIENT, sub: 'owner-a', scope: 'llms-api/read', ...overrides});
const event = c => ({version: '2.0', requestContext: {requestId: 'req-1', authorizer: {jwt: {claims: c, scopes: ['llms-api/read']}}}});

function assertPrivate(res) {
  assert.equal(res.headers['cache-control'], 'private, no-store');
  assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
  for (const name of Object.keys(res.headers)) assert.ok(!name.startsWith('access-control-'), `Lambda não emite CORS: ${name}`);
}
function assertDenied(res) {
  assert.equal(res.statusCode, 403);
  assertPrivate(res);
  // 403 genérico: mesmo corpo para todo motivo, sem sub, claims ou causa.
  assert.deepEqual(JSON.parse(res.body), {error: {code: 'ACCESS_DENIED', message: 'Forbidden', retryable: false}, requestId: 'req-1'});
}

test('dono autenticado recebe 200 {ok, sub} privado', async () => {
  const gate = createOwnerGate({ownerSubs: 'owner-a', appClientId: CLIENT});
  const res = await gate(event(claims()));
  assert.equal(res.statusCode, 200);
  assertPrivate(res);
  assert.deepEqual(JSON.parse(res.body), {ok: true, sub: 'owner-a'});
});

test('ID token é recusado', async () => {
  assertDenied(await createOwnerGate({ownerSubs: 'owner-a', appClientId: CLIENT})(event(claims({token_use: 'id'}))));
});

test('token de outro client é recusado', async () => {
  const gate = createOwnerGate({ownerSubs: 'owner-a', appClientId: CLIENT});
  assertDenied(await gate(event(claims({client_id: 'other-client'}))));
  assertDenied(await gate(event(claims({client_id: undefined, aud: CLIENT}))));
});

test('sub fora da lista é recusado', async () => {
  assertDenied(await createOwnerGate({ownerSubs: 'owner-a', appClientId: CLIENT})(event(claims({sub: 'owner-b'}))));
});

test('lista vazia ou ausente nega todos', async () => {
  for (const ownerSubs of ['', ' , ', undefined]) {
    assertDenied(await createOwnerGate({ownerSubs, appClientId: CLIENT})(event(claims())));
  }
});

test('APP_CLIENT_ID ausente nega todos', async () => {
  for (const appClientId of ['', undefined]) {
    assertDenied(await createOwnerGate({ownerSubs: 'owner-a', appClientId})(event(claims({client_id: appClientId}))));
  }
});

test('evento sem authorizer.jwt é recusado', async () => {
  const gate = createOwnerGate({ownerSubs: 'owner-a', appClientId: CLIENT});
  assertDenied(await gate({requestContext: {requestId: 'req-1'}}));
  assertDenied(await gate({requestContext: {requestId: 'req-1', authorizer: {}}}));
  assertDenied(await gate(event(null)));
  const res = await gate(undefined);
  assert.equal(res.statusCode, 403);
  assert.equal(JSON.parse(res.body).requestId, null);
});

test('sub vazio ou não string é recusado mesmo com lista que o "contém"', async () => {
  const gate = createOwnerGate({ownerSubs: 'owner-a', appClientId: CLIENT});
  assertDenied(await gate(event(claims({sub: ''}))));
  assertDenied(await gate(event(claims({sub: ['owner-a']}))));
});

test('lista com espaços e vazios aceita a e b e ignora vazio', async () => {
  assert.deepEqual([...parseOwnerSubs(' a , ,b ')], ['a', 'b']);
  const gate = createOwnerGate({ownerSubs: ' a , ,b ', appClientId: CLIENT});
  for (const sub of ['a', 'b']) assert.equal((await gate(event(claims({sub})))).statusCode, 200);
  assertDenied(await gate(event(claims({sub: ''}))));
  assertDenied(await gate(event(claims({sub: ' a '}))));
});

test('handler lê OWNER_SUBS e APP_CLIENT_ID do ambiente a cada invocação', async t => {
  const saved = {OWNER_SUBS: process.env.OWNER_SUBS, APP_CLIENT_ID: process.env.APP_CLIENT_ID};
  t.after(() => { for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } });
  process.env.APP_CLIENT_ID = CLIENT;
  process.env.OWNER_SUBS = 'owner-a';
  assert.equal((await handler(event(claims()))).statusCode, 200);
  process.env.OWNER_SUBS = '';
  assert.equal((await handler(event(claims()))).statusCode, 403);
});

test('nunca registra token nem claims', async t => {
  const logged = [];
  for (const method of ['log', 'info', 'warn', 'error', 'debug']) t.mock.method(console, method, (...args) => logged.push(args));
  const gate = createOwnerGate({ownerSubs: 'owner-a', appClientId: CLIENT});
  const withHeader = c => ({...event(c), headers: {authorization: 'Bearer secret.jwt.value'}});
  await gate(withHeader(claims()));
  await gate(withHeader(claims({token_use: 'id'})));
  assert.deepEqual(logged, []);
});
