<template>
  <div class="page">
    <header class="header">
      <span class="logo">我的售后</span>
      <div>
        <el-button link @click="$router.push('/customer/orders')">我的订单</el-button>
        <el-button link @click="$router.push('/')">返回首页</el-button>
      </div>
    </header>

    <div class="main" v-loading="loading">
      <div class="toolbar">
        <el-radio-group v-model="statusFilter" size="small">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button v-for="(label, key) in afterSaleStatus" :key="key" :value="key">{{ label }}</el-radio-button>
        </el-radio-group>
        <el-button size="small" @click="load">刷新</el-button>
      </div>

      <el-table :data="filtered" border empty-text="暂无售后申请">
        <el-table-column prop="afterSaleNo" label="售后单号" width="190" />
        <el-table-column label="商品" min-width="220">
          <template #default="{ row }">
            <div class="item">
              <el-image v-if="row.productImage" :src="row.productImage" class="thumb" fit="cover" />
              <span>{{ row.productName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="问题标题" min-width="180" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">{{ row.typeLabel }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="afterSaleStatusType[row.status]">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="170">
          <template #default="{ row }">{{ fmt(row.appliedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openDetail(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <p class="note">规则：订单发货后可申请售后，交易完成后 7 天内仍可申请；商家给出结果前可撤销。</p>
    </div>

    <el-drawer v-model="drawerVisible" title="售后详情" size="560px">
      <template v-if="detail">
        <div class="head">
          <el-tag :type="afterSaleStatusType[detail.status]" size="large">{{ detail.statusLabel }}</el-tag>
          <span class="no">{{ detail.afterSaleNo }}</span>
        </div>

        <div class="item box">
          <el-image v-if="detail.productImage" :src="detail.productImage" class="thumb" fit="cover" />
          <div class="info">
            <div class="name">{{ detail.productName }}</div>
            <div class="meta">订单 {{ detail.orderNo }} · ¥ {{ detail.itemAmount }} × {{ detail.quantity }}</div>
          </div>
        </div>

        <el-descriptions :column="1" border size="small" class="desc">
          <el-descriptions-item label="售后类型">{{ detail.typeLabel }}</el-descriptions-item>
          <el-descriptions-item label="问题标题">{{ detail.title }}</el-descriptions-item>
          <el-descriptions-item label="问题描述">{{ detail.description || '—' }}</el-descriptions-item>
          <el-descriptions-item label="处理结果">{{ detail.resultLabel || '商家处理中' }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.refundAmount" label="退款金额">¥ {{ detail.refundAmount }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.refund" label="退款单号">{{ detail.refund.refundNo }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.returnTrackingNo" label="退货物流">
            {{ detail.returnExpressCompanyLabel }} {{ detail.returnTrackingNo }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="detail.images && detail.images.length" class="images">
          <div class="sub-title">凭证图片</div>
          <el-image
            v-for="(img, i) in detail.images"
            :key="i"
            :src="img"
            class="proof"
            fit="cover"
            :preview-src-list="detail.images"
            :initial-index="i"
          />
        </div>

        <div class="sub-title">协商记录</div>
        <el-timeline>
          <el-timeline-item
            v-for="log in detail.logs"
            :key="log.id"
            :timestamp="fmt(log.createdAt)"
            :type="logType(log.role)"
          >
            <span class="role">{{ roleLabel(log.role) }}</span>{{ log.content }}
          </el-timeline-item>
        </el-timeline>

        <div class="actions">
          <el-button v-if="detail.cancellable" type="danger" plain @click="cancelDetail">撤销申请</el-button>
          <el-button v-if="detail.canShipBack && !detail.returnTrackingNo" type="primary" @click="openShipBack">
            填写退货物流
          </el-button>
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="shipBackVisible" title="填写退货物流" width="440px">
      <el-form :model="shipBackForm" label-width="90px">
        <el-form-item label="快递公司">
          <el-select v-model="shipBackForm.expressCompany" style="width: 100%">
            <el-option v-for="c in expressCompanies" :key="c.code" :label="c.label" :value="c.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="退货运单号">
          <el-input v-model="shipBackForm.trackingNo" placeholder="请填写快递单号" maxlength="40" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipBackVisible = false">取消</el-button>
        <el-button type="primary" @click="submitShipBack">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api'
import {
  afterSaleStatus,
  afterSaleStatusType,
  expressCompanies
} from '../utils/status'

const list = ref([])
const loading = ref(false)
const statusFilter = ref('')
const drawerVisible = ref(false)
const detail = ref(null)
const shipBackVisible = ref(false)
const shipBackForm = ref({ expressCompany: 'SF', trackingNo: '' })

const filtered = computed(() =>
  statusFilter.value ? list.value.filter((a) => a.status === statusFilter.value) : list.value
)

function fmt(v) {
  return v ? String(v).replace('T', ' ').slice(0, 19) : ''
}

function roleLabel(role) {
  if (role === 'CUSTOMER') return '我：'
  if (role === 'SELLER') return '商家：'
  return '系统：'
}

function logType(role) {
  if (role === 'CUSTOMER') return 'primary'
  if (role === 'SELLER') return 'warning'
  return 'info'
}

async function load() {
  loading.value = true
  try {
    list.value = await http.get('/customer/after-sales')
  } finally {
    loading.value = false
  }
}

async function openDetail(row) {
  detail.value = await http.get(`/customer/after-sales/${row.id}`)
  drawerVisible.value = true
}

async function cancelDetail() {
  await ElMessageBox.confirm('确认撤销该售后申请？', '撤销申请', { type: 'warning' })
  try {
    detail.value = await http.post(`/customer/after-sales/${detail.value.id}/cancel`)
    ElMessage.success('已撤销')
    await load()
  } catch (e) {
    /* 拦截器已提示 */
  }
}

function openShipBack() {
  shipBackForm.value = { expressCompany: 'SF', trackingNo: '' }
  shipBackVisible.value = true
}

async function submitShipBack() {
  if (!shipBackForm.value.trackingNo.trim()) return ElMessage.warning('请填写退货运单号')
  try {
    detail.value = await http.post(`/customer/after-sales/${detail.value.id}/ship-back`, {
      expressCompany: shipBackForm.value.expressCompany,
      trackingNo: shipBackForm.value.trackingNo.trim()
    })
    shipBackVisible.value = false
    ElMessage.success('退货物流已提交，等待商家确认收货')
    await load()
  } catch (e) {
    /* 拦截器已提示 */
  }
}

onMounted(load)
</script>

<style scoped>
.page { min-height: 100vh; background: #fbf8f3; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 14px 28px; background: #fff; border-bottom: 1px solid #eee; }
.logo { font-size: 20px; font-weight: 700; color: #b85042; }
.main { max-width: 1180px; margin: 0 auto; padding: 24px 20px 60px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; gap: 12px; flex-wrap: wrap; }
.item { display: flex; align-items: center; gap: 10px; }
.thumb { width: 44px; height: 44px; border-radius: 6px; flex: none; }
.box { padding: 12px; background: #fdfbf8; border-radius: 8px; margin-bottom: 14px; }
.name { color: #2b2622; }
.meta { font-size: 12px; color: #8a8178; margin-top: 4px; }
.note { margin-top: 14px; font-size: 12px; color: #8a8178; }
.head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.no { color: #8a8178; font-size: 13px; }
.desc { margin-bottom: 16px; }
.images { margin-bottom: 16px; }
.proof { width: 84px; height: 84px; border-radius: 6px; margin-right: 8px; border: 1px solid #f0e9e0; }
.sub-title { font-weight: 600; color: #6b625b; margin: 8px 0 10px; }
.role { color: #b85042; font-weight: 600; }
.actions { margin-top: 12px; display: flex; gap: 10px; }
</style>
