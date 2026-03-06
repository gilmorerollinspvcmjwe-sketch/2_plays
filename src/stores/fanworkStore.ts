import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  contentGenerationEngine,
  type GeneratedFanwork,
  type FanworkContentType,
  type FanworkContentQuality,
  type GenerationContext,
  type CharacterHeat,
  type PlotHeat,
} from '@/engine/contentGenerationEngine';
import { useSimulationStore } from './simulationStore';
import { useGameStore } from './gameStore';
import { useProjectStore } from './projectStore';
import type { Project } from '@/types/project';
import type { Character } from '@/types/character';
import type { Plot } from '@/types';

// ==================== 类型定义 ====================

/** 同人作品类型（UI展示用） */
export type FanworkUIType = '绘画' | '文稿' | '视频' | 'COS';

/** 同人作品质量 */
export type FanworkQuality = '优质' | '普通' | '粗糙';

/** 同人作品接口 */
export interface Fanwork {
  id: string;
  type: FanworkUIType;
  quality: FanworkQuality;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  likes: number;
  views: number;
  createdAt: string;
  isLiked?: boolean;
  // 关联信息
  projectId?: string;
  projectName?: string;
  characterId?: string;
  characterName?: string;
  cpPair?: string[]; // CP角色ID列表
  cpPairNames?: string[]; // CP角色名称列表
  plotId?: string;
  plotTitle?: string;
  tags: string[];
  // 图片URL（绘画/COS类型使用）
  imageUrl?: string;
}

/** 热度阈值配置 */
export const HEAT_THRESHOLD = 30;

/** 类型名称映射 */
export const TYPE_NAMES: Record<FanworkUIType, string> = {
  '绘画': '🎨 绘画',
  '文稿': '📝 文稿',
  '视频': '🎬 视频',
  'COS': '👘 COS',
};

/** 质量样式映射 */
export const QUALITY_STYLES: Record<FanworkQuality, { color: string; badge: string }> = {
  '优质': { color: '#ff6b6b', badge: '精品' },
  '普通': { color: '#4ecdc4', badge: '普通' },
  '粗糙': { color: '#95a5a6', badge: '新手' },
};

// ==================== Store 定义 ====================

