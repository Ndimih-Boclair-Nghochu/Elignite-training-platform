import { requireDashboardRole } from "@/lib/server-auth";

export default async function StudentDashboardRoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDashboardRole("student");
  return children;
}
