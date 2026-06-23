"use client";

import Link from "next/link";
import { useState, useEffect, useRef, createContext, useContext, useCallback, useId } from "react";
import { contrastRatio, getContrastLevel, type ContrastLevel } from "@/lib/contrast";
import { GUIDE_ROUTES } from "@/lib/guide-routes";
import {
  guideHeaderPaddingClass,
  layoutPageColSpanFull,
  layoutSidenavContentClass,
  layoutSidenavMenuClass,
} from "@/lib/layout-tokens";
import { REM_BASE, pxToRem } from "@/lib/tokens";
import { RAW_COLOR_SCALE_UNITS, primitiveColors } from "@/lib/raw-color-palettes";
import {
  applyColorModeClass,
  readStoredColorMode,
  writeStoredColorMode,
} from "@/lib/theme-preference";


// 배경 앵커 — 중립 램프 밖 순백/심흑(모드 무관 고정)
export const backgroundAnchors = [
  { label: "White", hex: "#ffffff", cssVar: "var(--raw-white)" },
  { label: "Black", hex: "#0a0a0a", cssVar: "var(--raw-black)" },
];

// 시맨틱 오버레이 — 모드 인지 반투명(라이트=검정α / 다크=흰색α)
const overlayTokens = [
  {
    label: "overlay-subtle",
    utility: "overlay-subtle",
    cssVar: "--color-overlay-subtle",
    rawVarLight: "--raw-black-a5",
    rawVarDark: "--raw-white-a5",
    light: "rgba(0, 0, 0, 0.05)",
    dark: "rgba(255, 255, 255, 0.05)",
    rawOnly: false,
  },
  {
    label: "overlay-a8",
    utility: "",
    cssVar: "",
    rawVarLight: "--raw-black-a8",
    rawVarDark: "--raw-white-a8",
    light: "rgba(0, 0, 0, 0.08)",
    dark: "rgba(255, 255, 255, 0.08)",
    rawOnly: true,
  },
  {
    label: "overlay-default",
    utility: "overlay-default",
    cssVar: "--color-overlay",
    rawVarLight: "--raw-black-a10",
    rawVarDark: "--raw-white-a10",
    light: "rgba(0, 0, 0, 0.10)",
    dark: "rgba(255, 255, 255, 0.10)",
    rawOnly: false,
  },
  {
    label: "overlay-a12",
    utility: "",
    cssVar: "",
    rawVarLight: "--raw-black-a12",
    rawVarDark: "--raw-white-a12",
    light: "rgba(0, 0, 0, 0.12)",
    dark: "rgba(255, 255, 255, 0.12)",
    rawOnly: true,
  },
  {
    label: "overlay-strong",
    utility: "overlay-strong",
    cssVar: "--color-overlay-strong",
    rawVarLight: "--raw-black-a20",
    rawVarDark: "--raw-white-a20",
    light: "rgba(0, 0, 0, 0.20)",
    dark: "rgba(255, 255, 255, 0.20)",
    rawOnly: false,
  },
];

const gradientTokens = [
  {
    label: "gradient-brand",
    utility: "gradient-brand",
    dsVar: "--ds-gradient-brand",
    rawVar: "--raw-violet-20 → --raw-violet-40 → --raw-violet-50",
    rawVarDark: "--raw-violet-80 → --raw-violet-60 → --raw-violet-50",
    value: "linear-gradient(135deg, violet-20 0%, violet-40 48%, violet-50 100%)",
    valueDark: "linear-gradient(135deg, violet-80 0%, violet-60 48%, violet-50 100%)",
  },
];

export type SemanticGradientTokenDef = {
  label: string;
  utility: string;
  dsVar: string;
  rawVar: string;
  rawVarDark?: string;
  value: string;
  valueDark?: string;
};

export type SemanticGradientGroupDef = {
  id: string;
  label: string;
  gradients: SemanticGradientTokenDef[];
};

export type SemanticColorReadMode = "text" | "bg" | "border" | "outline";

export type SemanticColorTokenDef = {
  token: string;
  utility: string;
  cssVar: string;
  readAs: SemanticColorReadMode;
  /** 라이트 모드 기준 TIER 1 raw 변수 — 스와치 카드 2행 표시용 */
  rawVar: string;
  /** 다크 모드 기준 raw(또는 ds→raw 반사 결과) — brand 등 용도 재매핑 토큰용 */
  rawVarDark?: string;
};

export type SemanticColorGroupDef = {
  id: string;
  label: string;
  tokens: SemanticColorTokenDef[];
};

export type SemanticColorCategoryDef = {
  id: string;
  title: string;
  description: React.ReactNode;
  groups: SemanticColorGroupDef[];
};

export const semanticColorCatalog: SemanticColorCategoryDef[] = [
  {
    id: "semantic-background",
    title: "Background",
    description: (
      <>
        화면의 가장 바닥 면을 뜻하는 <strong>배경(background)</strong> 색상입니다. 페이지 전체 Layout·최상위 캔버스에는 <strong>bg-background</strong>를 사용합니다.
      </>
    ),
    groups: [
      {
        id: "neutral",
        label: "neutral",
        tokens: [
          { token: "background", utility: "bg-background", cssVar: "--color-background", readAs: "bg", rawVar: "--raw-white", rawVarDark: "--raw-black" },
        ],
      },
    ],
  },
  {
    id: "semantic-surface",
    title: "Surface",
    description: (
      <>
        카드·패널·선택 상태처럼 컴포넌트에 올라오는 <strong>표면(surface)</strong> 색상입니다. 컴포넌트 면에는 <strong>surface-*</strong>를 사용합니다.
      </>
    ),
    groups: [
      {
        id: "brand",
        label: "brand",
        tokens: [
          { token: "surface-brand-faint", utility: "surface-brand-faint", cssVar: "--color-surface-brand-faint", readAs: "bg", rawVar: "--raw-violet-5", rawVarDark: "--raw-violet-80" },
          { token: "surface-brand-subtle", utility: "surface-brand-subtle", cssVar: "--color-surface-brand-subtle", readAs: "bg", rawVar: "--raw-violet-10", rawVarDark: "--raw-violet-70" },
          { token: "surface-brand", utility: "surface-brand", cssVar: "--color-surface-brand", readAs: "bg", rawVar: "--raw-violet-50", rawVarDark: "--raw-violet-30" },
          { token: "surface-brand-strong", utility: "surface-brand-strong", cssVar: "--color-surface-brand-strong", readAs: "bg", rawVar: "--raw-violet-60", rawVarDark: "--raw-violet-20" },
        ],
      },
      {
        id: "neutral",
        label: "neutral",
        tokens: [
          { token: "surface-default", utility: "surface-default", cssVar: "--color-surface-default", readAs: "bg", rawVar: "--raw-gray-0", rawVarDark: "--raw-gray-95" },
          { token: "surface-subtle", utility: "surface-subtle", cssVar: "--color-surface-subtle", readAs: "bg", rawVar: "--raw-gray-5", rawVarDark: "--raw-gray-90" },
          { token: "surface-strong", utility: "surface-strong", cssVar: "--color-surface-strong", readAs: "bg", rawVar: "--raw-gray-10", rawVarDark: "--raw-gray-80" },
        ],
      },
      {
        id: "status",
        label: "status",
        tokens: [
          { token: "surface-negative", utility: "surface-negative", cssVar: "--color-surface-negative", readAs: "bg", rawVar: "--raw-red-5", rawVarDark: "--raw-red-80" },
          { token: "surface-attention", utility: "surface-attention", cssVar: "--color-surface-attention", readAs: "bg", rawVar: "--raw-orange-5", rawVarDark: "--raw-orange-80" },
          { token: "surface-positive", utility: "surface-positive", cssVar: "--color-surface-positive", readAs: "bg", rawVar: "--raw-green-5", rawVarDark: "--raw-green-80" },
          { token: "surface-info", utility: "surface-info", cssVar: "--color-surface-info", readAs: "bg", rawVar: "--raw-blue-5", rawVarDark: "--raw-blue-80" },
          { token: "surface-disabled", utility: "surface-disabled", cssVar: "--color-surface-disabled", readAs: "bg", rawVar: "--raw-gray-5", rawVarDark: "--raw-gray-90" },
        ],
      },
    ],
  },
  {
    id: "semantic-foreground",
    title: "Foreground",
    description: <>텍스트와 아이콘에 쓰는 <strong>전경(foreground)</strong> 색상입니다. 아이콘은 currentColor를 상속하므로 <strong>foreground-*</strong> 유틸리티로 함께 적용합니다.</>,
    groups: [
      {
        id: "brand",
        label: "brand",
        tokens: [
          { token: "foreground-brand", utility: "foreground-brand", cssVar: "--color-foreground-brand", readAs: "text", rawVar: "--raw-violet-50", rawVarDark: "--raw-violet-30" },
          { token: "foreground-brand-subtle", utility: "foreground-brand-subtle", cssVar: "--color-foreground-brand-subtle", readAs: "text", rawVar: "--raw-violet-40", rawVarDark: "--raw-violet-50" },
          { token: "foreground-brand-strong", utility: "foreground-brand-strong", cssVar: "--color-foreground-brand-strong", readAs: "text", rawVar: "--raw-violet-60", rawVarDark: "--raw-violet-20" },
        ],
      },
      {
        id: "neutral",
        label: "neutral",
        tokens: [
          { token: "foreground-default", utility: "foreground-default", cssVar: "--color-foreground-default", readAs: "text", rawVar: "--raw-gray-90", rawVarDark: "--raw-gray-10" },
          { token: "foreground-subtle", utility: "foreground-subtle", cssVar: "--color-foreground-subtle", readAs: "text", rawVar: "--raw-gray-70", rawVarDark: "--raw-gray-30" },
          { token: "foreground-muted", utility: "foreground-muted", cssVar: "--color-foreground-muted", readAs: "text", rawVar: "--raw-gray-40", rawVarDark: "--raw-gray-60" },
          { token: "foreground-inverse", utility: "foreground-inverse", cssVar: "--color-foreground-inverse", readAs: "text", rawVar: "--raw-white", rawVarDark: "--raw-black" },
        ],
      },
      {
        id: "status",
        label: "status",
        tokens: [
          { token: "foreground-required", utility: "foreground-required", cssVar: "--color-foreground-required", readAs: "text", rawVar: "--raw-red-50", rawVarDark: "--raw-red-30" },
          { token: "foreground-negative", utility: "foreground-negative", cssVar: "--color-foreground-negative", readAs: "text", rawVar: "--raw-red-50", rawVarDark: "--raw-red-30" },
          { token: "foreground-attention", utility: "foreground-attention", cssVar: "--color-foreground-attention", readAs: "text", rawVar: "--raw-orange-50", rawVarDark: "--raw-orange-30" },
          { token: "foreground-positive", utility: "foreground-positive", cssVar: "--color-foreground-positive", readAs: "text", rawVar: "--raw-green-50", rawVarDark: "--raw-green-30" },
          { token: "foreground-info", utility: "foreground-info", cssVar: "--color-foreground-info", readAs: "text", rawVar: "--raw-blue-50", rawVarDark: "--raw-blue-30" },
          { token: "foreground-disabled", utility: "foreground-disabled", cssVar: "--color-foreground-disabled", readAs: "text", rawVar: "--raw-gray-30", rawVarDark: "--raw-gray-70" },
        ],
      },
    ],
  },
  {
    id: "semantic-border",
    title: "Border",
    description: (
      <>
        구분선·컨트롤·칩의 <strong>경계선(border)</strong> 색상입니다. 구조 경계와 상태 경계를 <strong>border-*</strong> 유틸리티로 구분합니다.
      </>
    ),
    groups: [
      {
        id: "brand",
        label: "brand",
        tokens: [
          { token: "brand", utility: "border-brand", cssVar: "--color-brand", readAs: "border", rawVar: "--raw-violet-40", rawVarDark: "--raw-violet-30" },
        ],
      },
      {
        id: "neutral",
        label: "neutral",
        tokens: [
          { token: "default", utility: "border-default", cssVar: "--color-default", readAs: "border", rawVar: "--raw-gray-20", rawVarDark: "--raw-gray-80" },
          { token: "subtle", utility: "border-subtle", cssVar: "--color-subtle", readAs: "border", rawVar: "--raw-black-a10", rawVarDark: "--raw-white-a10" },
          { token: "strong", utility: "border-strong", cssVar: "--color-strong", readAs: "border", rawVar: "--raw-gray-30", rawVarDark: "--raw-gray-70" },
        ],
      },
      {
        id: "status",
        label: "status",
        tokens: [
          { token: "negative", utility: "border-negative", cssVar: "--color-negative", readAs: "border", rawVar: "--raw-red-50", rawVarDark: "--raw-red-30" },
          { token: "attention", utility: "border-attention", cssVar: "--color-attention", readAs: "border", rawVar: "--raw-orange-50", rawVarDark: "--raw-orange-30" },
          { token: "positive", utility: "border-positive", cssVar: "--color-positive", readAs: "border", rawVar: "--raw-green-50", rawVarDark: "--raw-green-30" },
          { token: "info", utility: "border-info", cssVar: "--color-info", readAs: "border", rawVar: "--raw-blue-50", rawVarDark: "--raw-blue-30" },
          { token: "disabled", utility: "border-disabled", cssVar: "--color-disabled", readAs: "border", rawVar: "--raw-gray-10", rawVarDark: "--raw-gray-90" },
        ],
      },
    ],
  },
];

