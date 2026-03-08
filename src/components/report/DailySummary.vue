<template>
  <van-popup
    v-model:show="visible"
    position="center"
    :style="{ width: '85%', maxWidth: '360px', borderRadius: '16px' }"
    closeable
  >
    <div class="daily-summary">
      <div class="summary-header">
        <span class="day-badge">第 {{ report?.day || 1 }} 天</span>
        <h3 class="summary-title">📊 今日总结</h3>
      </div>

      <div class="summary-content">
        <div class="summary-section">
          <div class="section-title">💰 收支情况</div>
          <div class="finance-grid">
            <div class="finance-item income">
              <span class="label">今日收入</span>
              <span class="value">+{{ formatNumber(report?.revenue || 0) }}</span>
            </div>
            <div class="finance-item expense">
              <span class="label">今日支出</span>
              <span class="value">-{{ formatNumber(report?.expense || 0) }}</span>
            </div>
            <div class="finance-item net" :class="{ positive: netIncome >= 0 }">
              <span class="label">净收入</span>
              <span class="value">{{ netIncome >= 0 ? '+' : '' }}{{ formatNumber(netIncome) }}</span>
            </div>
          </div>
        </div>

        <div class="summary-section">
          <div class="section-title">👥 玩家变化</div>
          <div class="player-stats">
            <div class="stat-item">
              <van-icon name="user-o" />
              <span class="stat-label">新增</span>
              <span class="stat-value positive">+{{ report?.newPlayers || 0 }}</span>
            </div>
            <div class="stat-item">
              <van-icon name="close" />
              <span class="stat-label">流失</span>
              <span class="stat-value negative">-{{ report?.lostPlayers || 0 }}</span>
            </div>
            <div class="stat-item">
              <van-icon name="chart-trending-o" />
              <span class="stat-label">净增</span>
              <span class="stat-value" :class="{ positive: netPlayers >= 0, negative: netPlayers < 0 }">
                {{ netPlayers >= 0 ? '+' : '' }}{{ netPlayers }}
              </span>
            </div>
          </div>
        </div>

        <div class="summary-section">
          <div class="section-title">✅ 任务完成</div>
          <div class="task-progress">
            <van-progress 
              :percentage="taskPercentage" 
              stroke-width="8"
              color="linear-gradient(to right, #07c160, #00c853)"
            />
            <span class="task-text">{{ report?.completedTasks || 0 }}/{{ totalTasks }}</span>
          </div>
        </div>

        <div v-if="report?.achievements?.length" class="summary-section">
          <div class="section-title">🏆 达成成就</div>
          <div class="achievement-list">
            <van-tag 
              v-for="achievement in report.achievements" 
              :key="achievement"
              type="primary"
              size="medium"
            >
              {{ achievement }}
            </van-tag>
          </div>
        </div>
      </div>

      <div class="summary-footer">
        <van-button type="primary" block @click="handleContinue">
          继续游戏
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface DailyReport {
  day: number;
  revenue: number;
  expense: number;
  newPlayers: number;
  lostPlayers: number;
  completedTasks: number;
  achievements: string[];
}

const props = defineProps<{
  show: boolean;
  report: DailyReport | null;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'continue'): void;
}>();

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

const totalTasks = 5;

const netIncome = computed(() => {
  return (props.report?.revenue || 0) - (props.report?.expense || 0);
});

const netPlayers = computed(() => {
  return (props.report?.newPlayers || 0) - (props.report?.lostPlayers || 0);
});

const taskPercentage = computed(() => {
  return Math.round(((props.report?.completedTasks || 0) / totalTasks) * 100);
});

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString();
}

function handleContinue() {
  emit('continue');
  visible.value = false;
}
</script>

<style scoped lang="scss">
.daily-summary {
  padding: 20px;
}

.summary-header {
  text-align: center;
  margin-bottom: 20px;
}

.day-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(to right, #FF69B4, #FFB6C1);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  margin-bottom: 8px;
}

.summary-title {
  font-size: 20px;
  font-weight: 600;
  color: #323233;
  margin: 0;
}

.summary-content {
  margin-bottom: 20px;
}

.summary-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 12px;
}

.finance-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.finance-item {
  text-align: center;
  padding: 12px 8px;
  background: #f7f8fa;
  border-radius: 8px;
  
  .label {
    display: block;
    font-size: 12px;
    color: #969799;
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 16px;
    font-weight: 600;
  }
  
  &.income .value {
    color: #07c160;
  }
  
  &.expense .value {
    color: #ee0a24;
  }
  
  &.net .value {
    color: #ee0a24;
    
    &.positive {
      color: #07c160;
    }
  }
}

.player-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  
  .van-icon {
    font-size: 24px;
    color: #969799;
  }
  
  .stat-label {
    font-size: 12px;
    color: #969799;
  }
  
  .stat-value {
    font-size: 16px;
    font-weight: 600;
    
    &.positive {
      color: #07c160;
    }
    
    &.negative {
      color: #ee0a24;
    }
  }
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .van-progress {
    flex: 1;
  }
  
  .task-text {
    font-size: 14px;
    color: #969799;
    white-space: nowrap;
  }
}

.achievement-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-footer {
  margin-top: 16px;
}
</style>
