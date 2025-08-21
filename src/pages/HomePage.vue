<template>
  <div class="flex flex-col items-center justify-center gap-3 h-full p-3 pb-32">
    <div class="w-full flex flex-row items-center justify-between">
      <div>
        <p class="text-xs text-black opacity-40">Добро пожаловать,</p>
        <p class="text-base text-black font-medium">{{ userName }}!</p>
      </div>
      <Button variant="graybtn" class="w-[52px] h-[52px]"><img src="@/assets/icons/notifications.svg" @click="goNotify"/></Button>
    </div>

    <SearchInput v-model="query" @search="handleSearch" class="my-2"/>
    
    <div class="flex flex-row justify-between w-full">
      <h3 class="text-black font-medium tracking-wide text-slider w-full my-1">Акции</h3>
      <router-link to="/deals" class="flex flex-row gap-2 items-center relative">
        <span class="text-lg xs:text-base leading-6 font-normal text-primary">Все</span>
        <img src="@/assets/icons/next-primary.svg" class="w-[5px] me-3 mt-1" @click="goBack"/>
      </router-link>
    </div>

    <PromoSlider :promos="promotions" />

    <h3 class="text-black font-medium tracking-wide text-slider w-full my-1">Категории товаров</h3>
    <div class="grid gap-4 w-full">
    <CategoryCard 
        v-for="(category, index) in categories" 
        :key="index"
        :title="category.title"
        :image="category.image"
        :route="category.route"
      />
    </div>
  </div>
</template>

<script setup>
//const Button = defineAsyncComponent(() => import('@/components/Button.vue'));
  import Button from '@/components/ui/Button.vue';
  import PromoSlider from '@/components/main/PromoSlider.vue';
  import SearchInput from '@/components/main/SearchInput.vue';
  import CategoryCard from "@/components/main/CategoryCard.vue";
  import { useUserStore } from '@/store/userStore';

  import { ref, computed } from 'vue';

  //import outletSlider from '@/assets/img/main/slider/Card1.png';
  import twoSlider from '@/assets/img/main/slider/Card7.jpg';
  import threeSlider from '@/assets/img/main/slider/Card4.png';
  import fourSlider from '@/assets/img/main/slider/Card5.png';
  //import fiveSlider from '@/assets/img/main/slider/Card6.png';

  import allProduct from '@/assets/img/main/allproduct.webp';
  import imgBrain from '@/assets/img/main/brain.webp';
  import imgBakteria from '@/assets/img/main/kish.png';
  import imgHear from '@/assets/img/main/hear.png';
  import imgZuby from '@/assets/img/main/zuby.png';
  import imgYoga from '@/assets/img/main/bones.png';
  //import imgOutlet from '@/assets/img/main/cat-outlet.png';
import { useRouter } from 'vue-router';

const query = ref('');
const userStore = useUserStore();
const router = useRouter();

const handleSearch = (value) => {
  console.log('Поиск:', value);
};

const goNotify = () => {
  router.push("/notifications");
}

const userName = computed(() => {
  const first = userStore.profile?.first_name?.trim();
  const last = userStore.profile?.last_name?.trim();
  const fullName = [first, last].filter(Boolean).join(' ');
  return fullName || "Пользователь";
});

const promotions = [
  // {
  //   htmlContent: `
  //     <h3 class="text-slider font-medium tracking-wide text-[#5F0024]"></h3>
  //     <p class="text-sm my-1 tracking-wide w-210"></p>
  //   `,
  //   bgColor: '#fff',
  //   images: [
  //     { src: outletSlider, class: 'w-full' },
  //   ],
  // },
  {
    htmlContent: `
      <h3 class="text-slider font-medium tracking-wide text-[#5F0024]"></h3>
      <p class="text-sm my-1 tracking-wide w-210"></p>
    `,
    bgColor: '#fff',
    images: [
      { src: twoSlider, class: 'w-full' },
    ],
  },
  {
    htmlContent: `
      <h3 class="text-slider font-medium tracking-wide text-[#5F0024]"></h3>
      <p class="text-sm my-1 tracking-wide w-210"></p>
    `,
    bgColor: '#fff',
    images: [
      { src: threeSlider, class: 'w-full' },
    ],
  },
  {
    htmlContent: `
      <h3 class="text-slider font-medium tracking-wide text-[#5F0024]"></h3>
      <p class="text-sm my-1 tracking-wide w-210"></p>
    `,
    bgColor: '#fff',
    images: [
      { src: fourSlider, class: 'w-full' },
    ],
  },
  // {
  //   htmlContent: `
  //     <h3 class="text-slider font-medium tracking-wide text-[#5F0024]"></h3>
  //     <p class="text-sm my-1 tracking-wide w-210"></p>
  //   `,
  //   bgColor: '#fff',
  //   images: [
  //     { src: fiveSlider, class: 'w-full' },
  //   ],
  // },
];

const categories = [
  {
    title: "Все товары",
    image: { src: allProduct, class: 'absolute right-4 xs:right-1 bottom-0 w-36 xs:w-28' },
    route: { path: "/catalog", query: { property: "", title: "Все товары" } }
  },
  {
    title: "Нервная система и мозг",
    image: { src: imgBrain, class: 'absolute right-2 xs:right-1 bottom-2 xs:bottom-2 w-34 xs:w-32' },
    route: { path: "/catalog", query: { property: "brain-nerves", title: "Нервная система и мозг" } }
  },
  {
    title: "Кишечник и иммунитет",
    image: { src: imgBakteria, class: 'absolute right-1 xs:right-0 bottom-0 xs:bottom-2 w-28 xs:w-24' },
    route: { path: "/catalog", query: { property: "intestine-immunity", title: "Кишечник и иммунитет" } }
  },
  {
    title: "Кожа и волосы",
    image: { src: imgHear, class: 'absolute right-2 xs:right-0 bottom-0 w-28 xs:w-24' },
    route: { path: "/catalog", query: { property: "skin-hair", title: "Кожа и волосы" } }
  },
  {
    title: "Кости и мышцы",
    image: { src: imgYoga, class: 'absolute right-1 xs:right-1 bottom-0 w-24 xs:w-20' },
    route: { path: "/catalog", query: { property: "bones-muscles", title: "Кости и мышцы" } }
  },
  {
    title: "Зубы и десна",
    image: { src: imgZuby, class: 'absolute right-2 xs:right-1 bottom-1 xs:bottom-2 w-24 xs:w-20' },
    route: { path: "/catalog", query: { property: "teeth-gums", title: "Зубы и десна" } }
  },
  // {
  //   title: "Outlet Daigo", 
  //   image: { src: imgOutlet, class: 'absolute right-0 bottom-0 w-[180px] xs:w-36'},
  //   route: { path: "/outlet" }
  // },
];

</script>
