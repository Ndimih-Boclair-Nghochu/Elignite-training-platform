import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Briefcase, HeartHandshake, Rocket, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const iconMap: Record<string, any> = {
  ShieldCheck,
  Briefcase,
  HeartHandshake,
  Rocket,
};

const defaultServices = [
  { title: "Career Counseling", description: "Personalized guidance to help students choose the right career path and academic program.", icon: ShieldCheck },
  { title: "Placement Support", description: "Job search assistance, internship placement, and employer networking opportunities.", icon: Briefcase },
  { title: "Student Wellbeing", description: "Health, counseling, and mentorship services to support student success and wellness.", icon: HeartHandshake },
  { title: "Digital Resources", description: "Access to learning platforms, online libraries, and academic tools for hybrid study.", icon: Rocket },
];

export default async function ServicesPage() {
  const dbServices = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const services = dbServices.length > 0
    ? dbServices.map((s) => ({
        title: s.name,
        description: s.description,
        icon: iconMap[s.icon || "Briefcase"] || Briefcase,
      }))
    : defaultServices;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-900 to-blue-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            We offer a full suite of student services designed to help you learn, grow, and succeed at every stage of your academic journey.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.title} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <Icon className="h-6 w-6" />
                    </span>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-gray-700">{service.description}</CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-16 px-4 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Want to learn more?</h2>
          <p className="text-gray-600 mb-6">Our admissions and student support teams are ready to answer your questions.</p>
          <Button size="lg" asChild>
            <Link href="/contact">Contact Us <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
