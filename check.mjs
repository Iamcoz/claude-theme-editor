// 스니펫을 가짜 DOM에서 실행해 만들어진 CSS를 검사한다: node check.mjs
// 1) 글자 대비(WCAG) 4.5:1 이상  2) 다시 실행해도 <style> 하나  3) 되돌리기로 지워짐  4) #RRGGBB가 아닌 색은 거부
// THEME_LIST의 테마를 전부 검사한다. 대비 실패는 STRICT에 든 테마만 센다(vintage-pastel처럼 흐린 글자가 의도인 테마는 보고만)
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

let styles = [];
const document = {
  head: { appendChild: (el) => (styles.push(el), el) },
  createElement: () => ({ remove() { styles = styles.filter((s) => s !== this); } }),
  getElementById: (id) => styles.find((s) => s.id === id) ?? null,
};
const source = (file) => readFileSync(new URL(file, import.meta.url), 'utf8');
const run = (code) => runInNewContext(code, { document, console: { log() {}, error() {} } });
const SNIPPET = source('./claude-theme.snippet.js');
const STRICT = new Set(['dreamcore']);

// 스니펫이 화면을 건드리기 전에 테마 목록만 돌려받는다(editor.html도 같은 방법을 쓴다)
const { THEME_LIST, THEMES } = run(SNIPPET.replace('  if (!THEMES[PICK])', '  return { THEME_LIST, THEMES };\n  if (!THEMES[PICK])'));
assert.deepEqual(Object.keys(THEME_LIST).sort(), Object.keys(THEMES).sort(), 'THEME_LIST와 THEMES의 이름이 다름');

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// '/* day */', '/* night */' 아래 블록에서 단색 변수 값을 모은다
const section = (css, name) => {
  const text = css.split(`/* ${name} */`)[1].split('/* ')[0];
  return Object.fromEntries([...text.matchAll(/(--[\w-]+): (#[0-9A-Fa-f]{6}) !important/g)].map((m) => [m[1], m[2]]));
};

const TEXT = ['--cds-text-primary', '--cds-text-secondary', '--cds-text-muted'];
const BG = { 바탕: '--cds-page-bg', 움푹한면: '--cds-surface-0', 입력창: '--cds-surface-3', 선택줄: '--cds-fill-ghost-selected' };
let failed = 0;
for (const theme of Object.keys(THEME_LIST)) {
  const strict = STRICT.has(theme);
  const code = SNIPPET.replace(/const PICK = '[\w-]+'/, `const PICK = '${theme}'`);
  run(code);
  run(code);
  assert.equal(styles.length, 1, `${theme}: 다시 실행했더니 <style>이 두 개`);
  const css = styles[0].textContent;
  for (const [label, name] of [['낮', 'day'], ['밤', 'night']]) {
    const v = section(css, name);
    const pairs = [
      ...TEXT.flatMap((t) => Object.entries(BG).map(([b, bg]) => [t, v[t], b, v[bg]])),
      ['--cds-text-primary', v['--cds-text-primary'], '내 말풍선', v['--cds-bg-user-message']], // 말풍선 안에는 본문 글자만 있다
      ['--cds-on-accent', v['--cds-on-accent'], '버튼', v['--cds-fill-accent']],
      ['--cds-on-accent', v['--cds-on-accent'], '버튼 hover', v['--cds-fill-accent-hover']],
      ['--cds-text-accent', v['--cds-text-accent'], '바탕', v['--cds-page-bg']],
      ['--cds-text-accent', v['--cds-text-accent'], '입력창', v['--cds-surface-3']],
    ];
    console.log(`[${theme} ${label}]${strict ? '' : ' (대비 검사 제외)'}`);
    for (const [fg, fgHex, bg, bgHex] of pairs) {
      assert.ok(fgHex && bgHex, `${theme} ${label}: ${fg} 또는 ${bg} 값을 못 찾음`);
      const r = contrast(fgHex, bgHex);
      const bad = strict && r < 4.5;
      if (bad) failed++;
      console.log(`  ${bad ? 'FAIL' : 'ok  '} ${r.toFixed(2)}  ${fg} ${fgHex} / ${bg} ${bgHex}`);
    }
  }
  run(source('./revert.snippet.js'));
  assert.equal(styles.length, 0, `${theme}: 되돌리기 뒤에도 <style>이 남음`);
}

// 색 칸에 #RRGGBB가 아닌 값이 들어오면 CSS를 넣지 않는다(다른 규칙이 끼어드는 걸 막는지)
run(SNIPPET.replace(/page: '#[0-9A-F]{6}'/, () => "page: '#fff} body{background:url(https://example.invalid/x)} x{a:b'"));
assert.equal(styles.length, 0, '#RRGGBB가 아닌 색 값인데 CSS가 들어감');

assert.equal(failed, 0, `대비 4.5:1 미만 ${failed}건`);
console.log('통과: 검사 대상 대비 전부 4.5:1 이상, 다시 실행해도 하나, 되돌리기 동작, 잘못된 색 값 거부');
