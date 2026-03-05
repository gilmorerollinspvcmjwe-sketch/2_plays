<template>
  <div class="operation-view">
    <!-- 运营数据概览 -->
    <OperationDashboard
      :stats="operationStore.stats"
      :reputation-emoji="operationStore.reputationEmoji"
      :reputation-color="operationStore.reputationColor"
      :ongoing-events="operationStore.ongoingEvents"
      :pending-incidents="operationStore.pendingIncidents"
      @create-pool="showCreatePool = true"
      @create-event="showCreateEvent = true"
      @simulate-day="handleSimulateDay"
    />

    <!-- Tab 切换 -->
    <van-tabs v-model="activeTab" class="operation-tabs">
      <van-tab title="卡池管理">
        <div class="tab-content">
          <div v-if="operationStore.gachaPools.length === 0" class="empty-state">
            <van-empty description="暂无卡池">
              <van-button
                type="primary"
                size="small"
                round
                color="linear-gradient(to right, #FF69B4, #FFB6C1)"
                @click="showCreatePool = true"
              >
                创建卡池
              </van-button>
            </van-empty>
          </div>
          <div v-else class="pool-list">
            <van-card
              v-for="pool in operationStore.gachaPools"
              :key="pool.id"
              :title="pool.name"
              :desc="`UP: ${pool.upCharacters.join(', ')}`"
              class="pool-card"
            >
              <template #tags>
                <van-tag :type="getStatusType(pool.status)">
                  {{ getStatusLabel(pool.status) }}
                </van-tag>
                <van-tag plain>SSR {{ pool.rates.ssr }}%</van-tag>
              </template>
              <template #footer>
                <span class="pool-stats">抽卡：{{ pool.totalDraws }} | 收入：{{ pool.revenue }}</span>
              </template>
            </van-card>
          </div>
          <div class="simulator-action">
            <van-button
              type="primary"
              size="large"
              round
              block
              color="linear-gradient(to right, #FF69B4, #FFB6C1)"
              @click="showGachaSimulator = true"
            >
              🎮 抽卡模拟
            </van-button>
          </div>
        </div>
      </van-tab>

      <van-tab title="活动中心">
        <div class="tab-content">
          <!-- 活动模板选择器 -->
          <div class="template-section">
            <div class="section-header">
              <h4>📋 从模板创建活动</h4>
              <van-button
                type="primary"
                size="small"
                round
                color="linear-gradient(to right, #07c160, #10b981)"
                @click="showTemplateSelector = true"
              >
                浏览模板
              </van-button>
            </div>
            <p class="section-desc">20+ 精心设计的活动模板，一键创建</p>
          </div>

          <!-- 活动列表 -->
          <div v-if="operationStore.events.length === 0" class="empty-state">
            <van-empty description="暂无活动">
              <van-button
                type="primary"
                size="small"
                round
                color="linear-gradient(to right, #07c160, #10b981)"
                @click="showCreateEvent = true"
              >
                创建活动
              </van-button>
            </van-empty>
          </div>
          <div v-else class="event-list">
            <van-cell
              v-for="event in operationStore.events"
              :key="event.id"
              :title="event.name"
              :label="event.description"
              class="event-cell"
            >
              <template #icon>
                <div class="event-icon">{{ getEventIcon(event.type) }}</div>
              </template>
              <template #right-icon>
                <van-tag :type="getStatusType(event.status)">
                  {{ getStatusLabel(event.status) }}
                </van-tag>
              </template>
            </van-cell>
          </div>
        </div>
      </van-tab>

      <van-tab title="运营事件">
        <div class="tab-content">
          <!-- 舆论热度仪表盘 -->
          <div class="opinion-gauge-card">
            <div class="gauge-header">
              <span class="gauge-title">舆论热度</span>
              <span class="gauge-value">{{ commentStore.publicOpinion.heat }}</span>
            </div>
            <van-progress
              :percentage="commentStore.publicOpinion.heat"
              :color="getHeatColor(commentStore.publicOpinion.heat)"
              stroke-width="10"
              class="gauge-progress"
            />
            <div class="gauge-meta">
              <span :class="['sentiment', getSentimentClass(commentStore.publicOpinion.sentiment)]">
                {{ commentStore.publicOpinion.sentiment > 0 ? '正面' : commentStore.publicOpinion.sentiment < 0 ? '负面' : '中立' }}
              </span>
              <span class="trend">
                {{ commentStore.publicOpinion.trend === 'up' ? '📈 上升' : commentStore.publicOpinion.trend === 'down' ? '📉 下降' : '➡️ 稳定' }}
              </span>
            </div>
          </div>

          <IncidentHandler />
        </div>
      </van-tab>

      <van-tab title="玩家数据">
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
                <div class="stat-value active">{{ playerStore.getPlayerStateStats().active }}</div>
                <div class="stat-label">活跃玩家</div>
              </div>
              <div class="stat-item">
                <div class="stat-value paying">{{ playerStore.getPlayerStateStats().paying }}</div>
                <div class="stat-label">付费玩家</div>
              </div>
              <div class="stat-item">
                <div class="stat-value at-risk">{{ playerStore.getPlayerStateStats().atRisk }}</div>
                <div class="stat-label">有风险</div>
              </div>
              <div class="stat-item">
                <div class="stat-value lost">{{ playerStore.getPlayerStateStats().lost }}</div>
                <div class="stat-label">流失玩家</div>
              </div>
              <div class="stat-item">
                <div class="stat-value returned">{{ playerStore.getPlayerStateStats().returned }}</div>
                <div class="stat-label">回归玩家</div>
              </div>
              <div class="stat-item">
                <div class="stat-value new">{{ playerStore.getPlayerStateStats().new }}</div>
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
      </van-tab>

      <van-tab title="福利发放">
        <div class="tab-content">
          <van-cell-group title="全服补偿" inset>
            <van-field
              v-model="welfareForm.content"
              label="补偿内容"
              placeholder="例如：钻石x1000"
            />
            <van-cell>
              <template #right-icon>
                <van-button
                  type="primary"
                  size="small"
                  round
                  color="linear-gradient(to right, #FF69B4, #FFB6C1)"
                  @click="handleSendWelfare('compensation')"
                >
                  发放
                </van-button>
              </template>
            </van-cell>
          </van-cell-group>

          <van-cell-group title="兑换码" inset class="welfare-group">
            <van-field
              v-model="welfareForm.redeemCode"
              label="兑换码"
              placeholder="输入兑换码"
            />
            <van-cell>
              <template #right-icon>
                <van-button
                  type="primary"
                  size="small"
                  round
                  @click="handleGenerateRedeemCode"
                >
                  生成
                </van-button>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </van-tab>

      <van-tab title="告白墙">
        <div class="tab-content no-padding">
          <ConfessionWall />
        </div>
      </van-tab>

      <van-tab title="同人广场">
        <div class="tab-content no-padding">
          <FanCreationSquare />
        </div>
      </van-tab>

      <van-tab title="市场情报">
        <div class="tab-content no-padding">
          <MarketDashboard />
        </div>
      </van-tab>
    </van-tabs>

    <!-- 创建卡池弹窗 -->
    <van-dialog
      v-model:show="showCreatePool"
      title="创建卡池"
      show-cancel-button
      @confirm="handleCreatePool"
    >
      <van-field
        v-model="poolForm.name"
        label="卡池名称"
        placeholder="请输入卡池名称"
      />
      <van-field
        v-model="poolForm.upCharacters"
        label="UP角色"
        placeholder="用逗号分隔多个角色"
      />
      <div class="form-item">
        <label class="form-label">SSR概率: {{ poolForm.rates.ssr }}%</label>
        <van-slider v-model="poolForm.rates.ssr" :min="1" :max="5" :step="0.5" />
      </div>
      <div class="form-item">
        <label class="form-label">预算等级</label>
        <van-radio-group v-model="poolForm.budget" direction="horizontal">
          <van-radio name="低">低</van-radio>
          <van-radio name="中">中</van-radio>
          <van-radio name="高">高</van-radio>
        </van-radio-group>
      </div>
    </van-dialog>

    <!-- 创建活动弹窗 -->
    <van-dialog
      v-model:show="showCreateEvent"
      title="创建活动"
      show-cancel-button
      @confirm="handleCreateEvent"
    >
      <van-field
        v-model="eventForm.name"
        label="活动名称"
        placeholder="请输入活动名称"
      />
      <van-field
        v-model="eventForm.description"
        label="活动描述"
        type="textarea"
        rows="2"
        placeholder="请输入活动描述"
      />
      <div class="form-item">
        <label class="form-label">活动类型</label>
        <van-radio-group v-model="eventForm.type" direction="horizontal">
          <van-radio name="festival">节日</van-radio>
          <van-radio name="birthday">生日</van-radio>
          <van-radio name="collaboration">联动</van-radio>
        </van-radio-group>
      </div>
    </van-dialog>

    <!-- 活动模板选择器弹窗 -->
    <van-popup
      v-model:show="showTemplateSelector"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <EventTemplateSelector />
    </van-popup>

    <!-- 抽卡模拟器弹窗 -->
    <van-popup
      v-model:show="showGachaSimulator"
      position="center"
      round
      :style="{ width: '95%', height: '85%' }"
    >
      <div class="simulator-popup">
        <div class="simulator-header">
          <h3>✨ 抽卡模拟器 ✨</h3>
          <van-icon name="cross" size="20" @click="showGachaSimulator = false" />
        </div>
        <div class="simulator-content">
          <GachaSimulator />
        </div>
      </div>
    </van-popup>

    <!-- 处理事件弹窗 -->
    <van-dialog
      v-model:show="showHandleIncident"
      :title="selectedIncident?.name"
      show-cancel-button
      cancel-button-text="取消"
    >
      <div class="incident-detail" v-if="selectedIncident">
        <p class="incident-desc">{{ selectedIncident.description }}</p>
        <div class="player-reactions">
          <h4>玩家反应：</h4>
          <p v-for="(reaction, idx) in selectedIncident.playerReactions.slice(0, 3)" :key="idx">
            💬 {{ reaction }}
          </p>
        </div>
        <div class="solutions">
          <h4>选择处理方案：</h4>
          <van-radio-group v-model="selectedSolution">
            <van-cell-group>
              <van-cell
                v-for="(solution, idx) in selectedIncident.solutions"
                :key="idx"
                :title="solution.action"
                :label="`成本: ${solution.cost} | ${solution.effect}`"
                clickable
                @click="selectedSolution = solution"
              >
                <template #right-icon>
                  <van-radio :name="solution" />
                </template>
              </van-cell>
            </van-cell-group>
          </van-radio-group>
        </div>
      </div>
      <template #confirm>
        <van-button
          type="primary"
          block
          round
          color="linear-gradient(to right, #FF69B4, #FFB6C1)"
          @click="handleResolveIncident"
        >
          确认处理
        </van-button>
      </template>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useOperationStore } from '@/stores/operationStore';
