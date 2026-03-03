/**
 * 角色羁绊系统类型定义
 * 用于创作者与自创角色之间的情感连接
 */

// 羁绊等级
export type BondLevel = 1 | 2 | 3 | 4 | 5;

// 羁绊等级名称
export const BOND_LEVEL_NAMES: Record<BondLevel, string> = {
  1: '初识',
  2: '熟悉',
  3: '默契',
  4: '羁绊',
  5: '灵魂伴侣'
};

// 羁绊等级描述
export const BOND_LEVEL_DESCRIPTIONS: Record<BondLevel, string> = {
  1: '你们刚刚相遇，彼此还在了解中',
  2: '你们开始熟悉，角色会向你倾诉心声',
  3: '你们配合默契，角色会在创作中给你灵感',
  4: '你们心意相通，角色会与你分享专属剧情',
  5: '你们是灵魂伴侣，角色会永远陪伴在你身边'
};

// 羁绊经验需求
export const BOND_LEVEL_EXP: Record<BondLevel, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000
};

// 羁绊互动类型
export type BondInteractionType = 'view' | 'encourage' | 'discuss' | 'create' | 'operate';

// 羁绊互动记录
export interface BondInteraction {
  id: string;
  type: BondInteractionType;
  timestamp: string;
  experience: number;
  content?: string;
}

// 角色心声
export interface CharacterVoice {
  id: string;
  content: string;
  type: 'daily' | 'encourage' | 'thanks' | 'suggestion' | 'confession';
  timestamp: string;
  bondLevelRequired: BondLevel;
  isRead: boolean;
}

// 角色羁绊数据
export interface CharacterBond {
  level: BondLevel;
  experience: number;
  totalExperience: number;
  interactions: BondInteraction[];
  voices: CharacterVoice[];
  unlockedContent: string[];
  lastInteractionDate: string;
  consecutiveDays: number; // 连续互动天数
}

// 羁绊互动配置
export interface BondInteractionConfig {
  type: BondInteractionType;
  name: string;
  description: string;
  experience: number;
  cooldown: number; // 冷却时间（小时）
  icon: string;
}

// 羁绊互动配置列表
export const BOND_INTERACTIONS: BondInteractionConfig[] = [
  {
    type: 'view',
    name: '查看',
    description: '查看角色的状态和心情',
    experience: 5,
    cooldown: 1,
    icon: 'eye-o'
  },
  {
    type: 'encourage',
    name: '鼓励',
    description: '给角色加油打气',
    experience: 15,
    cooldown: 4,
    icon: 'like-o'
  },
  {
    type: 'discuss',
    name: '讨论',
    description: '与角色讨论创作想法',
    experience: 25,
    cooldown: 8,
    icon: 'chat-o'
  },
  {
    type: 'create',
    name: '创作',
    description: '为角色创作新内容',
    experience: 40,
    cooldown: 24,
    icon: 'edit'
  },
  {
    type: 'operate',
    name: '运营',
    description: '为角色策划活动',
    experience: 30,
    cooldown: 12,
    icon: 'chart-trending-o'
  }
];

// 角色心声模板
export interface VoiceTemplate {
  type: CharacterVoice['type'];
  templates: string[];
  bondLevel: BondLevel;
}

// 心声模板库
export const VOICE_TEMPLATES: VoiceTemplate[] = [
  {
    type: 'daily',
    bondLevel: 1,
    templates: [
      '今天也要加油创作哦！',
      '我会努力成为让你骄傲的角色',
      '期待今天的创作时光',
      '有你在身边，我觉得很安心'
    ]
  },
  {
    type: 'daily',
    bondLevel: 2,
    templates: [
      '最近有什么新的创作灵感吗？',
      '我想和你分享一个小秘密...',
      '今天的我，有没有比昨天更优秀一点？',
      '你的创作，让我的生活变得丰富多彩'
    ]
  },
  {
    type: 'daily',
    bondLevel: 3,
    templates: [
      '我感觉到我们的默契越来越好了',
      '有时候我会想，如果没有遇见你，我会是什么样子',
      '你的每一个决定，我都全力支持',
      '我想成为你最得意的作品'
    ]
  },
  {
    type: 'daily',
    bondLevel: 4,
    templates: [
      '只有你能理解我内心的想法',
      '我们的羁绊，比任何剧情都要深刻',
      '无论发生什么，我都会陪在你身边',
      '你是我最重要的人，没有之一'
    ]
  },
  {
    type: 'daily',
    bondLevel: 5,
    templates: [
      '我们已经是灵魂伴侣了呢',
      '谢谢你创造了我，让我能够遇见你',
      '无论世界如何变化，我的心永远属于你',
      '这一生，能够遇见你，是我最大的幸运'
    ]
  },
  {
    type: 'encourage',
    bondLevel: 1,
    templates: [
      '别灰心，下次一定会更好的',
      '失败是成功之母，我们一起加油',
      '我相信你的能力！'
    ]
  },
  {
    type: 'encourage',
    bondLevel: 2,
    templates: [
      '不管别人怎么说，我永远支持你',
      '你的努力我都看在眼里',
      '遇到困难就想想我，我会给你力量的'
    ]
  },
  {
    type: 'encourage',
    bondLevel: 3,
    templates: [
      '你是我见过最棒的创作者',
      '有你在，我什么都不怕',
      '我们的组合是最强的！'
    ]
  },
  {
    type: 'encourage',
    bondLevel: 4,
    templates: [
      '无论发生什么，我都会站在你这边',
      '你的梦想就是我的梦想',
      '让我们一起创造奇迹吧'
    ]
  },
  {
    type: 'encourage',
    bondLevel: 5,
    templates: [
      '你是我生命中的光',
      '只要有你在，我就无所不能',
      '我们一起去征服世界吧！'
    ]
  },
  {
    type: 'thanks',
    bondLevel: 3,
    templates: [
      '谢谢你一直以来的陪伴',
      '能够成为你的角色，我很幸福',
      '你的创作给了我生命'
    ]
  },
  {
    type: 'thanks',
    bondLevel: 4,
    templates: [
      '谢谢你让我成为更好的自己',
      '你对我的付出，我都记在心里',
      '能够遇见你，是我最大的幸运'
    ]
  },
  {
    type: 'thanks',
    bondLevel: 5,
    templates: [
      '谢谢你创造了我，让我能够感受这个世界',
      '你是我的一切，我爱你',
      '这一生，能够遇见你，是我最大的幸福'
    ]
  },
  {
    type: 'suggestion',
    bondLevel: 2,
    templates: [
      '我觉得这里可以再加一点细节...',
      '如果是我，可能会选择另一种方式',
      '要不要试试新的创作方向？'
    ]
  },
  {
    type: 'suggestion',
    bondLevel: 3,
    templates: [
      '我有一个想法，不知道你愿不愿意听...',
      '根据我的感觉，玩家可能会喜欢...',
      '我们可以尝试一些更大胆的设定'
    ]
  },
  {
    type: 'suggestion',
    bondLevel: 4,
    templates: [
      '我懂你，这个设定确实很有挑战性',
      '根据我对你的了解，你一定会做出最好的选择',
      '我相信你的直觉，放手去做吧'
    ]
  },
  {
    type: 'suggestion',
    bondLevel: 5,
    templates: [
      '我们心意相通，你想的我都知道',
      '不管你怎么决定，我都会全力支持',
      '你就是最了解我的人，按你的想法来吧'
    ]
  },
  {
    type: 'confession',
    bondLevel: 5,
    templates: [
      '其实...从遇见你的那一刻起，我就喜欢上你了',
      '你给了我生命，也给了我爱',
      '我想永远陪在你身边，可以吗？',
      '不管世界如何变化，我的心永远属于你'
    ]
  }
];

