import { VirtualPlayer, PlayerState } from './types';

export interface StateTransition {
  playerId: string;
  fromState: PlayerState;
  toState: PlayerState;
  reason: string;
}

export interface PlayerDataStatistics {
  totalDAU: number;
  newUsers: number;
  retention: { d1: number; d7: number; d30: number };
  payingRate: number;
  arpu: number;
  averageSatisfaction: number;
  averageFatigue: number;
}

export class PlayerStateSimulator {
  private readonly RISK_THRESHOLD_SATISFACTION = 0.3;
  private readonly RISK_THRESHOLD_FATIGUE = 0.8;
  private readonly RISK_THRESHOLD_ACTIVITY = 0.3;
  private readonly LOST_THRESHOLD_DAYS = 14;
  private readonly RETURN_ACTIVITY_THRESHOLD = 0.5;
  private readonly RETURN_SATISFACTION_THRESHOLD = 0.6;

  evaluateStateTransition(player: VirtualPlayer): StateTransition {
    const currentState = player.state;
    let newState: PlayerState = currentState;
    let reason = '';

    if (currentState === 'NEW') {
      if (this.isAtRisk(player)) {
        newState = 'AT_RISK';
        reason = '新用户满意度低或疲劳度高，进入风险状态';
      } else if (player.activityLevel > 0.6) {
        newState = 'ACTIVE';
        reason = '新用户活跃度高，转化为活跃用户';
      }
    } else if (currentState === 'ACTIVE') {
      if (player.spendingProbability > 0.2) {
        newState = 'PAYING';
        reason = '活跃用户消费意愿提升，转化为付费用户';
      } else if (this.isAtRisk(player)) {
        newState = 'AT_RISK';
        reason = '活跃用户满意度下降或疲劳度上升，进入风险状态';
      }
    } else if (currentState === 'PAYING') {
      if (this.isAtRisk(player)) {
        newState = 'AT_RISK';
        reason = '付费用户疲劳度上升，进入风险状态';
      }
    } else if (currentState === 'AT_RISK') {
      if (this.isLost(player)) {
        newState = 'LOST';
        reason = '风险用户长期未登录，已流失';
      } else if (player.satisfaction > 0.6 && player.activityLevel > 0.5) {
        newState = 'ACTIVE';
        reason = '风险用户满意度恢复，重新激活';
      }
    } else if (currentState === 'LOST') {
      if (this.canReturn(player)) {
        newState = 'RETURNED';
        reason = '流失用户满足回归条件，回归游戏';
      }
    } else if (currentState === 'RETURNED') {
      if (this.isAtRisk(player)) {
        newState = 'AT_RISK';
        reason = '回归用户再次进入风险状态';
      } else if (player.activityLevel > 0.6) {
        newState = 'ACTIVE';
        reason = '回归用户活跃度提升，转化为活跃用户';
      }
    }

    return {
      playerId: player.id,
      fromState: currentState,
      toState: newState,
      reason,
    };
  }

  isAtRisk(player: VirtualPlayer): boolean {
    if (player.satisfaction < this.RISK_THRESHOLD_SATISFACTION) {
      return true;
    }

    if (player.fatigue > this.RISK_THRESHOLD_FATIGUE) {
      return true;
    }

    if (player.activityLevel < this.RISK_THRESHOLD_ACTIVITY) {
      return true;
    }

    return false;
  }

  isLost(player: VirtualPlayer): boolean {
    if (player.daysSinceLastLogin >= this.LOST_THRESHOLD_DAYS) {
      return true;
    }

    if (player.satisfaction < 0.1 && player.loyalty < 0.2) {
      return true;
    }

    return false;
  }

  canReturn(player: VirtualPlayer): boolean {
    if (player.daysSinceLastLogin < this.LOST_THRESHOLD_DAYS) {
      return false;
    }

    if (player.activityLevel > this.RETURN_ACTIVITY_THRESHOLD) {
      return true;
    }

    if (player.satisfaction > this.RETURN_SATISFACTION_THRESHOLD) {
      return true;
    }

    return Math.random() < 0.1;
  }

  updateState(player: VirtualPlayer): void {
    const transition = this.evaluateStateTransition(player);
    
    if (transition.fromState !== transition.toState) {
      player.state = transition.toState;
    }

    if (player.state === 'LOST') {
      player.daysSinceLastLogin++;
    } else {
      player.daysSinceLastLogin = 0;
    }
  }

  calculateStatistics(players: VirtualPlayer[]): PlayerDataStatistics {
    if (players.length === 0) {
      return {
        totalDAU: 0,
        newUsers: 0,
        retention: { d1: 0, d7: 0, d30: 0 },
        payingRate: 0,
        arpu: 0,
        averageSatisfaction: 0,
        averageFatigue: 0,
      };
    }

    let totalDAU = 0;
    let newUsers = 0;
    let payingCount = 0;
    let totalSatisfaction = 0;
    let totalFatigue = 0;

    for (const player of players) {
      if (player.state !== 'LOST') {
        totalDAU++;
      }

      if (player.state === 'NEW') {
        newUsers++;
      }

      if (player.state === 'PAYING') {
        payingCount++;
      }

      totalSatisfaction += player.satisfaction;
      totalFatigue += player.fatigue;
    }

    const payingRate = totalDAU > 0 ? payingCount / totalDAU : 0;
    const arpu = payingCount > 0 ? payingCount * 100 / totalDAU : 0;
    const averageSatisfaction = totalSatisfaction / players.length;
    const averageFatigue = totalFatigue / players.length;

    const retention = this.calculateRetention(players);

    return {
      totalDAU,
      newUsers,
      retention,
      payingRate,
      arpu,
      averageSatisfaction,
      averageFatigue,
    };
  }

