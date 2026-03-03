/**
 * 新手引导状态管理 Store
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { OnboardingState } from '@/types/onboarding';
import { ONBOARDING_STEPS, ONBOARDING_STORAGE_KEY } from '@/types/onboarding';

const TOTAL_STEPS = ONBOARDING_STEPS.length;

export const useOnboardingStore = defineStore('onboarding', () => {
  // State
  const state = ref<OnboardingState>({
    isFirstVisit: true,
    isCompleted: false,
    currentStep: 1,
    completedSteps: [],
    skipped: false
  });

  const isActive = ref(false);

  // Getters
  const currentStepData = computed(() => {
    return ONBOARDING_STEPS.find(s => s.id === state.value.currentStep) || null;
  });

  const progress = computed(() => {
    return (state.value.completedSteps.length / TOTAL_STEPS) * 100;
  });

  const isLastStep = computed(() => {
    return state.value.currentStep >= TOTAL_STEPS;
  });

  const isFirstStep = computed(() => {
    return state.value.currentStep === 1;
  });

  const canSkip = computed(() => {
    return !state.value.isCompleted && !state.value.skipped;
  });

  // Actions

  /**
   * 初始化引导状态
   */
  function init(): void {
    const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        state.value = { ...state.value, ...parsed };
      } catch (e) {
        console.error('加载引导状态失败:', e);
      }
    }

    // 如果是首次访问且未完成，自动开始引导
    if (state.value.isFirstVisit && !state.value.isCompleted && !state.value.skipped) {
      start();
    }
  }

  /**
   * 开始引导
   */
  function start(): void {
    isActive.value = true;
    state.value.isFirstVisit = false;
    saveToLocal();
  }

  /**
   * 下一步
   */
  function nextStep(): void {
    if (!state.value.completedSteps.includes(state.value.currentStep)) {
      state.value.completedSteps.push(state.value.currentStep);
    }

    if (isLastStep.value) {
      complete();
    } else {
      state.value.currentStep++;
      saveToLocal();
    }
  }

  /**
   * 上一步
   */
  function prevStep(): void {
    if (!isFirstStep.value) {
      state.value.currentStep--;
      saveToLocal();
    }
  }

  /**
   * 跳转到指定步骤
   */
  function goToStep(stepId: number): void {
    if (stepId >= 1 && stepId <= TOTAL_STEPS) {
      state.value.currentStep = stepId;
      saveToLocal();
    }
  }

  /**
   * 跳过引导
   */
  function skip(): void {
    state.value.skipped = true;
    isActive.value = false;
    saveToLocal();
  }

  /**
   * 完成引导
   */
  function complete(): void {
    if (!state.value.completedSteps.includes(state.value.currentStep)) {
      state.value.completedSteps.push(state.value.currentStep);
    }
    state.value.isCompleted = true;
    isActive.value = false;
    saveToLocal();
  }

  /**
   * 重置引导
   */
  function reset(): void {
    state.value = {
      isFirstVisit: true,
      isCompleted: false,
      currentStep: 1,
      completedSteps: [],
      skipped: false
    };
    isActive.value = false;
    saveToLocal();
  }

  /**
   * 标记当前步骤完成
   */
  function markCurrentStepComplete(): void {
    if (!state.value.completedSteps.includes(state.value.currentStep)) {
      state.value.completedSteps.push(state.value.currentStep);
      saveToLocal();
    }
  }

  /**
   * 检查步骤是否已完成
   */
  function isStepCompleted(stepId: number): boolean {
    return state.value.completedSteps.includes(stepId);
  }

  /**
   * 保存到本地存储
   */
  function saveToLocal(): void {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state.value));
  }

  /**
   * 关闭引导（临时）
   */
  function close(): void {
    isActive.value = false;
  }

  /**
   * 重新打开引导
   */
  function reopen(): void {
    if (!state.value.isCompleted && !state.value.skipped) {
      isActive.value = true;
    }
  }

  return {
    // State
    state,
    isActive,
    
    // Getters
    currentStepData,
    progress,
    isLastStep,
    isFirstStep,
    canSkip,
    
    // Actions
    init,
    start,
    nextStep,
    prevStep,
    goToStep,
    skip,
    complete,
    reset,
    markCurrentStepComplete,
    isStepCompleted,
    close,
    reopen
  };
});
