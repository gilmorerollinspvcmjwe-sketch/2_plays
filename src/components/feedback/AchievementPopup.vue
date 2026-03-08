<template>
  <Teleport to="body">
    <Transition name="achievement-pop">
      <div v-if="visible" class="achievement-popup-overlay" @click="handleClose">
        <div class="achievement-popup" @click.stop>
          <div class="achievement-badge">
            <div class="badge-icon">{{ achievement?.icon || '🏆' }}</div>
            <div class="badge-glow"></div>
          </div>
          
          <div class="achievement-content">
            <div class="achievement-label">成就解锁</div>
            <h3 class="achievement-name">{{ achievement?.name }}</h3>
            <p class="achievement-desc">{{ achievement?.description }}</p>
            
            <div class="achievement-reward">
              <span class="reward-label">奖励</span>
              <div class="reward-items">
                <span v-if="achievement?.points" class="reward-item">
                  <NumberAnimation :value="achievement.points" type="default" />
                  <span class="reward-suffix">积分</span>
                </span>
              </div>
            </div>
          </div>
          
          <van-button type="primary" block @click="handleClose">
            太棒了！
          </van-button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import NumberAnimation from './NumberAnimation.vue';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  points?: number;
}

const props = defineProps<{
  show: boolean;
  achievement: Achievement | null;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'close'): void;
}>();

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

function handleClose() {
  visible.value = false;
  emit('close');
}
</script>

<style scoped lang="scss">
.achievement-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.achievement-popup {
  width: 85%;
  max-width: 320px;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.achievement-badge {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
}

.badge-icon {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.5);
}

.badge-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.achievement-content {
  margin-bottom: 20px;
}

.achievement-label {
  font-size: 12px;
  color: #FF69B4;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.achievement-name {
  font-size: 24px;
  font-weight: 700;
  color: #323233;
  margin: 0 0 8px;
}

.achievement-desc {
  font-size: 14px;
  color: #969799;
  margin: 0 0 16px;
}

.achievement-reward {
  background: #f7f8fa;
  border-radius: 12px;
  padding: 12px;
}

.reward-label {
  font-size: 12px;
  color: #969799;
  display: block;
  margin-bottom: 8px;
}

.reward-items {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.reward-suffix {
  font-size: 14px;
  color: #323233;
}

.achievement-pop-enter-active {
  animation: pop-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.achievement-pop-leave-active {
  animation: pop-out 0.3s ease-in;
}

@keyframes pop-in {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pop-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.3);
    opacity: 0;
  }
}
</style>
