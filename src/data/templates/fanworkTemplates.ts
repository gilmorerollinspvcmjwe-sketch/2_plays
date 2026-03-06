/**
 * 同人模板系统
 * 按创作类型分类的同人模板
 * 支持绘画/文稿/视频/COS等类型
 */

import type { SentimentType } from '@/engine/contentGenerationEngine';

// ==================== 类型定义 ====================

/** 同人创作类型 */
export type FanworkType = 'drawing' | 'writing' | 'video' | 'cosplay';

/** 同人作品质量 */
export type FanworkQuality = 'excellent' | 'normal' | 'rough';

/** 同人模板结构 */
export interface FanworkTemplateItem {
  id: string;
  title: string;
  content: string;
  type: FanworkType;
  quality: FanworkQuality;
  sentiment: SentimentType;
  weight: number;
  tags: string[];
}

/** 占位符替换数据 */
export interface FanworkPlaceholderData {
  projectName?: string;
  characterName?: string;
  characterName2?: string;
  plotTitle?: string;
  chapter?: number;
  scene?: string;
  artistName?: string;
}

// ==================== 绘画类同人模板 ====================

export const drawingFanworkTemplates: Record<FanworkQuality, FanworkTemplateItem[]> = {
  excellent: [
    {
      id: 'draw_exc_001',
      title: '{characterName}的精致同人图',
      content: '精心绘制的{characterName}同人图，细节丰富，色彩饱满。耗时数天的用心之作，希望大家喜欢！',
      type: 'drawing',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['绘画', '精致', '细节']
    },
    {
      id: 'draw_exc_002',
      title: '{characterName}×{characterName2} CP向插画',
      content: '画了{characterName}和{characterName2}的互动场景，这对真的太甜了！画的时候全程姨母笑。',
      type: 'drawing',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['绘画', 'CP', '甜']
    },
    {
      id: 'draw_exc_003',
      title: '{plotTitle}场景还原',
      content: '还原了{plotTitle}中的经典场景，{characterName}的那个表情真的太让人心疼了。',
      type: 'drawing',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['绘画', '场景还原', '经典']
    },
    {
      id: 'draw_exc_004',
      title: '{characterName}现代paro',
      content: '画了现代设定的{characterName}，换了新衣服感觉也很合适呢！',
      type: 'drawing',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['绘画', '现代', 'paro']
    },
    {
      id: 'draw_exc_005',
      title: '{characterName}壁纸级美图',
      content: '高清{characterName}壁纸，分辨率足够大，可以直接当桌面使用！',
      type: 'drawing',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['绘画', '壁纸', '高清']
    },
  ],
  normal: [
    {
      id: 'draw_nor_001',
      title: '{characterName}随手画',
      content: '随手画的{characterName}，水平一般但画得很开心~',
      type: 'drawing',
      quality: 'normal',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['绘画', '随手', '开心']
    },
    {
      id: 'draw_nor_002',
      title: '{characterName}头像',
      content: '画了个{characterName}的头像，可以自用~',
      type: 'drawing',
      quality: 'normal',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['绘画', '头像', '自用']
    },
    {
      id: 'draw_nor_003',
      title: '{characterName}Q版',
      content: '画了个Q版{characterName}，萌萌哒~',
      type: 'drawing',
      quality: 'normal',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['绘画', 'Q版', '萌']
    },
    {
      id: 'draw_nor_004',
      title: '{characterName}草图',
      content: '{characterName}的草图，还没细化，先发出来看看反响。',
      type: 'drawing',
      quality: 'normal',
      sentiment: 'neutral',
      weight: 0.8,
      tags: ['绘画', '草图', '未完成']
    },
  ],
  rough: [
    {
      id: 'draw_rou_001',
      title: '{characterName}摸鱼',
      content: '上课/上班摸鱼画的{characterName}，很粗糙别喷QAQ',
      type: 'drawing',
      quality: 'rough',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['绘画', '摸鱼', '粗糙']
    },
    {
      id: 'draw_rou_002',
      title: '{characterName}涂鸦',
      content: '随手涂鸦的{characterName}，纯属练手作。',
      type: 'drawing',
      quality: 'rough',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['绘画', '涂鸦', '练手']
    },
    {
      id: 'draw_rou_003',
      title: '{characterName}火柴人',
      content: '火柴人版{characterName}，虽然简陋但是神韵有了吧？',
      type: 'drawing',
      quality: 'rough',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['绘画', '火柴人', '简陋']
    },
  ],
};

