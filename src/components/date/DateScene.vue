<template>
  <div class="date-scene">
    <van-popup
      v-model:show="visible"
      position="bottom"
      :style="{ height: '100%', width: '100%' }"
      teleport="body"
    >
      <div class="scene-container" :style="{ background: scene?.background }">
        <div class="scene-header">
          <van-icon name="arrow-left" class="back-btn" @click="handleBack" />
          <span class="scene-title">{{ scene?.name }}</span>
          <div class="intimacy-display">
            <van-icon name="like" color="#FF69B4" />
            <span>{{ currentIntimacy }}</span>
          </div>
        </div>

        <div class="scene-content">
          <div class="background-overlay"></div>
          
          <div class="character-area">
            <div class="character-sprite" :class="{ 'show': showCharacter }">
              <div class="character-avatar">
                <van-icon name="user-o" size="60" />
              </div>
              <div class="character-name">{{ character?.name }}</div>
            </div>
          </div>

          <div class="dialogue-area" v-if="currentDialogue">
            <transition name="fade">
              <div class="dialogue-box" :key="currentDialogue.id">
                <div class="character-line">
                  <span class="name-tag">{{ character?.name }}</span>
                  <p>{{ currentDialogue.characterLine }}</p>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <div class="choices-area" v-if="currentDialogue && !showResponse">
          <div class="choices-container">
            <van-button
              v-for="(choice, index) in currentDialogue.playerChoices"
              :key="index"
              class="choice-btn"
              :class="`choice-${index + 1}`"
              round
              @click="handleChoice(choice)"
            >
              {{ choice.text }}
            </van-button>
          </div>
        </div>

        <transition name="slide-up">
          <div class="response-area" v-if="showResponse && selectedChoice">
            <div class="response-box">
              <div class="response-header">
                <span class="response-name">{{ character?.name }}</span>
              </div>
              <p class="response-text">{{ selectedChoice.response }}</p>
              <div class="intimacy-change" :class="intimacyClass">
                <van-icon :name="intimacyIcon" />
                <span>{{ intimacyChangeText }}</span>
              </div>
            </div>
            <van-button
              v-if="!isDateEnded"
              class="continue-btn"
              type="primary"
              round
              @click="nextDialogue"
            >
              继续
            </van-button>
          </div>
        </transition>

        <transition name="fade">
          <div class="date-result" v-if="isDateEnded">
            <div class="result-card">
              <div class="result-header">
                <van-icon name="like" class="heart-icon" />
                <h3>约会结束</h3>
              </div>
              <div class="result-content">
                <div class="result-item">
                  <span class="label">基础亲密度</span>
                  <span class="value">+{{ scene?.rewards.baseIntimacy }}</span>
                </div>
                <div class="result-item">
                  <span class="label">对话奖励</span>
                  <span class="value bonus">+{{ totalIntimacyGain }}</span>
                </div>
                <div class="result-total">
                  <span class="label">总计获得</span>
                  <span class="value total">+{{ totalReward }}</span>
                </div>
              </div>
              <van-button
                type="primary"
                round
                block
                color="linear-gradient(to right, #FF69B4, #FFB6C1)"
                @click="handleComplete"
              >
                完成
              </van-button>
            </div>
          </div>
        </transition>

        <transition name="intimacy-pop">
          <div class="intimacy-popup" v-if="showIntimacyPopup">
            <div class="popup-content" :class="intimacyClass">
              <van-icon :name="intimacyIcon" />
              <span>{{ intimacyPopupText }}</span>
            </div>
          </div>
        </transition>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { DateScene, DateDialogue } from '@/data/templates/dates';

const props = defineProps<{
  show: boolean;
  scene: DateScene | null;
  character: { id: string; name: string } | null;
  currentIntimacy: number;
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  'complete': [totalIntimacy: number];
}>();

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

const currentDialogueIndex = ref(0);
const selectedChoice = ref<{ text: string; intimacyChange: number; response: string } | null>(null);
const showResponse = ref(false);
const showCharacter = ref(false);
const showIntimacyPopup = ref(false);
const totalIntimacyGain = ref(0);
const isDateEnded = ref(false);

const currentDialogue = computed<DateDialogue | null>(() => {
  if (!props.scene) return null;
  return props.scene.dialogues[currentDialogueIndex.value] || null;
});

const intimacyClass = computed(() => {
  if (!selectedChoice.value) return '';
  const change = selectedChoice.value.intimacyChange;
  if (change > 10) return 'great';
  if (change > 0) return 'good';
  if (change === 0) return 'neutral';
  return 'bad';
});

const intimacyIcon = computed(() => {
  if (!selectedChoice.value) return 'like';
  const change = selectedChoice.value.intimacyChange;
  if (change > 0) return 'like';
  if (change === 0) return 'minus';
  return 'like';
});

const intimacyChangeText = computed(() => {
  if (!selectedChoice.value) return '';
  const change = selectedChoice.value.intimacyChange;
  if (change > 0) return `亲密度 +${change}`;
  if (change === 0) return '亲密度不变';
  return `亲密度 ${change}`;
});

const intimacyPopupText = computed(() => {
  if (!selectedChoice.value) return '';
  const change = selectedChoice.value.intimacyChange;
  if (change > 10) return '太棒了！';
  if (change > 0) return '不错！';
  if (change === 0) return '一般...';
  return '糟糕...';
});

