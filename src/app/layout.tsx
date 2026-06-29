import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { fontSizeCssVars } from "@/lib/tokens";
import { THEME_STORAGE_KEY } from "@/lib/theme-preference";
import "./globals.css";

// 기본 폰트 — Pretendard GOV (자체 호스팅, variable woff2)
const pretendardGov = localFont({
  src: "./fonts/PretendardGOVVariable.woff2",
  weight: "100 900",
  variable: "--font-pretendard-gov",
  display: "swap",
});

// 폴백 폰트 — Noto Sans KR (자체 호스팅). Pretendard 미로드 시에만 사용되므로
// preload: false 로 평상시 다운로드를 막음. 타이포 토큰·Pretendard 쇼케이스와 동일 weight 제공.
const notoSansKR = localFont({
  src: [
    { path: "./fonts/NotoSansKR-100.woff2", weight: "100", style: "normal" },
    { path: "./fonts/NotoSansKR-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/NotoSansKR-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/NotoSansKR-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/NotoSansKR-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/NotoSansKR-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-noto",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "디자인 시스템 가이드 — system-guide",
  description: "컬러·타이포·레이아웃 토큰 큐레이션과 Tailwind 유틸리티, KWCAG 웹접근성 대비 검증을 제공하는 디자인 시스템 가이드",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 서버가 요청 쿠키에서 테마를 읽어 <html class="dark">를 직접 렌더한다.
  // → 서버·클라이언트 첫 렌더가 동일해 FOUC·hydration mismatch가 없다(인라인 스크립트 불필요).
  const cookieStore = await cookies();
  const isDark = cookieStore.get(THEME_STORAGE_KEY)?.value === "dark";

  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${pretendardGov.variable} ${notoSansKR.variable} h-full antialiased${isDark ? " dark" : ""}`}
    >
      <body className="min-h-full flex flex-col">
        {/* 타이포 스케일·행간 단일 소스(tokens.ts)에서 생성한 --font-size-*·--font-line 주입 */}
        <style dangerouslySetInnerHTML={{ __html: fontSizeCssVars() }} />
        {children}
      </body>
    </html>
  );
}
