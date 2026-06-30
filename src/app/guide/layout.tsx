import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { GuideLayout } from "@/components/guide/guide-layout";
import { GuideThemeProvider } from "@/components/guide/guide-theme-provider";
import { THEME_STORAGE_KEY, type ColorMode } from "@/lib/theme-preference";
import { parseZoomCookie, ZOOM_COOKIE_KEY } from "@/lib/zoom-preference";

export const metadata: Metadata = {
  title: "디자인 시스템 가이드 — system-guide",
  description:
    "컬러·타이포·레이아웃 토큰 큐레이션과 Tailwind 유틸리티, KWCAG 웹접근성 대비 검증을 제공하는 디자인 시스템 가이드",
};

export default async function GuideRootLayout({ children }: { children: React.ReactNode }) {
  // 서버가 요청 쿠키에서 테마를 읽어 클라이언트와 동일한 초기 모드로 렌더한다.
  const cookieStore = await cookies();
  const initialColorMode: ColorMode = cookieStore.get(THEME_STORAGE_KEY)?.value === "dark" ? "dark" : "light";
  const initialZoom = parseZoomCookie(cookieStore.get(ZOOM_COOKIE_KEY)?.value);

  return (
    <GuideThemeProvider initialColorMode={initialColorMode}>
      <Suspense fallback={null}>
        <GuideLayout initialZoom={initialZoom}>{children}</GuideLayout>
      </Suspense>
    </GuideThemeProvider>
  );
}
