<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 프로젝트 규약 (system-guide)

이 레포는 **디자인 시스템 가이드**입니다. 작업 전 아래 규약을 반드시 따릅니다.

## 디자인 토큰 (3-tier)

색상은 `src/app/globals.css`에 정의된 토큰 체계로만 사용합니다. **인라인 hex/rgba 하드코딩 금지** (대비 계산용 데이터·체커보드 등 명백한 예외 제외).

```
TIER 1  --raw-*     원본 팔레트·알파 램프. 불변·모드 무관. :root 단 한 번 정의.
TIER 2  --ds-*      Design System 토큰. 모드 인지 스케일/용도 값. .dark에서 재매핑.
TIER 3  --color-*   Tailwind @theme 노출용 토큰. 유틸리티 클래스 이름이 됨.
컴포넌트             className 유틸리티 또는 var(--ds-*)로 소비.
```

- 다크 모드 값은 `.dark`에서 **시맨틱 스케일(`--ds-{family}-{scale}`) 재매핑** 또는 **용도 토큰(`--ds-foreground-*`·`--ds-surface-*` 등) 명시적 재매핑**으로 처리한다. **raw(`--raw-*`)는 모드별로 재정의하지 않는다.**
- **🚨 raw 가 아닌 모든 시맨틱 색 토큰은 라이트·다크 두 모드의 값을 반드시 함께 정의한다 (예외 없음).** `:root`에 `--ds-*`를 추가했으면 그 토큰의 **다크 값이 무엇인지 항상 명시적으로 결정·검증**해야 한다 — `:root`만 추가하고 다크를 확인하지 않는 것은 **미완성**이며 WAVE Contrast Error의 원인이다. 다크 값을 주는 방법은 둘 중 하나:
  - (a) **mode-aware 스케일 참조** `var(--ds-{family}-{scale})` — `.dark`의 스케일 반사로 양 모드가 모두 올바르면 이것으로 충분(예: neutral gray `--ds-border-disabled: var(--ds-gray-10)` → 라이트 raw-gray-10·다크 raw-gray-90). **단 "반사로 충분한지"는 추측이 아니라 양 모드 렌더로 검증**한다.
  - (b) **`.dark` 명시 재매핑** — 반사만으로 색·대비가 맞지 않으면(raw 직접 참조, status·brand 처럼 모드별 스케일 단계가 달라야 하는 경우) `.dark`에 해당 토큰을 **반드시 추가**한다. 예: `--ds-border-danger` 라이트 red-50 → `.dark` red-70(=raw-30).
  - 절차·검증 표: [`docs/accessibility.md`](docs/accessibility.md) 「시맨틱 색상·다크 모드 대비」.
- 새 시맨틱 색 추가 **체크리스트** (순서 고정):
  1. TIER 1 `--raw-*`에 팔레트 값이 없으면 추가 (모드 무관·한 번만).
  2. TIER 2 `:root`에 `--ds-*` 용도 토큰 정의.
  3. **`.dark` 블록 — 다크 값을 반드시 결정한다.** neutral gray 스케일 참조처럼 반사로 양 모드가 보장되는 경우만 별도 `.dark` 줄 없이 통과(반드시 다크 렌더로 검증). brand·status(전경·경계)·`foreground-muted`·overlay·focus-ring·raw 직접 참조 등 **반사만으로 부족한 토큰은 `.dark` 용도 재매핑을 반드시 추가**한다. "일단 `:root`만 추가" 금지.
  4. TIER 3 `@theme inline` `--color-*` · `@utility` 노출.
  5. 가이드 `semanticColorCatalog`(`src/components/guide/shared.tsx`)에 `rawVar`·`rawVarDark` **둘 다** 기재.
  6. `docs/accessibility.md` 대비 표·PR 체크리스트 갱신 후 라이트·다크 WAVE 재검증.
