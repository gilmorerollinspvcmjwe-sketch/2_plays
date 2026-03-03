<template>
  <div class="bestseller-list">
    <div class="list-header">
      <h3 class="list-title">💰 畅销榜</h3>
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

          <div class="game-avatar">
            {{ entry.avatar }}
          </div>

          <div class="game-info">
            <div class="game-name">
              {{ entry.name }}
              <van-tag v-if="entry.isPlayer" type="primary" size="medium" class="player-tag">
                我的作品
              </van-tag>
            </div>
            <div class="game-revenue">
              收入: {{ leaderboardStore.formatRevenue(entry.revenue || 0) }}
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

const displayList = computed(() => leaderboardStore.bestsellerList);

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
  leaderboardStore.updateBestsellerList();

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
.bestseller-list {
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

    .game-name {
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

.game-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.game-info {
  flex: 1;
  min-width: 0;
}

.game-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;

  .player-tag {
    background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
    border: none;
    color: white;
  }
}

.game-revenue {
  font-size: 13px;
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
