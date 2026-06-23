import type { Metadata } from "next";
import { Suspense } from "react";
import { GuideLayout } from "@/components/guide/guide-layout";
import { GuideThemeProvider } from "@/components/guide/guide-theme-provider";

export const metadata: Metadata = {
  title: "디자인 시스템 가이드 — system-guide",
  description:
    "컬러·타이포·레이아웃 토큰 큐레이션과 Tailwind 유틸리티, KWCAG 웹접근성 대비 검증을 제공하는 디자인 시스템 가이드",
};

export default function GuideRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuideThemeProvider>
      <Suspense fallback={null}>
        <GuideLayout>{children}</GuideLayout>
      </Suspense>
    </GuideThemeProvider>
  );
}
