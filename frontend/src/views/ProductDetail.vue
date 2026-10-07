<template>
  <div class="detail" v-if="p">
    <header class="header">
      <span class="back" @click="$router.back()">‹</span>
      <span class="title">商品详情</span>
      <span class="spacer"></span>
    </header>

    <div class="img-wrap">
      <img :src="p.imageUrl" :alt="p.name" />
    </div>

    <div class="info">
      <div class="price-row">
        <span class="price"><i>¥</i>{{ p.price }}</span>
        <span class="status">{{ productStatus[p.status] || p.status }}</span>
      </div>
      <h2 class="name">{{ p.name }}</h2>
      <p class="desc">{{ p.description }}</p>
      <div class="meta">
        <span class="tag">{{ p.category }}</span>
        <span class="stock">仅此 {{ p.stock }} 件</span>
      </div>
      <p class="note">单品单卖：全站同一时刻只有一件商品在售，售出后才会开始制作下一件。</p>
    </div>

    <div class="bottom">
      <el-button size="large" type="danger" :disabled="!buyable(p.status)" @click="openBuy">
        {{ buyable(p.status) ? '提交购买意向' : '商品交易中，暂不接受新的意向' }}
      </el-button>
    </div>

    <el-dialog v-model="visible" title="提交购买意向" width="440px">
      <el-form :model="form" label-width="76px">
        <el-form-item label="姓名">
          <el-input v-model="form.buyerName" placeholder="请输入您的姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.buyerPhone" placeholder="请输入 11 位手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.buyerNote" type="textarea" :rows="2" placeholder="想对卖家说的话（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submitIntent">提交意向</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '../api'
import { productStatus, buyable } from '../utils/status'

const route = useRoute()
const p = ref(null)
const visible = ref(false)
const form = ref({ buyerName: '', buyerPhone: '', buyerNote: '' })

async function load() {
  p.value = await http.get('/products/' + route.params.id)
}

function openBuy() {
  form.value = { buyerName: '', buyerPhone: '', buyerNote: '' }
  visible.value = true
}

async function submitIntent() {
  const { buyerName, buyerPhone, buyerNote } = form.value
  if (!buyerName.trim()) return ElMessage.warning('请填写姓名')
  if (!/^1\d{10}$/.test(buyerPhone)) return ElMessage.warning('请填写正确的 11 位手机号')
  try {
    const res = await http.post('/intents', {
      productId: p.value.id,
      buyerName: buyerName.trim(),
      buyerPhone,
      buyerNote
    })
    visible.value = false
    ElMessage.success(`意向提交成功，意向编号 ${res.id}`)
  } catch (e) {
    /* 拦截器已提示错误 */
  }
}

onMounted(load)
</script>

<style scoped>
.detail {
  background: #fbf8f3;
  min-height: 100vh;
  padding-bottom: 90px;
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  font-size: 18px;
}
.back {
  cursor: pointer;
  font-size: 24px;
}
.spacer {
  flex: 1;
}
.img-wrap {
  width: 100%;
  aspect-ratio: 1;
  background: #f0ede7;
}
.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info {
  background: #fff;
  padding: 16px;
}
.price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.price {
  color: #b85042;
  font-size: 28px;
  font-weight: 700;
}
.price i {
  font-style: normal;
  font-size: 16px;
}
.status {
  color: #8a8178;
  font-size: 13px;
}
.name {
  font-size: 18px;
  margin: 10px 0 6px;
}
.desc {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}
.meta {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  font-size: 13px;
  color: #666;
  align-items: center;
}
.tag {
  background: #fdecec;
  color: #b85042;
  padding: 2px 8px;
  border-radius: 4px;
}
.note {
  margin-top: 12px;
  font-size: 12px;
  color: #a09890;
  line-height: 1.7;
}
.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  display: flex;
  justify-content: center;
  padding: 12px 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}
</style>
