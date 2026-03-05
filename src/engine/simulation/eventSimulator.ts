import type { EventTag } from './tagSystem';

export interface EventSolution {
  id: string;
  description: string;
  cost: number;
  effects: EventEffect;
}

export interface EventEffect {
  shortTerm: {
    satisfaction: number;
    dau: number;
    revenue: number;
  };
  mediumTerm: {
    reputation: number;
  };
  longTerm: {
    brandValue: number;
  };
}

export interface OperationEvent {
  id: string;
  type: '正面' | '负面' | '中性';
  title: string;
  description: string;
  tags: EventTag[];
  solutions: EventSolution[];
  triggered: boolean;
  triggeredAt: number;
}

export interface EventResult {
  triggered: boolean;
  event: OperationEvent | null;
  selectedSolution: EventSolution | null;
  effects: EventEffect | null;
}

const POSITIVE_EVENTS: Omit<OperationEvent, 'id' | 'triggered' | 'triggeredAt'>[] = [
  {
    type: '正面',
    title: '好评如潮',
    description: '玩家们在各大平台疯狂夸赞游戏，话题热度飙升！',
    tags: ['正面', '口碑'],
    solutions: [
      {
        id: 's1',
        description: '乘胜追击，发布感谢公告',
        cost: 100,
        effects: {
          shortTerm: { satisfaction: 3, dau: 5, revenue: 5 },
          mediumTerm: { reputation: 5 },
          longTerm: { brandValue: 3 }
        }
      },
      {
        id: 's2',
        description: '保持低调，继续优化内容',
        cost: 0,
        effects: {
          shortTerm: { satisfaction: 2, dau: 2, revenue: 2 },
          mediumTerm: { reputation: 3 },
          longTerm: { brandValue: 2 }
        }
      }
    ]
  },
  {
    type: '正面',
    title: '意外爆红',
    description: '游戏因为某个角色/剧情突然走红，出圈了！',
    tags: ['正面'],
    solutions: [
      {
        id: 's1',
        description: '顺势推出限时活动',
        cost: 200,
        effects: {
          shortTerm: { satisfaction: 5, dau: 15, revenue: 20 },
          mediumTerm: { reputation: 8 },
          longTerm: { brandValue: 5 }
        }
      },
      {
        id: 's2',
        description: '正常运营，不做大幅改动',
        cost: 50,
        effects: {
          shortTerm: { satisfaction: 3, dau: 8, revenue: 10 },
          mediumTerm: { reputation: 5 },
          longTerm: { brandValue: 3 }
        }
      }
    ]
  },
  {
    type: '正面',
    title: '竞品翻车',
    description: '主要竞争对手出了严重问题，大量玩家流入！',
    tags: ['正面'],
    solutions: [
      {
        id: 's1',
        description: '开启召回活动',
        cost: 150,
        effects: {
          shortTerm: { satisfaction: 2, dau: 20, revenue: 15 },
          mediumTerm: { reputation: 6 },
          longTerm: { brandValue: 4 }
        }
      },
      {
        id: 's2',
        description: '正常运营',
        cost: 0,
        effects: {
          shortTerm: { satisfaction: 1, dau: 10, revenue: 8 },
          mediumTerm: { reputation: 3 },
          longTerm: { brandValue: 2 }
        }
      }
    ]
  }
];

