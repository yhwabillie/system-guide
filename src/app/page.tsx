"use client";

import { useState, useEffect, useRef } from "react";
import { contrastRatio, getContrastLevel, type ContrastLevel } from "@/lib/contrast";

const primitiveColors = [
  {
    family: "Red", name: "red",
    swatches: [
      { scale: 50, hex: "#fff1f4" }, { scale: 100, hex: "#ffd9e1" },
      { scale: 200, hex: "#ffb3c3" }, { scale: 300, hex: "#f57a94" },
      { scale: 400, hex: "#c93b5c" }, { scale: 500, hex: "#7f0019" },
      { scale: 600, hex: "#690015" }, { scale: 700, hex: "#550011" },
      { scale: 800, hex: "#3d000c" }, { scale: 900, hex: "#250007" },
    ],
  },
  {
    family: "Brown", name: "brown",
    swatches: [
      { scale: 50, hex: "#f8f3f1" }, { scale: 100, hex: "#eadcd5" },
      { scale: 200, hex: "#d6bfb3" }, { scale: 300, hex: "#bc9c89" },
      { scale: 400, hex: "#9d7760" }, { scale: 500, hex: "#7a5640" },
      { scale: 600, hex: "#634532" }, { scale: 700, hex: "#4f3627" },
      { scale: 800, hex: "#39261a" }, { scale: 900, hex: "#24170f" },
    ],
  },
  {
    family: "Sand", name: "sand",
    swatches: [
      { scale: 50, hex: "#fcf8f2" }, { scale: 100, hex: "#f6eddf" },
      { scale: 200, hex: "#eedfc7" }, { scale: 300, hex: "#e3cfab" },
      { scale: 400, hex: "#d4bb8a" }, { scale: 500, hex: "#c1a073" },
      { scale: 600, hex: "#a7865b" }, { scale: 700, hex: "#896c47" },
      { scale: 800, hex: "#6a5438" }, { scale: 900, hex: "#4d3d2b" },
    ],
  },
  {
    family: "Green", name: "green",
    swatches: [
      { scale: 50, hex: "#eef8f4" }, { scale: 100, hex: "#d6efe6" },
      { scale: 200, hex: "#aee0cc" }, { scale: 300, hex: "#7bc9ab" },
      { scale: 400, hex: "#3fa87f" }, { scale: 500, hex: "#0f5b41" },
      { scale: 600, hex: "#0b4f38" }, { scale: 700, hex: "#08422f" },
      { scale: 800, hex: "#063426" }, { scale: 900, hex: "#03251b" },
    ],
  },
  {
    family: "Neutral", name: "neutral",
    swatches: [
      { scale: 50, hex: "#fafafa" }, { scale: 100, hex: "#f5f5f5" },
      { scale: 200, hex: "#e5e5e5" }, { scale: 300, hex: "#d4d4d4" },
      { scale: 400, hex: "#737373" }, { scale: 500, hex: "#737373" },
      { scale: 600, hex: "#525252" }, { scale: 700, hex: "#404040" },
      { scale: 800, hex: "#262626" }, { scale: 900, hex: "#171717" },
    ],
  },
];

const scales = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

// 표면 앵커 — 중립 램프 밖 순백/심흑(모드 무관 고정)
const surfaceAnchors = [
  { label: "White", hex: "#ffffff", cssVar: "var(--raw-white)" },
  { label: "Black", hex: "#0a0a0a", cssVar: "var(--raw-black)" },
];

// 시맨틱 오버레이 — 모드 인지 반투명(라이트=검정α / 다크=흰색α)
const overlayTokens = [
  { label: "overlay-subtle", cssVar: "--color-overlay-subtle", light: "rgba(0, 0, 0, 0.05)", dark: "rgba(255, 255, 255, 0.05)" },
  { label: "overlay", cssVar: "--color-overlay", light: "rgba(0, 0, 0, 0.10)", dark: "rgba(255, 255, 255, 0.10)" },
  { label: "overlay-strong", cssVar: "--color-overlay-strong", light: "rgba(0, 0, 0, 0.20)", dark: "rgba(255, 255, 255, 0.20)" },
];

// 투명도 확인용 체크무늬(모드 무관 고정) — 위에 알파 색을 올려 투명도를 가시화
const makeChecker = (base: string, square: string): React.CSSProperties => ({
  backgroundColor: base,
  backgroundImage:
    `linear-gradient(45deg, ${square} 25%, transparent 25%),` +
    `linear-gradient(-45deg, ${square} 25%, transparent 25%),` +
    `linear-gradient(45deg, transparent 75%, ${square} 75%),` +
    `linear-gradient(-45deg, transparent 75%, ${square} 75%)`,
  backgroundSize: "14px 14px",
  backgroundPosition: "0 0, 0 7px, 7px -7px, -7px 0",
});
// 검정 알파는 밝은 체커, 흰색 알파는 어두운 체커 위에서 차이가 잘 보임
const checkerLight = makeChecker("var(--raw-white)", "var(--raw-neutral-200)");
const checkerDark = makeChecker("var(--raw-black)", "var(--raw-neutral-700)");

