<template>
  <Teleport to="body">
    <Transition name="popularity">
      <div v-if="isVisible" class="popularity-rise" :style="positionStyle">
        <div class="popularity-content">
          <span class="arrow-icon">↑</span>
          <span class="value-text">+{{ value }}</span>
        </div>
        <div class="character-hint" v-if="characterName">
          <span>{{ characterName }}</span>
        </div>
        <div class="sparkle-trail">
          <span v-for="i in 6" :key="i" class="trail-particle" :style="getTrailStyle(i)"></span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Props {
  value: number;
  characterName?: string;
  position?: { x: number; y: number };
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 2000,
  position: () => ({ x: 50, y: 50 })
});

const isVisible = ref(false);

const positionStyle = computed(() => ({
  left: `${props.position.x}%`,
  top: `${props.position.y}%`
}));

const getTrailStyle = (index: number) => ({
  animationDelay: `${index * 0.1}s`
});

onMounted(() => {
  isVisible.value = true;
  
  setTimeout(() => {
    isVisible.value = false;
  }, props.duration);
});
</script>

<style scoped lang="scss">
.popularity-rise {
  position: fixed;
  transform: translate(-50%, -50%);
  z-index: 9998;
  pointer-events: none;
  animation: floatUp 2s ease-out forwards;
}

.popularity-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 20px;
  box-shadow: 
    0 4px 16px rgba(255, 215, 0, 0.5),
    0 0 20px rgba(255, 215, 0, 0.3);
  animation: shimmer 0.5s ease-in-out infinite alternate;
}

@keyframes shimmer {
  from {
    box-shadow: 
      0 4px 16px rgba(255, 215, 0, 0.5),
      0 0 20px rgba(255, 215, 0, 0.3);
  }
  to {
    box-shadow: 
      0 4px 20px rgba(255, 215, 0, 0.7),
      0 0 30px rgba(255, 215, 0, 0.5),
      0 0 40px rgba(255, 105, 180, 0.3);
  }
}

.arrow-icon {
  font-size: 24px;
  font-weight: bold;
  color: white;
  animation: arrowBounce 0.3s ease-in-out infinite alternate;
}

@keyframes arrowBounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-3px);
  }
}

.value-text {
  font-size: 28px;
  font-weight: bold;
  color: white;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 0 10px rgba(255, 255, 255, 0.5);
  animation: valuePulse 0.5s ease-in-out infinite alternate;
}

@keyframes valuePulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05);
  }
}

.character-hint {
  margin-top: 8px;
  padding: 4px 12px;
  background: rgba(255, 105, 180, 0.9);
  border-radius: 12px;
  font-size: 12px;
  color: white;
  text-align: center;
  animation: fadeInUp 0.3s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sparkle-trail {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.trail-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #FFD700;
  border-radius: 50%;
  animation: particleFall 1s ease-out infinite;
  box-shadow: 0 0 6px #FFD700;
}

@keyframes particleFall {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(30px) scale(0);
  }
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(20px) scale(0.5);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0) scale(1.1);
  }
  30% {
    transform: translate(-50%, -50%) scale(1);
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(-30px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(-50px) scale(0.8);
  }
}

.popularity-enter-active {
  animation: fadeIn 0.3s ease-out;
}

.popularity-leave-active {
  animation: fadeOut 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
