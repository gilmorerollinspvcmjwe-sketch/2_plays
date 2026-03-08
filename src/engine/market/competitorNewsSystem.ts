import type { Competitor } from '../simulation/competitorSystem';
import type { AIPersonality } from '@/types/competitor';

/**
 * 新闻类型定义
 * 包含 10 种不同的竞品新闻类型
 */
export type NewsType =
  | 'new_game'        // 新游发布
  | 'major_update'    // 重大更新
  | 'gacha_event'     // 卡池活动
  | 'collaboration'   // IP 联动
  | 'price_war'       // 价格战
  | 'scandal'         // 丑闻
  | 'award'           // 奖项
  | 'financial'       // 财经新闻
  | 'player_migration' // 玩家流失
  | 'market_shift';   // 市场变化

/**
 * 新闻影响接口
 * 描述新闻对市场各方面的影响程度
 */
export interface NewsImpact {
  /** 市场情感影响 (-10 到 10) */
  marketSentiment: number;
  /** 竞争强度影响 (0-100) */
  competitionIntensity: number;
  /** 玩家流失风险 (-0.5 到 0.5) */
  playerMigrationRisk: number;
  /** 收入影响 (-0.3 到 0.3) */
  revenueImpact: number;
  /** 声誉影响 (-10 到 10) */
  reputationImpact: number;
}

/**
 * 综合影响接口
 * 描述多条新闻叠加后的综合影响
 */
export interface CombinedImpact {
  /** 总影响 */
  totalImpact: NewsImpact;
  /** 影响明细 */
  breakdown: Array<{ newsId: string; impact: NewsImpact }>;
  /** 影响摘要描述 */
  summary: string;
}

/**
 * 情感分析接口
 * 描述新闻的情感分析结果
 */
export interface SentimentAnalysis {
  /** 主要情感 */
  primarySentiment: 'positive' | 'negative' | 'neutral';
  /** 情感强度 (0-1) */
  intensity: number;
  /** 情感关键词 */
  keywords: string[];
  /** 分析置信度 (0-1) */
  confidence: number;
}

/**
 * 竞品新闻接口
 * 描述一条完整的竞品新闻数据
 */
export interface CompetitorNews {
  /** 新闻唯一标识 */
  id: string;
  /** 公司 ID */
  companyId: string;
  /** 公司名称 */
  companyName: string;
  /** 新闻类型 */
  type: NewsType;
  /** 新闻标题 */
  title: string;
  /** 新闻内容 */
  content: string;
  /** 发生日期（游戏天数） */
  day: number;
  /** 新闻影响 */
  impact: NewsImpact;
  /** 情感倾向 */
  sentiment: 'positive' | 'neutral' | 'negative';
  /** 持续天数 */
  duration: number;
  /** 标签列表 */
  tags: string[];
}

/**
 * 新闻概率配置接口
 * 定义每种新闻类型的生成概率和属性
 */
interface NewsProbability {
  /** 每日基础概率 */
  dailyBase: number;
  /** 最短持续时间 */
  durationMin: number;
  /** 最长持续时间 */
  durationMax: number;
  /** 默认情感倾向 */
  defaultSentiment: 'positive' | 'neutral' | 'negative';
}

/**
 * 新闻概率配置
 * 定义每种新闻类型的每日生成概率、持续时间和默认情感
 */
const NEWS_PROBABILITIES: Record<NewsType, NewsProbability> = {
  new_game: {
    dailyBase: 0.0033, // 约 10%/月
    durationMin: 7,
    durationMax: 7,
    defaultSentiment: 'neutral',
  },
  major_update: {
    dailyBase: 0.007, // 约 5%/周
    durationMin: 3,
    durationMax: 3,
    defaultSentiment: 'neutral',
  },
  gacha_event: {
    dailyBase: 0.02, // 约 15%/周
    durationMin: 3,
    durationMax: 7,
    defaultSentiment: 'positive',
  },
  collaboration: {
    dailyBase: 0.003, // 约 2%/周
    durationMin: 7,
    durationMax: 14,
    defaultSentiment: 'positive',
  },
  price_war: {
    dailyBase: 0.001, // 约 3%/月
    durationMin: 14,
    durationMax: 14,
    defaultSentiment: 'negative',
  },
  scandal: {
    dailyBase: 0.0003, // 约 1%/月
    durationMin: 14,
    durationMax: 14,
    defaultSentiment: 'negative',
  },
  award: {
    dailyBase: 0.005,
    durationMin: 5,
    durationMax: 10,
    defaultSentiment: 'positive',
  },
  financial: {
    dailyBase: 0.003,
    durationMin: 3,
    durationMax: 7,
    defaultSentiment: 'neutral',
  },
  player_migration: {
    dailyBase: 0.002,
    durationMin: 7,
    durationMax: 14,
    defaultSentiment: 'negative',
  },
  market_shift: {
    dailyBase: 0.001,
    durationMin: 7,
    durationMax: 14,
    defaultSentiment: 'neutral',
  },
};

/**
 * 人设概率修正系数
 * 根据竞品公司的 AI 人设调整不同类型新闻的生成概率
 * - innovator: 更容易发布新游和重大更新
 * - monetizer: 更多卡池活动和价格战
 * - steady: 注重长期口碑，更多奖项和财经新闻
 * - disruptor: 喜欢制造事件，更多价格战和丑闻
 * - craftsman: 慢工出细活，更多更新和奖项
 * - learner: 观察并模仿，更多跟随性新闻
 */
const PERSONALITY_MODIFIERS: Record<AIPersonality, Partial<Record<NewsType, number>>> = {
  innovator: {
    new_game: 2.0,      // 新游概率翻倍
    major_update: 1.5,  // 更新概率 +50%
    collaboration: 1.3, // 联动概率 +30%
  },
  steady: {
    major_update: 1.3,  // 稳定更新
    award: 1.5,         // 更容易获奖
    financial: 1.2,     // 财经新闻 +20%
  },
  monetizer: {
    gacha_event: 2.5,   // 卡池概率 2.5 倍
    price_war: 1.8,     // 价格战 +80%
    financial: 1.3,     // 财经新闻 +30%
  },
  disruptor: {
    price_war: 2.0,     // 价格战翻倍
    scandal: 1.5,       // 丑闻 +50%
    market_shift: 1.3,  // 市场变化 +30%
  },
  craftsman: {
    major_update: 1.8,  // 更新概率 +80%
    award: 1.5,         // 奖项 +50%
    new_game: 0.5,      // 新游概率减半（慢工出细活）
  },
  learner: {
    gacha_event: 1.3,   // 跟随卡池活动
    major_update: 1.2,  // 跟随更新
    market_shift: 1.2,  // 关注市场变化
  },
};

