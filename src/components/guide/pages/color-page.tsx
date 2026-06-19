"use client";

import { useEffect, useRef, useState } from "react";
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
  ContentIntroShell,
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
  semanticColorCatalog,
  semanticGradientCatalog,
  semanticOverlayCatalog,
  SemanticColorCategorySection,
  SemanticColorGroupGrid,
  SemanticColorSwatchCard,
  SemanticGradientSwatchCard,
  SemanticOverlaySwatchCard,
  semanticTocSections,
  semanticUtilityCatalog,
  surfaceAnchors,
  type SwatchInfo,
} from "@/components/guide/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { primitiveColors, RAW_COLOR_SCALE_UNITS } from "@/lib/raw-color-palettes";
import { contrastRatio, getContrastLevel, type ContrastLevel } from "@/lib/contrast";
import { guideColorTabHref } from "@/lib/guide-routes";
import { pxToRem } from "@/lib/tokens";
import { useGuideTheme } from "@/components/guide/guide-theme-provider";

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
        <ContentIntroShell>
        <ContentTitleBlock
          title="Color"
          titleId="content-color"
        />

        <ContentOutlineTabList
          ariaLabel="색상 카테고리"
          activeValue={activeColorTab}
          onSelect={(value) => selectColorSection(value as "raw" | "semantic")}
          onKeyDown={handleColorTabKeyDown}
          tabs={[
            { value: "raw", tabId: "tab-color-raw", panelId: "panel-color-raw", label: "Raw Color", ref: rawColorTabRef },
            { value: "semantic", tabId: "tab-color-semantic", panelId: "panel-color-semantic", label: "Semantic Color", ref: semanticColorTabRef },
          ]}
        />

        </ContentIntroShell>

        <div role="tabpanel" id="panel-color-raw" aria-labelledby="tab-color-raw" hidden={activeColorTab !== "raw"} className={contentSubTabPanelClass}>
        <GuideContentLayout sections={colorRawTocSections}>
        <section aria-labelledby="section-color" className="mb-24">
          <ContentSectionTitle
            id="section-color"
            lead
            description={
              <>
                가공 전 <strong>원본 팔레트(raw)</strong>입니다. hue family(Red → Rose → Orange → Green → Cyan → Blue → Violet → Navy → Gray) 순으로 배열하고, 스케일 단위 <strong>0·5·10·20·30·40·50·60·70·80·90·95·100</strong> 그리드와 <strong>White/Black</strong> 앵커를 확인합니다. KRDS 표준형 family는 5~90 단계를 그대로 쓰고, <strong>Violet</strong>(<code className="font-mono text-caption">#5B4CF0</code>=<strong>50</strong> base)는 0~100 전 구간 스케일입니다. 스케일 <strong>0</strong>·<strong>100</strong>은 순백/순흑이 아니라 각 family <strong>5</strong>·<strong>95</strong> hue를 앵커에 10%만 혼합한 가장 밝/어두운 틴트입니다. surface·base·text 등 역할은 Semantic Color 탭에서 매핑합니다.
              </>
            }
          >
            Color Palette
          </ContentSectionTitle>

          {/* 선택 모드 안내 — 중립 정보 스타일(빨강/초록 의미색 미사용으로 에러·성공 오인 방지) */}
          {selecting && (
            <div
              role="status"
              aria-live="polite"
              className="mb-3 flex items-center justify-between rounded-lg border border-line-strong bg-surface-subtle py-2.5 px-4 text-label-md font-semibold foreground-primary ring-2 ring-foreground-primary"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="relative inline-block size-2.5 shrink-0 overflow-hidden rounded-full ring-2 ring-foreground-primary ring-offset-1 ring-offset-background"
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
                className="inline-flex size-control-sm cursor-pointer items-center justify-center rounded-full border-0 bg-transparent foreground-muted transition-colors hover:bg-gray-10 hover:foreground-primary"
              >
                <NavIcon innerMarkup={contrastPickCloseIcon} className="size-icon-xs shrink-0" />
              </button>
            </div>
          )}

          <div role="group" aria-label="색상 팔레트" className="flex flex-col gap-2">
            {/* 스케일 헤더 */}
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
                <span className="text-label-sm font-semibold foreground-primary">{family}</span>
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
            );})}

            {/* 스케일 팔레트와 구분 — 앵커는 스케일(0~100)과 무관 */}
            <div aria-hidden="true" className="mt-2 pt-2 border-t border-dashed border-line" />

            {/* Surface 앵커 — White / Black 각자 한 행(모드 무관 고정값, 스케일 없음) */}
            {surfaceAnchors.map(({ label, hex, cssVar }) => {
              const isBg = bgColor.hex.toLowerCase() === hex.toLowerCase();
              const isText = textColor.hex.toLowerCase() === hex.toLowerCase();
              const isInteractive = !!selecting;
              const rawChecker = isDark ? checkerDark : checkerLight;
              return (
                <div key={label} className="grid gap-1 items-center" style={{ gridTemplateColumns: "80px repeat(13, 1fr)" }}>
                  <span className="text-label-sm font-semibold foreground-primary">{label}</span>
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
        </section>

        {/* ── Contrast Checker ── */}
        <section aria-labelledby="section-contrast" className="mb-24">
          <ContentSectionTitle
            id="section-contrast"
            description={
              <>
                배경·텍스트 색 조합의 <strong>명암비</strong>를 계산하고 WCAG 등급(AA/AAA)을 검증합니다. 팔레트에서 색을 선택해 실시간으로 확인하세요.
              </>
            }
          >
            Contrast Checker
          </ContentSectionTitle>

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
                  <p className="text-label-md font-bold m-0">명암비</p>
                  <LevelBadge level={level} />
                </div>
                <output className={`block py-5 text-center foreground-primary ${contrastResultSurfaceClass}`}>
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
                  <span className="text-label-sm font-semibold foreground-primary">{family}</span>
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

        </GuideContentLayout>
        </div>{/* /panel-color-raw */}

        <div role="tabpanel" id="panel-color-semantic" aria-labelledby="tab-color-semantic" hidden={activeColorTab !== "semantic"} className={contentSubTabPanelClass}>
        <GuideContentLayout sections={semanticTocSections}>
          {semanticColorCatalog.map((category, index) => (
            <SemanticColorCategorySection
              key={category.id}
              id={category.id}
              title={category.title}
              description={category.description}
              lead={index === 0}
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
            id={semanticOverlayCatalog.id}
            title={semanticOverlayCatalog.title}
            description={semanticOverlayCatalog.description}
          >
            {semanticOverlayCatalog.groups.map((group) => (
              <SemanticColorGroupGrid key={group.id} label={group.label}>
                <SemanticOverlaySwatchCard
                  utility={group.utility}
                  rawVar={isDark ? group.rawVarDark : group.rawVarLight}
                  cssVar={group.cssVar}
                  valueLabel={isDark ? group.dark : group.light}
                  isDark={isDark}
                />
              </SemanticColorGroupGrid>
            ))}
          </SemanticColorCategorySection>

          <SemanticColorCategorySection
            id={semanticGradientCatalog.id}
            title={semanticGradientCatalog.title}
            description={semanticGradientCatalog.description}
          >
            {semanticGradientCatalog.groups.map((group) => (
              <SemanticColorGroupGrid key={group.id} label={group.label}>
                {group.gradients.map(({ utility, dsVar, rawVar, rawVarDark, desc }) => (
                  <SemanticGradientSwatchCard
                    key={dsVar}
                    utility={utility}
                    dsVar={dsVar}
                    rawVar={isDark && rawVarDark ? rawVarDark : rawVar}
                    desc={desc}
                  />
                ))}
              </SemanticColorGroupGrid>
            ))}
          </SemanticColorCategorySection>

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
        </GuideContentLayout>
        </div>{/* /panel-color-semantic */}

        
    </div>
  );
}
