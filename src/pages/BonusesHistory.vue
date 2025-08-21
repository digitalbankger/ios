<template>
  <div class="flex flex-col w-full h-full px-4 py-6">
    <div class="relative flex items-center justify-center h-11">
      <button @click="goBack" class="absolute left-0">
        <img src="@/assets/icons/back.svg" alt="Назад" />
      </button>
      <h1 class="text-base font-medium">Бонусы</h1>
    </div>

    <div class="flex flex-col gap-4 mt-4 p-3 xs:px-0">
        <h2 class="text-slider font-medium mt-3 flex flex-row items-center">
            Накопительня скидка
        </h2>

        <div class="flex flex-col gap-1 mt-1">
            <h2 class="text-base xs:text-sm font-medium">Бронзовая карта</h2>
            <p class="tracking-wide text-sm xs:text-xs mb-1">Сумма покупок до 99 999 скидка 3%</p>
        </div>
        <div class="flex flex-col gap-1 mt-1">
            <h2 class="text-base xs:text-sm font-medium">Серебряная карта</h2>
            <p class="tracking-wide text-sm xs:text-xs mb-1">Сумма покупок от 100 000 до 499 999  постоянная скидка 5%</p>
        </div>
        <div class="flex flex-col gap-1 mt-1">
            <h2 class="text-base xs:text-sm font-medium">Золотая карта</h2>
            <p class="tracking-wide text-sm xs:text-xs mb-1">Сумма покупок от 500 000 до 999 999 постоянная скидка 7%</p>
        </div>
        <div class="flex flex-col gap-1 mt-1">
            <h2 class="text-base xs:text-sm font-medium">Платиновая карта</h2>
            <p class="tracking-wide text-sm xs:text-xs mb-1">Сумма покупок от 1 000 000 скидка 10%</p>
        </div>

        <h2 class="text-slider font-medium mt-3 flex flex-row items-center">
          Условия программы лояльности:
        </h2>
        <h2 class="text-base xs:text-sm font-medium">Начисление бонусов:</h2>
        <div class="flex flex-row gap-2 items-center">
          <div class="bg-black rounded-full w-2 h-2 my-auto"></div><p class="tracking-wide text-sm xs:text-xs">1000 бонусов за 1 отзыв</p>
        </div>
        <div class="flex flex-row gap-2 items-center">
          <div class="bg-black rounded-full w-2 h-2 my-auto"></div><p class="tracking-wide text-sm xs:text-xs">При 1 заказе от 300.000 рублей начисляем 10%</p>
        </div>
        <div class="flex flex-row gap-2 items-center">
          <div class="bg-black rounded-full w-2 h-2 my-auto"></div><p class="tracking-wide text-sm xs:text-xs">При заказе до 300 000 рублей начисляем 1%</p>
        </div>
        <p class="tracking-wide text-sm xs:text-xs uppercase opacity-50">АКЦИИ, БАЛЛЫ И КАРТА ЛОЯЛЬНОСТИ НЕ СУММИРУЕТСЯ ПРИ СПИСАНИИ С ПРОМОКОДАМИ</p>
        <p class="tracking-wide text-sm xs:text-xs uppercase opacity-50">БАЛЛЫ НЕ НАЧИСЛЯЮТСЯ НА ТОВАРЫ СО СКИДКАМИ.</p>
        <p class="tracking-wide text-sm xs:text-xs uppercase opacity-50">Ограничение по оплате баллам до 25% от стоимости заказа</p>
        
        <h2 class="text-slider font-medium mt-3 flex flex-row items-center">
            История
        </h2>

        <div v-if="isLoading" class="text-center">Загрузка...</div>

        <div
          v-for="operation in history"
          :key="operation.operation_id"
          class="flex flex-col bg-white"
        >
          <div class="flex items-start gap-4">
            <div 
              class="flex flex-col items-center justify-center p-2 my-2 rounded-md text-center w-24 h-24 relative"
              :class="operation.operation_type === 'credit' ? 'bg-yellow-100' : 'bg-green-100'"
            >
              <div class="text-xl font-medium">{{ formatDate(operation.operation_date).day }}</div>
              <div class="text-[10px] uppercase">{{ formatDate(operation.operation_date).month }}</div>
              <div class="text-xs absolute top-2 right-2">{{ formatDate(operation.operation_date).year }}</div>
            </div>

            <div class="flex-1 pt-3">
              <p class="font-medium text-base">
                {{ operation.operation_type === 'credit' ? 'Начисление бонусов' : 'Списание бонусов' }}:
                <span :class="operation.operation_type === 'credit' ? 'text-pink-400' : 'text-pink-400'">
                  {{ operation.operation_type === 'credit' ? '+' : '-' }}{{ operation.operation_amount }} ✨
                </span>
              </p>

              <p v-if="operation.source" class="text-sm font-light mt-1">
                Заказ № {{ operation.source }}
              </p>

              <p class="text-sm font-light">
                {{ operation.operation_type === 'credit' ? 'Сумма' : 'Сумма со скидкой' }}: {{ operation.remaining_balance }} ₽
              </p>
            </div>
          </div>
        </div>  
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useBonusStore } from "@/store/bonusStore";
import { storeToRefs } from "pinia";
import {useRouter} from "vue-router";

const router = useRouter();

const bonusStore = useBonusStore();
const { history, isLoading } = storeToRefs(bonusStore);

onMounted(() => {
  bonusStore.loadBonusHistory();
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return {
    day: date.getDate().toString().padStart(2, "0"),
    month: date.toLocaleString("ru-RU", { month: "long" }).toUpperCase(),
    year: date.getFullYear(),
  };
};

const goToCatalog = () => {
  router.push("/catalog");
};

const goBack = () => {
  router.go(-1);
};
</script>
