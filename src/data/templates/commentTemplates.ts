/**
 * 评论模板系统
 * 按项目/角色/剧情分类的评论模板
 * 支持正面/负面/中立情感
 */

import type { SentimentType, Platform } from '@/engine/contentGenerationEngine';

// ==================== 模板类型定义 ====================

/** 评论分类 */
export type CommentCategory = 
  | 'project'    // 项目整体
  | 'character'  // 角色相关
  | 'plot'       // 剧情相关
  | 'activity'   // 活动相关
  | 'system';    // 系统相关

/** 评论模板结构 */
export interface CommentTemplateItem {
  id: string;
  content: string;
  category: CommentCategory;
  sentiment: SentimentType;
  platforms: Platform[];
  weight: number;
  tags: string[];
}

/** 占位符替换数据 */
export interface CommentPlaceholderData {
  projectName?: string;
  characterName?: string;
  plotTitle?: string;
  activityName?: string;
  rating?: number;
  chapter?: number;
  count?: number;
  price?: number;
  amount?: string;
}

// ==================== 项目整体评论模板 ====================

export const projectCommentTemplates: Record<SentimentType, CommentTemplateItem[]> = {
  positive: [
    {
      id: 'proj_pos_001',
      content: '{projectName}真的是年度最佳乙游！画风、剧情、配音都是顶级水准，强烈推荐！',
      category: 'project',
      sentiment: 'positive',
      platforms: ['taptap', 'weibo', 'bilibili'],
      weight: 1.0,
      tags: ['推荐', '年度最佳']
    },
    {
      id: 'proj_pos_002',
      content: '从开服玩到现在，{projectName}每次更新都有惊喜，制作组太用心了！',
      category: 'project',
      sentiment: 'positive',
      platforms: ['taptap', 'appstore'],
      weight: 0.9,
      tags: ['长期玩家', '更新']
    },
    {
      id: 'proj_pos_003',
      content: '谁懂啊家人们，{projectName}也太上头了吧，根本停不下来！',
      category: 'project',
      sentiment: 'positive',
      platforms: ['weibo', 'xiaohongshu'],
      weight: 0.8,
      tags: ['上头', '停不下来']
    },
    {
      id: 'proj_pos_004',
      content: '玩了这么多乙游，{projectName}是最对我胃口的，良心之作！',
      category: 'project',
      sentiment: 'positive',
      platforms: ['taptap', 'bilibili'],
      weight: 0.9,
      tags: ['良心', '对比']
    },
    {
      id: 'proj_pos_005',
      content: '{projectName}的音乐太好听了，每一首BGM都能单曲循环！',
      category: 'project',
      sentiment: 'positive',
      platforms: ['weibo', 'bilibili'],
      weight: 0.7,
      tags: ['音乐', 'BGM']
    },
    {
      id: 'proj_pos_006',
      content: '必须给{projectName}打满分！{rating}分都嫌少！',
      category: 'project',
      sentiment: 'positive',
      platforms: ['taptap', 'appstore'],
      weight: 0.8,
      tags: ['满分', '好评']
    },
    {
      id: 'proj_pos_007',
      content: '姐妹们快冲！{projectName}真的绝绝子，入股不亏！',
      category: 'project',
      sentiment: 'positive',
      platforms: ['xiaohongshu', 'weibo'],
      weight: 0.9,
      tags: ['推荐', '姐妹']
    },
    {
      id: 'proj_pos_008',
      content: '前方高能！{projectName}也太香了吧，UP主强烈推荐！',
      category: 'project',
      sentiment: 'positive',
      platforms: ['bilibili'],
      weight: 0.8,
      tags: ['推荐', 'UP主']
    },
  ],
  neutral: [
    {
      id: 'proj_neu_001',
      content: '整体还行吧，{projectName}中规中矩，玩起来打发时间还不错。',
      category: 'project',
      sentiment: 'neutral',
      platforms: ['taptap', 'appstore'],
      weight: 1.0,
      tags: ['一般', '打发时间']
    },
    {
      id: 'proj_neu_002',
      content: '游戏体验一般，{projectName}感觉可以做得更好，不过总体能玩。',
      category: 'project',
      sentiment: 'neutral',
      platforms: ['taptap'],
      weight: 0.9,
      tags: ['一般', '可玩']
    },
    {
      id: 'proj_neu_003',
      content: '刚开始玩{projectName}，感觉还可以吧，有待观察。',
      category: 'project',
      sentiment: 'neutral',
      platforms: ['appstore', 'taptap'],
      weight: 0.8,
      tags: ['新手', '观察']
    },
    {
      id: 'proj_neu_004',
      content: '玩了一段时间{projectName}了，无功无过，符合预期。',
      category: 'project',
      sentiment: 'neutral',
      platforms: ['taptap'],
      weight: 0.8,
      tags: ['长期', '预期']
    },
    {
      id: 'proj_neu_005',
      content: '{projectName}就是普通的乙游，没什么特别出彩的地方。',
      category: 'project',
      sentiment: 'neutral',
      platforms: ['weibo', 'xiaohongshu'],
      weight: 0.7,
      tags: ['普通', '乙游']
    },
    {
      id: 'proj_neu_006',
      content: '对{projectName}感觉一般般，可能不是我的菜吧。',
      category: 'project',
      sentiment: 'neutral',
      platforms: ['xiaohongshu'],
      weight: 0.7,
      tags: ['一般', '个人喜好']
    },
  ],
  negative: [
    {
      id: 'proj_neg_001',
      content: '{projectName}太让人失望了，完全不值这个评分。',
      category: 'project',
      sentiment: 'negative',
      platforms: ['taptap', 'appstore'],
      weight: 1.0,
      tags: ['失望', '评分']
    },
    {
      id: 'proj_neg_002',
      content: '氪金点太多了吧，{projectName}体验极差，肝不动了。',
      category: 'project',
      sentiment: 'negative',
      platforms: ['taptap', 'weibo'],
      weight: 0.9,
      tags: ['氪金', '肝']
    },
    {
      id: 'proj_neg_003',
      content: 'bug太多了，{projectName}经常闪退，客服也不理人。',
      category: 'project',
      sentiment: 'negative',
      platforms: ['taptap', 'appstore'],
      weight: 0.9,
      tags: ['bug', '闪退', '客服']
    },
    {
      id: 'proj_neg_004',
      content: '画饼充饥呢？{projectName}承诺的一个都没实现，欺骗玩家？',
      category: 'project',
      sentiment: 'negative',
      platforms: ['weibo', 'bilibili'],
      weight: 0.8,
      tags: ['画饼', '欺骗']
    },
    {
      id: 'proj_neg_005',
      content: '玩了两天就腻了，{projectName}内容太单调了。',
      category: 'project',
      sentiment: 'negative',
      platforms: ['taptap', 'appstore'],
      weight: 0.8,
      tags: ['单调', '无聊']
    },
    {
      id: 'proj_neg_006',
      content: '{projectName}服务器又炸了，补偿呢？',
      category: 'project',
      sentiment: 'negative',
      platforms: ['weibo', 'taptap'],
      weight: 0.8,
      tags: ['服务器', '补偿']
    },
    {
      id: 'proj_neg_007',
      content: '真的栓Q，{projectName}太让人失望了，卸载保平安！',
      category: 'project',
      sentiment: 'negative',
      platforms: ['xiaohongshu'],
      weight: 0.7,
      tags: ['失望', '卸载']
    },
    {
      id: 'proj_neg_008',
      content: '避雷！{projectName}也太差了吧，姐妹们快跑！',
      category: 'project',
      sentiment: 'negative',
      platforms: ['xiaohongshu', 'weibo'],
      weight: 0.8,
      tags: ['避雷', '差评']
    },
  ],
};

