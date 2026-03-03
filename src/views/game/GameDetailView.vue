<template>
  <div class="game-detail-view">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <van-loading type="spinner" color="#FF69B4" />
      <p>加载中...</p>
    </div>

    <!-- 游戏不存在 -->
    <van-empty v-else-if="!game" description="游戏不存在">
      <van-button type="primary" @click="$router.push('/')">返回首页</van-button>
    </van-empty>

    <!-- 游戏详情 -->
    <template v-else>
      <!-- 游戏头部信息 -->
      <div class="game-header">
        <div class="game-title-section">
          <h1 class="game-title">{{ game.title }}</h1>
          <van-tag :type="gameStatus.type">{{ gameStatus.text }}</van-tag>
        </div>
        <p class="game-description">{{ game.description || '暂无描述' }}</p>
        <div class="game-meta">
          <span class="meta-item">
            <van-icon name="user-o" />
            {{ game.characters.length }} 个角色
          </span>
          <span class="meta-item">
            <van-icon name="description" />
            {{ game.plots.length }} 条剧情
          </span>
          <span class="meta-item">
            <van-icon name="clock-o" />
            {{ formatDate(game.createdAt) }}
          </span>
        </div>
        <!-- 游戏评分 -->
        <div v-if="game.characters.length > 0 || game.plots.length > 0" class="game-rating-section">
          <RatingDisplay :game-id="game.id" />
        </div>
      </div>

      <!-- 资源管理组件 -->
      <ResourceManager />

      <!-- 游戏里程碑 -->
      <MilestoneCard v-if="game" :game-id="game.id" />

      <!-- 角色人气趋势概览 -->
      <div v-if="game.characters.length > 0" class="section popularity-overview">
        <div class="section-header">
          <h2 class="section-title">📈 人气趋势概览</h2>
          <div class="trend-legend">
            <span class="legend-item">
              <span class="legend-dot up"></span> 上升
            </span>
            <span class="legend-item">
              <span class="legend-dot down"></span> 下降
            </span>
          </div>
        </div>
        <div class="trend-chart-container">
          <canvas ref="trendChartRef" class="trend-chart"></canvas>
          <div v-if="!trendChartData.length" class="chart-placeholder">
            <van-icon name="chart-trending-o" size="48" color="#ccc" />
            <p>数据不足，暂无趋势图</p>
          </div>
        </div>
        <div class="popularity-summary">
          <div class="summary-item">
            <span class="summary-label">总人气值</span>
            <span class="summary-value">{{ totalPopularity }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">平均人气</span>
            <span class="summary-value">{{ avgPopularity }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">人气最高</span>
            <span class="summary-value highlight">{{ topCharacterName }}</span>
          </div>
        </div>
      </div>

      <!-- 角色列表 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">角色列表</h2>
          <van-button size="small" type="primary" @click="goToCreator">+ 添加角色</van-button>
        </div>
        <van-empty v-if="game.characters.length === 0" description="暂无角色">
          <van-button size="small" type="primary" @click="goToCreator">创建角色</van-button>
        </van-empty>
        <div v-else class="character-list">
          <van-card
            v-for="char in game.characters"
            :key="char.id"
            :title="char.name"
            class="character-card"
            @click="goToCharacter(char.id)"
          >
            <template #thumb>
              <div class="popularity-badge" :class="getPopularityClass(char.popularity?.popularity || 50)">
                <van-tag :type="getPopularityType(char.popularity?.popularity || 50)" size="small">
                  🔥 {{ char.popularity?.popularity || 50 }}
                </van-tag>
              </div>
            </template>
            <template #desc>
              <div class="character-desc">
                <p>{{ char.appearance }} · {{ char.clothing }}</p>
                <div class="personality-tags">
                  <van-tag
                    v-for="tag in char.personality.slice(0, 3)"
                    :key="tag"
                    plain
                    size="mini"
                  >
                    {{ tag }}
                  </van-tag>
                </div>
                <div v-if="char.popularity" class="popularity-stats">
                  <span class="stat-item">
                    <van-icon name="star" />
                    讨论：{{ char.popularity.discussionHeat }}
                  </span>
                  <span class="stat-item">
                    <van-icon name="friends-o" />
                    抽取：{{ char.popularity.gachaCount }}
                  </span>
                </div>
                <!-- CP 热度展示 -->
                <div v-if="char.popularity.cpHeat && Object.keys(char.popularity.cpHeat).length > 0" class="cp-heat-section">
                  <div class="cp-title">🔥 热门 CP</div>
                  <div class="cp-list">
                    <div
                      v-for="(heat, cpCharId) in getTopCpHeat(char.id, 3)"
                      :key="cpCharId"
                      class="cp-item"
                    >
                      <span class="cp-name">{{ getCharacterName(cpCharId) }}</span>
                      <van-progress
                        :percentage="Math.min(100, heat)"
                        :color="getCpHeatColor(heat)"
                        stroke-width="6"
                        class="cp-progress"
                      />
                      <span class="cp-value">{{ heat }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </van-card>
        </div>
      </div>

      <!-- 角色人气排行榜 -->
      <div v-if="game.characters.length > 0" class="section">
        <div class="section-header">
          <h2 class="section-title">🏆 角色人气排行榜</h2>
        </div>
        <div class="ranking-list">
          <div
            v-for="(char, index) in popularityRanking"
            :key="char.characterId"
            class="ranking-item"
            :class="`rank-${index + 1}`"
          >
            <div class="rank-number">{{ index + 1 }}</div>
            <div class="rank-info">
              <div class="rank-name">{{ char.name }}</div>
              <div class="rank-popularity">
                <van-progress
                  :percentage="char.popularity"
                  :color="getProgressColor(char.popularity)"
                  stroke-width="6"
                />
              </div>
            </div>
            <div class="rank-value">{{ char.popularity }}</div>
          </div>
        </div>
      </div>

      <!-- 剧情列表 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">剧情列表</h2>
          <van-button size="small" type="primary" @click="goToPlot">+ 添加剧情</van-button>
        </div>
        <van-empty v-if="game.plots.length === 0" description="暂无剧情">
          <van-button size="small" type="primary" @click="goToPlot">设计剧情</van-button>
        </van-empty>
        <div v-else class="plot-list">
          <van-cell
            v-for="plot in game.plots"
            :key="plot.id"
            :title="plot.title"
            :label="plot.summary"
            class="plot-cell"
          >
            <template #right-icon>
              <van-tag :type="getRouteType(plot.routeType)">
                {{ getRouteLabel(plot.routeType) }}
              </van-tag>
            </template>
          </van-cell>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button
          v-if="game.status === 'draft'"
          type="primary"
          block
          round
          color="linear-gradient(to right, #FF69B4, #FFB6C1)"
          @click="goToPublish"
        >
          发布游戏
        </van-button>
        <van-button
          v-else
          type="default"
          block
          round
          @click="goToOperation"
        >
          查看运营数据
        </van-button>
        <van-button
          type="danger"
          block
          round
          plain
          @click="confirmDelete"
        >
          删除游戏
        </van-button>
      </div>
    </template>

    <PopularityRise
      v-if="showPopularityRise"
      :value="popularityRiseData.value"
      :character-name="popularityRiseData.characterName"
      :position="popularityRiseData.position"
      :duration="2000"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { showDialog, showToast } from 'vant';
import ResourceManager from '@/components/game/ResourceManager.vue';
import MilestoneCard from '@/components/game/MilestoneCard.vue';
import PopularityRise from '@/components/animations/PopularityRise.vue';
import RatingDisplay from '@/components/game/RatingDisplay.vue';

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();

const loading = ref(true);
const trendChartRef = ref<HTMLCanvasElement | null>(null);
const trendChartData = ref<Array<{ name: string; popularity: number; trend: number }>>([]);
const showPopularityRise = ref(false);
const popularityRiseData = ref({
  value: 0,
  characterName: '',
  position: { x: 50, y: 50 }
});

const game = computed(() => {
  const gameId = route.params.id as string;
  return gameStore.games.find(g => g.id === gameId) || null;
});

// 计算总人气值
const totalPopularity = computed(() => {
  if (!game.value) return 0;
  return game.value.characters.reduce((sum, char) => {
    return sum + (char.popularity?.popularity || 50);
  }, 0);
});

// 计算平均人气
const avgPopularity = computed(() => {
  if (!game.value || game.value.characters.length === 0) return 0;
  return Math.round(totalPopularity.value / game.value.characters.length);
});

// 人气最高角色
const topCharacterName = computed(() => {
  if (!game.value || game.value.characters.length === 0) return '-';
  const topChar = [...game.value.characters].sort((a, b) => {
    return (b.popularity?.popularity || 50) - (a.popularity?.popularity || 50);
  })[0];
  return topChar?.name || '-';
});

// 生成趋势图数据
function generateTrendData() {
  if (!game.value) return;
  
  trendChartData.value = game.value.characters.map(char => {
    const popularity = char.popularity?.popularity || 50;
    // 模拟趋势数据（实际应该从历史记录中获取）
    const trend = Math.random() > 0.5 ? 1 : -1;
    return {
      name: char.name,
      popularity,
      trend
    };
  }).sort((a, b) => b.popularity - a.popularity);
  
  nextTick(() => {
    drawTrendChart();
  });
}

// 绘制趋势图
function drawTrendChart() {
  const canvas = trendChartRef.value;
  if (!canvas || trendChartData.value.length === 0) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // 设置 canvas 尺寸
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const width = rect.width;
  const height = rect.height;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // 清空画布
  ctx.clearRect(0, 0, width, height);
  
  // 绘制背景网格
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1;
  
  // 水平网格线
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    
    // Y轴标签
    ctx.fillStyle = '#999';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(100 - i * 20), padding.left - 8, y + 4);
  }
  
  // 绘制柱状图
  const barWidth = Math.min(40, chartWidth / trendChartData.value.length * 0.6);
  const barGap = chartWidth / trendChartData.value.length;
  
  trendChartData.value.forEach((item, index) => {
    const x = padding.left + barGap * index + (barGap - barWidth) / 2;
    const barHeight = (item.popularity / 100) * chartHeight;
    const y = padding.top + chartHeight - barHeight;
    
    // 渐变色
    const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
    if (item.popularity > 80) {
      gradient.addColorStop(0, '#FF69B4');
      gradient.addColorStop(1, '#FFB6C1');
    } else if (item.popularity > 50) {
      gradient.addColorStop(0, '#1989fa');
      gradient.addColorStop(1, '#87CEEB');
    } else {
      gradient.addColorStop(0, '#999');
      gradient.addColorStop(1, '#ccc');
    }
    
    // 绘制圆角柱状图
    ctx.fillStyle = gradient;
    roundRect(ctx, x, y, barWidth, barHeight, 4);
    ctx.fill();
    
    // 绘制数值
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(item.popularity), x + barWidth / 2, y - 6);
    
    // 绘制角色名（旋转45度）
    ctx.save();
    ctx.translate(x + barWidth / 2, padding.top + chartHeight + 15);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(item.name, 0, 0);
    ctx.restore();
    
    // 绘制趋势箭头
    if (item.trend > 0) {
      ctx.fillStyle = '#52c41a';
      ctx.beginPath();
      ctx.moveTo(x + barWidth / 2 - 3, y - 18);
      ctx.lineTo(x + barWidth / 2 + 3, y - 18);
      ctx.lineTo(x + barWidth / 2, y - 24);
      ctx.fill();
    } else {
      ctx.fillStyle = '#ff4d4f';
      ctx.beginPath();
      ctx.moveTo(x + barWidth / 2 - 3, y - 24);
      ctx.lineTo(x + barWidth / 2 + 3, y - 24);
      ctx.lineTo(x + barWidth / 2, y - 18);
      ctx.fill();
    }
  });
  
  // 绘制坐标轴
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();
}