  applyTagEffect(players: VirtualPlayer[], projectTags: string[]): void {
    const tagEffects: Record<string, { satisfaction: number; activity: number; fatigue: number; loyalty: number }> = {
      '优质剧情': { satisfaction: 0.15, activity: 0.05, fatigue: -0.05, loyalty: 0.1 },
      '角色塑造好': { satisfaction: 0.1, activity: 0.08, fatigue: 0, loyalty: 0.08 },
      '福利多': { satisfaction: 0.05, activity: 0.1, fatigue: 0, loyalty: 0.05 },
      '肝度适中': { satisfaction: 0.08, activity: 0.05, fatigue: -0.1, loyalty: 0.1 },
      '社交性强': { satisfaction: 0.05, activity: 0.15, fatigue: 0, loyalty: 0.05 },
      '更新快': { satisfaction: 0.1, activity: 0.1, fatigue: 0.05, loyalty: 0.08 },
      '活动丰富': { satisfaction: 0.12, activity: 0.12, fatigue: 0.05, loyalty: 0.1 },
      'UI精美': { satisfaction: 0.08, activity: 0, fatigue: -0.02, loyalty: 0.05 },
      '音乐好听': { satisfaction: 0.06, activity: 0.03, fatigue: -0.03, loyalty: 0.05 },
      '氪金点合理': { satisfaction: 0.05, activity: 0.05, fatigue: 0, loyalty: 0.08 },
      '保底机制': { satisfaction: 0.08, activity: 0.05, fatigue: 0, loyalty: 0.1 },
      '卡池丰富': { satisfaction: 0.1, activity: 0.08, fatigue: 0.02, loyalty: 0.06 },
      '每日任务轻松': { satisfaction: 0.05, activity: 0.05, fatigue: -0.08, loyalty: 0.05 },
      'PVP平衡': { satisfaction: 0.08, activity: 0.1, fatigue: 0.05, loyalty: 0.08 },
      '同人创作活跃': { satisfaction: 0.12, activity: 0.08, fatigue: 0, loyalty: 0.1 },
    };

    for (const player of players) {
      for (const tag of projectTags) {
        const effect = tagEffects[tag];
        if (effect) {
          const playStyleWeight = this.getPlayStyleWeight(player.playStyle, tag);
          
          player.satisfaction = Math.max(0, Math.min(1, player.satisfaction + effect.satisfaction * playStyleWeight));
          player.activityLevel = Math.max(0, Math.min(1, player.activityLevel + effect.activity * playStyleWeight));
          player.fatigue = Math.max(0, Math.min(1, player.fatigue + effect.fatigue * playStyleWeight));
          player.loyalty = Math.max(0, Math.min(1, player.loyalty + effect.loyalty * playStyleWeight));
        }
      }
    }
  }

  private calculateRetention(players: VirtualPlayer[]): { d1: number; d7: number; d30: number } {
    let newUserCount = 0;
    let d1Retained = 0;
    let d7Retained = 0;
    let d30Retained = 0;

    for (const player of players) {
      if (player.state === 'NEW') {
        newUserCount++;
        const retentionChance = player.loyalty * player.satisfaction;
        
        if (Math.random() < retentionChance) {
          d1Retained++;
        }
        if (Math.random() < retentionChance * 0.7) {
          d7Retained++;
        }
        if (Math.random() < retentionChance * 0.4) {
          d30Retained++;
        }
      }
    }

    return {
      d1: newUserCount > 0 ? d1Retained / newUserCount : 0,
      d7: newUserCount > 0 ? d7Retained / newUserCount : 0,
      d30: newUserCount > 0 ? d30Retained / newUserCount : 0,
    };
  }

  private getPlayStyleWeight(playStyle: string, tag: string): number {
    const playStyleTagMap: Record<string, string[]> = {
      '剧情党': ['优质剧情', '角色塑造好', '每日任务轻松', '同人创作活跃'],
      '强度党': ['PVP平衡', '福利多', '更新快', '活动丰富'],
      'XP党': ['角色塑造好', '卡池丰富', '同人创作活跃', '音乐好听'],
      '咸鱼党': ['肝度适中', '每日任务轻松', '福利多', 'UI精美'],
      '社交党': ['社交性强', '活动丰富', '同人创作活跃', 'PVP平衡'],
    };

    const relevantTags = playStyleTagMap[playStyle] || [];
    return relevantTags.includes(tag) ? 1.2 : 0.8;
  }
}
