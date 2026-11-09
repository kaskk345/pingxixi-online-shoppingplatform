<template>
  <div class="page">
    <header class="header">
      <span class="logo">我的收藏</span>
      <div class="links">
        <el-button link @click="$router.push('/')">返回首页</el-button>
        <el-button link @click="$router.push('/cart')">购物车</el-button>
        <el-button link @click="$router.push('/customer/orders')">我的订单</el-button>
      </div>
    </header>

    <div class="main">
      <div v-if="list.length" class="grid">
        <div v-for="f in list" :key="f.id" class="card">
          <div class="thumb" @click="$router.push('/product/' + f.productId)">
            <el-image v-if="f.image" :src="f.image" fit="cover" class="cover" />
            <span v-else class="noimg">暂无图片</span>
          </div>
          <div class="body">
            <div class="name" @click="$router.push('/product/' + f.productId)">{{ f.name }}</div>
            <div class="meta">
              <span class="price">¥ {{ f.price }}</span>
              <span class="stock">库存 {{ f.stock ?? 0 }}</span>
            </div>
            <div class="row">
              <el-tag :type="f.available ? 'success' : 'info'" size="small">
                {{ f.available ? '可购买' : '暂不可购买' }}
              </el-tag>
              <div class="ops">
                <el-button size="small" type="danger" plain :disabled="!f.available" @click="addCart(f)">
                  加入购物车
                </el-button>
                <el-button size="small" @click="remove(f)">取消收藏</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        <div class="empty-icon">⭐</div>
        <h2>还没有收藏商品</h2>
        <p>浏览商品时点击「收藏」即可加入这里。</p>
        <el-button type="danger" @click="$router.push('/')">去逛逛</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api'

const list = ref([])

async function load() {
  list.value = await http.get('/customer/favorites')
}

async function addCart(f) {
  try {
    await http.post('/customer/cart', { productId: f.productId, quantity: 1 })
    ElMessage.success('已加入购物车')
  } catch (e) {
    /* 拦截器已提示错误 */
  }
}

async function remove(f) {
  await ElMessageBox.confirm(`确认取消收藏「${f.name}」？`, '提示', { type: 'warning' })
  await http.delete('/customer/favorites/' + f.productId)
  ElMessage.success('已取消收藏')
  await load()
}

onMounted(load)
</script>

<style scoped>
.page { min-height: 100vh; background: #fbf8f3; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 14px 28px; background: #fff; border-bottom: 1px solid #eee; }
.logo { font-size: 20px; font-weight: 700; color: #b85042; }
.main { max-width: 1120px; margin: 0 auto; padding: 24px 20px 60px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; }
.card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05); }
.thumb { aspect-ratio: 4 / 3; background: #f5f2ec; cursor: pointer; }
.cover { width: 100%; height: 100%; display: block; }
.noimg { display: flex; height: 100%; align-items: center; justify-content: center; color: #a09890; font-size: 13px; }
.body { padding: 12px 14px 16px; }
.name { font-weight: 600; color: #2b2622; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meta { display: flex; justify-content: space-between; align-items: baseline; margin: 8px 0 10px; }
.price { color: #b85042; font-size: 18px; font-weight: 700; }
.stock { font-size: 12px; color: #8a8178; }
.row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.ops { display: flex; gap: 4px; }
.empty { background: #fff; border-radius: 14px; padding: 70px 20px; text-align: center; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05); }
.empty-icon { font-size: 48px; }
.empty h2 { margin: 14px 0 10px; color: #2b2622; }
.empty p { color: #6b625b; font-size: 14px; margin-bottom: 16px; }
</style>
