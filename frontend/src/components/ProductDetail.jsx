import { useLanguage } from "../context/LanguageContext.jsx";

const NUTRIENT_ROWS = [
  ["energy", "energyKcal100g", "kcal"],
  ["fat", "fat100g", "g"],
  ["saturatedFat", "saturatedFat100g", "g"],
  ["carbohydrates", "carbohydrates100g", "g"],
  ["sugars", "sugars100g", "g"],
  ["fiber", "fiber100g", "g"],
  ["protein", "proteins100g", "g"],
  ["salt", "salt100g", "g"],
];

export default function ProductDetail({ product, onBack, subscribed }) {
  const { t } = useLanguage();

  return (
    <div className="product-detail">
      <button className="link-button" onClick={onBack}>
        {t("back")}
      </button>

      <div className="product-detail__header">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="product-detail__image" />
        ) : (
          <div className="product-card__image-placeholder product-detail__image" aria-hidden="true">
            🍽️
          </div>
        )}
        <div>
          <h2>{product.name}</h2>
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
        <section className="product-detail__section">
          <h3>{t("ingredients")}</h3>
          <p>{product.ingredientsText}</p>
        </section>
      )}

      <section className="product-detail__section">
        <h3>{t("nutrition")}</h3>
        {subscribed && product.nutriments ? (
          <>
            {product.nutriscoreGrade && (
              <p className={`nutriscore nutriscore--${product.nutriscoreGrade}`}>
                {t("nutriscore")}: {product.nutriscoreGrade.toUpperCase()}
              </p>
            )}
            <table className="nutrition-table">
              <tbody>
                {NUTRIENT_ROWS.map(([labelKey, field, unit]) => {
                  const value = product.nutriments[field];
                  if (value === null || value === undefined) return null;
                  return (
                    <tr key={field}>
                      <td>{t(labelKey)}</td>
                      <td>
                        {value} {unit}
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
