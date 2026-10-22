<template>
  <div class="page">
    <header class="header">
      <span class="logo">我的订单</span>
      <div>
        <el-button link @click="$router.push('/')">返回首页</el-button>
        <el-button link type="primary" @click="logout">退出</el-button>
      </div>
    </header>
    <div class="main">
      <el-table :data="orders" border empty-text="暂无下单记录">
        <el-table-column prop="productName" label="商品" min-width="160" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="位次" width="80">
          <template #default="{ row }">{{ row.position ?? '—' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="190" />
        <el-table-column prop="code" label="口令码" width="130" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import http from '../api'

const orders = ref([])
const router = useRouter()

async function load() {
  orders.value = await http.get('/customer/orders')
}

function logout() {
  localStorage.removeItem('customerToken')
  router.push('/')
}

onMounted(load)
</script>

<style scoped>
.page { min-height: 100vh; background: #fbf8f3; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 14px 28px; background: #fff; border-bottom: 1px solid #eee; }
.logo { font-size: 20px; font-weight: 700; color: #b85042; }
.main { max-width: 980px; margin: 0 auto; padding: 24px 20px 60px; }
</style>
