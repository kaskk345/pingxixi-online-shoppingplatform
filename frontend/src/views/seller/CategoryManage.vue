<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openCreate(null)">新增一级分类</el-button>
      <el-tag style="margin-left: 12px" type="info">两级结构：一级分类 → 二级分类，发布商品时选择</el-tag>
    </div>

    <el-table :data="tree" row-key="id" border default-expand-all :tree-props="{ children: 'children' }">
      <el-table-column label="分类名称" min-width="240">
        <template #default="{ row }">
          <span>{{ row.name }}</span>
          <el-tag v-if="!row.parentId" size="small" type="primary" effect="plain" class="lv">一级</el-tag>
          <el-tag v-else size="small" type="info" effect="plain" class="lv">二级</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="sort" label="排序" width="90" />
      <el-table-column label="操作" width="280">
        <template #default="{ row }">
          <el-button v-if="!row.parentId" size="small" type="primary" plain @click="openCreate(row)">新增子分类</el-button>
          <el-button size="small" @click="openEdit(row)">重命名</el-button>
          <el-button size="small" type="danger" plain @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog" :title="title" width="420px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="所属">
          <span>{{ form.parentName }}</span>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" maxlength="50" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :step="1" />
          <span class="hint">数字越小越靠前</span>
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

const tree = ref([])
const dialog = ref(false)
const title = ref('')
const form = ref({ id: null, name: '', sort: 0, parentId: null, parentName: '一级分类' })

async function load() {
  tree.value = await http.get('/categories')
}

function openCreate(parent) {
  title.value = parent ? `新增二级分类（${parent.name}）` : '新增一级分类'
  form.value = {
    id: null,
    name: '',
    sort: 0,
    parentId: parent ? parent.id : null,
    parentName: parent ? parent.name : '一级分类'
  }
  dialog.value = true
}

function openEdit(row) {
  title.value = '编辑分类'
  form.value = {
    id: row.id,
    name: row.name,
    sort: row.sort ?? 0,
    parentId: row.parentId ?? null,
    parentName: row.parentId ? '二级分类' : '一级分类'
  }
  dialog.value = true
}

async function save() {
  if (!form.value.name.trim()) return ElMessage.warning('请填写分类名称')
  if (form.value.id) {
    await http.put(`/seller/categories/${form.value.id}`, {
      name: form.value.name,
      sort: form.value.sort
    })
    ElMessage.success('修改成功')
  } else {
    await http.post('/seller/categories', {
      name: form.value.name,
      parentId: form.value.parentId,
      sort: form.value.sort
    })
    ElMessage.success('新增成功')
  }
  dialog.value = false
  load()
}

async function remove(row) {
  await ElMessageBox.confirm(
    `确认删除分类「${row.name}」？已有商品引用的分类删除后，商品上仍会保留原分类名称。`,
    '提示',
    { type: 'warning' }
  )
  await http.delete(`/seller/categories/${row.id}`)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>

<style scoped>
.toolbar { margin-bottom: 16px; }
.lv { margin-left: 8px; }
.hint { margin-left: 10px; font-size: 12px; color: #909399; }
</style>
