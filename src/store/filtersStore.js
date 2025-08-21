import { defineStore } from "pinia";

export const useFiltersStore = defineStore("filtersStore", {
  state: () => ({
    isFilterOpen: false,
    filters: {
      newest: false,
      popular: false,
      priceDesc: false,
      priceAsc: false,
    },
  }),

  actions: {
    toggleFilter() {
      this.isFilterOpen = !this.isFilterOpen;
    },
    setFilter(filterKey) {
      Object.keys(this.filters).forEach((key) => {
        this.filters[key] = key === filterKey ? !this.filters[key] : false;
      });
    },
  },
});
