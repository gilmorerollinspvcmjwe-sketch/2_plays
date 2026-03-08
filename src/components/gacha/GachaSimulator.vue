<template>
  <div class="gacha-simulator">
    <!-- 卡池信息卡片 -->
    <van-card
      class="gacha-pool-card"
      title="✨ 限定卡池 ✨"
      desc="SSR 概率 3% | 90 抽保底"
      thumb="🎰"
    >
      <template #tags>
        <van-tag plain type="primary" size="large">SSR 概率 {{ (gachaConfig.ssrRate * 100).toFixed(1) }}%</van-tag>
        <van-tag plain type="success" size="large">{{ gachaConfig.pityThreshold }}抽保底</van-tag>
      </template>
      <template #footer>
        <div class="pool-characters">
          <span class="character-label">UP 角色:</span>
          <van-tag type="danger" size="medium">🌸 樱庭遥</van-tag>
          <van-tag type="danger" size="medium">💖 月城雪</van-tag>
          <van-tag type="warning" size="medium">⭐ 星野爱</van-tag>
        </div>
      </template>
    </van-card>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stat-item">
        <div class="stat-icon">🎲</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalStats.totalDraws }}</div>
          <div class="stat-label">总抽卡数</div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalStats.totalSSR }}</div>
          <div class="stat-label">SSR 总数</div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ averagePulls }}</div>
          <div class="stat-label">平均出货抽数</div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">👑</div>
        <div class="stat-content">
          <div class="stat-value">{{ luckiestCount }}</div>
          <div class="stat-label">欧皇人数</div>
        </div>
      </div>
    </div>

    <!-- 抽卡按钮 -->
    <div class="gacha-actions">
      <van-button
        type="primary"
        size="large"
        round
        :loading="isDrawing"
        :disabled="isDrawing"
        color="linear-gradient(to right, #FF69B4, #FFB6C1)"
        @click="handleSingleDraw"
      >
        <template #icon>
          <van-icon name="gem-o" />
        </template>
        单抽
      </van-button>
      
      <van-button
        type="primary"
        size="large"
        round
        :loading="isDrawing"
        :disabled="isDrawing"
        color="linear-gradient(to right, #FF1493, #FF69B4)"
        @click="handleTenPull"
      >
        <template #icon>
          <van-icon name="stars" />
        </template>
        十连
      </van-button>
    </div>

    <!-- 抽卡结果展示 -->
    <div v-if="recentResults.length > 0" class="results-section">
      <h4 class="section-title">✨ 抽卡结果 ✨</h4>
      <div class="results-grid">
        <div
          v-for="(result, index) in recentResults"
          :key="result.id"
          class="result-card"
          :class="getRarityClass(result)"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="result-rarity">{{ result }}</div>
          <div class="result-icon">{{ getRarityIcon(result) }}</div>
        </div>
      </div>
    </div>

    <!-- 实时播报 -->
    <div class="broadcast-section">
      <h4 class="section-title">📢 实时播报</h4>
      <van-swipe-cell class="broadcast-swipe">
        <div class="broadcast-list">
          <div
            v-for="broadcast in broadcasts"
            :key="broadcast.timestamp + broadcast.playerName"
            class="broadcast-item"
          >
            <span class="broadcast-message">{{ broadcast.message }}</span>
          </div>
        </div>
      </van-swipe-cell>
    </div>

    <!-- 幸运值分布图 -->
    <div class="luck-distribution-section">
      <h4 class="section-title">📈 幸运值分布</h4>
      <div class="distribution-chart">
        <div class="distribution-bar">
          <div
            v-for="(range, index) in luckDistribution"
            :key="index"
            class="bar-segment"
            :style="{ width: range.percentage + '%' }"
            :class="getDistributionClass(range.label)"
          >
            <span class="bar-label">{{ range.label }}</span>
            <span class="bar-value">{{ range.count }}人</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 欧皇榜/非酋榜 -->
    <div class="rankings-section">
      <van-tabs v-model:active="activeTab" color="#FF69B4" title-active-color="#FF69B4">
        <van-tab title="👑 欧皇榜">
          <div class="ranking-list">
            <div
              v-for="(player, index) in luckiestPlayers"
              :key="player.playerId"
              class="ranking-item"
              :class="getRankingClass(index)"
            >
              <div class="ranking-rank">{{ getRankEmoji(index) }} {{ index + 1 }}</div>
              <div class="ranking-info">
                <div class="ranking-name">{{ player.playerName }}</div>
                <div class="ranking-stats">
                  <span>总抽：{{ player.totalDraws }}</span>
                  <span>SSR: {{ player.ssrCount }}</span>
                </div>
              </div>
              <div class="ranking-luck">
                <van-tag type="danger" size="large">{{ player.luckValue.toFixed(2) }}x</van-tag>
              </div>
            </div>
          </div>
        </van-tab>

        <van-tab title="😭 非酋榜">
          <div class="ranking-list">
            <div
              v-for="(player, index) in unluckiestPlayers"
              :key="player.playerId"
              class="ranking-item"
              :class="getRankingClass(index)"
            >
              <div class="ranking-rank">{{ getUnluckyRankEmoji(index) }} {{ index + 1 }}</div>
              <div class="ranking-info">
                <div class="ranking-name">{{ player.playerName }}</div>
                <div class="ranking-stats">
                  <span>总抽：{{ player.totalDraws }}</span>
                  <span>SSR: {{ player.ssrCount }}</span>
                </div>
              </div>
              <div class="ranking-luck">
                <van-tag type="info" size="large">{{ player.luckValue.toFixed(2) }}x</van-tag>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 抽卡动画遮罩 -->
    <van-overlay :show="showAnimation" class="gacha-overlay" @click="closeAnimation">
      <div class="animation-content" :class="{ 'animate-in': showAnimation }">
        <div class="gacha-light"></div>
        <div class="gacha-stars">
          <div v-for="i in 20" :key="i" class="star" :style="getStarStyle(i)"></div>
        </div>
        <div class="result-reveal">
          <div
            v-for="(result, index) in animationResults"
            :key="index"
            class="reveal-card"
            :class="getRarityClass(result)"
            :style="{ animationDelay: `${index * 0.2}s` }"
          >
            <div class="reveal-icon">{{ getRarityIcon(result) }}</div>
            <div class="reveal-rarity">{{ result }}</div>
          </div>
        </div>
      </div>
    </van-overlay>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePlayerStore, type PlayerGachaStats, type GachaBroadcast } from '@/stores/playerStore';
