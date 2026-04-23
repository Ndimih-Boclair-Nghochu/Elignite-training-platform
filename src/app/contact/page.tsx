"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ContactForm } from "@/components/contact/Contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-900 to-blue-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            Have a question or need help with admissions? Our team is here to support you.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-2">
          <Card className="shadow-xl border border-slate-200">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-sky-600 mt-1" />
                <div>
                  <p className="font-semibold">Campus Office</p>
                  <p className="text-sm text-slate-600">Bamenda, NW Region, Cameroon</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-sky-600 mt-1" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-sm text-slate-600">+237 677 000 111</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-sky-600 mt-1" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-sm text-slate-600">info@edumanage.cm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ContactForm />
        </div>
      </section>
    </div>
  );
}
