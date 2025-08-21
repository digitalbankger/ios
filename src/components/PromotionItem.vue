<template>
  <div class="rounded-lg p-4 xs:p-0">
    <img :src="fullImageUrl" class="object-cover rounded-md w-full h-auto" />

    <div class="flex items-start justify-between my-2">
      <div class="flex flex-col gap-2">
        <h3 class="text-lg xs:text-base font-medium">{{ promotion.name }}</h3>
        <p class="text-sm text-gray-700">{{ promotion.description }}</p>
      </div>
    </div>

    <Button
      v-if="promotion.type !== 'notice'"
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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { usePromoStore } from "@/store/promotionStore";
import Button from "@/components/ui/Button.vue";
import Popup from "@/components/ui/PromoModal.vue";

const props = defineProps({
  promotion: {
    type: Object,
    required: true,
  },
  applied: {
    type: Boolean,
    default: false,
  },
});

const promoStore = usePromoStore();
const router = useRouter();

const showPopup = ref(false);
const popupTitle = ref("");
const popupMessage = ref("");

const buttonLabel = computed(() => {
  switch (props.promotion.type) {
    case "code":
      return "Применить промокод";
    case "discount":
      return "Воспользоваться скидкой";
    case "gift":
      return "Получить подарок";
    default:
      return "Воспользоваться акцией";
  }
});

const fullImageUrl = computed(() => {
  if (!props.promotion.banner_url) return "";
  return props.promotion.banner_url.startsWith("http")
    ? props.promotion.banner_url
    : `https://api.daigo.ru${props.promotion.banner_url}`;
});

const handleApplyPromotion = async () => {
  const { success } = await promoStore.applyPromotion(props.promotion);

  if (success) {
    popupTitle.value = props.promotion.promo_type === "gift"
      ? "Подарок добавлен!"
      : "Акция применена!";
    popupMessage.value = props.promotion.promo_type === "gift"
      ? "Акция 2+1 успешно применена. Проверьте корзину."
      : `Скидка ${props.promotion.discount || ""} успешно добавлена!`;
  } else {
    popupTitle.value = "Акция не применена!";
    popupMessage.value = "Проверьте условия акции и попробуйте снова.";
  }

  showPopup.value = true;
};

const redirectToCart = () => {
  router.push("/cart");
};
</script>

<style scoped>
.rounded-lg {
  background-color: #fff;
}

img {
  height: 160px;
}

button[disabled] {
  opacity: 0.5;
  pointer-events: none;
}

@media (max-width: 325px) {
  img {
    height: auto;
  }
}
</style>
