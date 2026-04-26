import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import {
  BookOpen,
  Briefcase,
  HeartPulse,
  Users,
  Star,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const categoryIcons: Record<string, typeof BookOpen> = {
  Business: Briefcase,
  Health: HeartPulse,
  Science: BookOpen,
  Engineering: BookOpen,
};

function getProgramIcon(category: string) {
  return categoryIcons[category] || BookOpen;
}

export default async function ProgramDetailsPage({ params }: { params: { slug: string } }) {
  const program = await prisma.program.findUnique({
    where: { slug: params.slug },
    include: {
      teacher: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!program) {
    notFound();
  }

  const enrolledCount = await prisma.student.count({ where: { program: program.title } });
  const testimonies = await prisma.testimony.findMany({
    where: {
      program: program.title,
      status: "approved",
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  const Icon = getProgramIcon(program.category);
  const instructor = program.teacher?.user;
  const instructorName = instructor
    ? [instructor.firstName, instructor.lastName].filter(Boolean).join(" ") || "TBA"
    : "TBA";
  const instructorInitials =
    instructorName === "TBA"
      ? "TBA"
      : instructorName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="relative overflow-hidden bg-slate-950 text-white py-24 px-4">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_30%)]" />
        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-sky-100 shadow-sm backdrop-blur">
                <Icon className="h-5 w-5 text-white" />
                {program.category} Program
              </div>
              <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight">{program.title}</h1>
              <p className="mt-4 max-w-3xl text-lg text-slate-200">{program.description}</p>
            </div>
            <div className="space-y-3 text-left md:text-right">
              <Badge className="bg-white/10 text-white border-white/20">{program.duration}</Badge>
              <Badge className="bg-white/10 text-white border-white/20">{program.category}</Badge>
              <Badge className="bg-white/10 text-white border-white/20">{program.tuition.toLocaleString()} XAF</Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid gap-10 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-10">
            <Card className="border border-slate-200 bg-white shadow-[0_25px_60px_-25px_rgba(15,23,42,0.35)]">
              <CardHeader>
                <CardTitle>Program Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-700">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Who is this program for?</p>
                    <p className="mt-2 text-sm text-gray-600">
                      {program.requirements ||
                        `Learners who want to build a career in ${program.category.toLowerCase()} and gain practical, industry-ready skills.`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">What you&apos;ll learn</p>
                    <p className="mt-2 text-sm text-gray-600">{program.outcomes || "Gain a strong foundation and practical experience for a successful career."}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Students enrolled</p>
                    <p className="mt-2 text-2xl font-bold text-blue-900">{enrolledCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Instructor</p>
                    <p className="mt-2 text-sm text-gray-600">{instructorName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 text-gray-700">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full bg-blue-100">
                    {instructor?.photoUrl ? (
                      <Image
                        src={instructor.photoUrl}
                        alt={instructorName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-blue-500 text-xl font-semibold text-white">
                        {instructorInitials}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-900">{instructorName}</p>
                    <p className="text-sm text-gray-600">{program.teacher?.specialization || "Program Lead"}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{program.teacher?.qualifications || "Our instructor brings practical experience and student-centered teaching to every class."}</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Student Testimonials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {testimonies.length > 0 ? (
                  testimonies.map((testimony) => (
                    <div key={testimony.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 overflow-hidden rounded-full bg-blue-100">
                          {testimony.user?.photoUrl ? (
                            <Image
                              src={testimony.user.photoUrl}
                              alt={testimony.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-blue-500 text-white">
                              {testimony.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{testimony.name}</p>
                          <p className="text-sm text-gray-500">{testimony.program}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-gray-700">{testimony.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">There are no published student reviews for this program yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden shadow-lg">
              <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-8 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Course snapshot</p>
                    <h2 className="mt-4 text-3xl font-bold">Join {program.title}</h2>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-8 grid gap-4">
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Duration</p>
                    <p className="mt-2 text-xl font-semibold">{program.duration}</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Tuition</p>
                    <p className="mt-2 text-xl font-semibold">{program.tuition.toLocaleString()} XAF</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 p-6 bg-white">
                <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div>
                    <p className="text-sm text-slate-500">Total students</p>
                    <p className="text-2xl font-semibold text-slate-900">{enrolledCount.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-100 px-3 py-2 text-sm text-blue-700">Trending</div>
                </div>
                <Button size="lg" className="w-full" asChild>
                  <Link href={`/enroll?program=${program.id}`}>Enroll Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link href="/programs">Back to all programs</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
