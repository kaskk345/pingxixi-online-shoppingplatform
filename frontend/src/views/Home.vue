<template>
  <div class="home">
    <header class="header">
      <div class="brand">
        <span class="logo">拼夕夕</span>
        <span class="slogan">小众定制 · 单品单卖</span>
      </div>
      <div class="actions">
        <el-button link @click="$router.push('/track')">查询我的意向</el-button>
        <el-button link type="primary" @click="$router.push('/login')">商家后台</el-button>
      </div>
    </header>

    <main class="main">
      <section v-if="product" class="showcase">
        <div class="gallery">
          <img :src="product.imageUrl" :alt="product.name" />
          <span class="badge">{{ productStatus[product.status] }}</span>
        </div>

        <div class="detail">
          <div class="tag">当前唯一在售 · 仅此 1 件</div>
          <h1 class="name">{{ product.name }}</h1>
          <p class="desc">{{ product.description }}</p>

          <div class="price-row">
            <span class="price"><i>¥</i>{{ product.price }}</span>
            <span class="stock">库存 {{ product.stock }} 件</span>
          </div>

          <ul class="tips">
            <li>买家无需注册，填写姓名与联系电话即可提交购买意向</li>
            <li>提交后会得到一个<b>口令码</b>，凭它可以查排队位次、改联系方式、撤销意向</li>
            <li>先到先得：按提交时间排队，排在最前面的意向先进入线下交易</li>
            <li>交易达成前商品会被冻结，冻结期间不接受新的意向</li>
          </ul>

          <el-button type="danger" size="large" :disabled="!buyable(product.status)" @click="openBuy">
            {{ buyable(product.status) ? '提交购买意向' : '商品交易中，暂不接受新的意向' }}
          </el-button>
        </div>
      </section>

      <section v-else class="empty">
        <div class="empty-icon">🛍️</div>
        <h2>当前没有在售商品</h2>
        <p>店主还没有发布商品，或上一件商品已完成交易。</p>
      </section>
    </main>

    <el-dialog v-model="buyVisible" title="提交购买意向" width="440px">
      <el-form :model="form" label-width="76px">
        <el-form-item label="姓名">
          <el-input v-model="form.buyerName" placeholder="请输入您的姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.buyerPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.buyerNote" type="textarea" :rows="2" placeholder="想对卖家说的话（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="buyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitIntent">提交意向</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api'
import { productStatus, buyable } from '../utils/status'

const router = useRouter()
const product = ref(null)
const buyVisible = ref(false)
const form = ref({ buyerName: '', buyerPhone: '', buyerNote: '' })

async function load() {
  product.value = await http.get('/products/on-sale')
}

function openBuy() {
  form.value = { buyerName: '', buyerPhone: '', buyerNote: '' }
  buyVisible.value = true
}

async function submitIntent() {
  const { buyerName, buyerPhone, buyerNote } = form.value
  if (!buyerName.trim()) return ElMessage.warning('请填写姓名')
  if (!buyerPhone.trim()) return ElMessage.warning('请填写联系电话')
  try {
    const res = await http.post('/intents', {
      productId: product.value.id,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerNote
    })
    buyVisible.value = false
    await ElMessageBox.alert(
      `请妥善保存你的口令码：\n\n${res.code}\n\n凭它可以查询排队位次、修改联系方式、撤销意向。`,
      '意向提交成功',
      { confirmButtonText: '我知道了' }
    )
    router.push({ path: '/track', query: { code: res.code } })
  } catch (e) {
    /* 拦截器已提示错误 */
  }
}

onMounted(load)
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #fbf8f3;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 28px;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.brand {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.logo {
  font-size: 22px;
  font-weight: 700;
  color: #b85042;
}
.slogan {
  font-size: 13px;
  color: #8a8178;
}
.actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.main {
  max-width: 1060px;
  margin: 0 auto;
  padding: 32px 20px 60px;
}
.showcase {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 36px;
  background: #fff;
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}
.gallery {
  position: relative;
  background: #f5f2ec;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
}
.gallery img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.badge {
  position: absolute;
  left: 12px;
  top: 12px;
  background: #b85042;
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
}
.detail {
  display: flex;
  flex-direction: column;
}
.tag {
  align-self: flex-start;
  background: #fdecec;
  color: #b85042;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
}
.name {
  font-size: 26px;
  margin: 14px 0 8px;
  color: #2b2622;
}
.desc {
  color: #6b625b;
  line-height: 1.7;
  font-size: 14px;
}
.price-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin: 18px 0 6px;
}
.price {
  color: #b85042;
  font-size: 34px;
  font-weight: 700;
}
.price i {
  font-style: normal;
  font-size: 18px;
  margin-right: 2px;
}
.stock {
  color: #8a8178;
  font-size: 13px;
}
.tips {
  margin: 14px 0 22px;
  padding-left: 18px;
  color: #6b625b;
  font-size: 13px;
  line-height: 1.9;
}
.empty {
  background: #fff;
  border-radius: 14px;
  padding: 70px 20px;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}
.empty-icon {
  font-size: 48px;
}
.empty h2 {
  margin: 14px 0 10px;
  color: #2b2622;
}
.empty p {
  color: #6b625b;
  font-size: 14px;
}
@media (max-width: 860px) {
  .showcase {
    grid-template-columns: 1fr;
  }
}
</style>
