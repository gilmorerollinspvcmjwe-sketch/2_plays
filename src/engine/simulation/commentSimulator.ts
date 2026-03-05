import { VirtualPlayer } from './types';
import { ContentTag, ActivityTag } from './tagSystem';

export type Platform = 'taptap' | 'appstore' | 'weibo' | 'bilibili' | 'xiaohongshu';

export interface PlatformComment {
  id: string;
  platform: Platform;
  playerId: string;
  content: string;
  rating?: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  relatedTags: string[];
  timestamp: number;
}

export interface PlatformStatistics {
  totalComments: number;
  byPlatform: Record<Platform, number>;
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  averageRating: number;
  ratingByPlatform: Record<Platform, number>;
}

export const PLATFORM_CONFIG: Record<Platform, {
  ratingRange: [number, number];
  contentLength: [number, number];
  mainUserTypes: string[];
  weight: number;
}> = {
  taptap: { ratingRange: [1, 10], contentLength: [50, 500], mainUserTypes: ['剧情党', '强度党'], weight: 0.3 },
  appstore: { ratingRange: [1, 5], contentLength: [10, 100], mainUserTypes: ['所有'], weight: 0.2 },
  weibo: { ratingRange: [0, 100], contentLength: [10, 200], mainUserTypes: ['社交党'], weight: 0.2 },
  bilibili: { ratingRange: [0, 1000000], contentLength: [20, 300], mainUserTypes: ['XP党'], weight: 0.15 },
  xiaohongshu: { ratingRange: [0, 10000], contentLength: [30, 300], mainUserTypes: ['颜狗'], weight: 0.15 }
};

interface CommentTemplate {
  positive: string[];
  neutral: string[];
  negative: string[];
}

const COMMENT_TEMPLATES: Record<Platform, CommentTemplate> = {
  taptap: {
    positive: [
      '剧情太精彩了！{tag}线哭得稀里哗啦的，强烈推荐！',
      '角色{tag}太香了，画风配音都是顶级，不愧是大制作！',
      '玩了这么多游戏，这个游戏的{tag}元素是最对我胃口的，良心之作！',
      '从开服玩到现在，每次更新都有惊喜，{tag}yyds！',
      '谁懂啊家人们，{tag}也太上头了吧，根本停不下来！'
    ],
    neutral: [
      '整体还行吧，{tag}方面中规中矩，玩起来打发时间还不错。',
      '游戏体验一般，{tag}部分感觉可以做得更好，不过总体能玩。',
      '刚开始玩，感觉还可以吧，{tag}这块儿有待加强。',
      '玩了一段时间了，{tag}方面无功无过，符合预期。',
      '中规中矩的作品，{tag}一般般，别的方面还行。'
    ],
    negative: [
      '{tag}剧情太拉胯了，玩得我尴尬症都犯了，差评！',
      '氪金点太多了吧，{tag}体验极差，肝不动了。',
      'bug太多了，{tag}内容经常闪退，客服也不理人，卸载了。',
      '画饼充饥呢？{tag}承诺的一个都没实现，欺骗玩家？',
      '玩了两天就腻了，{tag}内容太单调了，浪费我时间。'
    ]
  },
  appstore: {
    positive: [
      'Great game! {tag} is amazing!',
      'Love it! {tag} is the best part!',
      'Highly recommend! {tag} is so good!',
      'Amazing experience! {tag} exceeded expectations!',
      'Fun game! {tag} is fantastic!'
    ],
    neutral: [
      'It\'s okay. {tag} is decent.',
      'Average game. {tag} could be better.',
      'Not bad. {tag} is fine.',
      'Alright game. {tag} is average.',
      'Decent experience. {tag} is okay.'
    ],
    negative: [
      'Not great. {tag} is disappointing.',
      'Too many issues. {tag} needs work.',
      'Boring. {tag} is not interesting.',
      'Don\'t recommend. {tag} is bad.',
      'Terrible experience. {tag} is awful.'
    ]
  },
  weibo: {
    positive: [
      '#{tag}# 太绝了吧！这个游戏简直是我的神！',
      '姐妹们！#游戏推荐# {tag}也太香了吧，冲冲冲！',
      '我的天！#游戏# 这个{tag}我真的太爱了，疯狂打call！',
      '必须给{tag}打电话！太上头了，根本停不下来！',
      '#游戏种草# {tag} yyds！所有游戏人给我冲！'
    ],
    neutral: [
      '#游戏# 玩了一下，{tag}一般般吧，打发时间还行。',
      '#游戏测评# {tag}感觉中规中矩，没什么特别的。',
      '#游戏记录# 玩了几天，{tag}还行吧，普通体验。',
      '#游戏闲聊# {tag}无功无过，就那样吧。',
      '#游戏日常# {tag}表现一般，没有特别惊艳的地方。'
    ],
    negative: [
      '#游戏避雷# {tag}太失望了，完全不值得玩！',
      '#游戏踩坑# {tag}简直了，差评警告！',
      '#游戏吐槽# {tag}垃圾游戏，浪费生命！',
      '#游戏维权# {tag}欺骗消费者，欺骗玩家！',
      '#游戏卸载# {tag}一生黑，再也不玩了！'
    ]
  },
  bilibili: {
    positive: [
      '前方高能！{tag}也太绝了吧，老婆太香了！',
      'UP主推荐！{tag}真的入股不亏，太香了！',
      '我好了！{tag}这个设定我爱了，太戳我了！',
      '绝了绝了！{tag}也太上头了吧，疯狂打call！',
      '这波啊，这波是{tag}的胜利，太强了！'
    ],
    neutral: [
      '玩了几天，{tag}感觉还行吧，中规中矩。',
      '测评一下，{tag}一般般，能玩但不惊艳。',
      '体验了一下，{tag}就那样，正常水平。',
      '总的来说，{tag}无功无过，普通游戏。',
      '玩了有一段时间了，{tag}表现一般。'
    ],
    negative: [
      '什么垃圾？{tag}也太拉了吧，浪费我时间！',
      'up主推荐的什么破游戏，{tag}太坑了！',
      '这{tag}谁爱玩谁玩吧，我是玩不下去了！',
      '太失望了，{tag}完全就是诈骗！',
      '真的劝退，{tag}太垃圾了，卸载保平安！'
    ]
  },
  xiaohongshu: {
    positive: [
      '姐妹们！{tag}也太绝了吧！真的哭死！',
      '今日份快乐是{tag}给的，太香了吧！',
      '私藏已久的游戏分享！{tag}真的绝绝子！',
      '我愿称{tag}为年度最佳，太好哭了！',
      '不允许还有人不知道{tag}！太香了！'
    ],
    neutral: [
      '玩了几天，{tag}还行吧，一般般~',
      '测评一下{tag}，无功无过，一般般啦~',
      'emm，{tag}就那样吧，普通体验~',
      '给姐妹们排个雷，{tag}中规中矩~',
      '真实测评：{tag}一般般，可以尝试~'
    ],
    negative: [
      '避雷！{tag}也太差了吧，浪费钱！',
      '姐妹们快跑！{tag}真的太坑了！',
      '血泪教训！{tag}完全不值得！',
      '真的栓Q，{tag}太让人失望了！',
      '拔草了！{tag}一生黑，再也不碰！'
    ]
  }
};

