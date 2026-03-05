/**
 * 角色价值计算引擎
 * 计算角色人气、商业价值、CP热度等
 */

import { CharacterBalanceConfig } from '@/config/gameBalance';
import type { Character } from '@/types/character';

// 角色价值结果
export interface CharacterValueResult {
  popularity: number;        // 人气值 0-100
  commercialValue: number;   // 商业价值 0-100
  cpValue: number;          // CP价值 0-100
  plotCapacity: number;     // 剧情承载力 0-100
  overall: number;          // 综合价值 0-100
  suggestions: string[];    // 优化建议
}

// 角色人气指标
export interface PopularityMetrics {
  baseScore: number;
  plotExposure: number;      // 剧情曝光度
  gachaExposure: number;     // 卡池抽取次数
  socialMentions: number;    // 社交提及次数
  playerInteractions: number; // 玩家互动次数
}

// CP热度
export interface CPHeat {
  characterId1: string;
  characterId2: string;
  heatScore: number;
  interactionQuality: number;
  fanVotes: number;
}

export class CharacterValueEngine {
  // 计算角色价值
  calculateCharacterValue(
    character: Character,
    metrics: PopularityMetrics,
    cpData?: CPHeat[]
  ): CharacterValueResult {
    const popularity = this.calculatePopularity(metrics);
    const commercialValue = this.calculateCommercialValue(popularity, metrics);
    const cpValue = this.calculateCPValue(character.id, cpData || []);
    const plotCapacity = this.calculatePlotCapacity(character);

    const overall = this.calculateOverallValue({
      popularity,
      commercialValue,
      cpValue,
      plotCapacity
    });

    const suggestions = this.generateValueSuggestions({
      popularity,
      commercialValue,
      cpValue,
      plotCapacity
    });

    return {
      popularity,
      commercialValue,
      cpValue,
      plotCapacity,
      overall,
      suggestions
    };
  }

  // 计算人气值
  private calculatePopularity(metrics: PopularityMetrics): number {
    const weights = CharacterBalanceConfig.popularity;
    
    // 归一化各项指标
    const plotScore = Math.min(100, metrics.plotExposure * weights.plotExposureWeight);
    const gachaScore = Math.min(100, metrics.gachaExposure * weights.gachaExposureWeight);
    const socialScore = Math.min(100, metrics.socialMentions * weights.socialMentionWeight);
    const interactionScore = Math.min(100, metrics.playerInteractions * weights.playerInteractionWeight);
    
    // 加权计算
    const popularity = weights.baseScore + 
      plotScore * weights.plotExposureWeight +
      gachaScore * weights.gachaExposureWeight +
      socialScore * weights.socialMentionWeight +
      interactionScore * weights.playerInteractionWeight;
    
    return Math.min(100, Math.max(0, popularity));
  }

  // 计算商业价值
  private calculateCommercialValue(popularity: number, metrics: PopularityMetrics): number {
    const weights = CharacterBalanceConfig.commercial;
    
    // 付费转化率（基于卡池抽取）
    const conversionRate = metrics.gachaExposure > 0 
      ? Math.min(1, metrics.gachaExposure / 1000) 
      : 0;
    
    // 周边开发潜力（基于人气和社交热度）
    const merchandisePotential = (popularity + Math.min(100, metrics.socialMentions)) / 2;
    
    const commercialValue = 
      popularity * weights.popularityWeight +
      conversionRate * 100 * weights.conversionWeight +
      merchandisePotential * weights.merchandiseWeight;
    
    return Math.min(100, Math.max(0, commercialValue));
  }

  // 计算CP价值
  private calculateCPValue(characterId: string, cpData: CPHeat[]): number {
    if (cpData.length === 0) return 30; // 基础值
    
    // 找到该角色参与的所有CP
    const characterCPs = cpData.filter(
      cp => cp.characterId1 === characterId || cp.characterId2 === characterId
    );
    
    if (characterCPs.length === 0) return 30;
    
    // 计算平均CP热度
    const avgHeat = characterCPs.reduce((sum, cp) => sum + cp.heatScore, 0) / characterCPs.length;
    
    // 找到最热门的CP
    const maxHeat = Math.max(...characterCPs.map(cp => cp.heatScore));
    
    // 综合计算
    return Math.min(100, avgHeat * 0.6 + maxHeat * 0.4);
  }

