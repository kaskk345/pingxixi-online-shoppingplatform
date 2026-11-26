<template>
  <div>
    <div class="toolbar">
      <el-select v-model="status" placeholder="全部状态" clearable style="width: 160px" @change="reload">
        <el-option v-for="(label, key) in afterSaleStatus" :key="key" :label="label" :value="key" />
      </el-select>
      <el-button @click="load">刷新</el-button>
      <el-tag type="warning" style="margin-left: 12px">流程：待处理 → 协商中 → 退货中 / 已完成 / 已拒绝</el-tag>
    </div>

    <el-table :data="list" border>
      <el-table-column prop="afterSaleNo" label="售后单号" width="190" />
      <el-table-column label="商品" min-width="200">
        <template #default="{ row }">
          <div class="item">
            <el-image v-if="row.productImage" :src="row.productImage" class="thumb" fit="cover" />
            <span>{{ row.productName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">{{ row.typeLabel }}</template>
      </el-table-column>
      <el-table-column prop="title" label="问题标题" min-width="160" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="afterSaleStatusType[row.status]">{{ row.statusLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" width="170">
        <template #default="{ row }">{{ fmt(row.appliedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="130">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="openDetail(row)">处理</el-button>
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

    <el-dialog v-model="detailVisible" title="售后处理" width="680px">
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
          <el-descriptions-item label="客户诉求">{{ detail.typeLabel }}</el-descriptions-item>
          <el-descriptions-item label="问题标题">{{ detail.title }}</el-descriptions-item>
          <el-descriptions-item label="问题描述">{{ detail.description || '—' }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.returnTrackingNo" label="退货物流">
            {{ detail.returnExpressCompanyLabel }} {{ detail.returnTrackingNo }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detail.resultLabel" label="已定结果">{{ detail.resultLabel }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.refundAmount" label="退款金额">¥ {{ detail.refundAmount }}</el-descriptions-item>
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

        <template v-if="detail.status === 'PENDING' || detail.status === 'NEGOTIATING'">
          <div class="sub-title">协商回复</div>
          <el-input v-model="reply" type="textarea" :rows="2" placeholder="回复客户（线下协商结论）" maxlength="500" />
          <el-button class="mt" type="primary" plain :loading="acting" @click="doReply">发送回复</el-button>

          <div class="sub-title mt">给出处理结果</div>
          <el-form :model="resolveForm" label-width="90px">
            <el-form-item label="结果">
              <el-select v-model="resolveForm.result" style="width: 100%">
                <el-option v-for="(label, key) in afterSaleResult" :key="key" :label="label" :value="key" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="needRefund" label="退款金额">
              <el-input-number
                v-model="resolveForm.refundAmount"
                :min="0"
                :max="Number(detail.itemAmount)"
                :precision="2"
                :step="1"
                style="width: 100%"
              />
              <div class="hint">默认退该商品金额 ¥{{ detail.itemAmount }}，可调整，不超过可退余额</div>
            </el-form-item>
            <el-form-item label="处理说明">
              <el-input v-model="resolveForm.reply" type="textarea" :rows="2" placeholder="处理说明（可选）" />
            </el-form-item>
          </el-form>
          <el-button type="success" :loading="acting" @click="doResolve">提交结果</el-button>
        </template>

        <template v-if="detail.status === 'RETURNING'">
          <div class="sub-title mt">确认收到退货后，系统将执行退款并完成售后</div>
          <el-button type="success" :loading="acting" @click="doReceive">确认收到退货并退款</el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../../api'
import { afterSaleStatus, afterSaleStatusType, afterSaleResult } from '../../utils/status'

const list = ref([])
const status = ref('')
const page = ref(1)
const size = ref(20)
const total = ref(0)
const detailVisible = ref(false)
const detail = ref(null)
const reply = ref('')
const acting = ref(false)
const resolveForm = ref({ result: 'REFUND_ONLY', refundAmount: 0, reply: '' })

const needRefund = computed(() =>
  ['RETURN_REFUND', 'REFUND_ONLY'].includes(resolveForm.value.result)
)

function fmt(v) {
  return v ? String(v).replace('T', ' ').slice(0, 19) : ''
}

function roleLabel(role) {
  if (role === 'CUSTOMER') return '客户：'
  if (role === 'SELLER') return '商家：'
  return '系统：'
}

function logType(role) {
  if (role === 'CUSTOMER') return 'primary'
  if (role === 'SELLER') return 'warning'
  return 'info'
}

async function load() {
  const params = { page: page.value - 1, size: size.value }
  if (status.value) params.status = status.value
  const res = await http.get('/seller/after-sales', { params })
  list.value = res.content
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

async function openDetail(row) {
  detail.value = await http.get(`/seller/after-sales/${row.id}`)
  reply.value = ''
  resolveForm.value = {
    result: 'REFUND_ONLY',
    refundAmount: Number(detail.value.itemAmount || 0),
    reply: ''
  }
  detailVisible.value = true
}

async function refreshDetail() {
  detail.value = await http.get(`/seller/after-sales/${detail.value.id}`)
  await load()
}

async function doReply() {
  if (!reply.value.trim()) return ElMessage.warning('请填写回复内容')
  acting.value = true
  try {
    await http.post(`/seller/after-sales/${detail.value.id}/reply`, { content: reply.value.trim() })
    ElMessage.success('已回复，状态转为协商中')
    reply.value = ''
    await refreshDetail()
  } catch (e) {
    /* 拦截器已提示 */
  } finally {
    acting.value = false
  }
}

async function doResolve() {
  await ElMessageBox.confirm(`确认按「${afterSaleResult[resolveForm.value.result]}」处理该售后？`, '处理结果', {
    type: 'warning'
  })
  acting.value = true
  try {
    await http.post(`/seller/after-sales/${detail.value.id}/resolve`, {
      result: resolveForm.value.result,
      refundAmount: needRefund.value ? resolveForm.value.refundAmount : null,
      reply: resolveForm.value.reply
    })
    ElMessage.success('处理结果已提交')
    await refreshDetail()
  } catch (e) {
    /* 拦截器已提示 */
  } finally {
    acting.value = false
  }
}

async function doReceive() {
  await ElMessageBox.confirm('确认已收到退货？确认后将执行退款并完成售后。', '确认收货', { type: 'warning' })
  acting.value = true
  try {
    await http.post(`/seller/after-sales/${detail.value.id}/receive`)
    ElMessage.success('退款已执行，售后完成')
    await refreshDetail()
  } catch (e) {
    /* 拦截器已提示 */
  } finally {
    acting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.item { display: flex; align-items: center; gap: 10px; }
.thumb { width: 44px; height: 44px; border-radius: 6px; flex: none; }
.pager { margin-top: 16px; justify-content: center; }
.head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.no { color: #8a8178; font-size: 13px; }
.box { padding: 12px; background: #fdfbf8; border-radius: 8px; margin-bottom: 14px; }
.name { color: #2b2622; }
.meta { font-size: 12px; color: #8a8178; margin-top: 4px; }
.desc { margin-bottom: 16px; }
.images { margin-bottom: 16px; }
.proof { width: 84px; height: 84px; border-radius: 6px; margin-right: 8px; border: 1px solid #f0e9e0; }
.sub-title { font-weight: 600; color: #6b625b; margin: 8px 0 10px; }
.role { color: #b85042; font-weight: 600; }
.mt { margin-top: 12px; }
.hint { font-size: 12px; color: #a29890; margin-top: 4px; }
</style>
