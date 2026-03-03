/**
 * 创作者成长系统类型定义
 * 设计创作者的长期成长路径和成就感系统
 */

// 创作者等级
export type CreatorLevel = 1 | 2 | 3 | 4 | 5;

// 技能类型
export type SkillType = 'planning' | 'art' | 'operation' | 'market';

// 成就类型
export type AchievementType = 
  | 'first_game'           // 从0到1
  | 'comeback'             // 口碑逆袭
  | 'hit_maker'            // 爆款制造机
  | 'player_friend'        // 玩家之友
  | 'crisis_master'        // 节奏大师
  | 'bond_master'          // 羁绊大师
  | 'rich_creator'         // 富可敌国
  | 'perfectionist';       // 完美主义者

// 创作者等级配置
export interface CreatorLevelConfig {
  level: CreatorLevel;
  name: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  expRequired: number;
  unlocks: string[];
}

export const CREATOR_LEVELS: CreatorLevelConfig[] = [
  {
    level: 1,
    name: '萌新',
    title: '初入乙游界',
    icon: 'user-o',
    color: '#999',
    description: '刚开始接触乙游创作，玩家宽容度高',
    expRequired: 0,
    unlocks: ['基础角色创建', '简单剧情编辑']
  },
  {
    level: 2,
    name: '入门',
    title: '初窥门径',
    icon: 'star-o',
    color: '#52c41a',
    description: '掌握了基本技巧，解锁更多角色类型和剧情模板',
    expRequired: 500,
    unlocks: ['高级角色模板', '剧情分支功能', '约会系统']
  },
  {
    level: 3,
    name: '熟手',
    title: '游刃有余',
    icon: 'medal-o',
    color: '#1890ff',
    description: '可以处理复杂运营情况，应对各种玩家反馈',
    expRequired: 1500,
    unlocks: ['角色羁绊系统', '玩家社群分析', 'A/B测试']
  },
  {
    level: 4,
    name: '高手',
    title: '业界精英',
    icon: 'trophy-o',
    color: '#722ed1',
    description: '能打造爆款，引领潮流，处理危机游刃有余',
    expRequired: 3000,
    unlocks: ['危机处理系统', '市场预测', '高级运营工具']
  },
  {
    level: 5,
    name: '大神',
    title: '传奇创作者',
    icon: 'crown-o',
    color: '#FFD700',
    description: '业界传奇，作品成为经典，影响一代玩家',
    expRequired: 6000,
    unlocks: ['全部功能解锁', '传奇成就', '专属称号']
  }
];

// 技能配置
export interface SkillConfig {
  type: SkillType;
  name: string;
  icon: string;
  color: string;
  description: string;
  maxLevel: number;
}

export const SKILL_CONFIGS: SkillConfig[] = [
  {
    type: 'planning',
    name: '策划能力',
    icon: 'edit',
    color: '#1890ff',
    description: '提升剧情设计和角色塑造能力',
    maxLevel: 10
  },
  {
    type: 'art',
    name: '美术品味',
    icon: 'photo-o',
    color: '#FF69B4',
    description: '提升画风选择和立绘质量把控',
    maxLevel: 10
  },
  {
    type: 'operation',
    name: '运营技巧',
    icon: 'chart-trending-o',
    color: '#52c41a',
    description: '提升活动策划和危机处理能力',
    maxLevel: 10
  },
  {
    type: 'market',
    name: '市场洞察',
    icon: 'eye-o',
    color: '#faad14',
    description: '提升趋势把握和竞品分析能力',
    maxLevel: 10
  }
];

// 技能效果
export interface SkillEffect {
  skillType: SkillType;
  level: number;
  effects: {
    type: string;
    value: number;
    description: string;
  }[];
}

