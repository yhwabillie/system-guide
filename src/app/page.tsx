"use client";

import { useState, useEffect } from "react";
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
  AAA:       { bg: "#0f5b41", color: "#fff",    label: "AAA" },
  AA:        { bg: "#3fa87f", color: "#fff",    label: "AA" },
  "AA Large": { bg: "#d4bb8a", color: "#24170f", label: "AA Large" },
  Fail:      { bg: "#7f0019", color: "#fff",    label: "Fail" },
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const ratio = contrastRatio(bgColor.hex, textColor.hex);
  const level = getContrastLevel(ratio);

  function handleSwatchClick(hex: string, label: string) {
    if (selecting === "bg") setBgColor({ hex, label });
    else if (selecting === "text") setTextColor({ hex, label });
    setSelecting(null);
  }

  return (
    <main className="min-h-screen p-10 transition-colors duration-300" style={{
      fontFamily: "var(--font-family-base)",
      background: "var(--background)",
      color: "var(--foreground)",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "var(--font-size-display-lg)", fontWeight: 700 }}>Design Token Preview</h1>
        <button
          onClick={() => setIsDark(!isDark)}
          style={{
            padding: "8px 20px", borderRadius: "999px",
            border: "1px solid var(--primitive-neutral-300)",
            background: isDark ? "var(--primitive-neutral-800)" : "var(--primitive-neutral-100)",
            color: "var(--foreground)",
            fontSize: "var(--font-size-label-md)", fontWeight: 600, cursor: "pointer",
          }}
        >
          {isDark ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
      <p style={{ fontSize: "var(--font-size-body-md)", color: "var(--primitive-neutral-400)", marginBottom: "48px" }}>
        Figma variables → CSS custom properties 적용 확인
      </p>

      {/* ── Color Palette ── */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "var(--font-size-heading-md)", fontWeight: 700, marginBottom: "8px" }}>Color Palette</h2>

        {/* 선택 모드 안내 */}
        {selecting && (
          <div style={{
            marginBottom: "12px", padding: "10px 16px", borderRadius: "8px",
            background: selecting === "bg" ? "var(--primitive-red-100)" : "var(--primitive-green-100)",
            color: selecting === "bg" ? "var(--primitive-red-600)" : "var(--primitive-green-600)",
            fontSize: "var(--font-size-label-md)", fontWeight: 600,
          }}>
            {selecting === "bg" ? "🎨 배경색으로 사용할 컬러를 클릭하세요" : "✏️ 텍스트색으로 사용할 컬러를 클릭하세요"}
            <button
              onClick={() => setSelecting(null)}
              style={{ marginLeft: "12px", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
            >
              ✕ 취소
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px repeat(10, 1fr)", gap: "4px", marginBottom: "4px" }}>
            <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>Family</span>
            {scales.map((s) => (
              <span key={s} style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", textAlign: "center" }}>{s}</span>
            ))}
          </div>
          {primitiveColors.map(({ family, swatches }) => (
            <div key={family} style={{ display: "grid", gridTemplateColumns: "80px repeat(10, 1fr)", gap: "4px", alignItems: "center" }}>
              <span style={{ fontSize: "var(--font-size-label-sm)", fontWeight: 600 }}>{family}</span>
              {swatches.map(({ scale, hex }) => {
                const label = `${family} ${scale}`;
                const isBg = bgColor.hex === hex;
                const isText = textColor.hex === hex;
                return (
                  <div
                    key={scale}
                    title={`${label} — ${hex}`}
                    onClick={() => selecting && handleSwatchClick(hex, label)}
                    style={{
                      height: "40px", borderRadius: "6px",
                      backgroundColor: hex,
                      border: isBg
                        ? "3px solid #3fa87f"
                        : isText
                        ? "3px solid #c93b5c"
                        : "1px solid rgba(128,128,128,0.2)",
                      cursor: selecting ? "pointer" : "default",
                      opacity: selecting && !isBg && !isText ? 0.75 : 1,
                      outline: selecting && !isBg && !isText ? "2px dashed rgba(128,128,128,0.4)" : "none",
                      outlineOffset: "2px",
                      transition: "opacity 0.1s",
                      position: "relative",
                    }}
                  >
                    {isBg && (
                      <span style={{ position: "absolute", top: "2px", left: "3px", fontSize: "9px", fontWeight: 700, color: contrastRatio(hex, "#000") > 4.5 ? "#000" : "#fff" }}>BG</span>
                    )}
                    {isText && (
                      <span style={{ position: "absolute", top: "2px", left: "3px", fontSize: "9px", fontWeight: 700, color: contrastRatio(hex, "#000") > 4.5 ? "#000" : "#fff" }}>TXT</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* ── Contrast Checker ── */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "var(--font-size-heading-md)", fontWeight: 700, marginBottom: "24px" }}>
          Contrast Checker
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          {/* BG 선택 */}
          <div>
            <p style={{ fontSize: "var(--font-size-label-sm)", color: "var(--primitive-neutral-500)", marginBottom: "6px" }}>Background</p>
            <button
              onClick={() => setSelecting(selecting === "bg" ? null : "bg")}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
                border: selecting === "bg" ? "2px solid #3fa87f" : "2px solid var(--primitive-neutral-200)",
                background: "var(--background)",
              }}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: bgColor.hex, border: "1px solid rgba(128,128,128,0.3)", flexShrink: 0 }} />
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: "var(--font-size-label-md)", fontWeight: 600, margin: 0 }}>{bgColor.label}</p>
                <p style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", margin: 0 }}>{bgColor.hex}</p>
              </div>
              <span style={{ marginLeft: "auto", fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>
                {selecting === "bg" ? "클릭 취소" : "팔레트에서 선택 →"}
              </span>
            </button>
          </div>

          {/* Text 선택 */}
          <div>
            <p style={{ fontSize: "var(--font-size-label-sm)", color: "var(--primitive-neutral-500)", marginBottom: "6px" }}>Text</p>
            <button
              onClick={() => setSelecting(selecting === "text" ? null : "text")}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
                border: selecting === "text" ? "2px solid #c93b5c" : "2px solid var(--primitive-neutral-200)",
                background: "var(--background)",
              }}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: textColor.hex, border: "1px solid rgba(128,128,128,0.3)", flexShrink: 0 }} />
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: "var(--font-size-label-md)", fontWeight: 600, margin: 0 }}>{textColor.label}</p>
                <p style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", margin: 0 }}>{textColor.hex}</p>
              </div>
              <span style={{ marginLeft: "auto", fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>
                {selecting === "text" ? "클릭 취소" : "팔레트에서 선택 →"}
              </span>
            </button>
          </div>
        </div>

        {/* 결과 */}
        <div style={{
          borderRadius: "16px", overflow: "hidden",
          border: "1px solid var(--primitive-neutral-200)",
        }}>
          {/* 미리보기 */}
          <div style={{ background: bgColor.hex, padding: "40px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* 텍스트 미리보기 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <p style={{ color: textColor.hex, fontSize: "32px", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                큰 텍스트 — Large Text (Bold 18px+)
              </p>
              <p style={{ color: textColor.hex, fontSize: "16px", fontWeight: 400, margin: 0, lineHeight: 1.6 }}>
                일반 텍스트 — Normal Text (16px). 가나다라마바사 ABC 123. 웹 접근성 대비 확인 미리보기입니다.
              </p>
              <p style={{ color: textColor.hex, fontSize: "12px", fontWeight: 400, margin: 0, lineHeight: 1.6 }}>
                작은 텍스트 — Caption (12px). 이 크기에서는 대비율이 더 중요합니다.
              </p>
            </div>

            {/* 구분선 */}
            <div style={{ borderTop: `1px solid ${textColor.hex}`, opacity: 0.15 }} />

            {/* 아이콘 미리보기 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ color: textColor.hex, fontSize: "12px", fontWeight: 600, margin: 0, opacity: 0.6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Icon Preview (SC 1.4.11 — AA 3:1)
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
                {/* 아이콘 단독 */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    {/* Home */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    {/* Search */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    {/* Bell */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                    </svg>
                    {/* User */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    {/* Settings */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                    </svg>
                  </div>
                  <span style={{ color: textColor.hex, fontSize: "11px", opacity: 0.6 }}>아이콘 단독</span>
                </div>

                {/* 아이콘 + 텍스트 (면제 케이스) */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      <span style={{ color: textColor.hex, fontSize: "14px", fontWeight: 500 }}>홈</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <span style={{ color: textColor.hex, fontSize: "14px", fontWeight: 500 }}>검색</span>
                    </div>
                  </div>
                  <span style={{ color: textColor.hex, fontSize: "11px", opacity: 0.6 }}>아이콘 + 텍스트 (대비 요건 면제)</span>
                </div>

                {/* 버튼 UI 컴포넌트 */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "8px 16px", borderRadius: "8px",
                      border: `2px solid ${textColor.hex}`,
                      background: "transparent", color: textColor.hex,
                      fontSize: "14px", fontWeight: 500, cursor: "pointer",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      추가하기
                    </button>
                    <button style={{
                      padding: "8px 12px", borderRadius: "8px",
                      border: `2px solid ${textColor.hex}`,
                      background: "transparent", cursor: "pointer",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <span style={{ color: textColor.hex, fontSize: "11px", opacity: 0.6 }}>UI 컴포넌트 (버튼 테두리 3:1)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 결과 패널 */}
          <div style={{
            background: "var(--background)", padding: "24px",
            display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr 1fr", gap: "0",
            alignItems: "start", borderTop: "1px solid var(--primitive-neutral-200)",
          }}>
            {/* 대비율 */}
            <div style={{ paddingRight: "32px", borderRight: "1px solid var(--primitive-neutral-200)" }}>
              <p style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", margin: "0 0 4px" }}>대비율</p>
              <p style={{ fontSize: "40px", fontWeight: 700, margin: 0, lineHeight: 1 }}>
                {ratio}<span style={{ fontSize: "16px", fontWeight: 400 }}>:1</span>
              </p>
            </div>

            {/* 일반 텍스트 */}
            <div style={{ paddingLeft: "24px", borderRight: "1px solid var(--primitive-neutral-200)", paddingRight: "24px" }}>
              <p style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", margin: "0 0 8px", fontWeight: 600 }}>
                일반 텍스트
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-500)", width: "32px" }}>AA</span>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>4.5:1</span>
                  <span>{ratio >= 4.5 ? "✅" : "❌"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-500)", width: "32px" }}>AAA</span>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>7:1</span>
                  <span>{ratio >= 7 ? "✅" : "❌"}</span>
                </div>
              </div>
            </div>

            {/* 큰 텍스트 — 18px+ 또는 bold 14px+ */}
            <div style={{ paddingLeft: "24px", borderRight: "1px solid var(--primitive-neutral-200)", paddingRight: "24px" }}>
              <p style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", margin: "0 0 8px", fontWeight: 600 }}>
                큰 텍스트 <span style={{ fontWeight: 400 }}>(18px+ / bold 14px+)</span>
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-500)", width: "32px" }}>AA</span>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>3:1</span>
                  <span>{ratio >= 3 ? "✅" : "❌"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-500)", width: "32px" }}>AAA</span>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>4.5:1</span>
                  <span>{ratio >= 4.5 ? "✅" : "❌"}</span>
                </div>
              </div>
            </div>

            {/* 아이콘 — WCAG 2.1 SC 1.4.11 */}
            <div style={{ paddingLeft: "24px", borderRight: "1px solid var(--primitive-neutral-200)", paddingRight: "24px" }}>
              <p style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", margin: "0 0 8px", fontWeight: 600 }}>
                아이콘 / 그래픽
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-500)", width: "32px" }}>AA</span>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>3:1</span>
                  <span>{ratio >= 3 ? "✅" : "❌"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-500)", width: "32px" }}>AAA</span>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>—</span>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-300)" }}>기준 없음</span>
                </div>
              </div>
            </div>

            {/* UI 컴포넌트 (버튼 테두리·입력 필드) — WCAG 2.1 SC 1.4.11 */}
            <div style={{ paddingLeft: "24px" }}>
              <p style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", margin: "0 0 8px", fontWeight: 600 }}>
                UI 컴포넌트
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-500)", width: "32px" }}>AA</span>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>3:1</span>
                  <span>{ratio >= 3 ? "✅" : "❌"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-500)", width: "32px" }}>AAA</span>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>—</span>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-300)" }}>기준 없음</span>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px repeat(10, 1fr)", gap: "4px" }}>
              <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }} />
              {scales.map((s) => (
                <span key={s} style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", textAlign: "center" }}>{s}</span>
              ))}
            </div>
            {primitiveColors.map(({ family, swatches }) => (
              <div key={family} style={{ display: "grid", gridTemplateColumns: "80px repeat(10, 1fr)", gap: "4px", alignItems: "center" }}>
                <span style={{ fontSize: "var(--font-size-label-sm)", fontWeight: 600 }}>{family}</span>
                {swatches.map(({ scale, hex }) => {
                  const r = contrastRatio(bgColor.hex, hex);
                  const lv = getContrastLevel(r);
                  const s = levelStyle[lv];
                  return (
                    <div
                      key={scale}
                      title={`${family} ${scale} (${hex}) — ${r}:1 ${lv}`}
                      style={{
                        height: "40px", borderRadius: "6px",
                        background: s.bg,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: "1px",
                      }}
                    >
                      <span style={{ fontSize: "9px", fontWeight: 700, color: s.color }}>{lv}</span>
                      <span style={{ fontSize: "9px", color: s.color }}>{r}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
            {(Object.entries(levelStyle) as [ContrastLevel, typeof levelStyle[ContrastLevel]][]).map(([lv, s]) => (
              <div key={lv} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: s.bg }} />
                <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-500)" }}>
                  {lv === "AAA" ? "AAA 7:1+" : lv === "AA" ? "AA 4.5:1+" : lv === "AA Large" ? "AA Large 3:1+" : "Fail"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Font Family ── */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "var(--font-size-heading-md)", fontWeight: 700, marginBottom: "24px" }}>Font Family</h2>

        <div style={{
          borderRadius: "16px",
          border: "1px solid var(--primitive-neutral-200)",
          overflow: "hidden",
        }}>
          {/* 폰트 대표 미리보기 */}
          <div style={{
            padding: "48px 40px",
            background: "var(--primitive-neutral-50)",
            borderBottom: "1px solid var(--primitive-neutral-200)",
            display: "flex", flexDirection: "column", gap: "4px",
          }}>
            <p style={{ margin: 0, fontSize: "48px", fontWeight: 700, lineHeight: 1.2, fontFamily: "var(--font-family-base)" }}>
              Pretendard GOV
            </p>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: 400, lineHeight: 1.6, fontFamily: "var(--font-family-base)" }}>
              가나다라마바사아자차카타파하 — ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: 400, lineHeight: 1.6, fontFamily: "var(--font-family-base)", color: "var(--primitive-neutral-500)" }}>
              abcdefghijklmnopqrstuvwxyz — 0123456789 !@#$%^&*()
            </p>
          </div>

          {/* 폰트 정보 */}
          <div style={{
            padding: "32px 40px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px",
          }}>
            {/* 왼쪽: 기본 정보 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "폰트명", value: "Pretendard GOV" },
                { label: "제작자", value: "Kil Hyung-jin (orioncactus)" },
                { label: "버전", value: "v1.3.9" },
                { label: "라이선스", value: "SIL Open Font License 1.1 (OFL-1.1) — 상업적 사용 가능, 수정·재배포 가능" },
                { label: "기반 폰트", value: "Inter (라틴) + Apple SD Gothic Neo (한글) — Apple의 산돌 서체 기반" },
                { label: "CSS 변수", value: "--font-family-base" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", gap: "0", flexDirection: "column" }}>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {label}
                  </span>
                  <span style={{ fontSize: "var(--font-size-body-sm)", marginTop: "2px" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* 오른쪽: 링크 및 사용 방법 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  공식 GitHub
                </span>
                <p style={{ margin: "2px 0 0" }}>
                  <a
                    href="https://github.com/orioncactus/pretendard"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "var(--font-size-body-sm)", color: "var(--primitive-green-500)", wordBreak: "break-all" }}
                  >
                    github.com/orioncactus/pretendard
                  </a>
                </p>
              </div>

              <div>
                <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  원본 다운로드
                </span>
                <p style={{ margin: "2px 0 0" }}>
                  <a
                    href="https://github.com/orioncactus/pretendard/releases/tag/v1.3.9"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "var(--font-size-body-sm)", color: "var(--primitive-green-500)", wordBreak: "break-all" }}
                  >
                    github.com/orioncactus/pretendard/releases/tag/v1.3.9
                  </a>
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>
                  Assets → pretendard-gov.zip 다운로드
                </p>
              </div>

              <div>
                <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  이 프로젝트 적용 방식
                </span>
                <p style={{ margin: "4px 0 0", fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>CDN (jsDelivr) — layout.tsx {"<head>"} 삽입</p>
                <div style={{
                  marginTop: "8px", padding: "12px 16px", borderRadius: "8px",
                  background: "var(--primitive-neutral-100)",
                  fontFamily: "monospace", fontSize: "12px", wordBreak: "break-all",
                  color: "var(--primitive-neutral-700)",
                  border: "1px solid var(--primitive-neutral-200)",
                }}>
                  {`https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-gov.min.css`}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  GOV 버전 특징
                </span>
                <ul style={{ margin: "4px 0 0", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {[
                    "공공기관·정부 웹사이트 최적화",
                    "한국 웹 접근성 지침(KWCAG) 대응",
                    "완성형 한글 11,172자 전체 지원",
                    "다양한 weight 지원 (100–900)",
                  ].map((item) => (
                    <li key={item} style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-600)" }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* weight 미리보기 */}
          <div style={{
            padding: "24px 40px",
            borderTop: "1px solid var(--primitive-neutral-200)",
            display: "flex", flexDirection: "column", gap: "12px",
          }}>
            <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Weight
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
              {[
                { weight: 100, label: "Thin" },
                { weight: 300, label: "Light" },
                { weight: 400, label: "Regular" },
                { weight: 600, label: "SemiBold" },
                { weight: 700, label: "Bold" },
              ].map(({ weight, label }) => (
                <div key={weight} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "24px", fontWeight: weight, fontFamily: "var(--font-family-base)", lineHeight: 1.3 }}>
                    가나다 Aa
                  </span>
                  <span style={{ fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)" }}>
                    {weight} · {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Typography ── */}
      <section>
        <h2 style={{ fontSize: "var(--font-size-heading-md)", fontWeight: 700, marginBottom: "24px" }}>Typography</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {typographyTokens.map(({ label, var: cssVar, weight }) => (
            <div key={cssVar} style={{
              display: "flex", alignItems: "baseline", gap: "16px",
              borderBottom: "1px solid var(--primitive-neutral-200)", paddingBottom: "12px",
            }}>
              <span style={{ width: "120px", fontSize: "var(--font-size-caption)", color: "var(--primitive-neutral-400)", flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: `var(${cssVar})`, fontWeight: weight, lineHeight: 1.2 }}>가나다 ABC 123</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
