<template>
  <div class="page">
    <header class="header">
      <span class="logo">收货地址</span>
      <div>
        <el-button link @click="$router.push('/')">返回首页</el-button>
        <el-button link @click="$router.push('/customer/orders')">我的订单</el-button>
        <el-button link @click="$router.push('/cart')">购物车</el-button>
      </div>
    </header>

    <div class="main" v-loading="loading">
      <div class="toolbar">
        <span class="tip">可维护多个收货地址，下单时选择其中一个；标记为默认的地址会在结算时自动选中。</span>
        <el-button type="danger" @click="openCreate">新增地址</el-button>
      </div>

      <el-empty v-if="!loading && list.length === 0" description="还没有收货地址">
        <el-button type="danger" @click="openCreate">新增地址</el-button>
      </el-empty>

      <div class="grid">
        <div v-for="a in list" :key="a.id" class="card" :class="{ active: a.isDefault }">
          <div class="card-head">
            <span class="name">{{ a.receiverName }}</span>
            <span class="phone">{{ a.receiverPhone }}</span>
            <el-tag v-if="a.isDefault" type="danger" size="small" effect="dark">默认</el-tag>
          </div>
          <div class="addr">{{ a.fullAddress }}</div>
          <div class="card-actions">
            <el-button v-if="!a.isDefault" link type="primary" @click="setDefault(a)">设为默认</el-button>
            <el-button link @click="openEdit(a)">编辑</el-button>
            <el-button link type="danger" @click="remove(a)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑地址' : '新增地址'" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="form.receiverName" placeholder="收货人姓名" maxlength="50" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.receiverPhone" placeholder="11 位手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="地区">
          <el-input v-model="form.region" placeholder="如：上海市普陀区" maxlength="100" />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="form.detail" type="textarea" :rows="2" placeholder="街道、门牌号、楼栋房间号" maxlength="255" />
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api'

const router = useRouter()
const list = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const form = ref(emptyForm())

function emptyForm() {
  return { id: null, receiverName: '', receiverPhone: '', region: '', detail: '', isDefault: false }
}

async function load() {
  loading.value = true
  try {
    list.value = await http.get('/customer/addresses')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = emptyForm()
  dialogVisible.value = true
}

function openEdit(a) {
  form.value = {
    id: a.id,
    receiverName: a.receiverName,
    receiverPhone: a.receiverPhone,
    region: a.region || '',
    detail: a.detail,
    isDefault: a.isDefault
  }
  dialogVisible.value = true
}

async function save() {
  if (!form.value.receiverName.trim()) return ElMessage.warning('请填写收货人')
  if (!/^1\d{10}$/.test(form.value.receiverPhone)) return ElMessage.warning('请填写正确的 11 位手机号')
  if (!form.value.detail.trim()) return ElMessage.warning('请填写详细地址')
  saving.value = true
  try {
    const payload = {
      receiverName: form.value.receiverName.trim(),
      receiverPhone: form.value.receiverPhone.trim(),
      region: form.value.region.trim(),
      detail: form.value.detail.trim(),
      isDefault: form.value.isDefault
    }
    if (form.value.id) {
      await http.put(`/customer/addresses/${form.value.id}`, payload)
      ElMessage.success('地址已更新')
    } else {
      await http.post('/customer/addresses', payload)
      ElMessage.success('地址已新增')
    }
    dialogVisible.value = false
    await load()
  } catch (e) {
    /* 拦截器已提示 */
  } finally {
    saving.value = false
  }
}

async function setDefault(a) {
  await http.post(`/customer/addresses/${a.id}/default`)
  ElMessage.success('已设为默认地址')
  await load()
}

async function remove(a) {
  await ElMessageBox.confirm(`确认删除「${a.receiverName} ${a.fullAddress}」这条地址？`, '删除地址', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
  try {
    await http.delete(`/customer/addresses/${a.id}`)
    ElMessage.success('地址已删除')
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
.main { max-width: 980px; margin: 0 auto; padding: 24px 20px 60px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
.tip { font-size: 13px; color: #8a8178; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.card { background: #fff; border: 1px solid #f0e9e0; border-radius: 12px; padding: 18px; transition: 0.2s; }
.card.active { border-color: #b85042; box-shadow: 0 4px 18px rgba(184, 80, 66, 0.1); }
.card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.name { font-weight: 700; color: #2b2622; }
.phone { color: #8a8178; font-size: 13px; flex: 1; }
.addr { color: #5c534c; font-size: 13px; line-height: 1.7; min-height: 44px; }
.card-actions { margin-top: 10px; display: flex; justify-content: flex-end; gap: 4px; }
</style>
