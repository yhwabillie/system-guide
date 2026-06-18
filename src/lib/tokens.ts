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

/**
 * px → rem 변환. 작업자는 px로 작성(코드에서 크기 인지), 출력은 rem(반응형/접근성).
 * @example pxToRem(14) // "0.875rem" (= 14px)
 */
export function pxToRem(px: number, base: number = REM_BASE): string {
  return `${+(px / base).toFixed(5)}rem`;
}

/** Font size 스케일(px) — 원본 단일 정의 */
export const fontSizePx = {
  "display-lg": 40,
  "display-md": 32,
  "display-sm": 28,
  "heading-lg": 32,
  "heading-md": 24,
  "heading-sm": 20,
  "body-lg": 18,
  "body-md": 16,
  "body-sm": 14,
  "label-xl": 18,
  "label-lg": 16,
  "label-md": 14,
  "label-sm": 12,
  "caption": 12,
  "guide-selected-lg": 18,
  "guide-selected-md": 16,
  "guide-selected-sm": 14,
  /** 가이드 콘텐츠 상위 타이틀(ContentTitleBlock h2) — ~60px */
  "guide-content-title": 60,
} as const;

/**
 * fontSizePx 로부터 `:root` 에 주입할 `--font-size-*` 선언 문자열을 생성(rem 환산).
 * layout.tsx 의 <style> 로 SSR 주입 → CSS·JS가 같은 px 정의를 공유.
 */
export function fontSizeCssVars(): string {
  return Object.entries(fontSizePx)
    .map(([name, px]) => `--font-size-${name}:${pxToRem(px)}`)
    .join(";");
}
