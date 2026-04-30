"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { normalizeRole } from "@/lib/roles";
import {
  Award,
  BarChart2,
  Bell,
  BookMarked,
  BookOpen,
  Brain,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  CreditCard,
  CalendarDays,
  Building2,
  FileText,
  Globe,
  GraduationCap,
  Image,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquare,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const ceoNav = [
  { href: "/dashboard/ceo", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/ceo/students", label: "Students", icon: Users },
  { href: "/dashboard/ceo/faculty", label: "Staff", icon: Briefcase },
  { href: "/dashboard/ceo/enrollments", label: "Enrollments", icon: ClipboardList },
  { href: "/dashboard/ceo/academic", label: "Academic", icon: BookOpen },
  { href: "/dashboard/ceo/programs", label: "Programs", icon: GraduationCap },
  { href: "/dashboard/ceo/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/ceo/timetable", label: "Timetable", icon: Clock },
  { href: "/dashboard/ceo/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/dashboard/ceo/projects", label: "Projects", icon: FileText },
  { href: "/dashboard/ceo/finance", label: "Finance", icon: CreditCard },
  { href: "/dashboard/ceo/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/ceo/communications", label: "Communications", icon: Megaphone },
  { href: "/dashboard/ceo/messages", label: "Contact Messages", icon: Inbox },
  { href: "/dashboard/ceo/about-us", label: "About Us", icon: Globe },
  { href: "/dashboard/ceo/gallery", label: "Gallery", icon: Image },
  { href: "/dashboard/ceo/services", label: "Services", icon: Briefcase },
  { href: "/dashboard/ceo/testimonies", label: "Testimonials", icon: MessageSquare },
  { href: "/dashboard/ceo/settings", label: "Settings", icon: Settings },
];

const studentNav = [
  { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/student/profile", label: "Profile", icon: UserCircle },
  { href: "/dashboard/student/results", label: "Results", icon: BarChart2 },
  { href: "/dashboard/student/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/student/fees", label: "Fees", icon: CreditCard },
  { href: "/dashboard/student/timetable", label: "Timetable", icon: Clock },
  { href: "/dashboard/student/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/dashboard/student/projects", label: "Projects", icon: FileText },
  { href: "/dashboard/student/exercises", label: "Exercises", icon: BookMarked },
  { href: "/dashboard/student/announcements", label: "Announcements", icon: Bell },
  { href: "/dashboard/student/transcript", label: "Transcript", icon: FileText },
  { href: "/dashboard/student/info", label: "Info", icon: FileText },
  { href: "/dashboard/student/testimonies", label: "Testimonials", icon: MessageSquare },
  { href: "/dashboard/student/ai-helper", label: "AI Helper", icon: Brain },
];

const teacherNav = [
  { href: "/dashboard/teacher", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/teacher/academic", label: "Academic", icon: BookOpen },
  { href: "/dashboard/teacher/programs", label: "Programs", icon: GraduationCap },
  { href: "/dashboard/teacher/students", label: "Students", icon: Users },
  { href: "/dashboard/teacher/courses", label: "Courses", icon: BookMarked },
  { href: "/dashboard/teacher/timetable", label: "Timetable", icon: Clock },
  { href: "/dashboard/teacher/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/dashboard/teacher/projects", label: "Projects", icon: FileText },
  { href: "/dashboard/teacher/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/dashboard/teacher/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/teacher/testimonies", label: "Testimonials", icon: MessageSquare },
  { href: "/dashboard/teacher/settings", label: "Settings", icon: Settings },
];

const partnerNav = [
  { href: "/dashboard/partner", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/partner/profile", label: "School Profile", icon: Building2 },
  { href: "/dashboard/partner/programs", label: "Programs", icon: GraduationCap },
  { href: "/dashboard/partner/applications", label: "Applications", icon: ClipboardList },
];

export function DashboardSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const normalizedRole = normalizeRole(user?.role);
  const nav =
    normalizedRole === "ceo"
      ? ceoNav
      : normalizedRole === "teacher"
        ? teacherNav
        : normalizedRole === "partner"
          ? partnerNav
          : studentNav;
  const roleLabel =
    normalizedRole === "ceo"
      ? "Executive"
      : normalizedRole === "teacher"
        ? "Faculty"
        : normalizedRole === "partner"
          ? "Admissions"
          : "Student";

  const activeSection = useMemo(() => {
    return nav.find((item) => pathname === item.href)?.label || "Dashboard";
  }, [nav, pathname]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-shrink-0 flex-col border-r border-slate-200 bg-white text-slate-900 transition-all duration-300",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <Link href="/" className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div>
              <p className="font-semibold">ELIGNITE</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{roleLabel} Workspace</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {!collapsed && user && (
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-950">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{activeSection}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-500 text-white"
                  : "text-slate-600 hover:bg-blue-50 hover:text-slate-950"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          onClick={() => {
            handleLogout();
            onClose?.();
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-600 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
