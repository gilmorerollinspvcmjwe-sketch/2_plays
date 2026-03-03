import type { PlotBranch, PlotNode, PlotQualityReport } from '@/types/plotBranch';

/**
 * 检测剧情逻辑问题
 * 包括：死胡同节点、不可达节点、循环依赖、条件矛盾
 */
export function checkLogic(branch: PlotBranch): {
  deadEnds: string[];
  unreachableNodes: string[];
  cycles: string[][];
  conditionConflicts: string[];
} {
  const nodes = branch.nodes;
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  // 1. 检测死胡同节点（无出边且非结局节点）
  const deadEnds: string[] = [];
  nodes.forEach(node => {
    if (node.type !== 'ending' && (!node.connections || node.connections.length === 0)) {
      deadEnds.push(node.id);
    }
  });
  
  // 2. 检测不可达节点（从起点无法到达）
  const unreachableNodes: string[] = [];
  const startNode = nodes.find(n => n.type === 'start');
  if (startNode) {
    const reachable = new Set<string>();
    const queue = [startNode.id];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (reachable.has(currentId)) continue;
      reachable.add(currentId);
      
      const node = nodeMap.get(currentId);
      if (node?.connections) {
        queue.push(...node.connections);
      }
    }
    
    nodes.forEach(node => {
      if (!reachable.has(node.id)) {
        unreachableNodes.push(node.id);
      }
    });
  }
  
  // 3. 检测循环依赖
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function findCycles(nodeId: string, path: string[]) {
    if (recursionStack.has(nodeId)) {
      // 发现循环
      const cycleStart = path.indexOf(nodeId);
      if (cycleStart !== -1) {
        cycles.push(path.slice(cycleStart));
      }
      return;
    }
    
    if (visited.has(nodeId)) return;
    
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);
    
    const node = nodeMap.get(nodeId);
    if (node?.connections) {
      node.connections.forEach(nextId => {
        findCycles(nextId, [...path]);
      });
    }
    
    recursionStack.delete(nodeId);
  }
  
  if (startNode) {
    findCycles(startNode.id, []);
  }
  
  // 4. 检测条件矛盾
  const conditionConflicts: string[] = [];
  nodes.forEach(node => {
    if (node.conditions && node.conditions.length > 1) {
      // 检查互斥条件
      const hasAffinityMin = node.conditions.some(c => c.type === 'affinity' && (c.operator === '>' || c.operator === '>='));
      const hasAffinityMax = node.conditions.some(c => c.type === 'affinity' && (c.operator === '<' || c.operator === '<='));
      
      if (hasAffinityMin && hasAffinityMax) {
        const minValue = Math.max(...node.conditions
          .filter(c => c.type === 'affinity' && (c.operator === '>' || c.operator === '>='))
          .map(c => c.value as number));
        const maxValue = Math.min(...node.conditions
          .filter(c => c.type === 'affinity' && (c.operator === '<' || c.operator === '<='))
          .map(c => c.value as number));
        
        if (minValue > maxValue) {
          conditionConflicts.push(`节点 ${node.id}: 好感度条件矛盾 (${minValue} > ${maxValue})`);
        }
      }
    }
  });
  
  return { deadEnds, unreachableNodes, cycles, conditionConflicts };
}

/**
 * 计算情感浓度
 * 基于情感关键词的密度和分布
 */
