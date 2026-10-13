import {mkdir,copyFile,readdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await mkdir('dist',{recursive:true});
const source=['index.html','style.css','icon.svg','app.mjs','core.mjs','sw.js','README.md','LICENSE','THIRD_PARTY_NOTICES.md','tests.mjs'];
for(const file of source)await copyFile(file,`dist/${file}`);
for(const file of ['tesseract.min.js','worker.min.js'])await copyFile(`node_modules/tesseract.js/dist/${file}`,`dist/${file}`);
await copyFile('node_modules/tesseract.js/LICENSE.md','dist/TESSERACT_LICENSE');
await copyFile('node_modules/tesseract.js-core/LICENSE','dist/TESSERACT_CORE_LICENSE');
for(const file of await readdir('node_modules/tesseract.js-core'))if(/tesseract-core-(?:simd-)?lstm\.wasm(?:\.js)?$/.test(file))await copyFile(`node_modules/tesseract.js-core/${file}`,`dist/${file}`);
for(const lang of ['eng','por']){
 const url=`https://cdn.jsdelivr.net/npm/@tesseract.js-data/${lang}@1.0.0/4.0.0_best_int/${lang}.traineddata.gz`;
 try{await readFile(`dist/${lang}.traineddata.gz`);}catch{const response=await fetch(url);if(!response.ok)throw new Error(`${response.status} ${url}`);await writeFile(`dist/${lang}.traineddata.gz`,Buffer.from(await response.arrayBuffer()));}
}
const artifacts=[];for(const file of await readdir('dist')){if(file==='asset-manifest.json')continue;const data=await readFile(`dist/${file}`);artifacts.push({file,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}
await writeFile('dist/.nojekyll','');await writeFile('dist/asset-manifest.json',JSON.stringify({tesseract:'6.0.1',core:'6.1.2',languageData:'@tesseract.js-data/{por,eng}@1.0.0/4.0.0_best_int',artifacts},null,2));
console.log(`Built ${artifacts.length} files. ${(artifacts.reduce((n,f)=>n+f.bytes,0)/1048576).toFixed(1)} MB. All runtime/model assets are self-hosted.`);
