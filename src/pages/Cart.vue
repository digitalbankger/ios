<template>
  <div class="flex flex-col gap-4 mx-auto p-3 pb-32">
    <div class="relative h-11 flex flex-col items-center justify-center w-full">
      <img src="@/assets/icons/back.svg" class="absolute left-3 cursor-pointer" @click="goBack" />
      <h1 class="text-base font-medium">Корзина</h1>
    </div>

    <h2 v-if="cartStore.items.length" class="w-full text-slider font-medium">
      Товары в корзине
      <span class="ms-2 font-normal text-sm">
        {{ cartStore.items.length }} товара
      </span>
    </h2>

    <div v-else class="flex flex-col items-center">
      <h2 class="w-full text-center text-slider font-medium">Ваша корзина пуста</h2>
      <span class="w-2/3 text-center font-normal text-sm mt-2 mb-6">
        Вы пока не добавили <br />ни одного товара в корзину
      </span>
      <Button variant="solid" @click="goCatalog">За покупками</Button>
    </div>

    <div v-if="cartStore.items.length" class="flex flex-col gap-3">
      <div
        v-for="item in cartStore.items"
        :key="item.product_id + '-' + item.isGift"
        class="flex justify-between items-center py-2 pb-2"
      >
        <div class="flex flex-row gap-4 items-center">
          <img
            :src="getFullImageUrl(item.images?.[0]?.image_url)"
            :alt="item.name || item.title"
            class="w-24 xs:w-20 h-auto bg-productbg object-cover rounded-md"
          />
          <div class="flex flex-col h-24 xs:h-26 gap-1 xs:py-1">
            <div class="flex flex-row justify-between">
              <h2 :class="item.isGift ? 'text-primary font-normal' : 'font-medium'" class="text-base xs:text-sm">
                {{ item.name || item.title }}
              </h2>            
            </div>
            <div class="flex items-center gap-2">
              <p
                v-if="!item.isGift && isOutletProduct(item)"
                class="text-gray-400 line-through text-sm xs:text-xs"
              >
                {{ formatPrice(item.price * 2) }} ₽
              </p>
              <p v-if="!item.isGift" class="text-black text-sm xs:text-xs font-normal">
                {{ formatPrice(item.price) }} ₽
              </p>
            </div>
            <div class="flex items-center gap-4 xs:gap-3 mt-auto mb-1">
              <button
                v-if="!item.isGift"
                class="pe-2 text-black"
                @click="decreaseQuantity(item)"
              >
                <img src="@/assets/icons/minus-dark.svg" />
              </button>
              <span class="text-base">{{ item.quantity }}</span>
              <button
                v-if="!item.isGift"
                class="px-2 text-black"
                @click="increaseQuantity(item)"
              >
                <img src="@/assets/icons/plus-dark.svg" />
              </button>
            </div>
          </div>
        </div>
        <button v-if="!item.isGift" @click="removeFromCart(item.product_id)" class="mt-auto mb-1">
          <img src="@/assets/icons/trash.svg" class="w-5 h-5 xs:w-4 xs:h-4" />
        </button>
      </div>

      <!-- <div class="flex flex-row gap-3 items-center">
        <img src="/img/sashe.png" class="w-24 h-24 xs:w-20 xs:h-20 object-cover rounded-md" />
        <div class="flex flex-col gap-1">
          <h2 class="text-lg xs:text-base">Подарок</h2>
          <p class="text-gray-600 text-sm xs:text-xs">10 саше Дайго 5 мл</p>
        </div>
      </div>
      <div class="flex flex-row gap-3 items-center">
        <img src="/img/patchi.png" class="w-24 h-24 xs:w-20 xs:h-20 object-cover rounded-md" />
        <div class="flex flex-col gap-1">
          <h2 class="text-lg xs:text-base">Подарок</h2>
          <p class="text-gray-600 text-sm xs:text-xs">Пептидные гидрогелевые патчи</p>
        </div>
      </div> -->

      <div class="rounded-md flex flex-col gap-3 mt-2">
        <p class="text-slider font-medium">Сумма заказа</p>
        <div class="flex justify-between">
          <p class="text-base xs:text-xs">Стоимость продуктов</p>
          <p class="text-base xs:text-xs">{{ cartStore.totalPrice }} ₽</p>
        </div>
        <div class="flex justify-between">
          <p class="text-base xs:text-xs">Скидка по карте</p>
          <p class="text-base xs:text-xs text-cpink font-medium">
            {{ cartStore.loyaltyDiscount }}%
          </p>
        </div>
        <div class="flex justify-between">
          <p class="text-base xs:text-xs">Доставка</p>
          <p class="text-base xs:text-xs">Бесплатно</p>
        </div>
        <div v-if="cartStore.actionDiscount > 0" class="flex justify-between text-base xs:text-xs text-cpink">
          <p>Акция</p>
          <p>-{{ cartStore.actionDiscount }}%</p>
        </div>
        <div v-if="cartStore.appliedPromoDiscount > 0" class="flex justify-between text-base xs:text-xs text-cpink">
          <p>Скидка</p>
          <p>-{{ cartStore.appliedPromoDiscount }} ₽</p>
        </div>
        <div class="flex justify-between text-base mt-2">
          <p>Итого</p>
          <p class="flex flex-row gap-3 items-center">
            <span v-if="cartStore.oldTotalPrice" class="text-gray-400 line-through text-sm">
              {{ cartStore.oldTotalPrice }} ₽
            </span>
            <span class="font-medium">{{ cartStore.finalTotalPrice }} ₽</span>
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-3 mt-4 mb-3">
        <p class="text-slider font-medium">Промокод на скидку</p>
        <button 
          v-if="promoStore.appliedPromotion && promoStore.appliedPromotion.promo_type === 'code'"
          class="border bg-transparent px-3 py-2 h-[50px] w-full text-sm rounded-md transition-all text-cpink border-cpink"
        >
          "{{ promoStore.appliedPromotion.coupon }}" применен!
        </button>
        <div v-else class="flex flex-col gap-4"> 
          <input
            v-model="promoCode" 
            placeholder="Введите промокод"
            class="w-full py-2 px-3 xs:px-2 xs:py-1 h-order bg-transparent outline-none border !border-cpink rounded-md text-cpink placeholder-cpink"
            @keyup.enter="applyPromo"
          />
          <div v-if="errorMessagesPromo" class="text-red-500 text-sm">
            {{ errorMessagesPromo }}
          </div>
          <button 
            @click="applyPromo" 
            class="flex flex-row items-center justify-center gap-2 border bg-transparent px-4 xs:px-3 py-2 h-order w-full text-base xs:text-sm rounded-md transition-all text-cpink border-cpink hover:bg-cpink hover:text-white"
          >
            <img src="@/assets/icons/skidka.svg" />
            Применить промокод
          </button>
        </div>
      </div>
      <Button variant="solid" class="h-order" @click="checkout">Оформить заказ</Button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCartStore } from "@/store/cartStore";