const NEGATIVE_EVENTS: Omit<OperationEvent, 'id' | 'triggered' | 'triggeredAt'>[] = [
  {
    type: '负面',
    title: 'BUG炎上',
    description: '游戏出现严重BUG，玩家集体投诉！',
    tags: ['负面', '危机', '炎上'],
    solutions: [
      {
        id: 's1',
        description: '全服补偿+紧急修复',
        cost: 500,
        effects: {
          shortTerm: { satisfaction: -5, dau: -10, revenue: -5 },
          mediumTerm: { reputation: -3 },
          longTerm: { brandValue: -2 }
        }
      },
      {
        id: 's2',
        description: '仅修复BUG',
        cost: 100,
        effects: {
          shortTerm: { satisfaction: -15, dau: -20, revenue: -10 },
          mediumTerm: { reputation: -8 },
          longTerm: { brandValue: -5 }
        }
      },
      {
        id: 's3',
        description: '装死不管',
        cost: 0,
        effects: {
          shortTerm: { satisfaction: -25, dau: -30, revenue: -15 },
          mediumTerm: { reputation: -15 },
          longTerm: { brandValue: -10 }
        }
      }
    ]
  },
  {
    type: '负面',
    title: '节奏爆发',
    description: '玩家对某个角色/剧情设计强烈不满，节奏起来了！',
    tags: ['负面', '危机'],
    solutions: [
      {
        id: 's1',
        description: '发布声明+紧急调整',
        cost: 300,
        effects: {
          shortTerm: { satisfaction: -3, dau: -5, revenue: -3 },
          mediumTerm: { reputation: -5 },
          longTerm: { brandValue: -3 }
        }
      },
      {
        id: 's2',
        description: '发少量补偿息事宁人',
        cost: 150,
        effects: {
          shortTerm: { satisfaction: -8, dau: -12, revenue: -8 },
          mediumTerm: { reputation: -10 },
          longTerm: { brandValue: -5 }
        }
      },
      {
        id: 's3',
        description: '坚持不改',
        cost: 0,
        effects: {
          shortTerm: { satisfaction: -15, dau: -20, revenue: -12 },
          mediumTerm: { reputation: -15 },
          longTerm: { brandValue: -10 }
        }
      }
    ]
  },
  {
    type: '负面',
    title: '角色炎上',
    description: '某个角色的设计引发巨大争议，被炎上了！',
    tags: ['负面', '危机', '炎上'],
    solutions: [
      {
        id: 's1',
        description: '下架角色+补偿玩家',
        cost: 400,
        effects: {
          shortTerm: { satisfaction: -8, dau: -8, revenue: -10 },
          mediumTerm: { reputation: -5 },
          longTerm: { brandValue: -3 }
        }
      },
      {
        id: 's2',
        description: '发布声明解释设计意图',
        cost: 100,
        effects: {
          shortTerm: { satisfaction: -12, dau: -15, revenue: -8 },
          mediumTerm: { reputation: -8 },
          longTerm: { brandValue: -5 }
        }
      },
      {
        id: 's3',
        description: '不做回应',
        cost: 0,
        effects: {
          shortTerm: { satisfaction: -20, dau: -25, revenue: -15 },
          mediumTerm: { reputation: -15 },
          longTerm: { brandValue: -10 }
        }
      }
    ]
  }
];

const NEUTRAL_EVENTS: Omit<OperationEvent, 'id' | 'triggered' | 'triggeredAt'>[] = [
  {
    type: '中性',
    title: '玩家讨论',
    description: '玩家社区讨论热度上升，成为话题中心',
    tags: ['中性'],
    solutions: [
      {
        id: 's1',
        description: '官方转发互动',
        cost: 50,
        effects: {
          shortTerm: { satisfaction: 3, dau: 5, revenue: 3 },
          mediumTerm: { reputation: 3 },
          longTerm: { brandValue: 2 }
        }
      },
      {
        id: 's2',
        description: '保持观察',
        cost: 0,
        effects: {
          shortTerm: { satisfaction: 1, dau: 2, revenue: 1 },
          mediumTerm: { reputation: 1 },
          longTerm: { brandValue: 1 }
        }
      }
    ]
  },
  {
    type: '中性',
    title: '梗流行',
    description: '游戏相关内容在社交媒体上形成热门梗',
    tags: ['中性'],
    solutions: [
      {
        id: 's1',
        description: '官方玩梗互动',
        cost: 80,
        effects: {
          shortTerm: { satisfaction: 5, dau: 8, revenue: 5 },
          mediumTerm: { reputation: 5 },
          longTerm: { brandValue: 3 }
        }
      },
      {
        id: 's2',
        description: '不做干预',
        cost: 0,
        effects: {
          shortTerm: { satisfaction: 2, dau: 3, revenue: 2 },
          mediumTerm: { reputation: 2 },
          longTerm: { brandValue: 1 }
        }
      }
    ]
  },
  {
    type: '中性',
    title: '二创爆发',
    description: '大量优质同人作品涌现，社区活跃度激增！',
    tags: ['中性', '口碑'],
    solutions: [
      {
        id: 's1',
        description: '官方点赞+推广',
        cost: 30,
        effects: {
          shortTerm: { satisfaction: 5, dau: 5, revenue: 3 },
          mediumTerm: { reputation: 5 },
          longTerm: { brandValue: 4 }
        }
      },
      {
        id: 's2',
        description: '不做干预',
        cost: 0,
        effects: {
          shortTerm: { satisfaction: 3, dau: 3, revenue: 2 },
          mediumTerm: { reputation: 3 },
          longTerm: { brandValue: 2 }
        }
      }
    ]
  }
];

