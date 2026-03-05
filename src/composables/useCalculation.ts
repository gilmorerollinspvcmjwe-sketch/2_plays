/**
 * 计算引擎组合式函数
 * 在Vue组件中使用计算引擎
 */

import { ref, computed } from 'vue';
import {
  calculationEngine,
  linkageEngine,
  characterValueEngine,
  plotAnalysisEngine,
  feedbackLoopEngine
} from '@/engine';
import type {
  ProjectEvaluation,
  CharacterValue,
  PlotAnalysis,
  OperationImpact
} from '@/engine/calculationEngine';
import type { DataCollection } from '@/engine/feedbackLoopEngine';
import type { Project } from '@/types/project';
import type { Character } from '@/types/character';

// 项目评估
export function useProjectEvaluation(project: Project) {
  const evaluation = computed<ProjectEvaluation>(() => {
    return calculationEngine.evaluateProject(project);
  });

  const healthStatus = computed(() => {
    const score = evaluation.value.healthScore;
    if (score >= 80) return { text: '优秀', color: '#52c41a' };
    if (score >= 60) return { text: '良好', color: '#faad14' };
    return { text: '需改进', color: '#ff4d4f' };
  });

  return {
    evaluation,
    healthStatus
  };
}

// 角色价值
export function useCharacterValue(
  character: Character,
  metrics: {
    plotExposure: number;
    gachaExposure: number;
    socialMentions: number;
    playerInteractions: number;
  }
) {
  const value = computed<CharacterValue>(() => {
    return calculationEngine.calculateCharacterValue(character, {
      baseScore: 30,
      ...metrics
    });
  });

  const valueRank = computed(() => {
    const overall = value.value.overall;
    if (overall >= 80) return 'SSR';
    if (overall >= 60) return 'SR';
    if (overall >= 40) return 'R';
    return 'N';
  });

  return {
    value,
    valueRank
  };
}

// 运营影响预测
export function useOperationImpact(
  project: Project,
  operation: {
    module: 'gacha' | 'event' | 'welfare' | 'playerData' | 'incident' | 'social' | 'market';
    action: string;
    value: number;
  }
) {
  const impact = computed<OperationImpact>(() => {
    return calculationEngine.predictOperationImpact(project, operation);
  });

  const hasRisk = computed(() => impact.value.risks.length > 0);

  return {
    impact,
    hasRisk
  };
}

// 联动追踪
export function useLinkageTracker() {
  const queuedEffects = ref(linkageEngine.getQueuedEffects());

  const processDailyEffects = () => {
    const processed = linkageEngine.processDailyEffects();
    queuedEffects.value = linkageEngine.getQueuedEffects();
    return processed;
  };

  const getModuleStats = () => {
    return linkageEngine.getModuleStats();
  };

  return {
    queuedEffects,
    processDailyEffects,
    getModuleStats
  };
}

// 数据反馈闭环
export function useFeedbackLoop(projectId: string) {
  const report = ref(feedbackLoopEngine.generateReport(projectId, 7));

  const collectData = (data: DataCollection) => {
    calculationEngine.collectOperationData(data);
  };

  const refreshReport = () => {
    report.value = feedbackLoopEngine.generateReport(projectId, 7);
  };

  const criticalProblems = computed(() => {
    return report.value.problems.filter(p => p.severity === 'critical');
  });

  const highPrioritySuggestions = computed(() => {
    return report.value.suggestions.filter(s => s.priority === 'high');
  });

  return {
    report,
    collectData,
    refreshReport,
    criticalProblems,
    highPrioritySuggestions
  };
}

// 批量计算
export function useBatchCalculation() {
  const isCalculating = ref(false);
  const progress = ref(0);

  const batchEvaluateProjects = async (projects: Project[]) => {
    isCalculating.value = true;
    progress.value = 0;

    const results = new Map<string, ProjectEvaluation>();
    const batchSize = 5;

    for (let i = 0; i < projects.length; i += batchSize) {
      const batch = projects.slice(i, i + batchSize);
      batch.forEach(project => {
        results.set(project.id, calculationEngine.evaluateProject(project));
      });
      progress.value = Math.round((i + batch.length) / projects.length * 100);
      // 让出主线程
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    isCalculating.value = false;
    progress.value = 100;

    return results;
  };

  return {
    isCalculating,
    progress,
    batchEvaluateProjects
  };
}
