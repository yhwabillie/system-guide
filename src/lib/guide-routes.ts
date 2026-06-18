/** 디자인 토큰 가이드 — 카테고리별 라우트 */
export const GUIDE_ROUTES = {
  home: "/guide/color",
  color: "/guide/color",
  type: "/guide/type",
  spacing: "/guide/spacing",
  grid: "/guide/grid",
  icons: "/guide/icons",
  responsive: "/guide/responsive",
} as const;

export type GuideCategoryId = "color" | "type" | "spacing" | "grid" | "icons";

export function guideColorTabHref(tab: "raw" | "semantic") {
  return tab === "raw" ? GUIDE_ROUTES.color : `${GUIDE_ROUTES.color}?tab=semantic`;
}

export function guideTypeTabHref(tab: "font-family" | "typography") {
  return tab === "font-family" ? GUIDE_ROUTES.type : `${GUIDE_ROUTES.type}?tab=typography`;
}

export function guideSpacingTabHref(tab: "spacing" | "radius" | "fixed-size") {
  const params = tab === "spacing" ? "" : `?tab=${tab}`;
  return `${GUIDE_ROUTES.spacing}${params}`;
}

export function guideGridTabHref(tab: "columns" | "gap") {
  return tab === "columns" ? GUIDE_ROUTES.grid : `${GUIDE_ROUTES.grid}?tab=gap`;
}

export function guideIconsTabHref(tab: "outline" | "filled") {
  return tab === "outline" ? GUIDE_ROUTES.icons : `${GUIDE_ROUTES.icons}?tab=filled`;
}

export function isGuideCategoryPath(pathname: string, category: GuideCategoryId): boolean {
  return pathname === GUIDE_ROUTES[category] || pathname.startsWith(`${GUIDE_ROUTES[category]}?`);
}
