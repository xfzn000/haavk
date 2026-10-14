<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import AdminShell from '@/layouts/AdminShell.vue'
import ToastHost from '@/components/ToastHost.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

/** 启动时用后端 `GET /api/auth/me` 校准角色 —— 在数据库里改过 role 后刷新页面即生效 */
onMounted(() => {
  void auth.refreshRole()
})

/** 后台登录页独立展示（不带后台框架） */
const isAdminLogin = computed(() => route.name === 'admin-login')
/** 后台其余页面使用 AdminShell */
const isAdminArea = computed(() => route.path.startsWith('/admin') && !isAdminLogin.value)
/** 用户端使用 AppShell */
const isSite = computed(() => !route.path.startsWith('/admin'))
</script>

<template>
  <!-- 后台登录 -->
  <RouterView v-if="isAdminLogin" v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>

  <!-- 后台管理 -->
  <AdminShell v-else-if="isAdminArea">
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </AdminShell>

  <!-- 用户端 -->
  <AppShell v-else-if="isSite">
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </AppShell>

  <!-- 全局提示 -->
  <ToastHost />
</template>
