<template>
  <div class="flex flex-col items-start justify-center gap-3 h-full p-3 xs:p-2 pb-40 relative">
    <div class="relative h-11 flex flex-col items-center justify-center w-full">
      <img src="@/assets/icons/back.svg" class="absolute left-3" @click="goBack"/>
      <h1 class="text-base font-medium">Outlet Daigo</h1>
    </div>

    <img src="@/assets/img/main/slider/Card1.png" class="mb-2"/>

    <div class="text-sm xs:text-xs">Перед тем, как перейти в Outlet, хотим вам рассказать, как появился Daigo Outlet</div>
    <h2 class="w-full text-slider font-medium">Есть ли срок годности у Дайго?</h2>

    <div class="text-sm xs:text-xs">По законодательству РФ мы обязаны указывать срок годности продукции в 3 года</div>
    <p class="slider font-medium">Исследования</p>
    <div class="text-sm xs:text-xs">Однако исследования показывают: благодаря уникальной технологии, при длительной ферментации, активные вещества в составе Daigo не только сохраняют свои свойства, но и их концентрация становится выше.</div>
    
    <img src="@/assets/img/outlet2.png" class="mb-2"/>
    <img src="@/assets/img/outlettable.png" class="mb-2"/>

    <h2 class="w-full text-slider font-medium">Как появился OUTLET?</h2>
    <div class="text-sm xs:text-xs">Тем не менее, понимаем, что цифры на упаковке могут смущать. Поэтому мы запустили OUTLET DAIGO — здесь вы можете приобрести продукцию с истекающим сроком годности с большой скидкой и лично убедиться в её качестве и эффективности.</div>
    <div class="text-sm xs:text-xs font-medium">Это отличная возможность попробовать Daigo и сделать собственные выводы.</div>

    <Button variant="solid" class="mm:fixed mm:bottom-[105px] mm:w-[93%]" @click="goOutlet">
        Перейти в Outlet
    </Button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductStore } from "@/store/productStore";
import { useFiltersStore } from "@/store/filtersStore";
import Button from "@/components/ui/Button.vue";

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
    originalPrice: p.price,
    price: Math.round(p.price * 0.5),
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
const goOutlet = () => {
  router.push({ path: "/outlet-catalog" });
};
</script>
