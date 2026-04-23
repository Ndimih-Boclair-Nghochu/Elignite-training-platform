"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { AIHelper } from "@/components/ai/AIHelper";
import { normalizeRole } from "@/lib/roles";
import { Loader2, Menu } from "lucide-react";

const roleDashboardRoot: Record<string, string> = {
  ceo: "/dashboard/ceo",
  teacher: "/dashboard/teacher",
  student: "/dashboard/student",
};

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const allowedRoot = roleDashboardRoot[normalizeRole(user.role)];
  if (allowedRoot && !pathname.startsWith(allowedRoot)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900">
            <DashboardSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">EduManage</h1>
          <div className="w-10" />
        </div>

        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>

      <AIHelper />
    </div>
  );
}
