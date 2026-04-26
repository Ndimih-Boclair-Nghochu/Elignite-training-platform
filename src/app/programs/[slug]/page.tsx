import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { techPrograms } from "@/lib/site-content";
import { ArrowRight, CheckCircle2, Layers3, Users2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProgramDetailsPage({ params }: { params: { slug: string } }) {
  const fallback = techPrograms.find((item) => item.slug === params.slug);

  let dbProgram: any = null;
  let instructorName = "ELIGNITE Faculty";
  let enrolledCount = 0;
  let testimonies: Array<{ id: number; name: string; text: string; program: string }> = [];

  try {
    dbProgram = await prisma.program.findUnique({
      where: { slug: params.slug },
      include: { teacher: { include: { user: true } } },
    });

    if (dbProgram) {
      instructorName =
        [dbProgram.teacher?.user?.firstName, dbProgram.teacher?.user?.lastName]
          .filter(Boolean)
          .join(" ") || instructorName;

      const [studentCount, approvedTestimonies] = await Promise.all([
        prisma.student.count({ where: { program: dbProgram.title } }),
        prisma.testimony.findMany({
          where: { status: "approved", program: dbProgram.title },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { id: true, name: true, text: true, program: true },
        }),
      ]);

      enrolledCount = studentCount;
      testimonies = approvedTestimonies;
    }
  } catch (error) {
    console.error("Program details fallback:", error);
  }

  const program =
    dbProgram && fallback
      ? {
          slug: dbProgram.slug,
          title: dbProgram.title,
          category: dbProgram.category,
          duration: dbProgram.duration,
          description: dbProgram.description,
          level: fallback.level,
          mode: fallback.mode,
          price: `${dbProgram.tuition.toLocaleString()} XAF`,
          highlights: fallback.highlights,
          outcomes: dbProgram.outcomes
            ? dbProgram.outcomes
                .split(/[\n,]/)
                .map((item: string) => item.trim())
                .filter(Boolean)
            : fallback.outcomes,
          requirements: dbProgram.requirements
            ? dbProgram.requirements
                .split(/[\n,]/)
                .map((item: string) => item.trim())
                .filter(Boolean)
            : [
                "Interest in the field and commitment to practice",
                "Basic computer access for assignments",
                "Willingness to build projects consistently",
              ],
          image: fallback.image,
        }
      : fallback
        ? {
            ...fallback,
            requirements: [
              "Interest in the field and commitment to practice",
              "Basic computer access for assignments",
              "Willingness to build projects consistently",
            ],
          }
        : null;

  if (!program) {
    notFound();
  }

  const socialProof = testimonies.length
    ? testimonies
    : [
        {
          id: 1,
          name: "ELIGNITE Learner",
          text: "The modules were clear, the tasks were practical, and I finished with something concrete to show.",
          program: program.title,
        },
      ];

  return (
    <div className="min-h-screen bg-[#050b16] text-white">
      <Navbar />

      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0">
          <Image src={program.image} alt={program.title} fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(5,11,22,0.95),rgba(7,17,31,0.88),rgba(8,145,178,0.3))]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <Reveal>
              <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-200">{program.category}</Badge>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                {program.title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{program.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">{program.duration}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">{program.level}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">{program.mode}</span>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">{program.price}</span>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="surface-card-strong hover-lift p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Program Snapshot</p>
                <div className="mt-6 grid gap-4">
                  <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
                    <p className="text-sm text-slate-500">Instructor</p>
                    <p className="mt-1 text-lg font-semibold text-white">{instructorName}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
                    <p className="text-sm text-slate-500">Learners tracked</p>
                    <p className="mt-1 text-lg font-semibold text-white">{enrolledCount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <Button asChild size="lg" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                    <Link href={`/enroll?program=${program.slug}`}>Apply Now</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">
                    <Link href="/programs">Back to Programs</Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
        <div className="space-y-8">
          <Reveal>
            <div className="surface-card-strong p-8">
              <h2 className="text-2xl font-semibold text-white">What you will work on</h2>
              <div className="mt-6 grid gap-3">
                {program.outcomes.map((outcome: string) => (
                  <div key={outcome} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-300" />
                    <p className="text-sm leading-7 text-slate-300">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="surface-card p-8">
              <h2 className="text-2xl font-semibold text-white">What this track expects from you</h2>
              <div className="mt-6 space-y-3">
                {program.requirements.map((item: string) => (
                  <div key={item} className="flex items-start gap-3">
                    <Layers3 className="mt-1 h-4 w-4 text-cyan-300" />
                    <p className="text-sm leading-7 text-slate-400">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="space-y-8">
          <Reveal delay={120}>
            <div className="surface-card hover-lift p-8">
              <div className="flex items-center gap-3">
                <Users2 className="h-5 w-5 text-cyan-300" />
                <h2 className="text-2xl font-semibold text-white">Learner outcomes</h2>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                This program is designed to move you from theory into visible execution. You should expect projects, repeated practice, and clearer career direction by the end of the track.
              </p>
              <div className="mt-6 grid gap-3">
                {program.highlights.map((item: string) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={180}>
            <div className="surface-card hover-lift p-8">
              <h2 className="text-2xl font-semibold text-white">What learners say</h2>
              <div className="mt-6 space-y-4">
                {socialProof.map((testimony) => (
                  <div key={testimony.id} className="rounded-2xl border border-white/8 bg-white/5 p-5">
                    <p className="text-sm leading-7 text-slate-300">&ldquo;{testimony.text}&rdquo;</p>
                    <p className="mt-4 text-sm font-medium text-white">{testimony.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{testimony.program}</p>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-6 w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                <Link href="/testimonies">
                  Read More Testimonials
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