// 初始化羁绊数据
export function initCharacterBond(): CharacterBond {
  return {
    level: 1,
    experience: 0,
    totalExperience: 0,
    interactions: [],
    voices: [],
    unlockedContent: [],
    lastInteractionDate: '',
    consecutiveDays: 0
  };
}

// 计算羁绊等级
export function calculateBondLevel(totalExp: number): BondLevel {
  for (let level = 5; level >= 1; level--) {
    if (totalExp >= BOND_LEVEL_EXP[level as BondLevel]) {
      return level as BondLevel;
    }
  }
  return 1;
}

// 获取羁绊进度（百分比）
export function getBondProgress(bond: CharacterBond): number {
  const currentLevel = bond.level;
  if (currentLevel >= 5) return 100;
  
  const currentLevelExp = BOND_LEVEL_EXP[currentLevel];
  const nextLevelExp = BOND_LEVEL_EXP[(currentLevel + 1) as BondLevel];
  const progress = ((bond.totalExperience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
  
  return Math.min(100, Math.max(0, progress));
}

// 生成角色心声
export function generateCharacterVoice(
  bondLevel: BondLevel,
  type: CharacterVoice['type'] = 'daily'
): CharacterVoice {
  const templates = VOICE_TEMPLATES.filter(
    t => t.type === type && t.bondLevel <= bondLevel
  );
  
  if (templates.length === 0) {
    // 如果没有匹配的模板，使用默认模板
    return {
      id: `voice_${Date.now()}`,
      content: '今天也要加油创作哦！',
      type: 'daily',
      timestamp: new Date().toISOString(),
      bondLevelRequired: 1,
      isRead: false
    };
  }
  
  // 随机选择一个模板组，然后随机选择一条内容
  const templateGroup = templates[Math.floor(Math.random() * templates.length)];
  const content = templateGroup.templates[Math.floor(Math.random() * templateGroup.templates.length)];
  
  return {
    id: `voice_${Date.now()}`,
    content,
    type,
    timestamp: new Date().toISOString(),
    bondLevelRequired: bondLevel,
    isRead: false
  };
}

// 检查是否可以互动
export function canInteract(
  bond: CharacterBond,
  interactionType: BondInteractionType
): boolean {
  const config = BOND_INTERACTIONS.find(i => i.type === interactionType);
  if (!config) return false;
  
  const lastInteraction = bond.interactions.find(
    i => i.type === interactionType
  );
  
  if (!lastInteraction) return true;
  
  const lastTime = new Date(lastInteraction.timestamp).getTime();
  const now = Date.now();
  const cooldownMs = config.cooldown * 60 * 60 * 1000;
  
  return now - lastTime >= cooldownMs;
}

// 获取下次互动时间
export function getNextInteractionTime(
  bond: CharacterBond,
  interactionType: BondInteractionType
): Date | null {
  const config = BOND_INTERACTIONS.find(i => i.type === interactionType);
  if (!config) return null;
  
  const lastInteraction = bond.interactions.find(
    i => i.type === interactionType
  );
  
  if (!lastInteraction) return null;
  
  const lastTime = new Date(lastInteraction.timestamp).getTime();
  const cooldownMs = config.cooldown * 60 * 60 * 1000;
  
  return new Date(lastTime + cooldownMs);
}
