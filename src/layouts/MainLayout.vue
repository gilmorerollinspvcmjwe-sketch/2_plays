<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <van-nav-bar 
      :title="pageTitle"
      :left-arrow="showBack"
      @click-left="goBack"
      class="nav-bar"
    >
      <template #right>
        <van-icon 
          name="gem-o" 
          size="20" 
          color="#FFD700"
          @click="goToPoints"
          class="points-icon"
        />
        <span class="points-text">{{ pointsStore.balance }}</span>
      </template>
    </van-nav-bar>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部 Tab 导航 -->
    <van-tabbar v-model="activeTab" route class="tabbar">
      <van-tabbar-item to="/" icon="home-o">
        首页
      </van-tabbar-item>
      <van-tabbar-item to="/creator" icon="edit">
        开发
      </van-tabbar-item>
      <van-tabbar-item to="/operation" icon="shop-o">
        运营
      </van-tabbar-item>
      <van-tabbar-item to="/comments" icon="comment-o">
        评论
      </van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePointsStore } from '@/stores/points';

const route = useRoute();
const router = useRouter();
const pointsStore = usePointsStore();
const activeTab = ref(0);

const pageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    '/': '乙游模拟器',
    '/creator': '游戏开发',
    '/creator/plot': '剧情设计',
    '/creator/plot/editor': '剧情编辑器',
    '/operation': '游戏运营',
    '/comments': '玩家评论',
    '/profile': '个人中心',
    '/points': '积分商城',
    '/market': '市场情报'
  };
  return titleMap[route.path] || '乙游模拟器';
});

const showBack = computed(() => {
  const noBackPaths = ['/', '/creator', '/operation', '/comments', '/profile'];
  return !noBackPaths.includes(route.path);
});

const goBack = () => {
  router.back();
};

const goToPoints = () => {
  router.push('/points');
};
</script>

<style scoped lang="scss">
.main-layout {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  padding-bottom: 50px;
}

.nav-bar {
  :deep(.van-nav-bar__title) {
    font-weight: bold;
    color: #FF69B4;
  }
  
  :deep(.van-nav-bar__right) {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.points-icon {
  cursor: pointer;
}

.points-text {
  font-size: 12px;
  color: #FFD700;
  font-weight: bold;
}

.main-content {
  min-height: calc(100vh - 96px);
  padding-bottom: 20px;
}

.tabbar {
  :deep(.van-tabbar-item--active) {
    color: #FF69B4;
  }
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
