// 竞品AI决策引擎

import type {
  CompetitorAI,
  AIAction,
  AIActionType,
  AIStrategyType,
  Perception,
  ScoredAction,
  GameState,
} from '@/types/competitor';

// 市场状态（从外部传入）
export interface MarketState {
  trendingGenres: string[];
  seasonEffect: number;
  saturation: number;
  totalMarketSize: number;
}

// 玩家公司状态（从外部传入）
export interface PlayerCompanyState {
  totalPlayers: number;
  revenue: number;
  satisfaction: number;
  threatLevel: number;
}

export class CompetitorAIEngine {
  /**
   * 每日AI决策
   * 每个竞品公司独立决策，互不影响
   */
  dailyDecision(
    competitor: CompetitorAI,
    marketState: MarketState,
    playerState: PlayerCompanyState,
    currentDay: number
  ): AIAction[] {
    const actions: AIAction[] = [];
    
    // 1. 感知环境
    const perception = this.perceiveEnvironment(competitor, marketState, playerState);
    
    // 2. 评估当前策略是否需要调整
    if (this.shouldChangeStrategy(competitor, perception, currentDay)) {
      const newStrategy = this.chooseNewStrategy(competitor, perception);
      competitor.currentStrategy = {
        ...newStrategy,
        startDay: currentDay,
      };
      competitor.strategyHistory.push({
        type: competitor.currentStrategy.type,
        startDay: competitor.currentStrategy.startDay,
        result: 'ongoing',
      });
    }
    
    // 3. 根据策略和个性生成行动
    const candidates = this.generateActionCandidates(competitor, perception, currentDay);
    
    // 4. 根据决策权重评分并选择
    const scored = this.scoreActions(competitor, candidates, perception);
    const selected = this.selectActions(scored, competitor.riskTolerance);
    
    // 5. 添加个性化随机事件
    const personalityActions = this.personalityDrivenActions(competitor, perception, currentDay);
    
    return [...selected, ...personalityActions];
  }
  
  /**
   * 环境感知
   */
  private perceiveEnvironment(
    competitor: CompetitorAI,
    market: MarketState,
    player: PlayerCompanyState
  ): Perception {
    return {
      hotGenres: market.trendingGenres,
      seasonBonus: market.seasonEffect,
      playerThreatLevel: this.assessPlayerThreat(competitor, player),
      competitorPositions: [],
      marketSaturation: market.saturation,
      financialHealth: competitor.treasury / (competitor.totalRevenue * 0.1 + 10000),
      gamesHealth: competitor.games.map(g => ({
        gameId: g.id,
        health: this.assessGameHealth(g),
        urgency: this.assessUrgency(g),
      })),
      opportunities: this.detectOpportunities(competitor, market, player),
    };
  }
  
  /**
   * 评估玩家威胁程度
   */
  private assessPlayerThreat(competitor: CompetitorAI, player: PlayerCompanyState): number {
    const playerRevenue = player.revenue;
    const competitorRevenue = competitor.totalRevenue;
    
    if (playerRevenue > competitorRevenue * 2) return 0.8;
    if (playerRevenue > competitorRevenue * 1.5) return 0.6;
    if (playerRevenue > competitorRevenue) return 0.4;
    return 0.2;
  }
  
  /**
   * 评估游戏健康度
   */
  private assessGameHealth(game: any): number {
    const ratingScore = game.rating / 10;
    const trendScore = game.trend === 'rising' ? 1 : game.trend === 'declining' ? 0.3 : 0.6;
    const stateScore = this.getStateScore(game.state);
    
    return (ratingScore * 0.4 + trendScore * 0.3 + stateScore * 0.3);
  }
  
  private getStateScore(state: GameState): number {
    const scores: Record<GameState, number> = {
      'pre_launch': 0.5,
      'launched': 0.8,
      'operating': 0.7,
      'peak': 1.0,
      'declining': 0.3,
      'revival': 0.6,
      'sunset': 0.2,
    };
    return scores[state];
  }
  
  /**
   * 评估紧急程度
   */
  private assessUrgency(game: any): number {
    if (game.trend === 'crashing') return 1.0;
    if (game.trend === 'declining') return 0.7;
    if (game.daysSinceLastUpdate > 30) return 0.5;
    return 0.2;
  }
  
  /**
   * 检测机会窗口
   */
  private detectOpportunities(
    competitor: CompetitorAI,
    market: MarketState,
    player: PlayerCompanyState
  ): string[] {
    const opportunities: string[] = [];
    
    if (market.seasonEffect > 0.3) {
      opportunities.push('season_bonus');
    }
    
    if (player.threatLevel < 0.3) {
      opportunities.push('weak_competitor');
    }
    
    if (competitor.treasury > 3000000) {
      opportunities.push('充足资金');
    }
    
    return opportunities;
  }
  
