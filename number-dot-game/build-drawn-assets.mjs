// Rebuild SVG files from the playable point data; no external image dependency.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root = path.dirname(new URL(import.meta.url).pathname);
const context = {window: {}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), context);
for (const picture of context.window.DOT_GAME_LEVELS.flatMap(level => level.pictures)) {
  const paths = picture.strokes.map(stroke => 'M ' + stroke.points.map(point => point.join(' ')).join(' L ') + (stroke.closed ? ' Z' : ''));
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><g fill="none" stroke="#26344a" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">' + [...paths, ...(picture.details || [])].map(d => `<path d="${d}"/>`).join('') + '</g></svg>';
  const file = path.join(root, picture.asset);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, svg);
}
