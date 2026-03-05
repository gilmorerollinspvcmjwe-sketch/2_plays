/**
 * 剧情分析引擎
 * 分析剧情完成率、流失点、情感曲线等
 */

import { PlotBalanceConfig } from '@/config/gameBalance';

// 剧情分析结果
export interface PlotAnalysisResult {
  completion: PlotCompletionAnalysis;
  emotionalCurve: EmotionalCurveAnalysis;
  branchAnalysis: BranchAnalysis;
  dropOffPoints: DropOffPoint[];
  quality: number; // 整体质量 0-100
  suggestions: string[];
}

// 剧情完成率分析
export interface PlotCompletionAnalysis {
  overallRate: number; // 整体完成率
  chapterRates: { chapterId: string; rate: number }[];
  averageTime: number; // 平均通关时间（分钟）
  replayRate: number; // 重玩率
}

// 情感曲线分析
export interface EmotionalCurveAnalysis {
  expectedCurve: number[]; // 预期情感值
  actualCurve: number[]; // 实际情感值
  deviation: number; // 偏离度
  peakPoints: { index: number; value: number }[]; // 情感峰值
  valleyPoints: { index: number; value: number }[]; // 情感谷值
}

// 分支分析
export interface BranchAnalysis {
  branches: {
    branchId: string;
    name: string;
    selectionRate: number; // 选择率
    completionRate: number; // 该分支完成率
    isPopular: boolean;
    isDead: boolean;
  }[];
  balanceScore: number; // 分支平衡度
}

// 流失点
export interface DropOffPoint {
  chapterId: string;
  chapterName: string;
  dropOffRate: number; // 流失率
  severity: 'warning' | 'critical';
  possibleReasons: string[];
}

// 玩家行为数据
export interface PlayerBehaviorData {
  playerId: string;
  chapterProgress: { chapterId: string; completed: boolean; timestamp: number }[];
  choices: { chapterId: string; choiceId: string }[];
  emotions: { chapterId: string; emotion: number }[]; // -10 到 10
  sessionDuration: number;
}

export class PlotAnalysisEngine {
  // 分析剧情
  analyzePlot(
    plotId: string,
    chapters: { id: string; name: string; expectedEmotion: number }[],
    playerData: PlayerBehaviorData[]
  ): PlotAnalysisResult {
    const completion = this.analyzeCompletion(chapters, playerData);
    const emotionalCurve = this.analyzeEmotionalCurve(chapters, playerData);
    const branchAnalysis = this.analyzeBranches(chapters, playerData);
    const dropOffPoints = this.identifyDropOffPoints(completion, chapters);
    const quality = this.assessPlotQuality({
      completion,
      emotionalCurve,
      branchAnalysis
    });
    const suggestions = this.generatePlotSuggestions({
      completion,
      emotionalCurve,
      branchAnalysis,
      dropOffPoints
    });

    return {
      completion,
      emotionalCurve,
      branchAnalysis,
      dropOffPoints,
      quality,
      suggestions
    };
  }

  // 分析完成率
  private analyzeCompletion(
    chapters: { id: string; name: string; expectedEmotion: number }[],
    playerData: PlayerBehaviorData[]
  ): PlotCompletionAnalysis {
    if (playerData.length === 0) {
      return {
        overallRate: 0,
        chapterRates: chapters.map(c => ({ chapterId: c.id, rate: 0 })),
        averageTime: 0,
        replayRate: 0
      };
    }

    // 计算整体完成率
    const completedPlayers = playerData.filter(p => 
      p.chapterProgress.length >= chapters.length &&
      p.chapterProgress.every(cp => cp.completed)
    ).length;
    const overallRate = completedPlayers / playerData.length;

    // 计算各章节完成率
    const chapterRates = chapters.map(chapter => {
      const completed = playerData.filter(p => 
        p.chapterProgress.some(cp => cp.chapterId === chapter.id && cp.completed)
      ).length;
      return {
        chapterId: chapter.id,
        rate: completed / playerData.length
      };
    });

    // 计算平均通关时间
    const averageTime = playerData.reduce((sum, p) => sum + p.sessionDuration, 0) / playerData.length / 60;

    // 计算重玩率（简化：有多个选择的玩家视为重玩）
    const replayedPlayers = playerData.filter(p => p.choices.length > chapters.length).length;
    const replayRate = replayedPlayers / playerData.length;

    return {
      overallRate,
      chapterRates,
      averageTime,
      replayRate
    };
  }

