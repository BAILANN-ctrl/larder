export interface Nutriments {
  energyKcal100g: number | null;
  fat100g: number | null;
  saturatedFat100g: number | null;
  carbohydrates100g: number | null;
  sugars100g: number | null;
  fiber100g: number | null;
  proteins100g: number | null;
  salt100g: number | null;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  quantity: string;
  nutriments: Nutriments | null;
  nutriscoreGrade: string | null;
  ingredientsText: string;
  locked?: boolean;
}

export interface SearchResult {
  products: Product[];
  page: number;
  pageCount: number;
  total: number;
  unlocked: boolean;
}

export interface BillingStatus {
  configured: boolean;
  subscribed: boolean;
  customerId?: string | null;
}
