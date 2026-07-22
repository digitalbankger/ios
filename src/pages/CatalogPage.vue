<template>
  <div class="flex flex-col items-center justify-center gap-3 h-full p-3 xs:p-2 pb-32">
    <div class="relative h-11 flex flex-col items-center justify-center w-full">
      <img src="@/assets/icons/back.svg" class="absolute left-3 cursor-pointer" alt="Назад" @click="goBack" />
      <h1 class="text-base font-medium">Каталог товаров</h1>
    </div>

    <div class="flex flex-row items-center gap-3 w-full">
      <SearchInput :dropdown-enabled="true" v-model="searchQuery" class="my-2" />
      <Button variant="graybtn" class="w-[52px] h-[50px]" @click="filtersStore.toggleFilter">
        <img src="@/assets/icons/filter.svg" alt="Фильтры" />
      </Button>
    </div>

    <h2 class="w-full text-slider font-medium">{{ pageTitle }}</h2>

    <div v-if="loading" class="flex justify-center items-center h-60">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
    </div>

    <div v-else-if="errorMessage" class="flex flex-col items-center gap-3 py-10 text-center">
      <p class="text-red-500 text-sm">{{ errorMessage }}</p>
      <Button variant="outline" @click="loadProducts(true)">Повторить</Button>
    </div>

    <div v-else-if="filteredProducts.length" class="grid grid-cols-2 gap-4 xs:gap-3 w-full">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.product_id || product.url_cpu"
        :product="product"
      />
    </div>

    <p v-else class="py-10 text-gray-500 text-center">Товары не найдены.</p>

    <ProductFilter />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductStore } from "@/store/productStore";
import { useFiltersStore } from "@/store/filtersStore";
import ProductCard from "@/components/ProductCard.vue";
import SearchInput from "@/components/main/SearchInput.vue";
import Button from "@/components/ui/Button.vue";
import ProductFilter from "@/components/ProductFilter.vue";

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const filtersStore = useFiltersStore();

const searchQuery = ref("");
const pageTitle = ref("Товары");
const loading = ref(false);
const errorMessage = ref("");

async function loadProducts(force = false) {
  loading.value = true;
  errorMessage.value = "";
  try {
    await productStore.fetchProducts({ force });
  } catch (error) {
    errorMessage.value = productStore.error || error?.message || "Не удалось загрузить каталог";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  pageTitle.value = String(route.query.title || "Товары");
  await loadProducts(false);
});

watch(
  [() => route.query.search, () => route.query.title],
  ([newSearch, newTitle]) => {
    searchQuery.value = String(newSearch || "");
    pageTitle.value = String(newTitle || "Товары");
  },
  { immediate: true }
);

const filteredProducts = computed(() => {
  const source = Array.isArray(productStore.products) ? productStore.products : [];
  let products = source.filter((product) => product && typeof product === "object");

  products = products.filter((product) =>
    !String(product.description || "").toLowerCase().includes("outlet")
  );

  products = products.filter((product) =>
    String(product.product_id) !== "ca16b1e3-f6bd-4845-9079-7c66ba9d1a26"
  );

  const property = String(route.query.property || "").trim();
  if (property) {
    products = products.filter((product) =>
      Array.isArray(product.properties) && product.properties.some((item) =>
        String(item?.url_cpu || item?.value || "") === property
      )
    );
  }

  const query = searchQuery.value.trim().toLowerCase();
  if (query) {
    products = products.filter((product) =>
      String(product.name || "").toLowerCase().includes(query)
    );
  }

  products = [...products];
  if (filtersStore.filters.newest) {
    products.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  } else if (filtersStore.filters.popular) {
    products.sort((a, b) => Number(b.order_count || 0) - Number(a.order_count || 0));
  } else if (filtersStore.filters.priceDesc) {
    products.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  } else if (filtersStore.filters.priceAsc) {
    products.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else {
    products.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  }

  return products;
});

function goBack() {
  router.push("/");
}
</script>
