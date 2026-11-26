<template>
  <div class="page">
    <header class="header">
      <span class="logo">我的订单</span>
      <div>
        <el-button link @click="$router.push('/')">返回首页</el-button>
        <el-button link @click="$router.push('/cart')">购物车</el-button>
        <el-button link @click="$router.push('/customer/addresses')">收货地址</el-button>
        <el-button link @click="$router.push('/customer/after-sales')">我的售后</el-button>
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
          <template #default="{ row: order }">
            <div class="expand">
              <el-steps :active="stepActive(order)" finish-status="success" align-center class="steps">
                <el-step title="客户下单" :description="fmt(order.createdAt)" />
                <el-step title="待支付" />
                <el-step title="已支付" :description="fmt(order.paidAt)" />
                <el-step title="商家确认" :description="fmt(order.confirmedAt)" />
                <el-step title="备货完成" :description="fmt(order.preparedAt)" />
                <el-step title="开始发货" :description="fmt(order.shippedAt)" />
                <el-step title="交易完成" :description="fmt(order.completedAt)" />
              </el-steps>

              <el-alert
                v-if="order.status === 'CANCELED'"
                type="info"
                :closable="false"
                class="cancel-alert"
                :title="`订单已由${order.canceledBy === 'SELLER' ? '商家' : '客户'}取消${order.cancelReason ? '：' + order.cancelReason : ''}`"
              />

              <el-table :data="order.items" size="small" border>
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
                <el-table-column label="售后" width="140">
                  <template #default="{ row: item }">
                    <template v-if="afterSaleOf(item.id)">
                      <el-tag :type="afterSaleStatusType[afterSaleOf(item.id).status]" size="small">
                        {{ afterSaleOf(item.id).statusLabel }}
                      </el-tag>
                      <el-button link type="primary" size="small" @click="$router.push('/customer/after-sales')">
                        详情
                      </el-button>
                    </template>
                    <el-button
                      v-else-if="order.status === 'SHIPPED' || order.status === 'COMPLETED'"
                      link
                      type="danger"
                      size="small"
                      @click="openApply(order, item)"
                    >申请售后</el-button>
                    <span v-else class="muted">—</span>
                  </template>
                </el-table-column>
              </el-table>

              <div class="delivery">
                <span>收货人：{{ order.buyerName }}</span>
                <span>电话：{{ order.buyerPhone }}</span>
                <span>地点：{{ order.address || '—' }}</span>
                <span>备注：{{ order.remark || '—' }}</span>
                <span v-if="order.paidAt">支付方式：{{ paymentChannel[order.payChannel] || order.payChannel }}</span>
                <span v-if="order.paidAt">支付时间：{{ fmt(order.paidAt) }}</span>
              </div>

              <div class="ship" v-if="order.shipping">
                <span class="ship-label">配送信息</span>
                <span>{{ order.shipping.expressCompanyLabel }}</span>
                <span>运单号：{{ order.shipping.trackingNo }}</span>
                <el-tag :type="logisticsStatusType[order.shipping.status]" size="small">
                  {{ order.shipping.statusLabel }}
                </el-tag>
                <el-button link type="primary" @click="$router.push('/logistics/' + order.id)">
                  查看物流详情
                </el-button>
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
        <el-table-column label="操作" width="210">
          <template #default="{ row }">
            <el-button v-if="row.payable" size="small" type="danger" @click="openPay(row)">去支付</el-button>
            <el-button
              v-if="row.cancellableByCustomer"
              size="small"
              type="danger"
              plain
              @click="cancel(row)"
            >取消订单</el-button>
            <span v-if="!row.payable && !row.cancellableByCustomer" class="muted">—</span>
          </template>
        </el-table-column>
      </el-table>

      <p class="note">规则：订单处于「开始发货」之前，客户可以取消订单；商家在「交易完成」之前也可取消订单。取消已支付订单时，支付金额原路退回。</p>
    </div>

    <el-dialog v-model="payVisible" title="选择支付方式" width="460px">
      <div class="pay-head">
        <span>订单 {{ payOrder?.orderNo }}</span>
        <b>¥ {{ payOrder?.totalAmount }}</b>
      </div>
      <div v-for="group in paymentChannelGroups" :key="group.label" class="pay-group">
        <div class="group-title">
          {{ group.label }}
          <span>{{ group.desc }}</span>
        </div>
        <el-radio-group v-model="payChannelValue" class="pay-channels">
          <el-radio v-for="key in group.channels" :key="key" :value="key" border>
            {{ paymentChannel[key] }}
          </el-radio>
        </el-radio-group>
      </div>
      <p class="pay-hint">演示环境使用模拟支付渠道，点击「去支付」后进入收银台确认即可完成付款。</p>
      <template #footer>
        <el-button @click="payVisible = false">取消</el-button>
        <el-button type="danger" :loading="paying" @click="doPay">去支付</el-button>
      </template>
    </el-dialog>

    <AfterSaleApplyDialog v-model="applyVisible" :item="applyItem" @submitted="onApplied" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api'