export function calculateEmotionDensity(branch: PlotBranch): {
  overallScore: number;
  emotionDistribution: Record<string, number>;
  emotionCurve: number[];
  suggestions: string[];
} {
  const emotionKeywords: Record<string, string[]> = {
    joy: ['开心', '快乐', '幸福', '喜欢', '爱', '甜蜜', '温暖'],
    sadness: ['伤心', '难过', '痛苦', '悲伤', '哭泣', '失落'],
    anger: ['生气', '愤怒', '讨厌', '恨', '不满'],
    fear: ['害怕', '恐惧', '担心', '紧张', '不安'],
    surprise: ['惊讶', '震惊', '意外', '没想到'],
    tenderness: ['温柔', '体贴', '关心', '照顾', '呵护']
  };
  
  const emotionCounts: Record<string, number> = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    tenderness: 0
  };
  
  const emotionCurve: number[] = [];
  const nodes = branch.nodes;
  
  // 计算每个节点的情感分数
  nodes.forEach(node => {
    let nodeEmotionScore = 0;
    const content = node.content || '';
    
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        const count = (content.match(new RegExp(keyword, 'g')) || []).length;
        emotionCounts[emotion] += count;
        nodeEmotionScore += count;
      });
    });
    
    emotionCurve.push(Math.min(10, nodeEmotionScore));
  });
  
  // 计算总体情感浓度
  const totalEmotions = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
  const totalContent = nodes.reduce((sum, n) => sum + (n.content?.length || 0), 0);
  const overallScore = totalContent > 0 ? Math.min(100, (totalEmotions / totalContent) * 1000) : 0;
  
  // 计算情感分布
  const emotionDistribution: Record<string, number> = {};
  Object.entries(emotionCounts).forEach(([emotion, count]) => {
    emotionDistribution[emotion] = totalEmotions > 0 ? Math.round((count / totalEmotions) * 100) : 0;
  });
  
  // 生成建议
  const suggestions: string[] = [];
  
  if (overallScore < 10) {
    suggestions.push('情感浓度偏低，建议增加更多情感描写');
  } else if (overallScore > 50) {
    suggestions.push('情感浓度偏高，注意避免过度煽情');
  }
  
  if (emotionDistribution.joy > 60) {
    suggestions.push('正面情感占比过高，建议增加一些冲突和波折');
  }
  if (emotionDistribution.sadness > 40) {
    suggestions.push('负面情感占比较高，注意平衡剧情氛围');
  }
  
  // 检查情感曲线波动
  let fluctuationCount = 0;
  for (let i = 1; i < emotionCurve.length; i++) {
    if (Math.abs(emotionCurve[i] - emotionCurve[i - 1]) > 5) {
      fluctuationCount++;
    }
  }
  
  if (fluctuationCount > emotionCurve.length * 0.5) {
    suggestions.push('情感波动过于频繁，建议让情感变化更加自然流畅');
  }
  
  return { overallScore, emotionDistribution, emotionCurve, suggestions };
}

/**
 * 评估分支丰富度
 */
export function evaluateBranchRichness(branch: PlotBranch): {
  branchFactor: number;
  meaningfulChoiceRatio: number;
  impactScore: number;
  suggestions: string[];
} {
  const nodes = branch.nodes;
  const choiceNodes = nodes.filter(n => n.type === 'choice');
  
  // 1. 计算分支因子（平均每个选择的分支数）
  let totalBranches = 0;
  choiceNodes.forEach(node => {
    totalBranches += node.connections?.length || 0;
  });
  const branchFactor = choiceNodes.length > 0 ? totalBranches / choiceNodes.length : 0;
  
  // 2. 计算有意义选择比例（导致不同结局的选择）
  const endings = branch.endings || [];
  let meaningfulChoices = 0;
  
  choiceNodes.forEach(node => {
    // 检查这个选择是否会导致不同的结局
    const reachableEndings = new Set<string>();
    
    function findEndings(nodeId: string, visited: Set<string>) {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      if (node.type === 'ending') {
        const ending = endings.find(e => e.id === nodeId);
        if (ending) reachableEndings.add(ending.id);
      }
      
      node.connections?.forEach(nextId => findEndings(nextId, new Set(visited)));
    }
    
    node.connections?.forEach(nextId => {
      findEndings(nextId, new Set());
    });
    
    if (reachableEndings.size > 1) {
      meaningfulChoices++;
    }
  });
  
  const meaningfulChoiceRatio = choiceNodes.length > 0 ? meaningfulChoices / choiceNodes.length : 0;
  
  // 3. 计算影响度分数（基于结局多样性）
  const endingTypes = new Set(endings.map(e => e.type)).size;
  const impactScore = endings.length > 0 ? (endingTypes / endings.length) * 100 : 0;
  
  // 生成建议
  const suggestions: string[] = [];
  
  if (branchFactor < 2) {
    suggestions.push('分支因子偏低，建议增加更多选择分支');
  } else if (branchFactor > 4) {
    suggestions.push('分支过多，可能导致剧情过于复杂');
  }
  
  if (meaningfulChoiceRatio < 0.3) {
    suggestions.push('有意义的选择比例较低，建议让选择对剧情产生更大影响');
  }
  
  if (endings.length < 3) {
    suggestions.push('结局数量较少，建议增加更多结局以提升重玩价值');
  }
  
  if (endingTypes < 3 && endings.length >= 3) {
    suggestions.push('结局类型较为单一，建议增加不同类型的结局');
  }
  
  return { branchFactor, meaningfulChoiceRatio, impactScore, suggestions };
}

