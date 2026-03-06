// 竞品事件引擎

import type {
  CompetitorAI,
  AIAction,
  CompetitorNews,
  CompetitorNewsType,
  NewsImpact,
  PlayerResponseOption,
} from '@/types/competitor';

// 消息模板
interface NewsTemplate {
  title: string;
  content: string;
  impactRange: {
    playerDAU: [number, number];
    playerNewUsers: [number, number];
    marketSentiment: [number, number];
  };
  playerOptions?: {
    action: string;
    cost: number;
    successRate: number;
    reward: string;
    risk: string;
  }[];
}

// 消息模板库
const NEWS_TEMPLATES: Record<CompetitorNewsType, NewsTemplate[]> = {
  new_game: [
    {
      title: '{company}新作《{game}》正式上线！',
      content: '{company}旗下全新乙女游戏《{game}》今日正式上线，首日下载量突破{downloads}万。{genre}题材配合精美画风，引发玩家热议。',
      impactRange: { playerDAU: [-5, -15], playerNewUsers: [-10, -30], marketSentiment: [-5, 10] },
      playerOptions: [
        { action: '紧急推出限时活动应对', cost: 50000, successRate: 0.7, reward: '成功留住大部分玩家', risk: '活动仓促质量不高' },
        { action: '冷静观察不做反应', cost: 0, successRate: 0.5, reward: '节省资源等待时机', risk: '可能流失部分玩家' },
      ],
    },
  ],
  major_update: [
    {
      title: '{company}《{game}》迎来史上最大更新！',
      content: '{company}宣布《{game}》将于下周迎来史诗级大更新，全新剧情线+3位新角色+全新玩法，预约人数已突破{watches}万！',
      impactRange: { playerDAU: [-3, -8], playerNewUsers: [-5, -15], marketSentiment: [0, 5] },
      playerOptions: [
        { action: '同步推出新内容竞争', cost: 80000, successRate: 0.6, reward: '减少玩家流失', risk: '开发压力大' },
        { action: '专注自家内容不跟进', cost: 0, successRate: 0.7, reward: '节省资源', risk: '部分玩家被吸引' },
      ],
    },
  ],
  gacha_event: [
    {
      title: '{company}《{game}》限定卡池复刻！',
      content: '《{game}》今日开启限定角色卡池复刻，角色{character}限时up，概率提升！玩家们直呼"太香了"，服务器一度爆满。',
      impactRange: { playerDAU: [-2, -5], playerNewUsers: [-3, -8], marketSentiment: [5, 15] },
      playerOptions: [
        { action: '推出同名角色活动', cost: 30000, successRate: 0.5, reward: '吸引部分玩家', risk: '可能被对比' },
      ],
    },
  ],
  scandal: [
    {
      title: '{company}陷入舆论危机！',
      content: '今日有玩家爆料{company}旗下游戏存在{issue}问题，引发广泛讨论。官方回应：正在调查。玩家社区炸锅了！',
      impactRange: { playerDAU: [5, 15], playerNewUsers: [3, 8], marketSentiment: [-10, -20] },
      playerOptions: [
        { action: '落井下石宣传自身优势', cost: 20000, successRate: 0.4, reward: '可能吸引部分玩家', risk: '可能被骂' },
        { action: '保持沉默不参与', cost: 0, successRate: 0.8, reward: '塑造正面形象', risk: '错过机会' },
      ],
    },
  ],
  collaboration: [
    {
      title: '{company}宣布跨界联动！',
      content: '{company}宣布与{collab}进行跨界联动！{collab}角色将入驻《{game}》，联动限定服装/角色免费送！玩家：这波赚到了！',
      impactRange: { playerDAU: [-3, -10], playerNewUsers: [-5, -12], marketSentiment: [5, 15] },
    }
  ],
  price_war: [
    {
      title: '{company}发起价格战！',
      content: '{company}突然宣布《{game}》所有付费内容打{discount}折！玩家疯狂刷屏"真香"，其他厂商压力山大。',
      impactRange: { playerDAU: [-5, -12], playerNewUsers: [-8, -20], marketSentiment: [-5, 10] },
      playerOptions: [
        { action: '跟随降价保用户', cost: 50000, successRate: 0.6, reward: '留住价格敏感玩家', risk: '收入下降' },
        { action: '坚持品质不降价', cost: 0, successRate: 0.7, reward: '维持品牌形象', risk: '用户流失' },
      ],
    }
  ],
  award: [
    {
      title: '{company}获年度最佳游戏奖！',
      content: '恭喜{company}！《{game}》荣获{award}年度最佳乙女游戏奖！官方狂送10连抽庆祝！',
      impactRange: { playerDAU: [2, 8], playerNewUsers: [5, 15], marketSentiment: [10, 20] },
    }
  ],
  financial: [
    {
      title: '{company}获得巨额融资！',
      content: '{company}宣布完成{amount}亿元融资，将用于新品研发。业内人士：这波要搞大动作！',
      impactRange: { playerDAU: [-2, -5], playerNewUsers: [-3, -8], marketSentiment: [0, 5] },
    }
  ],
  player_migration: [
    {
      title: '大量玩家从{company}流失！',
      content: '据报道，近期有大量玩家从《{game}》流出，主要原因是{reason}。部分玩家表示"要换个游戏试试"。',
      impactRange: { playerDAU: [3, 8], playerNewUsers: [5, 12], marketSentiment: [5, 10] },
      playerOptions: [
        { action: '推出回流活动', cost: 30000, successRate: 0.6, reward: '吸引流失玩家', risk: '成本较高' },
      ],
    }
  ],
  market_shift: [
    {
      title: '市场风向变化！{genre}题材热度上升',
      content: '最新数据显示，{genre}题材游戏近期热度上升{percent}%，多家厂商开始布局。',
      impactRange: { playerDAU: [0, 3], playerNewUsers: [0, 5], marketSentiment: [0, 5] },
    }
  ],
};

