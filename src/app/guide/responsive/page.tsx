"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { pxToRem } from "@/lib/tokens";
import { GUIDE_ROUTES } from "@/lib/guide-routes";
import {
  containerTokens,
  getActiveContainerToken,
  getBreakpointViewportWidth,
  getContainerLayoutMetrics,
  getGridColWidthPx,
  getGridTier,
  getLayoutViewportWidth,
  getResponsiveGridCols,
  getResponsiveGridGapPx,
  getSidenavLayoutMetrics,
  gridSystemTiers,
  gridTrackColumnsRem,
  layoutSidenavClass,
  layoutSidenavContentClass,
  layoutSidenavMenuClass,
  layoutPageClass,
  layoutPageColSpanAside,
  layoutPageColSpanFull,
  layoutPageColSpanMain,
  responsiveScreenMarginClass,
} from "@/lib/layout-tokens";

function LayoutPageCell({
  label,
  compact,
  className,
}: {
  label: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`surface-brand foreground-inverse flex min-w-0 items-center justify-center font-semibold ${className ?? ""}`}
      style={{ minHeight: pxToRem(48) }}
    >
      <span className="text-caption numeric-tabular leading-none">
        {label}
      </span>
    </div>
  );
}

/** 프레임 바깥 centering 여백(= screen margin − 최소 마진). viewport > 프레임일 때만 표시. */
function OuterMarginCell({ px }: { px: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col items-center justify-center min-w-0 leading-tight px-1 text-center bg-red-100 text-red-700"
    >
      <span className="text-caption numeric-tabular">
        여백
        <span className="block font-mono">{px}px</span>
      </span>
    </div>
  );
}

/** 프레임 안쪽 최소 스크린 마진(padding). 프레임 박스 내부. */
function MinMarginCell({ px }: { px: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col items-center justify-center min-w-0 leading-tight bg-violet-50/10 foreground-muted text-center"
    >
      <span className="text-caption numeric-tabular font-mono leading-none">
        {px}
      </span>
    </div>
  );
}

function MenuCell({ px, stacked }: { px: number; stacked?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`min-w-0 bg-violet-50/25 flex items-center justify-center border-brand ${
        stacked ? "border-b" : "border-r"
      }`}
      style={{ minHeight: pxToRem(48) }}
    >
      <span className="text-caption foreground-default numeric-tabular px-2 text-center">
        {stacked ? (
          <>
            menu · stack
            <span className="block font-mono">{px}px</span>
          </>
        ) : (
          <>
            menu
            <span className="block font-mono">{px}px</span>
          </>
        )}
      </span>
    </div>
  );
}

function ContentAreaGuidePreview({
  framePx,
  screenMarginPx,
  minMarginPx,
  contentPx,
  gridCols,
  gridGapPx,
  gridColWidthPx,
  contentClass,
  children,
}: {
  framePx: number;
  screenMarginPx: number;
  minMarginPx: number;
  contentPx: number;
  gridCols: number;
  gridGapPx: number;
  gridColWidthPx: number;
  contentClass: string;
  children: ReactNode;
}) {
  // 프레임 바깥 centering 여백(screen margin − 최소 마진). viewport ≤ 프레임이면 0.
  const outerPx = Math.max(0, screenMarginPx - minMarginPx);
  const outerColumns =
    outerPx > 0 ? gridTrackColumnsRem(outerPx, framePx, outerPx) : gridTrackColumnsRem(framePx);

  return (
    <div
      className="grid w-full max-w-full min-w-0 items-stretch overflow-hidden"
      style={{ gridTemplateColumns: outerColumns }}
    >
      {outerPx > 0 && <OuterMarginCell px={outerPx} />}
      {/* 콘텐츠 프레임(전체 너비, max 1280) — 실제 layout-page 박스. 내부 = 최소 마진 + 칼럼 + 최소 마진 */}
      <div
        className="relative flex min-w-0 flex-col overflow-hidden bg-background"
        style={{
          outline: `${pxToRem(2)} solid var(--ds-surface-brand)`,
          outlineOffset: pxToRem(-2),
          borderRadius: pxToRem(2),
        }}
      >
        <p className="m-0 shrink-0 py-1.5 px-2 text-caption font-semibold foreground-brand bg-violet-50/10 border-b border-violet-50/20 text-center numeric-tabular">
          프레임 {framePx}px · 칼럼 {contentPx}px · {gridCols}열 · gap {gridGapPx}px · col {gridColWidthPx}px
        </p>
        <div
          className="grid min-w-0 flex-1 items-stretch overflow-hidden"
          style={{ gridTemplateColumns: gridTrackColumnsRem(minMarginPx, contentPx, minMarginPx) }}
        >
          <MinMarginCell px={minMarginPx} />
          <div
            className={`${contentClass} min-w-0 w-full max-w-none mx-0 overflow-hidden`}
            style={{ paddingInline: 0 }}
          >
            {children}
          </div>
          <MinMarginCell px={minMarginPx} />
        </div>
      </div>
      {outerPx > 0 && <OuterMarginCell px={outerPx} />}
    </div>
  );
}

