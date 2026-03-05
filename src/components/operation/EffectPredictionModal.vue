<template>
  <van-popup v-model:show="show" round position="center" class="prediction-modal">
    <div class="prediction-content">
      <h3>效果预测</h3>

      <!-- 预测指标 -->
      <div class="prediction-metrics">
        <div class="metric" :class="getChangeClass(prediction.predicted.revenueChange)">
          <span class="label">预计收入</span>
          <span class="value">
            {{ formatChange(prediction.predicted.revenueChange) }}
            ({{ prediction.predicted.revenueChangePercent }}%)
          </span>
        </div>

        <div class="metric" :class="getChangeClass(prediction.predicted.satisfactionChange)">
          <span class="label">预计满意度</span>
          <span class="value">{{ formatChange(prediction.predicted.satisfactionChange, true) }}</span>
        </div>

        <div class="metric" :class="getChangeClass(prediction.predicted.retentionChange)">
          <span class="label">预计留存</span>
          <span class="value">{{ formatChange(prediction.predicted.retentionChange, true) }}</span>
        </div>

        <div class="metric" :class="getChangeClass(prediction.predicted.payRateChange)">
          <span class="label">预计付费率</span>
          <span class="value">{{ formatChange(prediction.predicted.payRateChange, true) }}</span>
        </div>

        <div class="metric" :class="getChangeClass(prediction.predicted.activePlayersChange)">
          <span class="label">预计活跃玩家</span>
          <span class="value">{{ formatChange(prediction.predicted.activePlayersChange) }}</span>
        </div>
      </div>

      <!-- 预测依据 -->
      <div class="prediction-basis">
        <h4>预测依据</h4>
        <ul>
          <li v-if="prediction.basis.characterPopularity !== undefined">
            UP角色人气: {{ prediction.basis.characterPopularity }}
          </li>
          <li v-if="prediction.basis.rateFairness !== undefined">
            爆率合理性: {{ prediction.basis.rateFairness > 0.6 ? '合理' : '偏低' }}
          </li>
          <li v-if="prediction.basis.activityType">
            活动类型: {{ getActivityTypeName(prediction.basis.activityType) }}
          </li>
          <li v-if="prediction.basis.rewardValue">
            奖励价值: ¥{{ prediction.basis.rewardValue.toLocaleString() }}
          </li>
          <li v-if="prediction.basis.welfareType">
            福利类型: {{ prediction.basis.welfareType }}
          </li>
        </ul>
      </div>

      <!-- 风险提示 -->
      <div v-if="prediction.risks.length > 0" class="prediction-risks">
        <h4>风险提示</h4>
        <ul>
          <li v-for="risk in prediction.risks" :key="risk" class="risk-item">
            ⚠️ {{ risk }}
          </li>
        </ul>
      </div>

      <!-- 置信度 -->
      <div class="prediction-confidence">
        <span>预测置信度: {{ Math.round(prediction.confidence * 100) }}%</span>
        <div class="confidence-bar">
          <div
            class="confidence-fill"
            :style="{ width: prediction.confidence * 100 + '%' }"
            :class="getConfidenceClass(prediction.confidence)"
          ></div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button type="default" @click="onCancel">取消</van-button>
        <van-button type="primary" @click="onConfirm">确认执行</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { OperationPrediction } from '@/types/operationPrediction';

interface Props {
  show: boolean;
  prediction: OperationPrediction;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const show = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

function getChangeClass(value: number): string {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

function formatChange(value: number, isPercentage: boolean = false): string {
  const sign = value > 0 ? '+' : '';
  const formatted = isPercentage
    ? `${(value * 100).toFixed(1)}%`
    : value.toLocaleString();
  return `${sign}${formatted}`;
}

function getActivityTypeName(type: string): string {
  const names: Record<string, string> = {
    login: '登录活动',
    gacha: '抽卡活动',
    story: '剧情活动',
    limited: '限定活动',
    welfare: '福利活动'
  };
  return names[type] || type;
}

function getConfidenceClass(confidence: number): string {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}

function onConfirm() {
  emit('confirm');
  show.value = false;
}

function onCancel() {
  emit('cancel');
  show.value = false;
}
</script>

<style scoped>
.prediction-modal {
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.prediction-content {
  padding: 20px;
}

.prediction-content h3 {
  margin: 0 0 16px 0;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
}

.prediction-metrics {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.metric.positive {
  background: #e8f5e9;
}

.metric.positive .value {
  color: #4caf50;
}

.metric.negative {
  background: #ffebee;
}

.metric.negative .value {
  color: #f44336;
}

.metric.neutral .value {
  color: #666;
}

.metric .label {
  font-size: 14px;
  color: #666;
}

.metric .value {
  font-size: 16px;
  font-weight: 600;
}

.prediction-basis,
.prediction-risks {
  margin-bottom: 20px;
}

.prediction-basis h4,
.prediction-risks h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
}

.prediction-basis ul,
.prediction-risks ul {
  margin: 0;
  padding-left: 20px;
}

.prediction-basis li,
.prediction-risks li {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.risk-item {
  color: #f44336 !important;
}

.prediction-confidence {
  margin-bottom: 20px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.prediction-confidence span {
  font-size: 14px;
  color: #666;
}

.confidence-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.confidence-fill.high {
  background: #4caf50;
}

.confidence-fill.medium {
  background: #ff9800;
}

.confidence-fill.low {
  background: #f44336;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons .van-button {
  flex: 1;
}
</style>