// ==================== 角色相关评论模板 ====================

export const characterCommentTemplates: Record<SentimentType, CommentTemplateItem[]> = {
  positive: [
    {
      id: 'char_pos_001',
      content: '{characterName}太香了！画风配音都是顶级，不愧是大制作！',
      category: 'character',
      sentiment: 'positive',
      platforms: ['taptap', 'bilibili'],
      weight: 1.0,
      tags: ['角色', '香']
    },
    {
      id: 'char_pos_002',
      content: '今天又被{characterName}戳到了！太帅了呜呜',
      category: 'character',
      sentiment: 'positive',
      platforms: ['weibo', 'xiaohongshu'],
      weight: 0.9,
      tags: ['戳', '帅']
    },
    {
      id: 'char_pos_003',
      content: '{characterName}的笑容也太杀我了叭，awsl',
      category: 'character',
      sentiment: 'positive',
      platforms: ['weibo', 'bilibili', 'xiaohongshu'],
      weight: 0.9,
      tags: ['笑容', 'awsl']
    },
    {
      id: 'char_pos_004',
      content: '我要为{characterName}打call一辈子！这个角色塑造得太好了！',
      category: 'character',
      sentiment: 'positive',
      platforms: ['taptap', 'weibo'],
      weight: 0.9,
      tags: ['打call', '塑造']
    },
    {
      id: 'char_pos_005',
      content: '{characterName}那种外冷内热的感觉真的太戳我了...',
      category: 'character',
      sentiment: 'positive',
      platforms: ['weibo', 'xiaohongshu'],
      weight: 0.8,
      tags: ['外冷内热', '戳']
    },
    {
      id: 'char_pos_006',
      content: '又是为{characterName}疯狂心动的一天！',
      category: 'character',
      sentiment: 'positive',
      platforms: ['weibo', 'xiaohongshu'],
      weight: 0.8,
      tags: ['心动', '一天']
    },
    {
      id: 'char_pos_007',
      content: '新老公{characterName}太帅了，我直接嗨老公！',
      category: 'character',
      sentiment: 'positive',
      platforms: ['weibo', 'bilibili'],
      weight: 0.9,
      tags: ['老公', '帅']
    },
    {
      id: 'char_pos_008',
      content: '{characterName}的立绘也太绝了吧，每一帧都可以当壁纸！',
      category: 'character',
      sentiment: 'positive',
      platforms: ['xiaohongshu', 'bilibili'],
      weight: 0.8,
      tags: ['立绘', '壁纸']
    },
  ],
  neutral: [
    {
      id: 'char_neu_001',
      content: '{characterName}还行吧，人设比较常见。',
      category: 'character',
      sentiment: 'neutral',
      platforms: ['taptap', 'weibo'],
      weight: 1.0,
      tags: ['人设', '常见']
    },
    {
      id: 'char_neu_002',
      content: '对{characterName}感觉一般，没有特别戳我的点。',
      category: 'character',
      sentiment: 'neutral',
      platforms: ['taptap'],
      weight: 0.9,
      tags: ['一般', '无感']
    },
    {
      id: 'char_neu_003',
      content: '{characterName}塑造得中规中矩，没什么记忆点。',
      category: 'character',
      sentiment: 'neutral',
      platforms: ['taptap', 'weibo'],
      weight: 0.8,
      tags: ['塑造', '记忆点']
    },
    {
      id: 'char_neu_004',
      content: '{characterName}还可以，但不是我喜欢的类型。',
      category: 'character',
      sentiment: 'neutral',
      platforms: ['xiaohongshu'],
      weight: 0.8,
      tags: ['类型', '喜好']
    },
    {
      id: 'char_neu_005',
      content: '感觉{characterName}的剧情线有点平淡。',
      category: 'character',
      sentiment: 'neutral',
      platforms: ['taptap'],
      weight: 0.7,
      tags: ['剧情线', '平淡']
    },
  ],
  negative: [
    {
      id: 'char_neg_001',
      content: '{characterName}的剧情太拉胯了，玩得我尴尬症都犯了。',
      category: 'character',
      sentiment: 'negative',
      platforms: ['taptap', 'weibo'],
      weight: 1.0,
      tags: ['剧情', '尴尬']
    },
    {
      id: 'char_neg_002',
      content: '这{characterName}的立绘崩了吧，脸都歪了。',
      category: 'character',
      sentiment: 'negative',
      platforms: ['taptap', 'xiaohongshu'],
      weight: 0.9,
      tags: ['立绘', '崩']
    },
    {
      id: 'char_neg_003',
      content: '{characterName}的配音棒读得我都尴尬。',
      category: 'character',
      sentiment: 'negative',
      platforms: ['taptap', 'bilibili'],
      weight: 0.8,
      tags: ['配音', '棒读']
    },
    {
      id: 'char_neg_004',
      content: '不喜欢{characterName}这种人设，太老套了。',
      category: 'character',
      sentiment: 'negative',
      platforms: ['weibo', 'xiaohongshu'],
      weight: 0.8,
      tags: ['人设', '老套']
    },
    {
      id: 'char_neg_005',
      content: '{characterName}的剧情强行降智，跟个傻子一样。',
      category: 'character',
      sentiment: 'negative',
      platforms: ['taptap'],
      weight: 0.8,
      tags: ['剧情', '降智']
    },
    {
      id: 'char_neg_006',
      content: '这{characterName}谁爱推谁推吧，我是推不下去了。',
      category: 'character',
      sentiment: 'negative',
      platforms: ['weibo', 'bilibili'],
      weight: 0.7,
      tags: ['推', '放弃']
    },
  ],
};

