// 스니펫을 가짜 DOM에서 실행해 만들어진 CSS를 검사한다: node check.mjs
// 1) 글자 대비(WCAG) 4.5:1 이상  2) 다시 실행해도 <style> 하나  3) 되돌리기로 지워짐
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

let styles = [];
const document = {
  head: { appendChild: (el) => (styles.push(el), el) },
  createElement: () => ({ remove() { styles = styles.filter((s) => s !== this); } }),
  getElementById: (id) => styles.find((s) => s.id === id) ?? null,
};
const run = (file) => runInNewContext(readFileSync(new URL(file, import.meta.url), 'utf8'), { document, console: { log() {} } });

run('./surreal-theme.snippet.js');
run('./surreal-theme.snippet.js');
assert.equal(styles.length, 1, '다시 실행했더니 <style>이 두 개');
const css = styles[0].textContent;

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
const section = (name) => {
  const text = css.split(`/* ${name} */`)[1].split('/* ')[0];
  return Object.fromEntries([...text.matchAll(/(--[\w-]+): (#[0-9A-Fa-f]{6}) !important/g)].map((m) => [m[1], m[2]]));
};

const TEXT = ['--cds-text-primary', '--cds-text-secondary', '--cds-text-muted'];
const BG = { 바탕: '--cds-page-bg', 움푹한면: '--cds-surface-0', 입력창: '--cds-surface-3', 선택줄: '--cds-fill-ghost-selected' };
let failed = 0;
for (const [label, name] of [['낮', 'day'], ['밤', 'night']]) {
  const v = section(name);
  const pairs = [
    ...TEXT.flatMap((t) => Object.entries(BG).map(([b, bg]) => [t, v[t], b, v[bg]])),
    ['--cds-on-accent', v['--cds-on-accent'], '버튼', v['--cds-fill-accent']],
    ['--cds-on-accent', v['--cds-on-accent'], '버튼 hover', v['--cds-fill-accent-hover']],
    ['--cds-text-accent', v['--cds-text-accent'], '바탕', v['--cds-page-bg']],
    ['--cds-text-accent', v['--cds-text-accent'], '입력창', v['--cds-surface-3']],
  ];
  console.log(`[${label}]`);
  for (const [fg, fgHex, bg, bgHex] of pairs) {
    assert.ok(fgHex && bgHex, `${label}: ${fg} 또는 ${bg} 값을 못 찾음`);
    const r = contrast(fgHex, bgHex);
    if (r < 4.5) failed++;
    console.log(`  ${r < 4.5 ? 'FAIL' : 'ok  '} ${r.toFixed(2)}  ${fg} ${fgHex} / ${bg} ${bgHex}`);
  }
}

run('./revert.snippet.js');
assert.equal(styles.length, 0, '되돌리기 뒤에도 <style>이 남음');
assert.equal(failed, 0, `대비 4.5:1 미만 ${failed}건`);
console.log('통과: 대비 전부 4.5:1 이상, 다시 실행해도 하나, 되돌리기 동작');
