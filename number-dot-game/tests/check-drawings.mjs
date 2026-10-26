import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ctx = {window:{}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),ctx);
const pictures=ctx.window.DOT_GAME_LEVELS.flatMap(l=>l.pictures);
assert.equal(pictures.length,15);
for (const level of ctx.window.DOT_GAME_LEVELS) assert.equal(level.pictures.length,5);
assert.equal(new Set(pictures.map(p=>p.id)).size,15);
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
for(const p of pictures){
 const paths=[];
 for(const s of p.strokes){
  assert(s.points.length>=2);
  assert.equal(new Set(s.points.map(p=>p.join(','))).size,s.points.length,'duplicate click coordinates');
  for(const pt of s.points)assert(pt.every(v=>Number.isFinite(v)&&v>=90&&v<=910),'point outside safe bounds');
  paths.push('M '+s.points.map(p=>p.join(' ')).join(' L ')+(s.closed?' Z':''));
  const seg=s.points.slice(1).map((b,i)=>[s.points[i],b]);
  if(s.closed)seg.push([s.points.at(-1),s.points[0]]);
  for(let i=0;i<seg.length;i++)for(let j=i+2;j<seg.length;j++){
   if(s.closed&&i===0&&j===seg.length-1)continue;
   const[a,b]=seg[i],[c,d]=seg[j];
   assert(!(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0),p.name+' crossing outline');
  }
 }
 const asset=fs.readFileSync(path.join(root,p.asset),'utf8');
 for(const d of [...paths,...p.details])assert(asset.includes(`<path d="${d}"/>`),p.name+' SVG/path mismatch');
 assert.equal((asset.match(/<path /g)||[]).length,paths.length+p.details.length);
 console.log(`${p.name}: ${p.strokes.reduce((n,s)=>n+s.points.length,0)} points; SVG alignment and intersections PASS`);
}
