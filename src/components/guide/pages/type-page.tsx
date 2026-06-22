"use client";

import { useRef } from "react";
import { layoutPageColSpanFull } from "@/lib/layout-tokens";
import {
  contentSubTabPanelClass,
  ContentIntroShell,
  ContentOutlineTabList,
  ContentTitleBlock,
  CodeBlock,
  ExternalTextLink,
  FontStackCuration,
  GuideContentLayout,
  TabDescriptionCallout,
  TypeScaleBaseGuide,
  TypographyScaleTable,
  fontFamilyTocSections,
  typographyTocSections,
} from "@/components/guide/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { guideTypeTabHref } from "@/lib/guide-routes";
import { pxToRem } from "@/lib/tokens";

export function GuideTypePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTypeTab = searchParams.get("tab") === "typography" ? "typography" : "font-family";
  const selectTypeSection = (sub: "font-family" | "typography") => router.push(guideTypeTabHref(sub));
  const fontFamilyTabRef = useRef<HTMLButtonElement>(null);
  const typographyTabRef = useRef<HTMLButtonElement>(null);
  function handleTypeTabKeyDown(e: React.KeyboardEvent) {
    const order: ("font-family" | "typography")[] = ["font-family", "typography"];
    const refs = { "font-family": fontFamilyTabRef, typography: typographyTabRef };
    let next: "font-family" | "typography" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(order.indexOf(activeTypeTab) + 1) % order.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(order.indexOf(activeTypeTab) - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) { e.preventDefault(); selectTypeSection(next); refs[next].current?.focus(); }
  }
  return (
    <div className={layoutPageColSpanFull}>
        <ContentIntroShell>
        <ContentTitleBlock
          title="Font & Type"
          titleId="content-type"
        />

        <ContentOutlineTabList
          ariaLabel="Font & Type 카테고리"
          activeValue={activeTypeTab}
          onSelect={(value) => selectTypeSection(value as "font-family" | "typography")}
          onKeyDown={handleTypeTabKeyDown}
          tabs={[
            { value: "font-family", tabId: "tab-type-font-family", panelId: "panel-type-font-family", label: "Font Stack", ref: fontFamilyTabRef },
            { value: "typography", tabId: "tab-type-typography", panelId: "panel-type-typography", label: "Type Scale", ref: typographyTabRef },
          ]}
        />

        </ContentIntroShell>

        <div role="tabpanel" id="panel-type-font-family" aria-labelledby="tab-type-font-family" hidden={activeTypeTab !== "font-family"} className={contentSubTabPanelClass}>
        <GuideContentLayout sections={fontFamilyTocSections}>
        <section id="section-font-stack" aria-label="Font Stack" className="mb-0">
          <FontStackCuration />

          <header className="mt-20 mb-5">
            <h3 className="m-0 text-heading-large font-bold leading-base foreground-brand">
              Font Family
            </h3>
            <p className="m-0 mt-3 max-w-3xl text-body-medium leading-base foreground-subtle">
              프로젝트에서 실제로 사용하는 기본 폰트와 폴백 폰트의 역할, 출처, 적용 방식을 정리합니다.
            </p>
          </header>

          {/* Pretendard GOV */}
          <div className="rounded-2xl border border-gray-20 overflow-hidden">
            <div className="py-3 px-10 bg-gray-5 border-b border-gray-20">
              <h4 className="m-0 text-label-large font-semibold foreground-default">Pretendard GOV</h4>
              <p className="m-0 mt-1 text-caption foreground-subtle">기본 폰트 · 1순위</p>
            </div>
            <div className="py-12 px-10 bg-gray-5 border-b border-gray-20 flex flex-col gap-1">
              <span role="img" aria-label="Pretendard GOV 글꼴 견본" className="block font-bold leading-base" style={{ fontSize: pxToRem(48), fontFamily: "var(--font-pretendard-gov), sans-serif" }}>Pretendard GOV</span>
              <span role="img" aria-label="한글 견본" className="block font-normal leading-base" style={{ fontSize: pxToRem(24), fontFamily: "var(--font-pretendard-gov), sans-serif" }}>
                가나다라마바사아자차카타파하 — ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </span>
              <span role="img" aria-label="영문·숫자·특수문자 견본" className="block font-normal leading-base text-gray-60" style={{ fontSize: pxToRem(18), fontFamily: "var(--font-pretendard-gov), sans-serif" }}>
                abcdefghijklmnopqrstuvwxyz — 0123456789 !@#$%^&*()
              </span>
            </div>

            <div className="py-8 px-10 grid grid-cols-2 gap-8">
              <dl className="flex flex-col gap-4 m-0">
                {[
                  { label: "폰트명", value: "Pretendard GOV" },
                  { label: "제작자", value: "Kil Hyung-jin (orioncactus)" },
                  { label: "버전", value: "v1.3.9" },
                  { label: "라이선스", value: "SIL Open Font License 1.1 (OFL-1.1) — 상업적 사용 가능, 수정·재배포 가능" },
                  { label: "기반 폰트", value: "Inter (라틴) + Apple SD Gothic Neo (한글) — Apple의 산돌 서체 기반" },
                  { label: "CSS 변수", value: "--font-pretendard-gov" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-caption text-gray-60 font-semibold tracking-normal uppercase">{label}</dt>
                    <dd className="text-body-small mt-0.5 ml-0">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-caption text-gray-60 font-semibold tracking-normal uppercase mb-0.5">공식 GitHub</p>
                  <ExternalTextLink href="https://github.com/orioncactus/pretendard">
                    github.com/orioncactus/pretendard
                  </ExternalTextLink>
                </div>
                <div>
                  <p className="text-caption text-gray-60 font-semibold tracking-normal uppercase mb-0.5">원본 다운로드</p>
                  <ExternalTextLink href="https://github.com/orioncactus/pretendard/releases/tag/v1.3.9">
                    github.com/orioncactus/pretendard/releases/tag/v1.3.9
                  </ExternalTextLink>
                  <p className="mt-1 text-caption text-gray-60">Assets → pretendard-gov.zip 다운로드</p>
                </div>
                <div>
                  <p className="text-caption text-gray-60 font-semibold tracking-normal uppercase mb-1">이 프로젝트 적용 방식</p>
                  <p className="mb-2 text-caption text-gray-60">자체 호스팅 — next/font/local (런타임 외부 요청 0). variable woff2를 src/app/fonts에 보관.</p>
                  <CodeBlock code={`localFont({
  src: "./fonts/PretendardGOVVariable.woff2",
  weight: "100 900",
  variable: "--font-pretendard-gov",
})`} />
                </div>
                <div>
                  <p className="text-caption text-gray-60 font-semibold tracking-normal uppercase mb-1">GOV 버전 특징</p>
                  <ul className="m-0 pl-4 flex flex-col gap-1">
                    {["공공기관·정부 웹사이트 최적화", "한국 웹 접근성 지침(KWCAG) 대응", "완성형 한글 11,172자 전체 지원", "다양한 weight 지원 (100–900)"].map((item) => (
                      <li key={item} className="text-caption text-gray-60">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="py-6 px-10 border-t border-gray-20 flex flex-col gap-3">
              <p className="text-caption text-gray-60 font-semibold tracking-normal uppercase m-0">Weight</p>
              <div className="grid grid-cols-5 gap-4">
                {[{ weight: 100, label: "Thin" }, { weight: 300, label: "Light" }, { weight: 400, label: "Regular" }, { weight: 600, label: "SemiBold" }, { weight: 700, label: "Bold" }].map(({ weight, label }) => (
                  <div key={weight} className="flex flex-col gap-0.5">
                    <span role="img" aria-label={`${weight} ${label} 견본`} className="leading-base" style={{ fontSize: pxToRem(24), fontWeight: weight, fontFamily: "var(--font-pretendard-gov), sans-serif" }}>가나다 Aa</span>
                    <span className="text-caption text-gray-60">{weight} · {label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Noto Sans KR */}
          <div className="mt-8 rounded-2xl border border-gray-20 overflow-hidden">
            <div className="py-3 px-10 bg-gray-5 border-b border-gray-20">
              <h4 className="m-0 text-label-large font-semibold foreground-default">Noto Sans KR</h4>
              <p className="m-0 mt-1 text-caption foreground-subtle">폴백 폰트 · 2순위 · Pretendard 미로드 시 로드</p>
            </div>
            <div className="py-12 px-10 bg-gray-5 border-b border-gray-20 flex flex-col gap-1">
              <span role="img" aria-label="Noto Sans KR 글꼴 견본" className="block font-bold leading-base" style={{ fontSize: pxToRem(48), fontFamily: "var(--font-noto), sans-serif" }}>Noto Sans KR</span>
              <span role="img" aria-label="한글 견본" className="block font-normal leading-base" style={{ fontSize: pxToRem(24), fontFamily: "var(--font-noto), sans-serif" }}>
                가나다라마바사아자차카타파하 — ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </span>
              <span role="img" aria-label="영문·숫자·특수문자 견본" className="block font-normal leading-base text-gray-60" style={{ fontSize: pxToRem(18), fontFamily: "var(--font-noto), sans-serif" }}>
                abcdefghijklmnopqrstuvwxyz — 0123456789 !@#$%^&*()
              </span>
            </div>

            <div className="py-8 px-10 grid grid-cols-2 gap-8">
              <dl className="flex flex-col gap-4 m-0">
                {[
                  { label: "폰트명", value: "Noto Sans KR" },
                  { label: "제작자", value: "Google" },
                  { label: "역할", value: "Pretendard GOV 미로드 시 폴백 (font-family 2순위)" },
                  { label: "라이선스", value: "SIL Open Font License 1.1 (OFL-1.1) — 상업적 사용 가능, 수정·재배포 가능" },
                  { label: "제공 weight", value: "100 Thin · 300 Light · 400 Regular · 500 Medium · 600 SemiBold · 700 Bold (static woff2)" },
                  { label: "CSS 변수", value: "--font-noto" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-caption text-gray-60 font-semibold tracking-normal uppercase">{label}</dt>
                    <dd className="text-body-small mt-0.5 ml-0">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-caption text-gray-60 font-semibold tracking-normal uppercase mb-0.5">공식 페이지</p>
                  <ExternalTextLink href="https://fonts.google.com/noto/specimen/Noto+Sans+KR">
                    fonts.google.com/noto/specimen/Noto+Sans+KR
                  </ExternalTextLink>
                </div>
                <div>
                  <p className="text-caption text-gray-60 font-semibold tracking-normal uppercase mb-0.5">원본 저장소</p>
                  <ExternalTextLink href="https://github.com/notofonts/noto-cjk">
                    github.com/notofonts/noto-cjk
                  </ExternalTextLink>
                  <p className="mt-1 text-caption text-gray-60">한글 static woff2를 src/app/fonts에 self-host</p>
                </div>
                <div>
                  <p className="text-caption text-gray-60 font-semibold tracking-normal uppercase mb-1">이 프로젝트 적용 방식</p>
                  <p className="mb-2 text-caption text-gray-60">자체 호스팅 — next/font/local. <code className="font-mono">preload: false</code>로 평상시 다운로드를 막고, Pretendard 미로드 시에만 브라우저가 폴백으로 로드합니다.</p>
                  <CodeBlock code={`localFont({
  src: [
    { path: "./fonts/NotoSansKR-100.woff2", weight: "100" },
    { path: "./fonts/NotoSansKR-300.woff2", weight: "300" },
    { path: "./fonts/NotoSansKR-400.woff2", weight: "400" },
    { path: "./fonts/NotoSansKR-500.woff2", weight: "500" },
    { path: "./fonts/NotoSansKR-600.woff2", weight: "600" },
    { path: "./fonts/NotoSansKR-700.woff2", weight: "700" },
  ],
  variable: "--font-noto",
  preload: false,
})`}
                  />
                </div>
                <div>
                  <p className="text-caption text-gray-60 font-semibold tracking-normal uppercase mb-1">폴백 적용 시 유의사항</p>
                  <ul className="m-0 pl-4 flex flex-col gap-1">
                    {[
                      "next/font/google 사용 불가 — Google 메타데이터에 complete Korean subset이 없어 한글 글리프 누락",
                      "반드시 로컬 woff2 self-host로 한글 글리프 보장",
                      "font-synthesis-weight: none — 미제공 weight는 브라우저가 합성하지 않으므로 타이포 토큰(400·500·600·700) weight 파일 필요",
                      "런타임 CDN 요청 없음 — 공공·폐쇄망·CSP 환경 대응",
                      "Pretendard 로드 실패 시에만 네트워크·용량 비용 발생",
                    ].map((item) => (
                      <li key={item} className="text-caption text-gray-60">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="py-6 px-10 border-t border-gray-20 flex flex-col gap-3">
              <p className="text-caption text-gray-60 font-semibold tracking-normal uppercase m-0">Weight</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { weight: 100, label: "Thin" },
                  { weight: 300, label: "Light" },
                  { weight: 400, label: "Regular" },
                  { weight: 500, label: "Medium" },
                  { weight: 600, label: "SemiBold" },
                  { weight: 700, label: "Bold" },
                ].map(({ weight, label }) => (
                  <div key={weight} className="flex flex-col gap-0.5">
                    <span role="img" aria-label={`${weight} ${label} 견본`} className="leading-base" style={{ fontSize: pxToRem(24), fontWeight: weight, fontFamily: "var(--font-noto), sans-serif" }}>가나다 Aa</span>
                    <span className="text-caption text-gray-60">{weight} · {label}</span>
                  </div>
                ))}
              </div>
              <p className="m-0 text-caption foreground-subtle">
                타이포 토큰의 <span className="font-mono">font-medium(500)</span>·<span className="font-mono">font-semibold(600)</span>도 self-host 파일로 제공합니다. Pretendard는 variable(100–900), Noto는 동일 구간을 static weight로 대응합니다.
              </p>
            </div>
          </div>
        </section>

        </GuideContentLayout>
        </div>{/* /panel-type-font-family */}

        <div role="tabpanel" id="panel-type-typography" aria-labelledby="tab-type-typography" hidden={activeTypeTab !== "typography"} className={contentSubTabPanelClass}>
        <GuideContentLayout sections={typographyTocSections}>
        <section id="section-typography-scale" aria-label="Type Scale" className="mb-0">
          <TabDescriptionCallout>
            <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
              <li>다양한 크기의 텍스트를 일관되게 사용할 수 있도록 역할과 스타일에 따라 구분해 정의합니다.</li>
              <li>반응형에 대응하기 위해 개발 코드에서는 px 고정값 대신 <strong>rem</strong> 기반 토큰과 <strong>typo-*</strong> 묶음 유틸리티를 사용합니다.</li>
              <li>토큰 이름은 해상도별로 분리하지 않고 유지하며, <strong>display-*</strong>와 가이드 상위 타이틀처럼 큰 제목 계층만 breakpoint별 값으로 재매핑합니다.</li>
            </ul>
          </TabDescriptionCallout>
          <TypeScaleBaseGuide />
          <TypographyScaleTable />
        </section>

        </GuideContentLayout>
        </div>{/* /panel-type-typography */}

        
    </div>
  );
}
