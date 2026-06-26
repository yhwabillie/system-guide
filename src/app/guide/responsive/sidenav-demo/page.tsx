"use client";

import { pxToRem } from "@/lib/tokens";
import {
  layoutSidenavContentClass,
  layoutSidenavMenuClass,
  layoutPageColSpanAside,
  layoutPageColSpanFull,
  layoutPageColSpanMain,
} from "@/lib/layout-tokens";

function DemoCell({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`surface-brand foreground-inverse flex min-w-0 items-center justify-center font-semibold rounded-md ${className ?? ""}`}
      style={{ minHeight: pxToRem(48) }}
    >
      <span className="text-caption numeric-tabular leading-none font-semibold">
        {label}
      </span>
    </div>
  );
}

export default function SidenavDemoPage() {
  return (
    <div className="layout-page-wrapper">
      {/* layout-site-header */}
      <header className="layout-site-header flex items-center">
        <p className="m-0 text-label-small font-bold foreground-default">사이트 헤더</p>
      </header>

      {/* layout-sidenav */}
      <div className="layout-sidenav">
        {/* layout-sidenav-menu */}
        <nav className={layoutSidenavMenuClass}>
          <p className="m-0 mb-4 text-label-small font-bold foreground-brand">사이드 메뉴</p>
          <ul className="m-0 p-0 pl-4 list-disc flex flex-col gap-3 text-body-small foreground-subtle">
            <li>메뉴 항목 1</li>
            <li>메뉴 항목 2</li>
            <li>메뉴 항목 3</li>
            <li>메뉴 항목 4</li>
            <li>메뉴 항목 5</li>
          </ul>
        </nav>

        {/* layout-sidenav-content */}
        <main className={layoutSidenavContentClass}>
          <header className={`${layoutPageColSpanFull} pt-10 pb-6`}>
            <h1 className="m-0 text-heading-medium font-bold foreground-brand">layout-sidenav 데모</h1>
            <p className="m-0 mt-2 text-body-small foreground-subtle">
              스크롤하면서 왼쪽 사이드메뉴가 고정되는 것을 확인하세요.
            </p>
          </header>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={`${layoutPageColSpanFull} mb-8`}>
              <p className="m-0 mb-2 text-label-xsmall font-semibold foreground-muted">섹션 {i + 1}</p>
              <DemoCell label="전체 폭 (col-span full)" />
              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
                <DemoCell label="본문 8/12" />
                <DemoCell label="보조 4/12" />
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
