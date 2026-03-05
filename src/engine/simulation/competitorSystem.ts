export interface Competitor {
  id: string;
  name: string;
  genre: string;
  style: string;
  releaseDate: number;
  state: '运营中' | '上线新版本' | '凉凉' | '即将上线';
  rating: number;
  dau: number;
  marketShare: number;
  recentTrend: '上升' | '平稳' | '下滑';
}

export interface CompetitorEffect {
  dauChange: number;
  newUsersChange: number;
  activityChange: number;
  description: string;
}

export interface CompetitorSystemState {
  competitors: Competitor[];
  lastUpdate: number;
}

const COMPETITOR_NAMES = [
  '甜梦恋语', '星光之约', '心动的讯号', '恋爱循环',
  '暗恋橘生', '缘来是你', '双向心动', '甜蜜暴击',
  '国民老公', '千金归来', '高冷boss', '暖心竹马'
];

const GENRES = ['甜宠', '虐恋', '悬疑', '治愈', '搞笑'];
const STYLES = ['唯美', '写实', '二次元', '韩漫', '日漫'];

export class CompetitorSystem {
  private competitors: Competitor[] = [];
  private lastUpdate: number = 0;

  private generateId(): string {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initialize(day: number): void {
    const count = 3 + Math.floor(Math.random() * 3);
    this.competitors = [];

    for (let i = 0; i < count; i++) {
      const stateRand = Math.random();
      let state: Competitor['state'];
      if (stateRand < 0.7) state = '运营中';
      else if (stateRand < 0.85) state = '上线新版本';
      else state = '凉凉';

      const rating = 4 + Math.random() * 5;
      const dau = Math.floor(500 + Math.random() * 2000);

      this.competitors.push({
        id: this.generateId(),
        name: COMPETITOR_NAMES[Math.floor(Math.random() * COMPETITOR_NAMES.length)],
        genre: GENRES[Math.floor(Math.random() * GENRES.length)],
        style: STYLES[Math.floor(Math.random() * STYLES.length)],
        releaseDate: day - Math.floor(Math.random() * 90),
        state,
        rating,
        dau,
        marketShare: 0.05 + Math.random() * 0.25,
        recentTrend: '平稳'
      });
    }

    this.lastUpdate = day;
  }

  update(day: number): void {
    if (day - this.lastUpdate < 10) return;

    for (const comp of this.competitors) {
      const ratingChange = (Math.random() - 0.5) * 0.5;
      comp.rating = Math.max(1, Math.min(10, comp.rating + ratingChange));

      if (comp.state === '运营中') {
        if (comp.rating < 4) {
          comp.state = '凉凉';
          comp.recentTrend = '下滑';
        } else if (comp.rating > 8) {
          comp.state = '上线新版本';
          comp.recentTrend = '上升';
        }
      } else if (comp.state === '上线新版本') {
        const newVersionPerformance = Math.random();
        if (comp.rating > 5 && newVersionPerformance > 0.4) {
          comp.state = '运营中';
          comp.recentTrend = '上升';
        } else if (comp.rating < 5) {
          comp.state = '凉凉';
          comp.recentTrend = '下滑';
        }
      } else if (comp.state === '凉凉') {
        if (Math.random() < 0.05) {
          comp.state = '即将上线';
        }
      } else if (comp.state === '即将上线') {
        if (Math.random() < 0.3) {
          comp.state = '运营中';
          comp.rating = 5 + Math.random() * 2;
          comp.recentTrend = '上升';
        }
      }

      const dauChange = (Math.random() - 0.5) * 100;
      comp.dau = Math.max(100, comp.dau + dauChange);

      const shareChange = (Math.random() - 0.5) * 0.02;
      comp.marketShare = Math.max(0.01, Math.min(0.4, comp.marketShare + shareChange));
    }

    this.lastUpdate = day;
  }

  calculateEffect(yourRating: number, yourDAU: number): CompetitorEffect {
    let dauChange = 0;
    let newUsersChange = 0;
    let activityChange = 0;
    const descriptions: string[] = [];

    for (const comp of this.competitors) {
      if (comp.state === '凉凉') {
        newUsersChange += 10;
        descriptions.push(`${comp.name}凉凉，潜在玩家流入`);
      } else if (comp.state === '上线新版本') {
        activityChange -= 15;
        dauChange -= Math.floor(yourDAU * 0.15);
        descriptions.push(`${comp.name}上线新版本，分流玩家`);
      } else if (comp.state === '运营中') {
        if (comp.rating > yourRating + 1) {
          dauChange -= Math.floor(yourDAU * 0.1);
          activityChange -= 5;
          descriptions.push(`${comp.name}评分较高(${comp.rating.toFixed(1)})，竞争力强`);
        }

        if (comp.marketShare > 0.3) {
          dauChange -= Math.floor(yourDAU * 0.05);
          activityChange -= 3;
          descriptions.push(`${comp.name}市场份额高(${ (comp.marketShare * 100).toFixed(0) }%)`);
        }
      }
    }

    return {
      dauChange,
      newUsersChange,
      activityChange,
      description: descriptions.length > 0 ? descriptions.join('；') : '市场稳定'
    };
  }

  getCompetitors(): Competitor[] {
    return [...this.competitors];
  }

  getCompetitorByGenre(genre: string): Competitor[] {
    return this.competitors.filter(c => c.genre === genre && c.state !== '凉凉');
  }

  getState(): CompetitorSystemState {
    return {
      competitors: this.competitors,
      lastUpdate: this.lastUpdate
    };
  }

  setState(state: CompetitorSystemState): void {
    this.competitors = state.competitors;
    this.lastUpdate = state.lastUpdate;
  }
}

export const CompetitorSystemInstance = new CompetitorSystem();
