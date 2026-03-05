import { VirtualPlayer } from './types';

export interface Fanwork {
  id: string;
  playerId: string;
  type: '绘画' | '文稿' | '视频' | 'COS';
  quality: '优质' | '普通' | '粗糙';
  relatedCharacters: string[];
  tags: string[];
  likes: number;
  timestamp: number;
}

export interface FanworkResult {
  fanworks: Fanwork[];
  typeDistribution: Record<string, number>;
  qualityDistribution: Record<string, number>;
}

export class FanworkSimulator {
  private readonly CREATION_RATE = 0.05;
  
  private readonly TYPE_DISTRIBUTION = {
    '绘画': 0.40,
    '文稿': 0.35,
    '视频': 0.15,
    'COS': 0.10
  };

  private readonly QUALITY_DISTRIBUTION = {
    '优质': 0.10,
    '普通': 0.60,
    '粗糙': 0.30
  };

  private generateId(): string {
    return `fan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldCreate(player: VirtualPlayer): boolean {
    if (player.activityLevel < 0.5) {
      return false;
    }
    
    const isCorePlayer = player.loyalty > 0.6 || player.spendingLevel !== '零氪';
    
    if (!isCorePlayer) {
      return Math.random() < this.CREATION_RATE * 0.3;
    }
    
    const baseRate = this.CREATION_RATE;
    const activityFactor = player.activityLevel;
    const loyaltyFactor = player.loyalty;
    
    const rate = baseRate * activityFactor * loyaltyFactor * 2;
    return Math.random() < rate;
  }

  private assignType(player: VirtualPlayer): '绘画' | '文稿' | '视频' | 'COS' {
    const rand = Math.random();
    
    if (rand < this.TYPE_DISTRIBUTION['绘画']) {
      return '绘画';
    } else if (rand < this.TYPE_DISTRIBUTION['绘画'] + this.TYPE_DISTRIBUTION['文稿']) {
      return '文稿';
    } else if (rand < this.TYPE_DISTRIBUTION['绘画'] + this.TYPE_DISTRIBUTION['文稿'] + this.TYPE_DISTRIBUTION['视频']) {
      return '视频';
    } else {
      return 'COS';
    }
  }

  private calculateQuality(): '优质' | '普通' | '粗糙' {
    const rand = Math.random();
    
    if (rand < this.QUALITY_DISTRIBUTION['优质']) {
      return '优质';
    } else if (rand < this.QUALITY_DISTRIBUTION['优质'] + this.QUALITY_DISTRIBUTION['普通']) {
      return '普通';
    } else {
      return '粗糙';
    }
  }

  private inferCharacterPreferences(player: VirtualPlayer): string[] {
    return player.characterPreference.slice(0, 2);
  }

  private generateTags(type: '绘画' | '文稿' | '视频' | 'COS', characters: string[]): string[] {
    const baseTags = [...characters];
    
    switch (type) {
      case '绘画':
        baseTags.push('同人图', '画作');
        if (characters.length > 0) {
          baseTags.push(`#${characters[0]}`);
        }
        break;
      case '文稿':
        baseTags.push('同人文', '小说');
        if (characters.length > 1) {
          baseTags.push(`${characters[0]}×${characters[1]}`);
        }
        break;
      case '视频':
        baseTags.push('二创', '剪辑');
        break;
      case 'COS':
        baseTags.push('Cosplay', '还原');
        break;
    }
    
    return baseTags;
  }

  private calculateLikes(quality: '优质' | '普通' | '粗糙', type: string): number {
    const baseLikes = {
      '优质': 50,
      '普通': 20,
      '粗糙': 5
    }[quality];

    const typeBonus = {
      '绘画': 1.2,
      '文稿': 1.0,
      '视频': 1.5,
      'COS': 1.3
    }[type];

    return Math.floor(baseLikes * typeBonus * (0.5 + Math.random()));
  }

  simulatePlayer(player: VirtualPlayer, characters: string[] = []): Fanwork | null {
    if (!this.shouldCreate(player)) {
      return null;
    }

    const type = this.assignType(player);
    const quality = this.calculateQuality();
    const relatedCharacters = characters.length > 0 ? characters : this.inferCharacterPreferences(player);
    const tags = this.generateTags(type, relatedCharacters);
    const likes = this.calculateLikes(quality, type);

    return {
      id: this.generateId(),
      playerId: player.id,
      type,
      quality,
      relatedCharacters,
      tags,
      likes,
      timestamp: Date.now()
    };
  }

  simulateBatch(players: VirtualPlayer[], characters: string[] = []): FanworkResult {
    const fanworks: Fanwork[] = [];
    const typeDistribution: Record<string, number> = {
      '绘画': 0,
      '文稿': 0,
      '视频': 0,
      'COS': 0
    };
    const qualityDistribution: Record<string, number> = {
      '优质': 0,
      '普通': 0,
      '粗糙': 0
    };

    for (const player of players) {
      const fanwork = this.simulatePlayer(player, characters);
      
      if (fanwork) {
        fanworks.push(fanwork);
        typeDistribution[fanwork.type]++;
        qualityDistribution[fanwork.quality]++;
      }
    }

    const total = fanworks.length || 1;
    return {
      fanworks,
      typeDistribution: {
        '绘画': typeDistribution['绘画'] / total,
        '文稿': typeDistribution['文稿'] / total,
        '视频': typeDistribution['视频'] / total,
        'COS': typeDistribution['COS'] / total
      },
      qualityDistribution: {
        '优质': qualityDistribution['优质'] / total,
        '普通': qualityDistribution['普通'] / total,
        '粗糙': qualityDistribution['粗糙'] / total
      }
    };
  }
}

export const FanworkSimulatorInstance = new FanworkSimulator();
