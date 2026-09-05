"use client";

import { useLanguage } from "@/context/LanguageContext";
import Reveal from "@/components/Reveal";
import { IonSearch, IonLeaf, IonLock } from "@/components/icons";

const PILLS = [
  "/images/hero-oats.jpg",
  "/images/hero-rye.jpg",
  "/images/hero-honey.png",
];

export default function Features() {
  const { t } = useLanguage();

  return (
    <section id="how" className="relative pt-12 pb-28 md:pt-16 md:pb-40">
      <div className="mx-auto max-w-[1300px] px-4">
        <Reveal>
          <div className="max-w-4xl">
            <p className="eyebrow">{t("howEyebrow")}</p>
            <h2 className="text-balance mt-5 font-display text-[clamp(2.4rem,4.5vw,4.1rem)] leading-[1.04] tracking-[-0.03em] text-espresso">
              {t("howTitle")}
              <img
                src={PILLS[0]}
                alt=""
                aria-hidden="true"
                className="img-pill mx-2.5"
                style={{ width: "0.7em", height: "0.7em" }}
              />
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-flow-dense grid-cols-1 gap-5 md:grid-cols-3">
          <Reveal className="h-full md:col-span-2 md:row-span-2">
            <article className="group flex h-full flex-col overflow-hidden rounded-[2.5rem] bg-linen ring-1 ring-white/60 shadow-inset">
              <div className="relative min-h-[300px] flex-1 overflow-hidden">
                <img
                  src="/images/features-shelf.jpg"
                  alt="A pantry shelf of packaged staples"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-luxe group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(33,26,18,0.02) 30%, rgba(33,26,18,0.78) 78%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-7 md:p-9">
                  <span className="inline-flex items-center gap-2 rounded-full bg-cream/15 px-3.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-cream ring-1 ring-white/20 backdrop-blur-md">
                    <IonSearch className="h-3.5 w-3.5" />
                    {t("f1Title")}
                  </span>
                  <h3 className="mt-5 max-w-[16ch] font-display text-3xl leading-[1.05] tracking-[-0.02em] text-cream md:text-4xl">
                    {t("f1Body").split(".")[0]}.
                  </h3>
                </div>
              </div>
              <div className="grid gap-4 border-t border-black/[0.05] bg-paper/70 px-7 py-5 md:grid-cols-[1fr_auto] md:items-center">
                <p className="text-sm text-cocoa/75">
                  {t("f1Body").split(".")[1]?.trim()}
                </p>
                <span className="flex items-center gap-2 rounded-full bg-cream px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-taupe ring-1 ring-black/[0.05]">
                  <IonSearch className="h-3.5 w-3.5 text-olive" />
                  {t("exampleSearch")}
                </span>
              </div>
            </article>
          </Reveal>

          <Reveal delay={90} className="h-full md:col-span-1 md:row-span-1">
            <article className="flex h-full flex-col rounded-[2rem] bg-linen p-7 ring-1 ring-white/60 shadow-inset">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-olive ring-1 ring-black/[0.06]">
                <IonLeaf className="h-5 w-5" />
              </span>
              <h3 className="mt-12 font-display text-2xl leading-tight text-espresso md:text-3xl">
                {t("f2Title")}
                <img
                  src={PILLS[1]}
                  alt=""
                  aria-hidden="true"
                  className="img-pill mx-1.5"
                  style={{ width: "0.5em", height: "0.5em" }}
                />
              </h3>
              <p className="mt-3 leading-relaxed text-cocoa/85">{t("f2Body")}</p>
              <div className="mt-auto flex items-center gap-2 pt-8">
                {["quaker", "barilla", "wasa"].map((word) => (
                  <span
                    key={word}
                    className="rounded-full bg-paper/80 px-3.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cocoa ring-1 ring-black/[0.05]"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>

          <Reveal delay={160} className="h-full md:col-span-1 md:row-span-1">
            <article className="flex h-full flex-col rounded-[2rem] bg-olive/[0.07] p-7 ring-1 ring-olive/15">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-olive ring-1 ring-black/[0.06]">
                <IonLock className="h-5 w-5" />
              </span>
              <h3 className="mt-12 font-display text-2xl leading-tight text-espresso md:text-3xl">
                {t("f3Title")}
              </h3>
              <p className="mt-3 leading-relaxed text-cocoa/85">{t("f3Body")}</p>
              <a
                href="#search"
                className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-medium text-olive transition-colors duration-500 ease-luxe hover:text-clay"
              >
                {t("viewDetails")}
              </a>
            </article>
          </Reveal>

          <Reveal delay={220} className="h-full md:col-span-3 md:row-span-1">
            <div className="flex flex-col gap-6 rounded-[2rem] bg-espresso px-8 py-7 ring-1 ring-white/10 md:flex-row md:items-center md:justify-between md:gap-10 md:px-10">
              <p className="text-balance font-display text-xl italic leading-snug text-cream md:text-2xl">
                {t("footerLine")}
              </p>
              <div className="flex shrink-0 items-center gap-3">
                {PILLS.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="img-pill dark h-12 w-12"
                    style={{ filter: "grayscale(0.35)" }}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}