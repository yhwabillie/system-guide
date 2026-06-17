"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { pxToRem } from "@/lib/tokens";
import {
  breakpointDefinitions,
  containerTokens,
  getActiveBreakpoint,
  getActiveContainerToken,
  getContainerLayoutMetrics,
  getResponsiveGridCols,
  responsiveCardsClass,
  responsiveContainerClass,
  responsiveGutterClass,
  responsiveGridClass,
  responsiveSidebarClass,
} from "@/lib/layout-tokens";

function DemoCell({ label }: { label: string }) {
  return (
    <div
      className="bg-background border border-border flex items-center justify-center text-caption font-semibold text-text-muted"
      style={{ height: pxToRem(56), borderRadius: pxToRem(2) }}
    >
      {label}
    </div>
  );
}

function SidebarCell({ muted, label }: { muted?: boolean; label: string }) {
  return (
    <div
      className={muted ? "bg-accent/25 border border-accent" : "bg-accent border border-accent"}
      style={{ minHeight: pxToRem(120), borderRadius: pxToRem(2) }}
    >
      <span className="block p-3 text-caption font-semibold text-foreground">{label}</span>
    </div>
  );
}

function getLayoutViewportWidth() {
  return document.documentElement.clientWidth;
}

function ContainerPreview({
  viewportWidth,
  containerPx,
  marginLeftPx,
  marginRightPx,
  gutterPx,
  contentPx,
  utility,
  labelPx,
}: {
  viewportWidth: number;
  containerPx: number;
  marginLeftPx: number;
  marginRightPx: number;
  gutterPx: number;
  contentPx: number;
  utility: string;
  labelPx: string;
}) {
  const hasMargin = marginLeftPx > 0 || marginRightPx > 0;
  const outerColumns = hasMargin
    ? `${marginLeftPx}px ${containerPx}px ${marginRightPx}px`
    : `${containerPx}px`;

  return (
    <div className="border-y border-border overflow-hidden">
      <div
        role="img"
        aria-label={`viewport ${viewportWidth}px — margin ${marginLeftPx}px / ${marginRightPx}px — container ${containerPx}px — padding ${gutterPx}px — content ${contentPx}px (${utility})`}
        className="grid items-stretch bg-surface-subtle"
        style={{ gridTemplateColumns: outerColumns, minHeight: pxToRem(80) }}
      >
        {hasMargin && (
          <div
            aria-hidden="true"
            className="bg-red-100 border-r border-dashed border-red-300 flex items-center justify-center"
          >
            <span className="text-caption text-red-700 numeric-tabular px-1 text-center">
              margin
              <span className="block font-mono">{marginLeftPx}px</span>
            </span>
          </div>
        )}
        <div
          className="grid items-stretch"
          style={{ gridTemplateColumns: `${gutterPx}px ${contentPx}px ${gutterPx}px` }}
        >
          <div
            aria-hidden="true"
            className="bg-accent/10 flex items-center justify-center min-w-0"
          >
            {gutterPx >= 18 && (
              <span className="text-caption text-text-muted numeric-tabular text-center leading-tight">
                {gutterPx}px
              </span>
            )}
          </div>
          <div
            className="bg-accent text-on-accent flex min-w-0 items-center justify-center text-center px-2 py-5 text-label-md font-semibold"
            style={{ borderRadius: pxToRem(2) }}
          >
            content · {contentPx}px
            <span className="block text-caption font-normal opacity-90">
              {utility} · {labelPx}
            </span>
          </div>
          <div
            aria-hidden="true"
            className="bg-accent/10 flex items-center justify-center min-w-0"
          >
            {gutterPx >= 18 && (
              <span className="text-caption text-text-muted numeric-tabular text-center leading-tight">
                {gutterPx}px
              </span>
            )}
          </div>
        </div>
        {hasMargin && (
          <div
            aria-hidden="true"
            className="bg-red-100 border-l border-dashed border-red-300 flex items-center justify-center"
          >
            <span className="text-caption text-red-700 numeric-tabular px-1 text-center">
              margin
              <span className="block font-mono">{marginRightPx}px</span>
            </span>
          </div>
        )}
      </div>
      <p className="m-0 py-1.5 px-3 text-caption text-text-muted bg-surface-subtle border-t border-border flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block w-2 h-2 bg-surface-subtle border border-border" style={{ borderRadius: pxToRem(2) }} />
          viewport {viewportWidth}px
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
          <span aria-hidden="true" className="inline-block w-2 h-2 bg-accent" style={{ borderRadius: pxToRem(2) }} />
          content {contentPx}px
        </span>
      </p>
    </div>
  );
}

