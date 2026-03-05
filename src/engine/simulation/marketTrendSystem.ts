export interface GenreTrend {
  genre: string;
  heat: number;
  trend: '上升' | '平稳' | '下降';
  cyclePhase: number;
}

export interface SeasonalHot {
  name: string;
  multiplier: number;
  startDay: number;
  endDay: number;
  affectedGenres: string[];
}

export interface MarketTrendEffect {
  genreEffects: Map<string, {
    revenueChange: number;
    discussionChange: number;
    churnRiskChange: number;
  }>;
  seasonalMultiplier: number;
  description: string;
}

const GENRE_CYCLE = {
  '甜宠': { phases: [1.0, 0.8, 0.6, 0.8], phaseLength: 30 },
  '虐恋': { phases: [0.7, 1.0, 0.8, 0.7], phaseLength: 30 },
  '悬疑': { phases: [0.5, 0.6, 1.0, 0.5], phaseLength: 30 },
  '治愈': { phases: [0.8, 0.9, 0.7, 0.8], phaseLength: 30 },
  '搞笑': { phases: [0.6, 0.7, 0.8, 0.9], phaseLength: 30 }
};

export class MarketTrendSystem {
  private genreTrends: Map<string, GenreTrend> = new Map();
  private seasonalHots: SeasonalHot[] = [];
  private day: number = 1;

  initialize(day: number): void {
    this.day = day;
    this.genreTrends = new Map();
    this.seasonalHots = [];

    for (const genre of Object.keys(GENRE_CYCLE)) {
      this.genreTrends.set(genre, {
        genre,
        heat: 0.8 + Math.random() * 0.4,
        trend: '平稳',
        cyclePhase: Math.floor(Math.random() * 4)
      });
    }

    this.initializeSeasonalHots(day);
  }

  private initializeSeasonalHots(startDay: number): void {
    this.seasonalHots = [
      {
        name: '春节',
        multiplier: 1.5,
        startDay: this.getDayOfYear(startDay, 1, 15),
        endDay: this.getDayOfYear(startDay, 1, 30),
        affectedGenres: ['甜宠', '治愈']
      },
      {
        name: '情人节',
        multiplier: 1.4,
        startDay: this.getDayOfYear(startDay, 2, 10),
        endDay: this.getDayOfYear(startDay, 2, 20),
        affectedGenres: ['甜宠', '虐恋']
      },
      {
        name: '周年庆',
        multiplier: 1.5,
        startDay: this.getDayOfYear(startDay, 6, 1),
        endDay: this.getDayOfYear(startDay, 6, 15),
        affectedGenres: ['甜宠', '虐恋', '悬疑', '治愈']
      },
      {
        name: '国庆',
        multiplier: 1.3,
        startDay: this.getDayOfYear(startDay, 10, 1),
        endDay: this.getDayOfYear(startDay, 10, 7),
        affectedGenres: ['治愈', '搞笑']
      },
      {
        name: '520',
        multiplier: 1.3,
        startDay: this.getDayOfYear(startDay, 5, 15),
        endDay: this.getDayOfYear(startDay, 5, 25),
        affectedGenres: ['甜宠']
      }
    ];
  }

  private getDayOfYear(baseDay: number, month: number, day: number): number {
    const baseMonth = Math.floor((baseDay % 365) / 30) + 1;
    const baseDayOfMonth = baseDay % 30;
    
    let targetDay = 0;
    for (let m = 1; m < month; m++) {
      targetDay += m === 2 ? 28 : 30;
    }
    targetDay += day;
    
    const currentDay = (baseDay % 365);
    
    return Math.floor(baseDay / 365) * 365 + targetDay;
  }

  update(day: number): void {
    this.day = day;

    for (const [genre, config] of Object.entries(GENRE_CYCLE)) {
      const trend = this.genreTrends.get(genre);
      if (!trend) continue;

      const phase = Math.floor((day / config.phaseLength) % 4);
      const phaseProgress = (day % config.phaseLength) / config.phaseLength;
      const prevHeat = trend.heat;
      
      const nextHeat = config.phases[phase];
      const interpolatedHeat = prevHeat + (nextHeat - prevHeat) * phaseProgress * 0.3;
      
      trend.heat = Math.max(0.3, Math.min(1.5, interpolatedHeat));
      trend.cyclePhase = phase;

      if (trend.heat > prevHeat + 0.1) {
        trend.trend = '上升';
      } else if (trend.heat < prevHeat - 0.1) {
        trend.trend = '下降';
      } else {
        trend.trend = '平稳';
      }
    }
  }

