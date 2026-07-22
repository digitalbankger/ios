<template>
  <div class="product-page flex flex-col items-center justify-center gap-4 h-full p-3 xs:px-2 pb-44 relative">
    <div class="relative h-11 flex flex-col items-center justify-center w-full">
      <img src="@/assets/icons/back.svg" class="absolute left-3 cursor-pointer" @click="goBack" />
      <p class="text-base font-medium">Описание товара</p>
    </div>

    <div v-if="product" class="flex flex-col items-center gap-6 w-full">
      <ProductSlider :images="product.images" :alt="product.name" />

      <img
        v-if="isOutletProduct"
        src="@/assets/img/main/outlet-product.png"
        alt="Outlet товар"
        class="w-full object-cover"
      />

      <ProductInfo :product="product" @open-dolyami="openDolyamiModal"/>

      <ShippingMethods :city="city" :deliveryInfo="deliveryInfo" />

      <RelatedProducts :currentProductId="product.product_id" />

      <CartControls :product="product" />
    </div>

    <div v-else-if="loading" class="text-gray-500 text-lg">Загрузка товара...</div>
    <div v-else class="flex flex-col items-center gap-3 py-10">
      <p class="text-red-500 text-sm text-center">{{ errorMessage || "Товар не найден" }}</p>
      <button class="text-primary underline" @click="loadProduct">Повторить</button>
    </div>
    <Transition name="slide-up">
      <DolyamiModal v-if="showDolyamiModal" :price="product?.price || 0" @close="showDolyamiModal = false" />
    </Transition>

    <Transition name="slide-up">
      <CitySelectModal :isOpen="showCityModal" @close="showCityModal = false" @save="handleCitySave" />
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductStore } from "@/store/productStore";
import { usePromoStore } from "@/store/promotionStore";
import { getDistrictByCity } from "@/services/districtService";
import { getDeliveryTimes } from "@/services/deliveryService";

import ProductSlider from "@/components/ProductSlider.vue";
import ProductInfo from "@/components/ProductInfo.vue";
import CartControls from "@/components/CartControls.vue";
import ShippingMethods from "@/components/ShippingMethods.vue";
import DolyamiModal from "@/components/DolyamiModal.vue";
import RelatedProducts from "../components/RelatedProducts.vue";
import CitySelectModal from "@/components/product/CitySelectorModal.vue";

const promoStore = usePromoStore();

const showCityModal = ref(false);

const city = ref(localStorage.getItem("user_city") || "Москва");
const deliveryInfo = ref(JSON.parse(localStorage.getItem("user_delivery_info") || "{}"));

function getUserCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Геолокация не поддерживается"));
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
      reject,
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
}

async function getCityByCoords({ lat, lon }) {
  // Для reverse-geocode используем DaData, как и в актуальном checkout сайта.
  // Если сервис недоступен, пользователь выберет город вручную.
  const response = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Token ac0fc720467713631eff0602ba19a2648c34f21d",
    },
    body: JSON.stringify({ lat, lon, count: 1 }),
  });
  if (!response.ok) throw new Error("Не удалось определить город");
  const data = await response.json();
  const item = data?.suggestions?.[0];
  return item?.data?.city || item?.data?.settlement || "Москва";
}

const initCityDetection = async () => {
  const savedCity = localStorage.getItem("user_city");

  if (!savedCity) {
    try {
      const coords = await getUserCoordinates();
      const detectedCity = await getCityByCoords(coords);

      const district = getDistrictByCity(detectedCity);
      const info = getDeliveryTimes(district);

      localStorage.setItem("user_city", detectedCity);
      localStorage.setItem("user_district", district);
      localStorage.setItem("user_delivery_info", JSON.stringify(info));

      city.value = detectedCity;
      deliveryInfo.value = info;
    } catch {
      console.warn("⚠️ Геолокация не разрешена, показываем модалку...");
      setTimeout(() => {
        showCityModal.value = true;
      }, 3000);
    }
  } else {
    city.value = savedCity;
    deliveryInfo.value = JSON.parse(localStorage.getItem("user_delivery_info") || "{}");
  }
};

const handleCitySave = (selectedCity) => {
  const district = getDistrictByCity(selectedCity);
  const info = getDeliveryTimes(district);

  localStorage.setItem("user_city", selectedCity);
  localStorage.setItem("user_district", district);
  localStorage.setItem("user_delivery_info", JSON.stringify(info));

  city.value = selectedCity;
  deliveryInfo.value = info;  

  showCityModal.value = false;
};

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const showDolyamiModal = ref(false);
const loading = ref(true);
const errorMessage = ref("");

const product = computed(() => {
  const slug = String(route.params.url_cpu || "");
  const list = Array.isArray(productStore.products) ? productStore.products : [];
  return list.find((item) => String(item.url_cpu || item.slug) === slug) ||
    (String(productStore.selectedProduct?.url_cpu || productStore.selectedProduct?.slug) === slug
      ? productStore.selectedProduct
      : null);
});

async function loadProduct() {
  loading.value = true;
  errorMessage.value = "";
  try {
    await productStore.fetchProducts();
    await productStore.fetchProductById(String(route.params.url_cpu || ""));
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || error?.message || "Не удалось загрузить товар";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await Promise.allSettled([
    initCityDetection(),
    promoStore.promotions.length ? Promise.resolve() : promoStore.loadPromotions(),
  ]);
  await loadProduct();
});

const isOutletProduct = computed(() => {
  return product.value?.description?.toLowerCase().includes('outlet');
});

const openDolyamiModal = () => {
  showDolyamiModal.value = true;
};

const goBack = () => {
  router.push({ path: "/catalog" });
};

</script>

<style>
.product-page .swiper-pagination-bullet-active {
  background-color: #111 !important;
}
.product-page .swiper-pagination-bullet {
  width: 5px !important;
  height: 5px !important;
}
.product-page .swiper-pagination {
  bottom: -2px !important;
}
.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.4s ease-in-out, opacity 0.3s ease-in-out;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>