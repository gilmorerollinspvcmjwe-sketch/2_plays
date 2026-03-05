import { VirtualPlayer } from './types';
import type { ActivityTag, PlayerTag } from './tagSystem';

export interface ActivityConfig {
  id: string;
  name: string;
  type: '限时' | '日常' | '大型';
  tags: ActivityTag[];
  rewardValue: number;
  difficulty: number;
  duration: number;
  requiredLevel: number;
  startDay: number;
  endDay: number;
}

export interface ActivityEffect {
  dauChange: number;
  satisfactionChange: number;
  revenueChange: number;
  fatigueChange: number;
}

export interface ActivityResult {
  activityId: string;
  participants: number;
  completions: number;
  averageCompletionRate: number;
  effect: ActivityEffect;
}

export class ActivitySimulator {
  private readonly BASE_PARTICIPATION_RATE = 0.5;
  
  private inferPlayerTags(player: VirtualPlayer): PlayerTag[] {
    const tags: PlayerTag[] = [];
    
    if (player.occupation === '学生') tags.push('学生');
    else if (player.occupation === '上班族') tags.push('上班族');
    else if (player.occupation === '自由职业') tags.push('自由职业');
    
    tags.push(player.spendingLevel);
    tags.push(player.playStyle);
    
    const allPreferences = [
      ...player.characterPreference,
      ...player.plotPreference,
      ...player.genrePreference
    ];
    
    for (const pref of allPreferences) {
      if (pref.includes('甜') || pref.includes('宠') || pref.includes('甜蜜')) {
        tags.push('甜宠控');
      }
      if (pref.includes('虐') || pref.includes('悲')) {
        tags.push('虐恋控');
      }
      if (pref.includes('颜') || pref.includes('帅') || pref.includes('美')) {
        tags.push('颜狗');
      }
      if (pref.includes('声') || pref.includes('音')) {
        tags.push('声优控');
      }
    }
    
    return [...new Set(tags)];
  }

  private hasMatchingTag(player: VirtualPlayer, activity: ActivityConfig): boolean {
    const playerTags = this.inferPlayerTags(player);
    
    for (const playerTag of playerTags) {
      if (playerTag === '甜宠控' && activity.tags.includes('情人节')) {
        return true;
      }
      if (activity.tags.includes('签到') && player.activityLevel > 0.5) {
        return true;
      }
      if (activity.tags.includes('高福利')) {
        return true;
      }
      if (activity.tags.includes('周年庆') && player.loyalty > 0.6) {
        return true;
      }
    }
    
    return false;
  }

  private calculateFatigueDecay(player: VirtualPlayer): number {
    const fatiguePercent = player.fatigue * 100;
    
    if (fatiguePercent > 80) {
      return 0.5;
    } else if (fatiguePercent > 60) {
      return 0.75;
    }
    
    return 1.0;
  }

  private calculateActivityAttractiveness(activity: ActivityConfig): number {
    if (activity.difficulty === 0) return 1;
    return activity.rewardValue / activity.difficulty;
  }

  calculateParticipation(player: VirtualPlayer, activity: ActivityConfig): number {
    let participationRate = this.BASE_PARTICIPATION_RATE;
    
    const attractiveness = this.calculateActivityAttractiveness(activity);
    participationRate *= attractiveness;
    
    if (this.hasMatchingTag(player, activity)) {
      participationRate += 0.3;
    }
    
    if (activity.tags.includes('情人节')) {
      const playerTags = this.inferPlayerTags(player);
      if (playerTags.includes('甜宠控')) {
        participationRate *= 1.4;
      }
    }
    
    const fatigueDecay = this.calculateFatigueDecay(player);
    participationRate *= fatigueDecay;
    
    participationRate *= (0.5 + player.activityLevel * 0.5);
    participationRate *= (0.8 + player.satisfaction * 0.2);
    
    return Math.max(0, Math.min(1, participationRate));
  }

