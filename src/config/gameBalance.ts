/**
 * 游戏数值平衡配置
 * 统一管理中心，便于调整和平衡
 */

// 项目评估权重
export const ProjectBalanceConfig = {
  healthWeights: {
    characterCompletion: 0.30,
    plotCompletion: 0.30,
    teamMatch: 0.20,
    budget: 0.20
  },
  ratingFormula: {
    baseScore: 5,
    characterBonus: 0.3,
    plotBonus: 0.3,
    teamBonus: 0.5
  },
  revenueFormula: {
    marketSize: 1000000,
    ratingMultiplier: 0.1,
    positioningMultiplier: {
      mass: 1.2,
      niche: 0.8,
      experimental: 1.0
    }
  }
};

// 运营联动系数
export const OperationBalanceConfig = {
  gacha: {
    rateSatisfactionImpact: -7.5,
    upCharacterRevenueBoost: 0.20,
    frequencyFatigueRate: 0.05
  },
  event: {
    budgetParticipationMultiplier: {
      low: 1.0,
      medium: 1.5,
      high: 2.0
    },
    typeMultiplier: {
      festival: 1.5,
      birthday: 2.0,
      collaboration: 2.5
    },
    difficultySatisfactionImpact: -0.3,
    rewardValueSatisfactionImpact: 0.2
  },
  welfare: {
    baseSatisfactionBoost: 5,
    valueMultiplier: 0.01,
    diminishingReturns: 0.8
  },
  feedbackDelay: {
    immediate: { min: 0, max: 0 },
    short: { min: 1, max: 3 },
    medium: { min: 7, max: 14 },
    long: { min: 30, max: 90 }
  }
};

// 员工效率系数
export const EmployeeBalanceConfig = {
  efficiency: {
    baseMultiplier: 1.0,
    fatiguePenaltyRate: 0.02,
    satisfactionBonusRate: 0.01,
    specialtyBonus: 0.20,
    traitBonuses: {
      hardworking: 0.10,
      creative: 0.15,
      efficient: 0.15,
      detail_oriented: 0.10,
      perfectionist: 0.10
    }
  },
  turnover: {
    fatigueThreshold: 80,
    satisfactionThreshold: 20,
    salaryGapThreshold: 0.8,
    baseRiskRate: 0.02
  }
};

// 角色价值系数
export const CharacterBalanceConfig = {
  popularity: {
    baseScore: 30,
    plotExposureWeight: 0.25,
    gachaExposureWeight: 0.35,
    socialMentionWeight: 0.20,
    playerInteractionWeight: 0.20
  },
  commercial: {
    popularityWeight: 0.4,
    conversionWeight: 0.3,
    merchandiseWeight: 0.3
  },
  cp: {
    chemistryBase: 0.5,
    interactionQualityWeight: 0.3,
    fanVoteWeight: 0.2
  }
};

// 剧情分析阈值
export const PlotBalanceConfig = {
  dropOff: {
    warningThreshold: 0.15,
    criticalThreshold: 0.30
  },
  branch: {
    popularThreshold: 0.40,
    deadThreshold: 0.05
  },
  emotion: {
    maxDeviation: 20
  }
};

// 联动规则配置
export const LinkageRulesConfig = {
  // 卡池 → 玩家数据
  gachaToPlayer: {
    rateChange: {
      satisfactionImpact: -7.5,
      delay: 'immediate',
      duration: 7
    },
    upCharacter: {
      revenueBoost: 0.20,
      delay: 'immediate',
      duration: 14
    }
  },
  // 活动 → 运营事件
  eventToIncident: {
    tooHard: {
      triggerThreshold: 80,
      probability: 0.3,
      delay: 'short'
    },
    poorReward: {
      triggerThreshold: 30,
      probability: 0.4,
      delay: 'short'
    }
  },
  // 玩家数据 → 市场情报
  playerToMarket: {
    dauChange: {
      marketShareImpact: 0.5,
      delay: 'medium'
    },
    ratingChange: {
      reputationImpact: 1.0,
      delay: 'medium'
    }
  },
  // 运营事件 → 社交广场
  incidentToSocial: {
    complaintSpread: {
      multiplier: 1.5,
      delay: 'immediate'
    }
  }
};

// 动态调整管理器
export class BalanceManager {
  private config = {
    project: ProjectBalanceConfig,
    operation: OperationBalanceConfig,
    employee: EmployeeBalanceConfig,
    character: CharacterBalanceConfig,
    plot: PlotBalanceConfig,
    linkage: LinkageRulesConfig
  };

  // 根据游戏阶段自动调整难度
  adjustForGameStage(stage: 'early' | 'mid' | 'late'): void {
    switch (stage) {
      case 'early':
        this.config.operation.gacha.rateSatisfactionImpact = -5;
        this.config.employee.turnover.baseRiskRate = 0.01;
        break;
      case 'mid':
        this.config.operation.gacha.rateSatisfactionImpact = -7.5;
        this.config.employee.turnover.baseRiskRate = 0.02;
        break;
      case 'late':
        this.config.operation.gacha.rateSatisfactionImpact = -10;
        this.config.employee.turnover.baseRiskRate = 0.03;
        break;
    }
  }

  // 根据玩家表现动态调整
  adjustForPerformance(performance: 'poor' | 'average' | 'good'): void {
    switch (performance) {
      case 'poor':
        this.config.project.revenueFormula.ratingMultiplier = 0.12;
        break;
      case 'average':
        this.config.project.revenueFormula.ratingMultiplier = 0.10;
        break;
      case 'good':
        this.config.project.revenueFormula.ratingMultiplier = 0.08;
        break;
    }
  }

  getConfig() {
    return this.config;
  }
}

export const balanceManager = new BalanceManager();
