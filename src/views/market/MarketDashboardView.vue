<template>
  <div class="market-dashboard">
    <BackButton title="市场情报" />

    <div class="dashboard-content">
      <!-- 当前赛季 -->
      <div class="season-card">
        <div class="season-header">
          <span class="season-title">{{ currentSeason.name }}</span>
          <van-tag type="primary">第{{ currentSeason.id }}赛季</van-tag>
        </div>
        <div class="season-desc">{{ currentSeason.description }}</div>
        <div class="season-timer">
          <van-icon name="clock-o" />
          赛季剩余 {{ seasonDays }} 天
        </div>
      </div>

      <!-- 题材热度 -->
      <div class="genre-section">
        <div class="section-title">题材热度榜</div>
        <div class="genre-list">
          <div
            v-for="(genre, index) in sortedGenres"
            :key="genre.genre"
            class="genre-item"
          >
            <div class="genre-rank" :class="getRankClass(index)">{{ index + 1 }}</div>
            <div class="genre-info">
              <div class="genre-name">{{ getGenreName(genre.genre) }}</div>
              <div class="genre-trend">
                <van-icon :name="getTrendIcon(genre.trend)" :color="getTrendColor(genre.trend)" />
                <span :style="{ color: getTrendColor(genre.trend) }">
                  {{ genre.heat.toFixed(0) }}°
                </span>
              </div>
            </div>
            <div class="genre-bar">
              <div class="genre-fill" :style="{ width: genre.heat + '%', background: getGenreColor(genre.genre) }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 市场竞争 -->
      <div class="competitor-section">
        <div class="section-title">市场竞争格局</div>
        <div class="market-share">
          <div class="share-item" v-for="share in marketShares" :key="share.name">
            <div class="share-name">{{ share.name }}</div>
            <div class="share-bar">
              <div class="share-fill" :style="{ width: share.share + '%' }"></div>
            </div>
            <div class="share-value">{{ share.share.toFixed(1) }}%</div>
          </div>
        </div>
      </div>

      <!-- 竞品动态 -->
      <div class="competitor-events">
        <div class="section-title">竞品动态</div>
        <div class="events-list" v-if="competitorEvents.length > 0">
          <div v-for="event in competitorEvents.slice(0, 5)" :key="event.id" class="event-item">
            <van-tag :type="getEventType(event.type)">{{ getEventTypeName(event.type) }}</van-tag>
            <span class="event-title">{{ event.title }}</span>
          </div>
        </div>
        <van-empty v-else description="暂无竞品动态" :image-size="60" />
      </div>

      <!-- 合作机会 -->
      <div class="collaborations" v-if="collaborations.length > 0">
        <div class="section-title">合作机会</div>
        <div class="collab-list">
          <div v-for="collab in collaborations" :key="collab.id" class="collab-card">
            <div class="collab-header">
              <span class="collab-type">{{ getCollabTypeName(collab.type) }}</span>
              <span class="collab-partner">{{ collab.partner }}</span>
            </div>
            <div class="collab-desc">{{ collab.description }}</div>
            <div class="collab-stats">
              <span>成本: ¥{{ formatNumber(collab.cost) }}</span>
              <span>预期收益: ¥{{ formatNumber(collab.potentialRevenue) }}</span>
            </div>
            <van-button size="small" type="primary" @click="handleCollab(collab)">
              申请合作
            </van-button>
          </div>
        </div>
      </div>

      <!-- 玩家排名 -->
      <div class="player-ranking">
        <div class="section-title">市场排名</div>
        <div class="ranking-list">
          <div v-for="rank in rankings.slice(0, 10)" :key="rank.rank" class="ranking-item">
            <div class="ranking-rank" :class="getRankClass(rank.rank - 1)">{{ rank.rank }}</div>
            <div class="ranking-info">
              <span class="ranking-name">{{ rank.name }}</span>
              <span class="ranking-score">热度: {{ rank.score.toFixed(0) }}</span>
            </div>
            <van-tag v-if="rank.name === '我的游戏'" type="success">我的</van-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { showToast, showDialog } from 'vant';
import BackButton from '@/components/common/BackButton.vue';
import { seasonEngine, competitorEngine, type GenreType, type CollaborationOpportunity } from '@/engine';

const currentSeason = computed(() => seasonEngine.getCurrentSeason());

