# system-guide

디자인 토큰(컬러·타이포·오버레이)과 웹접근성 대비 체커를 제공하는 디자인 시스템 가이드입니다.

## Design Tokens

색상 토큰은 `src/app/globals.css`에서 3단계로 관리합니다.

```css
--raw-*    /* 원본 팔레트·알파 램프. 불변·모드 무관 */
--ds-*     /* Design System 토큰. 모드 인지 스케일/용도 값 */
--color-*  /* Tailwind @theme 노출용 토큰. 유틸리티 클래스 이름 */
```

흐름은 `--raw-green-500` → `--ds-green-500` → `--color-green-500` → `bg-green-500`처럼 이어집니다. `.dark`에서는 `--ds-*`만 재매핑하므로 Tailwind 유틸리티도 같은 클래스명으로 다크 모드 값을 사용합니다.

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
