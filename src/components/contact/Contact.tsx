"use client";

import { useState } from "react";
import { Loader2, Mail, MessageSquare, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  body: "",
};

export function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to send message");
      }

      setSubmitted(true);
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="surface-card-strong border-blue-100 text-slate-900">
      <CardHeader className="space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-blue-700">
          <MessageSquare className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl text-slate-950">Send a message</CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          Tell us what you want to learn, the schedule you need, or the support you want from the ELIGNITE team.
        </p>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
            <p className="text-lg font-semibold">Message sent successfully.</p>
            <p className="mt-2 text-sm text-emerald-800">
              Our admissions team will get back to you shortly with the next step.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <Input
                  id="contact-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your full name"
                  required
                  className="mt-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <Input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@example.com"
                  required
                  className="mt-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-700">
                Subject
              </label>
              <Input
                id="contact-subject"
                value={form.subject}
                onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                placeholder="What would you like help with?"
                required
                className="mt-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="contact-body" className="block text-sm font-medium text-slate-700">
                Message
              </label>
              <Textarea
                id="contact-body"
                value={form.body}
                onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                placeholder="Tell us your goals, your preferred track, or the kind of support you need."
                rows={6}
                required
                className="mt-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <Button type="submit" size="lg" disabled={loading} className="w-full bg-[#0d5bd7] text-white hover:bg-[#0a49ac]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}
      </CardContent>
      <div className="border-t border-blue-100 px-6 py-5">
        <div className="flex flex-col gap-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-blue-600" />
            <span>admissions@elignite.cm</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-blue-600" />
            <span>+237 677 000 111</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
