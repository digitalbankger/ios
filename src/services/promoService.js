import api, { API_BASE_URL } from "./api";

function ensureGuestSessionId() {
  let sessionId = localStorage.getItem("guest_session_id");
  if (!sessionId) {
    sessionId = typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem("guest_session_id", sessionId);
  }
  return sessionId;
}

function getIdentityParams() {
  const daigoId = localStorage.getItem("daigo_id");
  const token = localStorage.getItem("token");
  if (token && daigoId) return { daigo_id: daigoId };
  return { session_id: ensureGuestSessionId() };
}

function normalizeMediaUrl(path) {
  if (!path) return "";
  const value = String(path).trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

function getPromotionList(raw) {
  const candidates = [
    raw,
    raw?.promotions,
    raw?.items,
    raw?.data,
    raw?.data?.promotions,
    raw?.data?.items,
    raw?.result,
    raw?.result?.promotions,
    raw?.result?.items,
  ];
  return candidates.find(Array.isArray) || [];
}

export function normalizePromotion(item = {}) {
  const promoType = item.promo_type || item.type || "notice";
  const banner = item.banner_url || item.banner || item.image || "";
  const firstRelated = Array.isArray(item.related_products) ? item.related_products[0] : null;

  return {
    ...item,
    id: item.id,
    name: item.name || item.title || "Акция",
    title: item.title || item.name || "Акция",
    description: item.description || "",
    type: promoType,
    promo_type: promoType,
    banner_url: normalizeMediaUrl(banner),
    image: normalizeMediaUrl(banner),
    coupon: item.coupon ?? null,
    discount: item.discount ?? null,
    label: item.label ?? item.lable ?? null,
    related_products: Array.isArray(item.related_products) ? item.related_products : [],
    product_id: firstRelated?.product_id ?? item.product_id ?? null,
    product_slug: firstRelated?.url_cpu ?? item.product_slug ?? null,
    is_applied: item.is_applied === true,
    is_active: item.is_active === true,
    link: item.link ?? null,
  };
}

export const fetchPromotions = async () => {
  const response = await api.get("/v1/shop/promotion", {
    params: getIdentityParams(),
  });
  return getPromotionList(response.data).map(normalizePromotion);
};

/**
 * Проверка старого купона больше не используется сайтом.
 * Оставлена только совместимость для старых вызовов приложения.
 */
export const checkCouponUsage = async (userId, couponCode) => {
  if (!userId) return { usage: false };
  const response = await api.post("/v1/shop/order/coupon/check", {
    daigo_id: userId,
    coupon_code: couponCode,
  });
  return response.data;
};

export { ensureGuestSessionId, getIdentityParams };
