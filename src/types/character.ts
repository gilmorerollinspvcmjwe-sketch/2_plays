/**
 * 角色扩展类型定义
 * 包含深度设定、AI人格、关系网络等
 */

// 隐藏性格属性
export interface HiddenAttributes {
  tsundere: number;      // 傲娇值 0-100
  gentle: number;        // 温柔值 0-100
  scheming: number;      // 腹黑值 0-100
  innocent: number;      // 纯真值 0-100
  mature: number;        // 成熟值 0-100
  playful: number;       // 调皮值 0-100
  possessive: number;    // 占有欲 0-100
  protective: number;    // 保护欲 0-100
}

// 成长弧线类型
export type GrowthArcType = 
  | 'weak_to_strong'      // 从弱小到强大
  | 'cold_to_warm'        // 从冷漠到温柔
  | 'rebel_to_mature'     // 从叛逆到成熟
  | 'closed_to_open'      // 从封闭到开放
  | 'arrogant_to_humble'  // 从傲慢到谦逊
  | 'fearful_to_brave';   // 从胆怯到勇敢

// 成长弧线配置
export interface GrowthArc {
  type: GrowthArcType;
  name: string;
  description: string;
  stages: GrowthStage[];
}

// 成长阶段
export interface GrowthStage {
  order: number;
  name: string;
  description: string;
  triggerCondition: string;
  characterChanges: string[];
}

// 角色关系
export interface CharacterRelationship {
  targetCharacterId: string;
  targetCharacterName: string;
  type: RelationshipType;
  strength: number;      // 关系强度 0-100
  description: string;
  isHidden: boolean;     // 是否为隐藏关系
}

// 关系类型
export type RelationshipType =
  | 'friend'        // 朋友
  | 'enemy'         // 敌人
  | 'romantic'      // 暧昧/恋爱
  | 'family'        // 家人
  | 'rival'         // 竞争对手
  | 'mentor'        // 师徒
  | 'complex';      // 复杂关系

// 角色秘密
export interface CharacterSecret {
  id: string;
  type: SecretType;
  content: string;
  revealTrigger: string;     // 揭示时机
  revealChapter?: number;    // 揭示章节
  impact: string;            // 揭示后的影响
  isRevealed: boolean;
}

// 秘密类型
export type SecretType =
  | 'past'          // 过去经历
  | 'identity'      // 身份秘密
  | 'feelings'      // 隐藏感情
  | 'ability'       // 隐藏能力
  | 'mission'       // 秘密任务
  | 'weakness';     // 弱点/缺陷

// AI人格特征
export interface AIPersonality {
  traits: string[];          // 人格特质标签
  speechStyle: string;       // 说话风格
  behaviorPatterns: string[]; // 行为模式
  emotionalTriggers: string[]; // 情感触发点
  decisionFactors: string[];  // 决策影响因素
}

// 角色深度设定
export interface CharacterDepth {
  hiddenAttributes: HiddenAttributes;
  growthArc?: GrowthArc;
  relationships: CharacterRelationship[];
  secrets: CharacterSecret[];
  aiPersonality?: AIPersonality;
}

// 角色口碑
export interface CharacterReputation {
  averageRating: number;      // 平均评分 1-5
  totalComments: number;      // 总评论数
  positiveRate: number;       // 好评率 0-100
}

// 互动数据
export interface CharacterInteraction {
  mentionCount: number;       // 被提及次数
  cpHeat: Map<string, number>; // CP 热度 Map<其他角色 ID, 热度值>
}

// 角色模板
export interface CharacterTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  appearance: string;
  personality: string[];
  background: string;
  hiddenAttributes: Partial<HiddenAttributes>;
  suggestedGrowthArc: GrowthArcType;
  relationshipHints: string[];
  secretHints: string[];
  aiPersonalityHints: string[];
}

