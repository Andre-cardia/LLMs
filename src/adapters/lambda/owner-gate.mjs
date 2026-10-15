// Lambda GET /api/v1/whoami (AD-9): prova de ponta a ponta da camada autenticada.
// O JWT authorizer do API Gateway já validou assinatura, emissor, audiência e escopo;
// aqui só se confere token_use, client_id e sub contra OWNER_SUBS. Lista vazia nega.
// Arquivo autossuficiente (sem import): scripts/render-auth-stack.mjs o embute inline
// em infra/auth-stack.yaml e troca a linha final `export {...};` por `module.exports`.
// Nunca registra token nem claims; a Lambda não emite cabeçalhos CORS (AD-26).

const PRIVATE_HEADERS = Object.freeze({
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'private, no-store',
});

function parseOwnerSubs(raw) {
  if (typeof raw !== 'string') return new Set();
  return new Set(raw.split(',').map(sub => sub.trim()).filter(sub => sub.length > 0));
}

function respond(statusCode, body) {
  return {statusCode, headers: {...PRIVATE_HEADERS}, body: JSON.stringify(body)};
}

function denied(event) {
  const requestId = typeof event?.requestContext?.requestId === 'string' ? event.requestContext.requestId : null;
  return respond(403, {error: {code: 'ACCESS_DENIED', message: 'Forbidden', retryable: false}, requestId});
}

function ownerSub(claims, {ownerSubs, appClientId}) {
  if (claims === null || typeof claims !== 'object') return null;
  if (typeof appClientId !== 'string' || appClientId.length === 0) return null;
  if (claims.token_use !== 'access') return null;
  if (claims.client_id !== appClientId) return null;
  const sub = claims.sub;
  if (typeof sub !== 'string' || sub.length === 0 || !ownerSubs.has(sub)) return null;
  return sub;
}

function createOwnerGate({ownerSubs, appClientId}) {
  const allowed = parseOwnerSubs(ownerSubs);
  return async function ownerGate(event) {
    const claims = event?.requestContext?.authorizer?.jwt?.claims;
    const sub = ownerSub(claims, {ownerSubs: allowed, appClientId});
    if (sub === null) return denied(event);
    return respond(200, {ok: true, sub});
  };
}

// Lê o ambiente a cada invocação: o mesmo código serve preview e prod (AD-14).
async function handler(event) {
  return createOwnerGate({ownerSubs: process.env.OWNER_SUBS, appClientId: process.env.APP_CLIENT_ID})(event);
}

export {handler, createOwnerGate, parseOwnerSubs};
