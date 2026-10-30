// Emit static preview files with absolute metadata URLs for this deployment.
// GitHub Pages serves the committed production URLs without a build step.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
const origin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://pierrebaptiste.me';
fs.mkdirSync(out, {recursive:true});
for (const file of ['index.html','share.html']) {
  const html = fs.readFileSync(path.join(root,file),'utf8').replaceAll('https://pierrebaptiste.me', origin);
  fs.writeFileSync(path.join(out,file),html);
}
const target = path.join(out,'assets/cobalt-garden');
fs.mkdirSync(target,{recursive:true});
for (const file of ['garden.webp','share-card.jpg','share-card.mp4']) fs.copyFileSync(path.join(root,'assets/cobalt-garden',file),path.join(target,file));
console.log(`Static preview built for ${origin}`);
