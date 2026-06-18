# system-guide

디자인 토큰(컬러·타이포·레이아웃·오버레이)과 웹접근성 대비 체커를 제공하는 디자인 시스템 가이드입니다.

## Guides

| 경로 | 설명 |
|------|------|
| [`/`](src/app/page.tsx) | 메인 토큰 큐레이션 — Color / Font & Type / Spacing & Size / Grid 탭 · Layout & Breakpoint(새 창) |
| [`/guide/responsive`](src/app/guide/responsive/page.tsx) | 반응형 layout 가이드 — `layout-page`·`layout-sidenav` margin·gutter·container·grid 실시간 확인 |

반응형 container·grid·breakpoint 헬퍼는 [`src/lib/layout-tokens.ts`](src/lib/layout-tokens.ts)에 정의합니다. 페이지 레이아웃 shorthand는 [`src/app/globals.css`](src/app/globals.css)의 `@utility layout-page`, `layout-sidenav`·`layout-sidenav-menu`·`layout-sidenav-content`, `layout-bleed`, `layout-guide-tabpanel`(서브탭 패널 패딩)입니다.

### layout-page

container(`max-w-*` + `mx-auto`) + 좌우 gutter(`px-gutter-sm` / `md:px-gutter-md`) + 반응형 grid(1→2→4→8→12열, `gap-4` / `md:gap-6`)를 한 클래스로 적용합니다. 자식은 grid item이며 `col-span-*`로 영역을 나눕니다.

| Breakpoint | Grid 열 | Gutter | Container 상한 |
|------------|---------|--------|----------------|
| base | 1 | 18px | 100% |
| sm (640px+) | 2 | 18px | 640px |
| md (768px+) | 4 | 30px | 768px |
| lg (1024px+) | 8 | 30px | 1280px |
| xl (1280px+) | 12 | 30px | 1280px |

`col-span-*`는 breakpoint마다 열 수가 달라지므로 prefix를 맞춥니다. 권장 조합은 `layout-tokens.ts`의 `layoutPageColSpanFull` / `Main` / `Aside`를 사용하세요.

`layout-page`에 `p-0`·`px-*`를 함께 쓰면 gutter padding이 덮어씌워집니다. 패딩 있는 부모 안에서 viewport 폭 검증이 필요하면 `layout-bleed`로 breakout합니다(부모 `p-6 md:p-10` 기준).

```tsx
<main className="layout-page">
  <header className={layoutPageColSpanFull}>...</header>
  <article className={layoutPageColSpanMain}>...</article>
  <aside className={layoutPageColSpanAside}>...</aside>
</main>
```

### layout-sidenav (사이드메뉴 + 콘텐츠)

lg(1024px)부터 `16rem` menu + `1fr` 콘텐츠 2열(`layout-sidenav` shell gap 없음). 콘텐츠 열에 `layout-sidenav-content`를 적용합니다 — `layout-page`와 동일한 container 상한·gutter·grid입니다. 넓은 menu는 `layout-sidenav-wide`(20rem). lg 미만은 menu·콘텐츠 1열 스택입니다.

| Breakpoint | Shell | 콘텐츠 열 (`layout-sidenav-content`) |
|------------|-------|--------------------------------------|
| base ~ md | 1열 스택 | `layout-page`와 동일 |
| lg (1024px+) | 16rem menu + 1fr | `layout-page`와 동일 (콘텐츠 열 기준) |
| xl (1280px+) | 16rem menu + 1fr | 12열 grid · container 1280px 상한 |

`col-span-*`는 `layoutPageColSpanFull` / `Main` / `Aside`를 그대로 사용합니다.

```tsx
<div className="layout-sidenav">
  <nav className="layout-sidenav-menu">...</nav>
  <main className="layout-sidenav-content">
    <article className={layoutPageColSpanMain}>...</article>
  </main>
</div>
```

## Design Tokens

색상 토큰은 `src/app/globals.css`에서 3단계로 관리합니다.

```css
--raw-*    /* 원본 팔레트·알파 램프. 불변·모드 무관 */
--ds-*     /* Design System 토큰. 모드 인지 스케일/용도 값 */
--color-*  /* Tailwind @theme 노출용 토큰. 유틸리티 클래스 이름 */
--typography-*  /* font shorthand 묶음 토큰 */
--space-* / --shape-radius-* / --size-* / --layout-container-* / --layout-grid-* / --layout-gutter-*  /* 레이아웃·크기 원본 토큰 */
--ds-gradient-*  /* 그라데이션. @theme → bg-gradient-* */
```

