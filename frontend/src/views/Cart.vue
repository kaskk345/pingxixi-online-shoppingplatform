<template>
  <div class="page">
    <header class="header">
      <span class="logo">购物车</span>
      <div class="links">
        <el-button link @click="$router.push('/')">返回首页</el-button>
        <el-button link @click="$router.push('/favorites')">我的收藏</el-button>
        <el-button link @click="$router.push('/customer/orders')">我的订单</el-button>
      </div>
    </header>

    <div class="main">
      <el-alert
        class="tip"
        type="info"
        :closable="false"
        title="勾选多件商品可合并下单；也可将勾选的商品批量转为收藏。"
      />

      <el-table
        v-if="items.length"
        ref="tableRef"
        :data="items"
        border
        row-key="id"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="48" :selectable="(row) => row.available" />
        <el-table-column label="商品" min-width="240">
          <template #default="{ row }">
            <div class="product" @click="$router.push('/product/' + row.productId)">
              <el-image v-if="row.image" :src="row.image" class="thumb" fit="cover" />
              <div class="info">
                <div class="name">{{ row.name }}</div>
                <div class="sub">库存 {{ row.stock }} 件</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="110">
          <template #default="{ row }">¥ {{ row.price }}</template>
        </el-table-column>
        <el-table-column label="数量" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.quantity"
              :min="1"
              :max="row.stock || 1"
              size="small"
              @change="(v) => changeQty(row, v)"
            />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120">
          <template #default="{ row }">¥ {{ row.subtotal }}</template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.available ? 'success' : 'info'">{{ row.available ? '可下单' : '不可购买' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90">
          <template #default="{ row }">
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="empty">
        <div class="empty-icon">🛒</div>
        <h2>购物车还是空的</h2>
        <p>去首页挑选喜欢的商品吧。</p>
        <el-button type="danger" @click="$router.push('/')">去逛逛</el-button>
      </div>

      <div v-if="items.length" class="footer">
        <div class="summary">
          已选 <b>{{ selected.length }}</b> 件，合计 <span class="total">¥ {{ total }}</span>
        </div>
        <div>
          <el-button :disabled="!selected.length" @click="toFavorites">批量转收藏</el-button>
          <el-button type="danger" :disabled="!selected.length" @click="openCheckout">去结算</el-button>
        </div>
      </div>
    </div>

    <el-dialog v-model="checkoutVisible" title="确认订单" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="form.buyerName" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.buyerPhone" placeholder="请输入 11 位手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="交易地点">
          <el-input v-model="form.address" placeholder="请输入交易 / 收货地点" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="备注（可选）" />
        </el-form-item>
        <el-form-item label="商品">
          <div class="checkout-items">
            <div v-for="row in selected" :key="row.id" class="checkout-item">
              <span>{{ row.name }} × {{ row.quantity }}</span>
              <span>¥ {{ row.subtotal }}</span>
            </div>
            <div class="checkout-total">合计：¥ {{ total }}</div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="checkoutVisible = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="submitOrder">提交订单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api'

const router = useRouter()
const items = ref([])
const selected = ref([])
const tableRef = ref()
const checkoutVisible = ref(false)
const submitting = ref(false)
const form = ref({ buyerName: '', buyerPhone: '', address: '', remark: '' })

const total = computed(() =>
  selected.value.reduce((sum, row) => sum + Number(row.subtotal || 0), 0).toFixed(2)
)

async function load() {
  items.value = await http.get('/customer/cart')
}

function onSelectionChange(rows) {
  selected.value = rows
}

async function changeQty(row, value) {
  if (!value) return
  try {
    await http.put('/customer/cart/' + row.id, { quantity: value })
    await load()
  } catch (e) {
    await load()
  }
}

async function remove(row) {
  await ElMessageBox.confirm(`确认从购物车删除「${row.name}」？`, '提示', { type: 'warning' })
  await http.delete('/customer/cart/' + row.id)
  ElMessage.success('已删除')
  await load()
}

async function toFavorites() {
  await ElMessageBox.confirm(`确认将选中的 ${selected.value.length} 件商品转为收藏？`, '提示', { type: 'warning' })
  const moved = await http.post('/customer/cart/to-favorites', {
    itemIds: selected.value.map((r) => r.id)
  })
  ElMessage.success(`已转为收藏 ${moved} 件`)
  await load()
}

async function openCheckout() {
  const me = await http.get('/customer/me')
  form.value = {
    buyerName: me.username || '',
    buyerPhone: me.phone || '',
    address: me.defaultAddress || '',
    remark: ''
  }
  checkoutVisible.value = true
}

async function submitOrder() {
  if (!form.value.buyerName.trim()) return ElMessage.warning('请填写收货人')
  if (!/^1\d{10}$/.test(form.value.buyerPhone)) return ElMessage.warning('请填写正确的 11 位手机号')
  submitting.value = true
  try {
    const order = await http.post('/customer/cart/checkout', {
      itemIds: selected.value.map((r) => r.id),
      buyerName: form.value.buyerName.trim(),
      buyerPhone: form.value.buyerPhone,
      address: form.value.address,
      remark: form.value.remark
    })
    checkoutVisible.value = false
    ElMessage.success(`下单成功，订单号 ${order.orderNo}`)
    router.push('/customer/orders')
  } catch (e) {
    /* 拦截器已提示错误 */
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.page { min-height: 100vh; background: #fbf8f3; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 14px 28px; background: #fff; border-bottom: 1px solid #eee; }
.logo { font-size: 20px; font-weight: 700; color: #b85042; }
.main { max-width: 1080px; margin: 0 auto; padding: 24px 20px 60px; }
.tip { margin-bottom: 16px; }
.product { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.thumb { width: 56px; height: 56px; border-radius: 8px; flex: none; }
.info .name { font-weight: 600; color: #2b2622; }
.info .sub { font-size: 12px; color: #8a8178; margin-top: 4px; }
.footer { margin-top: 16px; background: #fff; border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05); }
.summary { color: #5c534c; }
.total { color: #b85042; font-size: 22px; font-weight: 700; }
.empty { background: #fff; border-radius: 14px; padding: 70px 20px; text-align: center; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05); }
.empty-icon { font-size: 48px; }
.empty h2 { margin: 14px 0 10px; color: #2b2622; }
.empty p { color: #6b625b; font-size: 14px; margin-bottom: 16px; }
.checkout-items { width: 100%; font-size: 13px; color: #5c534c; }
.checkout-item { display: flex; justify-content: space-between; padding: 4px 0; }
.checkout-total { margin-top: 6px; text-align: right; font-weight: 700; color: #b85042; }
</style>
