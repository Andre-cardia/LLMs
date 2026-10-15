// Único arquivo que toca `window` e o DOM. Monta as portas reais do navegador e
// entrega tudo a createBrowserShell (a raiz de composição). Página mínima desta
// sequência: Busca, resultados, Empresa selecionada e marcador de procedência,
// sem o visual do UX. Não é coberto por `node --test`.
// Login (AD-9): com AUTH_CONFIG.enabled === false nada de auth roda e a página
// se comporta como antes; ligado, completeLogin() consome `#code=` antes do
// shell.start() (e, portanto, antes de qualquer hydrateUrl).
import {AUTH_CONFIG} from './auth/auth-config.mjs';
import {createAuthSession} from './auth/auth-session.mjs';
import {createBrowserShell} from './browser-shell.mjs';
import {createFixtureSource, provenance} from './fixture-source.mjs';
import {webDigest} from './web-digest.mjs';

const $ = id => document.getElementById(id);
const SEARCH_LABELS = Object.freeze({idle:'pronta', loading:'buscando…', results:'resultados', empty:'nenhum resultado', unavailable:'indisponível'});
const TAB_LABELS = Object.freeze({globe:'Globo', models:'Modelos', news:'Notícias'});

function showNotice(text) {
  const notice = $('notice');
  notice.textContent = text;
  notice.hidden = false;
}

// localStorage pode lançar só por ser acessado (cookies bloqueados): cai para
// uma porta em memória, que não persiste nada entre carregamentos.
function browserStorage() {
  try {
    const storage = window.localStorage;
    return {getItem: key => storage.getItem(key), setItem: (key, value) => storage.setItem(key, value)};
  } catch {
    const memory = new Map();
    return {getItem: key => memory.get(key) ?? null, setItem: (key, value) => { memory.set(key, String(value)); }};
  }
}

// Sem sessionStorage, verifier e marcador não sobrevivem ao redirect: o login
// fica indisponível em vez de cair num laço de redirecionamento.
function browserSessionStorage() {
  try {
    const storage = window.sessionStorage;
    const probe = 'llms.auth.probe';
    storage.setItem(probe, '1'); storage.removeItem(probe);
    return {getItem: key => storage.getItem(key), setItem: (key, value) => storage.setItem(key, value), removeItem: key => storage.removeItem(key)};
  } catch {
    return null;
  }
}
// O code do fragmento nunca fica na URL, mesmo se o login falhar ao montar.
function dropCodeFragment() {
  if (new URLSearchParams(window.location.hash.slice(1)).has('code')) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
}

// Só chamado com o login ligado: monta as portas reais e conclui/inicia a sessão.
// Devolve a sessão, ou null quando a página saiu para o Cognito.
async function bootAuth() {
  const sessionStorage = browserSessionStorage();
  if (sessionStorage === null) {
    dropCodeFragment();
    showNotice('Login indisponível: o navegador bloqueia o armazenamento de sessão.');
    return undefined;
  }
  const auth = createAuthSession({
    config: AUTH_CONFIG,
    ports: {
      fetch: (url, init) => window.fetch(url, init),
      location: {
        get pathname() { return window.location.pathname; },
        get search() { return window.location.search; },
        get hash() { return window.location.hash; },
        assign: url => window.location.assign(url)
      },
      history: {replaceState: url => window.history.replaceState(null, '', url)},
      sessionStorage,
      crypto: window.crypto,
      clock: () => Date.now()
    }
  });
  let completed;
  try { completed = await auth.completeLogin(); }
  catch { completed = {status: 'failed'}; showNotice('Não foi possível concluir o login.'); }
  if (completed.status === 'none') {
    const silent = await auth.silentLogin().catch(() => ({status: 'unauthenticated'}));
    if (silent.status === 'redirected') return null;
  }
  const button = $('auth-button');
  const render = () => { button.textContent = auth.isAuthenticated() ? 'Sair' : 'Entrar'; };
  render();
  // Renovação recusada ou logout mudam o estado: o rótulo acompanha.
  auth.onChange(render);
  button.hidden = false;
  button.addEventListener('click', () => {
    if (auth.isAuthenticated()) auth.signOut().catch(() => showNotice('Não foi possível sair.'));
    else auth.startLogin().catch(() => showNotice('Não foi possível iniciar o login.'));
  });
  return auth;
}

