/**
 * 赛季系统引擎
 * 实现动态变化的市场环境和题材热度轮换
 */

import { ref, computed } from 'vue';

// 题材类型
export type GenreType = 'sweet' | 'angst' | 'suspense' | 'fantasy' | 'modern' | 'historical';

// 赛季信息
export interface Season {
  id: number;
  name: string;
  startDate: number;
  endDate: number;
  theme: string;
  description: string;
}

// 题材热度
export interface GenreHeat {
  genre: GenreType;
  heat: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  changeRate: number;
}

// 行业事件
export interface IndustryEvent {
  id: string;
  name: string;
  type: 'exhibition' | 'policy' | 'technology' | 'scandal' | 'trend';
  description: string;
  startDate: number;
  endDate: number;
  effects: {
    genre?: GenreType;
    heatChange: number;
    revenueImpact: number;
  };
}

// 市场趋势
export interface MarketTrend {
  genre: GenreType;
  history: { date: number; heat: number }[];
  prediction: { date: number; heat: number }[];
}

export class SeasonEngine {
  private currentSeason = ref<Season>({
    id: 1,
    name: '第一赛季：甜蜜开局',
    startDate: Date.now(),
    endDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90天
    theme: 'sweet',
    description: '甜宠题材热度上升，适合推出温馨治愈向作品'
  });

  private genreHeats = ref<GenreHeat[]>([
    { genre: 'sweet', heat: 80, trend: 'up', changeRate: 5 },
    { genre: 'angst', heat: 60, trend: 'stable', changeRate: 0 },
    { genre: 'suspense', heat: 40, trend: 'down', changeRate: -3 },
    { genre: 'fantasy', heat: 50, trend: 'stable', changeRate: 0 },
    { genre: 'modern', heat: 70, trend: 'up', changeRate: 2 },
    { genre: 'historical', heat: 45, trend: 'down', changeRate: -2 }
  ]);

  private industryEvents = ref<IndustryEvent[]>([]);
  private eventHistory = ref<IndustryEvent[]>([]);

  // 当前赛季
  getCurrentSeason(): Season {
    return this.currentSeason.value;
  }

  // 题材热度
  getGenreHeats(): GenreHeat[] {
    return this.genreHeats.value;
  }

  // 获取特定题材热度
  getGenreHeat(genre: GenreType): number {
    const heat = this.genreHeats.value.find(h => h.genre === genre);
    return heat?.heat || 50;
  }

  // 计算题材收益系数
  getGenreRevenueMultiplier(genre: GenreType): number {
    const heat = this.getGenreHeat(genre);
    // 热度50为基准，每偏离10点，收益变化10%
    return 0.5 + (heat / 100);
  }

  // 获取当前事件
  getActiveEvents(): IndustryEvent[] {
    const now = Date.now();
    return this.industryEvents.value.filter(e => now >= e.startDate && now <= e.endDate);
  }

  // 获取事件历史
  getEventHistory(): IndustryEvent[] {
    return this.eventHistory.value;
  }

  // 推进到下一赛季
  advanceToNextSeason(): Season {
    const nextSeasonId = this.currentSeason.value.id + 1;
    
    // 保存当前赛季到历史
    this.eventHistory.value = [...this.eventHistory.value, ...this.industryEvents.value];
    
    // 生成新赛季
    this.currentSeason.value = this.generateSeason(nextSeasonId);
    
    // 更新题材热度（轮换）
    this.rotateGenreHeats();
    
    // 生成新事件
    this.generateIndustryEvents();
    
    return this.currentSeason.value;
  }

  // 每日更新
  dailyUpdate(): void {
    // 更新题材热度趋势
    this.genreHeats.value.forEach(heat => {
      const change = (Math.random() - 0.5) * 4 + heat.changeRate;
      heat.heat = Math.max(20, Math.min(100, heat.heat + change));
      
      // 更新趋势
      if (change > 1) {
        heat.trend = 'up';
      } else if (change < -1) {
        heat.trend = 'down';
      } else {
        heat.trend = 'stable';
      }
    });

    // 检查事件过期
    const now = Date.now();
    const expiredEvents = this.industryEvents.value.filter(e => now > e.endDate);
    if (expiredEvents.length > 0) {
      this.eventHistory.value = [...this.eventHistory.value, ...expiredEvents];
      this.industryEvents.value = this.industryEvents.value.filter(e => now <= e.endDate);
    }

    // 随机生成新事件（5%概率）
    if (Math.random() < 0.05) {
      this.generateRandomEvent();
    }
  }

