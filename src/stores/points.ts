import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface PointsHistory {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: string;
}

interface AchievementInfo {
  key: string;
  name: string;
  points: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Title {
  id: string;
  name: string;
  description: string;
  condition: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface SignInRecord {
  date: string;
  consecutiveDays: number;
}

export interface SignInReward {
  points: number;
  gift?: boolean;
  specialReward?: string;
}

type AchievementCallback = (achievement: AchievementInfo) => void;

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_game', name: '游戏发布者', description: '发布第一款游戏', icon: '🎮', points: 200, unlocked: false },
  { id: 'first_comment', name: '评论达人', description: '收到第一条评论', icon: '💬', points: 50, unlocked: false },
  { id: '10_comments', name: '话痨', description: '收到10条评论', icon: '🗣️', points: 50, unlocked: false },
  { id: 'popular_game', name: '人气游戏', description: '游戏人气超过1000', icon: '🔥', points: 200, unlocked: false },
  { id: 'first_income', name: '第一桶金', description: '获得第一笔收入', icon: '💰', points: 100, unlocked: false },
  { id: 'rich', name: '小富翁', description: '累计收入超过10000', icon: '💎', points: 500, unlocked: false },
  { id: 'hot_comment', name: '热评', description: '评论获得100赞', icon: '👍', points: 10, unlocked: false },
  { id: 'handle_incident', name: '危机处理', description: '成功处理运营事件', icon: '🛠️', points: 15, unlocked: false },
  { id: 'rich_day', name: '丰收日', description: '单日收入超过1000', icon: '🌾', points: 50, unlocked: false },
  { id: 'high_reputation', name: '口碑爆棚', description: '游戏声誉达到90', icon: '⭐', points: 100, unlocked: false },
  { id: 'hot_confession', name: '告白达人', description: '告白获得100赞', icon: '💌', points: 5, unlocked: false },
  { id: 'hot_creation', name: '创作达人', description: '创作获得100赞', icon: '✨', points: 5, unlocked: false },
  { id: 'first_confession', name: '告白初心', description: '发布第一条告白', icon: '💗', points: 20, unlocked: false },
  { id: 'first_creation', name: '创作初心', description: '发布第一个创作', icon: '🎨', points: 30, unlocked: false },
  { id: 'first_milestone', name: '初见成效', description: '达成第一个里程碑', icon: '🎯', points: 50, unlocked: false },
  { id: 'milestone_master', name: '里程碑大师', description: '达成10个里程碑', icon: '🏆', points: 200, unlocked: false },
  { id: 'popularity_top10', name: '人气推手', description: '角色进入人气榜前10', icon: '🌟', points: 100, unlocked: false },
  { id: 'revenue_1m', name: '百万富翁', description: '游戏收入超过100万', icon: '💵', points: 150, unlocked: false },
  { id: 'intimacy_max', name: '恋爱大师', description: '所有角色亲密度达到5级', icon: '💕', points: 200, unlocked: false },
  { id: 'birthday_celebrator', name: '生日派对', description: '庆祝10次角色生日', icon: '🎂', points: 100, unlocked: false },
  { id: 'date_master', name: '约会达人', description: '完成50次约会', icon: '🌹', points: 150, unlocked: false },
  { id: 'consecutive_7', name: '坚持一周', description: '连续签到7天', icon: '📅', points: 100, unlocked: false },
  { id: 'consecutive_30', name: '月度之星', description: '连续签到30天', icon: '🌟', points: 300, unlocked: false },
  { id: 'gacha_lucky', name: '欧皇降临', description: '十连抽获得SSR', icon: '🎰', points: 100, unlocked: false },
];

const TITLES: Title[] = [
  { id: 'newcomer', name: '新人创作者', description: '刚刚起步的创作者', condition: '默认称号', icon: '🌱', unlocked: true },
  { id: 'game_developer', name: '游戏开发者', description: '发布过游戏的创作者', condition: '发布第一款游戏', icon: '🎮', unlocked: false },
  { id: 'popular_creator', name: '人气创作者', description: '作品受到欢迎', condition: '游戏人气超过5000', icon: '🔥', unlocked: false },
  { id: 'millionaire', name: '百万富翁', description: '收入超过100万', condition: '累计收入超过100万', icon: '💰', unlocked: false },
  { id: 'dating_expert', name: '恋爱专家', description: '精通角色互动', condition: '所有角色亲密度达到5级', icon: '💕', unlocked: false },
  { id: 'milestone_hunter', name: '里程碑猎人', description: '达成多个里程碑', condition: '达成10个里程碑', icon: '🎯', unlocked: false },
  { id: 'birthday_planner', name: '派对策划师', description: '善于庆祝生日', condition: '庆祝10次角色生日', icon: '🎂', unlocked: false },
  { id: 'date_master', name: '约会大师', description: '约会经验丰富', condition: '完成50次约会', icon: '🌹', unlocked: false },
  { id: 'persistent', name: '坚持不懈', description: '连续签到30天', condition: '连续签到30天', icon: '📅', unlocked: false },
  { id: 'legend', name: '传奇创作者', description: '达成所有成就', condition: '解锁所有成就', icon: '👑', unlocked: false },
];

function getSignInReward(consecutiveDays: number): SignInReward {
  const dayInCycle = ((consecutiveDays - 1) % 7) + 1;
  
  if (dayInCycle <= 3) {
    return { points: 10 };
  } else if (dayInCycle <= 6) {
    return { points: 20 };
  } else {
    return { points: 50, gift: true, specialReward: '神秘礼物' };
  }
}

export const usePointsStore = defineStore('points', () => {
  const balance = ref<number>(0);
  const history = ref<PointsHistory[]>([]);
  const checkedInToday = ref<boolean>(false);
  const achievementCallback = ref<AchievementCallback | null>(null);
  
  const achievements = ref<Achievement[]>([...ACHIEVEMENTS]);
  const titles = ref<Title[]>([...TITLES]);
  const currentTitleId = ref<string>('newcomer');
  const signInRecords = ref<SignInRecord[]>([]);
  const consecutiveSignInDays = ref<number>(0);
  const totalSignInDays = ref<number>(0);

  const totalEarned = computed(() => {
    return history.value
      .filter(h => h.type === 'earn')
      .reduce((sum, h) => sum + h.amount, 0);
  });

  const totalSpent = computed(() => {
    return history.value
      .filter(h => h.type === 'spend')
      .reduce((sum, h) => sum + h.amount, 0);
  });

  const unlockedAchievements = computed(() => 
    achievements.value.filter(a => a.unlocked)
  );

  const achievementCompletionRate = computed(() => {
    const unlocked = achievements.value.filter(a => a.unlocked).length;
    return Math.round((unlocked / achievements.value.length) * 100);
  });

  const unlockedTitles = computed(() => 
    titles.value.filter(t => t.unlocked)
  );

  const currentTitle = computed(() => 
    titles.value.find(t => t.id === currentTitleId.value) || titles.value[0]
  );

  function addToHistory(
    type: 'earn' | 'spend',
    amount: number,
    reason: string
  ) {
    history.value.unshift({
      id: Date.now().toString(),
      type,
      amount,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  function setAchievementCallback(callback: AchievementCallback) {
    achievementCallback.value = callback;
  }

  function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  function calculateConsecutiveDays(): number {
    if (signInRecords.value.length === 0) return 0;
    
    const sortedRecords = [...signInRecords.value].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const today = getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const lastRecord = sortedRecords[0];
    
    if (lastRecord.date === today) {
      return lastRecord.consecutiveDays;
    }
    
    if (lastRecord.date === yesterdayStr) {
      return lastRecord.consecutiveDays + 1;
    }
    
    return 1;
  }

  async function checkIn() {
    if (checkedInToday.value) {
      return { success: false, message: '今日已签到' };
    }

    const today = getTodayString();
    consecutiveSignInDays.value = calculateConsecutiveDays();
    
    const reward = getSignInReward(consecutiveSignInDays.value);
    balance.value += reward.points;
    
    let message = `签到成功，获得 ${reward.points} 积分`;
    if (reward.gift) {
      message += '，还有神秘礼物！';
    }
    
    addToHistory('earn', reward.points, `每日签到（连续${consecutiveSignInDays.value}天）`);
    
    signInRecords.value.push({
      date: today,
      consecutiveDays: consecutiveSignInDays.value
    });
    
    totalSignInDays.value++;
    checkedInToday.value = true;
    
    if (consecutiveSignInDays.value >= 7) {
      await unlockAchievement('consecutive_7');
    }
    if (consecutiveSignInDays.value >= 30) {
      await unlockAchievement('consecutive_30');
      await unlockTitle('persistent');
    }
    
    saveToLocal();
    
    return { 
      success: true, 
      message,
      reward,
      consecutiveDays: consecutiveSignInDays.value 
    };
  }

  async function unlockAchievement(achievementId: string) {
    const achievement = achievements.value.find(a => a.id === achievementId);
    
    if (!achievement) {
      return { success: false, message: '未知成就' };
    }
    
    if (achievement.unlocked) {
      return { success: false, message: '成就已解锁' };
    }

    achievement.unlocked = true;
    achievement.unlockedAt = new Date().toISOString();
    
    balance.value += achievement.points;
    addToHistory('earn', achievement.points, `成就解锁：${achievement.name}`);
    
    if (achievementCallback.value) {
      achievementCallback.value({
        key: achievementId,
        name: achievement.name,
        points: achievement.points
      });
    }
    
    checkTitleUnlocks();
    saveToLocal();
    
    return { success: true, message: `成就解锁，获得${achievement.points}积分` };
  }

  async function unlockTitle(titleId: string) {
    const title = titles.value.find(t => t.id === titleId);
    
    if (!title) {
      return { success: false, message: '未知称号' };
    }
    
    if (title.unlocked) {
      return { success: false, message: '称号已解锁' };
    }

    title.unlocked = true;
    title.unlockedAt = new Date().toISOString();
    
    saveToLocal();
    
    return { success: true, message: `解锁称号：${title.name}` };
  }

  function setCurrentTitle(titleId: string) {
    const title = titles.value.find(t => t.id === titleId);
    if (title && title.unlocked) {
      currentTitleId.value = titleId;
      saveToLocal();
      return { success: true, message: `已装备称号：${title.name}` };
    }
    return { success: false, message: '未解锁该称号' };
  }

  function checkTitleUnlocks() {
    const unlockedIds = new Set(unlockedAchievements.value.map(a => a.id));
    
    if (unlockedIds.has('first_game')) {
      unlockTitle('game_developer');
    }
    if (unlockedIds.has('popular_game')) {
      unlockTitle('popular_creator');
    }
    if (unlockedIds.has('revenue_1m')) {
      unlockTitle('millionaire');
    }
    if (unlockedIds.has('intimacy_max')) {
      unlockTitle('dating_expert');
    }
    if (unlockedIds.has('milestone_master')) {
      unlockTitle('milestone_hunter');
    }
    if (unlockedIds.has('birthday_celebrator')) {
      unlockTitle('birthday_planner');
    }
    if (unlockedIds.has('date_master')) {
      unlockTitle('date_master');
    }
    
    if (unlockedAchievements.value.length === achievements.value.length) {
      unlockTitle('legend');
    }
  }

  async function shareGame() {
    const points = 20;
    balance.value += points;
    addToHistory('earn', points, '分享游戏');
    saveToLocal();
    
    return { success: true, message: '分享成功，获得 20 积分' };
  }

  async function spendPoints(
    amount: number,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    if (balance.value < amount) {
      return { 
        success: false, 
        message: `积分不足，需要${amount}积分，当前${balance.value}积分` 
      };
    }
    
    balance.value -= amount;
    addToHistory('spend', amount, reason);
    saveToLocal();
    
    return { success: true, message: `消耗${amount}积分` };
  }

  function loadFromLocal() {
    const saved = localStorage.getItem('points_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        balance.value = data.balance || 0;
        history.value = data.history || [];
        checkedInToday.value = data.checkedInToday || false;
        
        if (data.achievements) {
          data.achievements.forEach((saved: Achievement) => {
            const achievement = achievements.value.find(a => a.id === saved.id);
            if (achievement) {
              achievement.unlocked = saved.unlocked;
              achievement.unlockedAt = saved.unlockedAt;
            }
          });
        }
        
        if (data.titles) {
          data.titles.forEach((saved: Title) => {
            const title = titles.value.find(t => t.id === saved.id);
            if (title) {
              title.unlocked = saved.unlocked;
              title.unlockedAt = saved.unlockedAt;
            }
          });
        }
        
        currentTitleId.value = data.currentTitleId || 'newcomer';
        signInRecords.value = data.signInRecords || [];
        consecutiveSignInDays.value = data.consecutiveSignInDays || 0;
        totalSignInDays.value = data.totalSignInDays || 0;
      } catch (e) {
        console.error('加载积分数据失败:', e);
      }
    }
  }

  function saveToLocal() {
    const data = {
      balance: balance.value,
      history: history.value,
      checkedInToday: checkedInToday.value,
      achievements: achievements.value.map(a => ({
        id: a.id,
        unlocked: a.unlocked,
        unlockedAt: a.unlockedAt
      })),
      titles: titles.value.map(t => ({
        id: t.id,
        unlocked: t.unlocked,
        unlockedAt: t.unlockedAt
      })),
      currentTitleId: currentTitleId.value,
      signInRecords: signInRecords.value,
      consecutiveSignInDays: consecutiveSignInDays.value,
      totalSignInDays: totalSignInDays.value
    };
    localStorage.setItem('points_data', JSON.stringify(data));
  }

  function resetCheckIn() {
    const lastCheckIn = localStorage.getItem('last_checkin_date');
    const today = new Date().toDateString();
    
    if (lastCheckIn !== today) {
      checkedInToday.value = false;
      localStorage.setItem('last_checkin_date', today);
      
      if (signInRecords.value.length > 0) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const lastRecord = signInRecords.value[signInRecords.value.length - 1];
        if (lastRecord.date !== yesterdayStr && lastRecord.date !== getTodayString()) {
          consecutiveSignInDays.value = 0;
        }
      }
    }
  }

  function getSignInDatesInMonth(year: number, month: number): string[] {
    return signInRecords.value
      .filter(record => {
        const date = new Date(record.date);
        return date.getFullYear() === year && date.getMonth() === month;
      })
      .map(record => record.date);
  }

  loadFromLocal();
  resetCheckIn();

  return {
    balance,
    history,
    checkedInToday,
    totalEarned,
    totalSpent,
    achievements,
    titles,
    currentTitleId,
    signInRecords,
    consecutiveSignInDays,
    totalSignInDays,
    unlockedAchievements,
    achievementCompletionRate,
    unlockedTitles,
    currentTitle,
    checkIn,
    unlockAchievement,
    unlockTitle,
    setCurrentTitle,
    shareGame,
    spendPoints,
    loadFromLocal,
    saveToLocal,
    setAchievementCallback,
    getSignInReward,
    getSignInDatesInMonth
  };
});
