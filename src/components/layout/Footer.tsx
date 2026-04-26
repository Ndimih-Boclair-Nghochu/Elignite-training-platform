import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

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

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">ELIGNITE</p>
          <h3 className="text-2xl font-semibold text-slate-950">Tech training built for real work.</h3>
          <p className="max-w-md text-sm leading-7 text-slate-600">
            ELIGNITE Training Platform helps learners build practical digital skills through structured programs, expert support, and hands-on projects.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Quick Links</h4>
          <div className="mt-4 space-y-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-slate-600 transition-colors hover:text-slate-950">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Popular Tracks</h4>
          <div className="mt-4 space-y-3">
            {courseLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-slate-600 transition-colors hover:text-slate-950">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Contact</h4>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-sky-500" />
              <span>Bamenda, Cameroon</span>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-sky-500" />
              <span>admissions@elignite.cm</span>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-sky-500" />
              <span>+237 677 000 111</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-5 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
        © 2026 ELIGNITE Training Platform. Practical digital learning for careers in tech.
      </div>
    </footer>
  );
}
