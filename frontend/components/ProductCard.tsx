"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onSelect: (id: string) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const { t } = useLanguage();

  return (
    <button className="product-card" onClick={() => onSelect(product.id)}>
      <div className="product-card__image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card__image-placeholder" aria-hidden="true">
            🍽️
          </div>
        )}
      </div>
      <div className="product-card__body">
        <h3>{product.name}</h3>
        {product.brand && (
          <p className="product-card__brand">{product.brand}</p>
        )}
        {product.locked && (
          <span className="product-card__lock">🔒 {t("nutrition")}</span>
        )}
      </div>
    </button>
  );
}
