// Configuração pública do login (AD-9, AD-26): único módulo que o shell lê.
// Nesta fase o login está desligado e sem valores: nenhuma ID real fica no
// repositório. Com `enabled: false`, nenhuma porta de auth é tocada e o shell
// opera só com fixtures. Os valores reais virão do build de cada branch (AD-26),
// junto com o `connect-src` da CSP para o Cognito.
export const AUTH_CONFIG = Object.freeze({
  enabled: false,
  cognitoDomain: '',
  clientId: '',
  appOrigin: '',
  scopes: Object.freeze(['llms-api/read', 'llms-api/write'])
});
