import { redirect } from "next/navigation";
import { normalizeRole, type AppRole } from "@/lib/roles";
import { getSession } from "@/lib/session";

const dashboardHomeByRole: Record<AppRole, string> = {
  ceo: "/dashboard/ceo",
  teacher: "/dashboard/teacher",
  student: "/dashboard/student",
  partner: "/dashboard/partner",
};

export async function requireDashboardRole(expectedRole: AppRole) {
  const session = await getSession();

  if (!session.userId) {
    redirect("/login");
  }

  const actualRole = normalizeRole(session.role);
  if (actualRole !== expectedRole) {
    redirect(dashboardHomeByRole[actualRole]);
  }

  return session;
}
