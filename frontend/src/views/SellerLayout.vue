<template>
  <el-container class="layout">
    <el-aside width="200px">
      <div class="logo">卖家后台</div>
      <el-menu :default-active="$route.path" router>
        <el-menu-item index="/seller/products">商品管理</el-menu-item>
        <el-menu-item index="/seller/intents">意向管理</el-menu-item>
        <el-menu-item index="/seller/password">修改密码</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span>在线购物系统 · 卖家后台</span>
        <el-button link type="primary" @click="logout">退出登录</el-button>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.layout {
  height: 100vh;
}
.el-aside {
  background: #fff;
  border-right: 1px solid #eee;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-weight: 700;
  color: #2f6fd0;
  font-size: 18px;
}
.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}
</style>
