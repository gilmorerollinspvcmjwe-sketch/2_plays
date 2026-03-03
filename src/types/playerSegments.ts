/**
 * 玩家类型和社群系统类型定义
 * 模拟真实乙游玩家社区的复杂生态
 */

// 玩家类型
export type PlayerSegmentType = 
  | 'story'      // 剧情党
  | 'visual'     // 颜值党
  | 'power'      // 强度党
  | 'whale'      // 氪金党
  | 'f2p'        // 白嫖党
  | 'cp'         // CP党
  | 'solo'       // 单推人
  | 'casual';    // 休闲党

// 玩家类型配置
export interface PlayerSegment {
  type: PlayerSegmentType;
  name: string;
  icon: string;
  color: string;
  description: string;
  characteristics: string[];
  focusAreas: string[];
  feedbackStyle: 'rational' | 'emotional' | 'data-driven' | 'extreme';
  sensitivity: {
    plot: number;      // 对剧情敏感度 0-1
    visual: number;    // 对美术敏感度 0-1
    gacha: number;     // 对爆率敏感度 0-1
    welfare: number;   // 对福利敏感度 0-1
    character: number; // 对角色待遇敏感度 0-1
  };
  defaultRatio: number; // 默认占比
}

// 7种玩家类型定义
export const PLAYER_SEGMENTS: PlayerSegment[] = [
  {
    type: 'story',
    name: '剧情党',
    icon: 'description',
    color: '#1890ff',
    description: '重视故事质量和人物塑造',
    characteristics: ['理性分析', '长篇大论', '关注细节', '逻辑控'],
    focusAreas: ['剧情逻辑', '人物塑造', '世界观', '文案质量'],
    feedbackStyle: 'rational',
    sensitivity: {
      plot: 0.9,
      visual: 0.3,
      gacha: 0.2,
      welfare: 0.4,
      character: 0.7
    },
    defaultRatio: 0.2
  },
  {
    type: 'visual',
    name: '颜值党',
    icon: 'photo-o',
    color: '#FF69B4',
    description: '重视美术质量和卡面颜值',
    characteristics: ['颜控', '简短直接', '情绪激烈', '视觉优先'],
    focusAreas: ['立绘质量', 'CG精美度', '卡面设计', 'UI美观'],
    feedbackStyle: 'emotional',
    sensitivity: {
      plot: 0.2,
      visual: 0.95,
      gacha: 0.4,
      welfare: 0.3,
      character: 0.6
    },
    defaultRatio: 0.25
  },
  {
    type: 'power',
    name: '强度党',
    icon: 'fire-o',
    color: '#fa8c16',
    description: '重视数值平衡和爆率',
    characteristics: ['数据说话', '容易带节奏', '追求效率', '计算收益'],
    focusAreas: ['爆率合理性', '数值平衡', '强度梯度', '性价比'],
    feedbackStyle: 'data-driven',
    sensitivity: {
      plot: 0.1,
      visual: 0.2,
      gacha: 0.95,
      welfare: 0.8,
      character: 0.3
    },
    defaultRatio: 0.15
  },
  {
    type: 'whale',
    name: '氪金党',
    icon: 'diamond-o',
    color: '#FFD700',
    description: '高消费能力，追求限定和稀有度',
    characteristics: ['要求特权', '反馈直接', '消费能力强', '追求独特'],
    focusAreas: ['限定内容', '稀有度', 'VIP待遇', '专属福利'],
    feedbackStyle: 'extreme',
    sensitivity: {
      plot: 0.3,
      visual: 0.6,
      gacha: 0.7,
      welfare: 0.5,
      character: 0.8
    },
    defaultRatio: 0.08
  },
  {
    type: 'f2p',
    name: '白嫖党',
    icon: 'gift-o',
    color: '#52c41a',
    description: '零氪玩家，容易满足，传播力强',
    characteristics: ['容易满足', '传播力强', '知足常乐', '福利导向'],
    focusAreas: ['免费福利', '活动奖励', '可玩性', '肝度'],
    feedbackStyle: 'emotional',
    sensitivity: {
      plot: 0.5,
      visual: 0.4,
      gacha: 0.6,
      welfare: 0.95,
      character: 0.4
    },
    defaultRatio: 0.2
  },
  {
    type: 'cp',
    name: 'CP党',
    icon: 'like-o',
    color: '#eb2f96',
    description: '热衷组CP，关注角色互动',
    characteristics: ['情绪化', '容易引战', '磕糖狂魔', 'CP洁癖'],
    focusAreas: ['角色互动', '发糖频率', 'CP平衡', '剧情糖度'],
    feedbackStyle: 'emotional',
    sensitivity: {
      plot: 0.7,
      visual: 0.5,
      gacha: 0.3,
      welfare: 0.4,
      character: 0.9
    },
    defaultRatio: 0.07
  },
  {
    type: 'solo',
    name: '单推人',
    icon: 'star-o',
    color: '#722ed1',
    description: '只爱一个角色，极端情绪化',
    characteristics: ['极端忠诚', '排他性强', '情绪化', '护短'],
    focusAreas: ['自推待遇', '戏份多少', '资源分配', '官方态度'],
    feedbackStyle: 'extreme',
    sensitivity: {
      plot: 0.4,
      visual: 0.5,
      gacha: 0.6,
      welfare: 0.5,
      character: 1.0
    },
    defaultRatio: 0.05
  }
];

