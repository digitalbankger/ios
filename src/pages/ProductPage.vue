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

    <div v-else class="text-gray-500 text-lg">Загрузка товара...</div>
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

const product = computed(() => productStore.products.find(p => p.url_cpu === route.params.url_cpu));

onMounted(async () => {
  await initCityDetection();

  if (!productStore.products.length) {
    productStore.fetchProducts();
  }

  if (!promoStore.promotions.length) {
    await promoStore.loadPromotions();
  }
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