const NEWS_TITLES: Record<NewsType, string[]> = {
  new_game: [
    '重磅新游上线',
    '全新竞品发布',
    '市场迎来新挑战者',
    '竞品开启测试',
    '年度大作正式公测',
    '创新玩法手游登场',
    '竞品公司公布新作',
  ],
  major_update: [
    '版本大更新',
    '全新玩法上线',
    '资料片发布',
    '系统全面升级',
    '周年庆版本开启',
    '重磅内容更新',
    '赛季全新改版',
  ],
  gacha_event: [
    '限定卡池开启',
    '人气角色 UP',
    '卡池概率提升',
    '新角色登场',
    '周年限定卡池',
    '节日特别卡池',
    '双 UP 卡池来袭',
  ],
  collaboration: [
    '重磅联动公开',
    'IP 合作启动',
    '跨界联动决定',
    '限定合作活动',
    '知名动漫联动',
    '经典 IP 合作',
    '梦幻联动官宣',
  ],
  price_war: [
    '福利战升级',
    '氪金活动打折',
    '充值优惠开启',
    '福利大放送',
    '限时折扣活动',
    '氪金力度加大',
    '超值礼包上线',
  ],
  scandal: [
    '运营事故频发',
    '玩家投诉增加',
    '争议事件爆发',
    '公关危机',
    '策划被炎上',
    '补偿方案引争议',
    '数据异常遭质疑',
  ],
  award: [
    '荣获行业大奖',
    '评分创新高',
    '获得权威推荐',
    '奖项提名',
    '入选年度最佳',
    '玩家选择奖',
    '创新玩法奖',
  ],
  financial: [
    '财报公布',
    '融资成功',
    '营收下滑',
    '投资增加',
    '完成新一轮融资',
    '季度财报亮眼',
    '营收再创新高',
  ],
  player_migration: [
    '玩家大量流失',
    '用户转向竞品',
    '活跃度下降',
    '退游潮出现',
    '在线人数锐减',
    '玩家集体退坑',
    '活跃度创新低',
  ],
  market_shift: [
    '市场格局变化',
    '行业趋势转变',
    '用户偏好改变',
    '新兴品类崛起',
    '细分赛道爆火',
    '玩法创新成趋势',
    '市场迎来洗牌',
  ],
};

const NEWS_CONTENT_TEMPLATES: Record<NewsType, string[]> = {
  new_game: [
    '{company}正式推出新游{game}，首日下载量突破{num}万，市场反响热烈',
    '{company}新品{game}上线，主打{feature}玩法，吸引大量玩家关注',
    '市场迎来新竞品，{company}的{game}今日公测，首日流水突破{num}万',
    '{company}倾力打造的新作{game}正式上线，创新的{feature}玩法获玩家好评',
    '经过{num}个月预约，{company}的{game}终于上线，首登免费榜 TOP{num}',
    '{company}公布新游{game}，采用先进的{feature}技术，打造沉浸式体验',
    '重磅！{company}新游戏{game}上线，{num}小时下载量破百万',
  ],
  major_update: [
    '{company}推出重大版本更新，新增{feature}内容，玩家活跃度大幅提升',
    '{game}迎来史上最大更新，{num}个新系统上线，老玩家回归',
    '{company}发布资料片，游戏内容大幅扩充，新增{num}小时剧情',
    '{game}版本{num}.0 更新，全新玩法{feature}上线，玩家好评如潮',
    '周年庆版本开启，{company}为{game}推出{num}位新角色和{num}章新剧情',
    '{game}赛季大改版，{company}引入{feature}机制，竞技性大幅提升',
    '{company}为{game}推出重磅更新，优化{num}项系统，游戏体验全面升级',
  ],
  gacha_event: [
    '{game}开启限定卡池，新角色{character}概率 UP，首日流水破{num}万',
    '{company}推出福利卡池，抽卡概率提升{num}%，玩家热情高涨',
    '人气角色回归，{game}卡池热度飙升，{num}小时流水达{num}万',
    '{game}双 UP 卡池开启，{character}和{num}位新角色同时概率提升',
    '周年限定卡池来袭，{company}保证{num}抽必出 SSR，玩家疯狂氪金',
    '节日特别卡池上线，{character}限定皮肤同步发售，预计流水{num}万',
    '{game}推出{num}%概率提升活动，{company}回应玩家诉求',
  ],
  collaboration: [
    '{game}×{ip}联动决定，限定角色即将登场，玩家期待值拉满',
    '{company}宣布与知名{ip}合作，{num}位联动角色将在下版本上线',
    '跨界联动开启，{game}推出限定活动，联动角色{character}免费赠送',
    '重磅！{game}与{ip}梦幻联动，限定卡池和主题活动同步开启',
    '{company}公布{ip}联动详情，{num}位角色换上联动皮肤，玩家直呼良心',
    '联动活动上线，{game}×{ip}限定剧情开放，完整体验需{num}小时',
    '{ip}粉丝狂欢，{game}联动角色{character}人气爆棚，社交媒体热议',
  ],
  price_war: [
    '{game}推出充值优惠活动，力度空前，首充翻倍限时{num}天',
    '{company}开启福利战，多种礼包打折，最高优惠达{num}%',
    '竞品氪金活动力度加大，吸引玩家消费，日流水提升{num}%',
    '{game}限时折扣开启，{num}元首充即可获得{num}连抽',
    '{company}推出{num}元礼包，内含{num}抽和稀有道具，性价比超高',
    '福利大放送！{game}登录{num}天送{num}抽，玩家活跃度提升',
    '{game}月卡价格下调{num}%，{company}以价换量争夺市场',
  ],
  scandal: [
    '{game}运营出现事故，{num}小时补偿方案引玩家不满，口碑下滑',
    '{company}陷入争议，{feature}问题被玩家炎上，公关团队紧急应对',
    '{game}被玩家投诉{num}次，{feature}机制涉嫌欺诈，监管部门介入',
    '运营事故！{company}误操作导致{game}数据异常，承诺补偿{num}抽',
    '{game}卡池概率遭质疑，玩家实测与官方数据不符，{company}回应',
    '策划被炎上，{game}不合理改动引发玩家集体抗议，{company}道歉',
    '{game}服务器{num}次崩溃，玩家流失严重，{company}紧急维护',
  ],
  award: [
    '{game}荣获{award}奖项，品质获认可，下载量提升{num}%',
    '{company}作品评分升至{num}分，创历史新高，玩家口碑爆棚',
    '{game}获得权威媒体推荐，入选年度最佳手游榜单',
    '喜报！{game}斩获{award}，{company}成为最大赢家',
    '{game}玩家评分达{num}分，{company}感谢玩家支持，承诺继续优化',
    '{company}荣获年度最佳游戏公司，{game}贡献{num}%营收',
    '{game}入选{award}提名，{company}创新玩法获行业认可',
  ],
  financial: [
    '{company}公布财报，营收{status}{num}%，{game}贡献主要收入',
    '{game}所属公司完成{num}亿元新一轮融资，估值达{num}亿',
    '{company}加大游戏开发投资，计划{num}年内推出{num}款新作',
    '财报显示{company}季度营收{num}亿，{game}占比{num}%',
    '{company}成功上市，募资{num}亿，将用于{game}全球推广',
    '投资增加！{company}获得{num}亿战略投资，{game}将推出国际版',
    '{company}财报亮眼，{game}月流水破{num}亿，利润率超{num}%',
  ],
  player_migration: [
    '{game}玩家活跃度下降{num}%，流失率上升，{company}紧急调整策略',
    '数据显示{game}用户正在转向其他产品，{num}万玩家退坑',
    '{company}面临玩家流失问题，{game}日活降至{num}万以下',
    '{game}在线人数锐减{num}%，玩家不满{feature}机制，集体退游',
    '退坑潮！{game}贴吧和论坛充斥弃坑言论，{company}沉默应对',
    '{game}活跃度创新低，{num}万玩家转向竞品，{company}压力大',
    '玩家大量流失，{game}社交群从{num}人降至{num}人，{company}需反思',
  ],
  market_shift: [
    '市场分析显示{trend}趋势明显，{company}调整战略应对变化',
    '用户偏好发生变化，{genre}品类崛起，{num}%玩家转向新游',
    '行业报告指出{trend}成为新方向，{company}布局{num}款相关产品',
    '市场迎来洗牌，{genre}游戏占比提升至{num}%，传统品类下滑',
    '细分赛道爆火，{genre}手游月流水破{num}亿，{company}加速研发',
    '玩法创新成趋势，{feature}机制被多款游戏采用，{company}跟进',
    '行业数据显示{trend}，{num}%玩家偏好改变，{company}调整方向',
  ],
};

