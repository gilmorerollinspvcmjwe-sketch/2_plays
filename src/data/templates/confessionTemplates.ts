/**
 * 告白模板系统
 * 按角色性格分类的告白模板
 * 支持正面/负面/中立情感
 */

import type { SentimentType } from '@/engine/contentGenerationEngine';

// ==================== 类型定义 ====================

/** 角色性格类型 */
export type CharacterPersonality =
  | 'tsundere'       // 傲娇
  | 'cool'           // 冷酷
  | 'gentle'         // 温柔
  | 'mysterious'     // 神秘
  | 'yandere'        // 病娇
  | 'sunshine'       // 阳光
  | 'dominant'       // 霸道
  | 'shy'            // 害羞
  | 'playful';       // 腹黑

/** 告白类型 */
export type ConfessionCategory =
  | 'character'      // 角色告白
  | 'plot'           // 剧情告白
  | 'official'       // 官方告白
  | 'quit';          // 退坑告白

/** 告白模板结构 */
export interface ConfessionTemplateItem {
  id: string;
  content: string;
  personality: CharacterPersonality;
  category: ConfessionCategory;
  sentiment: SentimentType;
  weight: number;
  tags: string[];
}

/** 占位符替换数据 */
export interface ConfessionPlaceholderData {
  projectName?: string;
  characterName?: string;
  plotTitle?: string;
  playerName?: string;
  dayCount?: number;
}

// ==================== 傲娇角色告白模板 ====================

export const tsundereConfessionTemplates: Record<SentimentType, ConfessionTemplateItem[]> = {
  positive: [
    {
      id: 'tsun_pos_001',
      content: '哼，才不是因为喜欢{characterName}才玩这个游戏的呢！只是...只是刚好无聊而已！',
      personality: 'tsundere',
      category: 'character',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['傲娇', '否认']
    },
    {
      id: 'tsun_pos_002',
      content: '{characterName}那个笨蛋，明明那么温柔还要装作冷酷的样子，真是的...太可爱了！',
      personality: 'tsundere',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['傲娇', '温柔']
    },
    {
      id: 'tsun_pos_003',
      content: '我才不会承认{characterName}是我老公呢！但是...但是其他人都不许抢！',
      personality: 'tsundere',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['傲娇', '占有欲']
    },
    {
      id: 'tsun_pos_004',
      content: '玩{projectName}第{dayCount}天了，才不是因为{characterName}才坚持下来的呢！',
      personality: 'tsundere',
      category: 'character',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['傲娇', '坚持']
    },
    {
      id: 'tsun_pos_005',
      content: '{characterName}那个家伙，明明对我那么好还要嘴硬，真是拿他没办法...',
      personality: 'tsundere',
      category: 'character',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['傲娇', '嘴硬']
    },
  ],
  neutral: [
    {
      id: 'tsun_neu_001',
      content: '{characterName}还行吧，虽然有时候很烦人，但也不是不能接受。',
      personality: 'tsundere',
      category: 'character',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['傲娇', '一般']
    },
    {
      id: 'tsun_neu_002',
      content: '对{characterName}感觉一般，不过既然玩了就继续看看吧。',
      personality: 'tsundere',
      category: 'character',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['傲娇', '观望']
    },
  ],
  negative: [
    {
      id: 'tsun_neg_001',
      content: '{characterName}那个讨厌鬼，谁要喜欢他啊！游戏卸载了！',
      personality: 'tsundere',
      category: 'quit',
      sentiment: 'negative',
      weight: 1.0,
      tags: ['傲娇', '卸载']
    },
    {
      id: 'tsun_neg_002',
      content: '哼，{characterName}根本不懂我的心，不玩了！',
      personality: 'tsundere',
      category: 'quit',
      sentiment: 'negative',
      weight: 0.9,
      tags: ['傲娇', '失望']
    },
  ],
};

// ==================== 冷酷角色告白模板 ====================

