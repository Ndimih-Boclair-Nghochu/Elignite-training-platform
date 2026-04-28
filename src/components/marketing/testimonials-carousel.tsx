"use client";

import { useState, useEffect, useCallback } from "react";

interface Testimony {
  id: number;
  name: string;
  program: string;
  text: string;
  rating: number;
}

type Stage = "idle" | "exit" | "enter";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`h-4 w-4 ${i < rating ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsCarousel({ items }: { items: Testimony[] }) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("idle");

  // Pad to at least 3 so the grid always fills
  const padded = items.length === 0 ? [] : items.length < 3
    ? [...items, ...items, ...items].slice(0, 3)
    : items;

  const visible = [0, 1, 2].map((i) => padded[(index + i) % padded.length]);

  const advance = useCallback(() => {
    setStage((s) => (s === "idle" ? "exit" : s));
  }, []);

  // Stage machine
  useEffect(() => {
    if (stage === "exit") {
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % padded.length);
        setStage("enter");
      }, 320);
      return () => clearTimeout(t);
    }
    if (stage === "enter") {
      // Give the browser a frame to paint the snapped-right position, then slide in
      const t = setTimeout(() => setStage("idle"), 50);
      return () => clearTimeout(t);
    }
  }, [stage, padded.length]);

  // Auto-advance
  useEffect(() => {
    const t = setInterval(advance, 5000);
    return () => clearInterval(t);
  }, [advance]);

  const wrapperClass =
    stage === "exit"
      ? "opacity-0 -translate-x-10 transition-all duration-[320ms] ease-in"
      : stage === "enter"
        ? "opacity-0 translate-x-10" // instant snap to right — no transition class intentionally
        : "opacity-100 translate-x-0 transition-all duration-500 ease-out";

  return (
    <div className="relative overflow-hidden">
      {/* Sliding track */}
      <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${wrapperClass}`}>
        {visible.map((t, i) => (
          <div key={`${t.id}-${i}`} className="surface-card hover-lift h-full p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              {t.program}
            </p>
            <p className="mt-4 text-base leading-8 text-slate-700">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-950">{t.name}</p>
                <StarRating rating={t.rating} />
              </div>
              <div className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 shrink-0">
                Verified
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {padded.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => { setIndex(i); setStage("idle"); }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index % padded.length === i
                ? "w-6 bg-blue-600"
                : "w-2 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>

      {/* Right-arrow auto-indicator bar */}
      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
        <span className="inline-block h-px w-8 bg-slate-200" />
        Auto-rotating
        <span className="inline-block h-px w-8 bg-slate-200" />
      </div>
    </div>
  );
}
