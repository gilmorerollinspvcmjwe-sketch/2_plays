/**
 * 危机事件链系统类型定义
 * 模拟真实乙游运营中的危机处理机制
 */

// 危机等级
export type CrisisLevel = 'minor' | 'moderate' | 'severe' | 'critical';

// 危机状态
export type CrisisStatus = 'warning' | 'fermenting' | 'outbreak' | 'handling' | 'resolved' | 'escalated';

// 危机类型
export type CrisisType = 
  | 'character_controversy'  // 角色争议
  | 'gacha_rate'            // 爆率节奏
  | 'plot_backlash'         // 剧情翻车
  | 'operation_accident'    // 运营事故
  | 'compensation_issue'    // 补偿问题
  | 'art_quality'           // 美术质量
  | 'character_balance';    // 角色待遇不均

// 危机处理选项
export type CrisisOption = 'ignore' | 'apologize' | 'adjust' | 'distract';

// 危机等级配置
export interface CrisisLevelConfig {
  level: CrisisLevel;
  name: string;
  color: string;
  icon: string;
  description: string;
  heatThreshold: number;  // 触发该等级的热度阈值
  impactMultiplier: number;  // 影响倍数
}

export const CRISIS_LEVELS: CrisisLevelConfig[] = [
  {
    level: 'minor',
    name: '轻微',
    color: '#faad14',
    icon: 'info-o',
    description: '个别玩家不满，影响有限',
    heatThreshold: 30,
    impactMultiplier: 0.5
  },
  {
    level: 'moderate',
    name: '中等',
    color: '#ff7a45',
    icon: 'warning-o',
    description: '部分玩家抱怨，需要关注',
    heatThreshold: 60,
    impactMultiplier: 1.0
  },
  {
    level: 'severe',
    name: '严重',
    color: '#ff4d4f',
    icon: 'fire-o',
    description: '大规模声讨，影响口碑',
    heatThreshold: 80,
    impactMultiplier: 1.5
  },
  {
    level: 'critical',
    name: '致命',
    color: '#820014',
    icon: 'close',
    description: '危机爆发，可能关服',
    heatThreshold: 95,
    impactMultiplier: 2.0
  }
];

// 危机事件
export interface Crisis {
  id: string;
  type: CrisisType;
  title: string;
  description: string;
  level: CrisisLevel;
  status: CrisisStatus;
  heat: number;           // 热度 0-100
  participants: number;   // 参与人数
  startTime: string;
  lastUpdateTime: string;
  relatedSegments: string[];  // 相关玩家类型
  affectedCharacters?: string[];  // 受影响角色
  options: CrisisOption[];
  history: CrisisHistoryEntry[];
  isResolved: boolean;
  resolution?: CrisisResolution;
}

// 危机历史记录
export interface CrisisHistoryEntry {
  timestamp: string;
  status: CrisisStatus;
  heat: number;
  description: string;
}

// 危机处理结果
export interface CrisisResolution {
  option: CrisisOption;
  timestamp: string;
  outcome: 'success' | 'partial' | 'failure';
  satisfactionChange: number;
  playerChange: number;
  reputationChange: number;
  feedback: string;
}

// 危机处理选项配置
export interface CrisisOptionConfig {
  type: CrisisOption;
  name: string;
  description: string;
  icon: string;
  cost: number;           // 成本
  risk: number;           // 风险 0-1
  effectiveness: number;  // 效果 0-1
  cooldown: number;       // 冷却时间（小时）
}

export const CRISIS_OPTIONS: CrisisOptionConfig[] = [
  {
    type: 'ignore',
    name: '装死',
    description: '不回应，等待自然平息',
    icon: 'clock-o',
    cost: 0,
    risk: 0.7,
    effectiveness: 0.2,
    cooldown: 0
  },
  {
    type: 'apologize',
    name: '道歉',
    description: '官方道歉+补偿',
    icon: 'smile-comment-o',
    cost: 10000,
    risk: 0.2,
    effectiveness: 0.8,
    cooldown: 24
  },
  {
    type: 'adjust',
    name: '调整',
    description: '直接修改争议内容',
    icon: 'edit',
    cost: 5000,
    risk: 0.4,
    effectiveness: 0.9,
    cooldown: 12
  },
  {
    type: 'distract',
    name: '转移',
    description: '发福利/新内容转移注意力',
    icon: 'gift-o',
    cost: 20000,
    risk: 0.3,
    effectiveness: 0.7,
    cooldown: 48
  }
];

