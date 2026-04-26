import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fallbackPrograms = [
  {
    slug: "bsc-computer-science",
    title: "BSc Computer Science",
    category: "Technology",
    duration: "4 Years",
    description: "Software engineering, AI foundations, data structures, and applied systems design.",
    tuition: 2500000,
  },
  {
    slug: "bsc-business-administration",
    title: "BSc Business Administration",
    category: "Business",
    duration: "3 Years",
    description: "Management, finance, entrepreneurship, and decision-making for modern organizations.",
    tuition: 2000000,
  },
  {
    slug: "bsc-nursing",
    title: "BSc Nursing",
    category: "Health Sciences",
    duration: "4 Years",
    description: "Hands-on clinical preparation with strong academic and professional grounding.",
    tuition: 3000000,
  },
];

const fallbackServices = [
  {
    name: "Career Placement",
    category: "Career",
    description: "Internship matching, career advising, and employer readiness support.",
  },
  {
    name: "Student Counseling",
    category: "Welfare",
    description: "Academic, wellbeing, and mentorship support throughout the learning journey.",
  },
  {
    name: "Digital Resources",
    category: "Academic",
    description: "Fast access to learning materials, labs, and guided practice resources.",
  },
];

const fallbackTestimonials = [
  {
    id: 1,
    name: "Amara Fonkeng",
    program: "BSc Computer Science",
    text: "The platform feels organized, the teaching is practical, and I always know what comes next.",
    rating: 5,
  },
  {
    id: 2,
    name: "Brice Nkemdirim",
    program: "BSc Business Administration",
    text: "Admissions, communication, and course access are much clearer than what I expected.",
    rating: 5,
  },
  {
    id: 3,
    name: "Sandra Mbah",
    program: "BSc Nursing",
    text: "It feels like a real learning environment, not just a set of forms and pages.",
    rating: 4,
  },
];

