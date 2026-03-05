/**
 * 玩家社区 Store
 * 整合玩家分群数据和社区统计信息
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usePlayerStore } from './playerStore';
import { useSimulationStore } from './simulationStore';
import {
  type PlayerCommunity,
  type PlayerSegmentType,
  type HotTopic,
  PLAYER_SEGMENTS,
  calculateSatisfaction
} from '@/types/playerSegments';

export const useCommunityStore = defineStore('community', () => {
  const communityData = ref<PlayerCommunity | null>(null);
  const history = ref<PlayerCommunity[]>([]);

  const playerStore = usePlayerStore();
  const simulationStore = useSimulationStore();

  const isInitialized = computed(() => communityData.value !== null);

  function initializeCommunity() {
    const playerStats = playerStore.getPlayerStateStats();
    const totalPlayers = playerStore.players.length;

    if (totalPlayers === 0) {
      communityData.value = {
        segments: [],
        totalPlayers: 0,
        overallSatisfaction: 0,
        overallSentiment: 0,
        hotTopics: [],
        activeRate: 0,
        retentionRate: 0
      };
      return;
    }

    const segments = PLAYER_SEGMENTS.map(seg => {
      const count = Math.floor(totalPlayers * seg.defaultRatio);
      const satisfaction = 70 + Math.floor(Math.random() * 20) - 10;
      const sentiment = (Math.random() * 0.4 - 0.2).toFixed(2);

      return {
        type: seg.type,
        count,
        satisfaction,
        sentiment: parseFloat(sentiment)
      };
    });

    const overallSatisfaction = calculateSatisfaction(
      {
        segments,
        totalPlayers,
        overallSatisfaction: 0,
        overallSentiment: 0,
        hotTopics: [],
        activeRate: 0,
        retentionRate: 0
      },
      {
        plotQuality: 0.7,
        visualQuality: 0.75,
        gachaFairness: 0.6,
        welfareLevel: 0.65,
        characterBalance: 0.7
      }
    );

    const overallSentiment = segments.reduce((sum, seg) => sum + seg.sentiment, 0) / segments.length;

    const activeRate = playerStats.ACTIVE / totalPlayers;
    const retentionRate = (playerStats.ACTIVE + playerStats.PAYING + playerStats.RETURNED) / totalPlayers;

    const hotTopics = generateHotTopics(segments);

    communityData.value = {
      segments,
      totalPlayers,
      overallSatisfaction,
      overallSentiment,
      hotTopics,
      activeRate,
      retentionRate
    };
  }

  function generateHotTopics(segments: PlayerCommunity['segments']): HotTopic[] {
    const topics: HotTopic[] = [];
    const topicTemplates = [
      {
        title: '新卡池爆率引发热议',
        type: 'controversial' as const,
        segments: ['power', 'f2p'] as PlayerSegmentType[]
      },
      {
        title: '最新剧情糖度超标，CP 党狂喜',
        type: 'positive' as const,
        segments: ['cp', 'story'] as PlayerSegmentType[]
      },
      {
        title: '新立绘质量下滑？颜值党不满',
        type: 'negative' as const,
        segments: ['visual'] as PlayerSegmentType[]
      },
      {
        title: '周年庆福利前瞻，期待值拉满',
        type: 'positive' as const,
        segments: ['f2p', 'whale'] as PlayerSegmentType[]
      },
      {
        title: '某角色戏份过少，单推人抗议',
        type: 'negative' as const,
        segments: ['solo'] as PlayerSegmentType[]
      }
    ];

    topicTemplates.forEach((template, index) => {
      if (Math.random() > 0.3) {
        topics.push({
          id: `topic_${Date.now()}_${index}`,
          title: template.title,
          type: template.type,
          heat: Math.floor(Math.random() * 40) + 60,
          participants: Math.floor(Math.random() * 500) + 100,
          relatedSegments: template.segments,
          createdAt: new Date().toISOString(),
          isTrending: template.type === 'controversial' || Math.random() > 0.6
        });
      }
    });

    return topics.sort((a, b) => b.heat - a.heat).slice(0, 5);
  }

  function updateCommunityData() {
    if (!communityData.value) return;

    const playerStats = playerStore.getPlayerStateStats();
    const totalPlayers = playerStore.players.length;

    if (totalPlayers === 0) return;

    communityData.value.segments.forEach(seg => {
      seg.satisfaction = Math.max(0, Math.min(100, seg.satisfaction + (Math.random() * 4 - 2)));
      seg.sentiment = Math.max(-1, Math.min(1, seg.sentiment + (Math.random() * 0.1 - 0.05)));
    });

    communityData.value.totalPlayers = totalPlayers;
    communityData.value.overallSatisfaction = calculateSatisfaction(
      communityData.value,
      {
        plotQuality: 0.7 + Math.random() * 0.1,
        visualQuality: 0.75 + Math.random() * 0.1,
        gachaFairness: 0.6 + Math.random() * 0.1,
        welfareLevel: 0.65 + Math.random() * 0.1,
        characterBalance: 0.7 + Math.random() * 0.1
      }
    );
    communityData.value.overallSentiment = communityData.value.segments.reduce(
      (sum, seg) => sum + seg.sentiment,
      0
    ) / communityData.value.segments.length;
    communityData.value.activeRate = playerStats.ACTIVE / totalPlayers;
    communityData.value.retentionRate =
      (playerStats.ACTIVE + playerStats.PAYING + playerStats.RETURNED) / totalPlayers;

    if (Math.random() > 0.7) {
      communityData.value.hotTopics = generateHotTopics(communityData.value.segments);
    }

    history.value.push({ ...communityData.value });
    if (history.value.length > 30) {
      history.value.shift();
    }
  }

  function getSegmentStrategy(segmentType: PlayerSegmentType): string {
    const strategies: Record<PlayerSegmentType, string> = {
      story: '📖 剧情党：建议增加高质量剧情内容，注重人物塑造和剧情逻辑，可推出剧情 skip 功能和角色语音收藏',
      visual: '🎨 颜值党：建议提升美术质量，推出精美卡面和立绘，增加相册系统和壁纸分享功能',
      power: '⚔️ 强度党：建议优化数值平衡，提高爆率透明度，推出强度排行榜和配队推荐',
      whale: '💎 氪金党：建议推出限定内容和专属福利，增加 VIP 特权和个性化定制服务',
      f2p: '🎁 白嫖党：建议增加免费福利和日常奖励，降低活动门槛，增加可玩性内容',
      cp: '💕 CP 党：建议增加角色互动内容，推出 CP 专属剧情和活动，增加社区二创支持',
      solo: '⭐ 单推人：建议保证各角色戏份平衡，推出角色专属内容和周边，增加角色投票活动'
    };
    return strategies[segmentType];
  }

  function getAllStrategies(): { type: PlayerSegmentType; name: string; strategy: string }[] {
    return PLAYER_SEGMENTS.map(seg => ({
      type: seg.type,
      name: seg.name,
      strategy: getSegmentStrategy(seg.type)
    }));
  }

  // 从玩家数据更新社区统计
  function updateFromPlayers(players: any[]) {
    if (!players || players.length === 0) return;

    const totalPlayers = players.length;
    const playerStats = playerStore.getPlayerStateStats();

    // 更新各分群数据
    const segments = PLAYER_SEGMENTS.map(seg => {
      let count = 0;
      switch (seg.type) {
        case 'story':
        case 'visual':
        case 'power':
        case 'whale':
        case 'f2p':
        case 'cp':
        case 'solo':
          count = Math.floor(totalPlayers * seg.defaultRatio);
          break;
      }

      return {
        type: seg.type,
        count,
        satisfaction: 70 + Math.floor(Math.random() * 20) - 10,
        sentiment: parseFloat((Math.random() * 0.4 - 0.2).toFixed(2))
      };
    });

    // 更新社区数据
    if (communityData.value) {
      communityData.value.segments = segments;
      communityData.value.totalPlayers = totalPlayers;
      communityData.value.activeRate = playerStats.ACTIVE / totalPlayers;
      communityData.value.retentionRate =
        (playerStats.ACTIVE + playerStats.PAYING + playerStats.RETURNED) / totalPlayers;
    } else {
      // 如果社区数据未初始化，先初始化
      initializeCommunity();
    }
  }

  return {
    communityData,
    history,
    isInitialized,
    initializeCommunity,
    updateCommunityData,
    getSegmentStrategy,
    getAllStrategies,
    updateFromPlayers
  };
});
