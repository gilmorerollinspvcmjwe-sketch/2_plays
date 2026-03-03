<template>
  <div class="milestone-card">
    <div class="milestone-header">
      <h3 class="milestone-title">🎯 游戏里程碑</h3>
      <span class="milestone-count">{{ completedCount }}/{{ totalCount }}</span>
    </div>
    
    <div class="milestone-categories">
      <div v-for="category in categories" :key="category.type" class="milestone-category">
        <div class="category-header">
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-name">{{ category.name }}</span>
        </div>
        
        <div class="milestone-list">
          <div 
            v-for="milestone in getMilestonesByType(category.type)" 
            :key="milestone.id"
            class="milestone-item"
            :class="{ 
              completed: milestone.completed && milestone.claimed,
              achievable: milestone.completed && !milestone.claimed,
              locked: !milestone.completed 
            }"
          >
            <div class="milestone-info">
              <div class="milestone-name-row">
                <span class="milestone-name">{{ milestone.name }}</span>
                <van-icon v-if="milestone.completed && milestone.claimed" name="passed" class="check-icon" />
              </div>
              <div class="milestone-target">
                {{ formatTarget(milestone.target, category.type) }}
              </div>
            </div>
            
            <div class="milestone-progress">
              <van-progress 
                :percentage="getProgress(milestone)" 
                :color="getProgressColor(milestone)"
                stroke-width="8"
                :show-pivot="false"
              />
              <span class="progress-text">
                {{ formatCurrent(milestone.current, category.type) }} / {{ formatTarget(milestone.target, category.type) }}
              </span>
            </div>
            
            <div class="milestone-reward">
              <van-icon name="gold-coin-o" />
              <span>{{ milestone.reward }}</span>
            </div>
            
            <van-button 
              v-if="milestone.completed && !milestone.claimed"
              type="primary"
              size="small"
              class="claim-btn"
              @click="handleClaim(milestone)"
            >
              领取
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <MilestoneToast
      v-if="showMilestoneToast"
      :milestone="currentMilestone"
      :duration="4000"
      :auto-close="true"
      @close="closeMilestoneToast"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useGameStore, type Milestone, type GameMilestones } from '@/stores/gameStore';
import { showToast } from 'vant';
import MilestoneToast from '@/components/animations/MilestoneToast.vue';

const props = defineProps<{
  gameId: string;
}>();

const gameStore = useGameStore();

const showMilestoneToast = ref(false);
const currentMilestone = ref({
  name: '',
  reward: ''
});

const categories = [
  { type: 'revenue' as const, name: '收益里程碑', icon: '💰' },
  { type: 'players' as const, name: '玩家里程碑', icon: '👥' },
  { type: 'popularity' as const, name: '人气里程碑', icon: '🔥' },
  { type: 'reputation' as const, name: '口碑里程碑', icon: '⭐' },
  { type: 'plots' as const, name: '剧情里程碑', icon: '📖' }
];

const milestones = computed<GameMilestones | null>(() => {
  return gameStore.getMilestones(props.gameId);
});

const completedCount = computed(() => {
  if (!milestones.value) return 0;
  let count = 0;
  Object.values(milestones.value).forEach(list => {
    list.forEach(m => {
      if (m.completed && m.claimed) count++;
    });
  });
  return count;
});

const totalCount = computed(() => {
  if (!milestones.value) return 0;
  let count = 0;
  Object.values(milestones.value).forEach(list => {
    count += list.length;
  });
  return count;
});

function getMilestonesByType(type: keyof GameMilestones): Milestone[] {
  if (!milestones.value) return [];
  return milestones.value[type] || [];
}

function getProgress(milestone: Milestone): number {
  return Math.min(100, (milestone.current / milestone.target) * 100);
}

function getProgressColor(milestone: Milestone): string {
  if (milestone.completed && milestone.claimed) {
    return '#52c41a';
  }
  if (milestone.completed) {
    return '#FF69B4';
  }
  return '#FFB6C1';
}

function formatTarget(value: number, type: string): string {
  switch (type) {
    case 'revenue':
      if (value >= 10000) {
        return `${value / 10000}万`;
      }
      return value.toLocaleString();
    case 'players':
      if (value >= 10000) {
        return `${value / 10000}万`;
      }
      return value.toLocaleString();
    case 'popularity':
    case 'reputation':
      return value.toString();
    case 'plots':
      return `${value}条`;
    default:
      return value.toString();
  }
}

function formatCurrent(value: number, type: string): string {
  switch (type) {
    case 'revenue':
      if (value >= 10000) {
        return `${(value / 10000).toFixed(1)}万`;
      }
      return value.toLocaleString();
    case 'players':
      if (value >= 10000) {
        return `${(value / 10000).toFixed(1)}万`;
      }
      return value.toLocaleString();
    default:
      return value.toString();
  }
}

async function handleClaim(milestone: Milestone) {
  const result = gameStore.claimMilestoneReward(props.gameId, milestone.id);
  
  if (result.success) {
    currentMilestone.value = {
      name: milestone.name,
      reward: `${milestone.reward} 积分`
    };
    showMilestoneToast.value = true;
  } else {
    showToast({
      type: 'fail',
      message: result.message
    });
  }
}

function closeMilestoneToast() {
  showMilestoneToast.value = false;
}

onMounted(() => {
  gameStore.checkMilestones(props.gameId);
});
</script>

<style scoped lang="scss">
.milestone-card {
  background: linear-gradient(135deg, #FFF5F7 0%, #FFE4EC 100%);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 105, 180, 0.2);
}

.milestone-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.milestone-count {
  font-size: 14px;
  color: #FF69B4;
  font-weight: bold;
}

.milestone-categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.milestone-category {
  background: white;
  border-radius: 12px;
  padding: 12px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.category-icon {
  font-size: 20px;
}

.category-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.milestone-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.milestone-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  position: relative;
  transition: all 0.3s ease;
  
  &.completed {
    background: linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%);
    border: 1px solid #b7eb8f;
  }
  
  &.achievable {
    background: linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 100%);
    border: 2px solid #FF69B4;
    animation: pulse 2s infinite;
  }
  
  &.locked {
    opacity: 0.8;
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 105, 180, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 105, 180, 0);
  }
}

.milestone-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.milestone-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.milestone-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.check-icon {
  color: #52c41a;
  font-size: 16px;
}

.milestone-target {
  font-size: 12px;
  color: #999;
}

.milestone-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  :deep(.van-progress) {
    background: #f0f0f0;
  }
}

.progress-text {
  font-size: 11px;
  color: #666;
}

.milestone-reward {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #FF69B4;
  font-weight: bold;
  
  .van-icon {
    color: #FFD700;
  }
}

.claim-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
  border: none;
  border-radius: 16px;
  padding: 0 12px;
  font-size: 12px;
  
  &:active {
    opacity: 0.8;
  }
}
</style>
