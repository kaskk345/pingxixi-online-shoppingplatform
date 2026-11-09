<template>
  <div>
    <div class="toolbar">
      <el-select v-model="status" placeholder="全部状态" clearable style="width: 160px" @change="reload">
        <el-option v-for="(label, key) in orderStatus" :key="key" :label="label" :value="key" />
      </el-select>
      <el-button @click="load">刷新</el-button>
      <el-tag type="warning" style="margin-left: 12px">流程：客户下单 → 商家确认 → 备货完成 → 开始发货 → 交易完成</el-tag>
    </div>

    <el-table :data="orders" border>
      <el-table-column prop="orderNo" label="订单号" width="190" />
      <el-table-column label="客户" width="150">
        <template #default="{ row }">
          <div>{{ row.buyerName }}</div>
          <div class="sub">{{ row.buyerPhone }}</div>
        </template>
      </el-table-column>
      <el-table-column label="商品" min-width="220">
        <template #default="{ row }">
          <span class="names">{{ row.items.map((i) => i.productName).join('、') }}</span>
          <span class="sub">共 {{ row.itemCount }} 件</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="110">
        <template #default="{ row }"><span class="amount">¥ {{ row.totalAmount }}</span></template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="orderStatusType[row.status]">{{ row.statusLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" width="170">
        <template #default="{ row }">{{ fmt(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="270">
        <template #default="{ row }">
          <el-button v-if="row.status === 'PLACED'" size="small" type="primary" @click="advance('confirm', row)">确认订单</el-button>
          <el-button v-if="row.status === 'CONFIRMED'" size="small" type="primary" @click="advance('prepare', row)">备货完成</el-button>
          <el-button v-if="row.status === 'PREPARED'" size="small" type="success" @click="advance('ship', row)">开始发货</el-button>
          <el-button v-if="row.status === 'SHIPPED'" size="small" type="success" @click="advance('complete', row)">交易完成</el-button>
          <el-button v-if="row.cancellableBySeller" size="small" type="danger" plain @click="cancel(row)">取消订单</el-button>
          <el-button size="small" link @click="openDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pager"
      layout="total, prev, pager, next"
      :total="total"
      :page-size="size"
      :current-page="page"
      @current-change="handlePageChange"
    />

    <el-dialog v-model="detailVisible" title="订单详情" width="720px">
      <template v-if="current">
        <el-steps :active="stepActive(current)" finish-status="success" align-center class="steps">
          <el-step title="客户下单" :description="fmt(current.createdAt)" />
          <el-step title="商家确认" :description="fmt(current.confirmedAt)" />
          <el-step title="备货完成" :description="fmt(current.preparedAt)" />
          <el-step title="开始发货" :description="fmt(current.shippedAt)" />
          <el-step title="交易完成" :description="fmt(current.completedAt)" />
        </el-steps>

        <el-alert
          v-if="current.status === 'CANCELED'"
          type="info"
          :closable="false"
          class="cancel-alert"
          :title="`订单已由${current.canceledBy === 'SELLER' ? '商家' : '客户'}取消${current.cancelReason ? '：' + current.cancelReason : ''}`"
        />

        <el-descriptions :column="2" border size="small" class="desc">
          <el-descriptions-item label="订单号">{{ current.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ current.statusLabel }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ current.buyerName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ current.buyerPhone }}</el-descriptions-item>
          <el-descriptions-item label="交易地点" :span="2">{{ current.address || '—' }}</el-descriptions-item>
          <el-descriptions-item label="买家备注" :span="2">{{ current.remark || '—' }}</el-descriptions-item>
        </el-descriptions>

        <el-table :data="current.items" border size="small" class="items">
          <el-table-column prop="productName" label="商品" min-width="200" />
          <el-table-column label="单价" width="100">
            <template #default="{ row }">¥ {{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column label="小计" width="110">
            <template #default="{ row }">¥ {{ row.subtotal }}</template>
          </el-table-column>
        </el-table>
        <div class="total">合计：<b>¥ {{ current.totalAmount }}</b></div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../../api'
import { orderStatus, orderStatusType, ORDER_FLOW } from '../../utils/status'

const orders = ref([])
const status = ref('')
const page = ref(1)
const size = ref(20)
const total = ref(0)
const detailVisible = ref(false)
const current = ref(null)

const actionText = {
  confirm: '确认该订单',
  prepare: '标记备货完成',
  ship: '开始发货（此后客户不可取消）',
  complete: '标记交易完成（不可再取消）'
}

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
  const params = { page: page.value - 1, size: size.value }
  if (status.value) params.status = status.value
  const res = await http.get('/seller/orders', { params })
  orders.value = res.content
  total.value = res.totalElements
}

function reload() {
  page.value = 1
  load()
}

function handlePageChange(p) {
  page.value = p
  load()
}

async function advance(action, row) {
  await ElMessageBox.confirm(`确认${actionText[action]}？`, '提示', { type: 'warning' })
  await http.post(`/seller/orders/${row.id}/${action}`)
  ElMessage.success('操作成功')
  await load()
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
    await http.post(`/seller/orders/${row.id}/cancel`, { reason: value || '' })
    ElMessage.success('订单已取消')
    await load()
  } catch (e) {
    /* 拦截器已提示错误 */
  }
}

function openDetail(row) {
  current.value = row
  detailVisible.value = true
}

onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.sub { display: block; font-size: 12px; color: #8a8178; margin-top: 4px; }
.names { color: #2b2622; }
.amount { color: #b85042; font-weight: 700; }
.pager { margin-top: 16px; justify-content: center; }
.steps { margin-bottom: 16px; }
.cancel-alert { margin-bottom: 14px; }
.desc { margin-bottom: 14px; }
.total { margin-top: 10px; text-align: right; }
</style>
