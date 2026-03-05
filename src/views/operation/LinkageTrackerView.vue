<template>
  <div class="linkage-tracker">
    <BackButton title="运营联动追踪" />

    <div class="tracker-content">
      <!-- 模块状态 -->
      <div class="module-status">
        <div class="section-title">模块状态</div>
        <div class="module-grid">
          <div
            v-for="module in moduleStats"
            :key="module.name"
            class="module-card"
          >
            <div class="module-icon">
              <van-icon :name="module.icon" :color="module.color" />
            </div>
            <div class="module-name">{{ module.name }}</div>
            <div class="module-stats">
              <span class="immediate">{{ module.immediate }} 立即</span>
              <span class="delayed">{{ module.delayed }} 延迟</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 即时效果 -->
      <div class="effects-section" v-if="immediateEffects.length > 0">
        <div class="section-title">
          <van-icon name="flash-o" color="#52c41a" />
          即时生效效果
        </div>
        <div class="effects-list">
          <div
            v-for="(effect, index) in immediateEffects"
            :key="index"
            class="effect-card immediate"
          >
            <div class="effect-header">
              <span class="effect-source">{{ getModuleName(effect.sourceModule) }}</span>
              <van-icon name="arrow" class="effect-arrow" />
              <span class="effect-target">{{ getModuleName(effect.targetModule) }}</span>
            </div>
            <div class="effect-metric">
              {{ getMetricName(effect.metric) }}
              <span :class="effect.change >= 0 ? 'positive' : 'negative'">
                {{ effect.change >= 0 ? '+' : '' }}{{ effect.change.toFixed(1) }}
              </span>
            </div>
            <div class="effect-duration" v-if="effect.duration > 0">
              剩余 {{ effect.duration }} 天
              <van-progress :percentage="getDurationProgress(effect)" :show-pivot="false" />
            </div>
          </div>
        </div>
      </div>

      <!-- 延迟效果队列 -->
      <div class="effects-section" v-if="delayedEffects.length > 0">
        <div class="section-title">
          <van-icon name="clock-o" color="#faad14" />
          延迟效果队列
        </div>
        <div class="effects-list">
          <div
            v-for="(effect, index) in delayedEffects"
            :key="index"
            class="effect-card delayed"
          >
            <div class="effect-header">
              <span class="effect-source">{{ getModuleName(effect.sourceModule) }}</span>
              <van-icon name="arrow" class="effect-arrow" />
              <span class="effect-target">{{ getModuleName(effect.targetModule) }}</span>
            </div>
            <div class="effect-metric">
              {{ getMetricName(effect.metric) }}
              <span :class="effect.change >= 0 ? 'positive' : 'negative'">
                {{ effect.change >= 0 ? '+' : '' }}{{ effect.change.toFixed(1) }}
              </span>
            </div>
            <div class="effect-countdown">
              <van-icon name="waiting-o" />
              {{ effect.delayDays - effect.daysPassed }} 天后生效
              <van-progress :percentage="getCountdownProgress(effect)" :show-pivot="false" color="#faad14" />
            </div>
          </div>
        </div>
      </div>

      <!-- 因果关系图 -->
      <div class="linkage-diagram">
        <div class="section-title">因果关系图</div>
        <div class="diagram-container">
          <svg viewBox="0 0 400 300" class="linkage-svg">
            <!-- 节点 -->
            <g v-for="node in nodes" :key="node.id">
              <circle
                :cx="node.x"
                :cy="node.y"
                r="30"
                :fill="node.color"
                opacity="0.8"
              />
              <text
                :x="node.x"
                :y="node.y + 4"
                text-anchor="middle"
                fill="white"
                font-size="10"
              >
                {{ node.name }}
              </text>
            </g>
            <!-- 边 -->
            <g v-for="edge in edges" :key="edge.id">
              <line
                :x1="edge.x1"
                :y1="edge.y1"
                :x2="edge.x2"
                :y2="edge.y2"
                :stroke="edge.color"
                stroke-width="2"
                :stroke-dasharray="edge.dashed ? '5,5' : ''"
              />
            </g>
          </svg>
        </div>
      </div>

      <!-- 空状态 -->
      <van-empty v-if="immediateEffects.length === 0 && delayedEffects.length === 0" description="暂无联动效果" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import BackButton from '@/components/common/BackButton.vue';
import { linkageEngine, type LinkageEffect, type DelayedEffect } from '@/engine';

const refreshInterval = ref<number | null>(null);

// 模块信息
const moduleNames: Record<string, { name: string; icon: string; color: string }> = {
  gacha: { name: '卡池', icon: 'gem-o', color: '#ff6b6b' },
  event: { name: '活动', icon: 'calendar-o', color: '#4ecdc4' },
  welfare: { name: '福利', icon: 'gift-o', color: '#ffd93d' },
  playerData: { name: '玩家数据', icon: 'user-o', color: '#6bcf7f' },
  incident: { name: '运营事件', icon: 'warning-o', color: '#ff9ff3' },
  social: { name: '社交广场', icon: 'chat-o', color: '#54a0ff' },
  market: { name: '市场情报', icon: 'chart-bar-o', color: '#a55eea' }
};

// 模块统计
const moduleStats = computed(() => {
  const stats = linkageEngine.getModuleStats();
  return Object.entries(stats).map(([key, value]) => ({
    ...moduleNames[key],
    name: moduleNames[key]?.name || key,
    icon: moduleNames[key]?.icon || 'circle',
    color: moduleNames[key]?.color || '#999',
    immediate: value.immediate,
    delayed: value.delayed
  }));
});

