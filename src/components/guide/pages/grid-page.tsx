"use client";

import { useRef } from "react";
import { layoutPageColSpanFull } from "@/lib/layout-tokens";
import {
  contentSubTabPanelClass,
  ContentIntroShell,
  ContentOutlineTabList,
  ContentSectionTitle,
  ContentTitleBlock,
  GridColumnPreview,
  GridGapCuration,
  gridColumnTokens,
} from "@/components/guide/shared";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { guideGridTabHref, GUIDE_ROUTES } from "@/lib/guide-routes";

export function GuideGridPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeGridTab = searchParams.get("tab") === "gap" ? "gap" : "columns";
  const selectGridSection = (sub: "columns" | "gap") => router.push(guideGridTabHref(sub));
  const gridColumnsTabRef = useRef<HTMLButtonElement>(null);
  const gridGapTabRef = useRef<HTMLButtonElement>(null);
  function handleGridTabKeyDown(e: React.KeyboardEvent) {
    const order: ("columns" | "gap")[] = ["columns", "gap"];
    const refs = { columns: gridColumnsTabRef, gap: gridGapTabRef };
    let next: "columns" | "gap" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(order.indexOf(activeGridTab) + 1) % order.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(order.indexOf(activeGridTab) - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) { e.preventDefault(); selectGridSection(next); refs[next].current?.focus(); }
  }
  return (
    <div className={layoutPageColSpanFull}>
        <ContentIntroShell>
          <ContentTitleBlock
            title="Grid"
            titleId="content-grid"
          />

          <ContentOutlineTabList
            ariaLabel="Grid 카테고리"
            activeValue={activeGridTab}
            onSelect={(value) => selectGridSection(value as "columns" | "gap")}
            onKeyDown={handleGridTabKeyDown}
            tabs={[
              { value: "columns", tabId: "tab-grid-columns", panelId: "panel-grid-columns", label: "Columns", ref: gridColumnsTabRef },
              { value: "gap", tabId: "tab-grid-gap", panelId: "panel-grid-gap", label: "Gap", ref: gridGapTabRef },
            ]}
          />

          </ContentIntroShell>

          <div role="tabpanel" id="panel-grid-columns" aria-labelledby="tab-grid-columns" hidden={activeGridTab !== "columns"} className={contentSubTabPanelClass}>
          <section aria-labelledby="section-grid-columns" className="mb-0">
            <ContentSectionTitle
              id="section-grid-columns"
              lead
              description={
                <>
                  Tailwind 기본 <strong>grid-cols-*</strong> 열 분할. <strong>12열</strong> 그리드는 <strong>col-span-*</strong>와 조합해 페이지 레이아웃을 구성합니다.{" "}
                  <strong>shell·breakpoint</strong> 검증은 사이드메뉴{" "}
                  <Link href={GUIDE_ROUTES.responsive}>Layout & Breakpoint</Link>
                  {" "}가이드를 참고하세요.
                </>
              }
            >
              Columns
            </ContentSectionTitle>
            <div role="list" className="grid grid-cols-2 gap-4">
              {gridColumnTokens.map(({ name, cols, utility, desc }) => (
                <div key={name} role="listitem" className="p-4 rounded-xl border border-line">
                  <p className="m-0 text-label-sm font-semibold">{name}</p>
                  <p className="mt-0.5 mb-3 text-caption text-muted">{desc}</p>
                  <GridColumnPreview cols={cols} utility={utility} label={`${name} ${cols}열 그리드 견본`} />
                </div>
              ))}
            </div>
          </section>
          </div>{/* /panel-grid-columns */}

          <div role="tabpanel" id="panel-grid-gap" aria-labelledby="tab-grid-gap" hidden={activeGridTab !== "gap"} className={contentSubTabPanelClass}>
          <section aria-labelledby="section-grid-gap" className="mb-0">
            <ContentSectionTitle
              id="section-grid-gap"
              lead
              description={
                <>
                  <strong>그리드 간격(gap)</strong>은 item 사이 margin 역할입니다. <strong>gap-*</strong>는 좌우·상하에 동일하게 적용되며, 아래 스케일에서 크기별 견본을 한눈에 비교할 수 있습니다.
                </>
              }
            >
              Gap
            </ContentSectionTitle>
            <GridGapCuration />
          </section>
          </div>{/* /panel-grid-gap */}

        
    </div>
  );
}