export const coolConfessionTemplates: Record<SentimentType, ConfessionTemplateItem[]> = {
  positive: [
    {
      id: 'cool_pos_001',
      content: '{characterName}那种冷漠的外表下藏着温柔的心，这种反差太戳我了。',
      personality: 'cool',
      category: 'character',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['冷酷', '反差']
    },
    {
      id: 'cool_pos_002',
      content: '虽然{characterName}话不多，但每一句都说到我心里去了。',
      personality: 'cool',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['冷酷', '少言']
    },
    {
      id: 'cool_pos_003',
      content: '{characterName}的眼神太有杀伤力了，每次对视我都心跳加速...',
      personality: 'cool',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['冷酷', '眼神']
    },
    {
      id: 'cool_pos_004',
      content: '外冷内热的{characterName}真的太有魅力了，完全沦陷了。',
      personality: 'cool',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['冷酷', '魅力']
    },
    {
      id: 'cool_pos_005',
      content: '{characterName}虽然表面冷淡，但关键时刻总是保护我，太有安全感了。',
      personality: 'cool',
      category: 'character',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['冷酷', '保护']
    },
  ],
  neutral: [
    {
      id: 'cool_neu_001',
      content: '{characterName}太冷了，有时候感觉不到他的感情。',
      personality: 'cool',
      category: 'character',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['冷酷', '冷淡']
    },
    {
      id: 'cool_neu_002',
      content: '对{characterName}没什么特别的感觉，就是普通的角色。',
      personality: 'cool',
      category: 'character',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['冷酷', '普通']
    },
  ],
  negative: [
    {
      id: 'cool_neg_001',
      content: '{characterName}太冷漠了，根本感受不到他的爱，弃了。',
      personality: 'cool',
      category: 'quit',
      sentiment: 'negative',
      weight: 1.0,
      tags: ['冷酷', '冷漠']
    },
    {
      id: 'cool_neg_002',
      content: '不喜欢{characterName}这种冷冰冰的性格，玩不下去了。',
      personality: 'cool',
      category: 'quit',
      sentiment: 'negative',
      weight: 0.9,
      tags: ['冷酷', '不喜欢']
    },
  ],
};

// ==================== 温柔角色告白模板 ====================

export const gentleConfessionTemplates: Record<SentimentType, ConfessionTemplateItem[]> = {
  positive: [
    {
      id: 'gentle_pos_001',
      content: '{characterName}真的太温柔了，每次和他对话都感觉被治愈了。',
      personality: 'gentle',
      category: 'character',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['温柔', '治愈']
    },
    {
      id: 'gentle_pos_002',
      content: '世界上怎么会有{characterName}这么温柔的人啊，想嫁给他！',
      personality: 'gentle',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['温柔', '想嫁']
    },
    {
      id: 'gentle_pos_003',
      content: '{characterName}的温柔不是那种刻意的，而是发自内心的，太让人心动了。',
      personality: 'gentle',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['温柔', '真心']
    },
    {
      id: 'gentle_pos_004',
      content: '每次难过的时候想到{characterName}就觉得一切都会好起来的。',
      personality: 'gentle',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['温柔', '力量']
    },
    {
      id: 'gentle_pos_005',
      content: '{characterName}就像春天的阳光一样温暖，让人忍不住想要靠近。',
      personality: 'gentle',
      category: 'character',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['温柔', '阳光']
    },
  ],
  neutral: [
    {
      id: 'gentle_neu_001',
      content: '{characterName}是挺温柔的，但有时候感觉有点平淡。',
      personality: 'gentle',
      category: 'character',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['温柔', '平淡']
    },
    {
      id: 'gentle_neu_002',
      content: '对{characterName}没什么特别的感觉，就是普通的好人。',
      personality: 'gentle',
      category: 'character',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['温柔', '好人']
    },
  ],
  negative: [
    {
      id: 'gentle_neg_001',
      content: '{characterName}太温柔了反而让人觉得不真实，有点假。',
      personality: 'gentle',
      category: 'quit',
      sentiment: 'negative',
      weight: 1.0,
      tags: ['温柔', '虚假']
    },
    {
      id: 'gentle_neg_002',
      content: '不喜欢{characterName}这种中央空调式的温柔，对谁都好。',
      personality: 'gentle',
      category: 'quit',
      sentiment: 'negative',
      weight: 0.9,
      tags: ['温柔', '中央空调']
    },
  ],
};

// ==================== 神秘角色告白模板 ====================

