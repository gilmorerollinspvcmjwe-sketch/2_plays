<template>
  <Transition name="number-pop">
    <span v-if="show" class="number-animation" :class="type">
      <span class="prefix">{{ prefix }}</span>
      <span class="number">{{ animatedNumber }}</span>
      <span v-if="suffix" class="suffix">{{ suffix }}</span>
    </span>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps<{
  value: number;
  type?: 'gold' | 'diamond' | 'popularity' | 'default';
  duration?: number;
  show?: boolean;
}>();

const animatedNumber = ref(0);
const show = ref(props.show ?? true);

const prefix = computed(() => {
  if (props.value >= 0) return '+';
  return '';
});

const suffix = computed(() => {
  switch (props.type) {
    case 'gold':
      return '💰';
    case 'diamond':
      return '💎';
    case 'popularity':
      return '❤️';
    default:
      return '';
  }
});

watch(() => props.value, (newVal) => {
  animateNumber(newVal);
}, { immediate: true });

function animateNumber(target: number) {
  const duration = props.duration || 500;
  const start = animatedNumber.value;
  const startTime = performance.now();
  
  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeOut = 1 - Math.pow(1 - progress, 3);
    animatedNumber.value = Math.round(start + (target - start) * easeOut);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}
</script>

<style scoped lang="scss">
.number-animation {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 18px;
  font-weight: 600;
  
  &.gold {
    color: #ff976a;
  }
  
  &.diamond {
    color: #1989fa;
  }
  
  &.popularity {
    color: #FF69B4;
  }
  
  &.default {
    color: #07c160;
  }
  
  .prefix {
    font-size: 16px;
  }
  
  .number {
    font-variant-numeric: tabular-nums;
  }
  
  .suffix {
    font-size: 14px;
  }
}

.number-pop-enter-active {
  animation: pop-in 0.3s ease-out;
}

.number-pop-leave-active {
  animation: pop-out 0.3s ease-in;
}

@keyframes pop-in {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  70% {
    transform: scale(1.2);
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
    transform: scale(0.5);
    opacity: 0;
  }
}
</style>