// ==================== 剧情相关评论模板 ====================

export const plotCommentTemplates: Record<SentimentType, CommentTemplateItem[]> = {
  positive: [
    {
      id: 'plot_pos_001',
      content: '{plotTitle}的剧情太精彩了！哭得稀里哗啦的，强烈推荐！',
      category: 'plot',
      sentiment: 'positive',
      platforms: ['taptap', 'weibo'],
      weight: 1.0,
      tags: ['剧情', '精彩']
    },
    {
      id: 'plot_pos_002',
      content: '第{chapter}章{plotTitle}封神了，制作组太懂了！',
      category: 'plot',
      sentiment: 'positive',
      platforms: ['taptap', 'bilibili'],
      weight: 0.9,
      tags: ['封神', '制作组']
    },
    {
      id: 'plot_pos_003',
      content: '{plotTitle}太感动了呜呜呜，哭湿了枕头...',
      category: 'plot',
      sentiment: 'positive',
      platforms: ['weibo', 'xiaohongshu'],
      weight: 0.9,
      tags: ['感动', '哭']
    },
    {
      id: 'plot_pos_004',
      content: '今天的剧情糖分超标了，{plotTitle}甜到我蛀牙！',
      category: 'plot',
      sentiment: 'positive',
      platforms: ['weibo', 'xiaohongshu'],
      weight: 0.8,
      tags: ['糖分', '甜']
    },
    {
      id: 'plot_pos_005',
      content: '这剧情转折我真的服了，{plotTitle}太会写了！',
      category: 'plot',
      sentiment: 'positive',
      platforms: ['taptap', 'bilibili'],
      weight: 0.9,
      tags: ['转折', '编剧']
    },
    {
      id: 'plot_pos_006',
      content: '虐的我心肝疼，但是{plotTitle}好上头啊...',
      category: 'plot',
      sentiment: 'positive',
      platforms: ['weibo', 'xiaohongshu'],
      weight: 0.8,
      tags: ['虐', '上头']
    },
    {
      id: 'plot_pos_007',
      content: '这段{plotTitle}回忆杀太戳我了，编剧太会了！',
      category: 'plot',
      sentiment: 'positive',
      platforms: ['weibo', 'bilibili'],
      weight: 0.8,
      tags: ['回忆杀', '戳']
    },
    {
      id: 'plot_pos_008',
      content: '{plotTitle}的结局太完美了，圆满了！',
      category: 'plot',
      sentiment: 'positive',
      platforms: ['taptap', 'weibo'],
      weight: 0.8,
      tags: ['结局', '圆满']
    },
  ],
  neutral: [
    {
      id: 'plot_neu_001',
      content: '{plotTitle}还行吧，剧情发展在意料之中。',
      category: 'plot',
      sentiment: 'neutral',
      platforms: ['taptap'],
      weight: 1.0,
      tags: ['剧情', '意料之中']
    },
    {
      id: 'plot_neu_002',
      content: '第{chapter}章{plotTitle}一般般，没什么特别的感觉。',
      category: 'plot',
      sentiment: 'neutral',
      platforms: ['taptap', 'weibo'],
      weight: 0.9,
      tags: ['一般', '无感']
    },
    {
      id: 'plot_neu_003',
      content: '{plotTitle}的剧情中规中矩，能看但不惊艳。',
      category: 'plot',
      sentiment: 'neutral',
      platforms: ['taptap'],
      weight: 0.8,
      tags: ['中规中矩', '一般']
    },
    {
      id: 'plot_neu_004',
      content: '感觉{plotTitle}的节奏有点慢，但还能接受。',
      category: 'plot',
      sentiment: 'neutral',
      platforms: ['taptap', 'weibo'],
      weight: 0.8,
      tags: ['节奏', '慢']
    },
    {
      id: 'plot_neu_005',
      content: '{plotTitle}的剧情走向比较常规，没什么惊喜。',
      category: 'plot',
      sentiment: 'neutral',
      platforms: ['taptap'],
      weight: 0.7,
      tags: ['常规', '无惊喜']
    },
  ],
  negative: [
    {
      id: 'plot_neg_001',
      content: '{plotTitle}剧情太拉胯了，玩得我尴尬症都犯了，差评！',
      category: 'plot',
      sentiment: 'negative',
      platforms: ['taptap', 'weibo'],
      weight: 1.0,
      tags: ['剧情', '尴尬']
    },
    {
      id: 'plot_neg_002',
      content: '这{plotTitle}结局烂尾，对得起我氪的金吗？',
      category: 'plot',
      sentiment: 'negative',
      platforms: ['taptap', 'bilibili'],
      weight: 0.9,
      tags: ['烂尾', '结局']
    },
    {
      id: 'plot_neg_003',
      content: '{plotTitle}剧情水得可以，一章就几句话。',
      category: 'plot',
      sentiment: 'negative',
      platforms: ['taptap'],
      weight: 0.8,
      tags: ['水', '敷衍']
    },
    {
      id: 'plot_neg_004',
      content: '这剧情走向我服了，{plotTitle}编剧是不是没谈过恋爱。',
      category: 'plot',
      sentiment: 'negative',
      platforms: ['weibo', 'taptap'],
      weight: 0.9,
      tags: ['编剧', '恋爱']
    },
    {
      id: 'plot_neg_005',
      content: '{plotTitle}强行降智，女主跟个傻子一样。',
      category: 'plot',
      sentiment: 'negative',
      platforms: ['taptap'],
      weight: 0.8,
      tags: ['降智', '女主']
    },
    {
      id: 'plot_neg_006',
      content: '这{plotTitle}伏笔埋了这么久，结果就这？',
      category: 'plot',
      sentiment: 'negative',
      platforms: ['weibo', 'bilibili'],
      weight: 0.8,
      tags: ['伏笔', '失望']
    },
  ],
};