export const mysteriousConfessionTemplates: Record<SentimentType, ConfessionTemplateItem[]> = {
  positive: [
    {
      id: 'myst_pos_001',
      content: '{characterName}身上有太多谜团了，越了解越让人着迷。',
      personality: 'mysterious',
      category: 'character',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['神秘', '谜团']
    },
    {
      id: 'myst_pos_002',
      content: '每次以为了解了{characterName}，他又会展现出新的一面，太有魅力了！',
      personality: 'mysterious',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['神秘', '多面']
    },
    {
      id: 'myst_pos_003',
      content: '{characterName}的神秘感让人欲罢不能，想要探索他的一切。',
      personality: 'mysterious',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['神秘', '探索']
    },
    {
      id: 'myst_pos_004',
      content: '那种若即若离的感觉，{characterName}真的太会了！',
      personality: 'mysterious',
      category: 'character',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['神秘', '若即若离']
    },
    {
      id: 'myst_pos_005',
      content: '{characterName}的过去一定有很多故事，好想全部知道。',
      personality: 'mysterious',
      category: 'character',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['神秘', '过去']
    },
  ],
  neutral: [
    {
      id: 'myst_neu_001',
      content: '{characterName}太神秘了，到现在都不知道他在想什么。',
      personality: 'mysterious',
      category: 'character',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['神秘', '难懂']
    },
    {
      id: 'myst_neu_002',
      content: '对{characterName}没什么感觉，太神秘了反而有距离感。',
      personality: 'mysterious',
      category: 'character',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['神秘', '距离感']
    },
  ],
  negative: [
    {
      id: 'myst_neg_001',
      content: '{characterName}太神秘了，感觉一直在被欺骗，不想玩了。',
      personality: 'mysterious',
      category: 'quit',
      sentiment: 'negative',
      weight: 1.0,
      tags: ['神秘', '欺骗']
    },
    {
      id: 'myst_neg_002',
      content: '不喜欢{characterName}这种藏着掖着的性格，太累了。',
      personality: 'mysterious',
      category: 'quit',
      sentiment: 'negative',
      weight: 0.9,
      tags: ['神秘', '累']
    },
  ],
};

// ==================== 病娇角色告白模板 ====================

export const yandereConfessionTemplates: Record<SentimentType, ConfessionTemplateItem[]> = {
  positive: [
    {
      id: 'yan_pos_001',
      content: '{characterName}那种疯狂的爱太让人心动了，想要被独占！',
      personality: 'yandere',
      category: 'character',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['病娇', '独占']
    },
    {
      id: 'yan_pos_002',
      content: '虽然{characterName}有点危险，但那种偏执的爱太戳我了！',
      personality: 'yandere',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['病娇', '偏执']
    },
    {
      id: 'yan_pos_003',
      content: '{characterName}为了我什么都愿意做，这种被重视的感觉太好了。',
      personality: 'yandere',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['病娇', '重视']
    },
    {
      id: 'yan_pos_004',
      content: '那种"你只能属于我"的感觉，{characterName}太带感了！',
      personality: 'yandere',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['病娇', '占有欲']
    },
    {
      id: 'yan_pos_005',
      content: '{characterName}的眼神里只有我一个人，这种专属感太幸福了。',
      personality: 'yandere',
      category: 'character',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['病娇', '专属']
    },
  ],
  neutral: [
    {
      id: 'yan_neu_001',
      content: '{characterName}有点可怕，但也不是不能接受。',
      personality: 'yandere',
      category: 'character',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['病娇', '可怕']
    },
    {
      id: 'yan_neu_002',
      content: '对{characterName}感觉复杂，既害怕又有点心动。',
      personality: 'yandere',
      category: 'character',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['病娇', '复杂']
    },
  ],
  negative: [
    {
      id: 'yan_neg_001',
      content: '{characterName}太可怕了，这种爱承受不起，退坑了。',
      personality: 'yandere',
      category: 'quit',
      sentiment: 'negative',
      weight: 1.0,
      tags: ['病娇', '可怕']
    },
    {
      id: 'yan_neg_002',
      content: '不喜欢{characterName}这种病态的爱，太压抑了。',
      personality: 'yandere',
      category: 'quit',
      sentiment: 'negative',
      weight: 0.9,
      tags: ['病娇', '压抑']
    },
  ],
};

// ==================== 阳光角色告白模板 ====================