const TAG_KEYWORDS: Record<string, Record<'positive' | 'neutral' | 'negative', string[]>> = {
  '病娇': {
    positive: ['病娇', '病娇属性', '黑化', '偏执', '病娇太香了', '我爱病娇'],
    neutral: ['病娇', '病娇属性', '黑化', '偏执'],
    negative: ['病娇', '太恐怖', '心理不适', '害怕']
  },
  '虐恋': {
    positive: ['虐恋', '虐心', 'BE美学', '太好哭了', '哭死'],
    neutral: ['虐恋', '虐心', 'BE'],
    negative: ['太虐了', '心梗', '难受', '刀']
  },
  '甜宠': {
    positive: ['甜', '超甜', '太甜了', '齁甜', '宠溺', '甜死我算了'],
    neutral: ['甜', '甜宠', '甜蜜'],
    negative: ['太甜了', '腻', '齁']
  },
  '高福利': {
    positive: ['福利好', '白嫖', '良心', '免费玩家友好', '氪金点少'],
    neutral: ['福利', '福利一般', '正常水平'],
    negative: ['福利缩水', '骗氪', '越来越抠']
  },
  '高难度': {
    positive: ['有挑战', '硬核', '操作性强', '技术党狂喜'],
    neutral: ['难度', '有难度', '较难'],
    negative: ['太难了', '劝退', '门槛高', '玩不起']
  },
  '治愈': {
    positive: ['治愈', '温暖', '感动', '被治愈了', '太暖心了'],
    neutral: ['治愈', '温暖', '温馨'],
    negative: ['太无聊', '平淡', '没意思']
  },
  '悬疑': {
    positive: ['烧脑', '推理', '悬疑', '精彩', '猜不透'],
    neutral: ['悬疑', '推理', '烧脑'],
    negative: ['太复杂', '看不懂', '乱']
  },
  '温柔': {
    positive: ['温柔', '温柔男主', '太温柔了', '暖男', '治愈'],
    neutral: ['温柔', '温柔型'],
    negative: ['太软', '没个性']
  },
  '高冷': {
    positive: ['高冷', '高岭之花', '反差', '太香了', '禁欲'],
    neutral: ['高冷', '高冷型'],
    negative: ['太冷', '不理人']
  },
  '年下': {
    positive: ['年下', '小奶狗', '年下太香了', '姐弟恋', '弟弟'],
    neutral: ['年下', '年下恋'],
    negative: ['太幼稚', '不成熟']
  },
  '颜狗': {
    positive: ['颜值', '颜值超高', '太帅了', '太美了', '神颜'],
    neutral: ['颜值', '颜值高', '好看'],
    negative: ['一般', '颜值普通']
  },
  '声优控': {
    positive: ['声优', 'CV', '声音太好听了', '耳朵怀孕', '配音'],
    neutral: ['声优', 'CV', '配音'],
    negative: ['声音一般', '配音差']
  }
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export class CommentSimulator {
  private tagSystem: Record<string, string[]>;

  constructor() {
    this.tagSystem = {};
    this.initializeTagSystem();
  }

  private initializeTagSystem(): void {
    this.tagSystem = {
      '病娇': ['病娇', '黑化', '偏执', '病娇属性', '占有欲'],
      '虐恋': ['虐恋', 'BE', '悲剧', '意难平', '刀'],
      '甜宠': ['甜宠', '甜蜜', '撒糖', '齁甜', '宠溺'],
      '治愈': ['治愈', '温暖', '温馨', '感动', '美好'],
      '高福利': ['福利', '白嫖', '良心', '免费', '保底'],
      '高难度': ['难度', '硬核', '挑战', '操作', '技术'],
      '悬疑': ['悬疑', '推理', '烧脑', '谜题', '线索'],
      '温柔': ['温柔', '温柔型', '暖男', '体贴', '治愈'],
      '高冷': ['高冷', '高岭之花', '禁欲', '反差', '傲娇'],
      '年下': ['年下', '弟弟', '小奶狗', '姐弟恋', '年下恋'],
      '颜狗': ['颜值', '立绘', '建模', '好看', '神颜'],
      '声优控': ['声优', 'CV', '配音', '声音', '耳朵'],
      '剧情党': ['剧情', '故事', '叙事', '文本', '代入感'],
      '强度党': ['强度', '数值', '战力', '练度', 'PVP'],
      'XP党': ['XP', 'xp', 'XP党', 'xp党', 'xp党']
    };
  }

  shouldComment(player: VirtualPlayer): boolean {
    const baseProbability = 0.15;
    
    const playStyleBonus: Record<string, number> = {
      '剧情党': 0.15,
      'XP党': 0.1,
      '强度党': 0.08,
      '社交党': 0.12,
      '咸鱼党': 0.02
    };
    
    const satisfactionBonus = (player.satisfaction - 0.5) * 0.2;
    const loyaltyBonus = player.loyalty * 0.1;
    const activityBonus = player.activityLevel * 0.1;
    
    const spendingBonus: Record<string, number> = {
      '零氪': -0.05,
      '微氪': 0.02,
      '中氪': 0.05,
      '重氪': 0.08,
      '神豪': 0.1
    };
    
    const totalProbability = baseProbability + 
      (playStyleBonus[player.playStyle] || 0) + 
      satisfactionBonus + 
      loyaltyBonus + 
      activityBonus + 
      (spendingBonus[player.spendingLevel] || 0);
    
    return Math.random() < Math.max(0.02, Math.min(0.5, totalProbability));
  }

  assignPlatform(player: VirtualPlayer): Platform {
    const platforms: Platform[] = ['taptap', 'appstore', 'weibo', 'bilibili', 'xiaohongshu'];
    const weights: number[] = platforms.map(p => PLATFORM_CONFIG[p].weight);
    
    const playStyleToPlatform: Record<string, Platform> = {
      '剧情党': 'taptap',
      '强度党': 'taptap',
      'XP党': 'bilibili',
      '社交党': 'weibo',
      '咸鱼党': 'appstore'
    };
    
    if (Math.random() < 0.4) {
      return playStyleToPlatform[player.playStyle] || 'taptap';
    }
    
    let totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < platforms.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return platforms[i];
      }
    }
    
    return 'taptap';
  }

  calculateSentiment(player: VirtualPlayer): 'positive' | 'neutral' | 'negative' {
    const satisfaction = player.satisfaction;
    const loyalty = player.loyalty;
    const fatigue = player.fatigue;
    
    let positiveScore = satisfaction * 0.4 + loyalty * 0.4 + (1 - fatigue) * 0.2;
    let negativeScore = (1 - satisfaction) * 0.4 + (1 - loyalty) * 0.2 + fatigue * 0.4;
    
    const randomFactor = Math.random();
    
    if (positiveScore > 0.55 + randomFactor * 0.15) {
      return 'positive';
    } else if (negativeScore > 0.45 + randomFactor * 0.1) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  private getTagKeywords(tag: string, sentiment: 'positive' | 'neutral' | 'negative'): string[] {
    const tagData = TAG_KEYWORDS[tag];
    if (!tagData) {
      return [tag];
    }
    return tagData[sentiment] || [tag];
  }

  private getPlatformTags(contentTags: string[], activityTags: string[]): string[] {
    const allTags: string[] = [];
    
    for (const tag of contentTags) {
      if (tag in this.tagSystem) {
        allTags.push(tag);
      }
    }
    
    for (const tag of activityTags) {
      if (tag in this.tagSystem) {
        allTags.push(tag);
      }
    }
    
    return allTags.length > 0 ? allTags : ['游戏'];
  }

  generateComment(
    player: VirtualPlayer, 
    platform: Platform, 
    contentTags: string[] = [],
    activityTags: string[] = []
  ): PlatformComment {
    const sentiment = this.calculateSentiment(player);
    const config = PLATFORM_CONFIG[platform];
    
    const platformTags = this.getPlatformTags(contentTags, activityTags);
    const selectedTag = randomElement(platformTags);
    const keywords = this.getTagKeywords(selectedTag, sentiment);
    const keyword = randomElement(keywords);
    
    const templates = COMMENT_TEMPLATES[platform][sentiment];
    const template = randomElement(templates);
    const content = template.replace('{tag}', keyword);
    
    const ratingMin = config.ratingRange[0];
    const ratingMax = config.ratingRange[1];
    let rating: number;
    
    if (sentiment === 'positive') {
      const highRange = ratingMin + (ratingMax - ratingMin) * 0.7;
      rating = randomInt(Math.floor(highRange), ratingMax);
    } else if (sentiment === 'negative') {
      const lowRange = ratingMin + (ratingMax - ratingMin) * 0.3;
      rating = randomInt(ratingMin, Math.floor(lowRange));
    } else {
      rating = randomInt(
        Math.floor(ratingMin + (ratingMax - ratingMin) * 0.3),
        Math.floor(ratingMin + (ratingMax - ratingMin) * 0.7)
      );
    }
    
    return {
      id: generateId(),
      platform,
      playerId: player.id,
      content,
      rating,
      sentiment,
      relatedTags: [selectedTag],
      timestamp: Date.now()
    };
  }

  getPlatformStatistics(comments: PlatformComment[]): PlatformStatistics {
    const stats: PlatformStatistics = {
      totalComments: comments.length,
      byPlatform: {
        taptap: 0,
        appstore: 0,
        weibo: 0,
        bilibili: 0,
        xiaohongshu: 0
      },
      sentimentDistribution: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      averageRating: 0,
      ratingByPlatform: {
        taptap: 0,
        appstore: 0,
        weibo: 0,
        bilibili: 0,
        xiaohongshu: 0
      }
    };
    
    if (comments.length === 0) {
      return stats;
    }
    
    let totalRating = 0;
    const platformRatings: Record<Platform, number[]> = {
      taptap: [],
      appstore: [],
      weibo: [],
      bilibili: [],
      xiaohongshu: []
    };
    
    for (const comment of comments) {
      stats.byPlatform[comment.platform]++;
      stats.sentimentDistribution[comment.sentiment]++;
      
      if (comment.rating !== undefined) {
        totalRating += comment.rating;
        platformRatings[comment.platform].push(comment.rating);
      }
    }
    
    stats.averageRating = totalRating / comments.length;
    
    const platforms: Platform[] = ['taptap', 'appstore', 'weibo', 'bilibili', 'xiaohongshu'];
    for (const platform of platforms) {
      const ratings = platformRatings[platform];
      if (ratings.length > 0) {
        stats.ratingByPlatform[platform] = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      }
    }
    
    return stats;
  }

  simulateCommentsForPlayer(
    player: VirtualPlayer,
    contentTags: string[] = [],
    activityTags: string[] = []
  ): PlatformComment[] {
    const comments: PlatformComment[] = [];
    
    if (!this.shouldComment(player)) {
      return comments;
    }
    
    const numComments = Math.random() < 0.3 ? randomInt(1, 2) : 1;
    
    for (let i = 0; i < numComments; i++) {
      const platform = this.assignPlatform(player);
      const comment = this.generateComment(player, platform, contentTags, activityTags);
      comments.push(comment);
    }
    
    return comments;
  }

  simulateCommentsForPlayers(
    players: VirtualPlayer[],
    contentTags: string[] = [],
    activityTags: string[] = []
  ): PlatformComment[] {
    const allComments: PlatformComment[] = [];
    
    for (const player of players) {
      const comments = this.simulateCommentsForPlayer(player, contentTags, activityTags);
      allComments.push(...comments);
    }
    
    return allComments;
  }
}

export const CommentSimulatorInstance = new CommentSimulator();