// ==================== 活动相关评论模板 ====================

export const activityCommentTemplates: Record<SentimentType, CommentTemplateItem[]> = {
  positive: [
    {
      id: 'act_pos_001',
      content: '{activityName}活动太棒了！福利超多，白嫖党狂喜！',
      category: 'activity',
      sentiment: 'positive',
      platforms: ['taptap', 'weibo'],
      weight: 1.0,
      tags: ['活动', '福利']
    },
    {
      id: 'act_pos_002',
      content: '周年庆{activityName}活动太棒了，官方大气！',
      category: 'activity',
      sentiment: 'positive',
      platforms: ['weibo', 'bilibili'],
      weight: 0.9,
      tags: ['周年庆', '官方']
    },
    {
      id: 'act_pos_003',
      content: '{activityName}的奖励太丰厚了，这波血赚！',
      category: 'activity',
      sentiment: 'positive',
      platforms: ['taptap', 'weibo'],
      weight: 0.9,
      tags: ['奖励', '血赚']
    },
    {
      id: 'act_pos_004',
      content: '这次{activityName}活动的剧情太甜了，糖分超标！',
      category: 'activity',
      sentiment: 'positive',
      platforms: ['weibo', 'xiaohongshu'],
      weight: 0.8,
      tags: ['剧情', '甜']
    },
    {
      id: 'act_pos_005',
      content: '{activityName}活动的时装都很好看，钱包保不住了！',
      category: 'activity',
      sentiment: 'positive',
      platforms: ['xiaohongshu', 'weibo'],
      weight: 0.8,
      tags: ['时装', '钱包']
    },
  ],
  neutral: [
    {
      id: 'act_neu_001',
      content: '{activityName}活动还行吧，正常水平。',
      category: 'activity',
      sentiment: 'neutral',
      platforms: ['taptap'],
      weight: 1.0,
      tags: ['活动', '一般']
    },
    {
      id: 'act_neu_002',
      content: '这次{activityName}无功无过，没什么特别的。',
      category: 'activity',
      sentiment: 'neutral',
      platforms: ['taptap', 'weibo'],
      weight: 0.9,
      tags: ['一般', '普通']
    },
    {
      id: 'act_neu_003',
      content: '{activityName}活动奖励一般，勉强能接受。',
      category: 'activity',
      sentiment: 'neutral',
      platforms: ['taptap'],
      weight: 0.8,
      tags: ['奖励', '一般']
    },
  ],
  negative: [
    {
      id: 'act_neg_001',
      content: '{activityName}活动肝度太高，根本做不完！',
      category: 'activity',
      sentiment: 'negative',
      platforms: ['taptap', 'weibo'],
      weight: 1.0,
      tags: ['肝', '做不完']
    },
    {
      id: 'act_neg_002',
      content: '这{activityName}活动奖励也太抠了吧，打发叫花子呢？',
      category: 'activity',
      sentiment: 'negative',
      platforms: ['weibo', 'taptap'],
      weight: 0.9,
      tags: ['奖励', '抠']
    },
    {
      id: 'act_neg_003',
      content: '{activityName}活动又卡关了，这BUG什么时候修？',
      category: 'activity',
      sentiment: 'negative',
      platforms: ['taptap'],
      weight: 0.8,
      tags: ['卡关', 'bug']
    },
    {
      id: 'act_neg_004',
      content: '对比隔壁游戏，{activityName}福利太少了。',
      category: 'activity',
      sentiment: 'negative',
      platforms: ['taptap', 'weibo'],
      weight: 0.8,
      tags: ['对比', '福利']
    },
  ],
};

