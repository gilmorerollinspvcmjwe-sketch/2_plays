<template>
  <div class="date-selector">
    <van-popup
      v-model:show="visible"
      position="bottom"
      round
      :style="{ height: '70%' }"
      teleport="body"
    >
      <div class="selector-container">
        <div class="selector-header">
          <h3>选择约会场景</h3>
          <van-icon name="cross" class="close-btn" @click="handleClose" />
        </div>

        <div class="character-info">
          <div class="avatar">
            <van-icon name="user-o" size="32" />
          </div>
          <div class="info">
            <span class="name">{{ character?.name }}</span>
            <div class="level">
              <van-tag type="primary">Lv.{{ intimacyLevel }} {{ levelName }}</van-tag>
            </div>
          </div>
        </div>

        <div class="scenes-list">
          <div
            v-for="scene in dateScenes"
            :key="scene.id"
            class="scene-card"
            :class="{ locked: scene.requiredLevel > intimacyLevel, selected: selectedScene?.id === scene.id }"
            @click="handleSelectScene(scene)"
          >
            <div class="scene-bg" :style="{ background: scene.background }">
              <div class="scene-overlay" v-if="scene.requiredLevel > intimacyLevel">
                <van-icon name="lock" size="24" />
                <span>需要 Lv.{{ scene.requiredLevel }}</span>
              </div>
            </div>
            <div class="scene-info">
              <div class="scene-name">{{ scene.name }}</div>
              <div class="scene-desc">{{ scene.description }}</div>
              <div class="scene-rewards">
                <span class="reward-item">
                  <van-icon name="like" />
                  基础 +{{ scene.rewards.baseIntimacy }}
                </span>
                <span class="reward-item bonus">
                  <van-icon name="star" />
                  最高 +{{ scene.rewards.bonusIntimacy }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="selector-footer">
          <van-button
            type="primary"
            round
            block
            color="linear-gradient(to right, #FF69B4, #FFB6C1)"
            :disabled="!selectedScene"
            @click="handleStartDate"
          >
            {{ selectedScene ? '开始约会' : '请选择场景' }}
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { dateScenes, type DateScene } from '@/data/templates/dates';
import { INTIMACY_LEVEL_NAMES } from '@/stores/gameStore';

const props = defineProps<{
  show: boolean;
  character: { id: string; name: string } | null;
  intimacyLevel: number;
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  'start': [scene: DateScene];
}>();

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

const selectedScene = ref<DateScene | null>(null);

const levelName = computed(() => {
  return INTIMACY_LEVEL_NAMES[props.intimacyLevel] || '陌生人';
});

function handleSelectScene(scene: DateScene) {
  if (scene.requiredLevel > props.intimacyLevel) {
    return;
  }
  selectedScene.value = scene;
}

function handleStartDate() {
  if (selectedScene.value) {
    emit('start', selectedScene.value);
    selectedScene.value = null;
  }
}

function handleClose() {
  visible.value = false;
  selectedScene.value = null;
}
</script>

<style scoped lang="scss">
.date-selector {
  .selector-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  }

  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 105, 180, 0.1);

    h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .close-btn {
      font-size: 24px;
      color: #999;
      cursor: pointer;
    }
  }

  .character-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: white;
    margin: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .info {
      .name {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }

      .level {
        margin-top: 4px;
      }
    }
  }

  .scenes-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .scene-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;

    &:hover:not(.locked) {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(255, 105, 180, 0.2);
    }

    &.selected {
      border-color: #FF69B4;
      box-shadow: 0 4px 16px rgba(255, 105, 180, 0.3);
    }

    &.locked {
      opacity: 0.6;
      cursor: not-allowed;

      .scene-bg {
        filter: grayscale(50%);
      }
    }

    .scene-bg {
      height: 80px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      .scene-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: white;

        span {
          font-size: 12px;
        }
      }
    }

    .scene-info {
      padding: 12px 16px;

      .scene-name {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
      }

      .scene-desc {
        font-size: 12px;
        color: #999;
        margin-bottom: 8px;
      }

      .scene-rewards {
        display: flex;
        gap: 12px;

        .reward-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #666;

          .van-icon {
            color: #FF69B4;
          }

          &.bonus .van-icon {
            color: #FFD700;
          }
        }
      }
    }
  }

  .selector-footer {
    padding: 16px 20px;
    background: white;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