function LayoutGuidePreview({
  layoutWidth,
  framePx,
  screenMarginPx,
  minMarginPx,
  contentPx,
  gridCols,
  gridGapPx,
  gridColWidthPx,
  utility,
  contentClass = layoutPageClass,
  children,
}: {
  layoutWidth: number;
  framePx: number;
  screenMarginPx: number;
  minMarginPx: number;
  contentPx: number;
  gridCols: number;
  gridGapPx: number;
  gridColWidthPx: number;
  utility: string;
  contentClass?: string;
  children: ReactNode;
}) {
  return (
    <div className="border-y border-default overflow-hidden">
      <div
        role="img"
        aria-label={`layout ${layoutWidth}px — content frame ${framePx}px — screen margin ${screenMarginPx}px (min ${minMarginPx}px) — columns ${contentPx}px — grid ${gridCols} columns gap ${gridGapPx}px col ${gridColWidthPx}px (${utility})`}
        className="surface-subtle"
      >
        <ContentAreaGuidePreview
          framePx={framePx}
          screenMarginPx={screenMarginPx}
          minMarginPx={minMarginPx}
          contentPx={contentPx}
          gridCols={gridCols}
          gridGapPx={gridGapPx}
          gridColWidthPx={gridColWidthPx}
          contentClass={contentClass}
        >
          {children}
        </ContentAreaGuidePreview>
      </div>
      <LayoutMetricsLegend
        layoutWidth={layoutWidth}
        framePx={framePx}
        screenMarginPx={screenMarginPx}
        minMarginPx={minMarginPx}
        contentPx={contentPx}
        gridCols={gridCols}
        gridGapPx={gridGapPx}
        gridColWidthPx={gridColWidthPx}
      />
    </div>
  );
}

function LayoutSidenavGuidePreview({
  layoutWidth,
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
  utility,
  children,
}: {
  layoutWidth: number;
  isSidebarLayout: boolean;
  menuPx: number;
  contentColumnPx: number;
  framePx: number;
  screenMarginPx: number;
  minMarginPx: number;
  contentPx: number;
  gridCols: number;
  gridGapPx: number;
  gridColWidthPx: number;
  utility: string;
  children: ReactNode;
}) {
  const ariaLabel = isSidebarLayout
    ? `layout-sidenav ${layoutWidth}px — menu ${menuPx}px — content column ${contentColumnPx}px — content frame ${framePx}px — screen margin ${screenMarginPx}px (min ${minMarginPx}px) — columns ${contentPx}px — grid ${gridCols} columns gap ${gridGapPx}px col ${gridColWidthPx}px (${utility})`
    : `layout-sidenav ${layoutWidth}px — stacked — content frame ${framePx}px — screen margin ${screenMarginPx}px (min ${minMarginPx}px) — columns ${contentPx}px — grid ${gridCols} columns gap ${gridGapPx}px col ${gridColWidthPx}px (${utility})`;

  return (
    <div className="border-y border-default overflow-hidden">
      <div role="img" aria-label={ariaLabel} className="surface-subtle">
        {isSidebarLayout ? (
          <div
            className="grid w-full max-w-full items-stretch overflow-hidden"
            style={{ gridTemplateColumns: gridTrackColumnsRem(menuPx, contentColumnPx) }}
          >
            <MenuCell px={menuPx} />
            <ContentAreaGuidePreview
              framePx={framePx}
              screenMarginPx={screenMarginPx}
              minMarginPx={minMarginPx}
              contentPx={contentPx}
              gridCols={gridCols}
              gridGapPx={gridGapPx}
              gridColWidthPx={gridColWidthPx}
              contentClass={layoutSidenavContentClass}
            >
              {children}
            </ContentAreaGuidePreview>
          </div>
        ) : (
          <div className="flex flex-col">
            <MenuCell px={menuPx} stacked />
            <ContentAreaGuidePreview
              framePx={framePx}
              screenMarginPx={screenMarginPx}
              minMarginPx={minMarginPx}
              contentPx={contentPx}
              gridCols={gridCols}
              gridGapPx={gridGapPx}
              gridColWidthPx={gridColWidthPx}
              contentClass={layoutSidenavContentClass}
            >
              {children}
            </ContentAreaGuidePreview>
          </div>
        )}
      </div>
      <SidenavLayoutMetricsLegend
        layoutWidth={layoutWidth}
        isSidebarLayout={isSidebarLayout}
        menuPx={menuPx}
        contentColumnPx={contentColumnPx}
        framePx={framePx}
        screenMarginPx={screenMarginPx}
        minMarginPx={minMarginPx}
        contentPx={contentPx}
        gridCols={gridCols}
        gridGapPx={gridGapPx}
        gridColWidthPx={gridColWidthPx}
      />
    </div>
  );
}