export class CompetitorEventEngine {
  /**
   * 生成竞品动态消息
   */
  generateCompetitorNews(
    competitors: CompetitorAI[],
    actions: Map<string, AIAction[]>,
    currentDay: number
  ): CompetitorNews[] {
    const newsList: CompetitorNews[] = [];
    
    for (const competitor of competitors) {
      const competitorActions = actions.get(competitor.id) || [];
      
      for (const action of competitorActions) {
        const news = this.actionToNews(competitor, action, currentDay);
        if (news) {
          newsList.push(news);
        }
      }
    }
    
    // 每日最多显示5条新闻
    return newsList.slice(0, 5);
  }
  
  /**
   * 将AI行动转换为新闻
   */
  private actionToNews(
    competitor: CompetitorAI,
    action: AIAction,
    currentDay: number
  ): CompetitorNews | null {
    const newsType = this.actionToNewsType(action.type);
    if (!newsType) return null;
    
    const templates = NEWS_TEMPLATES[newsType];
    if (!templates || templates.length === 0) return null;
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    const game = competitor.games[0];
    
    // 替换占位符
    const title = this.replacePlaceholders(template.title, {
      company: competitor.name,
      game: game?.name || '某游戏',
    });
    
    const content = this.replacePlaceholders(template.content, {
      company: competitor.name,
      game: game?.name || '某游戏',
      genre: '科幻恋爱',
      character: '主角',
      collab: '知名IP',
      award: '年度',
      amount: '数',
      reason: '玩法腻了',
      downloads: String(Math.floor(Math.random() * 50) + 10),
      watches: String(Math.floor(Math.random() * 100) + 50),
      discount: String(Math.floor(Math.random() * 3) * 5 + 5),
      percent: String(Math.floor(Math.random() * 30) + 10),
      issue: '概率欺诈',
    });
    
    // 生成玩家应对选项
    let playerOptions: PlayerResponseOption[] | undefined;
    if (template.playerOptions) {
      playerOptions = template.playerOptions.map((opt, index) => ({
        id: `option_${index}`,
        action: opt.action,
        cost: opt.cost,
        successRate: opt.successRate,
        reward: opt.reward,
        risk: opt.risk,
      }));
    }
    
    return {
      id: `news_${currentDay}_${competitor.id}_${Math.random().toString(36).slice(2)}`,
      companyId: competitor.id,
      companyName: competitor.name,
      companyAvatar: competitor.avatar,
      type: newsType,
      title,
      content,
      day: currentDay,
      impact: this.generateImpact(template.impactRange),
      isRead: false,
      playerOptions,
    };
  }
  
  /**
   * 将行动类型转换为新闻类型
   */
  private actionToNewsType(actionType: string): CompetitorNewsType | null {
    const mapping: Record<string, CompetitorNewsType> = {
      launch_new_game: 'new_game',
      release_update: 'major_update',
      launch_gacha: 'gacha_event',
      start_event: 'gacha_event',
      marketing_campaign: 'price_war',
      price_war: 'price_war',
      collaboration: 'collaboration',
      scandal_response: 'scandal',
    };
    
    return mapping[actionType] || null;
  }
  
  /**
   * 替换占位符
   */
  private replacePlaceholders(template: string, values: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] || `{${key}}`);
  }
  
  /**
   * 生成影响
   */
  private generateImpact(range: { playerDAU: [number, number]; playerNewUsers: [number, number]; marketSentiment: [number, number] }): NewsImpact {
    const randomInRange = (range: [number, number]) => {
      const [min, max] = range;
      return min + Math.random() * (max - min);
    };
    
    return {
      playerDAU: Math.round(randomInRange(range.playerDAU)),
      playerNewUsers: Math.round(randomInRange(range.playerNewUsers)),
      marketSentiment: Math.round(randomInRange(range.marketSentiment)),
      description: '市场影响评估中...',
    };
  }
  
  /**
   * 计算对玩家的影响
   */
  calculateImpact(newsList: CompetitorNews[]): {
    totalDAUImpact: number;
    totalNewUsersImpact: number;
    totalSentimentImpact: number;
  } {
    let totalDAUImpact = 0;
    let totalNewUsersImpact = 0;
    let totalSentimentImpact = 0;
    
    for (const news of newsList) {
      totalDAUImpact += news.impact.playerDAU;
      totalNewUsersImpact += news.impact.playerNewUsers;
      totalSentimentImpact += news.impact.marketSentiment;
    }
    
    return {
      totalDAUImpact,
      totalNewUsersImpact,
      totalSentimentImpact,
    };
  }
}
