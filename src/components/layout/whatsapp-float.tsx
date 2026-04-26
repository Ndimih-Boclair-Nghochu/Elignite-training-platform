"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-wa-ring" />
      <Link
        href="https://wa.me/237670768962"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with ELIGNITE on WhatsApp"
        className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_45px_-18px_rgba(37,211,102,0.9)] animate-wa-bounce hover:scale-110 transition-transform"
      >
        <MessageCircle className="h-6 w-6" />
      </Link>
    </div>
  );
}
