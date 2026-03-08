<template>
  <div class="event-notification-container">
    <!-- 事件通知弹窗 -->
    <van-dialog
      v-model:show="showEventDialog"
      :title="currentEvent?.title"
      :show-confirm-button="false"
      :show-cancel-button="false"
      :close-on-click-overlay="false"
      class="event-dialog"
    >
      <div class="event-content">
        <!-- 事件类型图标 -->
        <div class="event-icon" :class="getEventIconClass(currentEvent?.category)">
          <van-icon :name="getEventIconName(currentEvent?.category)" size="40" />
        </div>

        <!-- 事件描述 -->
        <div class="event-description">
          {{ currentEvent?.description }}
        </div>

        <!-- 事件影响列表 -->
        <div class="event-impacts" v-if="showEventImpacts && currentEvent">
          <h4>事件影响：</h4>
          <ul>
            <li 
              v-for="(impact, index) in getEventImpactsList(currentEvent)" 
              :key="index"
              :class="getImpactClass(impact)"
            >
              {{ impact }}
            </li>
          </ul>
        </div>

        <!-- 扩展事件选项描述 -->
        <div class="event-options-description" v-if="hasEventOptions(currentEvent)">
          <h4>选择方案：</h4>
          <div 
            v-for="(option, index) in (currentEvent as ExtendedDailyEvent).options"
            :key="index"
            class="option-item"
          >
            <div class="option-label">{{ option.label }}</div>
            <div class="option-description" v-if="option.description">{{ option.description }}</div>
          </div>
        </div>

        <!-- 中性事件选择按钮 -->
        <div class="event-actions" v-if="hasEventOptions(currentEvent)">
          <van-button
            v-for="(option, index) in (currentEvent as ExtendedDailyEvent).options"
            :key="index"
            :type="index === 0 ? 'primary' : 'default'"
            size="large"
            @click="handleOptionSelect(option)"
            :class="index === 0 ? 'action-btn accept-btn' : 'action-btn reject-btn'"
          >
            {{ option.label }}
          </van-button>
        </div>

        <!-- 普通中性事件按钮 -->
        <div class="event-actions" v-else-if="currentEvent?.category === 'neutral'">
          <van-button
            type="primary"
            size="large"
            @click="handleAccept"
            class="action-btn accept-btn"
          >
            接受
          </van-button>
          <van-button
            type="default"
            size="large"
            @click="handleReject"
            class="action-btn reject-btn"
          >
            拒绝
          </van-button>
        </div>

        <!-- 其他事件确认按钮 -->
        <van-button
          v-else
          type="primary"
          size="large"
          @click="handleConfirm"
          class="confirm-btn"
        >
          知道了
        </van-button>
      </div>
    </van-dialog>

    <!-- 待处理事件列表 -->
    <div class="pending-events" v-if="pendingEvents.length > 0">
      <h3>待处理事件 ({{ pendingEvents.length }})</h3>
      <div 
        v-for="event in pendingEvents" 
        :key="event.id"
        class="pending-event-item"
        @click="showEvent(event)"
      >
        <div class="event-header">
          <van-icon 
            :name="getEventIconName(event.category)" 
            :color="getEventColor(event.category)"
            size="20"
          />
          <span class="event-title">{{ event.title }}</span>
          <van-tag :type="getEventTagType(event.category)">
            {{ getEventCategoryName(event.category) }}
          </van-tag>
        </div>
        <div class="event-brief">
          {{ event.description }}
        </div>
      </div>
    </div>

    <!-- 事件历史记录 -->
    <div class="event-history" v-if="showHistory && triggeredEvents.length > 0">
      <h3>今日事件</h3>
      <van-collapse v-model="activeNames">
        <van-collapse-item 
          v-for="event in triggeredEvents" 
          :key="event.id"
          :name="event.id"
          :title="event.title"
        >
          <div class="history-event-content">
            <p>{{ event.description }}</p>
            <div class="event-meta">
              <van-tag :type="getEventTagType(event.category)">
                {{ getEventCategoryName(event.category) }}
              </van-tag>
              <span class="event-time">{{ formatEventTime(event.triggeredAt) }}</span>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { DailyEvent } from '@/engine/dailyEventEngine';
