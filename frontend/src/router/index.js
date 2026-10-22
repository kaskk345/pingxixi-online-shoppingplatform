import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue') },
  { path: '/product/:id', name: 'product', component: () => import('../views/ProductDetail.vue') },
  { path: '/track', name: 'track', component: () => import('../views/Track.vue') },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  { path: '/customer/login', name: 'customerLogin', component: () => import('../views/CustomerLogin.vue') },
  { path: '/customer/register', name: 'customerRegister', component: () => import('../views/CustomerRegister.vue') },
  { path: '/customer/orders', name: 'customerOrders', component: () => import('../views/CustomerOrders.vue') },
  {
    path: '/seller',
    component: () => import('../views/SellerLayout.vue'),
    children: [
      { path: '', redirect: '/seller/products' },
      { path: 'products', name: 'products', component: () => import('../views/seller/ProductManage.vue') },
      { path: 'intents', name: 'intents', component: () => import('../views/seller/IntentManage.vue') },
      { path: 'customers', name: 'customers', component: () => import('../views/seller/CustomerManage.vue') },
      { path: 'password', name: 'password', component: () => import('../views/seller/Password.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.path.startsWith('/seller')) {
    if (!localStorage.getItem('token')) return '/login'
  }
  if (to.path.startsWith('/customer/orders')) {
    if (!localStorage.getItem('customerToken')) return '/customer/login'
  }
  return true
})

export default router
