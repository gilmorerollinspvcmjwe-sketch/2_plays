import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usePointsStore } from './points';
import { useGameStore } from './gameStore';
import { useSimulationStore } from './simulationStore';

export interface FanCreation {
  id: string;
  type: 'fanfic' | 'fanart' | 'emoji';
  characterId: string;
  characterName: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  likes: number;
  collections: number;
  createdAt: string;
  isLiked?: boolean;
  isCollected?: boolean;
}

export const COST_MAP: Record<'fanfic' | 'fanart' | 'emoji', number> = {
  fanfic: 20,
  fanart: 50,
  emoji: 10
};

export const TYPE_NAMES: Record<'fanfic' | 'fanart' | 'emoji', string> = {
  fanfic: '同人文',
  fanart: '同人图',
  emoji: '表情包'
};

// 模拟类型到UI类型的映射
const SIM_TO_UI_TYPE: Record<string, 'fanfic' | 'fanart' | 'emoji'> = {
  '文稿': 'fanfic',
  '绘画': 'fanart',
  '表情包': 'emoji',
  '视频': 'fanart',
  '音乐': 'fanfic'
};

export const useFanCreationStore = defineStore('fanCreation', () => {
  // 引入 simulationStore
  const simulationStore = useSimulationStore();
  
  // 本地存储用户创作
  const userCreations = ref<FanCreation[]>([]);
  
  // 从 simulationStore 获取模拟同人，并转换格式
  const simulatedCreations = computed<FanCreation[]>(() => {
    return simulationStore.recentFanworks.map(f => ({
      id: f.id,
      type: SIM_TO_UI_TYPE[f.type] || 'fanfic',
      characterId: f.relatedCharacters[0] || 'char_1',
      characterName: f.relatedCharacters[0] || '霸道总裁 - 陆沉',
      content: f.content,
      imageUrl: f.type === '绘画' ? `https://picsum.photos/400/300?random=${f.id.slice(-5)}` : undefined,
      authorId: f.playerId,
      authorName: `同人作者_${f.playerId.slice(-4)}`,
      likes: f.likes,
      collections: Math.floor(f.likes * 0.3),
      createdAt: new Date(f.timestamp).toISOString(),
      isLiked: false,
      isCollected: false
    }));
  });
  
  // 合并模拟创作和用户创作
  const creations = computed<FanCreation[]>(() => {
    return [...simulatedCreations.value, ...userCreations.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  const fanfics = computed(() => {
    return creations.value
      .filter(c => c.type === 'fanfic')
      .sort((a, b) => b.likes - a.likes);
  });

  const fanarts = computed(() => {
    return creations.value
      .filter(c => c.type === 'fanart')
      .sort((a, b) => b.likes - a.likes);
  });

  const emojis = computed(() => {
    return creations.value
      .filter(c => c.type === 'emoji')
      .sort((a, b) => b.likes - a.likes);
  });

  const getCreationsByType = (type: 'fanfic' | 'fanart' | 'emoji') => {
    return creations.value.filter(c => c.type === type);
  };

  const getCreationsByCharacter = (characterId: string) => {
    return creations.value.filter(c => c.characterId === characterId);
  };

  async function createFanCreation(
    type: 'fanfic' | 'fanart' | 'emoji',
    characterId: string,
    characterName: string,
    content: string,
    authorId: string,
    authorName: string,
    imageUrl?: string
  ): Promise<{ success: boolean; message: string; creation?: FanCreation }> {
    const pointsStore = usePointsStore();
    const gameStore = useGameStore();
    const cost = COST_MAP[type];

    if (pointsStore.balance < cost) {
      return { success: false, message: `积分不足，需要${cost}积分` };
    }

    const spendResult = await pointsStore.spendPoints(cost, `创作${TYPE_NAMES[type]}`);
    if (!spendResult.success) {
      return { success: false, message: spendResult.message };
    }

    const creation: FanCreation = {
      id: `creation_${Date.now()}`,
      type,
      characterId,
      characterName,
      content,
      imageUrl,
      authorId,
      authorName,
      likes: 0,
      collections: 0,
      createdAt: new Date().toISOString(),
      isLiked: false,
      isCollected: false
    };

    userCreations.value.unshift(creation);
    
    gameStore.updateCharacterPopularity(characterId, { 
      popularity: 2,
      discussionHeat: 10 
    });
    
    await pointsStore.unlockAchievement('first_creation');
    
    saveToLocal();

    return { success: true, message: `${TYPE_NAMES[type]}创作成功！`, creation };
  }

  async function likeCreation(creationId: string, userId: string): Promise<{ success: boolean; message: string }> {
    // 先查找用户创作
    let creation = userCreations.value.find(c => c.id === creationId);
    let isUserCreation = true;
    
    // 如果不在用户创作中，查找模拟创作
    if (!creation) {
      creation = simulatedCreations.value.find(c => c.id === creationId);
      isUserCreation = false;
    }
    
    if (!creation) {
      return { success: false, message: '作品不存在' };
    }

    const gameStore = useGameStore();

    if (creation.isLiked) {
      creation.likes = Math.max(0, creation.likes - 1);
      creation.isLiked = false;
    } else {
      creation.likes++;
      creation.isLiked = true;

      gameStore.updateCharacterPopularity(creation.characterId, { 
        popularity: 0.3 
      });

      if (creation.likes % 10 === 0 && creation.authorId !== userId) {
        const pointsStore = usePointsStore();
        await pointsStore.unlockAchievement('hot_creation');
      }
    }

    saveToLocal();
    return { success: true, message: creation.isLiked ? '点赞成功' : '取消点赞' };
  }

  async function collectCreation(creationId: string): Promise<{ success: boolean; message: string }> {
    // 只能收藏用户创作
    const creation = userCreations.value.find(c => c.id === creationId);
    if (!creation) {
      return { success: false, message: '作品不存在或无法收藏' };
    }

    if (creation.isCollected) {
      creation.collections = Math.max(0, creation.collections - 1);
      creation.isCollected = false;
    } else {
      creation.collections++;
      creation.isCollected = true;
    }

    saveToLocal();
    return { success: true, message: creation.isCollected ? '收藏成功' : '取消收藏' };
  }

  function generateMockCreations(count: number = 15): void {
    const gameStore = useGameStore();
    const currentGame = gameStore.currentGame;
    
    const mockCharacters = currentGame && currentGame.characters.length > 0
      ? currentGame.characters
      : [
          { id: 'char_1', name: '霸道总裁 - 陆沉' },
          { id: 'char_2', name: '温柔学长 - 许墨' },
          { id: 'char_3', name: '阳光少年 - 白起' },
          { id: 'char_4', name: '神秘特工 - 李泽言' }
        ];

    const mockAuthors = [
      '画手小A', '文手大B', '同人画师', '乙女创作者', 'CP粉头',
      '同人太太', '产粮机', '神仙画手', '宝藏作者', '肝帝'
    ];

    const mockFanfics = [
      '【甜文】雨夜的告白\n\n窗外的雨淅淅沥沥，他轻轻握住我的手...\n\n"我喜欢你，从很久以前就喜欢了。"\n\n这一刻，时间仿佛静止...',
      '【虐文】最后的告别\n\n"对不起，我不能陪你了。"\n\n他的背影渐渐远去，泪水模糊了我的视线...',
      '【日常】周末的约会\n\n阳光正好，他牵着我在公园里漫步...\n\n"今天的你，格外美丽。"',
      '【穿越】异世界的相遇\n\n睁开眼，发现自己穿越到了游戏世界...\n\n而他，正站在我面前，微笑着伸出手。',
      '【AU】校园恋爱\n\n他是学校里最受欢迎的学长，而我只是普通的学妹...\n\n直到那一天，我们在图书馆相遇了。'
    ];

    const mockFanarts = [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=2',
      'https://picsum.photos/400/300?random=3',
      'https://picsum.photos/400/300?random=4',
      'https://picsum.photos/400/300?random=5'
    ];

    const mockEmojis = [
      '[爱你] ❤️💕',
      '[生气] 😤💢',
      '[害羞] 😳🌸',
      '[开心] 🥰✨',
      '[哭泣] 😭💧',
      '[震惊] 😱❗',
      '[思考] 🤔💭',
      '[晚安] 😴🌙'
    ];

    const types: ('fanfic' | 'fanart' | 'emoji')[] = ['fanfic', 'fanart', 'emoji'];

    for (let i = 0; i < count; i++) {
      const type = types[i % 3];
      const character = mockCharacters[Math.floor(Math.random() * mockCharacters.length)];
      const author = mockAuthors[Math.floor(Math.random() * mockAuthors.length)];
      
      let content = '';
      let imageUrl: string | undefined;

      if (type === 'fanfic') {
        content = mockFanfics[Math.floor(Math.random() * mockFanfics.length)];
      } else if (type === 'fanart') {
        imageUrl = mockFanarts[Math.floor(Math.random() * mockFanarts.length)];
        content = `${character.name}同人图 - ${author}作品`;
      } else {
        content = mockEmojis[Math.floor(Math.random() * mockEmojis.length)];
      }

      const likes = Math.floor(Math.random() * 500);
      const collections = Math.floor(Math.random() * 100);

      const creation: FanCreation = {
        id: `creation_mock_${Date.now()}_${i}`,
        type,
        characterId: character.id,
        characterName: character.name,
        content,
        imageUrl,
        authorId: `author_${i}`,
        authorName: author,
        likes,
        collections,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        isLiked: false,
        isCollected: false
      };

      userCreations.value.push(creation);
    }

    saveToLocal();
  }

  function deleteCreation(creationId: string): boolean {
    // 只能删除用户创作
    const index = userCreations.value.findIndex(c => c.id === creationId);
    if (index === -1) return false;
    
    userCreations.value.splice(index, 1);
    saveToLocal();
    return true;
  }

  function saveToLocal(): void {
    localStorage.setItem('fan_creation_data', JSON.stringify({
      userCreations: userCreations.value
    }));
  }

  function loadFromLocal(): void {
    const saved = localStorage.getItem('fan_creation_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        userCreations.value = data.userCreations || [];
      } catch (e) {
        console.error('加载同人创作数据失败:', e);
      }
    }
  }

  loadFromLocal();

  return {
    creations,
    fanfics,
    fanarts,
    emojis,
    createFanCreation,
    likeCreation,
    collectCreation,
    getCreationsByType,
    getCreationsByCharacter,
    generateMockCreations,
    deleteCreation,
    saveToLocal,
    loadFromLocal
  };
});
