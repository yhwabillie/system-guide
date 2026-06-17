"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { pxToRem } from "@/lib/tokens";
import {
  breakpointDefinitions,
  containerTokens,
  getActiveBreakpoint,
  getActiveContainerToken,
  getBreakpointViewportWidth,
  getContainerLayoutMetrics,
  getGridColWidthPx,
  getLayoutViewportWidth,
  getResponsiveGridCols,
  getResponsiveGridGapPx,
  gridTrackColumnsRem,
  layoutPageClass,
  layoutPageColSpanAside,
  layoutPageColSpanFull,
  layoutPageColSpanMain,
  responsiveGutterClass,
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
      className={`bg-accent text-on-accent flex min-w-0 items-center justify-center font-semibold ${className ?? ""}`}
      style={{ minHeight: pxToRem(48) }}
    >
      <span
        className={compact ? "numeric-tabular" : "text-caption numeric-tabular"}
        style={compact ? { fontSize: pxToRem(10), lineHeight: 1 } : undefined}
      >
        {label}
      </span>
    </div>
  );
}

function MarginCell({ side, px }: { side: "left" | "right"; px: number }) {
  return (
    <div
      aria-hidden="true"
      className={`min-w-0 bg-red-100 flex items-center justify-center ${
        side === "left" ? "border-r border-dashed border-red-300" : "border-l border-dashed border-red-300"
      }`}
    >
      <span className="text-caption text-red-700 numeric-tabular px-1 text-center">
        margin
        <span className="block font-mono">{px}px</span>
      </span>
    </div>
  );
}

function GutterCell({ px }: { px: number }) {
  return (
    <div aria-hidden="true" className="bg-accent/10 flex items-center justify-center min-w-0">
      {px >= 18 && (
        <span className="text-caption text-text-muted numeric-tabular text-center leading-tight">
          {px}px
        </span>
      )}
    </div>
  );
}

function LayoutGuidePreview({
  layoutWidth,
  containerPx,
  marginLeftPx,
  marginRightPx,
  gutterPx,
  contentPx,
  gridCols,
  gridGapPx,
  gridColWidthPx,
  utility,
  children,
}: {
  layoutWidth: number;
  containerPx: number;
  marginLeftPx: number;
  marginRightPx: number;
  gutterPx: number;
  contentPx: number;
  gridCols: number;
  gridGapPx: number;
  gridColWidthPx: number;
  utility: string;
  children: ReactNode;
}) {
  const hasMargin = marginLeftPx > 0 || marginRightPx > 0;
  const outerColumns = hasMargin
    ? gridTrackColumnsRem(marginLeftPx, containerPx, marginRightPx)
    : gridTrackColumnsRem(containerPx);
  const innerColumns = gridTrackColumnsRem(gutterPx, contentPx, gutterPx);

  return (
    <div className="border-y border-border overflow-hidden">
      <div
        role="img"
        aria-label={`layout ${layoutWidth}px — margin ${marginLeftPx}px / ${marginRightPx}px — container ${containerPx}px — padding ${gutterPx}px — content ${contentPx}px — grid ${gridCols} columns gap ${gridGapPx}px col ${gridColWidthPx}px (${utility})`}
        className="grid w-full max-w-full items-stretch overflow-hidden bg-surface-subtle"
        style={{ gridTemplateColumns: outerColumns }}
      >
        {hasMargin && <MarginCell side="left" px={marginLeftPx} />}
        <div
          className="grid min-w-0 items-stretch overflow-hidden"
          style={{ gridTemplateColumns: innerColumns }}
        >
          <GutterCell px={gutterPx} />
          <div
            className="flex min-w-0 flex-col overflow-hidden border border-accent/30 bg-background"
            style={{ borderRadius: pxToRem(2) }}
          >
            <p className="m-0 shrink-0 py-1.5 px-2 text-caption font-semibold text-accent bg-accent/10 border-b border-accent/20 text-center numeric-tabular">
              content · {contentPx}px · {gridCols}열 · gap {gridGapPx}px · col {gridColWidthPx}px
            </p>
            <div
              className={`${layoutPageClass} min-w-0 w-full max-w-none mx-0 flex-1 overflow-hidden`}
              style={{ paddingInline: 0 }}
            >
              {children}
            </div>
          </div>
          <GutterCell px={gutterPx} />
        </div>
        {hasMargin && <MarginCell side="right" px={marginRightPx} />}
      </div>
      <LayoutMetricsLegend
        layoutWidth={layoutWidth}
        marginLeftPx={marginLeftPx}
        marginRightPx={marginRightPx}
        containerPx={containerPx}
        gutterPx={gutterPx}
        contentPx={contentPx}
        gridCols={gridCols}
        gridGapPx={gridGapPx}
        gridColWidthPx={gridColWidthPx}
      />
    </div>
  );
}

