import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { PhoneShowcase } from "@/components/marketing/phone-showcase";
import { TestimonialsCarousel } from "@/components/marketing/testimonials-carousel";
import { ProgramJumpSelect } from "@/components/marketing/program-jump-select";
import { faqs, learningSteps, partnerLogos, techPrograms } from "@/lib/site-content";
import { programDetailSlug, programSelectOptions, toMarketingProgram, truncateWords } from "@/lib/programs";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock3,
  Cpu,
  Layers3,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let programs = techPrograms.slice(0, 6);
  let allProgramOptions = programSelectOptions(techPrograms);
  let approvedTestimonials: Array<{
    id: number;
    name: string;
    program: string;
    text: string;
    rating: number;
  }> = [];

  let studentCount = 0;
  let programCount = 0;
  let activeProgramCount = 0;
  let graduateCount = 0;

  try {
    const [dbPrograms, dbTestimonials, sCount, pCount, activePrograms, gCount] = await Promise.all([
      prisma.program.findMany({
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.testimony.findMany({
        where: { status: "approved" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, name: true, program: true, text: true, rating: true },
      }),
      prisma.student.count(),
      prisma.program.count({ where: { status: "published" } }),
      prisma.student.findMany({ select: { program: true }, distinct: ["program"] }),
      prisma.student.count({
        where: { certificates: { some: { status: "issued" } } },
      }),
    ]);

    studentCount = sCount;
    programCount = pCount;
    activeProgramCount = activePrograms.length;
    graduateCount = gCount;

    if (dbPrograms.length > 0) {
      allProgramOptions = programSelectOptions(dbPrograms);
      programs = dbPrograms.slice(0, 6).map((program, index) => toMarketingProgram(program, index));
    }

    approvedTestimonials = dbTestimonials;
  } catch (error) {
    console.error("Home page fallback:", error);
  }

  const testimonials =
    approvedTestimonials.length > 0
      ? approvedTestimonials
      : [
          {
            id: 1,
            name: "Brenda T.",
            program: "Web Development",
            text: "The learning path is practical, the platform feels organized, and every module pushes you to build something real.",
            rating: 5,
          },
          {
            id: 2,
            name: "Nelson A.",
            program: "Cloud & DevOps",
            text: "I came in confused about deployment and left with a workflow I can actually use on projects and jobs.",
            rating: 5,
          },
          {
            id: 3,
            name: "Ruth M.",
            program: "Graphic Design",
            text: "It feels premium, clear, and focused. The projects gave me work I was proud to share with clients.",
            rating: 5,
          },
        ];

  const liveStats = [
    { label: "Students Enrolled", value: studentCount.toString() },
    { label: "Published Programs", value: programCount.toString() },
    { label: "Active Programs", value: activeProgramCount.toString() },
    { label: "Graduates", value: graduateCount.toString() },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden border-b border-blue-100">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=80"
            alt="Learners working with modern tech equipment"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(125,211,252,0.58),rgba(56,189,248,0.46),rgba(37,99,235,0.34))] lg:bg-[linear-gradient(118deg,rgba(191,219,254,0.7),rgba(224,242,254,0.5),rgba(37,99,235,0.28))]" />
          <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(37,99,235,0.04)_0,rgba(37,99,235,0.04)_1px,transparent_1px,transparent_88px),linear-gradient(rgba(37,99,235,0.04)_0,rgba(37,99,235,0.04)_1px,transparent_1px,transparent_88px)] bg-[size:88px_88px] lg:block" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
          <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <Reveal className="max-w-3xl">
              <Badge className="border-blue-200 bg-white/90 px-4 py-2 text-blue-700">
                Premium tech training for practical careers, freelancing, and digital growth
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Practical technology training that helps serious learners produce real work.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                ELIGNITE delivers structured training in software, cloud, design, digital tools, and modern productivity so learners can move from interest to visible capability with confidence.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700">
                  <Link href="/enroll">
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-blue-200 bg-white/95 text-slate-900 hover:bg-blue-50">
                  <Link href="/programs">Explore Programs</Link>
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {liveStats.map((stat, index) => (
                  <Reveal key={stat.label} delay={index * 80} className="surface-card hover-lift p-5">
                    <p className="text-3xl font-semibold text-slate-950">{stat.value}</p>
                    <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
                  </Reveal>
                ))}
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="surface-card p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                      Learning Experience
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                      Built for practical progress
                    </h2>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-blue-700">
                    <Cpu className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    "Structured paths for beginners and career-switchers",
                    "Hands-on assignments, projects, and guided feedback",
                    "One learner workspace for applications, progress, and next steps",
                    "Career-facing support that strengthens confidence after training",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-4"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                      <p className="text-sm leading-6 text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-b border-blue-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 text-sm text-slate-600 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: Layers3, label: "Career tracks designed for the technology sector" },
            { icon: Users2, label: "Cohort-based learning with structured milestones" },
            { icon: ShieldCheck, label: "Applied projects instead of passive theory" },
            { icon: Briefcase, label: "Job-facing support for meaningful next steps" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="h-5 w-5 shrink-0 text-blue-600" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-blue-100 bg-blue-50/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                Campaign Preview
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                Training communication presented with the same clarity as the platform.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                See how ELIGNITE presents its training programmes with structured information, clear offers, and a stronger visual identity that helps visitors trust the platform quickly.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700">
                  <Link href="/enroll">
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50">
                  <Link href="/programs">View Programs</Link>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={120} className="flex justify-center">
              <PhoneShowcase />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              eyebrow="Popular Programs"
              title="Choose a training path with clear value, current relevance, and visible outcomes."
              description="Every ELIGNITE program is shaped for real digital work, with clean pacing, hands-on deliverables, and a direct path from learning to execution."
              className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
            />
          </Reveal>
          <Reveal delay={60}>
            <div className="mt-8 max-w-xl">
              <ProgramJumpSelect programs={allProgramOptions} />
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((program, index) => (
              <Reveal key={program.slug} delay={index * 70}>
                <article className="surface-card-strong hover-lift h-full overflow-hidden">
                  <div className="relative h-56">
                    {program.image.startsWith("data:") ? (
                      <img src={program.image} alt={program.title} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <Image src={program.image} alt={program.title} fill className="object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                      <Badge className="border-white/15 bg-white/92 text-blue-700">
                        {program.category}
                      </Badge>
                      <span className="rounded-full border border-white/20 bg-white/88 px-3 py-1 text-xs text-slate-700">
                        {program.mode}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-950">{program.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {truncateWords(program.description, 18)}
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                        <p className="text-slate-500">Duration</p>
                        <p className="mt-1 font-medium text-slate-900">{program.duration}</p>
                      </div>
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                        <p className="text-slate-500">Level</p>
                        <p className="mt-1 font-medium text-slate-900">{program.level}</p>
                      </div>
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                        <p className="text-slate-500">Mode</p>
                        <p className="mt-1 font-medium text-slate-900">{program.mode}</p>
                      </div>
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                        <p className="text-slate-500">Price</p>
                        <p className="mt-1 font-medium text-slate-900">{program.price}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {program.highlights.slice(0, 2).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs text-blue-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Button asChild className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                        <Link href={`/enroll?program=${program.slug}`}>Apply Now</Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="flex-1 border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                      >
                        <Link href={`/programs/${programDetailSlug(program)}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal delay={160}>
            <div className="mt-10 flex justify-center">
              <Button asChild size="lg" variant="outline" className="border-blue-200 bg-white text-slate-900 hover:bg-blue-50">
                <Link href="/programs">
                  View More Programs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-blue-50/65 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              eyebrow="How Learning Works"
              title="A smoother path from curiosity to skill."
              description="The platform combines guided instruction, visible progress, projects, and support so learners always know what comes next."
              className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
            />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {learningSteps.map((step, index) => (
              <Reveal key={step.title} delay={index * 90}>
                <div className="surface-card hover-lift h-full p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-semibold text-white">
                    0{index + 1}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <div className="surface-card-strong h-full overflow-hidden p-8">
              <SectionHeading
                eyebrow="Why ELIGNITE"
                title="A modern training environment with structure, clarity, and momentum."
                description="The platform is designed to make programs feel credible, easy to navigate, and motivating to continue."
                className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
              />
              <div className="relative mt-6 h-56 w-full overflow-hidden rounded-2xl sm:h-64">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                  alt="Learners collaborating in a modern training environment"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/30 to-transparent" />
              </div>
            </div>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: Users2,
                title: "Student-ready UX",
                text: "Learners can track applications, follow progress, and move through training without confusion.",
              },
              {
                icon: Sparkles,
                title: "Expert-led support",
                text: "Teachers and coordinators can keep learning active with updates, feedback, and guidance.",
              },
              {
                icon: Clock3,
                title: "Flexible delivery",
                text: "Programs can support evening, weekend, remote, and hybrid schedules for real-world learners.",
              },
              {
                icon: ShieldCheck,
                title: "Professional trust",
                text: "Clear admissions, secure access, and polished communication build confidence from the first visit.",
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 90}>
                <div className="surface-card hover-lift h-full p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              eyebrow="What Learners Say"
              title="The experience feels practical, modern, and directed."
              description="The strongest signal is whether learners feel progress. These stories show what that looks like inside the platform."
              align="center"
              className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
            />
          </Reveal>
          <div className="mt-12">
            <TestimonialsCarousel items={testimonials} />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
          <Reveal>
            <SectionHeading
              eyebrow="FAQ"
              title="Common questions from new learners."
              description="The public site now makes the next step clearer, but here are the essentials in one place."
              className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
            />
            <div className="relative mt-6 h-56 w-full overflow-hidden rounded-2xl sm:h-64">
              <Image
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"
                alt="Learner reviewing course materials and asking questions"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/25 to-transparent" />
            </div>
          </Reveal>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 80}>
                <div className="surface-card hover-lift p-6">
                  <h3 className="text-lg font-semibold text-slate-950">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-blue-50/40 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
          {partnerLogos.map((partner) => (
            <div key={partner} className="rounded-full border border-blue-100 bg-white px-5 py-2">
              {partner}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="surface-card-strong overflow-hidden p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                  Ready to start
                </p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
                  Join a serious tech training platform built to help you produce real work.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Browse the tracks, apply to the one that fits your goal, and move into a guided learning environment that feels current and credible.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700">
                  <Link href="/enroll">Apply Now</Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  variant="outline"
                  className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                >
                  <Link href="/contact">Talk to Admissions</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
