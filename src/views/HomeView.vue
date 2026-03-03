<template>
  <div class="home-view">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <h1 class="welcome-title">✨ 欢迎来到乙游模拟器 ✨</h1>
      <p class="welcome-subtitle">打造属于你的乙女游戏，体验从玩家到创作者的身份转变</p>
    </div>

    <!-- 快捷操作卡片 -->
    <van-card
      class="quick-start-card"
      @click="quickStart"
    >
      <template #title>
        <div class="quick-start-title">
          <span class="emoji">🎮</span>
          <span>快速开始</span>
        </div>
      </template>
      <template #desc>
        <div class="quick-start-desc">
          创建你的第一款乙女游戏，只需 3 步即可完成
        </div>
      </template>
      <template #footer>
        <van-button 
          type="primary" 
          size="small" 
          round
          color="linear-gradient(to right, #FF69B4, #FFB6C1)"
        >
          立即创建
          <van-icon name="arrow" />
        </van-button>
      </template>
    </van-card>

    <!-- 榜单展示区域 -->
    <div class="leaderboard-section">
      <van-tabs v-model:active="activeLeaderboard" sticky shrink animated color="#FF69B4" title-active-color="#FF69B4">
        <van-tab title="畅销榜" name="bestseller">
          <BestsellerList />
        </van-tab>
        <van-tab title="人气榜" name="popularity">
          <PopularityRanking />
        </van-tab>
      </van-tabs>
    </div>

    <!-- 功能入口 -->
    <div class="feature-grid">
      <div class="feature-item" @click="goToCreator">
        <div class="feature-icon">🎨</div>
        <div class="feature-name">角色创建</div>
        <div class="feature-desc">设计你的男主</div>
      </div>
      <div class="feature-item" @click="goToPlot">
        <div class="feature-icon">📖</div>
        <div class="feature-name">剧情设计</div>
        <div class="feature-desc">编写浪漫故事</div>
      </div>
      <div class="feature-item" @click="goToOperation">
        <div class="feature-icon">🎯</div>
        <div class="feature-name">游戏运营</div>
        <div class="feature-desc">调整爆率福利</div>
      </div>
      <div class="feature-item" @click="goToComments">
        <div class="feature-icon">💬</div>
        <div class="feature-name">玩家评论</div>
        <div class="feature-desc">查看反馈</div>
      </div>
      <div class="feature-item" @click="goToMarket">
        <div class="feature-icon">📊</div>
        <div class="feature-name">市场情报</div>
        <div class="feature-desc">分析趋势</div>
      </div>
      <div class="feature-item" @click="goToPlotEditor">
        <div class="feature-icon">🌳</div>
        <div class="feature-name">剧情编辑器</div>
        <div class="feature-desc">可视化编辑</div>
      </div>
    </div>

    <!-- 我的游戏列表 -->
    <van-cell-group title="我的游戏" inset class="game-list">
      <van-empty v-if="games.length === 0" description="还没有创建游戏，快去创建吧！">
        <van-button 
          type="primary" 
          size="small" 
          round
          @click="quickStart"
          color="linear-gradient(to right, #FF69B4, #FFB6C1)"
        >
          创建游戏
        </van-button>
      </van-empty>
      
      <van-cell 
        v-for="game in games" 
        :key="game.id"
        :title="game.title"
        :label="`状态：${game.status} | 人气：${game.popularity}`"
        clickable
        @click="goToGame(game.id)"
      >
        <template #icon>
          <div class="game-icon">{{ game.icon || '🎮' }}</div>
        </template>
        <template #right-icon>
          <van-icon name="arrow" />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 热门模板推荐 -->
    <van-cell-group title="热门角色模板" inset class="template-list">
      <van-swipe :autoplay="3000" indicator-color="#FF69B4">
        <van-swipe-item v-for="template in hotTemplates" :key="template.id">
          <div class="template-card" @click="useTemplate(template)">
            <div class="template-header">
              <span class="template-name">{{ template.name }}</span>
              <van-tag :type="getCategoryType(template.category)">
                {{ getCategoryName(template.category) }}
              </van-tag>
            </div>
            <div class="template-tags">
              <van-tag 
                v-for="tag in template.tags.slice(0, 3)" 
                :key="tag"
                plain
                size="mini"
                class="tag"
              >
                {{ tag }}
              </van-tag>
            </div>
            <div class="template-desc">{{ template.personality.substring(0, 40) }}...</div>
          </div>
        </van-swipe-item>
      </van-swipe>
    </van-cell-group>

    <!-- 每日任务 -->
    <van-cell-group title="每日任务" inset class="daily-tasks">
      <van-cell 
        title="每日签到" 
        label="获得 10 积分"
        clickable
        @click="checkIn"
      >
        <template #icon>
          <div class="task-icon">📅</div>
        </template>
        <template #right-icon>
          <van-button 
            size="mini" 
            :type="checkedIn ? 'default' : 'primary'"
            :disabled="checkedIn"
            round
            color="linear-gradient(to right, #FF69B4, #FFB6C1)"
          >
            {{ checkedIn ? '已完成' : '签到' }}
          </van-button>
        </template>
      </van-cell>
      
      <van-cell 
        title="分享游戏" 
        label="获得 20 积分"
        clickable
        @click="shareGame"
      >
        <template #icon>
          <div class="task-icon">📤</div>
        </template>
        <template #right-icon>
          <van-button 
            size="mini" 
            type="primary"
            round
            color="linear-gradient(to right, #FF69B4, #FFB6C1)"
          >
            分享
          </van-button>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { TemplateManager } from '@/utils/templateManager';
