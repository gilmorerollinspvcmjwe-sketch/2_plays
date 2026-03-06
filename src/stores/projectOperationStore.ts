import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Project } from '@/types/project';

// ==================== 类型定义 ====================

/** 项目运营数据 */
export interface ProjectOperationData {
  projectId: string;
  projectName: string;
  
  // 核心指标
  metrics: {
    dau: number;              // 日活跃用户
    mau: number;              // 月活跃用户
    retention: {              // 留存率
      d1: number;
      d7: number;
      d30: number;
    };
    satisfaction: number;     // 满意度 0-1
    revenue: number;          // 当日收入
    totalRevenue: number;     // 累计收入
    rating: number;           // 评分 1-10
  };
  
  // 玩家分布
  playerSegments: {
    whale: number;            // 氪金大佬
    minnow: number;           // 微氪玩家
    free: number;             // 免费玩家
  };
  
  // 趋势
  trend: 'rising' | 'stable' | 'declining' | 'crashing';
  trendStrength: number;      // 趋势强度 0-1
  
  // 历史数据（用于计算趋势）
  history: {
    day: number;
    dau: number;
    revenue: number;
    satisfaction: number;
  }[];
}

/** 趋势计算结果 */
export interface TrendResult {
  trend: 'rising' | 'stable' | 'declining' | 'crashing';
  strength: number;
}

/** 历史记录 */
export interface HistoryRecord {
  day: number;
  timestamp: number;
  totalPlayers: number;
  totalRevenue: number;
  projectsCount: number;
}

/** Tick 上下文 */
export interface TickContext {
  day: number;
  publishedProjects: Project[];
  globalMetrics: {
    totalPlayers: number;
    totalRevenue: number;
    averageSatisfaction: number;
  };
}

// ==================== Store 定义 ====================

export const useProjectOperationStore = defineStore('projectOperation', () => {
  // 数据
  const projectOperationMap = ref<Map<string, ProjectOperationData>>(new Map());
  const history = ref<HistoryRecord[]>([]);
  
  // ==================== 核心方法 ====================
  
  /**
   * 初始化项目数据
   */
  function initProjectData(project: Project): ProjectOperationData {
    const existingData = projectOperationMap.value.get(project.id);
    if (existingData) {
      return existingData;
    }
    
    const data: ProjectOperationData = {
      projectId: project.id,
      projectName: project.name,
      metrics: {
        dau: 1000,
        mau: 5000,
        retention: {
          d1: 50,
          d7: 30,
          d30: 15,
        },
        satisfaction: 0.7,
        revenue: 0,
        totalRevenue: 0,
        rating: 7.0,
      },
      playerSegments: {
        whale: 0,
        minnow: 0,
        free: 1000,
      },
      trend: 'stable',
      trendStrength: 0,
      history: [],
    };
    
    projectOperationMap.value.set(project.id, data);
    return data;
  }
  
  /**
   * 更新项目指标
   */
  function updateProjectMetrics(
    projectId: string,
    metrics: Partial<ProjectOperationData['metrics']>
  ): void {
    const data = projectOperationMap.value.get(projectId);
    if (!data) {
      console.warn(`[ProjectOperationStore] 项目 ${projectId} 不存在，无法更新指标`);
      return;
    }
    
    // 合并新指标
    data.metrics = { ...data.metrics, ...metrics };
    
    // 添加到历史
    data.history.push({
      day: history.value.length > 0 ? history.value[history.value.length - 1].day + 1 : 1,
      dau: data.metrics.dau,
      revenue: data.metrics.revenue,
      satisfaction: data.metrics.satisfaction,
    });
    
    // 保留最近 30 天历史
    if (data.history.length > 30) {
      data.history.shift();
    }
    
    // 重新计算趋势
    const trendResult = calculateTrend(projectId);
    data.trend = trendResult.trend;
    data.trendStrength = trendResult.strength;
  }
  
  /**
   * 获取项目数据
   */
  function getProjectData(projectId: string): ProjectOperationData | null {
    return projectOperationMap.value.get(projectId) || null;
  }
  
  /**
   * 获取所有项目数据
   */
  function getAllProjectsData(): ProjectOperationData[] {
    return Array.from(projectOperationMap.value.values());
  }
  
  /**
   * 计算趋势
   */
  function calculateTrend(projectId: string): TrendResult {
    const data = projectOperationMap.value.get(projectId);
    if (!data || data.history.length < 7) {
      return { trend: 'stable', strength: 0 };
    }
    
    const recentHistory = data.history.slice(-7);
    const previousHistory = data.history.slice(-14, -7);
    
    // 计算 DAU 变化率
    const recentAvgDau = recentHistory.reduce((sum, h) => sum + h.dau, 0) / recentHistory.length;
    const previousAvgDau = previousHistory.reduce((sum, h) => sum + h.dau, 0) / previousHistory.length;
    
    const dauChangeRate = previousAvgDau > 0 ? (recentAvgDau - previousAvgDau) / previousAvgDau : 0;
    
    // 判断趋势
    let trend: 'rising' | 'stable' | 'declining' | 'crashing' = 'stable';
    let strength = Math.abs(dauChangeRate);
    
    if (dauChangeRate > 0.2) {
      trend = 'rising';
    } else if (dauChangeRate > 0.05) {
      trend = 'rising';
      strength *= 0.5;
    } else if (dauChangeRate < -0.3) {
      trend = 'crashing';
    } else if (dauChangeRate < -0.1) {
      trend = 'declining';
    }
    
    return { trend, strength: Math.min(1, strength) };
  }
  
  /**
   * 每日更新（由 simulationStore 调用）
   */
  function onDailyTick(ctx: TickContext): void {
    // 为每个发布的项目更新数据
    for (const project of ctx.publishedProjects) {
      const data = projectOperationMap.value.get(project.id);
      
      if (!data) {
        // 初始化新项目
        initProjectData(project);
      } else {
        // 更新现有项目数据
        // 这里只做基础更新，具体数值变化由 simulationStore 计算后调用 updateProjectMetrics
        const currentDay = data.history.length > 0 ? data.history[data.history.length - 1].day : 0;
        if (currentDay < ctx.day) {
          // 需要更新到新的一天
          // 具体更新逻辑由调用方负责
        }
      }
    }
  }
  
  /**
   * 记录历史
   */
  function recordHistory(day: number, totalPlayers: number, totalRevenue: number, projectsCount: number): void {
    history.value.push({
      day,
      timestamp: Date.now(),
      totalPlayers,
      totalRevenue,
      projectsCount,
    });
    
    // 保留最近 90 天历史
    if (history.value.length > 90) {
      history.value.shift();
    }
  }
  
  return {
    // 状态
    projectOperationMap,
    history,
    
    // 方法
    initProjectData,
    updateProjectMetrics,
    getProjectData,
    getAllProjectsData,
    onDailyTick,
    calculateTrend,
    recordHistory,
  };
});