const seasonDays = computed(() => {
  const diff = currentSeason.value.endDate - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

const genreHeats = computed(() => seasonEngine.getGenreHeats());

const sortedGenres = computed(() => {
  return [...genreHeats.value].sort((a, b) => b.heat - a.heat);
});

const marketShares = computed(() => competitorEngine.getMarketShareDistribution());

const competitorEvents = computed(() => competitorEngine.getEvents());

const collaborations = computed(() => competitorEngine.getCollaborations());

const rankings = computed(() => competitorEngine.getMarketRankings());

function getGenreName(genre: GenreType): string {
  const names: Record<GenreType, string> = {
    sweet: '甜宠',
    angst: '虐恋',
    suspense: '悬疑',
    fantasy: '奇幻',
    modern: '现代',
    historical: '古风'
  };
  return names[genre] || genre;
}

function getGenreColor(genre: GenreType): string {
  const colors: Record<GenreType, string> = {
    sweet: '#ff6b6b',
    angst: '#4ecdc4',
    suspense: '#45b7d1',
    fantasy: '#96ceb4',
    modern: '#ffd93d',
    historical: '#ff9ff3'
  };
  return colors[genre] || '#999';
}

function getRankClass(index: number): string {
  if (index === 0) return 'rank-1';
  if (index === 1) return 'rank-2';
  if (index === 2) return 'rank-3';
  return '';
}

function getTrendIcon(trend: string): string {
  if (trend === 'up') return 'arrow-up';
  if (trend === 'down') return 'arrow-down';
  return 'minus';
}

function getTrendColor(trend: string): string {
  if (trend === 'up') return '#52c41a';
  if (trend === 'down') return '#ff4d4f';
  return '#999';
}

function getEventType(type: string): 'primary' | 'success' | 'warning' | 'danger' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
    update: 'primary',
    event: 'success',
    scandal: 'danger',
    collaboration: 'warning'
  };
  return types[type] || 'primary';
}

function getEventTypeName(type: string): string {
  const names: Record<string, string> = {
    update: '更新',
    event: '活动',
    scandal: '负面',
    collaboration: '合作'
  };
  return names[type] || type;
}

function getCollabTypeName(type: string): string {
  const names: Record<string, string> = {
    ip: 'IP联动',
    crossover: '跨界合作',
    promotion: '推广'
  };
  return names[type] || type;
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

function handleCollab(collab: CollaborationOpportunity) {
  showDialog({
    title: '确认合作',
    message: `确定要与${collab.partner}进行${getCollabTypeName(collab.type)}吗？\n成本: ¥${formatNumber(collab.cost)}\n预期收益: ¥${formatNumber(collab.potentialRevenue)}`,
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(() => {
    const result = competitorEngine.executeCollaboration(collab.id);
    showToast(result.message);
  }).catch(() => {});
}
</script>

<style scoped>
.market-dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-content {
  padding: 16px;
  padding-bottom: 80px;
}

/* 赛季卡片 */
.season-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  margin-bottom: 16px;
}

.season-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.season-title {
  font-size: 18px;
  font-weight: 600;
}

.season-desc {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 12px;
}

.season-timer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  opacity: 0.9;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

/* 题材热度 */
.genre-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.genre-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.genre-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.genre-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.genre-rank.rank-1 { background: #ffd700; color: #8b6914; }
.genre-rank.rank-2 { background: #c0c0c0; color: #666; }
.genre-rank.rank-3 { background: #cd7f32; color: white; }

.genre-info {
  width: 80px;
}

.genre-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.genre-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
}

.genre-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.genre-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 市场竞争 */
.competitor-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.market-share {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.share-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.share-name {
  width: 80px;
  font-size: 13px;
  color: #333;
}

.share-bar {
  flex: 1;
  height: 16px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.share-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890ff, #36cfc9);
  border-radius: 8px;
}

.share-value {
  width: 50px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

/* 竞品动态 */
.competitor-events {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

/* 合作机会 */
.collaborations {
  margin-bottom: 12px;
}

.collab-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.collab-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
}

.collab-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.collab-type {
  font-size: 12px;
  color: #1890ff;
  font-weight: 600;
}

.collab-partner {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.collab-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.collab-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

/* 玩家排名 */
.player-ranking {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
}

.ranking-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.ranking-rank.rank-1 { background: #ffd700; color: #8b6914; }
.ranking-rank.rank-2 { background: #c0c0c0; color: #666; }
.ranking-rank.rank-3 { background: #cd7f32; color: white; }

.ranking-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.ranking-name {
  font-size: 14px;
  color: #333;
}

.ranking-score {
  font-size: 12px;
  color: #999;
}
</style>