// ==================== 文稿类同人模板 ====================

export const writingFanworkTemplates: Record<FanworkQuality, FanworkTemplateItem[]> = {
  excellent: [
    {
      id: 'write_exc_001',
      title: '{characterName}×{characterName2} 长篇同人文',
      content: '精心创作的{characterName}和{characterName2}长篇同人文，全文5万字，讲述了{plotTitle}之后的甜蜜日常。文笔细腻，情感真挚，希望大家喜欢！',
      type: 'writing',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['文稿', '长篇', '细腻']
    },
    {
      id: 'write_exc_002',
      title: '{plotTitle}后续番外',
      content: '为{plotTitle}写的后续番外，填补了原作的遗憾。{characterName}终于得到了幸福，写的时候哭了好几次。',
      type: 'writing',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['文稿', '番外', '后续']
    },
    {
      id: 'write_exc_003',
      title: '{characterName}现代AU',
      content: '现代背景下的{characterName}，设定是大学教授×学生的禁忌之恋。文笔成熟，情节跌宕起伏。',
      type: 'writing',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['文稿', 'AU', '现代']
    },
    {
      id: 'write_exc_004',
      title: '{characterName}视角第一人称',
      content: '以{characterName}第一人称视角写的心理活动，深入刻画了角色的内心世界。',
      type: 'writing',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['文稿', '第一人称', '心理']
    },
    {
      id: 'write_exc_005',
      title: '{characterName}×{characterName2} 虐文',
      content: '玻璃渣里找糖吃的虐文，{characterName}和{characterName2}经历了重重磨难终于在一起。准备好纸巾再看！',
      type: 'writing',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['文稿', '虐文', '玻璃渣']
    },
  ],
  normal: [
    {
      id: 'write_nor_001',
      title: '{characterName}小短篇',
      content: '随手写的{characterName}小短篇，大概2000字，文笔一般但写得很开心。',
      type: 'writing',
      quality: 'normal',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['文稿', '短篇', '随手']
    },
    {
      id: 'write_nor_002',
      title: '{characterName}日常向',
      content: '写了{characterName}的日常生活片段，平淡但温馨的日常。',
      type: 'writing',
      quality: 'normal',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['文稿', '日常', '温馨']
    },
    {
      id: 'write_nor_003',
      title: '{plotTitle}改写',
      content: '不满意{plotTitle}的结局，自己写了一个HE版本。',
      type: 'writing',
      quality: 'normal',
      sentiment: 'neutral',
      weight: 0.8,
      tags: ['文稿', '改写', 'HE']
    },
    {
      id: 'write_nor_004',
      title: '{characterName}段子',
      content: '几个关于{characterName}的小段子，博君一笑。',
      type: 'writing',
      quality: 'normal',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['文稿', '段子', '搞笑']
    },
  ],
  rough: [
    {
      id: 'write_rou_001',
      title: '{characterName}脑洞',
      content: '突然想到的{characterName}脑洞，随手记录下来，可能以后扩写。',
      type: 'writing',
      quality: 'rough',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['文稿', '脑洞', '记录']
    },
    {
      id: 'write_rou_002',
      title: '{characterName}口嗨',
      content: '关于{characterName}的口嗨，没有逻辑，纯属自嗨。',
      type: 'writing',
      quality: 'rough',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['文稿', '口嗨', '自嗨']
    },
    {
      id: 'write_rou_003',
      title: '{characterName}大纲',
      content: '想写的{characterName}长篇大纲，先存着，有时间再写。',
      type: 'writing',
      quality: 'rough',
      sentiment: 'neutral',
      weight: 0.8,
      tags: ['文稿', '大纲', '存稿']
    },
  ],
};

// ==================== 视频类同人模板 ====================

