"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import SubscriptionControl from "@/components/SubscriptionControl";
import LanguageSelector from "@/components/LanguageSelector";
import { getBillingStatus } from "@/lib/api";
import { BillingStatus } from "@/types";
import { IonArrowUpRight } from "@/components/icons";

const FOOTER_LINKS = [
  { href: "#search", key: "homeNav" },
  { href: "#how", key: "howNav" },
];

export default function Footer() {
  const { t } = useLanguage();
  const [billing, setBilling] = useState<BillingStatus>({
    configured: false,
    subscribed: false,
  });

  useEffect(() => {
    getBillingStatus()
      .then(setBilling)
      .catch((err) => console.error("Could not fetch billing status:", err));
  }, []);

  return (
    <footer id="footer" className="relative mt-28 overflow-hidden md:mt-40">
      <section className="relative overflow-hidden bg-espresso text-cream">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(23,19,15,0.55), rgba(23,19,15,0.88)), url('/images/hero-rye.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 90% at 50% 0%, rgba(196,154,60,0.16), transparent 62%)",
          }}
        />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-28 text-center md:py-40">
          <h2 className="text-balance mt-8 font-display text-[clamp(2.8rem,6.5vw,6rem)] leading-[0.98] tracking-[-0.03em]">
            {t("footerTag")}
            <img
              src="/images/hero-honey.png"
              alt=""
              aria-hidden="true"
              className="img-pill dark mx-2"
              style={{ width: "0.55em", height: "0.55em" }}
            />
          </h2>

          <p className="text-balance mt-8 max-w-[52ch] text-lg leading-relaxed text-cream/70">
            {t("unlockBody")}
          </p>

          <div className="mt-10">
            <SubscriptionControl
              subscribed={billing.subscribed}
              configured={billing.configured}
              tone="dark"
            />
          </div>

          <a
            href="#search"
            className="group mt-6 inline-flex items-center gap-2 text-sm text-cream/55 transition-colors duration-500 ease-luxe hover:text-cream"
          >
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em]">
              {t("searchButton")}
            </span>
            <IonArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 ease-luxe group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </section>

      <div className="border-t border-black/[0.06]">
        <div className="mx-auto max-w-[1300px] px-4 py-14 md:py-16">
          <p className="select-none font-display text-6xl tracking-tight text-espresso/20 md:text-8xl">
            larder<span className="text-olive/40">.</span>
          </p>

          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
              <nav className="flex flex-wrap items-center gap-1">
                {FOOTER_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-3.5 py-2 text-sm text-cocoa transition-colors duration-500 ease-luxe hover:text-espresso"
                  >
                    {t(link.key)}
                  </a>
                ))}
              </nav>
              <LanguageSelector />
            </div>

            <div className="flex flex-col gap-1 md:text-right">
              <p className="text-sm text-taupe">{t("footerLine")}</p>
              <p className="text-sm text-taupe">{t("footerRights")}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}