/**
 * 统一计算引擎
 * 整合所有计算系统，提供统一的计算接口
 */

import type { Project } from '@/types/project';
import type { Character } from '@/types/character';
import type { Employee } from '@/types/employee';
import { ProjectBalanceConfig, EmployeeBalanceConfig } from '@/config/gameBalance';
import { linkageEngine, type LinkageContext, type OperationModule } from './linkageEngine';
import { characterValueEngine, type PopularityMetrics, type CPHeat } from './characterValueEngine';
import { plotAnalysisEngine, type PlayerBehaviorData } from './plotAnalysisEngine';
import { feedbackLoopEngine, type DataCollection } from './feedbackLoopEngine';

// 项目评估结果
export interface ProjectEvaluation {
  healthScore: number;
  expectedRating: number;
  expectedRevenue: number;
  riskLevel: 'high' | 'medium' | 'low';
  riskFactors: string[];
  suggestions: string[];
}

// 角色价值结果
export interface CharacterValue {
  popularity: number;
  commercialValue: number;
  cpValue: number;
  plotCapacity: number;
  overall: number;
  suggestions: string[];
}

// 剧情分析结果
export interface PlotAnalysis {
  completion: {
    overallRate: number;
    chapterRates: { chapterId: string; rate: number }[];
    averageTime: number;
    replayRate: number;
  };
  emotionalCurve: {
    expectedCurve: number[];
    actualCurve: number[];
    deviation: number;
    peakPoints: { index: number; value: number }[];
    valleyPoints: { index: number; value: number }[];
  };
  dropOffPoints: {
    chapterId: string;
    chapterName: string;
    dropOffRate: number;
    severity: 'warning' | 'critical';
    possibleReasons: string[];
  }[];
  quality: number;
  suggestions: string[];
}

// 运营影响预测
export interface OperationImpact {
  shortTerm: { metric: string; change: number }[];
  mediumTerm: { metric: string; change: number }[];
  longTerm: { metric: string; change: number }[];
  risks: string[];
}

// 员工效率
export interface EmployeeEfficiency {
  baseEfficiency: number;
  fatiguePenalty: number;
  satisfactionBonus: number;
  specialtyBonus: number;
  traitBonus: number;
  finalEfficiency: number;
}

export class CalculationEngine {
  private cache = new Map<string, { value: any; timestamp: number }>();
  private cacheTTL = 60000; // 1分钟缓存

  // ========== 项目评估 ==========

