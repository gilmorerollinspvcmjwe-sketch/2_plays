import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Task {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  reward: {
    gold?: number;
    diamond?: number;
  };
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
}

export interface DailyReport {
  date: string;
  revenue: number;
  expense: number;
  newPlayers: number;
  lostPlayers: number;
  completedTasks: number;
  achievements: string[];
}

const DAILY_TASKS: Omit<Task, 'progress' | 'completed' | 'claimed'>[] = [
  {
    id: 'daily_login',
    type: 'daily',
    title: '登录游戏',
    description: '每日首次登录',
    reward: { gold: 200 },
    target: 1
  },
  {
    id: 'daily_handle_event',
    type: 'daily',
    title: '处理运营事件',
    description: '处理 1 个运营事件',
    reward: { gold: 300 },
    target: 1
  },
  {
    id: 'daily_character_interact',
    type: 'daily',
    title: '角色互动',
    description: '与角色互动 1 次',
    reward: { diamond: 10 },
    target: 1
  },
  {
    id: 'daily_view_market',
    type: 'daily',
    title: '查看市场情报',
    description: '查看市场情报',
    reward: { gold: 100 },
    target: 1
  },
  {
    id: 'daily_gacha',
    type: 'daily',
    title: '抽卡模拟',
    description: '进行 1 次抽卡模拟',
    reward: { gold: 200 },
    target: 1
  }
];

const WEEKLY_TASKS: Omit<Task, 'progress' | 'completed' | 'claimed'>[] = [
  {
    id: 'weekly_create_character',
    type: 'weekly',
    title: '创建角色',
    description: '创建 1 个新角色',
    reward: { diamond: 30 },
    target: 1
  },
  {
    id: 'weekly_complete_gacha',
    type: 'weekly',
    title: '完成卡池周期',
    description: '完成 1 个卡池周期',
    reward: { diamond: 50 },
    target: 1
  },
  {
    id: 'weekly_milestone',
    type: 'weekly',
    title: '达成里程碑',
    description: '达成 1 个游戏里程碑',
    reward: { diamond: 100 },
    target: 1
  }
];

