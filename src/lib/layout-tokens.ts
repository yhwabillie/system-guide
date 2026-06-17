export type BreakpointName = "base" | "sm" | "md" | "lg" | "xl";

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

export const responsiveGridClass =
  "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

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
    case "lg":
      return 4;
    case "md":
      return 3;
    case "sm":
      return 2;
    default:
      return 1;
  }
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

export function getBreakpointIndex(name: BreakpointName): number {
  return breakpointOrder.indexOf(name);
}
