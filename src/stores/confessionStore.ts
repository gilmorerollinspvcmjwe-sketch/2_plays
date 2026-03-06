import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useGameStore } from './gameStore';
import { contentGenerationEngine, type GeneratedConfession, type ContentAssociation } from '@/engine/contentGenerationEngine';
import type { Character } from '@/types/character';

/**
 * 告白数据接口
 * 包含角色关联字段，用于展示告白与角色的关系
 */
export interface Confession {
  id: string;
  characterId: string;
  characterName: string;
  content: string;
  authorId: string;
  authorName: string;
  likes: number;
  heat: number;
  createdAt: string;
  isHot: boolean;
  isLiked?: boolean;
  // 关联信息
  association?: ContentAssociation;
  // 告白类型
  type?: string;
  // 情感倾向
  sentiment?: 'positive' | 'neutral' | 'negative';
}

/**
 * 告白热度计算配置
 */
const HEAT_CONFIG = {
  // 热门阈值
  hotThreshold: 100,
  // 点赞权重
  likeWeight: 2,
  // 时间衰减系数（小时）
  timeDecayHours: 24,
  // 基础热度
  baseHeat: 10,
};

/**
 * 角色人气阈值配置
 */
const POPULARITY_CONFIG = {
  // 告白生成所需的人气阈值
  confessionThreshold: 20,
  // 高人气阈值
  highPopularityThreshold: 50,
  // 人气权重
  popularityWeight: 1.5,
};

/**
 * 告白作者名称池
 */
const AUTHOR_NAMES = [
  '小可爱', '迷妹一号', '乙女玩家', '恋爱脑', '追星少女',
  '游戏达人', '剧情党', '氪金大佬', '白嫖党', '佛系玩家',
  '夜猫子', '早起的鸟', '奶茶控', '猫奴', '狗派',
  '二次元', '现充', '社恐', '话痨', '潜水员'
];

/**
 * 告白 Store
 * 管理告白墙的生成、存储和展示
 */
