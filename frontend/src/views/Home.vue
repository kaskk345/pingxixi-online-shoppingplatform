<template>
  <div class="home">
    <header class="header">
      <div class="brand">在线购物系统</div>
      <router-link to="/login" class="seller-link">卖家后台</router-link>
    </header>

    <div class="container">
      <div v-if="product" class="product-card">
        <div class="img">
          <img v-if="product.imageUrl" :src="product.imageUrl" alt="商品图" />
          <div v-else class="placeholder">商品图片</div>
        </div>
        <div class="info">
          <h2>{{ product.name }}</h2>
          <p class="desc">{{ product.description }}</p>
          <p class="price">¥ {{ product.price }}</p>
          <p class="tip">仅此一件，售出后再制作下一件 · 线下交易，一手交钱一手交货</p>
          <el-button type="primary" size="large" @click="openBuy">立即购买</el-button>
        </div>
      </div>
      <el-empty v-else description="商品制作中，敬请期待" />
    </div>

    <el-card class="query">
      <template #header>查询购买进度</template>
      <el-form inline>
        <el-form-item label="意向编号">
          <el-input v-model="qId" placeholder="提交意向时返回的编号" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="qPhone" placeholder="下单时填写的手机号" />
        </el-form-item>
        <el-button type="primary" @click="query">查询</el-button>
      </el-form>
      <el-alert v-if="result" type="info" :closable="false" style="margin-top:8px">
        <template #title>
          意向 #{{ result.id }}：{{ intentStatus[result.status] }}，价格快照 ¥{{ result.priceSnapshot }}
        </template>
      </el-alert>
    </el-card>

    <el-dialog v-model="dialog" title="填写购买信息" width="420px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="form.buyerName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.buyerPhone" placeholder="用于卖家联系您" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.buyerNote" type="textarea" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="submit">提交意向</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import http from '../api'
import { intentStatus } from '../utils/status'

const product = ref(null)
const dialog = ref(false)
const form = ref({ buyerName: '', buyerPhone: '', buyerNote: '' })
const qId = ref('')
const qPhone = ref('')
const result = ref(null)

async function load() {
  product.value = await http.get('/products/on-sale')
}

function openBuy() {
  form.value = { buyerName: '', buyerPhone: '', buyerNote: '' }
  dialog.value = true
}

async function submit() {
  if (!form.value.buyerName || !form.value.buyerPhone) {
    ElMessage.warning('请填写姓名和手机号')
    return
  }
  const r = await http.post('/intents', { productId: product.value.id, ...form.value })
  dialog.value = false
  ElMessage.success('提交成功，意向编号：' + r.id)
}

async function query() {
  if (!qId.value || !qPhone.value) {
    ElMessage.warning('请填写意向编号和手机号')
    return
  }
  result.value = await http.get('/intents/query', { params: { id: qId.value, phone: qPhone.value } })
}

onMounted(load)
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  height: 60px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.brand {
  font-size: 20px;
  font-weight: 700;
  color: #2f6fd0;
}
.seller-link {
  color: #666;
}
.container {
  max-width: 860px;
  margin: 40px auto;
}
.product-card {
  display: flex;
  gap: 32px;
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.img {
  width: 280px;
  height: 280px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f2f5;
}
.img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
}
.info h2 {
  font-size: 26px;
  margin-bottom: 12px;
}
.desc {
  color: #666;
  line-height: 1.7;
  margin-bottom: 20px;
}
.price {
  font-size: 30px;
  color: #e64545;
  font-weight: 700;
  margin-bottom: 8px;
}
.tip {
  font-size: 13px;
  color: #999;
  margin-bottom: 24px;
}
.query {
  max-width: 860px;
  margin: 0 auto 40px;
}
</style>
