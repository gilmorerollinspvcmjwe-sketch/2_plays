<template>
  <div class="tab-content">
    <div v-if="predictionComparisons.length === 0" class="empty-state">
      <van-empty description="暂无效果追踪数据">
        <p class="empty-hint">创建卡池或活动后可查看预测与实际效果对比</p>
      </van-empty>
    </div>
    <div v-else class="prediction-comparison-list">
      <div
        v-for="(comparison, index) in predictionComparisons"
        :key="index"
        class="comparison-card"
      >
        <div class="comparison-header">
          <span class="comparison-metric">{{ getMetricLabel(comparison.metric) }}</span>
          <van-tag :type="comparison.accuracy >= 0.8 ? 'success' : comparison.accuracy >= 0.5 ? 'warning' : 'danger'">
            准确率 {{ (comparison.accuracy * 100).toFixed(0) }}%
          </van-tag>
        </div>
        <div class="comparison-values">
          <div class="value-item predicted">
            <span class="value-label">预测</span>
            <span class="value-num" :class="comparison.predicted >= 0 ? 'positive' : 'negative'">
              {{ comparison.predicted >= 0 ? '+' : '' }}{{ comparison.predicted.toFixed(1) }}
            </span>
          </div>
          <div class="value-divider">→</div>
          <div class="value-item actual">
            <span class="value-label">实际</span>
            <span class="value-num" :class="comparison.actual >= 0 ? 'positive' : 'negative'">
              {{ comparison.actual >= 0 ? '+' : '' }}{{ comparison.actual.toFixed(1) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="predictionComparisons.length > 0" class="tracking-stats">
      <div class="stats-header">
        <span class="stats-title">追踪统计</span>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ predictionComparisons.length }}</div>
          <div class="stat-label">追踪指标</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ averageAccuracy.toFixed(0) }}%</div>
          <div class="stat-label">平均准确率</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useOperationStore } from '@/stores/operationStore';
import { getMetricLabel } from '@/utils/operationHelpers';

const operationStore = useOperationStore();

const predictionComparisons = ref<{
  metric: string;
  predicted: number;
  actual: number;
  accuracy: number;
}[]>([]);

const averageAccuracy = computed(() => {
  if (predictionComparisons.value.length === 0) return 0;
  const sum = predictionComparisons.value.reduce((acc, curr) => acc + curr.accuracy, 0);
  return (sum / predictionComparisons.value.length) * 100;
});

function loadPredictionComparisons() {
  const completedEffects = operationStore.getCompletedEffects() || [];

  const metricMap = new Map<string, { predicted: number; actual: number; count: number }>();

  completedEffects.forEach((effect: any) => {
    if (!effect.comparisons) return;
    effect.comparisons.forEach((comp: any) => {
      const existing = metricMap.get(comp.metric);
      if (existing) {
        existing.predicted += comp.predicted;
        existing.actual += comp.actual;
        existing.count += 1;
      } else {
        metricMap.set(comp.metric, {
          predicted: comp.predicted,
          actual: comp.actual,
          count: 1
        });
      }
    });
  });

  const comparisons: { metric: string; predicted: number; actual: number; accuracy: number }[] = [];
  metricMap.forEach((data, metric) => {
    const avgPredicted = data.predicted / data.count;
    const avgActual = data.actual / data.count;
    const accuracy = avgPredicted !== 0
      ? 1 - Math.abs((avgActual - avgPredicted) / avgPredicted)
      : 1;

    comparisons.push({
      metric,
      predicted: avgPredicted,
      actual: avgActual,
      accuracy: Math.max(0, Math.min(1, accuracy))
    });
  });

  predictionComparisons.value = comparisons;
}

defineExpose({ loadPredictionComparisons });

onMounted(() => {
  loadPredictionComparisons();
});
</script>

<style scoped lang="scss">
.tab-content {
  padding: 16px;
  min-height: 300px;
}

.empty-state {
  .empty-hint {
    font-size: 12px;
    color: #999;
    text-align: center;
  }
}

.prediction-comparison-list {
  .comparison-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .comparison-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .comparison-metric {
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }
    }

    .comparison-values {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      .value-item {
        flex: 1;
        text-align: center;
        padding: 12px;
        background: #f8f8f8;
        border-radius: 8px;

        .value-label {
          display: block;
          font-size: 12px;
          color: #999;
          margin-bottom: 4px;
        }

        .value-num {
          font-size: 18px;
          font-weight: bold;

          &.positive {
            color: #52c41a;
          }

          &.negative {
            color: #ff4d4f;
          }
        }
      }

      .value-divider {
        font-size: 20px;
        color: #ccc;
      }
    }
  }
}

.tracking-stats {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .stats-header {
    margin-bottom: 16px;

    .stats-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .stat-item {
      text-align: center;
      padding: 16px;
      background: #f8f8f8;
      border-radius: 8px;

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 12px;
        color: #999;
      }
    }
  }
}
</style>