import { useTaskStore } from '@/stores/taskStore';
import { showToast } from 'vant';

const playerStore = usePlayerStore();
const taskStore = useTaskStore();

// 状态
const isDrawing = ref(false);
const showAnimation = ref(false);
const activeTab = ref(0);
const recentResults = ref<('SSR' | 'SR' | 'R')[]>([]);
const animationResults = ref<('SSR' | 'SR' | 'R')[]>([]);
const broadcasts = ref<GachaBroadcast[]>([]);
const luckiestPlayers = ref<PlayerGachaStats[]>([]);
const unluckiestPlayers = ref<PlayerGachaStats[]>([]);

// 获取卡池配置
const gachaConfig = computed(() => playerStore.gachaConfig);

// 总统计信息
const totalStats = computed(() => playerStore.getGachaStats());

// 平均出货抽数
const averagePulls = computed(() => {
  if (totalStats.value.totalSSR === 0) return 0;
  return Math.round(totalStats.value.totalDraws / totalStats.value.totalSSR);
});

// 欧皇人数（幸运值 > 1.5）
const luckiestCount = computed(() => {
  return playerStore.players.filter(p => p.luckValue > 1.5).length;
});

// 幸运值分布
const luckDistribution = computed(() => {
  const players = playerStore.players;
  const total = players.length || 1;
  
  const ranges = [
    { label: '欧皇 >1.5', min: 1.5, max: Infinity, count: 0 },
    { label: '幸运 1.2-1.5', min: 1.2, max: 1.5, count: 0 },
    { label: '正常 0.8-1.2', min: 0.8, max: 1.2, count: 0 },
    { label: '非酋 0.5-0.8', min: 0.5, max: 0.8, count: 0 },
    { label: '超非 <0.5', min: 0, max: 0.5, count: 0 }
  ];
  
  players.forEach(player => {
    ranges.forEach(range => {
      if (player.luckValue >= range.min && player.luckValue < range.max) {
        range.count++;
      }
    });
  });
  
  return ranges.map(range => ({
    ...range,
    percentage: (range.count / total) * 100
  }));
});

