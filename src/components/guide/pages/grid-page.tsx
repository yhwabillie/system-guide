"use client";

import { layoutPageColSpanFull } from "@/lib/layout-tokens";
import {
  contentSubTabPanelClass,
  ContentIntroShell,
  ContentSectionTitle,
  ContentTitleBlock,
  GridColumnPreview,
  gridColumnTokens,
} from "@/components/guide/shared";
import { GUIDE_ROUTES } from "@/lib/guide-routes";

export function GuideGridPage() {
  return (
    <div className={layoutPageColSpanFull}>
        <ContentIntroShell>
          <ContentTitleBlock
            title="Layout"
            titleId="content-grid"
          />

          </ContentIntroShell>

          <div className={contentSubTabPanelClass}>
          <section aria-labelledby="section-grid-columns" className="mb-0">
            <ContentSectionTitle
              id="section-grid-columns"
              lead
              description={
                <>
                  Tailwind 기본 <strong>grid-cols-*</strong> 열 분할. <strong>12열</strong> 그리드는 <strong>col-span-*</strong>와 조합해 페이지 레이아웃을 구성합니다.{" "}
                  <strong>shell·breakpoint</strong> 검증은 사이드메뉴{" "}
                  <a href={GUIDE_ROUTES.responsive} className="font-semibold foreground-brand no-underline hover:underline">
                    Layout & Breakpoint
                  </a>
                  {" "}가이드를 참고하세요.
                </>
              }
            >
              Columns
            </ContentSectionTitle>
            <div role="list" className="grid grid-cols-2 gap-4">
              {gridColumnTokens.map(({ name, cols, utility, desc }) => (
                <div key={name} role="listitem" className="p-4 rounded-xl border border-default">
                  <p className="m-0 text-label-xsmall font-semibold">{name}</p>
                  <p className="mt-0.5 mb-3 text-caption foreground-muted">{desc}</p>
                  <GridColumnPreview cols={cols} utility={utility} label={`${name} ${cols}열 그리드 견본`} />
                </div>
              ))}
            </div>
          </section>
          </div>

        
    </div>
  );
}