// ==================== 系统相关评论模板 ====================

export const systemCommentTemplates: Record<SentimentType, CommentTemplateItem[]> = {
  positive: [
    {
      id: 'sys_pos_001',
      content: '新手引导很友好，{projectName}适合入坑！',
      category: 'system',
      sentiment: 'positive',
      platforms: ['taptap', 'appstore'],
      weight: 1.0,
      tags: ['新手', '引导']
    },
    {
      id: 'sys_pos_002',
      content: '社交系统很有趣，在{projectName}认识了很多同好！',
      category: 'system',
      sentiment: 'positive',
      platforms: ['weibo', 'taptap'],
      weight: 0.8,
      tags: ['社交', '同好']
    },
    {
      id: 'sys_pos_003',
      content: '加载速度变快了，{projectName}优化得不错！',
      category: 'system',
      sentiment: 'positive',
      platforms: ['taptap'],
      weight: 0.8,
      tags: ['加载', '优化']
    },
  ],
  neutral: [
    {
      id: 'sys_neu_001',
      content: '系统功能还算齐全，用起来还行。',
      category: 'system',
      sentiment: 'neutral',
      platforms: ['taptap'],
      weight: 1.0,
      tags: ['系统', '功能']
    },
    {
      id: 'sys_neu_002',
      content: 'UI设计一般般，能找到功能但不够直观。',
      category: 'system',
      sentiment: 'neutral',
      platforms: ['taptap'],
      weight: 0.8,
      tags: ['UI', '设计']
    },
  ],
  negative: [
    {
      id: 'sys_neg_001',
      content: '这UI设计反人类，找不到入口！',
      category: 'system',
      sentiment: 'negative',
      platforms: ['taptap'],
      weight: 1.0,
      tags: ['UI', '反人类']
    },
    {
      id: 'sys_neg_002',
      content: '加载慢得要死，{projectName}优化一下行吗？',
      category: 'system',
      sentiment: 'negative',
      platforms: ['taptap', 'appstore'],
      weight: 0.9,
      tags: ['加载', '优化']
    },
    {
      id: 'sys_neg_003',
      content: '更新后更卡了，{projectName}反向优化？',
      category: 'system',
      sentiment: 'negative',
      platforms: ['taptap', 'weibo'],
      weight: 0.8,
      tags: ['更新', '卡顿']
    },
  ],
};

