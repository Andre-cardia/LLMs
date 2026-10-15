import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve, basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildApp} from './build-app.mjs';

// Constrói só a prévia estática e o artefato do shell. Não faz deploy nem ativa serviços.
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
// Mantém builds anteriores intactos até todas as entradas obrigatórias serem válidas.
await mkdir(destination,{recursive:true});
await cp(source,destination,{
  recursive:true,
  filter:path=>!['shots','.DS_Store','cesium-config.local.json','cesium-config.json','cesium-config.example.json'].includes(basename(path)),
});
await writeFile(resolve(destination,'assets/cesium-config.json'),JSON.stringify({ionAccessToken:token,appOrigin:origin},null,2)+'\n',{mode:0o600});
// _headers espelha customHttp.yml para servidores que o leem; o Amplify lê customHttp.yml.
const appCsp="default-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
await writeFile(resolve(destination,'_headers'),['/assets/cesium-config.json\n  Cache-Control: no-store\n','/prototype-cesium.html\n  Referrer-Policy: origin\n',`/app/*\n  Content-Security-Policy: ${appCsp}\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n`,'/app/ui/fixtures/*\n  Cache-Control: no-store\n',...['/app/auth/callback','/app/auth/callback/'].map(path=>`${path}\n  Content-Security-Policy: ${appCsp}\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  Cache-Control: no-store\n`)].join('\n'));
const html=await readFile(resolve(destination,'prototype-cesium.html'),'utf8');
if(!html.includes('name="referrer" content="origin"'))throw new Error('REFERRER_POLICY_MISSING');
// Shell de navegador (AD-25): depois do preview, só dist/ui/app é limpo e recriado.
const app=await buildApp({root,destination:resolve(destination,'app')});
console.log(JSON.stringify({status:'built',output:'dist/ui',app:{output:'dist/ui/app',files:app.files.length},origin,token:'configured (value omitted)',localConfigurationCopied:false}));