export const sunshineConfessionTemplates: Record<SentimentType, ConfessionTemplateItem[]> = {
  positive: [
    {
      id: 'sun_pos_001',
      content: '{characterName}的笑容太有感染力了，看到他就觉得开心！',
      personality: 'sunshine',
      category: 'character',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['阳光', '笑容']
    },
    {
      id: 'sun_pos_002',
      content: '{characterName}就像小太阳一样，总能给我带来正能量。',
      personality: 'sunshine',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['阳光', '正能量']
    },
    {
      id: 'sun_pos_003',
      content: '和{characterName}在一起的感觉太美好了，每天都想见到他！',
      personality: 'sunshine',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['阳光', '美好']
    },
    {
      id: 'sun_pos_004',
      content: '{characterName}那种积极向上的态度真的太吸引人了。',
      personality: 'sunshine',
      category: 'character',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['阳光', '积极']
    },
    {
      id: 'sun_pos_005',
      content: '不管遇到什么困难，{characterName}都会笑着面对，太让人佩服了。',
      personality: 'sunshine',
      category: 'character',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['阳光', '坚强']
    },
  ],
  neutral: [
    {
      id: 'sun_neu_001',
      content: '{characterName}挺阳光的，但有时候感觉太天真了。',
      personality: 'sunshine',
      category: 'character',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['阳光', '天真']
    },
    {
      id: 'sun_neu_002',
      content: '对{characterName}没什么特别的感觉，就是普通的阳光男孩。',
      personality: 'sunshine',
      category: 'character',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['阳光', '普通']
    },
  ],
  negative: [
    {
      id: 'sun_neg_001',
      content: '{characterName}太吵了，整天笑嘻嘻的，有点烦。',
      personality: 'sunshine',
      category: 'quit',
      sentiment: 'negative',
      weight: 1.0,
      tags: ['阳光', '吵闹']
    },
    {
      id: 'sun_neg_002',
      content: '不喜欢{characterName}这种过于阳光的性格，感觉不真实。',
      personality: 'sunshine',
      category: 'quit',
      sentiment: 'negative',
      weight: 0.9,
      tags: ['阳光', '虚假']
    },
  ],
};

// ==================== 霸道角色告白模板 ====================

export const dominantConfessionTemplates: Record<SentimentType, ConfessionTemplateItem[]> = {
  positive: [
    {
      id: 'dom_pos_001',
      content: '{characterName}那种霸道总裁的感觉太让人心动了，想要被征服！',
      personality: 'dominant',
      category: 'character',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['霸道', '总裁']
    },
    {
      id: 'dom_pos_002',
      content: '{characterName}说"你是我的"的时候，我整个人都酥了！',
      personality: 'dominant',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['霸道', '宣言']
    },
    {
      id: 'dom_pos_003',
      content: '那种被{characterName}保护的感觉太有安全感了，想一直被他守护着。',
      personality: 'dominant',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['霸道', '保护']
    },
    {
      id: 'dom_pos_004',
      content: '{characterName}的强势不是那种不讲理的，而是让人心甘情愿臣服的。',
      personality: 'dominant',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['霸道', '强势']
    },
    {
      id: 'dom_pos_005',
      content: '在{characterName}面前，我可以放心地做个小女人。',
      personality: 'dominant',
      category: 'character',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['霸道', '依靠']
    },
  ],
  neutral: [
    {
      id: 'dom_neu_001',
      content: '{characterName}太强势了，有时候感觉压力很大。',
      personality: 'dominant',
      category: 'character',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['霸道', '压力']
    },
    {
      id: 'dom_neu_002',
      content: '对{characterName}没什么特别的感觉，霸道总裁人设比较常见。',
      personality: 'dominant',
      category: 'character',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['霸道', '常见']
    },
  ],
  negative: [
    {
      id: 'dom_neg_001',
      content: '{characterName}太霸道了，完全不尊重人，受不了。',
      personality: 'dominant',
      category: 'quit',
      sentiment: 'negative',
      weight: 1.0,
      tags: ['霸道', '不尊重']
    },
    {
      id: 'dom_neg_002',
      content: '不喜欢{characterName}这种控制欲太强的性格，太压抑了。',
      personality: 'dominant',
      category: 'quit',
      sentiment: 'negative',
      weight: 0.9,
      tags: ['霸道', '控制欲']
    },
  ],
};

// ==================== 害羞角色告白模板 ====================

export const shyConfessionTemplates: Record<SentimentType, ConfessionTemplateItem[]> = {
  positive: [
    {
      id: 'shy_pos_001',
      content: '{characterName}害羞的样子太可爱了，想欺负他！',
      personality: 'shy',
      category: 'character',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['害羞', '可爱']
    },
    {
      id: 'shy_pos_002',
      content: '{characterName}每次脸红的时候，我都忍不住想要保护他。',
      personality: 'shy',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['害羞', '脸红']
    },
    {
      id: 'shy_pos_003',
      content: '那种青涩的恋爱感，{characterName}真的太让人心动了。',
      personality: 'shy',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['害羞', '青涩']
    },
    {
      id: 'shy_pos_004',
      content: '{characterName}虽然害羞，但在关键时刻还是会鼓起勇气，太勇敢了。',
      personality: 'shy',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['害羞', '勇敢']
    },
    {
      id: 'shy_pos_005',
      content: '{characterName}那种纯情的感觉，让人想起了初恋。',
      personality: 'shy',
      category: 'character',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['害羞', '纯情']
    },
  ],
  neutral: [
    {
      id: 'shy_neu_001',
      content: '{characterName}太害羞了，有时候沟通起来有点困难。',
      personality: 'shy',
      category: 'character',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['害羞', '沟通']
    },
    {
      id: 'shy_neu_002',
      content: '对{characterName}没什么特别的感觉，就是普通的害羞男孩。',
      personality: 'shy',
      category: 'character',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['害羞', '普通']
    },
  ],
  negative: [
    {
      id: 'shy_neg_001',
      content: '{characterName}太害羞了，完全不敢表达感情，急死人了。',
      personality: 'shy',
      category: 'quit',
      sentiment: 'negative',
      weight: 1.0,
      tags: ['害羞', '急人']
    },
    {
      id: 'shy_neg_002',
      content: '不喜欢{characterName}这种扭扭捏捏的性格，太墨迹了。',
      personality: 'shy',
      category: 'quit',
      sentiment: 'negative',
      weight: 0.9,
      tags: ['害羞', '墨迹']
    },
  ],
};

