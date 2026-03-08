/**
 * 扩展每日事件库
 * 补充更多类型的事件，丰富游戏体验
 */

import type { DailyEvent } from './dailyEventEngine';
import type { ProjectOperationData } from '@/types/simulation';

// 扩展事件类型
export type ExtendedEventType = 
  // 员工相关
  | 'employee_resign'           // 员工离职
  | 'employee_promotion'        // 员工升职
  | 'employee_conflict'         // 员工冲突
  | 'employee_breakthrough'     // 技术突破
  | 'team_building'             // 团队建设
  
  // 正面事件
  | 'media_review_positive'     // 媒体好评
  | 'industry_recognition'      // 行业认可
  | 'player_milestone'          // 玩家里程碑
  | 'content_creator_feature'   // 创作者推荐
  | 'charity_event'             // 公益活动
  
  // 负面事件
  | 'competitor_attack'         // 竞品打压
  | 'technical_debt'            // 技术债务
  | 'copyright_dispute'         // 版权纠纷
  | 'data_breach'               // 数据泄露
  | 'key_personnel_departure'   // 核心人员离职
  
  // 中性事件
  | 'market_research'           // 市场调研
  | 'investor_interest'         // 投资意向
  | 'media_interview'           // 媒体采访
  | 'community_feedback'        // 社区反馈
  | 'technology_upgrade';       // 技术升级

// 扩展事件接口
export interface ExtendedDailyEvent extends DailyEvent {
  type: ExtendedEventType;
  options?: Array<{
    label: string;
    impact: DailyEvent['impact'];
    description?: string;
  }>;
}

// 事件模板生成器
export class ExtendedEventTemplates {
  // ========== 员工相关事件 ==========
  