// 玩家社群状态
export interface PlayerCommunity {
  segments: {
    type: PlayerSegmentType;
    count: number;
    satisfaction: number; // 0-100
    sentiment: number;    // -1 到 1
  }[];
  totalPlayers: number;
  overallSatisfaction: number;
  overallSentiment: number;
  hotTopics: HotTopic[];
  activeRate: number;     // 活跃率
  retentionRate: number;  // 留存率
}

// 热点话题
export interface HotTopic {
  id: string;
  title: string;
  type: 'positive' | 'negative' | 'neutral' | 'controversial';
  heat: number;           // 热度 0-100
  participants: number;
  relatedSegments: PlayerSegmentType[];
  createdAt: string;
  isTrending: boolean;
}

// 评论模板
export interface CommentTemplate {
  segment: PlayerSegmentType;
  sentiment: 'positive' | 'negative' | 'neutral';
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  templates: string[];
  triggers: string[]; // 触发条件
}

// 评论模板库
export const COMMENT_TEMPLATES: CommentTemplate[] = [
  // 剧情党 - 正面
  {
    segment: 'story',
    sentiment: 'positive',
    intensity: 'medium',
    templates: [
      '这次剧情写得不错，人物塑造很立体',
      '文案组加鸡腿！台词写得很有感觉',
      '剧情逻辑通顺，伏笔回收得不错',
      '这个角色的成长弧线很完整'
    ],
    triggers: ['good_plot', 'character_development']
  },
  {
    segment: 'story',
    sentiment: 'positive',
    intensity: 'high',
    templates: [
      '神剧情！这波文案在大气层！',
      '绝了！这个反转我吹爆！',
      '年度最佳剧情预定！',
      '文案组封神！这剧情深度我哭了'
    ],
    triggers: ['excellent_plot', 'plot_twist']
  },
  // 剧情党 - 负面
  {
    segment: 'story',
    sentiment: 'negative',
    intensity: 'medium',
    templates: [
      '剧情有点平淡，缺少爆点',
      '人物动机不太合理，感觉强行推进',
      '这段剧情逻辑有点问题',
      '希望后面能有更好的展开'
    ],
    triggers: ['boring_plot', 'logic_issue']
  },
  {
    segment: 'story',
    sentiment: 'negative',
    intensity: 'high',
    templates: [
      '这剧情写的什么玩意？文案换人了吗？',
      '人设崩了！官方懂不懂这个角色啊？',
      '强行降智，这剧情我接受不了',
      '退坑预警，再这样就弃了'
    ],
    triggers: ['bad_plot', 'character_ruin']
  },
  // 颜值党 - 正面
  {
    segment: 'visual',
    sentiment: 'positive',
    intensity: 'high',
    templates: [
      '啊啊啊这个卡面太绝了！',
      '美工组yyds！这立绘我吹爆！',
      '老公好帅！我直接 hi 老公',
      '这CG质量，我好了'
    ],
    triggers: ['good_art', 'new_card']
  },
  // 颜值党 - 负面
  {
    segment: 'visual',
    sentiment: 'negative',
    intensity: 'high',
    templates: [
      '这立绘崩了吧？美工跑路了？',
      '卡面质量下滑严重，不想氪了',
      '这画的什么鬼，还我帅哥',
      '立绘劝退，省钱了'
    ],
    triggers: ['bad_art', 'art_quality_down']
  },
  // 强度党 - 正面
  {
    segment: 'power',
    sentiment: 'positive',
    intensity: 'medium',
    templates: [
      '爆率还可以，10连出货了',
      '这次数值设计挺合理的',
      '福利不错，白嫖党也能玩'
    ],
    triggers: ['good_gacha', 'fair_rate']
  },
  // 强度党 - 负面
  {
    segment: 'power',
    sentiment: 'negative',
    intensity: 'extreme',
    templates: [
      '这爆率是人能抽出来的？',
      '100抽无SSR，退钱！',
      '官方把玩家当韭菜割呢？',
      '非酋不配玩这游戏是吧？'
    ],
    triggers: ['bad_gacha', 'low_rate']
  },
  // 氪金党 - 正面
  {
    segment: 'whale',
    sentiment: 'positive',
    intensity: 'medium',
    templates: [
      '限定卡质量很高，氪了不亏',
      'VIP福利不错，值得支持',
      '官方对氪金玩家挺友好的'
    ],
    triggers: ['good_value', 'vip_benefit']
  },
  // 氪金党 - 负面
  {
    segment: 'whale',
    sentiment: 'negative',
    intensity: 'high',
    templates: [
      '氪了几千就这？官方太黑心了',
      '重氪玩家不如狗，以后白嫖了',
      '这定价合理吗？把玩家当ATM？',
      '退钱！再也不氪了！'
    ],
    triggers: ['bad_value', 'overpriced']
  },
  // 白嫖党 - 正面
  {
    segment: 'f2p',
    sentiment: 'positive',
    intensity: 'high',
    templates: [
      '福利太好了吧！良心官方',
      '白嫖也能玩得很开心',
      '活动奖励很丰富，点赞',
      '零氪玩家表示很满足'
    ],
    triggers: ['good_welfare', 'free_reward']
  },
  // 白嫖党 - 负面
  {
    segment: 'f2p',
    sentiment: 'negative',
    intensity: 'medium',
    templates: [
      '福利越来越少了',
      '活动太肝了，白嫖党玩不动',
      '不氪金就玩不下去吗？'
    ],
    triggers: ['bad_welfare', 'too_grindy']
  },
  // CP党 - 正面
  {
    segment: 'cp',
    sentiment: 'positive',
    intensity: 'extreme',
    templates: [
      '啊啊啊发糖了！我磕到了！',
      '这对CP锁死！钥匙我吞了！',
      '官方懂我！这波糖我吃了',
      '甜死我了！胰岛素呢？'
    ],
    triggers: ['cp_moment', 'sweet_scene']
  },
  // CP党 - 负面
  {
    segment: 'cp',
    sentiment: 'negative',
    intensity: 'extreme',
    templates: [
      '官方拆CP？我不同意！',
      '这对CP被官方毁了，气死我了',
      '还我CP！官方懂不懂啊？',
      'CP党震怒！这剧情我不能接受'
    ],
    triggers: ['cp_break', 'bad_cp_writing']
  },
  // 单推人 - 正面
  {
    segment: 'solo',
    sentiment: 'positive',
    intensity: 'extreme',
    templates: [
      '我推天下第一！',
      '官方对我推太好了，感动',
      '我推的戏份终于多了！',
      '为我推氪爆！'
    ],
    triggers: ['solo_good', 'solo_screen_time']
  },
  // 单推人 - 负面
  {
    segment: 'solo',
    sentiment: 'negative',
    intensity: 'extreme',
    templates: [
      '官方区别对待！我推被忽视了',
      '我推的戏份呢？官方偏心！',
      '欺负我推？我跟你拼了！',
      '再这样对我推我就退坑！'
    ],
    triggers: ['solo_bad', 'solo_ignored']
  }
];