export const videoFanworkTemplates: Record<FanworkQuality, FanworkTemplateItem[]> = {
  excellent: [
    {
      id: 'video_exc_001',
      title: '{characterName}心动瞬间剪辑',
      content: '精心剪辑的{characterName}心动瞬间合集，BGM是《xxx》，节奏卡点完美。每一个镜头都是精华，看完不心动算我输！',
      type: 'video',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['视频', '剪辑', '心动']
    },
    {
      id: 'video_exc_002',
      title: '{projectName}全员向混剪',
      content: '耗时一个月制作的全员向混剪，包含了所有角色的高光时刻。转场流畅，配乐大气，献给所有爱这个游戏的人。',
      type: 'video',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['视频', '混剪', '全员']
    },
    {
      id: 'video_exc_003',
      title: '{characterName}×{characterName2} CP向MAD',
      content: '为{characterName}和{characterName2}这对CP制作的MAD，讲述了他们从相识到相爱的过程。糖度超标，请自备胰岛素！',
      type: 'video',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['视频', 'MAD', 'CP']
    },
    {
      id: 'video_exc_004',
      title: '{plotTitle}剧情向剪辑',
      content: '以{plotTitle}为主线制作的剧情向剪辑，还原了故事的起承转合。剧情紧凑，情感饱满。',
      type: 'video',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['视频', '剧情', '还原']
    },
    {
      id: 'video_exc_005',
      title: '{characterName}台词向',
      content: '收集了{characterName}的所有经典台词，配上催泪BGM，听完哭成狗。',
      type: 'video',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['视频', '台词', '催泪']
    },
  ],
  normal: [
    {
      id: 'video_nor_001',
      title: '{characterName}片段合集',
      content: '随手剪辑的{characterName}片段合集，没什么技术含量，就是单纯喜欢这个角色。',
      type: 'video',
      quality: 'normal',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['视频', '合集', '喜欢']
    },
    {
      id: 'video_nor_002',
      title: '{characterName}踩点向',
      content: '尝试做了{characterName}的踩点向视频，卡点还不够准，继续努力。',
      type: 'video',
      quality: 'normal',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['视频', '踩点', '练习']
    },
    {
      id: 'video_nor_003',
      title: '{projectName}搞笑向',
      content: '用欢乐BGM打开{projectName}，意外地很合适呢！',
      type: 'video',
      quality: 'normal',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['视频', '搞笑', '欢乐']
    },
    {
      id: 'video_nor_004',
      title: '{characterName}舔颜向',
      content: '纯舔颜向，{characterName}的脸就是正义！',
      type: 'video',
      quality: 'normal',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['视频', '舔颜', '颜值']
    },
  ],
  rough: [
    {
      id: 'video_rou_001',
      title: '{characterName}录屏',
      content: '随手录的{characterName}片段，画质一般，仅供欣赏。',
      type: 'video',
      quality: 'rough',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['视频', '录屏', '随手']
    },
    {
      id: 'video_rou_002',
      title: '{characterName}PPT式剪辑',
      content: '新手第一次做剪辑，PPT式转场，轻喷。',
      type: 'video',
      quality: 'rough',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['视频', '新手', 'PPT']
    },
    {
      id: 'video_rou_003',
      title: '{characterName}素材堆积',
      content: '只是把喜欢的{characterName}片段拼在一起，没什么技术含量。',
      type: 'video',
      quality: 'rough',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['视频', '素材', '拼接']
    },
  ],
};

// ==================== COS类同人模板 ====================

