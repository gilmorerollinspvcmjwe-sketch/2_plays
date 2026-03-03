import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGameStore, type Character } from './gameStore';

export interface LeaderboardEntry {
  id: string;
  name: string;
  revenue?: number;
  popularity?: number;
  rank: number;
  previousRank: number;
  isPlayer: boolean;
  avatar?: string;
}

export interface LeaderboardState {
  bestsellerList: LeaderboardEntry[];
  popularityRanking: LeaderboardEntry[];
  lastUpdate: string;
}

const COMPETITOR_GAMES_KEY = 'competitor_games';
const COMPETITOR_CHARACTERS_KEY = 'competitor_characters';

interface CompetitorGame {
  id: string;
  name: string;
  revenue: number;
  icon: string;
}

interface CompetitorCharacter {
  id: string;
  name: string;
  popularity: number;
  avatar: string;
  gameId: string;
}

const GAME_NAMES = [
  '恋与制作人',
  '未定事件簿',
  '光与夜之恋',
  '时空中的绘旅人',
  '恋与深空',
  '世界之外',
  '代号：鸢',
  '璀璨星途',
  '筑梦公馆',
  '灵猫传',
  '掌门太忙',
  '梦浮生',
  '花亦山心之月',
  '绝对演绎',
  '璀璨星途'
];

const GAME_ICONS = ['🎮', '💕', '✨', '🌟', '💫', '🌙', '🌸', '💎', '🎀', '💝'];

const CHARACTER_NAMES = [
  '李泽言', '白起', '许墨', '周棋洛', '凌肖',
  '陆景和', '夏鸣星', '左然', '莫弈',
  '陆沉', '查理苏', '齐司礼', '萧逸',
  '艾因', '路辰', '罗夏', '司岚',
  '沈星回', '黎深', '祁煜',
  '夏彦', '左欣然', '莫子昂',
  '姬发', '姬晋', '刘辩',
  '秦彻', '齐飞', '沈既白',
  '安歌', '萧勉', '陆离'
];

const CHARACTER_AVATARS = ['👨', '🧑', '👦', '👔', '🤵', '👨‍💼', '👨‍💻', '🧔', '👨‍🔬', '👨‍🎨'];

function generateCompetitorGames(): CompetitorGame[] {
  const saved = localStorage.getItem(COMPETITOR_GAMES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse competitor games', e);
    }
  }

  const games: CompetitorGame[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 15; i++) {
    let name: string;
    do {
      name = GAME_NAMES[Math.floor(Math.random() * GAME_NAMES.length)];
    } while (usedNames.has(name) && usedNames.size < GAME_NAMES.length);
    usedNames.add(name);

    games.push({
      id: `competitor_game_${i}`,
      name,
      revenue: Math.floor(Math.random() * 9000000) + 1000000,
      icon: GAME_ICONS[Math.floor(Math.random() * GAME_ICONS.length)]
    });
  }

  localStorage.setItem(COMPETITOR_GAMES_KEY, JSON.stringify(games));
  return games;
}

function generateCompetitorCharacters(): CompetitorCharacter[] {
  const saved = localStorage.getItem(COMPETITOR_CHARACTERS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse competitor characters', e);
    }
  }

  const characters: CompetitorCharacter[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 30; i++) {
    let name: string;
    do {
      name = CHARACTER_NAMES[Math.floor(Math.random() * CHARACTER_NAMES.length)];
    } while (usedNames.has(name) && usedNames.size < CHARACTER_NAMES.length);
    usedNames.add(name);

    characters.push({
      id: `competitor_char_${i}`,
      name,
      popularity: Math.floor(Math.random() * 50) + 50,
      avatar: CHARACTER_AVATARS[Math.floor(Math.random() * CHARACTER_AVATARS.length)],
      gameId: `competitor_game_${Math.floor(Math.random() * 15)}`
    });
  }

  localStorage.setItem(COMPETITOR_CHARACTERS_KEY, JSON.stringify(characters));
  return characters;
}

function simulateRevenueChange(games: CompetitorGame[]): CompetitorGame[] {
  return games.map(game => ({
    ...game,
    revenue: Math.max(0, game.revenue + Math.floor((Math.random() - 0.4) * 500000))
  }));
}

