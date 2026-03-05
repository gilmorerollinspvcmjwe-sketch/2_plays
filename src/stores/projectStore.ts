/**
 * 项目管理 Store
 * 乙游模拟器核心玩法 - 以项目为中心的管理体系
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Project,
  ProjectStatus,
  ProjectPositioning,
  CreateProjectParams,
  ProjectFilter,
  ProjectSortBy,
  ProjectEvaluation,
  ProjectHistoryEvent
} from '@/types/project';
import {
  initProjectBudget,
  initProjectTeam,
  initProjectMetrics,
  calculateProjectHealth,
  calculateExpectedRating,
  calculateExpectedRevenue,
  assessProjectRisk,
  getProjectStatusName
} from '@/types/project';
import type { Character, Plot } from '@/stores/gameStore';
import { useGameStore } from './gameStore';
import { calculateProjectQuality, type ProjectQualityScore } from '@/engine/qualityScoring';

export const useProjectStore = defineStore('project', () => {
  // State
  const projects = ref<Project[]>([]);
  const currentProjectId = ref<string | null>(null);

  // Getters
  const currentProject = computed(() => {
    return projects.value.find(p => p.id === currentProjectId.value) || null;
  });

  const planningProjects = computed(() => {
    return projects.value.filter(p => p.status === 'planning');
  });

  const developingProjects = computed(() => {
    return projects.value.filter(p => p.status === 'developing');
  });

  const operatingProjects = computed(() => {
    return projects.value.filter(p => ['released', 'operating'].includes(p.status));
  });

  const closedProjects = computed(() => {
    return projects.value.filter(p => ['declining', 'closed'].includes(p.status));
  });

  // 公司级数据聚合
  const companyStats = computed(() => {
    const activeProjects = projects.value.filter(p => 
      ['planning', 'developing', 'released', 'operating'].includes(p.status)
    );

    return {
      totalProjects: projects.value.length,
      activeProjects: activeProjects.length,
      totalRevenue: projects.value.reduce((sum, p) => sum + p.metrics.totalRevenue, 0),
      totalDAU: activeProjects.reduce((sum, p) => sum + p.metrics.dau, 0),
      totalMAU: activeProjects.reduce((sum, p) => sum + p.metrics.mau, 0),
      totalPlayers: projects.value.reduce((sum, p) => sum + p.metrics.totalPlayers, 0),
      averageRating: projects.value.length > 0
        ? projects.value.reduce((sum, p) => sum + p.metrics.rating, 0) / projects.value.length
        : 0,
      totalBudget: projects.value.reduce((sum, p) => 
        sum + p.budget.development + p.budget.operation, 0
      ),
      totalSpent: projects.value.reduce((sum, p) => sum + p.budget.spent, 0)
    };
  });

  // Actions

  /**
   * 创建新项目
   */
  function createProject(params: CreateProjectParams): Project {
    const project: Project = {
      id: `proj_${Date.now()}`,
      name: params.name,
      companyId: 'company_1', // TODO: 从公司store获取
      positioning: params.positioning,
      genre: params.genre,
      targetAudience: params.targetAudience,
      budget: { ...params.budget },
      status: 'planning',
      progress: 0,
      team: { ...params.team },
      characters: [],
      plots: [],
      metrics: initProjectMetrics(),
      history: [{
        id: `event_${Date.now()}`,
        type: 'milestone',
        title: '项目立项',
        description: `项目「${params.name}」正式立项`,
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    projects.value.push(project);
    currentProjectId.value = project.id;
    saveToLocal();

    return project;
  }

  /**
   * 设置当前项目
   */
  function setCurrentProject(projectId: string): boolean {
    const project = projects.value.find(p => p.id === projectId);
    if (project) {
      currentProjectId.value = projectId;
      return true;
    }
    return false;
  }

  /**
   * 更新项目
   */
  function updateProject(
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt'>>
  ): boolean {
    const project = projects.value.find(p => p.id === projectId);
    if (!project) return false;

    Object.assign(project, { ...updates, updatedAt: new Date().toISOString() });
    saveToLocal();
    return true;
  }

  /**
   * 删除项目
   */
  function deleteProject(projectId: string): boolean {
    const index = projects.value.findIndex(p => p.id === projectId);
    if (index === -1) return false;

    projects.value.splice(index, 1);

    if (currentProjectId.value === projectId) {
      currentProjectId.value = projects.value.length > 0 ? projects.value[0].id : null;
    }

    saveToLocal();
    return true;
  }

  /**
   * 推进项目状态
   */
  function advanceProjectStatus(projectId: string): { success: boolean; message: string } {
    const project = projects.value.find(p => p.id === projectId);
    if (!project) {
      return { success: false, message: '项目不存在' };
    }

    const statusFlow: ProjectStatus[] = ['planning', 'developing', 'released', 'operating'];
    const currentIndex = statusFlow.indexOf(project.status);

    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
      return { success: false, message: '项目已处于最终状态' };
    }

    // 检查状态转换条件
    const checkResult = checkStatusTransition(project, statusFlow[currentIndex + 1]);
    if (!checkResult.canTransition) {
      return { success: false, message: checkResult.reason };
    }

    const oldStatus = project.status;
    project.status = statusFlow[currentIndex + 1];
    project.updatedAt = new Date().toISOString();

    // 记录历史事件
    addProjectHistory(projectId, {
      id: `event_${Date.now()}`,
      type: 'milestone',
      title: '状态变更',
      description: `项目从「${getProjectStatusName(oldStatus)}」进入「${getProjectStatusName(project.status)}」`,
      timestamp: new Date().toISOString()
    });

    // 如果是发布，记录发布时间
    if (project.status === 'released') {
      project.releasedAt = new Date().toISOString();
    }

    saveToLocal();
    return { success: true, message: '状态推进成功' };
  }

  /**
   * 检查状态转换条件
   */
  function checkStatusTransition(
    project: Project,
    targetStatus: ProjectStatus
  ): { canTransition: boolean; reason: string } {
    switch (targetStatus) {
      case 'developing':
        if (project.team.planning + project.team.art + project.team.program + project.team.operation < 2) {
          return { canTransition: false, reason: '团队配置不足（至少需要2人）' };
        }
        if (project.budget.development + project.budget.operation < 10000) {
          return { canTransition: false, reason: '预算不足（至少需要10000）' };
        }
        return { canTransition: true, reason: '' };

      case 'released':
        if (project.characters.length < 2) {
          return { canTransition: false, reason: '角色数量不足（至少需要2个）' };
        }
        if (project.plots.length < 1) {
          return { canTransition: false, reason: '缺少剧情内容' };
        }
        if (project.progress < 80) {
          return { canTransition: false, reason: '开发进度不足（至少需要80%）' };
        }
        return { canTransition: true, reason: '' };

      case 'operating':
        if (project.status !== 'released') {
          return { canTransition: false, reason: '必须先经过发布阶段' };
        }
        return { canTransition: true, reason: '' };

      default:
        return { canTransition: true, reason: '' };
    }
  }

  /**
   * 更新项目进度
   */
  function updateProjectProgress(projectId: string, progress: number): boolean {
    const project = projects.value.find(p => p.id === projectId);
    if (!project) return false;

    project.progress = Math.max(0, Math.min(100, progress));
    project.updatedAt = new Date().toISOString();

    // 如果进度达到100%，自动推进到发布阶段
    if (project.progress >= 100 && project.status === 'developing') {
      advanceProjectStatus(projectId);
    }

    saveToLocal();
    return true;
  }

  /**
   * 添加角色到项目
   */
  function addCharacterToProject(projectId: string, character: Character): boolean {
    const project = projects.value.find(p => p.id === projectId);
    if (!project) return false;

    project.characters.push(character);
    project.updatedAt = new Date().toISOString();

    addProjectHistory(projectId, {
      id: `event_${Date.now()}`,
      type: 'milestone',
      title: '新增角色',
      description: `角色「${character.name}」加入项目`,
      timestamp: new Date().toISOString()
    });

    saveToLocal();
    return true;
  }

  /**
   * 添加剧情到项目
   */
  function addPlotToProject(projectId: string, plot: Plot): boolean {
    const project = projects.value.find(p => p.id === projectId);
    if (!project) return false;

    project.plots.push(plot);
    project.updatedAt = new Date().toISOString();

    addProjectHistory(projectId, {
      id: `event_${Date.now()}`,
      type: 'milestone',
      title: '新增剧情',
      description: `剧情「${plot.title}」加入项目`,
      timestamp: new Date().toISOString()
    });

    saveToLocal();
    return true;
  }

  /**
   * 更新项目指标
   */
  function updateProjectMetrics(
    projectId: string,
    metrics: Partial<Project['metrics']>
  ): boolean {
    const project = projects.value.find(p => p.id === projectId);
    if (!project) return false;

    project.metrics = { ...project.metrics, ...metrics };
    project.updatedAt = new Date().toISOString();
    saveToLocal();
    return true;
  }

  /**
   * 添加项目历史事件
   */
  function addProjectHistory(projectId: string, event: ProjectHistoryEvent): boolean {
    const project = projects.value.find(p => p.id === projectId);
    if (!project) return false;

    project.history.unshift(event);

    // 限制历史记录数量
    if (project.history.length > 50) {
      project.history = project.history.slice(0, 50);
    }

    return true;
  }

  /**
   * 评估项目
   */
  function evaluateProject(projectId: string): ProjectEvaluation | null {
    const project = projects.value.find(p => p.id === projectId);
    if (!project) return null;

    const healthScore = calculateProjectHealth(project);
    const expectedRating = calculateExpectedRating(project);
    const expectedRevenue = calculateExpectedRevenue(project);
    const riskAssessment = assessProjectRisk(project);

    // 生成建议
    const suggestions: string[] = [];
    if (project.characters.length < 3) {
      suggestions.push('建议增加更多角色以丰富游戏内容');
    }
    if (project.plots.length < 2) {
      suggestions.push('建议增加更多剧情线路');
    }
    if (project.team.planning < 1) {
      suggestions.push('建议配置至少1名策划');
    }
    if (project.team.art < 2) {
      suggestions.push('建议增加美术人员以加快进度');
    }

    return {
      healthScore,
      expectedRating,
      expectedRevenue,
      riskLevel: riskAssessment.level,
      riskFactors: riskAssessment.factors,
      suggestions
    };
  }

  /**
   * 筛选和排序项目
   */
  function filterAndSortProjects(
    filter?: ProjectFilter,
    sortBy: ProjectSortBy = 'updatedAt',
    ascending: boolean = false
  ): Project[] {
    let result = [...projects.value];

    // 筛选
    if (filter) {
      if (filter.status) {
        result = result.filter(p => p.status === filter.status);
      }
      if (filter.positioning) {
        result = result.filter(p => p.positioning === filter.positioning);
      }
      if (filter.genre?.length) {
        result = result.filter(p => 
          filter.genre!.some(g => p.genre.includes(g))
        );
      }
    }

    // 排序
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'revenue':
          comparison = a.metrics.totalRevenue - b.metrics.totalRevenue;
          break;
        case 'rating':
          comparison = a.metrics.rating - b.metrics.rating;
          break;
      }
      return ascending ? comparison : -comparison;
    });

    return result;
  }

  /**
   * 模拟每日运营数据更新
   */
  function simulateDailyOperation(projectId: string): {
    dau: number;
    revenue: number;
    satisfaction: number;
  } | null {
    const project = projects.value.find(p => p.id === projectId);
    if (!project || !['released', 'operating'].includes(project.status)) {
      return null;
    }

    // 基础衰减
    const baseDecay = 0.99;

    // 根据项目质量调整
    const qualityFactor = calculateExpectedRating(project) / 10;
    const retentionFactor = 0.95 + qualityFactor * 0.05;

    // 计算新DAU
    const newDAU = Math.max(100, Math.round(
      project.metrics.dau * baseDecay * retentionFactor + 
      Math.random() * 50 * qualityFactor
    ));

    // 计算收入
    const arpu = 10 + qualityFactor * 20;
    const dailyRevenue = Math.round(newDAU * arpu / 100);

    // 计算满意度变化
    const satisfactionChange = (Math.random() - 0.5) * 2;
    const newSatisfaction = Math.max(0, Math.min(100, 
      project.metrics.satisfaction + satisfactionChange
    ));

    // 更新指标
    project.metrics.dau = newDAU;
    project.metrics.dailyRevenue = dailyRevenue;
    project.metrics.totalRevenue += dailyRevenue;
    project.metrics.satisfaction = newSatisfaction;

    // 检查是否进入衰退期
    if (project.status === 'operating' && project.metrics.dau < 500) {
      project.status = 'declining';
      addProjectHistory(projectId, {
        id: `event_${Date.now()}`,
        type: 'crisis',
        title: '进入衰退期',
        description: 'DAU持续下降，项目进入衰退期',
        timestamp: new Date().toISOString()
      });
    }

    project.updatedAt = new Date().toISOString();
    saveToLocal();

    return {
      dau: newDAU,
      revenue: dailyRevenue,
      satisfaction: newSatisfaction
    };
  }

  /**
   * 保存到本地存储
   */
  function saveToLocal(): void {
    const data = {
      projects: projects.value,
      currentProjectId: currentProjectId.value
    };
    localStorage.setItem('project_data', JSON.stringify(data));
  }

  /**
   * 从本地存储加载
   */
  function loadFromLocal(): void {
    const saved = localStorage.getItem('project_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        projects.value = data.projects || [];
        currentProjectId.value = data.currentProjectId || null;
      } catch (e) {
        console.error('加载项目数据失败:', e);
      }
    }
  }

  /**
   * 初始化默认项目
   */
  function initDefaultProject(): void {
    if (projects.value.length === 0) {
      createProject({
        name: '我的第一款乙女游戏',
        positioning: 'mass',
        genre: ['romance', 'modern'],
        targetAudience: ['female', '18-25'],
        budget: {
          development: 50000,
          operation: 30000,
          spent: 0
        },
        team: {
          planning: 1,
          art: 2,
          program: 1,
          operation: 1
        }
      });
    }
  }

  // 初始化时加载数据
  loadFromLocal();

  return {
    // State
    projects,
    currentProjectId,

    // Getters
    currentProject,
    planningProjects,
    developingProjects,
    operatingProjects,
    closedProjects,
    companyStats,

    // Actions
    createProject,
    setCurrentProject,
    updateProject,
    deleteProject,
    advanceProjectStatus,
    updateProjectProgress,
    addCharacterToProject,
    addPlotToProject,
    updateProjectMetrics,
    addProjectHistory,
    evaluateProject,
    filterAndSortProjects,
    simulateDailyOperation,
    saveToLocal,
    loadFromLocal,
    initDefaultProject,
    
    // 质量评分
    getProjectQuality: (projectId: string): ProjectQualityScore | null => {
      const project = projects.value.find(p => p.id === projectId);
      if (!project) return null;
      
      const gameStore = useGameStore();
      
      // 获取项目关联的角色
      const projectChars = project.characters?.map(charId => 
        gameStore.characters.find(c => c.id === charId)
      ).filter(Boolean) || [];
      
      // 获取项目关联的剧情
      const projectPlots = project.plots?.map(plotId => 
        gameStore.plots.find(p => p.id === plotId)
      ).filter(Boolean) || [];
      
      return calculateProjectQuality(projectChars, projectPlots);
    }
  };
});