// 初始化玩家社群
export function initPlayerCommunity(): PlayerCommunity {
  return {
    segments: PLAYER_SEGMENTS.map(seg => ({
      type: seg.type,
      count: Math.floor(1000 * seg.defaultRatio),
      satisfaction: 70,
      sentiment: 0.2
    })),
    totalPlayers: 1000,
    overallSatisfaction: 70,
    overallSentiment: 0.2,
    hotTopics: [],
    activeRate: 0.6,
    retentionRate: 0.8
  };
}

// 根据游戏状态生成评论
export function generateComment(
  segmentType: PlayerSegmentType,
  sentiment: 'positive' | 'negative' | 'neutral',
  intensity: 'low' | 'medium' | 'high' | 'extreme',
  triggers: string[]
): string {
  const templates = COMMENT_TEMPLATES.filter(
    t => t.segment === segmentType && 
         t.sentiment === sentiment &&
         (t.intensity === intensity || intensity === 'medium')
  );
  
  if (templates.length === 0) {
    // 如果没有匹配的模板，使用默认模板
    const defaults: Record<string, string> = {
      positive: '还不错，继续加油',
      negative: '有待改进',
      neutral: '观望中'
    };
    return defaults[sentiment] || '观望中';
  }
  
  // 随机选择一个模板组
  const templateGroup = templates[Math.floor(Math.random() * templates.length)];
  // 随机选择一条内容
  return templateGroup.templates[Math.floor(Math.random() * templateGroup.templates.length)];
}

