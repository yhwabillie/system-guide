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

const radiusSystemMeta = {
  "radius-none": {
    level: "None",
    container: "직각 요소",
    usage: "모서리 표현을 제거해야 하는 정렬용 견본이나 직각 UI에 사용합니다.",
    components: "Square swatch",
    previewClass: "h-12 w-16",
  },
  "radius-sm": {
    level: "Small",
    container: "작은 컨트롤",
    usage: "작은 칩, 보조 태그처럼 면적이 좁은 요소에 사용합니다.",
    components: "Chip, Tag",
    previewClass: "h-12 w-20",
  },
  "radius-md": {
    level: "Medium",
    container: "기본 컨트롤",
    usage: "버튼, 입력 필드처럼 기본 조작 요소에 사용하는 표준 radius입니다.",
    components: "Button, Text input, Select",
    previewClass: "h-14 w-24",
  },
  "radius-lg": {
    level: "Large",
    container: "카드 내부 블록",
    usage: "정보 블록, 작은 패널처럼 컨테이너 성격이 있는 요소에 사용합니다.",
    components: "Panel, Preview block",
    previewClass: "h-16 w-28",
  },
  "radius-xl": {
    level: "Xlarge",
    container: "카드",
    usage: "카드와 섹션 박스처럼 화면에서 독립된 면을 만들 때 사용합니다.",
    components: "Card, Section box",
    previewClass: "h-16 w-32",
  },
  "radius-2xl": {
    level: "2Xlarge",
    container: "큰 카드",
    usage: "강조 카드나 넓은 표면처럼 큰 컨테이너에 사용합니다.",
    components: "Large card, Dialog surface",
    previewClass: "h-20 w-36",
  },
  "radius-full": {
    level: "Full",
    container: "캡슐 형태",
    usage: "항상 pill 형태를 유지해야 하는 배지나 원형 요소에 사용합니다.",
    components: "Badge, Pill button, Avatar",
    previewClass: "h-12 w-36",
  },
} as const;

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
            <div className="flex flex-col gap-8">
              <div role="list" aria-label="Radius 토큰 시각 비교" className="overflow-hidden rounded-xl border border-gray-20">
                {radiusTokens.map(({ name, px, rem, utility }) => {
                  const meta = radiusSystemMeta[name as keyof typeof radiusSystemMeta];
                  return (
                    <div key={name} role="listitem" className="grid grid-cols-[12rem_1fr_5rem] items-center gap-4 border-b border-gray-20 px-4 py-3 last:border-b-0">
                      <div className="min-w-0">
                        <TokenChip copyValue={utility}>{utility}</TokenChip>
                        <p className="m-0 mt-1 text-caption font-mono foreground-muted">{name}</p>
                      </div>
                      <div className="relative flex min-h-20 items-center justify-center overflow-hidden rounded-md surface-subtle">
                        <span aria-hidden="true" className="absolute inset-x-4 top-1/2 border-t border-dashed border-subtle" />
                        <div
                          role="img"
                          aria-label={`${name} ${px}, ${rem} 모서리 견본`}
                          className={`relative z-10 surface-brand border border-subtle ${utility} ${meta.previewClass}`}
                        />
                      </div>
                      <span className="justify-self-end rounded-md border border-default px-2 py-1 text-caption font-mono foreground-muted">
                        {px}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-20">
                <table className="w-full min-w-[56rem] border-collapse text-left">
                  <caption className="sr-only">Radius 레벨별 사용 기준</caption>
                  <thead>
                    <tr className="border-b border-gray-20 bg-gray-5">
                      <th scope="col" className="w-28 px-4 py-3 text-label-xsmall font-bold foreground-default">Level</th>
                      <th scope="col" className="px-4 py-3 text-label-xsmall font-bold foreground-default">Usage</th>
                      <th scope="col" className="w-36 px-4 py-3 text-label-xsmall font-bold foreground-default">Container</th>
                      <th scope="col" className="w-32 px-4 py-3 text-label-xsmall font-bold foreground-default">Radius</th>
                      <th scope="col" className="w-44 px-4 py-3 text-label-xsmall font-bold foreground-default">Components</th>
                    </tr>
                  </thead>
                  <tbody>
                    {radiusTokens.map(({ name, px, rem }) => {
                      const meta = radiusSystemMeta[name as keyof typeof radiusSystemMeta];
                      return (
                        <tr key={name} className="border-b border-gray-20 last:border-b-0">
                          <th scope="row" className="px-4 py-4 align-top text-label-xsmall font-semibold foreground-default">{meta.level}</th>
                          <td className="px-4 py-4 align-top text-body-small foreground-default">{meta.usage}</td>
                          <td className="px-4 py-4 align-top text-caption foreground-muted">{meta.container}</td>
                          <td className="px-4 py-4 align-top font-mono text-caption foreground-muted">
                            <span className="font-semibold foreground-default">{px}</span>
                            <span> · {rem}</span>
                          </td>
                          <td className="px-4 py-4 align-top text-caption foreground-muted">{meta.components}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
