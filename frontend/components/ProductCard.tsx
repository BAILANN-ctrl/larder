"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Product } from "@/types";
import Reveal from "@/components/Reveal";
import { IonArrowUpRight, IonLock, IonLeaf, IonCheck } from "@/components/icons";

interface ProductCardProps {
  product: Product;
  onSelect: (id: string) => void;
  index?: number;
}

export default function ProductCard({ product, onSelect, index = 0 }: ProductCardProps) {
  const { t } = useLanguage();

  return (
    <Reveal delay={Math.min(index * 50, 250)} className="h-full">
      <button
        type="button"
        onClick={() => onSelect(product.id)}
        className="group flex h-full w-full flex-col rounded-[2rem] bg-black/[0.035] p-2 text-left ring-1 ring-black/[0.05] transition-all duration-700 ease-luxe hover:-translate-y-2 hover:shadow-float"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-[calc(2rem-0.5rem)] bg-linen ring-1 ring-white/60 shadow-inset">
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden p-7">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-700 ease-luxe group-hover:scale-105"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-cream ring-1 ring-black/[0.05]">
                <IonLeaf className="h-9 w-9 text-taupe/60" />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col px-6 pb-6 pt-3">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-taupe">
              {product.brand || t("noBrand")}
            </p>
            <h3 className="mt-2 line-clamp-2 font-display text-xl leading-snug text-espresso">
              {product.name}
            </h3>

            <div className="mt-4 flex items-center gap-2 text-xs text-taupe">
              {product.locked ? (
                <span className="inline-flex items-center gap-1.5">
                  <IonLock className="h-3.5 w-3.5 text-olive/80" />
                  {t("cardLocked")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-olive">
                  <IonCheck className="h-3.5 w-3.5" />
                  {t("nutrition")}
                </span>
              )}
            </div>

            <span className="mt-4 inline-flex translate-x-2 items-center gap-2 text-sm text-cocoa opacity-0 transition-all duration-700 ease-luxe group-hover:translate-x-0 group-hover:opacity-100">
              {t("viewDetails")}
              <IonArrowUpRight className="h-3.5 w-3.5 text-olive" />
            </span>
          </div>
        </div>
      </button>
    </Reveal>
  );
}