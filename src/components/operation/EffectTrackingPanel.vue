<template>
  <div class="effect-tracking-panel">
    <h3>运营效果追踪</h3>

    <!-- 进行中的操作 -->
    <div class="active-operations" v-if="activeEffects.length > 0">
      <h4>进行中</h4>
      <div v-for="item in activeEffects" :key="item.operationId" class="effect-card">
        <div class="effect-header">
          <span class="type">{{ getTypeName(item.effect.type) }}</span>
          <span class="day">第 {{ item.effect.startDay }} 天开始</span>
        </div>
        <div class="effect-prediction">
          <div class="prediction-item">
            <span class="label">预计收入:</span>
            <span class="value" :class="getChangeClass(item.effect.prediction.predicted.revenueChange)">
              {{ formatNumber(item.effect.prediction.predicted.revenueChange) }}
            </span>
          </div>
          <div class="prediction-item">
            <span class="label">预计满意度:</span>
            <span class="value" :class="getChangeClass(item.effect.prediction.predicted.satisfactionChange)">
              {{ formatChange(item.effect.prediction.predicted.satisfactionChange, true) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 已完成的效果对比 -->
    <div class="completed-operations" v-if="completedEffects.length > 0">
      <h4>已完成</h4>
      <div
        v-for="comparison in completedEffects"
        :key="comparison.operationId"
        class="comparison-card"
        :class="{ accurate: comparison.accuracy.overall > 0.7 }"
      >
        <div class="comparison-header">
          <span class="type">{{ getTypeName(comparison.operationType) }}</span>
          <span class="accuracy" :class="getAccuracyClass(comparison.accuracy.overall)">
            准确度 {{ Math.round(comparison.accuracy.overall * 100) }}%
          </span>
        </div>

        <!-- 预测 vs 实际对比 -->
        <div class="comparison-metrics">
          <div class="metric-row">
            <span class="label">收入</span>
            <span class="predicted">预: {{ formatNumber(comparison.predicted.revenueChange) }}</span>
            <span class="actual">实: {{ formatNumber(comparison.actual.revenueChange) }}</span>
          </div>
          <div class="metric-row">
            <span class="label">满意度</span>
            <span class="predicted">预: {{ formatChange(comparison.predicted.satisfactionChange) }}</span>
            <span class="actual">实: {{ formatChange(comparison.actual.satisfactionChange) }}</span>
          </div>
          <div class="metric-row">
            <span class="label">留存</span>
            <span class="predicted">预: {{ formatChange(comparison.predicted.retentionChange) }}</span>
            <span class="actual">实: {{ formatChange(comparison.actual.retentionChange) }}</span>
          </div>
        </div>

        <div class="analysis">{{ comparison.analysis }}</div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="activeEffects.length === 0 && completedEffects.length === 0" class="empty-state">
      <van-empty description="暂无运营效果追踪数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useOperationStore } from '@/stores/operationStore';
import type { PredictionVsActual, ActiveOperationEffect } from '@/types/operationPrediction';

const operationStore = useOperationStore();

const activeEffects = computed(() => operationStore.getActiveEffects());
const completedEffects = computed(() => operationStore.getCompletedEffects());

function getTypeName(type: string): string {
  const names: Record<string, string> = {
    gacha: '卡池',
    event: '活动',
    welfare: '福利'
  };
  return names[type] || type;
}

function getChangeClass(value: number): string {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

function formatNumber(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString()}`;
}

function formatChange(value: number, isPercentage: boolean = false): string {
  const sign = value > 0 ? '+' : '';
  const formatted = isPercentage
    ? `${(value * 100).toFixed(1)}%`
    : value.toFixed(2);
  return `${sign}${formatted}`;
}

function getAccuracyClass(accuracy: number): string {
  if (accuracy >= 0.8) return 'high';
  if (accuracy >= 0.6) return 'medium';
  return 'low';
}
</script>

<style scoped>
.effect-tracking-panel {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.effect-tracking-panel h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.effect-tracking-panel h4 {
  margin: 16px 0 12px 0;
  font-size: 14px;
  color: #666;
}

.active-operations,
.completed-operations {
  margin-bottom: 20px;
}

.effect-card,
.comparison-card {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.effect-header,
.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.type {
  font-weight: 600;
  color: #333;
}

.day {
  font-size: 12px;
  color: #999;
}

.accuracy {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.accuracy.high {
  background: #e8f5e9;
  color: #4caf50;
}

.accuracy.medium {
  background: #fff3e0;
  color: #ff9800;
}

.accuracy.low {
  background: #ffebee;
  color: #f44336;
}

.effect-prediction {
  display: grid;
  gap: 8px;
}

.prediction-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.prediction-item .label {
  color: #666;
}

.prediction-item .value {
  font-weight: 500;
}

.prediction-item .value.positive {
  color: #4caf50;
}

.prediction-item .value.negative {
  color: #f44336;
}

.comparison-metrics {
  display: grid;
  gap: 8px;
  margin: 12px 0;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.metric-row .label {
  color: #666;
  flex: 1;
}

.metric-row .predicted,
.metric-row .actual {
  flex: 1;
  text-align: right;
}

.metric-row .predicted {
  color: #999;
}

.metric-row .actual {
  font-weight: 500;
  color: #333;
}

.analysis {
  font-size: 12px;
  color: #666;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
  margin-top: 8px;
}

.comparison-card.accurate {
  border-left: 3px solid #4caf50;
}

.empty-state {
  padding: 40px 0;
}
</style>
