<template>
  <div class="sign-in-calendar" :class="{ embedded: embedded }">
    <!-- 非嵌入式显示头部 -->
    <div v-if="!embedded" class="calendar-header">
      <div class="header-left">
        <h3 class="calendar-title">📅 签到日历</h3>
        <div class="stats-row">
          <div class="stat-badge">
            <span class="stat-value">{{ totalSignInDays }}</span>
            <span class="stat-label">累计签到</span>
          </div>
          <div class="stat-badge consecutive">
            <span class="stat-value">{{ consecutiveDays }}</span>
            <span class="stat-label">连续签到</span>
          </div>
        </div>
      </div>
      <div class="check-in-btn-wrapper">
        <van-button
          :type="checkedInToday ? 'default' : 'primary'"
          size="small"
          :disabled="checkedInToday"
          @click="handleCheckIn"
        >
          {{ checkedInToday ? '已签到' : '签到' }}
        </van-button>
      </div>
    </div>

    <!-- 嵌入式显示简化头部 -->
    <div v-if="embedded" class="embedded-header">
      <div class="reward-preview-compact">
        <span class="preview-title">连续签到奖励</span>
        <div class="reward-days-compact">
          <div
            v-for="day in 7"
            :key="day"
            class="reward-dot"
            :class="{ 
              active: dayInCycle >= day,
              special: day === 7,
              current: dayInCycle + 1 === day && !checkedInToday
            }"
          >
            <span class="dot-day">{{ day }}</span>
            <van-icon v-if="dayInCycle >= day" name="success" class="dot-check" />
          </div>
        </div>
      </div>
      <van-button
        v-if="!checkedInToday"
        type="primary"
        size="small"
        round
        color="linear-gradient(135deg, #FF69B4, #FF1493)"
        @click="handleCheckIn"
      >
        签到
      </van-button>
    </div>

    <div class="reward-preview">
      <div class="reward-title">连续签到奖励</div>
      <div class="reward-days">
        <div
          v-for="day in 7"
          :key="day"
          class="reward-day"
          :class="{ 
            active: dayInCycle >= day,
            special: day === 7 
          }"
        >
          <span class="day-num">第{{ day }}天</span>
          <span class="day-reward">
            <template v-if="day <= 3">10积分</template>
            <template v-else-if="day <= 6">20积分</template>
            <template v-else>50积分🎁</template>
          </span>
          <van-icon v-if="dayInCycle >= day" name="success" class="check-icon" />
        </div>
      </div>
    </div>

    <div class="calendar-nav">
      <van-icon name="arrow-left" @click="prevMonth" :class="{ disabled: !canPrevMonth }" />
      <span class="current-month">{{ year }}年{{ month + 1 }}月</span>
      <van-icon name="arrow" @click="nextMonth" :class="{ disabled: !canNextMonth }" />
    </div>

    <div class="calendar-grid">
      <div class="week-header">
        <span v-for="day in weekDays" :key="day" class="week-day">{{ day }}</span>
      </div>
      <div class="days-grid">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            empty: !day.date,
            checked: day.checked,
            today: day.isToday,
            special: day.isSpecial
          }"
        >
          <span v-if="day.date" class="day-number">{{ day.date }}</span>
          <van-icon v-if="day.checked" name="success" class="check-mark" />
          <span v-if="day.isSpecial && !day.checked" class="special-mark">🎁</span>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showRewardPopup" round :style="{ padding: '24px', width: '80%', maxWidth: '320px' }">
      <div class="reward-popup">
        <div class="reward-icon">🎉</div>
        <h4 class="reward-title">签到成功！</h4>
        <p class="reward-desc">
          连续签到第 <strong>{{ rewardInfo?.consecutiveDays }}</strong> 天
        </p>
        <div class="reward-items">
          <div class="reward-item">
            <span class="item-icon">💰</span>
            <span class="item-value">+{{ rewardInfo?.reward?.points }} 积分</span>
          </div>
          <div v-if="rewardInfo?.reward?.gift" class="reward-item special">
            <span class="item-icon">🎁</span>
            <span class="item-value">神秘礼物</span>
          </div>
        </div>
        <van-button type="primary" block @click="showRewardPopup = false">
          太棒了！
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePointsStore, type SignInReward } from '@/stores/points';
import { showToast } from 'vant';

interface RewardInfo {
  consecutiveDays: number;
  reward: SignInReward;
}

// Props
const props = defineProps<{
  embedded?: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: 'signin-success', result: { consecutiveDays: number; reward: SignInReward }): void;
}>();

const pointsStore = usePointsStore();

const year = ref(new Date().getFullYear());
const month = ref(new Date().getMonth());

const checkedInToday = computed(() => pointsStore.checkedInToday);
const totalSignInDays = computed(() => pointsStore.totalSignInDays);
const consecutiveDays = computed(() => pointsStore.consecutiveSignInDays);

const dayInCycle = computed(() => {
  const days = consecutiveDays.value;
  if (days === 0) return 0;
  return ((days - 1) % 7) + 1;
});

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const canPrevMonth = computed(() => {
  const current = new Date();
  return year.value > current.getFullYear() || 
    (year.value === current.getFullYear() && month.value > 0);
});

const canNextMonth = computed(() => {
  const current = new Date();
  return year.value < current.getFullYear() || 
    (year.value === current.getFullYear() && month.value < current.getMonth());
});

