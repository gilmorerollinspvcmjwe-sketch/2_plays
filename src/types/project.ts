/**
 * 项目管理系统类型定义
 * 乙游模拟器核心玩法 - 以项目为中心的管理体系
 */

import type { Character } from '@/stores/gameStore';
import type { Plot } from '@/stores/gameStore';

// 项目生命周期状态 - 移除测试阶段
export type ProjectStatus = 
  | 'planning'      // 立项阶段
  | 'developing'    // 开发阶段
  | 'released'      // 发布阶段
  | 'operating'     // 运营阶段
  | 'declining'     // 衰退阶段
  | 'closed';       // 停服阶段

// 项目定位
export type ProjectPositioning = 'mass' | 'niche' | 'experimental';

// 项目预算
export interface ProjectBudget {
  development: number;  // 开发预算
  operation: number;    // 运营预算
  spent: number;        // 已花费
}

// 项目团队配置
export interface ProjectTeam {
  planning: number;   // 策划人数
  art: number;        // 美术人数
  program: number;    // 程序人数
  operation: number;  // 运营人数
}

// 项目留存数据
export interface ProjectRetention {
  d1: number;   // 次日留存率
  d7: number;   // 7日留存率
  d30: number;  // 30日留存率
}

// 项目指标
export interface ProjectMetrics {
  // 基础数据
  dau: number;           // 日活跃用户
  mau: number;           // 月活跃用户
  totalPlayers: number;  // 总玩家数
  
  // 收入数据
  dailyRevenue: number;    // 日收入
  monthlyRevenue: number;  // 月收入
  totalRevenue: number;    // 总收入
  arpu: number;            // 每用户平均收入
  
  // 满意度数据
  rating: number;        // 评分 1-10
  satisfaction: number;  // 满意度 0-100
  nps: number;           // 净推荐值
  
  // 留存数据
  retention: ProjectRetention;
  
  // 市场份额
  marketShare: number;  // 0-100%
}

// 项目历史事件
export interface ProjectHistoryEvent {
  id: string;
  type: 'milestone' | 'release' | 'update' | 'event' | 'crisis' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  impact?: {
    metric: keyof ProjectMetrics;
    change: number;
  };
}

// 项目评估结果
export interface ProjectEvaluation {
  healthScore: number;      // 健康度 0-100
  expectedRating: number;   // 预期评分 1-10
  expectedRevenue: number;  // 预期首月收入
  riskLevel: 'high' | 'medium' | 'low';
  riskFactors: string[];
  suggestions: string[];
}

// 项目接口
export interface Project {
  id: string;
  name: string;
  companyId: string;
  
  // 项目定位
  positioning: ProjectPositioning;
  genre: string[];        // 题材标签
  targetAudience: string[];
  
  // 资源管理
  budget: ProjectBudget;
  
  // 开发状态
  status: ProjectStatus;
  progress: number;  // 0-100
  
  // 团队配置
  team: ProjectTeam;
  
  // 内容资产
  characters: Character[];
  plots: Plot[];
  
  // 运营数据
  metrics: ProjectMetrics;
  
  // 历史记录
  history: ProjectHistoryEvent[];
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
  releasedAt?: string;
}

// 项目创建参数
export interface CreateProjectParams {
  name: string;
  positioning: ProjectPositioning;
  genre: string[];
  targetAudience: string[];
  budget: ProjectBudget;
  team: ProjectTeam;
}

// 项目筛选条件
export interface ProjectFilter {
  status?: ProjectStatus;
  positioning?: ProjectPositioning;
  genre?: string[];
}

// 项目排序选项
export type ProjectSortBy = 'createdAt' | 'updatedAt' | 'progress' | 'revenue' | 'rating';

// 初始化项目预算
export function initProjectBudget(): ProjectBudget {
  return {
    development: 0,
    operation: 0,
    spent: 0
  };
}

// 初始化项目团队
export function initProjectTeam(): ProjectTeam {
  return {
    planning: 0,
    art: 0,
    program: 0,
    operation: 0
  };
}

// 初始化项目指标
export function initProjectMetrics(): ProjectMetrics {
  return {
    dau: 0,
    mau: 0,
    totalPlayers: 0,
    dailyRevenue: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    arpu: 0,
    rating: 0,
    satisfaction: 0,
    nps: 0,
    retention: {
      d1: 0,
      d7: 0,
      d30: 0
    },
    marketShare: 0
  };
}

// 项目状态配置
export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { 
  name: string; 
  color: string; 
  icon: string;
  description: string;
}> = {
  planning: {
    name: '立项中',
    color: '#1890ff',
    icon: 'bulb-o',
    description: '确定项目定位、预算和团队'
  },
  developing: {
    name: '开发中',
    color: '#52c41a',
    icon: 'cluster-o',
    description: '角色开发、剧情编写、技术实现'
  },
  released: {
    name: '已发布',
    color: '#722ed1',
    icon: 'gift-o',
    description: '正式上线，开服活动'
  },
  operating: {
    name: '运营中',
    color: '#faad14',
    icon: 'chart-trending-o',
    description: '日常运营、版本更新、活动策划'
  },
  declining: {
    name: '衰退中',
    color: '#ff7a45',
    icon: 'down',
    description: '玩家流失，需要挽救措施'
  },
  closed: {
    name: '已停服',
    color: '#8c8c8c',
    icon: 'close',
    description: '项目结束，资源回收'
  }
};