// 绘制圆角矩形
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// 监听角色数据变化
watch(() => game.value?.characters, (newChars, oldChars) => {
  if (oldChars && newChars) {
    newChars.forEach(char => {
      const oldChar = oldChars.find(c => c.id === char.id);
      if (oldChar && char.popularity && oldChar.popularity) {
        const rise = char.popularity.popularity - oldChar.popularity.popularity;
        if (rise > 10) {
          triggerPopularityRise(char.name, rise);
        }
      }
    });
  }
  generateTrendData();
}, { deep: true });

const gameStatus = computed(() => {
  if (!game.value) return { type: 'default', text: '未知' };
  const statusMap: Record<string, { type: string; text: string }> = {
    draft: { type: 'warning', text: '草稿' },
    published: { type: 'success', text: '已发布' },
    archived: { type: 'default', text: '已归档' }
  };
  return statusMap[game.value.status] || { type: 'default', text: '未知' };
});

// 角色人气排行榜
const popularityRanking = computed(() => {
  if (!game.value) return [];
  return gameStore.getPopularityRanking(10);
});

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
    if (game.value) {
      gameStore.setCurrentGame(game.value.id);
      generateTrendData();
    }
  }, 500);
});

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN');
}

function getPopularityType(popularity: number): string {
  if (popularity > 80) return 'danger';
  if (popularity > 50) return 'primary';
  return 'default';
}

