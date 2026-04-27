import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { techPrograms } from "@/lib/site-content";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

const DEFAULT_HIGHLIGHTS = ["Practical skills", "Expert guidance", "Career-focused"];
const DEFAULT_OUTCOMES = ["Portfolio-ready projects", "Career advancement", "Practical experience"];

export default async function ProgramsPage() {
  let programs = techPrograms;

  try {
    const dbPrograms = await prisma.program.findMany({
      where: { status: "published" },
      orderBy: { title: "asc" },
    });

    if (dbPrograms.length > 0) {
      programs = dbPrograms.map((program) => {
        const fallback = techPrograms.find((item) => item.slug === program.slug);
        return {
          slug: program.slug,
          title: program.title,
          category: program.category,
          duration: program.duration,
          description: program.description,
          level: fallback?.level ?? "Beginner to Intermediate",
          price: `${program.tuition.toLocaleString()} XAF`,
          mode: fallback?.mode ?? "Hybrid",
          highlights: fallback?.highlights ?? DEFAULT_HIGHLIGHTS,
          outcomes: fallback?.outcomes ?? DEFAULT_OUTCOMES,
          image: (program.imageUrl as string | null) || fallback?.image || techPrograms[0].image,
        };
      });
    }
  } catch (error) {
    console.error("Programs fallback:", error);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden border-b border-blue-100">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
            alt="Tech learners collaborating"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.94),rgba(255,255,255,0.86),rgba(37,99,235,0.16))]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Tech Training Tracks"
              title="Programs built for practical digital careers, not vague promises."
              description="Browse focused training tracks across software, cloud, design, AI tools, productivity, and digital growth. Every card shows the essentials: level, mode, duration, and where it can take you."
              className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {programs.map((program, index) => (
            <Reveal key={program.slug} delay={index * 60}>
              <article className="surface-card-strong hover-lift h-full overflow-hidden">
                <div className="relative h-56">
                  {program.image.startsWith("data:") ? (
                    <img
                      src={program.image}
                      alt={program.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <Image src={program.image} alt={program.title} fill className="object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
                  <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                    <Badge className="border-white/20 bg-white/90 text-blue-700">{program.category}</Badge>
                    <span className="rounded-full border border-white/20 bg-white/85 px-3 py-1 text-xs text-slate-700">
                      {program.mode}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-slate-950">{program.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{program.description}</p>

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

                  <div className="mt-5 space-y-2">
                    {program.highlights.map((item) => (
                      <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button asChild className="flex-1 bg-blue-500 text-white hover:bg-blue-600">
                      <Link href={`/enroll?program=${program.slug}`}>Apply Now</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 border-slate-200 bg-white text-slate-900 hover:bg-slate-50">
                      <Link href={`/programs/${program.slug}`}>
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
