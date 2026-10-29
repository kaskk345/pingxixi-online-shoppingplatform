<template>
  <div v-loading="loading">
    <div class="toolbar">
      <el-button @click="$router.push('/seller/products')">‹ 返回商品列表</el-button>
      <el-image v-if="cover" :src="cover" class="cover" fit="cover" />
      <div class="head">
        <div class="title">{{ product ? product.name : '商品交易历史' }}</div>
        <div class="sub">商品 #{{ productId }} · 以商品为主体的全部交易记录（只读）</div>
      </div>
      <el-tag v-if="product" :type="statusType[product.status]">
        {{ productStatus[product.status] || product.status }}
      </el-tag>
    </div>

    <el-descriptions v-if="product" :column="4" border class="meta">
      <el-descriptions-item label="价格">¥ {{ product.price }}</el-descriptions-item>
      <el-descriptions-item label="库存">{{ product.stock }}</el-descriptions-item>
      <el-descriptions-item label="销量">{{ product.sales ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="分类">
        {{ product.category || '—' }}<template v-if="product.categoryL2"> / {{ product.categoryL2 }}</template>
      </el-descriptions-item>
    </el-descriptions>

    <div class="stats">
      <div class="stat">
        <span class="num">{{ intents.length }}</span>
        <span class="label">全部记录</span>
      </div>
      <div class="stat">
        <span class="num">{{ countOf('SUCCEEDED') }}</span>
        <span class="label">交易成功</span>
      </div>
      <div class="stat">
        <span class="num">{{ ongoingCount }}</span>
        <span class="label">进行中</span>
      </div>
      <div class="stat">
        <span class="num">{{ anonymousCount }}</span>
        <span class="label">匿名买家</span>
      </div>
    </div>

    <div class="toolbar">
      <el-radio-group v-model="filter">
        <el-radio-button value="ALL">全部</el-radio-button>
        <el-radio-button value="ONGOING">进行中</el-radio-button>
        <el-radio-button value="TERMINAL">已结束</el-radio-button>
      </el-radio-group>
      <el-tag type="info" style="margin-left: 9px">含已结束订单与买家撤销记录</el-tag>
    </div>

    <el-table :data="rows" border empty-text="该商品暂无交易记录">
      <el-table-column prop="id" label="编号" width="70" />
      <el-table-column prop="buyerName" label="姓名" width="110" />
      <el-table-column prop="buyerPhone" label="联系电话" width="130" />
      <el-table-column label="买家来源" width="140">
        <template #default="{ row }">
          <el-tag v-if="row.customerId" type="success" effect="plain">注册客户</el-tag>
          <el-tag v-else type="info" effect="plain">匿名买家</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="客户账号" width="130">
        <template #default="{ row }">
          <span v-if="row.customerUsername">{{ row.customerUsername }}</span>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType[row.status]">{{ row.statusLabel || intentStatus[row.status] || row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="交易结果" width="110">
        <template #default="{ row }">
          <span v-if="row.result">{{ row.resultLabel || intentStatus[row.result] || row.result }}</span>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column prop="queueTime" label="排队时间" width="180" />
      <el-table-column prop="createdAt" label="提交时间" width="180" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import http from '../../api'
import { productStatus, intentStatus } from '../../utils/status'

const route = useRoute()
const productId = route.params.id

const loading = ref(false)
const product = ref(null)
const intents = ref([])
const filter = ref('ALL')

const statusType = {
  ON_SALE: 'success',
  RESTORED: 'success',
  FROZEN: 'warning',
  OFF_SHELF: 'info',
  WAITING: 'warning',
  TRADING: 'primary',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  VOID: 'info',
  CANCELED: 'info'
}

const ONGOING = ['WAITING', 'TRADING']

const cover = computed(() => {
  const p = product.value
  if (!p) return ''
  if (p.images) {
    const list = p.images.split(',').filter(Boolean)
    if (list.length) return list[0]
  }
  return p.imageUrl || ''
})

const rows = computed(() => {
  if (filter.value === 'ONGOING') return intents.value.filter((i) => ONGOING.includes(i.status))
  if (filter.value === 'TERMINAL') return intents.value.filter((i) => !ONGOING.includes(i.status))
  return intents.value
})

const ongoingCount = computed(() => intents.value.filter((i) => ONGOING.includes(i.status)).length)
const anonymousCount = computed(() => intents.value.filter((i) => !i.customerId).length)

function countOf(status) {
  return intents.value.filter((i) => i.status === status).length
}

async function load() {
  loading.value = true
  try {
    const [detail, history] = await Promise.all([
      http.get(`/products/${productId}`),
      http.get(`/seller/products/${productId}/history`)
    ])
    product.value = detail
    intents.value = history || []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.cover {
  width: 52px;
  height: 52px;
  border-radius: 6px;
}
.head {
  flex: 1;
  min-width: 0;
}
.title {
  font-size: 17px;
  font-weight: 700;
}
.sub {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}
.meta {
  margin-bottom: 16px;
}
.stats {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.stat {
  flex: 1;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat .num {
  font-size: 22px;
  font-weight: 700;
  color: #2f6fd0;
}
.stat .label {
  font-size: 12px;
  color: #909399;
}
</style>
