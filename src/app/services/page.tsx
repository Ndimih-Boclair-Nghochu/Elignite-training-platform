import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, HeartHandshake, Rocket, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const iconMap: Record<string, typeof ShieldCheck> = { ShieldCheck, Briefcase, HeartHandshake, Rocket };
const fallbackServices = [
  { title: "Career Guidance", description: "Get help choosing the right track, understanding where it leads, and planning the next step after training.", icon: ShieldCheck, image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" },
  { title: "Portfolio & Project Support", description: "Learners get direction on practical assignments, project completion, and presenting work professionally.", icon: Briefcase, image: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80" },
  { title: "Mentorship & Accountability", description: "Structured guidance keeps learners consistent and helps them stay engaged through the full training path.", icon: HeartHandshake, image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80" },
  { title: "Digital Resource Access", description: "Programs are backed by templates, learning resources, guided tools, and platform-based access to materials.", icon: Rocket, image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80" },
];

export default async function ServicesPage() {
  let services = fallbackServices;

  try {
    const dbServices = await prisma.service.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
    if (dbServices.length > 0) {
      services = dbServices.map((service, index) => ({
        title: service.name,
        description: service.description,
        icon: iconMap[service.icon || "Briefcase"] || Briefcase,
        image: service.imageUrl || fallbackServices[index % fallbackServices.length].image,
      }));
    }
  } catch (error) {
    console.error("Services fallback:", error);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden border-b border-slate-200 bg-sky-50/60">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1516321310764-8d3b8c5f0d5c?auto=format&fit=crop&w=1600&q=80" alt="ELIGNITE services and learner support" fill className="object-cover opacity-[0.08]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Support Services"
              title="Training support that keeps learners moving, not guessing."
              description="The ELIGNITE experience is more than course content. It includes the guidance, structure, and practical support that help people finish strong and apply what they learn."
              className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.title} delay={index * 70}>
                <article className="surface-card-strong hover-lift grid h-full gap-0 overflow-hidden md:grid-cols-[0.85fr_1.15fr]">
                  <div className="relative min-h-[260px]">
                    <img src={service.image} alt={service.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-5 text-2xl font-semibold text-slate-950">{service.title}</h2>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{service.description}</p>
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                      Built to complement the training path with stronger clarity, better follow-through, and more practical outcomes.
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <SectionHeading
              eyebrow="Need Guidance"
              title="Not sure which track or support path fits you best?"
              description="Talk to the team and we’ll help you match your goals to the right learning plan."
              align="center"
              className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
            />
          </Reveal>
          <Reveal delay={120} className="mt-8">
            <Button asChild size="lg" className="bg-sky-500 text-white hover:bg-sky-600">
              <Link href="/contact">
                Contact the Team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