const typographyTokens = [
  { label: "Display LG", var: "--font-size-display-lg", weight: "700" },
  { label: "Display MD", var: "--font-size-display-md", weight: "700" },
  { label: "Display SM", var: "--font-size-display-sm", weight: "700" },
  { label: "Heading LG", var: "--font-size-heading-lg", weight: "700" },
  { label: "Heading MD", var: "--font-size-heading-md", weight: "700" },
  { label: "Heading SM", var: "--font-size-heading-sm", weight: "700" },
  { label: "Body LG", var: "--font-size-body-lg", weight: "400" },
  { label: "Body MD", var: "--font-size-body-md", weight: "400" },
  { label: "Body SM", var: "--font-size-body-sm", weight: "400" },
  { label: "Label XL", var: "--font-size-label-xl", weight: "600" },
  { label: "Label LG", var: "--font-size-label-lg", weight: "600" },
  { label: "Label MD", var: "--font-size-label-md", weight: "600" },
  { label: "Label SM", var: "--font-size-label-sm", weight: "600" },
  { label: "Caption", var: "--font-size-caption", weight: "400" },
  { label: "Price LG", var: "--font-size-price-lg", weight: "700" },
  { label: "Price MD", var: "--font-size-price-md", weight: "700" },
  { label: "Price SM", var: "--font-size-price-sm", weight: "700" },
];

const levelStyle: Record<ContrastLevel, { bg: string; color: string; label: string }> = {
  AAA:        { bg: "var(--color-level-aaa-bg)",  color: "var(--color-level-aaa-fg)",  label: "AAA" },
  AA:         { bg: "var(--color-level-aa-bg)",   color: "var(--color-level-aa-fg)",   label: "AA" },
  "AA Large": { bg: "var(--color-level-warn-bg)", color: "var(--color-level-warn-fg)", label: "AA Large" },
  Fail:       { bg: "var(--color-level-fail-bg)", color: "var(--color-level-fail-fg)", label: "Fail" },
};

function LevelBadge({ level }: { level: ContrastLevel }) {
  const s = levelStyle[level];
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "2px 10px", borderRadius: "999px",
      fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em",
    }}>
      {s.label}
    </span>
  );
}

