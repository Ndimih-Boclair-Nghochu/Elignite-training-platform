"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, ArrowRight, Phone, Mail, MapPin, Plus, Minus, Star } from "lucide-react";

const faqs = [
  {
    question: "What computer skills will I learn?",
    answer: "You'll learn essential skills including Microsoft Office Suite (Word, Excel, PowerPoint), web development basics, data entry, digital literacy, and specialized software relevant to your career path."
  },
  {
    question: "How long does it take to become proficient?",
    answer: "Most students become proficient in basic computer skills within 3-6 months of dedicated training. Advanced skills may take 6-12 months depending on your learning pace and practice time."
  },
  {
    question: "Will computer skills help my career?",
    answer: "Absolutely! Computer skills are now essential in virtually every industry. They increase your employability, open doors to better-paying jobs, and give you a competitive edge in the modern workplace."
  },
  {
    question: "Do I need prior computer experience?",
    answer: "No prior experience is required. Our courses are designed for beginners and build skills progressively from the basics to advanced levels."
  },
  {
    question: "What jobs can I get with computer skills?",
    answer: "Computer skills open doors to roles like administrative assistant, data entry specialist, office manager, digital marketing assistant, and many entry-level IT positions."
  },
  {
    question: "How much can I earn with computer skills?",
    answer: "Entry-level positions with computer skills typically pay $25,000-$45,000 annually, with experienced professionals earning $50,000+ depending on specialization and location."
  }
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [generalTestimonials, setGeneralTestimonials] = useState<Array<{ id: number; name: string; program: string; text: string; rating: number; user: { photoUrl: string | null } }>>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonies");
        if (!response.ok) throw new Error("Unable to load testimonials");
        const data = await response.json();
        setGeneralTestimonials(data.filter((item: any) => item.program === "General"));
      } catch (error) {
        console.error("Failed to fetch general testimonials:", error);
      } finally {
        setLoadingTestimonials(false);
      }
    };

    fetchTestimonials();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="relative overflow-hidden bg-slate-950 text-white py-28 px-4">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_30%)]" />
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6 leading-snug">
            Shape your future with <span className="text-sky-300">purposeful learning</span>.
          </h1>
          <p className="text-xl text-slate-200 mb-10 max-w-2xl mx-auto">
            Join thousands of students building successful careers through accredited programs, expert faculty, and modern campus systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-bold text-lg px-8" asChild>
              <Link href="/enroll">Apply Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 font-bold text-lg px-8" asChild>
              <Link href="/programs">Explore Programs</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    {openFaq === index ? (
                      <Minus className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <Plus className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-500">General Testimonials</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What our community says about us</h2>
            </div>
            <p className="text-sm text-gray-500 max-w-xl">
              Approved general testimonies appear here to help visitors understand the real student and teacher experience.
            </p>
          </div>

          {loadingTestimonials ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : generalTestimonials.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No general testimonials are available yet. Check back soon.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {generalTestimonials.slice(0, 3).map((testimonial) => (
                <Card key={testimonial.id} className="border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-lg">
                        {testimonial.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.program === "General" ? "General testimony" : testimonial.program}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-4 text-yellow-500">
                      {Array.from({ length: testimonial.rating }).map((_, index) => (
                        <Star key={index} className="w-4 h-4" />
                      ))}
                    </div>
                    <p className="text-gray-700">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-blue-700 to-blue-900 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-blue-100 text-lg mb-8">Apply today and take the first step toward a bright future.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-bold" asChild><Link href="/enroll">Apply Now</Link></Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900" asChild><Link href="/contact">Contact Us</Link></Button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-10 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4"><GraduationCap className="h-6 w-6" />EduManage</div>
            <p className="text-sm text-gray-400">Empowering students with quality education since 2005.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            {["Programs", "Services", "About Us", "Contact"].map((l) => (
              <Link key={l} href={`/${l.toLowerCase().replace(" ", "-")}`} className="block text-sm hover:text-white mb-1">{l}</Link>
            ))}
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Bamenda, NW Region, Cameroon</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +237 677 000 111</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@edumanage.cm</div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} EduManage. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
