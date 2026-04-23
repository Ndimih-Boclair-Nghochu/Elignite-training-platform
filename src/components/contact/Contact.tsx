"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MessageSquare } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Card className="shadow-xl border border-slate-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-sky-600" />
          <CardTitle>Send a Message</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-6 text-emerald-900">
            Thank you! Your message has been submitted. We will respond shortly.
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <Input type="text" placeholder="Your Name" required className="mt-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <Input type="email" placeholder="you@example.com" required className="mt-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Message</label>
              <Textarea placeholder="How can we help?" rows={5} required className="mt-2" />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Send Message
            </Button>
          </form>
        )}
      </CardContent>
      <div className="border-t border-slate-200 px-6 py-5 bg-slate-50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-slate-600">
            <Mail className="h-4 w-4" />
            <span>info@edumanage.cm</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <Phone className="h-4 w-4" />
            <span>+237 677 000 111</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
