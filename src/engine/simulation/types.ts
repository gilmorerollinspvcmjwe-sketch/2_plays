export type PlayerState = 'NEW' | 'ACTIVE' | 'PAYING' | 'AT_RISK' | 'LOST' | 'RETURNED';

export type SpendingLevel = '零氪' | '微氪' | '中氪' | '重氪' | '神豪';

export type PlayStyle = '剧情党' | '强度党' | 'XP党' | '咸鱼党' | '社交党';

export interface VirtualPlayer {
  id: string;
  age: number;
  gender: '男' | '女' | '其他';
  occupation: string;
  genrePreference: string[];
  characterPreference: string[];
  plotPreference: string[];
  spendingLevel: SpendingLevel;
  spendingProbability: number;
  gachaMotivation: number;
  playStyle: PlayStyle;
  activityLevel: number;
  loyalty: number;
  state: PlayerState;
  satisfaction: number;
  fatigue: number;
  daysSinceLastLogin: number;
  lastGachaTime: number;
  guaranteePity: number;
}

export interface PlayerPoolConfig {
  totalPlayers: number;
  ageDistribution: { min: number; max: number; weight: number }[];
  genderDistribution: { value: '男' | '女' | '其他'; weight: number }[];
  occupationDistribution: { value: string; weight: number }[];
  spendingDistribution: { value: SpendingLevel; weight: number }[];
}

export const DEFAULT_POOL_CONFIG: PlayerPoolConfig = {
  totalPlayers: 10000,
  ageDistribution: [
    { min: 18, max: 25, weight: 0.4 },
    { min: 26, max: 35, weight: 0.45 },
    { min: 36, max: 45, weight: 0.15 },
  ],
  genderDistribution: [
    { value: '女', weight: 0.8 },
    { value: '男', weight: 0.18 },
    { value: '其他', weight: 0.02 },
  ],
  occupationDistribution: [
    { value: '学生', weight: 0.25 },
    { value: '上班族', weight: 0.5 },
    { value: '自由职业', weight: 0.15 },
    { value: '无业', weight: 0.1 },
  ],
  spendingDistribution: [
    { value: '零氪', weight: 0.5 },
    { value: '微氪', weight: 0.3 },
    { value: '中氪', weight: 0.15 },
    { value: '重氪', weight: 0.04 },
    { value: '神豪', weight: 0.01 },
  ],
};

export const GENRE_PREFERENCES = [
  '恋爱冒险', '视觉小说', 'RPG', '策略', '休闲', '音游', '乙女', 'GL', 'BL', '悬疑', '科幻', '奇幻', '现实主义'
];

export const CHARACTER_PREFERENCES = [
  '温柔型', '傲娇型', '高冷型', '活泼型', '腹黑型', '元气型', '病娇型', '年下型', '年上型', '忠犬型', '酷酷型', '可爱型'
];

export const PLOT_PREFERENCES = [
  '甜蜜日常', '虐心情节', '悬疑推理', '冒险战斗', '轻松搞笑', '治愈温馨', '黑深残', '热血励志', '成长蜕变', '命运纠葛'
];

export const SPENDING_PROBABILITY_MAP: Record<SpendingLevel, { min: number; max: number }> = {
  '零氪': { min: 0, max: 0.05 },
  '微氪': { min: 0.05, max: 0.2 },
  '中氪': { min: 0.2, max: 0.5 },
  '重氪': { min: 0.5, max: 0.8 },
  '神豪': { min: 0.8, max: 1.0 },
};

export const GACHA_MOTIVATION_MAP: Record<PlayStyle, { min: number; max: number }> = {
  '剧情党': { min: 0.1, max: 0.3 },
  '强度党': { min: 0.6, max: 0.9 },
  'XP党': { min: 0.7, max: 1.0 },
  '咸鱼党': { min: 0.0, max: 0.2 },
  '社交党': { min: 0.2, max: 0.4 },
};

export const ACTIVITY_LEVEL_MAP: Record<PlayStyle, { min: number; max: number }> = {
  '剧情党': { min: 0.4, max: 0.7 },
  '强度党': { min: 0.7, max: 1.0 },
  'XP党': { min: 0.5, max: 0.8 },
  '咸鱼党': { min: 0.1, max: 0.3 },
  '社交党': { min: 0.6, max: 0.9 },
};

export const LOYALTY_MAP: Record<SpendingLevel, { min: number; max: number }> = {
  '零氪': { min: 0.3, max: 0.6 },
  '微氪': { min: 0.5, max: 0.75 },
  '中氪': { min: 0.6, max: 0.85 },
  '重氪': { min: 0.7, max: 0.9 },
  '神豪': { min: 0.8, max: 0.95 },
};