  evaluateProject(project: Project): ProjectEvaluation {
    const cacheKey = `project_eval_${project.id}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const healthScore = this.calculateProjectHealth(project);
    const expectedRating = this.calculateExpectedRating(project);
    const expectedRevenue = this.calculateExpectedRevenue(project);
    const riskAssessment = this.assessProjectRisk(project);

    const suggestions = this.generateProjectSuggestions(project, healthScore);

    const result: ProjectEvaluation = {
      healthScore,
      expectedRating,
      expectedRevenue,
      riskLevel: riskAssessment.level,
      riskFactors: riskAssessment.factors,
      suggestions
    };

    this.setCache(cacheKey, result);
    return result;
  }

  private calculateProjectHealth(project: Project): number {
    const weights = ProjectBalanceConfig.healthWeights;

    // 角色完成度
    const characterCompletion = project.characters.length > 0
      ? Math.min(100, project.characters.length * 20)
      : 0;

    // 剧情完成度
    const plotCompletion = project.plots.length > 0
      ? Math.min(100, project.plots.length * 25)
      : 0;

    // 团队匹配度
    const teamSize = project.team.planning + project.team.art + project.team.program + project.team.operation;
    const teamMatch = Math.min(100, teamSize * 10);

    // 预算充足度
    const totalBudget = project.budget.development + project.budget.operation;
    const budgetScore = Math.min(100, totalBudget / 1000);

    return Math.round(
      characterCompletion * weights.characterCompletion +
      plotCompletion * weights.plotCompletion +
      teamMatch * weights.teamMatch +
      budgetScore * weights.budget
    );
  }

  private calculateExpectedRating(project: Project): number {
    const baseScore = ProjectBalanceConfig.ratingFormula.baseScore;
    const characterBonus = Math.min(2, project.characters.length * ProjectBalanceConfig.ratingFormula.characterBonus);
    const plotBonus = Math.min(2, project.plots.length * ProjectBalanceConfig.ratingFormula.plotBonus);
    const teamSize = project.team.planning + project.team.art + project.team.program + project.team.operation;
    const teamBonus = teamSize >= 4 ? ProjectBalanceConfig.ratingFormula.teamBonus : 0;

    return Math.min(10, baseScore + characterBonus + plotBonus + teamBonus);
  }

  private calculateExpectedRevenue(project: Project): number {
    const marketSize = ProjectBalanceConfig.revenueFormula.marketSize;
    const ratingFactor = this.calculateExpectedRating(project) / 10;
    const positioningMultiplier = ProjectBalanceConfig.revenueFormula.positioningMultiplier[project.positioning];

    return Math.round(marketSize * ratingFactor * positioningMultiplier * 0.1);
  }

  private assessProjectRisk(project: Project): { level: 'high' | 'medium' | 'low'; factors: string[] } {
    const factors: string[] = [];

    if (project.characters.length < 2) factors.push('角色数量不足');
    if (project.plots.length < 1) factors.push('缺少剧情内容');
    const teamSize = project.team.planning + project.team.art + project.team.program + project.team.operation;
    if (teamSize < 4) factors.push('团队配置不足');
    if (project.budget.development + project.budget.operation < 50000) factors.push('预算偏低');
    if (project.positioning === 'experimental') factors.push('实验性项目风险较高');

    const level = factors.length >= 3 ? 'high' : factors.length >= 1 ? 'medium' : 'low';
    return { level, factors };
  }

  private generateProjectSuggestions(project: Project, healthScore: number): string[] {
    const suggestions: string[] = [];

    if (healthScore < 60) {
      suggestions.push('项目健康度偏低，建议完善核心内容');
    }
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

    if (suggestions.length === 0) {
      suggestions.push('项目整体状况良好，继续保持');
    }

    return suggestions;
  }

  // ========== 角色价值 ==========

  calculateCharacterValue(
    character: Character,
    metrics: PopularityMetrics,
    cpData?: CPHeat[]
  ): CharacterValue {
    const result = characterValueEngine.calculateCharacterValue(character, metrics, cpData);
    
    return {
      popularity: result.popularity,
      commercialValue: result.commercialValue,
      cpValue: result.cpValue,
      plotCapacity: result.plotCapacity,
      overall: result.overall,
      suggestions: result.suggestions
    };
  }

  // ========== 剧情分析 ==========

  analyzePlot(
    plotId: string,
    chapters: { id: string; name: string; expectedEmotion: number }[],
    playerData: PlayerBehaviorData[]
  ): PlotAnalysis {
    const result = plotAnalysisEngine.analyzePlot(plotId, chapters, playerData);

    return {
      completion: {
        overallRate: result.completion.overallRate,
        chapterRates: result.completion.chapterRates,
        averageTime: result.completion.averageTime,
        replayRate: result.completion.replayRate
      },
      emotionalCurve: {
        expectedCurve: result.emotionalCurve.expectedCurve,
        actualCurve: result.emotionalCurve.actualCurve,
        deviation: result.emotionalCurve.deviation,
        peakPoints: result.emotionalCurve.peakPoints,
        valleyPoints: result.emotionalCurve.valleyPoints
      },
      dropOffPoints: result.dropOffPoints,
      quality: result.quality,
      suggestions: result.suggestions
    };
  }

  // ========== 运营影响预测 ==========

  predictOperationImpact(
    project: Project,
    operation: {
      module: OperationModule;
      action: string;
      value: number;
    }
  ): OperationImpact {
    const context: LinkageContext = {
      projectId: project.id,
      currentMetrics: {
        dau: project.metrics.dau,
        satisfaction: project.metrics.satisfaction,
        rating: project.metrics.rating
      },
      daysPassed: 0
    };

    // 触发联动计算
    const result = linkageEngine.trigger(
      operation.module,
      operation.action,
      operation.value,
      context
    );

    // 分类短期、中期、长期影响
    const shortTerm: { metric: string; change: number }[] = [];
    const mediumTerm: { metric: string; change: number }[] = [];
    const longTerm: { metric: string; change: number }[] = [];

    result.immediateEffects.forEach(effect => {
      shortTerm.push({ metric: effect.metric, change: effect.change });
    });

    // 模拟中期影响
    mediumTerm.push(
      { metric: 'retention', change: shortTerm.find(s => s.metric === 'satisfaction')?.change ? shortTerm.find(s => s.metric === 'satisfaction')!.change * 0.3 : 0 },
      { metric: 'marketShare', change: shortTerm.find(s => s.metric === 'dau')?.change ? shortTerm.find(s => s.metric === 'dau')!.change * 0.1 : 0 }
    );

    // 模拟长期影响
    longTerm.push(
      { metric: 'brandReputation', change: mediumTerm.find(m => m.metric === 'retention')?.change ? mediumTerm.find(m => m.metric === 'retention')!.change * 0.5 : 0 },
      { metric: 'playerLoyalty', change: mediumTerm.find(m => m.metric === 'marketShare')?.change ? mediumTerm.find(m => m.metric === 'marketShare')!.change * 0.3 : 0 }
    );

    // 风险评估
    const risks: string[] = [];
    if (operation.module === 'gacha' && operation.action === 'rate_change' && operation.value < 0) {
      risks.push('降低爆率可能引发玩家不满');
    }
    if (operation.module === 'event' && operation.action === 'difficulty_set' && operation.value > 80) {
      risks.push('活动难度过高可能导致玩家流失');
    }

    return { shortTerm, mediumTerm, longTerm, risks };
  }

  // ========== 员工效率 ==========

  calculateEmployeeEfficiency(employee: Employee, workType?: string): EmployeeEfficiency {
    // 基础效率
    const skillValue = employee.skills[employee.position];
    const baseEfficiency = skillValue / 100;

    // 疲劳惩罚
    const fatiguePenalty = employee.fatigue > 50
      ? (employee.fatigue - 50) / 100
      : 0;

    // 满意度加成
    const satisfactionBonus = employee.satisfaction > 50
      ? (employee.satisfaction - 50) / 200
      : 0;

    // 专长加成
    let specialtyBonus = 0;
    if (workType && employee.specialty !== 'none') {
      // 简化：假设专长匹配就有加成
      specialtyBonus = EmployeeBalanceConfig.efficiency.specialtyBonus;
    }

    // 性格加成
    let traitBonus = 0;
    const traitBonuses = EmployeeBalanceConfig.efficiency.traitBonuses;
    if (employee.trait in traitBonuses) {
      traitBonus = traitBonuses[employee.trait as keyof typeof traitBonuses];
    }

    const finalEfficiency = Math.max(0.1,
      baseEfficiency - fatiguePenalty + satisfactionBonus + specialtyBonus + traitBonus
    );

    return {
      baseEfficiency,
      fatiguePenalty,
      satisfactionBonus,
      specialtyBonus,
      traitBonus,
      finalEfficiency
    };
  }

  // ========== 数据反馈 ==========

  collectOperationData(data: DataCollection): void {
    feedbackLoopEngine.collectData(data);
  }

  generateAnalysisReport(projectId: string, days: number = 7) {
    return feedbackLoopEngine.generateReport(projectId, days);
  }

  // ========== 缓存管理 ==========

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  private setCache(key: string, value: any): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }

  // ========== 批量计算 ==========

  batchEvaluateProjects(projects: Project[]): Map<string, ProjectEvaluation> {
    const results = new Map<string, ProjectEvaluation>();
    projects.forEach(project => {
      results.set(project.id, this.evaluateProject(project));
    });
    return results;
  }

  batchCalculateCharacterValues(
    characters: Character[],
    metricsMap: Map<string, PopularityMetrics>,
    cpData: CPHeat[]
  ): Map<string, CharacterValue> {
    const results = new Map<string, CharacterValue>();
    characters.forEach(character => {
      const metrics = metricsMap.get(character.id) || {
        baseScore: 30,
        plotExposure: 0,
        gachaExposure: 0,
        socialMentions: 0,
        playerInteractions: 0
      };
      results.set(character.id, this.calculateCharacterValue(character, metrics, cpData));
    });
    return results;
  }
}

// 单例导出
export const calculationEngine = new CalculationEngine();