const NEWS_TAGS: Record<NewsType, string[]> = {
  new_game: ['新游', '竞品', '市场'],
  major_update: ['版本更新', '玩法', '内容'],
  gacha_event: ['卡池', '抽卡', '限定'],
  collaboration: ['联动', 'IP', '合作'],
  price_war: ['福利', '氪金', '优惠'],
  scandal: ['事故', '争议', '公关'],
  award: ['奖项', '评分', '认可'],
  financial: ['财报', '融资', '投资'],
  player_migration: ['流失', '活跃', '用户'],
  market_shift: ['市场', '趋势', '行业'],
};

const GAME_NAMES = ['甜梦恋语', '星光之约', '心动的讯号', '恋爱循环', '暗恋橘生', '缘来是你', '双向心动', '甜蜜暴击'];
const IP_NAMES = ['知名动漫', '人气小说', '经典游戏', '虚拟偶像', '热门漫画', '经典影视'];
const CHARACTER_NAMES = ['新角色', '人气角色', '限定角色', 'SSR', 'UR 角色', '传说角色'];
const FEATURES = ['创新', '沉浸式', '互动', '剧情', '社交', '竞技', '养成', '策略'];
const TRENDS = ['品类多元化', '内容为王', '社交化', '精品化', '轻度化', '全球化'];
const GENRES = ['恋爱', '悬疑', '治愈', '搞笑', '科幻', '奇幻', '武侠'];
const AWARDS = ['年度最佳游戏', '最佳创新奖', '玩家选择奖', '最佳美术奖', '最佳音乐奖', '最佳叙事奖'];

/**
 * 竞品新闻系统类
 * 负责生成、存储和管理竞品公司的新闻事件
 * 
 * @example
 * ```typescript
 * const newsSystem = new CompetitorNewsSystem();
 * newsSystem.initialize(day);
 * const news = newsSystem.generateNews(competitors, day);
 * ```
 */
export class CompetitorNewsSystem {
  /** 存储所有新闻列表 */
  private news: CompetitorNews[] = [];
  /** 上次更新日期 */
  private lastUpdate: number = 0;
  /** 记录每家公司已生成新闻的日期，防止同一天生成多条新闻 */
  private generatedNewsByCompany: Map<string, Set<number>> = new Map();

