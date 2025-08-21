<template>
  <div class="flex flex-col items-center justify-center gap-3 h-full p-3 xs:p-2 pb-32">
    <div class="relative h-11 flex flex-col items-center justify-center w-full">
      <img src="@/assets/icons/back.svg" class="absolute left-3" @click="goBack"/>
      <h1 class="text-base font-medium">Outlet</h1>
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

    <img src="@/assets/img/main/outlet-catalog.png" class="mb-2" @click="goBack"/>

    <h2 class="w-full text-slider font-medium">Outlet Daigo</h2>

    <div v-if="loading" class="flex justify-center items-center h-60">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
    </div>
    <!-- md:grid-cols-3 lg:grid-cols-4 -->
    <div class="grid grid-cols-2 gap-4 xs:gap-3 w-full">
      <ProductCard 
        v-for="product in filteredProducts"
        :key="product.id"
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

onMounted(async () => {
  loading.value = true;
  await productStore.fetchProducts();
  loading.value = false;

  pageTitle.value = route.query.category || "Товары";
});

watch(
  [() => route.query.search, () => route.query.category], 
  ([newSearch, newCategory]) => {
    searchQuery.value = newSearch || "";
    pageTitle.value = newCategory || "Товары";
  }, 
  { immediate: true }
);

const outletProductIds = [
  "71700acb-3584-490b-a5f7-62e8cb57b3c9",
  "cafac368-1074-417d-bb3e-4470b4e28190",
  "6dd5b27c-65fa-4de2-ada7-472f233cf60a",
];

const filteredProducts = computed(() => {
  let products = [...productStore.products];

  products = products.filter((p) =>
    p.description?.toLowerCase().includes("outlet")
  );

  products = products.map((p) => ({
    ...p,
    originalPrice: Math.round(p.price * 2),
    price: p.price,
  }));

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
  }

  return products;
});

const goBack = () => {
  router.push({ path: "/" });
};
</script>
