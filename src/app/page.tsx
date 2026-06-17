"use client";

import { useState, useEffect, useRef } from "react";
import { contrastRatio, getContrastLevel, type ContrastLevel } from "@/lib/contrast";
import { breakpointTokens, containerTokens, layoutSidenavClass, layoutSidenavContentClass, layoutSidenavMenuClass } from "@/lib/layout-tokens";
import { pxToRem } from "@/lib/tokens";

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

const gradientTokens = [
  { label: "gradient-accent", utility: "bg-gradient-accent", desc: "브랜드 강조 — green 400 → 600 (135°)" },
  { label: "gradient-accent-subtle", utility: "bg-gradient-accent-subtle", desc: "은은한 강조 배경 — green 50 → 100 (↓)" },
  { label: "gradient-surface-fade-down", utility: "bg-gradient-surface-fade-down", desc: "표면 하단 페이드 — background → transparent (↓)" },
  { label: "gradient-surface-fade-up", utility: "bg-gradient-surface-fade-up", desc: "표면 상단 페이드 — background → transparent (↑)" },
  { label: "gradient-overlay-fade-up", utility: "bg-gradient-overlay-fade-up", desc: "이미지·카드 스크림 — overlay-strong → transparent (↑)" },
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

// 폰트 폴백 체인 — 각 단계는 해당 폰트로 렌더되어 시각 비교 가능
const fontStack = [
  { order: 1, name: "Pretendard GOV", family: "var(--font-pretendard-gov), sans-serif", role: "기본", source: "자체 호스팅 (next/font/local)", desc: "공공·접근성(KWCAG) 최적화 한글 폰트. 1순위로 사용." },
  { order: 2, name: "Noto Sans KR", family: "var(--font-noto), sans-serif", role: "폴백", source: "자체 호스팅 (next/font/local)", desc: "Pretendard 미로드 시 사용. preload:false 로 평상시엔 다운로드 안 함." },
  { order: 3, name: "sans-serif", family: "sans-serif", role: "최종", source: "시스템 기본", desc: "위 둘 다 불가 시 OS 기본 산세리프로 대체." },
];

const typographySample = "다람쥐 헌 쳇바퀴에 타고파 · ABC xyz 123 (4.5:1) !?";

// 역할별 타이포 토큰 — 개별 유틸리티(text/font/leading)와 묶음 유틸리티(typo) 모두 제공
const typographyTokens = [
  { label: "Display LG", var: "--font-size-display-lg", weight: "--font-weight-bold", typoClass: "typo-display-lg" },
  { label: "Display MD", var: "--font-size-display-md", weight: "--font-weight-bold", typoClass: "typo-display-md" },
  { label: "Display SM", var: "--font-size-display-sm", weight: "--font-weight-bold", typoClass: "typo-display-sm" },
  { label: "Heading LG", var: "--font-size-heading-lg", weight: "--font-weight-bold", typoClass: "typo-heading-lg" },
  { label: "Heading MD", var: "--font-size-heading-md", weight: "--font-weight-bold", typoClass: "typo-heading-md" },
  { label: "Heading SM", var: "--font-size-heading-sm", weight: "--font-weight-bold", typoClass: "typo-heading-sm" },
  { label: "Body LG", var: "--font-size-body-lg", weight: "--font-weight-regular", typoClass: "typo-body-lg" },
  { label: "Body MD", var: "--font-size-body-md", weight: "--font-weight-regular", typoClass: "typo-body-md" },
  { label: "Body SM", var: "--font-size-body-sm", weight: "--font-weight-regular", typoClass: "typo-body-sm" },
  { label: "Label XL", var: "--font-size-label-xl", weight: "--font-weight-semibold", typoClass: "typo-label-xl" },
  { label: "Label LG", var: "--font-size-label-lg", weight: "--font-weight-semibold", typoClass: "typo-label-lg" },
  { label: "Label MD", var: "--font-size-label-md", weight: "--font-weight-semibold", typoClass: "typo-label-md" },
  { label: "Label SM", var: "--font-size-label-sm", weight: "--font-weight-semibold", typoClass: "typo-label-sm" },
  { label: "Caption", var: "--font-size-caption", weight: "--font-weight-regular", typoClass: "typo-caption" },
];

const spacingTokens = [
  { name: "space-0", cssVar: "--space-0", px: "0", rem: "0", utility: "p-0 / gap-0" },
  { name: "space-1", cssVar: "--space-1", px: "4px", rem: "0.25rem", utility: "p-1 / gap-1" },
  { name: "space-2", cssVar: "--space-2", px: "8px", rem: "0.5rem", utility: "p-2 / gap-2" },
  { name: "space-3", cssVar: "--space-3", px: "12px", rem: "0.75rem", utility: "p-3 / gap-3" },
  { name: "space-4", cssVar: "--space-4", px: "16px", rem: "1rem", utility: "p-4 / gap-4" },
  { name: "space-5", cssVar: "--space-5", px: "20px", rem: "1.25rem", utility: "p-5 / gap-5" },
  { name: "space-6", cssVar: "--space-6", px: "24px", rem: "1.5rem", utility: "p-6 / gap-6" },
  { name: "space-8", cssVar: "--space-8", px: "32px", rem: "2rem", utility: "p-8 / gap-8" },
  { name: "space-10", cssVar: "--space-10", px: "40px", rem: "2.5rem", utility: "p-10 / gap-10" },
  { name: "space-12", cssVar: "--space-12", px: "48px", rem: "3rem", utility: "p-12 / gap-12" },
  { name: "space-16", cssVar: "--space-16", px: "64px", rem: "4rem", utility: "p-16 / gap-16" },
  { name: "space-20", cssVar: "--space-20", px: "80px", rem: "5rem", utility: "p-20 / gap-20" },
];

const radiusTokens = [
  { name: "radius-none", px: "0", rem: "0", utility: "rounded-none" },
  { name: "radius-sm", px: "6px", rem: "0.375rem", utility: "rounded-sm" },
  { name: "radius-md", px: "8px", rem: "0.5rem", utility: "rounded-md" },
  { name: "radius-lg", px: "10px", rem: "0.625rem", utility: "rounded-lg" },
  { name: "radius-xl", px: "12px", rem: "0.75rem", utility: "rounded-xl" },
  { name: "radius-2xl", px: "16px", rem: "1rem", utility: "rounded-2xl" },
  { name: "radius-full", px: "pill", rem: "9999rem", utility: "rounded-full" },
];

const fixedSizeTokens = [
  { name: "icon-xs", cssVar: "--size-icon-xs", px: "16px", rem: "1rem", utility: "size-icon-xs" },
  { name: "icon-sm", cssVar: "--size-icon-sm", px: "20px", rem: "1.25rem", utility: "size-icon-sm" },
  { name: "icon-md", cssVar: "--size-icon-md", px: "24px", rem: "1.5rem", utility: "size-icon-md" },
  { name: "icon-lg", cssVar: "--size-icon-lg", px: "32px", rem: "2rem", utility: "size-icon-lg" },
  { name: "icon-xl", cssVar: "--size-icon-xl", px: "40px", rem: "2.5rem", utility: "size-icon-xl" },
  { name: "control-sm", cssVar: "--size-control-sm", px: "32px", rem: "2rem", utility: "h-control-sm" },
  { name: "control-md", cssVar: "--size-control-md", px: "40px", rem: "2.5rem", utility: "h-control-md" },
  { name: "control-lg", cssVar: "--size-control-lg", px: "48px", rem: "3rem", utility: "h-control-lg" },
];

const iconSizeTokens = fixedSizeTokens.filter(({ name }) => name.startsWith("icon"));
const controlSizeTokens = fixedSizeTokens.filter(({ name }) => name.startsWith("control"));

const gridColumnTokens = [
  { name: "grid-cols-1", cols: 1, utility: "grid-cols-1", desc: "단일 열 — 히어로·상세 본문" },
  { name: "grid-cols-2", cols: 2, utility: "grid-cols-2", desc: "2열 — 폼 라벨/필드, 비교 레이아웃" },
  { name: "grid-cols-3", cols: 3, utility: "grid-cols-3", desc: "3열 — 카드·통계 3분할" },
  { name: "grid-cols-4", cols: 4, utility: "grid-cols-4", desc: "4열 — 대시보드 위젯" },
  { name: "grid-cols-6", cols: 6, utility: "grid-cols-6", desc: "6열 — 밀도 높은 데이터 그리드" },
  { name: "grid-cols-12", cols: 12, utility: "grid-cols-12", desc: "12열 — span 기반 페이지 레이아웃" },
];

const gridGapTokens = [
  { name: "gap-4", cssVar: "--space-4", px: "16px", rem: "1rem", utility: "gap-4", desc: "기본 간격 — 컴팩트 카드·폼" },
  { name: "gap-6", cssVar: "--space-6", px: "24px", rem: "1.5rem", utility: "gap-6", desc: "표준 간격 — 섹션 내부 그리드" },
  { name: "gap-8", cssVar: "--space-8", px: "32px", rem: "2rem", utility: "gap-8", desc: "넓은 간격 — 랜딩·갤러리" },
];

const gridPresetTokens = [
  { name: "layout-sidenav", utility: "layout-sidenav", px: "stack / 16rem + 1fr", rem: "lg: menu + content", desc: "사이드메뉴 + layout-sidenav-content 콘텐츠", preset: "layout-sidenav" as const },
  { name: "grid-cols-sidebar", utility: "grid-cols-sidebar", px: "256px + 1fr", rem: "16rem + 1fr", desc: "사이드바 + 콘텐츠(단순 grid)", preset: "sidebar" as const },
  { name: "grid-cols-sidebar-wide", utility: "grid-cols-sidebar-wide", px: "320px + 1fr", rem: "20rem + 1fr", desc: "넓은 사이드바 + 콘텐츠", preset: "sidebar-wide" as const },
  { name: "grid-cols-form", utility: "grid-cols-form", px: "2 × 1fr", rem: "repeat(2, 1fr)", desc: "2열 폼 레이아웃", preset: "form" as const },
  { name: "grid-cols-cards", utility: "grid-cols-cards", px: "auto-fit ≥256px", rem: "minmax(16rem, 1fr)", desc: "반응형 카드 그리드", preset: "cards" as const },
];

const levelStyle: Record<ContrastLevel, { bg: string; color: string; label: string }> = {
  AAA:        { bg: "var(--ds-guide-level-aaa-bg)",  color: "var(--ds-guide-level-aaa-fg)",  label: "AAA" },
  AA:         { bg: "var(--ds-guide-level-aa-bg)",   color: "var(--ds-guide-level-aa-fg)",   label: "AA" },
  "AA Large": { bg: "var(--ds-guide-level-warn-bg)", color: "var(--ds-guide-level-warn-fg)", label: "AA Large" },
  Fail:       { bg: "var(--ds-guide-level-fail-bg)", color: "var(--ds-guide-level-fail-fg)", label: "Fail" },
};

function LevelBadge({ level }: { level: ContrastLevel }) {
  const s = levelStyle[level];
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "2px 10px", borderRadius: "999px",
      fontSize: pxToRem(11), fontWeight: "var(--font-weight-bold)", letterSpacing: "var(--font-tracking)",
    }}>
      {s.label}
    </span>
  );
}

