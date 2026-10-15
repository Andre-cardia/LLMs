// Marcador único de procedência (AD-9 do pai, AD-21 do Epic 7). Todo dataset
// empacotado para o navegador antes de Q2 declara este valor, e a fonte que o
// serve (src/ui/fixture-source.mjs) o exporta como `provenance`; a raiz de
// composição o repassa à interface. Manifesto e slices não o carregam.
export const SYNTHETIC_FIXTURE = 'synthetic-fixture';
