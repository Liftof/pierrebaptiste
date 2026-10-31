/* Render an 8-second seamless wind loop from the existing garden artwork.
   npm install && npm run render in this directory. No generative morphing. */
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { createCanvas, loadImage, ImageData } = require('@napi-rs/canvas');
const ffmpegPath = require('ffmpeg-static');
const root = path.resolve(__dirname, '../..');
const assetDir = path.join(root, 'assets/cobalt-garden');
const W = 1200, H = 630, GH = 210, GY = H - GH, FPS = 30, SECONDS = 8, FRAMES = FPS * SECONDS;

async function main() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const fabric = await loadImage(path.join(assetDir, 'canvas.jpg'));
  const tile = createCanvas(680, Math.round(680 * fabric.height / fabric.width));
  tile.getContext('2d').drawImage(fabric, 0, 0, tile.width, tile.height);
  ctx.fillStyle = ctx.createPattern(tile, 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(21,80,214,.30)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#382416';
  ctx.fillRect(0, H-28, W, 28);
  const base = ctx.getImageData(0, 0, W, H);
  const art = await loadImage(path.join(assetDir, 'garden-v2.webp'));
  const gardenCanvas = createCanvas(W + 80, GH);
  const gctx = gardenCanvas.getContext('2d');
  const tileW = art.width / art.height * GH;
  const origin = (W + 80 - tileW) / 2;
  for (let x = origin - tileW * 2; x < W + 80; x += tileW) gctx.drawImage(art, x, 0, tileW, GH);
  const garden = gctx.getImageData(0, 0, W+80, GH).data;
  const GW = W + 80;
  const phases = Array.from({length:W}, (_,x) => .35 * Math.sin(x / 92) + .22 * Math.cos(x / 163));
  function frame(frameNo) {
    const theta = (frameNo % FRAMES) / FRAMES * Math.PI * 2;
    const out = Buffer.from(base.data);
    for (let y = 0; y < GH; y++) {
      // Roots and soil are fixed. Bending increases towards flower heads.
      const height = Math.max(0, (.84 * GH - y) / (.84 * GH));
      const bend = Math.pow(height, 1.7);
      for (let x = 0; x < W; x++) {
        const wind = 6 * Math.sin(theta + phases[x]) + 1.7 * Math.sin(2 * theta - x / 180);
        const sx = x + 40 - bend * wind;
        const sy = Math.min(GH-1.001, Math.max(0, y - bend * 1.4 * Math.sin(theta + phases[x] + .4)));
        const ix = Math.floor(sx), iy = Math.floor(sy), fx = sx - ix, fy = sy - iy;
        const i = (iy * GW + ix) * 4;
        const weights = [(1-fx)*(1-fy), fx*(1-fy), (1-fx)*fy, fx*fy];
        const offsets = [i, i+4, i+GW*4, i+GW*4+4];
        const color = [0,0,0,0];
        // Interpolate premultiplied colors to preserve clean transparent edges.
        for (let p = 0; p < 4; p++) {
          const a = garden[offsets[p]+3] / 255 * weights[p];
          color[3] += a;
          color[0] += garden[offsets[p]] * a;
          color[1] += garden[offsets[p]+1] * a;
          color[2] += garden[offsets[p]+2] * a;
        }
        const dst = ((GY + y) * W + x) * 4;
        const a = color[3];
        out[dst] = Math.round(color[0] + out[dst] * (1-a));
        out[dst+1] = Math.round(color[1] + out[dst+1] * (1-a));
        out[dst+2] = Math.round(color[2] + out[dst+2] * (1-a));
      }
    }
    return out;
  }
  const first = frame(0), middle = frame(FRAMES/4), loop = frame(FRAMES);
  if (!first.equals(loop)) throw new Error('Loop does not close exactly');
  let motionPixels = 0, rootChanges = 0;
  for (let y=0; y<H; y++) for (let x=0; x<W; x++) {
    const i=(y*W+x)*4;
    if (first[i]!==middle[i] || first[i+1]!==middle[i+1] || first[i+2]!==middle[i+2]) {
      motionPixels++;
      if(y >= GY + Math.ceil(GH*.84)) rootChanges++;
    }
  }
  if (!motionPixels || rootChanges) throw new Error('Wind/root check failed');
  ctx.putImageData(new ImageData(new Uint8ClampedArray(first), W, H), 0, 0);
  fs.writeFileSync(path.join(assetDir, 'share-card.jpg'), canvas.toBuffer('image/jpeg', 91));
  const checksDir = process.env.SHARE_CARD_CHECK_DIR;
  if (checksDir) {
    fs.mkdirSync(checksDir, {recursive:true});
    for (const [label, n] of [['0s',0],['2s',FRAMES/4],['4s',FRAMES/2],['6s',FRAMES*.75]]) {
      ctx.putImageData(new ImageData(new Uint8ClampedArray(frame(n)),W,H),0,0);
      fs.writeFileSync(path.join(checksDir,label+'.png'),canvas.toBuffer('image/png'));
    }
  }
  const output = path.join(assetDir,'share-card.mp4');
  const encoder=spawn(ffmpegPath,['-y','-hide_banner','-loglevel','warning','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-profile:v','main','-level','3.1','-vf','scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-color_range','tv','-pix_fmt','yuv420p','-preset','medium','-crf','24','-movflags','+faststart','-metadata','title=Pierre-Baptiste Borges — Cobalt Garden',output],{stdio:['pipe','inherit','inherit']});
  const done = once(encoder,'exit');
  for(let n=0;n<FRAMES;n++) {
    if(!encoder.stdin.write(frame(n))) await once(encoder.stdin,'drain');
    if(n%60===0) console.log(`Rendered ${n}/${FRAMES} frames`);
  }
  encoder.stdin.end();
  const [exitCode]=await done;
  if(exitCode!==0) throw new Error(`ffmpeg failed: ${exitCode}`);
  console.log(JSON.stringify({width:W,height:H,fps:FPS,seconds:SECONDS,loopExact:true,motionPixels,rootChanges,videoBytes:fs.statSync(output).size,posterBytes:fs.statSync(path.join(assetDir,'share-card.jpg')).size}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