// 抽卡逻辑
const handleSingleDraw = async () => {
  if (isDrawing.value) return;
  
  isDrawing.value = true;
  try {
    const results = playerStore.simulateGacha(1, undefined, undefined, false);
    const resultArray = results[0].result;
    
    animationResults.value = resultArray;
    showAnimation.value = true;
    
    // 触发每日任务进度 - 抽卡模拟
    taskStore.updateTaskProgress('daily_gacha');
    
    // 等待动画展示
    setTimeout(() => {
      recentResults.value = resultArray;
      showAnimation.value = false;
      refreshData();
    }, 2000);
  } catch (error) {
    showToast('抽卡失败，请稍后再试');
  } finally {
    isDrawing.value = false;
  }
};

const handleTenPull = async () => {
  if (isDrawing.value) return;
  
  isDrawing.value = true;
  try {
    const results = playerStore.simulateGacha(1, undefined, undefined, true);
    const resultArray = results[0].result;
    
    animationResults.value = resultArray;
    showAnimation.value = true;
    
    // 触发每日任务进度 - 抽卡模拟
    taskStore.updateTaskProgress('daily_gacha');
    
    // 等待动画展示
    setTimeout(() => {
      recentResults.value = resultArray;
      showAnimation.value = false;
      refreshData();
      
      // 检查是否有 SSR
      const ssrCount = resultArray.filter(r => r === 'SSR').length;
      if (ssrCount > 0) {
        showToast(`恭喜获得 ${ssrCount} 个 SSR!`);
      }
    }, 2000);
  } catch (error) {
    showToast('抽卡失败，请稍后再试');
  } finally {
    isDrawing.value = false;
  }
};

// 刷新数据
const refreshData = () => {
  broadcasts.value = playerStore.getGachaBroadcast();
  luckiestPlayers.value = playerStore.getLuckiestPlayers(10);
  unluckiestPlayers.value = playerStore.getUnluckiestPlayers(10);
};

// 稀有度样式
const getRarityClass = (rarity: 'SSR' | 'SR' | 'R') => {
  switch (rarity) {
    case 'SSR':
      return 'rarity-ssr';
    case 'SR':
      return 'rarity-sr';
    case 'R':
      return 'rarity-r';
    default:
      return 'rarity-r';
  }
};

// 稀有度图标
const getRarityIcon = (rarity: 'SSR' | 'SR' | 'R') => {
  switch (rarity) {
    case 'SSR':
      return '⭐';
    case 'SR':
      return '✨';
    case 'R':
      return '💫';
  }
};

// 排名表情
const getRankEmoji = (index: number) => {
  const emojis = ['👑', '🥈', '🥉', '🎖️', '🎖️', '🎖️', '🎖️', '🎖️', '🎖️', '🎖️'];
  return emojis[index] || '🎖️';
};

const getUnluckyRankEmoji = (index: number) => {
  const emojis = ['😭', '😢', '😞', '😟', '😕', '😕', '😕', '😕', '😕', '😕'];
  return emojis[index] || '😕';
};

// 排名样式
const getRankingClass = (index: number) => {
  if (index === 0) return 'rank-first';
  if (index === 1) return 'rank-second';
  if (index === 2) return 'rank-third';
  return '';
};

// 分布图样式
const getDistributionClass = (label: string) => {
  if (label.includes('欧皇')) return 'dist-super';
  if (label.includes('幸运')) return 'dist-lucky';
  if (label.includes('正常')) return 'dist-normal';
  if (label.includes('非酋')) return 'dist-unlucky';
  return '';
};

// 星星动画样式
const getStarStyle = (index: number) => {
  const angle = (index / 20) * Math.PI * 2;
  const radius = 100 + Math.random() * 50;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    animationDelay: `${Math.random() * 0.5}s`
  };
};

// 关闭动画
const closeAnimation = () => {
  showAnimation.value = false;
};

// 生命周期
onMounted(() => {
  refreshData();
  
  // 定时刷新播报
  const interval = setInterval(() => {
    refreshData();
  }, 5000);
  
  onUnmounted(() => {
    clearInterval(interval);
  });
});
</script>

<style scoped lang="scss">
.gacha-simulator {
  padding: 16px;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  min-height: 100vh;
}

