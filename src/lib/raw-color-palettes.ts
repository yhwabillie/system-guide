/**
 * Raw hue 팔레트 — KRDS 표준형 hex + 프로젝트 Violet 스케일.
 * 스케일 단위: 0 · 5 · 10 · 20 · 30 · 40 · 50 · 60 · 70 · 80 · 90 · 95 · 100 (KRDS 5~90 + 양끝 0·95·100).
 * Violet 50 앵커 = #5B4CF0 (시맨틱 accent에서 매핑).
 * @see https://www.krds.go.kr/html/site/style/style_02.html
 */

export type PrimitiveColorFamily = {
  family: string;
  name: string;
  swatches: { scale: number; hex: string }[];
};

/** Raw 팔레트 공통 스케일 단위 — 첨부 가이드(기본 모드)와 동일 */
export const RAW_COLOR_SCALE_UNITS = [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100] as const;

/** KRDS 원본 스케일 단위(5~90). 램프 양끝 0·95·100은 rampEndpoints()로 보강 */
export const KRDS_SCALE_UNITS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90] as const;

export type RawColorScaleUnit = (typeof RAW_COLOR_SCALE_UNITS)[number];

/** 다크 모드 스케일 반사 — u ↔ 100−u */
export function invertRawScaleUnit(unit: number): number {
  return 100 - unit;
}


function rampEndpoints(steps: Record<number, string>): Record<number, string> {
  const hex90 = steps[90];
  const [r, g, b] = [
    parseInt(hex90.slice(1, 3), 16),
    parseInt(hex90.slice(3, 5), 16),
    parseInt(hex90.slice(5, 7), 16),
  ];
  const mid = (n: number) => Math.round(n / 2).toString(16).padStart(2, "0");
  const hex95 = `#${mid(r)}${mid(g)}${mid(b)}`.toUpperCase();
  return { 0: "#FFFFFF", ...steps, 95: hex95, 100: "#000000" };
}

function paletteFromSteps(steps: Record<number, string>): PrimitiveColorFamily["swatches"] {
  return Object.entries(steps)
    .map(([step, hex]) => ({
      scale: Number(step),
      hex: hex.toUpperCase(),
    }))
    .sort((a, b) => a.scale - b.scale);
}

/** hue 순: Red → Rose → Orange → Green → Cyan → Blue → Violet → Navy → Gray */
export const primitiveColors: PrimitiveColorFamily[] = [
  {
    family: "Red",
    name: "red",
    swatches: paletteFromSteps(rampEndpoints({
      5: "#fdefec",
      10: "#fcdfd9",
      20: "#f7afa1",
      30: "#f48771",
      40: "#f05f42",
      50: "#de3412",
      60: "#bd2c0f",
      70: "#8a240f",
      80: "#5c180a",
      90: "#390d05",
    })),
  },
  {
    family: "Rose",
    name: "rose",
    swatches: paletteFromSteps(rampEndpoints({
      5: "#fbeff0",
      10: "#f5d6d9",
      20: "#ebadb2",
      30: "#e0858c",
      40: "#d65c66",
      50: "#d63d4a",
      60: "#ab2b36",
      70: "#7a1f26",
      80: "#521419",
      90: "#310c0f",
    })),
  },
  {
    family: "Orange",
    name: "orange",
    swatches: paletteFromSteps(rampEndpoints({
      5: "#fff3db",
      10: "#ffe0a3",
      20: "#ffc95c",
      30: "#ffb114",
      40: "#c78500",
      50: "#9e6a00",
      60: "#8a5c00",
      70: "#614100",
      80: "#422c00",
      90: "#2e1f00",
    })),
  },
  {
    family: "Green",
    name: "green",
    swatches: paletteFromSteps(rampEndpoints({
      5: "#eaf6ec",
      10: "#d8eedd",
      20: "#a9dab4",
      30: "#7ec88e",
      40: "#3fa654",
      50: "#228738",
      60: "#267337",
      70: "#285d33",
      80: "#1f4727",
      90: "#122b18",
    })),
  },
  {
    family: "Cyan",
    name: "cyan",
    swatches: paletteFromSteps(rampEndpoints({
      5: "#e7f4fe",
      10: "#d3ebfd",
      20: "#9ed2fa",
      30: "#5fb5f7",
      40: "#2098f3",
      50: "#0b78cb",
      60: "#096ab3",
      70: "#085691",
      80: "#053961",
      90: "#03253f",
    })),
  },
  {
    family: "Blue",
    name: "blue",
    swatches: paletteFromSteps(rampEndpoints({
      5: "#ecf2fe",
      10: "#d8e5fd",
      20: "#b1cefb",
      30: "#86aff9",
      40: "#4c87f6",
      50: "#256ef4",
      60: "#0b50d0",
      70: "#083891",
      80: "#052561",
      90: "#03163a",
    })),
  },
  {
    family: "Violet",
    name: "violet",
    swatches: paletteFromSteps({
      0: "#ffffff",
      5: "#efedfe",
      10: "#dedbfc",
      20: "#bdb7f9",
      30: "#9d94f6",
      40: "#7c70f3",
      50: "#5b4cf0",
      60: "#493dc0",
      70: "#372e90",
      80: "#241e60",
      90: "#120f30",
      95: "#090818",
      100: "#000000",
    }),
  },
  {
    family: "Navy",
    name: "navy",
    swatches: paletteFromSteps(rampEndpoints({
      5: "#eef2f7",
      10: "#d6e0eb",
      20: "#bacbde",
      30: "#90b0d5",
      40: "#6b96c7",
      50: "#346fb2",
      60: "#1c589c",
      70: "#063a74",
      80: "#052b57",
      90: "#031f3f",
    })),
  },
  {
    family: "Gray",
    name: "gray",
    swatches: paletteFromSteps(rampEndpoints({
      5: "#f4f5f6",
      10: "#e6e8ea",
      20: "#cdd1d5",
      30: "#b1b8be",
      40: "#8a949e",
      50: "#6d7882",
      60: "#58616a",
      70: "#464c53",
      80: "#33363d",
      90: "#1e2124",
    })),
  },
];

/**
 * Utility 전용 raw hex — hue 팔레트(KRDS) 밖 단일 목적 색.
 * globals.css `--raw-utility-*` 와 동기화 유지.
 */
export const rawUtilityColors = {
  /** 포커스 링(outline) — 라이트 모드 */
  focusRing: "#00CBDE",
} as const;
