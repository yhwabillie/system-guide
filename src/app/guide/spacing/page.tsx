import { Suspense } from "react";
import { GuideSpacingPage } from "@/components/guide/pages/spacing-page";

export default function SpacingGuideRoutePage() {
  return (
    <Suspense fallback={null}>
      <GuideSpacingPage />
    </Suspense>
  );
}
