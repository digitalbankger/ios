<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-slider font-medium mt-3 flex flex-row items-center">
      Способ доставки
      <span v-if="isConfirmed & !editMode" class="text-primary border-b border-primary text-sm cursor-pointer ml-auto" @click="$emit('edit')">
        Изменить
      </span>
      <span v-if="isConfirmed & editMode" class="text-primary border-b border-primary text-sm cursor-pointer ml-auto" @click="saveDelivery">
        Сохранить
      </span>
    </h2>

    <div v-if="editMode || !isConfirmed" class="flex flex-col gap-2">
      <div 
        v-for="(method, index) in deliveryMethods" 
        :key="index" 
        class="flex items-center gap-2 mt-2 cursor-pointer"
        @click="onDeliveryChange(method)"
      >
        <div 
          class="relative w-6 h-6 xs:w-5 xs:h-5 border border-black rounded-sm flex items-center justify-center transition-all duration-300"
          :class="{ 'bg-transparent': selectedMethod !== method }"
        >
          <svg 
            v-if="selectedMethod === method" 
            class="w-4 h-4 xs:w-3 xs:h-3 stroke-black" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            stroke-width="3" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <label class="text-base xs:text-sm font-normal cursor-pointer select-none">
          {{ method }}
        </label>

        <input 
          type="radio" 
          :value="method" 
          :checked="selectedMethod === method" 
          class="hidden" 
          @change="onDeliveryChange(method)"
        />
      </div>

      <AddressForm 
        v-if="selectedMethod !== 'Самовывоз'" 
        v-model="localAddress"
      />

      <div v-if="selectedMethod === 'Самовывоз'" class="mt-1">
        <p class="text-base" @click="copyPickupAddress">
          Адрес для самовывоза: г. Москва, Большой Сухаревский переулок, дом. 21, стр. 2
        </p>
        <Button variant="outline" class="mt-4 h-50" data-skip-validation="true" @click="showMap = true">Посмотреть на карте</Button>
      </div>
    </div>

    <div v-else class="flex flex-col gap-3 mt-2">
      <div class="flex flex-row gap-2 items-center">
        <img src="@/assets/icons/courier.svg" class="w-6" />
        <p class="text-base">{{ selectedMethod }}</p>
      </div>
      <p class="text-base">{{ localAddress.street }}</p>
    </div>

    <hr v-if="isConfirmed" class="border-t border-gray-300 mt-4">

  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, computed } from "vue";
import AddressForm from "./AddressForm.vue";
import Button from "@/components/ui/Button.vue";

const props = defineProps({
  deliveryMethod: String,
  deliveryMethods: Array,
  address: Object,
  isConfirmed: Boolean,
  editMode: Boolean
});
console.log("Полученные способы доставки:", props.deliveryMethods);

const emit = defineEmits([
  "edit",
  "save",
  "update:deliveryMethod",
  "update:address"
]);

const deliveryMethods = [
  "Доставка курьером Daigo",
  "Доставка курьером Major",
  "Доставка СДЭК (ПВЗ)",
  "Доставка Почтой России",
  "Самовывоз"
];

// ✅ Привязываем `selectedMethod` к `props.deliveryMethod`, чтобы он был реактивным
const selectedMethod = ref(props.deliveryMethod || deliveryMethods[0]);
const localAddress = ref({ ...props.address });

const onDeliveryChange = (value) => {
  selectedMethod.value = value;
};

// ✅ Следим за `selectedMethod` и обновляем `deliveryMethod`
watch(selectedMethod, (newVal) => {
  emit("update:deliveryMethod", newVal);
}, { immediate: true }); // ✅ Немедленный запуск при монтировании

// ✅ Следим за `props.deliveryMethod` и обновляем `selectedMethod`
watch(() => props.deliveryMethod, (newVal) => {
  if (newVal !== selectedMethod.value) {
    selectedMethod.value = newVal;
  }
});

watch(localAddress, (newVal) => {
  emit("update:address", newVal);
}, { deep: true });

const saveDelivery = () => {
  emit("save");
};

const copyPickupAddress = () => {
  navigator.clipboard.writeText("г. Москва, Большой Сухаревский переулок, дом. 21, стр. 2").then(() => {
    alert("Адрес скопирован!");
  });
};
</script>
