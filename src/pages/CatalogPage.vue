<template>
  <div class="flex flex-col items-center justify-center gap-3 h-full p-3 xs:p-2 pb-32">
    <div class="relative h-11 flex flex-col items-center justify-center w-full">
      <img src="@/assets/icons/back.svg" class="absolute left-3" @click="goBack"/>
      <h1 class="text-base font-medium">Каталог товаров</h1>
    </div>

    <div class="flex flex-row items-center gap-3 w-full">
      <SearchInput 
        :dropdownEnabled="true"
        v-model="searchQuery" 
        class="my-2"
      />
      <Button 
        variant="graybtn" 
        class="w-[52px] h-[50px]"
        @click="filtersStore.toggleFilter"
      >
        <img src="@/assets/icons/filter.svg" />
      </Button>
    </div>

    <h2 class="w-full text-slider font-medium">{{ pageTitle }}</h2>

    <div v-if="loading" class="flex justify-center items-center h-60">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
    </div>
    <!-- md:grid-cols-3 lg:grid-cols-4 -->
    <div class="grid grid-cols-2 gap-4 xs:gap-3 w-full">
      <ProductCard 
        v-for="product in filteredProducts"
        :key="product.product_id"
        :product="product"
      />
    </div>

    <ProductFilter />


  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
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
const loading = ref(true);

const selectedProperty = computed(() => route.query.property);
const categoryTitle = computed(() => route.query.title);

onMounted(async () => {
  loading.value = true;
  productStore.fetchProducts();

  loading.value = false;
  pageTitle.value = route.query.title || "Товары";
});

watch(
  [() => route.query.search, () => route.query.title], 
  ([newSearch, newTitle]) => {
    searchQuery.value = newSearch || "";
    pageTitle.value = newTitle || "Товары";
  }, 
  { immediate: true }
);

const filteredProducts = computed(() => {
  let products = [...productStore.products];

  products = products.filter((p) =>
    !p.description?.toLowerCase().includes("outlet")
  );
  
  products = products.filter((p) =>
    p.product_id !== "ca16b1e3-f6bd-4845-9079-7c66ba9d1a26"
  );

  if (route.query.property && route.query.property !== "") {
    products = products.filter((p) =>
      p.properties?.some((prop) => prop.url_cpu === route.query.property)
    );
  }

  if (searchQuery.value.trim() !== "") {
    products = products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (filtersStore.filters.newest) {
    products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (filtersStore.filters.popular) {
    products.sort((a, b) => b.order_count - a.order_count);
  } else if (filtersStore.filters.priceDesc) {
    products.sort((a, b) => b.price - a.price);
  } else if (filtersStore.filters.priceAsc) {
    products.sort((a, b) => a.price - b.price);
  } else {
    products.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  return products;
});

const goBack = () => {
  router.push({ path: "/" });
};
</script>
