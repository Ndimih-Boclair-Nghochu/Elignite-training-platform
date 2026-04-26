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
    <div className="relative mx-auto flex w-full max-w-[400px] items-center justify-center">
      <div className="phone-orbit relative rounded-[46px] border border-blue-200 bg-slate-900 p-3 shadow-[0_40px_120px_-50px_rgba(13,91,215,0.35)]">
        <div className="absolute left-1/2 top-3 z-20 h-5 w-28 -translate-x-1/2 rounded-full bg-slate-950" />
        <div className="relative aspect-[9/19.5] w-[300px] overflow-hidden rounded-[36px] bg-[#e8f5ff] p-2">
          {images.map((image, index) => (
            <div
              key={image.src}
              className={`absolute inset-0 transition-opacity duration-700 ${
                active === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-white">
                <Image src={image.src} alt={image.alt} fill className="object-contain" />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-1.5 left-1/2 h-1.5 w-24 -translate-x-1/2 rounded-full bg-slate-500/70" />
      </div>
    </div>
  );
}
