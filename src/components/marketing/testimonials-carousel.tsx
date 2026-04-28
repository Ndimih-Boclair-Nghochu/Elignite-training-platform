"use client";

interface Testimony {
  id: number;
  name: string;
  program: string;
  text: string;
  rating: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsCarousel({ items }: { items: Testimony[] }) {
  if (items.length === 0) return null;

  // Duplicate enough times to fill the scroll seamlessly (at least 6 cards for smooth loop)
  const copies = Math.ceil(6 / items.length);
  const track = Array.from({ length: copies * 2 }, () => items).flat();

  // Animation duration: ~80px/s per card (340px wide) — feels smooth but readable
  const durationSec = items.length * 340 / 80;

  return (
    <>
      <style>{`
        @keyframes elignite-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .elignite-marquee-track {
          animation: elignite-marquee ${durationSec}s linear infinite;
          will-change: transform;
        }
        .elignite-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Fade edges on left and right for a polished "infinite" feel */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-50 to-transparent sm:w-24" />

        <div className="elignite-marquee-track flex gap-5 py-2">
          {track.map((t, i) => (
            <div
              key={i}
              className="w-[320px] flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                {t.program}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700 line-clamp-4">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{t.name}</p>
                  <StarRating rating={t.rating} />
                </div>
                <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