// 计算玩家满意度
export function calculateSatisfaction(
  community: PlayerCommunity,
  factors: {
    plotQuality: number;
    visualQuality: number;
    gachaFairness: number;
    welfareLevel: number;
    characterBalance: number;
  }
): number {
  let totalWeightedSatisfaction = 0;
  let totalWeight = 0;
  
  community.segments.forEach(segment => {
    const segmentConfig = PLAYER_SEGMENTS.find(s => s.type === segment.type);
    if (!segmentConfig) return;
    
    const satisfaction = 
      factors.plotQuality * segmentConfig.sensitivity.plot +
      factors.visualQuality * segmentConfig.sensitivity.visual +
      factors.gachaFairness * segmentConfig.sensitivity.gacha +
      factors.welfareLevel * segmentConfig.sensitivity.welfare +
      factors.characterBalance * segmentConfig.sensitivity.character;
    
    totalWeightedSatisfaction += satisfaction * segment.count;
    totalWeight += segment.count;
  });
  
  return totalWeight > 0 ? Math.round(totalWeightedSatisfaction / totalWeight) : 50;
}

// 生成热点话题
export function generateHotTopic(
  type: HotTopic['type'],
  title: string,
  relatedSegments: PlayerSegmentType[]
): HotTopic {
  return {
    id: `topic_${Date.now()}`,
    title,
    type,
    heat: type === 'controversial' ? 80 : 60,
    participants: Math.floor(Math.random() * 500) + 100,
    relatedSegments,
    createdAt: new Date().toISOString(),
    isTrending: type === 'controversial' || Math.random() > 0.7
  };
}