/**
 * 生成综合优化建议
 */
export function generateSuggestions(branch: PlotBranch): string[] {
  const suggestions: string[] = [];
  
  // 逻辑检查建议
  const logicIssues = checkLogic(branch);
  if (logicIssues.deadEnds.length > 0) {
    suggestions.push(`发现 ${logicIssues.deadEnds.length} 个死胡同节点，请检查并添加后续连接`);
  }
  if (logicIssues.unreachableNodes.length > 0) {
    suggestions.push(`发现 ${logicIssues.unreachableNodes.length} 个不可达节点，请检查入口连接`);
  }
  if (logicIssues.cycles.length > 0) {
    suggestions.push(`发现 ${logicIssues.cycles.length} 个循环依赖，请确保循环是设计意图`);
  }
  if (logicIssues.conditionConflicts.length > 0) {
    suggestions.push(`发现 ${logicIssues.conditionConflicts.length} 个条件冲突，请检查条件设置`);
  }
  
  // 情感浓度建议
  const emotionAnalysis = calculateEmotionDensity(branch);
  suggestions.push(...emotionAnalysis.suggestions);
  
  // 分支丰富度建议
  const richnessAnalysis = evaluateBranchRichness(branch);
  suggestions.push(...richnessAnalysis.suggestions);
  
  // 结构建议
  const nodes = branch.nodes;
  const startNode = nodes.find(n => n.type === 'start');
  const endingNodes = nodes.filter(n => n.type === 'ending');
  
  if (!startNode) {
    suggestions.push('缺少开始节点，请添加一个起点');
  }
  
  if (endingNodes.length === 0) {
    suggestions.push('缺少结局节点，请至少添加一个结局');
  }
  
  // 检查剧情长度
  const avgNodeContent = nodes.reduce((sum, n) => sum + (n.content?.length || 0), 0) / nodes.length;
  if (avgNodeContent < 20) {
    suggestions.push('节点内容平均长度较短，建议增加更多细节描写');
  }
  
  // 检查选择分布
  const choiceNodes = nodes.filter(n => n.type === 'choice');
  const dialogueNodes = nodes.filter(n => n.type === 'dialogue');
  if (choiceNodes.length > 0 && dialogueNodes.length / choiceNodes.length < 2) {
    suggestions.push('选择点过于密集，建议在关键决策点设置选择');
  }
  
  return suggestions;
}

/**
 * 生成完整的剧情质量报告
 */