export const SKILL_EFFECTS: SkillEffect[] = [
  // 策划能力
  {
    skillType: 'planning',
    level: 1,
    effects: [{ type: 'plot_quality', value: 5, description: '剧情质量+5%' }]
  },
  {
    skillType: 'planning',
    level: 5,
    effects: [
      { type: 'plot_quality', value: 15, description: '剧情质量+15%' },
      { type: 'character_depth', value: 10, description: '角色深度+10%' }
    ]
  },
  {
    skillType: 'planning',
    level: 10,
    effects: [
      { type: 'plot_quality', value: 30, description: '剧情质量+30%' },
      { type: 'character_depth', value: 25, description: '角色深度+25%' },
      { type: 'plot_branch', value: 20, description: '分支丰富度+20%' }
    ]
  },
  // 美术品味
  {
    skillType: 'art',
    level: 1,
    effects: [{ type: 'visual_quality', value: 5, description: '美术质量+5%' }]
  },
  {
    skillType: 'art',
    level: 5,
    effects: [
      { type: 'visual_quality', value: 15, description: '美术质量+15%' },
      { type: 'character_attractiveness', value: 10, description: '角色吸引力+10%' }
    ]
  },
  {
    skillType: 'art',
    level: 10,
    effects: [
      { type: 'visual_quality', value: 30, description: '美术质量+30%' },
      { type: 'character_attractiveness', value: 25, description: '角色吸引力+25%' },
      { type: 'art_style_bonus', value: 20, description: '画风加成+20%' }
    ]
  },
  // 运营技巧
  {
    skillType: 'operation',
    level: 1,
    effects: [{ type: 'event_effectiveness', value: 5, description: '活动效果+5%' }]
  },
  {
    skillType: 'operation',
    level: 5,
    effects: [
      { type: 'event_effectiveness', value: 15, description: '活动效果+15%' },
      { type: 'crisis_handling', value: 10, description: '危机处理+10%' }
    ]
  },
  {
    skillType: 'operation',
    level: 10,
    effects: [
      { type: 'event_effectiveness', value: 30, description: '活动效果+30%' },
      { type: 'crisis_handling', value: 25, description: '危机处理+25%' },
      { type: 'player_retention', value: 15, description: '玩家留存+15%' }
    ]
  },
  // 市场洞察
  {
    skillType: 'market',
    level: 1,
    effects: [{ type: 'market_prediction', value: 5, description: '市场预测+5%' }]
  },
  {
    skillType: 'market',
    level: 5,
    effects: [
      { type: 'market_prediction', value: 15, description: '市场预测+15%' },
      { type: 'trend_catching', value: 10, description: '趋势把握+10%' }
    ]
  },
  {
    skillType: 'market',
    level: 10,
    effects: [
      { type: 'market_prediction', value: 30, description: '市场预测+30%' },
      { type: 'trend_catching', value: 25, description: '趋势把握+25%' },
      { type: 'revenue_boost', value: 20, description: '收入提升+20%' }
    ]
  }
];

// 成就配置
export interface AchievementConfig {
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: {
    type: string;
    value: number;
    description: string;
  };
  reward: {
    exp: number;
    title?: string;
    unlock?: string;
  };
}

export const ACHIEVEMENT_CONFIGS: AchievementConfig[] = [
  {
    type: 'first_game',
    name: '从0到1',
    description: '发布你的第一款乙女游戏',
    icon: 'flag-o',
    color: '#52c41a',
    requirement: {
      type: 'game_published',
      value: 1,
      description: '发布1款游戏'
    },
    reward: {
      exp: 100,
      title: '新晋创作者'
    }
  },
  {
    type: 'comeback',
    name: '口碑逆袭',
    description: '将一款评分低于4分的游戏提升到8分以上',
    icon: 'chart-trending-o',
    color: '#1890ff',
    requirement: {
      type: 'rating_comeback',
      value: 1,
      description: '完成1次口碑逆袭'
    },
    reward: {
      exp: 500,
      title: '逆风翻盘者'
    }
  },
  {
    type: 'hit_maker',
    name: '爆款制造机',
    description: '连续3款游戏评分达到S级',
    icon: 'fire-o',
    color: '#ff4d4f',
    requirement: {
      type: 'consecutive_s_rating',
      value: 3,
      description: '连续3款S级游戏'
    },
    reward: {
      exp: 1000,
      title: '爆款之王'
    }
  },
  {
    type: 'player_friend',
    name: '玩家之友',
    description: '获得"良心官方"称号100次',
    icon: 'smile-o',
    color: '#FF69B4',
    requirement: {
      type: 'good_official_count',
      value: 100,
      description: '获得100次良心官方称号'
    },
    reward: {
      exp: 800,
      title: '玩家最爱的人'
    }
  },
  {
    type: 'crisis_master',
    name: '节奏大师',
    description: '成功化解10次重大危机',
    icon: 'shield-o',
    color: '#722ed1',
    requirement: {
      type: 'crisis_resolved',
      value: 10,
      description: '化解10次危机'
    },
    reward: {
      exp: 600,
      title: '危机处理专家'
    }
  },
  {
    type: 'bond_master',
    name: '羁绊大师',
    description: '与5个角色达到羁绊等级5',
    icon: 'like-o',
    color: '#eb2f96',
    requirement: {
      type: 'max_bond_characters',
      value: 5,
      description: '5个角色达到满羁绊'
    },
    reward: {
      exp: 700,
      title: '灵魂伴侣'
    }
  },
  {
    type: 'rich_creator',
    name: '富可敌国',
    description: '累计收入达到100万金币',
    icon: 'gold-coin-o',
    color: '#FFD700',
    requirement: {
      type: 'total_revenue',
      value: 1000000,
      description: '累计收入100万'
    },
    reward: {
      exp: 900,
      title: '商业奇才'
    }
  },
  {
    type: 'perfectionist',
    name: '完美主义者',
    description: '打造一款全属性满分的完美游戏',
    icon: 'gem-o',
    color: '#13c2c2',
    requirement: {
      type: 'perfect_game',
      value: 1,
      description: '打造1款完美游戏'
    },
    reward: {
      exp: 1500,
      title: '完美创作者',
      unlock: '完美模式'
    }
  }
];

