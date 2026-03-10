import type { Employee } from '@/types/employee';
import type { ProjectOperationData } from '@/types/simulation';
import { ExtendedEventGenerator, type ExtendedEventType, type ExtendedDailyEvent } from './extendedEventLibrary';

export type DailyEventType = 
  | 'employee_sick'
  | 'employee_award'
  | 'employee_leave'
  | 'influencer_recommend'
  | 'social_media_viral'
  | 'server_crash'
  | 'negative_publicity'
  | 'player_request'
  | 'collaboration_invite'
  | 'investment'
  | ExtendedEventType;

export interface DailyEvent {
  id: string;
  type: DailyEventType;
  category: 'employee' | 'positive' | 'negative' | 'neutral' | 'special';
  title: string;
  description: string;
  impact: {
    revenueChange?: number;
    satisfactionChange?: number;
    reputationChange?: number;
    playerChange?: number;
    fatigueChange?: number;
    experienceBonus?: number;
    investmentAmount?: number;
  };
  duration?: number;
  affectedProjectId?: string;
  affectedEmployeeId?: string;
  triggeredAt: string;
}

export interface DailyEventResult {
  events: DailyEvent[];
}

export type CombinedDailyEvent = DailyEvent | ExtendedDailyEvent;

function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function checkProbability(probability: number): boolean {
  return Math.random() < probability;
}

export class EmployeeEventGenerator {
  private readonly SICK_PROBABILITY = 0.01;
  private readonly AWARD_PROBABILITY = 0.05;
  private readonly LEAVE_PROBABILITY = 0.10;

  generateSickEvent(employee: Employee): DailyEvent | null {
    if (!checkProbability(this.SICK_PROBABILITY)) {
      return null;
    }

    const duration = Math.floor(Math.random() * 3) + 1;
    
    return {
      id: generateId(),
      type: 'employee_sick',
      category: 'employee',
      title: '员工生病',
      description: `${employee.name}因过度劳累生病了，需要休息 ${duration} 天。`,
      impact: {
        fatigueChange: 20,
        satisfactionChange: -10,
      },
      duration,
      affectedEmployeeId: employee.id,
      triggeredAt: new Date().toISOString(),
    };
  }

  generateAwardEvent(employee: Employee): DailyEvent | null {
    if (!checkProbability(this.AWARD_PROBABILITY)) {
      return null;
    }

    const awardTypes = ['行业创新奖', '最佳策划奖', '优秀员工奖', '技术突破奖'];
    const awardName = awardTypes[Math.floor(Math.random() * awardTypes.length)];

    return {
      id: generateId(),
      type: 'employee_award',
      category: 'employee',
      title: '获得行业奖项',
      description: `${employee.name}凭借出色的工作表现荣获"${awardName}"，为公司赢得了荣誉！`,
      impact: {
        reputationChange: 5,
        satisfactionChange: 20,
        experienceBonus: 100,
      },
      affectedEmployeeId: employee.id,
      triggeredAt: new Date().toISOString(),
    };
  }

  generateLeaveEvent(employee: Employee): DailyEvent | null {
    if (employee.fatigue <= 80 || employee.satisfaction >= 40) {
      return null;
    }

    if (!checkProbability(this.LEAVE_PROBABILITY)) {
      return null;
    }

    return {
      id: generateId(),
      type: 'employee_leave',
      category: 'employee',
      title: '员工请假',
      description: `${employee.name}因疲劳和士气低落申请请假 1 天调整状态。`,
      impact: {
        fatigueChange: -50,
      },
      duration: 1,
      affectedEmployeeId: employee.id,
      triggeredAt: new Date().toISOString(),
    };
  }

  generate(employees: Employee[]): DailyEvent[] {
    const events: DailyEvent[] = [];

    for (const employee of employees) {
      const sickEvent = this.generateSickEvent(employee);
      if (sickEvent) {
        events.push(sickEvent);
      }

      const awardEvent = this.generateAwardEvent(employee);
      if (awardEvent) {
        events.push(awardEvent);
      }

      const leaveEvent = this.generateLeaveEvent(employee);
      if (leaveEvent) {
        events.push(leaveEvent);
      }
    }

    return events;
  }
}

export class PositiveEventGenerator {
  private readonly INFLUENCER_PROBABILITY = 0.02;
  private readonly VIRAL_PROBABILITY = 0.01;