// ==================== 腹黑角色告白模板 ====================

export const playfulConfessionTemplates: Record<SentimentType, ConfessionTemplateItem[]> = {
  positive: [
    {
      id: 'play_pos_001',
      content: '{characterName}那种腹黑的小表情太可爱了，明明知道他在捉弄我，还是忍不住心动。',
      personality: 'playful',
      category: 'character',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['腹黑', '捉弄']
    },
    {
      id: 'play_pos_002',
      content: '{characterName}总是用那种似笑非笑的表情看着我，太会了！',
      personality: 'playful',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['腹黑', '表情']
    },
    {
      id: 'play_pos_003',
      content: '被{characterName}套路了还心甘情愿，这就是爱情的魔力吧。',
      personality: 'playful',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['腹黑', '套路']
    },
    {
      id: 'play_pos_004',
      content: '{characterName}虽然腹黑，但关键时刻还是很可靠的，这种反差太戳了。',
      personality: 'playful',
      category: 'character',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['腹黑', '可靠']
    },
    {
      id: 'play_pos_005',
      content: '和{characterName}斗智斗勇的过程太有趣了，每天都充满惊喜。',
      personality: 'playful',
      category: 'character',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['腹黑', '有趣']
    },
  ],
  neutral: [
    {
      id: 'play_neu_001',
      content: '{characterName}太腹黑了，有时候分不清他哪句是真哪句是假。',
      personality: 'playful',
      category: 'character',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['腹黑', '真假']
    },
    {
      id: 'play_neu_002',
      content: '对{characterName}没什么特别的感觉，腹黑人设比较常见。',
      personality: 'playful',
      category: 'character',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['腹黑', '常见']
    },
  ],
  negative: [
    {
      id: 'play_neg_001',
      content: '{characterName}太腹黑了，感觉一直在被算计，不想玩了。',
      personality: 'playful',
      category: 'quit',
      sentiment: 'negative',
      weight: 1.0,
      tags: ['腹黑', '算计']
    },
    {
      id: 'play_neg_002',
      content: '不喜欢{characterName}这种心机太重的性格，太累了。',
      personality: 'playful',
      category: 'quit',
      sentiment: 'negative',
      weight: 0.9,
      tags: ['腹黑', '心机']
    },
  ],
};

// ==================== 剧情告白模板 ====================

export const plotConfessionTemplates: Record<SentimentType, ConfessionTemplateItem[]> = {
  positive: [
    {
      id: 'plot_pos_001',
      content: '{plotTitle}的剧情太感人了，哭得稀里哗啦的，制作组太会了！',
      personality: 'gentle',
      category: 'plot',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['剧情', '感人']
    },
    {
      id: 'plot_pos_002',
      content: '这次的{plotTitle}糖分超标了，甜到我蛀牙！',
      personality: 'sunshine',
      category: 'plot',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['剧情', '甜']
    },
    {
      id: 'plot_pos_003',
      content: '{plotTitle}虐得我心肝疼，但是好上头啊，编剧太厉害了！',
      personality: 'cool',
      category: 'plot',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['剧情', '虐']
    },
    {
      id: 'plot_pos_004',
      content: '这剧情转折我真的服了，{plotTitle}太精彩了！',
      personality: 'mysterious',
      category: 'plot',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['剧情', '转折']
    },
    {
      id: 'plot_pos_005',
      content: '{plotTitle}的结局太完美了，圆满了，感谢制作组！',
      personality: 'gentle',
      category: 'plot',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['剧情', '结局']
    },
  ],
  neutral: [
    {
      id: 'plot_neu_001',
      content: '{plotTitle}的剧情还行吧，正常水平。',
      personality: 'gentle',
      category: 'plot',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['剧情', '一般']
    },
    {
      id: 'plot_neu_002',
      content: '这次的{plotTitle}没什么特别的感觉，中规中矩。',
      personality: 'cool',
      category: 'plot',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['剧情', '普通']
    },
  ],
  negative: [
    {
      id: 'plot_neg_001',
      content: '{plotTitle}的剧情太拉胯了，玩得我尴尬症都犯了。',
      personality: 'tsundere',
      category: 'plot',
      sentiment: 'negative',
      weight: 1.0,
      tags: ['剧情', '尴尬']
    },
    {
      id: 'plot_neg_002',
      content: '这{plotTitle}结局烂尾，对得起我氪的金吗？',
      personality: 'dominant',
      category: 'plot',
      sentiment: 'negative',
      weight: 0.9,
      tags: ['剧情', '烂尾']
    },
  ],
};