// 危机模板
export interface CrisisTemplate {
  type: CrisisType;
  level: CrisisLevel;
  title: string;
  description: string;
  initialHeat: number;
  relatedSegments: string[];
  triggers: string[];
  escalationConditions: string[];
}

// 危机案例库
export const CRISIS_TEMPLATES: CrisisTemplate[] = [
  {
    type: 'gacha_rate',
    level: 'moderate',
    title: '爆率争议',
    description: '玩家质疑SSR爆率虚标，大量非酋玩家抱怨',
    initialHeat: 50,
    relatedSegments: ['power', 'whale', 'f2p'],
    triggers: ['low_gacha_rate', 'consecutive_failures'],
    escalationConditions: ['no_response_24h', 'increasing_complaints']
  },
  {
    type: 'character_controversy',
    level: 'minor',
    title: '角色剧情争议',
    description: '某角色的剧情设定引发部分玩家不满',
    initialHeat: 35,
    relatedSegments: ['story', 'solo', 'cp'],
    triggers: ['character_plot_issue', 'unpopular_development'],
    escalationConditions: ['polarizing_discussion', 'fan_conflict']
  },
  {
    type: 'plot_backlash',
    level: 'severe',
    title: '主线剧情翻车',
    description: '主线剧情逻辑崩坏，人设崩塌，玩家强烈不满',
    initialHeat: 75,
    relatedSegments: ['story', 'solo', 'cp'],
    triggers: ['bad_plot_twist', 'character_ruin', 'logic_error'],
    escalationConditions: ['massive_complaints', 'trending_topic']
  },
  {
    type: 'operation_accident',
    level: 'critical',
    title: '运营事故',
    description: '重大BUG或运营失误导致玩家利益受损',
    initialHeat: 90,
    relatedSegments: ['power', 'whale', 'f2p', 'story'],
    triggers: ['major_bug', 'data_loss', 'wrong_compensation'],
    escalationConditions: ['widespread_impact', 'media_attention']
  },
  {
    type: 'compensation_issue',
    level: 'moderate',
    title: '补偿问题',
    description: '补偿方案不合理，玩家认为官方没诚意',
    initialHeat: 55,
    relatedSegments: ['f2p', 'power', 'whale'],
    triggers: ['insufficient_compensation', 'unequal_treatment'],
    escalationConditions: ['comparison_with_other_games', 'escalating_demands']
  },
  {
    type: 'art_quality',
    level: 'minor',
    title: '美术质量下滑',
    description: '新卡面/立绘质量不如以往，玩家失望',
    initialHeat: 40,
    relatedSegments: ['visual'],
    triggers: ['quality_drop', 'style_change', 'artist_change'],
    escalationConditions: ['continuous_decline', 'comparison_with_past']
  },
  {
    type: 'character_balance',
    level: 'moderate',
    title: '角色待遇不均',
    description: '玩家认为某角色被官方区别对待',
    initialHeat: 60,
    relatedSegments: ['solo', 'cp'],
    triggers: ['unequal_screen_time', 'unfair_resources', 'bias_accusation'],
    escalationConditions: ['fan_war', 'organized_protest']
  }
];

// 危机管理器状态
export interface CrisisManagerState {
  activeCrises: Crisis[];
  resolvedCrises: Crisis[];
  totalCrisisCount: number;
  currentHeat: number;
  reputation: number;  // 声誉值 0-100
  crisisPrevention: number;  // 危机预防能力 0-100
}

// 初始化危机
export function initCrisis(template: CrisisTemplate): Crisis {
  const now = new Date().toISOString();
  return {
    id: `crisis_${Date.now()}`,
    type: template.type,
    title: template.title,
    description: template.description,
    level: template.level,
    status: 'warning',
    heat: template.initialHeat,
    participants: Math.floor(Math.random() * 500) + 100,
    startTime: now,
    lastUpdateTime: now,
    relatedSegments: template.relatedSegments,
    options: ['ignore', 'apologize', 'adjust', 'distract'],
    history: [{
      timestamp: now,
      status: 'warning',
      heat: template.initialHeat,
      description: '危机预警：出现少量负面评论'
    }],
    isResolved: false
  };
}

