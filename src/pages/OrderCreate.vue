<template>
  <form @submit.prevent="confirmOrder($event)" novalidate class="flex flex-col gap-4 p-3 xs:p-2 pb-32">
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

    <OrderPayment 
      v-model:paymentMethod="orderData.paymentMethod"
      :paymentMethods="paymentMethods"
      :isConfirmed="isConfirmed"
      :editMode="editMode.payment"
      :errors="errors"
      @edit="editSection('payment')"
      @save="saveSection('payment')"
    />

    <OrderComment 
      v-model:comment="orderData.comment" 
      :isConfirmed="isConfirmed" 
      :editMode="editMode.comment"
      @edit="editSection('comment')"
      @save="saveSection('comment')"
    />

   <!-- Чекбоксы согласий -->
<div class="flex flex-col space-y-2 w-full text-left text-xs opacity-70 w-3/4 xs:w-full">
  <label class="flex items-start space-x-2">
    <input
      type="checkbox"
      v-model="agreePersonal"
      class="mt-1 h-4 w-4 accent-white bg-primary border border-primary rounded"
    />
    <span>
      Даю согласие на
      <router-link to="/soglasie" class="text-primary underline">сбор, обработку и хранение персональных данных</router-link>
    </span>
  </label>

  <label class="flex items-start space-x-2">
    <input
      type="checkbox"
      v-model="agreeMarketing"
      class="mt-1 h-4 w-4 accent-white bg-primary border border-primary rounded"
    />
    <span>Даю согласие на <router-link to="/soglasiereklama" class="text-primary underline">получение информационных и рекламных рассылок</router-link></span>
  </label>
</div>

    <OrderActions 
      :isConfirmed="isConfirmed"
      :hasErrors="hasErrors"
      :disabled="!agreePersonal"
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
import { useUserStore } from "@/store/userStore"; // ✅ Подключаем `userStore`
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

const agreePersonal = ref(true);  // Обязательный
const agreeMarketing = ref(true); // Необязательный


const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const userStore = useUserStore();

const promoStore = usePromoStore();

const showMap = ref(false);
const paymentMethods = [
  { id: "sbp", description: "Оплата по СБП", image: new URL("@/assets/img/payment/sbp.png", import.meta.url).href },
  { id: "tbank", description: "Т-банк рассрочка", image: new URL("@/assets/img/payment/tbank.png", import.meta.url).href },
  { id: "dolyame", description: "Оплата Долями", image: new URL("@/assets/img/payment/dolyami.png", import.meta.url).href },
  { id: "bank_card", description: "Оплата картой онлайн", image: new URL("@/assets/img/payment/card.png", import.meta.url).href },
  { id: "cash", description: "Оплата наличными курьеру", image: new URL("@/assets/img/payment/cash.png", import.meta.url).href },
  { id: "courier_card", description: "Оплата картой курьеру", image: new URL("@/assets/img/payment/card-courier.png", import.meta.url).href },
];

const deliveryMethods = [
  "Доставка курьером Daigo",
  "Доставка курьером Major",
  "Доставка СДЭК (ПВЗ)",
  "Доставка Почтой России",
  "Самовывоз"
];

console.log("deliveryMethods в OrderCreate:", deliveryMethods);

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

      // ✅ Обновляем `recipient`, только если данные изменились
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

    const cleanedOrderData = {
      ...orderData.value,
      items: filteredItems,
    };

    const response = await createOrder(cleanedOrderData);

    if (response && response.order_id) {
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
              id: response.order_id
            },
            products: productsForDataLayer
          }
        }
      });

      console.log("[YandexMetrika] dataLayer.push — Покупка:", response.order_id, productsForDataLayer);

      promoStore.clearPromotion();
      cartStore.clearCart();
      router.push("/thank");
    } else if (response.confirmation?.confirmation_url) {
      window.open(response.confirmation.confirmation_url, "_blank");
      setTimeout(() => {
        promoStore.clearPromotion();
        cartStore.clearCart();
        router.push("/thank");
      }, 2000);
    } else {
      promoStore.clearPromotion();
      cartStore.clearCart();
      router.push("/thank");
    }
  } catch (error) {
    alert("Ошибка при оформлении заказа. Попробуйте снова.");
    console.error(error);
  }
};

</script>