// 项目定位配置
export const PROJECT_POSITIONING_CONFIG: Record<ProjectPositioning, {
  name: string;
  description: string;
  riskLevel: 'high' | 'medium' | 'low';
  potentialReturn: 'high' | 'medium' | 'low';
}> = {
  mass: {
    name: '大众向',
    description: '面向广泛用户群体，追求高DAU',
    riskLevel: 'medium',
    potentialReturn: 'high'
  },
  niche: {
    name: '小众向',
    description: '面向特定用户群体，追求高ARPU',
    riskLevel: 'low',
    potentialReturn: 'medium'
  },
  experimental: {
    name: '实验性',
    description: '创新玩法或题材，高风险高回报',
    riskLevel: 'high',
    potentialReturn: 'high'
  }
};

// 获取项目状态名称
export function getProjectStatusName(status: ProjectStatus): string {
  return PROJECT_STATUS_CONFIG[status]?.name || status;
}

// 获取项目状态颜色
export function getProjectStatusColor(status: ProjectStatus): string {
  return PROJECT_STATUS_CONFIG[status]?.color || '#999';
}

// 获取项目定位名称
export function getProjectPositioningName(positioning: ProjectPositioning): string {
  return PROJECT_POSITIONING_CONFIG[positioning]?.name || positioning;
}

// 计算项目健康度
export function calculateProjectHealth(project: Project): number {
  // 角色完成度 30%
  const characterCompletion = project.characters.length > 0 
    ? project.characters.reduce((sum, char) => {
        let score = 0;
        if (char.name) score += 20;
        if (char.appearance) score += 20;
        if (char.personality?.length) score += 20;
        if (char.background) score += 20;
        if (char.avatar) score += 20;
        return sum + score;
      }, 0) / (project.characters.length * 100) * 100
    : 0;
  
  // 剧情完成度 30%
  const plotCompletion = project.plots.length > 0
    ? project.plots.reduce((sum, plot) => {
        let score = 0;
        if (plot.title) score += 25;
        if (plot.summary) score += 25;
        if (plot.chapters?.length) score += 25;
        if (plot.characterIds?.length) score += 25;
        return sum + score;
      }, 0) / (project.plots.length * 100) * 100
    : 0;
  
  // 团队配置合理性 20%
  const teamScore = (project.team.planning + project.team.art + project.team.program + project.team.operation) > 0
    ? Math.min(100, (project.team.planning + project.team.art + project.team.program + project.team.operation) * 10)
    : 0;
  
  // 预算充足度 20%
  const budgetScore = project.budget.development + project.budget.operation > 0
    ? Math.min(100, (project.budget.development + project.budget.operation) / 10000 * 100)
    : 0;
  
  return Math.round(
    characterCompletion * 0.3 +
    plotCompletion * 0.3 +
    teamScore * 0.2 +
    budgetScore * 0.2
  );
}

// 计算项目预期评分
export function calculateExpectedRating(project: Project): number {
  const baseScore = 5;
  
  // 角色质量加成
  const characterBonus = project.characters.length > 0
    ? Math.min(2, project.characters.length * 0.3)
    : 0;
  
  // 剧情质量加成
  const plotBonus = project.plots.length > 0
    ? Math.min(2, project.plots.length * 0.3)
    : 0;
  
  // 团队加成
  const teamBonus = (project.team.planning + project.team.art + project.team.program + project.team.operation) >= 4
    ? 0.5
    : 0;
  
  return Math.min(10, baseScore + characterBonus + plotBonus + teamBonus);
}

// 计算项目预期收入
export function calculateExpectedRevenue(project: Project): number {
  const marketSize = 1000000; // 假设市场容量
  const ratingFactor = calculateExpectedRating(project) / 10;
  const positioningFactor = project.positioning === 'mass' ? 1.2 : project.positioning === 'niche' ? 0.8 : 1.0;
  
  return Math.round(marketSize * ratingFactor * positioningFactor * 0.1);
}

// 评估项目风险
export function assessProjectRisk(project: Project): { level: 'high' | 'medium' | 'low'; factors: string[] } {
  const factors: string[] = [];
  
  if (project.characters.length < 2) {
    factors.push('角色数量不足（建议至少2个）');
  }
  
  if (project.plots.length < 1) {
    factors.push('缺少剧情内容');
  }
  
  if (project.team.planning + project.team.art + project.team.program + project.team.operation < 4) {
    factors.push('团队配置不足');
  }
  
  if (project.budget.development + project.budget.operation < 50000) {
    factors.push('预算偏低');
  }
  
  if (project.positioning === 'experimental') {
    factors.push('实验性项目风险较高');
  }
  
  const level = factors.length >= 3 ? 'high' : factors.length >= 1 ? 'medium' : 'low';
  
  return { level, factors };
}
