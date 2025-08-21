<template>
  <div v-if="relatedProducts.length" class="related-products w-full">
    <h3 class="text-xl font-medium mb-5">С этим товаром покупают</h3>


    <div class="product-list">
      <div
        v-for="product in relatedProducts"
        :key="product.id"
        class="product-card"
      >
        <ProductCard :product="product" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
import { useProductStore } from "@/store/productStore";
import ProductCard from "@/components/ProductCard.vue";

const props = defineProps({
  currentProductId: {
    type: Number,
    required: true,
  },
});

const productStore = useProductStore();

const relatedProducts = computed(() => {
  return productStore.products
    .filter((p) => p.id !== props.currentProductId)
    .filter((p) => p.product_id !== "ca16b1e3-f6bd-4845-9079-7c66ba9d1a26")
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .slice(0, 6);
});

</script>

<style scoped>
.related-products {
  margin-top: 16px;
  overflow: hidden; 
}

.product-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 10px;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db00 transparent;
}

.product-list::-webkit-scrollbar {
  height: 0px;
}

.product-list::-webkit-scrollbar-thumb {
  background-color: #d1d5db00;
  border-radius: 5px;
}

.product-list::-webkit-scrollbar-track {
  background: transparent;
}

.product-card {
  flex: 0 0 auto;
  width: 160px;
  scroll-snap-align: start;
}
</style>
