"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const images = [
  { src: "/showcase/elignite-flyer-1.jpeg", alt: "ELIGNITE computer training flyer" },
  { src: "/showcase/elignite-flyer-2.jpeg", alt: "ELIGNITE basic computer training flyer" },
];

export function PhoneShowcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % images.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto flex w-full max-w-[360px] items-center justify-center">
      <div className="phone-orbit relative rounded-[42px] border border-slate-300 bg-slate-900 p-3 shadow-[0_40px_120px_-50px_rgba(14,165,233,0.35)]">
        <div className="absolute left-1/2 top-3 z-20 h-5 w-28 -translate-x-1/2 rounded-full bg-slate-950" />
        <div className="relative aspect-[9/19.5] w-[280px] overflow-hidden rounded-[34px] bg-white">
          {images.map((image, index) => (
            <div
              key={image.src}
              className={`absolute inset-0 transition-opacity duration-700 ${
                active === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image src={image.src} alt={image.alt} fill className="object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute bottom-1.5 left-1/2 h-1.5 w-24 -translate-x-1/2 rounded-full bg-slate-500/70" />
      </div>
    </div>
  );
}
