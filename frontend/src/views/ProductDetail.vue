<template>
  <div class="detail" v-if="p">
    <header class="header">
      <span class="back" @click="$router.back()">‹</span>
      <span class="title">商品详情</span>
      <span class="spacer"></span>
    </header>

    <div class="gallery">
      <el-carousel v-if="images.length > 1" height="340px" indicator-position="outside">
        <el-carousel-item v-for="(img, i) in images" :key="i">
          <img class="carousel-img" :src="img" />
        </el-carousel-item>
      </el-carousel>
      <div v-else class="single">
        <img :src="images[0] || p.imageUrl" :alt="p.name" />
      </div>
    </div>

    <div class="info">
      <div class="price-row">
        <span class="price"><i>¥</i>{{ p.price }}</span>
        <span class="status">{{ productStatus[p.status] || p.status }}</span>
      </div>
      <h2 class="name">{{ p.name }}</h2>
      <div class="rich" v-html="p.description"></div>
      <div class="meta">
        <span class="tag">{{ p.category }}<template v-if="p.categoryL2"> / {{ p.categoryL2 }}</template></span>
        <span class="stock">库存 {{ p.stock }} 件</span>
      </div>
      <p class="note">注册客户登录后下单，可在「我的订单」中查看历史下单记录。</p>
    </div>

    <div class="bottom">
      <el-button size="large" type="danger" :disabled="!canBuy" @click="openBuy">
        {{ canBuy ? '提交购买意向' : '暂时无法购买' }}
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '../api'
import { productStatus, buyable } from '../utils/status'

const route = useRoute()
const p = ref(null)
const visible = ref(false)
const form = ref({ buyerName: '', buyerPhone: '', buyerNote: '' })

const images = computed(() => {
  if (!p.value) return []
  if (p.value.images) {
    const arr = p.value.images.split(',').filter(Boolean)
    if (arr.length) return arr
  }
  return p.value.imageUrl ? [p.value.imageUrl] : []
})

const canBuy = computed(() => p.value && buyable(p.value.status) && p.value.stock > 0)

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
    ElMessage.success(`意向提交成功，口令码 ${res.code}`)
  } catch (e) {
    /* 拦截器已提示错误 */
  }
}

onMounted(load)
</script>

<style scoped>
.detail { background: #fbf8f3; min-height: 100vh; padding-bottom: 90px; }
.header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; font-size: 18px; }
.back { cursor: pointer; font-size: 24px; }
.spacer { flex: 1; }
.gallery { background: #fff; }
.single { width: 100%; aspect-ratio: 1; background: #f0ede7; }
.single img { width: 100%; height: 100%; object-fit: cover; }
.carousel-img { width: 100%; height: 100%; object-fit: cover; }
.info { background: #fff; padding: 16px; }
.price-row { display: flex; align-items: baseline; justify-content: space-between; }
.price { color: #b85042; font-size: 28px; font-weight: 700; }
.price i { font-style: normal; font-size: 16px; }
.status { color: #8a8178; font-size: 13px; }
.name { font-size: 18px; margin: 10px 0 6px; }
.rich { color: #666; font-size: 14px; line-height: 1.7; }
.rich :deep(img) { max-width: 100%; }
.meta { display: flex; gap: 12px; margin-top: 12px; font-size: 13px; color: #666; align-items: center; }
.tag { background: #fdecec; color: #b85042; padding: 2px 8px; border-radius: 4px; }
.note { margin-top: 12px; font-size: 12px; color: #a09890; line-height: 1.7; }
.bottom { position: fixed; left: 0; right: 0; bottom: 0; background: #fff; display: flex; justify-content: center; padding: 12px 16px; box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06); }
</style>
