"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Product, Nutriments } from "@/types";
import Reveal from "@/components/Reveal";
import NutriScore from "@/components/NutriScore";
import SubscriptionControl from "@/components/SubscriptionControl";
import { IonArrowLeft, IonLock, IonLeaf } from "@/components/icons";

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  subscribed: boolean;
  configured: boolean;
}

const NUTRIENT_ROWS: [keyof Nutriments, string][] = [
  ["energyKcal100g", "energy"],
  ["fat100g", "fat"],
  ["saturatedFat100g", "saturatedFat"],
  ["carbohydrates100g", "carbohydrates"],
  ["sugars100g", "sugars"],
  ["fiber100g", "fiber"],
  ["proteins100g", "protein"],
  ["salt100g", "salt"],
];

const NUTRIENT_UNITS: Record<keyof Nutriments, string> = {
  energyKcal100g: "kcal",
  fat100g: "g",
  saturatedFat100g: "g",
  carbohydrates100g: "g",
  sugars100g: "g",
  fiber100g: "g",
  proteins100g: "g",
  salt100g: "g",
};

export default function ProductDetail({
  product,
  onBack,
  subscribed,
  configured,
}: ProductDetailProps) {
  const { t } = useLanguage();

  const meta: { label: string; value: string }[] = [];
  if (product.brand) meta.push({ label: t("brand"), value: product.brand });
  if (product.quantity) meta.push({ label: t("quantity"), value: product.quantity });

  const rows = NUTRIENT_ROWS.map(([field, labelKey]) => ({
    field,
    label: t(labelKey),
    value: product.nutriments?.[field],
  })).filter((row) => row.value !== null && row.value !== undefined);

  return (
    <div className="mx-auto max-w-[1100px]">
      <Reveal>
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 rounded-full bg-linen/70 py-2 pl-3.5 pr-5 text-sm text-cocoa ring-1 ring-black/[0.06] transition-all duration-500 ease-luxe hover:bg-linen hover:text-espresso active:scale-[0.98]"
        >
          <IonArrowLeft className="h-4 w-4 text-taupe transition-transform duration-500 ease-luxe group-hover:-translate-x-0.5" />
          {t("back")}
        </button>
      </Reveal>

      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,9fr)] md:gap-14">
        <div>
          <Reveal>
            <div className="sticky top-28 rounded-[2.5rem] bg-black/[0.04] p-2 ring-1 ring-black/[0.05]">
              <div className="overflow-hidden rounded-[calc(2.5rem-0.5rem)] bg-linen ring-1 ring-white/60 shadow-inset">
                <div className="flex aspect-square items-center justify-center p-10">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="max-h-full w-full object-contain mix-blend-multiply"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-cream ring-1 ring-black/[0.05]">
                      <IonLeaf className="h-12 w-12 text-taupe/50" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col gap-10">
          <Reveal delay={80}>
            <div>
              {product.brand && (
                <p className="eyebrow">{product.brand.toUpperCase()}</p>
              )}
              <h2 className="text-balance mt-3 font-display text-4xl leading-[1.02] tracking-[-0.02em] text-espresso md:text-5xl">
                {product.name}
              </h2>

              {meta.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {meta.map((m) => (
                    <span
                      key={m.label}
                      className="inline-flex items-center gap-2 rounded-full bg-linen/80 px-4 py-2 text-sm text-cocoa ring-1 ring-black/[0.06]"
                    >
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-taupe">
                        {m.label}
                      </span>
                      {m.value}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-2 rounded-full bg-linen/80 px-4 py-2 font-mono text-xs text-taupe ring-1 ring-black/[0.06]">
                    #{product.id}
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          {product.ingredientsText && (
            <Reveal delay={140}>
              <section>
                <p className="eyebrow">{t("ingredients")}</p>
                <p className="text-balance mt-4 font-display text-xl italic leading-snug text-cocoa md:text-2xl">
                  {product.ingredientsText}
                </p>
              </section>
            </Reveal>
          )}

          <Reveal delay={200}>
            <section>
              <p className="eyebrow">{t("nutritionPer100")}</p>

              {subscribed && product.nutriments ? (
                <div className="mt-5">
                  {product.nutriscoreGrade && (
                    <div className="mb-8 flex flex-wrap items-center gap-4">
                      <NutriScore grade={product.nutriscoreGrade} />
                      <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-taupe">
                        {t("nutriscore")}
                      </span>
                    </div>
                  )}
                  <div className="divide-y divide-black/[0.05] rounded-[2rem] bg-linen/70 px-7 ring-1 ring-black/[0.05]">
                    {rows.map((row) => (
                      <div
                        key={row.field}
                        className="flex items-center justify-between gap-6 py-4"
                      >
                        <span className="text-sm text-cocoa/85">{row.label}</span>
                        <span className="font-mono text-sm tabular-nums text-espresso">
                          {row.value} <span className="text-taupe">{NUTRIENT_UNITS[row.field]}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : subscribed ? (
                <p className="mt-4 text-cocoa/80">
                  {t("noNutritionData")}
                </p>
              ) : (
                <div className="relative mt-5 overflow-hidden rounded-[2rem] bg-linen p-8 text-espresso shadow-shell ring-1 ring-black/[0.05] md:p-10">
                  <div className="relative">
                    <span className="inline-flex items-center gap-2 rounded-full bg-olive/10 px-3.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-olive ring-1 ring-olive/25">
                      <IonLock className="h-3.5 w-3.5" />
                      {t("unlockEyebrow")}
                    </span>
                    <h3 className="mt-6 pb-1 font-display text-3xl italic leading-[1.15] md:text-4xl">
                      {t("unlockTitle")}
                    </h3>
                    <p className="mt-4 max-w-md leading-relaxed text-cocoa/85">
                      {t("unlockBody")}
                    </p>
                    <p className="mt-3 text-sm text-cocoa/80">{t("unlockNote")}</p>
                    <div className="mt-8">
                      <SubscriptionControl
                        subscribed={false}
                        configured={configured}
                        tone="light"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}