// 创作者数据
export interface CreatorGrowth {
  level: CreatorLevel;
  experience: number;
  totalExperience: number;
  skills: {
    type: SkillType;
    level: number;
    points: number;
  }[];
  achievements: {
    type: AchievementType;
    unlockedAt: string;
    progress: number;
  }[];
  stats: {
    gamesCreated: number;
    totalRevenue: number;
    totalPlayers: number;
    crisesResolved: number;
    maxBondCount: number;
    goodOfficialCount: number;
    comebackCount: number;
    consecutiveSRating: number;
  };
}

// 经验获取方式
export interface ExpSource {
  type: string;
  name: string;
  description: string;
  baseExp: number;
  cooldown?: number;
}

export const EXP_SOURCES: ExpSource[] = [
  { type: 'create_character', name: '创建角色', description: '每创建一个角色', baseExp: 50 },
  { type: 'publish_game', name: '发布游戏', description: '每发布一款游戏', baseExp: 100 },
  { type: 'update_game', name: '更新游戏', description: '每次更新游戏内容', baseExp: 30 },
  { type: 'bond_level_up', name: '羁绊升级', description: '角色羁绊等级提升', baseExp: 20 },
  { type: 'crisis_resolved', name: '化解危机', description: '成功处理危机', baseExp: 80 },
  { type: 'good_rating', name: '获得好评', description: '游戏获得高评分', baseExp: 40 },
  { type: 'daily_login', name: '每日登录', description: '每日登录游戏', baseExp: 10, cooldown: 24 },
  { type: 'complete_task', name: '完成任务', description: '完成系统任务', baseExp: 25 }
];

// 初始化创作者成长数据
export function initCreatorGrowth(): CreatorGrowth {
  return {
    level: 1,
    experience: 0,
    totalExperience: 0,
    skills: SKILL_CONFIGS.map(config => ({
      type: config.type,
      level: 0,
      points: 0
    })),
    achievements: [],
    stats: {
      gamesCreated: 0,
      totalRevenue: 0,
      totalPlayers: 0,
      crisesResolved: 0,
      maxBondCount: 0,
      goodOfficialCount: 0,
      comebackCount: 0,
      consecutiveSRating: 0
    }
  };
}

// 计算等级
export function calculateCreatorLevel(totalExp: number): CreatorLevel {
  for (let i = CREATOR_LEVELS.length - 1; i >= 0; i--) {
    if (totalExp >= CREATOR_LEVELS[i].expRequired) {
      return CREATOR_LEVELS[i].level;
    }
  }
  return 1;
}