import { useCommentStore } from '@/stores/commentStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { showToast } from 'vant';
import OperationDashboard from '@/components/operation/OperationDashboard.vue';
import EventTemplateSelector from '@/components/operation/EventTemplateSelector.vue';
import IncidentHandler from '@/components/operation/IncidentHandler.vue';
import GachaSimulator from '@/components/gacha/GachaSimulator.vue';
import ConfessionWall from '@/components/social/ConfessionWall.vue';
import FanCreationSquare from '@/components/social/FanCreationSquare.vue';
import MarketDashboard from '@/components/market/MarketDashboard.vue';

const operationStore = useOperationStore();
const commentStore = useCommentStore();
const playerStore = usePlayerStore();
const simulationStore = useSimulationStore();
const activeTab = ref(0);

// 自动结算
const autoSettleEnabled = ref(false);
let settleInterval: ReturnType<typeof setInterval> | null = null;
const trendChartRef = ref<HTMLCanvasElement | null>(null);

// 趋势数据（模拟7天数据）
const trendData = ref<{
  dates: string[];
  active: number[];
  lost: number[];
  new: number[];
}>({
  dates: ['6天前', '5天前', '4天前', '3天前', '2天前', '昨天', '今天'],
  active: [450, 480, 520, 490, 510, 530, 0],
  lost: [10, 15, 8, 20, 12, 18, 0],
  new: [30, 45, 25, 50, 35, 40, 0]
});

