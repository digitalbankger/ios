import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/LayoutWithBottomNav.vue'),
    children: [
      { path: '', component: () => import('@/pages/HomePage.vue') },
    ],
  },
  {
    path: '/catalog',
    component: () => import('@/layouts/LayoutWithBottomNav.vue'),
    children: [
      { path: '', component: () => import('@/pages/CatalogPage.vue') },
    ],
  },
  {
    path: '/outlet',
    component: () => import('@/layouts/LayoutWithBottomNav.vue'),
    children: [
      { path: '', component: () => import('@/pages/PreOutlet.vue') },
    ],
  },
  {
    path: '/outlet-catalog',
    component: () => import('@/layouts/LayoutWithBottomNav.vue'),
    children: [
      { path: '', component: () => import('@/pages/OutletPage.vue') },
    ],
  },
  {
    path: '/product/:url_cpu',
    name: "Product",
    component: () => import('@/layouts/LayoutWithBottomNav.vue'),
    props: true,
    children: [
      { path: '', component: () => import('@/pages/ProductPage.vue') },
    ],
  },
  {
    path: '/deals',
    component: () => import('@/layouts/LayoutWithBottomNav.vue'),
    children: [
      { path: '', component: () => import('@/pages/PromotionsPage.vue') },
    ],
  },
  {
    path: '/cart',
    component: () => import('@/layouts/LayoutWithBottomNav.vue'),
    props: true,
    children: [
      { path: '', component: () => import('@/pages/Cart.vue') },
    ],
  },
  {
    path: '/create',
    component: () => import('@/layouts/LayoutWithoutBottomNav.vue'),
    children: [
      { path: '', component: () => import('@/pages/ProductCreate.vue') },
    ],
  },
  {
    path: '/profile',
    component: () => import('@/layouts/LayoutWithBottomNav.vue'),
    children: [
      { path: '', component: () => import('@/pages/ProfilePage.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/orders',
    component: () => import('@/layouts/LayoutWithoutBottomNav.vue'),
    children: [
      { path: '', component: () => import('@/pages/OrdersHistory.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/bonuses',
    component: () => import('@/layouts/LayoutWithoutBottomNav.vue'),
    children: [
      { path: '', component: () => import('@/pages/BonusesHistory.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/notifications',
    component: () => import('@/layouts/LayoutWithoutBottomNav.vue'),
    children: [
      { path: '', component: () => import('@/pages/Notifications.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/order-create',
    component: () => import('@/layouts/LayoutWithBottomNav.vue'),
    children: [
      { path: '', component: () => import('@/pages/OrderCreate.vue') },
    ],
    meta: { requiresAuth: false },
  },
  {
    path: '/dolyame-create',
    component: () => import('@/layouts/LayoutWithBottomNav.vue'),
    children: [
      { path: '', component: () => import('@/pages/DolamiCreate.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/thank',
    component: () => import('@/layouts/LayoutWithoutBottomNav.vue'),
    children: [
      { path: '', component: () => import('@/pages/ThankPage.vue') },
    ],
  },
  {
    path: '/authenticate',
    component: () => import('@/layouts/LayoutWithoutBottomNav.vue'),
    children: [{ path: '', component: () => import('@/pages/AuthPage.vue') }],
  },
  {
    path: '/policy',
    component: () => import('@/layouts/LayoutWithoutBottomNav.vue'),
    children: [{ path: '', component: () => import('@/components/Policy.vue') }],
  },
  {
    path: '/soglasie',
    component: () => import('@/layouts/LayoutWithoutBottomNav.vue'),
    children: [{ path: '', component: () => import('@/components/Soglasie.vue') }],
  },
  {
    path: '/soglasiereklama',
    component: () => import('@/layouts/LayoutWithoutBottomNav.vue'),
    children: [{ path: '', component: () => import('@/components/SoglasieReklama.vue') }],
  },
  {
    path: '/verify',
    component: () => import('@/layouts/LayoutWithoutBottomNav.vue'),
    children: [{ path: '', component: () => import('@/pages/VerifyPage.vue') }],
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0, behavior: 'smooth' };
  }
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/authenticate');
  } else if ((to.path === '/authenticate' || to.path === '/verify') && isAuthenticated) {
    next('/profile');
  } else {
    next();
  }
});

let scrollHandler = null;
let is50Reached = false;
let is100Reached = false;

router.afterEach((to) => {
  if (typeof ym !== 'undefined') {
    ym(101458573, 'hit', to.fullPath);

    if (to.path.startsWith('/product/')) {
      ym(101458573, 'reachGoal', 'go_to_product');
      console.log('[YandexMetrika] Цель: Переход на страницу товара (go_to_product)');
    }

    if (to.path === '/cart') {
      ym(101458573, 'reachGoal', 'go_to_cart');
    }

    if (to.path === '/outlet' || to.path === '/outlet-catalog') {
      ym(101458573, 'reachGoal', 'outlet_visit');
    }
  }

  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
    scrollHandler = null;
  }

  is50Reached = false;
  is100Reached = false;

  scrollHandler = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    if (scrollPercent >= 50 && !is50Reached) {
      is50Reached = true;
      if (typeof ym !== 'undefined') {
        ym(101458573, 'reachGoal', 'scroll_50');
        console.log('[YandexMetrika] Цель: Пролистывание 50% страницы (scroll_50)');
      }
    }

    if (scrollPercent >= 95 && !is100Reached) {
      is100Reached = true;
      if (typeof ym !== 'undefined') {
        ym(101458573, 'reachGoal', 'scroll_100');
        console.log('[YandexMetrika] Цель: Пролистывание 100% страницы (scroll_100)');
      }
    }
  };

  window.addEventListener('scroll', scrollHandler);
});

export default router;