function TokenValue({ px, rem }: { px: string; rem: string }) {
  return (
    <span className="flex flex-col leading-base font-mono">
      <span className="text-label-sm font-semibold numeric-tabular text-foreground">{px}</span>
      <span className="text-caption text-text-muted numeric-tabular">{rem}</span>
    </span>
  );
}

function MeasureBar({
  cssVar,
  label,
  height = pxToRem(12),
}: {
  cssVar: string;
  label: string;
  height?: string;
}) {
  return (
    <div className="h-9 bg-surface-subtle border border-border flex items-center px-3">
      <span
        role="img"
        aria-label={label}
        className="relative block bg-accent"
        style={{ width: `var(${cssVar})`, height, borderRadius: pxToRem(2) }}
      >
        <span aria-hidden="true" className="absolute left-0 top-1/2 h-5 -translate-y-1/2 border-l border-accent" />
        <span aria-hidden="true" className="absolute right-0 top-1/2 h-5 -translate-y-1/2 border-r border-accent" />
      </span>
    </div>
  );
}

function GridCell({ muted = false, tall = false }: { muted?: boolean; tall?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={muted ? "bg-accent/25 border border-accent" : "bg-accent"}
      style={{ height: tall ? pxToRem(48) : pxToRem(32), borderRadius: pxToRem(2) }}
    />
  );
}

function GridColumnPreview({ cols, utility, label }: { cols: number; utility: string; label: string }) {
  const cellHeight = cols >= 6 ? pxToRem(24) : pxToRem(32);
  return (
    <div
      role="img"
      aria-label={label}
      className={`grid gap-2 p-3 bg-surface-subtle border border-border ${utility}`}
    >
      {Array.from({ length: cols }, (_, i) => (
        <div key={i} className="bg-accent" style={{ height: cellHeight, borderRadius: pxToRem(2) }} aria-hidden="true" />
      ))}
    </div>
  );
}

function GridGapPreview({ utility, label }: { utility: string; label: string }) {
  return (
    <div className="border border-border overflow-hidden" style={{ borderRadius: pxToRem(2) }}>
      {/* padding 영역 — gap 토큰과 구분되도록 옅은색 + 점선 */}
      <div className="p-3 bg-accent/10 border border-dashed border-accent/35">
        <div
          role="img"
          aria-label={label}
          className={`grid grid-cols-4 ${utility} bg-accent`}
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="bg-background border border-border"
              style={{ height: pxToRem(32), borderRadius: pxToRem(2) }}
            />
          ))}
        </div>
      </div>
      <p className="m-0 py-1.5 px-3 text-caption text-text-muted bg-surface-subtle border-t border-border flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block w-2 h-2 bg-accent" style={{ borderRadius: pxToRem(2) }} />
          진한 초록 = gap
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block w-2 h-2 border border-dashed border-accent/35 bg-accent/10"
            style={{ borderRadius: pxToRem(2) }}
          />
          점선/옅은 = padding
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block w-2 h-2 bg-background border border-border" style={{ borderRadius: pxToRem(2) }} />
          밝은 블록 = grid item
        </span>
      </p>
    </div>
  );
}

function GridPresetPreview({ preset, label }: { preset: "layout-sidenav" | "sidebar" | "sidebar-wide" | "form" | "cards"; label: string }) {
  if (preset === "layout-sidenav") {
    return (
      <div role="img" aria-label={label} className={`${layoutSidenavClass} p-3 bg-surface-subtle border border-border`}>
        <div className={`${layoutSidenavMenuClass} bg-accent/25 border border-accent min-h-14 flex items-center px-2`}>
          <span className="text-caption font-semibold text-foreground">menu</span>
        </div>
        <div className={`${layoutSidenavContentClass} min-h-14`}>
          <div className="bg-accent h-full min-h-14 flex items-center justify-center text-caption font-semibold text-on-accent">
            layout-sidenav-content
          </div>
        </div>
      </div>
    );
  }
  if (preset === "sidebar" || preset === "sidebar-wide") {
    const utility = preset === "sidebar" ? "grid-cols-sidebar" : "grid-cols-sidebar-wide";
    return (
      <div role="img" aria-label={label} className={`grid gap-2 p-3 bg-surface-subtle border border-border ${utility}`}>
        <GridCell muted />
        <GridCell />
      </div>
    );
  }
  if (preset === "form") {
    return (
      <div role="img" aria-label={label} className="grid grid-cols-form gap-2 p-3 bg-surface-subtle border border-border">
        {Array.from({ length: 4 }, (_, i) => (
          <GridCell key={i} />
        ))}
      </div>
    );
  }
  return (
    <div role="img" aria-label={label} className="grid grid-cols-cards gap-4 p-3 bg-surface-subtle border border-border">
      {Array.from({ length: 4 }, (_, i) => (
        <GridCell key={i} tall />
      ))}
    </div>
  );
}

