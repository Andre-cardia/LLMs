import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
// Regenera src/ui/fixtures/synthetic-workspace.mjs a partir da fixture de teste.
// O teste "dataset igual à fixture" falha quando os dois divergem; rode este script.
const root = fileURLToPath(new URL('..', import.meta.url));
const data = JSON.parse(await readFile(`${root}tests/fixtures/local-workspace.json`, 'utf8'));
const body = `// Gerado por scripts/gen-synthetic-workspace.mjs a partir de tests/fixtures/local-workspace.json.
// Dataset sintético (Empresas fictícias, URLs só em example.invalid). Não editar à mão.
import {SYNTHETIC_FIXTURE} from '../../contracts/provenance.mjs';
import {freeze} from '../../contracts/primitives.mjs';

export const SYNTHETIC_WORKSPACE = freeze({provenance: SYNTHETIC_FIXTURE, ...${JSON.stringify(data, null, 2)}});
`;
await writeFile(`${root}src/ui/fixtures/synthetic-workspace.mjs`, body);
console.log(JSON.stringify({status: 'generated', output: 'src/ui/fixtures/synthetic-workspace.mjs'}));
