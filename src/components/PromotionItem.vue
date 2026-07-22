<template>
  <div class="rounded-lg p-4 xs:p-0">
    <img :src="fullImageUrl" :alt="promotionTitle" loading="lazy" class="object-cover rounded-md w-full h-auto" />

    <div class="flex items-start justify-between my-2">
      <div class="flex flex-col gap-2">
        <h3 class="text-lg xs:text-base font-medium">{{ promotionTitle }}</h3>
        <p class="text-sm text-gray-700">{{ promotion.description || "" }}</p>
      </div>
    </div>

    <Button
      v-if="promoType !== 'notice'"
      variant="outline"
      class="mt-3 xs:text-sm"
      :disabled="applied"
      @click="handleApplyPromotion"
    >
      {{ applied ? "Акция применена!" : buttonLabel }}
    </Button>

    <Popup
      :isOpen="showPopup"
      :title="popupTitle"
      :message="popupMessage"
      buttonText="Перейти в корзину"
      :buttonAction="redirectToCart"
      @close="showPopup = false"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { usePromoStore } from "@/store/promotionStore";
import { normalizeMediaUrl } from "@/utils/mediaUrl";
import Button from "@/components/ui/Button.vue";
import Popup from "@/components/ui/PromoModal.vue";

const props = defineProps({
  promotion: { type: Object, required: true },
  applied: { type: Boolean, default: false },
});

const promoStore = usePromoStore();
const router = useRouter();
const showPopup = ref(false);
const popupTitle = ref("");
const popupMessage = ref("");

const promoType = computed(() => props.promotion?.promo_type || props.promotion?.type || "notice");
const promotionTitle = computed(() => props.promotion?.name || props.promotion?.title || "Акция");
const fullImageUrl = computed(() => normalizeMediaUrl(props.promotion?.banner_url || props.promotion?.image));
const buttonLabel = computed(() => ({
  code: "Применить промокод",
  discount: "Перейти к товарам",
  gift: "Получить подарок",
  "2plus1": "Применить 2+1",
}[promoType.value] || "Воспользоваться акцией"));

async function handleApplyPromotion() {
  try {
    const result = await promoStore.applyPromotion(props.promotion);
    if (!result?.success) {
      popupTitle.value = "Акция не применена";
      popupMessage.value = result?.message || "Проверьте условия акции и попробуйте снова.";
    } else {
      popupTitle.value = ["gift", "2plus1"].includes(promoType.value) ? "Подарок добавлен!" : "Акция применена!";
      popupMessage.value = ["gift", "2plus1"].includes(promoType.value)
        ? "Проверьте состав корзины."
        : "Условия акции применены.";
    }
  } catch (error) {
    popupTitle.value = "Акция не применена";
    popupMessage.value = error?.message || "Попробуйте ещё раз.";
  }
  showPopup.value = true;
}

function redirectToCart() {
  router.push("/cart");
}
</script>

<style scoped>
.rounded-lg { background-color: #fff; }
img { height: 160px; }
button[disabled] { opacity: 0.5; pointer-events: none; }
@media (max-width: 325px) { img { height: auto; } }
</style>
