import { requireDashboardRole } from "@/lib/server-auth";

export default async function CeoDashboardRoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDashboardRole("ceo");
  return children;
}
