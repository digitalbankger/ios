<template>
  <div class="flex flex-col gap-2 w-full px-1">
    <h1 class="text-slider font-medium w-full text-left">{{ product?.name || "Товар" }}</h1>
    <p class="text-slider font-medium w-full text-left">{{ formatPrice(product.price) }}</p>

    <div
      v-if="iconList.length"
      class="flex flex-row gap-3 xs:gap-2 my-2"
    >
      <div
        v-for="(icon, index) in iconList"
        :key="index"
        class="flex flex-col justify-center items-center px-1 py-2 gap-2 rounded-md border border-black-100 w-1/2"
      >
        <img :src="icon.icon" width="24" />
        <p class="text-xs xs:text-[10px] text-center" v-html="icon.text"></p>
      </div>
    </div>

    <button 
      class="flex flex-row items-center justify-between gap-2 xs:gap-1.5 mb-4 px-2.5 xs:px-1.5 py-3.5 w-full rounded-lg bg-black"
      @click="$emit('open-dolyami')"
    >
        <div class="flex flex-row items-center gap-1 py-2 px-2 xs:px-1 bg-white rounded"><img src="@/assets/icons/dolyami-transparent.svg" class="w-[12px] xs:w-[6px]" /><img src="@/assets/icons/dolyami-text.svg" class="w-[44px] xs:w-[34px]" /></div>
        <p class="text-[13px] xs:text-[9px] text-white font-light">
            4 платежа по {{ formatPrice(product.price/4) }}
        </p>
        <img src="@/assets/icons/arrow-white.svg" class="ms-auto xs:w-3"/>
    </button>

    <div v-if="relatedPromotions.length" >
      <h3 class="text-slider font-medium mb-3">Акции к этому товару</h3>
      <ProductPromotionSlider :promotions="relatedPromotions" />
    </div>

    <div class="flex flex-col w-full gap-4 xs:gap-2 px-1">
      <p class="text-slider font-medium">Описание</p>
      <div class="text-sm xs:text-xs" v-html="formattedDescription"></div>
    </div>

    <div class="flex flex-col w-full gap-4 px-1" v-if="accordions.length">
      <p class="text-xl font-medium mt-2">Подробные характеристики</p>
      <AccordionElement 
        v-for="(item, index) in accordions" 
        :key="index" 
        :title="item.title" 
        :content="item.content" 
        :is-open="openIndex === index"
        @toggle="toggleAccordion(index)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, defineEmits } from "vue";
import AccordionElement from "@/components/ui/AccordionElement.vue";
import { productIcons } from '@/assets/data/productIcons'
import { usePromoStore } from "@/store/promotionStore";
import ProductPromotionSlider from "./product/ProductPromotionSlider.vue";

const promoStore = usePromoStore();

const relatedPromotions = computed(() => {
  if (!props.product?.promotions || !promoStore.promotions.length) return [];
  const result = promoStore.promotions.filter(promo =>
    props.product.promotions.includes(String(promo.id))
  );
  console.log("🎯 relatedPromotions:", result);
  return result;
});

const getFullBannerUrl = (path) => {
  return path.startsWith("http") ? path : `https://api.daigo.ru${path}`;
};

const iconList = computed(() => {
  const productId = props.product?.product_id;
  const match = productIcons.find(group => group.productIds.includes(productId));
  return match ? match.icons : [];
});

const props = defineProps({ product: Object });
const openIndex = ref(null);

const formattedDescription = computed(() => {
  if (!props.product || !props.product.description) return "";
  return props.product.description.replace(/\n/g, "<br>");
});

defineEmits(["open-dolyami"]);

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', { 
    style: 'currency', 
    currency: 'RUB', 
    maximumFractionDigits: 0
  }).format(Math.round(price));
};

const accordions = computed(() =>
  [
    { title: "Состав", content: props.product.composition },
    { title: "Инструкция по применению", content: props.product.usage_instruction },
    { title: "Принцип действия", content: props.product.action_principle },
    { title: "Метаболиты", content: props.product.metabolites },
    { title: "Эффективность", content: props.product.effectiveness }
  ].filter(item => item.content && item.content.trim() !== "")
);

const toggleAccordion = (index) => {
  openIndex.value = openIndex.value === index ? null : index;
};
</script>