// 最近状态变化数据（模拟，实际应该从 Store 获取）
const recentChanges = ref([
  { id: '1', playerId: 'p1', playerName: '张三', type: 'lost', time: '2 小时前' },
  { id: '2', playerId: 'p2', playerName: '李四', type: 'returned', time: '5 小时前' },
  { id: '3', playerId: 'p3', playerName: '王五', type: 'lost', time: '1 天前' }
]);

// 弹窗状态
const showCreatePool = ref(false);
const showCreateEvent = ref(false);
const showHandleIncident = ref(false);
const showTemplateSelector = ref(false);
const showGachaSimulator = ref(false);
const selectedIncident = ref<{ id: string } | null>(null);
const selectedSolution = ref<{ action: string; cost: string; effect: string } | null>(null);

// 表单数据
const poolForm = ref({
  name: '',
  upCharacters: '',
  rates: { ssr: 2, sr: 8, r: 90 },
  budget: '中' as const,
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 7 * 86400000).toISOString()
});

const eventForm = ref({
  name: '',
  description: '',
  type: 'festival' as const,
  rewards: ['钻石x500'],
  mechanics: ['完成任务'],
  budget: '中' as const,
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 14 * 86400000).toISOString()
});

const welfareForm = ref({
  content: '',
  redeemCode: ''
});