  /**
   * 生成唯一新闻 ID
   * @returns 格式为 news_timestamp_random 的唯一 ID
   */
  private generateId(): string {
    return `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成新闻影响数据
   * 根据新闻类型和情感倾向计算对市场各方面的影响
   * 
   * @param type - 新闻类型
   * @param sentiment - 情感倾向
   * @returns 新闻影响数据
   */
  private generateImpact(type: NewsType, sentiment: 'positive' | 'neutral' | 'negative'): NewsImpact {
    const sentimentMultiplier = sentiment === 'positive' ? 1 : sentiment === 'negative' ? -1 : 0;

    switch (type) {
      case 'new_game':
        return {
          marketSentiment: 2 * sentimentMultiplier,
          competitionIntensity: 15,
          playerMigrationRisk: 0.10,
          revenueImpact: -0.05,
          reputationImpact: 1 * sentimentMultiplier,
        };
      case 'major_update':
        return {
          marketSentiment: 3 * sentimentMultiplier,
          competitionIntensity: 8,
          playerMigrationRisk: 0.05,
          revenueImpact: 0.08 * sentimentMultiplier,
          reputationImpact: 2 * sentimentMultiplier,
        };
      case 'gacha_event':
        return {
          marketSentiment: 1 * sentimentMultiplier,
          competitionIntensity: 5,
          playerMigrationRisk: 0.03,
          revenueImpact: 0.10 * sentimentMultiplier,
          reputationImpact: 0.5 * sentimentMultiplier,
        };
      case 'collaboration':
        return {
          marketSentiment: 4 * sentimentMultiplier,
          competitionIntensity: 10,
          playerMigrationRisk: 0.02,
          revenueImpact: 0.12 * sentimentMultiplier,
          reputationImpact: 3 * sentimentMultiplier,
        };
      case 'price_war':
        return {
          marketSentiment: -2,
          competitionIntensity: 20,
          playerMigrationRisk: 0.08,
          revenueImpact: -0.15,
          reputationImpact: -1,
        };
      case 'scandal':
        return {
          marketSentiment: -8,
          competitionIntensity: 5,
          playerMigrationRisk: 0.25,
          revenueImpact: -0.20,
          reputationImpact: -8,
        };
      case 'award':
        return {
          marketSentiment: 5,
          competitionIntensity: 3,
          playerMigrationRisk: -0.05,
          revenueImpact: 0.15,
          reputationImpact: 6,
        };
      case 'financial':
        return {
          marketSentiment: 3 * sentimentMultiplier,
          competitionIntensity: 5,
          playerMigrationRisk: 0,
          revenueImpact: 0.10 * sentimentMultiplier,
          reputationImpact: 2 * sentimentMultiplier,
        };
      case 'player_migration':
        return {
          marketSentiment: -3,
          competitionIntensity: 10,
          playerMigrationRisk: 0.35,
          revenueImpact: -0.08,
          reputationImpact: -2,
        };
      case 'market_shift':
        return {
          marketSentiment: 2 * sentimentMultiplier,
          competitionIntensity: 8,
          playerMigrationRisk: 0.05,
          revenueImpact: 0.05 * sentimentMultiplier,
          reputationImpact: 1 * sentimentMultiplier,
        };
      default:
        return {
          marketSentiment: 0,
          competitionIntensity: 0,
          playerMigrationRisk: 0,
          revenueImpact: 0,
          reputationImpact: 0,
        };
    }
  }

  /**
   * 生成新闻内容
   * 根据新闻类型随机选择标题和内容模板，并填充变量
   * 
   * @param type - 新闻类型
   * @param competitor - 竞品公司数据
   * @returns 包含标题和内容的对象
   */
  private generateNewsContent(type: NewsType, competitor: Competitor): { title: string; content: string } {
    const titles = NEWS_TITLES[type];
    const contents = NEWS_CONTENT_TEMPLATES[type];

    const title = titles[Math.floor(Math.random() * titles.length)];
    const contentTemplate = contents[Math.floor(Math.random() * contents.length)];

    const gameName = GAME_NAMES[Math.floor(Math.random() * GAME_NAMES.length)];
    const ipName = IP_NAMES[Math.floor(Math.random() * IP_NAMES.length)];
    const characterName = CHARACTER_NAMES[Math.floor(Math.random() * CHARACTER_NAMES.length)];
    const feature = FEATURES[Math.floor(Math.random() * FEATURES.length)];
    const trend = TRENDS[Math.floor(Math.random() * TRENDS.length)];
    const genre = GENRES[Math.floor(Math.random() * GENRES.length)];
    const award = AWARDS[Math.floor(Math.random() * AWARDS.length)];

    const num1 = Math.floor(50 + Math.random() * 200);
    const num2 = Math.floor(10 + Math.random() * 90);
    const num3 = Math.floor(3 + Math.random() * 10);
    const status = Math.random() > 0.5 ? '增长' : '下滑';

    const content = contentTemplate
      .replace('{company}', competitor.name)
      .replace('{game}', gameName)
      .replace('{num}', num1.toString())
      .replace('{feature}', feature)
      .replace('{ip}', ipName)
      .replace('{character}', characterName)
      .replace('{trend}', trend)
      .replace('{genre}', genre)
      .replace('{award}', award)
      .replace('{score}', (7 + Math.random() * 3).toFixed(1))
      .replace('{status}', status);

    return { title, content };
  }

  /**
   * 确定新闻情感倾向
   * 根据新闻类型和公司人设决定新闻是正面、中性还是负面
   * 
   * @param type - 新闻类型
   * @param personality - 公司人设
   * @returns 情感倾向
   */
  private determineSentiment(type: NewsType, personality: AIPersonality): 'positive' | 'neutral' | 'negative' {
    // 丑闻和玩家流失永远是负面
    if (type === 'scandal' || type === 'player_migration') {
      return 'negative';
    }

    // 重大更新根据质量随机决定（70% 正面，20% 中性，10% 负面）
    if (type === 'major_update') {
      const quality = Math.random();
      if (quality > 0.7) return 'positive';
      if (quality > 0.3) return 'neutral';
      return 'negative';
    }

    // 奖项和财经新闻根据人设有不同的情感分布
    if (type === 'award' || type === 'financial') {
      const rand = Math.random();
      if (personality === 'steady' || personality === 'craftsman') {
        // 稳健派和匠人更容易获得正面评价
        if (rand < 0.7) return 'positive';
        if (rand < 0.9) return 'neutral';
        return 'negative';
      }
      // 其他人设的标准分布
      if (rand < 0.5) return 'positive';
      if (rand < 0.85) return 'neutral';
      return 'negative';
    }

    // 其他类型根据默认情感决定
    const baseProb = NEWS_PROBABILITIES[type].defaultSentiment;
    if (baseProb === 'positive') {
      return Math.random() < 0.8 ? 'positive' : 'neutral';
    }
    if (baseProb === 'negative') {
      return Math.random() < 0.7 ? 'negative' : 'neutral';
    }
    return 'neutral';
  }

  /**
   * 获取调整后的新闻生成概率
   * 根据公司人设修正基础概率
   * 
   * @param competitor - 竞品公司数据
   * @param type - 新闻类型
   * @returns 调整后的每日生成概率
   */
  private getAdjustedProbability(competitor: Competitor, type: NewsType): number {
    const baseProb = NEWS_PROBABILITIES[type].dailyBase;
    const personality = competitor.personality;
    const modifiers = PERSONALITY_MODIFIERS[personality];

    if (modifiers && modifiers[type]) {
      return baseProb * modifiers[type]!;
    }

    return baseProb;
  }

  /**
   * 检查是否可以生成新闻
   * 确保同一公司在同一天不会生成多条新闻
   * 
   * @param competitorId - 公司 ID
   * @param day - 当前日期
   * @returns 是否可以生成新闻
   */
  private canGenerateNews(competitorId: string, day: number): boolean {
    const companyNewsDays = this.generatedNewsByCompany.get(competitorId);
    if (!companyNewsDays) {
      return true;
    }
    return !companyNewsDays.has(day);
  }

  /**
   * 标记某公司在某天已生成新闻
   * 同时清理 30 天前的记录以节省内存
   * 
   * @param competitorId - 公司 ID
   * @param day - 当前日期
   */
  private markNewsGenerated(competitorId: string, day: number): void {
    let companyNewsDays = this.generatedNewsByCompany.get(competitorId);
    if (!companyNewsDays) {
      companyNewsDays = new Set();
      this.generatedNewsByCompany.set(competitorId, companyNewsDays);
    }
    companyNewsDays.add(day);

    // 清理 30 天前的记录
    const thirtyDaysAgo = day - 30;
    for (const d of companyNewsDays) {
      if (d < thirtyDaysAgo) {
        companyNewsDays.delete(d);
      }
    }
  }

  /**
   * 选择要生成的新闻类型
   * 使用加权随机算法，根据公司人设和当前趋势选择新闻类型
   * 
   * @param competitor - 竞品公司数据
   * @param day - 当前日期
   * @returns 选中的新闻类型，如果无可生成类型则返回 null
   */
  private selectNewsType(competitor: Competitor, day: number): NewsType | null {
    const availableTypes: NewsType[] = [];
    const probabilities: number[] = [];

    const allTypes: NewsType[] = [
      'new_game',
      'major_update',
      'gacha_event',
      'collaboration',
      'price_war',
      'scandal',
      'award',
      'financial',
      'player_migration',
      'market_shift',
    ];

    for (const type of allTypes) {
      const prob = this.getAdjustedProbability(competitor, type);

      // 上升期公司不生成负面新闻（奖项、财经）
      if (competitor.recentTrend === '上升') {
        if (type === 'award' || type === 'financial') {
          continue;
        }
      }

      // 下滑期公司更容易生成负面新闻（丑闻、玩家流失）
      if (competitor.recentTrend === '下滑') {
        if (type === 'scandal' || type === 'player_migration') {
          continue;
        }
      }

      availableTypes.push(type);
      probabilities.push(prob);
    }

    if (availableTypes.length === 0) {
      return null;
    }

    // 加权随机选择
    const totalProb = probabilities.reduce((sum, p) => sum + p, 0);
    const rand = Math.random() * totalProb;
    let cumulative = 0;

    for (let i = 0; i < availableTypes.length; i++) {
      cumulative += probabilities[i];
      if (rand <= cumulative) {
        return availableTypes[i];
      }
    }

    return availableTypes[availableTypes.length - 1];
  }

  /**
   * 生成新闻持续时间
   * 在配置的最短和最长时间之间随机
   * 
   * @param type - 新闻类型
   * @returns 持续天数
   */
  private generateDuration(type: NewsType): number {
    const config = NEWS_PROBABILITIES[type];
    const randomVariation = Math.random() * (config.durationMax - config.durationMin);
    return Math.floor(config.durationMin + randomVariation);
  }

  /**
   * 初始化新闻系统
   * 清空所有新闻数据，重置状态
   * 
   * @param day - 当前日期
   */
  initialize(day: number): void {
    this.news = [];
    this.lastUpdate = day;
    this.generatedNewsByCompany.clear();
  }

  /**
   * 更新新闻系统
   * 清理过期新闻，更新最后更新时间
   * 
   * @param day - 当前日期
   */
  update(day: number): void {
    if (day - this.lastUpdate < 1) return;

    this.news = this.news.filter(n => day - n.day < n.duration);
    this.lastUpdate = day;
  }

  /**
   * 生成竞品新闻
   * 遍历所有竞品公司，根据概率和人设生成新闻
   * 
   * @param competitors - 竞品公司列表
   * @param day - 当前日期
   * @returns 新生成的新闻列表
   */
  generateNews(competitors: Competitor[], day: number): CompetitorNews[] {
    const generatedNews: CompetitorNews[] = [];

    for (const competitor of competitors) {
      // 凉凉的公司不生成新闻
      if (competitor.state === '凉凉') {
        continue;
      }

      // 检查今天是否已生成过新闻
      if (!this.canGenerateNews(competitor.id, day)) {
        continue;
      }

      // 选择新闻类型
      const selectedType = this.selectNewsType(competitor, day);

      if (!selectedType) {
        continue;
      }

      // 概率检定
      const roll = Math.random();
      const adjustedProb = this.getAdjustedProbability(competitor, selectedType);

      if (roll > adjustedProb) {
        continue;
      }

      // 生成新闻内容
      const sentiment = this.determineSentiment(selectedType, competitor.personality);
      const { title, content } = this.generateNewsContent(selectedType, competitor);
      const duration = this.generateDuration(selectedType);

      const newsItem: CompetitorNews = {
        id: this.generateId(),
        companyId: competitor.id,
        companyName: competitor.name,
        type: selectedType,
        title,
        content,
        day,
        impact: this.generateImpact(selectedType, sentiment),
        sentiment,
        duration,
        tags: NEWS_TAGS[selectedType],
      };

      generatedNews.push(newsItem);
      this.news.push(newsItem);
      this.markNewsGenerated(competitor.id, day);
    }

    return generatedNews;
  }

  /**
   * 获取竞品新闻列表
   * 按日期倒序排列
   * 
   * @param limit - 可选，限制返回数量
   * @returns 新闻列表
   */
  getCompetitorNews(limit?: number): CompetitorNews[] {
    const sortedNews = [...this.news].sort((a, b) => b.day - a.day);
    return limit ? sortedNews.slice(0, limit) : sortedNews;
  }

  /**
   * 根据类型获取新闻
   * 
   * @param type - 新闻类型
   * @returns 指定类型的新闻列表
   */
  getNewsByType(type: NewsType): CompetitorNews[] {
    return this.news.filter(n => n.type === type);
  }

  /**
   * 根据公司获取新闻
   * 
   * @param companyId - 公司 ID
   * @returns 指定公司的新闻列表
   */
  getNewsByCompany(companyId: string): CompetitorNews[] {
    return this.news.filter(n => n.companyId === companyId);
  }

  /**
   * 清理过期新闻
   * 
   * @param day - 当前日期
   */
  clearExpiredNews(day: number): void {
    this.news = this.news.filter(n => day - n.day < n.duration);
  }

  /**
   * 获取系统状态
   * 
   * @returns 包含新闻列表和最后更新时间的状态对象
   */
  getState(): { news: CompetitorNews[]; lastUpdate: number } {
    return {
      news: this.news,
      lastUpdate: this.lastUpdate,
    };
  }

  /**
   * 设置系统状态
   * 用于数据持久化恢复
   * 
   * @param state - 状态对象
   */
  setState(state: { news: CompetitorNews[]; lastUpdate: number }): void {
    this.news = state.news;
    this.lastUpdate = state.lastUpdate;
  }

  /**
   * 计算单条新闻的影响
   * 根据新闻类型、情感倾向、标题和内容计算各项影响值
   * 
   * @param news - 竞品新闻对象
   * @returns 新闻影响对象
   */
  calculateNewsImpact(news: CompetitorNews): NewsImpact {
    const baseImpact = this.generateImpact(news.type, news.sentiment);
    
    const sentimentMultiplier = news.sentiment === 'positive' ? 1.2 : news.sentiment === 'negative' ? 0.8 : 1.0;
    
    const titleLength = news.title.length;
    const contentLength = news.content.length;
    const lengthFactor = Math.min(1.0, (titleLength + contentLength / 10) / 100);
    
    return {
      marketSentiment: this.clamp(baseImpact.marketSentiment * sentimentMultiplier * (1 + lengthFactor * 0.2), -10, 10),
      competitionIntensity: this.clamp(baseImpact.competitionIntensity * (1 + lengthFactor * 0.1), 0, 100),
      playerMigrationRisk: this.clamp(baseImpact.playerMigrationRisk * (1 + lengthFactor * 0.1), -0.5, 0.5),
      revenueImpact: this.clamp(baseImpact.revenueImpact * sentimentMultiplier * (1 + lengthFactor * 0.1), -0.3, 0.3),
      reputationImpact: this.clamp(baseImpact.reputationImpact * sentimentMultiplier * (1 + lengthFactor * 0.2), -10, 10),
    };
  }

  /**
   * 计算多条新闻的综合影响
   * 实现叠加规则：
   * - 正向影响（marketSentiment>0）：累加
   * - 负向影响（marketSentiment<0）：取最大值
   * - 同类型影响：取最新（避免重复计算）
   * 
   * @param newsList - 新闻列表
   * @returns 综合影响对象
   */
  calculateCombinedImpact(newsList: CompetitorNews[]): CombinedImpact {
    if (newsList.length === 0) {
      return {
        totalImpact: {
          marketSentiment: 0,
          competitionIntensity: 0,
          playerMigrationRisk: 0,
          revenueImpact: 0,
          reputationImpact: 0,
        },
        breakdown: [],
        summary: '无新闻影响',
      };
    }

    const sortedNews = [...newsList].sort((a, b) => a.day - b.day);
    
    const breakdown: Array<{ newsId: string; impact: NewsImpact }> = [];
    let totalImpact: NewsImpact = {
      marketSentiment: 0,
      competitionIntensity: 0,
      playerMigrationRisk: 0,
      revenueImpact: 0,
      reputationImpact: 0,
    };

    for (const news of sortedNews) {
      const impact = this.calculateNewsImpact(news);
      breakdown.push({ newsId: news.id, impact });

      if (impact.marketSentiment > 0) {
        totalImpact.marketSentiment += impact.marketSentiment;
        totalImpact.revenueImpact += impact.revenueImpact;
        totalImpact.reputationImpact += impact.reputationImpact;
      } else if (impact.marketSentiment < 0) {
        totalImpact.marketSentiment = Math.min(totalImpact.marketSentiment, impact.marketSentiment);
        totalImpact.revenueImpact = Math.min(totalImpact.revenueImpact, impact.revenueImpact);
        totalImpact.reputationImpact = Math.min(totalImpact.reputationImpact, impact.reputationImpact);
      }

      totalImpact.competitionIntensity = Math.max(totalImpact.competitionIntensity, impact.competitionIntensity);
      totalImpact.playerMigrationRisk = Math.max(totalImpact.playerMigrationRisk, impact.playerMigrationRisk);
    }

    totalImpact = {
      marketSentiment: this.clamp(totalImpact.marketSentiment, -10, 10),
      competitionIntensity: this.clamp(totalImpact.competitionIntensity, 0, 100),
      playerMigrationRisk: this.clamp(totalImpact.playerMigrationRisk, -0.5, 0.5),
      revenueImpact: this.clamp(totalImpact.revenueImpact, -0.3, 0.3),
      reputationImpact: this.clamp(totalImpact.reputationImpact, -10, 10),
    };

    const summary = this.generateImpactSummary(totalImpact, newsList.length);

    return {
      totalImpact,
      breakdown,
      summary,
    };
  }

  /**
   * 分析新闻情感
   * 根据新闻类型、标题、内容分析情感倾向
   * 
   * @param news - 竞品新闻对象
   * @returns 情感分析结果
   */
  analyzeSentiment(news: CompetitorNews): SentimentAnalysis {
    const positiveKeywords = [
      '重磅', '创新', '突破', '好评', '成功', '增长', '获奖', '推荐',
      '热门', '期待', '良心', '超值', '提升', '优化', '升级', '庆典',
      '限定', '福利', '优惠', '免费', '赠送', '返利', '折扣', '活动',
    ];
    const negativeKeywords = [
      '事故', '争议', '投诉', '下滑', '流失', '危机', '质疑', '抗议',
      '崩溃', '异常', '欺诈', '虚假', '诱导', '强制', '不合理', '炎上',
      '退坑', '弃坑', '失望', '不满', '下降', '锐减', '暴跌', '恶化',
    ];

    const text = (news.title + news.content).toLowerCase();
    
    let positiveCount = 0;
    let negativeCount = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of positiveKeywords) {
      if (text.includes(keyword)) {
        positiveCount++;
        matchedKeywords.push(keyword);
      }
    }

    for (const keyword of negativeKeywords) {
      if (text.includes(keyword)) {
        negativeCount++;
        matchedKeywords.push(keyword);
      }
    }

    const typeSentimentScore = this.getTypeSentimentScore(news.type);
    
    const keywordScore = positiveCount - negativeCount;
    const totalScore = typeSentimentScore + keywordScore * 0.5;
    
    let primarySentiment: 'positive' | 'negative' | 'neutral';
    if (totalScore > 1.5) {
      primarySentiment = 'positive';
    } else if (totalScore < -1.5) {
      primarySentiment = 'negative';
    } else {
      primarySentiment = 'neutral';
    }

    const intensity = Math.min(1, (Math.abs(totalScore) + positiveCount + negativeCount) / 10);
    
    const confidence = this.calculateConfidence(news.type, positiveCount, negativeCount);

    return {
      primarySentiment,
      intensity,
      keywords: matchedKeywords.slice(0, 5),
      confidence,
    };
  }

  /**
   * 辅助方法：限制数值范围
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * 辅助方法：获取新闻类型的情感基础分
   */
  private getTypeSentimentScore(type: NewsType): number {
    const scores: Record<NewsType, number> = {
      new_game: 0.5,
      major_update: 0.3,
      gacha_event: 0.8,
      collaboration: 1.0,
      price_war: -0.5,
      scandal: -2.5,
      award: 2.0,
      financial: 0.2,
      player_migration: -1.5,
      market_shift: 0,
    };
    return scores[type];
  }

  /**
   * 辅助方法：计算分析置信度
   */
  private calculateConfidence(type: NewsType, positiveCount: number, negativeCount: number): number {
    const totalKeywords = positiveCount + negativeCount;
    const baseConfidence = Math.min(1, totalKeywords / 5);
    
    const typeConfidence: Record<NewsType, number> = {
      new_game: 0.7,
      major_update: 0.6,
      gacha_event: 0.8,
      collaboration: 0.9,
      price_war: 0.7,
      scandal: 0.95,
      award: 0.9,
      financial: 0.6,
      player_migration: 0.85,
      market_shift: 0.5,
    };
    
    return Math.min(1, (baseConfidence + typeConfidence[type]) / 2);
  }

  /**
   * 辅助方法：生成影响摘要
   */
  private generateImpactSummary(impact: NewsImpact, newsCount: number): string {
    const parts: string[] = [];
    
    if (Math.abs(impact.marketSentiment) > 3) {
      parts.push(impact.marketSentiment > 0 ? '市场情绪高涨' : '市场情绪低迷');
    }
    
    if (impact.competitionIntensity > 50) {
      parts.push('竞争激烈');
    }
    
    if (impact.playerMigrationRisk > 0.2) {
      parts.push('玩家流失风险高');
    } else if (impact.playerMigrationRisk < -0.1) {
      parts.push('玩家回流趋势');
    }
    
    if (Math.abs(impact.revenueImpact) > 0.15) {
      parts.push(impact.revenueImpact > 0 ? '收入显著增长' : '收入面临压力');
    }
    
    if (Math.abs(impact.reputationImpact) > 4) {
      parts.push(impact.reputationImpact > 0 ? '声誉大幅提升' : '声誉严重受损');
    }
    
    if (parts.length === 0) {
      return `共${newsCount}条新闻，整体影响平稳`;
    }
    
    return `共${newsCount}条新闻：${parts.join('，')}`;
  }
}

/**
 * 竞品新闻系统单例实例
 */
export const CompetitorNewsSystemInstance = new CompetitorNewsSystem();

/**
 * 单元测试用例（注释形式）
 * 
 * @example
 * ```typescript
 * // ============================================
 * // 测试 calculateNewsImpact 方法
 * // ============================================
 * 
 * const newsSystem = new CompetitorNewsSystem();
 * 
 * // 测试用例 1: 正面新闻（获奖）
 * const awardNews: CompetitorNews = {
 *   id: 'test_award_1',
 *   companyId: 'comp_1',
 *   companyName: '测试公司',
 *   type: 'award',
 *   title: '荣获行业大奖',
 *   content: '测试公司的游戏荣获年度最佳游戏大奖，品质获认可',
 *   day: 100,
 *   impact: { marketSentiment: 0, competitionIntensity: 0, playerMigrationRisk: 0, revenueImpact: 0, reputationImpact: 0 },
 *   sentiment: 'positive',
 *   duration: 7,
 *   tags: ['奖项', '认可']
 * };
 * 
 * const awardImpact = newsSystem.calculateNewsImpact(awardNews);
 * console.assert(awardImpact.marketSentiment > 0, '获奖新闻应有正面市场情感影响');
 * console.assert(awardImpact.reputationImpact > 5, '获奖新闻应有较高的声誉提升');
 * console.assert(awardImpact.revenueImpact > 0, '获奖新闻应有正面收入影响');
 * console.assert(awardImpact.marketSentiment <= 10, '市场情感影响不应超过上限');
 * console.assert(awardImpact.reputationImpact <= 10, '声誉影响不应超过上限');
 * 
 * // 测试用例 2: 负面新闻（丑闻）
 * const scandalNews: CompetitorNews = {
 *   id: 'test_scandal_1',
 *   companyId: 'comp_2',
 *   companyName: '问题公司',
 *   type: 'scandal',
 *   title: '运营事故频发，玩家投诉增加',
 *   content: '问题公司游戏连续出现运营事故，补偿方案引争议，玩家集体抗议',
 *   day: 100,
 *   impact: { marketSentiment: 0, competitionIntensity: 0, playerMigrationRisk: 0, revenueImpact: 0, reputationImpact: 0 },
 *   sentiment: 'negative',
 *   duration: 14,
 *   tags: ['事故', '争议']
 * };
 * 
 * const scandalImpact = newsSystem.calculateNewsImpact(scandalNews);
 * console.assert(scandalImpact.marketSentiment < -5, '丑闻新闻应有严重负面市场情感影响');
 * console.assert(scandalImpact.reputationImpact < -5, '丑闻新闻应有严重声誉损害');
 * console.assert(scandalImpact.playerMigrationRisk > 0.1, '丑闻新闻应有玩家流失风险');
 * console.assert(scandalImpact.revenueImpact < 0, '丑闻新闻应有负面收入影响');
 * 
 * // 测试用例 3: 中性新闻（市场变化）
 * const marketShiftNews: CompetitorNews = {
 *   id: 'test_shift_1',
 *   companyId: 'comp_3',
 *   companyName: '观察公司',
 *   type: 'market_shift',
 *   title: '市场格局变化，新兴品类崛起',
 *   content: '行业报告显示用户偏好发生变化，轻度游戏品类崛起',
 *   day: 100,
 *   impact: { marketSentiment: 0, competitionIntensity: 0, playerMigrationRisk: 0, revenueImpact: 0, reputationImpact: 0 },
 *   sentiment: 'neutral',
 *   duration: 7,
 *   tags: ['市场', '趋势']
 * };
 * 
 * const shiftImpact = newsSystem.calculateNewsImpact(marketShiftNews);
 * console.assert(Math.abs(shiftImpact.marketSentiment) < 3, '中性新闻市场情感影响应较小');
 * console.assert(shiftImpact.competitionIntensity > 0, '市场变化应增加竞争强度');
 * 
 * // ============================================
 * // 测试 calculateCombinedImpact 方法
 * // ============================================
 * 
 * // 测试用例 4: 多条正面新闻叠加
 * const positiveNewsList: CompetitorNews[] = [
 *   {
 *     id: 'pos_1',
 *     companyId: 'comp_1',
 *     companyName: '优秀公司',
 *     type: 'award',
 *     title: '获得年度最佳',
 *     content: '公司产品获得行业认可',
 *     day: 100,
 *     impact: { marketSentiment: 0, competitionIntensity: 0, playerMigrationRisk: 0, revenueImpact: 0, reputationImpact: 0 },
 *     sentiment: 'positive',
 *     duration: 7,
 *     tags: ['奖项']
 *   },
 *   {
 *     id: 'pos_2',
 *     companyId: 'comp_1',
 *     companyName: '优秀公司',
 *     type: 'collaboration',
 *     title: '重磅联动公开',
 *     content: '与知名 IP 展开合作',
 *     day: 101,
 *     impact: { marketSentiment: 0, competitionIntensity: 0, playerMigrationRisk: 0, revenueImpact: 0, reputationImpact: 0 },
 *     sentiment: 'positive',
 *     duration: 10,
 *     tags: ['联动']
 *   }
 * ];
 * 
 * const positiveCombined = newsSystem.calculateCombinedImpact(positiveNewsList);
 * console.assert(positiveCombined.totalImpact.marketSentiment > 0, '多条正面新闻应有正向市场情感');
 * console.assert(positiveCombined.totalImpact.reputationImpact > 0, '多条正面新闻应有正向声誉影响');
 * console.assert(positiveCombined.breakdown.length === 2, '应包含 2 条新闻的影响明细');
 * console.assert(positiveCombined.summary.includes('正面'), '摘要应体现正面影响');
 * 
 * // 测试用例 5: 混合新闻叠加（有正有负）
 * const mixedNewsList: CompetitorNews[] = [
 *   {
 *     id: 'mix_1',
 *     companyId: 'comp_1',
 *     companyName: '波动公司',
 *     type: 'award',
 *     title: '获得创新奖',
 *     content: '产品创新获认可',
 *     day: 100,
 *     impact: { marketSentiment: 0, competitionIntensity: 0, playerMigrationRisk: 0, revenueImpact: 0, reputationImpact: 0 },
 *     sentiment: 'positive',
 *     duration: 7,
 *     tags: ['奖项']
 *   },
 *   {
 *     id: 'mix_2',
 *     companyId: 'comp_1',
 *     companyName: '波动公司',
 *     type: 'scandal',
 *     title: '运营事故',
 *     content: '服务器崩溃，玩家投诉',
 *     day: 102,
 *     impact: { marketSentiment: 0, competitionIntensity: 0, playerMigrationRisk: 0, revenueImpact: 0, reputationImpact: 0 },
 *     sentiment: 'negative',
 *     duration: 14,
 *     tags: ['事故']
 *   }
 * ];
 * 
 * const mixedCombined = newsSystem.calculateCombinedImpact(mixedNewsList);
 * console.assert(mixedCombined.totalImpact.marketSentiment < 0, '负面新闻应主导市场情感（取最大值规则）');
 * console.assert(mixedCombined.breakdown.length === 2, '应包含 2 条新闻的影响明细');
 * 
 * // 测试用例 6: 空新闻列表
 * const emptyCombined = newsSystem.calculateCombinedImpact([]);
 * console.assert(emptyCombined.totalImpact.marketSentiment === 0, '空列表市场情感应为 0');
 * console.assert(emptyCombined.breakdown.length === 0, '空列表应无明细');
 * console.assert(emptyCombined.summary.includes('无新闻'), '摘要应说明无新闻');
 * 
 * // ============================================
 * // 测试 analyzeSentiment 方法
 * // ============================================
 * 
 * // 测试用例 7: 明显正面情感
 * const positiveSentimentNews: CompetitorNews = {
 *   id: 'sent_1',
 *   companyId: 'comp_1',
 *   companyName: '成功公司',
 *   type: 'award',
 *   title: '重磅！荣获年度最佳游戏，创新突破获好评',
 *   content: '公司产品成功获得行业大奖，玩家一致好评，市场反响热烈',
 *   day: 100,
 *   impact: { marketSentiment: 0, competitionIntensity: 0, playerMigrationRisk: 0, revenueImpact: 0, reputationImpact: 0 },
 *   sentiment: 'positive',
 *   duration: 7,
 *   tags: ['奖项']
 * };
 * 
 * const positiveSentiment = newsSystem.analyzeSentiment(positiveSentimentNews);
 * console.assert(positiveSentiment.primarySentiment === 'positive', '应识别为正面情感');
 * console.assert(positiveSentiment.intensity > 0.5, '情感强度应较高');
 * console.assert(positiveSentiment.keywords.length > 0, '应提取到情感关键词');
 * console.assert(positiveSentiment.confidence > 0.7, '置信度应较高');
 * 
 * // 测试用例 8: 明显负面情感
 * const negativeSentimentNews: CompetitorNews = {
 *   id: 'sent_2',
 *   companyId: 'comp_2',
 *   companyName: '问题公司',
 *   type: 'scandal',
 *   title: '运营事故频发，玩家投诉增加，争议事件爆发',
 *   content: '服务器崩溃，补偿方案引争议，玩家集体抗议，流失严重',
 *   day: 100,
 *   impact: { marketSentiment: 0, competitionIntensity: 0, playerMigrationRisk: 0, revenueImpact: 0, reputationImpact: 0 },
 *   sentiment: 'negative',
 *   duration: 14,
 *   tags: ['事故']
 * };
 * 
 * const negativeSentiment = newsSystem.analyzeSentiment(negativeSentimentNews);
 * console.assert(negativeSentiment.primarySentiment === 'negative', '应识别为负面情感');
 * console.assert(negativeSentiment.intensity > 0.5, '情感强度应较高');
 * console.assert(negativeSentiment.keywords.some(k => ['事故', '投诉', '争议', '崩溃'].includes(k)), '应提取到负面关键词');
 * console.assert(negativeSentiment.confidence > 0.8, '丑闻新闻置信度应很高');
 * 
 * // 测试用例 9: 中性情感
 * const neutralSentimentNews: CompetitorNews = {
 *   id: 'sent_3',
 *   companyId: 'comp_3',
 *   companyName: '普通公司',
 *   type: 'financial',
 *   title: '财报公布，营收持平',
 *   content: '公司公布季度财报，整体表现符合预期',
 *   day: 100,
 *   impact: { marketSentiment: 0, competitionIntensity: 0, playerMigrationRisk: 0, revenueImpact: 0, reputationImpact: 0 },
 *   sentiment: 'neutral',
 *   duration: 5,
 *   tags: ['财报']
 * };
 * 
 * const neutralSentiment = newsSystem.analyzeSentiment(neutralSentimentNews);
 * console.assert(neutralSentiment.primarySentiment === 'neutral', '应识别为中性情感');
 * console.assert(neutralSentiment.intensity < 0.5, '情感强度应较低');
 * 
 * // ============================================
 * // 测试边界条件
 * // ============================================
 * 
 * // 测试用例 10: 影响值边界检查
 * const extremeNews: CompetitorNews = {
 *   id: 'extreme_1',
 *   companyId: 'comp_1',
 *   companyName: '极端公司',
 *   type: 'scandal',
 *   title: '特大丑闻'.padEnd(100, '!'), // 超长标题
 *   content: '极其严重的问题'.padEnd(500, '!'), // 超长内容
 *   day: 100,
 *   impact: { marketSentiment: 0, competitionIntensity: 0, playerMigrationRisk: 0, revenueImpact: 0, reputationImpact: 0 },
 *   sentiment: 'negative',
 *   duration: 30,
 *   tags: ['事故']
 * };
 * 
 * const extremeImpact = newsSystem.calculateNewsImpact(extremeNews);
 * console.assert(extremeImpact.marketSentiment >= -10, '市场情感不应低于下限 -10');
 * console.assert(extremeImpact.marketSentiment <= 10, '市场情感不应高于上限 10');
 * console.assert(extremeImpact.competitionIntensity >= 0, '竞争强度不应低于 0');
 * console.assert(extremeImpact.competitionIntensity <= 100, '竞争强度不应高于 100');
 * console.assert(extremeImpact.playerMigrationRisk >= -0.5, '玩家流失风险不应低于 -0.5');
 * console.assert(extremeImpact.playerMigrationRisk <= 0.5, '玩家流失风险不应高于 0.5');
 * console.assert(extremeImpact.revenueImpact >= -0.3, '收入影响不应低于 -0.3');
 * console.assert(extremeImpact.revenueImpact <= 0.3, '收入影响不应高于 0.3');
 * console.assert(extremeImpact.reputationImpact >= -10, '声誉影响不应低于 -10');
 * console.assert(extremeImpact.reputationImpact <= 10, '声誉影响不应高于 10');
 * 
 * console.log('所有测试用例执行完成');
 * ```
 */
