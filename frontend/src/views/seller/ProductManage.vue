<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openCreate">发布商品</el-button>
      <el-tag style="margin-left: 12px" type="success">多商品：可同时发布多件商品</el-tag>
    </div>

    <el-table :data="products" border>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="图片" width="90">
        <template #default="{ row }">
          <el-image v-if="firstImage(row)" :src="firstImage(row)" style="width: 60px; height: 60px" fit="cover" />
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="150" />
      <el-table-column label="价格" width="100">
        <template #default="{ row }">¥ {{ row.price }}</template>
      </el-table-column>
      <el-table-column label="分类" width="140">
        <template #default="{ row }">
          {{ row.category }}<template v-if="row.categoryL2"> / {{ row.categoryL2 }}</template>
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="70" />
      <el-table-column prop="sales" label="销量" width="70" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType[row.status]">{{ productStatus[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button v-if="buyable(row.status)" size="small" type="warning" @click="action('freeze', row)">冻结</el-button>
          <el-button v-if="row.status === 'FROZEN'" size="small" type="success" @click="action('unfreeze', row)">解冻</el-button>
          <el-button v-if="buyable(row.status)" size="small" @click="action('off-shelf', row)">下架</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog" :title="editingId ? '编辑商品' : '发布商品'" width="560px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="支持 HTML 富媒体描述" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0.01" :precision="2" :step="10" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" :step="1" />
        </el-form-item>
        <el-form-item label="一级分类">
          <el-select v-model="form.category" placeholder="选择一级分类" clearable style="width: 100%" @change="onCategoryChange">
            <el-option v-for="t in tree" :key="t.id" :label="t.name" :value="t.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类">
          <el-select v-model="form.categoryL2" placeholder="选择二级分类" clearable style="width: 100%" :disabled="!form.category">
            <el-option v-for="ch in categoryChildren" :key="ch.id" :label="ch.name" :value="ch.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="图片">
          <div class="uploader">
            <el-upload :show-file-list="false" :http-request="upload" accept="image/*">
              <el-button>上传图片</el-button>
            </el-upload>
            <div class="thumbs">
              <div v-for="(img, i) in form.images" :key="i" class="thumb-item">
                <el-image :src="img" style="width: 70px; height: 70px" fit="cover" />
                <el-button link type="danger" size="small" @click="form.images.splice(i, 1)">删除</el-button>
              </div>
            </div>
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../../api'
import { productStatus, buyable } from '../../utils/status'

const products = ref([])
const tree = ref([])
const dialog = ref(false)
const editingId = ref(null)
const form = ref({ name: '', description: '', price: 1, stock: 1, category: '', categoryL2: '', images: [] })
const statusType = { ON_SALE: 'success', RESTORED: 'success', FROZEN: 'warning', OFF_SHELF: 'info' }

const categoryChildren = computed(() => {
  const t = tree.value.find((x) => x.name === form.value.category)
  return t ? (t.children || []) : []
})

function firstImage(row) {
  if (row.images) {
    const a = row.images.split(',').filter(Boolean)
    if (a.length) return a[0]
  }
  return row.imageUrl || ''
}

async function load() {
  products.value = await http.get('/seller/products')
  tree.value = await http.get('/categories')
}

function openCreate() {
  editingId.value = null
  form.value = { name: '', description: '', price: 1, stock: 1, category: '', categoryL2: '', images: [] }
  dialog.value = true
}

function openEdit(row) {
  editingId.value = row.id
  const imgs = row.images ? row.images.split(',').filter(Boolean) : (row.imageUrl ? [row.imageUrl] : [])
  form.value = {
    name: row.name,
    description: row.description || '',
    price: row.price,
    stock: row.stock,
    category: row.category || '',
    categoryL2: row.categoryL2 || '',
    images: imgs
  }
  dialog.value = true
}

function onCategoryChange() {
  form.value.categoryL2 = ''
}

async function upload({ file }) {
  const fd = new FormData()
  fd.append('file', file)
  const url = await http.post('/seller/upload', fd)
  form.value.images.push(url)
  ElMessage.success('上传成功')
}

async function save() {
  if (!form.value.name.trim()) return ElMessage.warning('请填写商品名称')
  const payload = {
    name: form.value.name,
    description: form.value.description,
    imageUrl: form.value.images[0] || '',
    images: form.value.images.join(','),
    price: form.value.price,
    category: form.value.category,
    categoryL2: form.value.categoryL2,
    stock: form.value.stock
  }
  if (editingId.value) {
    await http.put(`/seller/products/${editingId.value}`, payload)
    ElMessage.success('修改成功')
  } else {
    await http.post('/seller/products', payload)
    ElMessage.success('发布成功')
  }
  dialog.value = false
  load()
}

async function action(type, row) {
  const map = { freeze: '冻结', unfreeze: '解冻并恢复在售', 'off-shelf': '手动下架' }
  await ElMessageBox.confirm(`确认${map[type]}商品「${row.name}」？`, '提示', { type: 'warning' })
  await http.post(`/seller/products/${row.id}/${type}`)
  ElMessage.success('操作成功')
  load()
}

onMounted(load)
</script>

<style scoped>
.toolbar { margin-bottom: 16px; }
.uploader { display: flex; flex-direction: column; gap: 8px; }
.thumbs { display: flex; gap: 10px; flex-wrap: wrap; }
.thumb-item { display: flex; flex-direction: column; align-items: center; }
</style>
