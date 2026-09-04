"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Product, Nutriments } from "@/types";

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  subscribed: boolean;
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
}: ProductDetailProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-surface border border-border rounded p-6 shadow">
      <button
        className="bg-transparent border-none text-primary cursor-pointer text-sm mb-4 p-0"
        onClick={onBack}
      >
        {t("back")}
      </button>

      <div className="product-detail__header flex gap-6 flex-wrap mb-6">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-40 h-40 object-contain bg-gray-100 rounded"
          />
        ) : (
          <div
            className="product-card__image-placeholder w-40 h-40 bg-gray-100 rounded flex items-center justify-center text-4xl"
            aria-hidden="true"
          >
            🍽️
          </div>
        )}
        <div>
          <h2 className="m-0">{product.name}</h2>
          {product.brand && (
            <p>
              <strong>{t("brand")}:</strong> {product.brand}
            </p>
          )}
          {product.quantity && (
            <p>
              <strong>{t("quantity")}:</strong> {product.quantity}
            </p>
          )}
        </div>
      </div>

      {product.ingredientsText && (
        <section className="mt-5 pt-5 border-t border-border">
          <h3 className="mt-0">{t("ingredients")}</h3>
          <p>{product.ingredientsText}</p>
        </section>
      )}

      <section className="mt-5 pt-5 border-t border-border">
        <h3 className="mt-0">{t("nutrition")}</h3>
        {subscribed && product.nutriments ? (
          <>
            {product.nutriscoreGrade && (
              <p className="nutriscore">
                {t("nutriscore")}: {product.nutriscoreGrade.toUpperCase()}
              </p>
            )}
            <table className="nutrition-table">
              <tbody>
                {NUTRIENT_ROWS.map(([field, labelKey]) => {
                  const value = product.nutriments?.[field];
                  if (value === null || value === undefined) return null;
                  return (
                    <tr key={field}>
                      <td>{t(labelKey)}</td>
                      <td>
                        {value} {NUTRIENT_UNITS[field]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : (
          <p className="locked-notice">🔒 {t("locked")}</p>
        )}
      </section>
    </div>
  );
}
