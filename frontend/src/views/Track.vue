<template>
  <div class="track">
    <header class="header">
      <span class="back" @click="$router.push('/')">‹</span>
      <span class="title">查询我的购买意向</span>
      <span class="spacer"></span>
    </header>

    <div class="box">
      <p class="lead">输入提交意向时拿到的口令码，查看排队位次、修改联系方式或撤销意向。</p>
      <div class="search">
        <el-input v-model="code" placeholder="请输入口令码" maxlength="16" @keyup.enter="doTrack" />
        <el-button type="primary" @click="doTrack">查询</el-button>
      </div>

      <div v-if="view" class="result">
        <div class="row">
          <span class="label">商品</span>
          <span class="value">{{ view.productName }}</span>
        </div>
        <div class="row">
          <span class="label">当前状态</span>
          <el-tag :type="tagType">{{ intentStatus[view.status] }}</el-tag>
        </div>
        <div class="row" v-if="view.position">
          <span class="label">排队位次</span>
          <span class="value">
            第 <b>{{ view.position }}</b> 位（前面还有 {{ view.aheadCount }} 人）
          </span>
        </div>
        <div class="row" v-if="view.result">
          <span class="label">交易结果</span>
          <span class="value">{{ intentStatus[view.result] }}</span>
        </div>

        <el-divider />

        <el-form :model="form" label-width="80px" v-if="view.canModify">
          <el-form-item label="姓名">
            <el-input v-model="form.buyerName" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="form.buyerPhone" />
          </el-form-item>
          <div class="ops">
            <el-button type="primary" @click="save">保存修改</el-button>
            <el-button type="danger" plain @click="cancel">撤销意向</el-button>
          </div>
          <p class="tip">修改姓名与电话不会改变排队位次，也不会重新排队。</p>
        </el-form>
        <p v-else class="tip">该意向已结束或商品已下架，口令码不可再修改或撤销。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api'
import { intentStatus } from '../utils/status'

const route = useRoute()
const code = ref('')
const view = ref(null)
const form = ref({ buyerName: '', buyerPhone: '' })
const tagType = ref('info')

async function doTrack() {
  if (!code.value.trim()) return ElMessage.warning('请输入口令码')
  try {
    const res = await http.get('/intents/track', { params: { code: code.value.trim() } })
    view.value = res
    form.value = { buyerName: res.buyerName, buyerPhone: res.buyerPhone }
    tagType.value = { WAITING: 'warning', TRADING: 'primary', SUCCEEDED: 'success', FAILED: 'danger' }[res.status] || 'info'
  } catch (e) {
    view.value = null
  }
}

async function save() {
  if (!form.value.buyerName.trim() || !form.value.buyerPhone.trim()) {
    return ElMessage.warning('姓名与联系电话都不能为空')
  }
  try {
    await http.put('/intents/track', {
      code: code.value.trim(),
      buyerName: form.value.buyerName.trim(),
      buyerPhone: form.value.buyerPhone.trim()
    })
    ElMessage.success('已保存')
    doTrack()
  } catch (e) { /* 拦截器提示 */ }
}

async function cancel() {
  await ElMessageBox.confirm('撤销后将从队列中移除，后面的意向依次前移。确认撤销？', '提示', { type: 'warning' })
  try {
    await http.post('/intents/cancel', { code: code.value.trim() })
    ElMessage.success('已撤销意向')
    doTrack()
  } catch (e) { /* 拦截器提示 */ }
}

// 提交意向后跳转过来时自动带上口令码
onMounted(() => {
  if (route.query.code) {
    code.value = String(route.query.code)
    doTrack()
  }
})
</script>

<style scoped>
.track {
  min-height: 100vh;
  background: #fbf8f3;
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  font-size: 18px;
  border-bottom: 1px solid #eee;
}
.back {
  cursor: pointer;
  font-size: 24px;
}
.spacer {
  flex: 1;
}
.box {
  max-width: 560px;
  margin: 24px auto;
  background: #fff;
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}
.lead {
  color: #6b625b;
  font-size: 13px;
  line-height: 1.7;
  margin-bottom: 14px;
}
.search {
  display: flex;
  gap: 10px;
}
.result {
  margin-top: 18px;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 0;
  font-size: 14px;
}
.label {
  width: 80px;
  color: #8a8178;
}
.value b {
  color: #b85042;
  font-size: 17px;
}
.ops {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.tip {
  color: #a09890;
  font-size: 12px;
  line-height: 1.7;
  margin-top: 10px;
}
</style>
