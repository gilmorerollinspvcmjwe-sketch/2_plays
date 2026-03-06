<template>
  <div class="creator-stats">
    <div class="stats-intro">
      <h4>📊 创作统计</h4>
      <p>你的创作生涯数据</p>
    </div>

    <!-- 核心统计 -->
    <div class="core-stats">
      <div class="stat-card">
        <div class="stat-icon">🎮</div>
        <div class="stat-value">{{ creatorStore.growth.stats.gamesCreated }}</div>
        <div class="stat-label">创建游戏</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-value">{{ formatNumber(creatorStore.growth.stats.totalPlayers) }}</div>
        <div class="stat-label">服务玩家</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-value">{{ formatNumber(creatorStore.growth.stats.totalRevenue) }}</div>
        <div class="stat-label">累计收入</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🛡️</div>
        <div class="stat-value">{{ creatorStore.growth.stats.crisesResolved }}</div>
        <div class="stat-label">化解危机</div>
      </div>
    </div>

    <!-- 详细统计 -->
    <div class="detail-stats">
      <div class="detail-section">
        <div class="section-title">📝 内容创作</div>
        <div class="detail-list">
          <div class="detail-item">
            <span class="detail-label">创作角色数</span>
            <span class="detail-value">{{ creatorStore.growth.stats.charactersCreated || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">创作剧情数</span>
            <span class="detail-value">{{ creatorStore.growth.stats.plotsCreated || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">创作卡池数</span>
            <span class="detail-value">{{ creatorStore.growth.stats.poolsCreated || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">举办活动数</span>
            <span class="detail-value">{{ creatorStore.growth.stats.eventsCreated || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">💬 社交互动</div>
        <div class="detail-list">
          <div class="detail-item">
            <span class="detail-label">收到评论</span>
            <span class="detail-value">{{ creatorStore.growth.stats.totalComments || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">收到告白</span>
            <span class="detail-value">{{ creatorStore.growth.stats.totalConfessions || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">同人作品</span>
            <span class="detail-value">{{ creatorStore.growth.stats.totalFanworks || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">累计点赞</span>
            <span class="detail-value">{{ formatNumber(creatorStore.growth.stats.totalLikes || 0) }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">⚡ 运营数据</div>
        <div class="detail-list">
          <div class="detail-item">
            <span class="detail-label">处理事件</span>
            <span class="detail-value">{{ creatorStore.growth.stats.incidentsHandled || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">化解危机</span>
            <span class="detail-value">{{ creatorStore.growth.stats.crisesResolved }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">最高日收入</span>
            <span class="detail-value">{{ formatNumber(creatorStore.growth.stats.highestDailyRevenue || 0) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">最高人气</span>
            <span class="detail-value">{{ formatNumber(creatorStore.growth.stats.highestPopularity || 0) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 成就概览 -->
    <div class="achievements-overview">
      <div class="overview-header">
        <span class="overview-title">🏆 成就概览</span>
        <span class="overview-progress">{{ unlockedAchievements }}/{{ totalAchievements }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: achievementProgress + '%' }"></div>
      </div>
      <div class="recent-achievements" v-if="recentAchievements.length > 0">
        <div class="recent-title">最近解锁</div>
        <div class="achievement-tags">
          <van-tag
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            type="primary"
            color="#FF69B4"
            class="achievement-tag"
          >
            {{ achievement.name }}
          </van-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCreatorGrowthStore } from '@/stores/creatorGrowth';
import { usePointsStore } from '@/stores/points';

const creatorStore = useCreatorGrowthStore();
const pointsStore = usePointsStore();

// 成就统计
const totalAchievements = computed(() => pointsStore.achievements.length);
const unlockedAchievements = computed(() =>
  pointsStore.achievements.filter(a => a.unlocked).length
);
const achievementProgress = computed(() => {
  if (totalAchievements.value === 0) return 0;
  return Math.round((unlockedAchievements.value / totalAchievements.value) * 100);
});

// 最近解锁的成就
const recentAchievements = computed(() => {
  return pointsStore.achievements
    .filter(a => a.unlocked)
    .slice(-5);
});

function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}
</script>

<style scoped lang="scss">
.creator-stats {
  padding: 0 0 16px;
}

.stats-intro {
  text-align: center;
  margin-bottom: 20px;

  h4 {
    font-size: 18px;
    color: #333;
    margin: 0 0 8px;
  }

  p {
    font-size: 14px;
    color: #999;
    margin: 0;
  }
}

// 核心统计
.core-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

// 详细统计
.detail-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.detail-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 14px;
  color: #666;
}

.detail-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

// 成就概览
.achievements-overview {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.overview-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.overview-progress {
  font-size: 14px;
  color: #FF69B4;
  font-weight: bold;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFB6C1, #FF69B4);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.recent-achievements {
  padding-top: 12px;
  border-top: 1px dashed #f0f0f0;
}

.recent-title {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.achievement-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.achievement-tag {
  margin: 0;
}
</style>