function SidenavLayoutMetricsLegend({
  layoutWidth,
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
}: {
  layoutWidth: number;
  isSidebarLayout: boolean;
  menuPx: number;
  contentColumnPx: number;
  framePx: number;
  screenMarginPx: number;
  minMarginPx: number;
  contentPx: number;
  gridCols: number;
  gridGapPx: number;
  gridColWidthPx: number;
}) {
  return (
    <p className="m-0 py-1.5 px-3 text-caption foreground-muted surface-subtle border-t border-default flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 surface-subtle border border-default" style={{ borderRadius: pxToRem(2) }} />
        layout {layoutWidth}px
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="inline-block w-2 h-2 border border-brand bg-violet-50/25"
          style={{ borderRadius: pxToRem(2) }}
        />
        {isSidebarLayout ? `menu ${menuPx}px` : "menu · stack"}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 border border-violet-50/50 bg-violet-50/15" style={{ borderRadius: pxToRem(2) }} />
        content column {contentColumnPx}px
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 bg-background" style={{ borderRadius: pxToRem(2), outline: `${pxToRem(1)} solid var(--ds-surface-brand)`, outlineOffset: pxToRem(-1) }} />
        프레임 {framePx}px
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 bg-red-100 border border-dashed border-red-300" style={{ borderRadius: pxToRem(2) }} />
        여백(centering) {Math.max(0, screenMarginPx - minMarginPx)}px
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 bg-violet-50/10" style={{ borderRadius: pxToRem(2) }} />
        스크린 마진 {screenMarginPx}px (min {minMarginPx}px)
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 bg-background border border-violet-50/30" style={{ borderRadius: pxToRem(2) }} />
        칼럼 {contentPx}px · {gridCols}열 · gap {gridGapPx}px
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 surface-brand" style={{ borderRadius: pxToRem(2) }} />
        col {gridColWidthPx}px (fill)
      </span>
    </p>
  );
}

function LayoutMetricsLegend({
  layoutWidth,
  framePx,
  screenMarginPx,
  minMarginPx,
  contentPx,
  gridCols,
  gridGapPx,
  gridColWidthPx,
}: {
  layoutWidth: number;
  framePx: number;
  screenMarginPx: number;
  minMarginPx: number;
  contentPx: number;
  gridCols: number;
  gridGapPx: number;
  gridColWidthPx: number;
}) {
  return (
    <p className="m-0 py-1.5 px-3 text-caption foreground-muted surface-subtle border-t border-default flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 surface-subtle border border-default" style={{ borderRadius: pxToRem(2) }} />
        layout {layoutWidth}px
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 bg-background" style={{ borderRadius: pxToRem(2), outline: `${pxToRem(1)} solid var(--ds-surface-brand)`, outlineOffset: pxToRem(-1) }} />
        프레임(전체 너비) {framePx}px
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 bg-red-100 border border-dashed border-red-300" style={{ borderRadius: pxToRem(2) }} />
        여백(centering) {Math.max(0, screenMarginPx - minMarginPx)}px
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 bg-violet-50/10" style={{ borderRadius: pxToRem(2) }} />
        스크린 마진 {screenMarginPx}px (min {minMarginPx}px)
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 bg-background border border-violet-50/30" style={{ borderRadius: pxToRem(2) }} />
        칼럼 {contentPx}px · {gridCols}열 · gap {gridGapPx}px
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 surface-brand" style={{ borderRadius: pxToRem(2) }} />
        col {gridColWidthPx}px (fill)
      </span>
    </p>
  );
}

