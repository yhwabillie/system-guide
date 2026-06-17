# system-guide

디자인 토큰(컬러·타이포·오버레이)과 웹접근성 대비 체커를 제공하는 디자인 시스템 가이드입니다.

## Design Tokens

색상 토큰은 `src/app/globals.css`에서 3단계로 관리합니다.

```css
--raw-*    /* 원본 팔레트·알파 램프. 불변·모드 무관 */
--ds-*     /* Design System 토큰. 모드 인지 스케일/용도 값 */
--color-*  /* Tailwind @theme 노출용 토큰. 유틸리티 클래스 이름 */
--typography-*  /* font shorthand 묶음 토큰 */
--space-* / --shape-radius-* / --size-* / --layout-container-*  /* 레이아웃·크기 원본 토큰 */
```

흐름은 `--raw-green-500` → `--ds-green-500` → `--color-green-500` → `bg-green-500`처럼 이어집니다. `.dark`에서는 `--ds-*`만 재매핑하므로 Tailwind 유틸리티도 같은 클래스명으로 다크 모드 값을 사용합니다.

큐레이션 가이드 화면에서만 쓰는 표시/검증용 토큰은 `guide-*` 접두로 구분합니다. 예: `--color-guide-level-*`, `--text-guide-*`.

레이아웃 토큰은 source token과 Tailwind 노출 token을 분리합니다. 여백은 `--space-*` → `--spacing-*`, radius는 `--shape-radius-*` → `--radius-*`, 콘텐츠 폭은 `--layout-container-*` → `--container-*` 흐름입니다. 반복 크기인 `--size-icon-*`, `--size-control-*`는 spacing namespace에 연결해 `size-icon-md`, `h-control-md`처럼 사용할 수 있습니다. 아이콘은 `xs 16px`, `sm 20px`, `md 24px`, `lg 32px`, `xl 40px`를 기본 배리에이션으로 둡니다.

```tsx
<div className="p-6 gap-4 rounded-xl max-w-lg" />
<span className="size-icon-md" />
<button className="h-control-md px-4" />
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

Next.js resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
