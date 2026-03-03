<template>
  <div class="achievement-wall">
    <div class="wall-header">
      <h3 class="wall-title">🏆 成就墙</h3>
      <div class="completion-info">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${completionRate}%` }"></div>
        </div>
        <span class="progress-text">{{ completionRate }}% 完成</span>
      </div>
    </div>

    <div class="achievement-grid">
      <div
        v-for="achievement in achievements"
        :key="achievement.id"
        class="achievement-badge"
        :class="{ unlocked: achievement.unlocked, locked: !achievement.unlocked }"
        @click="showDetail(achievement)"
      >
        <div class="badge-icon">{{ achievement.icon }}</div>
        <div class="badge-name">{{ achievement.name }}</div>
        <div v-if="achievement.unlocked" class="badge-check">✓</div>
        <div v-else class="badge-lock">🔒</div>
      </div>
    </div>

    <van-popup v-model:show="showPopup" position="bottom" round :style="{ height: '40%' }">
      <div v-if="selectedAchievement" class="achievement-detail">
        <div class="detail-header">
          <span class="detail-icon">{{ selectedAchievement.icon }}</span>
          <div class="detail-info">
            <h4 class="detail-name">{{ selectedAchievement.name }}</h4>
            <p class="detail-desc">{{ selectedAchievement.description }}</p>
          </div>
        </div>
        
        <div class="detail-reward">
          <span class="reward-label">奖励积分</span>
          <span class="reward-value">+{{ selectedAchievement.points }}</span>
        </div>

        <div v-if="selectedAchievement.unlocked" class="detail-status unlocked">
          <van-icon name="success" color="#52c41a" />
          <span>已于 {{ formatDate(selectedAchievement.unlockedAt) }} 解锁</span>
        </div>
        <div v-else class="detail-status locked">
          <van-icon name="lock" color="#999" />
          <span>尚未解锁</span>
        </div>

        <van-button 
          v-if="selectedAchievement.unlocked"
          type="primary" 
          block 
          class="share-btn"
          @click="shareAchievement"
        >
          分享成就
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePointsStore, type Achievement } from '@/stores/points';
import { showToast } from 'vant';

const pointsStore = usePointsStore();

const achievements = computed(() => pointsStore.achievements);
const completionRate = computed(() => pointsStore.achievementCompletionRate);

const showPopup = ref(false);
const selectedAchievement = ref<Achievement | null>(null);

function showDetail(achievement: Achievement) {
  selectedAchievement.value = achievement;
  showPopup.value = true;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

async function shareAchievement() {
  await pointsStore.shareGame();
  showToast('分享成功！');
  showPopup.value = false;
}
</script>

<style scoped lang="scss">
.achievement-wall {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.wall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.wall-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.completion-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  width: 80px;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF69B4, #FF1493);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #FF69B4;
  font-weight: bold;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.achievement-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &.unlocked {
    background: linear-gradient(135deg, #FFF5F7, #FFE4E8);
    border: 1px solid rgba(255, 105, 180, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 105, 180, 0.2);
    }
  }

  &.locked {
    background: #f5f5f5;
    border: 1px solid #e8e8e8;
    opacity: 0.7;

    .badge-icon {
      filter: grayscale(100%);
    }
  }
}

.badge-icon {
  font-size: 28px;
  margin-bottom: 4px;
}

.badge-name {
  font-size: 11px;
  color: #666;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.badge-check {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: #52c41a;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-lock {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
}

.achievement-detail {
  padding: 24px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.detail-icon {
  font-size: 48px;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #FFF5F7, #FFE4E8);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-info {
  flex: 1;
}

.detail-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0 0 4px;
}

.detail-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.detail-reward {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.reward-label {
  font-size: 14px;
  color: white;
}

.reward-value {
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.detail-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;

  &.unlocked {
    background: #f6ffed;
    color: #52c41a;
  }

  &.locked {
    background: #f5f5f5;
    color: #999;
  }
}

.share-btn {
  background: linear-gradient(135deg, #FF69B4, #FF1493);
  border: none;
}
</style>
