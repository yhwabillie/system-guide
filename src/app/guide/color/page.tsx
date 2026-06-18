import { Suspense } from "react";
import { GuideColorPage } from "@/components/guide/pages/color-page";

export default function ColorGuideRoutePage() {
  return (
    <Suspense fallback={null}>
      <GuideColorPage />
    </Suspense>
  );
}
