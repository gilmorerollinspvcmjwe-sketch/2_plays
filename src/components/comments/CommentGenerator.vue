<template>
  <div class="comment-generator">
    <h3 class="section-title">
      <van-icon name="chart-trending-o" />
      评论生成状态
    </h3>

    <!-- 模拟数据状态展示 -->
    <div class="simulation-status" v-if="simulationStats">
      <div class="status-header">
        <span class="status-label">当前模拟状态</span>
        <van-tag :type="simulationStatus.type" size="small">
          {{ simulationStatus.text }}
        </van-tag>
      </div>

      <div class="status-grid">
        <div class="status-item">
          <div class="status-icon">📊</div>
          <div class="status-info">
            <span class="status-value">{{ simulationStats.projectQuality }}</span>
            <span class="status-name">项目质量</span>
          </div>
        </div>
        <div class="status-item">
          <div class="status-icon">🔥</div>
          <div class="status-info">
            <span class="status-value">{{ simulationStats.characterPopularity }}</span>
            <span class="status-name">角色人气</span>
          </div>
        </div>
        <div class="status-item">
          <div class="status-icon">📖</div>
          <div class="status-info">
            <span class="status-value">{{ simulationStats.plotHeat }}</span>
            <span class="status-name">剧情热度</span>
          </div>
        </div>
        <div class="status-item">
          <div class="status-icon">🎮</div>
          <div class="status-info">
            <span class="status-value">{{ simulationStats.daySinceLaunch }}</span>
            <span class="status-name">上线天数</span>
          </div>
        </div>
      </div>
    </div>

    <div class="simulation-status empty" v-else>
      <div class="empty-content">
        <van-icon name="info-o" class="empty-icon" />
        <span>暂无模拟数据</span>
        <p>请先上线项目以生成评论</p>
      </div>
    </div>

    <!-- 情感分布 -->
    <div class="sentiment-distribution" v-if="sentimentStats">
      <div class="distribution-title">情感分布预测</div>
      <div class="distribution-bar">
        <div
          class="bar-segment positive"
          :style="{ width: sentimentStats.positive + '%' }"
        >
          <span v-if="sentimentStats.positive > 15">{{ sentimentStats.positive }}%</span>
        </div>
        <div
          class="bar-segment neutral"
          :style="{ width: sentimentStats.neutral + '%' }"
        >
          <span v-if="sentimentStats.neutral > 15">{{ sentimentStats.neutral }}%</span>
        </div>
        <div
          class="bar-segment negative"
          :style="{ width: sentimentStats.negative + '%' }"
        >
          <span v-if="sentimentStats.negative > 15">{{ sentimentStats.negative }}%</span>
        </div>
      </div>
      <div class="distribution-legend">
        <div class="legend-item">
          <div class="legend-color positive"></div>
          <span>正面 {{ sentimentStats.positive }}%</span>
        </div>
        <div class="legend-item">
          <div class="legend-color neutral"></div>
          <span>中立 {{ sentimentStats.neutral }}%</span>
        </div>
        <div class="legend-item">
          <div class="legend-color negative"></div>
          <span>负面 {{ sentimentStats.negative }}%</span>
        </div>
      </div>
    </div>

    <!-- 自动生成提示 -->
    <div class="auto-generate-hint">
      <van-icon name="clock-o" />
      <div class="hint-content">
        <p class="hint-title">评论将在每日模拟时自动生成</p>
        <p class="hint-desc">基于项目质量、角色人气、剧情热度等数据自动计算</p>
      </div>
    </div>

    <!-- 上次生成时间 -->
    <div class="last-generated" v-if="commentStore.lastGeneratedAt">
      <van-icon name="clock" />
      <span>上次生成: {{ formatLastGenerated(commentStore.lastGeneratedAt) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCommentStore } from '@/stores/commentStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { useProjectStore } from '@/stores/projectStore';

const commentStore = useCommentStore();
const simulationStore = useSimulationStore();
const projectStore = useProjectStore();

// 模拟数据状态
const simulationStats = computed(() => {
  const stats = simulationStore.platformStatistics;
  const project = projectStore.currentProject;

  if (!stats) return null;

  // 计算平均值
  const projectQuality = project ? Math.round(project.metrics?.rating || 70) : 0;
  const characterPopularity = Math.round(simulationStore.commentMetrics?.heat || 50);
  const plotHeat = Math.round(simulationStore.commentMetrics?.sentiment || 50);

  return {
    projectQuality,
    characterPopularity,
    plotHeat,
    daySinceLaunch: simulationStore.currentDay || 1,
  };
});

// 模拟状态标签
const simulationStatus = computed(() => {
  const stats = simulationStats.value;
  if (!stats) return { type: 'default' as const, text: '未开始' };

  const avgScore = (stats.projectQuality + stats.characterPopularity + stats.plotHeat) / 3;

  if (avgScore >= 80) return { type: 'success' as const, text: '优秀' };
  if (avgScore >= 60) return { type: 'primary' as const, text: '良好' };
  if (avgScore >= 40) return { type: 'warning' as const, text: '一般' };
  return { type: 'danger' as const, text: '需改进' };
});

// 情感分布统计
const sentimentStats = computed(() => {
  return commentStore.getSentimentDistributionStats();
});

// 格式化上次生成时间
function formatLastGenerated(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  } else {
    return `${Math.floor(diff / 86400000)}天前`;
  }
}
</script>

<style scoped lang="scss">
.comment-generator {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.simulation-status {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  &.empty {
    padding: 32px 16px;
  }

  .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #999;

    .empty-icon {
      font-size: 32px;
      color: #ccc;
    }

    span {
      font-size: 14px;
    }

    p {
      font-size: 12px;
      margin: 0;
    }
  }
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .status-label {
    font-size: 14px;
    color: #666;
  }
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 12px;
  border-radius: 8px;

  .status-icon {
    font-size: 24px;
  }

  .status-info {
    display: flex;
    flex-direction: column;

    .status-value {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    .status-name {
      font-size: 12px;
      color: #999;
    }
  }
}

.sentiment-distribution {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  .distribution-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 12px;
  }

  .distribution-bar {
    display: flex;
    height: 24px;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 12px;

    .bar-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: white;
      font-weight: bold;
      transition: width 0.3s ease;

      &.positive {
        background: linear-gradient(to right, #52c41a, #73d13d);
      }

      &.neutral {
        background: linear-gradient(to right, #faad14, #ffc53d);
      }

      &.negative {
        background: linear-gradient(to right, #ff4d4f, #ff7875);
      }
    }
  }

  .distribution-legend {
    display: flex;
    justify-content: space-around;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #666;

      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;

        &.positive {
          background: #52c41a;
        }

        &.neutral {
          background: #faad14;
        }

        &.negative {
          background: #ff4d4f;
        }
      }
    }
  }
}

.auto-generate-hint {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%);
  border-radius: 8px;
  border-left: 3px solid #1890ff;

  .van-icon {
    font-size: 20px;
    color: #1890ff;
    margin-top: 2px;
  }

  .hint-content {
    flex: 1;

    .hint-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin: 0 0 4px 0;
    }

    .hint-desc {
      font-size: 12px;
      color: #666;
      margin: 0;
    }
  }
}

.last-generated {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e8e8e8;
  font-size: 12px;
  color: #999;

  .van-icon {
    font-size: 14px;
  }
}
</style>
