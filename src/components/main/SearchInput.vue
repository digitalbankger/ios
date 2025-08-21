<template>
  <div class="relative w-full">
    <input
      v-model="searchQuery"
      type="text"
      :placeholder="placeholder"
      class="w-full py-2 pe-6 h-[50px] rounded-[6px] bg-hoverbtn focus:ring-1 focus:ring-primary focus:outline-none transition"
      :class="{ 'ps-14': !hideIcon, 'ps-6': hideIcon }"
      @input="onInput"
      @focus="showDropdown = true"
      @blur="hideDropdown"
    />

    <transition name="fade">
      <div v-if="!hideIcon" class="absolute left-[20px] top-1/2 transform -translate-y-1/2 w-[18px] h-[18px]">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z" fill="#a09ea3"/>
        </svg>
      </div>
    </transition>

    <button v-if="searchQuery" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" @click="clearSearch">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="#49454F"/>
      </svg>
    </button>

    <div v-if="dropdownEnabled && showDropdown" class="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg mt-1 z-50">
      <div class="p-2">
        <div v-if="productsFiltered.length">
          <h3 class="text-sm my-2 font-normal tracking-wide text-gray-500">Товары</h3>
          <div v-for="product in productsFiltered" :key="product.id">
            <router-link :to="`/product/${product.url_cpu}`" class="flex items-center gap-3 py-2 hover:bg-gray-100 cursor-pointer">
              <img :src="getFullImageUrl(product.images?.[0]?.image_url)" class="w-12 h-12 rounded-sm object-cover" />
              <div>
                <p class="text-sm mb-1">{{ product.name }}</p>
                <p class="text-xs text-gray-400">{{ formatPrice(product.price) }} ₽</p>
              </div>
            </router-link>
          </div>
          <button class="text-blue-500 tracking-wide text-sm font-light mt-2 w-full text-left hover:underline" @click="goToCatalog">
            Смотреть все товары  →
          </button>
        </div>

        <div v-if="promosFiltered.length" class="mt-3">
          <h3 class="text-sm font-normal tracking-wide text-gray-500">Акции</h3>
          <div
            v-for="promo in promosFiltered"
            :key="promo.id"
            class="flex items-start gap-3 py-2 hover:bg-gray-100 cursor-pointer"
            @click="goToPromotions"
          >
            <img :src="getFullImageUrl(promo.banner_url)" class="w-16 h-10 rounded-sm object-cover" />
            <div>
              <p class="text-sm">{{ promo.name }}</p>
              <p class="text-xs text-gray-400 font-light">{{ promo.description }}</p>
            </div>
          </div>
          <button class="text-blue-500 tracking-wide text-sm font-light mt-2 w-full text-left hover:underline" @click="goToPromotions">
            Смотреть все акции →
          </button>
        </div>

        <div v-if="!productsFiltered.length && !promosFiltered.length" class="text-gray-500 text-sm text-center p-3">
          Ничего не найдено
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductStore } from "@/store/productStore";
import { usePromoStore } from "@/store/promotionStore";
import { defineEmits } from "vue";

const emit = defineEmits(["update:modelValue", "search"]);

const props = defineProps({
  modelValue: String,
  placeholder: { type: String, default: "Поиск..." },
  dropdownEnabled: { type: Boolean, default: true },
});

const searchQuery = ref(props.modelValue);
const showDropdown = ref(false);
const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const promoStore = usePromoStore();

onMounted(() => {
  productStore.fetchProducts();
});

const getFullImageUrl = (imgPath) => {
  if (!imgPath) return "";
  return imgPath.startsWith("http") ? imgPath : `https://api.daigo.ru${imgPath}`;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU").format(price)
}

const goToCatalog = () => {
  router.push({ path: "/catalog", query: { search: searchQuery.value } });
  showDropdown.value = false;
};

const goToPromotions = () => {
  router.push({ path: "/deals", query: { search: searchQuery.value } });
  showDropdown.value = false;
};

const productsFiltered = computed(() => {
  console.log("🔍 Фильтрация товаров:", searchQuery.value);
  if (!searchQuery.value.trim()) return [];

  const query = searchQuery.value.toLowerCase();
  const excludedId = "ca16b1e3-f6bd-4845-9079-7c66ba9d1a26";

  return productStore.products
    .filter(p =>
      p.product_id !== excludedId &&
      (
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.name_ru && p.name_ru.toLowerCase().includes(query))
      )
    )
    .slice(0, 3);
});

const promosFiltered = computed(() => {
  console.log("🔥 Фильтрация акций:", searchQuery.value);
  if (!searchQuery.value.trim()) return [];

  const query = searchQuery.value.toLowerCase();

  return promoStore.promotions
    .filter(p =>
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.coupon && p.coupon.toLowerCase().includes(query))
    )
    .slice(0, 3);
});

const hideDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

const clearSearch = () => {
  searchQuery.value = "";
  emit("update:modelValue", "");

  if (route.path === "/catalog") {
    router.replace({ query: {} });
  }
  showDropdown.value = false;
};

</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
input {
  border: none !important;
}
</style>