// 即时效果
const immediateEffects = ref<LinkageEffect[]>([]);

// 延迟效果
const delayedEffects = computed(() => linkageEngine.getQueuedEffects());

// 节点位置
const nodes = [
  { id: 'gacha', name: '卡池', x: 60, y: 60, color: '#ff6b6b' },
  { id: 'event', name: '活动', x: 200, y: 60, color: '#4ecdc4' },
  { id: 'welfare', name: '福利', x: 340, y: 60, color: '#ffd93d' },
  { id: 'playerData', name: '玩家', x: 60, y: 180, color: '#6bcf7f' },
  { id: 'incident', name: '事件', x: 200, y: 180, color: '#ff9ff3' },
  { id: 'social', name: '社交', x: 340, y: 180, color: '#54a0ff' },
  { id: 'market', name: '市场', x: 200, y: 260, color: '#a55eea' }
];

// 边
const edges = computed(() => [
  { id: '1', x1: 80, y1: 70, x2: 180, y2: 70, color: '#ccc', dashed: false },
  { id: '2', x1: 220, y1: 70, x2: 320, y2: 70, color: '#ccc', dashed: false },
  { id: '3', x1: 80, y1: 80, x2: 80, y2: 160, color: '#52c41a', dashed: false },
  { id: '4', x1: 220, y1: 80, x2: 200, y2: 160, color: '#faad14', dashed: true },
  { id: '5', x1: 320, y1: 80, x2: 320, y2: 160, color: '#52c41a', dashed: false },
  { id: '6', x1: 100, y1: 170, x2: 180, y2: 170, color: '#faad14', dashed: true },
  { id: '7', x1: 220, y1: 190, x2: 180, y2: 190, color: '#ff4d4f', dashed: true },
  { id: '8', x1: 320, y1: 170, x2: 220, y2: 170, color: '#faad14', dashed: true },
  { id: '9', x1: 100, y1: 180, x2: 180, y2: 240, color: '#faad14', dashed: true }
]);

function getModuleName(module: string): string {
  return moduleNames[module]?.name || module;
}

function getMetricName(metric: string): string {
  const names: Record<string, string> = {
    satisfaction: '满意度',
    retention: '留存率',
    dau: '日活',
    dailyRevenue: '收入',
    marketShare: '市场份额',
    reputation: '口碑',
    incident_trigger: '事件触发'
  };
  return names[metric] || metric;
}

function getDurationProgress(effect: LinkageEffect): number {
  // 简化：假设duration是总天数
  return Math.max(0, Math.min(100, effect.duration || 100));
}

function getCountdownProgress(effect: DelayedEffect): number {
  if (effect.delayDays === 0) return 100;
  return Math.max(0, Math.min(100, (effect.daysPassed / effect.delayDays) * 100));
}

// 模拟触发一些联动效果
function simulateEffects() {
  // 模拟卡池调整效果
  linkageEngine.trigger('gacha', 'rate_change', -1, {
    projectId: 'demo',
    currentMetrics: { dau: 10000, satisfaction: 70, rating: 8 },
    daysPassed: 0,
    newRate: 1.5,
    oldRate: 2.0
  });

  // 获取即时效果
  // 这里简化处理，实际应该从引擎获取
  immediateEffects.value = [
    {
      sourceModule: 'gacha',
      targetModule: 'playerData',
      metric: 'satisfaction',
      change: -7.5,
      duration: 7,
      delay: 'immediate',
      decayRate: 0.9
    },
    {
      sourceModule: 'welfare',
      targetModule: 'playerData',
      metric: 'satisfaction',
      change: 10,
      duration: 5,
      delay: 'immediate',
      decayRate: 0.85
    }
  ];
}

onMounted(() => {
  simulateEffects();
  // 定期刷新
  refreshInterval.value = window.setInterval(() => {
    // 刷新延迟效果进度
  }, 5000);
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<style scoped>
.linkage-tracker {
  min-height: 100vh;
  background: #f5f5f5;
}

.tracker-content {
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 模块状态 */
.module-status {
  margin-bottom: 20px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.module-card {
  background: white;
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
}

.module-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.module-name {
  font-size: 12px;
  color: #333;
  margin-bottom: 4px;
}

.module-stats {
  font-size: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.module-stats .immediate {
  color: #52c41a;
}

.module-stats .delayed {
  color: #faad14;
}

/* 效果卡片 */
.effects-section {
  margin-bottom: 20px;
}

.effects-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.effect-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
}

.effect-card.immediate {
  border-left: 3px solid #52c41a;
}

.effect-card.delayed {
  border-left: 3px solid #faad14;
}

.effect-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.effect-source {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.effect-arrow {
  color: #999;
  font-size: 12px;
}

.effect-target {
  font-size: 13px;
  color: #666;
}

.effect-metric {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.effect-metric .positive {
  color: #52c41a;
  font-weight: 600;
  margin-left: 8px;
}

.effect-metric .negative {
  color: #ff4d4f;
  font-weight: 600;
  margin-left: 8px;
}

.effect-duration,
.effect-countdown {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 因果关系图 */
.linkage-diagram {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.diagram-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.linkage-svg {
  width: 100%;
  height: auto;
}
</style>
