<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-slider font-medium mt-3 flex flex-row items-center">
      Способ оплаты
      <span v-if="isConfirmed && !editMode" class="text-primary border-b border-primary text-sm cursor-pointer ml-auto" @click="$emit('edit')">
        Изменить
      </span>
      <span v-if="isConfirmed && editMode" class="text-primary border-b border-primary text-sm cursor-pointer ml-auto" @click="savePayment">
        Сохранить
      </span>
    </h2>

    <div v-if="editMode || !isConfirmed" class="grid grid-cols-3 gap-4 xs:gap-2">
      <div 
        v-for="(method, index) in paymentMethods" 
        :key="index" 
        class="rounded-md flex items-center justify-center cursor-pointer transition-all border"
        :class="{ 'border-primary': selectedMethod === method.id }"
        @click="onPaymentChange(method.id)"
      >
        <img :src="method.image" class="w-full object-contain" />
      </div>
    </div>

    <div v-else>
      <div class="flex flex-row gap-2 items-center">
        <img src="@/assets/icons/credit.svg" class="w-6" />
        <p class="text-base">
          {{ selectedPaymentMethod.description || "Не выбран" }}
        </p>
      </div>
    </div>

    <hr v-if="isConfirmed" class="border-t border-gray-300 mt-4">
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue';

const props = defineProps({
  paymentMethod: String,
  isConfirmed: Boolean,
  editMode: Boolean
});

const emit = defineEmits(['edit', 'save', 'update:paymentMethod']);

const paymentMethods = ref([
  { id: "tpay_qr", description: "QR СБП от Т-Банка — самый удобный", image: new URL("@/assets/img/payment/sbp.png", import.meta.url).href },
  { id: "tpay_card", description: "Банковской картой через Т-Банк", image: new URL("@/assets/img/payment/card.png", import.meta.url).href },
  { id: "dolyame", description: "Оплата Долями", image: new URL("@/assets/img/payment/dolyami.png", import.meta.url).href },
  { id: "cash", description: "Оплата наличными курьеру", image: new URL("@/assets/img/payment/cash.png", import.meta.url).href },
  { id: "courier_card", description: "Оплата картой курьеру", image: new URL("@/assets/img/payment/card-courier.png", import.meta.url).href }
]);

const selectedMethod = ref(props.paymentMethod || paymentMethods.value[0].id);

const selectedPaymentMethod = computed(() => {
  return paymentMethods.value.find(method => method.id === selectedMethod.value) || {};
});

watch(() => props.paymentMethod, (newValue) => {
  if (newValue) {
    selectedMethod.value = newValue;
  }
});

const onPaymentChange = (value) => {
  selectedMethod.value = value;
  console.log("📌 Новый способ оплаты выбран:", value);
  emit('update:paymentMethod', value);
};


const savePayment = () => {
  emit("update:paymentMethod", selectedMethod.value);
  emit("save");
};
</script>
