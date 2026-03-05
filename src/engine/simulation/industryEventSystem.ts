export interface IndustryEvent {
  id: string;
  type: '展会' | '政策' | '技术' | '突发事件';
  name: string;
  description: string;
  severity: '低' | '中' | '高';
  
  companyImpact: {
    cashChange: number;
    reputationChange: number;
  };
  
  projectImpact: {
    dauChange: number;
    ratingChange: number;
    newUsersChange: number;
  };
  
  characterImpact?: {
    genres: string[];
    effect: number;
  };
}

export interface IndustryEventResult {
  event: IndustryEvent | null;
  effects: {
    company: { cashChange: number; reputationChange: number };
    project: { dauChange: number; ratingChange: number; newUsersChange: number };
  } | null;
}

const INDUSTRY_EVENTS: Omit<IndustryEvent, 'id'>[] = [
  {
    type: '展会',
    name: '参加ChinaJoy',
    description: '参加年度最大的游戏展会，获得大量曝光',
    severity: '高',
    companyImpact: { cashChange: -500, reputationChange: 5 },
    projectImpact: { dauChange: 100, ratingChange: 0.2, newUsersChange: 50 }
  },
  {
    type: '展会',
    name: '参加TGS东京电玩展',
    description: '参加日本最大游戏展，拓展海外市场',
    severity: '中',
    companyImpact: { cashChange: -300, reputationChange: 3 },
    projectImpact: { dauChange: 50, ratingChange: 0.1, newUsersChange: 30 }
  },
  {
    type: '展会',
    name: '参加CJ星光盛典',
    description: '参加游戏行业颁奖典礼，提升品牌知名度',
    severity: '低',
    companyImpact: { cashChange: -150, reputationChange: 2 },
    projectImpact: { dauChange: 20, ratingChange: 0.1, newUsersChange: 10 }
  },
  {
    type: '政策',
    name: '版号收紧',
    description: '相关部门收紧游戏版号发放，新游戏上线难度增加',
    severity: '高',
    companyImpact: { cashChange: 0, reputationChange: -2 },
    projectImpact: { dauChange: -30, ratingChange: 0, newUsersChange: -20 },
    characterImpact: { genres: ['全部'], effect: -10 }
  },
  {
    type: '政策',
    name: '审核加速',
    description: '游戏审核流程加速，新版本上线更快',
    severity: '中',
    companyImpact: { cashChange: 0, reputationChange: 1 },
    projectImpact: { dauChange: 10, ratingChange: 0, newUsersChange: 15 }
  },
  {
    type: '政策',
    name: '内容监管加强',
    description: '加强对游戏内容的监管，部分角色需调整',
    severity: '中',
    companyImpact: { cashChange: -100, reputationChange: -3 },
    projectImpact: { dauChange: -20, ratingChange: -0.2, newUsersChange: -10 },
    characterImpact: { genres: ['病娇', '虐恋'], effect: -15 }
  },
  {
    type: '技术',
    name: '支持光追技术',
    description: '游戏新增光线追踪技术支持，画面大幅提升',
    severity: '中',
    companyImpact: { cashChange: -200, reputationChange: 3 },
    projectImpact: { dauChange: 30, ratingChange: 0.3, newUsersChange: 20 }
  },
  {
    type: '技术',
    name: '云游戏平台支持',
    description: '游戏登陆云游戏平台，覆盖更多用户',
    severity: '低',
    companyImpact: { cashChange: -100, reputationChange: 2 },
    projectImpact: { dauChange: 50, ratingChange: 0.1, newUsersChange: 40 }
  },
  {
    type: '技术',
    name: 'AI技术突破',
    description: 'AI辅助开发技术成熟，研发效率大幅提升',
    severity: '低',
    companyImpact: { cashChange: 50, reputationChange: 1 },
    projectImpact: { dauChange: 5, ratingChange: 0.1, newUsersChange: 5 }
  },
  {
    type: '突发事件',
    name: '全行业服务器故障',
    description: '行业性服务器故障，玩家体验下降',
    severity: '高',
    companyImpact: { cashChange: -50, reputationChange: -5 },
    projectImpact: { dauChange: -80, ratingChange: -0.5, newUsersChange: -30 }
  },
  {
    type: '突发事件',
    name: '游戏论坛热议',
    description: '游戏相关话题在社交媒体引发热议',
    severity: '低',
    companyImpact: { cashChange: 0, reputationChange: 2 },
    projectImpact: { dauChange: 30, ratingChange: 0.2, newUsersChange: 25 }
  }
];

export class IndustryEventSystem {
  private eventHistory: IndustryEvent[] = [];
  private lastTriggerDay: number = 0;
  private readonly TRIGGER_INTERVAL = 15;

  private generateId(): string {
    return `ind_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initialize(day: number): void {
    this.eventHistory = [];
    this.lastTriggerDay = day;
  }

  shouldTrigger(day: number): boolean {
    return day - this.lastTriggerDay >= this.TRIGGER_INTERVAL;
  }

  triggerEvent(day: number): IndustryEvent | null {
    if (!this.shouldTrigger(day)) {
      return null;
    }

    const severityRand = Math.random();
    let severity: '低' | '中' | '高';
    if (severityRand < 0.6) severity = '低';
    else if (severityRand < 0.9) severity = '中';
    else severity = '高';

    const filteredEvents = INDUSTRY_EVENTS.filter(e => e.severity === severity);
    const events = filteredEvents.length > 0 ? filteredEvents : INDUSTRY_EVENTS;
    
    const eventTemplate = events[Math.floor(Math.random() * events.length)];
    
    const event: IndustryEvent = {
      ...eventTemplate,
      id: this.generateId()
    };

    this.eventHistory.push(event);
    this.lastTriggerDay = day;
    
    return event;
  }

  getEventEffect(event: IndustryEvent): IndustryEventResult['effects'] {
    return {
      company: { ...event.companyImpact },
      project: { ...event.projectImpact }
    };
  }

  simulate(day: number): IndustryEventResult {
    const event = this.triggerEvent(day);
    
    if (!event) {
      return {
        event: null,
        effects: null
      };
    }

    return {
      event,
      effects: this.getEventEffect(event)
    };
  }

  getEventHistory(): IndustryEvent[] {
    return [...this.eventHistory];
  }

  getLastEvent(): IndustryEvent | null {
    return this.eventHistory[this.eventHistory.length - 1] ?? null;
  }

  getState(): { eventHistory: IndustryEvent[]; lastTriggerDay: number } {
    return {
      eventHistory: this.eventHistory,
      lastTriggerDay: this.lastTriggerDay
    };
  }

  setState(state: { eventHistory: IndustryEvent[]; lastTriggerDay: number }): void {
    this.eventHistory = state.eventHistory;
    this.lastTriggerDay = state.lastTriggerDay;
  }

  clearHistory(): void {
    this.eventHistory = [];
  }
}

export const IndustryEventSystemInstance = new IndustryEventSystem();