function getPopularityClass(popularity: number): string {
  if (popularity > 80) return 'high';
  if (popularity > 50) return 'medium';
  return 'low';
}

function getProgressColor(popularity: number): string {
  if (popularity > 80) return '#FF69B4';
  if (popularity > 50) return '#1989fa';
  return '#999';
}

function getRouteType(type: string) {
  const map: Record<string, string> = {
    sweet: 'success',
    angst: 'danger',
    suspense: 'warning'
  };
  return map[type] || 'default';
}

function getRouteLabel(type: string) {
  const map: Record<string, string> = {
    sweet: '甜宠',
    angst: '虐恋',
    suspense: '悬疑'
  };
  return map[type] || type;
}

function goToCreator() {
  router.push('/creator');
}

function goToPlot() {
  router.push('/creator/plot');
}

function goToPublish() {
  router.push('/publish');
}

function goToOperation() {
  router.push('/operation');
}

function goToCharacter(characterId: string) {
  router.push(`/game/${game.value?.id}/character/${characterId}`);
}

// CP 热度相关函数
function getTopCpHeat(characterId: string, limit: number = 3) {
  const char = game.value?.characters.find(c => c.id === characterId);
  if (!char || !char.popularity) return {};
  
  const cpHeat = char.popularity.cpHeat || {};
  const sorted = Object.entries(cpHeat)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);
  
  return Object.fromEntries(sorted);
}