import { usePromoStore } from "@/store/promotionStore";
import { useRouter } from "vue-router";
import Button from "@/components/ui/Button.vue";

const router = useRouter();
const cartStore = useCartStore();
const promoStore = usePromoStore();
const promoCode = ref("");
const errorMessagesPromo = ref("");

const isOutletProduct = (item) => {
  return item.description?.toLowerCase().includes("outlet");
};

const getFullImageUrl = (imgPath) => {
  if (!imgPath) return '';
  return imgPath.startsWith("http") ? imgPath : `https://api.daigo.ru${imgPath}`;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU").format(price);
};

const increaseQuantity = (item) => {
  if (!item.isGift) {
    cartStore.updateQuantity(item.product_id, item.quantity + 1);
    if (promoStore.isGiftPromotionActive()) {
      promoStore.applyGift21Logic();
    }
  }
};

const decreaseQuantity = (item) => {
  if (!item.isGift) {
    if (item.quantity > 1) {
      cartStore.updateQuantity(item.product_id, item.quantity - 1);
    } else {
      cartStore.removeFromCart(item.product_id);
    }

    if (promoStore.isGiftPromotionActive()) {
      promoStore.applyGift21Logic();
    }
  }
};

const removeFromCart = (productId) => {
  cartStore.removeFromCart(productId);
  if (promoStore.isGiftPromotionActive()) {
    promoStore.applyGift21Logic();
  }
};

const applyPromo = async () => {
  if (cartStore.actionDiscount > 0) {
    errorMessagesPromo.value = "Уже применена скидка по акции. Промокод нельзя применить!";
    setTimeout(() => { errorMessagesPromo.value = ""; }, 3000);
    return;
  }
  if (promoStore.appliedPromotion?.promo_type === "code") {
    errorMessagesPromo.value = "Промокод уже применен!";
    setTimeout(() => { errorMessagesPromo.value = ""; }, 3000);
    return;
  }

  const promo = promoStore.findPromotionByCoupon(promoCode.value);
  if (promo) {
    const response = await promoStore.applyPromotion(promo);
    if (response.success) {
      errorMessagesPromo.value = `Промокод "${promo.coupon}" применен! Скидка ${promo.discount}`;
    } else {
      errorMessagesPromo.value = "Не удалось применить промокод!";
    }
  } else {
    errorMessagesPromo.value = "Промокод не найден!";
  }
  setTimeout(() => { errorMessagesPromo.value = ""; }, 3000);
};

const checkout = () => router.push({ path: "/order-create" });
const goBack = () => router.push({ path: "/" });
const goCatalog = () => router.push({ path: "/catalog" });

onMounted(() => {
  cartStore.applyLoyaltyDiscount();
  promoStore.loadPromotions();

  if (promoStore.isGiftPromotionActive()) {
    promoStore.applyGift21Logic();
  }
});
</script>

