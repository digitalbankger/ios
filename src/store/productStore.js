import { defineStore } from "pinia";
import { fetchProducts, fetchProductById } from "@/services/productService";

let loadPromise = null;

export const useProductStore = defineStore("productStore", {
  state: () => ({
    products: [],
    productsLoaded: false,
    selectedProduct: null,
    isLoading: false,
  }),

  actions: {
    async fetchProducts() {
      if (this.productsLoaded) return;

      const cache = localStorage.getItem("products");
      const cacheTime = parseInt(localStorage.getItem("products_cache_time") || "0");
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      if (cache && now - cacheTime < ONE_DAY) {
        try {
          this.products = JSON.parse(cache);
          this.productsLoaded = true;
          return;
        } catch (err) {
          localStorage.removeItem("products");
          localStorage.removeItem("products_cache_time");
        }
      }

      if (loadPromise) return loadPromise;

      this.isLoading = true;

      loadPromise = fetchProducts()
        .then((data) => {
          this.products = data;
          this.productsLoaded = true;

          localStorage.setItem("products", JSON.stringify(data));
          localStorage.setItem("products_cache_time", Date.now().toString());
        })
        .catch((error) => {
          console.error("Ошибка загрузки товаров:", error);
        })
        .finally(() => {
          this.isLoading = false;
          loadPromise = null;
        });

      return loadPromise;
    },

    async fetchProductById(id) {
      const cachedProduct = this.products.find((p) => p.product_id == id);
      if (cachedProduct) {
        this.selectedProduct = cachedProduct;
        return;
      }

      try {
        this.selectedProduct = await fetchProductById(id);
      } catch (error) {
        console.error("Ошибка загрузки товара:", error);
      }
    },

    clearCache() {
      localStorage.removeItem("products");
      localStorage.removeItem("products_cache_time");
      this.products = [];
      this.productsLoaded = false;
    }
  },
});
