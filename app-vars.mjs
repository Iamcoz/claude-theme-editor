// 설치된 Claude 앱에 스니펫이 쓰는 변수가 아직 있는지 확인한다: node app-vars.mjs
// 앱 업데이트 뒤 색이 일부만 바뀔 때 먼저 돌린다. "없음"으로 나온 변수가 고칠 곳이다.
import { openSync, readSync, readFileSync } from 'node:fs';

const APP = '/Applications/Claude.app/Contents';
const fd = openSync(`${APP}/Resources/app.asar`, 'r');
const read = (len, at) => {
  const buf = Buffer.alloc(len);
  readSync(fd, buf, 0, len, at);
  return buf;
};

// asar = [헤더 크기][JSON 목차][파일 내용들]. 목차에서 메인 창 CSS만 찾아 읽는다.
const head = read(16, 0);
const index = JSON.parse(read(head.readUInt32LE(12), 16).toString());
const dataStart = 8 + head.readUInt32LE(4);
const cssFiles = [];
const walk = (node, path) => {
  for (const [name, entry] of Object.entries(node.files ?? {})) {
    if (entry.files) walk(entry, `${path}/${name}`);
    else if (name.endsWith('.css') && path.includes('main_window')) cssFiles.push(entry);
  }
};
walk(index, '');
const appCss = cssFiles.map((f) => read(f.size, dataStart + Number(f.offset)).toString()).join('\n');

const version = readFileSync(`${APP}/Info.plist`, 'utf8').match(/CFBundleShortVersionString<\/key>\s*<string>([^<]+)/)?.[1];
const snippet = readFileSync(new URL('./surreal-theme.snippet.js', import.meta.url), 'utf8');
const used = [...new Set(snippet.match(/'--(?:cds|bg|text)-[\w-]+'/g).map((s) => s.slice(1, -1)))];
const scopes = [...snippet.matchAll(/'(\[data-mode=\w+\][^']*|\.cds-[^']*)'/g)].map((m) => m[1]);

console.log(`앱 버전 ${version}, 메인 창 CSS ${cssFiles.length}개`);
let missing = 0;
for (const name of used) {
  const declared = appCss.split(`${name}:`).length - 1;
  if (!declared) missing++;
  console.log(`${declared ? 'ok  ' : '없음'} ${name}${declared ? ` (${declared}곳에서 설정)` : ''}`);
}
for (const sel of scopes) {
  const found = appCss.includes(sel);
  if (!found) missing++;
  console.log(`${found ? 'ok  ' : '없음'} 선택자 ${sel}`);
}
console.log(missing ? `앱에 없는 이름 ${missing}개` : '스니펫이 쓰는 이름이 앱에 모두 있음');
process.exitCode = missing ? 1 : 0;
