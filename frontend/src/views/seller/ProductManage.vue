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
          <el-button v-if="buyable(row.status)" size="small" type="warning" @click="action('freeze', row)">冻结</el-button>
          <el-button v-if="row.status === 'FROZEN'" size="small" type="success" @click="action('unfreeze', row)">解冻</el-button>
          <el-button v-if="buyable(row.status)" size="small" @click="action('off-shelf', row)">手动下架</el-button>
          <template v-if="row.status === 'OFF_SHELF'">
            <el-tag size="small" type="info">历史商品（只读）</el-tag>
            <el-button size="small" @click="openHistory(row)">查看</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="historyVisible" title="历史商品详情" width="680px">
      <template v-if="historyProduct">
        <el-divider content-position="left">商品信息</el-divider>
        <div class="hist-product">
          <el-image v-if="historyProduct.imageUrl" :src="historyProduct.imageUrl" style="width: 96px; height: 96px" fit="cover" />
          <ul class="hist-info">
            <li><span>名称：</span>{{ historyProduct.name }}</li>
            <li><span>分类：</span>{{ historyProduct.category || '—' }}</li>
            <li><span>价格：</span>¥ {{ historyProduct.price }}</li>
            <li><span>状态：</span>{{ productStatus[historyProduct.status] }}</li>
            <li><span>库存：</span>{{ historyProduct.stock }}　<span>销量：</span>{{ historyProduct.sales }}</li>
            <li><span>发布时间：</span>{{ historyProduct.createdAt }}</li>
            <li v-if="historyProduct.soldAt"><span>成交时间：</span>{{ historyProduct.soldAt }}</li>
          </ul>
        </div>
        <p class="hist-desc">{{ historyProduct.description }}</p>

        <el-divider content-position="left">购买意向（买家姓名 / 电话）</el-divider>
        <el-table :data="historyIntents" border empty-text="该商品暂无购买意向">
          <el-table-column prop="buyerName" label="姓名" width="110" />
          <el-table-column prop="buyerPhone" label="联系电话" width="140" />
          <el-table-column prop="buyerNote" label="备注" min-width="120" />
          <el-table-column prop="createdAt" label="提交时间" width="180" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="intentType[row.status]">{{ intentStatus[row.status] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="交易结果" width="100">
            <template #default="{ row }">{{ row.result ? intentStatus[row.result] : '—' }}</template>
          </el-table-column>
        </el-table>

        <el-pagination
          class="pager"
          layout="total, prev, pager, next"
          :total="histTotal"
          :page-size="histSize"
          :current-page="histPage"
          @current-change="(p) => { histPage = p; loadHistory() }"
        />
      </template>
    </el-dialog>

    <el-dialog v-model="dialog" title="发布商品" width="480px">
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
import { productStatus, buyable, intentStatus } from '../../utils/status'

const products = ref([])
const dialog = ref(false)
const form = ref({ name: '', description: '', price: 1, imageUrl: '', category: '' })
const statusType = { ON_SALE: 'success', RESTORED: 'success', FROZEN: 'warning', OFF_SHELF: 'info' }
const intentType = { WAITING: 'warning', TRADING: 'primary', SUCCEEDED: 'success', FAILED: 'danger', VOID: 'info', CANCELED: 'info' }
const categories = ['数码', '食品', '服饰', '家居', '美妆', '日用']

const historyVisible = ref(false)
const historyProduct = ref(null)
const historyIntents = ref([])
const histPage = ref(1)
const histSize = ref(20)
const histTotal = ref(0)

async function openHistory(row) {
  historyProduct.value = row
  historyIntents.value = []
  histPage.value = 1
  historyVisible.value = true
  await loadHistory()
}

async function loadHistory() {
  if (!historyProduct.value) return
  const res = await http.get('/seller/intents', {
    params: { productId: historyProduct.value.id, page: histPage.value - 1, size: histSize.value }
  })
  historyIntents.value = res.content
  histTotal.value = res.totalElements
}

async function load() {
  products.value = await http.get('/seller/products')
}

function openCreate() {
  form.value = { name: '', description: '', price: 1, imageUrl: '', category: '' }
  dialog.value = true
}

async function save() {
  await http.post('/seller/products', { ...form.value })
  dialog.value = false
  ElMessage.success('发布成功')
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
.hist-product {
  display: flex;
  gap: 16px;
}
.hist-info {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
  color: #4b4540;
  line-height: 1.9;
}
.hist-info span {
  color: #8a8178;
}
.hist-desc {
  margin: 12px 0 0;
  color: #6b625b;
  font-size: 13px;
  line-height: 1.7;
}
.pager {
  margin-top: 16px;
  justify-content: center;
}
</style>
