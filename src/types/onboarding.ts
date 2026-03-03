/**
 * 新手引导系统类型定义
 */

// 引导步骤
export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  targetRoute: string;
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

// 引导状态
export interface OnboardingState {
  isFirstVisit: boolean;
  isCompleted: boolean;
  currentStep: number;
  completedSteps: number[];
  skipped: boolean;
  lastVisitAt?: string;
}

// 引导步骤配置
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: '欢迎来到乙游创作者模拟器',
    description: '在这里，你将扮演乙女游戏公司的创始人，从零开始打造属于自己的乙女游戏帝国。让我们开始这段创作之旅吧！',
    targetRoute: '/',
    position: 'center'
  },
  {
    id: 2,
    title: '创建你的第一个角色',
    description: '点击"开始创作"，进入角色创建页面。选择外貌、服装、性格，创造独一无二的男主角。',
    targetRoute: '/',
    targetElement: 'create-game-btn',
    position: 'bottom'
  },
  {
    id: 3,
    title: '设计精彩剧情',
    description: '为你的角色编写动人剧情。选择剧情路线（甜宠/虐恋/悬疑），设计分支选项，让玩家沉浸其中。',
    targetRoute: '/creator/plot',
    position: 'center'
  },
  {
    id: 4,
    title: '发布你的游戏',
    description: '当角色和剧情都准备好后，点击发布按钮，让你的游戏正式上线！',
    targetRoute: '/publish',
    position: 'center'
  },
  {
    id: 5,
    title: '查看玩家评论',
    description: '游戏上线后，玩家会留下各种评论。有安利的、吐槽的、甚至还有带节奏的，看看他们怎么说吧！',
    targetRoute: '/comments',
    position: 'center'
  },
  {
    id: 6,
    title: '运营你的游戏',
    description: '通过举办活动、调整卡池、处理突发事件来运营游戏。记住，好的运营能让游戏长盛不衰！',
    targetRoute: '/operation',
    position: 'center'
  }
];

// 本地存储键名
export const ONBOARDING_STORAGE_KEY = 'onboarding_state';