  // 生成赛季
  private generateSeason(id: number): Season {
    const themes = [
      { theme: 'sweet', name: '甜蜜赛季', desc: '甜宠题材热度上升' },
      { theme: 'angst', name: '虐恋赛季', desc: '虐恋题材成为主流' },
      { theme: 'suspense', name: '悬疑赛季', desc: '悬疑推理题材大热' },
      { theme: 'fantasy', name: '幻想赛季', desc: '奇幻异世界题材流行' }
    ];
    
    const theme = themes[(id - 1) % themes.length];
    
    return {
      id,
      name: `第${id}赛季：${theme.name}`,
      startDate: Date.now(),
      endDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
      theme: theme.theme,
      description: theme.desc
    };
  }

  // 轮换题材热度
  private rotateGenreHeats(): void {
    const themeGenre = this.currentSeason.value.theme as GenreType;
    
    this.genreHeats.value = this.genreHeats.value.map(heat => {
      let newHeat = heat.heat;
      let newTrend: 'up' | 'down' | 'stable' = 'stable';
      let newChangeRate = 0;

      if (heat.genre === themeGenre) {
        // 赛季主题题材热度上升
        newHeat = Math.min(100, heat.heat + 20);
        newTrend = 'up';
        newChangeRate = 3;
      } else {
        // 其他题材随机变化
        newHeat = Math.max(20, Math.min(80, heat.heat + (Math.random() - 0.5) * 20));
        newTrend = Math.random() > 0.5 ? 'up' : 'down';
        newChangeRate = (Math.random() - 0.5) * 2;
      }

      return {
        ...heat,
        heat: newHeat,
        trend: newTrend,
        changeRate: newChangeRate
      };
    });
  }

  // 生成行业事件
  private generateIndustryEvents(): void {
    const events: IndustryEvent[] = [
      {
        id: `event_${Date.now()}_1`,
        name: '年度游戏展',
        type: 'exhibition',
        description: '各大游戏公司参展，新题材受到关注',
        startDate: Date.now(),
        endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        effects: { heatChange: 10, revenueImpact: 0.1 }
      },
      {
        id: `event_${Date.now()}_2`,
        name: '新渲染技术发布',
        type: 'technology',
        description: '新技术让游戏画面更精美，玩家期待提升',
        startDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        endDate: Date.now() + 37 * 24 * 60 * 60 * 1000,
        effects: { heatChange: 5, revenueImpact: 0.05 }
      }
    ];

    this.industryEvents.value = events;
  }

  // 生成随机事件
  private generateRandomEvent(): void {
    const eventTypes: IndustryEvent['type'][] = ['trend', 'scandal', 'policy'];
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    const eventNames: Record<string, string[]> = {
      trend: ['甜宠题材 trending', '虐恋剧情回潮', '悬疑推理大热'],
      scandal: ['某游戏爆率争议', '某大厂策划言论不当', '抄袭风波'],
      policy: ['版号政策调整', '未成年人保护新规', '内容审核趋严']
    };

    const names = eventNames[type];
    const name = names[Math.floor(Math.random() * names.length)];

    const event: IndustryEvent = {
      id: `event_${Date.now()}`,
      name,
      type,
      description: `突发${type === 'scandal' ? '负面' : ''}事件，影响市场走向`,
      startDate: Date.now(),
      endDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
      effects: {
        heatChange: type === 'scandal' ? -10 : 5,
        revenueImpact: type === 'scandal' ? -0.05 : 0.03
      }
    };

    this.industryEvents.value.push(event);
  }

  // 获取市场趋势预测
  getMarketTrendPrediction(genre: GenreType, days: number = 30): number[] {
    const currentHeat = this.getGenreHeat(genre);
    const predictions: number[] = [currentHeat];
    
    let heat = currentHeat;
    for (let i = 1; i < days; i++) {
      const genreHeat = this.genreHeats.value.find(h => h.genre === genre);
      const changeRate = genreHeat?.changeRate || 0;
      const randomChange = (Math.random() - 0.5) * 2;
      
      heat = Math.max(20, Math.min(100, heat + changeRate + randomChange));
      predictions.push(heat);
    }
    
    return predictions;
  }
}

// 单例导出
export const seasonEngine = new SeasonEngine();
