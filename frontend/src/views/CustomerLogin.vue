<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2>客户登录</h2>
      <el-form @submit.prevent>
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" show-password @keyup.enter="login" />
        </el-form-item>
        <el-button type="primary" style="width: 100%" @click="login">登录</el-button>
      </el-form>
      <p class="hint">还没有账号？<router-link to="/customer/register">立即注册</router-link></p>
      <p class="hint">默认测试账号 buyer1 / 123456</p>
      <router-link to="/" class="back">← 返回首页</router-link>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '../api'

const form = ref({ username: '', password: '' })
const router = useRouter()

async function login() {
  const r = await http.post('/customer/login', form.value)
  localStorage.setItem('customerToken', r.token)
  ElMessage.success('登录成功')
  router.push('/customer/orders')
}
</script>

<style scoped>
.login-wrap { height: 100vh; display: flex; align-items: center; justify-content: center; background: #fbf8f3; }
.login-card { width: 380px; }
.login-card h2 { text-align: center; margin-bottom: 20px; color: #2b2622; }
.hint { text-align: center; color: #999; font-size: 13px; margin: 10px 0; }
.back { display: block; text-align: center; color: #b85042; font-size: 13px; }
</style>
