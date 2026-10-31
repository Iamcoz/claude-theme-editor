// 설치된 Claude 앱에 스니펫이 쓰는 변수와 선택자가 아직 있는지 확인한다: node app-vars.mjs
// 앱 업데이트 뒤 색이 일부만 바뀔 때 먼저 돌린다. "없음"으로 나온 줄이 고칠 곳이다.
// 화면 CSS는 두 군데에 있다: 앱 파일(app.asar, 창 틀)과 앱이 claude.ai에서 받아 캐시해 둔 CSS(사이드바, 대화, Code 탭).
import { openSync, readSync, readFileSync, readdirSync, statSync, closeSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';

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
const asarCss = cssFiles.map((f) => read(f.size, dataStart + Number(f.offset)).toString()).join('\n');

// 캐시 파일 = [헤더][주소][zstd로 압축된 본문][응답 헤더]. 가장 최근에 받은 claude.ai CSS 몇 개만 풀어 본다.
// 캐시 폴더 파일이 많아서 1분쯤 걸린다.
const CACHE = `${homedir()}/Library/Application Support/Claude/Cache/Cache_Data`;
const webCss = (() => {
  if (spawnSync('zstd', ['--version']).error) {
    console.log('zstd가 없어 캐시된 claude.ai CSS를 못 읽어요(brew install zstd). 앱 파일 CSS만 검사해요.');
    return '';
  }
  const found = [];
  for (const name of readdirSync(CACHE)) {
    if (!name.endsWith('_0')) continue;
    const f = openSync(`${CACHE}/${name}`, 'r');
    const buf = Buffer.alloc(400);
    readSync(f, buf, 0, 400, 0);
    closeSync(f);
    if (/https:\/\/assets-proxy\.anthropic\.com\/[^\0]*?\.css/.test(buf.toString('latin1'))) found.push([statSync(`${CACHE}/${name}`).mtimeMs, name]);
  }
  return found.sort((a, b) => b[0] - a[0]).slice(0, 8).map(([, name]) => {
    const raw = readFileSync(`${CACHE}/${name}`);
    const body = raw.subarray(raw.indexOf(Buffer.from([0x28, 0xb5, 0x2f, 0xfd])));
    // 본문 뒤에 붙은 응답 헤더 때문에 zstd가 오류로 끝나지만 풀린 본문은 stdout에 다 나온다
    return spawnSync('zstd', ['-dc'], { input: body, maxBuffer: 1 << 26 }).stdout?.toString() ?? '';
  }).join('\n');
})();
const css = `${asarCss}\n${webCss}`;

const version = readFileSync(`${APP}/Info.plist`, 'utf8').match(/CFBundleShortVersionString<\/key>\s*<string>([^<]+)/)?.[1];
const snippet = readFileSync(new URL('./claude-theme.snippet.js', import.meta.url), 'utf8');
const used = [...new Set(snippet.match(/'--(?:cds|bg|text|df)-[\w-]+'/g).map((s) => s.slice(1, -1)))];
// 선택자는 통째로 같은 줄이 없을 수 있어서, 들어 있는 클래스와 속성 이름이 앱 CSS에 있는지만 본다
const tokens = [...new Set([...snippet.matchAll(/'((?:\[data-mode=\w+\]|\.cds-|\.dframe-|:root)[^']*)'/g)]
  .flatMap((m) => m[1].match(/\.[\w-]+|\[[\w-]+(?:=\w+)?\]/g) ?? []))];

console.log(`앱 버전 ${version}, 앱 파일 CSS ${cssFiles.length}개, 캐시된 claude.ai CSS ${webCss ? '읽음' : '없음'}`);
let missing = 0;
for (const name of used) {
  const declared = css.split(`${name}:`).length - 1;
  if (!declared) missing++;
  console.log(`${declared ? 'ok  ' : '없음'} ${name}${declared ? ` (${declared}곳에서 설정)` : ''}`);
}
for (const token of tokens) {
  const found = css.includes(token);
  if (!found) missing++;
  console.log(`${found ? 'ok  ' : '없음'} 선택자 조각 ${token}`);
}
console.log(missing ? `앱에 없는 이름 ${missing}개` : '스니펫이 쓰는 이름이 앱에 모두 있음');
process.exitCode = missing ? 1 : 0;
