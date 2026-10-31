// Keep production canonical URLs in Git; emit this preview's absolute URLs at build time.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
const origin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://pierrebaptiste.me';
fs.mkdirSync(out, {recursive:true});
function emit(source, target) {
 const stat=fs.statSync(source);
 if(stat.isDirectory()) { fs.mkdirSync(target,{recursive:true});for(const file of fs.readdirSync(source)) emit(path.join(source,file),path.join(target,file)); }
 else if(source.endsWith('.html')) { const html=fs.readFileSync(source,'utf8').replaceAll('https://pierrebaptiste.me',origin);fs.writeFileSync(target,html); }
 else if(!/\.(md|json)$/.test(source)) fs.copyFileSync(source,target);
}
for(const item of ['index.html','share.html','writing','assets']) emit(path.join(root,item),path.join(out,item));
console.log(`Static preview built for ${origin}`);
