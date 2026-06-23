"use client";

import { useRef } from "react";
import { layoutPageColSpanFull } from "@/lib/layout-tokens";
import {
  contentSubTabPanelClass,
  ContentIntroLayout,
  ContentOutlineTabList,
  ContentTitleBlock,
  controlSizeTokens,
  GuideContentLayout,
  iconSizeTokens,
  MeasureBar,
  radiusTokens,
  spacingTokens,
  spinnerSizeTokens,
  TabDescriptionCallout,
  TokenChip,
  TokenValue,
} from "@/components/guide/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { guideSpacingTabHref } from "@/lib/guide-routes";

const fixedSizeTocSections = [
  { id: "section-fixed-size", label: "Fixed Size", level: 1 as const },
  { id: "fixed-size-icon-size", label: "Icon Size", level: 2 as const },
  { id: "fixed-size-control-size", label: "Control Size", level: 2 as const },
  { id: "fixed-size-spinner-size", label: "Spinner Size", level: 2 as const },
];

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
        <ContentIntroLayout>
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

          </ContentIntroLayout>

          <div role="tabpanel" id="panel-spacing-measure" aria-labelledby="tab-spacing-measure" hidden={activeSpacingTab !== "spacing"} className={contentSubTabPanelClass}>
          <section id="section-spacing" aria-label="Spacing" className="mb-0">
            <TabDescriptionCallout margin="mb-20" tone="info">
              <div className="flex flex-col gap-2">
                <p className="m-0">간격은 Tailwind 기본 spacing과 같은 <strong>4px 단위</strong>를 사용하되, 디자인 시스템의 공식 scale로 <strong>--space-*</strong>에 명시합니다.</p>
                <p className="m-0"><strong>--spacing-*</strong> bridge를 통해 <strong>p-*</strong>, <strong>m-*</strong>, <strong>gap-*</strong> 유틸리티의 기준값으로 사용합니다.</p>
              </div>
            </TabDescriptionCallout>
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
          <section id="section-radius" aria-label="Radius" className="mb-0">
            <TabDescriptionCallout margin="mb-20" tone="info">
              <div className="flex flex-col gap-2">
                <p className="m-0">모서리 값은 <strong>--shape-radius-*</strong> primitive token으로 정의합니다.</p>
                <p className="m-0"><strong>--radius-*</strong> bridge를 통해 <strong>rounded-*</strong> 유틸리티로 사용합니다.</p>
              </div>
            </TabDescriptionCallout>
            <div className="flex flex-col gap-8">
              <div role="list" aria-label="Radius 토큰 시각 비교" className="overflow-hidden rounded-xl border border-gray-20">
                {radiusTokens.map(({ name, px, rem, utility }) => {
                  const meta = radiusSystemMeta[name as keyof typeof radiusSystemMeta];
                  return (
                    <div key={name} role="listitem" className="grid grid-cols-[12rem_1fr_5rem] items-center gap-4 border-b border-gray-20 px-4 py-3 last:border-b-0">
                      <div className="min-w-0">
                        <TokenChip copyValue={utility}>{utility}</TokenChip>
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
          <GuideContentLayout sections={fixedSizeTocSections}>
          <section id="section-fixed-size" aria-label="Fixed Size" className="mb-0">
            <TabDescriptionCallout margin="mb-20" tone="info">
              <div className="flex flex-col gap-2">
                <p className="m-0">아이콘, 스피너, 컨트롤처럼 반복되는 고정 크기는 <strong>--size-*</strong> primitive token으로 관리합니다.</p>
                <p className="m-0"><strong>--spacing-icon-*</strong>, <strong>--spacing-spinner-*</strong>, <strong>--spacing-control-*</strong> bridge를 통해 <strong>size-icon-*</strong>, <strong>size-spinner-*</strong>, <strong>size-control-*</strong> 유틸리티로 사용합니다.</p>
              </div>
            </TabDescriptionCallout>
            <div className="flex flex-col gap-20">
              <div>
                <header className="mb-5">
                  <h3 id="fixed-size-icon-size" className="m-0 scroll-mt-[calc(3.75rem+1.5rem)] text-heading-large font-bold leading-base foreground-brand">Icon Size</h3>
                  <p className="m-0 mt-3 text-body-medium foreground-subtle">
                    시스템 아이콘은 <strong>24px</strong>를 기본 크기로 두고, 보조 아이콘부터 강조 아이콘까지 <strong>16px·20px·24px·32px·40px</strong> 범위를 사용합니다.
                  </p>
                </header>
                <div className="mb-6 rounded-xl border border-dashed border-default surface-subtle px-6 py-8">
                  <div role="list" aria-label="아이콘 크기 비교" className="flex items-center justify-center gap-8">
                    {iconSizeTokens.map(({ name, cssVar, px }) => (
                      <div key={name} role="listitem" className="flex flex-col items-center gap-2">
                        <span
                          role="img"
                          aria-label={`${name} ${px} 아이콘 크기 견본`}
                          className="block surface-brand border border-subtle"
                          style={{
                            width: `var(${cssVar})`,
                            height: `var(${cssVar})`,
                          }}
                        />
                        <span className="font-mono text-caption foreground-muted">{px}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-20">
                  <table className="w-full min-w-[42rem] border-collapse text-left">
                    <caption className="sr-only">Icon size 토큰별 유틸리티 클래스와 크기</caption>
                    <thead>
                      <tr className="border-b border-gray-20 bg-gray-5">
                        <th scope="col" className="w-44 px-4 py-3 text-label-xsmall font-bold foreground-default">Utility Class</th>
                        <th scope="col" className="w-36 px-4 py-3 text-label-xsmall font-bold foreground-default">Size</th>
                        <th scope="col" className="px-4 py-3 text-label-xsmall font-bold foreground-default">Usage</th>
                        <th scope="col" className="w-36 px-4 py-3 text-label-xsmall font-bold foreground-default">Token</th>
                      </tr>
                    </thead>
                    <tbody>
                      {iconSizeTokens.map(({ name, px, rem, utility }) => (
                        <tr key={name} className="border-b border-gray-20 last:border-b-0">
                          <td className="px-4 py-4 align-middle">
                            <TokenChip copyValue={utility}>{utility}</TokenChip>
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <TokenValue px={px} rem={rem} />
                          </td>
                          <td className="px-4 py-4 align-middle text-body-small foreground-default">
                            {name === "icon-xs"
                              ? "인라인 보조 아이콘"
                              : name === "icon-sm"
                                ? "작은 버튼·보조 액션"
                                : name === "icon-md"
                                  ? "일반 UI 기본 아이콘"
                                  : name === "icon-lg"
                                    ? "섹션 강조 아이콘"
                                    : "큰 상태·강조 아이콘"}
                          </td>
                          <td className="px-4 py-4 align-middle text-caption font-mono foreground-muted">{name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <header className="mb-5">
                  <h3 id="fixed-size-control-size" className="m-0 scroll-mt-[calc(3.75rem+1.5rem)] text-heading-large font-bold leading-base foreground-brand">Control Size</h3>
                  <p className="m-0 mt-3 text-body-medium foreground-subtle">
                    버튼, 아이콘 버튼, input, search bar, selectbox, combobox, tab처럼 한 줄에 함께 놓이는 인터랙션 컴포넌트는 <strong>40px·48px·56px·64px</strong> 높이 scale을 공유합니다.
                  </p>
                </header>
                <div className="mb-6 rounded-xl border border-dashed border-default surface-subtle px-6 py-8">
                  <div role="list" aria-label="컨트롤 크기 비교" className="flex items-end justify-center gap-6">
                    {controlSizeTokens.map(({ name, cssVar, px }) => (
                      <div key={name} role="listitem" className="flex flex-col items-center gap-2">
                        <span
                          role="img"
                          aria-label={`${name} ${px} 컨트롤 높이 견본`}
                          className="block w-32 surface-brand border border-subtle"
                          style={{
                            height: `var(${cssVar})`,
                          }}
                        />
                        <span className="font-mono text-caption foreground-muted">{px}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-20">
                  <table className="w-full min-w-[42rem] border-collapse text-left">
                    <caption className="sr-only">Control size 토큰별 유틸리티 클래스와 크기</caption>
                    <thead>
                      <tr className="border-b border-gray-20 bg-gray-5">
                        <th scope="col" className="w-44 px-4 py-3 text-label-xsmall font-bold foreground-default">Utility Class</th>
                        <th scope="col" className="w-36 px-4 py-3 text-label-xsmall font-bold foreground-default">Size</th>
                        <th scope="col" className="px-4 py-3 text-label-xsmall font-bold foreground-default">Usage</th>
                        <th scope="col" className="w-36 px-4 py-3 text-label-xsmall font-bold foreground-default">Token</th>
                      </tr>
                    </thead>
                    <tbody>
                      {controlSizeTokens.map(({ name, px, rem, utility }) => (
                        <tr key={name} className="border-b border-gray-20 last:border-b-0">
                          <td className="px-4 py-4 align-middle">
                            <TokenChip copyValue={utility}>{utility}</TokenChip>
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <TokenValue px={px} rem={rem} />
                          </td>
                          <td className="px-4 py-4 align-middle text-body-small foreground-default">
                            {name === "control-sm"
                              ? "밀도 높은 툴바·테이블 필터"
                              : name === "control-md"
                                ? "일반 폼·기본 버튼"
                                : name === "control-lg"
                                  ? "검색 바·강조 입력"
                                  : "히어로 검색·넓은 선택 컨트롤"}
                          </td>
                          <td className="px-4 py-4 align-middle text-caption font-mono foreground-muted">{name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <header className="mb-5">
                  <h3 id="fixed-size-spinner-size" className="m-0 scroll-mt-[calc(3.75rem+1.5rem)] text-heading-large font-bold leading-base foreground-brand">Spinner Size</h3>
                  <p className="m-0 mt-3 text-body-medium foreground-subtle">
                    로딩 상태의 위계와 배치 맥락에 맞춰 <strong>20px·32px·48px</strong> 스피너 크기를 사용합니다.
                  </p>
                </header>
                <div className="mb-6 rounded-xl border border-dashed border-default surface-subtle px-6 py-8">
                  <div role="list" aria-label="스피너 크기 비교" className="flex items-end justify-center gap-10">
                    {spinnerSizeTokens.map(({ name, cssVar, px, rem }) => (
                      <div key={name} role="listitem" className="flex flex-col items-center gap-2">
                        <span
                          role="img"
                          aria-label={`${name} ${px} 스피너 크기 견본`}
                          className="block surface-brand border border-subtle"
                          style={{
                            width: `var(${cssVar}, ${rem})`,
                            height: `var(${cssVar}, ${rem})`,
                          }}
                        />
                        <span className="font-mono text-caption foreground-muted">{px}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-20">
                  <table className="w-full min-w-[42rem] border-collapse text-left">
                    <caption className="sr-only">Spinner size 토큰별 유틸리티 클래스와 크기</caption>
                    <thead>
                      <tr className="border-b border-gray-20 bg-gray-5">
                        <th scope="col" className="w-44 px-4 py-3 text-label-xsmall font-bold foreground-default">Utility Class</th>
                        <th scope="col" className="w-36 px-4 py-3 text-label-xsmall font-bold foreground-default">Size</th>
                        <th scope="col" className="px-4 py-3 text-label-xsmall font-bold foreground-default">Usage</th>
                        <th scope="col" className="w-36 px-4 py-3 text-label-xsmall font-bold foreground-default">Token</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spinnerSizeTokens.map(({ name, px, rem, utility }) => (
                        <tr key={name} className="border-b border-gray-20 last:border-b-0">
                          <td className="px-4 py-4 align-middle">
                            <TokenChip copyValue={utility}>{utility}</TokenChip>
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <TokenValue px={px} rem={rem} />
                          </td>
                          <td className="px-4 py-4 align-middle text-body-small foreground-default">
                            {name === "spinner-lg"
                              ? "페이지·섹션 로딩"
                              : name === "spinner-md"
                                ? "패널·카드 로딩"
                                : "버튼·인라인 로딩"}
                          </td>
                          <td className="px-4 py-4 align-middle text-caption font-mono foreground-muted">{name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
          </GuideContentLayout>

          </div>{/* /panel-spacing-fixed-size */}

        
    </div>
  );
}
