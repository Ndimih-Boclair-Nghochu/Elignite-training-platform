"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/services", label: "Services" },
  { href: "/testimonies", label: "Testimonies" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const dashLink = user ? (user.role === "ceo" ? "/dashboard/ceo" : user.role === "teacher" ? "/dashboard/teacher" : "/dashboard/student") : null;

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-3 font-semibold text-base sm:text-lg text-slate-900">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
              <Image src="/logo.svg" alt="EduManage logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold">EduManage</span>
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">School Management</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-gray-600 hover:text-primary font-medium transition-colors">{l.label}</Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            {dashLink ? (
              <Button asChild><Link href={dashLink}>Dashboard</Link></Button>
            ) : (
              <>
                <Button variant="outline" asChild><Link href="/login">Login</Link></Button>
                <Button asChild><Link href="/enroll">Apply Now</Link></Button>
              </>
            )}
          </div>
          <button
            type="button"
            className="md:hidden rounded-full p-2 text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden pb-4 mt-3 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:text-primary font-medium"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 px-4">
              {dashLink ? (
                <Button asChild className="w-full">
                  <Link href={dashLink} onClick={() => setOpen(false)}>Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/enroll" onClick={() => setOpen(false)}>Apply Now</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
