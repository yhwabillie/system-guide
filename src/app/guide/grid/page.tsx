import { Suspense } from "react";
import { GuideGridPage } from "@/components/guide/pages/grid-page";

export default function GridGuideRoutePage() {
  return (
    <Suspense fallback={null}>
      <GuideGridPage />
    </Suspense>
  );
}
