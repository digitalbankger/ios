<template>
  <form @submit.prevent="confirmOrder($event)" novalidate class="flex flex-col gap-4 p-3 pb-32">
    <OrderHeader @goBack="goBack" />

    <OrderSummary 
      :cartStore="cartStore" 
      :finalTotal="cartStore.finalTotalPrice"
      :bonusesUsed="orderData.bonuses_discount"
      @update:bonusesUsed="updateBonusesUsed"
    />
    
    <OrderRecipient 
      v-model:recipient="orderData.recipient"
      v-model:otherRecipient="orderData.otherRecipient"
      v-model:otherRecipientName="orderData.otherRecipientName"
      v-model:otherRecipientPhone="orderData.otherRecipientPhone"
      :isConfirmed="isConfirmed"
      :editMode="editMode.recipient"
      :errors="errors"
      @edit="editSection('recipient')"
      @save="saveSection('recipient')" 
    />

    <OrderDelivery 
      :deliveryMethods="deliveryMethods"
      v-model:deliveryMethod="orderData.deliveryMethod"
      v-model:address="orderData.address"
      :isConfirmed="isConfirmed"
      :editMode="editMode.delivery"
      :showMap="showMap"
      @edit="editSection('delivery')"
      @save="saveSection('delivery')" 
      @toggleMap="showMap = !showMap"
      @copyPickupAddress="copyPickupAddress"
    />

    <OrderComment 
      v-model:comment="orderData.comment" 
      :isConfirmed="isConfirmed" 
      :editMode="editMode.comment"
      @edit="editSection('comment')"
      @save="saveSection('comment')" 
    />

    <div class="flex flex-row items-center gap-3 mb-4 px-2.5 py-3.5 w-full rounded-lg bg-black">
      <div class="flex flex-row items-center gap-1 py-2 px-2 bg-white rounded">
        <img src="@/assets/icons/dolyami-transparent.svg" width="12"/>
        <img src="@/assets/icons/dolyami-text.svg" width="50"/>
      </div>
      <p class="text-base text-white font-light">
        4 платежа по {{ formatPrice(finalTotal / 4) }}
      </p>
    </div>

    <OrderActions 
      :isConfirmed="isConfirmed"
      :hasErrors="hasErrors"
      @confirmOrder="confirmOrder"
      @submitOrder="submitOrder"
    />
  </form>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { createOrder } from "@/services/orderService";
import { fetchUser } from "@/services/userService";
import { usePromoStore } from "@/store/promotionStore";


import OrderHeader from "@/components/order/OrderHeader.vue";
import OrderSummary from "@/components/order/OrderSummary.vue";
import OrderRecipient from "@/components/order/OrderRecipient.vue";
import OrderDelivery from "@/components/order/OrderDelivery.vue";
import OrderPayment from "@/components/order/OrderPayment.vue";
import OrderComment from "@/components/order/OrderComment.vue";
import OrderActions from "@/components/order/OrderActions.vue";

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const userStore = useUserStore();

const promoStore = usePromoStore();

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', { 
    style: 'currency', 
    currency: 'RUB', 
    maximumFractionDigits: 0 
  }).format(Math.round(price));
};

const showMap = ref(false);
const paymentMethods = [
  { id: "dolyame", description: "Оплата Долями", image: new URL("@/assets/img/payment/dolyami.png", import.meta.url).href },
];

const deliveryMethods = [
  "Доставка курьером Daigo",
  "Доставка курьером Major",
  "Доставка СДЭК (ПВЗ)",
  "Доставка Почтой России",
  "Самовывоз"
];


const finalTotal = computed(() => {
  return Math.max(cartStore.finalTotalPrice - orderData.value.bonuses_discount, 0);
});

const orderData = ref({
  daigo_id: null,
  recipient: { name: "", phone: "", email: "", city: "" },
  otherRecipient: false,
  otherRecipientName: "",
  otherRecipientPhone: "",
  deliveryMethod: "Доставка курьером Daigo",
  address: { street: "", apartment: "", entrance: "", floor: "", intercom: "" },
  paymentMethod: paymentMethods[0].id,
  comment: "",
  items: cartStore.items,
  price: finalTotal,
  currency: "RUB",
  promotion_id: 0,
  loyalty_card: "",
  coupon_code: "",
  bonuses_discount: 0 
});

const isConfirmed = ref(false);
const editMode = ref({ recipient: false, delivery: false, payment: false, comment: false });