// 状态标签
function getStatusType(status: string): string {
  const map: Record<string, string> = {
    ongoing: 'success',
    upcoming: 'warning',
    ended: 'default',
    pending: 'danger',
    resolved: 'success'
  };
  return map[status] || 'default';
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ongoing: '进行中',
    upcoming: '即将开始',
    ended: '已结束',
    pending: '待处理',
    resolved: '已解决'
  };
  return map[status] || status;
}

function getEventIcon(type: string): string {
  const map: Record<string, string> = {
    festival: '🎉',
    birthday: '🎂',
    collaboration: '🤝'
  };
  return map[type] || '📅';
}

// 舆论热度颜色
function getHeatColor(heat: number): string {
  if (heat >= 80) return '#ff4d4f'; // 红色 - 高热度
  if (heat >= 50) return '#fa8c16'; // 橙色 - 中等热度
  return '#52c41a'; // 绿色 - 低热度
}

// 情感倾向样式类
function getSentimentClass(sentiment: number): string {
  if (sentiment > 0) return 'positive';
  if (sentiment < 0) return 'negative';
  return 'neutral';
}

// 创建卡池
async function handleCreatePool() {
  if (!poolForm.value.name || !poolForm.value.upCharacters) {
    showToast('请填写完整信息');
    return;
  }

  const result = await operationStore.createGachaPool({
    name: poolForm.value.name,
    upCharacters: poolForm.value.upCharacters.split(',').map(s => s.trim()),
    rates: poolForm.value.rates,
    budget: poolForm.value.budget,
    startTime: poolForm.value.startTime,
    endTime: poolForm.value.endTime
  });

  if (result.success) {
    showToast(result.message);
    showCreatePool.value = false;
    resetPoolForm();
  } else {
    showToast(result.message);
  }
}

// 创建活动
async function handleCreateEvent() {
  if (!eventForm.value.name || !eventForm.value.description) {
    showToast('请填写完整信息');
    return;
  }

  const result = await operationStore.createEvent({
    name: eventForm.value.name,
    description: eventForm.value.description,
    type: eventForm.value.type,
    rewards: eventForm.value.rewards,
    mechanics: eventForm.value.mechanics,
    budget: eventForm.value.budget,
    startTime: eventForm.value.startTime,
    endTime: eventForm.value.endTime
  });

  if (result.success) {
    showToast(result.message);
    showCreateEvent.value = false;
    resetEventForm();
  } else {
    showToast(result.message);
  }
}

// 解决事件
async function handleResolveIncident() {
  if (!selectedSolution.value) {
    showToast('请选择处理方案');
    return;
  }

  if (!selectedIncident.value) {
    showToast('事件不存在');
    return;
  }

  const result = await operationStore.handleIncident(
    selectedIncident.value.id,
    selectedSolution.value
  );

  if (result.success) {
    showToast(result.message);
    showHandleIncident.value = false;
    selectedIncident.value = null;
    selectedSolution.value = null;
  } else {
    showToast(result.message);
  }
}

