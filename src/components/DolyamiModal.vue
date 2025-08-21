<template>
  <div class="fixed inset-0 z-10 flex items-end justify-center bottom-20">
    <div
      class="bg-white border border-gray-100 shadow shadow-productcardlg w-full max-w-md rounded-t-[30px] p-34 xs:px-[15px] pt-4 relative"
            @touchstart="startSwipe"
            @touchmove="handleSwipe"
    >
        <div class="flex justify-center cursor-pointer mb-6">
            <div 
                class="w-8 h-1 bg-gray-400 rounded-full"       
            >
            </div>
        </div>

      <h2 class="text-center text-slider font-semibold mt-2">Оплата долями</h2>
      <p class="text-center text-base xs:text-xs mt-2 w-80 xs:w-full mx-auto">
        Оплачивайте частями без переплат заказы на суммы <span class="text-blue-500">до 30 000 ₽</span>
      </p>

      <div class="bg-gray-100 p-3 xs:px-2 xs:text-sm rounded-lg flex justify-between mt-4">
        <span>Сумма покупки:</span>
        <span class="font-semibold">{{ formatPrice(cartStore.finalTotalPrice) }} ₽</span>
      </div>

      <div class="mt-4">
        <h3 class="text-base font-medium mb-2">Как это работает?</h3>
        <ol class="flex flex-col gap-3 text-sm xs:text-xs list-decimal pl-5 mt-2 ">
          <li>При оформлении заказа выберите способ оплаты "Долями"</li>
          <li>Выберите карту для списания платежей</li>
          <li>Оплатите 4 небольших платежа в течение месяца</li>
        </ol>
      </div>

      <p v-if="cartStore.finalTotalPrice > 30000" class="text-red-500 text-center text-sm mt-3">
        Сумма в корзине превышает 30 000 ₽
      </p>

      <button
        @click="router.push('/dolyame-create')" 
        class="w-full mt-4 py-3 text-white rounded-lg font-light"
        :class="cartStore.finalTotalPrice > 30000 ? 'bg-hoverbtn !text-black cursor-not-allowed' : 'bg-primary hover:bg-hoverbtn'"
        :disabled="cartStore.finalTotalPrice > 30000"
      >
        Оформить заказ
      </button>

    </div>
  </div>
</template>

<script setup>
import { useCartStore } from "@/store/cartStore";
import { defineEmits, ref } from "vue";
import router from "../router";

const cartStore = useCartStore(); // Используем глобальный стор
const emit = defineEmits(["close"]);

const startY = ref(0);
const endY = ref(0);

const startSwipe = (event) => {
  startY.value = event.touches[0].clientY;
};

const handleSwipe = (event) => {
  endY.value = event.touches[0].clientY;

  if (endY.value - startY.value > 100) {
    emit("close");
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU").format(price);
};
</script>