export function generateQualityReport(branch: PlotBranch): PlotQualityReport {
  const logicCheck = checkLogic(branch);
  const emotionAnalysis = calculateEmotionDensity(branch);
  const richnessAnalysis = evaluateBranchRichness(branch);
  const suggestions = generateSuggestions(branch);
  
  // 计算综合评分
  const logicScore = Math.max(0, 100 - 
    (logicCheck.deadEnds.length * 10) -
    (logicCheck.unreachableNodes.length * 10) -
    (logicCheck.cycles.length * 5) -
    (logicCheck.conditionConflicts.length * 5)
  );
  
  const emotionScore = Math.min(100, emotionAnalysis.overallScore * 2);
  const branchScore = Math.min(100, 
    (richnessAnalysis.branchFactor * 20) +
    (richnessAnalysis.meaningfulChoiceRatio * 50) +
    (richnessAnalysis.impactScore * 0.3)
  );
  
  const overallScore = Math.round((logicScore + emotionScore + branchScore) / 3);
  
  return {
    logicScore: Math.round(logicScore),
    emotionScore: Math.round(emotionScore),
    branchScore: Math.round(branchScore),
    overallScore,
    suggestions: suggestions.slice(0, 10), // 最多10条建议
    details: {
      deadEnds: logicCheck.deadEnds,
      unreachableNodes: logicCheck.unreachableNodes,
      emotionDistribution: emotionAnalysis.emotionDistribution,
      branchFactor: richnessAnalysis.branchFactor
    }
  };
}

/**
 * 分析特定节点的上下文
 */
export function analyzeNodeContext(branch: PlotBranch, nodeId: string): {
  predecessors: string[];
  successors: string[];
  depth: number;
  reachableEndings: string[];
} {
  const nodes = branch.nodes;
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  // 找到前驱节点
  const predecessors: string[] = [];
  nodes.forEach(node => {
    if (node.connections?.includes(nodeId)) {
      predecessors.push(node.id);
    }
  });
  
  // 找到后继节点
  const node = nodeMap.get(nodeId);
  const successors = node?.connections || [];
  
  // 计算节点深度（从起点到该节点的距离）
  let depth = 0;
  const startNode = nodes.find(n => n.type === 'start');
  if (startNode) {
    const queue: Array<{ id: string; d: number }> = [{ id: startNode.id, d: 0 }];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const { id, d } = queue.shift()!;
      if (id === nodeId) {
        depth = d;
        break;
      }
      if (visited.has(id)) continue;
      visited.add(id);
      
      const n = nodeMap.get(id);
      n?.connections?.forEach(nextId => {
        queue.push({ id: nextId, d: d + 1 });
      });
    }
  }
  
  // 找到从该节点可达的结局
  const reachableEndings: string[] = [];
  const visited = new Set<string>();
  
  function findEndings(currentId: string) {
    if (visited.has(currentId)) return;
    visited.add(currentId);
    
    const n = nodeMap.get(currentId);
    if (!n) return;
    
    if (n.type === 'ending') {
      const ending = branch.endings?.find(e => e.id === currentId);
      if (ending) reachableEndings.push(ending.name);
    }
    
    n.connections?.forEach(nextId => findEndings(nextId));
  }
  
  findEndings(nodeId);
  
  return { predecessors, successors, depth, reachableEndings };
}

/**
 * 比较两个剧情的相似度
 */
export function comparePlots(branchA: PlotBranch, branchB: PlotBranch): {
  similarityScore: number;
  commonNodes: string[];
  uniqueToA: string[];
  uniqueToB: string[];
} {
  const nodesA = new Set(branchA.nodes.map(n => n.content));
  const nodesB = new Set(branchB.nodes.map(n => n.content));
  
  const commonNodes: string[] = [];
  const uniqueToA: string[] = [];
  const uniqueToB: string[] = [];
  
  nodesA.forEach(content => {
    if (nodesB.has(content)) {
      commonNodes.push(content);
    } else {
      uniqueToA.push(content);
    }
  });
  
  nodesB.forEach(content => {
    if (!nodesA.has(content)) {
      uniqueToB.push(content);
    }
  });
  
  const totalNodes = nodesA.size + nodesB.size - commonNodes.length;
  const similarityScore = totalNodes > 0 ? (commonNodes.length / totalNodes) * 100 : 0;
  
  return { similarityScore, commonNodes, uniqueToA, uniqueToB };
}