// 模拟一天
function handleSimulateDay() {
  operationStore.simulateOneDay();
  showToast('已模拟一天运营数据');
}

// 手动结算
function handleManualSettle() {
  operationStore.simulateOneDay();
  commentStore.generateDailyComments(5);
  updateTrendData();
  showToast('结算完成，已更新运营数据');
}

// 更新趋势数据
function updateTrendData() {
  const stats = playerStore.getPlayerStateStats();
  
  // 移动数据，添加新数据
  trendData.value.active.shift();
  trendData.value.active.push(stats.active);
  
  trendData.value.lost.shift();
  trendData.value.lost.push(stats.lost);
  
  trendData.value.new.shift();
  trendData.value.new.push(stats.new);
  
  // 重绘图表
  nextTick(() => {
    drawTrendChart();
  });
}

// 刷新趋势图
function refreshTrendChart() {
  updateTrendData();
  showToast('趋势图已刷新');
}

// 绘制趋势图
function drawTrendChart() {
  const canvas = trendChartRef.value;
  if (!canvas) return;
  
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
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // 清空画布
  ctx.clearRect(0, 0, width, height);
  
  // 找最大值
  const allValues = [...trendData.value.active, ...trendData.value.lost, ...trendData.value.new];
  const maxValue = Math.max(...allValues, 100);
  
  // 绘制网格线
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }
  
  // 绘制折线函数
  function drawLine(data: number[], color: string) {
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((value, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // 绘制点
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
  
  // 绘制三条折线
  drawLine(trendData.value.active, '#1890ff');
  drawLine(trendData.value.lost, '#ff4d4f');
  drawLine(trendData.value.new, '#52c41a');
  
  // 绘制 X 轴标签
  ctx.fillStyle = '#999';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  trendData.value.dates.forEach((date, index) => {
    const x = padding.left + (chartWidth / (trendData.value.dates.length - 1)) * index;
    ctx.fillText(date, x, height - 8);
  });
}

// 监听自动结算开关
watch(autoSettleEnabled, (enabled) => {
  if (enabled) {
    // 每10秒结算一次（测试用，实际应该是每小时）
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

// 监听 Tab 切换到玩家数据时绘制图表
watch(activeTab, (newTab) => {
  if (newTab === 3) { // 玩家数据 Tab
    nextTick(() => {
      updateTrendData();
    });
  }
});

// 发放福利
async function handleSendWelfare(type: 'compensation' | 'login' | 'redeem') {
  if (!welfareForm.value.content) {
    showToast('请输入补偿内容');
    return;
  }

  const result = await operationStore.sendWelfare(
    type,
    welfareForm.value.content,
    100
  );

  if (result.success) {
    showToast(result.message);
    welfareForm.value.content = '';
  }
}

// 生成兑换码
function handleGenerateRedeemCode() {
  const code = 'GIFT' + Math.random().toString(36).substr(2, 6).toUpperCase();
  welfareForm.value.redeemCode = code;
  showToast('兑换码已生成');
}

// 重置表单
function resetPoolForm() {
  poolForm.value = {
    name: '',
    upCharacters: '',
    rates: { ssr: 2, sr: 8, r: 90 },
    budget: '中',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 7 * 86400000).toISOString()
  };
}

function resetEventForm() {
  eventForm.value = {
    name: '',
    description: '',
    type: 'festival',
    rewards: ['钻石x500'],
    mechanics: ['完成任务'],
    budget: '中',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 14 * 86400000).toISOString()
  };
}

// 初始化
onMounted(() => {
  operationStore.initDefaultData();
});

// 清理
onUnmounted(() => {
  if (settleInterval) {
    clearInterval(settleInterval);
  }
});
</script>

<style scoped lang="scss">
.operation-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  padding: 16px;
  padding-bottom: 80px;
}

.operation-tabs {
  background: white;
  border-radius: 12px;
  overflow: hidden;

  :deep(.van-tabs__nav) {
    background: white;
  }
}

.tab-content {
  padding: 16px;
  min-height: 300px;

  &.no-padding {
    padding: 0;
  }
}

// 舆论热度仪表盘
.opinion-gauge-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .gauge-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .gauge-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }

    .gauge-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
  }

  .gauge-progress {
    margin-bottom: 12px;
  }

  .gauge-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;

    .sentiment {
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 500;

      &.positive {
        background: #f6ffed;
        color: #52c41a;
      }

      &.negative {
        background: #fff1f0;
        color: #ff4d4f;
      }

      &.neutral {
        background: #f5f5f5;
        color: #999;
      }
    }

    .trend {
      color: #666;
    }
  }
}

