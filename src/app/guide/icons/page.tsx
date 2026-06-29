import { Suspense } from "react";
import { GuideIconsPage } from "@/components/guide/pages/icons-page";

export default function IconsGuideRoutePage() {
  return (
    <Suspense fallback={null}>
      <GuideIconsPage />
    </Suspense>
  );
}
