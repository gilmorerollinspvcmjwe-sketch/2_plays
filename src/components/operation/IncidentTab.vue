<template>
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
</template>

<script setup lang="ts">
import { useCommentStore } from '@/stores/commentStore';
import { getHeatColor, getSentimentClass } from '@/utils/operationHelpers';
import IncidentHandler from '@/components/operation/IncidentHandler.vue';

const commentStore = useCommentStore();
</script>

<style scoped lang="scss">
.tab-content {
  padding: 16px;
  min-height: 300px;
}

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
</style>
