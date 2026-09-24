<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openCreate">发布商品</el-button>
      <el-tag style="margin-left: 12px" type="info">同一时刻最多一件在售商品</el-tag>
    </div>

    <el-table :data="products" border>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="图片" width="90">
        <template #default="{ row }">
          <el-image v-if="row.imageUrl" :src="row.imageUrl" style="width: 60px; height: 60px" fit="cover" />
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column label="价格" width="100">
        <template #default="{ row }">¥ {{ row.price }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType[row.status]">{{ productStatus[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="发布时间" width="180" />
      <el-table-column label="操作" width="300">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button v-if="row.status === 'ON_SALE'" size="small" type="warning" @click="action('freeze', row)">冻结</el-button>
          <el-button v-if="row.status === 'FROZEN'" size="small" type="success" @click="action('restore', row)">恢复上线</el-button>
          <el-button v-if="row.status === 'ON_SALE'" size="small" @click="action('off-shelf', row)">下架</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog" :title="editing ? '编辑商品' : '发布商品'" width="480px">
      <el-form :model="form" label-width="70px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0.01" :precision="2" :step="10" />
        </el-form-item>
        <el-form-item label="图片">
          <div>
            <el-upload :show-file-list="false" :http-request="upload" accept="image/*">
              <el-button>上传图片</el-button>
            </el-upload>
            <el-image v-if="form.imageUrl" :src="form.imageUrl" style="width: 80px; height: 80px; margin-top: 8px" fit="cover" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../../api'
import { productStatus } from '../../utils/status'

const products = ref([])
const dialog = ref(false)
const editing = ref(null)
const form = ref({ name: '', description: '', price: 1, imageUrl: '' })
const statusType = { ON_SALE: 'success', FROZEN: 'warning', SOLD: 'info', OFF_SHELF: 'info' }

async function load() {
  products.value = await http.get('/seller/products')
}

function openCreate() {
  editing.value = null
  form.value = { name: '', description: '', price: 1, imageUrl: '' }
  dialog.value = true
}

function openEdit(row) {
  editing.value = row
  form.value = {
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.imageUrl
  }
  dialog.value = true
}

async function save() {
  const payload = { ...form.value }
  if (editing.value) {
    await http.put(`/seller/products/${editing.value.id}`, payload)
  } else {
    await http.post('/seller/products', payload)
  }
  dialog.value = false
  ElMessage.success('保存成功')
  load()
}

async function upload({ file }) {
  const fd = new FormData()
  fd.append('file', file)
  const url = await http.post('/seller/upload', fd)
  form.value.imageUrl = url
  ElMessage.success('上传成功')
}

async function action(type, row) {
  const map = { freeze: '冻结', restore: '恢复上线', 'off-shelf': '下架' }
  await ElMessageBox.confirm(`确认${map[type]}商品「${row.name}」？`, '提示', { type: 'warning' })
  await http.post(`/seller/products/${row.id}/${type}`)
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
