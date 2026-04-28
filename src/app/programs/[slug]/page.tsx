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
import { toMarketingProgram } from "@/lib/programs";
import { ArrowRight, CheckCircle2, Layers3, Users2 } from "lucide-react";

export const dynamic = "force-dynamic";

const DEFAULT_REQUIREMENTS = [
  "Interest in the field and commitment to practice",
  "Basic computer access for assignments",
  "Willingness to build projects consistently",
];

export default async function ProgramDetailsPage({ params }: { params: { slug: string } }) {
  const fallback = techPrograms.find((item) => item.slug === params.slug);

  let dbProgram: any = null;
  let instructorName = "ELIGNITE Faculty";
  let instructorPhotoUrl: string | null = null;
  let enrolledCount = 0;
  let testimonies: Array<{ id: number; name: string; text: string; program: string }> = [];

  try {
    dbProgram = await prisma.program.findFirst({
      where: { slug: { equals: params.slug, mode: "insensitive" } },
      include: { teachers: { include: { teacher: { include: { user: true } } }, take: 1 } },
    });

    if (dbProgram) {
      const firstTeacher = dbProgram.teachers?.[0]?.teacher;
      if (firstTeacher?.user) {
        const name = [firstTeacher.user.firstName, firstTeacher.user.lastName].filter(Boolean).join(" ");
        if (name) {
          instructorName = name;
        }
        instructorPhotoUrl = firstTeacher.user.photoUrl || null;
      }

      const [studentCount, approvedTestimonies] = await Promise.all([
        prisma.student.count({
          where: {
            OR: [{ program: dbProgram.slug }, { program: dbProgram.title }],
          },
        }),
        prisma.testimony.findMany({
          where: {
            status: "approved",
            OR: [{ program: dbProgram.title }, { program: dbProgram.slug }],
          },
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
    dbProgram
      ? toMarketingProgram(dbProgram)
      : fallback
        ? {
            ...fallback,
            requirements: DEFAULT_REQUIREMENTS,
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

  const instructorInitials = instructorName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden border-b border-blue-100">
        <div className="absolute inset-0">
          {program.image.startsWith("data:") ? (
            <img src={program.image} alt={program.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <Image src={program.image} alt={program.title} fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.93),rgba(255,255,255,0.84),rgba(37,99,235,0.15))]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <Reveal>
              <Badge className="border-blue-200 bg-blue-50 text-blue-700">{program.category}</Badge>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">{program.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{program.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[program.duration, program.level, program.mode, program.price].map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="surface-card-strong hover-lift p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">Program Snapshot</p>
                <div className="mt-6 grid gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-sm text-slate-500">Instructor</p>
                    <div className="mt-2 flex items-center gap-3">
                      {instructorPhotoUrl ? (
                        <img
                          src={instructorPhotoUrl}
                          alt={instructorName}
                          className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                          {instructorInitials}
                        </div>
                      )}
                      <p className="text-lg font-semibold text-slate-950">{instructorName}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-sm text-slate-500">Learners tracked</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">{enrolledCount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <Button asChild size="lg" className="bg-blue-500 text-white hover:bg-blue-600">
                    <Link href={`/enroll?program=${program.slug}`}>Apply Now</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50">
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
              <h2 className="text-2xl font-semibold text-slate-950">What you will work on</h2>
              <div className="mt-6 grid gap-3">
                {program.outcomes.map((outcome: string) => (
                  <div key={outcome} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-500" />
                    <p className="text-sm leading-7 text-slate-600">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="surface-card p-8">
              <h2 className="text-2xl font-semibold text-slate-950">What this track expects from you</h2>
              <div className="mt-6 space-y-3">
                {program.requirements.map((item: string) => (
                  <div key={item} className="flex items-start gap-3">
                    <Layers3 className="mt-1 h-4 w-4 text-blue-500" />
                    <p className="text-sm leading-7 text-slate-600">{item}</p>
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
                <Users2 className="h-5 w-5 text-blue-500" />
                <h2 className="text-2xl font-semibold text-slate-950">Learner outcomes</h2>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                This program is designed to move you from theory into visible execution. You should expect projects, repeated practice, and clearer career direction by the end of the track.
              </p>
              <div className="mt-6 grid gap-3">
                {program.highlights.map((item: string) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={180}>
            <div className="surface-card hover-lift p-8">
              <h2 className="text-2xl font-semibold text-slate-950">What learners say</h2>
              <div className="mt-6 space-y-4">
                {socialProof.map((testimony) => (
                  <div key={testimony.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm leading-7 text-slate-700">&ldquo;{testimony.text}&rdquo;</p>
                    <p className="mt-4 text-sm font-medium text-slate-950">{testimony.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-600">{testimony.program}</p>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-6 w-full bg-blue-500 text-white hover:bg-blue-600">
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
