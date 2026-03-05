/**
 * 竞争环境引擎
 * 实现虚拟竞品动态、市场洗牌、合作机会
 */

import { ref } from 'vue';
import type { GenreType } from './seasonEngine';

// 竞品游戏
export interface CompetitorGame {
  id: string;
  name: string;
  company: string;
  genre: GenreType;
  rating: number;
  dau: number;
  revenue: number;
  releaseDate: number;
  marketShare: number;
  trend: 'rising' | 'stable' | 'declining';
  events: CompetitorEvent[];
}

// 竞品事件
export interface CompetitorEvent {
  id: string;
  gameId: string;
  type: 'update' | 'event' | 'scandal' | 'collaboration';
  title: string;
  description: string;
  date: number;
  impact: number; // 影响系数
}

// 合作机会
export interface CollaborationOpportunity {
  id: string;
  type: 'ip' | 'crossover' | 'promotion';
  partner: string;
  description: string;
  cost: number;
  potentialRevenue: number;
  duration: number;
  requirements: string[];
}

// 市场排名
export interface MarketRanking {
  rank: number;
  gameId: string;
  name: string;
  company: string;
  score: number;
  change: number;
}

export class CompetitorEngine {
  private competitors = ref<CompetitorGame[]>([]);
  private events = ref<CompetitorEvent[]>([]);
  private collaborations = ref<CollaborationOpportunity[]>([]);
  private playerRank = ref<number>(10);

  constructor() {
    this.initializeCompetitors();
  }

  // 获取所有竞品
  getCompetitors(): CompetitorGame[] {
    return this.competitors.value;
  }

  // 获取市场排名
  getMarketRankings(): MarketRanking[] {
    const allGames = [
      ...this.competitors.value.map(c => ({
        gameId: c.id,
        name: c.name,
        company: c.company,
        score: c.rating * c.dau / 10000,
        change: c.trend === 'rising' ? 5 : c.trend === 'declining' ? -5 : 0
      })),
      {
        gameId: 'player',
        name: '我的游戏',
        company: '我的公司',
        score: this.calculatePlayerScore(),
        change: 0
      }
    ];

    return allGames
      .sort((a, b) => b.score - a.score)
      .map((game, index) => ({
        rank: index + 1,
        ...game
      }));
  }

  // 获取玩家排名
  getPlayerRank(): number {
    return this.playerRank.value;
  }

  // 获取合作机会
  getCollaborations(): CollaborationOpportunity[] {
    return this.collaborations.value;
  }

  // 获取竞品事件
  getEvents(): CompetitorEvent[] {
    return this.events.value.sort((a, b) => b.date - a.date);
  }

  // 每日更新
  dailyUpdate(): void {
    // 更新竞品数据
    this.competitors.value.forEach(competitor => {
      // 随机变化趋势
      const trendChange = Math.random();
      if (trendChange > 0.7) {
        competitor.trend = 'rising';
      } else if (trendChange < 0.3) {
        competitor.trend = 'declining';
      } else {
        competitor.trend = 'stable';
      }

      // 根据趋势更新数据
      const multiplier = competitor.trend === 'rising' ? 1.02 : 
                        competitor.trend === 'declining' ? 0.98 : 1;
      
      competitor.dau = Math.floor(competitor.dau * multiplier);
      competitor.revenue = Math.floor(competitor.revenue * multiplier);
      competitor.marketShare = Math.max(0, Math.min(100, competitor.marketShare * multiplier));
    });

    // 随机生成竞品事件
    if (Math.random() < 0.1) {
      this.generateCompetitorEvent();
    }

    // 随机生成合作机会
    if (Math.random() < 0.05) {
      this.generateCollaboration();
    }

    // 更新玩家排名
    this.updatePlayerRank();
  }

  // 执行合作
  executeCollaboration(collabId: string): { success: boolean; revenue: number; message: string } {
    const collab = this.collaborations.value.find(c => c.id === collabId);
    if (!collab) {
      return { success: false, revenue: 0, message: '合作机会不存在' };
    }

    // 计算实际收益（有随机波动）
    const variance = (Math.random() - 0.5) * 0.4; // ±20%波动
    const actualRevenue = Math.floor(collab.potentialRevenue * (1 + variance));

    // 移除已执行的合作
    this.collaborations.value = this.collaborations.value.filter(c => c.id !== collabId);

    return {
      success: true,
      revenue: actualRevenue,
      message: variance > 0 ? '合作效果超出预期！' : '合作效果一般'
    };
  }

