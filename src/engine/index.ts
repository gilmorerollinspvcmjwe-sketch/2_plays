/**
 * 计算引擎统一导出
 * 乙游模拟器 - 核心玩法计算系统
 */

// 配置
export * from '@/config/gameBalance';

// 联动引擎
export {
  LinkageEngine,
  linkageEngine,
  type OperationModule,
  type FeedbackDelay,
  type LinkageEffect,
  type LinkageContext,
  type LinkageRule,
  type ChainReactionResult,
  type ChainEffect,
  type DelayedEffect,
  type ProcessedEffect
} from './linkageEngine';

// 角色价值引擎
export {
  CharacterValueEngine,
  characterValueEngine,
  type CharacterValueResult,
  type PopularityMetrics,
  type CPHeat
} from './characterValueEngine';

// 剧情分析引擎
export {
  PlotAnalysisEngine,
  plotAnalysisEngine,
  type PlotAnalysisResult,
  type PlotCompletionAnalysis,
  type EmotionalCurveAnalysis,
  type BranchAnalysis,
  type DropOffPoint,
  type PlayerBehaviorData
} from './plotAnalysisEngine';

// 数据反馈闭环引擎
export {
  FeedbackLoopEngine,
  feedbackLoopEngine,
  type DataCollection,
  type ContentConsumptionData,
  type SocialFeedbackData,
  type MarketData,
  type ProblemDiagnosis,
  type ImprovementSuggestion,
  type ExecutionTracking,
  type AnalysisReport
} from './feedbackLoopEngine';

// 统一计算引擎
export {
  CalculationEngine,
  calculationEngine,
  type ProjectEvaluation,
  type CharacterValue,
  type PlotAnalysis,
  type OperationImpact,
  type EmployeeEfficiency
} from './calculationEngine';

// 赛季系统引擎
export {
  SeasonEngine,
  seasonEngine,
  type GenreType,
  type Season,
  type GenreHeat,
  type IndustryEvent,
  type MarketTrend
} from './seasonEngine';

// 竞争环境引擎
export {
  CompetitorEngine,
  competitorEngine,
  type CompetitorGame,
  type CompetitorEvent,
  type CollaborationOpportunity,
  type MarketRanking
} from './competitorEngine';

// 角色每日更新引擎
export {
  IntimacyDecayCalculator,
  PopularityUpdater,
  BirthdayDetector,
  MentionAnalyzer,
  CPHeatCalculator,
  ReputationCalculator,
  updateCharacterDaily,
  intimacyDecayCalculator,
  popularityUpdater,
  birthdayDetector,
  mentionAnalyzer,
  cpHeatCalculator,
  reputationCalculator,
  type PopularityChange,
  type BirthdayEvent,
  type MentionStats,
  type CPHeatData,
  type ReputationScore,
  type Comment
} from './characterDailyEngine';

// 季节和节假日系统
export {
  SeasonEventEngine,
  seasonEventEngine,
  type SeasonEvent,
  type SeasonState,
} from './seasonEventEngine';

export {
  SeasonType,
  SeasonBuff,
  HolidayBuff,
  HolidayType,
  DateBuffStatus,
  getSeasonByMonth,
  getCurrentSeason,
  getSeasonBuff,
  isWeekend,
  getWeekendBuff,
  isWinterVacation,
  isSummerVacation,
  getVacationBuff,
  getFixedHolidays,
  getSpringFestivalBuff,
  checkHolidays,
  checkAnniversary,
  getDateBuffStatus,
  getBuffDescription,
  formatMultiplier,
} from '@/utils/seasonUtils';