  generateInfluencerRecommendEvent(projectIds: string[]): DailyEvent | null {
    if (!checkProbability(this.INFLUENCER_PROBABILITY) || projectIds.length === 0) {
      return null;
    }

    const projectId = projectIds[Math.floor(Math.random() * projectIds.length)];
    const influencerNames = ['知名游戏博主', '人气主播', '知名 UP 主', '微博大 V'];
    const influencer = influencerNames[Math.floor(Math.random() * influencerNames.length)];

    return {
      id: generateId(),
      type: 'influencer_recommend',
      category: 'positive',
      title: '网红推荐',
      description: `${influencer}在社交媒体上推荐了我们的游戏，引发了大量关注！`,
      impact: {
        playerChange: 500,
        revenueChange: 0.3,
        satisfactionChange: 5,
      },
      duration: 3,
      affectedProjectId: projectId,
      triggeredAt: new Date().toISOString(),
    };
  }

  generateSocialMediaViralEvent(characterNames: string[]): DailyEvent | null {
    if (!checkProbability(this.VIRAL_PROBABILITY) || characterNames.length === 0) {
      return null;
    }

    const characterName = characterNames[Math.floor(Math.random() * characterNames.length)];

    return {
      id: generateId(),
      type: 'social_media_viral',
      category: 'positive',
      title: '社交媒体爆火',
      description: `角色"${characterName}"在社交媒体上意外走红，同人作品和讨论热度飙升！`,
      impact: {
        reputationChange: 20,
        satisfactionChange: 10,
        playerChange: 200,
      },
      affectedProjectId: undefined,
      triggeredAt: new Date().toISOString(),
    };
  }

  generate(projectIds: string[], characterNames: string[]): DailyEvent[] {
    const events: DailyEvent[] = [];

    const influencerEvent = this.generateInfluencerRecommendEvent(projectIds);
    if (influencerEvent) {
      events.push(influencerEvent);
    }

    const viralEvent = this.generateSocialMediaViralEvent(characterNames);
    if (viralEvent) {
      events.push(viralEvent);
    }

    return events;
  }
}

export class NegativeEventGenerator {
  private readonly SERVER_CRASH_PROBABILITY = 0.005;
  private readonly NEGATIVE_PUBLICITY_PROBABILITY = 0.01;

  generateServerCrashEvent(): DailyEvent | null {
    if (!checkProbability(this.SERVER_CRASH_PROBABILITY)) {
      return null;
    }

    return {
      id: generateId(),
      type: 'server_crash',
      category: 'negative',
      title: '服务器故障',
      description: '游戏服务器出现严重故障，玩家无法正常登录，急需紧急修复！',
      impact: {
        playerChange: -100,
        reputationChange: -10,
        satisfactionChange: -15,
        revenueChange: -0.5,
      },
      duration: 1,
      triggeredAt: new Date().toISOString(),
    };
  }

  generateNegativePublicityEvent(projectIds: string[]): DailyEvent | null {
    if (!checkProbability(this.NEGATIVE_PUBLICITY_PROBABILITY) || projectIds.length === 0) {
      return null;
    }

    const projectId = projectIds[Math.floor(Math.random() * projectIds.length)];
    const reasons = ['游戏平衡性问题', '角色设计争议', '剧情走向不满', '运营活动不合理'];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];

    return {
      id: generateId(),
      type: 'negative_publicity',
      category: 'negative',
      title: '负面舆论',
      description: `玩家社区出现"${reason}"的负面评价，舆论持续发酵中。`,
      impact: {
        reputationChange: -15,
        satisfactionChange: -8,
        revenueChange: -0.2,
      },
      duration: 5,
      affectedProjectId: projectId,
      triggeredAt: new Date().toISOString(),
    };
  }

  generate(projectIds: string[]): DailyEvent[] {
    const events: DailyEvent[] = [];

    const serverCrashEvent = this.generateServerCrashEvent();
    if (serverCrashEvent) {
      events.push(serverCrashEvent);
    }

    const negativePublicityEvent = this.generateNegativePublicityEvent(projectIds);
    if (negativePublicityEvent) {
      events.push(negativePublicityEvent);
    }

    return events;
  }
}

export class SpecialEventGenerator {
  private readonly INVESTMENT_PROBABILITY = 0.05;

  generateInvestmentEvent(): DailyEvent | null {
    if (!checkProbability(this.INVESTMENT_PROBABILITY)) {
      return null;
    }

    const investmentAmount = Math.floor(Math.random() * 900000) + 100000;

    return {
      id: generateId(),
      type: 'investment',
      category: 'special',
      title: '投资事件',
      description: `一家投资公司看好你的公司，决定投资${(investmentAmount / 10000).toFixed(0)}万元！`,
      impact: {
        investmentAmount: investmentAmount,
        reputationChange: 10,
      },
      triggeredAt: new Date().toISOString(),
    };
  }