  calculateCompletion(player: VirtualPlayer, activity: ActivityConfig): number {
    const participationRate = this.calculateParticipation(player, activity);
    
    const difficultyCompletionFactor = 1 - (activity.difficulty - 1) / 10 * 0.5;
    const activityLevelFactor = 0.5 + player.activityLevel * 0.5;
    
    let completionRate = participationRate * difficultyCompletionFactor * activityLevelFactor;
    
    if (activity.tags.includes('高难度')) {
      if (player.playStyle !== '强度党' && player.spendingLevel !== '神豪') {
        completionRate *= 0.8;
      } else {
        completionRate *= 1.1;
      }
    }
    
    return Math.max(0, Math.min(1, completionRate));
  }

  applyTagEffects(player: VirtualPlayer, activity: ActivityConfig): ActivityEffect {
    const effect: ActivityEffect = {
      dauChange: 0,
      satisfactionChange: 0,
      revenueChange: 0,
      fatigueChange: 0,
    };

    for (const tag of activity.tags) {
      switch (tag) {
        case '高福利':
          effect.satisfactionChange += 5;
          effect.dauChange += 10;
          effect.revenueChange -= 20;
          break;
        case '高难度':
          if (player.playStyle === '强度党' || player.spendingLevel === '重氪' || player.spendingLevel === '神豪') {
            effect.satisfactionChange += 10;
          }
          break;
        case '签到':
          effect.satisfactionChange += 2;
          effect.fatigueChange += 5;
          break;
        case '情人节':
          const playerTags = this.inferPlayerTags(player);
          if (playerTags.includes('甜宠控')) {
            effect.satisfactionChange += 3;
          }
          effect.dauChange += 5;
          break;
        case '周年庆':
          effect.satisfactionChange += 8;
          effect.dauChange += 15;
          effect.revenueChange += 10;
          break;
        case '联动':
          effect.dauChange += 8;
          effect.revenueChange += 5;
          break;
        case '限时':
          effect.dauChange += 5;
          effect.revenueChange += 15;
          effect.fatigueChange += 3;
          break;
      }
    }

    return effect;
  }

  simulatePlayer(player: VirtualPlayer, activity: ActivityConfig): { participated: boolean; completed: boolean } {
    const participationRate = this.calculateParticipation(player, activity);
    const random = Math.random();
    
    const participated = random < participationRate;
    
    if (!participated) {
      return { participated: false, completed: false };
    }
    
    const completionRate = this.calculateCompletion(player, activity);
    const completionRandom = Math.random();
    const completed = completionRandom < completionRate;
    
    return { participated, completed };
  }

  simulateBatch(players: VirtualPlayer[], activity: ActivityConfig): ActivityResult {
    let participants = 0;
    let completions = 0;
    
    const totalEffect: ActivityEffect = {
      dauChange: 0,
      satisfactionChange: 0,
      revenueChange: 0,
      fatigueChange: 0,
    };

    for (const player of players) {
      const result = this.simulatePlayer(player, activity);
      
      if (result.participated) {
        participants++;
        
        if (result.completed) {
          completions++;
        }
        
        const playerEffect = this.applyTagEffects(player, activity);
        
        totalEffect.dauChange += playerEffect.dauChange;
        totalEffect.satisfactionChange += playerEffect.satisfactionChange;
        totalEffect.revenueChange += playerEffect.revenueChange;
        totalEffect.fatigueChange += playerEffect.fatigueChange;
      }
    }

    const averageCompletionRate = participants > 0 ? completions / participants : 0;
    const avgEffect: ActivityEffect = {
      dauChange: participants > 0 ? totalEffect.dauChange / participants : 0,
      satisfactionChange: participants > 0 ? totalEffect.satisfactionChange / participants : 0,
      revenueChange: participants > 0 ? totalEffect.revenueChange / participants : 0,
      fatigueChange: participants > 0 ? totalEffect.fatigueChange / participants : 0,
    };

    return {
      activityId: activity.id,
      participants,
      completions,
      averageCompletionRate,
      effect: avgEffect,
    };
  }
}

export const ActivitySimulatorInstance = new ActivitySimulator();
