"use client";

import { useRef } from "react";
import { layoutPageColSpanFull } from "@/lib/layout-tokens";
import {
  contentSubTabPanelClass,
  ContentGroupTitle,
  ContentIntroShell,
  ContentOutlineTabList,
  ContentSectionTitle,
  ContentTitleBlock,
  controlSizeTokens,
  fixedSizeTokens,
  iconSizeTokens,
  MeasureBar,
  radiusTokens,
  spacingTokens,
  TokenValue,
} from "@/components/guide/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { guideSpacingTabHref } from "@/lib/guide-routes";
import { pxToRem } from "@/lib/tokens";

export function GuideSpacingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const activeSpacingTab = tab === "radius" || tab === "fixed-size" ? tab : "spacing";
  const selectSpacingSection = (sub: "spacing" | "radius" | "fixed-size") => router.push(guideSpacingTabHref(sub));
  const spacingMeasureTabRef = useRef<HTMLButtonElement>(null);
  const radiusTabRef = useRef<HTMLButtonElement>(null);
  const fixedSizeTabRef = useRef<HTMLButtonElement>(null);
  function handleSpacingTabKeyDown(e: React.KeyboardEvent) {
    const order: ("spacing" | "radius" | "fixed-size")[] = ["spacing", "radius", "fixed-size"];
    const refs = { spacing: spacingMeasureTabRef, radius: radiusTabRef, "fixed-size": fixedSizeTabRef };
    let next: "spacing" | "radius" | "fixed-size" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(order.indexOf(activeSpacingTab) + 1) % order.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(order.indexOf(activeSpacingTab) - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) { e.preventDefault(); selectSpacingSection(next); refs[next].current?.focus(); }
  }
  return (
    <div className={layoutPageColSpanFull}>
        <ContentIntroShell>
          <ContentTitleBlock
            title="Spacing & Size"
            titleId="content-spacing"
          />

          <ContentOutlineTabList
            ariaLabel="Spacing & Size 카테고리"
            activeValue={activeSpacingTab}
            onSelect={(value) => selectSpacingSection(value as "spacing" | "radius" | "fixed-size")}
            onKeyDown={handleSpacingTabKeyDown}
            tabs={[
              { value: "spacing", tabId: "tab-spacing-measure", panelId: "panel-spacing-measure", label: "Spacing", ref: spacingMeasureTabRef },
              { value: "radius", tabId: "tab-spacing-radius", panelId: "panel-spacing-radius", label: "Radius", ref: radiusTabRef },
              { value: "fixed-size", tabId: "tab-spacing-fixed-size", panelId: "panel-spacing-fixed-size", label: "Fixed Size", ref: fixedSizeTabRef },
            ]}
          />

          </ContentIntroShell>

          <div role="tabpanel" id="panel-spacing-measure" aria-labelledby="tab-spacing-measure" hidden={activeSpacingTab !== "spacing"} className={contentSubTabPanelClass}>
          <section aria-labelledby="section-spacing" className="mb-0">
            <ContentSectionTitle
              id="section-spacing"
              lead
              description={
                <>
                  <strong>margin</strong>, <strong>padding</strong>, <strong>gap</strong>의 기준 스케일입니다.{" "}
                  <strong>--space-*</strong> 원본 토큰이 <strong>--spacing-*</strong>로 노출됩니다.
                </>
              }
            >
              Spacing
            </ContentSectionTitle>
            <div role="list" className="flex flex-col gap-2">
              <div
                aria-hidden="true"
                className="grid gap-4 items-center pb-1"
                style={{ gridTemplateColumns: `${pxToRem(140)} 1fr ${pxToRem(120)} ${pxToRem(160)}` }}
              >
                <span className="text-caption text-muted">Token</span>
                <span className="text-caption text-muted">Preview</span>
                <span className="text-caption text-muted">Size</span>
                <span className="text-caption text-muted">Utility</span>
              </div>
              {spacingTokens.map(({ name, cssVar, px, rem, utility }) => (
                <div
                  role="listitem"
                  key={name}
                  className="grid gap-4 items-center"
                  style={{ gridTemplateColumns: `${pxToRem(140)} 1fr ${pxToRem(120)} ${pxToRem(160)}` }}
                >
                  <span className="text-label-sm font-semibold">{name}</span>
                  <MeasureBar cssVar={cssVar} label={`${name} ${px}, ${rem} 여백 길이 견본`} />
                  <TokenValue px={px} rem={rem} />
                  <span className="text-caption text-muted font-mono">{utility}</span>
                </div>
              ))}
            </div>
          </section>

          </div>{/* /panel-spacing-measure */}

          <div role="tabpanel" id="panel-spacing-radius" aria-labelledby="tab-spacing-radius" hidden={activeSpacingTab !== "radius"} className={contentSubTabPanelClass}>
          <section aria-labelledby="section-radius" className="mb-0">
            <ContentSectionTitle
              id="section-radius"
              lead
              description={
                <>
                  원본은 <strong>--shape-radius-*</strong>, 유틸리티 노출은 <strong>--radius-*</strong>로 분리해 이름 충돌을 피합니다.
                </>
              }
            >
              Radius
            </ContentSectionTitle>
            <div role="list" className="grid grid-cols-2 gap-4">
              {radiusTokens.map(({ name, px, rem, utility }) => (
                <div key={name} role="listitem" className="flex items-center gap-4 p-4 rounded-xl border border-line">
                  <div
                    role="img"
                    aria-label={`${name} ${px}, ${rem} 모서리 견본`}
                    className={`w-24 h-14 bg-accent border border-line-overlay ${utility}`}
                  />
                  <div>
                    <p className="m-0 text-label-sm font-semibold">{name}</p>
                    <p className="m-0 text-caption text-muted font-mono">
                      <span className="font-semibold text-foreground">{px}</span>
                      <span> · {rem} · {utility}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          </div>{/* /panel-spacing-radius */}

          <div role="tabpanel" id="panel-spacing-fixed-size" aria-labelledby="tab-spacing-fixed-size" hidden={activeSpacingTab !== "fixed-size"} className={contentSubTabPanelClass}>
          <section aria-labelledby="section-fixed-size" className="mb-0">
            <ContentSectionTitle
              id="section-fixed-size"
              lead
              description={
                <>
                  아이콘과 컨트롤처럼 반복되는 <strong>고정 크기</strong>입니다. <strong>--size-*</strong>를 spacing namespace에 연결해{" "}
                  <strong>size-*</strong>, <strong>h-*</strong> 계열로 사용할 수 있습니다.
                </>
              }
            >
              Fixed Size
            </ContentSectionTitle>
            <div className="flex flex-col gap-10">
              <div>
                <ContentGroupTitle>Icon Size</ContentGroupTitle>
                <div role="list" className="grid grid-cols-2 gap-4">
                  {iconSizeTokens.map(({ name, cssVar, px, rem, utility }) => (
                    <div key={name} role="listitem" className="p-4 rounded-xl border border-line">
                      <p className="m-0 text-label-sm font-semibold">{name}</p>
                      <p className="mt-0.5 mb-4 text-caption text-muted font-mono">
                        <span className="font-semibold text-foreground">{px}</span>
                        <span> · {rem} · {utility}</span>
                      </p>
                      <div className="flex flex-col gap-2">
                        <MeasureBar cssVar={cssVar} label={`${name} ${px}, ${rem} 아이콘 길이 견본`} height={pxToRem(10)} />
                        <div className="flex items-center gap-3">
                          <span aria-hidden="true" className="text-caption text-muted" style={{ width: pxToRem(56) }}>
                            square
                          </span>
                          <span
                            role="img"
                            aria-label={`${name} ${px}, ${rem} 아이콘 정사각 크기 견본`}
                            className="bg-accent"
                            style={{
                              width: `var(${cssVar})`,
                              height: `var(${cssVar})`,
                              borderRadius: pxToRem(2),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <ContentGroupTitle>Control Height</ContentGroupTitle>
                <div role="list" className="grid grid-cols-2 gap-4">
                  {controlSizeTokens.map(({ name, cssVar, px, rem, utility }) => (
                    <div key={name} role="listitem" className="p-4 rounded-xl border border-line">
                      <p className="m-0 text-label-sm font-semibold">{name}</p>
                      <p className="mt-0.5 mb-4 text-caption text-muted font-mono">
                        <span className="font-semibold text-foreground">{px}</span>
                        <span> · {rem} · {utility}</span>
                      </p>
                      <div className="flex flex-col gap-2">
                        <MeasureBar cssVar={cssVar} label={`${name} ${px}, ${rem} 컨트롤 높이 견본`} height={pxToRem(10)} />
                        <div className="flex items-center gap-3">
                          <span aria-hidden="true" className="text-caption text-muted" style={{ width: pxToRem(56) }}>
                            height
                          </span>
                          <span
                            role="img"
                            aria-label={`${name} ${px}, ${rem} 컨트롤 높이 실제 견본`}
                            className="bg-accent"
                            style={{
                              width: pxToRem(112),
                              height: `var(${cssVar})`,
                              borderRadius: pxToRem(2),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          </div>{/* /panel-spacing-fixed-size */}

        
    </div>
  );
}
