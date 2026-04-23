"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { normalizeRole } from "@/lib/roles";
import { GraduationCap, LogOut, ChevronLeft, ChevronRight, LayoutDashboard, Users, BookOpen,
  ClipboardList, DollarSign, Image, MessageSquare, Settings, Bell, FileText, BarChart2,
  Briefcase, Award, Globe, UserCircle, Brain, ClipboardCheck, BookMarked, Megaphone, CreditCard, Clock } from "lucide-react";
import { useState } from "react";

const ceoNav = [
  { href: "/dashboard/ceo", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/ceo/students", label: "Students", icon: Users },
  { href: "/dashboard/ceo/faculty", label: "Staff", icon: Briefcase },
  { href: "/dashboard/ceo/enrollments", label: "Enrollments", icon: ClipboardList },
  { href: "/dashboard/ceo/academic", label: "Academic", icon: BookOpen },
  { href: "/dashboard/ceo/programs", label: "Programs", icon: GraduationCap },
  { href: "/dashboard/ceo/timetable", label: "Timetable", icon: Clock },
  { href: "/dashboard/ceo/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/dashboard/ceo/projects", label: "Projects", icon: FileText },
  { href: "/dashboard/ceo/finance", label: "Finance", icon: DollarSign },
  { href: "/dashboard/ceo/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/ceo/communications", label: "Communications", icon: Megaphone },
  { href: "/dashboard/ceo/about-us", label: "About Us", icon: Globe },
  { href: "/dashboard/ceo/gallery", label: "Gallery", icon: Image },
  { href: "/dashboard/ceo/services", label: "Services", icon: Briefcase },
  { href: "/dashboard/ceo/testimonies", label: "Testimonies", icon: MessageSquare },
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
  { href: "/dashboard/student/testimonies", label: "Testimonies", icon: MessageSquare },
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
  { href: "/dashboard/teacher/testimonies", label: "Testimonies", icon: MessageSquare },
  { href: "/dashboard/teacher/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const normalizedRole = normalizeRole(user?.role);
  const nav = normalizedRole === "ceo" ? ceoNav : normalizedRole === "teacher" ? teacherNav : studentNav;

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <aside className={cn("bg-gray-900 text-white flex flex-col transition-all duration-300 min-h-screen flex-shrink-0", collapsed ? "w-16" : "w-64")}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
            <GraduationCap className="h-6 w-6 text-blue-400" />EduManage
          </Link>
        )}
        {collapsed && <GraduationCap className="h-6 w-6 text-blue-400 mx-auto" />}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white ml-auto">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-gray-700">
          <p className="font-semibold text-sm truncate">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-gray-400 capitalize">{normalizedRole}</p>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              onClick={onClose}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white")}>
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-700">
        <button onClick={() => { handleLogout(); onClose?.(); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-700 hover:text-white transition-colors w-full">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
