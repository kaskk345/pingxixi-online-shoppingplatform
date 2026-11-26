<template>
  <div class="page">
    <header class="header">
      <span class="logo">收银台</span>
      <div>
        <el-button link @click="$router.push('/customer/orders')">我的订单</el-button>
        <el-button link @click="$router.push('/')">返回首页</el-button>
      </div>
    </header>

    <div class="main" v-loading="loading">
      <template v-if="payment">
        <div class="card">
          <div class="amount">
            <span class="label">应付金额</span>
            <span class="money">¥ {{ payment.amount }}</span>
          </div>

          <el-descriptions :column="1" border size="small" class="desc">
            <el-descriptions-item label="订单号">{{ payment.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="支付单号">{{ payment.paymentNo }}</el-descriptions-item>
            <el-descriptions-item label="支付方式">
              {{ payment.channelLabel }}
              <el-tag size="small" type="info" class="channel-type">{{ channelGroupLabel }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="支付状态">
              <el-tag :type="statusType">{{ payment.statusLabel }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <el-alert
            v-if="payment.mock"
            type="info"
            :closable="false"
            show-icon
            class="tip"
            title="线上支付 · 演示收银台"
            description="点击「确认支付」即视为渠道扣款成功，订单随即从「待支付」流转为「已支付」。"
          />
          <el-alert
            v-else
            type="success"
            :closable="false"
            show-icon
            class="tip"
            title="正在跳转第三方支付"
            description="若浏览器未自动跳转，请点击下方按钮前往支付。"
          />

          <div class="actions">
            <el-button v-if="payment.status === 'CREATED'" type="danger" size="large" @click="pay">
              确认支付 ¥ {{ payment.amount }}
            </el-button>
            <el-button v-if="payment.status === 'CREATED'" size="large" @click="abandon">放弃支付</el-button>
            <el-button v-if="payment.status === 'SUCCESS'" type="success" size="large" @click="backOrders">
              已完成支付，查看订单
            </el-button>
            <el-button v-if="!payment.mock && payment.status === 'CREATED'" size="large" @click="gotoGateway">
              前往第三方支付页
            </el-button>
          </div>
        </div>

        <p class="note">
          支付成功后订单变为「已支付」，商家确认后进入备货流程；「开始发货」前买家仍可取消，取消时已支付金额原路退回。
        </p>
      </template>

      <el-empty v-else-if="!loading" description="支付单不存在或已失效">
        <el-button type="primary" @click="backOrders">返回我的订单</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '../api'

const route = useRoute()
const router = useRouter()
const payment = ref(null)
const loading = ref(false)

const statusType = computed(() => {
  const s = payment.value?.status
  if (s === 'SUCCESS') return 'success'
  if (s === 'FAILED') return 'danger'
  if (s === 'REFUNDED' || s === 'CLOSED') return 'info'
  return 'warning'
})

const channelGroupLabel = computed(() => {
  const c = payment.value?.channel
  if (c === 'ALIPAY' || c === 'WECHAT') return '第三方支付'
  if (c === 'BANK_CARD' || c === 'CREDIT_CARD') return '银行卡支付'
  return '—'
})

async function load() {
  loading.value = true
  try {
    payment.value = await http.get(`/customer/payments/${route.params.paymentNo}`)
  } catch (e) {
    payment.value = null
  } finally {
    loading.value = false
  }
}

async function pay() {
  try {
    await http.post(`/customer/payments/${payment.value.paymentNo}/confirm`)
    ElMessage.success('支付成功，订单已更新为「已支付」')
    router.replace('/customer/orders')
  } catch (e) {
    /* 拦截器已提示 */
  }
}

async function abandon() {
  try {
    await http.post(`/customer/payments/${payment.value.paymentNo}/fail`, { reason: '买家放弃支付' })
    ElMessage.info('已放弃支付，可稍后在订单中重新发起')
  } catch (e) {
    /* 拦截器已提示 */
  }
  router.replace('/customer/orders')
}

function gotoGateway() {
  window.location.href = payment.value.payUrl
}

function backOrders() {
  router.replace('/customer/orders')
}

onMounted(load)
</script>

<style scoped>
.page { min-height: 100vh; background: #fbf8f3; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 14px 28px; background: #fff; border-bottom: 1px solid #eee; }
.logo { font-size: 20px; font-weight: 700; color: #b85042; }
.main { max-width: 620px; margin: 40px auto; padding: 0 20px 60px; }
.card { background: #fff; border: 1px solid #f0e9e0; border-radius: 14px; padding: 28px; box-shadow: 0 6px 24px rgba(184, 80, 66, 0.06); }
.amount { text-align: center; margin-bottom: 24px; }
.amount .label { display: block; font-size: 13px; color: #8a8178; margin-bottom: 8px; }
.amount .money { font-size: 34px; font-weight: 700; color: #b85042; }
.desc { margin-bottom: 18px; }
.channel-type { margin-left: 8px; }
.tip { margin-bottom: 20px; }
.actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
.note { margin-top: 18px; font-size: 12px; color: #8a8178; line-height: 1.7; }
</style>
