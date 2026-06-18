"use client";

import { useState, useEffect, useRef, createContext, useContext, useCallback, useId } from "react";
import { contrastRatio, getContrastLevel, type ContrastLevel } from "@/lib/contrast";
import {
  guideHeaderPaddingClass,
  layoutPageColSpanFull,
  layoutSidenavContentClass,
  layoutSidenavMenuClass,
} from "@/lib/layout-tokens";
import { fontSizePx, pxToRem } from "@/lib/tokens";
import { primitiveColors } from "@/lib/raw-color-palettes";

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

type SemanticColorReadMode = "text" | "bg" | "border" | "outline";

type SemanticColorTokenDef = {
  token: string;
  utility: string;
  cssVar: string;
  readAs: SemanticColorReadMode;
};

type SemanticColorGroupDef = {
  id: string;
  label: string;
  tokens: SemanticColorTokenDef[];
};

type SemanticColorCategoryDef = {
  id: string;
  title: string;
  description: React.ReactNode;
  groups: SemanticColorGroupDef[];
};

const semanticColorCatalog: SemanticColorCategoryDef[] = [
  {
    id: "semantic-text",
    title: "Text",
    description: <>기본 본문, 캡션, 버튼 등 UI 전반의 텍스트에 사용되는 색상입니다.</>,
    groups: [
      {
        id: "primary",
        label: "primary",
        tokens: [
          { token: "foreground", utility: "text-foreground", cssVar: "--color-foreground", readAs: "text" },
        ],
      },
      {
        id: "muted",
        label: "muted",
        tokens: [
          { token: "muted", utility: "text-muted", cssVar: "--color-muted", readAs: "text" },
        ],
      },
      {
        id: "accent",
        label: "accent",
        tokens: [
          { token: "accent", utility: "text-accent", cssVar: "--color-accent", readAs: "text" },
          { token: "on-accent", utility: "text-on-accent", cssVar: "--color-on-accent", readAs: "text" },
        ],
      },
      {
        id: "danger",
        label: "danger",
        tokens: [
          { token: "accent-danger", utility: "text-accent-danger", cssVar: "--color-accent-danger", readAs: "text" },
        ],
      },
    ],
  },
  {
    id: "semantic-surface",
    title: "Surface",
    description: (
      <>
        페이지·카드·패널 등 <strong>배경 표면</strong>에 사용합니다. <strong>bg-*</strong> 유틸리티로 적용합니다.
      </>
    ),
    groups: [
      {
        id: "base",
        label: "base",
        tokens: [
          { token: "background", utility: "bg-background", cssVar: "--color-background", readAs: "bg" },
        ],
      },
      {
        id: "subtle",
        label: "subtle",
        tokens: [
          { token: "surface-subtle", utility: "bg-surface-subtle", cssVar: "--color-surface-subtle", readAs: "bg" },
        ],
      },
    ],
  },
  {
    id: "semantic-border",
    title: "Border",
    description: (
      <>
        구분선·칩 테두리 등 <strong>경계선(border)</strong>에 사용합니다. <strong>border-*</strong> 유틸리티로 적용합니다.
      </>
    ),
    groups: [
      {
        id: "default",
        label: "default",
        tokens: [
          { token: "line", utility: "border-line", cssVar: "--color-line", readAs: "border" },
        ],
      },
      {
        id: "strong",
        label: "strong",
        tokens: [
          { token: "line-strong", utility: "border-line-strong", cssVar: "--color-line-strong", readAs: "border" },
        ],
      },
      {
        id: "overlay",
        label: "overlay",
        tokens: [
          { token: "line-overlay", utility: "border-line-overlay", cssVar: "--color-line-overlay", readAs: "border" },
        ],
      },
    ],
  },
  {
    id: "semantic-accent",
    title: "Accent",
    description: (
      <>
        CTA·선택·강조 상태 등 <strong>브랜드·위험</strong> 의미의 채움 색입니다. 버튼·배지에 <strong>bg-*</strong>로 적용합니다.
      </>
    ),
    groups: [
      {
        id: "brand",
        label: "brand",
        tokens: [
          { token: "accent", utility: "bg-accent", cssVar: "--color-accent", readAs: "bg" },
        ],
      },
      {
        id: "on-brand",
        label: "on-brand",
        tokens: [
          { token: "on-accent", utility: "bg-on-accent", cssVar: "--color-on-accent", readAs: "bg" },
        ],
      },
      {
        id: "danger",
        label: "danger",
        tokens: [
          { token: "accent-danger", utility: "bg-accent-danger", cssVar: "--color-accent-danger", readAs: "bg" },
        ],
      },
    ],
  },
];

const semanticUtilityCatalog: SemanticColorCategoryDef = {
  id: "semantic-utility",
  title: "Utility",
  description: (
    <>
      컴포넌트 border·ring·채움 의미색이 아닌 <strong>유틸리티 전용</strong> 색상입니다. <strong>focus-ring</strong>·<strong>scroll</strong>(thumb/track) 등 단일 목적 토큰을 <strong>utility-*</strong> 슬러그로 관리합니다.
    </>
  ),
  groups: [
    {
      id: "focus-ring",
      label: "focus-ring",
      tokens: [
        {
          token: "utility-focus-ring",
          utility: "outline-utility-focus-ring",
          cssVar: "--color-utility-focus-ring",
          readAs: "outline",
        },
      ],
    },
    {
      id: "scroll",
      label: "scroll",
      tokens: [
        {
          token: "utility-scroll-thumb",
          utility: "bg-utility-scroll-thumb",
          cssVar: "--color-utility-scroll-thumb",
          readAs: "bg",
        },
        {
          token: "utility-scroll-track",
          utility: "bg-utility-scroll-track",
          cssVar: "--color-utility-scroll-track",
          readAs: "bg",
        },
      ],
    },
  ],
};

const semanticOverlayCatalog = {
  id: "semantic-overlay",
  title: "Overlay",
  description: (
    <>
      오버레이용 반투명 시맨틱 토큰. 라이트=<strong>검정α</strong> / 다크=<strong>흰색α</strong>로 모드에 따라 자동 전환됩니다. 체크무늬 위에서 투명도를 확인하세요.
    </>
  ),
  groups: overlayTokens.map(({ label, cssVar, light, dark }) => ({
    id: label,
    label,
    cssVar,
    utility: `bg-${label}`,
    light,
    dark,
  })),
};

const semanticGradientCatalog = {
  id: "semantic-gradient",
  title: "Gradient",
  description: (
    <>
      용도 기반 그라데이션 토큰입니다. <strong>--ds-gradient-*</strong> 원본이 <strong>bg-gradient-*</strong>로 노출되며, 시맨틱 색을 참조해 라이트/다크에 자동 대응합니다.
    </>
  ),
  tokens: gradientTokens,
};

type TocSection = { id: string; label: string };

const colorRawTocSections: TocSection[] = [
  { id: "section-color", label: "Color Palette" },
  { id: "section-contrast", label: "Contrast Checker" },
];

const semanticTocSections: TocSection[] = [
  ...semanticColorCatalog.map((category) => ({ id: category.id, label: category.title })),
  { id: semanticOverlayCatalog.id, label: semanticOverlayCatalog.title },
  { id: semanticGradientCatalog.id, label: semanticGradientCatalog.title },
  { id: semanticUtilityCatalog.id, label: semanticUtilityCatalog.title },
];

const fontFamilyTocSections: TocSection[] = [
  { id: "section-font-family", label: "Font Family" },
  { id: "section-font-stack", label: "Font Stack" },
];

const typographyTocSections: TocSection[] = [
  { id: "section-typography-scale", label: "Type Scale" },
  { id: "section-typography-example", label: "Example of Use" },
];

const outlineIconsTocSections: TocSection[] = [
  { id: "section-outline-icon", label: "Outline" },
  { id: "section-outline-icon-source", label: "Source" },
  { id: "section-outline-icons", label: "Sizes" },
];

const filledIconsTocSections: TocSection[] = [
  { id: "section-filled-icon", label: "Filled" },
  { id: "section-filled-icon-source", label: "Source" },
  { id: "section-filled-icons", label: "Sizes" },
];

function probeSemanticUtilityColor(
  probe: HTMLDivElement,
  utility: string,
  readAs: SemanticColorReadMode,
  cssVar?: string,
): string {
  if (readAs === "border") {
    probe.className = `box-border size-8 border bg-transparent ${utility}`;
    probe.style.backgroundColor = "";
    return getComputedStyle(probe).borderTopColor;
  }
  if (readAs === "outline" && cssVar) {
    probe.className = "box-border size-8";
    probe.style.backgroundColor = `var(${cssVar})`;
    const color = getComputedStyle(probe).backgroundColor;
    probe.style.backgroundColor = "";
    return color;
  }
  probe.className = utility;
  probe.style.backgroundColor = "";
  const cs = getComputedStyle(probe);
  return readAs === "bg" ? cs.backgroundColor : cs.color;
}

/** computed rgb/rgba → 큐레이션 표시용 불투명 hex (#rrggbb, 알파 제거) */
function cssColorToHex(color: string): string {
  if (!color || color === "transparent") return "—";

  if (color.startsWith("#")) {
    const hex = color.toLowerCase();
    if (hex.length === 4) {
      return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    if (hex.length === 9) {
      return hex.slice(0, 7);
    }
    return hex;
  }

  const rgbMatch = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([0-9.]+))?\s*\)/);
  if (!rgbMatch) return color;

  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  const r = Number(rgbMatch[1]);
  const g = Number(rgbMatch[2]);
  const b = Number(rgbMatch[3]);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function semanticSwatchNeedsBorder(color: string): boolean {
  if (!color || color === "transparent") return true;

  const rgbMatch = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    const alphaPart = color.startsWith("rgba") ? color.split(",").pop()?.trim().replace(")", "") : "1";
    const alpha = alphaPart ? parseFloat(alphaPart) : 1;
    if (alpha < 0.45) return true;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.85;
  }

  if (color.startsWith("#")) {
    try {
      return contrastRatio(color, "#ffffff") >= 3;
    } catch {
      return false;
    }
  }

  return false;
}

function SemanticColorSwatchCard({
  token,
  utility,
  color,
}: {
  token: string;
  utility: string;
  color: string;
}) {
  const needsBorder = semanticSwatchNeedsBorder(color);
  const hexLabel = cssColorToHex(color);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-background shadow-[0_4px_16px_var(--ds-shadow)]">
      <div
        aria-hidden="true"
        className={[
          "h-24 w-full",
          needsBorder ? "border-b border-line" : "",
        ].join(" ")}
        style={{ backgroundColor: color }}
      />
      <div className="p-4">
        <p className="m-0 text-label-md font-bold text-foreground">{token}</p>
        <p className="m-0 mt-1 text-caption text-gray-600">{utility}</p>
        <p className="m-0 mt-0.5 font-mono text-caption text-gray-600 numeric-tabular">{hexLabel}</p>
      </div>
    </div>
  );
}

function SemanticOverlaySwatchCard({
  token,
  utility,
  cssVar,
  valueLabel,
  isDark,
}: {
  token: string;
  utility: string;
  cssVar: string;
  valueLabel: string;
  isDark: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-background shadow-[0_4px_16px_var(--ds-shadow)]">
      <div
        aria-hidden="true"
        className="h-24 w-full overflow-hidden border-b border-line"
        style={isDark ? checkerDark : checkerLight}
      >
        <div className="size-full" style={{ background: `var(${cssVar})` }} />
      </div>
      <div className="p-4">
        <p className="m-0 text-label-md font-bold text-foreground">{token}</p>
        <p className="m-0 mt-1 text-caption text-gray-600 font-mono">{utility}</p>
        <p className="m-0 mt-0.5 font-mono text-caption text-gray-600">{valueLabel}</p>
      </div>
    </div>
  );
}

