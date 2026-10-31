// Claude 데스크톱 앱 색 테마: DevTools > Sources > Snippets에 저장하고 Cmd+Enter로 실행한다.
// 앱 화면 모드가 라이트/다크면 그대로, 시스템이면 OS를 따라 낮/밤 색이 바뀐다. 다시 실행하면 내용만 교체된다.
// 맞춘 앱 버전: 4.29.0 (변수 확인은 node app-vars.mjs)
(() => {
  // 고를 수 있는 테마 목록. 쓸 테마 이름을 PICK에 적는다. 새 테마는 editor.html에서 만들어 여기와 THEMES에 붙인다.
  const THEME_LIST = {
    dreamcore: 'Surreal Series 영상 색. 낮은 분홍빛 흰 바탕에 청록 버튼, 밤은 짙은 청록 바탕에 복숭아 버튼',
    'vintage-pastel': '빈티지 파스텔 선호 조합. 밝은 색끼리 겹쳐 글자가 흐린 게 의도. 낮만 있고 밤은 dreamcore 밤',
  };
  const PICK = 'dreamcore';

  // 색 칸: page 대화 바탕, sunken 사이드바(움푹한 면), raised 입력창·메뉴·카드, field 입력칸,
  // text 본문 글자, textSoft 보조 글자·아이콘, textFaint 흐린 글자, line 구분선,
  // button 버튼·링크, buttonHover 버튼 hover, onButton 버튼 위 글자, picked 선택된 목록 줄,
  // tint 내 메시지 바탕(옅게 깔림), spark 글자 선택 영역·강조 표시
  const DREAMCORE_NIGHT = {
    page: '#203132', sunken: '#37391D', raised: '#2D3C3D', field: '#2D3C3D',
    text: '#F2E2EA', textSoft: '#A8B6CB', textFaint: '#C0ABAA', line: '#737C8B',
    button: '#F5BCB0', buttonHover: '#F9D7C6', onButton: '#192010', picked: '#192010',
    tint: '#A8B6CB', spark: '#DBA247',
  };
  const THEMES = {
    dreamcore: {
      day: {
        page: '#F2E2EA', sunken: '#E5D1D7', raised: '#F2E2EA', field: '#F2E2EA',
        text: '#192010', textSoft: '#3D6079', textFaint: '#4D4D2A', line: '#C0ABAA',
        button: '#215C75', buttonHover: '#2D5981', onButton: '#F2E2EA', picked: '#ECCFDE',
        tint: '#3D6079', spark: '#DBA247',
      },
      night: DREAMCORE_NIGHT,
    },
    'vintage-pastel': {
      day: {
        page: '#B7CBA9', sunken: '#BCCBE0', raised: '#E6DDA4', field: '#E6DDA4',
        text: '#EFECDC', textSoft: '#859E7A', textFaint: '#EFECDC', line: '#9D949F',
        button: '#DA9D9B', buttonHover: '#D58C95', onButton: '#EFECDC', picked: '#E6DDA4',
        tint: '#192010', spark: '#BFA964',
      },
      night: DREAMCORE_NIGHT,
    },
  };
  if (!THEMES[PICK]) return console.error(`[claude-theme] 없는 테마: ${PICK}. 고를 수 있는 것: ${Object.keys(THEME_LIST).join(', ')}`);
  const { day, night } = THEMES[PICK];

  const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const fade = (hex, a) => `rgb(${channels(hex).join(' ')} / ${a})`;
  // 예전 변수(--bg-000 등)는 hsl() 안에 넣을 "h s% l%" 값을 받는다
  const hslParts = (hex) => {
    const [r, g, b] = channels(hex).map((v) => v / 255);
    const hi = Math.max(r, g, b);
    const lo = Math.min(r, g, b);
    const l = (hi + lo) / 2;
    const d = hi - lo;
    if (!d) return `0 0% ${(l * 100).toFixed(1)}%`;
    const s = d / (1 - Math.abs(2 * l - 1));
    const h = hi === r ? (g - b) / d + (g < b ? 6 : 0) : hi === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return `${(h * 60).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
  };

  // 앱 변수 이름은 전부 여기 있다. 앱 업데이트로 이름이 바뀌면 여기를 고친다.
  const appVars = (c) => ({
    // 면: 앱은 surface-0이 가장 깊고 3으로 갈수록 떠 있는 면
    '--cds-page-bg': c.page,
    '--cds-surface-0': c.sunken,
    '--cds-surface-1': c.page,
    '--cds-surface-2': c.raised,
    '--cds-surface-3': c.raised,
    '--cds-fill-field': c.field,
    // 글자. neutral-900은 앱이 옅은 채움과 hover 색(--cds-alpha-*)을 만드는 기준이라 글자색에 맞춘다
    '--cds-text-primary': c.text,
    '--cds-text-secondary': c.textSoft,
    '--cds-text-muted': c.textFaint,
    '--cds-neutral-900': c.text,
    '--cds-border': c.line,
    // 목록 hover, 선택
    '--cds-fill-ghost-hover': fade(c.picked, 0.6),
    '--cds-fill-ghost-selected': c.picked,
    // 버튼, 링크
    '--cds-fill-accent': c.button,
    '--cds-fill-accent-hover': c.buttonHover,
    '--cds-on-accent': c.onButton,
    '--cds-fill-primary': c.button,
    '--cds-fill-primary-hover': c.buttonHover,
    '--cds-on-primary': c.onButton,
    '--cds-text-accent': c.button,
    '--cds-border-accent': c.button,
    '--cds-bg-accent': fade(c.button, 0.14),
    '--cds-bg-user-message': fade(c.tint, 0.12),
    '--cds-bg-highlight': fade(c.spark, 0.35),
    // 예전 claude.ai 변수 중 앱 CSS가 아직 쓰는 것
    '--bg-000': hslParts(c.page),
    '--bg-300': hslParts(c.sunken),
    '--text-000': hslParts(c.text),
    '--text-100': hslParts(c.text),
    '--text-300': hslParts(c.textSoft),
  });

  // 앱 CSS와 같은 구조: 낮은 .cds-root 기본값, 밤은 더 구체적인 선택자로 덮는다.
  // 앱은 data-mode가 없으면 시스템으로 본다.
  const NIGHT_SCOPES = ['[data-mode=dark] .cds-root:not([data-mode=light]):not([data-mode=system])', '.cds-root[data-mode=dark]', '.cds-dark-scope[data-mode=dark]'];
  const SYSTEM_SCOPES = ['[data-mode=system] .cds-root:not([data-mode=light]):not([data-mode=dark])', '.cds-root[data-mode=system]', '.cds-root:not([data-mode]):not([data-mode] *)'];

  // 앱은 이 변수들에 !important를 쓰지 않아서 !important만 붙이면 선택자 우선순위와 상관없이 이긴다
  const block = (selectors, colors) =>
    `${selectors.join(',\n')} {\n${Object.entries(appVars(colors))
      .map(([name, value]) => `  ${name}: ${value} !important;`)
      .join('\n')}\n}`;

  const style = document.getElementById('claude-theme') ?? document.head.appendChild(Object.assign(document.createElement('style'), { id: 'claude-theme' }));
  style.textContent = [
    '/* day */',
    block(['.cds-root'], day),
    '/* night */',
    block(NIGHT_SCOPES, night),
    `@media (prefers-color-scheme: dark) {\n${block(SYSTEM_SCOPES, night)}\n}`,
    `::selection { background: ${fade(day.spark, 0.45)} !important; }`,
  ].join('\n');
  console.log(`[claude-theme] ${PICK} 적용됨`);
})();
