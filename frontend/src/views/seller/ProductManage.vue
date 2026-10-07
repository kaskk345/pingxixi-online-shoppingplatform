<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openCreate">发布商品</el-button>
      <el-tag style="margin-left: 12px" type="warning">单品单卖：同一时刻仅允许 1 件在售</el-tag>
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
      <el-table-column prop="category" label="分类" width="90" />
      <el-table-column label="库存" width="70">
        <template #default="{ row }">{{ row.stock }}</template>
      </el-table-column>
      <el-table-column label="销量" width="80">
        <template #default="{ row }">{{ row.sales }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType[row.status]">{{ productStatus[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="发布时间" width="180" />
      <el-table-column label="操作" width="320">
        <template #default="{ row }">
          <el-button v-if="buyable(row.status)" size="small" @click="openEdit(row)">编辑</el-button>
          <el-button v-if="buyable(row.status)" size="small" type="warning" @click="action('freeze', row)">冻结</el-button>
          <el-button v-if="row.status === 'FROZEN'" size="small" type="success" @click="action('unfreeze', row)">解冻</el-button>
          <el-button v-if="buyable(row.status)" size="small" @click="action('off-shelf', row)">手动下架</el-button>
          <span v-if="row.status === 'OFF_SHELF'" class="readonly">历史商品（只读）</span>
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
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="选择或输入分类" filterable allow-create style="width: 100%">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
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
import { productStatus, buyable } from '../../utils/status'

const products = ref([])
const dialog = ref(false)
const editing = ref(null)
const form = ref({ name: '', description: '', price: 1, imageUrl: '', category: '' })
const statusType = { ON_SALE: 'success', RESTORED: 'success', FROZEN: 'warning', OFF_SHELF: 'info' }
const categories = ['数码', '食品', '服饰', '家居', '美妆', '日用']

async function load() {
  products.value = await http.get('/seller/products')
}

function openCreate() {
  editing.value = null
  form.value = { name: '', description: '', price: 1, imageUrl: '', category: '' }
  dialog.value = true
}

function openEdit(row) {
  editing.value = row
  form.value = {
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.imageUrl,
    category: row.category || ''
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
  const map = {
    freeze: '冻结（冻结期间不接受新的购买意向）',
    unfreeze: '解冻并恢复在售',
    'off-shelf': '手动下架（进入历史商品，不可再上架）'
  }
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
.readonly {
  color: #a09890;
  font-size: 12px;
}
</style>
