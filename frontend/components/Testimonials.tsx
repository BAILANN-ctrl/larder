"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Reveal from "@/components/Reveal";
import { IonArrowLeft, IonArrowRight } from "@/components/icons";

const AVATARS = [
  "/images/hero-honey.png",
  "/images/hero-oats.jpg",
  "/images/hero-rye.jpg",
];

export default function Testimonials() {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const slides = [
    { quote: t("tq1"), name: t("tq1Name"), role: t("tq1Role") },
    { quote: t("tq2"), name: t("tq2Name"), role: t("tq2Role") },
    { quote: t("tq3"), name: t("tq3Name"), role: t("tq3Role") },
  ];

  const go = (next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  };

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${index * 100}%)`;
    }
  }, [index]);

  return (
    <section id="words" className="relative pt-28 pb-16 md:pt-40 md:pb-24">
      <div className="mx-auto max-w-[1300px] px-4">
        <Reveal>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">{t("testimonialEyebrow")}</p>
              <h2 className="text-balance mt-5 font-display text-[clamp(2.4rem,4.5vw,4.1rem)] leading-[1.04] tracking-[-0.03em] text-espresso">
                {t("testimonialTitle")}
                <img
                  src={AVATARS[0]}
                  alt=""
                  aria-hidden="true"
                  className="img-pill mx-2.5"
                  style={{ width: "0.7em", height: "0.7em" }}
                />
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Previous quote"
                onClick={() => go(index - 1)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-black/[0.08] bg-paper/70 shadow-shell transition-all duration-500 ease-luxe hover:bg-espresso hover:text-cream active:scale-95"
              >
                <IonArrowLeft className="h-4 w-4" />
              </button>
              <span className="flex h-12 min-w-[4.5rem] items-center justify-center font-mono text-xs tracking-[0.18em] text-taupe">
                {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                aria-label="Next quote"
                onClick={() => go(index + 1)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-espresso text-cream shadow-float transition-all duration-500 ease-luxe hover:bg-olive active:scale-95"
              >
                <IonArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Reveal>

        <div className="relative mt-14 overflow-hidden">
          <div ref={trackRef} className="flex w-full transition-transform duration-[900ms] ease-luxe">
            {slides.map((s, i) => (
              <figure key={i} className="w-full shrink-0">
                <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center md:gap-14">
                  <div className="rounded-[2.5rem] bg-linen p-8 ring-1 ring-white/60 shadow-inset md:p-12">
                    <p className="select-none font-display text-7xl leading-none text-olive/30">
                      “
                    </p>
                    <blockquote className="text-balance mt-2 font-display text-2xl italic leading-[1.25] text-espresso md:text-[clamp(1.6rem,2.6vw,2.4rem)]">
                      {s.quote}
                    </blockquote>
                  </div>

                  <div className="md:pl-2">
                    <img
                      src={AVATARS[i]}
                      alt=""
                      loading="lazy"
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-paper shadow-float"
                      style={{ filter: "grayscale(0.35)" }}
                    />
                    <figcaption className="mt-5">
                      <p className="font-display text-xl text-espresso">{s.name}</p>
                      <p className="mt-0.5 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-taupe">
                        {s.role}
                      </p>
                    </figcaption>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}