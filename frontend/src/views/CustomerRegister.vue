<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2>客户注册</h2>
      <el-form @submit.prevent>
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码（至少 6 位）" show-password />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.phone" placeholder="联系电话" maxlength="11" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.defaultAddress" placeholder="默认交易地点" />
        </el-form-item>
        <el-button type="primary" style="width: 100%" @click="register">注册</el-button>
      </el-form>
      <p class="hint">已有账号？<router-link to="/customer/login">去登录</router-link></p>
      <router-link to="/" class="back">← 返回首页</router-link>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '../api'

const form = ref({ username: '', password: '', phone: '', defaultAddress: '' })
const router = useRouter()

async function register() {
  if (!form.value.username.trim()) return ElMessage.warning('请填写用户名')
  if (form.value.password.length < 6) return ElMessage.warning('密码至少 6 位')
  if (!form.value.phone.trim()) return ElMessage.warning('请填写联系电话')
  await http.post('/customer/register', { ...form.value })
  ElMessage.success('注册成功，请登录')
  router.push('/customer/login')
}
</script>

<style scoped>
.login-wrap { height: 100vh; display: flex; align-items: center; justify-content: center; background: #fbf8f3; }
.login-card { width: 380px; }
.login-card h2 { text-align: center; margin-bottom: 20px; color: #2b2622; }
.hint { text-align: center; color: #999; font-size: 13px; margin: 10px 0; }
.back { display: block; text-align: center; color: #b85042; font-size: 13px; }
</style>
