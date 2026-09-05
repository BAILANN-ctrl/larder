"use client";

import { useLanguage } from "@/context/LanguageContext";
import { startCheckout, openBillingPortal } from "@/lib/api";
import { IonArrowUpRight, IonCheck } from "@/components/icons";

interface SubscriptionControlProps {
  subscribed: boolean;
  configured: boolean;
  tone?: "light" | "dark";
  asStatus?: boolean;
}

export default function SubscriptionControl({
  subscribed,
  configured,
  tone = "light",
  asStatus = false,
}: SubscriptionControlProps) {
  const { t } = useLanguage();

  async function handleClick() {
    try {
      const { url } = subscribed ? await openBillingPortal() : await startCheckout();
      window.location.href = url;
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  }

  if (!configured) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] ${
          tone === "dark"
            ? "border border-chalk/15 text-chalk/70"
            : "border border-black/[0.07] text-taupe"
        }`}
      >
        {t("notSubscribed")}
      </span>
    );
  }

  if (subscribed) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-all duration-500 ease-luxe active:scale-[0.97] ${
          tone === "dark"
            ? "bg-chalk text-ink ring-1 ring-ink/10"
            : "bg-olive/10 text-olive ring-1 ring-olive/25 hover:bg-olive/15"
        }`}
      >
        <IonCheck className="h-3.5 w-3.5" />
        {t("subscribed")}
      </button>
    );
  }

  if (asStatus) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] ${
          tone === "dark"
            ? "border border-chalk/15 text-chalk/70"
            : "border border-black/[0.07] text-taupe"
        }`}
      >
        {t("notSubscribed")}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group inline-flex items-center gap-2 rounded-full pl-5 pr-1.5 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition-all duration-500 ease-luxe active:scale-[0.97] ${
        tone === "dark"
          ? "bg-chalk text-ink hover:bg-white"
          : "bg-espresso text-cream hover:bg-olive"
      }`}
    >
      {t("subscribeButton")}
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500 ease-luxe group-hover:translate-x-0.5 group-hover:scale-105 ${
          tone === "dark" ? "bg-ink/10" : "bg-white/10"
        }`}
      >
        <IonArrowUpRight
          className={`h-3.5 w-3.5 ${tone === "dark" ? "text-ink" : "text-cream"}`}
        />
      </span>
    </button>
  );
}