// 卡池卡片
.gacha-pool-card {
  margin-bottom: 16px;
  border-radius: 16px;
  overflow: hidden;
  
  :deep(.van-card__header) {
    background: linear-gradient(135deg, #FF69B4, #FFB6C1);
    color: white;
    padding: 16px;
  }
  
  :deep(.van-card__title) {
    color: white;
    font-size: 18px;
    font-weight: bold;
  }
  
  :deep(.van-card__desc) {
    color: rgba(255, 255, 255, 0.9);
  }
  
  :deep(.van-card__thumb) {
    font-size: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
  }
  
  .pool-characters {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 8px 0;
    
    .character-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
  }
}

// 统计信息
.stats-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(255, 105, 180, 0.1);
}

.stat-icon {
  font-size: 32px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #FF69B4;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

// 抽卡按钮
.gacha-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  
  .van-button {
    flex: 1;
    height: 56px;
    font-size: 18px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
    
    :deep(.van-icon) {
      margin-right: 4px;
      font-size: 20px;
    }
  }
}

// 抽卡结果
.results-section {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  text-align: center;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
}

.result-card {
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  animation: fadeIn 0.3s ease-out;
  
  .result-rarity {
    font-size: 12px;
    font-weight: bold;
  }
  
  .result-icon {
    font-size: 24px;
  }
}

.rarity-ssr {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.rarity-sr {
  background: linear-gradient(135deg, #C0C0C0, #E8E8E8);
  color: white;
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
}

.rarity-r {
  background: linear-gradient(135deg, #CD7F32, #DEB887);
  color: white;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
}

// 实时播报
.broadcast-section {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.broadcast-list {
  max-height: 150px;
  overflow-y: auto;
}

.broadcast-item {
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.broadcast-message {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

// 幸运值分布
.luck-distribution-section {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.distribution-chart {
  padding: 8px 0;
}

.distribution-bar {
  display: flex;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
}

.bar-segment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  transition: width 0.3s ease;
  min-width: 0;
  
  .bar-label {
    font-size: 9px;
    white-space: nowrap;
  }
  
  .bar-value {
    font-size: 11px;
    font-weight: bold;
  }
}

.dist-super {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.dist-lucky {
  background: linear-gradient(135deg, #FF69B4, #FFB6C1);
}

.dist-normal {
  background: linear-gradient(135deg, #07c160, #10b981);
}

.dist-unlucky {
  background: linear-gradient(135deg, #879596, #b8c0c1);
}

// 排行榜
.rankings-section {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ranking-list {
  padding: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #f8f8f8;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &.rank-first {
    background: linear-gradient(135deg, #FFF5E6, #FFE4B5);
    border: 2px solid #FFD700;
  }
  
  &.rank-second {
    background: linear-gradient(135deg, #F5F5F5, #E8E8E8);
    border: 2px solid #C0C0C0;
  }
  
  &.rank-third {
    background: linear-gradient(135deg, #FFF5F5, #FFE4E1);
    border: 2px solid #CD7F32;
  }
}

.ranking-rank {
  font-size: 20px;
  margin-right: 12px;
  min-width: 60px;
}

.ranking-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ranking-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.ranking-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.ranking-luck {
  margin-left: 8px;
}

// 抽卡动画
.gacha-overlay {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.animation-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.5s ease;
  
  &.animate-in {
    opacity: 1;
    transform: scale(1);
  }
}

.gacha-light {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 105, 180, 0.6) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.gacha-stars {
  position: absolute;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: twinkle 1s ease-in-out infinite;
}

.result-reveal {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 20px;
}

.reveal-card {
  width: 80px;
  height: 120px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: cardReveal 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
  
  .reveal-icon {
    font-size: 36px;
  }
  
  .reveal-rarity {
    font-size: 14px;
    font-weight: bold;
  }
}

// 动画
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes cardReveal {
  from {
    opacity: 0;
    transform: translateY(20px) rotateY(90deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateY(0deg);
  }
}

// 响应式
@media (max-width: 375px) {
  .stat-item {
    padding: 12px;
  }
  
  .stat-icon {
    font-size: 24px;
  }
  
  .stat-value {
    font-size: 18px;
  }
  
  .reveal-card {
    width: 60px;
    height: 90px;
    
    .reveal-icon {
      font-size: 28px;
    }
    
    .reveal-rarity {
      font-size: 12px;
    }
  }
}
</style>
