export { 
  VirtualPlayerPool 
} from './playerPool';

export { 
  SimulationEngine
} from './simulationEngine';

export {
  TagSystem,
  TagSystemImpl
} from './tagSystem';

export {
  GachaSimulator
} from './gachaSimulator';

export {
  CommentSimulator,
  CommentSimulatorInstance
} from './commentSimulator';

export {
  PlayerStateSimulator
} from './playerStateSimulator';

export type { 
  VirtualPlayer, 
  PlayerState, 
  SpendingLevel, 
  PlayStyle,
  PlayerPoolConfig 
} from './types';

export type {
  MacroResult,
  MicroSimulationResult,
  CriticalEventResult,
  SimulationResult,
  GlobalImpact,
  DaySummary,
  PlayerBehavior,
  SimulationEvent,
  SimulationConfig
} from './simulationEngine';

export type {
  PlayerTag,
  ContentTag,
  ActivityTag,
  EventTag,
  TagEffect,
  TagSystem as ITagSystem
} from './tagSystem';

export type {
  GachaResult,
  GachaItem,
  GachaPoolConfig,
  GachaStatistics
} from './gachaSimulator';

export type {
  StateTransition,
  PlayerDataStatistics
} from './playerStateSimulator';

export type {
  Platform,
  PlatformComment,
  PlatformStatistics
} from './commentSimulator';

export { 
  DEFAULT_POOL_CONFIG,
  GENRE_PREFERENCES,
  CHARACTER_PREFERENCES,
  PLOT_PREFERENCES,
  SPENDING_PROBABILITY_MAP,
  GACHA_MOTIVATION_MAP,
  ACTIVITY_LEVEL_MAP,
  LOYALTY_MAP
} from './types';

export {
  ActivitySimulator,
  ActivitySimulatorInstance
} from './activitySimulator';

export type {
  ActivityConfig,
  ActivityEffect,
  ActivityResult
} from './activitySimulator';

export {
  ConfessionSimulator,
  ConfessionSimulatorInstance
} from './confessionSimulator';

export {
  FanworkSimulator,
  FanworkSimulatorInstance
} from './fanworkSimulator';

export type {
  Confession,
  ConfessionResult
} from './confessionSimulator';

export type {
  Fanwork,
  FanworkResult
} from './fanworkSimulator';

export {
  EventSimulator,
  EventSimulatorInstance
} from './eventSimulator';

export type {
  OperationEvent,
  EventSolution,
  EventEffect,
  EventResult
} from './eventSimulator';

export {
  CompetitorSystem,
  CompetitorSystemInstance
} from './competitorSystem';

export {
  MarketTrendSystem,
  MarketTrendSystemInstance
} from './marketTrendSystem';

export {
  IndustryEventSystem,
  IndustryEventSystemInstance
} from './industryEventSystem';

export {
  WorldSimulator,
  WorldSimulatorInstance
} from './worldSimulator';

export type {
  Competitor,
  CompetitorEffect,
  CompetitorSystemState
} from './competitorSystem';

export type {
  GenreTrend,
  SeasonalHot,
  MarketTrendEffect
} from './marketTrendSystem';

export type {
  IndustryEvent,
  IndustryEventResult
} from './industryEventSystem';

export type {
  WorldImpact,
  WorldState
} from './worldSimulator';