const totalReward = computed(() => {
  const base = props.scene?.rewards.baseIntimacy || 0;
  return base + totalIntimacyGain.value;
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetDate();
    setTimeout(() => {
      showCharacter.value = true;
    }, 300);
  }
});

function resetDate() {
  currentDialogueIndex.value = 0;
  selectedChoice.value = null;
  showResponse.value = false;
  showCharacter.value = false;
  showIntimacyPopup.value = false;
  totalIntimacyGain.value = 0;
  isDateEnded.value = false;
}

function handleChoice(choice: { text: string; intimacyChange: number; response: string }) {
  selectedChoice.value = choice;
  showResponse.value = true;
  
  if (choice.intimacyChange !== 0) {
    totalIntimacyGain.value += choice.intimacyChange;
  }
  
  showIntimacyPopup.value = true;
  setTimeout(() => {
    showIntimacyPopup.value = false;
  }, 1500);
}

function nextDialogue() {
  if (!props.scene) return;
  
  showResponse.value = false;
  selectedChoice.value = null;
  
  if (currentDialogueIndex.value < props.scene.dialogues.length - 1) {
    currentDialogueIndex.value++;
  } else {
    isDateEnded.value = true;
  }
}

function handleBack() {
  visible.value = false;
}

function handleComplete() {
  emit('complete', totalReward.value);
  visible.value = false;
}
</script>

<style scoped lang="scss">
.date-scene {
  .scene-container {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .scene-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    z-index: 10;

    .back-btn {
      font-size: 24px;
      color: white;
      cursor: pointer;
    }

    .scene-title {
      font-size: 18px;
      font-weight: bold;
      color: white;
    }

    .intimacy-display {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 20px;

      span {
        color: white;
        font-size: 14px;
        font-weight: bold;
      }
    }
  }

  .scene-content {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 20px;
  }

  .background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 50%);
    pointer-events: none;
  }

  .character-area {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 200px;

    .character-sprite {
      display: flex;
      flex-direction: column;
      align-items: center;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.5s ease;

      &.show {
        opacity: 1;
        transform: translateY(0);
      }

      .character-avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 30px rgba(255, 105, 180, 0.3);
        color: white;
      }

      .character-name {
        margin-top: 12px;
        padding: 6px 16px;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 20px;
        color: white;
        font-size: 14px;
        font-weight: bold;
      }
    }
  }

  .dialogue-area {
    position: relative;
    z-index: 5;
    margin-bottom: 20px;

    .dialogue-box {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

      .character-line {
        .name-tag {
          display: inline-block;
          background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        p {
          margin: 0;
          font-size: 16px;
          line-height: 1.6;
          color: #333;
        }
      }
    }
  }

  .choices-area {
    position: relative;
    z-index: 5;

    .choices-container {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .choice-btn {
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid transparent;
        padding: 14px 20px;
        font-size: 14px;
        color: #333;
        transition: all 0.3s ease;

        &:hover {
          transform: translateX(5px);
        }

        &.choice-1 {
          border-color: #FF69B4;
        }

        &.choice-2 {
          border-color: #87CEEB;
        }

        &.choice-3 {
          border-color: #98FB98;
        }
      }
    }
  }

  .response-area {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
    z-index: 10;

    .response-box {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 16px;

      .response-header {
        margin-bottom: 10px;

        .response-name {
          background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
      }

      .response-text {
        margin: 0 0 16px 0;
        font-size: 16px;
        line-height: 1.6;
        color: #333;
      }

      .intimacy-change {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;

        &.great {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: white;
        }

        &.good {
          background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
          color: white;
        }

        &.neutral {
          background: #f0f0f0;
          color: #666;
        }

        &.bad {
          background: linear-gradient(135deg, #666 0%, #999 100%);
          color: white;
        }
      }
    }

    .continue-btn {
      width: 100%;
      background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
      border: none;
    }
  }

  .date-result {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    padding: 20px;

    .result-card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      width: 100%;
      max-width: 320px;

      .result-header {
        text-align: center;
        margin-bottom: 24px;

        .heart-icon {
          font-size: 48px;
          color: #FF69B4;
          animation: heartbeat 1s infinite;
        }

        h3 {
          margin: 12px 0 0 0;
          font-size: 22px;
          color: #333;
        }
      }

      .result-content {
        margin-bottom: 24px;

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          .label {
            color: #666;
            font-size: 14px;
          }

          .value {
            font-size: 18px;
            font-weight: bold;
            color: #333;

            &.bonus {
              color: #FF69B4;
            }
          }
        }

        .result-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          margin-top: 8px;
          background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E8 100%);
          border-radius: 12px;
          padding: 16px;

          .label {
            color: #333;
            font-size: 16px;
            font-weight: bold;
          }

          .value.total {
            font-size: 24px;
            font-weight: bold;
            color: #FF69B4;
          }
        }
      }
    }
  }

  .intimacy-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 30;

    .popup-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px 40px;
      border-radius: 20px;
      font-size: 24px;
      font-weight: bold;
      animation: popIn 0.3s ease;

      &.great {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        color: white;
      }

      &.good {
        background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
        color: white;
      }

      &.neutral {
        background: #f0f0f0;
        color: #666;
      }

      &.bad {
        background: linear-gradient(135deg, #666 0%, #999 100%);
        color: white;
      }

      .van-icon {
        font-size: 36px;
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.intimacy-pop-enter-active {
  animation: popIn 0.3s ease;
}

.intimacy-pop-leave-active {
  animation: popOut 0.3s ease;
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes popOut {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
