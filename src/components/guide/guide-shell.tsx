"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import {
  GUIDE_ROUTES,
  guideColorTabHref,
  guideGridTabHref,
  guideIconsTabHref,
  guideSpacingTabHref,
  guideTypeTabHref,
  isGuideCategoryPath,
} from "@/lib/guide-routes";
import { layoutSidenavContentClass, layoutSidenavMenuClass } from "@/lib/layout-tokens";
import { useGuideTheme } from "@/components/guide/guide-theme-provider";
import {
  ExternalLinkIcon,
  GuideSiteHeader,
  GUIDE_SCROLL_TOP_THRESHOLD,
  guideFabAccentClass,
  guideFabSurfaceClass,
  guideHeaderMaxHeightClass,
  guideHeaderOffsetClass,
  NavIcon,
  navIconAssets,
  navIconColor,
  navIconGrid,
  navIconLayout,
  navIconSpacing,
  navIconType,
  scrollToTopIcon,
  themeIconMoon,
  themeIconSun,
} from "@/components/guide/shared";

const navSectionEyebrowClass =
  "mb-2 px-3.5 text-caption font-semibold uppercase tracking-normal text-gray-60";

const navExpandToggleClass =
  "mr-1.5 flex shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1.5 text-gray-60 transition-colors duration-150 hover:bg-gray-10 hover:foreground-primary";

const navExternalLinkClass =
  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-label-md font-semibold foreground-primary no-underline transition-colors duration-150 hover:bg-gray-10";

const navSubItemClass = (active: boolean) =>
  [
    "flex w-full items-center justify-between gap-2 text-left rounded-lg font-sans text-label-sm leading-base no-underline",
    "py-2 px-3 transition-colors duration-150",
    active
      ? "surface-brand foreground-brand font-semibold"
      : "bg-transparent text-gray-60 font-medium hover:bg-gray-5 hover:foreground-primary",
  ].join(" ");

const navParentGroupClass = (active: boolean) =>
  ["flex items-center rounded-xl", active ? "bg-gray-5" : "bg-transparent"].join(" ");

const navParentLinkClass = (active: boolean) =>
  [
    "flex min-w-0 flex-1 items-center gap-3 text-left font-sans text-label-md leading-base no-underline",
    "py-2.5 pl-3.5 pr-1 transition-colors duration-150",
    active ? "font-semibold foreground-primary" : "font-medium text-gray-60 hover:foreground-primary",
  ].join(" ");

