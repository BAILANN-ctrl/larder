import { useLanguage } from "../context/LanguageContext.jsx";
import { startCheckout, openBillingPortal } from "../api.js";

export default function SubscriptionControl({ subscribed, configured }) {
  const { t } = useLanguage();

  async function handleClick() {
    try {
      const { url } = subscribed ? await openBillingPortal() : await startCheckout();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  if (!configured) {
    // Stripe not set up on the backend — show status only, no action.
    return <span className="sub-badge sub-badge--unconfigured">{t("notSubscribed")}</span>;
  }

  return (
    <button
      className={`sub-badge ${subscribed ? "sub-badge--active" : "sub-badge--inactive"}`}
      onClick={handleClick}
    >
      {subscribed ? t("manageSubscription") : t("subscribeButton")}
    </button>
  );
}
