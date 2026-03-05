<template>
  <div class="operation-impact">
    <BackButton title="运营影响预测" />

    <div class="impact-content">
      <!-- 项目选择 -->
      <div class="project-selector">
        <div class="selector-label">选择项目</div>
        <van-dropdown-menu>
          <van-dropdown-item v-model="selectedProjectId" :options="projectOptions" />
        </van-dropdown-menu>
      </div>

      <!-- 操作类型选择 -->
      <div class="operation-type">
        <div class="type-label">操作类型</div>
        <div class="type-options">
          <button
            v-for="type in operationTypes"
            :key="type.value"
            class="type-btn"
            :class="{ active: selectedOperationType === type.value }"
            @click="selectedOperationType = type.value"
          >
            <van-icon :name="type.icon" />
            {{ type.label }}
          </button>
        </div>
      </div>

      <!-- 操作配置 -->
      <div class="operation-config" v-if="selectedOperationType">
        <div class="config-title">操作配置</div>

        <!-- 卡池配置 -->
        <template v-if="selectedOperationType === 'gacha'">
          <div class="config-item">
            <span class="config-label">SSR爆率调整</span>
            <div class="config-input">
              <van-stepper v-model="gachaConfig.rate" :min="0.5" :max="5" :step="0.1" decimal-length="1" />
              <span class="config-unit">%</span>
            </div>
          </div>
          <div class="config-item">
            <span class="config-label">UP角色</span>
            <van-switch v-model="gachaConfig.hasUp" />
          </div>
        </template>

        <!-- 活动配置 -->
        <template v-if="selectedOperationType === 'event'">
          <div class="config-item">
            <span class="config-label">活动难度</span>
            <van-slider v-model="eventConfig.difficulty" :min="1" :max="100" />
            <span class="config-value">{{ eventConfig.difficulty }}</span>
          </div>
          <div class="config-item">
            <span class="config-label">奖励价值</span>
            <van-slider v-model="eventConfig.rewardValue" :min="1" :max="100" />
            <span class="config-value">{{ eventConfig.rewardValue }}</span>
          </div>
        </template>

        <!-- 福利配置 -->
        <template v-if="selectedOperationType === 'welfare'">
          <div class="config-item">
            <span class="config-label">福利价值</span>
            <div class="config-input">
              <van-stepper v-model="welfareConfig.value" :min="100" :max="10000" :step="100" />
              <span class="config-unit">钻石</span>
            </div>
          </div>
        </template>
      </div>

      <!-- 预测按钮 -->
      <van-button
        type="primary"
        block
        :disabled="!canPredict"
        @click="predictImpact"
      >
        预测影响
      </van-button>

      <!-- 预测结果 -->
      <div class="prediction-result" v-if="prediction">
        <div class="result-header">
          <span class="result-title">预测结果</span>
          <van-tag :type="predictionRiskType">{{ predictionRiskText }}</van-tag>
        </div>

        <!-- 时间维度影响 -->
        <div class="time-impact">
          <div class="time-section">
            <div class="time-title">
              <van-icon name="clock-o" />
              即时影响
            </div>
            <div class="impact-list">
              <div
                v-for="(impact, index) in prediction.shortTerm"
                :key="index"
                class="impact-item"
              >
                <span class="impact-metric">{{ getMetricName(impact.metric) }}</span>
                <span class="impact-value" :class="{ positive: impact.change > 0, negative: impact.change < 0 }">
                  {{ impact.change > 0 ? '+' : '' }}{{ impact.change.toFixed(1) }}
                </span>
              </div>
            </div>
          </div>

          <div class="time-section">
            <div class="time-title">
              <van-icon name="calendar-o" />
              短期影响 (7天)
            </div>
            <div class="impact-list">
              <div
                v-for="(impact, index) in prediction.mediumTerm"
                :key="index"
                class="impact-item"
              >
                <span class="impact-metric">{{ getMetricName(impact.metric) }}</span>
                <span class="impact-value" :class="{ positive: impact.change > 0, negative: impact.change < 0 }">
                  {{ impact.change > 0 ? '+' : '' }}{{ impact.change.toFixed(1) }}
                </span>
              </div>
            </div>
          </div>

          <div class="time-section">
            <div class="time-title">
              <van-icon name="chart-trending-o" />
              长期影响 (30天)
            </div>
            <div class="impact-list">
              <div
                v-for="(impact, index) in prediction.longTerm"
                :key="index"
                class="impact-item"
              >
                <span class="impact-metric">{{ getMetricName(impact.metric) }}</span>
                <span class="impact-value" :class="{ positive: impact.change > 0, negative: impact.change < 0 }">
                  {{ impact.change > 0 ? '+' : '' }}{{ impact.change.toFixed(1) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 风险提示 -->
        <div class="risk-warning" v-if="prediction.risks.length > 0">
          <div class="warning-title">
            <van-icon name="warning-o" color="#ff4d4f" />
            风险提示
          </div>
          <div class="warning-list">
            <div
              v-for="(risk, index) in prediction.risks"
              :key="index"
              class="warning-item"
            >
              {{ risk }}
            </div>
          </div>
        </div>

        <!-- 执行按钮 -->
        <div class="action-buttons">
          <van-button type="primary" block @click="executeOperation">
            确认执行
          </van-button>
          <van-button type="default" block @click="cancelOperation">
            取消
          </van-button>
        </div>
      </div>

      <!-- 历史预测 -->
      <div class="history-section" v-if="predictionHistory.length > 0">
        <div class="history-title">历史预测</div>
        <div class="history-list">
          <div
            v-for="(item, index) in predictionHistory.slice(0, 5)"
            :key="index"
            class="history-item"
          >
            <div class="history-info">
              <span class="history-type">{{ getOperationTypeName(item.type) }}</span>
              <span class="history-time">{{ formatTime(item.time) }}</span>
            </div>
            <van-tag :type="item.executed ? 'success' : 'default'">
              {{ item.executed ? '已执行' : '未执行' }}
            </van-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import BackButton from '@/components/common/BackButton.vue';
import { calculationEngine } from '@/engine';
import { useProjectStore } from '@/stores/projectStore';
import type { OperationImpact } from '@/engine/calculationEngine';

const router = useRouter();
const projectStore = useProjectStore();

// 项目选项
const projectOptions = computed(() => {
  return projectStore.projects.map(p => ({
    text: p.name,
    value: p.id
  }));
});

const selectedProjectId = ref(projectOptions.value[0]?.value || '');

// 操作类型
const operationTypes = [
  { label: '卡池调整', value: 'gacha', icon: 'gem-o' },
  { label: '活动配置', value: 'event', icon: 'calendar-o' },
  { label: '福利发放', value: 'welfare', icon: 'gift-o' }
];

const selectedOperationType = ref('');

// 配置数据
const gachaConfig = ref({
  rate: 2.0,
  hasUp: true
});

const eventConfig = ref({
  difficulty: 50,
  rewardValue: 50
});

const welfareConfig = ref({
  value: 1000
});

// 预测结果
const prediction = ref<OperationImpact | null>(null);

// 预测历史
const predictionHistory = ref<Array<{
  type: string;
  time: number;
  executed: boolean;
}>>([]);

// 是否可以预测
const canPredict = computed(() => {
  return selectedProjectId.value && selectedOperationType.value;
});

// 预测风险等级
const predictionRiskType = computed(() => {
  if (!prediction.value) return 'default';
  const hasNegative = [...prediction.value.shortTerm, ...prediction.value.mediumTerm]
    .some(i => i.change < -10);
  return hasNegative ? 'danger' : 'success';
});

const predictionRiskText = computed(() => {
  if (!prediction.value) return '未知';
  const hasNegative = [...prediction.value.shortTerm, ...prediction.value.mediumTerm]
    .some(i => i.change < -10);
  return hasNegative ? '高风险' : '低风险';
});

// 预测影响
function predictImpact() {
  const project = projectStore.projects.find(p => p.id === selectedProjectId.value);
  if (!project) return;

  let operation: { module: 'gacha' | 'event' | 'welfare'; action: string; value: number };

  switch (selectedOperationType.value) {
    case 'gacha':
      operation = {
        module: 'gacha',
        action: 'rate_change',
        value: gachaConfig.value.rate - 2.0
      };
      break;
    case 'event':
      operation = {
        module: 'event',
        action: 'difficulty_set',
        value: eventConfig.value.difficulty
      };
      break;
    case 'welfare':
      operation = {
        module: 'welfare',
        action: 'welfare_distributed',
        value: welfareConfig.value.value
      };
      break;
    default:
      return;
  }

  prediction.value = calculationEngine.predictOperationImpact(project, operation);
}

// 获取指标名称
function getMetricName(metric: string): string {
  const names: Record<string, string> = {
    satisfaction: '玩家满意度',
    retention: '留存率',
    dau: '日活跃用户',
    dailyRevenue: '日收入',
    marketShare: '市场份额',
    reputation: '品牌声誉',
    brandReputation: '品牌声誉',
    playerLoyalty: '玩家忠诚度'
  };
  return names[metric] || metric;
}

// 获取操作类型名称
function getOperationTypeName(type: string): string {
  const names: Record<string, string> = {
    gacha: '卡池调整',
    event: '活动配置',
    welfare: '福利发放'
  };
  return names[type] || type;
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 执行操作
function executeOperation() {
  predictionHistory.value.unshift({
    type: selectedOperationType.value,
    time: Date.now(),
    executed: true
  });

  showToast('操作已执行');
  prediction.value = null;
}

// 取消操作
function cancelOperation() {
  predictionHistory.value.unshift({
    type: selectedOperationType.value,
    time: Date.now(),
    executed: false
  });

  prediction.value = null;
}
</script>

<style scoped>
.operation-impact {
  min-height: 100vh;
  background: #f5f5f5;
}

.impact-content {
  padding: 16px;
}

/* 选择器样式 */
.project-selector,
.operation-type {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.selector-label,
.type-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.type-options {
  display: flex;
  gap: 8px;
}

.type-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.type-btn .van-icon {
  font-size: 24px;
}

.type-btn.active {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

/* 配置样式 */
.operation-config {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.config-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.config-item:last-child {
  margin-bottom: 0;
}

.config-label {
  font-size: 14px;
  color: #666;
}

.config-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-unit {
  font-size: 13px;
  color: #999;
}

.config-value {
  font-size: 14px;
  color: #1890ff;
  font-weight: 600;
  margin-left: 8px;
}

/* 预测结果 */
.prediction-result {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 时间维度影响 */
.time-impact {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-section {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.time-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.time-title .van-icon {
  color: #1890ff;
}

.impact-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.impact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.impact-metric {
  font-size: 13px;
  color: #666;
}

.impact-value {
  font-size: 14px;
  font-weight: 600;
}

.impact-value.positive {
  color: #52c41a;
}

.impact-value.negative {
  color: #ff4d4f;
}

/* 风险提示 */
.risk-warning {
  margin-top: 16px;
  padding: 12px;
  background: #fff1f0;
  border-radius: 8px;
  border-left: 3px solid #ff4d4f;
}

.warning-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #ff4d4f;
  margin-bottom: 8px;
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.warning-item {
  font-size: 13px;
  color: #666;
  padding-left: 22px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

/* 历史记录 */
.history-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}

.history-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-type {
  font-size: 13px;
  color: #333;
}

.history-time {
  font-size: 11px;
  color: #999;
}
</style>