  // 分析情感曲线
  private analyzeEmotionalCurve(
    chapters: { id: string; name: string; expectedEmotion: number }[],
    playerData: PlayerBehaviorData[]
  ): EmotionalCurveAnalysis {
    const expectedCurve = chapters.map(c => c.expectedEmotion);
    
    if (playerData.length === 0) {
      return {
        expectedCurve,
        actualCurve: expectedCurve,
        deviation: 0,
        peakPoints: [],
        valleyPoints: []
      };
    }

    // 计算实际情感曲线（各章节平均情感）
    const actualCurve = chapters.map(chapter => {
      const emotions = playerData
        .flatMap(p => p.emotions)
        .filter(e => e.chapterId === chapter.id)
        .map(e => e.emotion);
      
      if (emotions.length === 0) return chapter.expectedEmotion;
      return emotions.reduce((sum, e) => sum + e, 0) / emotions.length;
    });

    // 计算偏离度
    const deviation = expectedCurve.reduce((sum, expected, i) => {
      return sum + Math.abs(expected - actualCurve[i]);
    }, 0) / chapters.length;

    // 识别峰值和谷值
    const peakPoints: { index: number; value: number }[] = [];
    const valleyPoints: { index: number; value: number }[] = [];

    for (let i = 1; i < actualCurve.length - 1; i++) {
      if (actualCurve[i] > actualCurve[i - 1] && actualCurve[i] > actualCurve[i + 1]) {
        peakPoints.push({ index: i, value: actualCurve[i] });
      }
      if (actualCurve[i] < actualCurve[i - 1] && actualCurve[i] < actualCurve[i + 1]) {
        valleyPoints.push({ index: i, value: actualCurve[i] });
      }
    }

    return {
      expectedCurve,
      actualCurve,
      deviation,
      peakPoints,
      valleyPoints
    };
  }

  // 分析分支
  private analyzeBranches(
    chapters: { id: string; name: string; expectedEmotion: number }[],
    playerData: PlayerBehaviorData[]
  ): BranchAnalysis {
    // 统计各选项的选择次数
    const choiceCounts: Map<string, number> = new Map();
    const choiceCompletions: Map<string, { total: number; completed: number }> = new Map();

    playerData.forEach(player => {
      player.choices.forEach(choice => {
        const count = choiceCounts.get(choice.choiceId) || 0;
        choiceCounts.set(choice.choiceId, count + 1);

        const completion = choiceCompletions.get(choice.choiceId) || { total: 0, completed: 0 };
        completion.total++;
        // 简化：假设选了该选项且完成最后一章就算完成该分支
        const lastChapter = chapters[chapters.length - 1];
        if (player.chapterProgress.some(cp => cp.chapterId === lastChapter?.id && cp.completed)) {
          completion.completed++;
        }
        choiceCompletions.set(choice.choiceId, completion);
      });
    });

    const totalChoices = Array.from(choiceCounts.values()).reduce((sum, c) => sum + c, 0);

    // 生成分支分析
    const branches = Array.from(choiceCounts.entries()).map(([choiceId, count]) => {
      const selectionRate = totalChoices > 0 ? count / totalChoices : 0;
      const completion = choiceCompletions.get(choiceId);
      const completionRate = completion && completion.total > 0 
        ? completion.completed / completion.total 
        : 0;

      return {
        branchId: choiceId,
        name: `选项 ${choiceId}`,
        selectionRate,
        completionRate,
        isPopular: selectionRate > PlotBalanceConfig.branch.popularThreshold,
        isDead: selectionRate < PlotBalanceConfig.branch.deadThreshold
      };
    });

    // 计算分支平衡度（标准差越小越平衡）
    const rates = branches.map(b => b.selectionRate);
    const avg = rates.reduce((sum, r) => sum + r, 0) / rates.length;
    const variance = rates.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / rates.length;
    const balanceScore = Math.max(0, 100 - variance * 1000);

    return {
      branches,
      balanceScore
    };
  }

