import { redirect } from "next/navigation";
import { GUIDE_ROUTES } from "@/lib/guide-routes";

export default function HomePage() {
  redirect(GUIDE_ROUTES.color);
}