// ==================== 官方告白模板 ====================

export const officialConfessionTemplates: Record<SentimentType, ConfessionTemplateItem[]> = {
  positive: [
    {
      id: 'off_pos_001',
      content: '感谢{projectName}制作组的用心，我会一直支持下去的！',
      personality: 'gentle',
      category: 'official',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['官方', '感谢']
    },
    {
      id: 'off_pos_002',
      content: '周年庆活动太棒了，{projectName}官方大气！',
      personality: 'sunshine',
      category: 'official',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['官方', '周年庆']
    },
    {
      id: 'off_pos_003',
      content: '{projectName}真的没白玩，期待更多内容，爱你们！',
      personality: 'gentle',
      category: 'official',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['官方', '期待']
    },
    {
      id: 'off_pos_004',
      content: '感谢相遇，我会一直陪伴{projectName}的❤️',
      personality: 'gentle',
      category: 'official',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['官方', '陪伴']
    },
    {
      id: 'off_pos_005',
      content: '制作组辛苦了，{projectName}是我玩过最好的乙游！',
      personality: 'sunshine',
      category: 'official',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['官方', '最好']
    },
  ],
  neutral: [
    {
      id: 'off_neu_001',
      content: '{projectName}还行吧，希望官方能继续努力。',
      personality: 'cool',
      category: 'official',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['官方', '一般']
    },
    {
      id: 'off_neu_002',
      content: '对{projectName}没什么特别的感觉，观望中。',
      personality: 'mysterious',
      category: 'official',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['官方', '观望']
    },
  ],
  negative: [
    {
      id: 'off_neg_001',
      content: '{projectName}官方太让人失望了，承诺的一个都没实现。',
      personality: 'tsundere',
      category: 'official',
      sentiment: 'negative',
      weight: 1.0,
      tags: ['官方', '失望']
    },
    {
      id: 'off_neg_002',
      content: '对{projectName}官方很不满，再这样要退坑了。',
      personality: 'dominant',
      category: 'official',
      sentiment: 'negative',
      weight: 0.9,
      tags: ['官方', '不满']
    },
  ],
};

// ==================== 退坑告白模板 ====================

export const quitConfessionTemplates: ConfessionTemplateItem[] = [
  {
    id: 'quit_001',
    content: '抱歉了各位，要先下车了...感谢{projectName}带给我的美好回忆。',
    personality: 'gentle',
    category: 'quit',
    sentiment: 'negative',
    weight: 1.0,
    tags: ['退坑', '感谢']
  },
  {
    id: 'quit_002',
    content: '虽然很不舍，但还是要和{projectName}说再见了...',
    personality: 'gentle',
    category: 'quit',
    sentiment: 'negative',
    weight: 0.9,
    tags: ['退坑', '不舍']
  },
  {
    id: 'quit_003',
    content: '感谢{projectName}这个游戏带给我的回忆，江湖路远，有缘再会。',
    personality: 'mysterious',
    category: 'quit',
    sentiment: 'negative',
    weight: 0.9,
    tags: ['退坑', '江湖']
  },
  {
    id: 'quit_004',
    content: '先A一段时间，可能还会回来吧...{projectName}再见。',
    personality: 'cool',
    category: 'quit',
    sentiment: 'negative',
    weight: 0.8,
    tags: ['退坑', '暂离']
  },
  {
    id: 'quit_005',
    content: '玩{projectName}第{dayCount}天了，是时候说再见了。',
    personality: 'gentle',
    category: 'quit',
    sentiment: 'negative',
    weight: 0.8,
    tags: ['退坑', '天数']
  },
  {
    id: 'quit_006',
    content: '{projectName}变了，不再是当初我喜欢的样子了，卸载了。',
    personality: 'tsundere',
    category: 'quit',
    sentiment: 'negative',
    weight: 0.9,
    tags: ['退坑', '改变']
  },
  {
    id: 'quit_007',
      content: '对{projectName}彻底失望了，再也不见。',
    personality: 'dominant',
    category: 'quit',
    sentiment: 'negative',
    weight: 0.8,
    tags: ['退坑', '失望']
  },
];