function LayoutMetricsLegend({
  layoutWidth,
  marginLeftPx,
  marginRightPx,
  containerPx,
  gutterPx,
  contentPx,
  gridCols,
  gridGapPx,
  gridColWidthPx,
}: {
  layoutWidth: number;
  marginLeftPx: number;
  marginRightPx: number;
  containerPx: number;
  gutterPx: number;
  contentPx: number;
  gridCols: number;
  gridGapPx: number;
  gridColWidthPx: number;
}) {
  const hasMargin = marginLeftPx > 0 || marginRightPx > 0;

  return (
    <p className="m-0 py-1.5 px-3 text-caption text-text-muted bg-surface-subtle border-t border-border flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 bg-surface-subtle border border-border" style={{ borderRadius: pxToRem(2) }} />
        layout {layoutWidth}px
      </span>
      {hasMargin && (
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block w-2 h-2 border border-dashed border-red-300 bg-red-100"
            style={{ borderRadius: pxToRem(2) }}
          />
          {marginLeftPx === marginRightPx
            ? `margin ${marginLeftPx}px × 2`
            : `margin ${marginLeftPx}px + ${marginRightPx}px`}
        </span>
      )}
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 border border-accent bg-accent/25" style={{ borderRadius: pxToRem(2) }} />
        container {containerPx}px
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 bg-accent/10" style={{ borderRadius: pxToRem(2) }} />
        padding {gutterPx}px × 2
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 bg-background border border-accent/30" style={{ borderRadius: pxToRem(2) }} />
        content {contentPx}px · {gridCols}열 · gap {gridGapPx}px
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block w-2 h-2 bg-accent" style={{ borderRadius: pxToRem(2) }} />
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

  const activeBreakpoint = getActiveBreakpoint(breakpointWidth || 375);
  const activeContainer = getActiveContainerToken(activeBreakpoint);
  const { containerPx, marginLeftPx, marginRightPx, gutterPx, contentPx } = getContainerLayoutMetrics(
    layoutWidth || 375,
    activeBreakpoint,
  );
  const gridCols = getResponsiveGridCols(activeBreakpoint);
  const gridGapPx = getResponsiveGridGapPx(activeBreakpoint);
  const gridColWidthPx = getGridColWidthPx(contentPx, gridCols, gridGapPx);

  return (
    <main className="min-h-screen font-sans bg-background text-foreground">
      <div className="p-6 md:p-10">
      <header className="mb-10">
        <p className="m-0 mb-2">
          <Link href="/" className="text-body-sm text-accent no-underline hover:underline">
            ← Design Token Preview
          </Link>
        </p>
        <h1 className="text-display-sm font-bold m-0">Responsive Layout Guide</h1>
        <p className="mt-2 mb-0 text-body-sm text-text-muted">
          브라우저 창 크기를 조절해 breakpoint별 container·grid 변화를 확인하세요.
        </p>
      </header>

      {/* Live status */}
      <section aria-labelledby="live-status" className="mb-12 p-5 rounded-xl border border-border bg-surface-subtle">
        <h2 id="live-status" className="text-heading-md font-bold m-0 mb-4">현재 viewport</h2>
        <dl className="grid gap-4 m-0 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-caption text-text-muted font-semibold">Layout width</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{layoutWidth || "—"}px</dd>
          </div>
          <div>
            <dt className="text-caption text-text-muted font-semibold">Breakpoint width</dt>
            <dd className="m-0 mt-1 text-label-md font-semibold numeric-tabular">{breakpointWidth || "—"}px</dd>
          </div>
          <div>
            <dt className="text-caption text-text-muted font-semibold">Active breakpoint</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold">{activeBreakpoint === "base" ? "base (< sm)" : activeBreakpoint}</dd>
          </div>
          <div>
            <dt className="text-caption text-text-muted font-semibold">Container utility</dt>
            <dd className="m-0 mt-1 text-label-md font-semibold font-mono">{activeContainer.utility}</dd>
          </div>
          <div>
            <dt className="text-caption text-text-muted font-semibold">Grid columns (demo)</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{gridCols}열</dd>
          </div>
          <div>
            <dt className="text-caption text-text-muted font-semibold">Grid gap</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{gridGapPx}px</dd>
          </div>
        </dl>
        <dl className="grid gap-4 m-0 mt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-caption text-text-muted font-semibold">Container width</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{containerPx}px</dd>
          </div>
          <div>
            <dt className="text-caption text-text-muted font-semibold">Col width</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{gridColWidthPx}px</dd>
          </div>
          <div>
            <dt className="text-caption text-text-muted font-semibold">Outer margin</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">
              {marginLeftPx > 0 || marginRightPx > 0
                ? marginLeftPx === marginRightPx
                  ? `${marginLeftPx}px × 2`
                  : `${marginLeftPx}px + ${marginRightPx}px`
                : "0"}
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-muted font-semibold">Side padding</dt>
            <dd className="m-0 mt-1 text-label-md font-semibold font-mono">{gutterPx}px · {responsiveGutterClass}</dd>
          </div>
          <div>
            <dt className="text-caption text-text-muted font-semibold">Content width</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{contentPx}px</dd>
          </div>
        </dl>

        <div className="mt-6">
          <p className="m-0 mb-2 text-caption text-text-muted">Breakpoint scale</p>
          <div role="list" className="flex flex-wrap gap-2">
            {breakpointDefinitions.map((bp) => {
              const isActive = bp.name === activeBreakpoint;
              return (
                <div
                  key={bp.name}
                  role="listitem"
                  className={`py-1.5 px-3 rounded-md border text-caption font-semibold ${
                    isActive
                      ? "bg-accent text-on-accent border-accent"
                      : "bg-background text-text-muted border-border"
                  }`}
                >
                  {bp.name === "base" ? "base" : bp.name}
                  <span className="ml-1.5 font-normal font-mono">{bp.px}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      </div>{/* /guide prose padding */}

      {/* viewport 전폭 — main padding 없이 layout-page·미리보기 검증 */}
      <section aria-labelledby="layout-page-demo" className="mb-12">
        <div className="px-6 md:px-10">
          <h2 id="layout-page-demo" className="text-heading-md font-bold mb-4">layout-page — 반응형 페이지 레이아웃</h2>
          <p className="text-body-sm text-text-muted mb-4">
            가이드 미리보기(아래)는 <code className="font-mono text-caption">{layoutPageClass}</code>에 viewport margin(붉은 영역)을 겹쳐 표시합니다. 범례는 계산된 수치를 보조합니다.
          </p>
        </div>

        {layoutWidth > 0 && (
          <LayoutGuidePreview
            layoutWidth={layoutWidth}
            containerPx={containerPx}
            marginLeftPx={marginLeftPx}
            marginRightPx={marginRightPx}
            gutterPx={gutterPx}
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
            <p className="text-body-sm text-text-muted mb-3">
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
          <p className="text-body-sm text-text-muted mb-3">
            <code className="font-mono text-caption">layout-page</code> 열 수는 breakpoint마다 1→2→4→8→12로 변합니다.
            <code className="font-mono text-caption"> col-span-*</code>도 같은 비율로 맞춰야 합니다. 전체 폭·8+4 분할은 아래 권장 조합을 사용하세요.
          </p>
          <ul className="m-0 mb-4 pl-5 flex flex-col gap-1 text-caption text-text-muted font-mono">
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

      <div className="p-6 md:p-10">
      {/* Reference table */}
      <section aria-labelledby="breakpoint-table">
        <h2 id="breakpoint-table" className="text-heading-md font-bold mb-4">Breakpoint reference</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-subtle border-b border-border">
                <th scope="col" className="py-3 px-4 text-caption font-semibold text-text-muted">Breakpoint</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold text-text-muted">Min width</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold text-text-muted">Container</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold text-text-muted">Grid (demo)</th>
                <th scope="col" className="py-3 px-4 text-caption font-semibold text-text-muted">Sidebar</th>
              </tr>
            </thead>
            <tbody>
              {breakpointDefinitions.map((bp) => {
                const isActive = bp.name === activeBreakpoint;
                const container = getActiveContainerToken(bp.name);
                const cols = getResponsiveGridCols(bp.name);
                const sidebar = bp.name === "lg" || bp.name === "xl";
                return (
                  <tr
                    key={bp.name}
                    className={`border-b border-border ${isActive ? "bg-accent/10" : ""}`}
                  >
                    <td className="py-3 px-4 text-label-sm font-semibold">
                      {bp.name}
                      {isActive && <span className="ml-2 text-caption text-accent">● active</span>}
                    </td>
                    <td className="py-3 px-4 text-caption font-mono numeric-tabular">{bp.px}</td>
                    <td className="py-3 px-4 text-caption font-mono">{container.utility}</td>
                    <td className="py-3 px-4 text-caption numeric-tabular">{cols}열</td>
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
              <li key={name} className="text-caption text-text-muted font-mono">
                {name} · {px} · {rem} · {utility}
              </li>
            ))}
          </ul>
        </div>
      </section>
      </div>{/* /guide prose padding */}
    </main>
  );
}