export const useConfessionStore = defineStore('confession', () => {
  // ==================== State ====================
  const confessions = ref<Confession[]>([]);
  const isGenerating = ref(false);
  const lastGenerationTime = ref<number>(0);

  // ==================== Getters ====================
  
  /**
   * 热门告白（按热度排序）
   */
  const hotConfessions = computed(() => {
    return confessions.value
      .filter(c => c.heat >= HEAT_CONFIG.hotThreshold || c.isHot)
      .sort((a, b) => b.heat - a.heat)
      .slice(0, 10);
  });

  /**
   * 最近告白（按时间排序）
   */
  const recentConfessions = computed(() => {
    return [...confessions.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  /**
   * 是否有告白
   */
  const hasConfessions = computed(() => confessions.value.length > 0);

  /**
   * 告白总数
   */
  const totalCount = computed(() => confessions.value.length);

  /**
   * 按角色ID获取告白
   */
  const getConfessionsByCharacter = (characterId: string) => {
    return confessions.value.filter(c => c.characterId === characterId);
  };

  /**
   * 按角色人气排序的告白
   */
  const getConfessionsByPopularity = computed(() => {
    return [...confessions.value].sort((a, b) => b.heat - a.heat);
  });

  // ==================== Actions ====================

  /**
   * 计算告白热度
   * 基于点赞数、时间和基础热度
   */
  function calculateHeat(likes: number, createdAt: string): number {
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    
    // 时间衰减计算
    const timeDecay = Math.max(0.3, 1 - hoursDiff / HEAT_CONFIG.timeDecayHours);
    
    // 热度 = 基础热度 + 点赞数 * 权重 * 时间衰减
    const heat = Math.floor(
      HEAT_CONFIG.baseHeat + likes * HEAT_CONFIG.likeWeight * timeDecay
    );
    
    return heat;
  }

  /**
   * 更新告白热度
   */
  function updateHeat(confession: Confession): void {
    confession.heat = calculateHeat(confession.likes, confession.createdAt);
    confession.isHot = confession.heat >= HEAT_CONFIG.hotThreshold;
  }

  /**
   * 将 GeneratedConfession 转换为 Confession
   */
  function convertGeneratedConfession(generated: GeneratedConfession): Confession {
    const createdAt = new Date(generated.timestamp).toISOString();
    const heat = calculateHeat(generated.likes, createdAt);
    
    return {
      id: generated.id,
      characterId: generated.association?.characterId || 'unknown',
      characterName: generated.association?.characterName || '未知角色',
      content: generated.content,
      authorId: generated.playerId,
      authorName: getRandomAuthorName(),
      likes: generated.likes,
      heat: heat,
      createdAt: createdAt,
      isHot: heat >= HEAT_CONFIG.hotThreshold,
      isLiked: false,
      association: generated.association,
      type: generated.type,
      sentiment: generated.sentiment,
    };
  }

  /**
   * 获取随机作者名
   */
  function getRandomAuthorName(): string {
    return AUTHOR_NAMES[Math.floor(Math.random() * AUTHOR_NAMES.length)];
  }

  /**
   * 检查角色是否满足告白生成条件
   * 基于角色人气阈值
   */
  function canGenerateConfession(character: Character): boolean {
    const pop = typeof (character.popularity as { popularity?: number } | number) === 'object'
      ? (character.popularity as { popularity?: number })?.popularity
      : (character.popularity as number);
    return (pop ?? 0) >= POPULARITY_CONFIG.confessionThreshold;
  }

  /**
   * 计算告白生成数量
   * 基于角色人气值
   */
  function calculateConfessionCount(character: Character): number {
    if (!canGenerateConfession(character)) return 0;
    
    // 基础数量 + 人气加成
    const baseCount = 1;
    const pop = typeof (character.popularity as { popularity?: number } | number) === 'object'
      ? (character.popularity as { popularity?: number })?.popularity
      : (character.popularity as number);
    const popularityBonus = Math.floor(
      ((pop ?? 0) - POPULARITY_CONFIG.confessionThreshold) / 10
    );
    
    return Math.min(baseCount + popularityBonus, 5); // 最多5条
  }

  /**
   * 生成告白
   * 供模拟系统调用，基于角色人气阈值生成告白
   */
  function generateConfessions(
    generatedConfessions: GeneratedConfession[]
  ): Confession[] {
    const newConfessions: Confession[] = [];
    
    for (const generated of generatedConfessions) {
      // 检查是否已存在
      const exists = confessions.value.some(c => c.id === generated.id);
      if (exists) continue;
      
      const confession = convertGeneratedConfession(generated);
      confessions.value.unshift(confession);
      newConfessions.push(confession);
    }
    
    // 限制告白总数，防止内存溢出
    const MAX_CONFESSIONS = 500;
    if (confessions.value.length > MAX_CONFESSIONS) {
      confessions.value = confessions.value.slice(0, MAX_CONFESSIONS);
    }
    
    lastGenerationTime.value = Date.now();
    saveToLocal();
    
    return newConfessions;
  }

  /**
   * 基于角色列表生成告白
   * 根据角色人气阈值决定是否生成
   */
  function generateConfessionsByCharacters(
    characters: Character[],
    context: {
      projectId: string;
      projectName: string;
      daySinceLaunch: number;
    }
  ): number {
    let generatedCount = 0;
    
    for (const character of characters) {
      // 检查人气阈值
      if (!canGenerateConfession(character)) continue;
      
      // 计算应生成的告白数量
      const count = calculateConfessionCount(character);
      
      for (let i = 0; i < count; i++) {
        // 使用内容生成引擎生成告白
        const association: ContentAssociation = {
          projectId: context.projectId,
          projectName: context.projectName,
          characterId: character.id,
          characterName: character.name,
        };
        
        const confession = createMockConfession(character, association);
        confessions.value.unshift(confession);
        generatedCount++;
      }
    }
    
    if (generatedCount > 0) {
      saveToLocal();
    }
    
    return generatedCount;
  }

  /**
   * 创建模拟告白
   */
  function createMockConfession(
    character: Character,
    association: ContentAssociation
  ): Confession {
    const likes = Math.floor(Math.random() * 100) + 5;
    const createdAt = new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const heat = calculateHeat(likes, createdAt);
    
    return {
      id: `confession_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      characterId: character.id,
      characterName: character.name,
      content: generateConfessionContent(character),
      authorId: `author_${Math.random().toString(36).substr(2, 9)}`,
      authorName: getRandomAuthorName(),
      likes,
      heat,
      createdAt,
      isHot: heat >= HEAT_CONFIG.hotThreshold,
      isLiked: false,
      association,
      type: '角色告白',
      sentiment: 'positive',
    };
  }

  /**
   * 生成告白内容
   * 基于角色属性生成个性化内容
   */
  function generateConfessionContent(character: Character): string {
    const templates = [
      `{characterName}真的太棒了，完全是我的理想型！`,
      `每次见到{characterName}都会心跳加速，这就是恋爱的感觉吗？`,
      `{characterName}的每一个表情都让我着迷，无法自拔！`,
      `为了{characterName}，我愿意做任何事情！`,
      `{characterName}是我玩这个游戏最大的动力！`,
      `世界上怎么会有{characterName}这么完美的人存在！`,
      `每天都想见到{characterName}，已经离不开他了。`,
      `{characterName}的笑容是我每天最期待的事情。`,
      `被{characterName}深深吸引，完全沦陷了。`,
      `{characterName}就是我心中的白月光，无可替代。`,
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace(/{characterName}/g, character.name);
  }

  /**
   * 点赞告白
   */
  async function likeConfession(
    confessionId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    const confession = confessions.value.find(c => c.id === confessionId);
    
    if (!confession) {
      return { success: false, message: '告白不存在' };
    }

    const gameStore = useGameStore();

    if (confession.isLiked) {
      confession.likes = Math.max(0, confession.likes - 1);
      confession.isLiked = false;
    } else {
      confession.likes++;
      confession.isLiked = true;
    }
    
    // 重新计算热度
    updateHeat(confession);
    
    // 更新角色人气
    if (confession.characterId) {
      gameStore.updateCharacterPopularity(confession.characterId, {
        popularity: confession.isLiked ? 0.5 : -0.3,
        discussionHeat: confession.isLiked ? 2 : -1,
      });
    }

    saveToLocal();
    return { success: true, message: confession.isLiked ? '点赞成功' : '取消点赞' };
  }

  /**
   * 删除告白
   */
  function deleteConfession(confessionId: string): boolean {
    const index = confessions.value.findIndex(c => c.id === confessionId);
    if (index === -1) return false;
    
    confessions.value.splice(index, 1);
    saveToLocal();
    return true;
  }

  /**
   * 清空所有告白
   */
  function clearAllConfessions(): void {
    confessions.value = [];
    saveToLocal();
  }

  /**
   * 保存到本地存储
   */
  function saveToLocal(): void {
    try {
      localStorage.setItem('confession_data', JSON.stringify({
        confessions: confessions.value,
        lastGenerationTime: lastGenerationTime.value,
      }));
    } catch (e) {
      console.error('保存告白数据失败:', e);
    }
  }

  /**
   * 从本地存储加载
   */
  function loadFromLocal(): void {
    try {
      const saved = localStorage.getItem('confession_data');
      if (saved) {
        const data = JSON.parse(saved);
        confessions.value = data.confessions || [];
        lastGenerationTime.value = data.lastGenerationTime || 0;
      }
    } catch (e) {
      console.error('加载告白数据失败:', e);
    }
  }

  /**
   * 初始化（加载本地数据）
   */
  function init(): void {
    loadFromLocal();
  }

  // 初始化加载
  init();

  // ==================== Return ====================
  return {
    // State
    confessions,
    isGenerating,
    lastGenerationTime,
    // Getters
    hotConfessions,
    recentConfessions,
    hasConfessions,
    totalCount,
    getConfessionsByCharacter,
    getConfessionsByPopularity,
    // Actions
    generateConfessions,
    generateConfessionsByCharacters,
    likeConfession,
    deleteConfession,
    clearAllConfessions,
    calculateHeat,
    canGenerateConfession,
    calculateConfessionCount,
    saveToLocal,
    loadFromLocal,
    init,
  };
});

export default useConfessionStore;