type SwatchInfo = { hex: string; label: string };

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [bgColor, setBgColor] = useState<SwatchInfo>({ hex: "#ffffff", label: "White" });
  const [textColor, setTextColor] = useState<SwatchInfo>({ hex: "#171717", label: "Neutral 900" });
  const [selecting, setSelecting] = useState<"bg" | "text" | null>(null);
  const [activeTab, setActiveTab] = useState<"color" | "type">("color");
  const colorTabRef = useRef<HTMLButtonElement>(null);
  const typeTabRef = useRef<HTMLButtonElement>(null);

  // 탭 좌우/Home/End 키 이동 (WAI-ARIA tabs 패턴)
  function handleTabKeyDown(e: React.KeyboardEvent) {
    const order: ("color" | "type")[] = ["color", "type"];
    const refs = { color: colorTabRef, type: typeTabRef };
    let next: "color" | "type" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(order.indexOf(activeTab) + 1) % 2];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(order.indexOf(activeTab) + 1) % 2];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[1];
    if (next) {
      e.preventDefault();
      setActiveTab(next);
      refs[next].current?.focus();
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 20px",
    border: "none",
    borderBottom: active ? "2px solid var(--color-accent)" : "2px solid transparent",
    background: "none",
    color: active ? "var(--foreground)" : "var(--color-text-muted)",
    fontFamily: "var(--font-family-base)",
    fontSize: "var(--font-size-label-lg)",
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
    marginBottom: "-1px",
  });
  // 현재 모드(.dark)에서 실제로 계산된 시맨틱 스케일(--color-*) 색을 읽어 둠 → 칩 선택/대비 계산에 사용
  const [resolved, setResolved] = useState<Record<string, string>>({});

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    const cs = getComputedStyle(document.documentElement);
    const map: Record<string, string> = {};
    for (const fam of primitiveColors) {
      for (const sw of fam.swatches) {
        map[`${fam.name}-${sw.scale}`] =
          cs.getPropertyValue(`--color-${fam.name}-${sw.scale}`).trim() || sw.hex;
      }
    }
    setResolved(map);
  }, [isDark]);

  const hexOf = (name: string, scale: number, fallback: string) =>
    resolved[`${name}-${scale}`] || fallback;

  const ratio = contrastRatio(bgColor.hex, textColor.hex);
  const level = getContrastLevel(ratio);

  function handleSwatchClick(hex: string, label: string) {
    if (selecting === "bg") setBgColor({ hex, label });
    else if (selecting === "text") setTextColor({ hex, label });
    setSelecting(null);
  }

  return (
    <>
      {/* 스킵 네비게이션 */}
      <a
        href="#main-content"
        style={{
          position: "absolute", top: "-40px", left: "0", zIndex: 100,
          background: "var(--color-accent)", color: "var(--color-on-accent)",
          padding: "8px 16px", fontWeight: 600, textDecoration: "none",
          transition: "top 0.1s",
        }}
        onFocus={(e) => { e.currentTarget.style.top = "0"; }}
        onBlur={(e) => { e.currentTarget.style.top = "-40px"; }}
      >
        본문 바로가기
      </a>

      <main
        id="main-content"
        className="min-h-screen p-10 transition-colors duration-300"
        style={{ fontFamily: "var(--font-family-base)", background: "var(--background)", color: "var(--foreground)" }}
      >
        {/* Header */}
        <header style={{ marginBottom: "8px" }}>
          <h1 style={{ fontSize: "var(--font-size-display-lg)", fontWeight: 700 }}>Design Token Preview</h1>
        </header>

        <p style={{ fontSize: "var(--font-size-body-md)", color: "var(--color-neutral-400)", marginBottom: "24px" }}>
          Figma variables → CSS custom properties 적용 확인
        </p>

        {/* ── Tabs ── */}
        <div
          role="tablist"
          aria-label="디자인 토큰 카테고리"
          onKeyDown={handleTabKeyDown}
          style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border)", marginBottom: "40px" }}
        >
          <button
            ref={colorTabRef}
            type="button"
            role="tab"
            id="tab-color"
            aria-selected={activeTab === "color"}
            aria-controls="panel-color"
            tabIndex={activeTab === "color" ? 0 : -1}
            onClick={() => setActiveTab("color")}
            style={tabStyle(activeTab === "color")}
          >
            Color
          </button>
          <button
            ref={typeTabRef}
            type="button"
            role="tab"
            id="tab-type"
            aria-selected={activeTab === "type"}
            aria-controls="panel-type"
            tabIndex={activeTab === "type" ? 0 : -1}
            onClick={() => setActiveTab("type")}
            style={tabStyle(activeTab === "type")}
          >
            Typography
          </button>
        </div>

        {/* ── Tab Panel 1: Color ── */}
        <div role="tabpanel" id="panel-color" aria-labelledby="tab-color" hidden={activeTab !== "color"}>

        {/* ── Color Palette ── */}
        <section aria-labelledby="section-color" style={{ marginBottom: "64px" }}>
          <h2 id="section-color" style={{ fontSize: "var(--font-size-heading-md)", fontWeight: 700, marginBottom: "8px" }}>Color Palette</h2>

          {/* 선택 모드 안내 */}
          {selecting && (
            <div
              role="status"
              aria-live="polite"
              style={{
                marginBottom: "12px", padding: "10px 16px", borderRadius: "8px",
                background: selecting === "bg" ? "var(--color-red-100)" : "var(--color-green-100)",
                color: selecting === "bg" ? "var(--color-red-600)" : "var(--color-green-600)",
                fontSize: "var(--font-size-label-md)", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span>
                {selecting === "bg" ? "배경색으로 사용할 컬러를 클릭하세요" : "텍스트색으로 사용할 컬러를 클릭하세요"}
              </span>
              <button
                type="button"
                onClick={() => setSelecting(null)}
                aria-label="색상 선택 취소"
                style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "16px", lineHeight: 1, padding: "0 4px" }}
              >
                ✕
              </button>
            </div>
          )}

          <div role="group" aria-label="색상 팔레트" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* 스케일 헤더 */}
            <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "80px repeat(10, 1fr)", gap: "4px", marginBottom: "4px" }}>
              <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>Family</span>
              {scales.map((s) => (
                <span key={s} style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", textAlign: "center" }}>{s}</span>
              ))}
            </div>

            {primitiveColors.map(({ family, name, swatches }) => (
              <div key={family} style={{ display: "grid", gridTemplateColumns: "80px repeat(10, 1fr)", gap: "4px", alignItems: "center" }}>
                <span style={{ fontSize: "var(--font-size-label-sm)", fontWeight: 600 }}>{family}</span>
                {swatches.map(({ scale, hex }) => {
                  const label = `${family} ${scale}`;
                  const cssVar = `var(--color-${name}-${scale})`;
                  const currentHex = hexOf(name, scale, hex);
                  const isBg = bgColor.hex === currentHex;
                  const isText = textColor.hex === currentHex;
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
                      style={{
                        height: "40px", borderRadius: "6px",
                        backgroundColor: cssVar,
                        border: isBg
                          ? "3px solid var(--color-accent)"
                          : isText
                          ? "3px solid var(--color-accent-danger)"
                          : "1px solid var(--color-border-overlay)",
                        cursor: "pointer",
                        opacity: !isBg && !isText ? 0.75 : 1,
                        transition: "opacity 0.1s",
                        position: "relative",
                        padding: 0,
                      }}
                    >
                      {isBg && <span aria-hidden="true" style={{ position: "absolute", top: "2px", left: "3px", fontSize: "11px", fontWeight: 700, color: contrastRatio(currentHex, "#000") > 4.5 ? "#000" : "#fff" }}>BG</span>}
                      {isText && <span aria-hidden="true" style={{ position: "absolute", top: "2px", left: "3px", fontSize: "11px", fontWeight: 700, color: contrastRatio(currentHex, "#000") > 4.5 ? "#000" : "#fff" }}>TXT</span>}
                    </button>
                  ) : (
                    <div
                      key={scale}
                      aria-label={`${label} — ${currentHex}`}
                      role="img"
                      style={{
                        height: "40px", borderRadius: "6px",
                        backgroundColor: cssVar,
                        border: isBg
                          ? "3px solid var(--color-accent)"
                          : isText
                          ? "3px solid var(--color-accent-danger)"
                          : "1px solid var(--color-border-overlay)",
                        position: "relative",
                      }}
                    >
                      {isBg && <span aria-hidden="true" style={{ position: "absolute", top: "2px", left: "3px", fontSize: "11px", fontWeight: 700, color: contrastRatio(currentHex, "#000") > 4.5 ? "#000" : "#fff" }}>BG</span>}
                      {isText && <span aria-hidden="true" style={{ position: "absolute", top: "2px", left: "3px", fontSize: "11px", fontWeight: 700, color: contrastRatio(currentHex, "#000") > 4.5 ? "#000" : "#fff" }}>TXT</span>}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* 스케일 팔레트와 구분 — 앵커는 스케일(50~900)과 무관 */}
            <div aria-hidden="true" style={{ borderTop: "1px dashed var(--color-border)", marginTop: "8px", paddingTop: "8px" }} />

            {/* Surface 앵커 — White / Black 각자 한 행(모드 무관 고정값, 스케일 없음) */}
            {surfaceAnchors.map(({ label, hex, cssVar }) => {
              const isBg = bgColor.hex === hex;
              const isText = textColor.hex === hex;
              const isInteractive = !!selecting;
              const markerColor = contrastRatio(hex, "#000") > 4.5 ? "#000" : "#fff";
              const swatchBorder = isBg
                ? "3px solid var(--color-accent)"
                : isText
                ? "3px solid var(--color-accent-danger)"
                : "1px solid var(--color-border-overlay)";
              return (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "80px repeat(10, 1fr)", gap: "4px", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--font-size-label-sm)", fontWeight: 600 }}>{label}</span>
                  {/* 스케일 무관 표시용 dim 영역(칩 우측 컬럼 전체) */}
                  <span
                    aria-hidden="true"
                    style={{
                      gridColumn: "3 / -1",
                      gridRow: 1,
                      alignSelf: "stretch",
                      borderRadius: "6px",
                      /* dim은 배경에만 — 텍스트는 가독 대비 유지 */
                      background: "var(--color-border-overlay)",
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: "10px",
                      fontSize: "var(--font-size-caption)",
                      color: "var(--color-neutral-600)",
                    }}
                  >
                    스케일 해당 없음 (단일 값)
                  </span>
                  {isInteractive ? (
                    <button
                      type="button"
                      onClick={() => handleSwatchClick(hex, label)}
                      aria-label={`${label} (${hex}) — ${selecting === "bg" ? "배경색으로 선택" : "텍스트색으로 선택"}`}
                      aria-pressed={isBg || isText}
                      style={{ gridColumn: 2, height: "40px", borderRadius: "6px", backgroundColor: cssVar, border: swatchBorder, cursor: "pointer", opacity: !isBg && !isText ? 0.75 : 1, transition: "opacity 0.1s", position: "relative", padding: 0 }}
                    >
                      {isBg && <span aria-hidden="true" style={{ position: "absolute", top: "2px", left: "3px", fontSize: "11px", fontWeight: 700, color: markerColor }}>BG</span>}
                      {isText && <span aria-hidden="true" style={{ position: "absolute", top: "2px", left: "3px", fontSize: "11px", fontWeight: 700, color: markerColor }}>TXT</span>}
                    </button>
                  ) : (
                    <div
                      role="img"
                      aria-label={`${label} — ${hex}`}
                      style={{ gridColumn: 2, height: "40px", borderRadius: "6px", backgroundColor: cssVar, border: swatchBorder, position: "relative" }}
                    >
                      {isBg && <span aria-hidden="true" style={{ position: "absolute", top: "2px", left: "3px", fontSize: "11px", fontWeight: 700, color: markerColor }}>BG</span>}
                      {isText && <span aria-hidden="true" style={{ position: "absolute", top: "2px", left: "3px", fontSize: "11px", fontWeight: 700, color: markerColor }}>TXT</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Contrast Checker ── */}
        <section aria-labelledby="section-contrast" style={{ marginBottom: "64px" }}>
          <h2 id="section-contrast" style={{ fontSize: "var(--font-size-heading-md)", fontWeight: 700, marginBottom: "24px" }}>
            Contrast Checker
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            {/* BG 선택 */}
            <div>
              <p id="label-bg" style={{ fontSize: "var(--font-size-label-sm)", color: "var(--color-neutral-500)", marginBottom: "6px", margin: "0 0 6px" }}>
                Background
              </p>
              <button
                type="button"
                onClick={() => setSelecting(selecting === "bg" ? null : "bg")}
                aria-labelledby="label-bg"
                aria-expanded={selecting === "bg"}
                aria-describedby="bg-color-value"
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
                  border: selecting === "bg" ? "2px solid var(--color-accent)" : "2px solid var(--color-neutral-200)",
                  background: "var(--background)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{ display: "block", width: "32px", height: "32px", borderRadius: "6px", background: bgColor.hex, border: "1px solid var(--color-border-overlay)", flexShrink: 0 }}
                />
                <span style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                  <span style={{ fontSize: "var(--font-size-label-md)", fontWeight: 600 }}>{bgColor.label}</span>
                  <span id="bg-color-value" style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>{bgColor.hex}</span>
                </span>
                <span aria-hidden="true" style={{ marginLeft: "auto", fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>
                  {selecting === "bg" ? "클릭 취소" : "팔레트에서 선택 →"}
                </span>
              </button>
            </div>

            {/* Text 선택 */}
            <div>
              <p id="label-text" style={{ fontSize: "var(--font-size-label-sm)", color: "var(--color-neutral-500)", margin: "0 0 6px" }}>
                Text
              </p>
              <button
                type="button"
                onClick={() => setSelecting(selecting === "text" ? null : "text")}
                aria-labelledby="label-text"
                aria-expanded={selecting === "text"}
                aria-describedby="text-color-value"
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
                  border: selecting === "text" ? "2px solid var(--color-accent-danger)" : "2px solid var(--color-neutral-200)",
                  background: "var(--background)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{ display: "block", width: "32px", height: "32px", borderRadius: "6px", background: textColor.hex, border: "1px solid var(--color-border-overlay)", flexShrink: 0 }}
                />
                <span style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                  <span style={{ fontSize: "var(--font-size-label-md)", fontWeight: 600 }}>{textColor.label}</span>
                  <span id="text-color-value" style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>{textColor.hex}</span>
                </span>
                <span aria-hidden="true" style={{ marginLeft: "auto", fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>
                  {selecting === "text" ? "클릭 취소" : "팔레트에서 선택 →"}
                </span>
              </button>
            </div>
          </div>

          {/* 결과 */}
          <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid var(--color-neutral-200)" }}>
            {/* 미리보기 — 텍스트 견본은 role="img"로, 인터랙티브 데모는 일반 마크업으로 분리 */}
            <div style={{ background: bgColor.hex, padding: "40px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* 큰 텍스트 견본은 요소 자체에 role="img" — WAVE는 부모가 아닌 텍스트 요소를 직접 평가함 */}
                <span role="img" aria-label={`배경색 ${bgColor.label}, 텍스트색 ${textColor.label} 큰 텍스트 견본`} style={{ display: "block", color: textColor.hex, fontSize: "32px", fontWeight: 700, lineHeight: 1.2 }}>
                  큰 텍스트 — Large Text (Bold 18px+)
                </span>
                <p style={{ color: textColor.hex, fontSize: "16px", fontWeight: 400, margin: 0, lineHeight: 1.6 }}>
                  일반 텍스트 — Normal Text (16px). 가나다라마바사 ABC 123. 웹 접근성 대비 확인 미리보기입니다.
                </p>
                <p style={{ color: textColor.hex, fontSize: "12px", fontWeight: 400, margin: 0, lineHeight: 1.6 }}>
                  작은 텍스트 — Caption (12px). 이 크기에서는 대비율이 더 중요합니다.
                </p>
              </div>

              <div aria-hidden="true" style={{ borderTop: `1px solid ${textColor.hex}`, opacity: 0.15 }} />

              {/* 아이콘 미리보기 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ color: textColor.hex, fontSize: "12px", fontWeight: 600, margin: 0, opacity: 0.6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Icon Preview (SC 1.4.11 — AA 3:1)
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
                  {/* 아이콘 단독 */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div role="group" aria-label="아이콘 단독 예시" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <svg aria-label="홈" role="img" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      <svg aria-label="검색" role="img" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <svg aria-label="알림" role="img" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                      </svg>
                      <svg aria-label="사용자" role="img" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      <svg aria-label="설정" role="img" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                      </svg>
                    </div>
                    <span aria-hidden="true" style={{ color: textColor.hex, fontSize: "11px", opacity: 0.6 }}>아이콘 단독</span>
                  </div>

                  {/* 아이콘 + 텍스트 (면제 케이스) */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                    <nav aria-label="아이콘과 텍스트 조합 예시">
                      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                        <li>
                          <a href="#" onClick={(e) => e.preventDefault()} style={{ display: "flex", alignItems: "center", gap: "8px", color: textColor.hex, textDecoration: "none" }}>
                            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                            <span style={{ fontSize: "14px", fontWeight: 500 }}>홈</span>
                          </a>
                        </li>
                        <li>
                          <a href="#" onClick={(e) => e.preventDefault()} style={{ display: "flex", alignItems: "center", gap: "8px", color: textColor.hex, textDecoration: "none" }}>
                            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <span style={{ fontSize: "14px", fontWeight: 500 }}>검색</span>
                          </a>
                        </li>
                      </ul>
                    </nav>
                    <span aria-hidden="true" style={{ color: textColor.hex, fontSize: "11px", opacity: 0.6 }}>아이콘 + 텍스트 (대비 요건 면제)</span>
                  </div>

                  {/* 버튼 UI 컴포넌트 */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        style={{
                          display: "flex", alignItems: "center", gap: "6px",
                          padding: "8px 16px", borderRadius: "8px",
                          border: `2px solid ${textColor.hex}`,
                          background: "transparent", color: textColor.hex,
                          fontSize: "14px", fontWeight: 500, cursor: "pointer",
                        }}
                      >
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        추가하기
                      </button>
                      <button
                        type="button"
                        aria-label="닫기"
                        style={{
                          padding: "8px 12px", borderRadius: "8px",
                          border: `2px solid ${textColor.hex}`,
                          background: "transparent", cursor: "pointer",
                        }}
                      >
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    <span aria-hidden="true" style={{ color: textColor.hex, fontSize: "11px", opacity: 0.6 }}>UI 컴포넌트 (버튼 테두리 3:1)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 결과 패널 */}
            <div
              role="region"
              aria-label={`대비율 결과: ${ratio}:1 — ${level}`}
              aria-live="polite"
              aria-atomic="true"
              style={{
                background: "var(--background)", padding: "24px",
                display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr 1fr", gap: "0",
                alignItems: "start", borderTop: "1px solid var(--color-neutral-200)",
              }}
            >
              <div style={{ paddingRight: "32px", borderRight: "1px solid var(--color-neutral-200)" }}>
                <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", margin: "0 0 4px" }}>대비율</p>
                <output style={{ display: "block" }}>
                  {/* 숫자는 role="img" 그래픽으로 명시 — 제목 오인(Possible heading) 방지 */}
                  <span role="img" aria-label={`대비율 ${ratio} 대 1`} style={{ display: "block", fontSize: "40px", fontWeight: 700, lineHeight: 1 }}>
                    {ratio}<span aria-hidden="true" style={{ fontSize: "16px", fontWeight: 400 }}>:1</span>
                  </span>
                </output>
                <LevelBadge level={level} />
              </div>

              <div style={{ paddingLeft: "24px", borderRight: "1px solid var(--color-neutral-200)", paddingRight: "24px" }}>
                <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", margin: "0 0 8px", fontWeight: 600 }}>일반 텍스트</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-500)", width: "32px" }}>AA</span>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>4.5:1</span>
                    <span role="img" aria-label={ratio >= 4.5 ? "통과" : "실패"}>{ratio >= 4.5 ? "✅" : "❌"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-500)", width: "32px" }}>AAA</span>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>7:1</span>
                    <span role="img" aria-label={ratio >= 7 ? "통과" : "실패"}>{ratio >= 7 ? "✅" : "❌"}</span>
                  </div>
                </div>
              </div>

              <div style={{ paddingLeft: "24px", borderRight: "1px solid var(--color-neutral-200)", paddingRight: "24px" }}>
                <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", margin: "0 0 8px", fontWeight: 600 }}>
                  큰 텍스트 <span style={{ fontWeight: 400 }}>(18px+ / bold 14px+)</span>
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-500)", width: "32px" }}>AA</span>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>3:1</span>
                    <span role="img" aria-label={ratio >= 3 ? "통과" : "실패"}>{ratio >= 3 ? "✅" : "❌"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-500)", width: "32px" }}>AAA</span>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>4.5:1</span>
                    <span role="img" aria-label={ratio >= 4.5 ? "통과" : "실패"}>{ratio >= 4.5 ? "✅" : "❌"}</span>
                  </div>
                </div>
              </div>

              <div style={{ paddingLeft: "24px", borderRight: "1px solid var(--color-neutral-200)", paddingRight: "24px" }}>
                <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", margin: "0 0 8px", fontWeight: 600 }}>아이콘 / 그래픽</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-500)", width: "32px" }}>AA</span>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>3:1</span>
                    <span role="img" aria-label={ratio >= 3 ? "통과" : "실패"}>{ratio >= 3 ? "✅" : "❌"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-500)", width: "32px" }}>AAA</span>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>—</span>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-500)" }}>기준 없음</span>
                  </div>
                </div>
              </div>

              <div style={{ paddingLeft: "24px" }}>
                <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", margin: "0 0 8px", fontWeight: 600 }}>UI 컴포넌트</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-500)", width: "32px" }}>AA</span>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>3:1</span>
                    <span role="img" aria-label={ratio >= 3 ? "통과" : "실패"}>{ratio >= 3 ? "✅" : "❌"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-500)", width: "32px" }}>AAA</span>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>—</span>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-500)" }}>기준 없음</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 전체 팔레트 대비 매트릭스 */}
          <div style={{ marginTop: "32px" }}>
            <h3 style={{ fontSize: "var(--font-size-heading-sm)", fontWeight: 700, marginBottom: "16px" }}>
              현재 배경색 기준 — 전체 팔레트 대비율
            </h3>
            <div role="group" aria-label="전체 팔레트 대비율 매트릭스" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "80px repeat(10, 1fr)", gap: "4px" }}>
                <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }} />
                {scales.map((s) => (
                  <span key={s} style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", textAlign: "center" }}>{s}</span>
                ))}
              </div>
              {primitiveColors.map(({ family, name, swatches }) => (
                <div key={family} style={{ display: "grid", gridTemplateColumns: "80px repeat(10, 1fr)", gap: "4px", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--font-size-label-sm)", fontWeight: 600 }}>{family}</span>
                  {swatches.map(({ scale, hex }) => {
                    const r = contrastRatio(bgColor.hex, hexOf(name, scale, hex));
                    const lv = getContrastLevel(r);
                    const s = levelStyle[lv];
                    return (
                      <div
                        key={scale}
                        role="img"
                        aria-label={`${family} ${scale}: 대비율 ${r}:1 — ${lv}`}
                        style={{
                          height: "40px", borderRadius: "6px",
                          background: s.bg,
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center", gap: "1px",
                        }}
                      >
                        <span aria-hidden="true" style={{ fontSize: "11px", fontWeight: 700, color: s.color }}>{lv}</span>
                        <span aria-hidden="true" style={{ fontSize: "11px", color: s.color }}>{r}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div role="list" aria-label="대비율 등급 범례" style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
              {(Object.entries(levelStyle) as [ContrastLevel, typeof levelStyle[ContrastLevel]][]).map(([lv, s]) => (
                <div key={lv} role="listitem" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div aria-hidden="true" style={{ width: "12px", height: "12px", borderRadius: "3px", background: s.bg }} />
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-500)" }}>
                    {lv === "AAA" ? "AAA 7:1+" : lv === "AA" ? "AA 4.5:1+" : lv === "AA Large" ? "AA Large 3:1+" : "Fail"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Overlay (반투명, 모드 인지) ── */}
        <section aria-labelledby="section-alpha" style={{ marginBottom: "64px" }}>
          <h2 id="section-alpha" style={{ fontSize: "var(--font-size-heading-md)", fontWeight: 700, marginBottom: "8px" }}>Overlay</h2>
          <p style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-text-muted)", marginBottom: "24px" }}>
            오버레이용 반투명 시맨틱 토큰. 라이트=검정α / 다크=흰색α로 모드에 따라 자동 전환됩니다. 체크무늬 위에서 투명도를 확인하세요.
          </p>
          <div role="list" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* 헤더 */}
            <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "160px 1fr 200px", gap: "16px", alignItems: "center", paddingBottom: "4px" }}>
              <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>Token</span>
              <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>Transparency</span>
              <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>Value ({isDark ? "Dark" : "Light"})</span>
            </div>
            {overlayTokens.map(({ label, cssVar, light, dark }) => (
              <div role="listitem" key={label} style={{ display: "grid", gridTemplateColumns: "160px 1fr 200px", gap: "16px", alignItems: "center" }}>
                <span style={{ fontSize: "var(--font-size-label-sm)", fontWeight: 600 }}>{label}</span>
                {/* 체크무늬 위에 알파 색을 올려 투명도를 가시화. 다크모드(흰색α)는 어두운 체커 */}
                <div
                  role="img"
                  aria-label={`${label} — 체크무늬 위 반투명 견본`}
                  style={{ height: "40px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--color-border)", ...(isDark ? checkerDark : checkerLight) }}
                >
                  <div style={{ width: "100%", height: "100%", background: `var(${cssVar})` }} />
                </div>
                <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)", fontFamily: "monospace" }}>{isDark ? dark : light}</span>
              </div>
            ))}
          </div>
        </section>

        </div>{/* /panel-color */}

        {/* ── Tab Panel 2: Typography ── */}
        <div role="tabpanel" id="panel-type" aria-labelledby="tab-type" hidden={activeTab !== "type"}>

        {/* ── Font Family ── */}
        <section aria-labelledby="section-font" style={{ marginBottom: "64px" }}>
          <h2 id="section-font" style={{ fontSize: "var(--font-size-heading-md)", fontWeight: 700, marginBottom: "24px" }}>Font Family</h2>

          <div style={{ borderRadius: "16px", border: "1px solid var(--color-neutral-200)", overflow: "hidden" }}>
            {/* 글꼴 견본 — 큰 텍스트 요소 자체에 role="img" (정보는 아래 dl에서 제공) */}
            <div style={{ padding: "48px 40px", background: "var(--color-neutral-50)", borderBottom: "1px solid var(--color-neutral-200)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span role="img" aria-label="Pretendard GOV 글꼴 견본" style={{ display: "block", fontSize: "48px", fontWeight: 700, lineHeight: 1.2, fontFamily: "var(--font-family-base)" }}>Pretendard GOV</span>
              <span role="img" aria-label="한글 견본" style={{ display: "block", fontSize: "24px", fontWeight: 400, lineHeight: 1.6, fontFamily: "var(--font-family-base)" }}>
                가나다라마바사아자차카타파하 — ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </span>
              <span role="img" aria-label="영문·숫자·특수문자 견본" style={{ display: "block", fontSize: "18px", fontWeight: 400, lineHeight: 1.6, fontFamily: "var(--font-family-base)", color: "var(--color-neutral-500)" }}>
                abcdefghijklmnopqrstuvwxyz — 0123456789 !@#$%^&*()
              </span>
            </div>

            <div style={{ padding: "32px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              <dl style={{ display: "flex", flexDirection: "column", gap: "16px", margin: 0 }}>
                {[
                  { label: "폰트명", value: "Pretendard GOV" },
                  { label: "제작자", value: "Kil Hyung-jin (orioncactus)" },
                  { label: "버전", value: "v1.3.9" },
                  { label: "라이선스", value: "SIL Open Font License 1.1 (OFL-1.1) — 상업적 사용 가능, 수정·재배포 가능" },
                  { label: "기반 폰트", value: "Inter (라틴) + Apple SD Gothic Neo (한글) — Apple의 산돌 서체 기반" },
                  { label: "CSS 변수", value: "--font-family-base" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</dt>
                    <dd style={{ fontSize: "var(--font-size-body-sm)", marginTop: "2px", marginLeft: 0 }}>{value}</dd>
                  </div>
                ))}
              </dl>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 2px" }}>공식 GitHub</p>
                  <a href="https://github.com/orioncactus/pretendard" target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-green-500)", wordBreak: "break-all" }}>
                    github.com/orioncactus/pretendard
                    <span className="sr-only">(새 창에서 열림)</span>
                  </a>
                </div>
                <div>
                  <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 2px" }}>원본 다운로드</p>
                  <a href="https://github.com/orioncactus/pretendard/releases/tag/v1.3.9" target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-green-500)", wordBreak: "break-all" }}>
                    github.com/orioncactus/pretendard/releases/tag/v1.3.9
                    <span className="sr-only">(새 창에서 열림)</span>
                  </a>
                  <p style={{ margin: "4px 0 0", fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>Assets → pretendard-gov.zip 다운로드</p>
                </div>
                <div>
                  <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 4px" }}>이 프로젝트 적용 방식</p>
                  <p style={{ margin: "0 0 8px", fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>CDN (jsDelivr) — layout.tsx {"<head>"} 삽입</p>
                  <pre style={{ margin: 0, padding: "12px 16px", borderRadius: "8px", background: "var(--color-neutral-100)", fontSize: "12px", wordBreak: "break-all", color: "var(--color-neutral-700)", border: "1px solid var(--color-neutral-200)", whiteSpace: "pre-wrap" }}>
                    <code>{`https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-gov.min.css`}</code>
                  </pre>
                </div>
                <div>
                  <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 4px" }}>GOV 버전 특징</p>
                  <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {["공공기관·정부 웹사이트 최적화", "한국 웹 접근성 지침(KWCAG) 대응", "완성형 한글 11,172자 전체 지원", "다양한 weight 지원 (100–900)"].map((item) => (
                      <li key={item} style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-600)" }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ padding: "24px 40px", borderTop: "1px solid var(--color-neutral-200)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>Weight</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
                {[{ weight: 100, label: "Thin" }, { weight: 300, label: "Light" }, { weight: 400, label: "Regular" }, { weight: 600, label: "SemiBold" }, { weight: 700, label: "Bold" }].map(({ weight, label }) => (
                  <div key={weight} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {/* 견본 글자는 그래픽으로 표시 — 정보는 아래 레이블이 전달 */}
                    <span role="img" aria-label={`${weight} ${label} 견본`} style={{ fontSize: "24px", fontWeight: weight, fontFamily: "var(--font-family-base)", lineHeight: 1.3 }}>가나다 Aa</span>
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)" }}>{weight} · {label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Typography ── */}
        <section aria-labelledby="section-typography">
          <h2 id="section-typography" style={{ fontSize: "var(--font-size-heading-md)", fontWeight: 700, marginBottom: "24px" }}>Typography</h2>
          <dl style={{ display: "flex", flexDirection: "column", gap: "16px", margin: 0 }}>
            {typographyTokens.map(({ label, var: cssVar, weight }) => (
              <div key={cssVar} style={{ display: "flex", alignItems: "baseline", gap: "16px", borderBottom: "1px solid var(--color-neutral-200)", paddingBottom: "12px" }}>
                <dt style={{ width: "120px", fontSize: "var(--font-size-caption)", color: "var(--color-neutral-400)", flexShrink: 0 }}>{label}</dt>
                {/* 견본은 dd 안의 span role="img"로 표시 (토큰명은 dt가 전달) */}
                <dd style={{ fontSize: `var(${cssVar})`, fontWeight: weight, lineHeight: 1.2, margin: 0 }}>
                  <span role="img" aria-label="글꼴 견본">가나다 ABC 123</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        </div>{/* /panel-type */}

        {/* 모드 토글 — DOM 마지막에 두어 콘텐츠 뒤에 포커스. fixed라 시각 위치는 우하단 고정 */}
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          aria-pressed={isDark}
          aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
          style={{
            position: "fixed", bottom: "24px", right: "24px", zIndex: 50,
            padding: "10px 20px", borderRadius: "999px",
            border: "1px solid var(--color-border)",
            background: isDark ? "var(--color-neutral-800)" : "var(--color-neutral-100)",
            color: "var(--foreground)",
            fontSize: "var(--font-size-label-md)", fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 16px var(--color-shadow)",
          }}
        >
          <span aria-hidden="true">{isDark ? "🌙" : "☀️"}</span>
          <span style={{ marginLeft: "6px" }}>{isDark ? "Dark" : "Light"}</span>
        </button>
      </main>
    </>
  );
}