function getCharacterName(characterId: string): string {
  const char = game.value?.characters.find(c => c.id === characterId);
  return char?.name || characterId;
}

function getCpHeatColor(heat: number): string {
  if (heat > 80) return '#ff4d4f';
  if (heat > 50) return '#fa8c16';
  return '#52c41a';
}

function triggerPopularityRise(characterName: string, value: number) {
  popularityRiseData.value = {
    value,
    characterName,
    position: { x: 50, y: 40 }
  };
  showPopularityRise.value = true;
  
  setTimeout(() => {
    showPopularityRise.value = false;
  }, 2000);
}

async function confirmDelete() {
  if (!game.value) return;
  
  const result = await showDialog({
    title: '确认删除',
    message: `确定要删除游戏《${game.value.title}》吗？此操作不可恢复。`,
    showCancelButton: true,
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  });
  
  if (result === 'confirm') {
    const success = gameStore.deleteGame(game.value.id);
    if (success) {
      showToast('游戏已删除');
      router.push('/');
    }
  }
}
</script>

<style scoped lang="scss">
.game-detail-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  padding: 16px;
  padding-bottom: 80px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  
  p {
    margin-top: 16px;
    color: #999;
  }
}

.game-header {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.game-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.game-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.game-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.game-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
}

.game-rating-section {
  margin-top: 16px;
}

.section {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.character-list {
  .character-card {
    margin-bottom: 12px;
    background: #f9f9f9;
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 105, 180, 0.2);
    }
  }

  .character-desc {
    p {
      font-size: 13px;
      color: #666;
      margin: 0 0 8px 0;
    }
  }

  .personality-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .popularity-stats {
    display: flex;
    gap: 12px;
    margin-top: 8px;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #999;
    }
  }

  // CP 热度展示
  .cp-heat-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;

    .cp-title {
      font-size: 13px;
      font-weight: bold;
      color: #666;
      margin-bottom: 8px;
    }

    .cp-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .cp-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .cp-name {
          font-size: 12px;
          color: #333;
          min-width: 50px;
        }

        .cp-progress {
          flex: 1;
        }

        .cp-value {
          font-size: 12px;
          font-weight: bold;
          color: #666;
          min-width: 20px;
          text-align: right;
        }
      }
    }
  }
}

.popularity-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  
  &.high {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

// 人气排行榜
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  
  &.rank-1 {
    background: linear-gradient(135deg, #FFD700 0%, #FFF8DC 100%);
    border: 2px solid #FFD700;
  }
  
  &.rank-2 {
    background: linear-gradient(135deg, #C0C0C0 0%, #F8F8FF 100%);
    border: 2px solid #C0C0C0;
  }
  
  &.rank-3 {
    background: linear-gradient(135deg, #CD7F32 0%, #FFF8F0 100%);
    border: 2px solid #CD7F32;
  }
}

.rank-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  font-weight: bold;
  font-size: 16px;
  color: #666;
  
  .rank-1 & {
    background: #FFD700;
    color: white;
    font-size: 20px;
  }
  
  .rank-2 & {
    background: #C0C0C0;
    color: white;
    font-size: 18px;
  }
  
  .rank-3 & {
    background: #CD7F32;
    color: white;
    font-size: 18px;
  }
}

.rank-info {
  flex: 1;
  
  .rank-name {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 6px;
  }
}

.rank-value {
  width: 40px;
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  color: #FF69B4;
}

// 人气趋势概览样式
.popularity-overview {
  .trend-legend {
    display: flex;
    gap: 16px;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #666;
      
      .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        
        &.up {
          background: #52c41a;
        }
        
        &.down {
          background: #ff4d4f;
        }
      }
    }
  }
  
  .trend-chart-container {
    position: relative;
    height: 200px;
    margin: 16px 0;
    
    .trend-chart {
      width: 100%;
      height: 100%;
    }
    
    .chart-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      p {
        margin-top: 8px;
        color: #999;
        font-size: 14px;
      }
    }
  }
  
  .popularity-summary {
    display: flex;
    justify-content: space-around;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
    
    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      
      .summary-label {
        font-size: 12px;
        color: #999;
      }
      
      .summary-value {
        font-size: 18px;
        font-weight: bold;
        color: #333;
        
        &.highlight {
          color: #FF69B4;
        }
      }
    }
  }
}

.plot-list {
  .plot-cell {
    margin-bottom: 8px;
    border-radius: 8px;
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}
</style>
