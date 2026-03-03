<template>
  <Teleport to="body">
    <Transition name="achievement">
      <div v-if="isVisible" class="achievement-overlay" @click="handleClose">
        <div class="achievement-popup" @click.stop>
          <div class="achievement-glow"></div>
          
          <div class="achievement-icon-wrapper">
            <div class="icon-ring"></div>
            <div class="icon-ring icon-ring-2"></div>
            <div class="icon-ring icon-ring-3"></div>
            <span class="achievement-icon">{{ achievement.icon }}</span>
          </div>
          
          <div class="achievement-content">
            <h3 class="achievement-title">{{ achievement.name }}</h3>
            <p class="achievement-description">{{ achievement.description }}</p>
            
            <div class="achievement-points">
              <span class="points-label">获得积分</span>
              <span class="points-value">
                <span v-for="(digit, index) in displayPoints.toString().split('')" 
                      :key="index" 
                      class="digit"
                      :style="{ animationDelay: `${index * 0.1}s` }">
                  {{ digit }}
                </span>
              </span>
              <span class="points-unit">pts</span>
            </div>
          </div>
          
          <button class="close-button" @click="handleClose">
            <van-icon name="cross" />
          </button>
          
          <div class="sparkles">
            <span v-for="i in 12" :key="i" class="sparkle" :style="getSparkleStyle(i)"></span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';

interface Achievement {
  name: string;
  description: string;
  points: number;
  icon: string;
}

interface Props {
  achievement: Achievement;
  autoClose?: boolean;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  autoClose: true,
  duration: 3000
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isVisible = ref(false);
const displayPoints = ref(0);

const handleClose = () => {
  isVisible.value = false;
  emit('close');
};

const animatePoints = () => {
  const target = props.achievement.points;
  const duration = 1000;
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    displayPoints.value = Math.floor(target * easeOutQuart);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      displayPoints.value = target;
    }
  };
  
  animate();
};

const getSparkleStyle = (index: number) => {
  const angle = (index / 12) * 360;
  const radius = 120;
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;
  
  return {
    transform: `translate(${x}px, ${y}px)`,
    animationDelay: `${index * 0.1}s`
  };
};

onMounted(() => {
  isVisible.value = true;
  animatePoints();
  
  if (props.autoClose) {
    setTimeout(() => {
      handleClose();
    }, props.duration);
  }
});

watch(() => props.achievement.points, () => {
  displayPoints.value = 0;
  animatePoints();
});
</script>

<style scoped lang="scss">
.achievement-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.achievement-popup {
  position: relative;
  background: linear-gradient(145deg, #FFF5F7, #FFE4E8);
  border-radius: 24px;
  padding: 32px 24px;
  width: 85%;
  max-width: 320px;
  text-align: center;
  box-shadow: 
    0 10px 40px rgba(255, 105, 180, 0.3),
    0 0 0 1px rgba(255, 105, 180, 0.1);
  overflow: hidden;
}

.achievement-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 105, 180, 0.2) 0%, transparent 50%);
  animation: rotate 4s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.achievement-icon-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #FF69B4;
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

.icon-ring-2 {
  width: 85%;
  height: 85%;
  border-top-color: #FFD700;
  animation-duration: 1.5s;
  animation-direction: reverse;
}

.icon-ring-3 {
  width: 70%;
  height: 70%;
  border-top-color: #FFB6C1;
  animation-duration: 1s;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.achievement-icon {
  font-size: 48px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.achievement-content {
  position: relative;
  z-index: 1;
}

.achievement-title {
  font-size: 22px;
  font-weight: bold;
  color: #FF1493;
  margin: 0 0 8px;
  text-shadow: 0 2px 4px rgba(255, 105, 180, 0.2);
}

.achievement-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px;
  line-height: 1.5;
}

.achievement-points {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  padding: 12px 20px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.points-label {
  font-size: 14px;
  color: white;
  opacity: 0.9;
}

.points-value {
  display: flex;
  
  .digit {
    font-size: 28px;
    font-weight: bold;
    color: white;
    animation: digitPop 0.3s ease-out forwards;
    opacity: 0;
  }
}

@keyframes digitPop {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.5);
  }
  50% {
    transform: translateY(-5px) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.points-unit {
  font-size: 14px;
  color: white;
  opacity: 0.9;
}

.close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 105, 180, 0.1);
  border-radius: 50%;
  color: #FF69B4;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 105, 180, 0.2);
    transform: rotate(90deg);
  }
}

.sparkles {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #FFD700;
  border-radius: 50%;
  animation: sparkle 1.5s ease-in-out infinite;
  box-shadow: 0 0 10px #FFD700;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.achievement-enter-active {
  animation: popupIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.achievement-leave-active {
  animation: popupOut 0.3s ease-in;
}

@keyframes popupIn {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(50px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes popupOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}
</style>
