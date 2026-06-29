/**
 * 디자인 토큰 단일 소스(Single Source of Truth).
 *
 * 크기는 여기서 **px 숫자로 단 한 번** 정의하고,
 * - 컴포넌트 인라인 스타일 → `pxToRem()`
 * - CSS 커스텀 프로퍼티(`--font-size-*`) → `fontSizeCssVars()`로 생성(layout에서 주입)
 * 둘 다 이 파일의 px 정의 + 동일 기준(REM_BASE)에서 파생됩니다.
 *
 * 기준 1rem = 16px (브라우저 기본값).
 */
export const REM_BASE = 16;

/** Line height 단일 값 — CSS `--font-line` 과 동기화 (WCAG 1.4.12) */
export const FONT_LINE = 1.5;

/**
 * px → rem 변환. 작업자는 px로 작성(코드에서 크기 인지), 출력은 rem(반응형/접근성).
 * @example pxToRem(14) // "0.875rem" (= 14px)
 */
export function pxToRem(px: number, base: number = REM_BASE): string {
  return `${+(px / base).toFixed(5)}rem`;
}

/** Font size 스케일(px) — small/mobile base 원본 정의 */
export const fontSizePx = {
  "heading-xlarge": 28,
  "heading-large": 24,
  "heading-medium": 22,
  "heading-small": 19,
  "heading-xsmall": 17,
  "heading-xxsmall": 15,
  "body-large": 19,
  "body-medium": 17,
  "body-small": 15,
  "body-xsmall": 13,
  "label-large": 19,
  "label-medium": 17,
  "label-small": 15,
  "label-xsmall": 13,
  /** Display — 페이지 대표 제목(heading 과 별개 최상위 계층) */
  "display-lg": 32,
  "display-md": 28,
  "display-sm": 24,
  /** Caption — 최소 텍스트(메타·보조 수치) */
  "caption": 12,
  "guide-selected-lg": 18,
  "guide-selected-md": 16,
  "guide-selected-sm": 14,
  /** 가이드 콘텐츠 상위 타이틀(ContentTitleBlock h2) — small/base */
  "guide-content-title": 40,
  /** 가이드 서브탭 타이틀(ContentOutlineTabList) */
  "guide-tab-title": 22,
} as const;

export type FontSizeTokenName = keyof typeof fontSizePx;
export type ResponsiveFontSizeTier = "md" | "lg";

/**
 * 반응형 타이포 값(px).
 * 토큰 이름은 유지하고 큰 제목 계층만 breakpoint별 값으로 재매핑한다.
 */
export const responsiveFontSizePx: Partial<Record<ResponsiveFontSizeTier, Partial<Record<FontSizeTokenName, number>>>> = {
  md: {
    "display-lg": 36,
    "display-md": 30,
    "display-sm": 26,
    "guide-content-title": 52,
  },
  lg: {
    "heading-xlarge": 40,
    "heading-large": 32,
    "heading-medium": 24,
    "display-lg": 40,
    "display-md": 32,
    "display-sm": 28,
    "guide-content-title": 60,
  },
};

const responsiveFontSizeMediaQuery: Record<ResponsiveFontSizeTier, string> = {
  md: "(min-width: 48rem)", // 768px
  lg: "(min-width: 64rem)", // 1024px
};

function fontSizeDeclarations(values: Partial<Record<FontSizeTokenName, number>>): string {
  return Object.entries(values)
    .map(([name, px]) => `--font-size-${name}:${pxToRem(px)}`)
    .join(";");
}

/**
 * fontSizePx·FONT_LINE 로부터 `:root` 에 주입할 `--font-size-*`·`--font-line` 선언 문자열을 생성(rem 환산).
 * layout.tsx 의 <style> 로 SSR 주입 → CSS·JS가 같은 정의를 공유.
 */
export function fontSizeCssVars(): string {
  const root = `:root{${fontSizeDeclarations(fontSizePx)};--font-line:${FONT_LINE}}`;
  const responsive = (Object.entries(responsiveFontSizePx) as [ResponsiveFontSizeTier, Partial<Record<FontSizeTokenName, number>>][])
    .map(([tier, values]) => `@media ${responsiveFontSizeMediaQuery[tier]}{:root{${fontSizeDeclarations(values)}}}`)
    .join("");

  return `${root}${responsive}`;
}
