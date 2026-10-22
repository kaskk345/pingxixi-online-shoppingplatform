<template>
  <div class="home">
    <header class="header">
      <div class="brand">
        <span class="logo">拼夕夕</span>
        <span class="slogan">多商品 · 分类浏览 · 搜索</span>
      </div>
      <div class="actions">
        <el-button link @click="$router.push('/track')">查口令</el-button>
        <el-button v-if="isCustomer" link @click="$router.push('/customer/orders')">我的订单</el-button>
        <el-button v-else link @click="$router.push('/customer/login')">客户登录</el-button>
        <el-button link type="primary" @click="$router.push('/login')">商家后台</el-button>
      </div>
    </header>

    <main class="main">
      <div class="searchbar">
        <el-input v-model="keyword" placeholder="搜索商品名称或描述" clearable style="max-width: 340px" @keyup.enter="load">
          <template #append>
            <el-button @click="load">搜索</el-button>
          </template>
        </el-input>
        <el-select v-model="c1" placeholder="一级分类" clearable style="width: 140px" @change="onC1">
          <el-option v-for="t in tree" :key="t.id" :label="t.name" :value="t.name" />
        </el-select>
        <el-select v-model="c2" placeholder="二级分类" clearable style="width: 140px" :disabled="!c1">
          <el-option v-for="ch in children" :key="ch.id" :label="ch.name" :value="ch.name" />
        </el-select>
      </div>

      <div v-if="products.length" class="grid">
        <div v-for="p in products" :key="p.id" class="card" @click="$router.push('/product/' + p.id)">
          <div class="thumb">
            <img :src="firstImage(p)" :alt="p.name" />
            <span class="badge">{{ p.category }}</span>
          </div>
          <div class="card-body">
            <div class="name">{{ p.name }}</div>
            <div class="meta">
              <span class="cat">{{ p.category }}<template v-if="p.categoryL2"> / {{ p.categoryL2 }}</template></span>
              <span class="stock">库存 {{ p.stock }}</span>
            </div>
            <div class="price">¥ {{ p.price }}</div>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        <div class="empty-icon">🔍</div>
        <h2>没有找到商品</h2>
        <p>试试更换关键词或分类。</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../api'

const products = ref([])
const tree = ref([])
const children = ref([])
const keyword = ref('')
const c1 = ref('')
const c2 = ref('')
const isCustomer = ref(!!localStorage.getItem('customerToken'))

function firstImage(p) {
  if (p.images) {
    const arr = p.images.split(',').filter(Boolean)
    if (arr.length) return arr[0]
  }
  return p.imageUrl || ''
}

async function loadTree() {
  tree.value = await http.get('/categories')
}

function onC1() {
  c2.value = ''
  const t = tree.value.find((x) => x.name === c1.value)
  children.value = t ? (t.children || []) : []
}

async function load() {
  const params = {}
  if (keyword.value) params.keyword = keyword.value
  if (c1.value) params.categoryL1 = c1.value
  if (c2.value) params.categoryL2 = c2.value
  products.value = await http.get('/products/search', { params })
}

onMounted(async () => {
  await loadTree()
  await load()
})
</script>

<style scoped>
.home { min-height: 100vh; background: #fbf8f3; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 14px 28px; background: #fff; border-bottom: 1px solid #eee; }
.brand { display: flex; align-items: baseline; gap: 10px; }
.logo { font-size: 22px; font-weight: 700; color: #b85042; }
.slogan { font-size: 13px; color: #8a8178; }
.actions { display: flex; align-items: center; gap: 6px; }
.main { max-width: 1120px; margin: 0 auto; padding: 24px 20px 60px; }
.searchbar { display: flex; gap: 12px; align-items: center; margin-bottom: 22px; flex-wrap: wrap; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 18px; }
.card { background: #fff; border-radius: 12px; overflow: hidden; cursor: pointer; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05); transition: transform 0.15s; }
.card:hover { transform: translateY(-3px); }
.thumb { position: relative; aspect-ratio: 4 / 3; background: #f5f2ec; }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.badge { position: absolute; left: 10px; top: 10px; background: #b85042; color: #fff; font-size: 12px; padding: 3px 9px; border-radius: 999px; }
.card-body { padding: 12px 14px 16px; }
.name { font-size: 15px; color: #2b2622; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meta { display: flex; justify-content: space-between; color: #8a8178; font-size: 12px; margin: 8px 0; }
.price { color: #b85042; font-size: 20px; font-weight: 700; }
.empty { background: #fff; border-radius: 14px; padding: 70px 20px; text-align: center; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05); }
.empty-icon { font-size: 48px; }
.empty h2 { margin: 14px 0 10px; color: #2b2622; }
.empty p { color: #6b625b; font-size: 14px; }
</style>
