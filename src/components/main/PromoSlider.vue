<template>
  <div class="promo-slider w-full overflow-hidden" @click="handleClick">
    <Swiper
      @swiper="onSwiper"
      :modules="[Autoplay, Pagination]"
      :slides-per-view="'auto'"
      :space-between="10"
      :loop="true"
      :autoplay="{ delay: 10000, disableOnInteraction: false }"
      :pagination="{ el: '.swiper-custom-pagination', clickable: true }"
      :centeredSlides="true"
      :centerInsufficientSlides="true"
      class="relative"
    >
      <SwiperSlide 
        v-for="(promo, index) in promos" 
        :key="index" 
        class="slide"
        @click="handleClick"
        >
        <div class="promo-card relative overflow-hidden cursor-pointer" :style="{ backgroundColor: promo.bgColor }">
          <img
              v-for="(image, imgIndex) in promo.images"
              :key="imgIndex"
              :src="image.src"
              :class="image.class"
              alt="Promo Image"
          />
        </div>
      </SwiperSlide>
    </Swiper>
    <div class="w-12 mx-auto flex flex-row justify-center items-center gap-1 swiper-custom-pagination mt-2"></div>
  </div>
</template>  

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';


const router = useRouter();

const swiperRef = ref(null);

const onSwiper = (swiperInstance) => {
  swiperRef.value = swiperInstance;
};

const handleClick = () => {
  const realIndex = swiperRef.value?.realIndex ?? 0;

  if (realIndex === 0) {
    router.push("/deals");
  } else {
    router.push("/deals");
  }
};

defineProps({
  promos: Array,
});
</script>

<style scoped>
.promo-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  color: black;
  width: 100%;
}

.swiper {
  width: 100%;
  overflow: hidden;
}

.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100% !important;
}

::v-deep .swiper-pagination-bullet {
  width: 5px;
  height: 5px;
}

::v-deep .swiper-pagination-bullet {
  opacity: 0.1;
}

::v-deep .swiper-pagination-bullet-active {
  opacity: 1;
  background-color: #6BA0FF;
}

::v-deep .swiper-pagination-horizontal.swiper-pagination-bullets .swiper-pagination-bullet {
  margin-inline: 2px;
}
</style>  