export const useTaskStore = defineStore('task', () => {
  const dailyTasks = ref<Task[]>([]);
  const weeklyTasks = ref<Task[]>([]);
  const lastDailyRefresh = ref<string>('');
  const lastWeeklyRefresh = ref<string>('');
  const dailyReports = ref<DailyReport[]>([]);
  const isInitialized = ref(false);

  const allDailyCompleted = computed(() => {
    if (dailyTasks.value.length === 0) return false;
    return dailyTasks.value.every(t => t.completed);
  });

  const allWeeklyCompleted = computed(() => {
    if (weeklyTasks.value.length === 0) return false;
    return weeklyTasks.value.every(t => t.completed);
  });

  const dailyProgress = computed(() => {
    if (dailyTasks.value.length === 0) {
      return { current: 0, total: 0, percentage: 0 };
    }
    const completed = dailyTasks.value.filter(t => t.completed).length;
    return {
      current: completed,
      total: dailyTasks.value.length,
      percentage: Math.round((completed / dailyTasks.value.length) * 100)
    };
  });

  const weeklyProgress = computed(() => {
    if (weeklyTasks.value.length === 0) {
      return { current: 0, total: 0, percentage: 0 };
    }
    const completed = weeklyTasks.value.filter(t => t.completed).length;
    return {
      current: completed,
      total: weeklyTasks.value.length,
      percentage: Math.round((completed / weeklyTasks.value.length) * 100)
    };
  });

  function initTasks() {
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay();
    const mondayOfThisWeek = new Date();
    mondayOfThisWeek.setDate(mondayOfThisWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const thisWeek = mondayOfThisWeek.toISOString().split('T')[0];

    // 如果任务列表为空或日期不同，则初始化
    if (dailyTasks.value.length === 0 || lastDailyRefresh.value !== today) {
      if (dailyTasks.value.length === 0) {
        // 首次初始化
        dailyTasks.value = DAILY_TASKS.map(t => ({
          ...t,
          progress: 0,
          completed: false,
          claimed: false
        }));
      } else if (lastDailyRefresh.value !== today) {
        // 新的一天，重置任务但保持已完成的标记用于显示
        dailyTasks.value = dailyTasks.value.map(t => ({
          ...t,
          progress: 0,
          completed: false,
          claimed: false
        }));
      }
      lastDailyRefresh.value = today;
    }

    // 每周任务刷新
    if (weeklyTasks.value.length === 0 || lastWeeklyRefresh.value !== thisWeek) {
      if (weeklyTasks.value.length === 0) {
        weeklyTasks.value = WEEKLY_TASKS.map(t => ({
          ...t,
          progress: 0,
          completed: false,
          claimed: false
        }));
      } else if (lastWeeklyRefresh.value !== thisWeek) {
        weeklyTasks.value = weeklyTasks.value.map(t => ({
          ...t,
          progress: 0,
          completed: false,
          claimed: false
        }));
      }
      lastWeeklyRefresh.value = thisWeek;
    }

    saveToLocal();
  }

  function updateTaskProgress(taskId: string, amount: number = 1) {
    const dailyTask = dailyTasks.value.find(t => t.id === taskId);
    if (dailyTask && !dailyTask.completed) {
      dailyTask.progress = Math.min(dailyTask.progress + amount, dailyTask.target);
      if (dailyTask.progress >= dailyTask.target) {
        dailyTask.completed = true;
      }
      saveToLocal();
    }

    const weeklyTask = weeklyTasks.value.find(t => t.id === taskId);
    if (weeklyTask && !weeklyTask.completed) {
      weeklyTask.progress = Math.min(weeklyTask.progress + amount, weeklyTask.target);
      if (weeklyTask.progress >= weeklyTask.target) {
        weeklyTask.completed = true;
      }
      saveToLocal();
    }
  }

  function claimReward(taskId: string): { gold: number; diamond: number } | null {
    const dailyTask = dailyTasks.value.find(t => t.id === taskId);
    if (dailyTask && dailyTask.completed && !dailyTask.claimed) {
      dailyTask.claimed = true;
      saveToLocal();
      return dailyTask.reward;
    }

    const weeklyTask = weeklyTasks.value.find(t => t.id === taskId);
    if (weeklyTask && weeklyTask.completed && !weeklyTask.claimed) {
      weeklyTask.claimed = true;
      saveToLocal();
      return weeklyTask.reward;
    }

    return null;
  }

  function claimAllDailyRewards(): { gold: number; diamond: number } {
    let totalGold = 0;
    let totalDiamond = 0;

    dailyTasks.value.forEach(task => {
      if (task.completed && !task.claimed) {
        task.claimed = true;
        totalGold += task.reward.gold || 0;
        totalDiamond += task.reward.diamond || 0;
      }
    });

    if (allDailyCompleted.value) {
      totalDiamond += 50;
    }

    saveToLocal();
    return { gold: totalGold, diamond: totalDiamond };
  }

  function addDailyReport(report: DailyReport) {
    dailyReports.value.unshift(report);
    if (dailyReports.value.length > 7) {
      dailyReports.value = dailyReports.value.slice(0, 7);
    }
    saveToLocal();
  }

  function saveToLocal() {
    const data = {
      dailyTasks: dailyTasks.value,
      weeklyTasks: weeklyTasks.value,
      lastDailyRefresh: lastDailyRefresh.value,
      lastWeeklyRefresh: lastWeeklyRefresh.value,
      dailyReports: dailyReports.value
    };
    localStorage.setItem('task_data', JSON.stringify(data));
  }

  function loadFromLocal() {
    const saved = localStorage.getItem('task_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        dailyTasks.value = data.dailyTasks || [];
        weeklyTasks.value = data.weeklyTasks || [];
        lastDailyRefresh.value = data.lastDailyRefresh || '';
        lastWeeklyRefresh.value = data.lastWeeklyRefresh || '';
        dailyReports.value = data.dailyReports || [];
        
        // 检查是否需要刷新每日任务
        const today = new Date().toISOString().split('T')[0];
        if (lastDailyRefresh.value !== today) {
          // 新的一天，重置任务
          dailyTasks.value = DAILY_TASKS.map(t => ({
            ...t,
            progress: 0,
            completed: false,
            claimed: false
          }));
          lastDailyRefresh.value = today;
          saveToLocal();
        }
        isInitialized.value = true;
      } catch (e) {
        console.error('加载任务数据失败:', e);
        initTasks();
      }
    } else {
      // 没有保存的数据，初始化任务
      initTasks();
    }
    isInitialized.value = true;
  }

  function resetTasks() {
    dailyTasks.value = [];
    weeklyTasks.value = [];
    lastDailyRefresh.value = '';
    lastWeeklyRefresh.value = '';
    dailyReports.value = [];
    localStorage.removeItem('task_data');
    initTasks();
  }

  loadFromLocal();

  return {
    dailyTasks,
    weeklyTasks,
    lastDailyRefresh,
    lastWeeklyRefresh,
    dailyReports,
    isInitialized,
    allDailyCompleted,
    allWeeklyCompleted,
    dailyProgress,
    weeklyProgress,
    initTasks,
    updateTaskProgress,
    claimReward,
    claimAllDailyRewards,
    addDailyReport,
    resetTasks
  };
});