export const cosplayFanworkTemplates: Record<FanworkQuality, FanworkTemplateItem[]> = {
  excellent: [
    {
      id: 'cos_exc_001',
      title: '{characterName}正片',
      content: '精心准备的{characterName}cos正片，从服装到妆容都力求还原。拍摄耗时三天，后期修图一个月。希望大家喜欢！',
      type: 'cosplay',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 1.0,
      tags: ['COS', '正片', '还原']
    },
    {
      id: 'cos_exc_002',
      title: '{characterName}×{characterName2} CP向cos',
      content: '和小伙伴一起出的{characterName}和{characterName2}，拍了一组互动向的照片。这对CP真的太甜了！',
      type: 'cosplay',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['COS', 'CP', '互动']
    },
    {
      id: 'cos_exc_003',
      title: '{plotTitle}场景还原cos',
      content: '还原了{plotTitle}中的经典场景，{scene}。为了还原场景特意去了外景地。',
      type: 'cosplay',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['COS', '场景还原', '外景']
    },
    {
      id: 'cos_exc_004',
      title: '{characterName}私设',
      content: '自己设计的{characterName}私设，融入了现代元素。服装和道具都是手工制作的。',
      type: 'cosplay',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['COS', '私设', '手工']
    },
    {
      id: 'cos_exc_005',
      title: '{characterName}战斗服',
      content: '制作了{characterName}的战斗服cos，铠甲部分全部手工打造，重达10斤。',
      type: 'cosplay',
      quality: 'excellent',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['COS', '战斗服', '铠甲']
    },
  ],
  normal: [
    {
      id: 'cos_nor_001',
      title: '{characterName}试妆',
      content: '{characterName}的试妆照，妆容还在调整中，先发出来看看效果。',
      type: 'cosplay',
      quality: 'normal',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['COS', '试妆', '调整']
    },
    {
      id: 'cos_nor_002',
      title: '{characterName}场照',
      content: '漫展上出的{characterName}，场照效果一般，但玩得很开心。',
      type: 'cosplay',
      quality: 'normal',
      sentiment: 'positive',
      weight: 0.9,
      tags: ['COS', '场照', '漫展']
    },
    {
      id: 'cos_nor_003',
      title: '{characterName}便服',
      content: '出了{characterName}的便服版本，比较日常，适合出门。',
      type: 'cosplay',
      quality: 'normal',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['COS', '便服', '日常']
    },
    {
      id: 'cos_nor_004',
      title: '{characterName}自拍',
      content: '在家自拍的{characterName}，背景有点乱见谅。',
      type: 'cosplay',
      quality: 'normal',
      sentiment: 'neutral',
      weight: 0.8,
      tags: ['COS', '自拍', '居家']
    },
  ],
  rough: [
    {
      id: 'cos_rou_001',
      title: '{characterName}素颜试衣',
      content: '素颜试{characterName}的衣服，还没化妆，先看看效果。',
      type: 'cosplay',
      quality: 'rough',
      sentiment: 'neutral',
      weight: 1.0,
      tags: ['COS', '试衣', '素颜']
    },
    {
      id: 'cos_rou_002',
      title: '{characterName}半成品',
      content: '衣服还没做完，先试穿一下看看效果。',
      type: 'cosplay',
      quality: 'rough',
      sentiment: 'neutral',
      weight: 0.9,
      tags: ['COS', '半成品', '制作中']
    },
    {
      id: 'cos_rou_003',
      title: '{characterName}表情包',
      content: 'cos{characterName}拍的一组表情包，沙雕向，请勿当真。',
      type: 'cosplay',
      quality: 'rough',
      sentiment: 'positive',
      weight: 0.8,
      tags: ['COS', '表情包', '沙雕']
    },
  ],
};

// ==================== 模板选择函数 ====================

/**
 * 获取所有同人模板
 */
export function getAllFanworkTemplates(): FanworkTemplateItem[] {
  return [
    ...drawingFanworkTemplates.excellent,
    ...drawingFanworkTemplates.normal,
    ...drawingFanworkTemplates.rough,
    ...writingFanworkTemplates.excellent,
    ...writingFanworkTemplates.normal,
    ...writingFanworkTemplates.rough,
    ...videoFanworkTemplates.excellent,
    ...videoFanworkTemplates.normal,
    ...videoFanworkTemplates.rough,
    ...cosplayFanworkTemplates.excellent,
    ...cosplayFanworkTemplates.normal,
    ...cosplayFanworkTemplates.rough,
  ];
}

/**
 * 根据类型获取模板
 */
export function getFanworkTemplatesByType(
  type: FanworkType,
  quality: FanworkQuality
): FanworkTemplateItem[] {
  const templateMap: Record<FanworkType, Record<FanworkQuality, FanworkTemplateItem[]>> = {
    drawing: drawingFanworkTemplates,
    writing: writingFanworkTemplates,
    video: videoFanworkTemplates,
    cosplay: cosplayFanworkTemplates,
  };

  return templateMap[type]?.[quality] || [];
}

/**
 * 根据质量获取所有类型的模板
 */
export function getFanworkTemplatesByQuality(quality: FanworkQuality): FanworkTemplateItem[] {
  return [
    ...drawingFanworkTemplates[quality],
    ...writingFanworkTemplates[quality],
    ...videoFanworkTemplates[quality],
    ...cosplayFanworkTemplates[quality],
  ];
}

/**
 * 加权随机选择模板
 */
