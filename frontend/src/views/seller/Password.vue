<template>
  <el-card style="max-width: 480px">
    <el-form :model="form" label-width="80px">
      <el-form-item label="原密码">
        <el-input v-model="form.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="form.newPassword" type="password" show-password />
      </el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '../../api'

const form = ref({ oldPassword: '', newPassword: '' })

async function save() {
  if (!form.value.oldPassword || !form.value.newPassword) {
    ElMessage.warning('请填写完整')
    return
  }
  await http.put('/seller/password', form.value)
  ElMessage.success('密码修改成功')
  form.value = { oldPassword: '', newPassword: '' }
}
</script>
