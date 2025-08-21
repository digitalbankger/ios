<template>
  <div class="product-promo-slider w-full overflow-hidden my-4">
    <Swiper
      @swiper="onSwiper"
      :modules="[Pagination]"
      :slides-per-view="'auto'"
      :space-between="12"
      :centeredSlides="true"
      :pagination="{ el: '.swiper-custom-pagination', clickable: true }"
      class="relative"
    >
      <SwiperSlide 
        v-for="(promo, index) in promotions" 
        :key="index"
        class="rounded-xl overflow-hidden"

        @click="() => applyPromo(promo)"
      >
        <img
          :src="getFullBannerUrl(promo.banner_url)"
          :alt="promo.name"
          class="w-full h-auto object-contain rounded-xl"
        />
      </SwiperSlide>
    </Swiper>

    <div class="swiper-custom-pagination w-full mt-2 flex justify-center items-center gap-1"></div>

    <Popup 
      :isOpen="showPopup"
      :title="popupTitle"
      :message="popupMessage"
      buttonText="Закрыть"
      @close="showPopup = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import { usePromoStore } from '@/store/promotionStore';
import Popup from '@/components/ui/PromoModal.vue';

import 'swiper/css';
import 'swiper/css/pagination';

const props = defineProps({
  promotions: Array,
});

const promoStore = usePromoStore();

const showPopup = ref(false);
const popupTitle = ref('');
const popupMessage = ref('');
const swiperRef = ref(null);

const onSwiper = (swiper) => (swiperRef.value = swiper);

const getFullBannerUrl = (path) => {
  return path?.startsWith('http') ? path : `https://api.daigo.ru${path}`;
};

const isNotice = (promo) => promo.promo_type === 'notice' || promo.id === 8;

const applyPromo = async (promotion) => {
  if (isNotice(promotion)) return;

  const { success } = await promoStore.applyPromotion(promotion);

  if (success) {
    popupTitle.value = promotion.promo_type === 'gift'
      ? 'Подарок добавлен!'
      : 'Акция применена!';
    popupMessage.value = promotion.promo_type === 'gift'
      ? 'Акция 2+1 успешно применена. Проверьте корзину.'
      : `Скидка ${promotion.discount || ''} успешно добавлена!`;
  } else {
    popupTitle.value = 'Акция не применена!';
    popupMessage.value = 'Проверьте условия акции и попробуйте снова.';
  }

  showPopup.value = true;
};
</script>

<style scoped>
::v-deep .swiper-pagination-bullet {
  width: 5px;
  height: 5px;
  opacity: 0.2;
}
::v-deep .swiper-pagination-bullet-active {
  opacity: 1;
  background-color: #6BA0FF !important;
}
</style>
