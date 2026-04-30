import { requireDashboardRole } from "@/lib/server-auth";

export default async function PartnerDashboardRoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDashboardRole("partner");
  return children;
}
