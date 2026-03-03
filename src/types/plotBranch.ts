/**
 * 剧情分支系统类型定义
 */

export type PlotNodeType = 'start' | 'dialogue' | 'choice' | 'condition' | 'ending' | 'event';
export type PlotConditionType = 'affection' | 'item' | 'flag' | 'random' | 'time';
export type EndingType = 'he' | 'be' | 'ne' | 'secret';

export interface PlotNode {
  id: string;
  type: PlotNodeType;
  content: string;
  characterId?: string;
  position: { x: number; y: number };
  connections: string[];
  conditions?: PlotCondition[];
  effects?: PlotEffect[];
  emotion?: number; // -1 to 1
}

export interface PlotCondition {
  type: PlotConditionType;
  target: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  value: number | string | boolean;
}

export interface PlotEffect {
  type: 'affection' | 'item' | 'flag' | 'emotion';
  target: string;
  value: number | string | boolean;
}

export interface Ending {
  id: string;
  type: EndingType;
  title: string;
  description: string;
  conditions: PlotCondition[];
  unlockRequirements?: string[];
}

export interface PlotBranch {
  id: string;
  name: string;
  description: string;
  nodes: PlotNode[];
  endings: Ending[];
  emotionCurve: number[];
  estimatedDuration: number; // minutes
  complexity: number; // 0-100
}

export interface PlotQualityReport {
  logicScore: number;
  emotionScore: number;
  branchScore: number;
  overallScore: number;
  issues: string[];
  suggestions: string[];
}

export function initPlotBranch(): PlotBranch {
  return {
    id: `plot_${Date.now()}`,
    name: '新剧情分支',
    description: '',
    nodes: [{
      id: 'start',
      type: 'start',
      content: '剧情开始',
      position: { x: 400, y: 50 },
      connections: []
    }],
    endings: [],
    emotionCurve: [],
    estimatedDuration: 0,
    complexity: 0
  };
}

export function analyzePlotQuality(plot: PlotBranch): PlotQualityReport {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // 逻辑检查
  const disconnectedNodes = plot.nodes.filter(n => 
    n.type !== 'start' && n.type !== 'ending' && 
    !plot.nodes.some(other => other.connections.includes(n.id))
  );
  if (disconnectedNodes.length > 0) {
    issues.push(`${disconnectedNodes.length}个节点未连接`);
  }
  
  // 结局检查
  if (plot.endings.length === 0) {
    issues.push('没有设置结局');
    suggestions.push('建议至少设置1个结局');
  }
  
  // 复杂度检查
  const choiceNodes = plot.nodes.filter(n => n.type === 'choice').length;
  if (choiceNodes < 3) {
    suggestions.push('增加更多选择节点可以提升玩家体验');
  }
  
  const logicScore = disconnectedNodes.length === 0 ? 90 : 60;
  const emotionScore = plot.emotionCurve.length > 0 ? 80 : 50;
  const branchScore = Math.min(100, choiceNodes * 15);
  const overallScore = Math.round((logicScore + emotionScore + branchScore) / 3);
  
  return {
    logicScore,
    emotionScore,
    branchScore,
    overallScore,
    issues,
    suggestions
  };
}
