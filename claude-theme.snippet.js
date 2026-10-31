// Claude 데스크톱 앱 색 테마: DevTools > Sources > Snippets에 저장하고 Cmd+Enter로 실행한다.
// 앱 화면 모드가 라이트/다크면 그대로, 시스템이면 OS를 따라 낮/밤 색이 바뀐다. 다시 실행하면 내용만 교체된다.
// 맞춘 앱 버전: 4.29.0 (변수 확인은 node app-vars.mjs)
(() => {
  // 고를 수 있는 테마 목록. 쓸 테마 이름을 PICK에 적는다. 새 테마는 editor.html에서 만들어 여기와 THEMES에 붙인다.
  const THEME_LIST = {
    dreamcore: 'Surreal Series 영상 색. 낮은 분홍빛 흰 바탕에 청록 버튼, 밤은 짙은 청록 바탕에 복숭아 버튼',
    'vintage-pastel': '빈티지 파스텔 선호 조합. 밝은 색끼리 겹쳐 글자가 흐린 게 의도. 낮만 있고 밤은 dreamcore 밤',
  };
  const PICK = 'vintage-pastel';

  // 색 칸: page 대화 바탕, sunken 사이드바(움푹한 면), raised 입력창·메뉴·카드, field 입력칸,
  // text 본문 글자, textSoft 보조 글자·아이콘, textFaint 흐린 글자, line 구분선,
  // button 버튼·링크, buttonHover 버튼 hover, onButton 버튼 위 글자, picked 선택된 목록 줄,
  // tint 내 메시지 말풍선 바탕, spark 글자 선택 영역·강조 표시
  const DREAMCORE_NIGHT = {
    page: '#203132', sunken: '#37391D', raised: '#2D3C3D', field: '#2D3C3D',
    text: '#F2E2EA', textSoft: '#A8B6CB', textFaint: '#C0ABAA', line: '#737C8B',
    button: '#F5BCB0', buttonHover: '#F9D7C6', onButton: '#192010', picked: '#192010',
    tint: '#3D6079', spark: '#DBA247',
  };
  const THEMES = {
    dreamcore: {
      day: {
        page: '#F2E2EA', sunken: '#E5D1D7', raised: '#F2E2EA', field: '#F2E2EA',
        text: '#192010', textSoft: '#3D6079', textFaint: '#4D4D2A', line: '#C0ABAA',
        button: '#215C75', buttonHover: '#2D5981', onButton: '#F2E2EA', picked: '#ECCFDE',
        tint: '#CAD0E1', spark: '#DBA247',
      },
      night: DREAMCORE_NIGHT,
    },
    'vintage-pastel': {
      day: {
        page: '#B7CBA9', sunken: '#BCCBE0', raised: '#E6DDA4', field: '#E6DDA4',
        text: '#EFECDC', textSoft: '#859E7A', textFaint: '#EFECDC', line: '#9D949F',
        button: '#DA9D9B', buttonHover: '#D58C95', onButton: '#EFECDC', picked: '#E6DDA4',
        tint: '#BCCBE0', spark: '#BFA964',
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
  // 화면 대부분은 앱이 claude.ai에서 받아 오는 CSS로 그린다. 그 CSS 기준이다(확인은 node app-vars.mjs).
  const appVars = (c) => ({
    // 면: surface-0이 가장 깊고 3으로 갈수록 떠 있는 면. 테두리 있는 상자(입력창 등)는 popover를 쓴다
    '--cds-page-bg': c.page,
    '--cds-surface-0': c.sunken,
    '--cds-surface-1': c.page,
    '--cds-surface-2': c.raised,
    '--cds-surface-3': c.raised,
    '--cds-surface-popover': c.raised,
    '--cds-fill-field': c.field,
    // 글자. neutral-900은 앱이 옅은 채움과 hover 색(--cds-alpha-*)을 만드는 기준이라 글자색에 맞춘다
    '--cds-text-primary': c.text,
    '--cds-text-secondary': c.textSoft,
    '--cds-text-muted': c.textFaint,
    '--cds-text-stays-secondary': c.textSoft,
    '--cds-neutral-900': c.text,
    '--cds-border': c.line,
    '--cds-border-line': c.line,
    // 목록 hover, 선택
    '--cds-fill-ghost-hover': fade(c.picked, 0.6),
    '--cds-fill-ghost-selected': c.picked,
    '--cds-fill-secondary': fade(c.picked, 0.5),
    '--cds-fill-secondary-hover': fade(c.picked, 0.8),
    '--cds-fill-button-ghost-hover': fade(c.picked, 0.8),
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
    '--cds-bg-user-message': c.tint,
    '--cds-bg-highlight': fade(c.spark, 0.35),
    // Code 탭의 평평한 화면(fizzy-lake)이 따로 쓰는 색
    '--cds-fizzy-lake-color-sidebar': c.sunken,
    '--cds-fizzy-lake-color-card-hover': c.raised,
    '--cds-fizzy-lake-color-card-link': fade(c.picked, 0.3),
    '--cds-fizzy-lake-color-card-link-hover': fade(c.picked, 0.6),
    '--cds-fizzy-lake-color-card-link-pressed': c.picked,
    '--cds-fizzy-lake-color-selected-hover': fade(c.picked, 0.8),
    '--cds-fizzy-lake-color-seam': c.line,
    '--cds-fizzy-lake-color-composer-ring': c.line,
    '--cds-fizzy-lake-color-banner-line': c.line,
    '--cds-fizzy-lake-color-message-line': c.line,
    '--cds-fizzy-lake-color-secondary': c.textSoft,
    '--cds-fizzy-lake-color-plain-secondary': c.textSoft,
    '--cds-fizzy-lake-color-tertiary': c.textFaint,
    '--cds-fizzy-lake-color-plain-muted': c.textFaint,
    '--cds-fizzy-lake-color-placeholder': c.textFaint,
    '--cds-fizzy-lake-color-solid-primary': c.text,
    '--cds-fizzy-lake-color-solid-secondary': c.textSoft,
    '--cds-fizzy-lake-color-solid-muted': c.textFaint,
    // 예전 claude.ai 변수 중 아직 쓰는 것
    '--bg-000': hslParts(c.page),
    '--bg-300': hslParts(c.sunken),
    '--text-000': hslParts(c.text),
    '--text-100': hslParts(c.text),
    '--text-300': hslParts(c.textSoft),
  });
  // Code 탭 틀(사이드바, 카드)은 자기 요소에 변수를 다시 걸어서 위에서 내려준 값이 닿지 않는다. 그 요소에 직접 건다.
  const frameVars = (c) => ({
    '--df-bg-page': c.page,
    '--df-bg-page-hsl': hslParts(c.page),
    '--df-sidebar-bg': c.sunken,
    '--df-web-sidebar-bg': c.sunken,
    // 사이드바는 macOS 반투명 효과 위에 이 색을 85%만 섞는다. 100%로 바꿔 바탕이 비치지 않게 한다
    '--df-sidebar-tint': c.sunken,
    '--df-sidebar-tint-share': '100%',
    '--df-sidebar-muted': c.textFaint,
    '--df-hover': fade(c.picked, 0.6),
    '--df-selected': c.picked,
    '--df-selected-base': c.picked,
    // 틀의 회색 단계(z0 카드 면 ~ z6 흐린 글자), "h s% l%" 값
    '--df-z0': hslParts(c.raised),
    '--df-z1': hslParts(c.page),
    '--df-z2': hslParts(c.sunken),
    '--df-z3': hslParts(c.picked),
    '--df-z4': hslParts(c.line),
    '--df-z5': hslParts(c.line),
    '--df-z6': hslParts(c.textFaint),
  });
  const FRAME = ['.dframe-root', '.dframe-root .dframe-sidebar', '.dframe-root .dframe-sidebar-body', '.dframe-root .dframe-card'];

  // 앱 CSS와 같은 구조: 낮은 기본값, 밤은 더 구체적인 선택자로 덮는다. 앱은 data-mode가 없으면 시스템으로 본다.
  const NIGHT_SCOPES = ['[data-mode=dark] .cds-root:not([data-mode=light]):not([data-mode=system])', '.cds-root[data-mode=dark]', '.cds-dark-scope[data-mode=dark]'];
  const SYSTEM_SCOPES = ['[data-mode=system] .cds-root:not([data-mode=light]):not([data-mode=dark])', '.cds-root[data-mode=system]', '.cds-root:not([data-mode]):not([data-mode] *)'];
  const under = (prefixes) => prefixes.flatMap((p) => FRAME.map((f) => `${p} ${f}`));

  // 앱은 이 변수들에 !important를 쓰지 않아서 !important만 붙이면 선택자 우선순위와 상관없이 이긴다
  const block = (selectors, vars) =>
    `${selectors.join(',\n')} {\n${Object.entries(vars)
      .map(([name, value]) => `  ${name}: ${value} !important;`)
      .join('\n')}\n}`;

  const style = document.getElementById('claude-theme') ?? document.head.appendChild(Object.assign(document.createElement('style'), { id: 'claude-theme' }));
  style.textContent = [
    '/* day */',
    block(['.cds-root'], appVars(day)),
    block(FRAME, frameVars(day)),
    '/* night */',
    block(NIGHT_SCOPES, appVars(night)),
    block(under(['[data-mode=dark]']), frameVars(night)),
    `@media (prefers-color-scheme: dark) {\n${block(SYSTEM_SCOPES, appVars(night))}\n${block(under(['[data-mode=system]', ':root:not([data-mode])']), frameVars(night))}\n}`,
    `::selection { background: ${fade(day.spark, 0.45)} !important; }`,
  ].join('\n');
  console.log(`[claude-theme] ${PICK} 적용됨`);
})();
