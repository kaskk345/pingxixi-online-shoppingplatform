<template>
  <div>
    <div class="toolbar">
      <h3>注册客户</h3>
      <el-tag type="info">商家可查看客户信息与购买历史</el-tag>
    </div>

    <el-table :data="customers" border empty-text="暂无注册客户">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="phone" label="电话" width="150" />
      <el-table-column prop="defaultAddress" label="默认交易地点" min-width="180" />
      <el-table-column prop="createdAt" label="注册时间" width="190" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" @click="openOrders(row)">购买历史</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="visible" :title="`购买历史 · ${current?.username || ''}`" width="760px">
      <el-table :data="histories" border empty-text="该客户暂无购买记录">
        <el-table-column prop="productName" label="商品" min-width="160" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }"><el-tag>{{ row.statusLabel }}</el-tag></template>
        </el-table-column>
        <el-table-column label="交易结果" width="110">
          <template #default="{ row }">{{ row.resultLabel || '—' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="190" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../../api'

const customers = ref([])
const visible = ref(false)
const current = ref(null)
const histories = ref([])

async function load() {
  customers.value = await http.get('/seller/customers')
}

async function openOrders(row) {
  current.value = row
  visible.value = true
  histories.value = await http.get(`/seller/customers/${row.id}/orders`)
}

onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.toolbar h3 { margin: 0; }
</style>
