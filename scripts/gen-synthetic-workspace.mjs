import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
// Regenera o dataset sintético a partir da fixture de teste, num único módulo de dados:
//   src/contracts/synthetic-workspace.mjs  o dataset (o JSON existe só aqui, fora dos testes);
//   src/ui/fixtures/synthetic-workspace.mjs reexporta para o shell de navegador.
// O Publicador S3 (src/adapters/lambda/snapshot-publisher.mjs) importa o módulo de
// src/contracts/, porque adapters não importam src/ui/. O teste "dataset igual à fixture"
// falha quando divergem; rode este script.
const root = fileURLToPath(new URL('..', import.meta.url));
const data = JSON.parse(await readFile(`${root}tests/fixtures/local-workspace.json`, 'utf8'));
const dataset = `// Gerado por scripts/gen-synthetic-workspace.mjs a partir de tests/fixtures/local-workspace.json.
// Dataset sintético (Empresas fictícias, URLs só em example.invalid). Não editar à mão.
// Fonte única do shell (src/ui/fixtures/synthetic-workspace.mjs reexporta) e do Publicador S3.
import {SYNTHETIC_FIXTURE} from './provenance.mjs';
import {freeze} from './primitives.mjs';

export const SYNTHETIC_WORKSPACE = freeze({provenance: SYNTHETIC_FIXTURE, ...${JSON.stringify(data, null, 2)}});
`;
const fixture = `// Gerado por scripts/gen-synthetic-workspace.mjs. Não editar à mão.
// Dataset sintético do shell (provenance: 'synthetic-fixture'); o conteúdo mora em
// src/contracts/synthetic-workspace.mjs, sem duplicar o JSON.
import {SYNTHETIC_WORKSPACE} from '../../contracts/synthetic-workspace.mjs';

export {SYNTHETIC_WORKSPACE};
`;
await writeFile(`${root}src/contracts/synthetic-workspace.mjs`, dataset);
await writeFile(`${root}src/ui/fixtures/synthetic-workspace.mjs`, fixture);
console.log(JSON.stringify({status: 'generated', outputs: ['src/contracts/synthetic-workspace.mjs', 'src/ui/fixtures/synthetic-workspace.mjs']}));
