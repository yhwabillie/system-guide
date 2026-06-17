import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 기본 폰트 — Pretendard GOV (자체 호스팅, variable woff2)
const pretendardGov = localFont({
  src: "./fonts/PretendardGOVVariable.woff2",
  weight: "100 900",
  variable: "--font-pretendard-gov",
  display: "swap",
});

// 폴백 폰트 — Noto Sans KR (자체 호스팅). Pretendard 미로드 시에만 사용되므로
// preload: false 로 평상시 다운로드를 막음.
const notoSansKR = localFont({
  src: [
    { path: "./fonts/NotoSansKR-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/NotoSansKR-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-noto",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Design Token Preview — system-guide",
  description: "디자인 토큰(컬러·타이포·오버레이)과 웹접근성 대비 체커를 제공하는 디자인 시스템 가이드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendardGov.variable} ${notoSansKR.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
