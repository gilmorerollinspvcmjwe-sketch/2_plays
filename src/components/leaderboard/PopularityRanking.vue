<template>
  <div class="popularity-ranking">
    <div class="list-header">
      <h3 class="list-title">🔥 人气榜</h3>
      <span class="update-time">{{ formatUpdateTime }}</span>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="list-content">
        <div
          v-for="entry in displayList"
          :key="entry.id"
          class="list-item"
          :class="{ 'is-player': entry.isPlayer }"
        >
          <div class="rank-badge" :class="getRankClass(entry.rank)">
            {{ entry.rank }}
          </div>

          <div class="character-avatar">
            {{ entry.avatar }}
          </div>

          <div class="character-info">
            <div class="character-name">
              {{ entry.name }}
              <van-tag v-if="entry.isPlayer" type="primary" size="medium" class="player-tag">
                我的角色
              </van-tag>
            </div>
            <div class="popularity-bar">
              <van-progress
                :percentage="entry.popularity || 0"
                :color="getPopularityColor(entry.popularity || 0)"
                stroke-width="6"
                :show-pivot="false"
              />
            </div>
            <div class="popularity-value">
              人气值: {{ entry.popularity }}
            </div>
          </div>

          <div class="rank-change" :class="getRankChangeClass(entry)">
            <template v-if="getRankChange(entry).direction === 'up'">
              <van-icon name="arrow-up" />
              <span>{{ getRankChange(entry).amount }}</span>
            </template>
            <template v-else-if="getRankChange(entry).direction === 'down'">
              <van-icon name="arrow-down" />
              <span>{{ getRankChange(entry).amount }}</span>
            </template>
            <template v-else>
              <span class="same-rank">-</span>
            </template>
          </div>
        </div>

        <van-empty v-if="displayList.length === 0" description="暂无榜单数据" />
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useLeaderboardStore, type LeaderboardEntry } from '@/stores/leaderboardStore';
import { showToast } from 'vant';

const leaderboardStore = useLeaderboardStore();
const refreshing = ref(false);

const displayList = computed(() => leaderboardStore.popularityRanking);

const formatUpdateTime = computed(() => {
  const date = new Date(leaderboardStore.lastUpdate);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} 更新`;
});

function getRankClass(rank: number): string {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return 'normal';
}

function getRankChange(entry: LeaderboardEntry): { direction: 'up' | 'down' | 'same'; amount: number } {
  return leaderboardStore.getRankChange(entry);
}

function getRankChangeClass(entry: LeaderboardEntry): string {
  const change = leaderboardStore.getRankChange(entry);
  if (change.direction === 'up') return 'up';
  if (change.direction === 'down') return 'down';
  return 'same';
}

function getPopularityColor(popularity: number): string {
  if (popularity >= 90) return '#FF4500';
  if (popularity >= 80) return '#FF69B4';
  if (popularity >= 70) return '#FFB6C1';
  if (popularity >= 60) return '#87CEEB';
  return '#90EE90';
}

async function onRefresh(): Promise<void> {
  try {
    leaderboardStore.forceRefresh();
    showToast('榜单已更新');
  } finally {
    refreshing.value = false;
  }
}

let updateInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  leaderboardStore.updatePopularityRanking();

  updateInterval = setInterval(() => {
    leaderboardStore.refreshAll();
  }, 60 * 60 * 1000);
});

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});
</script>

<style scoped lang="scss">
.popularity-ranking {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #FFF5F7 0%, #FFE4EC 100%);
  border-bottom: 1px solid rgba(255, 105, 180, 0.1);
}

.list-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.update-time {
  font-size: 12px;
  color: #999;
}

.list-content {
  padding: 8px 0;
  max-height: 500px;
  overflow-y: auto;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  transition: background-color 0.2s;

  &:active {
    background-color: #f9f9f9;
  }

  &.is-player {
    background: linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 100%);

    .character-name {
      color: #FF69B4;
    }
  }
}

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;

  &.gold {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
  }

  &.silver {
    background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
  }

  &.bronze {
    background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
  }

  &.normal {
    background: #f5f5f5;
    color: #666;
  }
}

.character-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.character-info {
  flex: 1;
  min-width: 0;
}

.character-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;

  .player-tag {
    background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
    border: none;
    color: white;
  }
}

.popularity-bar {
  margin-bottom: 4px;

  :deep(.van-progress) {
    background: #f0f0f0;
    border-radius: 4px;
  }
}

.popularity-value {
  font-size: 12px;
  color: #666;
}

.rank-change {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 14px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  flex-shrink: 0;

  &.up {
    color: #52c41a;
    background: rgba(82, 196, 26, 0.1);
  }

  &.down {
    color: #ff4d4f;
    background: rgba(255, 77, 79, 0.1);
  }

  &.same {
    color: #999;
    background: transparent;
  }

  .same-rank {
    font-size: 16px;
  }
}
</style>
