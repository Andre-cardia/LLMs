import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve, basename} from 'node:path';
import {fileURLToPath} from 'node:url';

// Builds only the static UI preview. It does not deploy or activate services.
const root=fileURLToPath(new URL('..',import.meta.url));
const source=resolve(root,'_bmad-output/planning-artifacts/ux-designs/ux-LLMs-2026-10-09/mockups');
const destination=resolve(root,'dist/ui');
const token=process.env.CESIUM_ION_PUBLIC_TOKEN?.trim();
const rawOrigin=process.env.CESIUM_APP_ORIGIN?.trim();
if(!token||!rawOrigin){
  console.error('Configure CESIUM_ION_PUBLIC_TOKEN e CESIUM_APP_ORIGIN no ambiente de build. O token local não é usado no deploy.');
  process.exit(1);
}
let origin;
try{
  const url=new URL(rawOrigin);
  if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash||['localhost','127.0.0.1','[::1]'].includes(url.hostname))throw new Error();
  origin=url.origin;
}catch{
  console.error('CESIUM_APP_ORIGIN deve ser a origem pública HTTPS, sem caminho, query ou credenciais.');
  process.exit(1);
}
if(!/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(token)){
  console.error('CESIUM_ION_PUBLIC_TOKEN deve conter o token público de leitura criado para esta origem.');
  process.exit(1);
}
// Keep previous builds intact unless all required inputs are valid.
await mkdir(destination,{recursive:true});
await cp(source,destination,{
  recursive:true,
  filter:path=>!['shots','.DS_Store','cesium-config.local.json','cesium-config.json','cesium-config.example.json'].includes(basename(path)),
});
await writeFile(resolve(destination,'assets/cesium-config.json'),JSON.stringify({ionAccessToken:token,appOrigin:origin},null,2)+'\n',{mode:0o600});
await writeFile(resolve(destination,'_headers'),'/assets/cesium-config.json\n  Cache-Control: no-store\n\n/prototype-cesium.html\n  Referrer-Policy: origin\n');
const html=await readFile(resolve(destination,'prototype-cesium.html'),'utf8');
if(!html.includes('name="referrer" content="origin"'))throw new Error('REFERRER_POLICY_MISSING');
console.log(JSON.stringify({status:'built',output:'dist/ui',origin,token:'configured (value omitted)',localConfigurationCopied:false}));