function SemanticGradientSwatchCard({
  token,
  utility,
  desc,
}: {
  token: string;
  utility: string;
  desc: string;
}) {
  const isFade = token.includes("fade");
  const underlayStyle = token.includes("overlay") ? checkerLight : { background: "var(--ds-green-100)" };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-background shadow-[0_4px_16px_var(--ds-shadow)]">
      {isFade ? (
        <div className="h-24 w-full overflow-hidden border-b border-line" style={underlayStyle}>
          <div aria-hidden="true" className={`size-full ${utility}`} />
        </div>
      ) : (
        <div aria-hidden="true" className={`h-24 w-full border-b border-line ${utility}`} />
      )}
      <div className="p-4">
        <p className="m-0 text-label-md font-bold text-foreground">{token}</p>
        <p className="m-0 mt-1 font-mono text-caption text-gray-600">{utility}</p>
        <p className="m-0 mt-0.5 text-caption text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

function SemanticColorGroupGrid({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8 last:mb-0">
      <h4 className="m-0 mb-3 text-label-md font-semibold lowercase text-gray-600">{label}</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>
    </div>
  );
}

function SemanticColorCategorySection({
  id,
  title,
  description,
  lead = false,
  children,
}: {
  id: string;
  title: string;
  description: React.ReactNode;
  lead?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mb-24 last:mb-0">
      <ContentSectionTitle id={id} lead={lead} description={description}>
        {title}
      </ContentSectionTitle>
      {children}
    </section>
  );
}

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
const checkerLight = makeChecker("var(--raw-white)", "var(--raw-gray-200)");
const checkerDark = makeChecker("var(--raw-black)", "var(--raw-gray-700)");

// 폰트 폴백 체인 — 각 단계는 해당 폰트로 렌더되어 시각 비교 가능
const fontStack = [
  { order: 1, name: "Pretendard GOV", family: "var(--font-pretendard-gov), sans-serif", role: "기본", source: "자체 호스팅 (next/font/local)", desc: "공공·접근성(KWCAG) 최적화 한글 폰트. 1순위로 사용.", emphasis: "primary" as const },
  { order: 2, name: "Noto Sans KR", family: "var(--font-noto), sans-serif", role: "폴백", source: "자체 호스팅 (next/font/local)", desc: "Pretendard 미로드 시 사용. preload:false 로 평상시엔 다운로드 안 함.", emphasis: "fallback" as const },
  { order: 3, name: "sans-serif", family: "sans-serif", role: "최종", source: "시스템 기본", desc: "위 둘 다 불가 시 OS 기본 산세리프로 대체.", emphasis: "system" as const },
];

const fontStackBadgeClass: Record<(typeof fontStack)[number]["emphasis"], string> = {
  primary: "bg-accent text-on-accent",
  fallback: "bg-gray-100 text-foreground ring-1 ring-line",
  system: "bg-transparent text-muted ring-1 ring-dashed ring-line",
};

const TOAST_DURATION_MS = 2500;

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function useToast() {
  return useContext(ToastContext);
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast({ message, key: Date.now() });
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <div
          key={toast.key}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-none fixed bottom-24 left-1/2 z-[100] max-w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-line bg-background px-4 py-3 text-label-sm font-medium text-foreground shadow-[0_6px_24px_var(--ds-shadow)]"
        >
          {toast.message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function TokenChip({
  children,
  size = "md",
  copyValue,
}: {
  children: React.ReactNode;
  size?: "md" | "lg";
  copyValue?: string;
}) {
  const toast = useToast();

  const chipClassName = [
    "inline-flex w-fit items-center rounded-full border border-accent bg-transparent font-mono font-semibold text-accent",
    size === "lg" ? "px-4 py-1.5 text-label-md" : "px-3 py-1 text-label-sm",
    copyValue ? "cursor-pointer transition-colors hover:bg-accent/5" : "",
  ].join(" ");

  if (!copyValue) {
    return <span className={chipClassName}>{children}</span>;
  }

  async function handleCopy() {
    const value = copyValue;
    if (!value) return;

    try {
      await copyTextToClipboard(value);
      toast?.showToast(`${value} 복사됨`);
    } catch {
      toast?.showToast("복사에 실패했습니다");
    }
  }

  return (
    <button
      type="button"
      className={chipClassName}
      onClick={() => void handleCopy()}
      aria-label={`${copyValue} 복사`}
    >
      {children}
    </button>
  );
}

function TabDescriptionCallout({
  children,
  className = "",
  margin = "mb-10",
}: {
  children: React.ReactNode;
  className?: string;
  margin?: string;
}) {
  return (
    <div
      className={[
        margin,
        "border-l-4 border-guide-callout-accent bg-guide-callout-bg py-3.5 pl-4 pr-5 text-body-md leading-base text-guide-callout-fg [&_strong]:font-bold [&_strong]:text-foreground [&_a]:font-semibold [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-guide-callout-accent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/** 타이틀·탭·설명 묶음 — 카드/패딩 없이 세로 간격만 유지 */
function ContentIntroShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

function ContentTitleBlock({
  eyebrow = "Tokens",
  title,
  description,
  titleId,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  titleId?: string;
  className?: string;
}) {
  return (
    <header className={["mb-20", className].filter(Boolean).join(" ")}>
      <p className="m-0 text-label-md font-semibold text-guide-intro-eyebrow">{eyebrow}</p>
      <h2
        id={titleId}
        className="m-0 mt-2 font-bold tracking-normal text-foreground typo-guide-content-title"
      >
        {title}
      </h2>
      {description ? (
        <TabDescriptionCallout className="mt-4" margin="mb-0">{description}</TabDescriptionCallout>
      ) : null}
    </header>
  );
}

const guideSectionAnchorClass = "scroll-mt-[calc(3.75rem+1.5rem)]";

/** 탭 패널 1단 — 주요 섹션 */
function ContentSectionTitle({
  id,
  children,
  className = "",
  lead = false,
  description,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  /** 탭 콘텐츠 첫 섹션이면 true — 상단 여백 생략 */
  lead?: boolean;
  description?: React.ReactNode;
}) {
  const titleMargin = description
    ? lead
      ? "mb-4"
      : "mt-24 mb-4"
    : lead
      ? "mb-10"
      : "mt-24 mb-10";

  return (
    <>
      <h3
        id={id}
        className={[
          "m-0 text-heading-sm font-bold leading-base text-foreground",
          guideSectionAnchorClass,
          titleMargin,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </h3>
      {description ? <TabDescriptionCallout>{description}</TabDescriptionCallout> : null}
    </>
  );
}

function ContentTableOfContents({ sections }: { sections: TocSection[] }) {
  const headingId = useId();
  const listId = useId();
  const [collapsed, setCollapsed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);
  const sectionsKey = sections.map((s) => s.id).join("|");

  useEffect(() => {
    setCollapsed(false);
    setActiveId(sections[0]?.id ?? null);
  }, [sectionsKey, sections]);

  useEffect(() => {
    if (sections.length < 3) return;

    const headerOffset = 72;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: `-${headerOffset}px 0px -55% 0px`, threshold: [0, 1] },
    );

    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sectionsKey, sections]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }, []);

  if (sections.length < 3) return null;

  return (
    <nav
      aria-labelledby={headingId}
      className="guide-toc sticky top-[calc(3.75rem+1.5rem)] hidden h-fit w-[12.5rem] shrink-0 xl:block"
    >
      <div className="overflow-hidden rounded-md border border-line bg-background">
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3.5">
          <h2 id={headingId} className="m-0 text-label-md font-bold text-foreground">
            목차
          </h2>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-expanded={!collapsed}
            aria-controls={listId}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-line bg-background px-2.5 py-1 text-caption font-medium text-gray-600 transition-colors hover:text-foreground"
          >
            {collapsed ? "펼치기" : "접기"}
            <NavIcon
              className={["size-icon-xs shrink-0 transition-transform duration-200", collapsed ? "rotate-180" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <polyline points="18 15 12 9 6 15" />
            </NavIcon>
          </button>
        </div>
        {!collapsed ? (
          <ul id={listId} className="m-0 flex list-none flex-col gap-0.5 py-2">
            {sections.map(({ id, label }) => {
              const isActive = activeId === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToSection(id);
                    }}
                    aria-current={isActive ? "location" : undefined}
                    className={[
                      "block px-4 py-2.5 text-body-sm lowercase no-underline transition-colors",
                      isActive
                        ? "bg-gray-50 font-bold text-foreground"
                        : "font-normal text-gray-600 hover:bg-gray-50 hover:text-foreground",
                    ].join(" ")}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </nav>
  );
}

function GuideContentLayout({
  sections,
  children,
}: {
  sections: TocSection[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-8 xl:gap-10">
      <div className="min-w-0 flex-1">{children}</div>
      <ContentTableOfContents sections={sections} />
    </div>
  );
}

/** 탭 패널 2단 — 섹션 내 하위 블록 */
function ContentSubsectionTitle({
  id,
  children,
  className = "",
  spaced = false,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  /** 이전 블록과 큰 간격이 필요할 때 */
  spaced?: boolean;
}) {
  return (
    <h4
      id={id}
      className={[
        "m-0 mb-6 text-heading-md font-bold text-accent",
        guideSectionAnchorClass,
        spaced ? "mt-20" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </h4>
  );
}

/** 탭 패널 3단 — 표·그룹 라벨 (h3 섹션 직속) */
function ContentGroupTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h4 className={["m-0 mb-4 text-heading-sm font-bold text-foreground", className].filter(Boolean).join(" ")}>
      {children}
    </h4>
  );
}

/** 콘텐츠 영역 서브탭 — outline variant (react-ts-scss-vite-pnpm-template Tabs 구조 참고) */
const contentSubTabPanelClass = "layout-guide-tabpanel";

type ContentOutlineTabDef = {
  value: string;
  tabId: string;
  panelId: string;
  label: string;
  ref?: React.RefObject<HTMLButtonElement | null>;
};

const contentOutlineSubTabClass = (active: boolean) =>
  [
    "relative shrink-0 cursor-pointer select-none whitespace-nowrap rounded-t-lg border-0 border-b-0 border-t-2 border-l-2 border-r-2 border-solid px-5 py-3 font-sans text-guide-tab-title leading-base transition-[color,background-color] duration-200",
    active
      ? "z-[1] -mb-0.5 border-accent bg-background font-bold text-accent after:absolute after:-bottom-0.5 after:left-0 after:z-[2] after:h-0.5 after:w-full after:bg-background after:content-['']"
      : "border-transparent bg-surface-subtle font-medium text-foreground hover:bg-gray-100",
  ].join(" ");

const guideTabScrollBtnClass =
  "guide-tabs-scroll-btn inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center rounded-full border border-accent bg-background text-accent transition-opacity duration-150 hover:bg-surface-subtle focus-visible:opacity-100 focus-visible:visible";

const GUIDE_TAB_SCROLL_AMOUNT = 200;

function ContentOutlineTabList({
  ariaLabel,
  tabs,
  activeValue,
  onSelect,
  onKeyDown,
}: {
  ariaLabel: string;
  tabs: ContentOutlineTabDef[];
  activeValue: string;
  onSelect: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = useCallback(() => {
    const el = tabListRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftArrow(scrollLeft > 1);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  const scrollToTab = useCallback((tabId: string, immediate = false) => {
    const container = tabListRef.current;
    const targetTab = document.getElementById(tabId);
    if (!container || !targetTab) return;

    const containerRect = container.getBoundingClientRect();
    const tabRect = targetTab.getBoundingClientRect();
    const tabCenterInContainer =
      tabRect.left - containerRect.left + container.scrollLeft + tabRect.width / 2;
    const scrollLeft = tabCenterInContainer - container.clientWidth / 2;

    container.scrollTo({
      left: Math.max(0, Math.min(scrollLeft, container.scrollWidth - container.clientWidth)),
      behavior: immediate ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    const activeTab = tabsRef.current.find((tab) => tab.value === activeValue);
    if (activeTab) scrollToTab(activeTab.tabId);
  }, [activeValue, scrollToTab]);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, tabs]);

  const handleScroll = (direction: "left" | "right") => {
    tabListRef.current?.scrollBy({
      left: direction === "left" ? -GUIDE_TAB_SCROLL_AMOUNT : GUIDE_TAB_SCROLL_AMOUNT,
      behavior: "smooth",
    });
    window.setTimeout(checkScroll, 350);
  };

  return (
    <div className="mt-0 w-full">
      <div className="relative flex w-full items-center overflow-hidden">
        <button
          type="button"
          aria-label="이전 탭 보기"
          aria-disabled={!showLeftArrow}
          onClick={() => showLeftArrow && handleScroll("left")}
          className={[guideTabScrollBtnClass, !showLeftArrow ? "guide-tabs-scroll-btn-hidden" : ""].filter(Boolean).join(" ")}
        >
          <NavIcon className="size-icon-xs shrink-0">
            <polyline points="15 18 9 12 15 6" />
          </NavIcon>
        </button>

        <div
          ref={tabListRef}
          onScroll={checkScroll}
          className="guide-tabs-list-area min-w-0 flex-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div
            role="tablist"
            aria-label={ariaLabel}
            onKeyDown={onKeyDown}
            className="flex w-max min-w-full border-b-2 border-accent px-control-md"
          >
            {tabs.map((tab) => {
              const active = activeValue === tab.value;
              return (
                <button
                  key={tab.value}
                  ref={tab.ref}
                  type="button"
                  role="tab"
                  id={tab.tabId}
                  aria-selected={active}
                  aria-controls={tab.panelId}
                  tabIndex={active ? 0 : -1}
                  onClick={() => {
                    onSelect(tab.value);
                    scrollToTab(tab.tabId, true);
                  }}
                  onFocus={() => scrollToTab(tab.tabId)}
                  className={contentOutlineSubTabClass(active)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          aria-label="다음 탭 보기"
          aria-disabled={!showRightArrow}
          onClick={() => showRightArrow && handleScroll("right")}
          className={[guideTabScrollBtnClass, !showRightArrow ? "guide-tabs-scroll-btn-hidden" : ""].filter(Boolean).join(" ")}
        >
          <NavIcon className="size-icon-xs shrink-0">
            <polyline points="9 18 15 12 9 6" />
          </NavIcon>
        </button>
      </div>
    </div>
  );
}

const guideHeaderHeightClass = "h-[3.75rem]";
const guideHeaderOffsetClass = "top-[3.75rem]";
const guideHeaderMaxHeightClass = "max-h-[calc(100vh-3.75rem)]";
const guideHeaderIconButtonClass =
  "inline-flex size-control-sm items-center justify-center rounded-full bg-surface-subtle text-foreground transition-colors duration-150 hover:bg-green-50 hover:text-accent";

function GuideLogoMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 20"
      className="size-icon-sm shrink-0 text-accent"
      fill="currentColor"
    >
      <circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.35" />
      <circle cx="22" cy="10" r="8" fill="currentColor" />
    </svg>
  );
}

function GuideSiteHeader({
  isSidenavOpen,
  onToggleSidenav,
}: {
  isSidenavOpen: boolean;
  onToggleSidenav: () => void;
}) {
  return (
    <header
      className={`sticky z-40 border-b border-line bg-background ${guideHeaderPaddingClass} ${guideHeaderHeightClass} top-0`}
    >
      <div className={`grid w-full ${guideHeaderHeightClass} grid-cols-[auto_1fr_auto] items-center gap-3 lg:grid-cols-[1fr_auto_1fr] lg:gap-6`}>
        <div className="flex items-center gap-1 justify-self-start">
          <a
            href="/"
            aria-label="가이드 홈"
            className={`${guideHeaderIconButtonClass} cursor-pointer`}
          >
            <NavIcon className="size-icon-sm shrink-0">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </NavIcon>
          </a>
          <button
            type="button"
            aria-label={isSidenavOpen ? "사이드 메뉴 접기" : "사이드 메뉴 펼치기"}
            aria-expanded={isSidenavOpen}
            aria-controls="guide-sidenav"
            onClick={onToggleSidenav}
            className={`${guideHeaderIconButtonClass} cursor-pointer`}
          >
            <NavIcon className="size-icon-sm shrink-0">
              {isSidenavOpen ? (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </NavIcon>
          </button>
        </div>

        <div className="flex min-w-0 items-center justify-center gap-2 justify-self-center">
          <GuideLogoMark />
          <h1 className="truncate text-label-lg font-bold text-foreground">디자인 시스템 가이드</h1>
        </div>

        <div className="flex items-center justify-self-end">
          <label className="relative hidden items-center sm:flex">
            <span className="sr-only">가이드 검색</span>
            <NavIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 size-icon-xs shrink-0 text-muted"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </NavIcon>
            <input
              type="search"
              name="guide-search"
              placeholder="가이드 검색..."
              className="h-control-sm w-[12.5rem] rounded-full border border-line bg-surface-subtle pl-9 pr-4 text-label-sm text-foreground placeholder:text-muted md:w-[15rem]"
            />
          </label>
        </div>
      </div>
    </header>
  );
}

function FontTokenGuide() {
  return (
    <section aria-label="폰트 패밀리 적용 방법" className="mb-6 border-b border-line pb-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="m-0 text-caption font-semibold uppercase tracking-normal text-foreground">
          Tailwind utility class
        </p>
        <TokenChip size="lg" copyValue="font-sans">
          font-sans
        </TokenChip>
      </div>
    </section>
  );
}

function FontStackCuration() {
  return (
    <>
      <ContentSectionTitle
        id="section-font-family"
        lead
        description={
          <>
            <strong>Pretendard GOV</strong>를 기본으로 하는 폴백 체인입니다. <strong>font-sans</strong> 유틸리티로 <strong>--font-family-base</strong> 토큰을 적용합니다.
          </>
        }
      >
        Font Family
      </ContentSectionTitle>

      <FontTokenGuide />

      <ContentSubsectionTitle id="section-font-stack" spaced>
        Font Stack
      </ContentSubsectionTitle>
      <ol className="m-0 flex list-none flex-col p-0">
        {fontStack.map(({ order, name, family, role, source, desc, emphasis }, index) => (
          <li key={order}>
            <div className="flex gap-4">
              <div className="flex w-8 shrink-0 flex-col items-center">
                <span
                  aria-hidden="true"
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-caption font-bold ${fontStackBadgeClass[emphasis]}`}
                >
                  {order}
                </span>
                {index < fontStack.length - 1 && (
                  <span aria-hidden="true" className="my-1 w-px flex-1 min-h-4 bg-line" />
                )}
              </div>
              <div className={`min-w-0 flex-1 ${index < fontStack.length - 1 ? "pb-5" : ""}`}>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span
                    role="img"
                    aria-label={`${name} 글꼴 견본`}
                    className={`leading-base ${emphasis === "primary" ? "text-label-lg font-bold" : "text-label-md font-semibold"}`}
                    style={{ fontFamily: family }}
                  >
                    {name}
                  </span>
                  <span
                    className={`text-caption font-semibold ${emphasis === "primary" ? "text-accent" : "text-muted"}`}
                  >
                    {role}
                  </span>
                </div>
                <p className="m-0 mt-1 text-caption text-muted">{desc}</p>
                <p className="m-0 mt-0.5 font-mono text-caption text-muted">{source}</p>
              </div>
            </div>
            {index < fontStack.length - 1 && (
              <p className="mb-1 mt-0 flex items-center gap-4 pl-0 text-caption text-muted" aria-hidden="true">
                <span className="flex w-8 shrink-0 justify-center">↓</span>
                <span>미로드 시</span>
              </p>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}

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

const FONT_LINE = 1.5;

const typographyWeightLabel: Record<string, string> = {
  "--font-weight-regular": "Regular",
  "--font-weight-medium": "Medium",
  "--font-weight-semibold": "Semibold",
  "--font-weight-bold": "Bold",
};

const typographyExamples = [
  {
    chip: "typo-label-sm",
    className: "typo-label-sm uppercase",
    text: "Latest News",
    ariaLabel: "Label SM 견본",
  },
  {
    chip: "typo-display-md",
    className: "typo-display-md",
    text: "데이터를 더 스마트하게 관리하는 방법",
    ariaLabel: "Display MD 견본",
  },
  {
    chip: "typo-body-lg",
    className: "typo-body-lg",
    text: "디자인 토큰과 Tailwind 유틸리티로 일관된 타이포 스케일을 적용합니다. 개발자는 typo-* 클래스만 지정하면 됩니다.",
    ariaLabel: "Body LG 견본",
  },
  {
    chip: "typo-label-md",
    className: "typo-label-md inline-flex rounded-lg bg-accent px-4 py-2 text-on-accent",
    text: "시작하기",
    ariaLabel: "Label MD 버튼 견본",
  },
] as const;

function TypographyScaleTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[36rem] border-collapse text-left">
        <caption className="sr-only">타이포그래피 스케일 — 계층, 굵기, 크기, 행간, Tailwind utility class</caption>
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th scope="col" className="px-4 py-3 text-caption font-semibold uppercase tracking-normal text-muted">
              Hierarchy
            </th>
            <th scope="col" className="px-4 py-3 text-caption font-semibold uppercase tracking-normal text-muted">
              Weight
            </th>
            <th scope="col" className="px-4 py-3 text-caption font-semibold uppercase tracking-normal text-muted">
              Size
            </th>
            <th scope="col" className="px-4 py-3 text-caption font-semibold uppercase tracking-normal text-muted">
              Line Height
            </th>
            <th scope="col" className="px-4 py-3 text-caption font-semibold uppercase tracking-normal text-muted">
              Tailwind utility class
            </th>
          </tr>
        </thead>
        <tbody>
          {typographyTokens.map(({ label, var: cssVar, weight, typoClass }) => {
            const sizeKey = cssVar.replace("--font-size-", "") as keyof typeof fontSizePx;
            const sizePx = fontSizePx[sizeKey];
            const lineHeightPx = Math.round(sizePx * FONT_LINE);

            return (
              <tr key={cssVar} className="border-b border-gray-200 last:border-b-0">
                <td className="px-4 py-4 align-middle">
                  <span role="img" aria-label={`${label} 견본`} className={typoClass}>
                    {label}
                  </span>
                </td>
                <td className="px-4 py-4 align-middle text-label-sm text-foreground">
                  {typographyWeightLabel[weight] ?? weight}
                </td>
                <td className="px-4 py-4 align-middle text-label-sm numeric-tabular text-foreground">
                  {sizePx}
                </td>
                <td className="px-4 py-4 align-middle text-label-sm numeric-tabular text-foreground">
                  {lineHeightPx}
                </td>
                <td className="px-4 py-4 align-middle">
                  <TokenChip copyValue={typoClass}>{typoClass}</TokenChip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TypographyExampleOfUse() {
  return (
    <section aria-labelledby="section-typography-example" className="mt-24">
      <ContentSubsectionTitle id="section-typography-example">Example of Use</ContentSubsectionTitle>
      <div className="rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col gap-5">
          {typographyExamples.map(({ chip, className, text, ariaLabel }) => (
            <div key={chip} className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_2rem_auto]">
              <div className="min-w-0">
                <span role="img" aria-label={ariaLabel} className={className}>
                  {text}
                </span>
              </div>
              <span
                aria-hidden="true"
                className="hidden h-px w-full border-t border-dashed border-line sm:block"
              />
              <TokenChip>{chip}</TokenChip>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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

type IconStyle = "outline" | "filled";

type IconCatalogEntry = {
  id: string;
  label: string;
  innerMarkup: string;
};

const outlineIconCatalog: readonly IconCatalogEntry[] = [
  {
    id: "home",
    label: "홈",
    innerMarkup:
      '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />',
  },
  {
    id: "search",
    label: "검색",
    innerMarkup: '<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />',
  },
  {
    id: "bell",
    label: "알림",
    innerMarkup:
      '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />',
  },
  {
    id: "user",
    label: "사용자",
    innerMarkup:
      '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />',
  },
  {
    id: "settings",
    label: "설정",
    innerMarkup:
      '<circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />',
  },
  {
    id: "add",
    label: "추가",
    innerMarkup: '<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />',
  },
  {
    id: "close",
    label: "닫기",
    innerMarkup: '<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />',
  },
  {
    id: "external",
    label: "외부 링크",
    innerMarkup:
      '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14 21 3" />',
  },
  {
    id: "sun",
    label: "라이트 모드",
    innerMarkup:
      '<circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M4.93 19.07l1.41-1.41" /><path d="M17.66 6.34l1.41-1.41" />',
  },
  {
    id: "moon",
    label: "다크 모드",
    innerMarkup: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />',
  },
] as const;

const filledIconCatalog: readonly IconCatalogEntry[] = [];

const iconSourceByStyle = {
  outline: {
    name: "Feather Icons",
    style: "Outline",
    sourceUrl: "https://feathericons.com/",
    specs: [
      { label: "viewBox", value: "0 0 24 24" },
      { label: "stroke-width", value: "1.75" },
      { label: "stroke", value: "currentColor" },
      { label: "크기", value: "size-icon-* 유틸리티" },
    ],
  },
  filled: {
    name: "TBD",
    style: "Filled",
    sourceUrl: null as string | null,
    specs: [
      { label: "viewBox", value: "0 0 24 24" },
      { label: "fill", value: "currentColor" },
      { label: "크기", value: "size-icon-* 유틸리티" },
    ],
  },
} as const;

function buildIconSvgMarkup(style: IconStyle, utility: string, innerMarkup: string) {
  if (style === "filled") {
    return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" class="${utility} shrink-0 text-foreground">\n  ${innerMarkup}\n</svg>`;
  }
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="${utility} shrink-0 text-foreground">\n  ${innerMarkup}\n</svg>`;
}

function ProjectIconGlyph({
  innerMarkup,
  className,
  style = "outline",
}: {
  innerMarkup: string;
  className?: string;
  style?: IconStyle;
}) {
  const resolvedClassName = className ?? "size-icon-md shrink-0 text-foreground";

  if (style === "filled") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={resolvedClassName}
        dangerouslySetInnerHTML={{ __html: innerMarkup }}
      />
    );
  }

  return <NavIcon innerMarkup={innerMarkup} className={resolvedClassName} />;
}

function IconCopyCell({
  iconId,
  label,
  utility,
  innerMarkup,
  style,
}: {
  iconId: string;
  label: string;
  utility: string;
  innerMarkup: string;
  style: IconStyle;
}) {
  const toast = useToast();

  async function handleCopy() {
    try {
      await copyTextToClipboard(buildIconSvgMarkup(style, utility, innerMarkup));
      toast?.showToast(`${iconId} 마크업 복사됨`);
    } catch {
      toast?.showToast("복사에 실패했습니다");
    }
  }

  return (
    <td className="px-3 py-2 text-center align-middle">
      <div className="group relative flex min-h-[4.5rem] items-center justify-center">
        <ProjectIconGlyph innerMarkup={innerMarkup} className={`${utility} shrink-0 text-foreground`} style={style} />
        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label={`${label} ${iconId} ${utility} SVG 마크업 복사`}
          className="absolute bottom-1 right-1 inline-flex h-5 cursor-pointer items-center justify-center rounded border border-line bg-background px-1.5 text-caption font-semibold uppercase leading-none text-gray-600 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:text-foreground focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
        >
          copy
        </button>
      </div>
    </td>
  );
}

function IconSizeMatrix({ catalog, style }: { catalog: readonly IconCatalogEntry[]; style: IconStyle }) {
  const styleLabel = style === "outline" ? "Outline" : "Filled";

  if (catalog.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-gray-100 p-6">
        <p className="m-0 text-body-sm text-gray-700">
          <strong>{styleLabel}</strong> 아이콘 세트가 아직 등록되지 않았습니다. 글리프를 추가하면 이 표에 크기별 배리에이션이 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[44rem] border-collapse text-left">
        <caption className="sr-only">{styleLabel} Icon — Tailwind utility class 크기별 배리에이션</caption>
        <thead>
          <tr className="border-b border-line bg-gray-50">
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Icon</span>
            </th>
            {iconSizeTokens.map((token) => (
              <th key={token.name} scope="col" className="px-3 py-3 text-center align-middle">
                <span className="font-mono text-label-sm font-semibold text-foreground">
                  {token.utility} ({token.px})
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {catalog.map(({ id, label, innerMarkup }) => (
            <tr key={id} className="border-b border-line last:border-b-0">
              <th scope="row" className="px-4 py-4 align-middle">
                <span className="font-mono text-caption text-gray-600">{id}</span>
                <span className="sr-only">{label}</span>
              </th>
              {iconSizeTokens.map((token) => (
                <IconCopyCell
                  key={token.name}
                  iconId={id}
                  label={label}
                  utility={token.utility}
                  innerMarkup={innerMarkup}
                  style={style}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IconStyleCuration({ style }: { style: IconStyle }) {
  const catalog = style === "outline" ? outlineIconCatalog : filledIconCatalog;
  const source = iconSourceByStyle[style];
  const isOutline = style === "outline";
  const sectionId = isOutline ? "section-outline-icon" : "section-filled-icon";
  const sourceSectionId = isOutline ? "section-outline-icon-source" : "section-filled-icon-source";
  const sizesSectionId = isOutline ? "section-outline-icons" : "section-filled-icons";
  const title = isOutline ? "Outline" : "Filled";

  return (
    <>
      <ContentSectionTitle
        id={sectionId}
        lead
        description={
          isOutline ? (
            <>
              <strong>stroke</strong> 기반 <strong>24×24</strong> 라인 아이콘과 <strong>size-icon-*</strong> 크기 토큰입니다. 글리프 path는 프로젝트에 <strong>인라인 SVG</strong>로 포함하며,{" "}
              <strong>외부 CDN·아이콘 폰트·스프라이트</strong>는 사용하지 않습니다.
            </>
          ) : (
            <>
              <strong>fill</strong> 기반 <strong>24×24</strong> 솔리드 아이콘과 <strong>size-icon-*</strong> 크기 토큰입니다. 세트가 준비되면 outline과 동일한 방식으로 <strong>인라인 SVG</strong>로 포함합니다.
            </>
          )
        }
      >
        {title}
      </ContentSectionTitle>

      <section aria-labelledby={sourceSectionId} className="mb-20">
        <ContentSubsectionTitle id={sourceSectionId}>Source</ContentSubsectionTitle>
        <div className="flex gap-4">
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-caption font-bold text-on-accent"
          >
            1
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-label-lg font-bold text-foreground">{source.name}</span>
              <span className="text-caption font-semibold text-accent">{source.style}</span>
            </div>
            <p className="m-0 mt-0.5 font-mono text-caption text-gray-600">
              {source.sourceUrl ? (
                <>
                  <a
                    href={source.sourceUrl}
                    className="text-accent underline-offset-2 hover:underline"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {source.sourceUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                  {" · MIT License"}
                </>
              ) : (
                "소스 미정 — filled 세트 추가 시 업데이트"
              )}
            </p>
            <dl className="m-0 mt-3 grid gap-2 sm:grid-cols-2">
              {source.specs.map(({ label, value }) => (
                <div key={label} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <dt className="m-0 font-mono text-caption text-gray-600">{label}</dt>
                  <dd className="m-0 font-mono text-caption text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby={sizesSectionId} className="mb-0">
        <ContentSubsectionTitle id={sizesSectionId} spaced>
          Sizes
        </ContentSubsectionTitle>
        <IconSizeMatrix catalog={catalog} style={style} />
      </section>
    </>
  );
}

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

const levelStyle: Record<ContrastLevel, { bg: string; color: string; label: string }> = {
  AAA:        { bg: "var(--ds-guide-level-aaa-bg)",  color: "var(--ds-guide-level-aaa-fg)",  label: "AAA" },
  AA:         { bg: "var(--ds-guide-level-aa-bg)",   color: "var(--ds-guide-level-aa-fg)",   label: "AA" },
  "AA Large": { bg: "var(--ds-guide-level-warn-bg)", color: "var(--ds-guide-level-warn-fg)", label: "AA Large" },
  Fail:       { bg: "var(--ds-guide-level-fail-bg)", color: "var(--ds-guide-level-fail-fg)", label: "Fail" },
};

/** 명암비 결과 카드 — 숫자·기준 박스 배경 통일 */
const contrastResultSurfaceClass = "rounded-xl bg-gray-50";

function LevelBadge({ level }: { level: ContrastLevel }) {
  const s = levelStyle[level];
  return (
    <span
      className="text-caption font-bold leading-none"
      style={{
        background: s.bg,
        color: s.color,
        padding: "2px 10px",
        borderRadius: "999px",
        letterSpacing: "var(--font-tracking)",
      }}
    >
      {s.label}
    </span>
  );
}

/** 원형 통과/실패 배지 — accent(통과)·danger(실패) 채움 + 흰색 체크/엑스. */
function ContrastCircle({ passed }: { passed: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center rounded-full shrink-0 size-icon-md"
      style={{ background: passed ? "var(--ds-accent)" : "var(--ds-accent-danger)" }}
    >
      <NavIcon
        innerMarkup={
          passed
            ? '<polyline points="20 6 9 17 4 12" />'
            : '<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />'
        }
        className="size-icon-xs text-on-accent"
      />
    </span>
  );
}

const contrastPickPaletteIcon =
  '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor" stroke="none" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" stroke="none" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" stroke="none" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" stroke="none" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />';
const contrastPickChevronIcon = '<polyline points="9 18 15 12 9 6" />';
const contrastPickCloseIcon = '<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />';

/** 팔레트 스와치 — 선택 시 accent ring(피커 버튼과 동일), 비선택은 얇은 line 보더 */
function contrastSwatchClass(isBg: boolean, isText: boolean, isInteractive: boolean, extra = ""): string {
  const isSelected = isBg || isText;
  return [
    "h-10 rounded-md relative",
    extra,
    isInteractive ? "cursor-pointer border-0 p-0 transition-[opacity,box-shadow,transform] duration-150" : "",
    isSelected
      ? "z-[1] scale-[1.04] shadow-md ring-2 ring-accent ring-offset-2 ring-offset-background"
      : "border border-line-overlay",
    isInteractive && !isSelected ? "opacity-75 hover:opacity-100 hover:scale-[1.02]" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** BG·TXT 역할 배지 — 스와치 명도와 무관하게 background+테두리로 대비 확보 */
function ContrastSwatchRoleMarker({ role }: { role: "BG" | "TXT" }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "absolute top-1 left-1 rounded border-2 bg-background px-1.5 py-0.5 text-caption font-bold leading-none shadow-sm",
        role === "BG" ? "border-accent text-accent" : "border-foreground text-foreground",
      ].join(" ")}
    >
      {role}
    </span>
  );
}

function ContrastColorPickButton({
  labelId,
  labelText,
  valueId,
  swatchHex,
  colorLabel,
  colorHex,
  isSelecting,
  onToggle,
}: {
  labelId: string;
  labelText: string;
  valueId: string;
  swatchHex: string;
  colorLabel: string;
  colorHex: string;
  isSelecting: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <p id={labelId} className="mb-1.5 text-label-sm font-semibold text-foreground">
        {labelText}
      </p>
      <button
        type="button"
        onClick={onToggle}
        aria-label={
          isSelecting
            ? `${labelText} 선택 취소 — 현재 ${colorLabel} ${colorHex}`
            : `${labelText} — 팔레트에서 색 고르기, 현재 ${colorLabel} ${colorHex}`
        }
        aria-expanded={isSelecting}
        aria-describedby={valueId}
        className={[
          "group w-full flex items-center gap-3 rounded-xl border-0 py-3 px-4 text-left cursor-pointer transition-[background-color,box-shadow] duration-150",
          isSelecting
            ? "bg-gray-100 shadow-sm ring-2 ring-accent"
            : "bg-surface-subtle hover:bg-gray-100 hover:shadow-sm hover:ring-1 hover:ring-line",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className={[
            "block size-8 shrink-0 rounded-md border border-line-overlay transition-transform duration-150",
            isSelecting ? "scale-105 ring-2 ring-accent ring-offset-1" : "group-hover:scale-105",
          ].join(" ")}
          style={{ background: swatchHex }}
        />
        <span className="flex min-w-0 flex-col text-left">
          <span className="text-label-md font-semibold">{colorLabel}</span>
          <span id={valueId} className="text-caption text-gray-600 font-mono numeric-tabular">{colorHex}</span>
        </span>
        <span
          aria-hidden="true"
          className={[
            "ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-label-sm font-semibold transition-colors duration-150",
            isSelecting
              ? "border-accent bg-background text-accent"
              : "border-line bg-background text-accent group-hover:border-accent",
          ].join(" ")}
        >
          {isSelecting ? (
            <>
              <NavIcon innerMarkup={contrastPickCloseIcon} className="size-icon-xs shrink-0" />
              선택 중 · 취소
            </>
          ) : (
            <>
              <NavIcon innerMarkup={contrastPickPaletteIcon} className="size-icon-xs shrink-0" />
              팔레트에서 선택
              <NavIcon innerMarkup={contrastPickChevronIcon} className="size-icon-xs shrink-0" />
            </>
          )}
        </span>
      </button>
    </div>
  );
}

/** 명암비 결과 카드의 단일 기준 박스 — 원형 배지 + 등급 + 임계 대비율. */
function ContrastCriterionBox({ grade, threshold, passed }: { grade: string; threshold: string; passed: boolean }) {
  return (
    <div className={`flex items-center gap-2 py-2.5 px-3 ${contrastResultSurfaceClass}`}>
      <ContrastCircle passed={passed} />
      <span className="text-label-md font-bold text-foreground">{grade}</span>
      <span className="ml-auto text-caption text-gray-700 numeric-tabular">{threshold}</span>
    </div>
  );
}

/** 명암비 결과 카드의 카테고리(제목 + AA·AAA 박스). */
function ContrastCategory({
  title,
  aa,
  aaa,
}: {
  title: React.ReactNode;
  aa: { threshold: string; passed: boolean };
  aaa: { threshold: string; passed: boolean };
}) {
  return (
    <div>
      <p className="text-label-sm font-semibold text-gray-600 mb-2">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        <ContrastCriterionBox grade="AA" threshold={aa.threshold} passed={aa.passed} />
        <ContrastCriterionBox grade="AAA" threshold={aaa.threshold} passed={aaa.passed} />
      </div>
    </div>
  );
}

function TokenValue({ px, rem }: { px: string; rem: string }) {
  return (
    <span className="flex flex-col leading-base font-mono">
      <span className="text-label-sm font-semibold numeric-tabular text-foreground">{px}</span>
      <span className="text-caption text-muted numeric-tabular">{rem}</span>
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
    <div className="h-9 bg-surface-subtle border border-line flex items-center px-3">
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

function GridColumnPreview({ cols, utility, label }: { cols: number; utility: string; label: string }) {
  const cellHeight = cols >= 6 ? pxToRem(24) : pxToRem(32);
  return (
    <div
      role="img"
      aria-label={label}
      className={`grid gap-2 ${utility}`}
    >
      {Array.from({ length: cols }, (_, i) => (
        <div key={i} className="bg-accent" style={{ height: cellHeight }} aria-hidden="true" />
      ))}
    </div>
  );
}

function GridGapPreview({ utility, label }: { utility: string; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`grid w-full grid-cols-2 ${utility} bg-red-200`}
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="bg-background"
          style={{ height: pxToRem(32) }}
        />
      ))}
    </div>
  );
}

function GridGapCuration() {
  return (
    <div className="rounded-xl border border-line p-6">
      <div
        role="list"
        aria-label="gap 크기 배리에이션"
        className="flex items-end justify-between gap-6 overflow-x-auto"
      >
        {gridGapTokens.map(({ name, utility, px, rem, desc }) => (
          <div key={name} role="listitem" className="flex min-w-[5rem] flex-1 flex-col items-center gap-2">
            <span className="text-label-sm font-semibold numeric-tabular text-foreground">{px}</span>
            <GridGapPreview
              utility={utility}
              label={`${name} ${px}, ${rem} — 좌우·상하 gap과 grid item 견본`}
            />
            <span className="font-mono text-caption font-semibold text-foreground">{name}</span>
            <span className="text-center text-caption text-muted">{desc}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 mb-3 text-caption text-muted">
        Linear: 16px → 24px → 32px (+8px) — <span className="font-mono">gap-*</span>는{" "}
        <span className="font-mono">space-*</span> 토큰과 1:1 대응합니다.
      </p>
      <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block size-2 bg-red-200" />
          붉은색 = gap
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block size-2 bg-background border border-line" />
          밝은 블록 = grid item
        </span>
      </p>
    </div>
  );
}

type SwatchInfo = { hex: string; label: string };

function NavIcon({
  children,
  innerMarkup,
  className,
}: {
  children?: React.ReactNode;
  innerMarkup?: string;
  className?: string;
}) {
  const svgClassName = className ?? "size-icon-sm shrink-0";

  if (innerMarkup) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={svgClassName}
        dangerouslySetInnerHTML={{ __html: innerMarkup }}
      />
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={svgClassName}
    >
      {children}
    </svg>
  );
}

const navIconColor = (
  <NavIcon>
    <circle cx="8" cy="8" r="3.5" />
    <circle cx="16" cy="10" r="3.5" />
    <circle cx="11" cy="16" r="3.5" />
  </NavIcon>
);

const navIconType = (
  <NavIcon>
    <path d="M4 7h16" />
    <path d="M7 12h10" />
    <path d="M10 17h4" />
  </NavIcon>
);

const navIconSpacing = (
  <NavIcon>
    <path d="M4 8h16" />
    <path d="M4 16h16" />
    <path d="M12 8v8" />
    <path d="M9 12h6" />
  </NavIcon>
);

const navIconGrid = (
  <NavIcon>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </NavIcon>
);

const navIconLayout = (
  <NavIcon>
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <path d="M4 9h16" />
    <path d="M8 5v14" />
  </NavIcon>
);

const navIconAssets = (
  <NavIcon>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <circle cx="17.5" cy="6.5" r="2.5" />
    <path d="M14 14l7 7" />
    <path d="M3 17l5-5" />
  </NavIcon>
);

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <NavIcon className={className ?? "size-icon-xs shrink-0"}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </NavIcon>
  );
}

const themeIconSun = (
  <NavIcon className="size-icon-md shrink-0">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
  </NavIcon>
);

const themeIconMoon = (
  <NavIcon className="size-icon-md shrink-0">
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />
  </NavIcon>
);

const scrollToTopIcon = (
  <NavIcon className="size-icon-md shrink-0">
    <polyline points="18 15 12 9 6 15" />
  </NavIcon>
);

const guideFabButtonClass =
  "inline-flex size-control-lg cursor-pointer items-center justify-center rounded-full border-0 shadow-[0_6px_24px_var(--ds-shadow)] transition-[transform,box-shadow,opacity] duration-300 ease-out hover:scale-105 hover:shadow-[0_8px_32px_var(--ds-shadow)] active:scale-100 active:duration-150";

const guideFabAccentClass = `${guideFabButtonClass} bg-accent text-on-accent`;
const guideFabSurfaceClass = `${guideFabButtonClass} bg-background text-foreground ring-1 ring-line`;

const GUIDE_SCROLL_TOP_THRESHOLD = 240;

type NavSubTreeItem = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function NavSubTree({
  ariaLabel,
  items,
  itemClassName,
}: {
  ariaLabel: string;
  items: NavSubTreeItem[];
  itemClassName: (active: boolean) => string;
}) {
  return (
    <ul
      role="group"
      aria-label={ariaLabel}
      className="m-0 ml-5 flex list-none flex-col gap-0.5 border-l border-line py-1 pl-4 pr-1"
    >
      {items.map((item) => (
        <li key={item.label} className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-4 top-1/2 h-px w-4 -translate-y-1/2 bg-line"
          />
          <button
            type="button"
            onClick={item.onClick}
            aria-current={item.active ? "page" : undefined}
            className={itemClassName(item.active)}
          >
            <span>{item.label}</span>
            {item.active && (
              <NavIcon className="size-icon-xs shrink-0 opacity-50">
                <path d="M9 6l6 6-6 6" />
              </NavIcon>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [bgColor, setBgColor] = useState<SwatchInfo>({ hex: "#ffffff", label: "White" });
  const [textColor, setTextColor] = useState<SwatchInfo>({ hex: "#1E2124", label: "Gray 900" });
  const [selecting, setSelecting] = useState<"bg" | "text" | null>(null);
  const [activeTab, setActiveTab] = useState<"color" | "spacing" | "grid" | "type" | "icons">("color");
  const [activeColorTab, setActiveColorTab] = useState<"raw" | "semantic">("raw");
  const [activeTypeTab, setActiveTypeTab] = useState<"font-family" | "typography">("font-family");
  const [activeSpacingTab, setActiveSpacingTab] = useState<"spacing" | "radius" | "fixed-size">("spacing");
  const [activeGridTab, setActiveGridTab] = useState<"columns" | "gap">("columns");
  const [activeIconsTab, setActiveIconsTab] = useState<"outline" | "filled">("outline");
  const [colorMenuExpanded, setColorMenuExpanded] = useState(true);
  const [typeMenuExpanded, setTypeMenuExpanded] = useState(true);
  const [spacingMenuExpanded, setSpacingMenuExpanded] = useState(true);
  const [gridMenuExpanded, setGridMenuExpanded] = useState(true);
  const [iconsMenuExpanded, setIconsMenuExpanded] = useState(true);
  const [isSidenavOpen, setIsSidenavOpen] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const colorTabRef = useRef<HTMLButtonElement>(null);
  const spacingTabRef = useRef<HTMLButtonElement>(null);
  const gridTabRef = useRef<HTMLButtonElement>(null);
  const typeTabRef = useRef<HTMLButtonElement>(null);
  const iconsTabRef = useRef<HTMLButtonElement>(null);
  const rawColorTabRef = useRef<HTMLButtonElement>(null);
  const semanticColorTabRef = useRef<HTMLButtonElement>(null);
  const fontFamilyTabRef = useRef<HTMLButtonElement>(null);
  const typographyTabRef = useRef<HTMLButtonElement>(null);
  const spacingMeasureTabRef = useRef<HTMLButtonElement>(null);
  const radiusTabRef = useRef<HTMLButtonElement>(null);
  const fixedSizeTabRef = useRef<HTMLButtonElement>(null);
  const gridColumnsTabRef = useRef<HTMLButtonElement>(null);
  const gridGapTabRef = useRef<HTMLButtonElement>(null);
  const outlineIconTabRef = useRef<HTMLButtonElement>(null);
  const filledIconTabRef = useRef<HTMLButtonElement>(null);

  // 탭 좌우/Home/End 키 이동 (WAI-ARIA tabs 패턴)
  function handleTabKeyDown(e: React.KeyboardEvent) {
    const order: ("color" | "spacing" | "grid" | "type" | "icons")[] = ["color", "type", "spacing", "grid", "icons"];
    const refs = { color: colorTabRef, spacing: spacingTabRef, grid: gridTabRef, type: typeTabRef, icons: iconsTabRef };
    let next: "color" | "spacing" | "grid" | "type" | "icons" | null = null;
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

  function handleColorTabKeyDown(e: React.KeyboardEvent) {
    const order: ("raw" | "semantic")[] = ["raw", "semantic"];
    const refs = { raw: rawColorTabRef, semantic: semanticColorTabRef };
    let next: "raw" | "semantic" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(order.indexOf(activeColorTab) + 1) % order.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(order.indexOf(activeColorTab) - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) {
      e.preventDefault();
      selectColorSection(next);
      refs[next].current?.focus();
    }
  }

  function handleTypeTabKeyDown(e: React.KeyboardEvent) {
    const order: ("font-family" | "typography")[] = ["font-family", "typography"];
    const refs = { "font-family": fontFamilyTabRef, typography: typographyTabRef };
    let next: "font-family" | "typography" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(order.indexOf(activeTypeTab) + 1) % order.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(order.indexOf(activeTypeTab) - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) {
      e.preventDefault();
      selectTypeSection(next);
      refs[next].current?.focus();
    }
  }

  function handleSpacingTabKeyDown(e: React.KeyboardEvent) {
    const order: ("spacing" | "radius" | "fixed-size")[] = ["spacing", "radius", "fixed-size"];
    const refs = { spacing: spacingMeasureTabRef, radius: radiusTabRef, "fixed-size": fixedSizeTabRef };
    let next: "spacing" | "radius" | "fixed-size" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(order.indexOf(activeSpacingTab) + 1) % order.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(order.indexOf(activeSpacingTab) - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) {
      e.preventDefault();
      selectSpacingSection(next);
      refs[next].current?.focus();
    }
  }

  function handleGridTabKeyDown(e: React.KeyboardEvent) {
    const order: ("columns" | "gap")[] = ["columns", "gap"];
    const refs = { columns: gridColumnsTabRef, gap: gridGapTabRef };
    let next: "columns" | "gap" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(order.indexOf(activeGridTab) + 1) % order.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(order.indexOf(activeGridTab) - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) {
      e.preventDefault();
      selectGridSection(next);
      refs[next].current?.focus();
    }
  }

  function handleIconsTabKeyDown(e: React.KeyboardEvent) {
    const order: ("outline" | "filled")[] = ["outline", "filled"];
    const refs = { outline: outlineIconTabRef, filled: filledIconTabRef };
    let next: "outline" | "filled" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(order.indexOf(activeIconsTab) + 1) % order.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(order.indexOf(activeIconsTab) - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) {
      e.preventDefault();
      selectIconsSection(next);
      refs[next].current?.focus();
    }
  }

  const navExternalLinkClass =
    "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-label-md font-semibold text-accent no-underline transition-colors duration-150 hover:bg-gray-100";

  const navSubItemClass = (active: boolean) =>
    [
      "flex w-full items-center justify-between gap-2 text-left rounded-lg border-0 cursor-pointer font-sans text-label-sm leading-base",
      "py-2 px-3 transition-colors duration-150",
      active
        ? "bg-gray-50 text-foreground font-semibold"
        : "bg-transparent text-gray-600 font-medium hover:bg-gray-50 hover:text-foreground",
    ].join(" ");

  const navParentGroupClass = (active: boolean) =>
    ["flex items-center rounded-xl", active ? "bg-green-50" : "bg-transparent"].join(" ");

  const navParentButtonClass = (active: boolean) =>
    [
      "flex min-w-0 flex-1 items-center gap-3 border-0 bg-transparent text-left font-sans text-label-md leading-base",
      "cursor-pointer py-2.5 pl-3.5 pr-1 transition-colors duration-150",
      active ? "font-semibold text-green-600" : "font-medium text-gray-600 hover:text-foreground",
    ].join(" ");

  function selectColorSection(sub: "raw" | "semantic") {
    setActiveTab("color");
    setActiveColorTab(sub);
    setColorMenuExpanded(true);
  }

  function selectTypeSection(sub: "font-family" | "typography") {
    setActiveTab("type");
    setActiveTypeTab(sub);
    setTypeMenuExpanded(true);
  }

  function selectSpacingSection(sub: "spacing" | "radius" | "fixed-size") {
    setActiveTab("spacing");
    setActiveSpacingTab(sub);
    setSpacingMenuExpanded(true);
  }

  function selectGridSection(sub: "columns" | "gap") {
    setActiveTab("grid");
    setActiveGridTab(sub);
    setGridMenuExpanded(true);
  }

  function selectIconsSection(sub: "outline" | "filled") {
    setActiveTab("icons");
    setActiveIconsTab(sub);
    setIconsMenuExpanded(true);
  }

  // 현재 모드(.dark)에서 실제로 계산된 시맨틱 스케일(--color-*) 색을 읽어 둠 → 칩 선택/대비 계산에 사용
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [semanticResolved, setSemanticResolved] = useState<Record<string, string>>({});

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > GUIDE_SCROLL_TOP_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const hexOf = (name: string, scale: number, fallback: string) =>
    resolved[`${name}-${scale}`] || fallback;

  const ratio = contrastRatio(bgColor.hex, textColor.hex);
  const level = getContrastLevel(ratio);

  function handleSwatchClick(hex: string, label: string) {
    if (selecting === "bg") setBgColor({ hex, label });
    else if (selecting === "text") setTextColor({ hex, label });
    setSelecting(null);
  }

  function scrollToPageTop() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  return (
    <ToastProvider>
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

      <div className="min-h-screen font-sans bg-background text-foreground transition-colors duration-300">
        <GuideSiteHeader
          isSidenavOpen={isSidenavOpen}
          onToggleSidenav={() => setIsSidenavOpen((open) => !open)}
        />

        <div className={isSidenavOpen ? "lg:pl-64" : undefined}>
        <nav
          id="guide-sidenav"
          hidden={!isSidenavOpen}
          aria-label="디자인 토큰 가이드"
          className={`${layoutSidenavMenuClass} flex flex-col border-b border-line bg-background py-6 px-4 md:px-6 lg:fixed lg:bottom-0 lg:left-0 lg:z-30 lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:py-10 ${guideHeaderOffsetClass} ${guideHeaderMaxHeightClass}`}
        >
          <p className="mb-2 px-3.5 text-caption font-semibold uppercase tracking-normal text-accent">Tokens</p>
          <div
            role="tablist"
            aria-label="디자인 토큰 카테고리"
            aria-orientation="vertical"
            onKeyDown={handleTabKeyDown}
            className="flex flex-col gap-0.5"
          >
            <div className="flex flex-col gap-0.5">
              <div className={navParentGroupClass(activeTab === "color")}>
                <button
                  ref={colorTabRef}
                  type="button"
                  role="tab"
                  id="tab-color"
                  aria-selected={activeTab === "color"}
                  aria-controls="panel-color"
                  tabIndex={activeTab === "color" ? 0 : -1}
                  onClick={() => {
                    setActiveTab("color");
                    setColorMenuExpanded(true);
                  }}
                  className={navParentButtonClass(activeTab === "color")}
                >
                  {navIconColor}
                  Color
                </button>
                <button
                  type="button"
                  aria-label={colorMenuExpanded ? "Color 하위 메뉴 접기" : "Color 하위 메뉴 펼치기"}
                  aria-expanded={colorMenuExpanded}
                  onClick={() => setColorMenuExpanded((open) => !open)}
                  className="mr-1.5 flex shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1.5 text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-foreground"
                >
                  <NavIcon
                    className={`size-icon-xs shrink-0 transition-transform duration-200 ease-out ${colorMenuExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </NavIcon>
                </button>
              </div>
              {colorMenuExpanded && (
                <NavSubTree
                  ariaLabel="Color 하위 메뉴"
                  itemClassName={navSubItemClass}
                  items={[
                    {
                      label: "Raw Color",
                      active: activeTab === "color" && activeColorTab === "raw",
                      onClick: () => selectColorSection("raw"),
                    },
                    {
                      label: "Semantic Color",
                      active: activeTab === "color" && activeColorTab === "semantic",
                      onClick: () => selectColorSection("semantic"),
                    },
                  ]}
                />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className={navParentGroupClass(activeTab === "type")}>
                <button
                  ref={typeTabRef}
                  type="button"
                  role="tab"
                  id="tab-type"
                  aria-selected={activeTab === "type"}
                  aria-controls="panel-type"
                  tabIndex={activeTab === "type" ? 0 : -1}
                  onClick={() => {
                    setActiveTab("type");
                    setTypeMenuExpanded(true);
                  }}
                  className={navParentButtonClass(activeTab === "type")}
                >
                  {navIconType}
                  Font & Type
                </button>
                <button
                  type="button"
                  aria-label={typeMenuExpanded ? "Font & Type 하위 메뉴 접기" : "Font & Type 하위 메뉴 펼치기"}
                  aria-expanded={typeMenuExpanded}
                  onClick={() => setTypeMenuExpanded((open) => !open)}
                  className="mr-1.5 flex shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1.5 text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-foreground"
                >
                  <NavIcon
                    className={`size-icon-xs shrink-0 transition-transform duration-200 ease-out ${typeMenuExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </NavIcon>
                </button>
              </div>
              {typeMenuExpanded && (
                <NavSubTree
                  ariaLabel="Font & Type 하위 메뉴"
                  itemClassName={navSubItemClass}
                  items={[
                    {
                      label: "Font Family",
                      active: activeTab === "type" && activeTypeTab === "font-family",
                      onClick: () => selectTypeSection("font-family"),
                    },
                    {
                      label: "Type Scale",
                      active: activeTab === "type" && activeTypeTab === "typography",
                      onClick: () => selectTypeSection("typography"),
                    },
                  ]}
                />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className={navParentGroupClass(activeTab === "spacing")}>
                <button
                  ref={spacingTabRef}
                  type="button"
                  role="tab"
                  id="tab-spacing"
                  aria-selected={activeTab === "spacing"}
                  aria-controls="panel-spacing"
                  tabIndex={activeTab === "spacing" ? 0 : -1}
                  onClick={() => {
                    setActiveTab("spacing");
                    setSpacingMenuExpanded(true);
                  }}
                  className={navParentButtonClass(activeTab === "spacing")}
                >
                  {navIconSpacing}
                  Spacing & Size
                </button>
                <button
                  type="button"
                  aria-label={spacingMenuExpanded ? "Spacing & Size 하위 메뉴 접기" : "Spacing & Size 하위 메뉴 펼치기"}
                  aria-expanded={spacingMenuExpanded}
                  onClick={() => setSpacingMenuExpanded((open) => !open)}
                  className="mr-1.5 flex shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1.5 text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-foreground"
                >
                  <NavIcon
                    className={`size-icon-xs shrink-0 transition-transform duration-200 ease-out ${spacingMenuExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </NavIcon>
                </button>
              </div>
              {spacingMenuExpanded && (
                <NavSubTree
                  ariaLabel="Spacing & Size 하위 메뉴"
                  itemClassName={navSubItemClass}
                  items={[
                    {
                      label: "Spacing",
                      active: activeTab === "spacing" && activeSpacingTab === "spacing",
                      onClick: () => selectSpacingSection("spacing"),
                    },
                    {
                      label: "Radius",
                      active: activeTab === "spacing" && activeSpacingTab === "radius",
                      onClick: () => selectSpacingSection("radius"),
                    },
                    {
                      label: "Fixed Size",
                      active: activeTab === "spacing" && activeSpacingTab === "fixed-size",
                      onClick: () => selectSpacingSection("fixed-size"),
                    },
                  ]}
                />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className={navParentGroupClass(activeTab === "grid")}>
                <button
                  ref={gridTabRef}
                  type="button"
                  role="tab"
                  id="tab-grid"
                  aria-selected={activeTab === "grid"}
                  aria-controls="panel-grid"
                  tabIndex={activeTab === "grid" ? 0 : -1}
                  onClick={() => {
                    setActiveTab("grid");
                    setGridMenuExpanded(true);
                  }}
                  className={navParentButtonClass(activeTab === "grid")}
                >
                  {navIconGrid}
                  Grid
                </button>
                <button
                  type="button"
                  aria-label={gridMenuExpanded ? "Grid 하위 메뉴 접기" : "Grid 하위 메뉴 펼치기"}
                  aria-expanded={gridMenuExpanded}
                  onClick={() => setGridMenuExpanded((open) => !open)}
                  className="mr-1.5 flex shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1.5 text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-foreground"
                >
                  <NavIcon
                    className={`size-icon-xs shrink-0 transition-transform duration-200 ease-out ${gridMenuExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </NavIcon>
                </button>
              </div>
              {gridMenuExpanded && (
                <NavSubTree
                  ariaLabel="Grid 하위 메뉴"
                  itemClassName={navSubItemClass}
                  items={[
                    {
                      label: "Columns",
                      active: activeTab === "grid" && activeGridTab === "columns",
                      onClick: () => selectGridSection("columns"),
                    },
                    {
                      label: "Gap",
                      active: activeTab === "grid" && activeGridTab === "gap",
                      onClick: () => selectGridSection("gap"),
                    },
                  ]}
                />
              )}
            </div>

            <div className="mt-5 border-t border-line pt-5">
              <p className="mb-2 px-3.5 text-caption font-semibold uppercase tracking-normal text-accent">Assets</p>
              <div className="flex flex-col gap-0.5">
                <div className={navParentGroupClass(activeTab === "icons")}>
                  <button
                    ref={iconsTabRef}
                    type="button"
                    role="tab"
                    id="tab-icons"
                    aria-selected={activeTab === "icons"}
                    aria-controls="panel-icons"
                    tabIndex={activeTab === "icons" ? 0 : -1}
                    onClick={() => {
                      setActiveTab("icons");
                      setIconsMenuExpanded(true);
                    }}
                    className={navParentButtonClass(activeTab === "icons")}
                  >
                    {navIconAssets}
                    Icons
                  </button>
                  <button
                    type="button"
                    aria-label={iconsMenuExpanded ? "Icons 하위 메뉴 접기" : "Icons 하위 메뉴 펼치기"}
                    aria-expanded={iconsMenuExpanded}
                    onClick={() => setIconsMenuExpanded((open) => !open)}
                    className="mr-1.5 flex shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1.5 text-muted transition-colors duration-150 hover:bg-gray-100 hover:text-foreground"
                  >
                    <NavIcon
                      className={`size-icon-xs shrink-0 transition-transform duration-200 ease-out ${iconsMenuExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </NavIcon>
                  </button>
                </div>
                {iconsMenuExpanded && (
                  <NavSubTree
                    ariaLabel="Icons 하위 메뉴"
                    itemClassName={navSubItemClass}
                    items={[
                      {
                        label: "Outline",
                        active: activeTab === "icons" && activeIconsTab === "outline",
                        onClick: () => selectIconsSection("outline"),
                      },
                      {
                        label: "Filled",
                        active: activeTab === "icons" && activeIconsTab === "filled",
                        onClick: () => selectIconsSection("filled"),
                      },
                    ]}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-line pt-5">
            <p className="mb-2 px-3.5 text-caption font-semibold uppercase tracking-normal text-accent">Layout</p>
            <a
              id="nav-layout-breakpoint"
              href="/guide/responsive"
              target="_blank"
              rel="noopener noreferrer"
              className={navExternalLinkClass}
            >
              {navIconLayout}
              Layout & Breakpoint
              <ExternalLinkIcon className="ml-auto size-icon-xs shrink-0" />
              <span className="sr-only">(새 창에서 열림)</span>
            </a>
          </div>
        </nav>

        <main
          id="main-content"
          className={`${layoutSidenavContentClass} pt-10 pb-6 md:pt-12 md:pb-8 lg:pt-16 lg:pb-10`}
        >
        {/* ── Tab Panel 1: Color ── */}
        <div role="tabpanel" id="panel-color" aria-labelledby="tab-color" hidden={activeTab !== "color"} className={layoutPageColSpanFull}>

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
                가공 전 <strong>원본 팔레트(raw)</strong>입니다. hue family(Red → Rose → Orange → Green → Cyan → Blue → Navy → Gray) 순으로 배열하고, scale(50~900) 그리드와 <strong>White/Black</strong> 앵커를 확인합니다. hex는 <a href="https://www.krds.go.kr/html/site/style/style_02.html" className="font-semibold text-foreground underline underline-offset-2 hover:text-accent">KRDS 색상 가이드</a> 표준형 5~90 단계를 50~900에 매핑한 값입니다. primary·danger 등 시맨틱 역할은 Semantic Color 탭에서 매핑합니다.
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
              className="mb-3 flex items-center justify-between rounded-lg border border-accent bg-surface-subtle py-2.5 px-4 text-label-md font-semibold text-foreground ring-2 ring-accent"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block size-2.5 shrink-0 rounded-full ring-2 ring-accent ring-offset-1"
                  style={{ background: selecting === "bg" ? bgColor.hex : textColor.hex, border: "1px solid var(--ds-border-overlay)" }}
                />
                <span>
                  <strong className="font-bold">{selecting === "bg" ? "배경색" : "텍스트색"}</strong>으로 사용할 컬러를 팔레트에서 클릭하세요
                </span>
              </span>
              <button
                type="button"
                onClick={() => setSelecting(null)}
                aria-label="색상 선택 취소"
                className="inline-flex size-control-sm cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-muted transition-colors hover:bg-gray-100 hover:text-foreground"
              >
                <NavIcon innerMarkup={contrastPickCloseIcon} className="size-icon-xs shrink-0" />
              </button>
            </div>
          )}

          <div role="group" aria-label="색상 팔레트" className="flex flex-col gap-2">
            {/* 스케일 헤더 */}
            <div aria-hidden="true" className="grid gap-1 mb-1" style={{ gridTemplateColumns: "80px repeat(10, 1fr)" }}>
              <span className="text-caption text-gray-500">Family</span>
              {scales.map((s) => (
                <span key={s} className="text-caption text-gray-500 text-center">{s}</span>
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
                  return isInteractive ? (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => handleSwatchClick(currentHex, label)}
                      aria-label={labelText}
                      aria-pressed={isBg || isText}
                      className={contrastSwatchClass(isBg, isText, true)}
                      style={{ backgroundColor: cssVar }}
                    >
                      {isBg && <ContrastSwatchRoleMarker role="BG" />}
                      {isText && <ContrastSwatchRoleMarker role="TXT" />}
                    </button>
                  ) : (
                    <div
                      key={scale}
                      aria-hidden="true"
                      className={contrastSwatchClass(isBg, isText, false)}
                      style={{ backgroundColor: cssVar }}
                    >
                      {isBg && <ContrastSwatchRoleMarker role="BG" />}
                      {isText && <ContrastSwatchRoleMarker role="TXT" />}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* 스케일 팔레트와 구분 — 앵커는 스케일(50~900)과 무관 */}
            <div aria-hidden="true" className="mt-2 pt-2 border-t border-dashed border-line" />

            {/* Surface 앵커 — White / Black 각자 한 행(모드 무관 고정값, 스케일 없음) */}
            {surfaceAnchors.map(({ label, hex, cssVar }) => {
              const isBg = bgColor.hex === hex;
              const isText = textColor.hex === hex;
              const isInteractive = !!selecting;
              return (
                <div key={label} className="grid gap-1 items-center" style={{ gridTemplateColumns: "80px repeat(10, 1fr)" }}>
                  <span className="text-label-sm font-semibold">{label}</span>
                  {isInteractive ? (
                    <button
                      type="button"
                      onClick={() => handleSwatchClick(hex, label)}
                      aria-label={`${label} (${hex}) — ${selecting === "bg" ? "배경색으로 선택" : "텍스트색으로 선택"}`}
                      aria-pressed={isBg || isText}
                      className={contrastSwatchClass(isBg, isText, true, "col-start-2")}
                      style={{ backgroundColor: cssVar }}
                    >
                      {isBg && <ContrastSwatchRoleMarker role="BG" />}
                      {isText && <ContrastSwatchRoleMarker role="TXT" />}
                    </button>
                  ) : (
                    <div
                      aria-hidden="true"
                      className={contrastSwatchClass(isBg, isText, false, "col-start-2")}
                      style={{ backgroundColor: cssVar }}
                    >
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
              swatchHex={bgColor.hex}
              colorLabel={bgColor.label}
              colorHex={bgColor.hex}
              isSelecting={selecting === "bg"}
              onToggle={() => setSelecting(selecting === "bg" ? null : "bg")}
            />
            <ContrastColorPickButton
              labelId="label-text"
              labelText="Text"
              valueId="text-color-value"
              swatchHex={textColor.hex}
              colorLabel={textColor.label}
              colorHex={textColor.hex}
              isSelecting={selecting === "text"}
              onToggle={() => setSelecting(selecting === "text" ? null : "text")}
            />
          </div>

          {/* 결과 — 미리보기(선택 배경색 위) + 명암비 카드 */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 grid lg:grid-cols-[1.4fr_1fr]">
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
              className="bg-background p-6 md:p-7 flex flex-col gap-5 border-t lg:border-t-0 lg:border-l border-gray-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-label-md font-bold m-0">명암비</p>
                  <LevelBadge level={level} />
                </div>
                <output className={`block py-5 text-center text-foreground ${contrastResultSurfaceClass}`}>
                  <span className="font-bold leading-none numeric-tabular" style={{ fontSize: pxToRem(40) }}>
                    {ratio}<span className="font-normal text-gray-600" style={{ fontSize: pxToRem(18) }}> : 1</span>
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
              <div aria-hidden="true" className="grid gap-1" style={{ gridTemplateColumns: "80px repeat(10, 1fr)" }}>
                <span className="text-caption text-gray-500" />
                {scales.map((s) => (
                  <span key={s} className="text-caption text-gray-500 text-center">{s}</span>
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
              ))}
            </div>
            <div role="list" aria-label="대비율 등급 범례" className="flex gap-3 mt-3 flex-wrap">
              {(Object.entries(levelStyle) as [ContrastLevel, typeof levelStyle[ContrastLevel]][]).map(([lv, s]) => (
                <div key={lv} role="listitem" className="flex items-center gap-1.5">
                  <div aria-hidden="true" className="w-3 h-3 rounded-[3px]" style={{ background: s.bg }} />
                  <span className="text-caption text-gray-500">
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
                      token={token.token}
                      utility={token.utility}
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
                  token={group.label}
                  utility={group.utility}
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
            <SemanticColorGroupGrid label="gradient">
              {semanticGradientCatalog.tokens.map(({ label, utility, desc }) => (
                <SemanticGradientSwatchCard key={label} token={label} utility={utility} desc={desc} />
              ))}
            </SemanticColorGroupGrid>
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
                    token={token.token}
                    utility={token.utility}
                    color={semanticResolved[token.cssVar] ?? "—"}
                  />
                ))}
              </SemanticColorGroupGrid>
            ))}
          </SemanticColorCategorySection>
        </GuideContentLayout>
        </div>{/* /panel-color-semantic */}

        </div>{/* /panel-color */}

        {/* ── Tab Panel: Spacing & Size ── */}
        <div role="tabpanel" id="panel-spacing" aria-labelledby="tab-spacing" hidden={activeTab !== "spacing"} className={layoutPageColSpanFull}>
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

        </div>{/* /panel-spacing */}

        {/* ── Tab Panel: Grid ── */}
        <div role="tabpanel" id="panel-grid" aria-labelledby="tab-grid" hidden={activeTab !== "grid"} className={layoutPageColSpanFull}>
          <ContentIntroShell>
          <ContentTitleBlock
            title="Grid"
            titleId="content-grid"
          />

          <ContentOutlineTabList
            ariaLabel="Grid 카테고리"
            activeValue={activeGridTab}
            onSelect={(value) => selectGridSection(value as "columns" | "gap")}
            onKeyDown={handleGridTabKeyDown}
            tabs={[
              { value: "columns", tabId: "tab-grid-columns", panelId: "panel-grid-columns", label: "Columns", ref: gridColumnsTabRef },
              { value: "gap", tabId: "tab-grid-gap", panelId: "panel-grid-gap", label: "Gap", ref: gridGapTabRef },
            ]}
          />

          </ContentIntroShell>

          <div role="tabpanel" id="panel-grid-columns" aria-labelledby="tab-grid-columns" hidden={activeGridTab !== "columns"} className={contentSubTabPanelClass}>
          <section aria-labelledby="section-grid-columns" className="mb-0">
            <ContentSectionTitle
              id="section-grid-columns"
              lead
              description={
                <>
                  Tailwind 기본 <strong>grid-cols-*</strong> 열 분할. <strong>12열</strong> 그리드는 <strong>col-span-*</strong>와 조합해 페이지 레이아웃을 구성합니다.{" "}
                  <strong>shell·breakpoint</strong> 검증은 사이드메뉴{" "}
                  <a href="#nav-layout-breakpoint">Layout & Breakpoint</a>
                  {" "}가이드를 참고하세요.
                </>
              }
            >
              Columns
            </ContentSectionTitle>
            <div role="list" className="grid grid-cols-2 gap-4">
              {gridColumnTokens.map(({ name, cols, utility, desc }) => (
                <div key={name} role="listitem" className="p-4 rounded-xl border border-line">
                  <p className="m-0 text-label-sm font-semibold">{name}</p>
                  <p className="mt-0.5 mb-3 text-caption text-muted">{desc}</p>
                  <GridColumnPreview cols={cols} utility={utility} label={`${name} ${cols}열 그리드 견본`} />
                </div>
              ))}
            </div>
          </section>
          </div>{/* /panel-grid-columns */}

          <div role="tabpanel" id="panel-grid-gap" aria-labelledby="tab-grid-gap" hidden={activeGridTab !== "gap"} className={contentSubTabPanelClass}>
          <section aria-labelledby="section-grid-gap" className="mb-0">
            <ContentSectionTitle
              id="section-grid-gap"
              lead
              description={
                <>
                  <strong>그리드 간격(gap)</strong>은 item 사이 margin 역할입니다. <strong>gap-*</strong>는 좌우·상하에 동일하게 적용되며, 아래 스케일에서 크기별 견본을 한눈에 비교할 수 있습니다.
                </>
              }
            >
              Gap
            </ContentSectionTitle>
            <GridGapCuration />
          </section>
          </div>{/* /panel-grid-gap */}

        </div>{/* /panel-grid */}

        {/* ── Tab Panel: Font & Type ── */}
        <div role="tabpanel" id="panel-type" aria-labelledby="tab-type" hidden={activeTab !== "type"} className={layoutPageColSpanFull}>

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
            { value: "font-family", tabId: "tab-type-font-family", panelId: "panel-type-font-family", label: "Font Family", ref: fontFamilyTabRef },
            { value: "typography", tabId: "tab-type-typography", panelId: "panel-type-typography", label: "Type Scale", ref: typographyTabRef },
          ]}
        />

        </ContentIntroShell>

        <div role="tabpanel" id="panel-type-font-family" aria-labelledby="tab-type-font-family" hidden={activeTypeTab !== "font-family"} className={contentSubTabPanelClass}>
        <GuideContentLayout sections={fontFamilyTocSections}>
        <section aria-labelledby="section-font-family" className="mb-0">
          <FontStackCuration />

          {/* Pretendard GOV */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="py-3 px-10 bg-gray-50 border-b border-gray-200">
              <h4 className="m-0 text-label-xl font-semibold text-foreground">Pretendard GOV</h4>
              <p className="m-0 mt-1 text-caption text-muted">기본 폰트 · 1순위</p>
            </div>
            <div className="py-12 px-10 bg-gray-50 border-b border-gray-200 flex flex-col gap-1">
              <span role="img" aria-label="Pretendard GOV 글꼴 견본" className="block font-bold leading-base" style={{ fontSize: pxToRem(48), fontFamily: "var(--font-pretendard-gov), sans-serif" }}>Pretendard GOV</span>
              <span role="img" aria-label="한글 견본" className="block font-normal leading-base" style={{ fontSize: pxToRem(24), fontFamily: "var(--font-pretendard-gov), sans-serif" }}>
                가나다라마바사아자차카타파하 — ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </span>
              <span role="img" aria-label="영문·숫자·특수문자 견본" className="block font-normal leading-base text-gray-500" style={{ fontSize: pxToRem(18), fontFamily: "var(--font-pretendard-gov), sans-serif" }}>
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
                    <dt className="text-caption text-gray-400 font-semibold tracking-normal uppercase">{label}</dt>
                    <dd className="text-body-sm mt-0.5 ml-0">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-caption text-gray-400 font-semibold tracking-normal uppercase mb-0.5">공식 GitHub</p>
                  <a href="https://github.com/orioncactus/pretendard" target="_blank" rel="noopener noreferrer" className="text-body-sm text-green-500 break-all">
                    github.com/orioncactus/pretendard
                    <span className="sr-only">(새 창에서 열림)</span>
                  </a>
                </div>
                <div>
                  <p className="text-caption text-gray-400 font-semibold tracking-normal uppercase mb-0.5">원본 다운로드</p>
                  <a href="https://github.com/orioncactus/pretendard/releases/tag/v1.3.9" target="_blank" rel="noopener noreferrer" className="text-body-sm text-green-500 break-all">
                    github.com/orioncactus/pretendard/releases/tag/v1.3.9
                    <span className="sr-only">(새 창에서 열림)</span>
                  </a>
                  <p className="mt-1 text-caption text-gray-400">Assets → pretendard-gov.zip 다운로드</p>
                </div>
                <div>
                  <p className="text-caption text-gray-400 font-semibold tracking-normal uppercase mb-1">이 프로젝트 적용 방식</p>
                  <p className="mb-2 text-caption text-gray-400">자체 호스팅 — next/font/local (런타임 외부 요청 0). variable woff2를 src/app/fonts에 보관.</p>
                  <pre className="m-0 py-3 px-4 rounded-lg bg-gray-100 text-caption text-gray-700 border border-gray-200 break-all whitespace-pre-wrap">
                    <code>{`localFont({ src: "./fonts/PretendardGOVVariable.woff2", weight: "100 900", variable: "--font-pretendard-gov" })`}</code>
                  </pre>
                </div>
                <div>
                  <p className="text-caption text-gray-400 font-semibold tracking-normal uppercase mb-1">GOV 버전 특징</p>
                  <ul className="m-0 pl-4 flex flex-col gap-1">
                    {["공공기관·정부 웹사이트 최적화", "한국 웹 접근성 지침(KWCAG) 대응", "완성형 한글 11,172자 전체 지원", "다양한 weight 지원 (100–900)"].map((item) => (
                      <li key={item} className="text-caption text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="py-6 px-10 border-t border-gray-200 flex flex-col gap-3">
              <p className="text-caption text-gray-400 font-semibold tracking-normal uppercase m-0">Weight</p>
              <div className="grid grid-cols-5 gap-4">
                {[{ weight: 100, label: "Thin" }, { weight: 300, label: "Light" }, { weight: 400, label: "Regular" }, { weight: 600, label: "SemiBold" }, { weight: 700, label: "Bold" }].map(({ weight, label }) => (
                  <div key={weight} className="flex flex-col gap-0.5">
                    <span role="img" aria-label={`${weight} ${label} 견본`} className="leading-base" style={{ fontSize: pxToRem(24), fontWeight: weight, fontFamily: "var(--font-pretendard-gov), sans-serif" }}>가나다 Aa</span>
                    <span className="text-caption text-gray-400">{weight} · {label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Noto Sans KR */}
          <div className="mt-8 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="py-3 px-10 bg-gray-50 border-b border-gray-200">
              <h4 className="m-0 text-label-xl font-semibold text-foreground">Noto Sans KR</h4>
              <p className="m-0 mt-1 text-caption text-muted">폴백 폰트 · 2순위 · Pretendard 미로드 시 로드</p>
            </div>
            <div className="py-12 px-10 bg-gray-50 border-b border-gray-200 flex flex-col gap-1">
              <span role="img" aria-label="Noto Sans KR 글꼴 견본" className="block font-bold leading-base" style={{ fontSize: pxToRem(48), fontFamily: "var(--font-noto), sans-serif" }}>Noto Sans KR</span>
              <span role="img" aria-label="한글 견본" className="block font-normal leading-base" style={{ fontSize: pxToRem(24), fontFamily: "var(--font-noto), sans-serif" }}>
                가나다라마바사아자차카타파하 — ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </span>
              <span role="img" aria-label="영문·숫자·특수문자 견본" className="block font-normal leading-base text-gray-500" style={{ fontSize: pxToRem(18), fontFamily: "var(--font-noto), sans-serif" }}>
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
                    <dt className="text-caption text-gray-400 font-semibold tracking-normal uppercase">{label}</dt>
                    <dd className="text-body-sm mt-0.5 ml-0">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-caption text-gray-400 font-semibold tracking-normal uppercase mb-0.5">공식 페이지</p>
                  <a href="https://fonts.google.com/noto/specimen/Noto+Sans+KR" target="_blank" rel="noopener noreferrer" className="text-body-sm text-green-500 break-all">
                    fonts.google.com/noto/specimen/Noto+Sans+KR
                    <span className="sr-only">(새 창에서 열림)</span>
                  </a>
                </div>
                <div>
                  <p className="text-caption text-gray-400 font-semibold tracking-normal uppercase mb-0.5">원본 저장소</p>
                  <a href="https://github.com/notofonts/noto-cjk" target="_blank" rel="noopener noreferrer" className="text-body-sm text-green-500 break-all">
                    github.com/notofonts/noto-cjk
                    <span className="sr-only">(새 창에서 열림)</span>
                  </a>
                  <p className="mt-1 text-caption text-gray-400">한글 static woff2를 src/app/fonts에 self-host</p>
                </div>
                <div>
                  <p className="text-caption text-gray-400 font-semibold tracking-normal uppercase mb-1">이 프로젝트 적용 방식</p>
                  <p className="mb-2 text-caption text-gray-400">자체 호스팅 — next/font/local. <code className="font-mono">preload: false</code>로 평상시 다운로드를 막고, Pretendard 미로드 시에만 브라우저가 폴백으로 로드합니다.</p>
                  <pre className="m-0 py-3 px-4 rounded-lg bg-gray-100 text-caption text-gray-700 border border-gray-200 break-all whitespace-pre-wrap">
                    <code>{`localFont({
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
})`}</code>
                  </pre>
                </div>
                <div>
                  <p className="text-caption text-gray-400 font-semibold tracking-normal uppercase mb-1">폴백 적용 시 유의사항</p>
                  <ul className="m-0 pl-4 flex flex-col gap-1">
                    {[
                      "next/font/google 사용 불가 — Google 메타데이터에 complete Korean subset이 없어 한글 글리프 누락",
                      "반드시 로컬 woff2 self-host로 한글 글리프 보장",
                      "font-synthesis-weight: none — 미제공 weight는 브라우저가 합성하지 않으므로 타이포 토큰(400·500·600·700) weight 파일 필요",
                      "런타임 CDN 요청 없음 — 공공·폐쇄망·CSP 환경 대응",
                      "Pretendard 로드 실패 시에만 네트워크·용량 비용 발생",
                    ].map((item) => (
                      <li key={item} className="text-caption text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="py-6 px-10 border-t border-gray-200 flex flex-col gap-3">
              <p className="text-caption text-gray-400 font-semibold tracking-normal uppercase m-0">Weight</p>
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
                    <span className="text-caption text-gray-400">{weight} · {label}</span>
                  </div>
                ))}
              </div>
              <p className="m-0 text-caption text-muted">
                타이포 토큰의 <span className="font-mono">font-medium(500)</span>·<span className="font-mono">font-semibold(600)</span>도 self-host 파일로 제공합니다. Pretendard는 variable(100–900), Noto는 동일 구간을 static weight로 대응합니다.
              </p>
            </div>
          </div>
        </section>

        </GuideContentLayout>
        </div>{/* /panel-type-font-family */}

        <div role="tabpanel" id="panel-type-typography" aria-labelledby="tab-type-typography" hidden={activeTypeTab !== "typography"} className={contentSubTabPanelClass}>
        <GuideContentLayout sections={typographyTocSections}>
        <section aria-labelledby="section-typography-scale" className="mb-0">
          <ContentSectionTitle
            id="section-typography-scale"
            lead
            description={
              <>
                역할별 타이포 스케일과 <strong>typo-*</strong> 묶음 유틸리티를 확인합니다.
              </>
            }
          >
            Type Scale
          </ContentSectionTitle>
          <TypographyScaleTable />
          <TypographyExampleOfUse />
        </section>

        </GuideContentLayout>
        </div>{/* /panel-type-typography */}

        </div>{/* /panel-type */}

        {/* ── Tab Panel: Icons ── */}
        <div role="tabpanel" id="panel-icons" aria-labelledby="tab-icons" hidden={activeTab !== "icons"} className={layoutPageColSpanFull}>
          <ContentIntroShell>
          <ContentTitleBlock
            title="Icons"
            titleId="content-icons"
          />

          <ContentOutlineTabList
            ariaLabel="아이콘 스타일"
            activeValue={activeIconsTab}
            onSelect={(value) => selectIconsSection(value as "outline" | "filled")}
            onKeyDown={handleIconsTabKeyDown}
            tabs={[
              { value: "outline", tabId: "tab-icons-outline", panelId: "panel-icons-outline", label: "Outline", ref: outlineIconTabRef },
              { value: "filled", tabId: "tab-icons-filled", panelId: "panel-icons-filled", label: "Filled", ref: filledIconTabRef },
            ]}
          />

          </ContentIntroShell>

          <div role="tabpanel" id="panel-icons-outline" aria-labelledby="tab-icons-outline" hidden={activeIconsTab !== "outline"} className={contentSubTabPanelClass}>
            <GuideContentLayout sections={outlineIconsTocSections}>
              <IconStyleCuration style="outline" />
            </GuideContentLayout>
          </div>

          <div role="tabpanel" id="panel-icons-filled" aria-labelledby="tab-icons-filled" hidden={activeIconsTab !== "filled"} className={contentSubTabPanelClass}>
            <GuideContentLayout sections={filledIconsTocSections}>
              <IconStyleCuration style="filled" />
            </GuideContentLayout>
          </div>
        </div>{/* /panel-icons */}

        </main>
        </div>
      </div>

        {/* 우하단 FAB — 맨 위로·모드 토글. DOM 마지막에 두어 콘텐츠 뒤에 포커스 */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
          {showScrollTop ? (
            <button
              type="button"
              onClick={scrollToPageTop}
              aria-label="맨 위로 스크롤"
              className={guideFabSurfaceClass}
            >
              {scrollToTopIcon}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            aria-pressed={isDark}
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className={guideFabAccentClass}
          >
            {isDark ? themeIconSun : themeIconMoon}
          </button>
        </div>
    </>
    </ToastProvider>
  );
}
