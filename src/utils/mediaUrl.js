import { API_BASE_URL } from "@/services/api";

export const PRODUCT_PLACEHOLDER = "./img/placeholder-product.svg";

export function normalizeMediaUrl(value, fallback = PRODUCT_PLACEHOLDER) {
  if (!value) return fallback;
  const path = String(value).trim();
  if (!path) return fallback;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