  // 计算剧情承载力
  private calculatePlotCapacity(character: Character): number {
    let capacity = 50; // 基础值
    
    // 性格复杂度加成
    if (character.personality && character.personality.length > 0) {
      capacity += Math.min(20, character.personality.length * 5);
    }
    
    // 背景故事加成
    if (character.background) {
      capacity += 15;
    }
    
    // 羁绊系统加成
    if (character.bondLevel && character.bondLevel > 0) {
      capacity += Math.min(15, character.bondLevel * 3);
    }
    
    return Math.min(100, capacity);
  }

  // 计算综合价值
  private calculateOverallValue(values: {
    popularity: number;
    commercialValue: number;
    cpValue: number;
    plotCapacity: number;
  }): number {
    // 加权平均
    const overall = 
      values.popularity * 0.35 +
      values.commercialValue * 0.30 +
      values.cpValue * 0.20 +
      values.plotCapacity * 0.15;
    
    return Math.round(overall);
  }

  // 生成优化建议
  private generateValueSuggestions(values: {
    popularity: number;
    commercialValue: number;
    cpValue: number;
    plotCapacity: number;
  }): string[] {
    const suggestions: string[] = [];
    
    if (values.popularity < 40) {
      suggestions.push('人气偏低，建议增加剧情曝光和卡池UP频率');
    }
    
    if (values.commercialValue < 40) {
      suggestions.push('商业价值不足，建议优化付费点设计和周边开发');
    }
    
    if (values.cpValue < 40) {
      suggestions.push('CP热度较低，建议增加与其他角色的互动剧情');
    }
    
    if (values.plotCapacity < 50) {
      suggestions.push('剧情承载力有限，建议丰富角色背景和性格设定');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('角色整体表现良好，继续保持当前运营策略');
    }
    
    return suggestions;
  }

  // 计算角色排名
  calculateCharacterRanking(
    characters: Character[],
    allMetrics: Map<string, PopularityMetrics>,
    allCPData: CPHeat[]
  ): { character: Character; value: CharacterValueResult; rank: number }[] {
    const results = characters.map(char => {
      const metrics = allMetrics.get(char.id) || {
        baseScore: 30,
        plotExposure: 0,
        gachaExposure: 0,
        socialMentions: 0,
        playerInteractions: 0
      };
      
      const value = this.calculateCharacterValue(char, metrics, allCPData);
      return { character: char, value, rank: 0 };
    });
    
    // 按综合价值排序
    results.sort((a, b) => b.value.overall - a.value.overall);
    
    // 设置排名
    results.forEach((result, index) => {
      result.rank = index + 1;
    });
    
    return results;
  }

  // 预测角色价值趋势
  predictValueTrend(
    currentValue: CharacterValueResult,
    plannedActions: string[]
  ): { trend: 'up' | 'stable' | 'down'; predictedValue: number; confidence: number } {
    let trendScore = 0;
    
    plannedActions.forEach(action => {
      switch (action) {
        case 'increase_plot':
          trendScore += 10;
          break;
        case 'gacha_up':
          trendScore += 15;
          break;
        case 'social_campaign':
          trendScore += 8;
          break;
        case 'cp_event':
          trendScore += 12;
          break;
        case 'merchandise':
          trendScore += 5;
          break;
      }
    });
    
    const predictedValue = Math.min(100, currentValue.overall + trendScore);
    const confidence = Math.min(0.9, 0.5 + plannedActions.length * 0.1);
    
    let trend: 'up' | 'stable' | 'down' = 'stable';
    if (predictedValue > currentValue.overall + 5) {
      trend = 'up';
    } else if (predictedValue < currentValue.overall - 5) {
      trend = 'down';
    }
    
    return { trend, predictedValue, confidence };
  }
}

// 单例导出
export const characterValueEngine = new CharacterValueEngine();