export default function ResponsiveGuidePage() {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [breakpointWidth, setBreakpointWidth] = useState(0);

  useEffect(() => {
    const update = () => {
      setLayoutWidth(getLayoutViewportWidth());
      setBreakpointWidth(getBreakpointViewportWidth());
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const tier = getGridTier(breakpointWidth || 375);
  const scrollbarPx = layoutWidth > 0 && breakpointWidth > 0 ? Math.max(0, breakpointWidth - layoutWidth) : 0;
  const activeContainer = getActiveContainerToken(tier);
  const { framePx, screenMarginPx, minMarginPx, contentPx } = getContainerLayoutMetrics(
    layoutWidth || 375,
    tier,
  );
  const gridCols = getResponsiveGridCols(tier);
  const gridGapPx = getResponsiveGridGapPx(tier);
  const gridColWidthPx = getGridColWidthPx(contentPx, gridCols, gridGapPx);
  const sidenavMetrics = getSidenavLayoutMetrics(layoutWidth || 375, tier);

  return (
    <div className={layoutPageColSpanFull}>
      <div className="p-6 md:p-10">
      <header className="mb-16">
        <p className="m-0 mb-2">
          <Link href={GUIDE_ROUTES.color} className="text-body-sm foreground-brand no-underline hover:underline">
            ← Design Token Preview
          </Link>
        </p>
        <h1 className="text-display-sm font-bold m-0">Responsive Layout Guide</h1>
        <p className="mt-2 mb-0 text-body-sm foreground-muted">
          브라우저 창 크기를 조절해 tier별 칼럼 수·가터(gap)·스크린 마진 변화를 확인하세요.
        </p>
      </header>

      {/* Live status */}
      <section aria-labelledby="live-status" className="mb-20 p-5 rounded-xl border border-default surface-subtle">
        <h2 id="live-status" className="text-heading-md font-bold m-0 mb-4">현재 viewport</h2>
        <dl className="grid gap-4 m-0 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-caption foreground-muted font-semibold">Layout width <span className="font-normal">(스크롤바 제외 · 실측)</span></dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">
              {layoutWidth || "—"}px
              {scrollbarPx > 0 && (
                <span className="ml-2 text-caption font-normal foreground-muted">스크롤바 −{scrollbarPx}px</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-caption foreground-muted font-semibold">Breakpoint width <span className="font-normal">(스크롤바 포함 · tier 판정)</span></dt>
            <dd className="m-0 mt-1 text-label-md font-semibold numeric-tabular">{breakpointWidth || "—"}px</dd>
          </div>
          <div>
            <dt className="text-caption foreground-muted font-semibold">Active tier</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold">{tier}</dd>
          </div>
          <div>
            <dt className="text-caption foreground-muted font-semibold">Container utility</dt>
            <dd className="m-0 mt-1 text-label-md font-semibold font-mono">{activeContainer.utility}</dd>
          </div>
          <div>
            <dt className="text-caption foreground-muted font-semibold">칼럼 수</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{gridCols}열</dd>
          </div>
          <div>
            <dt className="text-caption foreground-muted font-semibold">가터 너비 (gap)</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{gridGapPx}px</dd>
          </div>
        </dl>
        <dl className="grid gap-4 m-0 mt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-caption foreground-muted font-semibold">콘텐츠 프레임 (전체 너비)</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{framePx}px</dd>
          </div>
          <div>
            <dt className="text-caption foreground-muted font-semibold">스크린 마진 (좌우 · 통합)</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{screenMarginPx}px</dd>
          </div>
          <div>
            <dt className="text-caption foreground-muted font-semibold">최소 스크린 마진</dt>
            <dd className="m-0 mt-1 text-label-md font-semibold font-mono">{minMarginPx}px · {responsiveScreenMarginClass}</dd>
          </div>
          <div>
            <dt className="text-caption foreground-muted font-semibold">칼럼 영역</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{contentPx}px</dd>
          </div>
          <div>
            <dt className="text-caption foreground-muted font-semibold">Col width</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{gridColWidthPx}px</dd>
          </div>
        </dl>

        <div className="mt-6">
          <p className="m-0 mb-2 text-caption foreground-muted">Grid tier scale</p>
          <div role="list" className="flex flex-wrap gap-2">
            {gridSystemTiers.map((t) => {
              const isActive = t.name === tier;
              return (
                <div
                  key={t.name}
                  role="listitem"
                  className={`py-1.5 px-3 rounded-md border text-caption font-semibold ${
                    isActive
                      ? "surface-brand foreground-inverse border-brand"
                      : "bg-background foreground-muted border-default"
                  }`}
                >
                  {t.name}
                  <span className="ml-1.5 font-normal font-mono">{t.viewport}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      </div>{/* /guide prose padding */}

      {/* viewport 전폭 — main padding 없이 layout-page·미리보기 검증 */}
      <section aria-labelledby="layout-page-demo" className="mb-20">
        <div className="px-6 md:px-10">
          <h2 id="layout-page-demo" className="text-heading-md font-bold mb-4">layout-page — 반응형 페이지 레이아웃</h2>
          <p className="text-body-sm foreground-muted mb-4">
            가이드 미리보기(아래) 가운데 테두리 박스가 실제 <strong>콘텐츠 프레임</strong>(<code className="font-mono text-caption">{layoutPageClass}</code> 박스, large+에서 1280px 고정)입니다. 프레임 안쪽 = <strong>최소 스크린 마진</strong>(16/24px) + <strong>칼럼 영역</strong>. 프레임이 max에 닿은 뒤 남는 폭은 바깥 <strong>여백(centering)</strong>(붉은색)으로 흡수됩니다. 좌우 스크린 마진(통합) = 최소 마진 + 바깥 여백. 칼럼 수·가터(gap)는 tier 표를 따릅니다.
          </p>
          <p className="m-0 mb-3 inline-flex items-center gap-2 text-caption font-semibold foreground-brand">
            <span aria-hidden="true" className="inline-block w-2 h-2 surface-brand" style={{ borderRadius: pxToRem(2) }} />
            레이아웃 프리뷰
          </p>
        </div>

        {layoutWidth > 0 && (
          <LayoutGuidePreview
            layoutWidth={layoutWidth}
            framePx={framePx}
            screenMarginPx={screenMarginPx}
            minMarginPx={minMarginPx}
            contentPx={contentPx}
            gridCols={gridCols}
            gridGapPx={gridGapPx}
            gridColWidthPx={gridColWidthPx}
            utility={activeContainer.utility}
          >
            {Array.from({ length: gridCols }, (_, i) => (
              <LayoutPageCell
                key={i}
                label={gridCols > 6 ? String(i + 1) : `col ${i + 1}`}
                compact={gridCols > 6}
              />
            ))}
          </LayoutGuidePreview>
        )}

        <div className="px-6 md:px-10">
          <div className="mt-8">
            <h3 className="text-label-xl font-semibold mb-2">프로젝트 적용 예시</h3>
            <p className="text-body-sm foreground-muted mb-3">
              <code className="font-mono text-caption">{layoutPageClass}</code>만 부모에 적용합니다. 아래 셀 스타일은 가이드 표시용이며, 실제 콘텐츠 마크업·스타일은 프로젝트에서 자유롭게 구성합니다.
            </p>
          </div>
        </div>

        <div className={layoutPageClass}>
          {Array.from({ length: gridCols }, (_, i) => (
            <LayoutPageCell
              key={i}
              label={gridCols > 6 ? String(i + 1) : `col ${i + 1}`}
              compact={gridCols > 6}
            />
          ))}
        </div>

        <div className="px-6 md:px-10 mt-10">
          <h3 id="col-span-demo" className="text-label-xl font-semibold mb-2">col-span 영역 구성</h3>
          <p className="text-body-sm foreground-muted mb-3">
            <code className="font-mono text-caption">layout-page</code> 열 수는 tier마다 4→8→12→12로 변합니다.
            <code className="font-mono text-caption"> col-span-*</code>도 같은 비율로 맞춰야 합니다. 전체 폭·8+4 분할은 아래 권장 조합을 사용하세요.
          </p>
          <ul className="m-0 mb-4 pl-5 flex flex-col gap-1 text-caption foreground-muted font-mono">
            <li>전체 폭: {layoutPageColSpanFull}</li>
            <li>본문 8/12: {layoutPageColSpanMain}</li>
            <li>보조 4/12: {layoutPageColSpanAside}</li>
          </ul>
        </div>

        <div className={layoutPageClass}>
          <LayoutPageCell label="header · full" className={layoutPageColSpanFull} />
          <LayoutPageCell label="main · 8/12" className={layoutPageColSpanMain} />
          <LayoutPageCell label="aside · 4/12" className={layoutPageColSpanAside} />
        </div>
      </section>

      {/* viewport 전폭 — layout-sidenav 실제 화면 검증 */}
      <section aria-labelledby="layout-sidenav-demo" className="mb-20">
        <div className="px-6 md:px-10">
          <h2 id="layout-sidenav-demo" className="text-heading-md font-bold mb-4">layout-sidenav — 사이드메뉴 + layout-page 콘텐츠</h2>
          <p className="text-body-sm foreground-muted mb-4">
            가이드 미리보기(아래)는 <code className="font-mono text-caption">{layoutSidenavClass}</code>·<code className="font-mono text-caption">{layoutSidenavContentClass}</code>에 menu + [스크린 마진 · 칼럼 영역 · 스크린 마진]을 겹쳐 표시합니다. large(1024px) tier 이상은 16rem menu + 콘텐츠 열, 미만은 1열 스택입니다.
          </p>
        </div>

        {layoutWidth > 0 && (
          <LayoutSidenavGuidePreview
            layoutWidth={layoutWidth}
            isSidebarLayout={sidenavMetrics.isSidebarLayout}
            menuPx={sidenavMetrics.menuPx}
            contentColumnPx={sidenavMetrics.contentColumnPx}
            framePx={sidenavMetrics.framePx}
            screenMarginPx={sidenavMetrics.screenMarginPx}
            minMarginPx={sidenavMetrics.minMarginPx}
            contentPx={sidenavMetrics.contentPx}
            gridCols={sidenavMetrics.gridCols}
            gridGapPx={sidenavMetrics.gridGapPx}
            gridColWidthPx={sidenavMetrics.gridColWidthPx}
            utility={activeContainer.utility}
          >
            {Array.from({ length: sidenavMetrics.gridCols }, (_, i) => (
              <LayoutPageCell
                key={i}
                label={sidenavMetrics.gridCols > 6 ? String(i + 1) : `col ${i + 1}`}
                compact={sidenavMetrics.gridCols > 6}
              />
            ))}
          </LayoutSidenavGuidePreview>
        )}

        <div className="px-6 md:px-10">
          <div className="mt-8">
            <h3 className="text-label-xl font-semibold mb-2">프로젝트 적용 예시</h3>
            <p className="text-body-sm foreground-muted mb-3">
              <code className="font-mono text-caption">{layoutSidenavClass}</code> + <code className="font-mono text-caption">{layoutSidenavMenuClass}</code> + <code className="font-mono text-caption">{layoutSidenavContentClass}</code> 조합입니다. 아래 셀 스타일은 가이드 표시용이며, 실제 콘텐츠 마크업·스타일은 프로젝트에서 자유롭게 구성합니다.
            </p>
          </div>
        </div>

        <div className={layoutSidenavClass}>
          <aside
            className={`${layoutSidenavMenuClass} bg-violet-50/25 border-b lg:border-b-0 lg:border-r border-brand flex items-center justify-center`}
            style={{ minHeight: pxToRem(48) }}
          >
            <span className="text-caption font-semibold foreground-default numeric-tabular">menu</span>
          </aside>
          <main className={layoutSidenavContentClass}>
            {Array.from({ length: sidenavMetrics.gridCols }, (_, i) => (
              <LayoutPageCell
                key={i}
                label={sidenavMetrics.gridCols > 6 ? String(i + 1) : `col ${i + 1}`}
                compact={sidenavMetrics.gridCols > 6}
              />
            ))}
          </main>
        </div>

        <div className="px-6 md:px-10 mt-10">
          <h3 id="sidenav-col-span-demo" className="text-label-xl font-semibold mb-2">col-span 영역 구성</h3>
          <p className="text-body-sm foreground-muted mb-3">
            <code className="font-mono text-caption">{layoutSidenavContentClass}</code> 열 수는 tier마다 4→8→12→12로 변합니다.
            <code className="font-mono text-caption"> col-span-*</code>도 같은 비율로 맞춰야 합니다.
          </p>
          <ul className="m-0 mb-4 pl-5 flex flex-col gap-1 text-caption foreground-muted font-mono">
            <li>전체 폭: {layoutPageColSpanFull}</li>
            <li>본문 8/12: {layoutPageColSpanMain}</li>
            <li>보조 4/12: {layoutPageColSpanAside}</li>
          </ul>
        </div>

        <div className={layoutSidenavClass}>
          <aside
            className={`${layoutSidenavMenuClass} bg-violet-50/25 border-b lg:border-b-0 lg:border-r border-brand flex items-center justify-center`}
            style={{ minHeight: pxToRem(48) }}
          >
            <span className="text-caption font-semibold foreground-default numeric-tabular">menu</span>
          </aside>
          <main className={layoutSidenavContentClass}>
            <LayoutPageCell label="content · full" className={layoutPageColSpanFull} />
            <LayoutPageCell label="main · 8/12" className={layoutPageColSpanMain} />
            <LayoutPageCell label="aside · 4/12" className={layoutPageColSpanAside} />
          </main>
        </div>
      </section>

      <div className="p-6 md:p-10">
      {/* Reference table */}
      <section aria-labelledby="breakpoint-table">
        <h2 id="breakpoint-table" className="text-heading-md font-bold mb-4">Grid tier reference</h2>
        <div className="overflow-x-auto rounded-xl border border-default">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="surface-subtle border-b border-default">
                <th scope="col" className="py-3 px-4 text-caption font-semibold foreground-muted">name</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold foreground-muted">Viewport</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold foreground-muted">Prefix</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold foreground-muted">칼럼 수</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold foreground-muted">가터 너비 (gap)</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold foreground-muted">최소 스크린 마진</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold foreground-muted">Sidebar</th>
              </tr>
            </thead>
            <tbody>
              {gridSystemTiers.map((t) => {
                const isActive = t.name === tier;
                const sidebar = t.name === "large" || t.name === "xlarge";
                return (
                  <tr
                    key={t.name}
                    className={`border-b border-default ${isActive ? "bg-violet-50/10" : ""}`}
                  >
                    <td className="py-3 px-4 text-label-sm font-semibold">
                      {t.name}
                      {isActive && <span className="ml-2 text-caption foreground-brand">● active</span>}
                    </td>
                    <td className="py-3 px-4 text-caption font-mono numeric-tabular">{t.viewport}</td>
                    <td className="py-3 px-4 text-caption font-mono">{t.prefix}</td>
                    <td className="py-3 px-4 text-caption numeric-tabular">{t.cols}열</td>
                    <td className="py-3 px-4 text-caption numeric-tabular">{t.gapPx}px</td>
                    <td className="py-3 px-4 text-caption numeric-tabular">{t.screenMarginPx}px</td>
                    <td className="py-3 px-4 text-caption">{sidebar ? "2열" : "1열 스택"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <h3 className="text-label-xl font-semibold mb-2">Container tokens</h3>
          <ul className="m-0 pl-5 flex flex-col gap-1">
            {containerTokens.map(({ name, px, rem, utility }) => (
              <li key={name} className="text-caption foreground-muted font-mono">
                {name} · {px} · {rem} · {utility}
              </li>
            ))}
          </ul>
        </div>
      </section>
      </div>{/* /guide prose padding */}
    </div>
  );
}
