<template>
  <el-table :data="intents" border>
    <el-table-column prop="id" label="编号" width="70" />
    <el-table-column prop="buyerName" label="买家" width="100" />
    <el-table-column prop="buyerPhone" label="手机号" width="130" />
    <el-table-column prop="buyerNote" label="备注" min-width="120" />
    <el-table-column label="价格快照" width="100">
      <template #default="{ row }">¥ {{ row.priceSnapshot }}</template>
    </el-table-column>
    <el-table-column label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="type[row.status]">{{ intentStatus[row.status] }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="createdAt" label="提交时间" width="180" />
    <el-table-column label="操作" width="280">
      <template #default="{ row }">
        <el-button v-if="row.status === 'PENDING'" size="small" type="success" @click="act('accept', row)">同意</el-button>
        <el-button v-if="row.status === 'PENDING'" size="small" type="danger" @click="act('reject', row)">拒绝</el-button>
        <el-button v-if="row.status === 'ACCEPTED'" size="small" type="primary" @click="act('succeed', row)">成交撤下</el-button>
        <el-button v-if="row.status === 'ACCEPTED'" size="small" type="warning" @click="act('fail', row)">失败恢复</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../../api'
import { intentStatus } from '../../utils/status'

const intents = ref([])
const type = { PENDING: 'warning', ACCEPTED: 'primary', SUCCEEDED: 'success', FAILED: 'danger', REJECTED: 'info', EXPIRED: 'info' }

async function load() {
  intents.value = await http.get('/seller/intents')
}

async function act(action, row) {
  const map = { accept: '同意', reject: '拒绝', succeed: '登记成交并撤下商品', fail: '登记失败并恢复商品上线' }
  await ElMessageBox.confirm(`确认${map[action]}？`, '提示', { type: 'warning' })
  await http.post(`/seller/intents/${row.id}/${action}`)
  ElMessage.success('操作成功')
  load()
}

onMounted(load)
</script>