import { usePointsStore } from '@/stores/points';
import { useGameStore } from '@/stores/gameStore';
import { useCompanyStore } from '@/stores/companyStore';
import { showToast } from 'vant';
import BestsellerList from '@/components/leaderboard/BestsellerList.vue';
import PopularityRanking from '@/components/leaderboard/PopularityRanking.vue';

const router = useRouter();
const pointsStore = usePointsStore();
const gameStore = useGameStore();
const companyStore = useCompanyStore();

const games = computed(() => gameStore.games);
const hotTemplates = ref(TemplateManager.getCharactersByPopularity('desc').slice(0, 5));
const checkedIn = ref(false);
const activeLeaderboard = ref('bestseller');

onMounted(() => {
  // 检查今日是否已签到
  checkedIn.value = pointsStore.checkedInToday;
  
  // 初始化默认游戏
  gameStore.initDefaultGame();
});

const quickStart = () => {
  router.push('/creator');
};

const goToCreator = () => {
  router.push('/creator');
};

const goToPlot = () => {
  router.push('/creator/plot');
};

const goToOperation = () => {
  router.push('/operation');
};

const goToComments = () => {
  router.push('/comments');
};

const goToMarket = () => {
  router.push('/market');
};

const goToPlotEditor = () => {
  router.push('/creator/plot/editor');
};

const goToGame = (gameId: string) => {
  router.push(`/game/${gameId}`);
};

const goToPublish = () => {
  router.push('/publish');
};

const goToAchievements = () => {
  router.push('/achievements');
};

const goToCompanySetup = () => {
  router.push('/company-setup');
};

const useTemplate = (template: any) => {
  router.push({
    path: '/creator',
    query: { templateId: template.id }
  });
};

const getCategoryType = (category: string) => {
  const map: Record<string, string> = {
    'president': 'danger',
    'senior': 'success',
    'youngmaster': 'warning',
    'sunshine': 'primary',
    'elite': 'default',
    'other': 'default'
  };
  return map[category] || 'default';
};

const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    'president': '霸道总裁',
    'senior': '温柔学长',
    'youngmaster': '腹黑少爷',
    'sunshine': '阳光少年',
    'elite': '高冷精英',
    'other': '其他'
  };
  return map[category] || '其他';
};

const checkIn = async () => {
  if (checkedIn.value) {
    showToast('今日已签到');
    return;
  }
  
  const result = await pointsStore.checkIn();
  if (result.success) {
    checkedIn.value = true;
    showToast(result.message);
  } else {
    showToast(result.message);
  }
};

const shareGame = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: '乙女游戏创作者模拟器',
        text: '来玩这款超有趣的乙游模拟器，打造属于你的乙女游戏！',
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast('链接已复制');
    }
    
    const result = await pointsStore.shareGame();
    showToast(result.message);
  } catch (error) {
    showToast('分享失败');
  }
};
</script>

<style scoped lang="scss">
.home-view {
  padding: 16px;
  padding-bottom: 80px;
}

.welcome-banner {
  text-align: center;
  padding: 24px 16px;
  background: linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 50%, #FF69B4 100%);
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
}

.welcome-title {
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.quick-start-card {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  :deep(.van-card__header) {
    padding: 16px;
  }
  
  :deep(.van-card__content) {
    padding: 0 16px 16px;
  }
}

.quick-start-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  
  .emoji {
    font-size: 24px;
  }
}

.quick-start-desc {
  font-size: 14px;
  color: #666;
  margin: 8px 0;
}

.leaderboard-section {
  margin-bottom: 16px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  :deep(.van-tabs__nav) {
    background: linear-gradient(135deg, #FFF5F7 0%, #FFE4EC 100%);
  }

  :deep(.van-tab) {
    font-weight: bold;
  }

  :deep(.van-tabs__content) {
    padding: 0;
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.feature-item {
  background: white;
  border-radius: 12px;
  padding: 16px 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.95);
  }
}

.feature-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.feature-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 12px;
  color: #999;
}

.game-list,
.template-list,
.daily-tasks {
  margin-bottom: 16px;
}

.game-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #FFB6C1, #FF69B4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
}

.template-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.template-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.template-tags {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.tag {
  margin-right: 4px;
}

.template-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.task-icon {
  width: 40px;
  height: 40px;
  background: #FFF5F7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
}
</style>