export default function ResponsiveGuidePage() {
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const update = () => setViewportWidth(getLayoutViewportWidth());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const activeBreakpoint = getActiveBreakpoint(viewportWidth || 375);
  const activeContainer = getActiveContainerToken(activeBreakpoint);
  const { containerPx, marginLeftPx, marginRightPx, gutterPx, contentPx } = getContainerLayoutMetrics(
    viewportWidth || 375,
    activeBreakpoint,
  );
  const gridCols = getResponsiveGridCols(activeBreakpoint);
  const sidebarActive = activeBreakpoint === "lg" || activeBreakpoint === "xl";

  return (
    <main className="min-h-screen p-6 md:p-10 font-sans bg-background text-foreground">
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
            <dt className="text-caption text-text-muted font-semibold">Viewport width</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{viewportWidth || "—"}px</dd>
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
        </dl>
        <dl className="grid gap-4 m-0 mt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-caption text-text-muted font-semibold">Container width</dt>
            <dd className="m-0 mt-1 text-label-lg font-bold numeric-tabular">{containerPx}px</dd>
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

      {/* Container demo — viewport 전폭 트랙 (페이지 padding 영향 제거) */}
      <section aria-labelledby="container-demo" className="mb-12">
        <h2 id="container-demo" className="text-heading-md font-bold mb-2">Container</h2>
        <p className="text-body-sm text-text-muted mb-4">
          패턴: <code className="font-mono text-caption">{responsiveContainerClass}</code>
        </p>
        {/* main padding(p-6 md:p-10)만큼만 breakout — 100vw 사용 시 스크롤바로 가로 스크롤 발생 */}
        <div className="-mx-6 w-[calc(100%+3rem)] md:-mx-10 md:w-[calc(100%+5rem)]">
          <ContainerPreview
            viewportWidth={viewportWidth || 375}
            containerPx={containerPx}
            marginLeftPx={marginLeftPx}
            marginRightPx={marginRightPx}
            gutterPx={gutterPx}
            contentPx={contentPx}
            utility={activeContainer.utility}
            labelPx={activeContainer.px}
          />
        </div>
        <p className="mt-3 mb-0 text-caption text-text-muted">
          브라우저 viewport 전폭 기준입니다. lg(1024px)부터 container max-width는 1280px(`max-w-xl`)이며, 1440px viewport까지 동일 상한을 유지합니다. 좌우 padding은 768px 미만 18px, 이상 30px입니다. `mx-auto` margin(붉은 점선), padding(옅은 초록), content(진한 블록)를 구분해 보세요.
        </p>
      </section>

      {/* Grid demo */}
      <section aria-labelledby="grid-demo" className="mb-12">
        <h2 id="grid-demo" className="text-heading-md font-bold mb-2">Responsive Grid</h2>
        <p className="text-body-sm text-text-muted mb-4">
          패턴: <code className="font-mono text-caption">{responsiveGridClass}</code>
        </p>
        <div className={`${responsiveGridClass} p-4 rounded-xl border border-border bg-surface-subtle`}>
          {Array.from({ length: 4 }, (_, i) => (
            <DemoCell key={i} label={`col ${i + 1}`} />
          ))}
        </div>
        <p className="mt-3 mb-0 text-caption text-text-muted">
          base 1열 → sm 2열 → md 3열 → lg/xl 4열. 현재 {gridCols}열이 적용됩니다.
        </p>
      </section>

      {/* Sidebar preset */}
      <section aria-labelledby="sidebar-demo" className="mb-12">
        <h2 id="sidebar-demo" className="text-heading-md font-bold mb-2">Sidebar Grid Preset</h2>
        <p className="text-body-sm text-text-muted mb-4">
          패턴: <code className="font-mono text-caption">{responsiveSidebarClass}</code>
        </p>
        <div className={`${responsiveSidebarClass} p-4 rounded-xl border border-border bg-surface-subtle`}>
          <SidebarCell muted label="sidebar (16rem)" />
          <SidebarCell label="content (1fr)" />
        </div>
        <p className="mt-3 mb-0 text-caption text-text-muted">
          {sidebarActive
            ? "lg 이상 — 2열 sidebar 레이아웃이 적용됩니다."
            : "lg 미만 — 1열 스택. lg(1024px)부터 grid-cols-sidebar가 적용됩니다."}
        </p>
      </section>

      {/* Cards preset */}
      <section aria-labelledby="cards-demo" className="mb-12">
        <h2 id="cards-demo" className="text-heading-md font-bold mb-2">Cards Grid Preset</h2>
        <p className="text-body-sm text-text-muted mb-4">
          패턴: <code className="font-mono text-caption">{responsiveCardsClass}</code> — minmax(16rem, 1fr) auto-fit
        </p>
        <div className={`${responsiveCardsClass} p-4 rounded-xl border border-border bg-surface-subtle`}>
          {Array.from({ length: 6 }, (_, i) => (
            <DemoCell key={i} label={`card ${i + 1}`} />
          ))}
        </div>
      </section>

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
    </main>
  );
}
