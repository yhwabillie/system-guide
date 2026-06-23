"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { layoutPageColSpanFull } from "@/lib/layout-tokens";
import {
  checkerDark,
  checkerLight,
  colorRawTocSections,
  contentSubTabPanelClass,
  ContrastCategory,
  ContrastColorPickButton,
  ContrastSwatchFill,
  ContrastSwatchRoleMarker,
  contrastResultSurfaceClass,
  contrastPickCloseIcon,
  ContentGroupTitle,
  ContentIntroLayout,
  ContentOutlineTabList,
  ContentSectionTitle,
  ContentTitleBlock,
  GuideContentLayout,
  LevelBadge,
  levelStyle,
  NavIcon,
  outlineIconCatalog,
  probeSemanticUtilityColor,
  ProjectIconGlyph,
  rawPaletteSwatchClass,
  RawPaletteSwatchFill,
  rawAlphaCatalog,
  semanticColorCatalog,
  semanticBlurCatalog,
  semanticGradientCatalog,
  semanticOverlayCatalog,
  semanticShadowCatalog,
  SemanticColorCategorySection,
  SemanticColorGroupGrid,
  SemanticColorSwatchCard,
  SemanticBlurSwatchCard,
  SemanticGradientSwatchCard,
  SemanticOverlaySwatchCard,
  SemanticShadowSwatchCard,
  SemanticTokenFamilySection,
  semanticTocSections,
  semanticUtilityCatalog,
  TabDescriptionCallout,
  backgroundAnchors,
  type SwatchInfo,
} from "@/components/guide/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { primitiveColors, RAW_COLOR_SCALE_UNITS } from "@/lib/raw-color-palettes";
import { contrastRatio, getContrastLevel, type ContrastLevel } from "@/lib/contrast";
import { guideColorTabHref } from "@/lib/guide-routes";
import { pxToRem } from "@/lib/tokens";
import { useGuideTheme } from "@/components/guide/guide-theme-provider";

function RawColorPaletteCard({
  label,
  sourceVar,
  hex,
  cssVar,
  checker,
  selecting,
  onSelect,
}: {
  label: string;
  sourceVar: string;
  hex: string;
  cssVar: string;
  checker: CSSProperties;
  selecting: "bg" | "text" | null;
  onSelect: () => void;
}) {
  const cardClassName = [
    "group overflow-hidden rounded-xl border border-default surface-default text-left transition-colors",
    selecting ? "cursor-pointer hover:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-utility-focus-ring" : "",
  ].join(" ");
  const content = (
    <>
      <span className="relative block h-24 border-b border-default">
        <RawPaletteSwatchFill cssVar={cssVar} checker={checker} />
      </span>
      <span className="block p-4">
        <span className="block font-mono text-caption leading-base foreground-muted">{sourceVar}</span>
        <span className="mt-1 block font-mono text-caption leading-base foreground-muted">{hex.toLowerCase()}</span>
      </span>
    </>
  );

  if (selecting) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-label={`${label} (${hex}) — ${selecting === "bg" ? "배경색으로 선택" : "텍스트색으로 선택"}`}
        className={cardClassName}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cardClassName} aria-label={`${label} ${sourceVar} ${hex}`}>
      {content}
    </div>
  );
}

