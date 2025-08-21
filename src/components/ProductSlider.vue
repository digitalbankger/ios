<template>
  <swiper :modules="[Pagination]" :pagination="{ clickable: true }" class="product-slider">
    <swiper-slide v-for="(image, index) in images" :key="index">
      <img
        :src="getFullImageUrl(image.image_url)"
        :alt="image.alt_text || name"
        class="w-full rounded-lg"
      />
    </swiper-slide>      
  </swiper>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

defineProps({ images: Array, alt: String });

const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  return imageUrl.startsWith("http") ? imageUrl : `https://api.daigo.ru${imageUrl}`;
};

</script>

<style>
.product-slider {
  width: 100%;
  height: auto;
  padding-bottom: 18px;
}
</style>