  // 初始化竞品
  private initializeCompetitors(): void {
    const competitorNames = [
      { name: '恋与制作人', company: '叠纸游戏', genre: 'modern' as GenreType },
      { name: '光与夜之恋', company: '腾讯游戏', genre: 'modern' as GenreType },
      { name: '未定事件簿', company: '米哈游', genre: 'suspense' as GenreType },
      { name: '时空中的绘旅人', company: '网易游戏', genre: 'fantasy' as GenreType },
      { name: '掌门太忙', company: '华清飞扬', genre: 'historical' as GenreType }
    ];

    this.competitors.value = competitorNames.map((comp, index) => ({
      id: `competitor_${index}`,
      name: comp.name,
      company: comp.company,
      genre: comp.genre,
      rating: 7 + Math.random() * 2,
      dau: Math.floor(50000 + Math.random() * 100000),
      revenue: Math.floor(100000 + Math.random() * 500000),
      releaseDate: Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000),
      marketShare: Math.floor(10 + Math.random() * 20),
      trend: Math.random() > 0.5 ? 'stable' : 'rising',
      events: []
    }));
  }

  // 生成竞品事件
  private generateCompetitorEvent(): void {
    const competitor = this.competitors.value[Math.floor(Math.random() * this.competitors.value.length)];
    const eventTypes: CompetitorEvent['type'][] = ['update', 'event', 'scandal', 'collaboration'];
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const eventTitles: Record<string, string[]> = {
      update: ['新版本更新', '角色新增', '剧情扩展'],
      event: ['周年庆活动', '限时卡池', '联动活动'],
      scandal: ['爆率争议', '文案风波', '技术故障'],
      collaboration: ['IP联动', '品牌合作', '跨界合作']
    };

    const titles = eventTitles[type];
    const title = titles[Math.floor(Math.random() * titles.length)];

    const event: CompetitorEvent = {
      id: `event_${Date.now()}`,
      gameId: competitor.id,
      type,
      title,
      description: `${competitor.name}发布了${title}`,
      date: Date.now(),
      impact: type === 'scandal' ? -0.1 : 0.05
    };

    this.events.value.push(event);

    // 应用事件影响
    if (type === 'scandal') {
      competitor.trend = 'declining';
      competitor.marketShare = Math.max(0, competitor.marketShare - 2);
    } else {
      competitor.trend = 'rising';
      competitor.marketShare = Math.min(100, competitor.marketShare + 1);
    }
  }

  // 生成合作机会
  private generateCollaboration(): void {
    const collabTypes: CollaborationOpportunity['type'][] = ['ip', 'crossover', 'promotion'];
    const type = collabTypes[Math.floor(Math.random() * collabTypes.length)];

    const partners: Record<string, string[]> = {
      ip: ['热门动漫IP', '知名小说IP', '经典游戏IP'],
      crossover: ['知名餐饮品牌', '时尚品牌', '美妆品牌'],
      promotion: ['视频平台', '社交平台', '直播平台']
    };

    const partner = partners[type][Math.floor(Math.random() * partners[type].length)];

    const collab: CollaborationOpportunity = {
      id: `collab_${Date.now()}`,
      type,
      partner,
      description: `与${partner}的合作机会，可以提升游戏知名度和收入`,
      cost: Math.floor(50000 + Math.random() * 100000),
      potentialRevenue: Math.floor(100000 + Math.random() * 200000),
      duration: Math.floor(7 + Math.random() * 14),
      requirements: ['游戏评分>7.0', 'DAU>10000']
    };

    this.collaborations.value.push(collab);
  }

  // 计算玩家分数
  private calculatePlayerScore(): number {
    // 简化计算，实际应该从playerStore获取
    return 50000 + Math.floor(Math.random() * 50000);
  }

  // 更新玩家排名
  private updatePlayerRank(): void {
    const rankings = this.getMarketRankings();
    const playerRanking = rankings.find(r => r.gameId === 'player');
    if (playerRanking) {
      this.playerRank.value = playerRanking.rank;
    }
  }

  // 获取市场份额分布
  getMarketShareDistribution(): { name: string; share: number }[] {
    const totalShare = this.competitors.value.reduce((sum, c) => sum + c.marketShare, 0);
    const playerShare = Math.max(5, 100 - totalShare);

    return [
      ...this.competitors.value.map(c => ({
        name: c.name,
        share: c.marketShare
      })),
      { name: '我的游戏', share: playerShare }
    ].sort((a, b) => b.share - a.share);
  }
}

// 单例导出
export const competitorEngine = new CompetitorEngine();