// ==================== 模板选择函数 ====================

/**
 * 获取所有评论模板
 */
export function getAllCommentTemplates(): CommentTemplateItem[] {
  return [
    ...projectCommentTemplates.positive,
    ...projectCommentTemplates.neutral,
    ...projectCommentTemplates.negative,
    ...characterCommentTemplates.positive,
    ...characterCommentTemplates.neutral,
    ...characterCommentTemplates.negative,
    ...plotCommentTemplates.positive,
    ...plotCommentTemplates.neutral,
    ...plotCommentTemplates.negative,
    ...activityCommentTemplates.positive,
    ...activityCommentTemplates.neutral,
    ...activityCommentTemplates.negative,
    ...systemCommentTemplates.positive,
    ...systemCommentTemplates.neutral,
    ...systemCommentTemplates.negative,
  ];
}

/**
 * 根据分类和情感获取模板
 */
export function getCommentTemplatesByCategoryAndSentiment(
  category: CommentCategory,
  sentiment: SentimentType
): CommentTemplateItem[] {
  const templateMap: Record<CommentCategory, Record<SentimentType, CommentTemplateItem[]>> = {
    project: projectCommentTemplates,
    character: characterCommentTemplates,
    plot: plotCommentTemplates,
    activity: activityCommentTemplates,
    system: systemCommentTemplates,
  };

  return templateMap[category]?.[sentiment] || [];
}

