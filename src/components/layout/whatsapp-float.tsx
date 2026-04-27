"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";

const WA_NUMBER = "237670768962";
const WA_URL = `https://wa.me/${WA_NUMBER}`;

// WhatsApp SVG icon (official brand icon)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.347.637 4.637 1.84 6.637L2.667 29.333l6.853-1.8A13.28 13.28 0 0 0 16.003 29.333C23.367 29.333 29.333 23.363 29.333 16S23.367 2.667 16.003 2.667zm0 24c-2.04 0-4.04-.547-5.787-1.587l-.413-.24-4.067 1.067 1.08-3.947-.267-.427A10.613 10.613 0 0 1 5.333 16c0-5.88 4.787-10.667 10.667-10.667S26.667 10.12 26.667 16 21.88 26.667 16.003 26.667zm5.853-7.973c-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-.987 1.253-.16.213-.347.24-.667.08-.32-.16-1.347-.493-2.56-1.573-.947-.84-1.587-1.88-1.773-2.2-.187-.32-.02-.493.14-.653.147-.147.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.253-.6-.52-.52-.72-.533h-.613c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667 0 1.573 1.147 3.093 1.307 3.307.16.213 2.253 3.44 5.467 4.827.763.327 1.36.52 1.827.667.767.24 1.467.207 2.013.12.613-.093 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z"/>
    </svg>
  );
}

export function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const pathname = usePathname();

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (user || pathname.startsWith("/dashboard")) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60]" ref={popupRef}>
      {/* Popup card */}
      {open && (
        <div className="mb-4 w-80 rounded-2xl bg-white shadow-[0_8px_40px_-8px_rgba(0,0,0,0.22)] overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#25D366] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <WhatsAppIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">ELIGNITE Support</p>
              <p className="text-xs text-green-100">Typically replies within minutes</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-white/80 hover:bg-white/20 transition-colors"
              aria-label="Close chat popup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Message bubble */}
          <div className="bg-[#ECE5DD] px-4 py-5">
            <div className="rounded-xl rounded-tl-none bg-white px-4 py-3 shadow-sm max-w-[90%]">
              <p className="text-sm leading-relaxed text-slate-700">
                👋 Hello! Welcome to <strong>ELIGNITE Tech Training Platform</strong>.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Whether you have questions about our training programs, admission requirements, tuition fees, class schedules, or anything else — our admissions team is here to help you personally.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Send us a message on WhatsApp and we'll get back to you promptly. We look forward to helping you take the next step in your tech journey! 🚀
              </p>
              <p className="mt-2 text-[10px] text-slate-400 text-right">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {/* CTA button */}
          <div className="bg-white px-4 py-3">
            <a
              href={WA_URL}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#20bc5a] transition-colors"
              onClick={() => setOpen(false)}
            >
              <WhatsAppIcon className="h-5 w-5" />
              Start a Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Chat with ELIGNITE on WhatsApp"
        className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_45px_-18px_rgba(37,211,102,0.9)] hover:scale-110 transition-transform"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        <WhatsAppIcon className="relative h-7 w-7" />
      </button>
    </div>
  );
}
