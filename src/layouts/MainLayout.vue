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
        <component :is="Component" />
      </router-view>
    </main>

    <!-- 底部自定义导航栏 -->
    <div class="bottom-nav">
      <!-- 首页 -->
      <div 
        class="nav-item" 
        :class="{ 'nav-item--active': route.path === '/' }" 
        @click="goToHome"
      >
        <van-icon name="home-o" size="22" />
        <span class="nav-text">首页</span>
      </div>
      
      <!-- 运营 -->
      <div 
        class="nav-item" 
        :class="{ 'nav-item--active': route.path === '/operation' }" 
        @click="goToOperation"
      >
        <van-icon name="shop-o" size="22" />
        <span class="nav-text">运营</span>
      </div>
      
      <!-- 中间"下一天"按钮 -->
      <NextDayButton @click="handleNextDay" />
      
      <!-- 评论 -->
      <div 
        class="nav-item" 
        :class="{ 'nav-item--active': route.path === '/comments' }" 
        @click="goToComments"
      >
        <van-icon name="comment-o" size="22" />
        <span class="nav-text">评论</span>
      </div>
      
      <!-- 我的 -->
      <div 
        class="nav-item" 
        :class="{ 'nav-item--active': route.path === '/profile' }" 
        @click="goToProfile"
      >
        <van-icon name="user-o" size="22" />
        <span class="nav-text">我的</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePointsStore } from '@/stores/points';
import { useOperationStore } from '@/stores/operationStore';
import { showToast } from 'vant';
import NextDayButton from '@/components/common/NextDayButton.vue';

const route = useRoute();
const router = useRouter();
const pointsStore = usePointsStore();
const operationStore = useOperationStore();

const pageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    '/': '乙游模拟器',
    '/creator/character': '角色创建',
    '/creator/plot': '剧情设计',
    '/creator/plot/editor': '剧情编辑器',
    '/operation': '游戏运营',
    '/operation-impact': '运营影响预测',
    '/linkage-tracker': '联动追踪',
    '/market-dashboard': '市场情报',
    '/comments': '玩家评论',
    '/profile': '个人中心',
    '/points': '积分商城',
    '/market': '市场情报',
    '/company-setup': '创建公司',
    '/about': '关于我们',
    '/achievements': '成就系统',
    '/character-ranking': '角色价值排行',
    '/plot-analysis': '剧情分析'
  };
  return titleMap[route.path] || '乙游模拟器';
});

const showBack = computed(() => {
  const noBackPaths = ['/', '/operation', '/comments', '/profile'];
  return !noBackPaths.includes(route.path);
});

const goBack = () => {
  router.back();
};

const goToHome = () => {
  router.push('/');
};

const goToOperation = () => {
  router.push('/operation');
};

const goToComments = () => {
  router.push('/comments');
};

const goToProfile = () => {
  router.push('/profile');
};

const goToPoints = () => {
  router.push('/points');
};

const handleNextDay = async () => {
  try {
    await operationStore.simulateOneDay();
    showToast('已进入下一天');
  } catch (error) {
    console.error('模拟一天失败:', error);
    showToast('操作失败，请重试');
  }
};
</script>

<style scoped lang="scss">
.main-layout {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  padding-bottom: 80px;
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
  min-height: calc(100vh - 146px);
  padding-bottom: 20px;
}

// 底部自定义导航栏
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding: 8px 8px calc(8px + env(safe-area-inset-bottom, 0px));
  background: white;
  border-top: 1px solid #f0f0f0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #999;
  font-size: 12px;
  padding: 4px 12px;
  min-width: 60px;
  cursor: pointer;
  transition: color 0.2s;
  
  &:active {
    opacity: 0.7;
  }
}

.nav-item--active {
  color: #FF69B4;
}

.nav-text {
  font-size: 11px;
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