async function boot() {
  // O marcador fica visível mesmo quando o shell não pode operar.
  $('provenance').textContent = provenance;
  // crypto.subtle exige contexto seguro (AD-20): sem ele, nem compõe o shell.
  if (!window.isSecureContext) {
    dropCodeFragment();
    showNotice('Este shell só opera sob HTTPS ou localhost (contexto seguro).');
    return;
  }
  if (AUTH_CONFIG.enabled) {
    let auth;
    try { auth = await bootAuth(); } catch { dropCodeFragment(); showNotice('Falha ao iniciar o login.'); }
    if (auth === null) return; // redirecionando para o Cognito
  }
  let shell;
  try {
    shell = createBrowserShell({
    history: {
      pushState: url => window.history.pushState(null, '', url),
      replaceState: url => window.history.replaceState(null, '', url)
    },
    location: window.location,
    storage: browserStorage(),
    clock: () => new Date().toISOString(),
    digest: webDigest,
    source: createFixtureSource({digest: webDigest})
    });
  } catch {
    showNotice('Falha ao iniciar o shell.');
    return;
  }
  $('provenance').textContent = shell.provenance;

  // AD-19: no máximo uma substituição de endereço por quadro.
  let flushScheduled = false;
  function scheduleFlush() {
    if (flushScheduled) return;
    flushScheduled = true;
    window.requestAnimationFrame(() => {
      flushScheduled = false;
      if (shell.status === 'updated') shell.flushAddress();
    });
  }

  function renderSelection() {
    if (shell.status !== 'updated') return;
    const state = shell.getState();
    const companyId = state.effectiveState.companyId;
    const selected = $('selected');
    selected.textContent = companyId ?? 'nenhuma';
    if (companyId === null) delete selected.dataset.companyId;
    else selected.dataset.companyId = companyId;
    $('tab').textContent = TAB_LABELS[state.effectiveState.tab] ?? state.effectiveState.tab;
    $('warning').textContent = state.warning ?? '';
  }

  function renderResults(response) {
    const list = $('results');
    list.replaceChildren();
    $('search-status').textContent = SEARCH_LABELS[response.status] ?? response.status;
    for (const result of response.results ?? []) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = result.label;
      button.dataset.targetType = result.target.type;
      if (result.target.companyId !== undefined) button.dataset.companyId = result.target.companyId;
      button.addEventListener('click', () => select(result));
      item.append(button);
      list.append(item);
    }
  }

  async function select(result) {
    if (shell.status !== 'updated') return;
    try {
      const outcome = await shell.select(result);
      if (shell.status !== 'updated') return;
      if (outcome.status === 'unavailable') $('search-status').textContent = SEARCH_LABELS.unavailable;
      scheduleFlush();
      renderSelection();
    } catch {
      $('search-status').textContent = SEARCH_LABELS.unavailable;
    }
  }

  $('search-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (shell.status !== 'updated') return;
    $('search-status').textContent = SEARCH_LABELS.loading;
    try {
      const response = await shell.search($('query').value);
      if (shell.status !== 'updated' || response.status === 'superseded') return;
      renderResults(response);
    } catch {
      $('search-status').textContent = SEARCH_LABELS.unavailable;
    }
  });

  // Fim da sessão (perda de permissão ou descarte): a página deixa de oferecer a Busca.
  function endSession(status) {
    showNotice(status === 'access-denied' ? 'Acesso negado.' : 'Sessão encerrada.');
    $('search-form').hidden = true;
    $('results').replaceChildren();
  }
  // Releitura do snapshot quando a aba volta a ficar visível; só a raiz chama refresh().
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || shell.status !== 'updated') return;
    shell.refreshSnapshot().then(({status}) => {
      if (status === 'advanced') { scheduleFlush(); renderSelection(); }
    }, () => {});
  });
  // Página que entra no cache de navegação (bfcache) volta viva; só descarta quando sai de vez.
  window.addEventListener('pagehide', event => { if (!event.persisted) shell.dispose(); });

  window.addEventListener('popstate', () => {
    if (shell.status !== 'updated') return;
    try { shell.onPopState(); } catch { return; }
    scheduleFlush();
    renderSelection();
  });

  shell.start().then(({status}) => {
    if (status !== 'updated') {
      showNotice(status === 'access-denied' ? 'Acesso negado.' : 'Dados indisponíveis.');
      $('search-form').hidden = true;
      return;
    }
    shell.onStatusChange(endSession);
    scheduleFlush();
    renderSelection();
  }, () => showNotice('Falha ao iniciar o shell.'));
}

boot().catch(() => showNotice('Falha ao iniciar o shell.'));