export const useFanworkStore = defineStore('fanwork', () => {
  // 引入其他 store
  const simulationStore = useSimulationStore();
  const gameStore = useGameStore();
  const projectStore = useProjectStore();

  // 同人作品列表
  const fanworks = ref<Fanwork[]>([]);

  // 当前筛选类型
  const activeFilter = ref<FanworkUIType | 'all'>('all');

  // 加载状态
  const isLoading = ref(false);

  // ==================== 计算属性 ====================

  /** 筛选后的同人作品 */
  const filteredFanworks = computed(() => {
    if (activeFilter.value === 'all') {
      return fanworks.value;
    }
    return fanworks.value.filter(f => f.type === activeFilter.value);
  });

  /** 按类型分组的同人作品 */
  const fanworksByType = computed(() => {
    const grouped: Record<FanworkUIType, Fanwork[]> = {
      '绘画': [],
      '文稿': [],
      '视频': [],
      'COS': [],
    };
    fanworks.value.forEach(f => {
      grouped[f.type].push(f);
    });
    return grouped;
  });

  /** 是否有同人作品 */
  const hasFanworks = computed(() => fanworks.value.length > 0);

  /** 同人作品总数 */
  const totalCount = computed(() => fanworks.value.length);

  /** 总热度（所有作品点赞数之和） */
  const totalHeat = computed(() => {
    return fanworks.value.reduce((sum, f) => sum + f.likes, 0);
  });

  /** 平均质量分 */
  const averageQuality = computed(() => {
    if (fanworks.value.length === 0) return 0;
    const qualityScores: Record<FanworkQuality, number> = {
      '优质': 3,
      '普通': 2,
      '粗糙': 1,
    };
    const total = fanworks.value.reduce((sum, f) => sum + qualityScores[f.quality], 0);
    return total / fanworks.value.length;
  });

  // ==================== 核心方法 ====================

  /**
   * 生成同人作品
   * 基于项目热度自动触发，供模拟系统调用
   */
  function generateFanworks(context?: GenerationContext): Fanwork[] {
    const newFanworks: Fanwork[] = [];

    // 如果没有传入上下文，尝试构建上下文
    const ctx = context || buildGenerationContext();
    if (!ctx) {
      console.log('[FanworkStore] 无法构建生成上下文，跳过同人生成');
      return newFanworks;
    }

    // 检查热度阈值
    const avgCharacterPopularity =
      ctx.characters.reduce((sum, c) => sum + c.popularity, 0) /
      (ctx.characters.length || 1);
    const avgPlotHeat =
      ctx.plots.reduce((sum, p) => sum + p.heat, 0) / (ctx.plots.length || 1);

    if (avgCharacterPopularity < HEAT_THRESHOLD && avgPlotHeat < HEAT_THRESHOLD) {
      console.log('[FanworkStore] 热度不足，不生成同人作品');
      return newFanworks;
    }

    // 使用内容生成引擎生成同人
    const result = contentGenerationEngine.generate(ctx, []);

    // 转换生成的同人作品为 UI 格式
    result.fanworks.forEach(generatedFanwork => {
      const fanwork = convertGeneratedFanwork(generatedFanwork);
      newFanworks.push(fanwork);
      fanworks.value.push(fanwork);
    });

    // 按时间排序
    fanworks.value.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // 保存到本地
    saveToLocal();

    console.log(`[FanworkStore] 生成了 ${newFanworks.length} 个同人作品`);
    return newFanworks;
  }

  /**
   * 构建生成上下文
   */
  function buildGenerationContext(): GenerationContext | null {
    const operatingProjects = projectStore.operatingProjects;
    if (operatingProjects.length === 0) {
      return null;
    }

    // 使用第一个运营项目作为上下文
    const project = operatingProjects[0];

    // 获取项目关联的角色
    const characters: CharacterHeat[] = project.characters
      .map(id => {
        const char = gameStore.characters.find(c => c.id === id);
        if (!char) return null;
        return {
          characterId: char.id,
          characterName: char.name,
          popularity: char.popularity?.current || 50,
          intimacy: char.intimacy?.current || 50,
          plotPerformance: char.plotPerformance || 50,
          cpHeat: new Map(), // 简化处理
        };
      })
      .filter((c): c is CharacterHeat => c !== null);

    // 获取项目关联的剧情
    const plots: PlotHeat[] = project.plots
      .map(id => {
        const plot = gameStore.plots.find(p => p.id === id);
        if (!plot) return null;
        return {
          plotId: plot.id,
          plotTitle: plot.title,
          heat: plot.heat || 50,
          sentiment: 'positive',
          discussionCount: plot.discussionCount || 0,
        };
      })
      .filter((p): p is PlotHeat => p !== null);

    // 构建项目指标
    const projectData = simulationStore.getProjectOperationData(project.id);
    const metrics = {
      rating: (projectData?.satisfaction || 0.7) * 10,
      downloads: projectData?.activePlayers || 1000,
      revenue: projectData?.totalRevenue || 0,
      activeUsers: projectData?.activePlayers || 1000,
      retention: {
        d1: projectData?.retentionRate || 0.5,
        d7: 0.3,
        d30: 0.15,
      },
    };

    return {
      project: project as Project,
      metrics,
      characters,
      plots,
      activities: [],
      recentEvents: [],
      daySinceLaunch: simulationStore.currentDay,
      playerSatisfaction: projectData?.satisfaction || 0.7,
    };
  }

  /**
   * 转换生成的同人作品为 UI 格式
   */
  function convertGeneratedFanwork(generated: GeneratedFanwork): Fanwork {
    const typeMap: Record<FanworkContentType, FanworkUIType> = {
      '绘画': '绘画',
      '文稿': '文稿',
      '视频': '视频',
      'COS': 'COS',
    };

    const qualityMap: Record<FanworkContentQuality, FanworkQuality> = {
      '优质': '优质',
      '普通': '普通',
      '粗糙': '粗糙',
    };

    // 生成图片URL（绘画/COS类型）
    let imageUrl: string | undefined;
    if (generated.type === '绘画' || generated.type === 'COS') {
      imageUrl = `https://picsum.photos/400/300?random=${generated.id.slice(-5)}`;
    }

    return {
      id: generated.id,
      type: typeMap[generated.type],
      quality: qualityMap[generated.quality],
      title: generated.title,
      content: generated.content,
      authorId: generated.playerId,
      authorName: generateAuthorName(),
      likes: generated.likes,
      views: Math.floor(generated.likes * (1 + Math.random() * 2)),
      createdAt: new Date(generated.timestamp).toISOString(),
      isLiked: false,
      projectId: generated.association.projectId,
      projectName: generated.association.projectName,
      characterId: generated.association.characterId,
      characterName: generated.association.characterName,
      cpPair: generated.association.cpCharacters,
      cpPairNames: generated.relatedCharacters,
      plotId: generated.association.plotId,
      plotTitle: generated.association.plotTitle,
      tags: generated.tags,
      imageUrl,
    };
  }

  /**
   * 生成作者名称
   */
  function generateAuthorName(): string {
    const prefixes = ['画手', '文手', 'UP主', 'Coser', '同人', '产粮', '神仙', '宝藏'];
    const suffixes = ['小A', '大B', '君', '酱', '老师', '太太', '大佬', '萌新'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}${suffix}`;
  }

  /**
   * 计算同人作品热度
   * 基于点赞数、质量、时间衰减
   */
  function calculateFanworkHeat(fanwork: Fanwork): number {
    const qualityMultiplier: Record<FanworkQuality, number> = {
      '优质': 2.0,
      '普通': 1.0,
      '粗糙': 0.5,
    };

    // 时间衰减（7天内不衰减，之后每天衰减5%）
    const daysSinceCreated =
      (Date.now() - new Date(fanwork.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const timeDecay = daysSinceCreated <= 7 ? 1 : Math.max(0.3, 1 - (daysSinceCreated - 7) * 0.05);

    // 热度 = 点赞数 * 质量系数 * 时间衰减
    return Math.floor(fanwork.likes * qualityMultiplier[fanwork.quality] * timeDecay);
  }

  /**
   * 点赞/取消点赞
   */
  async function toggleLike(fanworkId: string): Promise<{ success: boolean; message: string }> {
    const fanwork = fanworks.value.find(f => f.id === fanworkId);
    if (!fanwork) {
      return { success: false, message: '作品不存在' };
    }

    if (fanwork.isLiked) {
      fanwork.likes = Math.max(0, fanwork.likes - 1);
      fanwork.isLiked = false;
    } else {
      fanwork.likes++;
      fanwork.isLiked = true;
    }

    saveToLocal();
    return { success: true, message: fanwork.isLiked ? '点赞成功' : '取消点赞' };
  }

  /**
   * 设置筛选类型
   */
  function setFilter(type: FanworkUIType | 'all') {
    activeFilter.value = type;
  }

  /**
   * 按角色ID获取同人作品
   */
  function getFanworksByCharacter(characterId: string): Fanwork[] {
    return fanworks.value.filter(
      f => f.characterId === characterId || f.cpPair?.includes(characterId)
    );
  }

  /**
   * 按项目ID获取同人作品
   */
  function getFanworksByProject(projectId: string): Fanwork[] {
    return fanworks.value.filter(f => f.projectId === projectId);
  }

  /**
   * 获取热门同人作品
   */
  function getHotFanworks(limit: number = 10): Fanwork[] {
    return [...fanworks.value]
      .map(f => ({ ...f, heat: calculateFanworkHeat(f) }))
      .sort((a, b) => b.heat - a.heat)
      .slice(0, limit);
  }

  /**
   * 从 simulationStore 同步同人作品
   */
  function syncFromSimulation() {
    const simulatedFanworks = simulationStore.recentFanworks;
    if (!simulatedFanworks || simulatedFanworks.length === 0) {
      return;
    }

    const typeMap: Record<string, FanworkUIType> = {
      '绘画': '绘画',
      '文稿': '文稿',
      '视频': '视频',
      'COS': 'COS',
    };

    const qualityMap: Record<string, FanworkQuality> = {
      '优质': '优质',
      '普通': '普通',
      '粗糙': '粗糙',
    };

    simulatedFanworks.forEach(sf => {
      // 检查是否已存在
      if (fanworks.value.some(f => f.id === sf.id)) {
        return;
      }

      const fanwork: Fanwork = {
        id: sf.id,
        type: typeMap[sf.type] || '文稿',
        quality: qualityMap[sf.quality] || '普通',
        title: sf.title,
        content: sf.content,
        authorId: sf.playerId,
        authorName: generateAuthorName(),
        likes: sf.likes,
        views: Math.floor(sf.likes * (1 + Math.random() * 2)),
        createdAt: new Date(sf.timestamp).toISOString(),
        isLiked: false,
        projectId: sf.association.projectId,
        projectName: sf.association.projectName,
        characterId: sf.association.characterId,
        characterName: sf.association.characterName,
        cpPair: sf.association.cpCharacters,
        cpPairNames: sf.relatedCharacters,
        plotId: sf.association.plotId,
        plotTitle: sf.association.plotTitle,
        tags: sf.tags,
        imageUrl:
          sf.type === '绘画' || sf.type === 'COS'
            ? `https://picsum.photos/400/300?random=${sf.id.slice(-5)}`
            : undefined,
      };

      fanworks.value.push(fanwork);
    });

    // 排序并保存
    fanworks.value.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    saveToLocal();
  }

  /**
   * 清空所有同人作品
   */
  function clearFanworks() {
    fanworks.value = [];
    saveToLocal();
  }

  // ==================== 数据持久化 ====================

  function saveToLocal() {
    try {
      localStorage.setItem('fanwork_data', JSON.stringify(fanworks.value));
    } catch (e) {
      console.error('保存同人数据失败:', e);
    }
  }

  function loadFromLocal() {
    try {
      const saved = localStorage.getItem('fanwork_data');
      if (saved) {
        fanworks.value = JSON.parse(saved);
      }
    } catch (e) {
      console.error('加载同人数据失败:', e);
    }
  }

  // 初始化时加载数据
  loadFromLocal();

  return {
    // 状态
    fanworks,
    activeFilter,
    isLoading,

    // 计算属性
    filteredFanworks,
    fanworksByType,
    hasFanworks,
    totalCount,
    totalHeat,
    averageQuality,

    // 方法
    generateFanworks,
    calculateFanworkHeat,
    toggleLike,
    setFilter,
    getFanworksByCharacter,
    getFanworksByProject,
    getHotFanworks,
    syncFromSimulation,
    clearFanworks,
    saveToLocal,
    loadFromLocal,
  };
});
