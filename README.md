# Claude 데스크톱 앱 색 테마

Claude 데스크톱 앱의 색을 바꾸는 DevTools 스니펫이에요. 테마는 두 가지예요.
- `dreamcore`: Surreal Series 영상 색. 낮/밤 모두 글자 대비 4.5:1 이상
- `vintage-pastel`: 빈티지 파스텔 선호 조합. 낮에만 쓰고 밤은 dreamcore 밤과 같아요. 밝은 색끼리 겹쳐 글자가 흐린 게 의도라 글자 대비가 1.2~1.6:1이에요

앱 CSS 변수를 덮어쓰는 `<style>` 하나만 추가하고, 그 외에는 아무것도 바꾸지 않아요. 앱 4.29.0에 맞춰 만들었어요.

| dreamcore 낮 | dreamcore 밤 | vintage-pastel 낮 |
|---|---|---|
| ![dreamcore 낮](preview-dreamcore-day.jpg) | ![dreamcore 밤](preview-dreamcore-night.jpg) | ![vintage-pastel 낮](preview-vintage-pastel-day.jpg) |

(위 그림은 앱과 같은 변수 이름을 쓰는 목업 화면 `mockup.html`이에요. 실제 앱 화면이 아니에요.)

## 테마 고르기
`claude-theme.snippet.js` 맨 위 `THEME_LIST`에 고를 수 있는 테마 이름과 설명이 있어요. 그중 하나를 바로 아래 `const PICK = 'dreamcore';`에 적고 다시 실행해요. 없는 이름을 적으면 Console에 고를 수 있는 이름을 보여 줘요.

## 색 조합 바꾸기 (테마 편집기)
`editor.html`에서 글자, 아이콘, 버튼 같은 칸마다 색을 바꾸면서 미리보기로 바로 볼 수 있어요.
1. `coz` 폴더(이 폴더의 한 단계 위)에서 `python3 -m http.server`를 실행하고 `http://localhost:8000/claude-theme/editor.html`을 열어요. 한 단계 위에서 여는 건 `../palettes` 폴더의 팔레트 색을 같이 읽기 위해서예요. 그 폴더에 팔레트 md 파일이 늘면 편집기에도 자동으로 나와요.
2. 위쪽에서 테마와 낮/밤을 골라요.
3. 바꿀 곳을 골라요. 오른쪽 미리보기에서 사이드바, 버튼, 글자 같은 곳을 바로 누르거나, 왼쪽 칸 목록에서 눌러요. 고른 칸은 미리보기에 파란 테두리로 보여요.
4. 가운데 팔레트 색을 누르면 바로 들어가요. 팔레트에 없는 색은 칸 왼쪽 네모를 눌러 직접 골라요. 글자 칸 옆 숫자는 글자 대비예요(4.5 이상이면 잘 읽혀요).
5. 잘못 바꿨으면 **되돌리기**(Cmd+Z), 처음부터 다시 하려면 **처음 값으로**를 눌러요. 고친 색은 브라우저에 자동 저장돼서 새로 고쳐도 남아요.
6. 다 됐으면:
   - 앱에 바로 쓰려면 **앱에 붙일 스니펫 복사**를 눌러요. 이 테마가 들어간 스니펫 전체가 복사돼요. 개발자 도구의 `claude-theme` 스니펫 내용을 전부 지우고 붙여 넣은 뒤 Cmd+S, Cmd+Enter를 눌러요.
   - 이 저장소에 테마로 남기려면 테마 이름과 설명을 적고 **테마 코드 복사**를 눌러요. 첫 줄은 `THEME_LIST`에, 나머지 덩어리는 `THEMES`에 붙여 넣어요.

## 낮/밤 전환
- 앱 설정의 화면 모드(라이트/다크/시스템)가 **시스템**이면 macOS 라이트/다크를 따라 낮/밤이 바뀌어요.
- 앱을 라이트나 다크로 고정했다면 그쪽 테마만 나와요.

## 적용하기
메뉴 이름은 앱 언어에 따라 달라서 한국어와 영어를 같이 적었어요. 개발자 도구(DevTools) 안은 영어로 나올 수 있어요.

### 1. 개발자 모드 켜기 (처음 한 번만)
1. Claude 앱을 앞에 띄운 상태에서 화면 맨 위 메뉴 막대를 봐요.
2. **도움말 > 문제 해결 > 개발자 모드 활성화…** (Help > Troubleshooting > Enable Developer Mode…)를 눌러요.
3. 경고 창에서 **활성화**(Enable)를 눌러요. 메뉴 막대에 **개발자**(Developer) 메뉴가 새로 생겨요.

### 2. 개발자 도구 열기
**개발자 > 개발자 도구 표시** (Developer > Show Dev Tools)를 눌러요. 단축키는 Option+Cmd+I예요. 앱 옆이나 아래, 또는 따로 개발자 도구 창이 열려요.