// 初始化隐藏属性
export function initHiddenAttributes(): HiddenAttributes {
  return {
    tsundere: 50,
    gentle: 50,
    scheming: 50,
    innocent: 50,
    mature: 50,
    playful: 50,
    possessive: 50,
    protective: 50
  };
}

// 成长弧线配置
export const GROWTH_ARCS: GrowthArc[] = [
  {
    type: 'weak_to_strong',
    name: '从弱小到强大',
    description: '角色从脆弱无助成长为独当一面的强者',
    stages: [
      { order: 1, name: '脆弱期', description: '角色表现出明显的弱点和不安', triggerCondition: '剧情初期', characterChanges: ['依赖性强', '容易受伤'] },
      { order: 2, name: '觉醒期', description: '角色意识到需要改变', triggerCondition: '遭遇重大挫折', characterChanges: ['开始努力', '寻求突破'] },
      { order: 3, name: '成长期', description: '角色逐渐变得坚强', triggerCondition: '克服困难', characterChanges: ['能力提升', '心态转变'] },
      { order: 4, name: '蜕变期', description: '角色完成最终蜕变', triggerCondition: '最终决战', characterChanges: ['独当一面', '保护他人'] }
    ]
  },
  {
    type: 'cold_to_warm',
    name: '从冷漠到温柔',
    description: '角色从冰冷疏离变得温暖亲切',
    stages: [
      { order: 1, name: '冰封期', description: '角色表现出冷漠疏离', triggerCondition: '剧情初期', characterChanges: ['拒人千里', '情感封闭'] },
      { order: 2, name: '融化期', description: '角色开始被温暖', triggerCondition: '遇到重要的人', characterChanges: ['开始动摇', '偶尔微笑'] },
      { order: 3, name: '温暖期', description: '角色逐渐敞开心扉', triggerCondition: '建立信任', characterChanges: ['主动关心', '表达情感'] },
      { order: 4, name: '绽放期', description: '角色完全展现温柔', triggerCondition: '情感爆发', characterChanges: ['温柔体贴', '深情告白'] }
    ]
  },
  {
    type: 'rebel_to_mature',
    name: '从叛逆到成熟',
    description: '角色从叛逆不羁成长为成熟稳重',
    stages: [
      { order: 1, name: '叛逆期', description: '角色表现出叛逆和冲动', triggerCondition: '剧情初期', characterChanges: ['我行我素', '不服管教'] },
      { order: 2, name: '迷茫期', description: '角色开始质疑自己', triggerCondition: '遭遇失败', characterChanges: ['自我怀疑', '寻求答案'] },
      { order: 3, name: '成长期', description: '角色学会承担责任', triggerCondition: '承担重任', characterChanges: ['开始负责', '考虑他人'] },
      { order: 4, name: '成熟期', description: '角色成为可靠的大人', triggerCondition: '完成使命', characterChanges: ['成熟稳重', '值得信赖'] }
    ]
  },
  {
    type: 'closed_to_open',
    name: '从封闭到开放',
    description: '角色从自我封闭变得敞开心扉',
    stages: [
      { order: 1, name: '封闭期', description: '角色把自己封闭起来', triggerCondition: '剧情初期', characterChanges: ['沉默寡言', '回避社交'] },
      { order: 2, name: '试探期', description: '角色尝试走出舒适区', triggerCondition: '被主动接近', characterChanges: ['小心翼翼', '偶尔回应'] },
      { order: 3, name: '开放期', description: '角色开始接纳他人', triggerCondition: '建立友谊', characterChanges: ['主动交流', '分享秘密'] },
      { order: 4, name: '绽放期', description: '角色完全打开心扉', triggerCondition: '完全信任', characterChanges: ['开朗活泼', '拥抱世界'] }
    ]
  },
  {
    type: 'arrogant_to_humble',
    name: '从傲慢到谦逊',
    description: '角色从傲慢自负变得谦逊有礼',
    stages: [
      { order: 1, name: '傲慢期', description: '角色表现出傲慢和自负', triggerCondition: '剧情初期', characterChanges: ['目中无人', '轻视他人'] },
      { order: 2, name: '挫折期', description: '角色遭遇重大打击', triggerCondition: '被人超越', characterChanges: ['自尊心受挫', '开始反思'] },
      { order: 3, name: '学习期', description: '角色学会尊重他人', triggerCondition: '向他人学习', characterChanges: ['虚心请教', '认可他人'] },
      { order: 4, name: '谦逊期', description: '角色变得谦逊成熟', triggerCondition: '获得成长', characterChanges: ['谦逊有礼', '尊重每个人'] }
    ]
  },
  {
    type: 'fearful_to_brave',
    name: '从胆怯到勇敢',
    description: '角色从胆小怕事变得勇敢无畏',
    stages: [
      { order: 1, name: '胆怯期', description: '角色表现出恐惧和逃避', triggerCondition: '剧情初期', characterChanges: ['畏首畏尾', '逃避困难'] },
      { order: 2, name: '挣扎期', description: '角色在恐惧中挣扎', triggerCondition: '不得不面对', characterChanges: ['内心挣扎', '勉强前行'] },
      { order: 3, name: '突破期', description: '角色开始战胜恐惧', triggerCondition: '小胜利', characterChanges: ['建立信心', '敢于尝试'] },
      { order: 4, name: '勇敢期', description: '角色成为真正的勇者', triggerCondition: '保护重要的人', characterChanges: ['无所畏惧', '挺身而出'] }
    ]
  }
];

