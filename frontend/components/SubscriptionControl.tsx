"use client";

import { useLanguage } from "@/context/LanguageContext";
import { startCheckout, openBillingPortal } from "@/lib/api";

interface SubscriptionControlProps {
  subscribed: boolean;
  configured: boolean;
}

export default function SubscriptionControl({
  subscribed,
  configured,
}: SubscriptionControlProps) {
  const { t } = useLanguage();

  async function handleClick() {
    try {
      const { url } = subscribed
        ? await openBillingPortal()
        : await startCheckout();
      window.location.href = url;
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  }

  if (!configured) {
    return (
      <span className="py-2 px-3.5 rounded-full text-sm font-semibold border border-transparent bg-gray-100 text-muted cursor-default">
        {t("notSubscribed")}
      </span>
    );
  }

  return (
    <button
      className={`py-2 px-3.5 rounded-full text-sm font-semibold border border-transparent cursor-pointer ${
        subscribed
          ? "bg-green-50 text-primary-dark border-green-200"
          : "bg-primary text-white hover:bg-primary-dark"
      }`}
      onClick={handleClick}
    >
      {subscribed ? t("manageSubscription") : t("subscribeButton")}
    </button>
  );
}