### 3. 스니펫 저장하기
스니펫(Snippet)은 개발자 도구 안에 저장해 두는 작은 코드 파일이에요. 한 번 저장해 두면 앱을 다시 켤 때마다 눌러서 실행만 하면 돼요.
1. 이 폴더의 `claude-theme.snippet.js`를 열어 전부 선택(Cmd+A)하고 복사(Cmd+C)해요.
2. 개발자 도구 맨 위 탭 줄에서 **Sources**(소스)를 눌러요. 탭이 안 보이면 탭 줄 오른쪽 끝 **>>**를 눌러 찾아요.
3. Sources 화면 왼쪽 칸 위에 작은 탭들(Page, Workspace, Overrides…)이 있어요. 거기서 **Snippets**(스니펫)를 눌러요. 안 보이면 그 줄의 **>>**를 눌러 찾아요. 왼쪽 칸 자체가 안 보이면 Sources 화면 왼쪽 위 사이드바 모양 아이콘(Show navigator)을 눌러요.
4. **+ New snippet**을 눌러요. 목록에 `Script snippet #1`이 생기면 이름을 `claude-theme`으로 바꾸고 Enter를 눌러요.
5. 오른쪽 빈 편집 칸을 한 번 누르고 붙여 넣어요(Cmd+V).
   - 붙여 넣기 경고가 뜨면 안내대로 `allow pasting`을 입력하고 Enter를 누른 뒤 다시 붙여 넣어요. 남이 준 코드를 모르고 붙여 넣는 사고를 막는 경고라 처음 한 번만 떠요.
6. Cmd+S로 저장해요. 이름 옆 `*` 표시가 사라지면 저장된 거예요.

### 4. 실행하기
편집 칸을 누른 상태에서 Cmd+Enter를 눌러요. 편집 칸 오른쪽 아래 ▶ 버튼이나, 왼쪽 목록의 `claude-theme`을 오른쪽 클릭해 **Run**을 눌러도 돼요. 바로 앱 색이 바뀌어요. 아래쪽 Console(콘솔)에 `[claude-theme] dreamcore 적용됨`이 나오면 성공이에요(Console이 안 보이면 Esc를 눌러 열어요).

다 끝나면 개발자 도구는 닫아도 돼요. 테마는 그대로 남아요.

### 되돌리기
Console 칸에 `document.getElementById('claude-theme')?.remove();`를 입력하고 Enter를 눌러요. 앱을 다시 시작해도 원래 색으로 돌아가요. `revert.snippet.js`를 3단계처럼 스니펫으로 저장해 둬도 돼요.

## 앱을 다시 시작했을 때
테마는 앱을 끄면 사라져요. 앱에는 사용자 색을 저장해 두는 기능이 없어서, 이 방법은 켤 때마다 한 번 실행해야 해요. 다시 켠 뒤 **개발자 > 개발자 도구 표시** (Developer > Show Dev Tools)를 열고, **Sources > Snippets**에서 `claude-theme`을 오른쪽 클릭해 **Run**을 눌러요. 여러 번 실행해도 `<style>`은 하나만 남아요.

## 색 바꾸기
편집기를 쓰거나, `claude-theme.snippet.js` 위쪽 `THEMES`의 색 값만 고치면 돼요. 고친 뒤에는 대비를 확인해요.

```bash
node check.mjs
```

글자색과 바탕색 대비가 4.5:1(WCAG AA, 본문 글자 기준) 아래로 떨어지면 `FAIL`로 알려 줘요. vintage-pastel처럼 흐린 글자가 의도인 테마는 대비를 보여 주기만 하고 실패로 치지 않아요(`check.mjs`의 `STRICT`에 든 테마만 검사). 화면으로 보고 싶으면 `mockup.html`을 브라우저로 열어요(파일을 바로 열면 스니펫을 못 읽어서 로컬 서버로 열어요. `coz` 폴더에서 `python3 -m http.server`를 실행하고 `http://localhost:8000/claude-theme/mockup.html`로 열어요. 주소 뒤에 `?mode=light`, `?mode=dark`, `&pick=vintage-pastel`, `&theme=off`로 비교).

## 앱 업데이트 뒤 색이 일부만 바뀌거나 안 바뀔 때
앱이 CSS 변수 이름을 바꾸면 그 부분만 원래 색으로 남아요. 비공식 방법이라 업데이트마다 깨질 수 있어요(테마 때문에 앱이 고장 나지는 않아요. 색만 덮어써요).
1. 스니펫이 쓰는 변수와 선택자가 앱에 아직 있는지 확인해요. 앱 파일과 앱이 claude.ai에서 받아 둔 CSS를 같이 봐요(`zstd`가 필요해요). `없음`으로 나온 줄이 고칠 곳이에요.

   ```bash
   node app-vars.mjs
   ```
2. 원래 색으로 남은 영역은 DevTools **Elements** 탭에서 골라, 오른쪽 **Styles**에서 `background`나 `color`에 쓰인 `var(--이름)`을 찾아요.
3. 그 이름을 `claude-theme.snippet.js`의 `appVars()`(사이드바, 카드 같은 틀 요소면 `frameVars()`) 안에 추가하거나 바뀐 이름으로 고쳐요.
