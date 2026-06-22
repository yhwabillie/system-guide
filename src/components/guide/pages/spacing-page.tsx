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
  iconSizeTokens,
  MeasureBar,
  radiusTokens,
  spacingTokens,
  TokenChip,
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
                  간격은 Tailwind 기본 spacing과 같은 <strong>4px 단위</strong>를 사용하지만, 디자인 시스템의 공식 scale로 <strong>--space-*</strong>에 명시합니다.{" "}
                  이 값은 <strong>--spacing-*</strong> bridge를 통해 <strong>p-*</strong>, <strong>m-*</strong>, <strong>gap-*</strong> 유틸리티의 기준이 됩니다.
                </>
              }
            >
              Spacing
            </ContentSectionTitle>
            <div className="overflow-x-auto rounded-xl border border-gray-20">
              <table className="w-full min-w-[56rem] border-collapse text-left">
                <caption className="sr-only">Spacing 토큰별 유틸리티 클래스, 미리보기, 크기, 토큰명</caption>
                <thead>
                  <tr className="border-b border-gray-20 bg-gray-5">
                    <th scope="col" className="w-72 px-4 py-3 text-label-xsmall font-bold foreground-default">Utility Class</th>
                    <th scope="col" className="px-4 py-3 text-label-xsmall font-bold foreground-default">Preview</th>
                    <th scope="col" className="w-32 px-4 py-3 text-label-xsmall font-bold foreground-default">Size</th>
                    <th scope="col" className="w-36 px-4 py-3 text-label-xsmall font-bold foreground-default">Token</th>
                  </tr>
                </thead>
                <tbody>
                  {spacingTokens.map(({ name, cssVar, px, rem, utility }) => (
                    <tr key={name} className="border-b border-gray-20 last:border-b-0">
                      <td className="px-4 py-4 align-middle">
                        <div className="flex flex-wrap gap-2">
                          {utility.split(" / ").map((utilityClass) => (
                            <TokenChip key={utilityClass} copyValue={utilityClass}>
                              {utilityClass}
                            </TokenChip>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <MeasureBar cssVar={cssVar} label={`${name} ${px}, ${rem} 여백 길이 견본`} variant="gap" />
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <TokenValue px={px} rem={rem} />
                      </td>
                      <td className="px-4 py-4 align-middle text-caption font-mono foreground-muted">{name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  모서리 값은 <strong>--shape-radius-*</strong> primitive token으로 정의하고, <strong>--radius-*</strong> bridge를 통해 <strong>rounded-*</strong> 유틸리티로 사용합니다.
                </>
              }
            >
              Radius
            </ContentSectionTitle>
            <div role="list" className="grid grid-cols-2 gap-4">
              {radiusTokens.map(({ name, px, rem, utility }) => (
                <div key={name} role="listitem" className="flex items-center gap-4 p-4 rounded-xl border border-default">
                  <div
                    role="img"
                    aria-label={`${name} ${px}, ${rem} 모서리 견본`}
                    className={`w-24 h-14 surface-brand border border-subtle ${utility}`}
                  />
                  <div className="min-w-0">
                    <TokenChip copyValue={utility}>{utility}</TokenChip>
                    <p className="m-0 mt-2 text-caption foreground-muted font-mono">
                      <span className="font-semibold foreground-default">{px}</span>
                      <span> · {rem}</span>
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
                    <div key={name} role="listitem" className="p-4 rounded-xl border border-default">
                      <p className="m-0 text-label-xsmall font-semibold">{name}</p>
                      <p className="mt-0.5 mb-4 text-caption foreground-muted font-mono">
                        <span className="font-semibold foreground-default">{px}</span>
                        <span> · {rem} · {utility}</span>
                      </p>
                      <div className="flex flex-col gap-2">
                        <MeasureBar cssVar={cssVar} label={`${name} ${px}, ${rem} 아이콘 길이 견본`} height={pxToRem(10)} />
                        <div className="flex items-center gap-3">
                          <span aria-hidden="true" className="text-caption foreground-muted" style={{ width: pxToRem(56) }}>
                            square
                          </span>
                          <span
                            role="img"
                            aria-label={`${name} ${px}, ${rem} 아이콘 정사각 크기 견본`}
                            className="surface-brand"
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
                    <div key={name} role="listitem" className="p-4 rounded-xl border border-default">
                      <p className="m-0 text-label-xsmall font-semibold">{name}</p>
                      <p className="mt-0.5 mb-4 text-caption foreground-muted font-mono">
                        <span className="font-semibold foreground-default">{px}</span>
                        <span> · {rem} · {utility}</span>
                      </p>
                      <div className="flex flex-col gap-2">
                        <MeasureBar cssVar={cssVar} label={`${name} ${px}, ${rem} 컨트롤 높이 견본`} height={pxToRem(10)} />
                        <div className="flex items-center gap-3">
                          <span aria-hidden="true" className="text-caption foreground-muted" style={{ width: pxToRem(56) }}>
                            height
                          </span>
                          <span
                            role="img"
                            aria-label={`${name} ${px}, ${rem} 컨트롤 높이 실제 견본`}
                            className="surface-brand"
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
