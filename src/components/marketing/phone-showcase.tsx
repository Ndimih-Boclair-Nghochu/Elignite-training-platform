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
    <div className="relative mx-auto flex w-full max-w-[420px] items-center justify-center">
      <div className="phone-orbit relative rounded-[48px] border border-blue-200 bg-slate-950 p-3 shadow-[0_40px_120px_-50px_rgba(37,99,235,0.38)]">
        <div className="absolute left-1/2 top-3 z-20 h-5 w-28 -translate-x-1/2 rounded-full bg-slate-950" />
        <div className="relative h-[620px] w-[330px] overflow-hidden rounded-[38px] bg-black">
          {images.map((image, index) => (
            <div
              key={image.src}
              className={`absolute inset-0 transition-opacity duration-700 ${
                active === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image src={image.src} alt={image.alt} fill className="object-fill" />
            </div>
          ))}
        </div>
        <div className="absolute bottom-1.5 left-1/2 h-1.5 w-24 -translate-x-1/2 rounded-full bg-slate-500/70" />
      </div>
    </div>
  );
}
