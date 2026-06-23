"use client";

import { useRef } from "react";
import { layoutPageColSpanFull } from "@/lib/layout-tokens";
import {
  contentSubTabPanelClass,
  ContentIntroLayout,
  ContentOutlineTabList,
  ContentTitleBlock,
  GuideContentLayout,
  IconSizeMatrix,
  IconStyleCuration,
  filledIconCatalog,
  filledIconsTocSections,
  outlineIconCatalog,
  outlineIconsTocSections,
} from "@/components/guide/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { guideIconsTabHref } from "@/lib/guide-routes";

export function GuideIconsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeIconsTab = searchParams.get("tab") === "filled" ? "filled" : "outline";
  const selectIconsSection = (sub: "outline" | "filled") => router.push(guideIconsTabHref(sub));
  const outlineIconTabRef = useRef<HTMLButtonElement>(null);
  const filledIconTabRef = useRef<HTMLButtonElement>(null);
  function handleIconsTabKeyDown(e: React.KeyboardEvent) {
    const order: ("outline" | "filled")[] = ["outline", "filled"];
    const refs = { outline: outlineIconTabRef, filled: filledIconTabRef };
    let next: "outline" | "filled" | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(order.indexOf(activeIconsTab) + 1) % order.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(order.indexOf(activeIconsTab) - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) { e.preventDefault(); selectIconsSection(next); refs[next].current?.focus(); }
  }
  return (
    <div className={layoutPageColSpanFull}>
        <ContentIntroLayout>
          <ContentTitleBlock
            title="Icons"
            titleId="content-icons"
          />

          <ContentOutlineTabList
            ariaLabel="아이콘 스타일"
            activeValue={activeIconsTab}
            onSelect={(value) => selectIconsSection(value as "outline" | "filled")}
            onKeyDown={handleIconsTabKeyDown}
            tabs={[
              { value: "outline", tabId: "tab-icons-outline", panelId: "panel-icons-outline", label: "Outline", ref: outlineIconTabRef },
              { value: "filled", tabId: "tab-icons-filled", panelId: "panel-icons-filled", label: "Filled", ref: filledIconTabRef },
            ]}
          />

          </ContentIntroLayout>

          <div role="tabpanel" id="panel-icons-outline" aria-labelledby="tab-icons-outline" hidden={activeIconsTab !== "outline"} className={contentSubTabPanelClass}>
            <GuideContentLayout sections={outlineIconsTocSections}>
              <IconStyleCuration style="outline" />
            </GuideContentLayout>
          </div>

          <div role="tabpanel" id="panel-icons-filled" aria-labelledby="tab-icons-filled" hidden={activeIconsTab !== "filled"} className={contentSubTabPanelClass}>
            <GuideContentLayout sections={filledIconsTocSections}>
              <IconStyleCuration style="filled" />
            </GuideContentLayout>
          </div>
        
    </div>
  );
}