  /**
   * 判断是否需要改变策略
   */
  private shouldChangeStrategy(
    competitor: CompetitorAI,
    perception: Perception,
    currentDay: number
  ): boolean {
    // 每30天强制评估一次
    if ((currentDay - competitor.currentStrategy.startDay) >= 30) {
      return true;
    }
    
    // 财务危机
    if (perception.financialHealth < 0.5) {
      return true;
    }
    
    // 游戏健康度严重下降
    for (const gameHealth of perception.gamesHealth) {
      if (gameHealth.health < 0.3) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 选择新策略
   */
  private chooseNewStrategy(
    competitor: CompetitorAI,
    perception: Perception
  ): { type: AIStrategyType; targetMetric: string } {
    const { personality } = competitor;
    
    // 根据个性和环境选择策略
    if (perception.financialHealth < 0.3) {
      return { type: 'cost_cutting', targetMetric: 'treasury' };
    }
    
    if (perception.playerThreatLevel > 0.7) {
      return { type: 'market_defense', targetMetric: 'marketShare' };
    }
    
    switch (personality) {
      case 'innovator':
        return { type: 'aggressive_growth', targetMetric: 'marketShare' };
      case 'steady':
        return { type: 'quality_focus', targetMetric: 'reputation' };
      case 'monetizer':
        return { type: 'monetization_push', targetMetric: 'revenue' };
      case 'disruptor':
        return { type: 'event_hijack', targetMetric: 'marketShare' };
      case 'craftsman':
        return { type: 'quality_focus', targetMetric: 'reputation' };
      case 'learner':
        return { type: 'copycat', targetMetric: 'marketShare' };
      default:
        return { type: 'player_retention', targetMetric: 'satisfaction' };
    }
  }
  
  /**
   * 生成候选行动
   */
  private generateActionCandidates(
    competitor: CompetitorAI,
    perception: Perception,
    currentDay: number
  ): AIAction[] {
    const candidates: AIAction[] = [];
    const { currentStrategy } = competitor;
    
    // 根据策略类型生成对应行动
    switch (currentStrategy.type) {
      case 'aggressive_growth':
        candidates.push(this.createAction('marketing_campaign', currentDay, {}));
        candidates.push(this.createAction('launch_gacha', currentDay, {}));
        break;
      case 'monetization_push':
        candidates.push(this.createAction('launch_gacha', currentDay, {}));
        candidates.push(this.createAction('start_event', currentDay, {}));
        break;
      case 'quality_focus':
        if (this.canReleaseUpdate(competitor)) {
          candidates.push(this.createAction('release_update', currentDay, {}));
        }
        break;
      case 'player_retention':
        candidates.push(this.createAction('welfare_distribution', currentDay, {}));
        break;
      case 'market_defense':
        candidates.push(this.createAction('price_war', currentDay, {}));
        candidates.push(this.createAction('start_event', currentDay, {}));
        break;
      case 'event_hijack':
        candidates.push(this.createAction('marketing_campaign', currentDay, {}));
        break;
    }
    
    return candidates;
  }
  
  private canReleaseUpdate(competitor: CompetitorAI): boolean {
    for (const game of competitor.games) {
      if (game.daysSinceLastUpdate >= 30) {
        return true;
      }
    }
    return false;
  }
  
  private createAction(type: AIActionType, day: number, params: Record<string, any>): AIAction {
    return {
      id: `action_${day}_${Math.random().toString(36).slice(2)}`,
      type,
      day,
      params,
    };
  }
  
  /**
   * 评分行动
   */
  private scoreActions(
    competitor: CompetitorAI,
    actions: AIAction[],
    perception: Perception
  ): ScoredAction[] {
    const { decisionWeights } = competitor;
    
    return actions.map(action => {
      let score = 50; // 基础分
      
      // 根据行动类型评分
      switch (action.type) {
        case 'launch_gacha':
          score += decisionWeights.revenue * 30;
          break;
        case 'start_event':
          score += decisionWeights.marketShare * 20;
          break;
        case 'release_update':
          score += decisionWeights.reputation * 40;
          break;
        case 'welfare_distribution':
          score += decisionWeights.playerSatisfaction * 30;
          break;
        case 'marketing_campaign':
          score += decisionWeights.marketShare * 25;
          break;
        case 'price_war':
          score += decisionWeights.revenue * 20 - decisionWeights.reputation * 10;
          break;
      }
      
      // 根据财务状况调整
      if (perception.financialHealth < 0.5) {
        score -= 20; // 财务紧张时减少行动
      }
      
      return {
        action,
        score: Math.max(0, Math.min(100, score)),
        reason: `基于${competitor.personality}人格评估`,
      };
    });
  }
  
  /**
   * 选择行动
   */
  private selectActions(scored: ScoredAction[], riskTolerance: number): AIAction[] {
    // 风险承受度高则多选，风险承受度低则少选
    const count = Math.ceil(scored.length * (0.3 + riskTolerance * 0.7));
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(s => s.action);
  }
  
  /**
   * 个性化行为（每种AI人格有独特的行为模式）
   */
  private personalityDrivenActions(
    competitor: CompetitorAI,
    perception: Perception,
    currentDay: number
  ): AIAction[] {
    const { personality, treasury } = competitor;
    
    switch (personality) {
      case 'innovator':
        // 10%概率做一个"创新"行动
        if (Math.random() < 0.1) {
          return [this.createAction('launch_new_game', currentDay, { genre: '创新题材' })];
        }
        break;
        
      case 'monetizer':
        // 资金低于阈值时立刻开卡池
        if (treasury < 500000) {
          return [this.createAction('launch_gacha', currentDay, { urgent: true })];
        }
        break;
        
      case 'disruptor':
        // 15%概率制造争议事件
        if (Math.random() < 0.15) {
          return [this.createAction('marketing_campaign', currentDay, { controversial: true })];
        }
        break;
        
      case 'learner':
        // 观察排名第一的公司并模仿
        if (perception.opportunities.includes('weak_competitor')) {
          return [this.createAction('copycat', currentDay, { target: 'player' })];
        }
        break;
        
      case 'craftsman':
        // 版本更新间隔必须>30天，不主动做其他操作
        break;
        
      case 'steady':
        // 维持均衡，不做极端操作
        break;
    }
    return [];
  }
}