export const semanticUtilityCatalog: SemanticColorCategoryDef = {
  id: "semantic-utility",
  title: "Utility",
  description: (
    <>
      컴포넌트 의미색과 분리된 <strong>유틸리티 전용</strong> 색상입니다. focus-ring·scroll처럼 단일 목적 토큰을 <strong>utility-*</strong> 슬러그로 관리합니다.
    </>
  ),
  groups: [
    {
      id: "focus-ring",
      label: "focus-ring",
      tokens: [
        {
          token: "utility-focus-ring",
          utility: "utility-focus-ring",
          cssVar: "--color-utility-focus-ring",
          readAs: "outline",
          rawVar: "--raw-teal-50",
          rawVarDark: "--raw-orange-30",
        },
      ],
    },
    {
      id: "scroll",
      label: "scroll",
      tokens: [
        {
          token: "utility-scroll-thumb",
          utility: "utility-scroll-thumb",
          cssVar: "--color-utility-scroll-thumb",
          readAs: "bg",
          rawVar: "--raw-gray-30",
          rawVarDark: "--raw-gray-70",
        },
        {
          token: "utility-scroll-track",
          utility: "utility-scroll-track",
          cssVar: "--color-utility-scroll-track",
          readAs: "bg",
          rawVar: "--raw-gray-10",
          rawVarDark: "--raw-gray-90",
        },
      ],
    },
  ],
};

export const semanticOverlayCatalog = {
  id: "semantic-overlay",
  title: "Overlay",
  description: (
    <>
      오버레이에 쓰는 반투명 토큰입니다. 라이트는 <strong>검정 alpha</strong>, 다크는 <strong>흰색 alpha</strong>로 전환되어 아래 콘텐츠를 어둡히거나 밝힙니다.
    </>
  ),
  tokens: overlayTokens
    .filter(({ rawOnly }) => !rawOnly)
    .map(({ label, utility, cssVar, rawVarLight, rawVarDark, light, dark }) => ({
      id: label,
      label,
      utility,
      cssVar,
      rawVarLight,
      rawVarDark,
      light,
      dark,
    })),
};

export const rawAlphaCatalog = {
  id: "raw-alpha",
  title: "Alpha",
  description: (
    <>
      효과 토큰에 쓰는 투명도 원본 값입니다. 라이트 모드에서는 <strong>black alpha</strong>, 다크 모드에서는{" "}
      <strong>white alpha</strong>를 사용해 shadow와 overlay의 농도를 만듭니다.
    </>
  ),
  tokens: overlayTokens.map(({ label, utility, cssVar, rawVarLight, rawVarDark, light, dark }) => ({
    id: label,
    label,
    utility,
    cssVar,
    rawVarLight,
    rawVarDark,
    light,
    dark,
  })),
};

export const semanticGradientCatalog = {
  id: "semantic-gradient",
  title: "Gradient",
  description: (
    <>
      브랜드 강조에 쓰는 용도 기반 그라데이션입니다. <strong>gradient-*</strong> 유틸리티로 적용하며, 시맨틱 색 스케일을 참조해 라이트/다크에 대응합니다.
    </>
  ),
  groups: [
    {
      id: "brand",
      label: "brand",
      gradients: [gradientTokens[0]],
    },
  ] satisfies SemanticGradientGroupDef[],
};

export type SemanticEffectTokenDef = {
  id: string;
  utility: string;
  sourceVar: string;
  value: string;
};

export const semanticShadowCatalog = {
  id: "semantic-shadow",
  title: "Shadow",
  description: (
    <>
      면의 깊이감을 만드는 실제 <strong>그림자(shadow)</strong> 효과 토큰입니다. 높이감이 낮은 표면부터 강한 부유 레이어까지 <strong>shadow-1</strong>부터 <strong>shadow-4</strong> 순서로 사용합니다.
    </>
  ),
  tokens: [
    {
      id: "shadow-1",
      utility: "shadow-1",
      sourceVar: "--ds-effect-shadow-1",
      value: "0 1px 2px alpha-1, 0 0 2px alpha-1",
    },
    {
      id: "shadow-2",
      utility: "shadow-2",
      sourceVar: "--ds-effect-shadow-2",
      value: "0 0 2px alpha-1, 0 4px 8px alpha-2",
    },
    {
      id: "shadow-3",
      utility: "shadow-3",
      sourceVar: "--ds-effect-shadow-3",
      value: "0 0 2px alpha-2, 0 8px 16px alpha-3",
    },
    {
      id: "shadow-4",
      utility: "shadow-4",
      sourceVar: "--ds-effect-shadow-4",
      value: "0 0 2px alpha-2, 0 16px 24px alpha-3",
    },
  ] satisfies SemanticEffectTokenDef[],
};

export const semanticElevationCatalog = {
  id: "semantic-elevation",
  title: "Elevation",
  description: (
    <>
      배경 위에 올라오는 <strong>레이어 위계(elevation)</strong> 토큰입니다. 모달은 <strong>elevation-modal</strong>, floating button은 <strong>elevation-floating</strong>을 사용합니다.
    </>
  ),
  tokens: [
    {
      id: "elevation-floating",
      utility: "elevation-floating",
      sourceVar: "--ds-effect-elevation-floating",
    },
    {
      id: "elevation-modal",
      utility: "elevation-modal",
      sourceVar: "--ds-effect-elevation-modal",
    },
  ] satisfies (Omit<SemanticEffectTokenDef, "value">)[],
};

export const semanticBlurCatalog = {
  id: "semantic-blur",
  title: "Blur",
  description: (
    <>
      배경 콘텐츠를 흐리게 처리하는 <strong>블러(blur)</strong> 효과 토큰입니다. 필요한 흐림 정도에 따라 <strong>blur-*</strong> 유틸리티를 사용합니다.
    </>
  ),
  tokens: [
    {
      id: "blur-subtle",
      utility: "blur-subtle",
      sourceVar: "--ds-effect-blur-subtle",
      value: "blur(0.375rem) / 6px",
    },
    {
      id: "blur-default",
      utility: "blur-default",
      sourceVar: "--ds-effect-blur-default",
      value: "blur(0.75rem) / 12px",
    },
    {
      id: "blur-strong",
      utility: "blur-strong",
      sourceVar: "--ds-effect-blur-strong",
      value: "blur(1.25rem) / 20px",
    },
  ] satisfies SemanticEffectTokenDef[],
};

export type TocSection = { id: string; label: string; level?: 1 | 2 };

export const colorRawTocSections: TocSection[] = [
  { id: "section-color", label: "Color Palette" },
  { id: "section-contrast", label: "Contrast Checker" },
  { id: "raw-effect-tokens", label: "Effect Tokens", level: 1 },
  { id: semanticShadowCatalog.id, label: semanticShadowCatalog.title, level: 2 },
  { id: "raw-blur", label: semanticBlurCatalog.title, level: 2 },
  { id: rawAlphaCatalog.id, label: rawAlphaCatalog.title, level: 2 },
];

export const semanticTocSections: TocSection[] = [
  { id: "semantic-color-tokens", label: "Color Tokens", level: 1 },
  ...semanticColorCatalog.map((category) => ({ id: category.id, label: category.title, level: 2 as const })),
  { id: semanticUtilityCatalog.id, label: semanticUtilityCatalog.title, level: 2 },
  { id: "semantic-effect-tokens", label: "Effect Tokens", level: 1 },
  { id: semanticGradientCatalog.id, label: semanticGradientCatalog.title, level: 2 },
  { id: semanticElevationCatalog.id, label: semanticElevationCatalog.title, level: 2 },
  { id: semanticBlurCatalog.id, label: semanticBlurCatalog.title, level: 2 },
  { id: semanticOverlayCatalog.id, label: semanticOverlayCatalog.title, level: 2 },
];

export const fontFamilyTocSections: TocSection[] = [
  { id: "section-font-stack", label: "Font Stack" },
];