// ==================== 模板选择函数 ====================

/**
 * 获取所有告白模板
 */
export function getAllConfessionTemplates(): ConfessionTemplateItem[] {
  return [
    ...tsundereConfessionTemplates.positive,
    ...tsundereConfessionTemplates.neutral,
    ...tsundereConfessionTemplates.negative,
    ...coolConfessionTemplates.positive,
    ...coolConfessionTemplates.neutral,
    ...coolConfessionTemplates.negative,
    ...gentleConfessionTemplates.positive,
    ...gentleConfessionTemplates.neutral,
    ...gentleConfessionTemplates.negative,
    ...mysteriousConfessionTemplates.positive,
    ...mysteriousConfessionTemplates.neutral,
    ...mysteriousConfessionTemplates.negative,
    ...yandereConfessionTemplates.positive,
    ...yandereConfessionTemplates.neutral,
    ...yandereConfessionTemplates.negative,
    ...sunshineConfessionTemplates.positive,
    ...sunshineConfessionTemplates.neutral,
    ...sunshineConfessionTemplates.negative,
    ...dominantConfessionTemplates.positive,
    ...dominantConfessionTemplates.neutral,
    ...dominantConfessionTemplates.negative,
    ...shyConfessionTemplates.positive,
    ...shyConfessionTemplates.neutral,
    ...shyConfessionTemplates.negative,
    ...playfulConfessionTemplates.positive,
    ...playfulConfessionTemplates.neutral,
    ...playfulConfessionTemplates.negative,
    ...plotConfessionTemplates.positive,
    ...plotConfessionTemplates.neutral,
    ...plotConfessionTemplates.negative,
    ...officialConfessionTemplates.positive,
    ...officialConfessionTemplates.neutral,
    ...officialConfessionTemplates.negative,
    ...quitConfessionTemplates,
  ];
}

/**
 * 根据角色性格获取模板
 */
export function getConfessionTemplatesByPersonality(
  personality: CharacterPersonality,
  sentiment: SentimentType
): ConfessionTemplateItem[] {
  const templateMap: Record<CharacterPersonality, Record<SentimentType, ConfessionTemplateItem[]>> = {
    tsundere: tsundereConfessionTemplates,
    cool: coolConfessionTemplates,
    gentle: gentleConfessionTemplates,
    mysterious: mysteriousConfessionTemplates,
    yandere: yandereConfessionTemplates,
    sunshine: sunshineConfessionTemplates,
    dominant: dominantConfessionTemplates,
    shy: shyConfessionTemplates,
    playful: playfulConfessionTemplates,
  };

  return templateMap[personality]?.[sentiment] || [];
}

/**
 * 根据告白分类获取模板
 */
export function getConfessionTemplatesByCategory(
  category: ConfessionCategory,
  sentiment: SentimentType
): ConfessionTemplateItem[] {
  const templateMap: Record<ConfessionCategory, Record<SentimentType, ConfessionTemplateItem[]> | ConfessionTemplateItem[]> = {
    character: {
      positive: [
        ...tsundereConfessionTemplates.positive,
        ...coolConfessionTemplates.positive,
        ...gentleConfessionTemplates.positive,
        ...mysteriousConfessionTemplates.positive,
        ...yandereConfessionTemplates.positive,
        ...sunshineConfessionTemplates.positive,
        ...dominantConfessionTemplates.positive,
        ...shyConfessionTemplates.positive,
        ...playfulConfessionTemplates.positive,
      ],
      neutral: [
        ...tsundereConfessionTemplates.neutral,
        ...coolConfessionTemplates.neutral,
        ...gentleConfessionTemplates.neutral,
        ...mysteriousConfessionTemplates.neutral,
        ...yandereConfessionTemplates.neutral,
        ...sunshineConfessionTemplates.neutral,
        ...dominantConfessionTemplates.neutral,
        ...shyConfessionTemplates.neutral,
        ...playfulConfessionTemplates.neutral,
      ],
      negative: [
        ...tsundereConfessionTemplates.negative,
        ...coolConfessionTemplates.negative,
        ...gentleConfessionTemplates.negative,
        ...mysteriousConfessionTemplates.negative,
        ...yandereConfessionTemplates.negative,
        ...sunshineConfessionTemplates.negative,
        ...dominantConfessionTemplates.negative,
        ...shyConfessionTemplates.negative,
        ...playfulConfessionTemplates.negative,
      ],
    },
    plot: plotConfessionTemplates,
    official: officialConfessionTemplates,
    quit: {
      positive: [],
      neutral: [],
      negative: quitConfessionTemplates,
    },
  };

  const templates = templateMap[category];
  if (Array.isArray(templates)) {
    return templates;
  }
  return templates?.[sentiment] || [];
}