function GuideNavSubLinks({
  listId,
  labelledBy,
  items,
}: {
  listId: string;
  labelledBy: string;
  items: { label: string; href: string; active: boolean }[];
}) {
  return (
    <ul
      id={listId}
      aria-labelledby={labelledBy}
      className="m-0 ml-5 flex list-none flex-col gap-0.5 border-l border-line py-1 pl-4 pr-1"
    >
      {items.map((item) => (
        <li key={item.href} className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-4 top-1/2 h-px w-4 -translate-y-1/2 bg-line"
          />
          <Link
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={navSubItemClass(item.active)}
          >
            <span>{item.label}</span>
            {item.active ? (
              <NavIcon className="size-icon-xs shrink-0 foreground-brand">
                <path d="M9 6l6 6-6 6" />
              </NavIcon>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function GuideNavCategory({
  active,
  expanded,
  onToggleExpand,
  icon,
  label,
  expandLabel,
  subItems,
}: {
  active: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  icon: ReactNode;
  label: string;
  expandLabel: string;
  subItems: { label: string; href: string; active: boolean }[];
}) {
  const labelId = useId();
  const listId = useId();

  return (
    <div className="flex flex-col gap-0.5">
      <div className={navParentGroupClass(active)}>
        <span id={labelId} className={navParentLinkClass(active)}>
          {icon}
          {label}
        </span>
        <button
          type="button"
          aria-label={expanded ? `${expandLabel} 하위 메뉴 접기` : `${expandLabel} 하위 메뉴 펼치기`}
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={onToggleExpand}
          className={navExpandToggleClass}
        >
          <NavIcon
            className={`size-icon-xs shrink-0 transition-transform duration-200 ease-out ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </NavIcon>
        </button>
      </div>
      {expanded ? <GuideNavSubLinks listId={listId} labelledBy={labelId} items={subItems} /> : null}
    </div>
  );
}

export function GuideShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isDark, toggleDark } = useGuideTheme();
  const [isSidenavOpen, setIsSidenavOpen] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [colorMenuExpanded, setColorMenuExpanded] = useState(true);
  const [typeMenuExpanded, setTypeMenuExpanded] = useState(true);
  const [spacingMenuExpanded, setSpacingMenuExpanded] = useState(true);
  const [gridMenuExpanded, setGridMenuExpanded] = useState(true);
  const [iconsMenuExpanded, setIconsMenuExpanded] = useState(true);

  const tab = searchParams.get("tab");

  const isColor = isGuideCategoryPath(pathname, "color");
  const isType = isGuideCategoryPath(pathname, "type");
  const isSpacing = isGuideCategoryPath(pathname, "spacing");
  const isGrid = isGuideCategoryPath(pathname, "grid");
  const isIcons = isGuideCategoryPath(pathname, "icons");

  useEffect(() => {
    if (isColor) setColorMenuExpanded(true);
    if (isType) setTypeMenuExpanded(true);
    if (isSpacing) setSpacingMenuExpanded(true);
    if (isGrid) setGridMenuExpanded(true);
    if (isIcons) setIconsMenuExpanded(true);
  }, [isColor, isType, isSpacing, isGrid, isIcons]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > GUIDE_SCROLL_TOP_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToPageTop() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  return (
    <>
      <a
        href="#main-content"
        className="absolute left-0 z-[100] px-4 py-2 font-semibold no-underline transition-[top] duration-100 bg-accent text-on-accent"
        style={{ top: "-40px" }}
        onFocus={(e) => {
          e.currentTarget.style.top = "0";
        }}
        onBlur={(e) => {
          e.currentTarget.style.top = "-40px";
        }}
      >
        본문 바로가기
      </a>

      <div className="min-h-screen font-sans surface-background foreground-primary transition-colors duration-300">
        <GuideSiteHeader
          isSidenavOpen={isSidenavOpen}
          onToggleSidenav={() => setIsSidenavOpen((open) => !open)}
        />

        <div className={isSidenavOpen ? "lg:pl-64" : undefined}>
          <nav
            id="guide-sidenav"
            hidden={!isSidenavOpen}
            aria-label="디자인 토큰 가이드"
            className={`${layoutSidenavMenuClass} flex flex-col border-b border-line surface-background py-6 px-4 md:px-6 lg:fixed lg:bottom-0 lg:left-0 lg:z-30 lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:py-10 ${guideHeaderOffsetClass} ${guideHeaderMaxHeightClass}`}
          >
            <p className={navSectionEyebrowClass}>Tokens</p>
            <div className="flex flex-col gap-0.5">
              <GuideNavCategory
                active={isColor}
                expanded={colorMenuExpanded}
                onToggleExpand={() => setColorMenuExpanded((open) => !open)}
                icon={navIconColor}
                label="Color"
                expandLabel="Color"
                subItems={[
                  { label: "Raw Color", href: guideColorTabHref("raw"), active: isColor && tab !== "semantic" },
                  { label: "Semantic Color", href: guideColorTabHref("semantic"), active: isColor && tab === "semantic" },
                ]}
              />
              <GuideNavCategory
                active={isType}
                expanded={typeMenuExpanded}
                onToggleExpand={() => setTypeMenuExpanded((open) => !open)}
                icon={navIconType}
                label="Font & Type"
                expandLabel="Font & Type"
                subItems={[
                  { label: "Font Family", href: guideTypeTabHref("font-family"), active: isType && tab !== "typography" },
                  { label: "Type Scale", href: guideTypeTabHref("typography"), active: isType && tab === "typography" },
                ]}
              />
              <GuideNavCategory
                active={isSpacing}
                expanded={spacingMenuExpanded}
                onToggleExpand={() => setSpacingMenuExpanded((open) => !open)}
                icon={navIconSpacing}
                label="Spacing & Size"
                expandLabel="Spacing & Size"
                subItems={[
                  { label: "Spacing", href: guideSpacingTabHref("spacing"), active: isSpacing && (!tab || tab === "spacing") },
                  { label: "Radius", href: guideSpacingTabHref("radius"), active: isSpacing && tab === "radius" },
                  { label: "Fixed Size", href: guideSpacingTabHref("fixed-size"), active: isSpacing && tab === "fixed-size" },
                ]}
              />
              <GuideNavCategory
                active={isGrid}
                expanded={gridMenuExpanded}
                onToggleExpand={() => setGridMenuExpanded((open) => !open)}
                icon={navIconGrid}
                label="Grid"
                expandLabel="Grid"
                subItems={[
                  { label: "Columns", href: guideGridTabHref("columns"), active: isGrid && tab !== "gap" },
                  { label: "Gap", href: guideGridTabHref("gap"), active: isGrid && tab === "gap" },
                ]}
              />
            </div>

            <div className="mt-5 border-t border-line pt-5">
              <p className={navSectionEyebrowClass}>Assets</p>
              <GuideNavCategory
                active={isIcons}
                expanded={iconsMenuExpanded}
                onToggleExpand={() => setIconsMenuExpanded((open) => !open)}
                icon={navIconAssets}
                label="Icons"
                expandLabel="Icons"
                subItems={[
                  { label: "Outline", href: guideIconsTabHref("outline"), active: isIcons && tab !== "filled" },
                  { label: "Filled", href: guideIconsTabHref("filled"), active: isIcons && tab === "filled" },
                ]}
              />
            </div>

            <div className="mt-5 border-t border-line pt-5">
              <p className={navSectionEyebrowClass}>Layout</p>
              <Link id="nav-layout-breakpoint" href={GUIDE_ROUTES.responsive} className={navExternalLinkClass}>
                {navIconLayout}
                Layout & Breakpoint
                <ExternalLinkIcon className="ml-auto size-icon-xs shrink-0" />
              </Link>
            </div>
          </nav>

          <main
            id="main-content"
            className={`${layoutSidenavContentClass} pt-10 pb-6 md:pt-12 md:pb-8 lg:pt-16 lg:pb-10`}
          >
            {children}
          </main>
        </div>

        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
          {showScrollTop ? (
            <button
              type="button"
              onClick={scrollToPageTop}
              aria-label="맨 위로 스크롤"
              className={guideFabSurfaceClass}
            >
              {scrollToTopIcon}
            </button>
          ) : null}
          <button
            type="button"
            onClick={toggleDark}
            aria-pressed={isDark}
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className={guideFabAccentClass}
          >
            {isDark ? themeIconSun : themeIconMoon}
          </button>
        </div>
      </div>
    </>
  );
}
