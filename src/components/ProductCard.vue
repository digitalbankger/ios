<template>
  <div class="product-card bg-white rounded-lg shadow-productcard">
    <router-link :to="`/product/${product.url_cpu}`" class="relative">
      <swiper :modules="[Pagination]" :pagination="{ clickable: true }" class="product-slider">
        <swiper-slide v-for="(image, index) in product.images" :key="index">
          <img
            v-if="isOutletProduct"
            src="@/assets/icons/sale.svg"
            alt="Outlet"
            class="absolute bottom-0 right-0 z-20 !w-[50px] h-auto"
          />
          <img
            :src="getFullImageUrl(image.image_url)"
            :alt="image.alt_text || product.name"
            class="w-full h-40 bg-productbg object-cover rounded-t-lg"
          />
        </swiper-slide>               
      </swiper>
      <div class="absolute left-1 bottom-6 z-10 flex flex-wrap gap-2 mt-1">
        <div
          v-for="label in product.labels"
          :key="label.label_id"
          class="text-sm xs:text-xs px-3 xs:px-2 py-1 xs:py-05 rounded-md font-normal"
          :style="{ backgroundColor: label.bg_color, color: label.color }"
        >
          {{ label.name }}
        </div>
      </div>
    </router-link>

    <div class="flex flex-col gap-1 p-2 pt-0 min-h-40">
      <h2 class="text-base xs:text-sm leading-5 font-medium mt-1 ml-0.5">{{ shortTitle }}</h2>
      <p class="text-[0.6rem] xs:text-[0.5rem] opacity-50 tracking-wide ml-0.5">{{ product.subtitle }}</p>
      <div class="flex xs:flex-col xs:items-start items-center gap-2 my-1 ml-0.5">
        <p class="text-base xs:text-sm font-medium">
          {{ formatPrice(product.price) }} ₽
        </p>
        <p
          v-if="isOutletProduct && product.originalPrice && product.originalPrice > product.price"
          class="text-xs xs:text-xs text-gray-400 line-through"
        >
          {{ formatPrice(product.originalPrice) }} ₽
        </p>
      </div>

      <div
        v-if="cartItem"
        class="bg-primary text-white px-3 xs:px-1 py-1 mt-auto h-10 w-full text-base rounded-md transition-all flex items-center justify-center gap-2 xs:gap-1"
      >
        <button class="p-[clamp(4px,1.2vw,8px)]" @click="decreaseQuantity">
          <img src="@/assets/icons/minus.svg" class="w-[clamp(12px,4vw,16px)]" />
        </button>

        <span class="font-normal tracking-wide text-[clamp(12px,4vw,16px)] text-center flex-grow leading-none truncate">
          {{ cartItem.quantity }} шт
        </span>

        <button class="p-[clamp(4px,1.2vw,8px)]" @click="increaseQuantity">
          <img src="@/assets/icons/plus.svg" class="w-[clamp(12px,4vw,16px)]" />
        </button>
      </div>

      <Button
        v-else
        variant="solid"
        class="!h-[40px] mt-auto !text-[clamp(12px,4vw,16px)] xs:text-xs xs:px-3"
        @click="addToCart"
      >
        В корзину
      </Button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import { useCartStore } from '@/store/cartStore'
import { usePromoStore } from '@/store/promotionStore'
import Button from "@/components/ui/Button.vue"
import { Swiper, SwiperSlide } from "swiper/vue"
import { Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

const props = defineProps({ product: Object })
const cartStore = useCartStore()
const promoStore = usePromoStore()

const cartItem = computed(() =>
  cartStore.getItemById(props.product.product_id)
)

const isOutletProduct = computed(() => {
  return props.product.description?.toLowerCase().includes("outlet");
});

const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  return imageUrl.startsWith("http") ? imageUrl : `https://api.daigo.ru${imageUrl}`;
};

const shortTitle = computed(() => {
  const words = props.product.name.split(" ");
  return words.length > 5 ? words.slice(0, 5).join(" ") : props.product.name;
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU").format(price);
};

const addToCart = () => {
  cartStore.addToCart(props.product);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    ecommerce: {
      currencyCode: "RUB",
      add: {
        products: [
          {
            id: props.product.product_id,
            name: props.product.name,
            price: props.product.price,
            quantity: 1,
          }
        ]
      }
    }
  });
  if (promoStore.isGiftPromotionActive()) {
    promoStore.applyGift21Logic();
  }
};

const increaseQuantity = () => {
  cartStore.updateQuantity(props.product.product_id, cartItem.value.quantity + 1);
  if (promoStore.isGiftPromotionActive()) {
    console.log("🔁 Применяем подарок после увеличения");
    promoStore.applyGift21Logic();
  }
};

const decreaseQuantity = () => {
  if (cartItem.value.quantity > 1) {
    cartStore.updateQuantity(props.product.product_id, cartItem.value.quantity - 1);
  } else {
    cartStore.removeFromCart(props.product.product_id);
  }

  if (promoStore.isGiftPromotionActive()) {
    console.log("➖ Применяем подарок после уменьшения/удаления");
    promoStore.applyGift21Logic();
  }
};
</script>

<style>
.product-card .product-slider {
  width: 100%;
  height: 180px;
  padding-bottom: 18px;
}
.product-card .swiper-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-card .swiper-pagination-bullet-active {
  background-color: #111 !important;
}
.product-card .swiper-pagination-bullet {
  width: 5px !important;
  height: 5px !important;
}
.product-card .swiper-pagination {
  bottom: -2px !important;
}

@media (max-width: 325px) {
  .product-card .product-slider {
    height: 120px;
    padding-bottom: 16px;
  }
  .product-card .swiper-pagination-bullet {
    width: 3px !important;
    height: 3px !important;
  }
}
</style>
