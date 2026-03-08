<template>
  <div class="tab-content">
    <!-- 自动结算开关 -->
    <div class="auto-settle-card">
      <div class="settle-header">
        <span class="settle-title">⚙️ 自动结算</span>
        <van-switch v-model="autoSettleEnabled" size="24" active-color="#FF69B4" />
      </div>
      <p class="settle-desc">开启后每小时自动结算一次运营数据</p>
      <div class="settle-actions">
        <van-button
          size="small"
          round
          type="primary"
          color="linear-gradient(to right, #FF69B4, #FFB6C1)"
          @click="handleManualSettle"
        >
          立即结算
        </van-button>
      </div>
    </div>

    <!-- 玩家状态统计卡片 -->
    <div class="player-stats-card">
      <div class="stats-header">
        <span class="stats-title">玩家生命周期统计</span>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value active">{{ playerStateStats[PlayerState.ACTIVE] }}</div>
          <div class="stat-label">活跃玩家</div>
        </div>
        <div class="stat-item">
          <div class="stat-value paying">{{ playerStateStats[PlayerState.PAYING] }}</div>
          <div class="stat-label">付费玩家</div>
        </div>
        <div class="stat-item">
          <div class="stat-value at-risk">{{ playerStateStats[PlayerState.AT_RISK] }}</div>
          <div class="stat-label">有风险</div>
        </div>
        <div class="stat-item">
          <div class="stat-value lost">{{ playerStateStats[PlayerState.LOST] }}</div>
          <div class="stat-label">流失玩家</div>
        </div>
        <div class="stat-item">
          <div class="stat-value returned">{{ playerStateStats[PlayerState.RETURNED] }}</div>
          <div class="stat-label">回归玩家</div>
        </div>
        <div class="stat-item">
          <div class="stat-value new">{{ playerStateStats[PlayerState.NEW] }}</div>
          <div class="stat-label">新玩家</div>
        </div>
      </div>
      <div class="total-players">
        总玩家数：<span class="total-value">{{ playerStore.players.length }}</span>
      </div>
    </div>

    <!-- 玩家状态趋势图 -->
    <div class="trend-chart-card">
      <div class="chart-header">
        <span class="chart-title">📈 玩家状态趋势</span>
        <van-button size="mini" round @click="refreshTrendChart">刷新</van-button>
      </div>
      <div class="chart-container">
        <canvas ref="trendChartRef" class="trend-canvas"></canvas>
      </div>
      <div class="chart-legend">
        <span class="legend-item"><span class="legend-dot active"></span>活跃</span>
        <span class="legend-item"><span class="legend-dot lost"></span>流失</span>
        <span class="legend-item"><span class="legend-dot new"></span>新增</span>
      </div>
    </div>

    <!-- 最近流失/回归玩家列表 -->
    <div class="recent-changes-card">
      <div class="section-header">
        <h4>最近状态变化</h4>
      </div>
      <van-empty v-if="recentChanges.length === 0" description="暂无状态变化记录" />
      <van-cell v-else v-for="change in recentChanges" :key="change.id" :title="change.playerName">
        <template #label>
          {{ change.time }}
        </template>
        <template #right-icon>
          <van-tag :type="change.type === 'lost' ? 'danger' : 'success'">
            {{ change.type === 'lost' ? '流失' : '回归' }}
          </van-tag>
        </template>
      </van-cell>
    </div>

    <!-- 模拟预测数据 -->
    <div v-if="simulationStore.isInitialized" class="simulation-data-card">
      <div class="section-header">
        <h4>🔮 模拟预测数据</h4>
      </div>
      <div class="simulation-stats">
        <div class="sim-stat-item">
          <span class="sim-label">留存 D1</span>
          <span class="sim-value">{{ simulationStore.currentRetention.d1 }}%</span>
        </div>
        <div class="sim-stat-item">
          <span class="sim-label">留存 D7</span>
          <span class="sim-value">{{ simulationStore.currentRetention.d7 }}%</span>
        </div>
        <div class="sim-stat-item">
          <span class="sim-label">留存 D30</span>
          <span class="sim-value">{{ simulationStore.currentRetention.d30 }}%</span>
        </div>
      </div>
      <div class="sentiment-preview">
        <span class="sentiment-title">玩家情绪</span>
        <div class="sentiment-bars">
          <div class="sentiment-row">
            <span class="sentiment-label">正面</span>
            <div class="sentiment-bar">
              <div class="sentiment-fill positive" :style="{ width: simulationStore.sentimentDistribution.positive + '%' }"></div>
            </div>
            <span class="sentiment-value">{{ simulationStore.sentimentDistribution.positive }}%</span>
          </div>
          <div class="sentiment-row">
            <span class="sentiment-label">中性</span>
            <div class="sentiment-bar">
              <div class="sentiment-fill neutral" :style="{ width: simulationStore.sentimentDistribution.neutral + '%' }"></div>
            </div>
            <span class="sentiment-value">{{ simulationStore.sentimentDistribution.neutral }}%</span>
          </div>
          <div class="sentiment-row">
            <span class="sentiment-label">负面</span>
            <div class="sentiment-bar">
              <div class="sentiment-fill negative" :style="{ width: simulationStore.sentimentDistribution.negative + '%' }"></div>
            </div>
            <span class="sentiment-value">{{ simulationStore.sentimentDistribution.negative }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { showToast } from 'vant';
import { usePlayerStore, PlayerState } from '@/stores/playerStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { useOperationStore } from '@/stores/operationStore';
import { useCommentStore } from '@/stores/commentStore';

const playerStore = usePlayerStore();
const simulationStore = useSimulationStore();
const operationStore = useOperationStore();
const commentStore = useCommentStore();

const autoSettleEnabled = ref(false);
let settleInterval: ReturnType<typeof setInterval> | null = null;
const trendChartRef = ref<HTMLCanvasElement | null>(null);

const trendData = ref<{
  dates: string[];
  active: number[];
  lost: number[];
  new: number[];
}>({
  dates: ['6天前', '5天前', '4天前', '3天前', '2天前', '昨天', '今天'],
  active: [0, 0, 0, 0, 0, 0, 0],
  lost: [0, 0, 0, 0, 0, 0, 0],
  new: [0, 0, 0, 0, 0, 0, 0]
});

const playerStateStats = computed(() => playerStore.getPlayerStateStats());

const recentChanges = ref<Array<{
  id: string;
  playerId: string;
  playerName: string;
  type: 'lost' | 'returned';
  time: string;
}>>([]);

function handleManualSettle() {
  operationStore.simulateOneDay();
  commentStore.generateDailyComments(5);
  updateTrendData();
  showToast('结算完成，已更新运营数据');
}

function updateTrendData() {
  const stats = playerStore.getPlayerStateStats();
  trendData.value.active.shift();
  trendData.value.active.push(stats[PlayerState.ACTIVE]);
  trendData.value.lost.shift();
  trendData.value.lost.push(stats[PlayerState.LOST]);
  trendData.value.new.shift();
  trendData.value.new.push(stats[PlayerState.NEW]);

  nextTick(() => {
    drawTrendChart();
  });
}

function refreshTrendChart() {
  updateTrendData();
  showToast('趋势图已刷新');
}

function drawTrendChart() {
  const canvas = trendChartRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.clearRect(0, 0, width, height);

  const allValues = [...trendData.value.active, ...trendData.value.lost, ...trendData.value.new];
  const maxValue = Math.max(...allValues, 100);

  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  function drawLine(data: number[], color: string) {
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((value, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    data.forEach((value, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      if (!ctx) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawLine(trendData.value.active, '#1890ff');
  drawLine(trendData.value.lost, '#ff4d4f');
  drawLine(trendData.value.new, '#52c41a');

  ctx.fillStyle = '#999';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  trendData.value.dates.forEach((date, index) => {
    const x = padding.left + (chartWidth / (trendData.value.dates.length - 1)) * index;
    ctx.fillText(date, x, height - 8);
  });
}

watch(autoSettleEnabled, (enabled) => {
  if (enabled) {
    settleInterval = setInterval(() => {
      handleManualSettle();
    }, 10000);
    showToast('已开启自动结算（每10秒）');
  } else {
    if (settleInterval) {
      clearInterval(settleInterval);
      settleInterval = null;
    }
    showToast('已关闭自动结算');
  }
});

onMounted(() => {
  nextTick(() => {
    updateTrendData();
  });
});

onUnmounted(() => {
  if (settleInterval) {
    clearInterval(settleInterval);
  }
});
</script>

<style scoped lang="scss">
.tab-content {
  padding: 16px;
  min-height: 300px;
}

.auto-settle-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .settle-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .settle-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }

  .settle-desc {
    font-size: 12px;
    color: #999;
    margin: 0 0 12px 0;
  }

  .settle-actions {
    display: flex;
    justify-content: flex-end;
  }
}

.player-stats-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .stats-header {
    margin-bottom: 20px;

    .stats-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 16px;

    .stat-item {
      text-align: center;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      transition: all 0.3s;

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;

        &.active { color: #1890ff; }
        &.paying { color: #fa8c16; }
        &.at-risk { color: #faad14; }
        &.lost { color: #ff4d4f; }
        &.returned { color: #52c41a; }
        &.new { color: #722ed1; }
      }

      .stat-label {
        font-size: 12px;
        color: #666;
      }
    }
  }

  .total-players {
    text-align: center;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
    font-size: 14px;
    color: #666;

    .total-value {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin-left: 8px;
    }
  }
}

.trend-chart-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .chart-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }

  .chart-container {
    height: 150px;
    margin-bottom: 12px;

    .trend-canvas {
      width: 100%;
      height: 100%;
    }
  }

  .chart-legend {
    display: flex;
    justify-content: center;
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

        &.active { background: #1890ff; }
        &.lost { background: #ff4d4f; }
        &.new { background: #52c41a; }
      }
    }
  }
}

.recent-changes-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .section-header {
    margin-bottom: 16px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }
}

.simulation-data-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .section-header {
    margin-bottom: 16px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }

  .simulation-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;

    .sim-stat-item {
      text-align: center;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;

      .sim-label {
        display: block;
        font-size: 12px;
        color: #999;
        margin-bottom: 4px;
      }

      .sim-value {
        font-size: 18px;
        font-weight: bold;
        color: #1890ff;
      }
    }
  }

  .sentiment-preview {
    .sentiment-title {
      font-size: 14px;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 12px;
    }

    .sentiment-bars {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .sentiment-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .sentiment-label {
          width: 40px;
          font-size: 12px;
          color: #666;
        }

        .sentiment-bar {
          flex: 1;
          height: 12px;
          background: #f0f0f0;
          border-radius: 6px;
          overflow: hidden;

          .sentiment-fill {
            height: 100%;
            border-radius: 6px;
            transition: width 0.3s;

            &.positive { background: #52c41a; }
            &.neutral { background: #faad14; }
            &.negative { background: #ff4d4f; }
          }
        }

        .sentiment-value {
          width: 40px;
          text-align: right;
          font-size: 12px;
          color: #333;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
