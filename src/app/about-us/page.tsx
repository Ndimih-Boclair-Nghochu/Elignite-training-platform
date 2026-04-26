import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe2, Award, Users, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const defaultAbout = {
  vision: "To become the leading training platform in the region by delivering accessible, trusted, and technology-driven learning experiences to every student.",
  visionImageUrl: "https://placehold.co/640x480?text=Vision",
  mission: "To equip learners with the skills, knowledge, and support they need to succeed in school and beyond through quality programs, caring faculty, and seamless administrative systems.",
  missionImageUrl: "https://placehold.co/640x480?text=Mission",
};

export default async function AboutUsPage() {
  const aboutUs = await prisma.aboutUs.findFirst();
  const gallery = await prisma.gallery.findMany({ orderBy: { createdAt: "desc" } });
  const staff = await prisma.teacher.findMany({
    where: {},
    include: { user: { select: { firstName: true, lastName: true, phone: true } } },
    orderBy: { joinDate: "desc" },
  });

  const pageAbout = {
    vision: aboutUs?.vision ?? defaultAbout.vision,
    visionImageUrl: aboutUs?.visionImageUrl ?? defaultAbout.visionImageUrl,
    mission: aboutUs?.mission ?? defaultAbout.mission,
    missionImageUrl: aboutUs?.missionImageUrl ?? defaultAbout.missionImageUrl,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="relative overflow-hidden bg-slate-950 text-white py-24 px-4">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_30%)]" />
        <div className="relative max-w-6xl mx-auto text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.3em] text-slate-200">
            <Globe2 className="h-4 w-4 text-sky-300" />Our Vision
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">Modern education for every learner.</h1>
          <p className="mx-auto max-w-3xl text-lg text-slate-200">
            ELIGNITE blends innovation, strong academics, and community support to create a modern training experience that empowers students, teachers, and administrators.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-2">
          <div className="rounded-[2rem] overflow-hidden bg-white shadow-[0_25px_80px_-40px_rgba(15,23,42,0.25)]">
            <Image src={pageAbout.visionImageUrl} alt="Our vision" width={640} height={480} className="h-80 w-full object-cover" />
            <div className="p-8">
              <h2 className="text-3xl font-semibold mb-4">Our Vision</h2>
              <p className="text-slate-600 leading-relaxed">{pageAbout.vision}</p>
            </div>
          </div>

          <div className="rounded-[2rem] overflow-hidden bg-white shadow-[0_25px_80px_-40px_rgba(15,23,42,0.25)]">
            <Image src={pageAbout.missionImageUrl} alt="Our mission" width={640} height={480} className="h-80 w-full object-cover" />
            <div className="p-8">
              <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed">{pageAbout.mission}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Meet our leadership team</p>
            <h2 className="text-3xl md:text-4xl font-semibold mt-4">Staff and Support</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {staff.length > 0 ? (
              staff.map((member) => (
                <Card key={member.id} className="bg-slate-900 border border-slate-800 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.6)]">
                  <CardContent className="space-y-6 text-slate-100">
                    <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
                      <Image src={`https://placehold.co/120x120?text=${encodeURIComponent(member.user.firstName?.[0] || "S")}${encodeURIComponent(member.user.lastName?.[0] || "T")}`} alt={member.user.firstName + " " + member.user.lastName} fill className="object-cover" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-xl font-semibold">{member.user.firstName} {member.user.lastName}</p>
                      <p className="text-sm text-slate-400">{member.occupation || "Staff"}</p>
                    </div>
                    <a
                      href={`https://wa.me/${member.user.phone ?? ""}?text=${encodeURIComponent(`Hello ${member.user.firstName}, I would like to discuss enrollment and admissions at ELIGNITE.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                    >
                      WhatsApp Staff
                    </a>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-slate-400">No staff have been added yet. Check back later.</p>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Campus gallery</p>
            <h2 className="text-3xl md:text-4xl font-semibold mt-4">Our Campus Spaces</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {gallery.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_25px_60px_-35px_rgba(15,23,42,0.2)]">
                <div className="relative h-44 w-full">
                  <Image src={item.url} alt={item.title} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 px-4 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Want to learn more?</h2>
          <p className="text-slate-600 mb-6">Contact our team to discuss programs, admissions, and campus events.</p>
          <Button size="lg" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
