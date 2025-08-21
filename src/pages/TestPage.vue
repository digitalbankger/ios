<template>
  <div class="ui cards" style="margin: 10px">
    <div class="ui icon input" style="width: 100%">
      <input type="text" placeholder="Search..." v-model="searchQuery" />
      <i class="search icon"></i>
    </div>
    <div
      class="card ui fluid"
      v-for="product in searchedProducts"
      :key="product.id"
      style="margin: 0"
    >
      <div class="content">
        <img class="right floated mini ui image" :src="product.imageURL" />

        <div class="header">{{ product.title }}</div>
        <div class="meta">
          {{ product.upc }} | {{ product.weight }} Kg |
          {{ product.itemsperpack }} pack
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, reactive, ref } from "vue";
import { useProductStore } from "@/store/productStore";

export default {
  setup() {
    const productStore = useProductStore();
    const products = reactive([]);
    const searchQuery = ref("");
    const searchedProducts = computed(() => {
      return products.filter((product) => {
        return (
          product.title
            .toLowerCase()
            .indexOf(searchQuery.value.toLowerCase()) != -1
        );
      });
    });
    
    onMounted(() => {
    if (!productStore.products.length) {
        productStore.fetchProducts();
    }

    pageTitle.value = route.query.category || "Товары";
    });
    onMounted(async () => {
      try {
        const productsSnap = await firebase
          .firestore()
          .collection("products")
          .get();
        productsSnap.forEach((doc) => {
          let product = doc.data();
          product.id = doc.id;
          products.push(product);
        });
      } catch (e) {
        console.log("Error Loading Products");
      }
    });
    return { searchedProducts, searchQuery };
  },
};
</script>