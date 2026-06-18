import { Suspense } from "react";
import { GuideTypePage } from "@/components/guide/pages/type-page";

export default function TypeGuideRoutePage() {
  return (
    <Suspense fallback={null}>
      <GuideTypePage />
    </Suspense>
  );
}
