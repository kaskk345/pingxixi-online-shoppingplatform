<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2>卖家登录</h2>
      <el-form @submit.prevent>
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" show-password @keyup.enter="login" />
        </el-form-item>
        <el-button type="primary" style="width: 100%" @click="login">登录</el-button>
      </el-form>
      <p class="hint">默认账号 admin / admin123</p>
      <router-link to="/" class="back">← 返回首页</router-link>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '../api'

const form = ref({ username: 'admin', password: '' })
const router = useRouter()

async function login() {
  const r = await http.post('/seller/login', form.value)
  localStorage.setItem('token', r.token)
  ElMessage.success('登录成功')
  router.push('/seller/products')
}
</script>

<style scoped>
.login-wrap {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-card {
  width: 360px;
}
.login-card h2 {
  text-align: center;
  margin-bottom: 20px;
}
.hint {
  text-align: center;
  color: #999;
  font-size: 13px;
  margin: 12px 0;
}
.back {
  display: block;
  text-align: center;
  color: #2f6fd0;
  font-size: 13px;
}
</style>