export class EventSimulator {
  private readonly RANDOM_TRIGGER_RATE = 0.01;
  private readonly THRESHOLD_SATISFACTION = 0.3;
  private eventHistory: OperationEvent[] = [];

  private generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  shouldRandomTrigger(): boolean {
    return Math.random() < this.RANDOM_TRIGGER_RATE;
  }

  shouldThresholdTrigger(averageSatisfaction: number): boolean {
    return averageSatisfaction < this.THRESHOLD_SATISFACTION;
  }

  shouldTagTrigger(contentTags: string[]): boolean {
    const triggerTags = ['低爆率', '高难度', '肝'];
    return contentTags.some(tag => triggerTags.includes(tag));
  }

  private selectEventByType(averageSatisfaction: number): Omit<OperationEvent, 'id' | 'triggered' | 'triggeredAt'> | null {
    if (averageSatisfaction < 0.3) {
      const events = [...NEGATIVE_EVENTS, ...NEUTRAL_EVENTS];
      return events[Math.floor(Math.random() * events.length)];
    } else if (averageSatisfaction > 0.7) {
      const events = [...POSITIVE_EVENTS, ...NEUTRAL_EVENTS];
      return events[Math.floor(Math.random() * events.length)];
    } else {
      const allEvents = [...POSITIVE_EVENTS, ...NEGATIVE_EVENTS, ...NEUTRAL_EVENTS];
      return allEvents[Math.floor(Math.random() * allEvents.length)];
    }
  }

  triggerEvent(averageSatisfaction: number, contentTags: string[] = []): OperationEvent | null {
    let shouldTrigger = false;
    let triggerReason = '';

    if (this.shouldRandomTrigger()) {
      shouldTrigger = true;
      triggerReason = '随机触发';
    }

    if (this.shouldThresholdTrigger(averageSatisfaction)) {
      shouldTrigger = true;
      triggerReason = '满意度低于阈值';
    }

    if (this.shouldTagTrigger(contentTags)) {
      shouldTrigger = true;
      triggerReason = 'Tag触发';
    }

    if (!shouldTrigger) {
      return null;
    }

    const eventTemplate = this.selectEventByType(averageSatisfaction);
    
    if (!eventTemplate) {
      return null;
    }

    const event: OperationEvent = {
      ...eventTemplate,
      id: this.generateId(),
      triggered: true,
      triggeredAt: Date.now(),
      description: `${eventTemplate.description} (触发原因: ${triggerReason})`
    };

    this.eventHistory.push(event);
    return event;
  }

  selectSolution(event: OperationEvent, solutionIndex: number): EventSolution | null {
    if (solutionIndex >= 0 && solutionIndex < event.solutions.length) {
      return event.solutions[solutionIndex];
    }
    return null;
  }

  applySolutionEffects(event: OperationEvent, solution: EventSolution): EventEffect {
    return solution.effects;
  }

  getEventHistory(): OperationEvent[] {
    return [...this.eventHistory];
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  simulate(averageSatisfaction: number, contentTags: string[] = []): EventResult {
    const event = this.triggerEvent(averageSatisfaction, contentTags);
    
    if (!event) {
      return {
        triggered: false,
        event: null,
        selectedSolution: null,
        effects: null
      };
    }

    const defaultSolution = event.solutions[0];
    
    return {
      triggered: true,
      event,
      selectedSolution: defaultSolution,
      effects: defaultSolution.effects
    };
  }
}

export const EventSimulatorInstance = new EventSimulator();
