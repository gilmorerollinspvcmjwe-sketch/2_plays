<template>
  <div class="task-complete-toast" :class="{ show: visible }">
    <div class="toast-content">
      <van-icon name="checked" class="check-icon" />
      <div class="toast-text">{{ message }}</div>
      <div class="toast-reward" v-if="reward">
        <span v-if="reward.gold" class="reward-item">+{{ reward.gold }} 💰</span>
        <span v-if="reward.diamond" class="reward-item">+{{ reward.diamond }} 💎</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  message: string;
  reward?: {
    gold?: number;
    diamond?: number;
  };
}>();

const visible = ref(false);

watch(() => props.show, (newVal) => {
  if (newVal) {
    visible.value = true;
    setTimeout(() => {
      visible.value = false;
    }, 2000);
  }
});
</script>

<style scoped lang="scss">
.task-complete-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 9999;
  pointer-events: none;
  
  &.show {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

.toast-content {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 20px 30px;
  text-align: center;
  color: white;
}

.check-icon {
  font-size: 48px;
  color: #07c160;
  margin-bottom: 12px;
}

.toast-text {
  font-size: 16px;
  margin-bottom: 8px;
}

.toast-reward {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}

.reward-item {
  font-size: 18px;
  font-weight: 600;
}
</style>