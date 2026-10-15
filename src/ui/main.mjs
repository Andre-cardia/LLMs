// Único arquivo que toca `window` e o DOM. Monta as portas reais do navegador e
// entrega tudo a createBrowserShell (a raiz de composição). Página mínima desta
// sequência: Busca, resultados, Empresa selecionada e marcador de procedência,
// sem o visual do UX. Não é coberto por `node --test`.
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

function boot() {
  // O marcador fica visível mesmo quando o shell não pode operar.
  $('provenance').textContent = provenance;
  // crypto.subtle exige contexto seguro (AD-20): sem ele, nem compõe o shell.
  if (!window.isSecureContext) {
    showNotice('Este shell só opera sob HTTPS ou localhost (contexto seguro).');
    return;
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

boot();
