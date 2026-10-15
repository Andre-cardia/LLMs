// Página /app/auth/callback: só monta as portas reais e escreve a mensagem.
// A lógica (sem DOM, testada) vive em callback-flow.mjs. Nenhuma mensagem
// mostra code, state ou texto do provedor: só o código tipado do AuthError.
import {AUTH_CONFIG} from './auth-config.mjs';
import {completeCallback} from './callback-flow.mjs';

const MESSAGES = Object.freeze({
  AUTH_STATE_MISMATCH: 'O login não pôde ser confirmado (resposta não corresponde ao pedido).',
  AUTH_NO_PENDING_LOGIN: 'Nenhum login em andamento nesta aba.',
  AUTH_PROVIDER_ERROR: 'O provedor de login recusou o pedido.',
  AUTH_CODE_MISSING: 'A resposta do login veio incompleta.'
});

function show(text) {
  const message = document.getElementById('message');
  message.textContent = text;
  document.getElementById('back').hidden = false;
}

function sessionStoragePort() {
  try {
    const storage = window.sessionStorage;
    return {
      getItem: key => storage.getItem(key),
      setItem: (key, value) => storage.setItem(key, value),
      removeItem: key => storage.removeItem(key)
    };
  } catch {
    return {getItem: () => null, setItem: () => {}, removeItem: () => {}};
  }
}

try {
  const result = completeCallback({
    config: AUTH_CONFIG,
    ports: {
      location: {pathname: window.location.pathname, search: window.location.search, replace: url => window.location.replace(url)},
      history: {replaceState: url => window.history.replaceState(null, '', url)},
      sessionStorage: sessionStoragePort(),
      clock: () => Date.now()
    }
  });
  if (result.status === 'disabled') show('O login não está habilitado neste ambiente.');
} catch (error) {
  // Sem eco da URL: mesmo um erro inesperado só vira mensagem genérica.
  show(MESSAGES[error?.code] ?? 'Falha ao concluir o login.');
}
