<template>
  <div class="page">
    <header class="header">
      <span class="logo">我的订单</span>
      <div>
        <el-button link @click="$router.push('/')">返回首页</el-button>
        <el-button link @click="$router.push('/cart')">购物车</el-button>
        <el-button link @click="$router.push('/favorites')">我的收藏</el-button>
        <el-button link type="primary" @click="logout">退出</el-button>
      </div>
    </header>

    <div class="main">
      <div class="toolbar">
        <el-radio-group v-model="statusFilter" size="small">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button v-for="(label, key) in orderStatus" :key="key" :value="key">{{ label }}</el-radio-button>
        </el-radio-group>
        <el-button size="small" @click="load">刷新</el-button>
      </div>

      <el-table :data="filtered" border empty-text="暂无订单" row-key="id">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand">
              <el-steps :active="stepActive(row)" finish-status="success" align-center class="steps">
                <el-step title="客户下单" :description="fmt(row.createdAt)" />
                <el-step title="商家确认" :description="fmt(row.confirmedAt)" />
                <el-step title="备货完成" :description="fmt(row.preparedAt)" />
                <el-step title="开始发货" :description="fmt(row.shippedAt)" />
                <el-step title="交易完成" :description="fmt(row.completedAt)" />
              </el-steps>

              <el-alert
                v-if="row.status === 'CANCELED'"
                type="info"
                :closable="false"
                class="cancel-alert"
                :title="`订单已由${row.canceledBy === 'SELLER' ? '商家' : '客户'}取消${row.cancelReason ? '：' + row.cancelReason : ''}`"
              />

              <el-table :data="row.items" size="small" border>
                <el-table-column label="商品" min-width="220">
                  <template #default="{ row: item }">
                    <div class="item">
                      <el-image v-if="item.productImage" :src="item.productImage" class="thumb" fit="cover" />
                      <span>{{ item.productName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="单价" width="110">
                  <template #default="{ row: item }">¥ {{ item.price }}</template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" width="80" />
                <el-table-column label="小计" width="120">
                  <template #default="{ row: item }">¥ {{ item.subtotal }}</template>
                </el-table-column>
              </el-table>

              <div class="delivery">
                <span>收货人：{{ row.buyerName }}</span>
                <span>电话：{{ row.buyerPhone }}</span>
                <span>地点：{{ row.address || '—' }}</span>
                <span>备注：{{ row.remark || '—' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="订单号" width="210" />
        <el-table-column label="商品" min-width="220">
          <template #default="{ row }">
            <span class="names">{{ row.items.map((i) => i.productName).join('、') }}</span>
            <span class="count">共 {{ row.itemCount }} 件</span>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }"><span class="amount">¥ {{ row.totalAmount }}</span></template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="orderStatusType[row.status]">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="180">
          <template #default="{ row }">{{ fmt(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              v-if="row.cancellableByCustomer"
              size="small"
              type="danger"
              plain
              @click="cancel(row)"
            >取消订单</el-button>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>
      </el-table>

      <p class="note">规则：订单处于「开始发货」之前，客户可以取消订单；商家在「交易完成」之前也可取消订单。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api'
import { orderStatus, orderStatusType, ORDER_FLOW } from '../utils/status'

const router = useRouter()
const orders = ref([])
const statusFilter = ref('')

const filtered = computed(() =>
  statusFilter.value ? orders.value.filter((o) => o.status === statusFilter.value) : orders.value
)

function fmt(v) {
  return v ? String(v).replace('T', ' ').slice(0, 19) : ''
}

function stepActive(row) {
  if (row.status === 'CANCELED') {
    if (row.shippedAt) return 4
    if (row.preparedAt) return 3
    if (row.confirmedAt) return 2
    return 1
  }
  const idx = ORDER_FLOW.indexOf(row.status)
  return idx < 0 ? 0 : idx + 1
}

async function load() {
  orders.value = await http.get('/customer/orders')
}

async function cancel(row) {
  const { value } = await ElMessageBox.prompt(
    `确认取消订单 ${row.orderNo}？取消后库存将恢复。`,
    '取消订单',
    {
      inputPlaceholder: '取消原因（可选）',
      confirmButtonText: '确认取消',
      cancelButtonText: '返回',
      type: 'warning'
    }
  )
  try {
    await http.post(`/customer/orders/${row.id}/cancel`, { reason: value || '' })
    ElMessage.success('订单已取消')
    await load()
  } catch (e) {
    /* 拦截器已提示错误 */
  }
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
.main { max-width: 1180px; margin: 0 auto; padding: 24px 20px 60px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; gap: 12px; flex-wrap: wrap; }
.names { color: #2b2622; }
.count { display: block; font-size: 12px; color: #8a8178; margin-top: 4px; }
.amount { color: #b85042; font-weight: 700; }
.expand { padding: 12px 20px 20px; background: #fdfbf8; }
.steps { margin-bottom: 16px; }
.cancel-alert { margin-bottom: 14px; }
.item { display: flex; align-items: center; gap: 10px; }
.thumb { width: 46px; height: 46px; border-radius: 6px; flex: none; }
.delivery { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 12px; font-size: 13px; color: #6b625b; }
.muted { color: #b9b1a8; }
.note { margin-top: 14px; font-size: 12px; color: #8a8178; }
</style>
