"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import SubscriptionControl from "@/components/SubscriptionControl";
import { getBillingStatus } from "@/lib/api";
import { BillingStatus } from "@/types";
import { IonArrowUpRight } from "@/components/icons";

const NAV_LINKS: { href: string; key: string }[] = [
  { href: "#search", key: "homeNav" },
  { href: "#how", key: "howNav" },
];

export default function Nav() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [billing, setBilling] = useState<BillingStatus>({
    configured: false,
    subscribed: false,
  });

  useEffect(() => {
    getBillingStatus()
      .then(setBilling)
      .catch((err) => console.error("Could not fetch billing status:", err));
  }, []);

  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <>
      <header className="sticky top-2 z-40 px-3 pt-3 sm:px-6">
        <nav className="nav-shell mx-auto flex w-max max-w-full items-center gap-1 rounded-full border border-black/[0.06] bg-linen/85 py-2 pl-5 pr-2 shadow-shell backdrop-blur-xl">
          <a
            href="#search"
            className="mr-3 shrink-0 font-display text-xl tracking-tight text-espresso"
          >
            larder<span className="text-olive">.</span>
          </a>

          <div className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm text-cocoa transition-colors duration-500 ease-luxe hover:bg-espresso/5 hover:text-espresso"
              >
                {t(link.key)}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-1 sm:flex">
            <LanguageSelector />
            <SubscriptionControl
              subscribed={billing.subscribed}
              configured={billing.configured}
              asStatus
            />
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.06] bg-paper/70 transition-transform duration-500 ease-luxe active:scale-95 sm:hidden"
          >
            <span
              className={`absolute block h-px w-4 bg-espresso transition-all duration-500 ease-luxe ${
                open ? "rotate-45" : "-translate-y-[4px]"
              }`}
            />
            <span
              className={`absolute block h-px w-4 bg-espresso transition-all duration-500 ease-luxe ${
                open ? "scale-x-0 opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute block h-px w-4 bg-espresso transition-all duration-500 ease-luxe ${
                open ? "-rotate-45" : "translate-y-[4px]"
              }`}
            />
          </button>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/95 backdrop-blur-2xl"
          />
          <div className="relative flex h-full flex-col px-8 pb-10 pt-24">
            <p className="mb-8 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-chalk/50 [animation:menuIn_0.8s_var(--ease-luxe)_0.05s_forwards] opacity-0">
              Menu
            </p>
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-4 py-2 font-display text-5xl italic leading-tight text-chalk [animation:menuIn_0.9s_var(--ease-luxe)_forwards] opacity-0`}
                  style={{ animationDelay: `${120 + i * 110}ms` }}
                >
                  {t(link.key)}
                  <span className="h-8 w-8 translate-y-1 rounded-full bg-chalk/10 p-2 opacity-0 transition-all duration-500 ease-luxe group-hover:translate-x-1 group-hover:opacity-100">
                    <IonArrowUpRight className="h-full w-full text-chalk" />
                  </span>
                </a>
              ))}
            </nav>

            <div
              className="mt-auto flex flex-col gap-4 [animation:menuIn_0.9s_var(--ease-luxe)_forwards] opacity-0"
              style={{ animationDelay: "420ms" }}
            >
              <div className="flex items-center gap-3">
                <LanguageSelector />
                <SubscriptionControl
                  subscribed={billing.subscribed}
                  configured={billing.configured}
                  tone="dark"
                  asStatus
                />
              </div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-chalk/40">
                every package, decoded
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}