import type { ExtendedDailyEvent } from '@/engine/extendedEventLibrary';
import { useSimulationStore } from '@/stores/simulationStore';

// Props
interface Props {
  showHistory?: boolean;
  autoShow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showHistory: true,
  autoShow: true
});

// Emits
const emit = defineEmits<{
  (e: 'event-handled', eventId: string, accepted: boolean): void;
}>();

// Simulation Store
const simulationStore = useSimulationStore();

// State
const showEventDialog = ref(false);
const currentEvent = ref<DailyEvent | ExtendedDailyEvent | null>(null);
const activeNames = ref<(string | number)[]>([]);

// Computed
const pendingEvents = computed(() => simulationStore.pendingNeutralEvents);
const triggeredEvents = computed(() => simulationStore.triggeredEvents);

// Watch
watch(() => simulationStore.pendingNeutralEvents, (newEvents) => {
  if (props.autoShow && newEvents.length > 0 && !showEventDialog.value) {
    showEvent(newEvents[0]);
  }
}, { deep: true });

// Methods
function hasEventOptions(event: DailyEvent | ExtendedDailyEvent | null): boolean {
  if (!event) return false;
  return 'options' in event && Array.isArray(event.options) && event.options.length > 0;
}

function getEventIconClass(category?: string): string {
  switch (category) {
    case 'positive':
      return 'icon-positive';
    case 'negative':
      return 'icon-negative';
    case 'employee':
      return 'icon-employee';
    case 'neutral':
      return 'icon-neutral';
    default:
      return '';
  }
}

function getEventIconName(category?: string): string {
  switch (category) {
    case 'positive':
      return 'good-job';
    case 'negative':
      return 'warning-o';
    case 'employee':
      return 'user-o';
    case 'neutral':
      return 'question-o';
    default:
      return 'info-o';
  }
}

function getEventColor(category?: string): string {
  switch (category) {
    case 'positive':
      return '#52c41a';
    case 'negative':
      return '#ff4d4f';
    case 'employee':
      return '#1890ff';
    case 'neutral':
      return '#faad14';
    default:
      return '#999';
  }
}

function getEventTagType(category?: string): string {
  switch (category) {
    case 'positive':
      return 'success';
    case 'negative':
      return 'danger';
    case 'employee':
      return 'primary';
    case 'neutral':
      return 'warning';
    default:
      return 'default';
  }
}

function getEventCategoryName(category?: string): string {
  switch (category) {
    case 'positive':
      return '正面事件';
    case 'negative':
      return '负面事件';
    case 'employee':
      return '员工事件';
    case 'neutral':
      return '中性事件';
    default:
      return '未知';
  }
}

function showEvent(event: DailyEvent) {
  currentEvent.value = event;
  showEventDialog.value = true;
}

function getEventImpactsList(event: DailyEvent | null): string[] {
  if (!event) return [];
  
  const impacts: string[] = [];
  const impact = event.impact;

  if (impact.revenueChange) {
    const change = impact.revenueChange > 0 ? '+' : '';
    const percent = Math.round(impact.revenueChange * 100);
    impacts.push(`收入${change}${percent}%`);
  }

  if (impact.satisfactionChange) {
    const change = impact.satisfactionChange > 0 ? '+' : '';
    impacts.push(`满意度${change}${impact.satisfactionChange}`);
  }

  if (impact.reputationChange) {
    const change = impact.reputationChange > 0 ? '+' : '';
    impacts.push(`声誉${change}${impact.reputationChange}`);
  }

  if (impact.playerChange) {
    const change = impact.playerChange > 0 ? '+' : '';
    impacts.push(`玩家${change}${impact.playerChange}`);
  }

  if (impact.fatigueChange) {
    const change = impact.fatigueChange > 0 ? '+' : '';
    impacts.push(`疲劳度${change}${impact.fatigueChange}`);
  }

  if (impact.experienceBonus) {
    impacts.push(`经验+${impact.experienceBonus}`);
  }

  return impacts;
}

