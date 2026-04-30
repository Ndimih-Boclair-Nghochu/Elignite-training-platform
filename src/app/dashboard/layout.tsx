"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { AIHelper } from "@/components/ai/AIHelper";
import { normalizeRole } from "@/lib/roles";
import { Loader2, Menu } from "lucide-react";

const roleDashboardRoot: Record<string, string> = {
  ceo: "/dashboard/ceo",
  teacher: "/dashboard/teacher",
  partner: "/dashboard/partner",
  student: "/dashboard/student",
};

function titleFromPath(pathname: string) {
  const last = pathname.split("/").filter(Boolean).pop() || "dashboard";
  if (last === "ceo" || last === "teacher" || last === "student" || last === "partner" || last === "dashboard") {
    return "Overview";
  }

  return last
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const allowedRoot = roleDashboardRoot[normalizeRole(user.role)];
    if (allowedRoot && !pathname.startsWith(allowedRoot)) {
      router.push(allowedRoot);
    }
  }, [user, loading, pathname, router]);

  const sectionTitle = useMemo(() => titleFromPath(pathname), [pathname]);
  const roleLabel = useMemo(() => {
    const role = normalizeRole(user?.role);
    if (role === "ceo") return "Executive Workspace";
    if (role === "teacher") return "Faculty Workspace";
    if (role === "partner") return "Admissions Workspace";
    return "Student Workspace";
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const allowedRoot = roleDashboardRoot[normalizeRole(user.role)];
  if (allowedRoot && !pathname.startsWith(allowedRoot)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/55" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 overflow-y-auto">
            <DashboardSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="hidden lg:sticky lg:top-0 lg:block lg:h-screen">
        <DashboardSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,#f8fdff_0%,#ffffff_100%)]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/92 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 lg:hidden"
                aria-label="Open dashboard menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{roleLabel}</p>
                <h1 className="text-lg font-semibold text-slate-950 lg:text-xl">{sectionTitle}</h1>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-slate-950">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{normalizeRole(user.role)}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>

      <AIHelper />
    </div>
  );
}
