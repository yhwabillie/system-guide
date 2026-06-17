import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Responsive Layout Guide — system-guide",
  description: "breakpoint별 container·grid 변화를 확인하는 반응형 레이아웃 가이드",
};

export default function ResponsiveGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