function simulatePopularityChange(characters: CompetitorCharacter[]): CompetitorCharacter[] {
  return characters.map(char => ({
    ...char,
    popularity: Math.max(0, Math.min(100, char.popularity + Math.floor((Math.random() - 0.45) * 5)))
  }));
}

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const bestsellerList = ref<LeaderboardEntry[]>([]);
  const popularityRanking = ref<LeaderboardEntry[]>([]);
  const lastUpdate = ref<string>(new Date().toISOString());
  const previousBestsellerRanks = ref<Map<string, number>>(new Map());
  const previousPopularityRanks = ref<Map<string, number>>(new Map());

  const competitorGames = ref<CompetitorGame[]>([]);
  const competitorCharacters = ref<CompetitorCharacter[]>([]);

  function initCompetitorData(): void {
    competitorGames.value = generateCompetitorGames();
    competitorCharacters.value = generateCompetitorCharacters();
  }

  function updateBestsellerList(): void {
    const gameStore = useGameStore();
    const allEntries: LeaderboardEntry[] = [];

    gameStore.publishedGames.forEach(game => {
      allEntries.push({
        id: game.id,
        name: game.title,
        revenue: game.totalRevenue || Math.floor(Math.random() * 500000) + 100000,
        rank: 0,
        previousRank: previousBestsellerRanks.value.get(game.id) || 0,
        isPlayer: true,
        avatar: '🎮'
      });
    });

    competitorGames.value.forEach(game => {
      allEntries.push({
        id: game.id,
        name: game.name,
        revenue: game.revenue,
        rank: 0,
        previousRank: previousBestsellerRanks.value.get(game.id) || 0,
        isPlayer: false,
        avatar: game.icon
      });
    });

    allEntries.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));

    const newPreviousRanks = new Map<string, number>();
    allEntries.forEach((entry, index) => {
      entry.rank = index + 1;
      newPreviousRanks.set(entry.id, entry.rank);
    });

    previousBestsellerRanks.value = newPreviousRanks;
    bestsellerList.value = allEntries.slice(0, 10);
    lastUpdate.value = new Date().toISOString();

    saveToLocal();
  }

  function updatePopularityRanking(): void {
    const gameStore = useGameStore();
    const allEntries: LeaderboardEntry[] = [];

    gameStore.games.forEach(game => {
      game.characters.forEach((char: Character) => {
        allEntries.push({
          id: char.id,
          name: char.name,
          popularity: char.popularity?.popularity || 50,
          rank: 0,
          previousRank: previousPopularityRanks.value.get(char.id) || 0,
          isPlayer: true,
          avatar: char.avatar || '👤'
        });
      });
    });

    competitorCharacters.value.forEach(char => {
      allEntries.push({
        id: char.id,
        name: char.name,
        popularity: char.popularity,
        rank: 0,
        previousRank: previousPopularityRanks.value.get(char.id) || 0,
        isPlayer: false,
        avatar: char.avatar
      });
    });

    allEntries.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    const newPreviousRanks = new Map<string, number>();
    allEntries.forEach((entry, index) => {
      entry.rank = index + 1;
      newPreviousRanks.set(entry.id, entry.rank);
    });

    previousPopularityRanks.value = newPreviousRanks;
    popularityRanking.value = allEntries.slice(0, 20);
    lastUpdate.value = new Date().toISOString();

    saveToLocal();
  }

  function refreshAll(): void {
    competitorGames.value = simulateRevenueChange(competitorGames.value);
    competitorCharacters.value = simulatePopularityChange(competitorCharacters.value);

    localStorage.setItem(COMPETITOR_GAMES_KEY, JSON.stringify(competitorGames.value));
    localStorage.setItem(COMPETITOR_CHARACTERS_KEY, JSON.stringify(competitorCharacters.value));

    updateBestsellerList();
    updatePopularityRanking();
  }

  function getRankChange(entry: LeaderboardEntry): { direction: 'up' | 'down' | 'same'; amount: number } {
    if (entry.previousRank === 0) {
      return { direction: 'same', amount: 0 };
    }

    const diff = entry.previousRank - entry.rank;
    if (diff > 0) {
      return { direction: 'up', amount: diff };
    } else if (diff < 0) {
      return { direction: 'down', amount: Math.abs(diff) };
    }
    return { direction: 'same', amount: 0 };
  }

  function formatRevenue(revenue: number): string {
    if (revenue >= 10000000) {
      return `${(revenue / 10000000).toFixed(2)}千万`;
    } else if (revenue >= 10000) {
      return `${(revenue / 10000).toFixed(1)}万`;
    }
    return revenue.toLocaleString();
  }

  function saveToLocal(): void {
    const data = {
      bestsellerList: bestsellerList.value,
      popularityRanking: popularityRanking.value,
      lastUpdate: lastUpdate.value,
      previousBestsellerRanks: Array.from(previousBestsellerRanks.value.entries()),
      previousPopularityRanks: Array.from(previousPopularityRanks.value.entries())
    };
    localStorage.setItem('leaderboard_data', JSON.stringify(data));
  }

  function loadFromLocal(): void {
    initCompetitorData();

    const saved = localStorage.getItem('leaderboard_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        bestsellerList.value = data.bestsellerList || [];
        popularityRanking.value = data.popularityRanking || [];
        lastUpdate.value = data.lastUpdate || new Date().toISOString();
        previousBestsellerRanks.value = new Map(data.previousBestsellerRanks || []);
        previousPopularityRanks.value = new Map(data.previousPopularityRanks || []);
      } catch (e) {
        console.error('Failed to load leaderboard data', e);
      }
    }

    if (bestsellerList.value.length === 0) {
      updateBestsellerList();
    }
    if (popularityRanking.value.length === 0) {
      updatePopularityRanking();
    }
  }

  function forceRefresh(): void {
    refreshAll();
  }

  loadFromLocal();

  return {
    bestsellerList,
    popularityRanking,
    lastUpdate,
    updateBestsellerList,
    updatePopularityRanking,
    refreshAll,
    getRankChange,
    formatRevenue,
    loadFromLocal,
    forceRefresh
  };
});
