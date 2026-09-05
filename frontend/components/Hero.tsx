"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/context/LanguageContext";
import SearchBar from "@/components/SearchBar";
import { IonArrowUpRight, IonClock } from "@/components/icons";

interface HeroProps {
  onSearch: (query: string) => void;
  recentSearches: string[];
}

const COLLAGE = [
  {
    src: "/images/hero-oats.jpg",
    alt: "Rolled oats in a kraft pouch",
    caption: "Quaker · Rolled oats",
    wrap:
      "absolute right-0 top-14 z-[2] w-[72%] max-w-[380px] rotate-2 rounded-[2.6rem] p-2.5 bg-paper/80 shadow-float ring-1 ring-black/[0.06]",
    img: "aspect-[4/5] w-full rounded-[calc(2.6rem-0.625rem)] object-cover",
  },
  {
    src: "/images/hero-honey.png",
    alt: "A jar of raw honey",
    caption: "Langnese · Raw honey",
    wrap:
      "absolute bottom-4 left-0 z-[3] w-[46%] max-w-[220px] -rotate-6 rounded-full p-2 bg-paper/80 shadow-float ring-1 ring-black/[0.06]",
    img: "aspect-square w-full rounded-full object-cover",
  },
  {
    src: "/images/hero-rye.jpg",
    alt: "A loaf of rye bread",
    caption: "Wasa · Rye crispbread",
    wrap:
      "absolute -top-2 left-4 z-[1] w-[38%] max-w-[190px] -rotate-12 rounded-[2rem] p-2 bg-paper/70 shadow-shell ring-1 ring-black/[0.06]",
    img: "aspect-[4/3] w-full rounded-[calc(2rem-0.5rem)] object-cover",
  },
];

export default function Hero({ onSearch, recentSearches }: HeroProps) {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".hero-copy > *", {
        y: 36,
        opacity: 0,
        duration: 0.9,
        stagger: 0.11,
        ease: "power3.out",
        delay: 0.08,
      });

      gsap.from(".hero-card", {
        y: 70,
        opacity: 0,
        scale: 0.94,
        duration: 1.15,
        stagger: 0.16,
        ease: "expo.out",
        delay: 0.3,
      });

      gsap.from(".hero-card .hero-caption", {
        opacity: 0,
        y: 8,
        duration: 0.6,
        stagger: 0.14,
        delay: 0.7,
        ease: "power2.out",
      });

      gsap.utils.toArray<HTMLElement>(".hero-card").forEach((el, i) => {
        gsap.to(el, {
          yPercent: i % 2 === 0 ? -12 : 16,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="search"
      ref={sectionRef}
      className="relative mx-auto w-full max-w-[1400px] px-4 pt-4 md:pt-8 lg:pt-10"
    >
      <div className="relative grid gap-16 lg:grid-cols-[minmax(0,8fr)_minmax(0,5fr)] lg:gap-4">
        <div className="hero-copy relative z-10 w-full lg:pb-32 lg:pt-14">
          <h1 className="text-balance mt-0 max-w-full font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.96] tracking-[-0.035em] text-espresso">
            {t("heroTitle")}
            <br />
            <span className="text-olive">{t("heroTitleAccent")}</span>
          </h1>

          <p className="text-balance mt-7 max-w-[54ch] text-lg leading-relaxed text-cocoa/80 md:text-xl">
            {t("heroBody")}
          </p>

          <div className="mt-9 max-w-[600px]">
            <SearchBar large onSearch={onSearch} />
          </div>

          {recentSearches.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="mr-1 flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-taupe">
                <IonClock className="h-3.5 w-3.5" />
                {t("recentSearches")}
              </span>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onSearch(term)}
                  className="rounded-full bg-linen/80 px-4 py-2 text-sm text-cocoa ring-1 ring-black/[0.06] transition-all duration-500 ease-luxe hover:ring-olive/50 hover:text-espresso active:scale-[0.97]"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          <a
            href="#how"
            className="group mt-9 inline-flex items-center gap-3 text-sm font-medium text-cocoa transition-colors duration-500 ease-luxe hover:text-espresso"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-paper/60 shadow-shell transition-all duration-500 ease-luxe group-hover:border-olive/40 group-hover:bg-paper">
              <IonArrowUpRight className="h-4 w-4 rotate-90 text-olive" />
            </span>
            {t("howNav")}
          </a>
        </div>

        <div className="relative h-[440px] sm:h-[540px] lg:h-[640px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(circle, rgba(196,154,60,0.32), rgba(91,106,69,0.10) 45%, transparent 70%)",
            }}
          />
          {COLLAGE.map((item) => (
            <figure
              key={item.src}
              className={`hero-card group absolute overflow-hidden ${item.wrap}`}
            >
              <div className="relative overflow-hidden rounded-[inherit]">
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="eager"
                  className={`${item.img} transition-transform duration-[900ms] ease-luxe group-hover:scale-105`}
                />
                <figcaption className="hero-caption absolute bottom-2.5 left-2.5 rounded-full bg-cream/85 px-3.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cocoa ring-1 ring-black/[0.06] backdrop-blur-md">
                  {item.caption}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}