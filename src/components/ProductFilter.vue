<template>
    <BasePopup :isOpen="filtersStore.isFilterOpen" @close="filtersStore.toggleFilter">
      <div class="flex flex-col gap-2 py-4">
        <label v-for="(value, key) in filtersStore.filters" :key="key" class="flex items-center justify-between cursor-pointer">
          <span class="ml-2 text-sm font-normal">{{ getFilterLabel(key) }}</span>
  
          <input type="checkbox" :checked="value" @change="toggleFilter(key)" class="hidden peer">
          
          <div class="w-5 h-5 border border-black peer-checked:bg-transparent flex items-center justify-center transition">
            <svg v-if="filtersStore.filters[key]" class="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </label>
      </div>
  
      <button @click="filtersStore.toggleFilter" class="mt-4 w-full bg-primary text-white py-2 rounded-md">
        Применить
      </button>
    </BasePopup>
  </template>
  
  <script setup>
  import { useFiltersStore } from "@/store/filtersStore";
  import BasePopup from "@/components/ui/BasePopup.vue";
  
  const filtersStore = useFiltersStore();
  
  const toggleFilter = (key) => {
    filtersStore.setFilter(key);
  };
  
  const getFilterLabel = (key) => {
    const labels = {
      newest: "Сначала новые продукты",
      popular: "По популярности",
      priceDesc: "По убыванию цены",
      priceAsc: "По возрастанию цены",
    };
    return labels[key];
  };
  </script>
  