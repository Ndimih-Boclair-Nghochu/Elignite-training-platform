"use client";

import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/contact/Contact";
import { Reveal } from "@/components/marketing/reveal";
import { Mail, MapPin, Phone, TimerReset } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden border-b border-blue-100 bg-[linear-gradient(180deg,#edf7ff_0%,#ffffff_55%,#f5fbff_100%)]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80"
            alt="ELIGNITE support team"
            fill
            className="object-cover opacity-[0.1]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.92),rgba(255,255,255,0.84),rgba(186,230,253,0.72))]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">Contact ELIGNITE</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Reach the team behind the training experience.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Ask about programs, admissions, schedules, beginner pathways, or the best track for your goals. Everything here is tuned for a cleaner and more reliable admissions experience.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            {[
              {
                icon: MapPin,
                title: "Location",
                value: "Bamenda, Cameroon",
                note: "A focused tech-training platform serving ambitious learners.",
              },
              {
                icon: Mail,
                title: "Email",
                value: "admissions@elignite.cm",
                note: "Best for admissions, program guidance, and support questions.",
              },
              {
                icon: Phone,
                title: "Phone",
                value: "+237 677 000 111",
                note: "Reach us directly for quick guidance on your next step.",
              },
              {
                icon: TimerReset,
                title: "Response Time",
                value: "Within 1 business day",
                note: "We aim to keep the admissions journey responsive and calm.",
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 80}>
                <div className="surface-card hover-lift p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-blue-700">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h2>
                  <p className="mt-3 text-base text-slate-900">{item.value}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.note}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
