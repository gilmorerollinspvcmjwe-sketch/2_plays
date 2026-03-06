<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="onboardingStore.isActive" class="onboarding-overlay" @click="handleOverlayClick">
        <!-- 遮罩层 -->
        <div class="onboarding-mask"></div>
        
        <!-- 引导内容 -->
        <div class="onboarding-content" :class="`position-${currentPosition}`" @click.stop>
          <!-- 步骤指示器 -->
          <div class="step-indicator">
            <span class="step-current">{{ onboardingStore.state.currentStep }}</span>
            <span class="step-divider">/</span>
            <span class="step-total">{{ totalSteps }}</span>
          </div>
          
          <!-- 进度条 -->
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${onboardingStore.progress}%` }"></div>
          </div>
          
          <!-- 步骤标题 -->
          <h3 class="step-title">{{ currentStepData?.title }}</h3>
          
          <!-- 步骤描述 -->
          <p class="step-description">{{ currentStepData?.description }}</p>
          
          <!-- 导航按钮 -->
          <div class="step-actions">
            <van-button 
              v-if="!onboardingStore.isFirstStep" 
              size="small" 
              plain 
              @click="onboardingStore.prevStep"
            >
              上一步
            </van-button>
            
            <van-button 
              v-if="onboardingStore.canSkip" 
              size="small" 
              plain 
              type="default"
              @click="handleSkip"
            >
              跳过
            </van-button>
            
            <van-button 
              size="small" 
              type="primary"
              color="linear-gradient(to right, #FF69B4, #FFB6C1)"
              @click="handleNext"
            >
              {{ onboardingStore.isLastStep ? '完成' : '下一步' }}
            </van-button>
          </div>
        </div>
        
        <!-- 装饰元素 -->
        <div class="decoration decoration-1">✨</div>
        <div class="decoration decoration-2">💖</div>
        <div class="decoration decoration-3">🌸</div>
      </div>
    </Transition>
  </Teleport>
  
  <!-- 跳过确认弹窗 - 使用组件式调用确保正确的 z-index -->
  <van-dialog
    v-model:show="showSkipDialog"
    title="跳过引导"
    message="确定要跳过新手引导吗？你可以在我的页面随时重新查看引导。"
    show-cancel-button
    confirm-button-text="跳过"
    cancel-button-text="继续引导"
    @confirm="confirmSkip"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { ONBOARDING_STEPS } from '@/types/onboarding';

const onboardingStore = useOnboardingStore();
const totalSteps = ONBOARDING_STEPS.length;

// 跳过确认弹窗显示状态
const showSkipDialog = ref(false);

const currentStepData = computed(() => onboardingStore.currentStepData);

const currentPosition = computed(() => {
  return currentStepData.value?.position || 'center';
});

onMounted(() => {
  // 延迟初始化，确保页面已加载
  setTimeout(() => {
    onboardingStore.init();
  }, 500);
});

function handleNext() {
  if (onboardingStore.isLastStep) {
    onboardingStore.complete();
  } else {
    onboardingStore.nextStep();
  }
}

function handleSkip() {
  // 显示组件式弹窗
  showSkipDialog.value = true;
}

function confirmSkip() {
  onboardingStore.skip();
  showSkipDialog.value = false;
}

function handleOverlayClick() {
  // 点击遮罩不关闭，防止误触
}
</script>

<style scoped lang="scss">
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.onboarding-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.onboarding-content {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 24px;
  width: 85%;
  max-width: 360px;
  box-shadow: 0 8px 32px rgba(255, 105, 180, 0.3);
  z-index: 1;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 12px;
  
  .step-current {
    font-size: 24px;
    font-weight: bold;
    color: #FF69B4;
  }
  
  .step-divider {
    font-size: 18px;
    color: #ccc;
  }
  
  .step-total {
    font-size: 16px;
    color: #999;
  }
}

.progress-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  margin-bottom: 20px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #FF69B4, #FFB6C1);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.step-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
  text-align: center;
}

.step-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 24px 0;
  text-align: center;
}

.step-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.decoration {
  position: absolute;
  font-size: 24px;
  animation: float 3s ease-in-out infinite;
  pointer-events: none;
}

.decoration-1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.decoration-2 {
  top: 25%;
  right: 10%;
  animation-delay: 1s;
}

.decoration-3 {
  bottom: 20%;
  left: 15%;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
