<template>
  <div class="flex flex-col gap-4 p-3 xs:p-2 pb-32 xs:pb-36">
    <div class="relative flex items-center justify-center h-11">
      <Button variant="icon" class="absolute left-0" @click="router.go(-1)">
        <img src="@/assets/icons/back.svg" alt="Назад" />
      </Button>
      <h1 class="text-base font-medium">Акции</h1>
    </div>

    <div v-if="loading" class="flex justify-center items-center mt-10">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
    </div>

    <div v-else-if="promoStore.promotions.length === 0" class="text-center text-gray-600 mt-5">
      <p>😞 Пока нет доступных акций</p>
      <Button variant="outline" @click="reloadPromotions" class="mt-3">Обновить</Button>
    </div>

    <div v-else class="flex flex-col gap-6">
      <PromotionItem
        v-for="promotion in promoStore.promotions"
        :key="promotion.id"
        :promotion="promotion"
        :applied="promoStore.appliedPromotion?.id === promotion.id"
        @apply-promotion="handleApplyPromotion"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { usePromoStore } from "@/store/promotionStore";
import { useCartStore } from "@/store/cartStore";
import PromotionItem from "@/components/PromotionItem.vue";
import Button from "@/components/ui/Button.vue";
import { computed } from "vue";

const router = useRouter();
const promoStore = usePromoStore();
const cartStore = useCartStore();

const loading = ref(true);

onMounted(async () => {
  await promoStore.loadPromotions();
  loading.value = false;
});

async function reloadPromotions() {
  loading.value = true;
  await promoStore.loadPromotions();
  loading.value = false;
}

async function handleApplyPromotion(promoId) {
  const result = await promoStore.applyPromotion(
    promoId,
    cartStore.items,
    cartStore.totalPrice
  );

  if (result?.activate) {
    console.log(`Акция успешно применена! Новая сумма: ${result.new_amount} ₽`);
  } else {
    console.log("Акция не была применена. Попробуйте другую.");
  }
}
</script>

<style scoped>

</style>