export function GuideColorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDark } = useGuideTheme();
  const activeColorTab = searchParams.get("tab") === "semantic" ? "semantic" : "raw";
  const selectColorSection = (sub: "raw" | "semantic") => router.push(guideColorTabHref(sub));
  const [bgColor, setBgColor] = useState<SwatchInfo>({ hex: "#ffffff", label: "White" });
  const [textColor, setTextColor] = useState<SwatchInfo>({ hex: "#1E2124", label: "Gray 900" });
  const [selecting, setSelecting] = useState<"bg" | "text" | null>(null);
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [semanticResolved, setSemanticResolved] = useState<Record<string, string>>({});
  const rawColorTabRef = useRef<HTMLButtonElement>(null);
  const semanticColorTabRef = useRef<HTMLButtonElement>(null);

  function handleColorTabKeyDown(e: React.KeyboardEvent) {
    const order: ("raw" | "semantic")[] = ["raw", "semantic"];
    const refs = { raw: rawColorTabRef, semantic: semanticColorTabRef };
    let next: "raw" | "semantic" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(order.indexOf(activeColorTab) + 1) % order.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(order.indexOf(activeColorTab) - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) { e.preventDefault(); selectColorSection(next); refs[next].current?.focus(); }
  }

  useEffect(() => {
    if (isDark) {
      setBgColor({ hex: "#0a0a0a", label: "Black" });
      setTextColor({ hex: "#e6e8ea", label: "Gray 10" });
    } else {
      setBgColor({ hex: "#ffffff", label: "White" });
      setTextColor({ hex: "#1e2124", label: "Gray 90" });
    }
    const frameId = requestAnimationFrame(() => {
      const cs = getComputedStyle(document.documentElement);
      const map: Record<string, string> = {};
      for (const fam of primitiveColors) {
        for (const sw of fam.swatches) {
          map[`${fam.name}-${sw.scale}`] = cs.getPropertyValue(`--color-${fam.name}-${sw.scale}`).trim() || sw.hex;
        }
      }
      setResolved(map);
      const probe = document.createElement("div");
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;top:0;left:0";
      document.body.appendChild(probe);
      const semanticMap: Record<string, string> = {};
      for (const category of [...semanticColorCatalog, semanticUtilityCatalog]) {
        for (const group of category.groups) {
          for (const token of group.tokens) {
            semanticMap[token.cssVar] = probeSemanticUtilityColor(probe, token.utility, token.readAs, token.cssVar);
          }
        }
      }
      document.body.removeChild(probe);
      setSemanticResolved(semanticMap);
    });
    return () => cancelAnimationFrame(frameId);
  }, [isDark]);

  const hexOf = (name: string, scale: number, fallback: string) => resolved[`${name}-${scale}`] || fallback;
  const ratio = contrastRatio(bgColor.hex, textColor.hex);
  const level = getContrastLevel(ratio);
  const handleSwatchClick = (hex: string, label: string) => {
    if (selecting === "bg") setBgColor({ hex, label });
    else if (selecting === "text") setTextColor({ hex, label });
    setSelecting(null);
  };

  return (
    <div className={layoutPageColSpanFull}>
        <ContentIntroLayout>
        <ContentTitleBlock
          title="Color & Effect"
          titleId="content-color"
        />

        <ContentOutlineTabList
          ariaLabel="색상 카테고리"
          activeValue={activeColorTab}
          onSelect={(value) => selectColorSection(value as "raw" | "semantic")}
          onKeyDown={handleColorTabKeyDown}
          tabs={[
            { value: "raw", tabId: "tab-color-raw", panelId: "panel-color-raw", label: "Raw Token", ref: rawColorTabRef },
            { value: "semantic", tabId: "tab-color-semantic", panelId: "panel-color-semantic", label: "Semantic Token", ref: semanticColorTabRef },
          ]}
        />

        </ContentIntroLayout>

        <div role="tabpanel" id="panel-color-raw" aria-labelledby="tab-color-raw" hidden={activeColorTab !== "raw"} className={contentSubTabPanelClass}>
        <GuideContentLayout sections={colorRawTocSections}>
        <TabDescriptionCallout margin="mb-20" tone="info">
          <div className="flex flex-col gap-2">
            <p className="m-0"><strong>Raw Token</strong>은 색상·alpha·blur처럼 역할을 정하기 전의 원본 값입니다.</p>
            <p className="m-0">모드와 용도에 직접 묶지 않고, <strong>Semantic Token</strong>이 참조할 수 있는 안정적인 재료로 관리합니다.</p>
          </div>
        </TabDescriptionCallout>

        {/* ── Contrast Checker ── */}
        <section aria-labelledby="section-contrast" className="mb-24">
          <ContentSectionTitle
            id="section-contrast"
            description={
              <>
                배경·텍스트 색 조합의 <strong>명암비</strong>를 계산하고 WCAG 등급(AA/AAA)을 검증합니다. 팔레트에서 색을 선택해 실시간으로 확인하세요.
              </>
            }
            lead
          >
            Contrast Checker
          </ContentSectionTitle>

          <div className="mb-8">
          {/* 선택 모드 안내 - 중립 정보 스타일(빨강/초록 의미색 미사용으로 에러·성공 오인 방지) */}
          {selecting && (
            <div
              role="status"
              aria-live="polite"
              className="mb-3 flex items-center justify-between rounded-lg border border-strong surface-subtle py-2.5 px-4 text-label-small font-semibold foreground-default ring-2 ring-foreground-default"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="relative inline-block size-2.5 shrink-0 overflow-hidden rounded-full ring-2 ring-foreground-default ring-offset-1 ring-offset-background"
                >
                  <ContrastSwatchFill
                    hex={selecting === "bg" ? bgColor.hex : textColor.hex}
                    checker={isDark ? checkerDark : checkerLight}
                  />
                </span>
                <span>
                  <strong className="font-bold">{selecting === "bg" ? "배경색" : "텍스트색"}</strong>으로 사용할 컬러를 팔레트에서 클릭하세요
                </span>
              </span>
              <button
                type="button"
                onClick={() => setSelecting(null)}
                aria-label="색상 선택 취소"
                className="inline-flex size-control-sm cursor-pointer items-center justify-center rounded-full border-0 bg-transparent foreground-muted transition-colors hover:bg-gray-10 hover:foreground-default"
              >
                <NavIcon innerMarkup={contrastPickCloseIcon} className="size-icon-xs shrink-0" />
              </button>
            </div>
          )}

          <div role="group" aria-label="대비 검사 색상 선택 팔레트" className="flex flex-col gap-2">
            <div aria-hidden="true" className="grid gap-1 mb-1" style={{ gridTemplateColumns: "80px repeat(13, 1fr)" }}>
              <span className="text-caption text-gray-60">Family</span>
              {RAW_COLOR_SCALE_UNITS.map((s) => (
                <span key={s} className="text-caption text-gray-60 text-center">{s}</span>
              ))}
            </div>

            {primitiveColors.map(({ family, name, swatches }) => {
              const swatchByScale = Object.fromEntries(swatches.map((sw) => [sw.scale, sw]));
              const rawChecker = isDark ? checkerDark : checkerLight;
              return (
                <div key={family} className="grid gap-1 items-center" style={{ gridTemplateColumns: "80px repeat(13, 1fr)" }}>
                  <span className="text-label-xsmall font-semibold foreground-default">{family}</span>
                  {RAW_COLOR_SCALE_UNITS.map((unit) => {
                    const sw = swatchByScale[unit];
                    if (!sw) {
                      return <div key={unit} aria-hidden="true" className="min-h-8 rounded-sm bg-transparent" />;
                    }
                    const { scale, hex } = sw;
                    const label = `${family} ${scale}`;
                    const rawCssVar = `var(--raw-${name}-${scale})`;
                    const currentHex = hex.toUpperCase();
                    const isBg = bgColor.hex.toLowerCase() === currentHex.toLowerCase();
                    const isText = textColor.hex.toLowerCase() === currentHex.toLowerCase();
                    const isInteractive = !!selecting;
                    const labelText = isInteractive
                      ? `${label} (${currentHex}) — ${selecting === "bg" ? "배경색으로 선택" : "텍스트색으로 선택"}`
                      : `${label} — ${currentHex}`;
                    return isInteractive ? (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => handleSwatchClick(currentHex, label)}
                        aria-label={labelText}
                        aria-pressed={isBg || isText}
                        className={rawPaletteSwatchClass(isBg, isText, true)}
                      >
                        <RawPaletteSwatchFill cssVar={rawCssVar} checker={rawChecker} />
                        {isBg && <ContrastSwatchRoleMarker role="BG" />}
                        {isText && <ContrastSwatchRoleMarker role="TXT" />}
                      </button>
                    ) : (
                      <div
                        key={scale}
                        aria-hidden="true"
                        className={rawPaletteSwatchClass(isBg, isText, false)}
                      >
                        <RawPaletteSwatchFill cssVar={rawCssVar} checker={rawChecker} />
                        {isBg && <ContrastSwatchRoleMarker role="BG" />}
                        {isText && <ContrastSwatchRoleMarker role="TXT" />}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            <div aria-hidden="true" className="mt-2 pt-2 border-t border-dashed border-default" />

            {backgroundAnchors.map(({ label, hex, cssVar }) => {
              const isBg = bgColor.hex.toLowerCase() === hex.toLowerCase();
              const isText = textColor.hex.toLowerCase() === hex.toLowerCase();
              const isInteractive = !!selecting;
              const rawChecker = isDark ? checkerDark : checkerLight;
              return (
                <div key={label} className="grid gap-1 items-center" style={{ gridTemplateColumns: "80px repeat(13, 1fr)" }}>
                  <span className="text-label-xsmall font-semibold foreground-default">{label}</span>
                  {isInteractive ? (
                    <button
                      type="button"
                      onClick={() => handleSwatchClick(hex, label)}
                      aria-label={`${label} (${hex}) — ${selecting === "bg" ? "배경색으로 선택" : "텍스트색으로 선택"}`}
                      aria-pressed={isBg || isText}
                      className={rawPaletteSwatchClass(isBg, isText, true, "col-start-2")}
                    >
                      <RawPaletteSwatchFill cssVar={cssVar} checker={rawChecker} />
                      {isBg && <ContrastSwatchRoleMarker role="BG" />}
                      {isText && <ContrastSwatchRoleMarker role="TXT" />}
                    </button>
                  ) : (
                    <div
                      aria-hidden="true"
                      className={rawPaletteSwatchClass(isBg, isText, false, "col-start-2")}
                    >
                      <RawPaletteSwatchFill cssVar={cssVar} checker={rawChecker} />
                      {isBg && <ContrastSwatchRoleMarker role="BG" />}
                      {isText && <ContrastSwatchRoleMarker role="TXT" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <ContrastColorPickButton
              labelId="label-bg"
              labelText="Background"
              valueId="bg-color-value"
              actionId="bg-color-action"
              swatchHex={bgColor.hex}
              colorLabel={bgColor.label}
              colorHex={bgColor.hex}
              isSelecting={selecting === "bg"}
              checker={isDark ? checkerDark : checkerLight}
              onToggle={() => setSelecting(selecting === "bg" ? null : "bg")}
            />
            <ContrastColorPickButton
              labelId="label-text"
              labelText="Text"
              valueId="text-color-value"
              actionId="text-color-action"
              swatchHex={textColor.hex}
              colorLabel={textColor.label}
              colorHex={textColor.hex}
              isSelecting={selecting === "text"}
              checker={isDark ? checkerDark : checkerLight}
              onToggle={() => setSelecting(selecting === "text" ? null : "text")}
            />
          </div>

          {/* 결과 — 미리보기(선택 배경색 위) + 명암비 카드 */}
          <div className="rounded-2xl overflow-hidden border border-gray-20 grid lg:grid-cols-[1.4fr_1fr]">
            {/* 미리보기 — 시각 견본만 제공, 결과는 우측 region aria-label로 전달 */}
            <div aria-hidden="true" className="p-8 md:p-10 flex flex-col gap-8" style={{ background: bgColor.hex }}>
              {/* 대형 텍스트 미리보기 */}
              <div className="flex flex-col gap-2">
                <p className="m-0" style={{ color: textColor.hex, fontSize: pxToRem(13), fontWeight: "var(--font-weight-semibold)", opacity: 0.65 }}>
                  대형 텍스트 미리보기
                </p>
                <span style={{ display: "block", color: textColor.hex, fontSize: pxToRem(24), fontWeight: "var(--font-weight-bold)", lineHeight: "var(--font-line)" }}>
                  대형 텍스트는 일반 굵기인 경우 18pt(24px) 이상, 굵은 글꼴일 경우 14pt 이상에 적용됩니다.
                </span>
              </div>

              {/* 일반 텍스트 미리보기 */}
              <div className="flex flex-col gap-2">
                <p className="m-0" style={{ color: textColor.hex, fontSize: pxToRem(13), fontWeight: "var(--font-weight-semibold)", opacity: 0.65 }}>
                  일반 텍스트 미리보기
                </p>
                <p className="m-0" style={{ color: textColor.hex, fontSize: pxToRem(16), fontWeight: "var(--font-weight-regular)", lineHeight: "var(--font-line)" }}>
                  일반 텍스트는 일반 굵기인 경우 16pt(21px) 이하, 굵은 글꼴일 경우 12pt 이하에 적용됩니다.
                </p>
              </div>

              {/* 그래픽 미리보기 */}
              <div className="flex flex-col gap-2">
                <p className="m-0" style={{ color: textColor.hex, fontSize: pxToRem(13), fontWeight: "var(--font-weight-semibold)", opacity: 0.65 }}>
                  그래픽 미리보기
                </p>
                <div className="flex items-center gap-4" style={{ color: textColor.hex }}>
                  {outlineIconCatalog.slice(0, 5).map((icon) => (
                    <ProjectIconGlyph key={icon.id} innerMarkup={icon.innerMarkup} className="size-icon-lg shrink-0" />
                  ))}
                </div>
              </div>
            </div>

            {/* 명암비 결과 카드 */}
            <div
              role="region"
              aria-label={`대비율 결과: ${ratio}:1 — ${level}`}
              aria-live="polite"
              aria-atomic="true"
              className="bg-background p-6 md:p-7 flex flex-col gap-5 border-t lg:border-t-0 lg:border-l border-gray-20"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-label-small font-bold m-0">명암비</p>
                  <LevelBadge level={level} />
                </div>
                <output className={`block py-5 text-center foreground-default ${contrastResultSurfaceClass}`}>
                  <span className="font-bold leading-none numeric-tabular" style={{ fontSize: pxToRem(40) }}>
                    {ratio}<span className="font-normal text-gray-60" style={{ fontSize: pxToRem(18) }}> : 1</span>
                  </span>
                </output>
              </div>

              <ContrastCategory
                title="일반텍스트"
                aa={{ threshold: "4.5:1", passed: ratio >= 4.5 }}
                aaa={{ threshold: "7:1", passed: ratio >= 7 }}
              />
              <ContrastCategory
                title="대형텍스트"
                aa={{ threshold: "3:1", passed: ratio >= 3 }}
                aaa={{ threshold: "4.5:1", passed: ratio >= 4.5 }}
              />
              <ContrastCategory
                title={<>그 외 텍스트 <span className="font-normal">(SVG, 그래픽아이콘 등)</span></>}
                aa={{ threshold: "3:1", passed: ratio >= 3 }}
                aaa={{ threshold: "4.5:1", passed: ratio >= 4.5 }}
              />
            </div>
          </div>

          {/* 전체 팔레트 대비 매트릭스 */}
          <div className="mt-8">
            <ContentGroupTitle>
              현재 배경색 기준 — 전체 팔레트 대비율
            </ContentGroupTitle>
            <div role="group" aria-label="전체 팔레트 대비율 매트릭스" className="flex flex-col gap-1.5">
              <div aria-hidden="true" className="grid gap-1" style={{ gridTemplateColumns: "80px repeat(13, 1fr)" }}>
                <span className="text-caption text-gray-60" />
                {RAW_COLOR_SCALE_UNITS.map((s) => (
                  <span key={s} className="text-caption text-gray-60 text-center">{s}</span>
                ))}
              </div>
              {primitiveColors.map(({ family, name, swatches }) => {
                const swatchByScale = Object.fromEntries(swatches.map((sw) => [sw.scale, sw]));
                return (
                <div key={family} className="grid gap-1 items-center" style={{ gridTemplateColumns: "80px repeat(13, 1fr)" }}>
                  <span className="text-label-xsmall font-semibold foreground-default">{family}</span>
                  {RAW_COLOR_SCALE_UNITS.map((unit) => {
                    const sw = swatchByScale[unit];
                    if (!sw) {
                      return <div key={unit} aria-hidden="true" className="min-h-10 rounded-md bg-transparent" />;
                    }
                    const { scale, hex } = sw;
                    const r = contrastRatio(bgColor.hex, hexOf(name, scale, hex));
                    const lv = getContrastLevel(r);
                    const s = levelStyle[lv];
                    return (
                      <div
                        key={scale}
                        aria-hidden="true"
                        className="h-10 rounded-md flex flex-col items-center justify-center gap-px"
                        style={{ background: s.bg }}
                      >
                        <span className="text-caption font-bold leading-none" style={{ color: s.color }}>{lv}</span>
                        <span className="text-caption numeric-tabular leading-none" style={{ color: s.color }}>{r}</span>
                      </div>
                    );
                  })}
                </div>
              );})}
            </div>
            <div role="list" aria-label="대비율 등급 범례" className="flex gap-3 mt-3 flex-wrap">
              {(Object.entries(levelStyle) as [ContrastLevel, typeof levelStyle[ContrastLevel]][]).map(([lv, s]) => (
                <div key={lv} role="listitem" className="flex items-center gap-1.5">
                  <div aria-hidden="true" className="w-3 h-3 rounded-[3px]" style={{ background: s.bg }} />
                  <span className="text-caption text-gray-60">
                    {lv === "AAA" ? "AAA 7:1+" : lv === "AA" ? "AA 4.5:1+" : lv === "AA Large" ? "AA Large 3:1+" : "Fail"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="section-color" className="mb-24">
          <ContentSectionTitle
            id="section-color"
            description={
              <>
                가공 전 원본 팔레트입니다. 색상 family와 <strong>0·5·10·20·30·40·50·60·70·80·90·95·100</strong> scale을 카드 단위로 확인합니다.
              </>
            }
          >
            Color Palette
          </ContentSectionTitle>

          <div className="flex flex-col gap-12">
            <section aria-labelledby="raw-palette-neutral">
              <h3 id="raw-palette-neutral" className="m-0 mb-4 scroll-mt-[calc(3.75rem+1.5rem)] text-label-large font-bold lowercase foreground-subtle">
                neutral
              </h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
                {backgroundAnchors.map(({ label, hex, cssVar }) => {
                  const rawChecker = isDark ? checkerDark : checkerLight;
                  const tokenLabel = label.toLowerCase() === "white" ? "raw-white" : "raw-black";
                  const sourceVar = label.toLowerCase() === "white" ? "--raw-white" : "--raw-black";
                  return (
                    <RawColorPaletteCard
                      key={label}
                      label={tokenLabel}
                      sourceVar={sourceVar}
                      hex={hex}
                      cssVar={cssVar}
                      checker={rawChecker}
                      selecting={selecting}
                      onSelect={() => handleSwatchClick(hex, label)}
                    />
                  );
                })}
              </div>
            </section>

            {primitiveColors.map(({ family, name, swatches }) => {
              const rawChecker = isDark ? checkerDark : checkerLight;
              return (
                <section key={family} aria-labelledby={`raw-palette-${name}`}>
                  <h3 id={`raw-palette-${name}`} className="m-0 mb-4 scroll-mt-[calc(3.75rem+1.5rem)] text-label-large font-bold lowercase foreground-subtle">
                    {family.toLowerCase()}
                  </h3>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
                    {swatches.map(({ scale, hex }) => {
                      const currentHex = hex.toUpperCase();
                      return (
                        <RawColorPaletteCard
                          key={`${name}-${scale}`}
                          label={`raw-${name}-${scale}`}
                          sourceVar={`--raw-${name}-${scale}`}
                          hex={currentHex}
                          cssVar={`var(--raw-${name}-${scale})`}
                          checker={rawChecker}
                          selecting={selecting}
                          onSelect={() => handleSwatchClick(currentHex, `${family} ${scale}`)}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <SemanticTokenFamilySection
          id="raw-effect-tokens"
          title="Effect Tokens"
          description={
            <>
              원본 효과 scale입니다. 색상 팔레트처럼 역할을 정하기 전 단계의 값이며, <strong>Blur</strong>와 <strong>Alpha</strong>처럼 효과를 만드는 재료를 확인합니다.
            </>
          }
        >
          <SemanticColorCategorySection
            id="raw-blur"
            title={semanticBlurCatalog.title}
            description={semanticBlurCatalog.description}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {semanticBlurCatalog.tokens.map((token) => (
                <SemanticBlurSwatchCard
                  key={token.id}
                  id={token.id}
                  utility={token.utility}
                  sourceVar={token.sourceVar}
                  value={token.value}
                  hideUtility
                />
              ))}
            </div>
          </SemanticColorCategorySection>

          <SemanticColorCategorySection
            id={rawAlphaCatalog.id}
            title={rawAlphaCatalog.title}
            description={rawAlphaCatalog.description}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rawAlphaCatalog.tokens.map((token) => (
                <SemanticOverlaySwatchCard
                  key={token.id}
                  utility={token.utility}
                  dsVar={token.dsVar}
                  rawVar={isDark ? token.rawVarDark : token.rawVarLight}
                  cssVar={token.cssVar}
                  valueLabel={isDark ? token.dark : token.light}
                  isDark={isDark}
                  hideUtility
                />
              ))}
            </div>
          </SemanticColorCategorySection>
        </SemanticTokenFamilySection>

        </GuideContentLayout>
        </div>{/* /panel-color-raw */}

        <div role="tabpanel" id="panel-color-semantic" aria-labelledby="tab-color-semantic" hidden={activeColorTab !== "semantic"} className={contentSubTabPanelClass}>
        <GuideContentLayout sections={semanticTocSections}>
          <TabDescriptionCallout margin="mb-20" tone="info">
            <div className="flex flex-col gap-2">
              <p className="m-0"><strong>Semantic Token</strong>은 raw 값을 화면 역할에 맞게 매핑한 실제 사용 토큰입니다.</p>
              <p className="m-0">라이트·다크 모드에서 필요한 값을 재매핑해 <strong>background</strong>, <strong>surface</strong>, <strong>foreground</strong>, <strong>effect</strong> 같은 UI 의미를 일관되게 사용합니다.</p>
            </div>
          </TabDescriptionCallout>

          <SemanticTokenFamilySection
            id="semantic-color-tokens"
            title="Color Tokens"
            lead
            description={
              <>
                화면을 구성하는 기본 색상 토큰입니다. <strong>Background</strong>·<strong>Surface</strong>·<strong>Foreground</strong>·<strong>Border</strong>와 focus-ring·scroll 같은 <strong>Utility</strong> 색상을 함께 관리합니다.
              </>
            }
          >
            {semanticColorCatalog.map((category) => (
              <SemanticColorCategorySection
                key={category.id}
                id={category.id}
                title={category.title}
                description={category.description}
              >
                {category.groups.map((group) => (
                  <SemanticColorGroupGrid key={group.id} label={group.label}>
                    {group.tokens.map((token) => (
                      <SemanticColorSwatchCard
                        key={token.cssVar}
                        utility={token.utility}
                        rawVar={isDark && token.rawVarDark ? token.rawVarDark : token.rawVar}
                        color={semanticResolved[token.cssVar] ?? "—"}
                      />
                    ))}
                  </SemanticColorGroupGrid>
                ))}
              </SemanticColorCategorySection>
            ))}
            <SemanticColorCategorySection
              id={semanticUtilityCatalog.id}
              title={semanticUtilityCatalog.title}
              description={semanticUtilityCatalog.description}
            >
              {semanticUtilityCatalog.groups.map((group) => (
                <SemanticColorGroupGrid key={group.id} label={group.label}>
                  {group.tokens.map((token) => (
                    <SemanticColorSwatchCard
                      key={token.cssVar}
                      utility={token.utility}
                      rawVar={isDark && token.rawVarDark ? token.rawVarDark : token.rawVar}
                      color={semanticResolved[token.cssVar] ?? "—"}
                    />
                  ))}
                </SemanticColorGroupGrid>
              ))}
            </SemanticColorCategorySection>
          </SemanticTokenFamilySection>

          <SemanticTokenFamilySection
            id="semantic-effect-tokens"
            title="Effect Tokens"
            description={
              <>
                색상 위에 얹히는 역할 기반 시각 효과 토큰입니다. <strong>Shadow</strong>는 면의 깊이감, <strong>Gradient</strong>는 브랜드 강조, <strong>Blur</strong>와 <strong>Overlay</strong>는 배경 차단·분리 맥락을 표현합니다.
              </>
            }
          >
            <SemanticColorCategorySection
              id={semanticGradientCatalog.id}
              title={semanticGradientCatalog.title}
              description={semanticGradientCatalog.description}
            >
              {semanticGradientCatalog.groups.map((group) => (
                <SemanticColorGroupGrid key={group.id} label={group.label}>
                  {group.gradients.map(({ utility, dsVar, value, valueDark }) => (
                    <SemanticGradientSwatchCard
                      key={dsVar}
                      utility={utility}
                      dsVar={dsVar}
                      value={isDark && valueDark ? valueDark : value}
                    />
                  ))}
                </SemanticColorGroupGrid>
              ))}
            </SemanticColorCategorySection>

            <SemanticColorCategorySection
              id={semanticBlurCatalog.id}
              title={semanticBlurCatalog.title}
              description={semanticBlurCatalog.description}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {semanticBlurCatalog.tokens.map((token) => (
                  <SemanticBlurSwatchCard
                    key={token.id}
                    id={token.id}
                    utility={token.utility}
                    sourceVar={token.sourceVar}
                    value={token.value}
                  />
                ))}
              </div>
            </SemanticColorCategorySection>

            <SemanticColorCategorySection
              id={semanticOverlayCatalog.id}
              title={semanticOverlayCatalog.title}
              description={semanticOverlayCatalog.description}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {semanticOverlayCatalog.tokens.map((token) => (
                  <SemanticOverlaySwatchCard
                    key={token.id}
                    utility={token.utility}
                    dsVar={token.dsVar}
                    rawVar={isDark ? token.rawVarDark : token.rawVarLight}
                    cssVar={token.cssVar}
                    valueLabel={isDark ? token.dark : token.light}
                    isDark={isDark}
                  />
                ))}
              </div>
            </SemanticColorCategorySection>

            <SemanticColorCategorySection
              id={semanticShadowCatalog.id}
              title={semanticShadowCatalog.title}
              description={semanticShadowCatalog.description}
            >
              <div className="flex flex-col gap-4">
                {semanticShadowCatalog.tokens.map((token) => (
                  <SemanticShadowSwatchCard
                    key={token.id}
                    id={token.id}
                    utility={token.utility}
                    sourceVar={token.sourceVar}
                    value={token.value}
                    valuePx={isDark && token.valuePxDark ? token.valuePxDark : token.valuePx}
                  />
                ))}
              </div>
            </SemanticColorCategorySection>

          </SemanticTokenFamilySection>
        </GuideContentLayout>
        </div>{/* /panel-color-semantic */}

        
    </div>
  );
}
