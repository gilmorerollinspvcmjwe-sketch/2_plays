import { CompetitorSystem, type Competitor, type CompetitorEffect } from './competitorSystem';
import { MarketTrendSystem, type GenreTrend, type SeasonalHot, type MarketTrendEffect } from './marketTrendSystem';
import { IndustryEventSystem, type IndustryEvent, type IndustryEventResult } from './industryEventSystem';

export interface WorldImpact {
  company: {
    cashChange: number;
    reputationChange: number;
  };
  project: {
    dauChange: number;
    ratingChange: number;
    newUsersChange: number;
    activityChange: number;
  };
  characters: Map<string, {
    revenueChange: number;
    discussionChange: number;
    churnRiskChange: number;
  }>;
}

export interface WorldState {
  competitors: Competitor[];
  genreTrends: GenreTrend[];
  seasonalHots: SeasonalHot[];
  recentIndustryEvent: IndustryEvent | null;
  lastUpdate: number;
}

export class WorldSimulator {
  private competitorSystem: CompetitorSystem;
  private marketTrendSystem: MarketTrendSystem;
  private industryEventSystem: IndustryEventSystem;
  private lastUpdate: number = 0;

  constructor() {
    this.competitorSystem = new CompetitorSystem();
    this.marketTrendSystem = new MarketTrendSystem();
    this.industryEventSystem = new IndustryEventSystem();
  }

  initialize(day: number): void {
    this.competitorSystem.initialize(day);
    this.marketTrendSystem.initialize(day);
    this.industryEventSystem.initialize(day);
    this.lastUpdate = day;
  }

  update(day: number): void {
    this.competitorSystem.update(day);
    this.marketTrendSystem.update(day);
    
    const eventResult = this.industryEventSystem.simulate(day);
    
    this.lastUpdate = day;
  }

  calculateImpact(yourRating: number, yourDAU: number, characterGenres: Map<string, string>): WorldImpact {
    const competitorEffect = this.competitorSystem.calculateEffect(yourRating, yourDAU);
    
    const marketEffect = this.marketTrendSystem.calculateEffect(this.lastUpdate);
    
    const eventResult = this.industryEventSystem.simulate(this.lastUpdate);
    
    const companyImpact: WorldImpact['company'] = {
      cashChange: 0,
      reputationChange: competitorEffect.activityChange > 0 ? 1 : -1
    };
    
    const projectImpact: WorldImpact['project'] = {
      dauChange: competitorEffect.dauChange,
      ratingChange: eventResult.effects?.project.ratingChange ?? 0,
      newUsersChange: competitorEffect.newUsersChange + (eventResult.effects?.project.newUsersChange ?? 0),
      activityChange: competitorEffect.activityChange
    };
    
    const characters = new Map<string, WorldImpact['characters'] extends Map<string, infer V> ? V : never>();
    
    for (const [charId, genre] of characterGenres) {
      const genreEffect = marketEffect.genreEffects.get(genre);
      
      if (genreEffect) {
        let revenueChange = genreEffect.revenueChange;
        let discussionChange = genreEffect.discussionChange;
        let churnRiskChange = genreEffect.churnRiskChange;
        
        if (eventResult.event?.characterImpact?.genres.includes(genre) ||
            eventResult.event?.characterImpact?.genres.includes('全部')) {
          revenueChange += eventResult.event.characterImpact.effect;
        }
        
        const seasonalMultiplier = marketEffect.seasonalMultiplier;
        revenueChange = Math.floor(revenueChange * seasonalMultiplier);
        
        characters.set(charId, {
          revenueChange,
          discussionChange,
          churnRiskChange
        });
      }
    }

    if (eventResult.effects) {
      companyImpact.cashChange += eventResult.effects.company.cashChange;
      companyImpact.reputationChange += eventResult.effects.company.reputationChange;
      projectImpact.dauChange += eventResult.effects.project.dauChange;
    }

    return {
      company: companyImpact,
      project: projectImpact,
      characters
    };
  }

  getCompetitorEffect(yourRating: number, yourDAU: number): CompetitorEffect {
    return this.competitorSystem.calculateEffect(yourRating, yourDAU);
  }

  getMarketTrendEffect(): MarketTrendEffect {
    return this.marketTrendSystem.calculateEffect(this.lastUpdate);
  }

  getIndustryEvent(): IndustryEventResult {
    return this.industryEventSystem.simulate(this.lastUpdate);
  }

  getCompetitors(): Competitor[] {
    return this.competitorSystem.getCompetitors();
  }

  getGenreTrends(): Map<string, GenreTrend> {
    return this.marketTrendSystem.getGenreTrends();
  }

  getSeasonalHots(): SeasonalHot[] {
    return this.marketTrendSystem.getSeasonalHots();
  }

  getEventHistory(): IndustryEvent[] {
    return this.industryEventSystem.getEventHistory();
  }

  getState(): WorldState {
    return {
      competitors: this.competitorSystem.getCompetitors(),
      genreTrends: Array.from(this.marketTrendSystem.getGenreTrends().values()),
      seasonalHots: this.marketTrendSystem.getSeasonalHots(),
      recentIndustryEvent: this.industryEventSystem.getLastEvent(),
      lastUpdate: this.lastUpdate
    };
  }

  setState(state: WorldState): void {
    this.lastUpdate = state.lastUpdate;
    this.competitorSystem.setState({
      competitors: state.competitors,
      lastUpdate: state.lastUpdate
    });
    this.marketTrendSystem.setState({
      genreTrends: state.genreTrends,
      seasonalHots: state.seasonalHots,
      day: state.lastUpdate
    });
    if (state.recentIndustryEvent) {
      this.industryEventSystem.setState({
        eventHistory: [state.recentIndustryEvent],
        lastTriggerDay: state.lastUpdate
      });
    }
  }
}

export const WorldSimulatorInstance = new WorldSimulator();