  generate(): DailyEvent[] {
    const events: DailyEvent[] = [];

    const investmentEvent = this.generateInvestmentEvent();
    if (investmentEvent) {
      events.push(investmentEvent);
    }

    return events;
  }
}

export class NeutralEventGenerator {
  private readonly PLAYER_REQUEST_PROBABILITY = 0.03;
  private readonly COLLABORATION_PROBABILITY = 0.01;

  generatePlayerRequestEvent(characterNames: string[]): DailyEvent | null {
    if (!checkProbability(this.PLAYER_REQUEST_PROBABILITY) || characterNames.length === 0) {
      return null;
    }

    const characterName = characterNames[Math.floor(Math.random() * characterNames.length)];
    const requestTypes = ['增加更多剧情', '推出新服装', '举办生日活动', '增加互动语音'];
    const request = requestTypes[Math.floor(Math.random() * requestTypes.length)];

    return {
      id: generateId(),
      type: 'player_request',
      category: 'neutral',
      title: '玩家请求',
      description: `大量玩家联名请求为角色"${characterName}"${request}。`,
      impact: {
        satisfactionChange: 5,
      },
      triggeredAt: new Date().toISOString(),
    };
  }

  generateCollaborationInviteEvent(): DailyEvent | null {
    if (!checkProbability(this.COLLABORATION_PROBABILITY)) {
      return null;
    }

    const partnerTypes = ['知名动漫 IP', '热门游戏', '人气小说', '经典影视作品'];
    const partner = partnerTypes[Math.floor(Math.random() * partnerTypes.length)];

    return {
      id: generateId(),
      type: 'collaboration_invite',
      category: 'neutral',
      title: '合作邀请',
      description: `收到"${partner}"的联动合作邀请，可以考虑开展联动活动。`,
      impact: {
        reputationChange: 5,
        playerChange: 100,
      },
      triggeredAt: new Date().toISOString(),
    };
  }

  generate(characterNames: string[]): DailyEvent[] {
    const events: DailyEvent[] = [];

    const playerRequestEvent = this.generatePlayerRequestEvent(characterNames);
    if (playerRequestEvent) {
      events.push(playerRequestEvent);
    }

    const collaborationEvent = this.generateCollaborationInviteEvent();
    if (collaborationEvent) {
      events.push(collaborationEvent);
    }

    return events;
  }
}

export class DailyEventEngine {
  private employeeGenerator: EmployeeEventGenerator;
  private positiveGenerator: PositiveEventGenerator;
  private negativeGenerator: NegativeEventGenerator;
  private neutralGenerator: NeutralEventGenerator;
  private specialGenerator: SpecialEventGenerator;
  private extendedGenerator: ExtendedEventGenerator;

  constructor() {
    this.employeeGenerator = new EmployeeEventGenerator();
    this.positiveGenerator = new PositiveEventGenerator();
    this.negativeGenerator = new NegativeEventGenerator();
    this.neutralGenerator = new NeutralEventGenerator();
    this.specialGenerator = new SpecialEventGenerator();
    this.extendedGenerator = new ExtendedEventGenerator();
  }

  triggerEvents(params: {
    employees: Employee[];
    projectIds: string[];
    characterNames: string[];
    projectData?: Map<string, ProjectOperationData>;
  }): DailyEventResult {
    const events: DailyEvent[] = [];

    const employeeEvents = this.employeeGenerator.generate(params.employees);
    events.push(...employeeEvents);

    const positiveEvents = this.positiveGenerator.generate(
      params.projectIds,
      params.characterNames
    );
    events.push(...positiveEvents);

    const negativeEvents = this.negativeGenerator.generate(params.projectIds);
    events.push(...negativeEvents);

    const neutralEvents = this.neutralGenerator.generate(params.characterNames);
    events.push(...neutralEvents);

    // 添加特殊事件（投资事件等）
    const specialEvents = this.specialGenerator.generate();
    events.push(...specialEvents);

    // 添加扩展事件（Phase 5.5 新增）
    const extendedEvents = this.extendedGenerator.generate({
      employees: params.employees,
      projectIds: params.projectIds,
      characterNames: params.characterNames,
      projectData: params.projectData,
    });
    events.push(...extendedEvents);

    return {
      events,
    };
  }
}

export const DailyEventEngineInstance = new DailyEventEngine();

export function triggerEvents(params: {
  employees: Employee[];
  projectIds: string[];
  characterNames: string[];
  projectData?: Map<string, ProjectOperationData>;
}): DailyEventResult {
  return DailyEventEngineInstance.triggerEvents(params);
}
