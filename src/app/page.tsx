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
import { faqs, learningSteps, partnerLogos, platformStats, techPrograms } from "@/lib/site-content";
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
  let approvedTestimonials: Array<{ id: number; name: string; program: string; text: string; rating: number }> = [];

  try {
    const [dbPrograms, dbTestimonials] = await Promise.all([
      prisma.program.findMany({
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.testimony.findMany({
        where: { status: "approved" },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, name: true, program: true, text: true, rating: true },
      }),
    ]);

    if (dbPrograms.length > 0) {
      programs = dbPrograms.map((program, index) => {
        const fallback = techPrograms.find((item) => item.slug === program.slug) || techPrograms[index % techPrograms.length];
        return {
          slug: program.slug,
          title: program.title,
          category: program.category,
          duration: program.duration,
          description: program.description,
          level: fallback.level,
          mode: fallback.mode,
          price: `${program.tuition.toLocaleString()} XAF`,
          highlights: fallback.highlights,
          outcomes: fallback.outcomes,
          image: fallback.image,
        };
      });
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

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#f8fdff_0%,#ffffff_55%,#eef9ff_100%)]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"
            alt="Learners working with modern tech equipment"
            fill
            priority
            className="object-cover opacity-[0.08]"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
          <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <Reveal className="max-w-3xl">
              <Badge className="border-sky-200 bg-sky-50 px-4 py-2 text-sky-700">
                Bright, practical tech training for careers, freelancing, and digital work
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                ELIGNITE helps learners build modern tech skills through clear, practical training.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                From web development and software engineering to cloud, design, AI tools, and digital productivity, every track is built around hands-on outcomes and real-world confidence.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="bg-sky-500 text-white hover:bg-sky-600">
                  <Link href="/enroll">
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-slate-200 bg-white text-slate-900 hover:bg-sky-50">
                  <Link href="/programs">Explore Programs</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {platformStats.slice(0, 3).map((stat, index) => (
                  <Reveal key={stat.label} delay={index * 80} className="surface-card hover-lift p-5">
                    <p className="text-3xl font-semibold text-slate-950">{stat.value}</p>
                    <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
                  </Reveal>
                ))}
              </div>
            </Reveal>

            <Reveal delay={160} className="grid gap-5">
              <div className="surface-card-strong p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">Visual Showcase</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">ELIGNITE in your hand</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  A rotating phone-style preview gives visitors a cleaner feel for your flyers and training offers without breaking the page rhythm.
                </p>
                <div className="mt-6">
                  <PhoneShowcase />
                </div>
              </div>

              <div className="surface-card p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">Learning Experience</p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-950">Built for practical progress</h2>
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sky-600">
                    <Cpu className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    "Structured paths for beginners and career-switchers",
                    "Hands-on assignments, projects, and guided feedback",
                    "Track progress through one learner dashboard",
                    "Career-facing support for confidence after training",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-sky-500" />
                      <p className="text-sm leading-6 text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 text-sm text-slate-600 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: Layers3, label: "Career tracks designed for the tech sector" },
            { icon: Users2, label: "Cohort-based learning with structured milestones" },
            { icon: ShieldCheck, label: "Applied projects instead of passive theory" },
            { icon: Briefcase, label: "Job-facing support for real next steps" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-sky-500" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Popular Programs"
            title="Choose a training path that feels current, practical, and worth your time."
            description="Every ELIGNITE program is shaped for real digital work, with clear pacing, hands-on deliverables, and a direct path from learning to execution."
            className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {programs.map((program, index) => (
            <Reveal key={program.slug} delay={index * 70}>
              <article className="surface-card-strong hover-lift h-full overflow-hidden">
                <div className="relative h-56">
                  <Image src={program.image} alt={program.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                    <Badge className="border-white/15 bg-white/90 text-sky-700">{program.category}</Badge>
                    <span className="rounded-full border border-white/20 bg-white/85 px-3 py-1 text-xs text-slate-700">
                      {program.mode}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-950">{program.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{program.description}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-slate-500">Duration</p>
                      <p className="mt-1 font-medium text-slate-900">{program.duration}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-slate-500">Level</p>
                      <p className="mt-1 font-medium text-slate-900">{program.level}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-slate-500">Mode</p>
                      <p className="mt-1 font-medium text-slate-900">{program.mode}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-slate-500">Price</p>
                      <p className="mt-1 font-medium text-slate-900">{program.price}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {program.highlights.map((item) => (
                      <span key={item} className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs text-sky-700">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button asChild className="flex-1 bg-sky-500 text-white hover:bg-sky-600">
                      <Link href={`/enroll?program=${program.slug}`}>Apply Now</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 border-slate-200 bg-white text-slate-900 hover:bg-slate-50">
                      <Link href={`/programs/${program.slug}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-sky-50/70 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              eyebrow="How Learning Works"
              title="A smoother path from curiosity to skill."
              description="The platform combines guided instruction, visible progress, projects, and support so learners always know what comes next."
              className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
            />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {learningSteps.map((step, index) => (
              <Reveal key={step.title} delay={index * 90}>
                <div className="surface-card hover-lift h-full p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-lg font-semibold text-sky-700">
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

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <div className="surface-card-strong h-full p-8">
              <SectionHeading
                eyebrow="Why ELIGNITE"
                title="A modern training environment with structure, clarity, and momentum."
                description="The platform is designed to make programs feel credible, easy to navigate, and motivating to continue."
                className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
              />
            </div>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { icon: Users2, title: "Student-ready UX", text: "Learners can track applications, follow progress, and move through training without confusion." },
              { icon: Sparkles, title: "Expert-led support", text: "Teachers and coordinators can keep learning active with updates, feedback, and guidance." },
              { icon: Clock3, title: "Flexible delivery", text: "Programs can support evening, weekend, remote, and hybrid schedules for real-world learners." },
              { icon: ShieldCheck, title: "Professional trust", text: "Clear admissions, secure access, and polished communication build confidence from the first visit." },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 90}>
                <div className="surface-card hover-lift h-full p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
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

      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
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
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimony, index) => (
              <Reveal key={testimony.id} delay={index * 90}>
                <div className="surface-card hover-lift h-full p-6">
                  <p className="text-sm uppercase tracking-[0.22em] text-sky-600">{testimony.program}</p>
                  <p className="mt-4 text-lg leading-8 text-slate-700">&ldquo;{testimony.text}&rdquo;</p>
                  <div className="mt-8 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{testimony.name}</p>
                      <p className="text-sm text-slate-500">{testimony.rating}/5 rating</p>
                    </div>
                    <div className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs text-sky-700">
                      Verified
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
          <Reveal>
            <SectionHeading
              eyebrow="FAQ"
              title="Common questions from new learners."
              description="The public site now makes the next step clearer, but here are the essentials in one place."
              className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
            />
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

      <section className="border-y border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
          {partnerLogos.map((partner) => (
            <div key={partner} className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2">
              {partner}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="surface-card-strong overflow-hidden p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">Ready to start</p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
                  Join a serious tech training platform built to help you produce real work.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Browse the tracks, apply to the one that fits your goal, and move into a guided learning environment that feels current and credible.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button size="lg" asChild className="bg-sky-500 text-white hover:bg-sky-600">
                  <Link href="/enroll">Apply Now</Link>
                </Button>
                <Button size="lg" asChild variant="outline" className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50">
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
