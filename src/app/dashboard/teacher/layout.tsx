import { requireDashboardRole } from "@/lib/server-auth";

export default async function TeacherDashboardRoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDashboardRole("teacher");
  return children;
}