export const typographyTocSections: TocSection[] = [
  { id: "section-typography-scale", label: "Type Scale", level: 1 },
  { id: "typography-display-scale", label: "Display", level: 2 },
  { id: "typography-heading-scale", label: "Heading", level: 2 },
  { id: "typography-body-scale", label: "Body", level: 2 },
  { id: "typography-label-scale", label: "Label", level: 2 },
  { id: "typography-caption-scale", label: "Caption", level: 2 },
];

export const outlineIconsTocSections: TocSection[] = [
  { id: "section-outline-icon", label: "Outline" },
  { id: "section-outline-icon-source", label: "Source" },
  { id: "section-outline-icons", label: "Sizes" },
];

export const filledIconsTocSections: TocSection[] = [
  { id: "section-filled-icon", label: "Filled" },
  { id: "section-filled-icon-source", label: "Source" },
  { id: "section-filled-icons", label: "Sizes" },
];

export function probeSemanticUtilityColor(
  probe: HTMLDivElement,
  utility: string,
  readAs: SemanticColorReadMode,
  cssVar?: string,
): string {
  probe.className = "";
  probe.style.color = "";
  probe.style.backgroundColor = "";
  probe.style.border = "";

  if (readAs === "border") {
    probe.className = `box-border size-8 border bg-transparent ${utility}`;
    return getComputedStyle(probe).borderTopColor;
  }

  if (cssVar && (readAs === "text" || readAs === "bg" || readAs === "outline")) {
    probe.className = "box-border size-8";
    if (readAs === "text") {
      probe.style.color = `var(${cssVar})`;
      const color = getComputedStyle(probe).color;
      probe.style.color = "";
      return color;
    }
    probe.style.backgroundColor = `var(${cssVar})`;
    const color = getComputedStyle(probe).backgroundColor;
    probe.style.backgroundColor = "";
    return color;
  }

  probe.className = utility;
  const cs = getComputedStyle(probe);
  return readAs === "bg" ? cs.backgroundColor : cs.color;
}

/** computed rgb/rgba → 큐레이션 표시용 불투명 hex (#rrggbb, 알파 제거) */
export function cssColorToHex(color: string): string {
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

export function semanticSwatchNeedsBorder(color: string): boolean {
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

export function SwatchCardMeta({
  utility,
  sourceVar,
  value,
}: {
  utility: string;
  sourceVar: string;
  value?: string;
}) {
  return (
    <div className="p-4">
      <p className="m-0 font-mono text-label-small font-bold foreground-default">{utility}</p>
      <p className="m-0 mt-1 font-mono text-caption text-gray-60">{sourceVar}</p>
      {value ? <p className="m-0 mt-0.5 font-mono text-caption text-gray-60 numeric-tabular">{value}</p> : null}
    </div>
  );
}

export function SemanticColorSwatchCard({
  utility,
  rawVar,
  color,
}: {
  utility: string;
  rawVar: string;
  color: string;
}) {
  const needsBorder = semanticSwatchNeedsBorder(color);
  const hexLabel = cssColorToHex(color);

  return (
    <div className="overflow-hidden rounded-xl border border-default bg-background shadow-[0_4px_16px_var(--ds-shadow)]">
      <div
        aria-hidden="true"
        className={[
          "h-24 w-full",
          needsBorder ? "border-b border-default" : "",
        ].join(" ")}
        style={{ backgroundColor: color }}
      />
      <SwatchCardMeta utility={utility} sourceVar={rawVar} value={hexLabel} />
    </div>
  );
}

export function SemanticOverlaySwatchCard({
  utility,
  rawVar,
  cssVar,
  valueLabel,
  isDark,
  hideUtility = false,
}: {
  utility: string;
  rawVar: string;
  cssVar: string;
  valueLabel: string;
  isDark: boolean;
  /** raw 섹션용 — 유틸리티 클래스 줄을 숨기고 --raw 변수·실제값만 노출, 견본도 raw 토큰으로 채움 */
  hideUtility?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-default bg-background shadow-[0_4px_16px_var(--ds-shadow)]">
      <div
        aria-hidden="true"
        className="h-24 w-full overflow-hidden border-b border-default"
        style={isDark ? checkerDark : checkerLight}
      >
        <div className="size-full" style={{ background: `var(${hideUtility ? rawVar : cssVar})` }} />
      </div>
      {hideUtility ? (
        <div className="p-4">
          <p className="m-0 font-mono text-label-small font-bold foreground-default">{rawVar}</p>
          {valueLabel ? (
            <p className="m-0 mt-1 font-mono text-caption text-gray-60 numeric-tabular">{valueLabel}</p>
          ) : null}
        </div>
      ) : (
        <SwatchCardMeta utility={utility} sourceVar={rawVar} value={valueLabel} />
      )}
    </div>
  );
}

export function SemanticGradientSwatchCard({
  utility,
  dsVar,
  rawVar,
  value,
}: {
  utility: string;
  dsVar: string;
  rawVar: string;
  value: string;
}) {
  const isFade = dsVar.includes("fade");
  const underlayStyle = dsVar.includes("overlay") ? checkerLight : { background: "var(--ds-violet-10)" };

  return (
    <div className="overflow-hidden rounded-xl border border-default bg-background shadow-[0_4px_16px_var(--ds-shadow)]">
      {isFade ? (
        <div className="h-24 w-full overflow-hidden border-b border-default" style={underlayStyle}>
          <div aria-hidden="true" className={`size-full ${utility}`} />
        </div>
      ) : (
        <div aria-hidden="true" className={`h-24 w-full border-b border-default ${utility}`} />
      )}
      <SwatchCardMeta utility={utility} sourceVar={rawVar} value={value} />
    </div>
  );
}

export function SemanticShadowSwatchCard({ utility, sourceVar, value }: SemanticEffectTokenDef) {
  return (
    <div className="grid items-center gap-8 sm:grid-cols-[9rem_1fr]">
      <div className="flex items-center justify-center py-5">
        <div aria-hidden="true" className={`size-28 rounded-2xl surface-default ${utility}`} />
      </div>
      <div className="min-w-0 py-5">
        <p className="m-0 font-mono text-label-small font-bold foreground-default">{utility}</p>
        <p className="m-0 mt-1 font-mono text-caption text-gray-60">{sourceVar}</p>
        <p className="m-0 mt-0.5 font-mono text-caption text-gray-60">{value}</p>
      </div>
    </div>
  );
}

export function SemanticElevationSwatchCard({ utility, sourceVar }: Omit<SemanticEffectTokenDef, "value">) {
  return (
    <div className="grid items-center gap-8 sm:grid-cols-[9rem_1fr]">
      <div className="flex items-center justify-center py-6">
        <div
          aria-hidden="true"
          className={`flex h-24 w-32 items-center justify-center rounded-2xl border border-default surface-default ${utility}`}
        />
      </div>
      <div className="min-w-0 py-5">
        <p className="m-0 font-mono text-label-small font-bold foreground-default">{utility}</p>
        <p className="m-0 mt-1 font-mono text-caption text-gray-60">{sourceVar}</p>
      </div>
    </div>
  );
}

export function SemanticBlurSwatchCard({
  utility,
  sourceVar,
  value,
  hideUtility = false,
}: Omit<SemanticEffectTokenDef, "value"> & { value?: string; hideUtility?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-default bg-background shadow-[0_4px_16px_var(--ds-shadow)]">
      <div aria-hidden="true" className="relative h-32 w-full overflow-hidden border-b border-default">
        <img
          src="/blur_sample.webp"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className={`absolute inset-0 ${utility}`} />
      </div>
      {hideUtility ? (
        <div className="p-4">
          <p className="m-0 font-mono text-label-small font-bold foreground-default">{sourceVar}</p>
          {value ? (
            <p className="m-0 mt-1 font-mono text-caption text-gray-60 numeric-tabular">{value}</p>
          ) : null}
        </div>
      ) : (
        <SwatchCardMeta utility={utility} sourceVar={sourceVar} value={value} />
      )}
    </div>
  );
}

export function SemanticColorGroupGrid({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8 last:mb-0">
      <h4 className="m-0 mb-3 text-label-small font-semibold lowercase text-gray-60">{label}</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>
    </div>
  );
}

export function SemanticColorCategorySection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mb-20 last:mb-0">
      <h4
        id={id}
        className={[
          "m-0 mb-4 text-heading-small font-bold leading-base foreground-default",
          guideSectionAnchorClass,
        ].join(" ")}
      >
        {title}
      </h4>
      <TabDescriptionCallout>{description}</TabDescriptionCallout>
      {children}
    </section>
  );
}

export function SemanticTokenFamilySection({
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
    <section aria-labelledby={id} className="mb-28 last:mb-0">
      <header className={lead ? "mb-12" : "mt-40 mb-12"}>
        <h3
          id={id}
          className={[
            "m-0 text-heading-large font-bold leading-base foreground-brand",
            guideSectionAnchorClass,
          ].join(" ")}
        >
          {title}
        </h3>
        <p className="m-0 mt-3 max-w-3xl text-body-medium leading-base foreground-subtle">
          {description}
        </p>
      </header>
      {children}
    </section>
  );
}