type SwatchInfo = { hex: string; label: string };

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [bgColor, setBgColor] = useState<SwatchInfo>({ hex: "#ffffff", label: "White" });
  const [textColor, setTextColor] = useState<SwatchInfo>({ hex: "#171717", label: "Neutral 900" });
  const [selecting, setSelecting] = useState<"bg" | "text" | null>(null);
  const [activeTab, setActiveTab] = useState<"color" | "layout" | "type">("color");
  const colorTabRef = useRef<HTMLButtonElement>(null);
  const layoutTabRef = useRef<HTMLButtonElement>(null);
  const typeTabRef = useRef<HTMLButtonElement>(null);

  // 탭 좌우/Home/End 키 이동 (WAI-ARIA tabs 패턴)
  function handleTabKeyDown(e: React.KeyboardEvent) {
    const order: ("color" | "layout" | "type")[] = ["color", "layout", "type"];
    const refs = { color: colorTabRef, layout: layoutTabRef, type: typeTabRef };
    let next: "color" | "layout" | "type" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(order.indexOf(activeTab) + 1) % order.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(order.indexOf(activeTab) - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) {
      e.preventDefault();
      setActiveTab(next);
      refs[next].current?.focus();
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 20px",
    border: "none",
    borderBottom: active ? "2px solid var(--ds-accent)" : "2px solid transparent",
    background: "none",
    color: active ? "var(--ds-foreground)" : "var(--ds-text-muted)",
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

    const frameId = requestAnimationFrame(() => {
      const cs = getComputedStyle(document.documentElement);
      const map: Record<string, string> = {};
      for (const fam of primitiveColors) {
        for (const sw of fam.swatches) {
          map[`${fam.name}-${sw.scale}`] =
            cs.getPropertyValue(`--color-${fam.name}-${sw.scale}`).trim() || sw.hex;
        }
      }
      setResolved(map);
    });

    return () => cancelAnimationFrame(frameId);
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
        className="absolute left-0 z-[100] px-4 py-2 font-semibold no-underline transition-[top] duration-100 bg-accent text-on-accent"
        style={{ top: "-40px" }}
        onFocus={(e) => { e.currentTarget.style.top = "0"; }}
        onBlur={(e) => { e.currentTarget.style.top = "-40px"; }}
      >
        본문 바로가기
      </a>

      <main
        id="main-content"
        className="min-h-screen p-10 transition-colors duration-300 font-sans bg-background text-foreground"
      >
        {/* Header */}
        <header className="mb-2">
          <h1 className="text-display-lg font-bold">Design Token Preview</h1>
        </header>

        <p className="mb-6 text-body-md text-neutral-400">
          Figma variables → CSS custom properties 적용 확인
        </p>

        {/* ── Tabs ── */}
        <div
          role="tablist"
          aria-label="디자인 토큰 카테고리"
          onKeyDown={handleTabKeyDown}
          className="flex gap-2 mb-10 border-b border-border"
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
            ref={layoutTabRef}
            type="button"
            role="tab"
            id="tab-layout"
            aria-selected={activeTab === "layout"}
            aria-controls="panel-layout"
            tabIndex={activeTab === "layout" ? 0 : -1}
            onClick={() => setActiveTab("layout")}
            style={tabStyle(activeTab === "layout")}
          >
            Layout
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

        {/* ===== 그룹: Raw Color ===== */}
        <h2 className="text-heading-lg font-bold mb-2">Raw Color</h2>
        <p className="text-body-sm text-text-muted mb-12">
          가공 전 원본 팔레트(raw)와 대비 검증 도구입니다.
        </p>

        {/* ── Color Palette ── */}
        <section aria-labelledby="section-color" className="mb-16">
          <h3 id="section-color" className="text-heading-md font-bold mb-2">Color Palette</h3>

          {/* 선택 모드 안내 */}
          {selecting && (
            <div
              role="status"
              aria-live="polite"
              className="mb-3 py-2.5 px-4 rounded-lg text-label-md font-semibold flex items-center justify-between"
              style={{
                background: selecting === "bg" ? "var(--ds-red-100)" : "var(--ds-green-100)",
                color: selecting === "bg" ? "var(--ds-red-600)" : "var(--ds-green-600)",
              }}
            >
              <span>
                {selecting === "bg" ? "배경색으로 사용할 컬러를 클릭하세요" : "텍스트색으로 사용할 컬러를 클릭하세요"}
              </span>
              <button
                type="button"
                onClick={() => setSelecting(null)}
                aria-label="색상 선택 취소"
                className="bg-transparent border-0 cursor-pointer font-bold text-body-md leading-none px-1"
              >
                ✕
              </button>
            </div>
          )}

          <div role="group" aria-label="색상 팔레트" className="flex flex-col gap-2">
            {/* 스케일 헤더 */}
            <div aria-hidden="true" className="grid gap-1 mb-1" style={{ gridTemplateColumns: "80px repeat(10, 1fr)" }}>
              <span className="text-caption text-neutral-400">Family</span>
              {scales.map((s) => (
                <span key={s} className="text-caption text-neutral-400 text-center">{s}</span>
              ))}
            </div>

            {primitiveColors.map(({ family, name, swatches }) => (
              <div key={family} className="grid gap-1 items-center" style={{ gridTemplateColumns: "80px repeat(10, 1fr)" }}>
                <span className="text-label-sm font-semibold">{family}</span>
                {swatches.map(({ scale, hex }) => {
                  const label = `${family} ${scale}`;
                  const cssVar = `var(--ds-${name}-${scale})`;
                  const currentHex = hexOf(name, scale, hex);
                  const isBg = bgColor.hex === currentHex;
                  const isText = textColor.hex === currentHex;
                  const isInteractive = !!selecting;
                  const labelText = isInteractive
                    ? `${label} (${currentHex}) — ${selecting === "bg" ? "배경색으로 선택" : "텍스트색으로 선택"}`
                    : `${label} — ${currentHex}`;
                  const swatchBorder = isBg
                    ? "3px solid var(--ds-accent)"
                    : isText
                    ? "3px solid var(--ds-accent-danger)"
                    : "1px solid var(--ds-border-overlay)";
                  const marker = (txt: string) => (
                    <span
                      aria-hidden="true"
                      className="absolute top-0.5 left-[3px] font-bold"
                      style={{ fontSize: pxToRem(11), color: contrastRatio(currentHex, "#000") > 4.5 ? "#000" : "#fff" }}
                    >
                      {txt}
                    </span>
                  );
                  return isInteractive ? (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => handleSwatchClick(currentHex, label)}
                      aria-label={labelText}
                      aria-pressed={isBg || isText}
                      className="h-10 rounded-md relative cursor-pointer p-0 transition-opacity duration-100"
                      style={{ backgroundColor: cssVar, border: swatchBorder, opacity: !isBg && !isText ? 0.75 : 1 }}
                    >
                      {isBg && marker("BG")}
                      {isText && marker("TXT")}
                    </button>
                  ) : (
                    <div
                      key={scale}
                      aria-label={`${label} — ${currentHex}`}
                      role="img"
                      className="h-10 rounded-md relative"
                      style={{ backgroundColor: cssVar, border: swatchBorder }}
                    >
                      {isBg && marker("BG")}
                      {isText && marker("TXT")}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* 스케일 팔레트와 구분 — 앵커는 스케일(50~900)과 무관 */}
            <div aria-hidden="true" className="mt-2 pt-2 border-t border-dashed border-border" />

            {/* Surface 앵커 — White / Black 각자 한 행(모드 무관 고정값, 스케일 없음) */}
            {surfaceAnchors.map(({ label, hex, cssVar }) => {
              const isBg = bgColor.hex === hex;
              const isText = textColor.hex === hex;
              const isInteractive = !!selecting;
              const markerColor = contrastRatio(hex, "#000") > 4.5 ? "#000" : "#fff";
              const swatchBorder = isBg
                ? "3px solid var(--ds-accent)"
                : isText
                ? "3px solid var(--ds-accent-danger)"
                : "1px solid var(--ds-border-overlay)";
              const marker = (txt: string) => (
                <span aria-hidden="true" className="absolute top-0.5 left-[3px] font-bold" style={{ fontSize: pxToRem(11), color: markerColor }}>{txt}</span>
              );
              return (
                <div key={label} className="grid gap-1 items-center" style={{ gridTemplateColumns: "80px repeat(10, 1fr)" }}>
                  <span className="text-label-sm font-semibold">{label}</span>
                  {/* 스케일 무관 표시용 dim 영역(칩 우측 컬럼 전체) — 배경만 dim, 텍스트는 가독 대비 유지 */}
                  <span
                    aria-hidden="true"
                    className="row-start-1 self-stretch rounded-md flex items-center pl-2.5 text-caption text-neutral-600 bg-border-overlay"
                    style={{ gridColumn: "3 / -1" }}
                  >
                    스케일 해당 없음 (단일 값)
                  </span>
                  {isInteractive ? (
                    <button
                      type="button"
                      onClick={() => handleSwatchClick(hex, label)}
                      aria-label={`${label} (${hex}) — ${selecting === "bg" ? "배경색으로 선택" : "텍스트색으로 선택"}`}
                      aria-pressed={isBg || isText}
                      className="col-start-2 h-10 rounded-md relative cursor-pointer p-0 transition-opacity duration-100"
                      style={{ backgroundColor: cssVar, border: swatchBorder, opacity: !isBg && !isText ? 0.75 : 1 }}
                    >
                      {isBg && marker("BG")}
                      {isText && marker("TXT")}
                    </button>
                  ) : (
                    <div
                      role="img"
                      aria-label={`${label} — ${hex}`}
                      className="col-start-2 h-10 rounded-md relative"
                      style={{ backgroundColor: cssVar, border: swatchBorder }}
                    >
                      {isBg && marker("BG")}
                      {isText && marker("TXT")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Contrast Checker ── */}
        <section aria-labelledby="section-contrast" className="mb-16">
          <h3 id="section-contrast" className="text-heading-md font-bold mb-6">
            Contrast Checker
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* BG 선택 */}
            <div>
              <p id="label-bg" className="text-label-sm text-neutral-500 mb-1.5">
                Background
              </p>
              <button
                type="button"
                onClick={() => setSelecting(selecting === "bg" ? null : "bg")}
                aria-labelledby="label-bg"
                aria-expanded={selecting === "bg"}
                aria-describedby="bg-color-value"
                className="w-full flex items-center gap-3 py-3 px-4 rounded-[10px] cursor-pointer bg-background"
                style={{ border: selecting === "bg" ? "2px solid var(--ds-accent)" : "2px solid var(--ds-neutral-200)" }}
              >
                <span
                  aria-hidden="true"
                  className="block w-8 h-8 rounded-md shrink-0 border border-border-overlay"
                  style={{ background: bgColor.hex }}
                />
                <span className="flex flex-col text-left">
                  <span className="text-label-md font-semibold">{bgColor.label}</span>
                  <span id="bg-color-value" className="text-caption text-neutral-400">{bgColor.hex}</span>
                </span>
                <span aria-hidden="true" className="ml-auto text-caption text-neutral-400">
                  {selecting === "bg" ? "클릭 취소" : "팔레트에서 선택 →"}
                </span>
              </button>
            </div>

            {/* Text 선택 */}
            <div>
              <p id="label-text" className="text-label-sm text-neutral-500 mb-1.5">
                Text
              </p>
              <button
                type="button"
                onClick={() => setSelecting(selecting === "text" ? null : "text")}
                aria-labelledby="label-text"
                aria-expanded={selecting === "text"}
                aria-describedby="text-color-value"
                className="w-full flex items-center gap-3 py-3 px-4 rounded-[10px] cursor-pointer bg-background"
                style={{ border: selecting === "text" ? "2px solid var(--ds-accent-danger)" : "2px solid var(--ds-neutral-200)" }}
              >
                <span
                  aria-hidden="true"
                  className="block w-8 h-8 rounded-md shrink-0 border border-border-overlay"
                  style={{ background: textColor.hex }}
                />
                <span className="flex flex-col text-left">
                  <span className="text-label-md font-semibold">{textColor.label}</span>
                  <span id="text-color-value" className="text-caption text-neutral-400">{textColor.hex}</span>
                </span>
                <span aria-hidden="true" className="ml-auto text-caption text-neutral-400">
                  {selecting === "text" ? "클릭 취소" : "팔레트에서 선택 →"}
                </span>
              </button>
            </div>
          </div>

          {/* 결과 */}
          <div className="rounded-2xl overflow-hidden border border-neutral-200">
            {/* 미리보기 — 텍스트 견본은 role="img"로, 인터랙티브 데모는 일반 마크업으로 분리 */}
            <div className="p-10 flex flex-col gap-5" style={{ background: bgColor.hex }}>
              <div className="flex flex-col gap-2">
                {/* 큰 텍스트 견본은 요소 자체에 role="img" — WAVE는 부모가 아닌 텍스트 요소를 직접 평가함 */}
                <span role="img" aria-label={`배경색 ${bgColor.label}, 텍스트색 ${textColor.label} 큰 텍스트 견본`} style={{ display: "block", color: textColor.hex, fontSize: pxToRem(32), fontWeight: "var(--font-weight-bold)", lineHeight: "var(--font-line)" }}>
                  큰 텍스트 — Large Text (Bold 18px+)
                </span>
                <p style={{ color: textColor.hex, fontSize: pxToRem(16), fontWeight: "var(--font-weight-regular)", margin: 0, lineHeight: "var(--font-line)" }}>
                  일반 텍스트 — Normal Text (16px). 가나다라마바사 ABC 123. 웹 접근성 대비 확인 미리보기입니다.
                </p>
                <p style={{ color: textColor.hex, fontSize: pxToRem(12), fontWeight: "var(--font-weight-regular)", margin: 0, lineHeight: "var(--font-line)" }}>
                  작은 텍스트 — Caption (12px). 이 크기에서는 대비율이 더 중요합니다.
                </p>
              </div>

              <div aria-hidden="true" style={{ borderTop: `1px solid ${textColor.hex}`, opacity: 0.15 }} />

              {/* 아이콘 미리보기 */}
              <div className="flex flex-col gap-3">
                <p style={{ color: textColor.hex, fontSize: pxToRem(12), fontWeight: "var(--font-weight-semibold)", margin: 0, opacity: 0.6, letterSpacing: "var(--font-tracking)", textTransform: "uppercase" }}>
                  Icon Preview (SC 1.4.11 — AA 3:1)
                </p>
                <div className="flex items-center gap-8 flex-wrap">
                  {/* 아이콘 단독 */}
                  <div className="flex flex-col items-center gap-2">
                    <div role="group" aria-label="아이콘 단독 예시" className="flex gap-3 items-center">
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
                    <span aria-hidden="true" style={{ color: textColor.hex, fontSize: pxToRem(11), opacity: 0.6 }}>아이콘 단독</span>
                  </div>

                  {/* 아이콘 + 텍스트 (면제 케이스) */}
                  <div className="flex flex-col items-start gap-2">
                    <nav aria-label="아이콘과 텍스트 조합 예시">
                      <ul className="list-none m-0 p-0 flex flex-col gap-2">
                        <li>
                          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2 no-underline" style={{ color: textColor.hex }}>
                            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                            <span style={{ fontSize: pxToRem(14), fontWeight: "var(--font-weight-medium)" }}>홈</span>
                          </a>
                        </li>
                        <li>
                          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2 no-underline" style={{ color: textColor.hex }}>
                            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textColor.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <span style={{ fontSize: pxToRem(14), fontWeight: "var(--font-weight-medium)" }}>검색</span>
                          </a>
                        </li>
                      </ul>
                    </nav>
                    <span aria-hidden="true" style={{ color: textColor.hex, fontSize: pxToRem(11), opacity: 0.6 }}>아이콘 + 텍스트 (대비 요건 면제)</span>
                  </div>

                  {/* 버튼 UI 컴포넌트 */}
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        style={{
                          display: "flex", alignItems: "center", gap: "6px",
                          padding: "8px 16px", borderRadius: "8px",
                          border: `2px solid ${textColor.hex}`,
                          background: "transparent", color: textColor.hex,
                          fontSize: pxToRem(14), fontWeight: "var(--font-weight-medium)", cursor: "pointer",
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
                    <span aria-hidden="true" style={{ color: textColor.hex, fontSize: pxToRem(11), opacity: 0.6 }}>UI 컴포넌트 (버튼 테두리 3:1)</span>
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
              className="bg-background p-6 grid items-start border-t border-neutral-200"
              style={{ gridTemplateColumns: "auto 1fr 1fr 1fr 1fr" }}
            >
              <div className="pr-8 border-r border-neutral-200">
                <p className="text-caption text-neutral-400 mb-1">대비율</p>
                <output className="block">
                  {/* 숫자는 role="img" 그래픽으로 명시 — 제목 오인(Possible heading) 방지 */}
                  <span role="img" aria-label={`대비율 ${ratio} 대 1`} className="block font-bold leading-none numeric-tabular" style={{ fontSize: pxToRem(40) }}>
                    {ratio}<span aria-hidden="true" className="font-normal" style={{ fontSize: pxToRem(16) }}>:1</span>
                  </span>
                </output>
                <LevelBadge level={level} />
              </div>

              <div className="pl-6 pr-6 border-r border-neutral-200">
                <p className="text-caption text-neutral-400 mb-2 font-semibold">일반 텍스트</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-caption text-neutral-500 w-8">AA</span>
                    <span className="text-caption text-neutral-400 numeric-tabular">4.5:1</span>
                    <span role="img" aria-label={ratio >= 4.5 ? "통과" : "실패"}>{ratio >= 4.5 ? "✅" : "❌"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-caption text-neutral-500 w-8">AAA</span>
                    <span className="text-caption text-neutral-400 numeric-tabular">7:1</span>
                    <span role="img" aria-label={ratio >= 7 ? "통과" : "실패"}>{ratio >= 7 ? "✅" : "❌"}</span>
                  </div>
                </div>
              </div>

              <div className="pl-6 pr-6 border-r border-neutral-200">
                <p className="text-caption text-neutral-400 mb-2 font-semibold">
                  큰 텍스트 <span className="font-normal">(18px+ / bold 14px+)</span>
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-caption text-neutral-500 w-8">AA</span>
                    <span className="text-caption text-neutral-400 numeric-tabular">3:1</span>
                    <span role="img" aria-label={ratio >= 3 ? "통과" : "실패"}>{ratio >= 3 ? "✅" : "❌"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-caption text-neutral-500 w-8">AAA</span>
                    <span className="text-caption text-neutral-400 numeric-tabular">4.5:1</span>
                    <span role="img" aria-label={ratio >= 4.5 ? "통과" : "실패"}>{ratio >= 4.5 ? "✅" : "❌"}</span>
                  </div>
                </div>
              </div>

              <div className="pl-6 pr-6 border-r border-neutral-200">
                <p className="text-caption text-neutral-400 mb-2 font-semibold">아이콘 / 그래픽</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-caption text-neutral-500 w-8">AA</span>
                    <span className="text-caption text-neutral-400 numeric-tabular">3:1</span>
                    <span role="img" aria-label={ratio >= 3 ? "통과" : "실패"}>{ratio >= 3 ? "✅" : "❌"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-caption text-neutral-500 w-8">AAA</span>
                    <span className="text-caption text-neutral-400">—</span>
                    <span className="text-caption text-neutral-500">기준 없음</span>
                  </div>
                </div>
              </div>

              <div className="pl-6">
                <p className="text-caption text-neutral-400 mb-2 font-semibold">UI 컴포넌트</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-caption text-neutral-500 w-8">AA</span>
                    <span className="text-caption text-neutral-400 numeric-tabular">3:1</span>
                    <span role="img" aria-label={ratio >= 3 ? "통과" : "실패"}>{ratio >= 3 ? "✅" : "❌"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-caption text-neutral-500 w-8">AAA</span>
                    <span className="text-caption text-neutral-400">—</span>
                    <span className="text-caption text-neutral-500">기준 없음</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 전체 팔레트 대비 매트릭스 */}
          <div className="mt-8">
            <h4 className="text-heading-sm font-bold mb-4">
              현재 배경색 기준 — 전체 팔레트 대비율
            </h4>
            <div role="group" aria-label="전체 팔레트 대비율 매트릭스" className="flex flex-col gap-1.5">
              <div aria-hidden="true" className="grid gap-1" style={{ gridTemplateColumns: "80px repeat(10, 1fr)" }}>
                <span className="text-caption text-neutral-400" />
                {scales.map((s) => (
                  <span key={s} className="text-caption text-neutral-400 text-center">{s}</span>
                ))}
              </div>
              {primitiveColors.map(({ family, name, swatches }) => (
                <div key={family} className="grid gap-1 items-center" style={{ gridTemplateColumns: "80px repeat(10, 1fr)" }}>
                  <span className="text-label-sm font-semibold">{family}</span>
                  {swatches.map(({ scale, hex }) => {
                    const r = contrastRatio(bgColor.hex, hexOf(name, scale, hex));
                    const lv = getContrastLevel(r);
                    const s = levelStyle[lv];
                    return (
                      <div
                        key={scale}
                        role="img"
                        aria-label={`${family} ${scale}: 대비율 ${r}:1 — ${lv}`}
                        className="h-10 rounded-md flex flex-col items-center justify-center gap-px"
                        style={{ background: s.bg }}
                      >
                        <span aria-hidden="true" className="font-bold" style={{ fontSize: pxToRem(11), color: s.color }}>{lv}</span>
                        <span aria-hidden="true" className="numeric-tabular" style={{ fontSize: pxToRem(11), color: s.color }}>{r}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div role="list" aria-label="대비율 등급 범례" className="flex gap-3 mt-3 flex-wrap">
              {(Object.entries(levelStyle) as [ContrastLevel, typeof levelStyle[ContrastLevel]][]).map(([lv, s]) => (
                <div key={lv} role="listitem" className="flex items-center gap-1.5">
                  <div aria-hidden="true" className="w-3 h-3 rounded-[3px]" style={{ background: s.bg }} />
                  <span className="text-caption text-neutral-500">
                    {lv === "AAA" ? "AAA 7:1+" : lv === "AA" ? "AA 4.5:1+" : lv === "AA Large" ? "AA Large 3:1+" : "Fail"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 그룹: Semantic Color ===== */}
        <h2 className="text-heading-lg font-bold mb-2 mt-16 pt-16 border-t border-border">Semantic Color</h2>
        <p className="text-body-sm text-text-muted mb-12">
          raw를 용도·모드(라이트/다크)에 맞게 매핑한 의미 기반 토큰입니다.
        </p>

        {/* ── Overlay (반투명, 모드 인지) ── */}
        <section aria-labelledby="section-alpha" className="mb-16">
          <h3 id="section-alpha" className="text-heading-md font-bold mb-2">Overlay</h3>
          <p className="text-body-sm text-text-muted mb-6">
            오버레이용 반투명 시맨틱 토큰. 라이트=검정α / 다크=흰색α로 모드에 따라 자동 전환됩니다. 체크무늬 위에서 투명도를 확인하세요.
          </p>
          <div role="list" className="flex flex-col gap-2">
            {/* 헤더 */}
            <div aria-hidden="true" className="grid gap-4 items-center pb-1" style={{ gridTemplateColumns: "160px 1fr 200px" }}>
              <span className="text-caption text-text-muted">Token</span>
              <span className="text-caption text-text-muted">Transparency</span>
              <span className="text-caption text-text-muted">Value ({isDark ? "Dark" : "Light"})</span>
            </div>
            {overlayTokens.map(({ label, cssVar, light, dark }) => (
              <div role="listitem" key={label} className="grid gap-4 items-center" style={{ gridTemplateColumns: "160px 1fr 200px" }}>
                <span className="text-label-sm font-semibold">{label}</span>
                {/* 체크무늬 위에 알파 색을 올려 투명도를 가시화. 다크모드(흰색α)는 어두운 체커 */}
                <div
                  role="img"
                  aria-label={`${label} — 체크무늬 위 반투명 견본`}
                  className="h-10 rounded-md overflow-hidden border border-border"
                  style={isDark ? checkerDark : checkerLight}
                >
                  <div className="w-full h-full" style={{ background: `var(${cssVar})` }} />
                </div>
                <span className="text-caption text-text-muted font-mono">{isDark ? dark : light}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Gradient (시맨틱 그라데이션) ── */}
        <section aria-labelledby="section-gradient" className="mb-16">
          <h3 id="section-gradient" className="text-heading-md font-bold mb-2">Gradient</h3>
          <p className="text-body-sm text-text-muted mb-6">
            용도 기반 그라데이션 토큰입니다. `--ds-gradient-*` 원본이 `--background-image-gradient-*`로 노출되며, 시맨틱 색을 참조해 라이트/다크에 자동 대응합니다.
          </p>
          <div role="list" className="flex flex-col gap-2">
            <div aria-hidden="true" className="grid gap-4 items-center pb-1" style={{ gridTemplateColumns: "180px 1fr 1fr" }}>
              <span className="text-caption text-text-muted">Token</span>
              <span className="text-caption text-text-muted">Preview</span>
              <span className="text-caption text-text-muted">Utility / Description</span>
            </div>
            {gradientTokens.map(({ label, utility, desc }) => {
              const isFade = label.includes("fade");
              const underlayStyle = label.includes("overlay") ? checkerLight : { background: "var(--ds-green-100)" };
              return (
              <div role="listitem" key={label} className="grid gap-4 items-center" style={{ gridTemplateColumns: "180px 1fr 1fr" }}>
                <span className="text-label-sm font-semibold">{label}</span>
                {isFade ? (
                  <div className="h-10 rounded-md border border-border overflow-hidden" style={underlayStyle}>
                    <div
                      role="img"
                      aria-label={`${label} — ${desc}`}
                      className={`h-full ${utility}`}
                    />
                  </div>
                ) : (
                  <div
                    role="img"
                    aria-label={`${label} — ${desc}`}
                    className={`h-10 rounded-md border border-border overflow-hidden ${utility}`}
                  />
                )}
                <div>
                  <p className="m-0 text-caption text-text-muted font-mono">{utility}</p>
                  <p className="mt-0.5 mb-0 text-caption text-text-muted">{desc}</p>
                </div>
              </div>
              );
            })}
          </div>
        </section>

        </div>{/* /panel-color */}

        {/* ── Tab Panel 2: Layout ── */}
        <div role="tabpanel" id="panel-layout" aria-labelledby="tab-layout" hidden={activeTab !== "layout"}>
          <h2 className="text-heading-lg font-bold mb-2">Layout & Size</h2>
          <p className="text-body-sm text-text-muted mb-12">
            여백, 그리드, 모서리, 반복 크기, 콘텐츠 폭 토큰입니다. 모든 값은 rem 기반이며 `@theme`를 통해 Tailwind 유틸리티로 노출됩니다.
          </p>

          <section aria-labelledby="section-spacing" className="mb-16">
            <h3 id="section-spacing" className="text-heading-md font-bold mb-2">Spacing</h3>
            <p className="text-body-sm text-text-muted mb-6">
              margin, padding, gap의 기준 스케일입니다. `--space-*` 원본 토큰이 `--spacing-*`로 노출됩니다.
            </p>
            <div role="list" className="flex flex-col gap-2">
              <div
                aria-hidden="true"
                className="grid gap-4 items-center pb-1"
                style={{ gridTemplateColumns: `${pxToRem(140)} 1fr ${pxToRem(120)} ${pxToRem(160)}` }}
              >
                <span className="text-caption text-text-muted">Token</span>
                <span className="text-caption text-text-muted">Preview</span>
                <span className="text-caption text-text-muted">Size</span>
                <span className="text-caption text-text-muted">Utility</span>
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
                  <span className="text-caption text-text-muted font-mono">{utility}</span>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="section-radius" className="mb-16">
            <h3 id="section-radius" className="text-heading-md font-bold mb-2">Radius</h3>
            <p className="text-body-sm text-text-muted mb-6">
              원본은 `--shape-radius-*`, 유틸리티 노출은 `--radius-*`로 분리해 이름 충돌을 피합니다.
            </p>
            <div role="list" className="grid grid-cols-2 gap-4">
              {radiusTokens.map(({ name, px, rem, utility }) => (
                <div key={name} role="listitem" className="flex items-center gap-4 p-4 rounded-xl border border-border">
                  <div
                    role="img"
                    aria-label={`${name} ${px}, ${rem} 모서리 견본`}
                    className={`w-24 h-14 bg-accent border border-border-overlay ${utility}`}
                  />
                  <div>
                    <p className="m-0 text-label-sm font-semibold">{name}</p>
                    <p className="m-0 text-caption text-text-muted font-mono">
                      <span className="font-semibold text-foreground">{px}</span>
                      <span> · {rem} · {utility}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="section-fixed-size" className="mb-16">
            <h3 id="section-fixed-size" className="text-heading-md font-bold mb-2">Fixed Size</h3>
            <p className="text-body-sm text-text-muted mb-6">
              아이콘과 컨트롤처럼 반복되는 고정 크기입니다. `--size-*`를 spacing namespace에 연결해 `size-*`, `h-*` 계열로 사용할 수 있습니다.
            </p>
            <div className="flex flex-col gap-10">
              <div>
                <h4 className="text-label-xl font-semibold mb-1">Icon Size</h4>
                <p className="text-caption text-text-muted mb-4">
                  아이콘 자체의 정사각 영역입니다. `icon-md` 24px를 일반 UI 기본값으로 사용합니다.
                </p>
                <div role="list" className="grid grid-cols-2 gap-4">
                  {iconSizeTokens.map(({ name, cssVar, px, rem, utility }) => (
                    <div key={name} role="listitem" className="p-4 rounded-xl border border-border">
                      <p className="m-0 text-label-sm font-semibold">{name}</p>
                      <p className="mt-0.5 mb-4 text-caption text-text-muted font-mono">
                        <span className="font-semibold text-foreground">{px}</span>
                        <span> · {rem} · {utility}</span>
                      </p>
                      <div className="flex flex-col gap-2">
                        <MeasureBar cssVar={cssVar} label={`${name} ${px}, ${rem} 아이콘 길이 견본`} height={pxToRem(10)} />
                        <div className="flex items-center gap-3">
                          <span aria-hidden="true" className="text-caption text-text-muted" style={{ width: pxToRem(56) }}>
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
                <h4 className="text-label-xl font-semibold mb-1">Control Height</h4>
                <p className="text-caption text-text-muted mb-4">
                  버튼·입력창처럼 인터랙티브 요소의 높이 기준입니다. 폭은 콘텐츠와 padding 조합으로 결정합니다.
                </p>
                <div role="list" className="grid grid-cols-2 gap-4">
                  {controlSizeTokens.map(({ name, cssVar, px, rem, utility }) => (
                    <div key={name} role="listitem" className="p-4 rounded-xl border border-border">
                      <p className="m-0 text-label-sm font-semibold">{name}</p>
                      <p className="mt-0.5 mb-4 text-caption text-text-muted font-mono">
                        <span className="font-semibold text-foreground">{px}</span>
                        <span> · {rem} · {utility}</span>
                      </p>
                      <div className="flex flex-col gap-2">
                        <MeasureBar cssVar={cssVar} label={`${name} ${px}, ${rem} 컨트롤 높이 견본`} height={pxToRem(10)} />
                        <div className="flex items-center gap-3">
                          <span aria-hidden="true" className="text-caption text-text-muted" style={{ width: pxToRem(56) }}>
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

          <section aria-labelledby="section-grid" className="mb-16">
            <h3 id="section-grid" className="text-heading-md font-bold mb-2">Grid</h3>
            <p className="text-body-sm text-text-muted mb-6">
              열 수·간격·레이아웃 프리셋을 `--layout-grid-*`와 Tailwind `grid-*` 유틸리티로 관리합니다. gap은 spacing 토큰(`gap-4` 등)과 함께 사용합니다.
            </p>

            <div className="flex flex-col gap-10">
              <div>
                <h4 className="text-label-xl font-semibold mb-1">Columns</h4>
                <p className="text-caption text-text-muted mb-4">
                  Tailwind 기본 `grid-cols-*` 열 분할. 12열 그리드는 `col-span-*`와 조합해 페이지 레이아웃을 구성합니다.
                </p>
                <div role="list" className="grid grid-cols-2 gap-4">
                  {gridColumnTokens.map(({ name, cols, utility, desc }) => (
                    <div key={name} role="listitem" className="p-4 rounded-xl border border-border">
                      <p className="m-0 text-label-sm font-semibold">{name}</p>
                      <p className="mt-0.5 mb-3 text-caption text-text-muted">{desc}</p>
                      <GridColumnPreview cols={cols} utility={utility} label={`${name} ${cols}열 그리드 견본`} />
                      <p className="mt-2 mb-0 text-caption text-text-muted font-mono">{utility}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-label-xl font-semibold mb-1">Gap</h4>
                <p className="text-caption text-text-muted mb-4">
                  그리드 간격(gap)은 item 사이 margin 역할입니다. 진한 초록은 gap, 점선/옅은 영역은 미리보기용 padding입니다.
                </p>
                <div role="list" className="flex flex-col gap-4">
                  {gridGapTokens.map(({ name, utility, px, rem, desc }) => (
                    <div key={name} role="listitem" className="p-4 rounded-xl border border-border">
                      <div className="flex items-baseline justify-between gap-4 mb-3">
                        <span className="text-label-sm font-semibold">{name}</span>
                        <span className="text-caption text-text-muted font-mono">
                          <span className="font-semibold text-foreground">{px}</span>
                          <span> · {rem} · {utility}</span>
                        </span>
                      </div>
                      <GridGapPreview
                        utility={utility}
                        label={`${name} ${px}, ${rem} — 초록 gap 영역과 grid item 견본`}
                      />
                      <p className="mt-2 mb-0 text-caption text-text-muted">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-label-xl font-semibold mb-1">Layout Presets</h4>
                <p className="text-caption text-text-muted mb-4">
                  반복 레이아웃은 `--layout-grid-*` 원본 → `--grid-template-columns-*` 노출 → `grid-cols-*` 유틸리티로 사용합니다.
                </p>
                <div role="list" className="grid grid-cols-2 gap-4">
                  {gridPresetTokens.map(({ name, utility, px, rem, desc, preset }) => (
                    <div key={name} role="listitem" className="p-4 rounded-xl border border-border">
                      <p className="m-0 text-label-sm font-semibold">{name}</p>
                      <p className="mt-0.5 mb-3 text-caption text-text-muted font-mono">
                        <span className="font-semibold text-foreground">{px}</span>
                        <span> · {rem}</span>
                      </p>
                      <GridPresetPreview preset={preset} label={`${name} — ${desc}`} />
                      <p className="mt-2 mb-0 text-caption text-text-muted">{utility} · {desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h4 className="text-label-xl font-semibold m-0">Breakpoints</h4>
                  <a
                    href="/guide/responsive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 py-1 px-3 rounded-md border border-border text-label-sm font-semibold text-accent no-underline bg-background hover:bg-surface-subtle"
                  >
                    반응형 가이드
                    <span aria-hidden="true">↗</span>
                    <span className="sr-only">(새 창에서 열림)</span>
                  </a>
                </div>
                <p className="text-caption text-text-muted mb-4">
                  반응형 그리드는 breakpoint 토큰과 prefix를 조합합니다. 예: 태블릿 이상 3열은 `md:` prefix + `grid-cols-3`.
                </p>
                <div role="list" className="flex flex-col gap-2">
                  <div
                    aria-hidden="true"
                    className="grid gap-4 items-center pb-1"
                    style={{ gridTemplateColumns: `${pxToRem(80)} 1fr ${pxToRem(120)} ${pxToRem(100)}` }}
                  >
                    <span className="text-caption text-text-muted">Token</span>
                    <span className="text-caption text-text-muted">Description</span>
                    <span className="text-caption text-text-muted">Size</span>
                    <span className="text-caption text-text-muted">Prefix</span>
                  </div>
                  {breakpointTokens.map(({ name, px, rem, prefix, desc }) => (
                    <div
                      role="listitem"
                      key={name}
                      className="grid gap-4 items-center py-2 border-b border-border"
                      style={{ gridTemplateColumns: `${pxToRem(80)} 1fr ${pxToRem(120)} ${pxToRem(100)}` }}
                    >
                      <span className="text-label-sm font-semibold">{name}</span>
                      <span className="text-caption text-text-muted">{desc}</span>
                      <TokenValue px={px} rem={rem} />
                      <span className="text-caption text-text-muted font-mono">{prefix}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="section-container">
            <h3 id="section-container" className="text-heading-md font-bold mb-2">Container</h3>
            <p className="text-body-sm text-text-muted mb-6">
              콘텐츠 최대 폭 토큰입니다. 원본은 `--layout-container-*`, Tailwind 노출은 `--container-*`로 분리합니다.
              페이지 전체 레이아웃(container + 반응형 grid)은 <code className="font-mono text-caption">layout-page</code> 한 클래스로 적용합니다.
            </p>
            <div role="list" className="flex flex-col gap-4">
              {containerTokens.map(({ name, cssVar, px, rem, utility }) => (
                <div key={name} role="listitem">
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <span className="text-label-sm font-semibold">{name}</span>
                    <span className="text-caption text-text-muted font-mono">
                      <span className="font-semibold text-foreground">{px}</span>
                      <span> · {rem} · {utility}</span>
                    </span>
                  </div>
                  <div className="w-full rounded-lg bg-surface-subtle border border-border p-2">
                    <div
                      role="img"
                      aria-label={`${name} ${px}, ${rem} 콘텐츠 폭 견본`}
                      className="relative h-5 bg-accent"
                      style={{ width: `min(var(${cssVar}), 100%)`, borderRadius: pxToRem(2) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>{/* /panel-layout */}

        {/* ── Tab Panel 3: Typography ── */}
        <div role="tabpanel" id="panel-type" aria-labelledby="tab-type" hidden={activeTab !== "type"}>

        {/* ── Font Family ── */}
        <section aria-labelledby="section-font" className="mb-0">
          <h2 id="section-font" className="text-heading-lg font-bold mb-2">Font Family</h2>

          <div className="rounded-2xl border border-neutral-200 overflow-hidden">
            {/* 글꼴 견본 — 큰 텍스트 요소 자체에 role="img" (정보는 아래 dl에서 제공) */}
            <div className="py-12 px-10 bg-neutral-50 border-b border-neutral-200 flex flex-col gap-1">
              <span role="img" aria-label="Pretendard GOV 글꼴 견본" className="block font-bold leading-base" style={{ fontSize: pxToRem(48), fontFamily: "var(--font-family-base)" }}>Pretendard GOV</span>
              <span role="img" aria-label="한글 견본" className="block font-normal leading-base" style={{ fontSize: pxToRem(24), fontFamily: "var(--font-family-base)" }}>
                가나다라마바사아자차카타파하 — ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </span>
              <span role="img" aria-label="영문·숫자·특수문자 견본" className="block font-normal leading-base text-neutral-500" style={{ fontSize: pxToRem(18), fontFamily: "var(--font-family-base)" }}>
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
                  { label: "CSS 변수", value: "--font-family-base" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-caption text-neutral-400 font-semibold tracking-normal uppercase">{label}</dt>
                    <dd className="text-body-sm mt-0.5 ml-0">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-caption text-neutral-400 font-semibold tracking-normal uppercase mb-0.5">공식 GitHub</p>
                  <a href="https://github.com/orioncactus/pretendard" target="_blank" rel="noopener noreferrer" className="text-body-sm text-green-500 break-all">
                    github.com/orioncactus/pretendard
                    <span className="sr-only">(새 창에서 열림)</span>
                  </a>
                </div>
                <div>
                  <p className="text-caption text-neutral-400 font-semibold tracking-normal uppercase mb-0.5">원본 다운로드</p>
                  <a href="https://github.com/orioncactus/pretendard/releases/tag/v1.3.9" target="_blank" rel="noopener noreferrer" className="text-body-sm text-green-500 break-all">
                    github.com/orioncactus/pretendard/releases/tag/v1.3.9
                    <span className="sr-only">(새 창에서 열림)</span>
                  </a>
                  <p className="mt-1 text-caption text-neutral-400">Assets → pretendard-gov.zip 다운로드</p>
                </div>
                <div>
                  <p className="text-caption text-neutral-400 font-semibold tracking-normal uppercase mb-1">이 프로젝트 적용 방식</p>
                  <p className="mb-2 text-caption text-neutral-400">자체 호스팅 — next/font/local (런타임 외부 요청 0). variable woff2를 src/app/fonts에 보관.</p>
                  <pre className="m-0 py-3 px-4 rounded-lg bg-neutral-100 text-caption text-neutral-700 border border-neutral-200 break-all whitespace-pre-wrap">
                    <code>{`localFont({ src: "./fonts/PretendardGOVVariable.woff2", weight: "100 900", variable: "--font-pretendard-gov" })`}</code>
                  </pre>
                </div>
                <div>
                  <p className="text-caption text-neutral-400 font-semibold tracking-normal uppercase mb-1">GOV 버전 특징</p>
                  <ul className="m-0 pl-4 flex flex-col gap-1">
                    {["공공기관·정부 웹사이트 최적화", "한국 웹 접근성 지침(KWCAG) 대응", "완성형 한글 11,172자 전체 지원", "다양한 weight 지원 (100–900)"].map((item) => (
                      <li key={item} className="text-caption text-neutral-600">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="py-6 px-10 border-t border-neutral-200 flex flex-col gap-3">
              <p className="text-caption text-neutral-400 font-semibold tracking-normal uppercase m-0">Weight</p>
              <div className="grid grid-cols-5 gap-4">
                {[{ weight: 100, label: "Thin" }, { weight: 300, label: "Light" }, { weight: 400, label: "Regular" }, { weight: 600, label: "SemiBold" }, { weight: 700, label: "Bold" }].map(({ weight, label }) => (
                  <div key={weight} className="flex flex-col gap-0.5">
                    {/* 견본 글자는 그래픽으로 표시 — 정보는 아래 레이블이 전달 */}
                    <span role="img" aria-label={`${weight} ${label} 견본`} className="leading-base" style={{ fontSize: pxToRem(24), fontWeight: weight, fontFamily: "var(--font-family-base)" }}>가나다 Aa</span>
                    <span className="text-caption text-neutral-400">{weight} · {label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Font Stack — 폴백 체인 큐레이션 */}
            <div className="py-6 px-10 border-t border-neutral-200 flex flex-col gap-4">
              <div>
                <p className="text-caption text-neutral-400 font-semibold tracking-normal uppercase m-0">Font Stack (폴백 체인)</p>
                <p className="mt-1 text-caption text-text-muted">
                  Pretendard·Noto는 자체 호스팅(런타임 외부 요청 0). Pretendard 미로드 시 Noto Sans KR로, 그것도 불가하면 시스템 sans-serif로 자동 대체됩니다.
                </p>
              </div>
              <ol className="list-none m-0 p-0 flex flex-col gap-2">
                {fontStack.map(({ order, name, family, role, source, desc }) => (
                  <li key={order} className="grid gap-4 items-center py-3 px-4 rounded-lg border border-border" style={{ gridTemplateColumns: "28px 1fr auto" }}>
                    <span aria-hidden="true" className="w-6 h-6 rounded-full bg-accent text-on-accent flex items-center justify-center text-caption font-bold">{order}</span>
                    <div>
                      <span role="img" aria-label={`${name} 글꼴 견본`} className="block font-semibold leading-base" style={{ fontFamily: family, fontSize: pxToRem(20) }}>{name} · {typographySample}</span>
                      <p className="mt-0.5 text-caption text-text-muted">{desc}</p>
                    </div>
                    <span className="text-caption text-text-muted text-right leading-base">
                      {role}<br />{source}
                    </span>
                  </li>
                ))}
              </ol>
              <pre className="m-0 py-3 px-4 rounded-lg bg-neutral-100 text-caption text-neutral-700 border border-neutral-200 break-all whitespace-pre-wrap">
                <code>{`font-family: "Pretendard GOV", "Noto Sans KR", sans-serif;`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* ── Typography ── */}
        <section aria-labelledby="section-typography" className="mt-16 pt-16 border-t border-border">
          <h2 id="section-typography" className="text-heading-lg font-bold mb-8">Typography</h2>
          <dl className="flex flex-col gap-4 m-0">
            {typographyTokens.map(({ label, var: cssVar, weight, typoClass }) => (
              <div key={cssVar} className="flex items-baseline gap-4 border-b border-neutral-200 pb-3">
                <dt className="w-[120px] shrink-0">
                  <span className="block text-label-sm font-semibold">{label}</span>
                  {/* size / weight / shorthand 토큰 메타 (line-height는 전역 --font-line: 1.5) */}
                  <span className="block text-text-muted" style={{ fontSize: pxToRem(11) }}>
                    {cssVar.replace("--font-size-", "")} · {weight.replace("--font-weight-", "w/")} · {typoClass}
                  </span>
                </dt>
                {/* 견본은 dd 안의 span role="img"로 표시 (토큰명은 dt가 전달) */}
                <dd className={`${typoClass} m-0`}>
                  <span role="img" aria-label={`${label} 글꼴 견본`}>{typographySample}</span>
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
          className="fixed bottom-6 right-6 z-50 py-2.5 px-5 rounded-full border border-border cursor-pointer text-label-md font-semibold text-foreground shadow-[0_4px_16px_var(--ds-shadow)]"
          style={{ background: isDark ? "var(--ds-neutral-800)" : "var(--ds-neutral-100)" }}
        >
          <span aria-hidden="true">{isDark ? "🌙" : "☀️"}</span>
          <span className="ml-1.5">{isDark ? "Dark" : "Light"}</span>
        </button>
      </main>
    </>
  );
}
