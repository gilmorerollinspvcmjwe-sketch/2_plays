// 竞品AI类型定义

// 竞品AI个性类型
export type AIPersonality = 
  | 'innovator'    // 开拓者：追求创新，愿意冒险
  | 'steady'       // 稳健派：注重长期口碑
  | 'monetizer'    // 氪金王：商业化激进
  | 'disruptor'    // 搅局者：喜欢制造事件
  | 'craftsman'    // 匠人：慢工出细活
  | 'learner';     // 学习者：观察并模仿成功者

// 竞品AI决策权重配置
export interface AIDecisionWeights {
  revenue: number;        // 收入权重 (0-1)
  reputation: number;     // 口碑权重 (0-1)
  marketShare: number;    // 市场份额权重 (0-1)
  innovation: number;     // 创新权重 (0-1)
  playerSatisfaction: number; // 玩家满意度权重 (0-1)
}

// AI策略类型
export type AIStrategyType = 
  | 'aggressive_growth'    // 激进增长
  | 'quality_focus'        // 品质优先
  | 'monetization_push'    // 变现冲刺
  | 'player_retention'     // 留存优先
  | 'market_defense'       // 市场防御
  | 'event_hijack'         // 事件劫持
  | 'new_game_launch'      // 新游上线
  | 'cost_cutting'         // 缩减开支
  | 'copycat';             // 模仿策略

// AI行动类型
export type AIActionType = 
  | 'launch_gacha'         // 开卡池
  | 'start_event'          // 开活动
  | 'release_update'       // 发版本更新
  | 'new_character'        // 推出新角色
  | 'welfare_distribution' // 发福利
  | 'price_war'            // 价格战
  | 'marketing_campaign'   // 营销推广
  | 'collaboration'        // 联动合作
  | 'scandal_response'     // 丑闻应对
  | 'launch_new_game';     // 上线新游戏

// 游戏状态
export type GameState = 
  | 'pre_launch'    // 预上线
  | 'launched'      // 刚上线（30天内）
  | 'operating'     // 稳定运营
  | 'peak'          // 巅峰期
  | 'declining'     // 下滑期
  | 'revival'       // 回春期
  | 'sunset';       // 日落期

// AI策略
export interface AIStrategy {
  type: AIStrategyType;
  startDay: number;
  targetMetric: string;
  actions: AIAction[];
}

// AI策略记录
export interface AIStrategyRecord {
  type: AIStrategyType;
  startDay: number;
  endDay?: number;
  result: 'success' | 'failed' | 'ongoing';
}

// AI行动
export interface AIAction {
  id: string;
  type: AIActionType;
  day: number;
  params: Record<string, any>;
  result?: AIActionResult;
}

// AI行动结果
export interface AIActionResult {
  success: boolean;
  revenueImpact: number;
  dauImpact: number;
  reputationImpact: number;
  playerReaction: string;
}

// 竞品角色
export interface CompetitorCharacter {
  id: string;
  gameId: string;
  name: string;
  popularity: number;      // 人气 0-100
  archetype: string;       // 角色类型
  releaseDate: number;
}

// 竞品游戏
export interface CompetitorGame {
  id: string;
  companyId: string;
  name: string;
  genre: string;
  subGenre: string;
  
  // 核心指标
  rating: number;           // 评分 1-10
  dau: number;              // 日活
  mau: number;              // 月活
  revenue: number;          // 月收入
  totalRevenue: number;     // 累计收入
  marketShare: number;      // 市场份额 0-1
  
  // 游戏状态
  state: GameState;
  version: string;
  daysSinceLastUpdate: number;
  
  // 运营数据
  gachaPoolCount: number;
  eventActive: boolean;
  lastGachaDate: number;
  lastEventDate: number;
  
  // 角色数据
  characters: CompetitorCharacter[];
  
  // 趋势
  trend: 'rising' | 'stable' | 'declining' | 'crashing';
  trendStrength: number;
}

// 竞品AI公司
export interface CompetitorAI {
  id: string;
  name: string;
  ceo: string;
  personality: AIPersonality;
  avatar: string;
  
  // 决策系统
  decisionWeights: AIDecisionWeights;
  riskTolerance: number;
  adaptability: number;
  
  // 旗下游戏
  games: CompetitorGame[];
  
  // 公司状态
  treasury: number;
  reputation: number;
  totalRevenue: number;
  foundedDay: number;
  
  // AI状态机
  currentStrategy: AIStrategy;
  strategyHistory: AIStrategyRecord[];
  
  // 与玩家的关系
  relationToPlayer: 'neutral' | 'friendly' | 'hostile' | 'fearful';
  playerAwareness: number;
}

// 竞品动态消息类型
export type CompetitorNewsType =
  | 'new_game'
  | 'major_update'
  | 'gacha_event'
  | 'scandal'
  | 'collaboration'
  | 'price_war'
  | 'award'
  | 'financial'
  | 'player_migration'
  | 'market_shift';

// 新闻对玩家的影响
export interface NewsImpact {
  playerDAU: number;
  playerNewUsers: number;
  marketSentiment: number;
  description: string;
}

// 玩家应对选项
export interface PlayerResponseOption {
  id: string;
  action: string;
  cost: number;
  successRate: number;
  reward: string;
  risk: string;
}

// 竞品动态消息
export interface CompetitorNews {
  id: string;
  companyId: string;
  companyName: string;
  companyAvatar: string;
  type: CompetitorNewsType;
  title: string;
  content: string;
  day: number;
  impact: NewsImpact;
  isRead: boolean;
  playerOptions?: PlayerResponseOption[];
}

// 环境感知
export interface Perception {
  hotGenres: string[];
  seasonBonus: number;
  playerThreatLevel: number;
  competitorPositions: { id: string; revenue: number; recentAction?: string }[];
  marketSaturation: number;
  financialHealth: number;
  gamesHealth: { gameId: string; health: number; urgency: number }[];
  opportunities: string[];
}

// 评分后的行动
export interface ScoredAction {
  action: AIAction;
  score: number;
  reason: string;
}