// 투명도 확인용 체크무늬(모드 무관 고정) — 위에 알파 색을 올려 투명도를 가시화
export const makeChecker = (base: string, square: string): React.CSSProperties => ({
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
export const checkerLight = makeChecker("var(--raw-white)", "var(--raw-gray-20)");
export const checkerDark = makeChecker("var(--raw-black)", "var(--raw-gray-70)");

// 폰트 폴백 체인 — 각 단계는 해당 폰트로 렌더되어 시각 비교 가능
export const fontStack = [
  { order: 1, name: "Pretendard GOV", family: "var(--font-pretendard-gov), sans-serif", role: "기본", source: "자체 호스팅 (next/font/local)", desc: "공공·접근성(KWCAG) 최적화 한글 폰트. 1순위로 사용.", emphasis: "primary" as const },
  { order: 2, name: "Noto Sans KR", family: "var(--font-noto), sans-serif", role: "폴백", source: "자체 호스팅 (next/font/local)", desc: "Pretendard 미로드 시 사용. preload:false 로 평상시엔 다운로드 안 함.", emphasis: "fallback" as const },
  { order: 3, name: "sans-serif", family: "sans-serif", role: "최종", source: "시스템 기본", desc: "위 둘 다 불가 시 OS 기본 산세리프로 대체.", emphasis: "system" as const },
];

export const fontStackBadgeClass: Record<(typeof fontStack)[number]["emphasis"], string> = {
  primary: "surface-brand foreground-inverse",
  fallback: "surface-brand-subtle foreground-brand-strong",
  system: "bg-background text-gray-60 ring-1 ring-default",
};

export const fontStackLineClass: Record<(typeof fontStack)[number]["emphasis"], string> = {
  primary: "surface-brand",
  fallback: "bg-default",
  system: "bg-default",
};

export const fontStackTagClass: Record<(typeof fontStack)[number]["emphasis"], string> = {
  primary: "surface-brand-faint foreground-brand-strong",
  fallback: "bg-gray-10 foreground-subtle",
  system: "bg-transparent foreground-subtle ring-1 ring-default",
};

export function FontStackRoleTag({
  emphasis,
  children,
}: {
  emphasis: (typeof fontStack)[number]["emphasis"];
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-caption font-semibold ${fontStackTagClass[emphasis]}`}
    >
      {children}
    </span>
  );
}

export const TOAST_DURATION_MS = 2500;

export type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
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
          className="pointer-events-none fixed bottom-24 left-1/2 z-[100] max-w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-default bg-background px-4 py-3 text-label-xsmall font-medium foreground-default shadow-[0_6px_24px_var(--ds-shadow)]"
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

export function TokenChip({
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
    "inline-flex w-fit items-center rounded-md border border-brand bg-transparent font-mono font-semibold foreground-brand",
    size === "lg" ? "px-4 py-1.5 text-label-small" : "px-3 py-1 text-label-xsmall",
    copyValue
      ? "cursor-pointer transition-[background-color,border-color,color,transform] duration-150 hover:surface-brand-faint hover:foreground-brand-strong active:translate-y-px"
      : "",
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

type CodeToken = {
  value: string;
  className: string;
};

const codeKeywordSet = new Set([
  "const",
  "let",
  "var",
  "import",
  "from",
  "export",
  "function",
  "return",
  "true",
  "false",
  "null",
  "undefined",
]);

function highlightCodeLine(line: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  const pattern = /(\/\/.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+\b|\b[A-Za-z_$][\w$]*(?=\s*:)|\b[A-Za-z_$][\w$]*\b|[{}()[\],.:;+*/=-])/g;
  let cursor = 0;

  for (const match of line.matchAll(pattern)) {
    const value = match[0];
    const index = match.index ?? 0;

    if (index > cursor) {
      tokens.push({ value: line.slice(cursor, index), className: "text-gray-10" });
    }

    if (value.startsWith("//")) {
      tokens.push({ value, className: "text-gray-40" });
    } else if (value.startsWith("\"") || value.startsWith("'") || value.startsWith("`")) {
      tokens.push({ value, className: "text-green-30" });
    } else if (/^\d+$/.test(value)) {
      tokens.push({ value, className: "text-cyan-30" });
    } else if (codeKeywordSet.has(value)) {
      tokens.push({ value, className: "text-orange-30" });
    } else if (/^[A-Za-z_$][\w$]*$/.test(value) && line.slice(index + value.length).trimStart().startsWith(":")) {
      tokens.push({ value, className: "text-orange-20" });
    } else if (/^[{}()[\],.:;+*/=-]$/.test(value)) {
      tokens.push({ value, className: "text-gray-20" });
    } else {
      tokens.push({ value, className: "text-violet-30" });
    }

    cursor = index + value.length;
  }

  if (cursor < line.length) {
    tokens.push({ value: line.slice(cursor), className: "text-gray-10" });
  }

  return tokens;
}

export function CodeBlock({
  code,
  language = "tsx",
  copyLabel = "Copy",
}: {
  code: string;
  language?: string;
  copyLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyTextToClipboard(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), TOAST_DURATION_MS);
  }

  return (
    <div className="overflow-hidden rounded-md bg-gray-90">
      <pre className="m-0 whitespace-pre-wrap break-words px-4 py-3 text-caption font-mono leading-base text-gray-10">
        <code className={`language-${language}`}>
          {code.split("\n").map((line, lineIndex) => (
            <span key={`${lineIndex}-${line}`} className="block min-h-[1.5em] whitespace-pre-wrap break-words">
              {highlightCodeLine(line).map((token, tokenIndex) => (
                <span key={`${lineIndex}-${tokenIndex}`} className={token.className}>
                  {token.value}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
      <div className="flex justify-end border-t border-gray-80 px-2 py-1.5">
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="cursor-pointer rounded-sm border-0 bg-gray-70 px-2 py-1 text-caption font-bold text-gray-5 transition-colors duration-150 hover:bg-gray-60"
        >
          {copied ? "Copied" : copyLabel}
        </button>
      </div>
    </div>
  );
}

export function TabDescriptionCallout({
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
        "border-l-4 border-guide-callout-accent bg-guide-callout-bg py-3.5 pl-4 pr-5 text-body-medium leading-base text-guide-callout-fg [&_strong]:font-bold [&_strong]:foreground-default [&_a]:font-semibold [&_a]:foreground-default [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-guide-callout-accent",
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
export function ContentIntroLayout({
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

export function ContentTitleBlock({
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
      <p className="m-0 text-label-small font-semibold text-guide-intro-eyebrow">{eyebrow}</p>
      <h2
        id={titleId}
        className="m-0 mt-2 font-bold tracking-normal foreground-default typo-guide-content-title"
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
export function ContentSectionTitle({
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
  const headerMargin = lead ? "mb-12" : "mt-40 mb-12";

  return (
    <header className={headerMargin}>
      <h3
        id={id}
        className={[
          "m-0 text-heading-large font-bold leading-base foreground-brand",
          guideSectionAnchorClass,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </h3>
      {description ? (
        <p className="m-0 mt-3 w-full text-body-medium leading-base foreground-subtle">{description}</p>
      ) : null}
    </header>
  );
}

export function ContentTableOfContents({ sections }: { sections: TocSection[] }) {
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

  const hasHierarchy = sections.some((section) => section.level === 2);
  const groupedSections = hasHierarchy
    ? sections.reduce<Array<TocSection & { children: TocSection[] }>>((groups, section) => {
        if ((section.level ?? 1) === 1 || groups.length === 0) {
          groups.push({ ...section, level: 1, children: [] });
        } else {
          groups[groups.length - 1].children.push(section);
        }
        return groups;
      }, [])
    : [];

  if (hasHierarchy) {
    return (
      <nav
        aria-labelledby={headingId}
        className="guide-toc sticky top-[calc(3.75rem+1.5rem)] hidden h-fit w-[12.5rem] shrink-0 xl:block"
      >
        <h2 id={headingId} className="sr-only">목차</h2>
        <ul id={listId} className="m-0 flex list-none flex-col gap-0 p-0">
          {groupedSections.map((group) => {
            const groupActive = activeId === group.id || group.children.some((child) => child.id === activeId);
            return (
              <li
                key={group.id}
                className="relative pb-5 pl-6 last:pb-0 before:absolute before:left-[0.21875rem] before:top-2 before:bottom-0 before:border-l before:border-strong"
              >
                <span aria-hidden="true" className="absolute left-0 top-1.5 size-2 rounded-full border border-strong bg-background" />
                <a
                  href={`#${group.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection(group.id);
                  }}
                  aria-current={activeId === group.id ? "location" : undefined}
                  className={[
                    "block py-0.5 text-caption font-bold uppercase tracking-[0.18em] no-underline transition-colors",
                    groupActive ? "foreground-brand" : "foreground-subtle hover:foreground-brand",
                  ].join(" ")}
                >
                  {group.label}
                </a>
                {group.children.length > 0 ? (
                  <ul className="m-0 mt-3 flex list-none flex-col gap-2.5 p-0">
                    {group.children.map((child) => {
                      const isActive = activeId === child.id;
                      return (
                        <li key={child.id}>
                          <a
                            href={`#${child.id}`}
                            onClick={(event) => {
                              event.preventDefault();
                              scrollToSection(child.id);
                            }}
                            aria-current={isActive ? "location" : undefined}
                            className={[
                              "block py-0.5 text-body-small no-underline transition-colors",
                              isActive
                                ? "font-semibold foreground-brand"
                                : "font-normal foreground-default hover:foreground-brand",
                            ].join(" ")}
                          >
                            {child.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-labelledby={headingId}
      className="guide-toc sticky top-[calc(3.75rem+1.5rem)] hidden h-fit w-[12.5rem] shrink-0 xl:block"
    >
      <div className="overflow-hidden rounded-md border border-default bg-background">
        <div className="flex items-center justify-between gap-2 border-b border-default px-4 py-3.5">
          <h2 id={headingId} className="m-0 text-label-small font-bold foreground-default">
            목차
          </h2>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-expanded={!collapsed}
            aria-controls={listId}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-default bg-background px-2.5 py-1 text-caption font-medium text-gray-60 transition-colors hover:foreground-default"
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
            {sections.map(({ id, label, level = 1 }) => {
              const isActive = activeId === id;
              const isChild = level === 2;
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
                      "block lowercase no-underline transition-colors",
                      isChild
                        ? "ml-4 border-l border-default py-2 pl-4 pr-4 text-body-small"
                        : "mt-1 px-4 py-2.5 text-label-small font-bold first:mt-0",
                      isActive && isChild
                        ? "border-brand surface-brand-faint font-semibold foreground-brand-strong"
                        : "",
                      isActive && !isChild
                        ? "surface-brand-faint foreground-brand"
                        : "",
                      !isActive && isChild
                        ? "font-normal text-gray-60 hover:border-brand hover:bg-gray-5 hover:foreground-default"
                        : "",
                      !isActive && !isChild
                        ? "foreground-brand hover:bg-gray-5"
                        : "",
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

export function GuideContentLayout({
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
export function ContentSubsectionTitle({
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
        "m-0 mb-6 text-heading-medium font-bold foreground-brand",
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
export function ContentGroupTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h4 className={["m-0 mb-4 text-heading-small font-bold foreground-default", className].filter(Boolean).join(" ")}>
      {children}
    </h4>
  );
}

/** 콘텐츠 영역 서브탭 — outline variant (react-ts-scss-vite-pnpm-template Tabs 구조 참고) */
export const contentSubTabPanelClass = "layout-guide-tabpanel";

export type ContentOutlineTabDef = {
  value: string;
  tabId: string;
  panelId: string;
  label: string;
  ref?: React.RefObject<HTMLButtonElement | null>;
};

export const contentOutlineSubTabClass = (active: boolean) =>
  [
    "relative shrink-0 cursor-pointer select-none whitespace-nowrap rounded-t-lg border-0 border-b-0 border-t-2 border-l-2 border-r-2 border-solid px-5 py-3 font-sans text-guide-tab-title leading-base transition-[color,background-color] duration-200",
    active
      ? "z-[1] -mb-0.5 border-foreground-default bg-background font-bold foreground-default after:absolute after:-bottom-0.5 after:left-0 after:z-[2] after:h-0.5 after:w-full after:bg-background after:content-['']"
      : "border-transparent surface-subtle font-medium text-gray-60 hover:bg-gray-10 hover:foreground-default",
  ].join(" ");

export const guideTabScrollBtnClass =
  "guide-tabs-scroll-btn inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center rounded-full border border-default bg-background text-gray-60 transition-opacity duration-150 hover:surface-subtle hover:foreground-default focus-visible:opacity-100 focus-visible:visible";

export const GUIDE_TAB_SCROLL_AMOUNT = 200;

export function ContentOutlineTabList({
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
            className="flex w-max min-w-full border-b-2 border-foreground-default px-control-md"
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

export const guideHeaderHeightClass = "h-[3.75rem]";
export const guideHeaderOffsetClass = "top-[3.75rem]";
export const guideHeaderMaxHeightClass = "max-h-[calc(100vh-3.75rem)]";
export const guideHeaderIconButtonClass =
  "inline-flex size-control-sm items-center justify-center rounded-full surface-subtle foreground-default transition-colors duration-150 hover:bg-gray-10 hover:foreground-default";

const GUIDE_ZOOM_STORAGE_KEY = "system-guide:zoom";
const GUIDE_ZOOM_MIN = 50;
const GUIDE_ZOOM_MAX = 200;
const GUIDE_ZOOM_STEP = 10;
const GUIDE_ZOOM_DEFAULT = 100;

function normalizeGuideZoom(value: number): number {
  if (!Number.isFinite(value)) return GUIDE_ZOOM_DEFAULT;
  return Math.min(GUIDE_ZOOM_MAX, Math.max(GUIDE_ZOOM_MIN, Math.round(value / GUIDE_ZOOM_STEP) * GUIDE_ZOOM_STEP));
}

export function GuideLogoMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 20"
      className="size-icon-sm shrink-0 foreground-brand-strong"
      fill="currentColor"
    >
      <circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.35" />
      <circle cx="22" cy="10" r="8" fill="currentColor" />
    </svg>
  );
}

export function GuideZoomControl() {
  const [zoomPercent, setZoomPercent] = useState(() => {
    if (typeof window === "undefined") return GUIDE_ZOOM_DEFAULT;

    try {
      const storedZoom = window.localStorage.getItem(GUIDE_ZOOM_STORAGE_KEY);
      return storedZoom === null ? GUIDE_ZOOM_DEFAULT : normalizeGuideZoom(Number(storedZoom));
    } catch {
      return GUIDE_ZOOM_DEFAULT;
    }
  });

  const zoomOut = useCallback(() => {
    setZoomPercent((current) => normalizeGuideZoom(current - GUIDE_ZOOM_STEP));
  }, []);

  const zoomIn = useCallback(() => {
    setZoomPercent((current) => normalizeGuideZoom(current + GUIDE_ZOOM_STEP));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomPercent(GUIDE_ZOOM_DEFAULT);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${zoomPercent}%`;
    try {
      window.localStorage.setItem(GUIDE_ZOOM_STORAGE_KEY, String(zoomPercent));
    } catch {
      // 저장소 접근이 막힌 환경에서도 현재 세션의 확대/축소는 유지한다.
    }
  }, [zoomPercent]);

  const zoomButtonClass =
    "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 foreground-default transition-colors duration-150 hover:surface-strong disabled:cursor-not-allowed disabled:foreground-disabled disabled:hover:bg-transparent";

  return (
    <div
      role="group"
      aria-label="화면 확대 축소"
      className="inline-flex h-control-md items-center gap-1.5 rounded-lg border border-default surface-default px-1.5"
    >
      <button
        type="button"
        aria-label="축소"
        onClick={zoomOut}
        disabled={zoomPercent <= GUIDE_ZOOM_MIN}
        className={zoomButtonClass}
      >
        <NavIcon aria-hidden="true" className="size-icon-xs shrink-0">
          <line x1="5" y1="12" x2="19" y2="12" />
        </NavIcon>
      </button>
      <button
        type="button"
        onClick={resetZoom}
        aria-label={
          zoomPercent === GUIDE_ZOOM_DEFAULT
            ? "현재 확대 비율 100%, 기본값"
            : `현재 확대 비율 ${zoomPercent}%, 100%로 초기화`
        }
        title={zoomPercent === GUIDE_ZOOM_DEFAULT ? "현재 100%" : "100%로 초기화"}
        className="inline-flex h-7 w-12 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-label-small font-bold foreground-default numeric-tabular transition-colors duration-150 hover:surface-subtle"
      >
        {zoomPercent}%
      </button>
      <button
        type="button"
        aria-label="확대"
        onClick={zoomIn}
        disabled={zoomPercent >= GUIDE_ZOOM_MAX}
        className={zoomButtonClass}
      >
        <NavIcon aria-hidden="true" className="size-icon-xs shrink-0">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </NavIcon>
      </button>
    </div>
  );
}

export function GuideSiteHeader({
  isSidenavOpen,
  onToggleSidenav,
}: {
  isSidenavOpen: boolean;
  onToggleSidenav: () => void;
}) {
  return (
    <header
      className={`sticky z-40 border-b border-default bg-background ${guideHeaderPaddingClass} ${guideHeaderHeightClass} top-0`}
    >
      <div className={`grid w-full ${guideHeaderHeightClass} grid-cols-[auto_1fr_auto] items-center gap-3 lg:grid-cols-[1fr_auto_1fr] lg:gap-6`}>
        <div className="flex items-center gap-1 justify-self-start">
          <Link
            href={GUIDE_ROUTES.home}
            aria-label="가이드 홈"
            className={`${guideHeaderIconButtonClass} cursor-pointer`}
          >
            <NavIcon className="size-icon-sm shrink-0">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </NavIcon>
          </Link>
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
          <h1 className="truncate text-label-medium font-bold foreground-brand-strong">디자인 시스템 가이드</h1>
        </div>

        <div className="justify-self-end">
          <GuideZoomControl />
        </div>
      </div>
    </header>
  );
}

export function FontStackCuration() {
  return (
    <>
      <TabDescriptionCallout>
        <strong>Pretendard GOV</strong>를 기본으로 하는 폴백 체인입니다. 폰트 패밀리는 <strong>--font-family-base</strong> 토큰으로 관리합니다.
      </TabDescriptionCallout>

      <ol className="mx-0 mt-0 mb-8 flex list-none flex-col p-0">
        {fontStack.map(({ order, name, family, role, source, desc, emphasis }, index) => {
          const isLast = index === fontStack.length - 1;
          return (
            <li key={order} className="flex gap-4">
              <div className="flex w-8 shrink-0 flex-col items-center">
                <span
                  aria-hidden="true"
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-caption font-bold ${fontStackBadgeClass[emphasis]}`}
                >
                  {order}
                </span>
                {!isLast && (
                  <span aria-hidden="true" className={`my-1 w-px flex-1 min-h-6 ${fontStackLineClass[emphasis]}`} />
                )}
              </div>
              <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-8"}`}>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    role="img"
                    aria-label={`${name} 글꼴 견본`}
                    className={`leading-base ${emphasis === "primary" ? "text-label-medium font-bold" : "text-label-small font-semibold"}`}
                    style={{ fontFamily: family }}
                  >
                    {name}
                  </span>
                  <FontStackRoleTag emphasis={emphasis}>{role}</FontStackRoleTag>
                </div>
                <p className="m-0 mt-1.5 text-caption text-gray-60">{desc}</p>
                <p className="m-0 mt-0.5 font-mono text-caption text-gray-60">{source}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

type TypographyScaleSpec = {
  style: string;
  pc: number;
  mobile: number;
  weight: 400 | 700;
  letterSpacing: "0px" | "1px";
  typoClass: string;
};

const headingScaleSpecs: TypographyScaleSpec[] = [
  { style: "xlarge", pc: 40, mobile: 28, weight: 700, letterSpacing: "1px", typoClass: "typo-heading-xlarge" },
  { style: "large", pc: 32, mobile: 24, weight: 700, letterSpacing: "1px", typoClass: "typo-heading-large" },
  { style: "medium", pc: 24, mobile: 22, weight: 700, letterSpacing: "0px", typoClass: "typo-heading-medium" },
  { style: "small", pc: 19, mobile: 19, weight: 700, letterSpacing: "0px", typoClass: "typo-heading-small" },
  { style: "xsmall", pc: 17, mobile: 17, weight: 700, letterSpacing: "0px", typoClass: "typo-heading-xsmall" },
  { style: "xxsmall", pc: 15, mobile: 15, weight: 700, letterSpacing: "0px", typoClass: "typo-heading-xxsmall" },
];

const bodyScaleSpecs: TypographyScaleSpec[] = [
  { style: "large-bold", pc: 19, mobile: 19, weight: 700, letterSpacing: "0px", typoClass: "typo-body-large-bold" },
  { style: "medium-bold", pc: 17, mobile: 17, weight: 700, letterSpacing: "0px", typoClass: "typo-body-medium-bold" },
  { style: "small-bold", pc: 15, mobile: 15, weight: 700, letterSpacing: "0px", typoClass: "typo-body-small-bold" },
  { style: "xsmall-bold", pc: 13, mobile: 13, weight: 700, letterSpacing: "0px", typoClass: "typo-body-xsmall-bold" },
  { style: "large", pc: 19, mobile: 19, weight: 400, letterSpacing: "0px", typoClass: "typo-body-large" },
  { style: "medium", pc: 17, mobile: 17, weight: 400, letterSpacing: "0px", typoClass: "typo-body-medium" },
  { style: "small", pc: 15, mobile: 15, weight: 400, letterSpacing: "0px", typoClass: "typo-body-small" },
  { style: "xsmall", pc: 13, mobile: 13, weight: 400, letterSpacing: "0px", typoClass: "typo-body-xsmall" },
];

const labelScaleSpecs: TypographyScaleSpec[] = [
  { style: "large", pc: 19, mobile: 19, weight: 400, letterSpacing: "0px", typoClass: "typo-label-large" },
  { style: "medium", pc: 17, mobile: 17, weight: 400, letterSpacing: "0px", typoClass: "typo-label-medium" },
  { style: "small", pc: 15, mobile: 15, weight: 400, letterSpacing: "0px", typoClass: "typo-label-small" },
  { style: "xsmall", pc: 13, mobile: 13, weight: 400, letterSpacing: "0px", typoClass: "typo-label-xsmall" },
];

const displayScaleSpecs: TypographyScaleSpec[] = [
  { style: "display-lg", pc: 40, mobile: 32, weight: 700, letterSpacing: "0px", typoClass: "typo-display-lg" },
  { style: "display-md", pc: 32, mobile: 28, weight: 700, letterSpacing: "0px", typoClass: "typo-display-md" },
  { style: "display-sm", pc: 28, mobile: 24, weight: 700, letterSpacing: "0px", typoClass: "typo-display-sm" },
];

const captionScaleSpecs: TypographyScaleSpec[] = [
  { style: "caption", pc: 12, mobile: 12, weight: 400, letterSpacing: "0px", typoClass: "typo-caption" },
];

const headingUsageRows = [
  { structure: "h1", range: "xlarge-large", usage: "페이지나 섹션의 가장 중요한 제목으로, 주요 주제를 강조하는 데 사용한다." },
  { structure: "h2", range: "large-medium", usage: "콘텐츠의 주요 섹션을 구분하여 H1보다 작은 부제목 역할을 한다." },
  { structure: "h3", range: "medium-small", usage: "세부 섹션을 나타내는 제목으로, H1과 H2보다 작은 크기로 사용한다." },
  { structure: "h4", range: "small-xsmall", usage: "본문과 비슷한 크기의 제목으로, 세부적인 콘텐츠에 대한 설명에 사용한다." },
  { structure: "h5", range: "xsmall-xxsmall", usage: "가장 작은 제목으로, 부차적인 정보나 보조 설명을 위해 사용한다." },
];

const bodyUsageRows = [
  { range: "large", usage: "전체 글에 대한 써머리 또는 중요한 정보를 전달할 때 사용된다." },
  { range: "medium", usage: "본문 텍스트에 사용되는 표준 크기로 전체적인 UI 요소에서 사용된다." },
  { range: "small", usage: "덜 중요한 정보나 부가적인 설명 문구에 사용되며, 작은 크기로 가독성에 주의해야 한다." },
  { range: "xsmall", usage: "가장 작은 크기로, 주석, 보조 설명 또는 부가적인 정보에 사용되며, 가독성이 떨어질 수 있으므로 신중하게 사용해야 한다." },
];

const typeScaleBaseRows = [
  { percent: 100, label: "브라우저 기본값", note: "시스템 기본 크기" },
  { percent: 62.5, label: "계산 참고값", note: "10px 환산이 필요할 때" },
  { percent: 50, label: "축소 참고값", note: "8px 환산이 필요할 때" },
] as const;

const typographyTableFrameClass = "overflow-x-auto rounded-xl border border-gray-20";
const typographyTableHeaderRowClass = "border-b border-gray-20 bg-gray-5";
const typographyTableHeaderCellClass = "px-4 py-3 text-label-xsmall font-bold foreground-default";
const typographyTableBodyRowClass = "border-b border-gray-20 last:border-b-0";

export function TypeScaleBaseGuide() {
  return (
    <div className={`mb-20 ${typographyTableFrameClass}`}>
      <table className="w-full min-w-[36rem] border-collapse text-left">
        <caption className="sr-only">타이포 스케일 기준 rem, 퍼센트, 픽셀 환산표</caption>
        <thead>
          <tr className={typographyTableHeaderRowClass}>
            <th scope="col" className={typographyTableHeaderCellClass}>시스템 기본 폰트 크기</th>
            <th scope="col" className={typographyTableHeaderCellClass}>rem</th>
            <th scope="col" className={typographyTableHeaderCellClass}>%</th>
            <th scope="col" className={typographyTableHeaderCellClass}>px</th>
          </tr>
        </thead>
        <tbody>
          {typeScaleBaseRows.map(({ percent, label, note }, index) => {
            const px = (REM_BASE * percent) / 100;
            const percentLabel = `${percent}%`;
            const pxLabel = `${Number.isInteger(px) ? px : px.toFixed(1)}px`;

            return (
              <tr key={percentLabel} className={typographyTableBodyRowClass}>
                {index === 0 ? (
                  <th scope="rowgroup" rowSpan={typeScaleBaseRows.length} className="px-4 py-4 align-middle text-label-small font-bold foreground-default">
                    {REM_BASE}px 기준
                  </th>
                ) : null}
                {index === 0 ? (
                  <td rowSpan={typeScaleBaseRows.length} className="px-4 py-4 align-middle text-label-small font-bold foreground-default numeric-tabular">
                    1rem
                  </td>
                ) : null}
                <td className="px-4 py-4 align-middle text-label-xsmall foreground-default numeric-tabular">
                  <span className="block font-semibold">{percentLabel}</span>
                  <span className="block text-caption text-gray-60">{label}</span>
                </td>
                <td className="px-4 py-4 align-middle text-label-xsmall foreground-default numeric-tabular">
                  <span className="block font-semibold">{pxLabel}</span>
                  <span className="block text-caption text-gray-60">{note}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TypographyScaleSpecTable({
  title,
  description,
  rows,
  usage,
}: {
  title: string;
  description?: string;
  rows: TypographyScaleSpec[];
  usage?: React.ReactNode;
}) {
  const sectionId = `typography-${title.toLowerCase().replace(/\s+/g, "-")}-scale`;

  return (
    <section aria-labelledby={sectionId}>
      <header className="mb-5">
        <h4
          id={sectionId}
          className={["m-0 text-heading-large font-bold leading-base foreground-brand", guideSectionAnchorClass].join(" ")}
        >
          {title}
        </h4>
        {description ? (
          <p className="m-0 mt-3 max-w-3xl text-body-medium leading-base foreground-subtle">{description}</p>
        ) : null}
      </header>
      {usage}
      <div className={typographyTableFrameClass}>
        <table className="w-full min-w-[48rem] border-collapse text-left">
          <caption className="sr-only">{title} 타이포그래피 스케일</caption>
          <thead>
            <tr className={typographyTableHeaderRowClass}>
              {["Utility Class", "Size(pc)", "Size(mobile)", "Font weight", "Line height", "Letter spacing"].map((header) => (
                <th key={header} scope="col" className={typographyTableHeaderCellClass}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ style, pc, mobile, weight, letterSpacing, typoClass }) => (
              <tr key={style} className={typographyTableBodyRowClass}>
                <td className="px-4 py-4 align-middle text-body-medium foreground-default">
                  <TokenChip copyValue={typoClass}>{typoClass}</TokenChip>
                </td>
                <td className="px-4 py-4 align-middle text-body-medium foreground-default numeric-tabular">
                  {pc}
                </td>
                <td className="px-4 py-4 align-middle text-body-medium foreground-default numeric-tabular">
                  {mobile}
                </td>
                <td className="px-4 py-4 align-middle text-body-medium foreground-default numeric-tabular">
                  {weight}
                </td>
                <td className="px-4 py-4 align-middle text-body-medium foreground-default numeric-tabular">
                  150%
                </td>
                <td className="px-4 py-4 align-middle text-body-medium foreground-default numeric-tabular">
                  {letterSpacing}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TypographyScalePreviewTable title={title} rows={rows} />
    </section>
  );
}

const typographyPreviewSampleText = "다람쥐 헌 쳇바퀴에 타고파 ABC xyz 123 !?@#";

function TypographyScalePreviewTable({
  title,
  rows,
}: {
  title: string;
  rows: TypographyScaleSpec[];
}) {
  const previewId = `typography-${title.toLowerCase().replace(/\s+/g, "-")}-preview`;
  // style 값에 그룹명이 접두로 붙은 경우(예: display-lg) 사이즈 이름만 노출
  const groupPrefix = `${title.toLowerCase()}-`;

  return (
    <section aria-labelledby={previewId} className="mt-8">
      <h5 id={previewId} className="m-0 mb-4 text-label-small font-bold foreground-subtle">
        Preview
      </h5>
      <div className={typographyTableFrameClass}>
        <table className="w-full min-w-[48rem] border-collapse text-left">
          <caption className="sr-only">{title} 타이포그래피 사이즈별 미리보기</caption>
          <thead>
            <tr className={typographyTableHeaderRowClass}>
              <th scope="col" className={typographyTableHeaderCellClass}>Sample</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ style, weight, typoClass }) => (
              <tr key={`${title}-${style}-preview`} className={typographyTableBodyRowClass}>
                <td className="px-4 py-5 align-middle foreground-default">
                  <span className="mb-2 block text-caption text-gray-60 numeric-tabular">{style.startsWith(groupPrefix) ? style.slice(groupPrefix.length) : style} / {weight}</span>
                  <span className={typoClass}>{typographyPreviewSampleText}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TypographyHeadingUsageTable() {
  return (
    <div aria-labelledby="typography-heading-usage" className="mb-8">
      <h5 id="typography-heading-usage" className="m-0 mb-4 text-label-small font-bold foreground-subtle">계층별 사용</h5>
      <div className={typographyTableFrameClass}>
        <table className="w-full min-w-[48rem] border-collapse text-left">
          <caption className="sr-only">Heading 계층별 사용 기준</caption>
          <thead>
            <tr className={typographyTableHeaderRowClass}>
              <th scope="col" className={typographyTableHeaderCellClass}>구조</th>
              <th scope="col" className={typographyTableHeaderCellClass}>범위</th>
              <th scope="col" className={typographyTableHeaderCellClass}>사용</th>
            </tr>
          </thead>
          <tbody>
            {headingUsageRows.map(({ structure, range, usage }) => (
              <tr key={structure} className={typographyTableBodyRowClass}>
                <td className="px-4 py-4 text-body-medium foreground-default">{structure}</td>
                <td className="px-4 py-4 text-body-medium foreground-default">{range}</td>
                <td className="px-4 py-4 text-body-medium foreground-default">{usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TypographyBodyUsageTable() {
  return (
    <div aria-labelledby="typography-body-usage" className="mb-8">
      <h5 id="typography-body-usage" className="m-0 mb-4 text-label-small font-bold foreground-subtle">계층별 사용</h5>
      <div className={typographyTableFrameClass}>
        <table className="w-full min-w-[48rem] border-collapse text-left">
          <caption className="sr-only">Body 계층별 사용 기준</caption>
          <thead>
            <tr className={typographyTableHeaderRowClass}>
              <th scope="col" className={typographyTableHeaderCellClass}>범위</th>
              <th scope="col" className={typographyTableHeaderCellClass}>사용</th>
            </tr>
          </thead>
          <tbody>
            {bodyUsageRows.map(({ range, usage }) => (
              <tr key={range} className={typographyTableBodyRowClass}>
                <td className="px-4 py-4 text-body-medium foreground-default">{range}</td>
                <td className="px-4 py-4 text-body-medium foreground-default">{usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TypographyScaleTable() {
  return (
    <div className="flex flex-col gap-20">
      <TypographyScaleSpecTable
        title="Display"
        description="페이지 대표 제목과 강한 시각적 진입점에 사용하는 가장 큰 제목 계층입니다."
        rows={displayScaleSpecs}
      />
      <TypographyScaleSpecTable
        title="Heading"
        description="콘텐츠 내부의 섹션 제목과 정보 구조를 단계적으로 구분하는 제목 계층입니다."
        rows={headingScaleSpecs}
        usage={<TypographyHeadingUsageTable />}
      />
      <TypographyScaleSpecTable
        title="Body"
        description="본문, 안내 문장, 긴 설명처럼 읽기 흐름이 중요한 텍스트에 사용하는 기본 계층입니다."
        rows={bodyScaleSpecs}
        usage={<TypographyBodyUsageTable />}
      />
      <TypographyScaleSpecTable
        title="Label"
        description="컴포넌트 구성 내 label, placeholder 등에 사용한다."
        rows={labelScaleSpecs}
      />
      <TypographyScaleSpecTable
        title="Caption"
        description="메타 정보, 보조 수치, 짧은 캡션에 사용하는 최소 텍스트 토큰입니다."
        rows={captionScaleSpecs}
      />
    </div>
  );
}

export const spacingTokens = [
  { name: "space-0", cssVar: "--space-0", px: "0", rem: "0", utility: "p-0 / m-0 / gap-0" },
  { name: "space-1", cssVar: "--space-1", px: "4px", rem: "0.25rem", utility: "p-1 / m-1 / gap-1" },
  { name: "space-2", cssVar: "--space-2", px: "8px", rem: "0.5rem", utility: "p-2 / m-2 / gap-2" },
  { name: "space-3", cssVar: "--space-3", px: "12px", rem: "0.75rem", utility: "p-3 / m-3 / gap-3" },
  { name: "space-4", cssVar: "--space-4", px: "16px", rem: "1rem", utility: "p-4 / m-4 / gap-4" },
  { name: "space-5", cssVar: "--space-5", px: "20px", rem: "1.25rem", utility: "p-5 / m-5 / gap-5" },
  { name: "space-6", cssVar: "--space-6", px: "24px", rem: "1.5rem", utility: "p-6 / m-6 / gap-6" },
  { name: "space-8", cssVar: "--space-8", px: "32px", rem: "2rem", utility: "p-8 / m-8 / gap-8" },
  { name: "space-10", cssVar: "--space-10", px: "40px", rem: "2.5rem", utility: "p-10 / m-10 / gap-10" },
  { name: "space-12", cssVar: "--space-12", px: "48px", rem: "3rem", utility: "p-12 / m-12 / gap-12" },
  { name: "space-16", cssVar: "--space-16", px: "64px", rem: "4rem", utility: "p-16 / m-16 / gap-16" },
  { name: "space-20", cssVar: "--space-20", px: "80px", rem: "5rem", utility: "p-20 / m-20 / gap-20" },
];

export const radiusTokens = [
  { name: "radius-none", px: "0", rem: "0", utility: "rounded-none" },
  { name: "radius-sm", px: "6px", rem: "0.375rem", utility: "rounded-sm" },
  { name: "radius-md", px: "8px", rem: "0.5rem", utility: "rounded-md" },
  { name: "radius-lg", px: "10px", rem: "0.625rem", utility: "rounded-lg" },
  { name: "radius-xl", px: "12px", rem: "0.75rem", utility: "rounded-xl" },
  { name: "radius-2xl", px: "16px", rem: "1rem", utility: "rounded-2xl" },
  { name: "radius-full", px: "pill", rem: "9999rem", utility: "rounded-full" },
];

export const fixedSizeTokens = [
  { name: "icon-xs", cssVar: "--size-icon-xs", px: "16px", rem: "1rem", utility: "size-icon-xs" },
  { name: "icon-sm", cssVar: "--size-icon-sm", px: "20px", rem: "1.25rem", utility: "size-icon-sm" },
  { name: "icon-md", cssVar: "--size-icon-md", px: "24px", rem: "1.5rem", utility: "size-icon-md" },
  { name: "icon-lg", cssVar: "--size-icon-lg", px: "32px", rem: "2rem", utility: "size-icon-lg" },
  { name: "icon-xl", cssVar: "--size-icon-xl", px: "40px", rem: "2.5rem", utility: "size-icon-xl" },
  { name: "spinner-sm", cssVar: "--size-spinner-sm", px: "20px", rem: "1.25rem", utility: "size-spinner-sm" },
  { name: "spinner-md", cssVar: "--size-spinner-md", px: "32px", rem: "2rem", utility: "size-spinner-md" },
  { name: "spinner-lg", cssVar: "--size-spinner-lg", px: "48px", rem: "3rem", utility: "size-spinner-lg" },
  { name: "control-sm", cssVar: "--size-control-sm", px: "40px", rem: "2.5rem", utility: "size-control-sm" },
  { name: "control-md", cssVar: "--size-control-md", px: "48px", rem: "3rem", utility: "size-control-md" },
  { name: "control-lg", cssVar: "--size-control-lg", px: "56px", rem: "3.5rem", utility: "size-control-lg" },
  { name: "control-xl", cssVar: "--size-control-xl", px: "64px", rem: "4rem", utility: "size-control-xl" },
];

export const iconSizeTokens = fixedSizeTokens.filter(({ name }) => name.startsWith("icon"));
export const spinnerSizeTokens = fixedSizeTokens.filter(({ name }) => name.startsWith("spinner"));
export const controlSizeTokens = fixedSizeTokens.filter(({ name }) => name.startsWith("control"));

export type IconStyle = "outline" | "filled";

export type IconCatalogEntry = {
  id: string;
  label: string;
  innerMarkup: string;
};

export const outlineIconCatalog: readonly IconCatalogEntry[] = [
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
    id: "check",
    label: "확인",
    innerMarkup: '<polyline points="20 6 9 17 4 12" />',
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

export const filledIconCatalog: readonly IconCatalogEntry[] = [];

/** id로 outline 아이콘을 조회 — 큐레이션 카탈로그를 컴포넌트 소비의 SSOT로 사용. */
export const outlineIconById = Object.fromEntries(
  outlineIconCatalog.map((icon) => [icon.id, icon]),
) as Record<string, IconCatalogEntry>;

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

export function buildIconSvgMarkup(style: IconStyle, utility: string, innerMarkup: string) {
  if (style === "filled") {
    return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" class="${utility} shrink-0 foreground-default">\n  ${innerMarkup}\n</svg>`;
  }
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="${utility} shrink-0 foreground-default">\n  ${innerMarkup}\n</svg>`;
}

export function ProjectIconGlyph({
  innerMarkup,
  className,
  style = "outline",
}: {
  innerMarkup: string;
  className?: string;
  style?: IconStyle;
}) {
  const resolvedClassName = className ?? "size-icon-md shrink-0 foreground-default";

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

export function IconCopyCell({
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
        <ProjectIconGlyph innerMarkup={innerMarkup} className={`${utility} shrink-0 foreground-default`} style={style} />
        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label={`${label} ${iconId} ${utility} SVG 마크업 복사`}
          className="absolute bottom-1 right-1 inline-flex h-5 cursor-pointer items-center justify-center rounded border border-default bg-background px-1.5 text-caption font-semibold uppercase leading-none text-gray-60 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:foreground-default focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
        >
          copy
        </button>
      </div>
    </td>
  );
}

export function IconSizeMatrix({ catalog, style }: { catalog: readonly IconCatalogEntry[]; style: IconStyle }) {
  const styleLabel = style === "outline" ? "Outline" : "Filled";

  if (catalog.length === 0) {
    return (
      <div className="rounded-xl border border-default bg-gray-10 p-6">
        <p className="m-0 text-body-small text-gray-70">
          <strong>{styleLabel}</strong> 아이콘 세트가 아직 등록되지 않았습니다. 글리프를 추가하면 이 표에 크기별 배리에이션이 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-default">
      <table className="w-full min-w-[44rem] border-collapse text-left">
        <caption className="sr-only">{styleLabel} Icon — Tailwind utility class 크기별 배리에이션</caption>
        <thead>
          <tr className="border-b border-default bg-gray-5">
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Icon</span>
            </th>
            {iconSizeTokens.map((token) => (
              <th key={token.name} scope="col" className="px-3 py-3 text-center align-middle">
                <span className="font-mono text-label-xsmall font-semibold foreground-default">
                  {token.utility} ({token.px})
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {catalog.map(({ id, label, innerMarkup }) => (
            <tr key={id} className="border-b border-default last:border-b-0">
              <th scope="row" className="px-4 py-4 align-middle">
                <span className="font-mono text-caption text-gray-60">{id}</span>
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

export function IconStyleCuration({ style }: { style: IconStyle }) {
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
              <span className="text-label-medium font-bold foreground-default">{source.name}</span>
              <span className="text-caption font-semibold foreground-brand">{source.style}</span>
            </div>
            <p className="m-0 mt-0.5 font-mono text-caption text-gray-60">
              {source.sourceUrl ? (
                <>
                  <a
                    href={source.sourceUrl}
                    className="foreground-brand underline-offset-2 hover:underline"
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
                  <dt className="m-0 font-mono text-caption text-gray-60">{label}</dt>
                  <dd className="m-0 font-mono text-caption foreground-default">{value}</dd>
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

export const gridColumnTokens = [
  { name: "grid-cols-1", cols: 1, utility: "grid-cols-1" },
  { name: "grid-cols-2", cols: 2, utility: "grid-cols-2" },
  { name: "grid-cols-3", cols: 3, utility: "grid-cols-3" },
  { name: "grid-cols-4", cols: 4, utility: "grid-cols-4" },
  { name: "grid-cols-6", cols: 6, utility: "grid-cols-6" },
  { name: "grid-cols-12", cols: 12, utility: "grid-cols-12" },
];

export const gridRowTokens = [
  { name: "grid-rows-1", rows: 1, utility: "grid-rows-1" },
  { name: "grid-rows-2", rows: 2, utility: "grid-rows-2" },
  { name: "grid-rows-3", rows: 3, utility: "grid-rows-3" },
  { name: "grid-rows-4", rows: 4, utility: "grid-rows-4" },
  { name: "grid-rows-6", rows: 6, utility: "grid-rows-6" },
];

export const levelStyle: Record<ContrastLevel, { bg: string; color: string; label: string }> = {
  AAA:        { bg: "var(--ds-guide-level-aaa-bg)",  color: "var(--ds-guide-level-aaa-fg)",  label: "AAA" },
  AA:         { bg: "var(--ds-guide-level-aa-bg)",   color: "var(--ds-guide-level-aa-fg)",   label: "AA" },
  "AA Large": { bg: "var(--ds-guide-level-warn-bg)", color: "var(--ds-guide-level-warn-fg)", label: "AA Large" },
  Fail:       { bg: "var(--ds-guide-level-fail-bg)", color: "var(--ds-guide-level-fail-fg)", label: "Fail" },
};

/** 명암비 결과 카드 — 숫자 배경 */
export const contrastResultSurfaceClass = "rounded-xl bg-gray-5";

export function LevelBadge({ level }: { level: ContrastLevel }) {
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

/** 통과/실패 아이콘 — 기존 status foreground 토큰으로 상태를 드러낸다. */
export function ContrastCircle({ passed }: { passed: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex items-center justify-center shrink-0 size-icon-md rounded-full",
        passed ? "bg-positive foreground-inverse" : "bg-negative foreground-inverse",
      ].join(" ")}
    >
      <NavIcon
        innerMarkup={(passed ? outlineIconById.check : outlineIconById.close).innerMarkup}
        className="size-icon-xs"
      />
    </span>
  );
}

const contrastPickPaletteIcon =
  '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor" stroke="none" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" stroke="none" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" stroke="none" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" stroke="none" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />';
const contrastPickChevronIcon = '<polyline points="9 18 15 12 9 6" />';
export const contrastPickCloseIcon = '<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />';

/** raw 팔레트 견본 — 체커보드 위에 raw 고정색(모드 무관). ds 반사색·페이지 배경과의 WAVE 비텍스트 대비 오검 방지 */
export function rawPaletteSwatchClass(isBg: boolean, isText: boolean, isInteractive: boolean, extra = "") {
  const isSelected = isBg || isText;
  return [
    "h-10 rounded-md relative overflow-hidden isolate",
    extra,
    isInteractive ? "cursor-pointer border-0 p-0 transition-[opacity,box-shadow,transform] duration-150" : "",
    isSelected
      ? "z-[1] scale-[1.04] shadow-md ring-2 ring-foreground-default ring-offset-2 ring-offset-background"
      : "",
    isInteractive && !isSelected ? "opacity-90 hover:opacity-100 hover:scale-[1.02]" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function RawPaletteSwatchFill({ cssVar, checker }: { cssVar: string; checker: React.CSSProperties }) {
  return (
    <>
      <span aria-hidden="true" className="absolute inset-0 block" style={checker} />
      <span aria-hidden="true" className="absolute inset-0 block" style={{ backgroundColor: cssVar }} />
    </>
  );
}

/** Contrast Checker 피커 — hex 고정색을 체커보드 위에 표시(어두운 견본·페이지 배경과의 WAVE 비텍스트 오검 방지) */
export function ContrastSwatchFill({ hex, checker }: { hex: string; checker: React.CSSProperties }) {
  return (
    <>
      <span aria-hidden="true" className="absolute inset-0 block" style={checker} />
      <span aria-hidden="true" className="absolute inset-0 block" style={{ backgroundColor: hex }} />
    </>
  );
}

/** BG·TXT 역할 배지 — 스와치 명도와 무관하게 background+테두리로 대비 확보 */
export function ContrastSwatchRoleMarker({ role }: { role: "BG" | "TXT" }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "absolute top-1 left-1 z-[1] rounded border-2 bg-background px-1.5 py-0.5 text-caption font-bold leading-none shadow-sm",
        "border-foreground-default foreground-default",
      ].join(" ")}
    >
      {role}
    </span>
  );
}

export function ContrastColorPickButton({
  labelId,
  labelText,
  valueId,
  actionId,
  swatchHex,
  colorLabel,
  colorHex,
  isSelecting,
  checker,
  onToggle,
}: {
  labelId: string;
  labelText: string;
  valueId: string;
  actionId: string;
  swatchHex: string;
  colorLabel: string;
  colorHex: string;
  isSelecting: boolean;
  checker: React.CSSProperties;
  onToggle: () => void;
}) {
  return (
    <div>
      <p id={labelId} className="mb-1.5 text-label-xsmall font-semibold foreground-default">
        {labelText}
      </p>
      <button
        type="button"
        onClick={onToggle}
        aria-labelledby={`${labelId} ${valueId} ${actionId}`}
        aria-expanded={isSelecting}
        className={[
          "group w-full flex items-center gap-3 rounded-xl border-0 py-3 px-4 text-left cursor-pointer transition-[background-color,box-shadow] duration-150",
          isSelecting
            ? "bg-gray-10 shadow-sm ring-2 ring-foreground-default"
            : "surface-subtle hover:bg-gray-10 hover:shadow-sm hover:ring-1 hover:ring-default",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className={[
            "relative block size-8 shrink-0 overflow-hidden isolate rounded-md border border-default transition-transform duration-150",
            isSelecting ? "scale-105 ring-2 ring-foreground-default ring-offset-1 ring-offset-background" : "group-hover:scale-105",
          ].join(" ")}
        >
          <ContrastSwatchFill hex={swatchHex} checker={checker} />
        </span>
        <span className="flex min-w-0 flex-col text-left">
          <span className="text-label-small font-semibold foreground-default">{colorLabel}</span>
          <span id={valueId} className="text-caption text-gray-70 font-mono numeric-tabular">{colorHex}</span>
        </span>
        <span
          id={actionId}
          className={[
            "ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-label-xsmall font-semibold transition-colors duration-150",
            isSelecting
              ? "border-foreground-default bg-gray-10 foreground-default"
              : "border-strong bg-background foreground-default group-hover:border-foreground-default",
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
export function ContrastCriterionBox({ grade, threshold, passed }: { grade: string; threshold: string; passed: boolean }) {
  return (
    <div className={`flex items-center gap-2 py-2.5 px-3 ${contrastResultSurfaceClass}`}>
      <ContrastCircle passed={passed} />
      <span className="text-label-small font-bold foreground-default">{grade}</span>
      <span className="ml-auto text-caption text-gray-70 numeric-tabular">{threshold}</span>
    </div>
  );
}

/** 명암비 결과 카드의 카테고리(제목 + AA·AAA 박스). */
export function ContrastCategory({
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
      <p className="text-label-xsmall font-semibold text-gray-60 mb-2">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        <ContrastCriterionBox grade="AA" threshold={aa.threshold} passed={aa.passed} />
        <ContrastCriterionBox grade="AAA" threshold={aaa.threshold} passed={aaa.passed} />
      </div>
    </div>
  );
}

export function TokenValue({ px, rem }: { px: string; rem: string }) {
  return (
    <span className="flex flex-col leading-base font-mono">
      <span className="text-label-xsmall font-semibold numeric-tabular foreground-default">{px}</span>
      <span className="text-caption foreground-muted numeric-tabular">{rem}</span>
    </span>
  );
}

export function MeasureBar({
  cssVar,
  label,
  height = pxToRem(12),
  variant = "bar",
}: {
  cssVar: string;
  label: string;
  height?: string;
  variant?: "bar" | "gap";
}) {
  if (variant === "gap") {
    return (
      <div role="img" aria-label={label} className="flex h-control-md items-center">
        <span
          aria-hidden="true"
          className="block h-6 rounded-sm bg-foreground-brand"
          style={{ width: `var(${cssVar})` }}
        />
      </div>
    );
  }

  return (
    <div className="h-9 surface-subtle border border-default flex items-center px-3">
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

export function GridColumnPreview({ cols, utility, label }: { cols: number; utility: string; label: string }) {
  const cellHeight = cols >= 6 ? pxToRem(24) : pxToRem(32);
  return (
    <div
      role="img"
      aria-label={label}
      className={`grid gap-2 ${utility}`}
    >
      {Array.from({ length: cols }, (_, i) => (
        <div key={i} className="surface-brand" style={{ height: cellHeight }} aria-hidden="true" />
      ))}
    </div>
  );
}

export function GridRowPreview({ rows, utility, label }: { rows: number; utility: string; label: string }) {
  const cellHeight = rows >= 6 ? pxToRem(14) : pxToRem(24);
  return (
    <div
      role="img"
      aria-label={label}
      className={`grid gap-2 ${utility}`}
    >
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="surface-brand" style={{ height: cellHeight }} aria-hidden="true" />
      ))}
    </div>
  );
}

export type SwatchInfo = { hex: string; label: string };

export function NavIcon({
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

export const navIconColor = (
  <NavIcon>
    <circle cx="8" cy="8" r="3.5" />
    <circle cx="16" cy="10" r="3.5" />
    <circle cx="11" cy="16" r="3.5" />
  </NavIcon>
);

export const navIconType = (
  <NavIcon>
    <path d="M4 7h16" />
    <path d="M7 12h10" />
    <path d="M10 17h4" />
  </NavIcon>
);

export const navIconSpacing = (
  <NavIcon>
    <path d="M4 8h16" />
    <path d="M4 16h16" />
    <path d="M12 8v8" />
    <path d="M9 12h6" />
  </NavIcon>
);

export const navIconGrid = (
  <NavIcon>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </NavIcon>
);

export const navIconLayout = (
  <NavIcon>
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <path d="M4 9h16" />
    <path d="M8 5v14" />
  </NavIcon>
);

export const navIconAssets = (
  <NavIcon>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <circle cx="17.5" cy="6.5" r="2.5" />
    <path d="M14 14l7 7" />
    <path d="M3 17l5-5" />
  </NavIcon>
);

export function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <NavIcon className={className ?? "size-icon-xs shrink-0"}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </NavIcon>
  );
}

export function LinkIcon({ className }: { className?: string }) {
  return (
    <NavIcon className={className ?? "size-icon-xs shrink-0"}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </NavIcon>
  );
}

export function ExternalTextLink({
  href,
  children,
  className = "text-body-small foreground-brand",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-start gap-1.5 ${className}`}
    >
      <LinkIcon className="mt-0.5 size-icon-xs shrink-0" />
      <span className="break-all underline-offset-2 group-hover:underline group-focus-visible:underline">
        {children}
      </span>
      <span className="sr-only">(새 창에서 열림)</span>
    </a>
  );
}

export const themeIconSun = (
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

export const themeIconMoon = (
  <NavIcon className="size-icon-md shrink-0">
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />
  </NavIcon>
);

export const scrollToTopIcon = (
  <NavIcon className="size-icon-md shrink-0">
    <polyline points="18 15 12 9 6 15" />
  </NavIcon>
);

export const guideFabButtonClass =
  "inline-flex size-control-lg cursor-pointer items-center justify-center rounded-full border-0 elevation-floating transition-[transform,box-shadow,opacity] duration-300 ease-out hover:scale-105 active:scale-100 active:duration-150";

export const guideFabAccentClass = `${guideFabButtonClass} bg-accent text-on-accent`;
export const guideFabBrandClass = `${guideFabButtonClass} surface-brand foreground-inverse`;
export const guideFabSurfaceClass = `${guideFabButtonClass} surface-brand-subtle foreground-brand-strong ring-1 ring-brand`;

export const GUIDE_SCROLL_TOP_THRESHOLD = 240;

export type NavSubTreeItem = {
  label: string;
  active: boolean;
  onClick: () => void;
};

export function NavSubTree({
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
      className="m-0 ml-5 flex list-none flex-col gap-0.5 border-l border-default py-1 pl-4 pr-1"
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
              <NavIcon className="size-icon-xs shrink-0 foreground-brand">
                <path d="M9 6l6 6-6 6" />
              </NavIcon>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
