import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, BookOpen, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Program {
  id: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  tuition: number;
  requirements: string;
  outcomes: string;
}

async function getPrograms() {
  return await prisma.program.findMany({ orderBy: { title: "asc" } });
}

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Our Programs</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Explore our comprehensive range of accredited programs designed to prepare you for success in your chosen field.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {programs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No programs available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <Card key={program.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-xl text-gray-900">
                        <Link href={`/programs/${program.slug}`} className="hover:text-primary">
                          {program.title}
                        </Link>
                      </CardTitle>
                      <Badge className="bg-blue-100 text-blue-800 font-medium whitespace-nowrap">
                        {program.category || "General"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{program.description}</p>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    {/* Program Details */}
                    <div className="space-y-3">
                      {program.duration && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm"><strong>Duration:</strong> {program.duration}</span>
                        </div>
                      )}
                      {program.tuition && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm"><strong>Tuition:</strong> {program.tuition?.toLocaleString()} XAF</span>
                        </div>
                      )}
                    </div>

                    {/* Requirements */}
                    {program.requirements && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-1 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Requirements
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{program.requirements}</p>
                      </div>
                    )}

                    {/* Outcomes */}
                    {program.outcomes && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-1">Learning Outcomes</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{program.outcomes}</p>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Button className="w-full sm:w-auto mt-4" variant="outline" asChild>
                        <Link href={`/programs/${program.slug}`}>View Details</Link>
                      </Button>
                      <Button className="w-full sm:w-auto mt-4" asChild>
                        <Link href={`/enroll?program=${program.id}`}>
                          Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-12 px-4 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-6">
            Fill out an application form and our admissions team will guide you through the process.
          </p>
          <Button size="lg" asChild>
            <Link href="/enroll">Apply Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
