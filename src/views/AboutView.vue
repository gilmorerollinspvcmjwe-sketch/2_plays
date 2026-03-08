<template>
  <div class="min-h-screen bg-gray-50">
    <van-nav-bar title="关于" left-arrow @click-left="router.back()" />
    
    <div class="p-4">
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold text-center mb-4">关于本项目</h1>
        
        <van-cell-group inset>
          <van-cell title="框架" value="Vue 3.4" />
          <van-cell title="构建工具" value="Vite 5" />
          <van-cell title="语言" value="TypeScript 5" />
          <van-cell title="UI 组件库" value="Vant 4" />
          <van-cell title="状态管理" value="Pinia 2" />
          <van-cell title="路由" value="Vue Router 4" />
          <van-cell title="CSS 框架" value="TailwindCSS 3 + SCSS" />
          <van-cell title="PWA" value="vite-plugin-pwa" />
        </van-cell-group>

        <div class="mt-6 text-center">
          <van-button type="primary" block @click="goToHome">
            返回首页
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

async function goToHome() {
  try {
    await router.push('/')
  } catch (error) {
    console.error('导航失败:', error)
    showToast('页面跳转失败')
  }
}
</script>
