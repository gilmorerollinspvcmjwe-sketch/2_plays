import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CreatorGrowth, SkillType, AchievementType } from '@/types/creatorGrowth';
import {
  initCreatorGrowth,
  addExperience,
  upgradeSkill as upgradeSkillFn,
  checkAchievements,
  unlockAchievement as unlockAchievementFn
} from '@/types/creatorGrowth';

// 技能效果定义 - 用于游戏核心玩法联动
export const SKILL_EFFECTS = {
  copywriting: {
    plotQualityBonus: (level: number) => level * 0.05, // 每级+5%
    aiQualityBonus: (level: number) => level * 0.03,
    completionRateBonus: (level: number) => level * 0.02
  },
  artAppreciation: {
    characterPopularityBonus: (level: number) => level * 0.04, // 每级+4%
    firstImpressionBonus: (level: number) => level * 0.03
  },
  projectManagement: {
    teamEfficiencyBonus: (level: number) => level * 0.05, // 每级+5%
    progressBonus: (level: number) => level * 0.005,
    fatigueReduction: (level: number) => level * 0.02
  },
  dataAnalysis: {
    predictionAccuracy: (level: number) => level * 0.05, // 每级+5%
    unlockDeepAnalysis: (level: number) => level >= 3
  }
};

export const useCreatorGrowthStore = defineStore('creatorGrowth', () => {
  const growth = ref<CreatorGrowth>(initCreatorGrowth());

  const availableSkillPoints = computed(() => {
    const totalPoints = (growth.value.level - 1) * 2;
    const usedPoints = growth.value.skills.reduce((sum, s) => sum + s.level, 0);
    return Math.max(0, totalPoints - usedPoints);
  });

  const unlockedAchievements = computed(() => {
    return growth.value.achievements.map(a => a.type);
  });

  function loadFromLocal() {
    const saved = localStorage.getItem('creator_growth_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        growth.value = { ...growth.value, ...data };
      } catch (e) {
        console.error('加载创作者数据失败:', e);
      }
    }
  }

  function saveToLocal() {
    localStorage.setItem('creator_growth_data', JSON.stringify(growth.value));
  }

  function addExp(amount: number, source: string) {
    const result = addExperience(growth.value, amount, source);
    
    if (result.levelUp) {
      checkAndUnlockAchievements();
    }
    
    saveToLocal();
    return result;
  }

  function upgradeSkill(type: SkillType): { success: boolean; message: string; newLevel: number } {
    const result = upgradeSkillFn(growth.value, type);
    
    if (result.success) {
      saveToLocal();
    }
    
    return result;
  }

  function updateStats(stats: Partial<CreatorGrowth['stats']>) {
    growth.value.stats = {
      ...growth.value.stats,
      ...stats
    };
    saveToLocal();
    checkAndUnlockAchievements();
  }

  function checkAndUnlockAchievements() {
    const newAchievements = checkAchievements(growth.value);
    
    for (const type of newAchievements) {
      const result = unlockAchievementFn(growth.value, type);
      if (result.success) {
        console.log(result.message);
      }
    }
    
    saveToLocal();
  }

  function getSkillEffects(skillType: SkillType) {
    const skill = growth.value.skills.find(s => s.type === skillType);
    if (!skill || skill.level === 0) return [];
    
    const effects = [];
    for (let i = 1; i <= skill.level; i++) {
      const levelEffects = skillType === 'planning' ? [
        { description: '剧情质量+' + (i * 3) + '%' }
      ] : skillType === 'art' ? [
        { description: '美术质量+' + (i * 3) + '%' }
      ] : skillType === 'operation' ? [
        { description: '活动效果+' + (i * 3) + '%' }
      ] : [
        { description: '市场预测+' + (i * 3) + '%' }
      ];
      effects.push(...levelEffects);
    }
    
    return effects;
  }

  function getAllSkillEffects(): Map<string, number> {
    const allEffects = new Map<string, number>();
    
    for (const skill of growth.value.skills) {
      const effects = getSkillEffects(skill.type);
      for (const effect of effects) {
        const match = effect.description.match(/\+(\d+)%/);
        if (match) {
          const value = parseInt(match[1]);
          const type = effect.description.replace(/\+\d+%\s*/, '');
          const current = allEffects.get(type) || 0;
          allEffects.set(type, current + value);
        }
      }
    }
    
    return allEffects;
  }

  // 获取指定技能的等级
  function getSkillLevel(skillType: string): number {
    const skillMap: Record<string, SkillType> = {
      'copywriting': 'planning',
      'artAppreciation': 'art',
      'projectManagement': 'operation',
      'dataAnalysis': 'market'
    };
    const mappedType = skillMap[skillType];
    if (!mappedType) return 0;
    const skill = growth.value.skills.find(s => s.type === mappedType);
    return skill?.level || 0;
  }

  loadFromLocal();

  return {
    growth,
    availableSkillPoints,
    unlockedAchievements,
    addExp,
    upgradeSkill,
    updateStats,
    getSkillEffects,
    getAllSkillEffects,
    getSkillLevel
  };
});
