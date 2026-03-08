import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ONBOARDING_STEPS, type OnboardingStep, type OnboardingState, ONBOARDING_STORAGE_KEY } from '@/types/onboarding';

export const useOnboardingStore = defineStore('onboarding', () => {
  const state = ref<OnboardingState>({
    isFirstVisit: true,
    isCompleted: false,
    currentStep: 0,
    completedSteps: [],
    skipped: false,
    lastVisitAt: undefined
  });

  const isActive = ref(false);

  const totalSteps = ONBOARDING_STEPS.length;

  const progress = computed(() => {
    return Math.round((state.value.currentStep / totalSteps) * 100);
  });

  const currentStepData = computed(() => {
    if (state.value.currentStep >= totalSteps) return null;
    return ONBOARDING_STEPS[state.value.currentStep];
  });

  const isFirstStep = computed(() => state.value.currentStep === 0);
  
  const isLastStep = computed(() => state.value.currentStep >= totalSteps - 1);
  
  const canSkip = computed(() => true);

  function loadFromLocal() {
    const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        state.value = { ...state.value, ...data };
      } catch (e) {
        console.error('加载引导数据失败:', e);
      }
    }
  }

  function saveToLocal() {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state.value));
  }

  function init() {
    loadFromLocal();
    
    if (state.value.isFirstVisit && !state.value.isCompleted && !state.value.skipped) {
      start();
    }
  }

  function start() {
    isActive.value = true;
    state.value.isFirstVisit = false;
    state.value.lastVisitAt = new Date().toISOString();
    saveToLocal();
  }

  function nextStep() {
    if (state.value.currentStep < totalSteps - 1) {
      state.value.completedSteps.push(state.value.currentStep);
      state.value.currentStep++;
      saveToLocal();
    }
  }

  function prevStep() {
    if (state.value.currentStep > 0) {
      state.value.currentStep--;
      saveToLocal();
    }
  }

  function goToStep(step: number) {
    if (step >= 0 && step < totalSteps) {
      state.value.currentStep = step;
      saveToLocal();
    }
  }

  function complete() {
    state.value.completedSteps.push(state.value.currentStep);
    state.value.isCompleted = true;
    isActive.value = false;
    saveToLocal();
  }

  function skip() {
    state.value.skipped = true;
    isActive.value = false;
    saveToLocal();
  }

  function reset() {
    state.value = {
      isFirstVisit: true,
      isCompleted: false,
      currentStep: 0,
      completedSteps: [],
      skipped: false,
      lastVisitAt: undefined
    };
    isActive.value = false;
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  }

  return {
    state,
    isActive,
    progress,
    currentStepData,
    isFirstStep,
    isLastStep,
    canSkip,
    init,
    start,
    nextStep,
    prevStep,
    goToStep,
    complete,
    skip,
    reset
  };
});
