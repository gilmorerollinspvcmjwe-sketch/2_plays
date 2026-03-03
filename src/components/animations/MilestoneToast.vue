<template>
  <Teleport to="body">
    <Transition name="milestone">
      <div v-if="isVisible" class="milestone-toast" @click="handleClose">
        <div class="toast-content">
          <div class="toast-icon-wrapper">
            <span class="toast-icon">🏆</span>
            <div class="icon-badge">达成</div>
          </div>
          
          <div class="toast-info">
            <h4 class="milestone-name">{{ milestone.name }}</h4>
            <div class="milestone-reward">
              <span class="reward-label">奖励</span>
              <span class="reward-value">{{ milestone.reward }}</span>
            </div>
          </div>
          
          <button class="toast-close" @click.stop="handleClose">
            <van-icon name="cross" />
          </button>
          
          <div class="toast-progress">
            <div class="progress-bar" :style="{ animationDuration: `${duration}ms` }"></div>
          </div>
        </div>
        
        <div class="confetti-container">
          <span v-for="i in 20" :key="i" class="confetti" :style="getConfettiStyle(i)"></span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Milestone {
  name: string;
  reward: string;
}

interface Props {
  milestone: Milestone;
  duration?: number;
  autoClose?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 4000,
  autoClose: true
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isVisible = ref(false);

const handleClose = () => {
  isVisible.value = false;
  emit('close');
};

const getConfettiStyle = (index: number) => {
  const colors = ['#FF69B4', '#FFB6C1', '#FFD700', '#FFA500', '#FF1493', '#FFC0CB'];
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const duration = 1 + Math.random() * 1;
  
  return {
    left: `${left}%`,
    backgroundColor: colors[index % colors.length],
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  };
};

onMounted(() => {
  isVisible.value = true;
  
  if (props.autoClose) {
    setTimeout(() => {
      handleClose();
    }, props.duration);
  }
});
</script>

<style scoped lang="scss">
.milestone-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  cursor: pointer;
}

.toast-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  padding-right: 40px;
  background: linear-gradient(135deg, #FFF5F7, #FFFFFF);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(255, 105, 180, 0.25),
    0 0 0 1px rgba(255, 105, 180, 0.1);
  min-width: 280px;
  max-width: 90vw;
  overflow: hidden;
}

.toast-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.toast-icon {
  font-size: 40px;
  display: block;
  animation: trophyShake 0.5s ease-in-out infinite alternate;
}

@keyframes trophyShake {
  from {
    transform: rotate(-5deg);
  }
  to {
    transform: rotate(5deg);
  }
}

.icon-badge {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 8px;
  background: linear-gradient(135deg, #FF69B4, #FF1493);
  border-radius: 8px;
  font-size: 10px;
  font-weight: bold;
  color: white;
  white-space: nowrap;
}

.toast-info {
  flex: 1;
  min-width: 0;
}

.milestone-name {
  font-size: 16px;
  font-weight: bold;
  color: #FF1493;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.milestone-reward {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reward-label {
  font-size: 12px;
  color: #999;
  padding: 2px 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.reward-value {
  font-size: 14px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 0 1px 2px rgba(255, 215, 0, 0.3);
}

.toast-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 105, 180, 0.1);
    color: #FF69B4;
  }
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 105, 180, 0.1);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #FF69B4, #FFB6C1);
  animation: progressShrink linear forwards;
}

@keyframes progressShrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.confetti {
  position: absolute;
  top: -10px;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  animation: confettiFall linear forwards;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100px) rotate(720deg);
    opacity: 0;
  }
}

.milestone-enter-active {
  animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.milestone-leave-active {
  animation: slideDown 0.3s ease-in;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(100%);
  }
}

@media (max-width: 375px) {
  .toast-content {
    padding: 12px 16px;
    padding-right: 36px;
    min-width: 260px;
  }
  
  .toast-icon {
    font-size: 32px;
  }
  
  .milestone-name {
    font-size: 14px;
  }
  
  .reward-value {
    font-size: 12px;
  }
}
</style>
