import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue') },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  {
    path: '/seller',
    component: () => import('../views/SellerLayout.vue'),
    children: [
      { path: '', redirect: '/seller/products' },
      { path: 'products', name: 'products', component: () => import('../views/seller/ProductManage.vue') },
      { path: 'intents', name: 'intents', component: () => import('../views/seller/IntentManage.vue') },
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
    const token = localStorage.getItem('token')
    if (!token) return '/login'
  }
  return true
})

export default router