/**
 * 加权随机选择模板
 */
export function selectWeightedConfessionTemplate(templates: ConfessionTemplateItem[]): ConfessionTemplateItem | null {
  if (templates.length === 0) return null;

  const totalWeight = templates.reduce((sum, t) => sum + t.weight, 0);
  let random = Math.random() * totalWeight;

  for (const template of templates) {
    random -= template.weight;
    if (random <= 0) {
      return template;
    }
  }

  return templates[templates.length - 1];
}

/**
 * 替换模板中的占位符
 */
export function replaceConfessionPlaceholders(
  template: string,
  data: ConfessionPlaceholderData
): string {
  let result = template;

  // 定义占位符映射
  const placeholderMap: Record<string, string | number | undefined> = {
    '{projectName}': data.projectName,
    '{characterName}': data.characterName,
    '{plotTitle}': data.plotTitle,
    '{playerName}': data.playerName,
    '{dayCount}': data.dayCount,
  };

  // 替换所有占位符
  Object.entries(placeholderMap).forEach(([placeholder, value]) => {
    if (value !== undefined) {
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
  });

  return result;
}

/**
 * 生成告白内容
 */
export function generateConfessionContent(
  personality: CharacterPersonality,
  category: ConfessionCategory,
  sentiment: SentimentType,
  data: ConfessionPlaceholderData
): string {
  let templates: ConfessionTemplateItem[] = [];

  if (category === 'character') {
    templates = getConfessionTemplatesByPersonality(personality, sentiment);
  } else {
    templates = getConfessionTemplatesByCategory(category, sentiment);
  }

  // 加权随机选择
  const selectedTemplate = selectWeightedConfessionTemplate(templates);

  if (!selectedTemplate) {
    return '感谢这个游戏带给我的美好回忆。';
  }

  // 替换占位符
  return replaceConfessionPlaceholders(selectedTemplate.content, data);
}

/**
 * 批量生成告白
 */
export function generateMultipleConfessions(
  count: number,
  personality: CharacterPersonality,
  category: ConfessionCategory,
  sentiment: SentimentType,
  data: ConfessionPlaceholderData
): string[] {
  const confessions: string[] = [];
  for (let i = 0; i < count; i++) {
    confessions.push(generateConfessionContent(personality, category, sentiment, data));
  }
  return confessions;
}

/**
 * 获取模板统计信息
 */
export function getConfessionTemplateStats(): {
  total: number;
  byPersonality: Record<CharacterPersonality, number>;
  byCategory: Record<ConfessionCategory, number>;
  bySentiment: Record<SentimentType, number>;
} {
  const allTemplates = getAllConfessionTemplates();

  const byPersonality: Record<CharacterPersonality, number> = {
    tsundere: 0,
    cool: 0,
    gentle: 0,
    mysterious: 0,
    yandere: 0,
    sunshine: 0,
    dominant: 0,
    shy: 0,
    playful: 0,
  };

  const byCategory: Record<ConfessionCategory, number> = {
    character: 0,
    plot: 0,
    official: 0,
    quit: 0,
  };

  const bySentiment: Record<SentimentType, number> = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  allTemplates.forEach(template => {
    byPersonality[template.personality]++;
    byCategory[template.category]++;
    bySentiment[template.sentiment]++;
  });

  return {
    total: allTemplates.length,
    byPersonality,
    byCategory,
    bySentiment,
  };
}

export default {
  tsundereConfessionTemplates,
  coolConfessionTemplates,
  gentleConfessionTemplates,
  mysteriousConfessionTemplates,
  yandereConfessionTemplates,
  sunshineConfessionTemplates,
  dominantConfessionTemplates,
  shyConfessionTemplates,
  playfulConfessionTemplates,
  plotConfessionTemplates,
  officialConfessionTemplates,
  quitConfessionTemplates,
  getAllConfessionTemplates,
  getConfessionTemplatesByPersonality,
  getConfessionTemplatesByCategory,
  selectWeightedConfessionTemplate,
  replaceConfessionPlaceholders,
  generateConfessionContent,
  generateMultipleConfessions,
  getConfessionTemplateStats,
};
