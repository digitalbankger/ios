<template>
  <div class="flex flex-col min-h-screen">
    <main class="flex-grow">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in" appear>
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </main>
    <AppNavigation />
  </div>
</template>

<script setup>
import AppNavigation from "@/components/AppNavigation.vue";
import { onMounted } from "vue";
import { useUserStore } from "@/store/userStore";
import { useProductStore } from "@/store/productStore";

const userStore = useUserStore();
const productStore = useProductStore();

onMounted(() => {
  userStore.loadProfile();
  productStore.fetchProducts();
});

</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>