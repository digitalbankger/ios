<template>
  <div v-if="isOpen" class="fixed inset-0 z-10 flex items-end justify-center bottom-20">
    <div
      class="bg-white border border-gray-100 shadow-productcardlg w-full max-w-md rounded-t-[30px] p-34 xs:p-3 pt-4 relative"
      @touchstart="startSwipe"
      @touchmove="handleSwipe"
    >
      <div class="flex justify-center cursor-pointer mb-6">
        <div 
            class="w-8 h-1 bg-gray-500 rounded-full"       
        >
        </div>
      </div>

      <h2 class="text-lg xs:text-base font-semibold text-center mb-1">Укажите ваш город</h2>
      <p class="text-sm xs:text-xs text-gray-500 text-center mb-4">
        Чтобы мы могли сообщить вам сроки доставки
      </p>

      <div class="relative mb-3">
        <input
          v-model="searchQuery"
          @input="fetchSuggestions"
          @focus="showSuggestions = true"
          @blur="hideSuggestions"
          placeholder="Например, Москва"
          class="w-full py-2 px-3 border h-order rounded-md text-base"
        />

        <ul
          v-if="showSuggestions && suggestions.length"
          class="absolute bg-white w-full border mt-1 rounded-md shadow z-10"
        >
          <li
            v-for="(suggestion, index) in suggestions"
            :key="index"
            @mousedown="selectSuggestion(suggestion)"
            class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
          >
            {{ suggestion.value }}
          </li>
        </ul>
      </div>

      <Button
        variant="solid"
        class="bg-blue-500 text-white py-2 rounded-md w-full text-base xs:mb-2"
        @click="saveCity"
        :disabled="!city"
      >
        Сохранить
      </Button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits,ref } from "vue";
import axios from "axios";
import { getDistrictByCity } from "@/services/districtService";
import { getDeliveryTimes } from "@/services/deliveryService";
import Button from "@/components/ui/Button.vue";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["save", "close"]);

const city = ref("");
const searchQuery = ref("");
const suggestions = ref([]);
const showSuggestions = ref(false);

const dadataToken = "ac0fc720467713631eff0602ba19a2648c34f21d";

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

const fetchSuggestions = async () => {
  if (searchQuery.value.length < 3) {
    suggestions.value = [];
    return;
  }

  try {
    const requestBody = {
      query: searchQuery.value,
      count: 5,
      from_bound: { value: "city" },
      to_bound: { value: "settlement" },
      locations: [{ country: "Россия" }],
    };

    const response = await axios.post(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + dadataToken,
        },
      }
    );

    suggestions.value = response.data.suggestions;
  } catch (error) {
    console.error("Ошибка получения подсказок DaData:", error);
  }
};

const selectSuggestion = (suggestion) => {
  city.value = suggestion.data.city || suggestion.value;
  searchQuery.value = city.value;
  showSuggestions.value = false;
};

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 150);
};

const saveCity = () => {
  if (city.value) {
    localStorage.setItem("user_city", city.value);

    const district = getDistrictByCity(city.value);
    const deliveryInfo = getDeliveryTimes(district);

    localStorage.setItem("user_district", district);
    localStorage.setItem("user_delivery_info", JSON.stringify(deliveryInfo));

    emit("save", city.value);
  }
};
</script>

<style scoped>
</style>