흐름은 `--raw-green-500` → `--ds-green-500` → `--color-green-500` → `bg-green-500`처럼 이어집니다. `.dark`에서는 `--ds-*`만 재매핑하므로 Tailwind 유틸리티도 같은 클래스명으로 다크 모드 값을 사용합니다.

큐레이션 가이드 화면에서만 쓰는 표시/검증용 토큰은 `guide-*` 접두로 구분합니다. 예: `--color-guide-level-*`(대비 등급), `--color-guide-callout-*`(탭 설명 콜아웃 배경·accent), `--color-guide-intro-*`(콘텐츠 상위 타이틀 eyebrow), `--text-guide-content-title` / `typo-guide-content-title`(콘텐츠 h2, 60px).

레이아웃 토큰은 source token과 Tailwind 노출 token을 분리합니다. 여백은 `--space-*` → `--spacing-*`, radius는 `--shape-radius-*` → `--radius-*`, 콘텐츠 폭은 `--layout-container-*` → `--container-*`(`layout-page`·`layout-sidenav-content`에서 참조), gutter는 `--layout-gutter-*` → `--spacing-gutter-*` 흐름입니다. 사이드메뉴 shell 트랙은 `--layout-grid-sidebar`·`--layout-grid-sidebar-wide`를 `layout-sidenav`·`layout-sidenav-wide`에서 참조합니다. breakpoint는 `--layout-breakpoint-*`(:root 문서용)와 `@theme` `--breakpoint-*`(리터럴 rem)를 동기화합니다. 반복 크기인 `--size-icon-*`, `--size-control-*`는 spacing namespace에 연결해 `size-icon-md`, `h-control-md`처럼 사용할 수 있습니다. 아이콘은 `xs 16px`, `sm 20px`, `md 24px`, `lg 32px`, `xl 40px`를 기본 배리에이션으로 둡니다.

```tsx
<div className="p-6 gap-4 rounded-xl max-w-lg" />
<span className="size-icon-md" />
<button className="h-control-md px-4" />
<div className="layout-sidenav">
  <nav className="layout-sidenav-menu">...</nav>
  <main className="layout-sidenav-content">...</main>
</div>
<div className="bg-gradient-accent" />
```

타이포그래피는 개별 유틸리티와 묶음 유틸리티를 모두 제공합니다.

```tsx
<p className="text-display-lg font-bold leading-base font-sans" />
<p className="typo-display-lg" />
```

`typo-*` 유틸리티는 `--typography-*` 토큰을 사용해 `font-family`, `font-size`, `font-weight`, `line-height`를 적용하고, 유틸리티에서 `letter-spacing`까지 함께 적용합니다.

`letter-spacing`은 계층을 나누지 않고 기본값 하나(`--font-tracking: 0`)만 사용합니다. 숫자 자리 폭 정렬이 필요한 대비율·통계·표에는 `numeric-tabular` 유틸리티를 사용합니다.

```tsx
<span className="numeric-tabular">4.5:1</span>
```

전역 `font-synthesis-weight: none`으로 브라우저의 가짜 굵기 합성을 막고, 실제 폰트 weight만 사용합니다.

| Token | Size | Weight | Utility |
|------|------|--------|---------|
| Display LG | 40px | 700 | `typo-display-lg` |
| Display MD | 32px | 700 | `typo-display-md` |
| Display SM | 28px | 700 | `typo-display-sm` |
| Heading LG | 32px | 700 | `typo-heading-lg` |
| Guide Content Title | 60px | 700 | `typo-guide-content-title` |
| Heading MD | 24px | 700 | `typo-heading-md` |
| Heading SM | 20px | 700 | `typo-heading-sm` |
| Body LG | 18px | 400 | `typo-body-lg` |
| Body MD | 16px | 400 | `typo-body-md` |
| Body SM | 14px | 400 | `typo-body-sm` |
| Label XL | 18px | 600 | `typo-label-xl` |
| Label LG | 16px | 600 | `typo-label-lg` |
| Label MD | 14px | 600 | `typo-label-md` |
| Label SM | 12px | 600 | `typo-label-sm` |
| Caption | 12px | 400 | `typo-caption` |

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

Project docs:

- [`AGENTS.md`](AGENTS.md) - 프로젝트 작업 규약
- [`docs/accessibility.md`](docs/accessibility.md) - KWCAG 2.2 접근성 체크리스트
- [`docs/git-strategy.md`](docs/git-strategy.md) - 브랜치·커밋 규칙
- [`src/lib/layout-tokens.ts`](src/lib/layout-tokens.ts) - breakpoint·container·grid 반응형 헬퍼

Next.js resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