// 关系类型配置
export const RELATIONSHIP_TYPES: { type: RelationshipType; name: string; icon: string; color: string }[] = [
  { type: 'friend', name: '朋友', icon: 'friends-o', color: '#52c41a' },
  { type: 'enemy', name: '敌人', icon: 'cross', color: '#ff4d4f' },
  { type: 'romantic', name: '暧昧', icon: 'like-o', color: '#FF69B4' },
  { type: 'family', name: '家人', icon: 'home-o', color: '#faad14' },
  { type: 'rival', name: '对手', icon: 'fire-o', color: '#ff7a45' },
  { type: 'mentor', name: '师徒', icon: 'user-o', color: '#1890ff' },
  { type: 'complex', name: '复杂', icon: 'question-o', color: '#722ed1' }
];

// 秘密类型配置
export const SECRET_TYPES: { type: SecretType; name: string; description: string }[] = [
  { type: 'past', name: '过去经历', description: '角色不愿提及的过往' },
  { type: 'identity', name: '身份秘密', description: '隐藏的真实身份' },
  { type: 'feelings', name: '隐藏感情', description: '不敢表露的心意' },
  { type: 'ability', name: '隐藏能力', description: '不为人知的特殊能力' },
  { type: 'mission', name: '秘密任务', description: '不能告诉别人的使命' },
  { type: 'weakness', name: '弱点缺陷', description: '角色的致命弱点' }
];

// 初始化角色深度设定
export function initCharacterDepth(): CharacterDepth {
  return {
    hiddenAttributes: initHiddenAttributes(),
    relationships: [],
    secrets: []
  };
}

// 获取成长弧线配置
export function getGrowthArc(type: GrowthArcType): GrowthArc | undefined {
  return GROWTH_ARCS.find(arc => arc.type === type);
}

// 获取关系类型名称
export function getRelationshipTypeName(type: RelationshipType): string {
  const config = RELATIONSHIP_TYPES.find(t => t.type === type);
  return config?.name || type;
}

// 获取关系类型颜色
export function getRelationshipTypeColor(type: RelationshipType): string {
  const config = RELATIONSHIP_TYPES.find(t => t.type === type);
  return config?.color || '#999';
}

// 获取秘密类型名称
export function getSecretTypeName(type: SecretType): string {
  const config = SECRET_TYPES.find(t => t.type === type);
  return config?.name || type;
}
