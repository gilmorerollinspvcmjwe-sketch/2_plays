import { VirtualPlayer } from './types';

export interface Confession {
  id: string;
  playerId: string;
  type: '角色告白' | '剧情告白' | '官方告白' | '退坑告白';
  content: string;
  relatedTags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  likes: number;
  timestamp: number;
}

export interface ConfessionResult {
  confessions: Confession[];
  typeDistribution: Record<string, number>;
  sentimentDistribution: Record<string, number>;
}

export class ConfessionSimulator {
  private readonly CONFESSION_RATE = 0.1;
  
  private readonly TYPE_DISTRIBUTION = {
    '角色告白': 0.70,
    '剧情告白': 0.20,
    '官方告白': 0.08,
    '退坑告白': 0.02
  };

  private generateId(): string {
    return `conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldConfess(player: VirtualPlayer): boolean {
    if (player.state === 'LOST') {
      return Math.random() < this.CONFESSION_RATE * 0.5;
    }
    
    const baseRate = this.CONFESSION_RATE;
    const activityFactor = player.activityLevel;
    const satisfactionFactor = player.satisfaction > 0.7 ? 1.3 : (player.satisfaction < 0.3 ? 0.5 : 1);
    
    const rate = baseRate * activityFactor * satisfactionFactor;
    return Math.random() < rate;
  }

  private assignType(player: VirtualPlayer): '角色告白' | '剧情告白' | '官方告白' | '退坑告白' {
    if (player.state === 'LOST' || player.state === 'AT_RISK') {
      return '退坑告白';
    }
    
    if (player.satisfaction > 0.8) {
      if (Math.random() < this.TYPE_DISTRIBUTION['官方告白']) {
        return '官方告白';
      }
    }
    
    const rand = Math.random();
    if (rand < this.TYPE_DISTRIBUTION['角色告白']) {
      return '角色告白';
    } else if (rand < this.TYPE_DISTRIBUTION['角色告白'] + this.TYPE_DISTRIBUTION['剧情告白']) {
      return '剧情告白';
    } else {
      return '官方告白';
    }
  }

  private inferPlayerPreferences(player: VirtualPlayer): string[] {
    return [
      ...player.characterPreference,
      ...player.plotPreference,
      ...player.genrePreference
    ];
  }

  private generateContent(player: VirtualPlayer, type: '角色告白' | '剧情告白' | '官方告白' | '退坑告白', relatedTags: string[]): string {
    const templates: Record<string, string[]> = {
      '角色告白': [
        `今天又被${relatedTags[0] || '这个角色'}戳到了！太香了呜呜`,
        `${relatedTags[0] || '角色'}的笑容也太杀我了叭，awsl`,
        `我要为${relatedTags[0] || '这个角色'}打call一辈子！`,
        `${relatedTags[0] || '他'}那种外冷内热的感觉真的太戳我了...`,
        `又是为${relatedTags[0] || '角色'}疯狂心动的一天！`
      ],
      '剧情告白': [
        `这次的剧情太感动了呜呜呜，哭湿了枕头...`,
        `${relatedTags[0] || '这段剧情'}真的封神了，制作组太懂了`,
        `今天的剧情糖分超标了，甜到我蛀牙！`,
        `虐的我心肝疼，但是好上头啊...`,
        `这剧情转折我真的服了，太会写了！`
      ],
      '官方告白': [
        `感谢制作组的用心，我会一直支持下去的！`,
        `周年庆活动太棒了，官方大气！`,
        `这游戏真的没白玩，期待更多内容！`,
        `感谢相遇，我会一直陪伴的❤️`,
        `制作组辛苦了，爱你们！`
      ],
      '退坑告白': [
        `抱歉了各位，要先下车了...`,
        `虽然很不舍，但还是要说再见了...`,
        `感谢这个游戏带给我的回忆`,
        `江湖路远，有缘再会吧...`,
        `先A一段时间，可能还会回来吧...`
      ]
    };

    const typeTemplates = templates[type];
    return typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
  }

  private calculateSentiment(type: '角色告白' | '剧情告白' | '官方告白' | '退坑告白', player: VirtualPlayer): 'positive' | 'neutral' | 'negative' {
    if (type === '退坑告白') {
      return 'negative';
    }
    
    if (player.satisfaction > 0.7) {
      return 'positive';
    } else if (player.satisfaction < 0.4) {
      return 'negative';
    }
    
    return 'neutral';
  }

  private calculateLikes(player: VirtualPlayer): number {
    const baseLikes = 5;
    const activityBonus = player.activityLevel * 10;
    const loyaltyBonus = player.loyalty * 15;
    
    return Math.floor(baseLikes + activityBonus + loyaltyBonus + Math.random() * 20);
  }

  simulatePlayer(player: VirtualPlayer, relatedTags: string[] = []): Confession | null {
    if (!this.shouldConfess(player)) {
      return null;
    }

    const type = this.assignType(player);
    const content = this.generateContent(player, type, relatedTags);
    const sentiment = this.calculateSentiment(type, player);
    const likes = this.calculateLikes(player);
    const playerPrefs = this.inferPlayerPreferences(player);

    return {
      id: this.generateId(),
      playerId: player.id,
      type,
      content,
      relatedTags: relatedTags.length > 0 ? relatedTags : playerPrefs.slice(0, 2),
      sentiment,
      likes,
      timestamp: Date.now()
    };
  }

  simulateBatch(players: VirtualPlayer[], relatedTags: string[] = []): ConfessionResult {
    const confessions: Confession[] = [];
    const typeDistribution: Record<string, number> = {
      '角色告白': 0,
      '剧情告白': 0,
      '官方告白': 0,
      '退坑告白': 0
    };
    const sentimentDistribution: Record<string, number> = {
      'positive': 0,
      'neutral': 0,
      'negative': 0
    };

    for (const player of players) {
      const confession = this.simulatePlayer(player, relatedTags);
      
      if (confession) {
        confessions.push(confession);
        typeDistribution[confession.type]++;
        sentimentDistribution[confession.sentiment]++;
      }
    }

    const total = confessions.length || 1;
    return {
      confessions,
      typeDistribution: {
        '角色告白': typeDistribution['角色告白'] / total,
        '剧情告白': typeDistribution['剧情告白'] / total,
        '官方告白': typeDistribution['官方告白'] / total,
        '退坑告白': typeDistribution['退坑告白'] / total
      },
      sentimentDistribution: {
        'positive': sentimentDistribution['positive'] / total,
        'neutral': sentimentDistribution['neutral'] / total,
        'negative': sentimentDistribution['negative'] / total
      }
    };
  }
}

export const ConfessionSimulatorInstance = new ConfessionSimulator();
