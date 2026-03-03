/**
 * 乙女游戏创作者模拟器 - 模板类型定义
 */

// ============ 角色模板 ============

export type CharacterCategory = 
  | 'president'    // 霸道总裁
  | 'senior'       // 温柔学长
  | 'youngmaster'  // 腹黑少爷
  | 'sunshine'     // 阳光少年
  | 'elite'        // 高冷精英
  | 'other';       // 其他经典人设

export type VoiceActorLevel = '新人' | '资深' | '顶流';

export interface CharacterTemplate {
  id: string;
  category: CharacterCategory;
  name: string;  // 模板名称
  tags: string[];  // 标签
  personality: string;  // 性格描述
  appearance: string;  // 外貌描述
  clothing: string;  // 服装描述
  background: string;  // 背景故事
  voiceActor: VoiceActorLevel;  // 声优定位
  popularity: number;  // 人气值 1-10
}

// ============ 剧情模板 ============

export type PlotRouteType = 'sweet' | 'angst' | 'suspense';
export type PlotDifficulty = '简单' | '中等' | '困难';

export interface PlotChapter {
  chapter: number;
  title: string;
  scene: string;  // 场景描述
  keyEvent: string;  // 关键事件
  choices: string[];  // 分支选项
}

export interface PlotTemplate {
  id: string;
  routeType: PlotRouteType;
  title: string;
  summary: string;
  chapters: PlotChapter[];
  difficulty: PlotDifficulty;
}

// ============ 评论模板 ============

export type CommentType = 'roast' | 'recommend' | 'drama' | 'meme';
export type CommentSentiment = 'positive' | 'negative' | 'neutral';
export type CommentIntensity = 1 | 2 | 3;  // 情绪强度
export type PlayerType = 
  | '氪金大佬' 
  | '剧情党' 
  | '外观党' 
  | '休闲玩家';

export interface CommentTemplate {
  id: string;
  type: CommentType;
  content: string;
  sentiment: CommentSentiment;
  intensity: CommentIntensity;
  playerType: PlayerType;
  tags: string[];
}

// ============ 活动模板 ============

export type EventType = 'festival' | 'birthday' | 'collaboration';
export type BudgetLevel = '低' | '中' | '高';

export interface EventTemplate {
  id: string;
  type: EventType;
  name: string;
  description: string;
  duration: number;  // 活动持续天数
  rewards: string[];  // 活动奖励
  mechanics: string[];  // 玩法规则
  budget: BudgetLevel;  // 预算等级
}

// ============ 事件模板 ============

export type IncidentType = 
  | 'dropRate'     // 爆率争议
  | 'plotIssue'    // 剧情雷点
  | 'welfare'      // 福利节奏
  | 'other';       // 其他事件

export type IncidentSeverity = '低' | '中' | '高';

export interface IncidentSolution {
  action: string;
  cost: BudgetLevel;
  effect: string;
}

export interface IncidentTemplate {
  id: string;
  type: IncidentType;
  name: string;
  description: string;
  severity: IncidentSeverity;  // 严重程度
  triggerCondition: string;  // 触发条件
  playerReactions: string[];  // 玩家反应
  solutions: IncidentSolution[];  // 解决方案
}

// ============ 模板统计 ============

export interface TemplateStats {
  characters: number;
  plots: number;
  comments: number;
  events: number;
  incidents: number;
  total: number;
}