// 玩家状态统计卡片
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

        &.active {
          color: #1890ff;
        }

        &.paying {
          color: #fa8c16;
        }

        &.at-risk {
          color: #faad14;
        }

        &.lost {
          color: #ff4d4f;
        }

        &.returned {
          color: #52c41a;
        }

        &.new {
          color: #722ed1;
        }
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

// 最近状态变化
.recent-changes-card {
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
}

// 自动结算卡片
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

// 趋势图卡片
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
        
        &.active {
          background: #1890ff;
        }
        
        &.lost {
          background: #ff4d4f;
        }
        
        &.new {
          background: #52c41a;
        }
      }
    }
  }
}

.empty-state {
  padding: 32px 0;
}

.pool-list {
  .pool-card {
    margin-bottom: 12px;
    background: white;
    border-radius: 8px;
  }

  .pool-stats {
    font-size: 12px;
    color: #999;
  }
}

.event-list {
  .event-cell {
    margin-bottom: 8px;
    border-radius: 8px;
  }

  .event-icon {
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
}

.incident-list {
  .incident-cell {
    margin-bottom: 8px;
    border-radius: 8px;

    &.is-pending {
      background: #fff5f5;
    }
  }

  .incident-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-right: 12px;

    &.severity-高 {
      background: #ffe0e0;
    }

    &.severity-中 {
      background: #fff5e0;
    }

    &.severity-低 {
      background: #e0ffe0;
    }
  }
}

.welfare-group {
  margin-top: 16px;
}

.form-item {
  padding: 12px 16px;

  .form-label {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }
}

.incident-detail {
  padding: 16px;

  .incident-desc {
    font-size: 14px;
    color: #333;
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .player-reactions {
    margin-bottom: 16px;

    h4 {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    p {
      font-size: 13px;
      color: #999;
      margin: 4px 0;
    }
  }

  .solutions {
    h4 {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }
  }
}

.template-section {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    h4 {
      margin: 0;
      font-size: 16px;
      color: #2e7d32;
    }
  }

  .section-desc {
    margin: 0;
    font-size: 13px;
    color: #558b2f;
  }
}

.simulator-action {
  margin-top: 16px;
  padding: 8px 0;
}

.simulator-popup {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 85vh;

  .simulator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: linear-gradient(135deg, #FF69B4, #FFB6C1);
    color: white;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }

    .van-icon {
      cursor: pointer;
      padding: 4px;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.9);
      }
    }
  }

  .simulator-content {
    flex: 1;
    overflow-y: auto;
    padding: 0;
  }
}

.simulation-data-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  color: white;

  .section-header {
    margin-bottom: 12px;

    h4 {
      margin: 0;
      font-size: 15px;
      font-weight: bold;
    }
  }

  .simulation-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .sim-stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .sim-label {
    font-size: 12px;
    opacity: 0.8;
  }

  .sim-value {
    font-size: 20px;
    font-weight: bold;
  }

  .sentiment-preview {
    .sentiment-title {
      font-size: 13px;
      opacity: 0.9;
      display: block;
      margin-bottom: 8px;
    }
  }

  .sentiment-bars {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sentiment-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sentiment-label {
    width: 32px;
    font-size: 11px;
    opacity: 0.8;
  }

  .sentiment-bar {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    overflow: hidden;
  }

  .sentiment-fill {
    height: 100%;
    border-radius: 4px;
  }

  .sentiment-fill.positive {
    background: linear-gradient(90deg, #48bb78, #68d391);
  }

  .sentiment-fill.neutral {
    background: linear-gradient(90deg, #a0aec0, #cbd5e0);
  }

  .sentiment-fill.negative {
    background: linear-gradient(90deg, #f56565, #fc8181);
  }

  .sentiment-value {
    width: 36px;
    text-align: right;
    font-size: 11px;
    font-weight: bold;
  }
}
</style>
