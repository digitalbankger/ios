import { defineStore } from "pinia";
import { fetchProducts, fetchProductById } from "@/services/productService";

const CACHE_KEY = "products_v2";
const CACHE_TIME_KEY = "products_v2_cache_time";
const CACHE_VERSION_KEY = "products_cache_contract";
const CACHE_VERSION = "2026-07-site-contract-v2";
const CACHE_TTL = 30 * 60 * 1000;

let loadPromise = null;

function isValidProductArray(value) {
  return Array.isArray(value) && value.every((item) => item && typeof item === "object");
}

export const useProductStore = defineStore("productStore", {
  state: () => ({
    products: [],
    productsLoaded: false,
    selectedProduct: null,
    isLoading: false,
    error: "",
  }),

  actions: {
    resetLegacyCacheIfNeeded() {
      if (localStorage.getItem(CACHE_VERSION_KEY) === CACHE_VERSION) return;
      [
        "products",
        "products_cache_time",
        CACHE_KEY,
        CACHE_TIME_KEY,
      ].forEach((key) => localStorage.removeItem(key));
      localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
      this.products = [];
      this.productsLoaded = false;
    },

    async fetchProducts({ force = false } = {}) {
      this.resetLegacyCacheIfNeeded();

      if (this.productsLoaded && isValidProductArray(this.products) && !force) {
        return this.products;
      }

      if (!force) {
        const cache = localStorage.getItem(CACHE_KEY);
        const cacheTime = Number(localStorage.getItem(CACHE_TIME_KEY) || 0);
        if (cache && Date.now() - cacheTime < CACHE_TTL) {
          try {
            const parsed = JSON.parse(cache);
            if (isValidProductArray(parsed)) {
              this.products = parsed;
              this.productsLoaded = true;
              return this.products;
            }
          } catch {
            // Ниже загрузим свежие данные.
          }
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(CACHE_TIME_KEY);
        }
      }

      if (loadPromise && !force) return loadPromise;

      this.isLoading = true;
      this.error = "";

      loadPromise = fetchProducts()
        .then((data) => {
          const products = isValidProductArray(data) ? data : [];
          this.products = products;
          this.productsLoaded = true;
          localStorage.setItem(CACHE_KEY, JSON.stringify(products));
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
          console.log(`[catalog] Загружено товаров: ${products.length}`);
          return products;
        })
        .catch((error) => {
          this.products = [];
          this.productsLoaded = false;
          this.error = error?.response?.data?.message || error?.message || "Ошибка загрузки каталога";
          console.error("[catalog] Ошибка загрузки товаров:", error);
          throw error;
        })
        .finally(() => {
          this.isLoading = false;
          loadPromise = null;
        });

      return loadPromise;
    },

    async fetchProductById(id) {
      const cachedProduct = (Array.isArray(this.products) ? this.products : [])
        .find((product) =>
          String(product.product_id) === String(id) ||
          String(product.url_cpu) === String(id) ||
          String(product.slug) === String(id)
        );

      try {
        const card = await fetchProductById(id);
        // /card содержит актуальные название/цену, а каталог — подробные данные.
        this.selectedProduct = cachedProduct ? { ...cachedProduct, ...card, images: cachedProduct.images } : card;
        return this.selectedProduct;
      } catch (error) {
        if (cachedProduct) {
          console.warn("[product] Не удалось обновить карточку цены, используем каталог:", error);
          this.selectedProduct = cachedProduct;
          return cachedProduct;
        }
        console.error("Ошибка загрузки товара:", error);
        throw error;
      }
    },

    clearCache() {
      ["products", "products_cache_time", CACHE_KEY, CACHE_TIME_KEY].forEach((key) => localStorage.removeItem(key));
      this.products = [];
      this.productsLoaded = false;
      this.error = "";
    },
  },
});
