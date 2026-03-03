<template>
  <div class="intimacy-bar">
    <div class="intimacy-header">
      <div class="level-info">
        <span class="level-badge" :style="{ background: levelColor }">
          Lv.{{ intimacy?.level || 1 }}
        </span>
        <span class="level-name">{{ levelName }}</span>
      </div>
      <div class="exp-info">
        <span class="exp-text">{{ intimacy?.totalExperience || 0 }} / {{ nextLevelExp }}</span>
      </div>
    </div>

    <div class="progress-container">
      <van-progress
        :percentage="progress"
        :stroke-width="12"
        :color="levelColor"
        track-color="#f5f5f5"
        pivot-text=""
      />
    </div>

    <div class="unlock-hints" v-if="showUnlocks">
      <div class="unlock-item" :class="{ unlocked: isUnlocked('voice') }">
        <van-icon :name="isUnlocked('voice') ? 'volume' : 'lock'" />
        <span>3级解锁语音</span>
      </div>
      <div class="unlock-item" :class="{ unlocked: isUnlocked('date') }">
        <van-icon :name="isUnlocked('date') ? 'calendar-o' : 'lock'" />
        <span>5级解锁约会</span>
      </div>
      <div class="unlock-item" :class="{ unlocked: isUnlocked('confession') }">
        <van-icon :name="isUnlocked('confession') ? 'like' : 'lock'" />
        <span>7级解锁告白</span>
      </div>
      <div class="unlock-item" :class="{ unlocked: isUnlocked('ending') }">
        <van-icon :name="isUnlocked('ending') ? 'star' : 'lock'" />
        <span>10级解锁结局</span>
      </div>
    </div>

    <div class="daily-interaction" v-if="showInteraction">
      <van-button
        :type="canInteract ? 'primary' : 'default'"
        size="small"
        round
        :disabled="!canInteract"
        @click="handleInteraction"
      >
        {{ canInteract ? '每日互动' : '今日已互动' }}
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { showToast } from 'vant';
import { useGameStore, INTIMACY_LEVEL_EXP, INTIMACY_LEVEL_NAMES, type CharacterIntimacy } from '@/stores/gameStore';

const props = defineProps<{
  characterId: string;
  showUnlocks?: boolean;
  showInteraction?: boolean;
}>();

const emit = defineEmits<{
  interact: [];
  levelUp: [level: number];
}>();

const gameStore = useGameStore();

const intimacy = computed<CharacterIntimacy | null>(() => {
  return gameStore.getCharacterIntimacy(props.characterId);
});

const levelName = computed(() => {
  const level = intimacy.value?.level || 1;
  return INTIMACY_LEVEL_NAMES[level] || '陌生人';
});

const levelColor = computed(() => {
  const level = intimacy.value?.level || 1;
  const colors: Record<number, string> = {
    1: '#9E9E9E',
    2: '#8BC34A',
    3: '#4CAF50',
    4: '#00BCD4',
    5: '#2196F3',
    6: '#9C27B0',
    7: '#E91E63',
    8: '#F44336',
    9: '#FF5722',
    10: '#FFD700'
  };
  return colors[level] || '#9E9E9E';
});

const progress = computed(() => {
  return gameStore.getIntimacyProgress(props.characterId);
});

const nextLevelExp = computed(() => {
  const level = intimacy.value?.level || 1;
  if (level >= 10) return 'MAX';
  return INTIMACY_LEVEL_EXP[level + 1];
});

const canInteract = computed(() => {
  return gameStore.canDailyInteraction(props.characterId);
});

function isUnlocked(type: 'voice' | 'date' | 'confession' | 'ending'): boolean {
  const level = intimacy.value?.level || 1;
  switch (type) {
    case 'voice':
      return level >= 3;
    case 'date':
      return level >= 5;
    case 'confession':
      return level >= 7;
    case 'ending':
      return level >= 10;
    default:
      return false;
  }
}

function handleInteraction() {
  if (!canInteract.value) return;
  
  const result = gameStore.addIntimacy(props.characterId, 20, '每日互动');
  
  if (result.success) {
    showToast(result.message);
    emit('interact');
    
    if (result.levelUp) {
      emit('levelUp', result.newLevel);
    }
  }
}
</script>

<style scoped lang="scss">
.intimacy-bar {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.intimacy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.level-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.exp-info {
  .exp-text {
    font-size: 12px;
    color: #999;
  }
}

.progress-container {
  margin-bottom: 12px;
}

.unlock-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.unlock-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  background: #f5f5f5;
  font-size: 11px;
  color: #999;
  transition: all 0.3s ease;

  &.unlocked {
    background: linear-gradient(135deg, #FFE4E8 0%, #FFF0F3 100%);
    color: #E91E63;

    .van-icon {
      color: #E91E63;
    }
  }

  .van-icon {
    font-size: 12px;
  }
}

.daily-interaction {
  display: flex;
  justify-content: center;
}
</style>
