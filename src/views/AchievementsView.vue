<template>
  <div class="achievements-view">
    <h2 class="page-title">🏆 成就系统</h2>

    <div class="stats-card">
      <div class="stat-item">
        <span class="stat-value">{{ unlockedCount }}</span>
        <span class="stat-label">已解锁</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ totalCount }}</span>
        <span class="stat-label">总成就</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ completionRate }}%</span>
        <span class="stat-label">完成度</span>
      </div>
    </div>

    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${completionRate}%` }"></div>
      </div>
      <p class="progress-hint">继续努力，解锁更多成就！</p>
    </div>

    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="全部">
        <div class="achievements-list">
          <van-cell-group>
            <van-cell
              v-for="achievement in achievements"
              :key="achievement.id"
              :title="achievement.name"
              :label="achievement.description"
              :class="{ 'is-unlocked': achievement.unlocked }"
              is-link
              @click="showDetail(achievement)"
            >
              <template #icon>
                <div class="achievement-icon" :class="{ unlocked: achievement.unlocked }">
                  {{ achievement.icon }}
                </div>
              </template>
              <template #right-icon>
                <div class="achievement-reward">
                  <van-tag v-if="achievement.unlocked" type="success">已解锁</van-tag>
                  <van-tag v-else type="default">未解锁</van-tag>
                  <span class="points">+{{ achievement.points }}</span>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </van-tab>
      
      <van-tab title="已解锁">
        <div class="achievements-list">
          <van-cell-group v-if="unlockedAchievements.length > 0">
            <van-cell
              v-for="achievement in unlockedAchievements"
              :key="achievement.id"
              :title="achievement.name"
              :label="achievement.description"
              class="is-unlocked"
              is-link
              @click="showDetail(achievement)"
            >
              <template #icon>
                <div class="achievement-icon unlocked">
                  {{ achievement.icon }}
                </div>
              </template>
              <template #right-icon>
                <div class="achievement-reward">
                  <van-tag type="success">已解锁</van-tag>
                  <span class="points">+{{ achievement.points }}</span>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
          <van-empty v-else description="还没有解锁任何成就" />
        </div>
      </van-tab>
      
      <van-tab title="未解锁">
        <div class="achievements-list">
          <van-cell-group v-if="lockedAchievements.length > 0">
            <van-cell
              v-for="achievement in lockedAchievements"
              :key="achievement.id"
              :title="achievement.name"
              :label="achievement.description"
              is-link
              @click="showDetail(achievement)"
            >
              <template #icon>
                <div class="achievement-icon">
                  {{ achievement.icon }}
                </div>
              </template>
              <template #right-icon>
                <div class="achievement-reward">
                  <van-tag type="default">未解锁</van-tag>
                  <span class="points">+{{ achievement.points }}</span>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
          <van-empty v-else description="恭喜！已解锁所有成就" />
        </div>
      </van-tab>
    </van-tabs>

    <van-popup v-model:show="showPopup" position="bottom" round :style="{ height: '45%' }">
      <div v-if="selectedAchievement" class="achievement-detail">
        <div class="detail-header">
          <div class="detail-icon-wrapper" :class="{ unlocked: selectedAchievement.unlocked }">
            <span class="detail-icon">{{ selectedAchievement.icon }}</span>
          </div>
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
          <span>尚未解锁，继续努力！</span>
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

const activeTab = ref(0);
const showPopup = ref(false);
const selectedAchievement = ref<Achievement | null>(null);

const achievements = computed(() => pointsStore.achievements);
const unlockedAchievements = computed(() => pointsStore.unlockedAchievements);
const lockedAchievements = computed(() => 
  achievements.value.filter(a => !a.unlocked)
);

const unlockedCount = computed(() => unlockedAchievements.value.length);
const totalCount = computed(() => achievements.value.length);
const completionRate = computed(() => pointsStore.achievementCompletionRate);

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
.achievements-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  text-align: center;
  padding: 16px;
  margin: 0;
}

.stats-card {
  display: flex;
  justify-content: space-around;
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 0 16px 16px;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #FF69B4;
    }

    .stat-label {
      font-size: 12px;
      color: #999;
    }
  }
}

.progress-section {
  padding: 0 16px;
  margin-bottom: 16px;
}

.progress-bar {
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

.progress-hint {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin: 8px 0 0;
}

.achievements-list {
  padding: 16px;

  .achievement-icon {
    width: 40px;
    height: 40px;
    background: #f0f0f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-right: 12px;
    filter: grayscale(100%);
    opacity: 0.5;

    &.unlocked {
      background: linear-gradient(135deg, #FFB6C1, #FF69B4);
      filter: none;
      opacity: 1;
    }
  }

  .achievement-reward {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;

    .points {
      font-size: 12px;
      color: #FF69B4;
      font-weight: bold;
    }
  }

  .is-unlocked {
    background: #FFF5F7;
  }
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

.detail-icon-wrapper {
  width: 64px;
  height: 64px;
  background: #f5f5f5;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.unlocked {
    background: linear-gradient(135deg, #FFF5F7, #FFE4E8);
  }
}

.detail-icon {
  font-size: 32px;
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
