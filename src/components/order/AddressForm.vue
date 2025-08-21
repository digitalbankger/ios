<template>
  <div class="flex flex-col gap-3 mt-3">
    <h2 class="text-slider font-medium">Укажите ваш адрес</h2>

    <!-- Поле с автоподстановкой DaData -->
    <AddressAutocomplete v-model="localAddress.street" />

    <div v-if="!localAddress.isPrivateHouse" class="grid grid-cols-2 gap-3">
      <InputElement v-model="localAddress.apartment" class="h-order rounded-md text-base font-light tracking-wide" placeholder="Квартира/офис" />
      <InputElement v-model="localAddress.entrance" class="h-order rounded-md text-base font-light tracking-wide" placeholder="Подъезд" />
      <InputElement v-model="localAddress.floor" class="h-order rounded-md text-base font-light tracking-wide" placeholder="Этаж" />
      <InputElement v-model="localAddress.intercom" class="h-order rounded-md text-base font-light tracking-wide" placeholder="Домофон" />
    </div>

    <div class="flex flex-row items-center justify-between">
      <BaseCheckbox v-model="localAddress.isPrivateHouse" label="Частный дом" />
      <!-- <button 
        @click="saveAddress"
        class="bg-transparent text-primary border-b border-primary text-sm pt-1 w-fit"
      >
        Сохранить этот адрес
      </button>
      <p v-if="addressMessage" class="text-sm text-primary">{{  }}</p> -->
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref } from "vue";
import { useUserStore } from "@/store/userStore";
import AddressAutocomplete from "./AddressAutocomplete.vue";
import InputElement from "@/components/ui/InputElement.vue";
import BaseCheckbox from "@/components/ui/BaseCheckbox.vue";
import Button from "@/components/ui/Button.vue";

const userStore = useUserStore();
const addressMessage = ref("");

const props = defineProps({
  modelValue: Object,
});
const emit = defineEmits(["update:modelValue"]);

const localAddress = reactive({ ...props.modelValue });

watch(
  () => localAddress,
  (newValue) => {
    emit("update:modelValue", newValue);
  },
  { deep: true }
);

// const saveAddress = async () => {
//   if (!localAddress.street) {
//     console.warn("⚠️ Адрес не может быть пустым.");
//     return;
//   }

//   try {
//     await userStore.addAddress(localAddress);
//     console.log("✅ Адрес успешно сохранён:", localAddress);
//     addressMessage = "Адрес сохранён!"
//   } catch (error) {
//     console.error("❌ Ошибка сохранения адреса:", error);
//   }
// };
</script>
