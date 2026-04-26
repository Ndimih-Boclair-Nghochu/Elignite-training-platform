import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Quote, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TestimoniesPage() {
  let testimonies: Array<{
    id: number;
    name: string;
    program: string;
    year: string;
    text: string;
    rating: number;
    submitterType: string;
    createdAt: Date;
    user?: { photoUrl: string | null } | null;
  }> = [];

  try {
    testimonies = await prisma.testimony.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { photoUrl: true } } },
    });
  } catch (error) {
    console.error("Testimonies fallback:", error);
  }

  const fallback = [
    {
      id: 1,
      name: "Merveille N.",
      program: "Software Engineering",
      year: "2026",
      text: "The program felt focused and practical. I was not just watching lessons, I was building things that made sense.",
      rating: 5,
      submitterType: "student" as const,
      createdAt: new Date(),
      user: null,
    },
    {
      id: 2,
      name: "Daniel T.",
      program: "Cloud & DevOps",
      year: "2026",
      text: "The structure helped me stay consistent. I could see progress clearly and that made it easier to keep going.",
      rating: 5,
      submitterType: "student" as const,
      createdAt: new Date(),
      user: null,
    },
    {
      id: 3,
      name: "Coach Melissa",
      program: "Graphic Design",
      year: "2026",
      text: "From the teacher side, the platform makes it easier to guide learners and keep communication cleaner.",
      rating: 5,
      submitterType: "teacher" as const,
      createdAt: new Date(),
      user: null,
    },
  ];

  const items = testimonies.length > 0 ? testimonies : fallback;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden border-b border-blue-100 bg-[linear-gradient(180deg,#edf7ff_0%,#ffffff_55%,#f5fbff_100%)]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
            alt="Learners sharing experiences"
            fill
            className="object-cover opacity-[0.1]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.92),rgba(255,255,255,0.84),rgba(186,230,253,0.72))]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Testimonials"
              title="Real voices from learners and instructors using the platform."
              description="A better training experience should feel clearer, more motivating, and more useful. These stories show how that lands for people inside ELIGNITE."
              className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((testimony, index) => (
            <Reveal key={testimony.id} delay={index * 70}>
              <article className="surface-card-strong hover-lift h-full p-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border border-blue-100 bg-sky-100">
                    {testimony.user?.photoUrl ? (
                      <img src={testimony.user.photoUrl} alt={testimony.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-blue-700">
                        {testimony.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">{testimony.name}</p>
                    <p className="text-sm text-slate-600">{testimony.program}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <Badge className="border-blue-100 bg-sky-50 text-blue-700">
                    {testimony.submitterType === "student" ? "Student" : "Instructor"}
                  </Badge>
                  <div className="flex items-center gap-1 text-sky-500">
                    {Array.from({ length: testimony.rating }).map((_, starIndex) => (
                      <Star key={starIndex} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-[22px] border border-blue-100 bg-sky-50/60 p-5">
                  <Quote className="h-5 w-5 text-blue-700" />
                  <p className="mt-4 text-sm leading-7 text-slate-700">&ldquo;{testimony.text}&rdquo;</p>
                </div>

                <p className="mt-5 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {new Date(testimony.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
