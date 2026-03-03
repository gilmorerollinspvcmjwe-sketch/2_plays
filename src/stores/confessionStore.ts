import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usePointsStore } from './points';
import { useGameStore } from './gameStore';

export interface Confession {
  id: string;
  characterId: string;
  characterName: string;
  content: string;
  authorId: string;
  authorName: string;
  likes: number;
  heat: number;
  createdAt: string;
  isHot: boolean;
  isLiked?: boolean;
}

export const useConfessionStore = defineStore('confession', () => {
  const confessions = ref<Confession[]>([]);
  const hotThreshold = 100;

  const hotConfessions = computed(() => {
    return confessions.value
      .filter(c => c.heat >= hotThreshold || c.isHot)
      .sort((a, b) => b.heat - a.heat)
      .slice(0, 10);
  });

  const recentConfessions = computed(() => {
    return [...confessions.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  const getConfessionsByCharacter = (characterId: string) => {
    return confessions.value.filter(c => c.characterId === characterId);
  };

  async function postConfession(
    characterId: string,
    characterName: string,
    content: string,
    authorId: string,
    authorName: string
  ): Promise<{ success: boolean; message: string; confession?: Confession }> {
    if (!content.trim()) {
      return { success: false, message: '告白内容不能为空' };
    }

    const pointsStore = usePointsStore();
    const gameStore = useGameStore();
    const cost = 10;

    if (pointsStore.balance < cost) {
      return { success: false, message: `积分不足，需要${cost}积分` };
    }

    const spendResult = await pointsStore.spendPoints(cost, '发布告白');
    if (!spendResult.success) {
      return { success: false, message: spendResult.message };
    }

    const confession: Confession = {
      id: `confession_${Date.now()}`,
      characterId,
      characterName,
      content: content.trim(),
      authorId,
      authorName,
      likes: 0,
      heat: 0,
      createdAt: new Date().toISOString(),
      isHot: false,
      isLiked: false
    };

    confessions.value.unshift(confession);
    
    gameStore.updateCharacterPopularity(characterId, { 
      popularity: 1,
      discussionHeat: 5 
    });
    
    await pointsStore.unlockAchievement('first_confession');
    
    saveToLocal();

    return { success: true, message: '告白发布成功！', confession };
  }

  async function likeConfession(confessionId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const confession = confessions.value.find(c => c.id === confessionId);
    if (!confession) {
      return { success: false, message: '告白不存在' };
    }

    const gameStore = useGameStore();

    if (confession.isLiked) {
      confession.likes = Math.max(0, confession.likes - 1);
      confession.heat = Math.max(0, confession.heat - 1);
      confession.isLiked = false;
    } else {
      confession.likes++;
      confession.heat++;
      confession.isLiked = true;

      if (confession.heat >= hotThreshold) {
        confession.isHot = true;
      }

      gameStore.updateCharacterPopularity(confession.characterId, { 
        popularity: 0.5 
      });

      if (confession.likes % 10 === 0 && confession.authorId !== userId) {
        const pointsStore = usePointsStore();
        await pointsStore.unlockAchievement('hot_confession');
      }
    }

    saveToLocal();
    return { success: true, message: confession.isLiked ? '点赞成功' : '取消点赞' };
  }

  function generateMockConfessions(count: number = 20): void {
    const gameStore = useGameStore();
    const currentGame = gameStore.currentGame;
    
    if (!currentGame || currentGame.characters.length === 0) {
      const mockCharacters = [
        { id: 'char_1', name: '霸道总裁 - 陆沉' },
        { id: 'char_2', name: '温柔学长 - 许墨' },
        { id: 'char_3', name: '阳光少年 - 白起' },
        { id: 'char_4', name: '神秘特工 - 李泽言' }
      ];

      const mockAuthors = [
        '小可爱', '迷妹一号', '乙女玩家', '恋爱脑', '追星少女',
        '游戏达人', '剧情党', '氪金大佬', '白嫖党', '佛系玩家'
      ];

      const mockContents = [
        '你是我的星辰大海，是我追逐的光芒✨',
        '每次看到你的笑容，心跳都会漏一拍💓',
        '愿用一生的时间，换你一次回眸',
        '你是我心中最温柔的秘密🌸',
        '在这个虚拟的世界里，你是我最真实的牵挂',
        '你的每一句话，都是我收藏的宝藏',
        '遇见你，是我最美的意外💫',
        '你是我的白月光，照亮了我的世界',
        '为你氪金，我心甘情愿💰',
        '你的声音，是我最爱的旋律🎵',
        '每次抽卡都希望能遇见你',
        '你的故事，我愿意一遍遍重温',
        '你是我的专属浪漫🌹',
        '在这个平行时空里，我们相遇了',
        '你的温柔，是我最深的眷恋'
      ];

      for (let i = 0; i < count; i++) {
        const character = mockCharacters[Math.floor(Math.random() * mockCharacters.length)];
        const author = mockAuthors[Math.floor(Math.random() * mockAuthors.length)];
        const content = mockContents[Math.floor(Math.random() * mockContents.length)];
        
        const likes = Math.floor(Math.random() * 200);
        const heat = likes + Math.floor(Math.random() * 50);
        
        const confession: Confession = {
          id: `confession_mock_${Date.now()}_${i}`,
          characterId: character.id,
          characterName: character.name,
          content,
          authorId: `author_${i}`,
          authorName: author,
          likes,
          heat,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          isHot: heat >= hotThreshold,
          isLiked: false
        };

        confessions.value.push(confession);
      }
    } else {
      const characters = currentGame.characters;
      const mockAuthors = [
        '小可爱', '迷妹一号', '乙女玩家', '恋爱脑', '追星少女',
        '游戏达人', '剧情党', '氪金大佬', '白嫖党', '佛系玩家'
      ];

      const mockContents = [
        '你是我的星辰大海，是我追逐的光芒✨',
        '每次看到你的笑容，心跳都会漏一拍💓',
        '愿用一生的时间，换你一次回眸',
        '你是我心中最温柔的秘密🌸',
        '在这个虚拟的世界里，你是我最真实的牵挂',
        '你的每一句话，都是我收藏的宝藏',
        '遇见你，是我最美的意外💫',
        '你是我的白月光，照亮了我的世界',
        '为你氪金，我心甘情愿💰',
        '你的声音，是我最爱的旋律🎵',
        '每次抽卡都希望能遇见你',
        '你的故事，我愿意一遍遍重温',
        '你是我的专属浪漫🌹',
        '在这个平行时空里，我们相遇了',
        '你的温柔，是我最深的眷恋'
      ];

      for (let i = 0; i < count; i++) {
        const character = characters[Math.floor(Math.random() * characters.length)];
        const author = mockAuthors[Math.floor(Math.random() * mockAuthors.length)];
        const content = mockContents[Math.floor(Math.random() * mockContents.length)];
        
        const likes = Math.floor(Math.random() * 200);
        const heat = likes + Math.floor(Math.random() * 50);
        
        const confession: Confession = {
          id: `confession_mock_${Date.now()}_${i}`,
          characterId: character.id,
          characterName: character.name,
          content,
          authorId: `author_${i}`,
          authorName: author,
          likes,
          heat,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          isHot: heat >= hotThreshold,
          isLiked: false
        };

        confessions.value.push(confession);
      }
    }

    saveToLocal();
  }

  function deleteConfession(confessionId: string): boolean {
    const index = confessions.value.findIndex(c => c.id === confessionId);
    if (index === -1) return false;
    
    confessions.value.splice(index, 1);
    saveToLocal();
    return true;
  }

  function saveToLocal(): void {
    localStorage.setItem('confession_data', JSON.stringify({
      confessions: confessions.value
    }));
  }

  function loadFromLocal(): void {
    const saved = localStorage.getItem('confession_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        confessions.value = data.confessions || [];
      } catch (e) {
        console.error('加载告白数据失败:', e);
      }
    }
  }

  loadFromLocal();

  return {
    confessions,
    hotConfessions,
    recentConfessions,
    hotThreshold,
    postConfession,
    likeConfession,
    getConfessionsByCharacter,
    generateMockConfessions,
    deleteConfession,
    saveToLocal,
    loadFromLocal
  };
});
