import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/services", label: "Services" },
  { href: "/about-us", label: "About Us" },
  { href: "/testimonies", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
];

const courseLinks = [
  { href: "/programs/web-development", label: "Web Development" },
  { href: "/programs/software-engineering", label: "Software Engineering" },
  { href: "/programs/cloud-devops", label: "Cloud & DevOps" },
  { href: "/programs/ai-tools", label: "AI Tools" },
];

async function getSettings() {
  try {
    return await prisma.schoolSettings.findFirst();
  } catch {
    return null;
  }
}

export async function Footer() {
  const settings = await getSettings();
  const schoolName = settings?.schoolName || "ELIGNITE";
  const schoolLogoUrl = settings?.schoolLogoUrl || null;
  const schoolAddress = settings?.schoolAddress || "Bamenda, Cameroon";
  const schoolEmail = settings?.schoolEmail || "admissions@elignite.cm";
  const schoolPhone = settings?.schoolPhone || "+237 677 000 111";

  return (
    <footer className="border-t border-blue-200 bg-[#0d5bd7] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {schoolLogoUrl && (
              <div className="h-10 w-10 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0">
                <img src={schoolLogoUrl} alt={`${schoolName} logo`} className="h-full w-full object-contain p-1" />
              </div>
            )}
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">{schoolName}</p>
          </div>
          <h3 className="text-2xl font-semibold text-white">Tech training built for real work.</h3>
          <p className="max-w-md text-sm leading-7 text-blue-100/85">
            {schoolName} Training Platform helps learners build practical digital skills through structured programs, expert support, and hands-on projects.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">Quick Links</h4>
          <div className="mt-4 space-y-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-blue-50/90 transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">Popular Tracks</h4>
          <div className="mt-4 space-y-3">
            {courseLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-blue-50/90 transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">Contact</h4>
          <div className="mt-4 space-y-4 text-sm text-blue-50/90">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-white" />
              <span>{schoolAddress}</span>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-white" />
              <span>{schoolEmail}</span>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-white" />
              <span>{schoolPhone}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 px-4 py-5 text-center text-xs text-blue-100/80 sm:px-6 lg:px-8">
        Copyright 2026 {schoolName} Training Platform. Practical digital learning for careers in tech.
      </div>
    </footer>
  );
}