  static generateEmployeeResignEvent(employeeName: string, reason: string): ExtendedDailyEvent {
    return {
      id: `evt_${Date.now()}`,
      type: 'employee_resign',
      category: 'employee',
      title: '员工离职',
      description: `${employeeName}因${reason}决定离开公司。`,
      impact: {
        satisfactionChange: -10,
        reputationChange: -5,
      },
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateEmployeePromotionEvent(employeeName: string, newPosition: string): ExtendedDailyEvent {
    return {
      id: `evt_${Date.now()}`,
      type: 'employee_promotion',
      category: 'employee',
      title: '员工升职',
      description: `${employeeName}因表现优异晋升为${newPosition}！`,
      impact: {
        satisfactionChange: 15,
        experienceBonus: 50,
      },
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateEmployeeConflictEvent(employee1Name: string, employee2Name: string): ExtendedDailyEvent {
    return {
      id: `evt_${Date.now()}`,
      type: 'employee_conflict',
      category: 'employee',
      title: '团队冲突',
      description: `${employee1Name}和${employee2Name}在工作方式上产生分歧，需要协调。`,
      impact: {
        satisfactionChange: -8,
      },
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateEmployeeBreakthroughEvent(employeeName: string, technology: string): ExtendedDailyEvent {
    return {
      id: `evt_${Date.now()}`,
      type: 'employee_breakthrough',
      category: 'positive',
      title: '技术突破',
      description: `${employeeName}在${technology}领域取得重大突破，将大幅提升开发效率！`,
      impact: {
        reputationChange: 10,
        satisfactionChange: 20,
        experienceBonus: 150,
      },
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateTeamBuildingEvent(): ExtendedDailyEvent {
    const activities = ['团建聚餐', '户外拓展', '桌游比赛', 'KTV 聚会'];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    return {
      id: `evt_${Date.now()}`,
      type: 'team_building',
      category: 'positive',
      title: '团队建设',
      description: `公司组织了${activity}活动，团队凝聚力得到提升！`,
      impact: {
        satisfactionChange: 15,
        experienceBonus: 30,
      },
      triggeredAt: new Date().toISOString(),
    };
  }
  
  // ========== 正面事件 ==========
  
  static generateMediaReviewPositiveEvent(projectName: string, mediaName: string): ExtendedDailyEvent {
    return {
      id: `evt_${Date.now()}`,
      type: 'media_review_positive',
      category: 'positive',
      title: '媒体好评',
      description: `知名媒体"${mediaName}"对${projectName}给予了高度评价！`,
      impact: {
        reputationChange: 15,
        playerChange: 300,
        revenueChange: 0.15,
      },
      duration: 7,
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateIndustryRecognitionEvent(awardName: string): ExtendedDailyEvent {
    return {
      id: `evt_${Date.now()}`,
      type: 'industry_recognition',
      category: 'positive',
      title: '行业认可',
      description: `公司作品荣获"${awardName}"，行业地位大幅提升！`,
      impact: {
        reputationChange: 25,
        satisfactionChange: 20,
      },
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generatePlayerMilestoneEvent(playerCount: number): ExtendedDailyEvent {
    return {
      id: `evt_${Date.now()}`,
      type: 'player_milestone',
      category: 'positive',
      title: '玩家里程碑',
      description: `游戏注册用户突破${playerCount}万大关！感谢玩家支持！`,
      impact: {
        reputationChange: 10,
        satisfactionChange: 15,
      },
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateContentCreatorFeatureEvent(platform: string): ExtendedDailyEvent {
    const platforms = ['B 站', '抖音', '微博', '小红书'];
    const selectedPlatform = platform || platforms[Math.floor(Math.random() * platforms.length)];
    
    return {
      id: `evt_${Date.now()}`,
      type: 'content_creator_feature',
      category: 'positive',
      title: '创作者推荐',
      description: `多位${selectedPlatform}创作者自发制作游戏相关内容，引发关注！`,
      impact: {
        playerChange: 400,
        reputationChange: 12,
      },
      duration: 5,
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateCharityEvent(): ExtendedDailyEvent {
    const causes = ['希望工程', '环保公益', '动物保护', '儿童医疗'];
    const cause = causes[Math.floor(Math.random() * causes.length)];
    
    return {
      id: `evt_${Date.now()}`,
      type: 'charity_event',
      category: 'positive',
      title: '公益活动',
      description: `公司参与${cause}活动，树立了良好的企业形象。`,
      impact: {
        reputationChange: 20,
        satisfactionChange: 10,
      },
      triggeredAt: new Date().toISOString(),
    };
  }
  
  // ========== 负面事件 ==========
  
  static generateCompetitorAttackEvent(): ExtendedDailyEvent {
    const attackTypes = ['恶意挖角', '舆论抹黑', '价格战', '抄袭争议'];
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    
    return {
      id: `evt_${Date.now()}`,
      type: 'competitor_attack',
      category: 'negative',
      title: '竞品打压',
      description: `竞争对手采取${attackType}手段，对公司造成一定影响。`,
      impact: {
        reputationChange: -12,
        satisfactionChange: -10,
        playerChange: -150,
      },
      duration: 7,
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateTechnicalDebtEvent(): ExtendedDailyEvent {
    return {
      id: `evt_${Date.now()}`,
      type: 'technical_debt',
      category: 'negative',
      title: '技术债务',
      description: '长期积累的技术债务开始显现，需要投入资源进行重构。',
      impact: {
        satisfactionChange: -8,
        revenueChange: -0.1,
      },
      duration: 14,
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateCopyrightDisputeEvent(): ExtendedDailyEvent {
    return {
      id: `evt_${Date.now()}`,
      type: 'copyright_dispute',
      category: 'negative',
      title: '版权纠纷',
      description: '公司卷入版权纠纷，需要法务团队介入处理。',
      impact: {
        reputationChange: -18,
        satisfactionChange: -12,
      },
      duration: 30,
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateDataBreachEvent(): ExtendedDailyEvent {
    return {
      id: `evt_${Date.now()}`,
      type: 'data_breach',
      category: 'negative',
      title: '数据泄露',
      description: '出现用户数据泄露事件，急需加强安全措施！',
      impact: {
        reputationChange: -30,
        playerChange: -300,
        satisfactionChange: -20,
      },
      duration: 60,
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateKeyPersonnelDepartureEvent(position: string): ExtendedDailyEvent {
    const positions = ['技术总监', '主策划', '美术总监', '运营总监'];
    const selectedPosition = position || positions[Math.floor(Math.random() * positions.length)];
    
    return {
      id: `evt_${Date.now()}`,
      type: 'key_personnel_departure',
      category: 'negative',
      title: '核心人员离职',
      description: `公司${selectedPosition}突然离职，对团队造成重大影响。`,
      impact: {
        satisfactionChange: -20,
        reputationChange: -10,
      },
      duration: 30,
      triggeredAt: new Date().toISOString(),
    };
  }
  
  // ========== 中性事件 ==========
  
  static generateMarketResearchEvent(): ExtendedDailyEvent {
    return {
      id: `evt_${Date.now()}`,
      type: 'market_research',
      category: 'neutral',
      title: '市场调研',
      description: '收到市场调研机构的合作邀请，可以帮助了解行业趋势。',
      impact: {},
      options: [
        {
          label: '接受调研',
          impact: {
            reputationChange: 3,
            satisfactionChange: 2,
          },
          description: '花费时间参与调研，获得行业洞察',
        },
        {
          label: '拒绝',
          impact: {},
          description: '专注于当前工作',
        },
      ],
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateInvestorInterestEvent(): ExtendedDailyEvent {
    return {
      id: `evt_${Date.now()}`,
      type: 'investor_interest',
      category: 'neutral',
      title: '投资意向',
      description: '有投资机构对公司表示兴趣，希望洽谈投资事宜。',
      impact: {},
      options: [
        {
          label: '接触投资者',
          impact: {
            reputationChange: 5,
          },
          description: '可能获得资金支持，但需要出让股份',
        },
        {
          label: '暂不考虑',
          impact: {},
          description: '保持公司独立性',
        },
      ],
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateMediaInterviewEvent(): ExtendedDailyEvent {
    const mediaTypes = ['游戏媒体', '科技媒体', '财经媒体', '大众媒体'];
    const mediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)];
    
    return {
      id: `evt_${Date.now()}`,
      type: 'media_interview',
      category: 'neutral',
      title: '媒体采访',
      description: `${mediaType}希望采访公司创始人，宣传公司理念。`,
      impact: {},
      options: [
        {
          label: '接受采访',
          impact: {
            reputationChange: 8,
            playerChange: 100,
          },
          description: '提升知名度，但需要花费时间',
        },
        {
          label: '婉拒',
          impact: {},
          description: '专注产品开发',
        },
      ],
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateCommunityFeedbackEvent(): ExtendedDailyEvent {
    const feedbackTypes = ['玩家联名请愿', '社区建议征集', '满意度调查', 'BUG 反馈集中'];
    const feedbackType = feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)];
    
    return {
      id: `evt_${Date.now()}`,
      type: 'community_feedback',
      category: 'neutral',
      title: '社区反馈',
      description: `收到大量玩家${feedbackType}，需要认真处理。`,
      impact: {},
      options: [
        {
          label: '积极回应',
          impact: {
            satisfactionChange: 10,
            reputationChange: 5,
          },
          description: '提升玩家满意度，但需要投入资源',
        },
        {
          label: '暂缓处理',
          impact: {
            satisfactionChange: -5,
          },
          description: '优先处理其他事务',
        },
      ],
      triggeredAt: new Date().toISOString(),
    };
  }
  
  static generateTechnologyUpgradeEvent(): ExtendedDailyEvent {
    const technologies = ['游戏引擎升级', '服务器架构优化', 'AI 技术应用', '云游戏技术'];
    const technology = technologies[Math.floor(Math.random() * technologies.length)];
    
    return {
      id: `evt_${Date.now()}`,
      type: 'technology_upgrade',
      category: 'neutral',
      title: '技术升级',
      description: `发现新的${technology}方案，可以考虑引入。`,
      impact: {},
      options: [
        {
          label: '引入新技术',
          impact: {
            experienceBonus: 100,
            satisfactionChange: 5,
          },
          description: '提升技术水平，但有学习成本',
        },
        {
          label: '保持现状',
          impact: {},
          description: '避免技术风险',
        },
      ],
      triggeredAt: new Date().toISOString(),
    };
  }
}

// 扩展事件生成器
export class ExtendedEventGenerator {
  generate(params: {
    employees: Array<{ name: string; position?: string; satisfaction?: number; fatigue?: number }>;
    projectIds: string[];
    characterNames: string[];
    projectData?: Map<string, ProjectOperationData>;
  }): ExtendedDailyEvent[] {
    const events: ExtendedDailyEvent[] = [];
    
    // 员工相关事件
    events.push(...this.generateEmployeeEvents(params.employees));
    
    // 正面事件
    const projectNames = Array.from(params.projectData?.values() || []).map(d => d.projectName);
    events.push(...this.generatePositiveEvents(projectNames));
    
    // 负面事件
    events.push(...this.generateNegativeEvents());
    
    // 中性事件
    events.push(...this.generateNeutralEvents());
    
    return events;
  }

  generateEmployeeEvents(employees: Array<{ name: string; position?: string; satisfaction?: number; fatigue?: number }>): ExtendedDailyEvent[] {
    const events: ExtendedDailyEvent[] = [];
    
    // 1% 概率触发员工离职（满意度<30 且疲劳>90 时 5%）
    const resignProb = employees.some(e => (e.satisfaction || 100) < 30 && (e.fatigue || 0) > 90) ? 0.05 : 0.01;
    if (Math.random() < resignProb && employees.length > 0) {
      const employee = employees[Math.floor(Math.random() * employees.length)];
      const reasons = ['个人发展', '工作压力', '薪资问题', '家庭原因'];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      events.push(ExtendedEventTemplates.generateEmployeeResignEvent(employee.name, reason));
    }
    
    // 3% 概率触发员工升职（经验>100 且满意度>80 时）
    if (Math.random() < 0.03 && employees.length > 0) {
      const employee = employees[Math.floor(Math.random() * employees.length)];
      const positions = ['高级策划', '主美', '技术主管', '运营经理'];
      const position = positions[Math.floor(Math.random() * positions.length)];
      events.push(ExtendedEventTemplates.generateEmployeePromotionEvent(employee.name, position));
    }
    
    // 2% 概率触发员工冲突（默契度<50 时）
    if (Math.random() < 0.02 && employees.length > 1) {
      const emp1 = employees[Math.floor(Math.random() * employees.length)];
      let emp2 = employees[Math.floor(Math.random() * employees.length)];
      while (emp2 === emp1 && employees.length > 2) {
        emp2 = employees[Math.floor(Math.random() * employees.length)];
      }
      if (emp1 !== emp2) {
        events.push(ExtendedEventTemplates.generateEmployeeConflictEvent(emp1.name, emp2.name));
      }
    }
    
    // 1% 概率触发技术突破（经验总和>500 时）
    if (Math.random() < 0.01) {
      const employee = employees[Math.floor(Math.random() * employees.length)];
      const technologies = ['渲染技术', 'AI 算法', '网络优化', '用户体验'];
      const technology = technologies[Math.floor(Math.random() * technologies.length)];
      events.push(ExtendedEventTemplates.generateEmployeeBreakthroughEvent(employee.name, technology));
    }
    
    // 5% 概率触发团建活动（默契度>80 时）
    if (Math.random() < 0.05) {
      events.push(ExtendedEventTemplates.generateTeamBuildingEvent());
    }
    
    return events;
  }
  
  generatePositiveEvents(projectNames: string[]): ExtendedDailyEvent[] {
    const events: ExtendedDailyEvent[] = [];
    
    // 2% 概率触发媒体好评
    if (Math.random() < 0.02 && projectNames.length > 0) {
      const projectName = projectNames[Math.floor(Math.random() * projectNames.length)];
      const mediaNames = ['游民星空', '3DM', '机核', ' indienova'];
      const mediaName = mediaNames[Math.floor(Math.random() * mediaNames.length)];
      events.push(ExtendedEventTemplates.generateMediaReviewPositiveEvent(projectName, mediaName));
    }
    
    // 1% 概率触发行业认可
    if (Math.random() < 0.01) {
      const awards = ['年度最佳游戏', '最佳叙事奖', '最佳美术奖', '最佳音乐奖'];
      const award = awards[Math.floor(Math.random() * awards.length)];
      events.push(ExtendedEventTemplates.generateIndustryRecognitionEvent(award));
    }
    
    // 3% 概率触发创作者推荐
    if (Math.random() < 0.03) {
      events.push(ExtendedEventTemplates.generateContentCreatorFeatureEvent(''));
    }
    
    // 1% 概率触发公益活动
    if (Math.random() < 0.01) {
      events.push(ExtendedEventTemplates.generateCharityEvent());
    }
    
    return events;
  }
  
  generateNegativeEvents(): ExtendedDailyEvent[] {
    const events: ExtendedDailyEvent[] = [];
    
    // 1% 概率触发竞品打压
    if (Math.random() < 0.01) {
      events.push(ExtendedEventTemplates.generateCompetitorAttackEvent());
    }
    
    // 0.5% 概率触发技术债务
    if (Math.random() < 0.005) {
      events.push(ExtendedEventTemplates.generateTechnicalDebtEvent());
    }
    
    // 0.3% 概率触发版权纠纷
    if (Math.random() < 0.003) {
      events.push(ExtendedEventTemplates.generateCopyrightDisputeEvent());
    }
    
    // 0.2% 概率触发数据泄露
    if (Math.random() < 0.002) {
      events.push(ExtendedEventTemplates.generateDataBreachEvent());
    }
    
    // 0.5% 概率触发核心人员离职
    if (Math.random() < 0.005) {
      events.push(ExtendedEventTemplates.generateKeyPersonnelDepartureEvent(''));
    }
    
    return events;
  }
  
  generateNeutralEvents(): ExtendedDailyEvent[] {
    const events: ExtendedDailyEvent[] = [];
    const generators = [
      () => ExtendedEventTemplates.generateMarketResearchEvent(),
      () => ExtendedEventTemplates.generateInvestorInterestEvent(),
      () => ExtendedEventTemplates.generateMediaInterviewEvent(),
      () => ExtendedEventTemplates.generateCommunityFeedbackEvent(),
      () => ExtendedEventTemplates.generateTechnologyUpgradeEvent(),
    ];
    
    // 5% 概率触发一个中性事件
    if (Math.random() < 0.05) {
      const generator = generators[Math.floor(Math.random() * generators.length)];
      events.push(generator());
    }
    
    return events;
  }
}