// 获取等级进度
export function getLevelProgress(growth: CreatorGrowth): number {
  const currentLevel = growth.level;
  if (currentLevel >= 5) return 100;
  
  const currentLevelExp = CREATOR_LEVELS[currentLevel - 1].expRequired;
  const nextLevelExp = CREATOR_LEVELS[currentLevel].expRequired;
  const progress = ((growth.totalExperience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
  
  return Math.min(100, Math.max(0, progress));
}

// 添加经验
export function addExperience(
  growth: CreatorGrowth,
  amount: number,
  source: string
): { levelUp: boolean; newLevel: CreatorLevel; messages: string[] } {
  const oldLevel = growth.level;
  growth.totalExperience += amount;
  growth.experience += amount;
  
  const newLevel = calculateCreatorLevel(growth.totalExperience);
  growth.level = newLevel;
  
  const levelUp = newLevel > oldLevel;
  const messages: string[] = [];
  
  if (levelUp) {
    const levelConfig = CREATOR_LEVELS[newLevel - 1];
    messages.push(`恭喜！创作者等级提升至 ${newLevel} 级「${levelConfig.name}」！`);
    messages.push(`解锁：${levelConfig.unlocks.join('、')}`);
    messages.push(`获得称号：${levelConfig.title}`);
  }
  
  return { levelUp, newLevel, messages };
}

// 升级技能
export function upgradeSkill(
  growth: CreatorGrowth,
  skillType: SkillType
): { success: boolean; message: string; newLevel: number } {
  const skill = growth.skills.find(s => s.type === skillType);
  if (!skill) {
    return { success: false, message: '技能不存在', newLevel: 0 };
  }
  
  const config = SKILL_CONFIGS.find(c => c.type === skillType);
  if (!config) {
    return { success: false, message: '技能配置不存在', newLevel: 0 };
  }
  
  if (skill.level >= config.maxLevel) {
    return { success: false, message: '技能已达到最高等级', newLevel: skill.level };
  }
  
  // 检查是否有足够的技能点（这里简化处理，实际应该有一个技能点系统）
  skill.level += 1;
  skill.points += 1;
  
  return {
    success: true,
    message: `${config.name}提升至${skill.level}级！`,
    newLevel: skill.level
  };
}

// 检查成就
export function checkAchievements(growth: CreatorGrowth): AchievementType[] {
  const unlocked: AchievementType[] = [];
  
  for (const config of ACHIEVEMENT_CONFIGS) {
    // 检查是否已解锁
    const alreadyUnlocked = growth.achievements.find(a => a.type === config.type);
    if (alreadyUnlocked) continue;
    
    let progress = 0;
    
    switch (config.type) {
      case 'first_game':
        progress = growth.stats.gamesCreated;
        break;
      case 'comeback':
        progress = growth.stats.comebackCount;
        break;
      case 'hit_maker':
        progress = growth.stats.consecutiveSRating;
        break;
      case 'player_friend':
        progress = growth.stats.goodOfficialCount;
        break;
      case 'crisis_master':
        progress = growth.stats.crisesResolved;
        break;
      case 'bond_master':
        progress = growth.stats.maxBondCount;
        break;
      case 'rich_creator':
        progress = growth.stats.totalRevenue;
        break;
      case 'perfectionist':
        // 特殊检查，需要单独逻辑
        progress = 0;
        break;
    }
    
    if (progress >= config.requirement.value) {
      unlocked.push(config.type);
    }
  }
  
  return unlocked;
}

// 解锁成就
export function unlockAchievement(
  growth: CreatorGrowth,
  type: AchievementType
): { success: boolean; message: string; reward: AchievementConfig['reward'] | null } {
  const config = ACHIEVEMENT_CONFIGS.find(c => c.type === type);
  if (!config) {
    return { success: false, message: '成就配置不存在', reward: null };
  }
  
  const alreadyUnlocked = growth.achievements.find(a => a.type === type);
  if (alreadyUnlocked) {
    return { success: false, message: '成就已解锁', reward: null };
  }
  
  growth.achievements.push({
    type,
    unlockedAt: new Date().toISOString(),
    progress: config.requirement.value
  });
  
  // 添加经验奖励
  addExperience(growth, config.reward.exp, 'achievement_unlock');
  
  return {
    success: true,
    message: `解锁成就「${config.name}」！获得称号：${config.reward.title}`,
    reward: config.reward
  };
}

// 获取技能效果
export function getSkillEffects(growth: CreatorGrowth, skillType: SkillType): SkillEffect['effects'] {
  const skill = growth.skills.find(s => s.type === skillType);
  if (!skill || skill.level === 0) return [];
  
  // 找到当前等级及以下等级的所有效果
  const effects: SkillEffect['effects'] = [];
  for (let i = 1; i <= skill.level; i++) {
    const levelEffect = SKILL_EFFECTS.find(
      e => e.skillType === skillType && e.level === i
    );
    if (levelEffect) {
      effects.push(...levelEffect.effects);
    }
  }
  
  return effects;
}

// 获取所有技能效果
export function getAllSkillEffects(growth: CreatorGrowth): Map<string, number> {
  const allEffects = new Map<string, number>();
  
  for (const skill of growth.skills) {
    const effects = getSkillEffects(growth, skill.type);
    for (const effect of effects) {
      const current = allEffects.get(effect.type) || 0;
      allEffects.set(effect.type, current + effect.value);
    }
  }
  
  return allEffects;
}
