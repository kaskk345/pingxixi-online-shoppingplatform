<template>
  <div class="page">
    <header class="header">
      <span class="back" @click="$router.back()">‹</span>
      <span class="logo">物流详情</span>
      <span class="spacer"></span>
    </header>

    <div class="main" v-loading="loading">
      <template v-if="info">
        <div class="card">
          <div class="waybill">
            <div class="company">
              <span class="badge">快递</span>
              <span>{{ info.expressCompanyLabel || '暂未发货' }}</span>
            </div>
            <div class="no" v-if="info.trackingNo">运单号：{{ info.trackingNo }}</div>
            <div class="meta">
              订单号 {{ info.orderNo }}
              <el-tag v-if="info.status" :type="logisticsStatusType[info.status]" size="small">
                {{ info.statusLabel }}
              </el-tag>
            </div>
          </div>

          <el-steps :active="activeStep" finish-status="success" align-center class="steps">
            <el-step title="已揽收" :description="fmt(info.shippedAt)" />
            <el-step title="运输中" />
            <el-step title="派送中" />
            <el-step title="已签收" :description="fmt(info.signedAt)" />
          </el-steps>

          <div class="receiver">
            <span>收货人：{{ info.receiverName }}</span>
            <span>电话：{{ info.receiverPhone }}</span>
            <span>地址：{{ info.address || '—' }}</span>
          </div>
        </div>

        <div class="card timeline-card">
          <div class="section-title">物流轨迹</div>
          <el-empty v-if="!info.traces || info.traces.length === 0" description="商家还未发货，暂无物流信息" :image-size="90" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="(t, i) in info.traces"
              :key="t.id"
              :timestamp="fmt(t.occurredAt)"
              :type="i === 0 ? 'danger' : 'primary'"
              :hollow="i !== 0"
              placement="top"
            >
              <div class="trace" :class="{ latest: i === 0 }">{{ t.description }}</div>
              <div class="trace-loc" v-if="t.location">{{ t.location }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <p class="note">
          物流状态由商家在后台发货、更新时维护，依次为「已揽收 → 运输中 → 派送中 → 已签收」。
        </p>
      </template>

      <el-empty v-else-if="!loading" description="未找到该订单的物流信息">
        <el-button type="primary" @click="$router.push('/customer/orders')">返回我的订单</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import http from '../api'
import { logisticsStatusType, LOGISTICS_FLOW } from '../utils/status'

const route = useRoute()
const info = ref(null)
const loading = ref(false)

const activeStep = computed(() => {
  const idx = LOGISTICS_FLOW.indexOf(info.value?.status)
  return idx < 0 ? 0 : idx + 1
})

function fmt(v) {
  return v ? String(v).replace('T', ' ').slice(0, 19) : ''
}

async function load() {
  loading.value = true
  try {
    info.value = await http.get(`/customer/orders/${route.params.orderId}/logistics`)
  } catch (e) {
    info.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.page { min-height: 100vh; background: #fbf8f3; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 14px 28px; background: #fff; border-bottom: 1px solid #eee; }
.header .back { cursor: pointer; font-size: 22px; color: #b85042; width: 24px; }
.logo { font-size: 18px; font-weight: 700; color: #b85042; }
.spacer { width: 24px; }
.main { max-width: 760px; margin: 0 auto; padding: 24px 20px 60px; }
.card { background: #fff; border: 1px solid #f0e9e0; border-radius: 14px; padding: 24px; margin-bottom: 16px; }
.waybill { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding-bottom: 16px; border-bottom: 1px dashed #f0e9e0; margin-bottom: 18px; }
.company { display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 700; color: #2b2622; }
.badge { background: #b85042; color: #fff; font-size: 12px; font-weight: 400; padding: 2px 8px; border-radius: 6px; }
.no { font-size: 13px; color: #6b625b; }
.meta { font-size: 12px; color: #8a8178; display: flex; align-items: center; gap: 8px; }
.steps { margin: 10px 0 18px; }
.receiver { display: flex; flex-wrap: wrap; gap: 18px; font-size: 13px; color: #6b625b; }
.timeline-card { padding-bottom: 8px; }
.section-title { font-weight: 700; color: #2b2622; margin-bottom: 18px; }
.trace { font-size: 14px; color: #5c534c; }
.trace.latest { color: #b85042; font-weight: 600; }
.trace-loc { font-size: 12px; color: #a29890; margin-top: 4px; }
.note { font-size: 12px; color: #8a8178; line-height: 1.7; }
</style>
