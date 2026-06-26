"use client";

import { useEffect, useState, type ReactNode } from "react";
import { pxToRem } from "@/lib/tokens";
import { CodeBlock } from "@/components/guide/shared";
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
      <span className={["text-caption numeric-tabular leading-none", compact ? "font-medium" : "font-semibold"].join(" ")}>
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
      className="flex flex-col items-center justify-center min-w-0 leading-tight px-1 text-center surface-negative text-red-70"
    >
      <span className="text-caption numeric-tabular">
        센터링 여백
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
      className="flex flex-col items-center justify-center min-w-0 leading-tight bg-violet-50/10 text-gray-60 text-center"
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
      className="min-w-0 bg-violet-50/25 flex items-center justify-center"
      style={{
        minHeight: pxToRem(48),
        [stacked ? "borderBottom" : "borderRight"]: `${pxToRem(2)} solid var(--ds-surface-brand)`,
      }}
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
    <div className="overflow-hidden">
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
    <div className="overflow-hidden">
      <div className="flex items-center justify-center bg-violet-50/10" style={{ height: "var(--layout-header-height)" }}>
        <span className="text-label-small font-bold foreground-brand">Header</span>
      </div>
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
  const legendContent = (
    <p className="m-0 py-1.5 text-caption text-gray-60 flex flex-wrap items-center gap-x-3 gap-y-1">
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
        <span aria-hidden="true" className="inline-block w-2 h-2 surface-negative border border-dashed border-danger" style={{ borderRadius: pxToRem(2) }} />
        센터링 여백 {Math.max(0, screenMarginPx - minMarginPx)}px
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

  const outerPx = Math.max(0, screenMarginPx - minMarginPx);
  const outerColumns =
    outerPx > 0 ? gridTrackColumnsRem(outerPx, framePx, outerPx) : gridTrackColumnsRem(framePx);

  const frameLegend = (
    <div
      className="grid w-full max-w-full min-w-0 items-stretch overflow-hidden"
      style={{ gridTemplateColumns: outerColumns }}
    >
      {outerPx > 0 && <div />}
      <div className="surface-subtle border-x border-b border-default" style={{ paddingInline: pxToRem(minMarginPx) }}>
        {legendContent}
      </div>
      {outerPx > 0 && <div />}
    </div>
  );

  if (isSidebarLayout) {
    return (
      <div
        className="grid w-full max-w-full items-stretch overflow-hidden"
        style={{ gridTemplateColumns: gridTrackColumnsRem(menuPx, contentColumnPx) }}
      >
        <div />
        {frameLegend}
      </div>
    );
  }

  return frameLegend;
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
  const outerPx = Math.max(0, screenMarginPx - minMarginPx);
  const outerColumns =
    outerPx > 0 ? gridTrackColumnsRem(outerPx, framePx, outerPx) : gridTrackColumnsRem(framePx);

  return (
    <div
      className="grid w-full max-w-full min-w-0 items-stretch overflow-hidden"
      style={{ gridTemplateColumns: outerColumns }}
    >
      {outerPx > 0 && <div />}
      <div className="surface-subtle border-x border-b border-default" style={{ paddingInline: pxToRem(minMarginPx) }}>
        <p className="m-0 py-1.5 text-caption text-gray-60 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block w-2 h-2 surface-subtle border border-default" style={{ borderRadius: pxToRem(2) }} />
            layout {layoutWidth}px
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block w-2 h-2 bg-background" style={{ borderRadius: pxToRem(2), outline: `${pxToRem(1)} solid var(--ds-surface-brand)`, outlineOffset: pxToRem(-1) }} />
            프레임(전체 너비) {framePx}px
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block w-2 h-2 surface-negative border border-dashed border-danger" style={{ borderRadius: pxToRem(2) }} />
            센터링 여백 {Math.max(0, screenMarginPx - minMarginPx)}px
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
      </div>
      {outerPx > 0 && <div />}
    </div>
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
    <main className="layout-page-wrapper">
      <div className={layoutPageClass}>
      <header className={`${layoutPageColSpanFull} pt-20`}>
        <h1 className="m-0 text-heading-large font-bold leading-base foreground-brand">반응형 레이아웃 가이드</h1>
        <p className="m-0 mt-3 text-body-medium leading-base foreground-subtle">
          브라우저 창 크기를 조절해 브레이크포인트별 칼럼 수·가터(gap)·스크린 마진 변화를 확인하세요.
        </p>
      </header>

      {/* Reference table */}
      <section aria-labelledby="breakpoint-table" className={`${layoutPageColSpanFull} mb-24 pb-20`}>
        <p id="breakpoint-table" className="mb-2 text-label-xsmall font-semibold foreground-subtle">반응형 브레이크포인트 기준표</p>
        <div className="overflow-x-auto rounded-xl border border-default">
          <table aria-labelledby="breakpoint-table" className="w-full border-collapse text-left">
            <thead>
              <tr className="surface-subtle border-b border-default">
                <th scope="col" className="py-3 px-4 text-caption font-semibold text-gray-60">구간</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold text-gray-60">Viewport</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold text-gray-60">Prefix</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold text-gray-60">칼럼 수</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold text-gray-60">가터 너비 (gap)</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold text-gray-60">스크린 마진 (최소)</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold text-gray-60">Sidebar</th>
              </tr>
            </thead>
            <tbody>
              {gridSystemTiers.map((t) => {
                const isActive = t.name === tier;
                const sidebar = t.name === "large";
                return (
                  <tr
                    key={t.name}
                    className={`border-b border-default ${isActive ? "bg-violet-50/10" : ""}`}
                  >
                    <td className="py-3 px-4 text-label-xsmall font-semibold">
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

      </section>

      </div>{/* /layout-page guide prose */}

      {/* viewport 전폭 — main padding 없이 layout-page·미리보기 검증 */}
      <section aria-labelledby="layout-page-demo" className="mb-24 pb-20">
        <div className={layoutPageClass}>
          <div className={layoutPageColSpanFull}>
          <h2 id="layout-page-demo" className="text-heading-medium font-bold mb-4">layout-page — 반응형 페이지 레이아웃</h2>
          <p className="text-body-small foreground-muted mb-4">
            가이드 미리보기(아래) 가운데 테두리 박스가 실제 <strong>콘텐츠 프레임</strong>(<code className="font-mono text-caption">{layoutPageClass}</code> 박스, large+에서 1280px 고정)입니다.

          </p>
          <ul className="mt-2 mb-4 pl-5 list-disc text-body-small foreground-muted flex flex-col gap-1">
            <li>프레임 안쪽 = <strong>최소 스크린 마진</strong>(16/24px) + <strong>칼럼 영역</strong></li>
            <li>프레임이 max에 닿은 뒤 남는 폭은 바깥 <strong>센터링 여백</strong>(붉은색)으로 흡수</li>
            <li>좌우 스크린 마진(통합) = 최소 마진 + 바깥 여백</li>
            <li>칼럼 수·가터(gap)는 기준표를 따름</li>
          </ul>

          {/* Live status */}
          <div aria-label="현재 viewport" className="mb-8 p-5 rounded-xl surface-subtle">
            <dl className="grid gap-4 m-0 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-caption text-gray-60 font-semibold">뷰포트 너비</dt>
                <dd className="m-0 mt-1 text-label-medium font-bold numeric-tabular">{layoutWidth || "—"}px</dd>
              </div>
              <div>
                <dt className="text-caption text-gray-60 font-semibold">스크롤바</dt>
                <dd className="m-0 mt-1 text-label-medium font-bold numeric-tabular">{scrollbarPx}px</dd>
              </div>
              <div>
                <dt className="text-caption text-gray-60 font-semibold">Active tier</dt>
                <dd className="m-0 mt-1 text-label-medium font-bold">{tier}</dd>
              </div>
              <div>
                <dt className="text-caption text-gray-60 font-semibold">Container utility</dt>
                <dd className="m-0 mt-1 text-label-small font-semibold font-mono">{activeContainer.utility}</dd>
              </div>
              <div>
                <dt className="text-caption text-gray-60 font-semibold">칼럼 수</dt>
                <dd className="m-0 mt-1 text-label-medium font-bold numeric-tabular">{gridCols}열</dd>
              </div>
              <div>
                <dt className="text-caption text-gray-60 font-semibold">가터 너비 (gap)</dt>
                <dd className="m-0 mt-1 text-label-medium font-bold numeric-tabular">{gridGapPx}px</dd>
              </div>
            </dl>
            <dl className="grid gap-4 m-0 mt-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-caption text-gray-60 font-semibold">콘텐츠 프레임 (전체 너비)</dt>
                <dd className="m-0 mt-1 text-label-medium font-bold numeric-tabular">{framePx}px</dd>
              </div>
              <div>
                <dt className="text-caption text-gray-60 font-semibold">여백 영역 <span className="font-normal">(최소 마진 + 센터링 여백)</span></dt>
                <dd className="m-0 mt-1 text-label-medium font-bold numeric-tabular">{screenMarginPx}px</dd>
              </div>
              <div>
                <dt className="text-caption text-gray-60 font-semibold">최소 마진</dt>
                <dd className="m-0 mt-1 text-label-medium font-bold numeric-tabular">{minMarginPx}px</dd>
              </div>
              <div>
                <dt className="text-caption text-gray-60 font-semibold">칼럼 영역</dt>
                <dd className="m-0 mt-1 text-label-medium font-bold numeric-tabular">{contentPx}px</dd>
              </div>
              <div>
                <dt className="text-caption text-gray-60 font-semibold">Col width</dt>
                <dd className="m-0 mt-1 text-label-medium font-bold numeric-tabular">{gridColWidthPx}px</dd>
              </div>
            </dl>

            <div className="mt-6">
              <p className="m-0 mb-2 text-caption text-gray-60">Grid tier scale</p>
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
          </div>

          <p className="m-0 mb-3 inline-flex items-center gap-2 text-caption font-semibold foreground-brand">
            <span aria-hidden="true" className="inline-block w-2 h-2 surface-brand" style={{ borderRadius: pxToRem(2) }} />
            레이아웃 구조
          </p>
          </div>
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

        <div className={layoutPageClass}>
          <div className={`${layoutPageColSpanFull} mt-8`}>
            <h3 className="text-label-large font-semibold mb-2">기본 마크업</h3>
            <p className="text-body-small foreground-muted mb-3">
              <code className="font-mono text-caption">{layoutPageClass}</code>만 부모에 적용하면 자식 요소가 반응형 그리드 칼럼에 자동 배치됩니다.
            </p>
            <CodeBlock language="html" code={`<main class="${layoutPageClass}">
  <section>1</section>
  <section>2</section>
  <section>3</section>
  ...
  <section>12</section>
</main>`} />
          </div>
        </div>

        <div className={`${layoutPageClass} mt-10`}>
          <div className={layoutPageColSpanFull}>
          <h3 id="col-span-demo" className="text-label-large font-semibold mb-2">칼럼 병합 (col-span)</h3>
          <p className="text-body-small foreground-muted mb-3">
            <code className="font-mono text-caption">col-span-*</code>을 사용해 여러 칼럼을 병합하면 원하는 너비의 영역을 자유롭게 구성할 수 있습니다.
            <br />브레이크포인트마다 칼럼 수가 4→8→12(large 이상)로 바뀌므로, 각 구간에 맞는 값을 함께 지정합니다.
          </p>
          </div>
        </div>

        <div className={layoutPageClass}>
          <LayoutPageCell label={`col-span ${gridCols}/${gridCols}`} className={layoutPageColSpanFull} />
          <LayoutPageCell label={`col-span ${Math.min(8, gridCols)}/${gridCols}`} className={layoutPageColSpanMain} />
          <LayoutPageCell label={`col-span ${Math.min(4, gridCols)}/${gridCols}`} className={layoutPageColSpanAside} />
        </div>

        <div className={`${layoutPageClass} mt-4`}>
          <div className={layoutPageColSpanFull}>
          <CodeBlock language="html" code={`<div class="layout-page-wrapper">
  <main class="${layoutPageClass}">
    <header class="${layoutPageColSpanFull}">
      <h1>페이지 제목</h1>
      <p>페이지 설명</p>
    </header>

    <!-- 전체 폭 병합 -->
    <div class="${layoutPageColSpanFull}">
      전체 폭 콘텐츠
    </div>

    <!-- 8:4 분할 -->
    <div class="${layoutPageColSpanMain}">
      본문 8/12
    </div>
    <div class="${layoutPageColSpanAside}">
      보조 4/12
    </div>
  </main>
</div>`} />
          </div>
        </div>
      </section>

      {/* viewport 전폭 — layout-sidenav 실제 화면 검증 */}
      <section aria-labelledby="layout-sidenav-demo" className="mb-24 pb-20">
        <div className={layoutPageClass}>
          <div className={layoutPageColSpanFull}>
          <h2 id="layout-sidenav-demo" className="text-heading-medium font-bold mb-4">layout-sidenav — 사이드메뉴 반응형 레이아웃</h2>
          <p className="text-body-small foreground-muted mb-2">
            왼쪽 고정 메뉴 + 오른쪽 콘텐츠 영역으로 구성된 사이드메뉴 레이아웃입니다.
          </p>
          <ul className="mt-0 mb-4 pl-5 list-disc text-body-small foreground-muted flex flex-col gap-1">
            <li><strong>1024px 이상</strong> — 메뉴(256px)가 왼쪽에 고정되고, 나머지 영역에 콘텐츠가 배치됩니다.</li>
            <li><strong>1024px 미만</strong> — 메뉴와 콘텐츠가 위아래로 쌓여 1단 레이아웃이 됩니다.</li>
            <li>메뉴가 <code className="font-mono text-caption">fixed</code>로 고정될 때는 <code className="font-mono text-caption">layout-sidenav</code>를 래퍼에 적용해 메뉴 너비만큼 콘텐츠를 밀어냅니다.</li>
          </ul>
          <div className="m-0 mb-3 flex items-center gap-4">
            <p className="m-0 inline-flex items-center gap-2 text-caption font-semibold foreground-brand">
              <span aria-hidden="true" className="inline-block w-2 h-2 surface-brand" style={{ borderRadius: pxToRem(2) }} />
              레이아웃 구조
            </p>
            <a
              href="/guide/responsive/sidenav-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-brand px-3 py-1.5 text-caption font-semibold foreground-brand no-underline transition-colors hover:surface-brand-subtle"
            >
              실제 동작 확인하기
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="size-icon-xs shrink-0">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
              </svg>
            </a>
          </div>
          </div>
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

        <div className={layoutPageClass}>
          <div className={`${layoutPageColSpanFull} mt-8`}>
            <h3 className="text-label-large font-semibold mb-2">기본 마크업</h3>
            <p className="text-body-small foreground-muted mb-3">
              메뉴가 fixed일 때는 <code className="font-mono text-caption">layout-sidenav</code>를 래퍼에 적용합니다.
            </p>
            <CodeBlock language="html" code={`<div class="layout-page-wrapper">
  <header class="layout-site-header">
    사이트 헤더
  </header>

  <div class="layout-sidenav">
    <nav class="${layoutSidenavMenuClass}">
      <p>사이드 메뉴</p>
      <ul>
        <li>메뉴 항목 1</li>
        <li>메뉴 항목 2</li>
        <li>메뉴 항목 3</li>
      </ul>
    </nav>

    <main class="${layoutSidenavContentClass}">
      <section>콘텐츠 1</section>
      <section>콘텐츠 2</section>
      <section>콘텐츠 3</section>
    </main>
  </div>
</div>`} />
          </div>
        </div>

        <div className={`${layoutPageClass} mt-10`}>
          <div className={layoutPageColSpanFull}>
          <h3 id="sidenav-col-span-demo" className="text-label-large font-semibold mb-2">칼럼 병합 (col-span)</h3>
          <p className="text-body-small foreground-muted">
            <code className="font-mono text-caption">{layoutSidenavContentClass}</code> 내부에서도 동일하게 <code className="font-mono text-caption">col-span-*</code>으로 칼럼을 병합할 수 있습니다.
          </p>
          </div>
        </div>


        <div className={`${layoutPageClass} mt-4`}>
          <div className={layoutPageColSpanFull}>
          <CodeBlock language="html" code={`<div class="layout-page-wrapper">
  <header class="layout-site-header">
    사이트 헤더
  </header>

  <div class="layout-sidenav">
    <nav class="${layoutSidenavMenuClass}">
      <p>사이드 메뉴</p>
      <ul>
        <li>메뉴 항목 1</li>
        <li>메뉴 항목 2</li>
        <li>메뉴 항목 3</li>
      </ul>
    </nav>

    <main class="${layoutSidenavContentClass}">
      <!-- 전체 폭 병합 -->
      <div class="${layoutPageColSpanFull}">
        전체 폭 콘텐츠
      </div>

      <!-- 8:4 분할 -->
      <div class="${layoutPageColSpanMain}">
        본문 8/12
      </div>
      <div class="${layoutPageColSpanAside}">
        보조 4/12
      </div>
    </main>
  </div>
</div>`} />
          </div>
        </div>
      </section>

    </main>
  );
}
