import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const data = {window:{}};vm.createContext(data);vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),data);
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
const helpers=source.slice(source.indexOf('function completedCount('),source.indexOf('function updateProgress('));
assert(helpers.includes('function isLevelUnlocked('));
const levels=data.window.DOT_GAME_LEVELS;
function statuses(ids){const ctx={levels,completedIds:new Set(ids)};vm.createContext(ctx);return vm.runInContext(`${helpers}\n[0,1,2,3].map(isLevelUnlocked)`,ctx);}
assert.deepEqual(Array.from(statuses([])),[true,true,true,true]);
const old=levels[1].pictures.slice(0,5).map(p=>p.id);
assert.deepEqual(Array.from(statuses(old.slice(0,4))),[true,true,true,true]);
assert.deepEqual(Array.from(statuses(old)),[true,true,true,true]);
const mixed=levels[1].pictures.slice(3,8).map(p=>p.id);
assert.deepEqual(Array.from(statuses(mixed)),[true,true,true,true]);
console.log('PASS: all four stages are open with zero or existing completion records.');