export function selectWeightedFanworkTemplate(templates: FanworkTemplateItem[]): FanworkTemplateItem | null {
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
export function replaceFanworkPlaceholders(
  template: string,
  data: FanworkPlaceholderData
): string {
  let result = template;

  // 定义占位符映射
  const placeholderMap: Record<string, string | number | undefined> = {
    '{projectName}': data.projectName,
    '{characterName}': data.characterName,
    '{characterName2}': data.characterName2,
    '{plotTitle}': data.plotTitle,
    '{chapter}': data.chapter,
    '{scene}': data.scene,
    '{artistName}': data.artistName,
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
 * 生成同人作品标题
 */
export function generateFanworkTitle(
  type: FanworkType,
  quality: FanworkQuality,
  data: FanworkPlaceholderData
): string {
  const templates = getFanworkTemplatesByType(type, quality);
  const selectedTemplate = selectWeightedFanworkTemplate(templates);

  if (!selectedTemplate) {
    return `${data.characterName || '角色'}的同人作品`;
  }

  return replaceFanworkPlaceholders(selectedTemplate.title, data);
}

/**
 * 生成同人作品内容
 */
export function generateFanworkContent(
  type: FanworkType,
  quality: FanworkQuality,
  data: FanworkPlaceholderData
): string {
  const templates = getFanworkTemplatesByType(type, quality);
  const selectedTemplate = selectWeightedFanworkTemplate(templates);

  if (!selectedTemplate) {
    return `这是${data.characterName || '角色'}的同人作品。`;
  }

  return replaceFanworkPlaceholders(selectedTemplate.content, data);
}

/**
 * 生成完整同人作品
 */
export function generateFanwork(
  type: FanworkType,
  quality: FanworkQuality,
  data: FanworkPlaceholderData
): { title: string; content: string; tags: string[] } {
  const templates = getFanworkTemplatesByType(type, quality);
  const selectedTemplate = selectWeightedFanworkTemplate(templates);

  if (!selectedTemplate) {
    return {
      title: `${data.characterName || '角色'}的同人作品`,
      content: `这是${data.characterName || '角色'}的同人作品。`,
      tags: ['同人'],
    };
  }

  return {
    title: replaceFanworkPlaceholders(selectedTemplate.title, data),
    content: replaceFanworkPlaceholders(selectedTemplate.content, data),
    tags: selectedTemplate.tags,
  };
}

/**
 * 批量生成同人作品
 */
export function generateMultipleFanworks(
  count: number,
  type: FanworkType,
  quality: FanworkQuality,
  data: FanworkPlaceholderData
): { title: string; content: string; tags: string[] }[] {
  const fanworks: { title: string; content: string; tags: string[] }[] = [];
  for (let i = 0; i < count; i++) {
    fanworks.push(generateFanwork(type, quality, data));
  }
  return fanworks;
}

/**
 * 获取模板统计信息
 */
export function getFanworkTemplateStats(): {
  total: number;
  byType: Record<FanworkType, number>;
  byQuality: Record<FanworkQuality, number>;
  bySentiment: Record<SentimentType, number>;
} {
  const allTemplates = getAllFanworkTemplates();

  const byType: Record<FanworkType, number> = {
    drawing: 0,
    writing: 0,
    video: 0,
    cosplay: 0,
  };

  const byQuality: Record<FanworkQuality, number> = {
    excellent: 0,
    normal: 0,
    rough: 0,
  };

  const bySentiment: Record<SentimentType, number> = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  allTemplates.forEach(template => {
    byType[template.type]++;
    byQuality[template.quality]++;
    bySentiment[template.sentiment]++;
  });

  return {
    total: allTemplates.length,
    byType,
    byQuality,
    bySentiment,
  };
}

/**
 * 随机生成同人作品类型
 */
export function getRandomFanworkType(): FanworkType {
  const types: FanworkType[] = ['drawing', 'writing', 'video', 'cosplay'];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * 随机生成同人作品质量
 */
export function getRandomFanworkQuality(): FanworkQuality {
  const qualities: FanworkQuality[] = ['excellent', 'normal', 'rough'];
  const weights = [0.2, 0.5, 0.3]; // 优质作品较少

  const random = Math.random();
  let cumulativeWeight = 0;

  for (let i = 0; i < qualities.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      return qualities[i];
    }
  }

  return 'normal';
}

export default {
  drawingFanworkTemplates,
  writingFanworkTemplates,
  videoFanworkTemplates,
  cosplayFanworkTemplates,
  getAllFanworkTemplates,
  getFanworkTemplatesByType,
  getFanworkTemplatesByQuality,
  selectWeightedFanworkTemplate,
  replaceFanworkPlaceholders,
  generateFanworkTitle,
  generateFanworkContent,
  generateFanwork,
  generateMultipleFanworks,
  getFanworkTemplateStats,
  getRandomFanworkType,
  getRandomFanworkQuality,
};
