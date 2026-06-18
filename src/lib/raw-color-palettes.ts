/**
 * Raw hue 팔레트 — KRDS 표준형 hex, hue 기반 family 이름만 사용.
 * KRDS 5~90 → 프로젝트 50~900. 시맨틱 역할(primary·danger 등)은 semantic 토큰에서 매핑.
 * @see https://www.krds.go.kr/html/site/style/style_02.html
 */

export type PrimitiveColorFamily = {
  family: string;
  name: string;
  swatches: { scale: number; hex: string }[];
};

const KRDS_STEP_TO_SCALE: Record<number, number> = {
  5: 50,
  10: 100,
  20: 200,
  30: 300,
  40: 400,
  50: 500,
  60: 600,
  70: 700,
  80: 800,
  90: 900,
};

function krdsPalette(steps: Record<number, string>): PrimitiveColorFamily["swatches"] {
  return Object.entries(steps)
    .map(([step, hex]) => ({
      scale: KRDS_STEP_TO_SCALE[Number(step)],
      hex: hex.toUpperCase(),
    }))
    .sort((a, b) => a.scale - b.scale);
}

/** hue 순: Red → Rose → Orange → Green → Cyan → Blue → Navy → Gray */
export const primitiveColors: PrimitiveColorFamily[] = [
  {
    family: "Red",
    name: "red",
    swatches: krdsPalette({
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
    }),
  },
  {
    family: "Rose",
    name: "rose",
    swatches: krdsPalette({
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
    }),
  },
  {
    family: "Orange",
    name: "orange",
    swatches: krdsPalette({
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
    }),
  },
  {
    family: "Green",
    name: "green",
    swatches: krdsPalette({
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
    }),
  },
  {
    family: "Cyan",
    name: "cyan",
    swatches: krdsPalette({
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
    }),
  },
  {
    family: "Blue",
    name: "blue",
    swatches: krdsPalette({
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
    }),
  },
  {
    family: "Navy",
    name: "navy",
    swatches: krdsPalette({
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
    }),
  },
  {
    family: "Gray",
    name: "gray",
    swatches: krdsPalette({
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
    }),
  },
];
