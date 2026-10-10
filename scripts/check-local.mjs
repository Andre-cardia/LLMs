import {readdir} from 'node:fs/promises';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';import {join} from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url));
async function modules(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){if(e.isSymbolicLink())throw new Error('SYMLINK_NOT_ALLOWED');if(e.isDirectory())out.push(...await modules(join(dir,e.name)));else if(e.name.endsWith('.mjs'))out.push(join(dir,e.name));}return out;}
let files=[];for(const folder of ['src','scripts','tests'])files.push(...await modules(join(root,folder)));
for(const file of files){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0){process.stderr.write(result.stderr);process.exit(1);}}
process.stdout.write(JSON.stringify({status:'passed',checkedModules:files.length,node:process.version})+'\n');
