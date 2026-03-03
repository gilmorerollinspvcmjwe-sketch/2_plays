/**
 * 动态市场系统类型定义
 */

export type MarketTrendType = 'sweet' | 'dramatic' | 'mystery' | 'fantasy' | 'modern' | 'historical';
export type MarketEventType = 'competitor' | 'trend' | 'festival' | 'social' | 'policy';
export type CompetitorAction = 'release' | 'event' | 'update' | 'promotion';

export interface MarketTrend {
  type: MarketTrendType;
  name: string;
  strength: number; // 0-100
  growth: number; // -10 to 10
  cycle: number; // days
  peakTime: string;
}

export interface Competitor {
  id: string;
  name: string;
  type: string;
  strength: number; // 0-100
  releaseDate: string;
  targetAudience: string[];
  recentAction?: CompetitorAction;
  threatLevel: 'low' | 'medium' | 'high';
}

export interface Festival {
  id: string;
  name: string;
  date: string;
  type: 'romance' | 'celebration' | 'holiday';
  demandBoost: number; // percentage
  preferredThemes: MarketTrendType[];
}

export interface MarketEvent {
  id: string;
  type: MarketEventType;
  title: string;
  description: string;
  impact: {
    type: MarketTrendType;
    value: number; // -20 to 20
  };
  duration: number; // hours
  startTime: string;
}

export interface MarketEnvironment {
  currentTrend: MarketTrend;
  trends: MarketTrend[];
  competitors: Competitor[];
  upcomingFestivals: Festival[];
  activeEvents: MarketEvent[];
  overallHeat: number; // 0-100
  playerSentiment: number; // -1 to 1
}

export interface MarketPrediction {
  recommendedTime: string;
  confidence: number; // 0-100
  expectedTrend: MarketTrendType;
  opportunityScore: number; // 0-100
  risks: string[];
  suggestions: string[];
}

export interface RevenueForecast {
  daily: number[];
  weekly: number;
  monthly: number;
  confidence: number;
  factors: string[];
}

export const MARKET_TRENDS: MarketTrend[] = [
  { type: 'sweet', name: '甜宠', strength: 75, growth: 5, cycle: 30, peakTime: 'valentine' },
  { type: 'dramatic', name: '虐恋', strength: 60, growth: -2, cycle: 45, peakTime: 'winter' },
  { type: 'mystery', name: '悬疑', strength: 50, growth: 8, cycle: 60, peakTime: 'halloween' },
  { type: 'fantasy', name: '奇幻', strength: 70, growth: 3, cycle: 90, peakTime: 'summer' },
  { type: 'modern', name: '现代', strength: 80, growth: 2, cycle: 20, peakTime: 'always' },
  { type: 'historical', name: '古风', strength: 65, growth: 4, cycle: 40, peakTime: 'traditional' }
];

export const FESTIVALS: Festival[] = [
  { id: 'valentine', name: '情人节', date: '02-14', type: 'romance', demandBoost: 50, preferredThemes: ['sweet', 'modern'] },
  { id: 'qixi', name: '七夕', date: '08-14', type: 'romance', demandBoost: 60, preferredThemes: ['historical', 'fantasy'] },
  { id: 'christmas', name: '圣诞节', date: '12-25', type: 'celebration', demandBoost: 40, preferredThemes: ['sweet', 'modern'] },
  { id: 'newyear', name: '元旦', date: '01-01', type: 'celebration', demandBoost: 30, preferredThemes: ['modern'] },
  { id: 'halloween', name: '万圣节', date: '10-31', type: 'holiday', demandBoost: 25, preferredThemes: ['mystery', 'fantasy'] }
];

export function initMarketEnvironment(): MarketEnvironment {
  return {
    currentTrend: MARKET_TRENDS[4], // modern
    trends: [...MARKET_TRENDS],
    competitors: [],
    upcomingFestivals: [],
    activeEvents: [],
    overallHeat: 50,
    playerSentiment: 0
  };
}

export function predictMarketOpportunity(
  env: MarketEnvironment,
  gameTheme: MarketTrendType
): MarketPrediction {
  const trend = env.trends.find(t => t.type === gameTheme);
  const confidence = trend ? trend.strength : 50;
  
  // Find upcoming festival
  const now = new Date();
  const upcomingFestival = FESTIVALS.find(f => {
    const [month, day] = f.date.split('-').map(Number);
    const festivalDate = new Date(now.getFullYear(), month - 1, day);
    const diffDays = (festivalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays < 30;
  });
  
  let opportunityScore = confidence;
  let recommendedTime = 'now';
  
  if (upcomingFestival && upcomingFestival.preferredThemes.includes(gameTheme)) {
    opportunityScore += 20;
    recommendedTime = upcomingFestival.date;
  }
  
  return {
    recommendedTime,
    confidence: Math.min(100, confidence),
    expectedTrend: gameTheme,
    opportunityScore: Math.min(100, opportunityScore),
    risks: env.competitors.filter(c => c.threatLevel === 'high').map(c => `${c.name}的竞争压力`),
    suggestions: [
      upcomingFestival ? `临近${upcomingFestival.name}，建议提前准备` : '市场平稳，可以正常发布',
      trend && trend.growth > 0 ? `${trend.name}题材正在升温` : '考虑调整题材方向'
    ]
  };
}

export function forecastRevenue(
  env: MarketEnvironment,
  gameQuality: number,
  marketing: number
): RevenueForecast {
  const baseRevenue = 1000;
  const trendMultiplier = env.currentTrend.strength / 100;
  const qualityMultiplier = gameQuality / 10;
  const marketingMultiplier = 1 + (marketing / 100);
  
  const daily = Array(30).fill(0).map((_, i) => {
    const decay = Math.pow(0.95, i);
    return Math.round(baseRevenue * trendMultiplier * qualityMultiplier * marketingMultiplier * decay);
  });
  
  const weekly = daily.slice(0, 7).reduce((a, b) => a + b, 0);
  const monthly = daily.reduce((a, b) => a + b, 0);
  
  return {
    daily,
    weekly,
    monthly,
    confidence: 70,
    factors: [
      `市场热度: ${env.overallHeat}%`,
      `当前趋势: ${env.currentTrend.name}`,
      `游戏质量: ${gameQuality}/10`,
      `营销力度: ${marketing}%`
    ]
  };
}
