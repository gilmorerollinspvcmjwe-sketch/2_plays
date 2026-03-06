<template>
  <div class="creator-center-view">
    <!-- 顶部创作者信息 -->
    <div class="creator-header">
      <div class="creator-avatar">
        <van-icon name="user-circle-o" size="56" color="#FF69B4" />
      </div>
      <div class="creator-info">
        <div class="creator-title" v-if="currentTitle">
          <span class="title-icon">{{ currentTitle.icon }}</span>
          <span class="title-name">{{ currentTitle.name }}</span>
        </div>
        <h2 class="creator-name">游戏创作者</h2>
        <div class="creator-level">
          <van-tag color="#FF69B4" round size="medium">
            Lv.{{ creatorStore.growth.level }} {{ currentLevelInfo?.title || '初级创作者' }}
          </van-tag>
        </div>
      </div>
      <div class="level-progress">
        <div class="progress-info">
          <span class="exp-text">{{ creatorStore.growth.totalExperience }} / {{ nextLevelExp }} EXP</span>
          <span class="level-text">Lv.{{ creatorStore.growth.level }} → Lv.{{ creatorStore.growth.level + 1 }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: levelProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 创作统计 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">🎮</div>
          <div class="stat-value">{{ creatorStore.growth.stats.gamesCreated }}</div>
          <div class="stat-label">创建游戏</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">👥</div>
          <div class="stat-value">{{ formatNumber(creatorStore.growth.stats.totalPlayers) }}</div>
          <div class="stat-label">服务玩家</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">💰</div>
          <div class="stat-value">{{ formatNumber(creatorStore.growth.stats.totalRevenue) }}</div>
          <div class="stat-label">累计收入</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">🛡️</div>
          <div class="stat-value">{{ creatorStore.growth.stats.crisesResolved }}</div>
          <div class="stat-label">化解危机</div>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <van-tabs v-model="activeTab" class="creator-tabs" sticky>
      <van-tab title="技能树">
        <div class="tab-content">
          <SkillTree />
        </div>
      </van-tab>
      
      <van-tab title="成就墙">
        <div class="tab-content">
          <AchievementWall />
        </div>
      </van-tab>
      
      <van-tab title="称号">
        <div class="tab-content">
          <TitleManager />
        </div>
      </van-tab>
      
      <van-tab title="统计">
        <div class="tab-content">
          <CreatorStats />
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePointsStore } from '@/stores/points';
import { useCreatorGrowthStore } from '@/stores/creatorGrowth';
import { CREATOR_LEVELS } from '@/types/creatorGrowth';
import SkillTree from '@/components/creator/SkillTree.vue';
import AchievementWall from '@/components/achievement/AchievementWall.vue';
import TitleManager from '@/components/creator/TitleManager.vue';
import CreatorStats from '@/components/creator/CreatorStats.vue';

const pointsStore = usePointsStore();
const creatorStore = useCreatorGrowthStore();

const activeTab = ref(0);

// 当前称号
const currentTitle = computed(() => pointsStore.currentTitle);

// 当前等级信息
const currentLevelInfo = computed(() => {
  return CREATOR_LEVELS.find(l => l.level === creatorStore.growth.level);
});

// 下一级所需经验
const nextLevelExp = computed(() => {
  const nextLevel = CREATOR_LEVELS.find(l => l.level === creatorStore.growth.level + 1);
  return nextLevel?.requiredExp || creatorStore.growth.totalExperience;
});

// 等级进度百分比
const levelProgress = computed(() => {
  const currentExp = creatorStore.growth.totalExperience;
  const currentLevelRequired = currentLevelInfo.value?.requiredExp || 0;
  const nextLevelRequired = nextLevelExp.value;
  
  if (nextLevelRequired === currentLevelRequired) return 100;
  
  const progress = ((currentExp - currentLevelRequired) / (nextLevelRequired - currentLevelRequired)) * 100;
  return Math.min(100, Math.max(0, progress));
});

function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}
</script>

<style scoped lang="scss">
.creator-center-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  padding-bottom: 80px;
}

// 创作者头部
.creator-header {
  background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
  padding: 24px 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.creator-avatar {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.creator-info {
  color: white;
  flex: 1;
  min-width: 150px;
}

.creator-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.3);
  padding: 4px 10px;
  border-radius: 12px;
  margin-bottom: 6px;
}

.title-icon {
  font-size: 12px;
}

.title-name {
  font-size: 12px;
  font-weight: bold;
}

.creator-name {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 6px 0;
}

.creator-level {
  margin-top: 4px;
}

// 等级进度
.level-progress {
  width: 100%;
  margin-top: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 3px;
  transition: width 0.3s ease;
}

// 统计区域
.stats-section {
  padding: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-item {
  text-align: center;
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 11px;
  color: #999;
}

// Tab 样式
.creator-tabs {
  :deep(.van-tabs__nav) {
    background: white;
  }
  
  :deep(.van-tab--active) {
    color: #FF69B4;
  }
  
  :deep(.van-tabs__line) {
    background: #FF69B4;
  }
}

.tab-content {
  padding: 16px;
  min-height: 400px;
}
</style>
