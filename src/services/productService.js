import api, { API_BASE_URL } from "./api";

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

function toNumber(value, fallback = 0) {
  if (value == null || value === "") return fallback;
  const normalized = typeof value === "string"
    ? value.replace(/\s/g, "").replace(",", ".")
    : value;
  const result = Number(normalized);
  return Number.isFinite(result) ? result : fallback;
}

function getProductList(raw) {
  const candidates = [
    raw,
    raw?.products,
    raw?.items,
    raw?.data,
    raw?.data?.products,
    raw?.data?.items,
    raw?.data?.data,
    raw?.result,
    raw?.result?.products,
    raw?.result?.items,
    raw?.payload,
    raw?.payload?.products,
    raw?.payload?.items,
    raw?.list,
    raw?.rows,
  ];

  return candidates.find(Array.isArray) || [];
}

function normalizeMediaUrl(path) {
  if (!path) return "";
  const value = String(path).trim();
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }
  return `${API_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

function imagePath(image) {
  if (typeof image === "string") return image;
  return image?.image_url || image?.url || image?.src || image?.path || "";
}

function normalizeImages(raw) {
  const source = [
    ...(Array.isArray(raw?.detail_images) ? raw.detail_images : []),
    ...(Array.isArray(raw?.detailImages) ? raw.detailImages : []),
    ...(Array.isArray(raw?.images) ? raw.images : []),
  ];

  const primaryFallback = raw?.image || raw?.image_url || raw?.preview_image || raw?.picture;
  if (primaryFallback) source.unshift(primaryFallback);

  const seen = new Set();
  const images = source
    .map((item, index) => {
      const originalPath = imagePath(item);
      const full = normalizeMediaUrl(originalPath);
      if (!full || seen.has(full)) return null;
      seen.add(full);
      return {
        ...(typeof item === "object" && item ? item : {}),
        image_url: full,
        alt_text: item?.alt_text || raw?.name_ru || raw?.name || raw?.title || "Товар Daigo",
        is_primary: Boolean(item?.is_primary) || index === 0,
        display_order: item?.display_order ?? index,
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0));

  return images;
}

function normalizeProperties(properties) {
  if (Array.isArray(properties)) return properties;
  if (!properties || typeof properties !== "object") return [];

  const result = [];
  for (const [key, rawValue] of Object.entries(properties)) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    for (const value of values.flatMap((item) => String(item ?? "").split(","))) {
      const normalized = String(value).trim();
      if (!normalized) continue;
      result.push({
        code: key,
        name: key,
        value: normalized,
        url_cpu: normalized,
      });
    }
  }
  return result;
}

export function normalizeProduct(raw = {}) {
  const productId = raw.product_id ?? raw.id ?? "";
  const slug = String(raw.url_cpu || raw.slug || raw.code || productId || "");
  const name = String(raw.name_ru || raw.name || raw.title || raw.name_en || "Товар");
  const price = toNumber(raw.price, 0);
  const originalPrice = toNumber(
    raw.original_price ?? raw.old_price ?? raw.oldPrice ?? raw.originalPrice,
    0
  );

  return {
    ...raw,
    id: raw.id ?? productId,
    product_id: productId,
    slug,
    url_cpu: slug,
    name,
    name_ru: raw.name_ru || name,
    title: raw.title || name,
    subtitle: raw.subtitle || "",
    description: raw.description || raw.short_description || raw.full_description || "",
    price,
    originalPrice,
    oldPrice: originalPrice,
    sort_order: raw.sort_order === 0 ? 16 : (raw.sort_order ?? raw.sort ?? 0),
    sort: raw.sort_order === 0 ? 16 : (raw.sort_order ?? raw.sort ?? 0),
    order_count: toNumber(raw.order_count, 0),
    images: normalizeImages(raw),
    labels: Array.isArray(raw.labels) ? raw.labels : [],
    properties: normalizeProperties(raw.properties),
    promotions: Array.isArray(raw.promotions)
      ? raw.promotions.map(String)
      : raw.promotions == null
        ? []
        : String(raw.promotions).split(",").map((item) => item.trim()).filter(Boolean),
  };
}

function getTotalPages(raw) {
  const value = Number(
    raw?.total_pages ??
    raw?.pages ??
    raw?.last_page ??
    raw?.meta?.total_pages ??
    raw?.meta?.last_page ??
    raw?.pagination?.total_pages ??
    raw?.pagination?.last_page
  );
  return Number.isFinite(value) && value > 0 ? value : null;
}

export const fetchProducts = async () => {
  const collected = [];
  const seen = new Set();

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    let response;
    try {
      response = await api.get("/v1/shop/products", {
        params: { page, page_size: PAGE_SIZE },
      });
    } catch (error) {
      // Как на сайте: если часть страниц уже получена, сохраняем каталог,
      // а не обнуляем его из-за сбоя одной последующей страницы.
      if (collected.length) break;
      throw error;
    }

    const raw = response.data;
    const pageItems = getProductList(raw);
    if (!pageItems.length) break;

    let added = 0;
    for (const item of pageItems) {
      const normalized = normalizeProduct(item);
      const key = String(normalized.product_id || normalized.url_cpu);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      collected.push(normalized);
      added += 1;
    }

    if (added === 0) break;
    const totalPages = getTotalPages(raw);
    if (totalPages && page >= totalPages) break;
  }

  return collected;
};

/**
 * Актуальный сайт обновляет цену карточки через /products/{slug}/card.
 * Богатые данные товара (изображения, описание и т. п.) берутся из каталога.
 */
export const fetchProductById = async (id) => {
  const response = await api.get(
    `/v1/shop/products/${encodeURIComponent(String(id))}/card`
  );
  const raw = response.data;
  const candidate = getProductList(raw)[0] || raw?.product || raw?.data?.product || raw?.data || raw;
  return normalizeProduct(candidate);
};