  getGenreHeat(genre: string): number {
    return this.genreTrends.get(genre)?.heat ?? 0.8;
  }

  getSeasonalMultiplier(day: number): number {
    let multiplier = 1.0;
    
    for (const seasonal of this.seasonalHots) {
      if (day >= seasonal.startDay && day <= seasonal.endDay) {
        if (seasonal.multiplier > multiplier) {
          multiplier = seasonal.multiplier;
        }
      }
    }
    
    return multiplier;
  }

  calculateGenreEffect(genre: string): {
    revenueChange: number;
    discussionChange: number;
    churnRiskChange: number;
  } {
    const trend = this.genreTrends.get(genre);
    if (!trend) {
      return { revenueChange: 0, discussionChange: 0, churnRiskChange: 0 };
    }

    let revenueChange = 0;
    let discussionChange = 0;
    let churnRiskChange = 0;

    if (trend.heat > 1.0) {
      revenueChange = Math.floor((trend.heat - 1.0) * 30);
      discussionChange = Math.floor((trend.heat - 1.0) * 20);
    } else if (trend.heat < 0.7) {
      revenueChange = Math.floor((trend.heat - 0.7) * 20);
      churnRiskChange = Math.floor((0.7 - trend.heat) * 10);
    }

    if (trend.trend === '上升') {
      discussionChange += 20;
    } else if (trend.trend === '下降') {
      churnRiskChange += 10;
    }

    return { revenueChange, discussionChange, churnRiskChange };
  }

  calculateEffect(day: number): MarketTrendEffect {
    const genreEffects = new Map<string, {
      revenueChange: number;
      discussionChange: number;
      churnRiskChange: number;
    }>();

    const descriptions: string[] = [];

    for (const [genre, trend] of this.genreTrends) {
      const effect = this.calculateGenreEffect(genre);
      genreEffects.set(genre, effect);

      if (effect.revenueChange > 10) {
        descriptions.push(`${genre}题材热度上升，收入+${effect.revenueChange}%`);
      } else if (effect.revenueChange < -5) {
        descriptions.push(`${genre}题材热度下降，收入${effect.revenueChange}%`);
      }

      if (trend.trend === '上升') {
        descriptions.push(`${genre}正在热门中`);
      }
    }

    const seasonalMultiplier = this.getSeasonalMultiplier(day);
    if (seasonalMultiplier > 1.0) {
      const activeSeasonal = this.seasonalHots.find(
        s => day >= s.startDay && day <= s.endDay
      );
      if (activeSeasonal) {
        descriptions.push(`${activeSeasonal.name}活动期间，全局收入x${seasonalMultiplier}`);
      }
    }

    return {
      genreEffects,
      seasonalMultiplier,
      description: descriptions.length > 0 ? descriptions.join('；') : '市场平稳'
    };
  }

  getGenreTrends(): Map<string, GenreTrend> {
    return new Map(this.genreTrends);
  }

  getSeasonalHots(): SeasonalHot[] {
    return [...this.seasonalHots];
  }

  getActiveSeasonal(day: number): SeasonalHot | null {
    return this.seasonalHots.find(
      s => day >= s.startDay && day <= s.endDay
    ) ?? null;
  }

  getState(): { genreTrends: GenreTrend[]; seasonalHots: SeasonalHot[]; day: number } {
    return {
      genreTrends: Array.from(this.genreTrends.values()),
      seasonalHots: this.seasonalHots,
      day: this.day
    };
  }

  setState(state: { genreTrends: GenreTrend[]; seasonalHots: SeasonalHot[]; day: number }): void {
    this.day = state.day;
    this.genreTrends = new Map(state.genreTrends.map(t => [t.genre, t]));
    this.seasonalHots = state.seasonalHots;
  }
}

export const MarketTrendSystemInstance = new MarketTrendSystem();