import {
  orderStatus,
  orderStatusType,
  ORDER_FLOW,
  paymentChannel,
  paymentChannelGroups,
  logisticsStatusType,
  afterSaleStatusType
} from '../utils/status'
import AfterSaleApplyDialog from '../components/AfterSaleApplyDialog.vue'

const router = useRouter()
const orders = ref([])
const statusFilter = ref('')

const payVisible = ref(false)
const payOrder = ref(null)
const payChannelValue = ref('ALIPAY')
const paying = ref(false)

const afterSales = ref([])
const applyVisible = ref(false)
const applyItem = ref(null)

const filtered = computed(() =>
  statusFilter.value ? orders.value.filter((o) => o.status === statusFilter.value) : orders.value
)

function fmt(v) {
  return v ? String(v).replace('T', ' ').slice(0, 19) : ''
}

function stepActive(row) {
  if (row.status === 'CANCELED') {
    if (row.shippedAt) return 6
    if (row.preparedAt) return 5
    if (row.confirmedAt) return 4
    if (row.paidAt) return 3
    return 1
  }
  const idx = ORDER_FLOW.indexOf(row.status)
  return idx < 0 ? 0 : idx + 1
}

function openPay(row) {
  payOrder.value = row
  payChannelValue.value = 'ALIPAY'
  payVisible.value = true
}

async function doPay() {
  paying.value = true
  try {
    const payment = await http.post('/customer/payments', {
      orderId: payOrder.value.id,
      channel: payChannelValue.value
    })
    payVisible.value = false
    if (payment.mock) {
      router.push(`/pay/${payment.paymentNo}`)
    } else {
      window.location.href = payment.payUrl
    }
  } catch (e) {
    /* 拦截器已提示 */
  } finally {
    paying.value = false
  }
}

async function load() {
  orders.value = await http.get('/customer/orders')
  afterSales.value = await http.get('/customer/after-sales')
}

/** 订单项的售后单（已撤销 / 已拒绝的允许重新申请，不作为展示依据） */
function afterSaleOf(itemId) {
  return afterSales.value.find(
    (a) => a.orderItemId === itemId && a.status !== 'CANCELED' && a.status !== 'REJECTED'
  ) || null
}

function openApply(order, item) {
  applyItem.value = {
    id: item.id,
    productName: item.productName,
    productImage: item.productImage,
    price: item.price,
    quantity: item.quantity
  }
  applyVisible.value = true
}

async function onApplied() {
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
.ship { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; margin-top: 12px; padding: 10px 14px; background: #fff; border: 1px dashed #e6dcd0; border-radius: 8px; font-size: 13px; color: #6b625b; }
.ship-label { font-weight: 600; color: #b85042; }
.muted { color: #b9b1a8; }
.note { margin-top: 14px; font-size: 12px; color: #8a8178; }
.pay-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; color: #6b625b; }
.pay-head b { color: #b85042; font-size: 20px; }
.pay-channels { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.pay-channels .el-radio { margin-right: 0; }
.pay-group { margin-bottom: 14px; }
.group-title { font-size: 13px; font-weight: 600; color: #4a423c; margin-bottom: 8px; }
.group-title span { font-weight: 400; color: #a29890; margin-left: 8px; font-size: 12px; }
.pay-hint { font-size: 12px; color: #8a8178; line-height: 1.7; }
</style>