function getImpactClass(impact: string): string {
  if (impact.includes('+') || impact.includes('收入+') || impact.includes('满意度+') || impact.includes('声誉+')) {
    return 'impact-positive';
  } else if (impact.includes('-') || impact.includes('收入-') || impact.includes('满意度-') || impact.includes('声誉-')) {
    return 'impact-negative';
  }
  return '';
}

function handleAccept() {
  if (currentEvent.value) {
    simulationStore.handleNeutralEventChoice(currentEvent.value.id, true);
    emit('event-handled', currentEvent.value.id, true);
    closeDialog();
  }
}

function handleReject() {
  if (currentEvent.value) {
    simulationStore.handleNeutralEventChoice(currentEvent.value.id, false);
    emit('event-handled', currentEvent.value.id, false);
    closeDialog();
  }
}

function handleOptionSelect(option: { label: string; impact: any; description?: string }) {
  if (currentEvent.value) {
    // 应用选项的影响
    simulationStore.applyCustomEventImpact(option.impact);
    // 从待处理队列中移除
    simulationStore.removePendingEvent(currentEvent.value.id);
    emit('event-handled', currentEvent.value.id, true);
    closeDialog();
  }
}

function handleConfirm() {
  closeDialog();
}

function closeDialog() {
  showEventDialog.value = false;
  currentEvent.value = null;
}

function formatEventTime(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
</script>

<style scoped lang="scss">
.event-notification-container {
  .event-dialog {
    :deep(.van-dialog__content) {
      max-height: 70vh;
      overflow-y: auto;
    }
  }

  .event-content {
    padding: 20px;
    text-align: center;

    .event-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;

      &.icon-positive {
        background: linear-gradient(135deg, #52c41a 0%, #95de64 100%);
        color: white;
      }

      &.icon-negative {
        background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
        color: white;
      }

      &.icon-employee {
        background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
        color: white;
      }

      &.icon-neutral {
        background: linear-gradient(135deg, #faad14 0%, #ffd666 100%);
        color: white;
      }
    }

    .event-description {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 20px;
      color: #333;
    }

    .event-impacts {
      text-align: left;
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;

      h4 {
        margin: 0 0 10px;
        font-size: 14px;
        color: #666;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          padding: 5px 0;
          font-size: 14px;

          &.impact-positive {
            color: #52c41a;
          }

          &.impact-negative {
            color: #ff4d4f;
          }
        }
      }
    }

    .event-options-description {
      text-align: left;
      background: #f0f7ff;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #d6e4ff;

      h4 {
        margin: 0 0 10px;
        font-size: 14px;
        color: #666;
      }

      .option-item {
        padding: 10px;
        background: #fff;
        border-radius: 6px;
        margin-bottom: 8px;
        border-left: 3px solid #1890ff;

        .option-label {
          font-size: 14px;
          font-weight: 500;
          color: #1890ff;
          margin-bottom: 5px;
        }

        .option-description {
          font-size: 13px;
          color: #666;
          line-height: 1.5;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .event-actions {
      display: flex;
      gap: 10px;

      .action-btn {
        flex: 1;
      }

      .accept-btn {
        background: #52c41a;
        border-color: #52c41a;
      }

      .reject-btn {
        background: #fff;
        border-color: #d9d9d9;
      }
    }

    .confirm-btn {
      width: 100%;
      background: #1890ff;
      border-color: #1890ff;
    }
  }

  .pending-events {
    margin-top: 20px;

    h3 {
      font-size: 16px;
      margin-bottom: 10px;
      color: #333;
    }

    .pending-event-item {
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #1890ff;
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
      }

      .event-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .event-title {
          flex: 1;
          font-size: 15px;
          font-weight: 500;
          color: #333;
        }
      }

      .event-brief {
        font-size: 13px;
        color: #666;
        line-height: 1.5;
      }
    }
  }

  .event-history {
    margin-top: 20px;

    h3 {
      font-size: 16px;
      margin-bottom: 10px;
      color: #333;
    }

    .history-event-content {
      p {
        margin: 0 0 10px;
        font-size: 14px;
        line-height: 1.6;
        color: #666;
      }

      .event-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .event-time {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
}
</style>
