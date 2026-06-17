import { pxToRem } from "./tokens";

export type BreakpointName = "base" | "sm" | "md" | "lg" | "xl";

/** 가이드 미리보기 grid 트랙 — px 계산값을 rem으로 출력(프로젝트 REM_BASE 기준). */
export function gridTrackColumnsRem(...tracksPx: number[]): string {
  return tracksPx.map((px) => pxToRem(px)).join(" ");
}

export const breakpointDefinitions = [
  { name: "base" as const, minPx: 0, px: "< 640px", rem: "< 40rem", prefix: "(none)", desc: "모바일 세로·좁은 화면" },
  { name: "sm" as const, minPx: 640, px: "640px", rem: "40rem", prefix: "sm:", desc: "모바일 가로·작은 태블릿" },
  { name: "md" as const, minPx: 768, px: "768px", rem: "48rem", prefix: "md:", desc: "태블릿" },
  { name: "lg" as const, minPx: 1024, px: "1024px", rem: "64rem", prefix: "lg:", desc: "데스크톱" },
  { name: "xl" as const, minPx: 1280, px: "1280px", rem: "80rem", prefix: "xl:", desc: "와이드 데스크톱" },
];

/** 가이드 표용 — base 제외 */
export const breakpointTokens = breakpointDefinitions.filter((bp) => bp.name !== "base");

export const containerTokens = [
  { name: "container-sm", cssVar: "--layout-container-sm", px: "640px", rem: "40rem", utility: "max-w-sm", minBreakpoint: "sm" as BreakpointName },
  { name: "container-md", cssVar: "--layout-container-md", px: "768px", rem: "48rem", utility: "max-w-md", minBreakpoint: "md" as BreakpointName },
  { name: "container-lg", cssVar: "--layout-container-lg", px: "1024px", rem: "64rem", utility: "max-w-lg", minBreakpoint: "lg" as BreakpointName },
  { name: "container-xl", cssVar: "--layout-container-xl", px: "1280px", rem: "80rem", utility: "max-w-xl", minBreakpoint: "lg" as BreakpointName },
];

/** lg(1024px)부터 적용. mockup 1440px 그리드 대신 1280px 상한을 1440px viewport까지 유지. */
export const containerWideMaxPx = 1280;
export const containerWideUntilPx = 1440;

export const gutterSmPx = 18;
export const gutterMdPx = 30;

export const responsiveGutterClass = "px-gutter-sm md:px-gutter-md";

export const responsiveContainerClass =
  `w-full mx-auto ${responsiveGutterClass} max-w-full sm:max-w-sm md:max-w-md lg:max-w-xl`;

/** 프로젝트 페이지 콘텐츠 영역 — container + 반응형 grid(1→2→4→8→12열). globals.css @utility layout-page */
export const layoutPageClass = "layout-page";

/** 부모가 p-6 md:p-10 일 때 자식을 viewport 가로폭으로 확장(가이드·검증용). globals.css @utility layout-bleed */
export const layoutBleedClass = "layout-bleed";

/** layout-page 자식 col-span — 열 수(1→2→4→8→12)와 동기화된 전체 폭 */
export const layoutPageColSpanFull =
  "col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-8 xl:col-span-12";

/** xl 8/12 본문 · lg 5/8 · md 이하 행 전폭 */
export const layoutPageColSpanMain =
  "col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-5 xl:col-span-8";

/** xl 4/12 보조 · lg 3/8 · md 이하 행 전폭 */
export const layoutPageColSpanAside =
  "col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-3 xl:col-span-4";

/** 사이드메뉴 프리셋 shell — lg+ menu(16rem) + content(1fr). globals.css @utility layout-sidenav */
export const layoutSidenavClass = "layout-sidenav";

/** 넓은 menu(20rem) 변형 */
export const layoutSidenavWideClass = "layout-sidenav-wide";

export const layoutSidenavMenuClass = "layout-sidenav-menu";

/** menu 옆 콘텐츠 — layout-page와 동일 container·grid·gutter */
export const layoutSidenavContentClass = "layout-sidenav-content";

export const gridGapSmPx = 16;
export const gridGapMdPx = 24;

/** breakpoint별 그리드 열 수 — 1→2→4→8→12 배율(모바일·태블릿·데스크톱 표준). */
export const gridColsBase = 1;
export const gridColsSm = 2;
export const gridColsMd = 4;
export const gridColsLg = 8;
export const gridColsXl = 12;

export const responsiveGridClass =
  "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-4 md:gap-6";

export const responsiveSidebarClass =
  "grid grid-cols-1 lg:grid-cols-sidebar gap-4";

