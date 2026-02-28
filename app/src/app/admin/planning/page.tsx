import { requireRole } from "@/lib/auth";
import { PlanningHubClient } from "./_components/planning-hub-client";

export default async function PlanningPage() {
  await requireRole("super_admin");

  return <PlanningHubClient />;
}
