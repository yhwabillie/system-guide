import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "layout-sidenav 데모 — system-guide",
  description: "layout-sidenav + layout-sidenav-menu 실제 동작을 확인하는 데모 페이지",
};

export default function SidenavDemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