export const responsiveCardsClass =
  "grid grid-cols-cards gap-4";

const breakpointOrder: BreakpointName[] = ["base", "sm", "md", "lg", "xl"];

export function getActiveBreakpoint(width: number): BreakpointName {
  if (width >= 1280) return "xl";
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  if (width >= 640) return "sm";
  return "base";
}

export function getResponsiveGridCols(breakpoint: BreakpointName): number {
  switch (breakpoint) {
    case "xl":
      return gridColsXl;
    case "lg":
      return gridColsLg;
    case "md":
      return gridColsMd;
    case "sm":
      return gridColsSm;
    default:
      return gridColsBase;
  }
}

/** 그리드 item 간 gap(px). md 이상 24px(gap-6), 미만 16px(gap-4). */
export function getResponsiveGridGapPx(breakpoint: BreakpointName): number {
  return breakpoint === "base" || breakpoint === "sm" ? gridGapSmPx : gridGapMdPx;
}

/** content 폭 안에서 균등 분할된 단일 col 너비(px). */
export function getGridColWidthPx(contentPx: number, cols: number, gapPx: number): number {
  if (cols <= 0) return 0;
  const totalGap = gapPx * Math.max(0, cols - 1);
  return Math.max(0, Math.round((contentPx - totalGap) / cols));
}

export function getActiveContainerToken(breakpoint: BreakpointName) {
  switch (breakpoint) {
    case "xl":
    case "lg":
      return containerTokens[3];
    case "md":
      return containerTokens[1];
    case "sm":
      return containerTokens[0];
    default:
      return { name: "full", cssVar: null, px: "100%", rem: "100%", utility: "max-w-full", minBreakpoint: "base" as BreakpointName };
  }
}

/** breakpoint에서 적용되는 container max-width(px). lg 이상은 1280px 상한. */
export function getContainerMaxPx(breakpoint: BreakpointName): number | null {
  switch (breakpoint) {
    case "xl":
    case "lg":
      return containerWideMaxPx;
    case "md":
      return 768;
    case "sm":
      return 640;
    default:
      return null;
  }
}

/** container 좌우 padding(px). 768px 미만 18px, 이상 30px. */
export function getResponsiveGutterPx(breakpoint: BreakpointName): number {
  return breakpoint === "base" || breakpoint === "sm" ? gutterSmPx : gutterMdPx;
}

export function getContainerLayoutMetrics(viewportWidth: number, breakpoint: BreakpointName) {
  const maxPx = getContainerMaxPx(breakpoint);
  const gutterPx = getResponsiveGutterPx(breakpoint);
  const containerPx = maxPx === null ? viewportWidth : Math.min(viewportWidth, maxPx);
  const sideSpace = Math.max(0, viewportWidth - containerPx);
  const marginLeftPx = Math.floor(sideSpace / 2);
  const marginRightPx = sideSpace - marginLeftPx;
  const contentPx = Math.max(0, containerPx - gutterPx * 2);
  return {
    containerPx,
    marginPx: marginLeftPx,
    marginLeftPx,
    marginRightPx,
    gutterPx,
    contentPx,
    maxPx,
  };
}

/** layout-sidenav menu 너비(px). globals --layout-grid-sidebar 16rem @ REM_BASE 16 */
export const sidenavMenuPx = 16 * 16;

export function isSidenavSidebarLayout(breakpoint: BreakpointName): boolean {
  return breakpoint === "lg" || breakpoint === "xl";
}

/** layout-sidenav 콘텐츠 열 기준 container·margin·gutter·grid 메트릭 */
export function getSidenavLayoutMetrics(viewportWidth: number, breakpoint: BreakpointName) {
  const isSidebarLayout = isSidenavSidebarLayout(breakpoint);
  const menuPx = isSidebarLayout ? sidenavMenuPx : viewportWidth;
  const contentColumnPx = isSidebarLayout
    ? Math.max(0, viewportWidth - sidenavMenuPx)
    : viewportWidth;

  const {
    containerPx,
    marginLeftPx,
    marginRightPx,
    gutterPx,
    contentPx,
  } = getContainerLayoutMetrics(contentColumnPx, breakpoint);

  const gridCols = getResponsiveGridCols(breakpoint);
  const gridGapPx = getResponsiveGridGapPx(breakpoint);
  const gridColWidthPx = getGridColWidthPx(contentPx, gridCols, gridGapPx);

  return {
    isSidebarLayout,
    menuPx,
    contentColumnPx,
    containerPx,
    marginLeftPx,
    marginRightPx,
    gutterPx,
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

export function getBreakpointIndex(name: BreakpointName): number {
  return breakpointOrder.indexOf(name);
}