const calendarDays = computed(() => {
  const firstDay = new Date(year.value, month.value, 1);
  const lastDay = new Date(year.value, month.value + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const signedDates = new Set(
    pointsStore.getSignInDatesInMonth(year.value, month.value)
  );
  
  const days: Array<{
    date: number | null;
    checked: boolean;
    isToday: boolean;
    isSpecial: boolean;
  }> = [];
  
  for (let i = 0; i < startPadding; i++) {
    days.push({ date: null, checked: false, isToday: false, isSpecial: false });
  }
  
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const checked = signedDates.has(dateStr);
    
    days.push({
      date: i,
      checked,
      isToday,
      isSpecial: isToday && !checked
    });
  }
  
  return days;
});

const showRewardPopup = ref(false);
const rewardInfo = ref<RewardInfo | null>(null);

function prevMonth() {
  if (!canPrevMonth.value) return;
  if (month.value === 0) {
    year.value--;
    month.value = 11;
  } else {
    month.value--;
  }
}

function nextMonth() {
  if (!canNextMonth.value) return;
  if (month.value === 11) {
    year.value++;
    month.value = 0;
  } else {
    month.value++;
  }
}

async function handleCheckIn() {
  const result = await pointsStore.checkIn();

  if (result.success) {
    rewardInfo.value = {
      consecutiveDays: result.consecutiveDays ?? pointsStore.consecutiveSignInDays,
      reward: result.reward ?? { points: 10 }
    };

    // 如果是嵌入式模式，触发事件让父组件处理弹窗
    if (props.embedded) {
      emit('signin-success', {
        consecutiveDays: rewardInfo.value.consecutiveDays,
        reward: rewardInfo.value.reward
      });
    } else {
      showRewardPopup.value = true;
    }
  } else {
    showToast(result.message);
  }
}

onMounted(() => {
  const today = new Date();
  year.value = today.getFullYear();
  month.value = today.getMonth();
});
</script>

<style scoped lang="scss">
.sign-in-calendar {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;

  &.embedded {
    background: transparent;
    padding: 0;
    margin-bottom: 0;
  }
}

// 嵌入式模式头部样式
.embedded-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.reward-preview-compact {
  flex: 1;
}

.preview-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.reward-days-compact {
  display: flex;
  gap: 6px;
}

.reward-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &.active {
    background: linear-gradient(135deg, #FFB6C1, #FF69B4);
  }

  &.special {
    background: linear-gradient(135deg, #FFD700, #FFA500);
  }

  &.current {
    border: 2px solid #FF69B4;
    box-shadow: 0 0 8px rgba(255, 105, 180, 0.4);
  }
}

.dot-day {
  font-size: 11px;
  color: #666;
  font-weight: 500;

  .reward-dot.active &,
  .reward-dot.special & {
    color: white;
  }
}

.dot-check {
  position: absolute;
  font-size: 10px;
  color: white;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.header-left {
  flex: 1;
}

.calendar-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px;
}

.stats-row {
  display: flex;
  gap: 12px;
}

.stat-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 8px;

  &.consecutive {
    background: linear-gradient(135deg, #FFF5F7, #FFE4E8);
  }
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #FF69B4;
}

.stat-label {
  font-size: 11px;
  color: #999;
}

.check-in-btn-wrapper {
  :deep(.van-button--primary) {
    background: linear-gradient(135deg, #FF69B4, #FF1493);
    border: none;
  }
}

.reward-preview {
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 12px;
}

.reward-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.reward-days {
  display: flex;
  gap: 4px;
}

.reward-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 2px;
  background: white;
  border-radius: 8px;
  font-size: 10px;
  position: relative;

  &.active {
    background: linear-gradient(135deg, #FFF5F7, #FFE4E8);
  }

  &.special {
    background: linear-gradient(135deg, #FFF9E6, #FFECB3);
  }
}

.day-num {
  color: #999;
  margin-bottom: 2px;
}

.day-reward {
  color: #333;
  font-weight: 500;
}

.check-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 10px;
  color: #52c41a;
}

.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 8px;

  .van-icon {
    font-size: 18px;
    color: #FF69B4;
    cursor: pointer;

    &.disabled {
      color: #ccc;
      cursor: not-allowed;
    }
  }
}

.current-month {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.calendar-grid {
  border-radius: 12px;
  overflow: hidden;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f5f5;
  padding: 8px 0;
}

.week-day {
  text-align: center;
  font-size: 12px;
  color: #999;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 8px;

  &.empty {
    background: transparent;
  }

  &:not(.empty) {
    background: #fafafa;
  }

  &.today {
    background: #e6f7ff;
  }

  &.checked {
    background: linear-gradient(135deg, #FFF5F7, #FFE4E8);
  }

  &.special {
    background: linear-gradient(135deg, #FFF9E6, #FFECB3);
    animation: pulse 2s infinite;
  }
}

.day-number {
  font-size: 14px;
  color: #333;
}

.check-mark {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 10px;
  color: #52c41a;
}

.special-mark {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 10px;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.reward-popup {
  text-align: center;
}

.reward-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.reward-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px;
}

.reward-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px;

  strong {
    color: #FF69B4;
    font-size: 18px;
  }
}

.reward-items {
  margin-bottom: 20px;
}

.reward-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 8px;

  &.special {
    background: linear-gradient(135deg, #FFF9E6, #FFECB3);
  }
}

.item-icon {
  font-size: 20px;
}

.item-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

:deep(.van-button--primary) {
  background: linear-gradient(135deg, #FF69B4, #FF1493);
  border: none;
}
</style>
