import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { prisma } from "@/lib/prisma";
import { partnerLogos } from "@/lib/site-content";
import { Globe2, Layers3, Users2 } from "lucide-react";

export const dynamic = "force-dynamic";

const defaultAbout = {
  vision:
    "To become a trusted technology training platform where learners build practical digital skills with confidence, clarity, and real career direction.",
  mission:
    "To help people move into modern tech work through guided learning, applied projects, visible progress, and support that feels serious and professional.",
  visionImageUrl:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  missionImageUrl:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
};

export default async function AboutUsPage() {
  let about = defaultAbout;
  let gallery: Array<{ id: number; title: string; category: string; url: string }> = [];

  try {
    const [aboutUs, dbGallery] = await Promise.all([
      prisma.aboutUs.findFirst(),
      prisma.gallery.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    ]);

    if (aboutUs) {
      about = {
        vision: aboutUs.vision,
        mission: aboutUs.mission,
        visionImageUrl: aboutUs.visionImageUrl,
        missionImageUrl: aboutUs.missionImageUrl,
      };
    }

    gallery = dbGallery;
  } catch (error) {
    console.error("About fallback:", error);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden border-b border-blue-100 bg-[linear-gradient(180deg,#edf7ff_0%,#ffffff_55%,#f5fbff_100%)]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80"
            alt="Technology training environment"
            fill
            className="object-cover opacity-[0.11]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.92),rgba(255,255,255,0.84),rgba(186,230,253,0.72))]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="About ELIGNITE"
              title="A focused training platform for people who want useful tech skills and clearer career direction."
              description="ELIGNITE is built around technology-sector training. The experience is practical, professional, and designed for learners who want to grow into real digital work."
              className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <article className="surface-card-strong overflow-hidden">
              <div className="relative h-72">
                <img src={about.visionImageUrl} alt="ELIGNITE vision" className="h-full w-full object-cover" />
              </div>
              <div className="p-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-blue-700">
                  <Globe2 className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-slate-950">Our Vision</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{about.vision}</p>
              </div>
            </article>
          </Reveal>

          <Reveal delay={100}>
            <article className="surface-card-strong overflow-hidden">
              <div className="relative h-72">
                <img src={about.missionImageUrl} alt="ELIGNITE mission" className="h-full w-full object-cover" />
              </div>
              <div className="p-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-blue-700">
                  <Layers3 className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-slate-950">Our Mission</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{about.mission}</p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-sky-50/70 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              eyebrow="Our Approach"
              title="Why the platform feels different."
              description="The experience is shaped around modern tech-training expectations: practical delivery, better structure, visible progress, and interfaces that stay easy to use."
              className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
            />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Built for applied learning",
                text: "Programs center practical work, repeated execution, and real project outputs instead of drifting into abstract theory.",
              },
              {
                title: "Designed for modern learners",
                text: "Schedules, pathways, and UX choices fit learners balancing work, ambition, and the need for clear structure.",
              },
              {
                title: "Focused on digital careers",
                text: "Everything from branding to program content is aligned around tech-sector opportunity and capability building.",
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 80}>
                <div className="surface-card hover-lift h-full p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-blue-700">
                    <Users2 className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Visual Story"
            title="The environment behind the training."
            description="Real spaces, live sessions, and hands-on moments help make the platform feel grounded in actual work."
            className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
          />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(gallery.length > 0
            ? gallery
            : [
                {
                  id: 1,
                  title: "Live coding session",
                  category: "Training",
                  url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
                },
                {
                  id: 2,
                  title: "Design workshop",
                  category: "Creative Tech",
                  url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
                },
                {
                  id: 3,
                  title: "Mentor support",
                  category: "Coaching",
                  url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
                },
                {
                  id: 4,
                  title: "Team collaboration",
                  category: "Projects",
                  url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
                },
              ]
          ).map((item, index) => (
            <Reveal key={item.id} delay={index * 70}>
              <div className="surface-card-strong hover-lift overflow-hidden">
                <div className="relative h-64">
                  <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-5">
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.category}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-blue-100 bg-sky-50/50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
          {partnerLogos.map((partner) => (
            <div key={partner} className="rounded-full border border-blue-100 bg-white px-5 py-2">
              {partner}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