const editSection = (section) => { editMode.value[section] = true; };
const saveSection = (section) => { editMode.value[section] = false; };

const showBonusInput = ref(false);
const bonusesUsed = ref(0);

const errors = ref({
  name: '',
  phone: '',
  email: '',
  city: '',
  otherRecipientName: '',
  otherRecipientPhone: ''
});

const hasErrors = computed(() => Object.values(errors.value).some(error => error !== ''));

const fetchUserData = async () => {
  console.log("🔄 [fetchUserData] Запрос данных пользователя...");

  if (!authStore.user?.id) {
    console.warn("❌ [fetchUserData] Нет ID пользователя, пропускаем загрузку.");
    return;
  }

  try {
    await userStore.loadProfile();
    const userData = userStore.profile;

    console.log("📌 [fetchUserData] Полученные данные пользователя:", userData);

    if (userData) {
      orderData.value.daigo_id = userData.id;
      console.log("✅ [fetchUserData] Установлен `daigo_id`:", userData.id);

      const newRecipient = {
        name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "",
        phone: userData.phone_number || "",
        email: userData.email || "",
        // city: userData.city || ""
      };

      if (JSON.stringify(orderData.value.recipient) !== JSON.stringify(newRecipient)) {
        orderData.value.recipient = newRecipient;
        console.log("📌 [fetchUserData] Обновлен `recipient`:", orderData.value.recipient);
      } else {
        console.log("⚠️ [fetchUserData] `recipient` не изменился, обновление пропущено.");
      }
    } else {
      console.warn("⚠️ [fetchUserData] Данные пользователя не найдены.");
    }
  } catch (error) {
    console.error("❌ [fetchUserData] Ошибка загрузки данных пользователя:", error);
  }
};

const updateBonusesUsed = (bonuses) => {
  orderData.value.bonuses_discount = bonuses;
  console.log("✅ [OrderCreate] Применены бонусы:", bonuses);
};

onMounted(fetchUserData);

const confirmOrder = (event) => {
  const button = event.submitter;
  if (button && button.dataset.skipValidation === "true") return;

  const form = event.target;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  isConfirmed.value = true;
};

const submitOrder = async () => {
  try {
    console.log("📌 Данные перед отправкой заказа:");
    console.log(JSON.stringify(orderData.value, null, 2));

    const filteredItems = orderData.value.items
      .filter(item => item.product_id && item.product_id.trim() !== "" && !item.isGift)
      .map(item => ({
        product_id: item.product_id,
        name: item.name || "",
        quantity: item.quantity || 1,
        price: item.price,
        amo_id: item.amo_id || null
      }));

    if (filteredItems.length === 0) {
      alert("Ошибка: в заказе нет товаров для покупки.");
      return;
    }

    orderData.value.promotion_id = promoStore.appliedPromotion ? Number(promoStore.appliedPromotion.id) : 0;

    orderData.value.loyalty_card = userStore.profile ? userStore.profile.loyalty_status : "";

    orderData.value.coupon_code = promoStore.appliedPromotion?.promo_type === "code" ? promoStore.appliedPromotion.coupon : "";

    console.log("📌 Обновленные данные заказа:", JSON.stringify(orderData.value, null, 2));

    const cleanedOrderData = {
      ...orderData.value,
      items: filteredItems,
    };

    console.log("📌 Отправка заказа...");
    const response = await createOrder(cleanedOrderData);

    if (response.confirmation?.confirmation_url) {
      const productsForDataLayer = filteredItems.map(item => ({
        id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        ecommerce: {
          currencyCode: "RUB",
          purchase: {
            actionField: {
              id: response.order_id || `ORDER-${Date.now()}`
            },
            products: productsForDataLayer
          }
        }
      });
      window.open(response.confirmation.confirmation_url, "_blank");
      setTimeout(() => {
        promoStore.clearPromotion();
        cartStore.clearCart();
        router.push("/thank");
      }, 2000);
    } else {

      const productsForDataLayer = filteredItems.map(item => ({
        id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        ecommerce: {
          currencyCode: "RUB",
          purchase: {
            actionField: {
              id: response.order_id || `ORDER-${Date.now()}`
            },
            products: productsForDataLayer
          }
        }
      });
      promoStore.clearPromotion();
      cartStore.clearCart();
      router.push("/thank");
    }
  } catch (error) {
    alert("Ошибка при оформлении заказа. Попробуйте снова.");
  }
};

</script>
