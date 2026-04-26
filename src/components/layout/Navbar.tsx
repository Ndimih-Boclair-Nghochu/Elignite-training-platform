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
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-sm">
              <Image src="/logo.svg" alt="ELIGNITE logo" fill className="object-contain p-2" />
          </div>
          <div className="leading-tight">
              <p className="text-sm font-semibold sm:text-base">ELIGNITE</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/80">Tech Training Platform</p>
          </div>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-white ${
                pathname === item.href ? "text-white" : "text-slate-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {dashLink ? (
            <Button asChild className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
              <Link href={dashLink}>Open Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                <Link href="/enroll">Apply Now</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-slate-200 transition-colors hover:bg-white/10 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#081120] md:hidden">
          <div className="space-y-1 px-4 py-4">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white ${
                  pathname === item.href ? "bg-white/10 text-white" : "text-slate-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="grid gap-2 pt-3">
              {dashLink ? (
                <Button asChild className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                  <Link href={dashLink} onClick={() => setOpen(false)}>Open Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                    <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">
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
