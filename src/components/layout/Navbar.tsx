"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/services", label: "Services" },
  { href: "/about-us", label: "About Us" },
  { href: "/testimonies", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  const dashLink = useMemo(() => {
    if (!user) return null;
    if (user.role === "ceo") return "/dashboard/ceo";
    if (user.role === "teacher") return "/dashboard/teacher";
    return "/dashboard/student";
  }, [user]);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-slate-950">
          <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <Image src="/logo.svg" alt="ELIGNITE logo" fill className="object-contain p-2" />
          </div>
          <div className="leading-tight">
              <p className="text-sm font-semibold sm:text-base">ELIGNITE</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-sky-600">Tech Training Platform</p>
          </div>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-slate-950 ${
                pathname === item.href ? "text-slate-950" : "text-slate-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {dashLink ? (
            <Button asChild className="bg-sky-500 text-white hover:bg-sky-600">
              <Link href={dashLink}>Open Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild className="border-slate-200 bg-white text-slate-900 hover:bg-sky-50">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-sky-500 text-white hover:bg-sky-600">
                <Link href="/enroll">Apply Now</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-4">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-950 ${
                  pathname === item.href ? "bg-sky-50 text-slate-950" : "text-slate-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="grid gap-2 pt-3">
              {dashLink ? (
                <Button asChild className="w-full bg-sky-500 text-white hover:bg-sky-600">
                  <Link href={dashLink} onClick={() => setOpen(false)}>Open Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full border-slate-200 bg-white text-slate-900 hover:bg-sky-50">
                    <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild className="w-full bg-sky-500 text-white hover:bg-sky-600">
                    <Link href="/enroll" onClick={() => setOpen(false)}>Apply Now</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
