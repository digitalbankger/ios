<template>
  <div class="flex flex-col w-full h-full px-3 xs:px-2 py-6">
    <div class="relative flex items-center justify-center h-11">
      <button @click="goBack" class="absolute left-0">
        <img src="@/assets/icons/back.svg" alt="Назад" />
      </button>
      <h1 class="text-base font-medium">История заказов</h1>
    </div>

    <div v-if="orders.length === 0" class="flex flex-col items-center justify-center gap-3 h-96 my-auto">
      <h2 class="text-2xl xs:text-lg font-medium text-center">У вас пока нет заказов</h2>
      <p class="text-sm xs:text-xs text-center w-3/5 mb-3">
        Вы пока ничего не заказали, самое время это исправить
      </p>
      <Button variant="solid" @click="goToCatalog">За покупками</Button>
    </div>

    <div v-else class="flex flex-col gap-4 mt-4 p-3">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white py-4 border-b border-gray-300"
      >
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-xl xs:text-base font-medium">Заказ от {{ formatDate(order.date) }}</h2>
          <span
            :class="[
              'text-xs xs:text-[10px] font-medium px-3 xs:px-2 py-1 rounded-md',
              order.status === 'Получен' ? 'border border-primary text-primary' :
              order.status === 'Отменен' ? 'bg-hoverbtn text-gray-400' :
              'bg-yellow-100 text-yellow-500'
            ]"
          >
            {{ order.status }}
          </span>
        </div>

        <p class="tracking-wide text-sm xs:text-xs">№ {{ order.number }}</p>
        <p class="tracking-wide text-sm xs:text-xs mt-1">Товаров: {{ order.items.length }}</p>

        <div class="flex items-center gap-2 mt-3 overflow-x-auto">
          <div v-for="item in order.items" :key="item.id" class="relative">
            <img :src="item.image" :alt="item.name" class="w-14 h-14 object-cover bg-productbg rounded-sm" />
            <span v-if="item.quantity > 1" class="absolute bottom-0 right-0 text-xs bg-gray-700 text-white rounded-full px-2">
              {{ item.quantity }} шт
            </span>
          </div>
        </div>

        <p class="mt-3 font-medium text-sm xs:text-xs">Сумма: {{ formatPrice(order.total) }} ₽</p>

        <p v-if="order.bonus" class="mt-2 text-[#FF64E7] text-sm xs:text-xs">Бонусов начислено: {{ order.bonus }}</p>

        <Button
          v-if="order.status !== 'received' && order.status !== 'paid'"
          variant="outline"
          class="mt-2 xs:px-2 xs:py-1 xs:h-10 xs:text-sm !border-gray-300 !text-gray-400 hover:!bg-hoverbtn hover:!text-gray-400"
          @click="cancel(order.number)"
        >
          Отменить заказ
        </Button>

        <Button
          v-if="order.confirmationUrl && order.confirmationUrl !== 'null' && order.status !== 'received' && order.status !== 'paid'"
          variant="solid"
          class="mt-2 xs:px-2 xs:py-1 xs:h-10 xs:text-sm"
          @click="payOrder(order.confirmationUrl)"
        >
          Оплатить заказ
        </Button>

        <Button
          variant="outline"
          @click="repeatOrder(order.id)"
          class="mt-3 xs:px-2 xs:py-1 xs:h-10 xs:text-sm"
        >
          Повторить заказ
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import Button from "@/components/ui/Button.vue";

import { useOrderStore } from "@/store/orderStore";
import { useCartStore } from "@/store/cartStore";
import { useProductStore } from "@/store/productStore";

const router = useRouter();
const orderStore = useOrderStore();
const cartStore = useCartStore();
const productStore = useProductStore();

const { orders } = storeToRefs(orderStore);

onMounted(() => {
  orderStore.loadOrderHistory();
  productStore.fetchProducts();
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU").format(price);
};

const goToCatalog = () => {
  router.push("/catalog");
};

const goBack = () => {
  router.go(-1);
};

const repeatOrder = (orderId) => {
  const order = orders.value.find(o => o.id === orderId);
  if (!order) return;

  order.items.forEach(item => {
    const product = productStore.products.find(p => p.product_id === item.id);
    if (product) {
      cartStore.addToCart(product);
    }
  });

  router.push('/cart');
};

const payOrder = (url) => {
  if (window.cordova && window.cordova.InAppBrowser) {
    window.cordova.InAppBrowser.open(url, "_system");
  } else {
    window.open(url, "_blank");
  }
};

const cancel = async (orderId) => {
  if (!confirm("Вы уверены, что хотите отменить заказ?")) return;

  try {
    await orderStore.cancelOrder(orderId);
    alert("Заказ отменён");
    await orderStore.loadOrderHistory();
  } catch (e) {
    alert(e?.message || "Не удалось отменить заказ");
  }
};

</script>