  // 识别流失点
  private identifyDropOffPoints(
    completion: PlotCompletionAnalysis,
    chapters: { id: string; name: string; expectedEmotion: number }[]
  ): DropOffPoint[] {
    const dropOffPoints: DropOffPoint[] = [];

    for (let i = 0; i < completion.chapterRates.length - 1; i++) {
      const currentRate = completion.chapterRates[i].rate;
      const nextRate = completion.chapterRates[i + 1].rate;
      const dropOffRate = currentRate - nextRate;

      if (dropOffRate > PlotBalanceConfig.dropOff.warningThreshold) {
        const chapter = chapters.find(c => c.id === completion.chapterRates[i].chapterId);
        if (chapter) {
          dropOffPoints.push({
            chapterId: chapter.id,
            chapterName: chapter.name,
            dropOffRate,
            severity: dropOffRate > PlotBalanceConfig.dropOff.criticalThreshold ? 'critical' : 'warning',
            possibleReasons: this.inferDropOffReasons(chapter, dropOffRate)
          });
        }
      }
    }

    return dropOffPoints;
  }

  // 推断流失原因
  private inferDropOffReasons(
    chapter: { id: string; name: string; expectedEmotion: number },
    dropOffRate: number
  ): string[] {
    const reasons: string[] = [];

    if (chapter.expectedEmotion < -5) {
      reasons.push('章节情感过于负面');
    }

    if (dropOffRate > 0.3) {
      reasons.push('难度可能过高');
    }

    reasons.push('建议增加存档点或降低难度');

    return reasons;
  }

  // 评估剧情质量
  private assessPlotQuality(data: {
    completion: PlotCompletionAnalysis;
    emotionalCurve: EmotionalCurveAnalysis;
    branchAnalysis: BranchAnalysis;
  }): number {
    // 完成率权重 40%
    const completionScore = data.completion.overallRate * 40;

    // 情感曲线权重 30%
    const emotionScore = (1 - Math.min(1, data.emotionalCurve.deviation / 10)) * 30;

    // 分支平衡权重 20%
    const branchScore = data.branchAnalysis.balanceScore * 0.2;

    // 重玩率权重 10%
    const replayScore = Math.min(10, data.completion.replayRate * 100);

    return Math.round(completionScore + emotionScore + branchScore + replayScore);
  }

  // 生成改进建议
  private generatePlotSuggestions(data: {
    completion: PlotCompletionAnalysis;
    emotionalCurve: EmotionalCurveAnalysis;
    branchAnalysis: BranchAnalysis;
    dropOffPoints: DropOffPoint[];
  }): string[] {
    const suggestions: string[] = [];

    // 基于完成率的建议
    if (data.completion.overallRate < 0.5) {
      suggestions.push(`整体完成率仅${(data.completion.overallRate * 100).toFixed(0)}%，建议简化剧情或增加引导`);
    }

    // 基于情感曲线的建议
    if (data.emotionalCurve.deviation > 5) {
      suggestions.push('情感曲线偏离预期较大，建议调整剧情节奏');
    }

    // 基于分支的建议
    const deadBranches = data.branchAnalysis.branches.filter(b => b.isDead);
    if (deadBranches.length > 0) {
      suggestions.push(`${deadBranches.length}个分支选择率过低，建议优化选项吸引力`);
    }

    const popularBranches = data.branchAnalysis.branches.filter(b => b.isPopular);
    if (popularBranches.length === 1 && data.branchAnalysis.branches.length > 2) {
      suggestions.push('分支选择过于集中，建议平衡各分支吸引力');
    }

    // 基于流失点的建议
    data.dropOffPoints.forEach(point => {
      suggestions.push(`「${point.chapterName}」流失率${(point.dropOffRate * 100).toFixed(0)}%：${point.possibleReasons[0]}`);
    });

    if (suggestions.length === 0) {
      suggestions.push('剧情整体表现良好，继续保持');
    }

    return suggestions;
  }

  // 预测改进效果
  predictImprovement(
    currentAnalysis: PlotAnalysisResult,
    improvements: string[]
  ): { predictedQuality: number; confidence: number } {
    let qualityBoost = 0;

    improvements.forEach(improvement => {
      switch (improvement) {
        case 'simplify_plot':
          qualityBoost += 10;
          break;
        case 'add_checkpoints':
          qualityBoost += 8;
          break;
        case 'balance_branches':
          qualityBoost += 12;
          break;
        case 'adjust_emotion':
          qualityBoost += 7;
          break;
        case 'add_guidance':
          qualityBoost += 5;
          break;
      }
    });

    const predictedQuality = Math.min(100, currentAnalysis.quality + qualityBoost);
    const confidence = Math.min(0.9, 0.5 + improvements.length * 0.1);

    return { predictedQuality, confidence };
  }
}

// 单例导出
export const plotAnalysisEngine = new PlotAnalysisEngine();