- **다크 모드 시맨틱 대비 필수** — 용도 토큰(`--ds-foreground-brand`·`--ds-accent` 등)은 스케일 50 고정·반사만으로는 WCAG 4.5:1/3:1이 깨질 수 있다. `.dark`에서 **대비 계산 후** 스케일 단계를 재선택한다.
- 새 색이 필요하면: raw에 추가 → `--ds-*`에 매핑(`:root` + `.dark`) → `@theme inline`의 `--color-*`로 노출 → 가이드 큐레이션 → 컴포넌트에서 사용.
- **TIER 1 `--raw-*` 팔레트 family는 hue·색상명만 사용** — `red`·`blue`·`violet`·`gray` 등 스펙트럼/색상 기준 네이밍. `brand`·`primary`·`accent`·`negative`·`positive`·`attention` 등 **역할·기능·의미 이름 금지**. 브랜드 보라(#5B4CF0)는 `--raw-violet-50`으로 정의하고, 강조 역할은 TIER 2 `--ds-accent: var(--ds-violet-50)`처럼 시맨틱에서 참조한다. 팔레트 스케일 family의 TIER 2(`--ds-violet-*`)·TIER 3(`--color-violet-*`)도 동일하게 hue명만 쓴다.
- **Raw 스케일 단위** — `0 · 5 · 10 · 20 · 30 · 40 · 50 · 60 · 70 · 80 · 90 · 95 · 100`(첨부 가이드·KRDS 5~90과 동일 축). 예전 Tailwind식 `50~900` 배수 명명 금지. KRDS family는 5~90, Violet은 0~100 전 구간. `50`이 base(앵커), `5`≈surface, `60`≈text 용도 참고. SSOT: [`src/lib/raw-color-palettes.ts`](src/lib/raw-color-palettes.ts) `RAW_COLOR_SCALE_UNITS`.
- **TIER 3 `--color-*` 슬러그에는 Tailwind 유틸 접두(`text`·`bg`·`border`)를 넣지 않는다.** 유틸리티는 `{접두}-{슬러그}`로 조합되므로, 슬러그에 접두가 있으면 `text-text-muted`·`border-border`처럼 이중 접두가 생긴다.
  - 올바른 예: `--color-surface-subtle` → `surface-subtle` · `--color-default` → `border-default` · `--color-surface-default` → `surface-default`
  - 금지 예: `--color-text-muted` → `text-text-muted` · `--color-border` → `border-border`
  - TIER 2 `--ds-*` 용도명(`--ds-border`·`--ds-utility-focus-ring` 등)은 내부 의미용으로 유지 가능. TIER 3 노출명만 슬러그 규칙을 따른다.
  - **전경(foreground) 패밀리** — 텍스트·아이콘 공통 전경색은 `text-`/`icon-` 접두로 한정하지 않는다(`text-`는 아이콘을 포함 못 함). prefix 없는 **`foreground-*` @utility로 통일**하고 `color`로 적용한다(아이콘은 `currentColor` 상속). 체인: TIER 2 `--ds-foreground`(=default base)·`--ds-foreground-{subtle,muted,brand,brand-subtle,brand-strong,required,negative,attention,positive,info,disabled}` → TIER 3 `--color-foreground-{default,subtle,muted,brand,brand-subtle,brand-strong,required,negative,attention,positive,info,disabled}`(@theme) → `@utility foreground-{default,subtle,muted,brand,brand-subtle,brand-strong,required,negative,attention,positive,info,disabled}`(globals.css). border/ring 등 다른 속성은 TIER 3 `--color-foreground-default`에서 `border-foreground-default`·`ring-foreground-default`로 그대로 노출. **링크·브랜드 강조 텍스트는 `text-accent` 대신 `foreground-brand`**(다크 모드 대비 재매핑). 큐레이션: 시맨틱 컬러 `Foreground` 카테고리(`brand`=subtle·brand·strong / `neutral`=default·subtle·muted / `status`=required·negative·attention·positive·info·disabled 그룹).
    - **브랜드(brand) 그룹** — 실무 3단계: `brand-subtle`(옅음) · `brand`(기본·링크) · `brand-strong`(진함·헤더 제목). `deep`/`dark` 대신 **subtle↔strong** 쌍이 업계에서 가장 흔함(Polaris·Primer 계열).
    - **중립(neutral) 그룹** — gray 계열 텍스트 위계(현업에서 emphasis보다 neutral이 흔함 — emphasis는 보통 굵기·강조색 의미). `default`(gray-90, 메인 타이틀/본문) → `subtle`(gray-70, 서브타이틀) → `muted`(gray-40, 캡션·메타·placeholder). subtle·muted 는 gray 스케일 참조. subtle 은 `.dark` 자동 반사(gray-70↔gray-30)로 양 모드 본문 대비 충족(라이트 8.8:1·다크 10:1). muted 는 `.dark`에서 gray-60으로 재매핑.
    - **상태(status) 그룹** — `required`(필수 입력 `*`, red-50·negative 와 동일 스케일·의미 분리) · `negative`·`attention`·`positive`·`info`는 본문 대비 4.5:1 충족(`.dark`에서 70→raw 30 재매핑). `disabled`(gray-30, .dark gray-70 자동 반사)는 비활성 의미라 **의도적 저대비**(WCAG 1.4.3 비활성 컴포넌트 예외). disabled 는 실제 비활성 요소에만 쓰고 일반 본문/캡션에 쓰지 않는다. **필수 `*`는 `foreground-required`만** — 검증 오류 문구는 `foreground-negative`.
  - **표면(surface) 패밀리** — 시맨틱 배경 표면은 `bg-*` 대신 **`surface-*` @utility**로 통일(`background-color`). 체인: TIER 2 `--ds-background`·`--ds-surface-{subtle,brand}` → TIER 3 `--color-surface-default`·`--color-surface-*`(@theme) → `@utility surface-{default,subtle,brand}`(globals.css). palette 조합용 `bg-gray-*` 등은 예외. 큐레이션: 시맨틱 컬러 `Surface` 카테고리(`brand` / `neutral`=default·subtle 그룹).
  - **경계(border) 패밀리** — 구조 경계선은 `border-default`·`border-strong`·`border-brand`·`border-subtle`, 상태 경계선은 `border-danger`·`border-attention`·`border-success`·`border-disabled` 유틸리티. TIER 2 `--ds-border`·`--ds-border-strong`·`--ds-border-brand`·`--ds-border-subtle`·`--ds-border-{danger,attention,success,disabled}` → TIER 3 `--color-default`·`--color-strong`·`--color-brand`·`--color-subtle`·`--color-{danger,attention,success,disabled}`(@theme). 포커스 링은 border가 아닌 **Utility `outline-utility-focus-ring`**. 큐레이션: `Border` 카테고리(`brand` / `neutral`=default·strong·subtle / `status`=danger·attention·success·disabled 그룹). 상태 경계는 UI 3:1만 필요하지만 전경 status 와 색을 맞추려 danger·attention·success 는 **라이트 50·다크 `.dark`에서 70(→raw 30) 재매핑**(텍스트·경계 동일 색)·disabled 은 비활성 저대비(gray-10, .dark gray-90 자동 반사).
  - 포커스 링 색은 TIER 1 `--raw-utility-focus-ring`(#00cbde) → TIER 2 `--ds-utility-focus-ring` → TIER 3 `--color-utility-focus-ring` → 유틸 `outline-utility-focus-ring`. 라이트 `--raw-utility-focus-ring` · 다크 `--raw-orange-30`. **utility** 접두 + **focus-ring** 기능명으로 관리한다(`ring` 단독 슬러그 금지). SSOT hex는 [`src/lib/raw-color-palettes.ts`](src/lib/raw-color-palettes.ts) `rawUtilityColors.focusRing`.
  - 스크롤바 색은 TIER 2 `--ds-utility-scroll-thumb`·`--ds-utility-scroll-track` → TIER 3 `--color-utility-scroll-*` → `bg-utility-scroll-thumb`·`bg-utility-scroll-track`. `::-webkit-scrollbar` pseudo는 `--ds-utility-scroll-*`를 직접 참조한다.
- 큐레이션 가이드 화면 전용 표시/검증 토큰은 `guide-*` 접두를 붙입니다. 예: `--ds-guide-level-*`, `--color-guide-level-*`, `--ds-guide-callout-*`·`--color-guide-callout-*`(탭 설명 콜아웃), `--ds-guide-intro-*`·`--color-guide-intro-*`(콘텐츠 상위 타이틀 eyebrow), `--text-guide-content-title` / `typo-guide-content-title`(콘텐츠 h2, 60px).

## 레이아웃 / 크기 토큰

- 여백은 `--space-*`를 원본으로 두고 `@theme inline`의 `--spacing-*`로 노출합니다. 컴포넌트에서는 `p-4`, `gap-6`, `m-8`처럼 Tailwind spacing 유틸리티를 우선 사용합니다.
- radius 원본은 `--shape-radius-*`, Tailwind 노출은 `--radius-*`로 분리합니다. 같은 이름을 `:root`와 `@theme`에 중복 정의하지 않습니다.
- 반복 크기는 `--size-icon-*`, `--size-control-*`로 정의하고, `--spacing-icon-*`, `--spacing-control-*` 노출을 통해 `size-icon-md`, `h-control-md` 같은 유틸리티로 사용합니다.
- 아이콘 크기는 `xs 16px`, `sm 20px`, `md 24px`, `lg 32px`, `xl 40px`를 기본 배리에이션으로 둡니다. 일반 UI 기본값은 `icon-md`이며, 인라인 보조 아이콘은 `xs/sm`, 섹션 강조 아이콘은 `lg/xl`을 사용합니다.
- 콘텐츠 폭은 `--layout-container-*`를 원본으로 두고 `--container-*`로 노출합니다. 페이지·사이드메뉴 레이아웃은 `layout-page`·`layout-sidenav-content`가 이 토큰을 직접 참조합니다.
- 반응형 그리드 시스템은 `small`(360px–, 4열, 가터 16px, 스크린 마진 16px) → `medium`(768px–, 8열, 가터 16px, 스크린 마진 24px) → `large`(1024px–, 12열, 가터 24px, 스크린 마진 24px) → `xlarge`(1280px–, large와 동일) tier로 구분합니다. tier 정의는 [`src/lib/layout-tokens.ts`](src/lib/layout-tokens.ts)의 `gridSystemTiers`가 SSOT이며, Tailwind 원시 breakpoint(`sm/md/lg/xl`)와는 별도 레이어입니다(small=prefix 없는 base, medium=`md:`, large=`lg:`, xlarge=`xl:`).
- content 좌우 **최소 스크린 마진**은 `--layout-screen-margin-sm`(16px, medium 미만), `--layout-screen-margin-md`(24px, medium 이상)을 원본으로 두고 `--spacing-screen-margin-*` → `px-screen-margin-sm`, `md:px-screen-margin-md`로 노출합니다. (예전 `--layout-gutter-*`/`px-gutter-*`는 폐기 — 이름이 표의 "가터=칼럼 gap"과 충돌했음.) 칼럼 사이 가터(gap)는 spacing 토큰(`gap-4`/`gap-6`)으로 적용합니다.
- 그리드 shell 트랙은 `--layout-grid-sidebar`·`--layout-grid-sidebar-wide` 원본을 `layout-sidenav`·`layout-sidenav-wide` `@utility`에서 직접 참조합니다. gap은 spacing 토큰(`gap-4` 등)과 조합합니다.
- breakpoint 원본은 `--layout-breakpoint-*`(:root), Tailwind 노출은 `@theme`의 `--breakpoint-*`에 **리터럴 rem**으로 정의합니다(`@media`에서 `var()` 참조 불가). 두 값은 동기화를 유지합니다.
- 그라데이션은 `--ds-gradient-*` → `@theme` `--background-image-gradient-*` → `bg-gradient-accent` 등으로 노출합니다.
- 반응형 container·grid·tier 계산과 권장 class 조합은 [`src/lib/layout-tokens.ts`](src/lib/layout-tokens.ts)에 일원화합니다. 페이지 콘텐츠 레이아웃 shorthand는 [`src/app/globals.css`](src/app/globals.css) `@utility layout-page`(container + 최소 스크린 마진 + 4→8→12열 grid)입니다. 자식 영역은 `col-span-*`를 tier별 열 수에 맞게 조합합니다(`layoutPageColSpanFull` / `Main` / `Aside` export). 패딩 있는 래퍼 안에서 viewport 폭 맞출 때는 `@utility layout-bleed`를 사용합니다. `layout-page`에 `p-0`·`px-*`를 추가하면 스크린 마진이 사라집니다. container·margin·스크린 마진 실측은 [`/guide/responsive`](src/app/guide/responsive/page.tsx)에서 확인합니다.
- 사이드메뉴 프리셋은 `@utility layout-sidenav` + `layout-sidenav-menu` + `layout-sidenav-content` 조합입니다. `layout-sidenav` shell에는 gap 없음 — 콘텐츠 좌우 스크린 마진·container 상한은 `layout-sidenav-content`가 담당합니다(`layout-page`와 동일). 넓은 menu는 `layout-sidenav-wide`입니다.
- 가이드 메인 콘텐츠 **서브탭 패널** 인셋은 `--layout-guide-tabpanel-py`·`--layout-guide-tabpanel-px`(80px) 원본 → `@utility layout-guide-tabpanel`로 적용합니다. `className`만 사용하고 인라인 `style` padding은 금지합니다.
- 모든 크기 값은 rem 기반입니다. 새 px 값이 필요하면 토큰/헬퍼에서 rem으로 환산하고, 인라인 고정 px를 추가하지 않습니다.

## 스타일 적용 (className 우선)

- **고정 레이아웃·여백·타이포·색**은 `className` + Tailwind 유틸리티(`p-4`, `text-body-md`, `surface-subtle` 등) 또는 `@utility layout-*`·`typo-*`로 적용합니다.
- **`style` 인라인**은 런타임에만 결정되는 값에 한정합니다. 예: 대비 체커·팔레트에서 사용자가 고른 **배경/텍스트 hex**, 미리보기 견본의 **동적 color**, 체커보드·대비 계산용 데이터, `getComputedStyle`로 읽은 resolved 색.
- padding·margin·font-size·border-radius 등 **디자인 토큰으로 표현 가능한 값**을 `style={{ padding: "60px 30px" }}`처럼 인라인으로 넣지 않습니다. 필요 시 `--layout-*` / `--space-*`에 토큰을 추가한 뒤 유틸리티 또는 `@utility`로 노출합니다.

## 접근성 (필수)

- 목표: **한국 웹접근성 마크(KWCAG 2.2) 1등급**. 체크리스트·패턴은 [`docs/accessibility.md`](docs/accessibility.md) 참조.
- 모든 변경은 WAVE / W3C Validator 기준 **오류 0** 유지. 시맨틱 HTML 우선, 인터랙티브 요소는 네이티브 태그(`button`/`a`) 사용.
- 포커스 링은 전역 `:focus-visible` **outline**(`2.5px dashed` · `--ds-utility-focus-ring` / `outline-utility-focus-ring`, offset `0.125rem`). 라이트 `#00cbde` · 다크 `#ffa94d`. `role="tab"`·`.guide-toc`는 **outline-offset: -2px**. outline 제거·`outline-none` 금지.

## 타이포그래피 / 폰트

- 폰트는 **자체 호스팅**(`next/font/local`). 외부 CDN `<link>` 추가 금지 — 공공/폐쇄망·개인정보(IP 외부 전송)·CSP 때문.
- 파일: `src/app/fonts/`의 woff2. `layout.tsx`에서 `localFont()`로 주입.
  - `pretendardGov` → `--font-pretendard-gov` (기본, variable woff2)
  - `notoSansKR` → `--font-noto` (폴백, static 100/300/400/500/600/700, `preload: false`)
- 폴백 체인은 `--font-family-base`(globals.css) 하나로 관리: `var(--font-pretendard-gov), var(--font-noto), sans-serif`. 컴포넌트는 이 토큰만 사용.
- ⚠️ **Noto Sans KR은 `next/font/google` 사용 불가** — Google 메타데이터에 한글('korean') subset이 없어 한글 글리프가 빠짐. 반드시 로컬 woff2로 self-host.
- `next/font`가 생성하는 내부 family 이름은 **JS 변수명에서 파생**되므로, 변수명은 의미가 드러나게(`pretendardGov` 등) 짓는다.

### 서브셋팅 (Pretendard)

- `PretendardGOVVariable.woff2`는 **서브셋본**(5.16MB → 1.85MB). **전체 한글 음절 11,172자는 유지**(공공/이름 등 희귀 한글 대응), **한자(CJK)·기타 스크립트 제거**, variable(wght) 축 유지.
- 재생성:
  ```bash
  python3 -m fontTools.subset <원본>.woff2 \
    --output-file=src/app/fonts/PretendardGOVVariable.woff2 \
    --flavor=woff2 --layout-features='*' --no-hinting --desubroutinize \
    --unicodes="U+0000-04FF,U+1100-11FF,U+2000-206F,U+20A0-20CF,U+2100-214F,U+2190-22FF,U+2460-24FF,U+25A0-26FF,U+3000-303F,U+3130-318F,U+AC00-D7A3,U+FF00-FFEF"
  ```
  원본: `cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard-gov/dist/web/variable/woff2/PretendardGOVVariable.woff2`
- 폰트 파일은 `.gitattributes`에서 바이너리 처리. 총량 ~5.4MB(Noto 폴백 6 weight 포함)라 일반 git 커밋(LFS 불필요).

### 타이포 토큰 / 단위

- **크기 단일 소스(SSOT) = [`src/lib/tokens.ts`](src/lib/tokens.ts)**. font-size 스케일을 **px로 한 번만 정의**하고:
  - 인라인 스타일 → `pxToRem(14)` (px로 작성, rem 출력)
  - CSS 변수 `--font-size-*` → `fontSizeCssVars()`가 생성해 `layout.tsx <style>`로 `:root` 주입
  - 둘 다 같은 px 정의 + `REM_BASE(16)`에서 파생 → 기준값 중복 없음.
- **모든 px 크기는 rem으로**(반응형·접근성 3.1.3). 인라인은 `pxToRem()`, 토큰은 tokens.ts에서. globals.css에 `--font-size-*` 직접 정의 금지(거기 두지 않음).
- **렌더되는 글리프 최소 크기 = `caption`(12px)** — `text-caption` 미만(`pxToRem(10)` 등) 인라인 `font-size` 금지. WAVE Very small text 방지. 상세·금지 예시는 [`docs/accessibility.md`](docs/accessibility.md) 금지 패턴 참조.
- **장식 색상 스와치** — `role="img"`+`aria-label` 대신 `aria-hidden="true"`; 인접 텍스트로 토큰·hex 전달. Raw 팔레트는 `--raw-*`+체커보드(`docs/accessibility.md` Raw Color 팔레트 견본). **`span`/`button` 안 `div` 금지** — 겹침 레이어는 `span`+`absolute inset-0 block`(`RawPaletteSwatchFill`·`ContrastSwatchFill`). 대비 매트릭스·**대비 미리보기 견본** 등 시각 보조도 동일.
- **`foreground-muted` on `surface-subtle`/`gray-10` 금지** — gray-40 계열은 밝은 회색 배경에서 대비 부족. `text-gray-60` 이상 사용.
- weight 원본은 `--typography-weight-*`, Tailwind 유틸리티 노출은 `@theme`의 `--font-weight-*`로 분리합니다. 같은 이름을 `:root`와 `@theme`에 중복 정의하지 않습니다.
- **line-height는 프로젝트 전역 `1.5` 단일 값** — 역할·컴포넌트별로 나누지 않는다. WCAG/KWCAG **1.4.12(텍스트 간격)**·가독성(3.1) 충족 목적.
  - **SSOT** = [`src/lib/tokens.ts`](src/lib/tokens.ts) `FONT_LINE`(현재 `1.5`) → `fontSizeCssVars()`가 `:root`에 `--font-line` 주입 → `globals.css`·컴포넌트·JS 계산이 동일 값 참조.
  - **전역 적용(한 곳에서 일괄)** — `body { line-height: var(--font-line) }`; `@theme`의 **모든** `--leading-*`(`none`·`tight`·`snug`·`normal`·`relaxed`·`loose`·`base`)를 `var(--font-line)`에 매핑; `--typography-*`·`typo-*` shorthand도 `var(--font-line)` 포함.
  - **금지** — `leading-none`·`leading-tight` 등으로 행간을 줄이려는 시도(테마가 1.5로 통일되어 있어도 **새 `--leading-*` 추가·인라인 덮어쓰기 금지**); 인라인 `lineHeight: 1`·`1.25`·`"24px"` 등 리터럴; `:root`·컴포넌트에 `--font-line-tight` 같은 계층별 토큰 신설; `globals.css`에 `--font-line` 숫자 직접 정의(`tokens.ts`만 수정).
  - **인라인 예외** — 런타임 동적 미리보기 등 불가피할 때만 `lineHeight: "var(--font-line)"` 사용. px·단위 없는 배수 리터럴 금지.
  - **JS 계산**(타이포 표 행간 px 등) — `FONT_LINE` import. 로컬 `const FONT_LINE = …` 중복 정의 금지.
- letter-spacing은 계층을 나누지 않고 **단일 기본값 `--font-tracking: 0`**만 사용합니다.
- 숫자 정렬이 필요한 대비율·통계·표에는 `numeric-tabular` 유틸리티(`--font-numeric-tabular`)를 사용합니다.
- 가짜 굵기 합성을 막기 위해 전역 `font-synthesis-weight: none`을 유지합니다.
- 타이포 유틸리티는 두 방식 모두 제공:
  - 개별 조합: `text-display-lg` + `font-bold` + `leading-base` + `font-sans`
  - 묶음 shorthand: `typo-display-lg` (`--typography-display-lg` → font-family/size/weight/line-height 적용, 유틸리티에서 letter-spacing까지 포함)
- `typo-*`는 Typography 약어입니다. 새 묶음 유틸리티를 만들 때 `type-*` 접두는 사용하지 않습니다.

## Git / 문서

- 브랜치·커밋 규약: [`docs/git-strategy.md`](docs/git-strategy.md). 커밋 type 접두사(`feat/fix/refactor/design/docs/...`) 준수.
