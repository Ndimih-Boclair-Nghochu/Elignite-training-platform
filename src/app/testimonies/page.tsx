"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

interface Testimony {
  id: number;
  name: string;
  program: string;
  year: string;
  text: string;
  rating: number;
  submitterType: "student" | "teacher";
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    photoUrl: string | null;
  };
}

export default function TestimoniesPage() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const fetchTestimonies = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/testimonies");
      if (!response.ok) throw new Error("Failed to fetch testimonies");
      const data = await response.json();
      setTestimonies(data);
    } catch (error) {
      console.error("Error fetching testimonies:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Student & Teacher Testimonies</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from our community members about their experiences and success stories at our institution.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading testimonies...</p>
            </div>
          ) : testimonies.length === 0 ? (
            <div className="text-center py-12">
              <Quote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No testimonies available yet.</p>
              <p className="text-gray-400">Check back soon for student and teacher experiences!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonies.map((testimony) => (
                <Card key={testimony.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        {testimony.user?.photoUrl ? (
                          <img
                            src={testimony.user.photoUrl}
                            alt={testimony.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-lg">
                              {testimony.name[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {testimony.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              testimony.submitterType === "student"
                                ? "border-blue-200 text-blue-700"
                                : "border-green-200 text-green-700"
                            }`}
                          >
                            {testimony.submitterType === "student" ? "👨‍🎓 Student" : "👨‍🏫 Teacher"}
                          </Badge>
                        </div>
                        {testimony.program && (
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {testimony.program}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center mb-3">
                      {Array.from({ length: testimony.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">
                        {testimony.rating}/5
                      </span>
                    </div>

                    <blockquote className="text-gray-700 italic">
                      "{testimony.text}"
                    </blockquote>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        {new Date(testimony.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}