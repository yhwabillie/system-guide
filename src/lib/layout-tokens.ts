import { pxToRem } from "./tokens";

/** Tailwind 원시 breakpoint 이름(인프라 — 홈 Layout 탭 문서용) */
export type BreakpointName = "base" | "sm" | "md" | "lg" | "xl";

/** 반응형 그리드 시스템 tier(디자인 표 기준) */
export type GridTier = "small" | "medium" | "large" | "xlarge";

/** 가이드 미리보기 grid 트랙 — px 계산값을 rem으로 출력(프로젝트 REM_BASE 기준). */
export function gridTrackColumnsRem(...tracksPx: number[]): string {
  return tracksPx.map((px) => pxToRem(px)).join(" ");
}

/**
 * Tailwind 원시 breakpoint(40/48/64/80rem) — `sm:`/`md:`/`lg:`/`xl:` prefix 인프라.
 * 그리드 시스템 tier(아래 gridSystemTiers)와는 다른 레이어이며, 홈 Layout 탭 문서에서 사용.
 */
export const breakpointDefinitions = [
  { name: "base" as const, minPx: 0, px: "< 640px", rem: "< 40rem", prefix: "(none)", desc: "모바일 세로·좁은 화면" },
  { name: "sm" as const, minPx: 640, px: "640px", rem: "40rem", prefix: "sm:", desc: "모바일 가로·작은 태블릿" },
  { name: "md" as const, minPx: 768, px: "768px", rem: "48rem", prefix: "md:", desc: "태블릿" },
  { name: "lg" as const, minPx: 1024, px: "1024px", rem: "64rem", prefix: "lg:", desc: "데스크톱" },
  { name: "xl" as const, minPx: 1280, px: "1280px", rem: "80rem", prefix: "xl:", desc: "와이드 데스크톱" },
];

/** 가이드 표용 — base 제외 */
export const breakpointTokens = breakpointDefinitions.filter((bp) => bp.name !== "base");

/**
 * 반응형 그리드 시스템 tier(디자인 표).
 * - cols: 칼럼 수(적정·최대)
 * - gapPx: 가터 너비(칼럼 사이 gap)
 * - screenMarginPx: 최소 스크린 마진(content 좌우 여백 하한)
 * - prefix: 매핑되는 Tailwind 반응형 prefix. small은 prefix 없는 base에 해당.
 */
export const gridSystemTiers = [
  { name: "small" as const, minPx: 360, viewport: "360px–", prefix: "(base)", cols: 4, gapPx: 16, screenMarginPx: 16, desc: "모바일" },
  { name: "medium" as const, minPx: 768, viewport: "768px–", prefix: "md:", cols: 8, gapPx: 16, screenMarginPx: 24, desc: "태블릿" },
  { name: "large" as const, minPx: 1024, viewport: "1024px–", prefix: "lg:", cols: 12, gapPx: 24, screenMarginPx: 24, desc: "데스크톱" },
  { name: "xlarge" as const, minPx: 1280, viewport: "1280px–", prefix: "xl:", cols: 12, gapPx: 24, screenMarginPx: 24, desc: "와이드 데스크톱" },
];

export function getGridTier(width: number): GridTier {
  if (width >= 1280) return "xlarge";
  if (width >= 1024) return "large";
  if (width >= 768) return "medium";
  return "small";
}

export function getGridTierDef(tier: GridTier) {
  return gridSystemTiers.find((t) => t.name === tier) ?? gridSystemTiers[0];
}

export const containerTokens = [
  { name: "container-sm", cssVar: "--layout-container-sm", px: "640px", rem: "40rem", utility: "max-w-sm" },
  { name: "container-md", cssVar: "--layout-container-md", px: "768px", rem: "48rem", utility: "max-w-md" },
  { name: "container-lg", cssVar: "--layout-container-lg", px: "1024px", rem: "64rem", utility: "max-w-lg" },
  { name: "container-xl", cssVar: "--layout-container-xl", px: "1280px", rem: "80rem", utility: "max-w-xl" },
];

/** content 폭 상한(px) — large tier(1024px)부터 적용. container-xl(80rem)과 동기화. */
export const containerMaxPx = 1280;

/** 최소 스크린 마진(content 좌우 여백 하한, px). small 16px, medium 이상 24px. */
export const screenMarginSmPx = 16;
export const screenMarginMdPx = 24;

export const responsiveScreenMarginClass = "px-screen-margin-sm md:px-screen-margin-md";

export const responsiveContainerClass =
  `w-full mx-auto ${responsiveScreenMarginClass} max-w-full lg:max-w-xl`;

/** 프로젝트 페이지 콘텐츠 영역 — container + 반응형 grid(4→8→12→12열). globals.css @utility layout-page */
export const layoutPageClass = "layout-page";

/** 부모가 p-6 md:p-10 일 때 자식을 viewport 가로폭으로 확장(가이드·검증용). globals.css @utility layout-bleed */
export const layoutBleedClass = "layout-bleed";

/** layout-page 자식 col-span — 열 수(4→8→12)와 동기화된 전체 폭 */
export const layoutPageColSpanFull =
  "col-span-4 md:col-span-8 lg:col-span-12";

/** large 8/12 본문 · medium 이하 행 전폭 */
export const layoutPageColSpanMain =
  "col-span-4 md:col-span-8 lg:col-span-8";