// 计算危机升级
export function calculateCrisisEscalation(crisis: Crisis, hoursElapsed: number): CrisisLevel {
  const escalationChance = hoursElapsed * 0.1;  // 每小时10%升级概率
  
  if (crisis.status === 'warning' && Math.random() < escalationChance) {
    return 'moderate';
  }
  if (crisis.status === 'fermenting' && Math.random() < escalationChance * 1.5) {
    return 'severe';
  }
  if (crisis.status === 'outbreak' && Math.random() < escalationChance * 2) {
    return 'critical';
  }
  
  return crisis.level;
}

// 处理危机
export function resolveCrisis(
  crisis: Crisis,
  option: CrisisOption,
  gameState: {
    satisfaction: number;
    playerCount: number;
    reputation: number;
  }
): CrisisResolution {
  const optionConfig = CRISIS_OPTIONS.find(o => o.type === option);
  if (!optionConfig) {
    return {
      option,
      timestamp: new Date().toISOString(),
      outcome: 'failure',
      satisfactionChange: -10,
      playerChange: -100,
      reputationChange: -5,
      feedback: '处理失败，危机升级！'
    };
  }
  
  // 计算成功率
  const successChance = optionConfig.effectiveness - (optionConfig.risk * Math.random());
  
  let outcome: 'success' | 'partial' | 'failure';
  let satisfactionChange: number;
  let playerChange: number;
  let reputationChange: number;
  let feedback: string;
  
  if (successChance > 0.7) {
    outcome = 'success';
    satisfactionChange = 15;
    playerChange = 50;
    reputationChange = 10;
    feedback = '处理得当，玩家好评如潮，口碑反转！';
  } else if (successChance > 0.4) {
    outcome = 'partial';
    satisfactionChange = 5;
    playerChange = 10;
    reputationChange = 2;
    feedback = '处理尚可，部分玩家接受，节奏逐渐平息。';
  } else {
    outcome = 'failure';
    satisfactionChange = -15;
    playerChange = -100;
    reputationChange = -10;
    feedback = '处理不当，玩家更加愤怒，危机升级！';
  }
  
  // 根据危机等级调整影响
  const levelConfig = CRISIS_LEVELS.find(l => l.level === crisis.level);
  const multiplier = levelConfig?.impactMultiplier || 1;
  
  return {
    option,
    timestamp: new Date().toISOString(),
    outcome,
    satisfactionChange: satisfactionChange * multiplier,
    playerChange: playerChange * multiplier,
    reputationChange: reputationChange * multiplier,
    feedback
  };
}

// 生成危机标题
export function generateCrisisTitle(type: CrisisType, characterName?: string): string {
  const titles: Record<CrisisType, string[]> = {
    character_controversy: [
      `${characterName || '某角色'}剧情引发争议`,
      '角色设定遭质疑',
      '人设崩塌危机'
    ],
    gacha_rate: [
      '爆率虚标质疑',
      '非酋集体抗议',
      '抽卡机制争议'
    ],
    plot_backlash: [
      '主线剧情翻车',
      '文案组被骂上热搜',
      '剧情逻辑崩坏'
    ],
    operation_accident: [
      '重大运营事故',
      'BUG导致玩家损失',
      '补偿方案引众怒'
    ],
    compensation_issue: [
      '补偿太抠被吐槽',
      '区别对待争议',
      '补偿方案不合理'
    ],
    art_quality: [
      '美术质量下滑',
      '立绘崩坏争议',
      '卡面质量不如以往'
    ],
    character_balance: [
      '角色待遇不均',
      `${characterName || '某角色'}被官方冷落`,
      '资源分配不公'
    ]
  };
  
  const typeTitles = titles[type] || ['运营危机'];
  return typeTitles[Math.floor(Math.random() * typeTitles.length)];
}

// 初始化危机管理器
export function initCrisisManager(): CrisisManagerState {
  return {
    activeCrises: [],
    resolvedCrises: [],
    totalCrisisCount: 0,
    currentHeat: 0,
    reputation: 80,
    crisisPrevention: 50
  };
}