const processSteps = [
  {
    title: "Apply online",
    description: "Submit your application with your personal details and preferred program in a few minutes.",
    icon: GraduationCap,
  },
  {
    title: "Admissions review",
    description: "The school reviews your file, updates your status, and prepares your onboarding materials.",
    icon: ShieldCheck,
  },
  {
    title: "Activate and start",
    description: "Create your student account, access your dashboard, and begin using the full platform.",
    icon: CheckCircle2,
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function HomePage() {
  let stats = {
    studentCount: 1200,
    facultyCount: 48,
    programCount: 12,
    graduateCount: 850,
  };
  let programs = fallbackPrograms;
  let services = fallbackServices;
  let testimonials = fallbackTestimonials;
  let gallery: Array<{ id: number; title: string; url: string }> = [];

  try {
    const [studentCount, facultyCount, programCount, graduateCount, dbPrograms, dbServices, dbTestimonials, dbGallery] =
      await Promise.all([
        prisma.student.count(),
        prisma.teacher.count({ where: { status: "active" } }),
        prisma.program.count({ where: { status: "published" } }),
        prisma.student.count({ where: { status: "graduated" } }),
        prisma.program.findMany({
          where: { status: "published" },
          orderBy: { title: "asc" },
          take: 3,
          select: {
            slug: true,
            title: true,
            category: true,
            duration: true,
            description: true,
            tuition: true,
          },
        }),
        prisma.service.findMany({
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            name: true,
            category: true,
            description: true,
          },
        }),
        prisma.testimony.findMany({
          where: { status: "approved" },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            id: true,
            name: true,
            program: true,
            text: true,
            rating: true,
          },
        }),
        prisma.gallery.findMany({
          orderBy: { createdAt: "desc" },
          take: 4,
          select: {
            id: true,
            title: true,
            url: true,
          },
        }),
      ]);

    stats = { studentCount, facultyCount, programCount, graduateCount };
    if (dbPrograms.length > 0) programs = dbPrograms;
    if (dbServices.length > 0) services = dbServices;
    if (dbTestimonials.length > 0) testimonials = dbTestimonials;
    gallery = dbGallery;
  } catch (error) {
    console.error("Home page data fallback:", error);
  }

  const heroImage = gallery[0]?.url || "https://placehold.co/1600x1000?text=Campus+and+Learning";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative min-h-[88vh] overflow-hidden bg-slate-950 text-white">
        <img
          src={heroImage}
          alt="Campus and learning environment"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.86),rgba(15,23,42,0.72),rgba(8,47,73,0.58))]" />

        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl items-end px-4 pb-12 pt-28 sm:px-6 lg:px-8">
          <div className="grid w-full gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="max-w-3xl">
              <Badge className="border-white/15 bg-white/10 text-white">
                Admissions, learning, and school operations in one platform
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                ELIGNITE brings admissions, learning, and student life into one premium digital campus.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-slate-200 sm:text-xl">
                ELIGNITE Training Platform gives your institution a calm, modern operating system
                for enrollment, academic tracking, communication, and day-to-day student experience.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-12 bg-sky-400 px-6 text-slate-950 hover:bg-sky-300" asChild>
                  <Link href="/enroll">
                    Start Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 border-white/25 bg-white/5 px-6 text-white hover:bg-white hover:text-slate-950" asChild>
                  <Link href="/programs">Browse Programs</Link>
                </Button>
              </div>
              <div className="mt-10 grid gap-6 border-t border-white/15 pt-6 sm:grid-cols-3">
                <div>
                  <p className="text-2xl font-semibold">{stats.studentCount.toLocaleString()}+</p>
                  <p className="mt-1 text-sm text-slate-300">Learner records managed</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.programCount}</p>
                  <p className="mt-1 text-sm text-slate-300">Published academic programs</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.facultyCount}</p>
                  <p className="mt-1 text-sm text-slate-300">Active faculty members</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-lg border border-white/12 bg-slate-950/55 p-5 backdrop-blur sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-md border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3 text-sky-300">
                  <Clock3 className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-[0.18em]">Admissions</span>
                </div>
                <p className="mt-4 text-xl font-semibold">Application status stays visible from first submission to approval.</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3 text-emerald-300">
                  <Users className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-[0.18em]">Operations</span>
                </div>
                <p className="mt-4 text-xl font-semibold">Students, teachers, fees, results, and timetables live in one working system.</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 text-amber-300">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-[0.18em]">Experience</span>
                </div>
                <p className="mt-4 text-xl font-semibold">The platform is built to feel clear, human, and dependable for daily use.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Graduates</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{stats.graduateCount.toLocaleString()}+</p>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Program delivery</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">Structured</p>
            <p className="mt-1 text-sm text-slate-600">Timetables, academic tracking, and role-based dashboards.</p>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Student support</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">Always on</p>
            <p className="mt-1 text-sm text-slate-600">Fees, communications, services, and onboarding in one place.</p>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Campus</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-semibold text-slate-950">
              <MapPin className="h-6 w-6 text-sky-600" />
              Bamenda
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-600">Programs</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
                Built for career momentum, not just classroom attendance.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Explore a focused academic portfolio with practical outcomes, guided instruction,
              and an administrative layer that actually supports the learning experience.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {programs.map((program) => (
              <article key={program.slug} className="flex h-full flex-col justify-between border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      {program.category}
                    </Badge>
                    <span className="text-sm font-medium text-slate-500">{program.duration}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{program.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{program.description}</p>
                </div>
                <div className="mt-8 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Tuition</p>
                    <p className="text-lg font-semibold text-slate-950">{formatCurrency(program.tuition)}</p>
                  </div>
                  <Button variant="outline" className="border-slate-300 bg-white" asChild>
                    <Link href={`/programs/${program.slug}`}>View Program</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-600">Student Services</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              The platform supports the whole institution, not only admissions.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              From messages and fees to course visibility and support services, the experience is
              designed around repeated everyday use by students, teachers, and administrators.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild>
                <Link href="/services">Explore Services</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Talk to Admissions</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {services.map((service) => (
              <article key={service.name} className="border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                  {service.category.toLowerCase().includes("career") ? (
                    <Briefcase className="h-5 w-5" />
                  ) : service.category.toLowerCase().includes("academic") ? (
                    <BookOpen className="h-5 w-5" />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{service.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-300">Admissions Journey</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">A cleaner path from interest to enrollment.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-300">
              The platform now makes the student journey legible: application, review, onboarding,
              dashboard access, and ongoing academic visibility.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {processSteps.map((step) => (
              <article key={step.title} className="border border-white/10 bg-white/5 p-6">
                <step.icon className="h-8 w-8 text-sky-300" />
                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-600">Testimonials</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
                Real voices from the learning community.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Approved testimonies help visitors understand how the school experience feels in practice.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.id} className="border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                    {testimonial.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.program}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-1 text-amber-500">
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <Sparkles key={index} className="h-4 w-4" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-700">&ldquo;{testimonial.text}&rdquo;</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(gallery.length > 0 ? gallery : [
              { id: 1, title: "Campus", url: "https://placehold.co/700x500?text=Campus" },
              { id: 2, title: "Learning Space", url: "https://placehold.co/700x500?text=Learning+Space" },
              { id: 3, title: "Events", url: "https://placehold.co/700x500?text=Events" },
              { id: 4, title: "Community", url: "https://placehold.co/700x500?text=Community" },
            ]).map((item) => (
              <div key={item.id} className="relative aspect-[4/3] overflow-hidden border border-slate-200 bg-slate-100">
                <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4 text-sm font-medium text-white">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sky-600 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-100">Ready to start?</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Move from interest to application without friction.</h2>
            <p className="mt-4 text-sm leading-7 text-sky-50">
              Explore programs, submit your application, and use the platform as your working student portal from day one.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="bg-slate-950 text-white hover:bg-slate-900" asChild>
              <Link href="/enroll">Apply Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-slate-950" asChild>
              <Link href="/contact">Contact Admissions</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 py-12 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/10">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">EduManage</p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">School platform</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
              A modern school management experience for admissions, learning operations,
              communication, and student support.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Explore</p>
            <div className="mt-4 space-y-2 text-sm">
              <Link href="/programs" className="block hover:text-white">Programs</Link>
              <Link href="/services" className="block hover:text-white">Services</Link>
              <Link href="/about-us" className="block hover:text-white">About Us</Link>
              <Link href="/testimonies" className="block hover:text-white">Testimonials</Link>
            </div>
          </div>
          <div>
            <p className="font-semibold text-white">Support</p>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-sky-300" /> Bamenda, Cameroon</p>
              <p className="flex items-center gap-2"><MessageSquareQuote className="h-4 w-4 text-sky-300" /> admissions@edumanage.cm</p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-4 pt-6 text-sm text-slate-500 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} EduManage. Built for dependable day-to-day campus operations.
        </div>
      </footer>
    </div>
  );
}