/** large 4/12 보조 · medium 이하 행 전폭 */
export const layoutPageColSpanAside =
  "col-span-4 md:col-span-8 lg:col-span-4";

/** 사이드메뉴 프리셋 shell — lg+ menu(16rem) + content(1fr). globals.css @utility layout-sidenav */
export const layoutSidenavClass = "layout-sidenav";

/** 넓은 menu(20rem) 변형 */
export const layoutSidenavWideClass = "layout-sidenav-wide";

export const layoutSidenavMenuClass = "layout-sidenav-menu";

/** menu 옆 콘텐츠 — layout-page와 동일 container·grid·screen-margin */
export const layoutSidenavContentClass = "layout-sidenav-content";

export const responsiveGridClass =
  "grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4 lg:gap-6";

export function getResponsiveGridCols(tier: GridTier): number {
  return getGridTierDef(tier).cols;
}

/** 가터 너비 — 칼럼 사이 gap(px). small·medium 16px, large 이상 24px. */
export function getResponsiveGridGapPx(tier: GridTier): number {
  return getGridTierDef(tier).gapPx;
}

/** content 폭 안에서 균등 분할된 단일 col 너비(px). */
export function getGridColWidthPx(contentPx: number, cols: number, gapPx: number): number {
  if (cols <= 0) return 0;
  const totalGap = gapPx * Math.max(0, cols - 1);
  return Math.max(0, Math.round((contentPx - totalGap) / cols));
}

/** tier에서 적용되는 container max-width(px). large 이상은 1280px 상한, 미만은 viewport 전폭. */
export function getContainerMaxPx(tier: GridTier): number | null {
  return tier === "large" || tier === "xlarge" ? containerMaxPx : null;
}

export function getActiveContainerToken(tier: GridTier) {
  return tier === "large" || tier === "xlarge"
    ? containerTokens[3]
    : { name: "full", cssVar: null, px: "100%", rem: "100%", utility: "max-w-full" };
}

/** content 좌우 최소 스크린 마진(px). small 16px, medium 이상 24px. */
export function getResponsiveScreenMarginPx(tier: GridTier): number {
  return tier === "small" ? screenMarginSmPx : screenMarginMdPx;
}

/**
 * 통합 스크린 마진 모델.
 * - framePx: 콘텐츠 프레임(전체 너비) — viewport를 max 상한(large+ 1280px)까지 채우고, 그 이상은 마진으로 흡수.
 * - screenMarginPx: 좌우 스크린 마진(통합) = 최소 마진 + 프레임 바깥 centering 여백. 별도 outer margin 없음.
 * - contentPx: 칼럼 영역 = framePx - 최소 마진 × 2.
 * 합: screenMarginPx × 2 + contentPx = viewportWidth (프리뷰가 viewport를 정확히 채움).
 */
export function getContainerLayoutMetrics(viewportWidth: number, tier: GridTier) {
  const maxPx = getContainerMaxPx(tier);
  const minMarginPx = getResponsiveScreenMarginPx(tier);
  const framePx = maxPx === null ? viewportWidth : Math.min(viewportWidth, maxPx);
  const outerPx = Math.max(0, Math.round((viewportWidth - framePx) / 2));
  const screenMarginPx = minMarginPx + outerPx;
  const contentPx = Math.max(0, framePx - minMarginPx * 2);
  return {
    framePx,
    screenMarginPx,
    minMarginPx,
    contentPx,
    maxPx,
  };
}

/** layout-sidenav menu 너비(px). globals --layout-grid-sidebar 16rem @ REM_BASE 16 */
export const sidenavMenuPx = 16 * 16;

export function isSidenavSidebarLayout(tier: GridTier): boolean {
  return tier === "large" || tier === "xlarge";
}

/** layout-sidenav 콘텐츠 열 기준 container·margin·screen-margin·grid 메트릭 */
export function getSidenavLayoutMetrics(viewportWidth: number, tier: GridTier) {
  const isSidebarLayout = isSidenavSidebarLayout(tier);
  const menuPx = isSidebarLayout ? sidenavMenuPx : viewportWidth;
  const contentColumnPx = isSidebarLayout
    ? Math.max(0, viewportWidth - sidenavMenuPx)
    : viewportWidth;

  const {
    framePx,
    screenMarginPx,
    minMarginPx,
    contentPx,
  } = getContainerLayoutMetrics(contentColumnPx, tier);

  const gridCols = getResponsiveGridCols(tier);
  const gridGapPx = getResponsiveGridGapPx(tier);
  const gridColWidthPx = getGridColWidthPx(contentPx, gridCols, gridGapPx);

  return {
    isSidebarLayout,
    menuPx,
    contentColumnPx,
    framePx,
    screenMarginPx,
    minMarginPx,
    contentPx,
    gridCols,
    gridGapPx,
    gridColWidthPx,
  };
}

export function getBreakpointViewportWidth(): number {
  if (typeof window === "undefined") return 0;
  return window.innerWidth;
}

/** 픽셀 트랙·margin 계산용 — 스크롤바 제외 clientWidth. */
export function getLayoutViewportWidth(): number {
  if (typeof document === "undefined") return 0;
  return document.documentElement.clientWidth;
}
