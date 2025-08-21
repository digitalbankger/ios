<template>
  <div class="relative">
    <input
      v-model="searchQuery"
      @input="fetchSuggestions"
      @focus="showSuggestions = true"
      @blur="hideSuggestions"
      class="w-full h-order py-2 px-3 rounded-md text-base font-light tracking-wide"
      :placeholder="type === 'city' ? 'Город' : 'Улица'"
      required
    />

    <ul v-if="showSuggestions && suggestions.length" class="absolute w-full bg-white border rounded-md shadow-md mt-1 z-10">
      <li
        v-for="(suggestion, index) in suggestions"
        :key="index"
        @mousedown="selectSuggestion(suggestion)"
        class="p-2 cursor-pointer hover:bg-gray-200 text-light"
      >
        {{ suggestion.value }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import axios from "axios";

const props = defineProps({
  modelValue: String,
  type: { type: String, required: true },
  error: String,
  city: String,
});
const emit = defineEmits(["update:modelValue"]);

const searchQuery = ref(props.modelValue || "");
const suggestions = ref([]);
const showSuggestions = ref(false);

watch(() => props.city, () => {
  if (props.type === "street") searchQuery.value = "";
});

const fetchSuggestions = async () => {
  if (searchQuery.value.length < 3) {
    suggestions.value = [];
    return;
  }

  try {
    const requestBody = {
      query: searchQuery.value,
      count: 5,
      locations: props.type === "street" && props.city ? [{ city: props.city }] : [],
      from_bound: { value: props.type },
      to_bound: { value: props.type },
    };

    const response = await axios.post(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token ac0fc720467713631eff0602ba19a2648c34f21d",
        },
      }
    );

    suggestions.value = response.data.suggestions;
  } catch (error) {
    console.error("Ошибка получения данных DaData:", error);
  }
};

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.value;
  emit("update:modelValue", suggestion.value);
  showSuggestions.value = false;
};

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};
</script>

<style scoped>
input {
    border: 1px solid #11111134;

}
input:focus {
    border-color: #659CFF;
}
input:focus-visible {
    outline: none;
}
</style>










