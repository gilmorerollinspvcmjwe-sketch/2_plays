<template>
  <div class="season-holiday-panel" v-if="visible">
    <!-- 季节卡片 -->
    <div class="info-card season-card">
      <div class="card-header">
        <span class="icon">🌸</span>
        <h3>{{ seasonInfo.name }}</h3>
      </div>
      <div class="card-content">
        <p class="description">{{ seasonInfo.description }}</p>
        <div class="buff-tag" v-if="seasonBuffText">
          {{ seasonBuffText }}
        </div>
      </div>
    </div>

    <!-- 节假日卡片 -->
    <div class="info-card holiday-card" v-if="hasActiveHolidays">
      <div class="card-header">
        <span class="icon">🎉</span>
        <h3>进行中活动</h3>
      </div>
      <div class="card-content">
        <div 
          class="holiday-item" 
          v-for="holiday in activeHolidays" 
          :key="holiday.type"
        >
          <div class="holiday-name">{{ holiday.name }}</div>
          <div class="holiday-effect" v-if="holiday.specialEffect">
            {{ holiday.specialEffect }}
          </div>
          <div class="holiday-effect" v-else>
            {{ formatHolidayEffect(holiday) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 总加成信息 -->
    <div class="info-card multiplier-card" v-if="showMultipliers">
      <div class="card-header">
        <span class="icon">✨</span>
        <h3>当前加成</h3>
      </div>
      <div class="card-content">
        <div class="multiplier-row" v-if="multipliers.revenue !== 1">
          <span class="label">收益加成:</span>
          <span class="value positive">+{{ (multipliers.revenue - 1) * 100 }}%</span>
        </div>
        <div class="multiplier-row" v-if="multipliers.activity !== 1">
          <span class="label">活跃度加成:</span>
          <span class="value positive">+{{ (multipliers.activity - 1) * 100 }}%</span>
        </div>
        <div class="multiplier-row" v-if="multipliers.studentActivity !== 1">
          <span class="label">学生活跃加成:</span>
          <span class="value positive">+{{ (multipliers.studentActivity - 1) * 100 }}%</span>
        </div>
        <div class="multiplier-row" v-if="multipliers.paymentRate !== 1">
          <span class="label">付费率加成:</span>
          <span class="value positive">+{{ (multipliers.paymentRate - 1) * 100 }}%</span>
        </div>
      </div>
    </div>

    <!-- 收起/展开按钮 -->
    <button class="toggle-btn" @click="toggleCollapse">
      {{ isCollapsed ? '展开' : '收起' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  seasonEventEngine, 
  SeasonState,
  SeasonBuff,
  HolidayBuff,
} from '../engine/seasonEventEngine';

interface Props {
  visible?: boolean;
  showMultipliers?: boolean;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  showMultipliers: true,
  compact: false,
});

const isCollapsed = ref(false);
const state = ref<SeasonState>(seasonEventEngine.getState());

// 更新定时器
let updateTimer: number | null = null;

const seasonInfo = computed(() => state.value.seasonBuff);
const activeHolidays = computed(() => state.value.activeHolidays);
const multipliers = computed(() => state.value.multipliers);

const hasActiveHolidays = computed(() => activeHolidays.value.length > 0);

const seasonBuffText = computed(() => {
  const buff = seasonInfo.value;
  const effects: string[] = [];
  
  if (buff.revenueMultiplier) {
    effects.push(`收益 +${(buff.revenueMultiplier - 1) * 100}%`);
  }
  if (buff.studentActivityMultiplier) {
    effects.push(`学生活跃 +${(buff.studentActivityMultiplier - 1) * 100}%`);
  }
  if (buff.paymentRateMultiplier) {
    effects.push(`付费率 +${(buff.paymentRateMultiplier - 1) * 100}%`);
  }
  if (buff.activityMultiplier) {
    effects.push(`活跃 +${(buff.activityMultiplier - 1) * 100}%`);
  }
  
  return effects.join('、');
});

function formatHolidayEffect(holiday: HolidayBuff): string {
  const effects: string[] = [];
  
  if (holiday.revenueMultiplier) {
    effects.push(`收益 +${(holiday.revenueMultiplier - 1) * 100}%`);
  }
  if (holiday.activityMultiplier) {
    effects.push(`活跃 +${(holiday.activityMultiplier - 1) * 100}%`);
  }
  if (holiday.studentActivityMultiplier) {
    effects.push(`学生活跃 +${(holiday.studentActivityMultiplier - 1) * 100}%`);
  }
  
  return effects.join('、') || holiday.description;
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

function updateState() {
  state.value = seasonEventEngine.getState();
}

onMounted(() => {
  updateState();
  // 每分钟更新一次
  updateTimer = window.setInterval(updateState, 60000);
});

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer);
  }
});
</script>

<style scoped lang="scss">
.season-holiday-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
}

.info-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    .icon {
      font-size: 20px;
    }

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .card-content {
    padding: 12px 16px;

    .description {
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #666;
      line-height: 1.5;
    }

    .buff-tag {
      display: inline-block;
      padding: 4px 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
  }
}

.season-card .card-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.holiday-card .card-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.multiplier-card .card-header {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.holiday-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  .holiday-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .holiday-effect {
    font-size: 12px;
    color: #667eea;
    font-weight: 500;
  }
}

.multiplier-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;

  .label {
    font-size: 13px;
    color: #666;
  }

  .value.positive {
    font-size: 14px;
    font-weight: 600;
    color: #43e97b;
  }
}

.toggle-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.2s ease;
  align-self: flex-end;

  &:hover {
    background: #f5f5f5;
    border-color: #667eea;
    color: #667eea;
  }
}

// 紧凑模式
.compact {
  .info-card {
    .card-header {
      padding: 8px 12px;
      
      h3 {
        font-size: 14px;
      }
    }

    .card-content {
      padding: 8px 12px;

      .description {
        font-size: 12px;
      }

      .buff-tag {
        font-size: 11px;
      }
    }
  }
}
</style>
