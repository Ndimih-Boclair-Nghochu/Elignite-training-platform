import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { eventDate: "desc" },
  });

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden border-b border-blue-100">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1800&q=80"
            alt="ELIGNITE event audience"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.93),rgba(224,242,254,0.84),rgba(37,99,235,0.18))]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Events & Highlights"
              title="Graduations, showcases, workshops, and milestone moments from the ELIGNITE community."
              description="Browse a structured archive of training events, learner celebrations, and community moments through photos, videos, and detailed recaps."
              className="[&_h2]:text-slate-950 [&_p]:text-slate-600"
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {events.length === 0 ? (
          <div className="surface-card p-10 text-center text-slate-500">
            No events have been published yet.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {events.map((event, index) => {
              const galleryItems = Array.isArray(event.galleryItems)
                ? event.galleryItems.filter((item): item is string => typeof item === "string")
                : [];

              return (
                <Reveal key={event.id} delay={index * 70}>
                  <article className="surface-card-strong hover-lift overflow-hidden">
                    <div className="relative h-72">
                      <img src={event.coverImageUrl} alt={event.title} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                      <div className="absolute left-5 top-5 flex items-center gap-3">
                        <Badge className="border-white/15 bg-white/92 text-blue-700">{event.category}</Badge>
                        {event.videoUrl && (
                          <span className="rounded-full border border-white/15 bg-white/90 px-3 py-1 text-xs text-slate-800">
                            Video included
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-blue-600" />
                          {new Date(event.eventDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            {event.location}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold text-slate-950">{event.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{event.excerpt}</p>
                      <p className="mt-4 text-sm leading-7 text-slate-600">{event.description}</p>

                      {galleryItems.length > 0 && (
                        <div className="mt-6 grid grid-cols-3 gap-3">
                          {galleryItems.slice(0, 3).map((item, galleryIndex) => (
                            <div key={`${event.id}-${galleryIndex}`} className="relative h-24 overflow-hidden rounded-2xl">
                              <img src={item} alt={`${event.title} gallery image ${galleryIndex + 1}`} className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      {event.videoUrl && (
                        <div className="mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-slate-950">
                          <video controls className="h-64 w-full object-cover">
                            <source src={event.videoUrl} />
                          </video>
                        </div>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-t border-blue-100 bg-blue-50/35 px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl border border-blue-100 bg-white p-8 shadow-sm lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">Stay connected</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">See how training turns into real milestones.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                From graduation ceremonies to portfolio showcases, the event archive highlights the progress learners make through ELIGNITE.
              </p>
            </div>
            <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/enroll">
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
