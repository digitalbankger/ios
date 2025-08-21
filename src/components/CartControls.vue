<template>
  <div class="flex fixed w-full py-4 rounded-t-xl left-0 bottom-0 bg-white h-[170px] z-10">
    <div
      v-if="cartItem"
      class="bg-primary text-white px-4 py-1 h-12 mx-auto !w-[93%] text-base rounded-md flex items-center justify-center gap-6"
    >
      <button class="p-1 py-2" @click="decreaseQuantity">
        <img src="@/assets/icons/minus.svg" width="16" />
      </button>
      <span class="text-base font-normal tracking-wide">{{ cartItem.quantity }} шт</span>
      <button class="p-1" @click="increaseQuantity">
        <img src="@/assets/icons/plus.svg" width="16" />
      </button>
    </div>

    <Button v-else variant="solid" class="mb-auto mx-auto !w-[93%]" @click="addToCart">
      В корзину
    </Button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/Button.vue";

const props = defineProps({ product: Object });
const cartStore = useCartStore();

// Обновлено под product_id
const cartItem = computed(() =>
  cartStore.items.find(item => item.product_id === props.product.product_id)
);

const increaseQuantity = () => {
  if (cartItem.value) {
    cartStore.updateQuantity(cartItem.value.product_id, cartItem.value.quantity + 1);
  }
};

const decreaseQuantity = () => {
  if (cartItem.value) {
    if (cartItem.value.quantity > 1) {
      cartStore.updateQuantity(cartItem.value.product_id, cartItem.value.quantity - 1);
    } else {
      cartStore.removeFromCart(cartItem.value.product_id);
    }
  }
};

const addToCart = () => {
  cartStore.addToCart({ ...props.product, quantity: 1 });
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    ecommerce: {
      currencyCode: "RUB",
      add: {
        products: [
          {
            id: props.product.product_id,
            name: props.product.name,
            price: props.product.price,
            quantity: 1,
          }
        ]
      }
    }
  });
};
</script>