/**
 * 根据平台筛选模板
 */
export function filterTemplatesByPlatform(
  templates: CommentTemplateItem[],
  platform: Platform
): CommentTemplateItem[] {
  return templates.filter(t => t.platforms.includes(platform));
}

/**
 * 加权随机选择模板
 */
export function selectWeightedTemplate(templates: CommentTemplateItem[]): CommentTemplateItem | null {
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
export function replaceCommentPlaceholders(
  template: string,
  data: CommentPlaceholderData
): string {
  let result = template;

  // 定义占位符映射
  const placeholderMap: Record<string, string | number | undefined> = {
    '{projectName}': data.projectName,
    '{characterName}': data.characterName,
    '{plotTitle}': data.plotTitle,
    '{activityName}': data.activityName,
    '{rating}': data.rating,
    '{chapter}': data.chapter,
    '{count}': data.count,
    '{price}': data.price,
    '{amount}': data.amount,
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
 * 生成评论内容
 */
export function generateCommentContent(
  category: CommentCategory,
  sentiment: SentimentType,
  platform: Platform,
  data: CommentPlaceholderData
): string {
  // 获取对应分类和情感的模板
  const templates = getCommentTemplatesByCategoryAndSentiment(category, sentiment);

  // 根据平台筛选
  const platformTemplates = filterTemplatesByPlatform(templates, platform);

  // 如果没有平台特定模板，使用所有模板
  const availableTemplates = platformTemplates.length > 0 ? platformTemplates : templates;

  // 加权随机选择
  const selectedTemplate = selectWeightedTemplate(availableTemplates);

  if (!selectedTemplate) {
    return '这个游戏还不错。';
  }

  // 替换占位符
  return replaceCommentPlaceholders(selectedTemplate.content, data);
}

/**
 * 批量生成评论
 */
export function generateMultipleComments(
  count: number,
  category: CommentCategory,
  sentiment: SentimentType,
  platform: Platform,
  data: CommentPlaceholderData
): string[] {
  const comments: string[] = [];
  for (let i = 0; i < count; i++) {
    comments.push(generateCommentContent(category, sentiment, platform, data));
  }
  return comments;
}

/**
 * 获取模板统计信息
 */
export function getCommentTemplateStats(): {
  total: number;
  byCategory: Record<CommentCategory, number>;
  bySentiment: Record<SentimentType, number>;
} {
  const allTemplates = getAllCommentTemplates();

  const byCategory: Record<CommentCategory, number> = {
    project: 0,
    character: 0,
    plot: 0,
    activity: 0,
    system: 0,
  };

  const bySentiment: Record<SentimentType, number> = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  allTemplates.forEach(template => {
    byCategory[template.category]++;
    bySentiment[template.sentiment]++;
  });

  return {
    total: allTemplates.length,
    byCategory,
    bySentiment,
  };
}

export default {
  projectCommentTemplates,
  characterCommentTemplates,
  plotCommentTemplates,
  activityCommentTemplates,
  systemCommentTemplates,
  getAllCommentTemplates,
  getCommentTemplatesByCategoryAndSentiment,
  filterTemplatesByPlatform,
  selectWeightedTemplate,
  replaceCommentPlaceholders,
  generateCommentContent,
  generateMultipleComments,
  getCommentTemplateStats,
};
