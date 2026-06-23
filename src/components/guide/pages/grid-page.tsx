"use client";

import { useRef } from "react";
import { layoutPageColSpanFull } from "@/lib/layout-tokens";
import {
  contentSubTabPanelClass,
  ContentIntroLayout,
  ContentOutlineTabList,
  ContentTitleBlock,
  GridColumnPreview,
  GridRowPreview,
  gridColumnTokens,
  gridRowTokens,
  TabDescriptionCallout,
  TokenChip,
} from "@/components/guide/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { GUIDE_ROUTES, guideLayoutTabHref } from "@/lib/guide-routes";

export function GuideGridPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeLayoutTab = searchParams.get("tab") === "rows" ? "rows" : "columns";
  const selectLayoutSection = (sub: "columns" | "rows") => router.push(guideLayoutTabHref(sub));
  const columnsTabRef = useRef<HTMLButtonElement>(null);
  const rowsTabRef = useRef<HTMLButtonElement>(null);
  function handleLayoutTabKeyDown(e: React.KeyboardEvent) {
    const order: ("columns" | "rows")[] = ["columns", "rows"];
    const refs = { columns: columnsTabRef, rows: rowsTabRef };
    let next: "columns" | "rows" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(order.indexOf(activeLayoutTab) + 1) % order.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(order.indexOf(activeLayoutTab) - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) {
      e.preventDefault();
      selectLayoutSection(next);
      refs[next].current?.focus();
    }
  }

  return (
    <div className={layoutPageColSpanFull}>
      <ContentIntroLayout>
        <ContentTitleBlock title="Layout" titleId="content-grid" />

        <ContentOutlineTabList
          ariaLabel="Layout 카테고리"
          activeValue={activeLayoutTab}
          onSelect={(value) => selectLayoutSection(value as "columns" | "rows")}
          onKeyDown={handleLayoutTabKeyDown}
          tabs={[
            {
              value: "columns",
              tabId: "tab-layout-columns",
              panelId: "panel-layout-columns",
              label: "Columns",
              ref: columnsTabRef,
            },
            {
              value: "rows",
              tabId: "tab-layout-rows",
              panelId: "panel-layout-rows",
              label: "Rows",
              ref: rowsTabRef,
            },
          ]}
        />
      </ContentIntroLayout>

      <div
        role="tabpanel"
        id="panel-layout-columns"
        aria-labelledby="tab-layout-columns"
        hidden={activeLayoutTab !== "columns"}
        className={contentSubTabPanelClass}
      >
        <section aria-label="Columns" className="mb-0">
          <TabDescriptionCallout>
            Tailwind 기본 <strong>grid-cols-*</strong> 열 분할. <strong>12열</strong> 그리드는{" "}
            <strong>col-span-*</strong>와 조합해 페이지 레이아웃을 구성합니다.{" "}
            <strong>전체 Layout·breakpoint</strong> 검증은 사이드메뉴{" "}
            <a href={GUIDE_ROUTES.responsive}>반응형 Layout 가이드</a>를 참고하세요.
          </TabDescriptionCallout>
          <div role="list" className="grid grid-cols-2 gap-4">
            {gridColumnTokens.map(({ name, cols, utility }) => (
              <div key={name} role="listitem" className="p-4 rounded-xl border border-default">
                <div className="mb-3">
                  <TokenChip copyValue={name}>{name}</TokenChip>
                </div>
                <GridColumnPreview cols={cols} utility={utility} label={`${name} ${cols}열 그리드 견본`} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div
        role="tabpanel"
        id="panel-layout-rows"
        aria-labelledby="tab-layout-rows"
        hidden={activeLayoutTab !== "rows"}
        className={contentSubTabPanelClass}
      >
        <section aria-label="Rows" className="mb-0">
          <TabDescriptionCallout>
            Tailwind 기본 <strong>grid-rows-*</strong> 행 분할. 카드 내부 영역, 상하 비교 레이아웃,
            세로 데이터 구성을 일정한 행 구조로 나눌 때 사용합니다.
          </TabDescriptionCallout>
          <div role="list" className="grid grid-cols-2 gap-4">
            {gridRowTokens.map(({ name, rows, utility }) => (
              <div key={name} role="listitem" className="p-4 rounded-xl border border-default">
                <div className="mb-3">
                  <TokenChip copyValue={name}>{name}</TokenChip>
                </div>
                <GridRowPreview rows={rows} utility={utility} label={`${name} ${rows}행 그리드 견본`} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
