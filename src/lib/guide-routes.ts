/** 디자인 토큰 가이드 — 카테고리별 라우트 */
export const GUIDE_ROUTES = {
  /** 루트 리다이렉트 엔트리 — 사이드 nav 서브탭 URL과 href 중복 방지 */
  home: "/",
  color: "/guide/color",
  type: "/guide/type",
  spacing: "/guide/spacing",
  grid: "/guide/grid",
  icons: "/guide/icons",
  responsive: "/guide/responsive",
  keyboard: "/guide/keyboard",
} as const;

export type GuideCategoryId = "color" | "type" | "spacing" | "grid" | "responsive" | "icons";

export function guideColorTabHref(tab: "contrast" | "raw" | "semantic") {
  if (tab === "contrast") return GUIDE_ROUTES.color;
  return `${GUIDE_ROUTES.color}?tab=${tab}`;
}

export function guideTypeTabHref(tab: "font-family" | "typography") {
  return tab === "font-family" ? GUIDE_ROUTES.type : `${GUIDE_ROUTES.type}?tab=typography`;
}

export function guideSpacingTabHref(tab: "spacing" | "radius" | "fixed-size") {
  const params = tab === "spacing" ? "" : `?tab=${tab}`;
  return `${GUIDE_ROUTES.spacing}${params}`;
}

export function guideLayoutTabHref(tab: "columns" | "rows") {
  return tab === "columns" ? GUIDE_ROUTES.grid : `${GUIDE_ROUTES.grid}?tab=rows`;
}

export function guideIconsTabHref(tab: "outline" | "filled") {
  return tab === "outline" ? GUIDE_ROUTES.icons : `${GUIDE_ROUTES.icons}?tab=filled`;
}

export function isGuideCategoryPath(pathname: string, category: GuideCategoryId): boolean {
  return pathname === GUIDE_ROUTES[category] || pathname.startsWith(`${GUIDE_ROUTES[category]}?`) || pathname.startsWith(`${GUIDE_ROUTES[category]}/`);
}
