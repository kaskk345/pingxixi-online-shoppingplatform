<template>
  <div>
    <div class="toolbar">
      <el-tag type="warning">先到先得：按提交时间排队，只能与排在最前面的意向人开始交易</el-tag>
      <el-tag type="info" style="margin-left: 8px">卖家侧不展示口令码</el-tag>
    </div>

    <el-table :data="intents" border>
      <el-table-column prop="id" label="编号" width="70" />
      <el-table-column prop="buyerName" label="姓名" width="100" />
      <el-table-column prop="buyerPhone" label="联系电话" width="130" />
      <el-table-column prop="buyerNote" label="备注" min-width="120" />
      <el-table-column prop="createdAt" label="提交时间" width="180" />
      <el-table-column label="排队位次" width="90">
        <template #default="{ row }">
          <span v-if="row.position">第 {{ row.position }} 位</span>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="type[row.status]">{{ intentStatus[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="交易结果" width="100">
        <template #default="{ row }">
          <span v-if="row.result">{{ intentStatus[row.result] }}</span>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template #default="{ row }">
          <el-button v-if="row.status === 'WAITING'" size="small" type="primary" @click="act('start', row)">开始交易</el-button>
          <el-button v-if="row.status === 'TRADING'" size="small" type="success" @click="act('succeed', row)">交易成功</el-button>
          <el-button v-if="row.status === 'TRADING'" size="small" type="danger" @click="act('fail', row)">交易失败</el-button>
          <el-button v-if="row.status === 'FAILED'" size="small" type="warning" @click="act('requeue', row)">重新排队</el-button>
          <el-button v-if="row.status === 'FAILED'" size="small" @click="act('void', row)">作废</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../../api'
import { intentStatus } from '../../utils/status'

const intents = ref([])
const type = {
  WAITING: 'warning',
  TRADING: 'primary',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  VOID: 'info',
  CANCELED: 'info'
}

async function load() {
  intents.value = await http.get('/seller/intents')
}

async function act(action, row) {
  const map = {
    start: '与该意向人开始交易（商品将自动冻结）',
    succeed: '标记交易成功（商品直接下架，其余排队意向作废）',
    fail: '标记交易失败（商品恢复在售）',
    requeue: '让该意向重新排队（排队时间刷新，位次到队尾）',
    void: '将该失败意向作废（不再排队）'
  }
  await ElMessageBox.confirm(`确认${map[action]}？`, '提示', { type: 'warning' })
  await http.post(`/seller/intents/${row.id}/${action}`)
  ElMessage.success('操作成功')
  load()
}

onMounted(load)
</script>

<style scoped>
.toolbar {
  margin-bottom: 16px;
}
</style>
