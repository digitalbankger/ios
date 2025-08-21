<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-slider font-medium">Ваш заказ</h2>
    <p class="text-sm tracking-wide">Товаров: {{ cartStore.items.length }} + подарки</p>
    
    <div class="mt-1 flex flex-wrap justify-start gap-2 overflow-x-auto">
      <img 
        v-for="item in cartStore.items.slice(0, 4)"
        :key="item.product_id || item.id || item.name"
        :src="getImageSrc(item)" 
        class="w-[23%] bg-productbg object-cover rounded-sm" 
      />
    </div>

    <p class="text-sm xs:text-xs xs:leading-6 mt-2 font-medium">
      Сумма с применёнными скидками: {{ formatPrice(finalTotal - bonusesUsed) }} ₽
    </p>

    <div class="flex flex-row justify-between items-center rounded-md my-2">
      <p class="text-sm font-medium pt-1">
        Ваши бонусы: {{ availableBonuses.toLocaleString() }}
      </p>

      <button 
        v-if="!showBonusInput" 
        @click="showBonusInput = true" 
        class="bg-transparent text-primary border-b border-primary text-sm xs:text-xs pt-1 w-fit"
      >
        Использовать
      </button>
    </div>
    <transition name="fade">
      <div v-if="showBonusInput" class="flex flex-col gap-2 mt-2">
        <input 
          type="number"
          v-model="bonusesUsed"
          @input="applyBonuses"
          :min="0" 
          :max="maxBonuses"
          class="py-2 px-3 h-order border rounded-md w-full"
        />
        <p class="text-xs text-gray-400 tracking-wide">
          Максимум: {{ maxBonuses.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) }}
        </p>
      </div>
    </transition>

    <p class="text-base xs:text-sm text-[#FF64E7] w-full">
      Бонусов начислено: {{ earnedBonuses.toLocaleString() }}
    </p>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, watch, ref } from "vue";
import { useUserStore } from "@/store/userStore";

const props = defineProps(["cartStore", "finalTotal", "bonusesUsed"]);
const emit = defineEmits(["update:bonusesUsed"]);
const userStore = useUserStore();

const giftItems = [
  { id: "gift1", image: new URL("@/assets/img/sashe.png", import.meta.url).href },
  { id: "gift2", image: new URL("@/assets/img/patchi.png", import.meta.url).href },
];

const getImageSrc = (item) => {
  if (item.image) return item.image;
  if (!item.images || item.images.length === 0) return "";

  const img = typeof item.images[0] === "string"
    ? item.images[0]
    : item.images[0].image_url;

  return img.startsWith("http") ? img : `https://api.daigo.ru${img}`;
};

const formatPrice = (price) => new Intl.NumberFormat("ru-RU").format(price);

const showBonusInput = ref(false);
const bonusesUsed = ref(props.bonusesUsed);

watch(() => props.bonusesUsed, (newVal) => {
  if (newVal !== bonusesUsed.value) {
    bonusesUsed.value = newVal;
  }
});

const availableBonuses = computed(() => {
  const bonuses = userStore.profile?.bonuses || { valid: { value: 0 }, expiring: { value: 0 } };
  return (bonuses.valid.value || 0) + (bonuses.expiring.value || 0);
});

const maxBonuses = computed(() => {
  return Math.floor(Math.min(props.finalTotal / 4, availableBonuses.value));
});

const applyBonuses = () => {
  if (bonusesUsed.value > maxBonuses.value) {
    bonusesUsed.value = maxBonuses.value;
  }
  if (bonusesUsed.value < 0) {
    bonusesUsed.value = 0;
  }

  emit("update:bonusesUsed", bonusesUsed.value);
};

const earnedBonuses = computed(() => {
  return props.finalTotal >= 300000 ? Math.floor(props.finalTotal * 0.1) : Math.floor(props.finalTotal * 0.01);
});
</script>
