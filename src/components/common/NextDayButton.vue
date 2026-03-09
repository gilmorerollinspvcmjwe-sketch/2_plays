<template>
  <div class="next-day-button-wrapper" @click="handleClick">
    <div class="next-day-button" :class="{ 'pulse': isPulsing, 'breathing': !isPulsing }">
      <van-icon name="clock-o" size="24" />
      <span class="button-text">下一天</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const isPulsing = ref(false);

function handleClick() {
  isPulsing.value = true;
  setTimeout(() => isPulsing.value = false, 300);
  emit('click');
}
</script>

<style scoped>
.next-day-button-wrapper {
  position: relative;
  top: -20px;
  z-index: 100;
}

.next-day-button {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF69B4 0%, #FF1493 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);
  color: white;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.next-day-button:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(255, 105, 180, 0.3);
}

.next-day-button.pulse {
  animation: pulse 0.3s ease;
}

.next-day-button.breathing {
  animation: breathing 2s ease-in-out infinite;
}

.button-text {
  font-size: 12px;
  margin-top: 2px;
  font-weight: bold;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes breathing {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);
  }
  50% { 
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(255, 105, 180, 0.5);
  }
}
</style>
