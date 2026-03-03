/**
 * 评论模板库
 * 用于模拟AI生成玩家评论
 */

import type { CommentType, CommentSentiment, CommentIntensity, PlayerType, CommentTemplate } from '@/types/template';

// 吐槽类评论模板
const roastTemplates: string[] = [
  '抽了{count}连全是R卡，这爆率认真的吗？？？',
  '这剧情走向我服了，编剧是不是没谈过恋爱',
  '一个皮肤要{price}，你怎么不去抢',
  '又卡关了，这BUG什么时候修',
  '这男主立绘崩了吧，脸都歪了',
  '剧情水得可以，一章就几句话',
  '氪了{amount}还是抽不到，退游了',
  '这配音棒读得我都尴尬',
  '活动肝度太高，根本做不完',
  '对比隔壁游戏，福利太少了',
  '这文案写的什么鬼，小学生作文吗',
  '服务器又炸了，补偿呢？',
  '新角色强度太离谱，平衡性呢？',
  '这UI设计反人类，找不到入口',
  '加载慢得要死，优化一下行吗',
  '剧情强行降智，女主跟个傻子一样',
  '这结局烂尾，对得起我氪的金吗',
  '卡池毒得要命，UP角色是假的吧',
  '客服态度太差，反馈了也不理',
  '更新后更卡了，反向优化？'
];

// 推荐类评论模板
const recommendTemplates: string[] = [
  '剧情太甜了！姐妹们快冲！',
  '新老公太帅了，我直接嗨老公',
  '年度最佳乙游，不玩后悔',
  '这章剧情封神了，哭得我稀里哗啦',
  '画风精美，每一帧都可以当壁纸',
  '配音阵容豪华，耳朵怀孕了',
  '文案写得很好，代入感超强',
  '活动福利超多，白嫖党狂喜',
  '角色塑造立体，每个男主都很有魅力',
  '音乐太好听了，求OST',
  '剧情节奏把握得很好，不拖沓',
  '新手引导很友好，适合入坑',
  '社交系统很有趣，认识了很多同好',
  '时装都很好看，钱包保不住了',
  '这游戏太上头了，停不下来'
];

// 剧情讨论类评论模板
const dramaTemplates: string[] = [
  '我觉得男主背后一定有故事',
  '第{chapter}章那个选择你们怎么选的？',
  '这结局我哭死，太感人了',
  '有人看懂那个伏笔了吗？',
  '预测一下后续剧情走向',
  '这个角色的真实身份是什么？',
  '女主和男主的相遇是命中注定吧',
  '这段回忆杀太戳我了',
  '编剧是不是换了？风格变了',
  '这个转折我没想到，太精彩了',
  '求解析这段剧情的深层含义',
  '有人觉得这里不合理吗？',
  '这段对话写得太好了，反复品味',
  '期待后续发展，希望不要be',
  '这个角色的成长弧光很完整'
];

// 梗图/玩梗类评论模板
const memeTemplates: string[] = [
  '老公说他心里有我',
  '钱包：你清高，你了不起',
  '抽卡前 vs 抽卡后.jpg',
  '这像极了我单身的理由',
  '别人玩游戏 vs 我玩游戏',
  '氪金前的我 vs 氪金后的我',
  '这剧情甜得我牙疼',
  '我的存款：-9999',
  '这爆率，我直接emo',
  '每天上线就是为了看老公'
];

// 玩家类型关键词映射
const playerTypeKeywords: Record<PlayerType, string[]> = {
  '氪金大佬': ['氪了', '万', '全图鉴', '满破', '重氪'],
  '剧情党': ['剧情', '文案', '伏笔', '结局', '编剧', '设定'],
  '外观党': ['立绘', '画风', '皮肤', '时装', '颜值', '精美'],
  '休闲玩家': ['佛系', '养老', '慢慢玩', '不肝', '白嫖', '随缘']
};

// 情感分析关键词
const sentimentKeywords = {
  positive: ['好', '棒', '优秀', '精彩', '甜', '美', '帅', '爱', '喜欢', '推荐', '冲', '神'],
  negative: ['差', '烂', '崩', '毒', '坑', '骗', '气', '哭', '退', '吐槽', '服', '死'],
  neutral: ['怎么样', '如何', '觉得', '认为', '可能', '也许', '大概', '一般']
};

/**
 * 获取评论模板
 */
export function getCommentTemplates(type: CommentType): string[] {
  switch (type) {
    case 'roast':
      return roastTemplates;
    case 'recommend':
      return recommendTemplates;
    case 'drama':
      return dramaTemplates;
    case 'meme':
      return memeTemplates;
    default:
      return roastTemplates;
  }
}

/**
 * 生成随机评论内容
 */
export function generateCommentContent(
  type: CommentType,
  playerType: PlayerType
): string {
  const templates = getCommentTemplates(type);
  let template = templates[Math.floor(Math.random() * templates.length)];
  
  // 替换模板变量
  const variables: Record<string, string | number> = {
    count: Math.floor(Math.random() * 100) + 50,
    price: Math.floor(Math.random() * 100) + 100,
    amount: Math.floor(Math.random() * 10) + 1,
    chapter: Math.floor(Math.random() * 10) + 1
  };
  
  Object.keys(variables).forEach(key => {
    template = template.replace(`{${key}}`, String(variables[key]));
  });
  
  // 根据玩家类型添加关键词
  const keywords = playerTypeKeywords[playerType];
  if (keywords && Math.random() > 0.5) {
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    template += ` #${keyword}`;
  }
  
  return template;
}

/**
 * 分析评论情感
 */
export function analyzeSentiment(content: string): CommentSentiment {
  let positiveScore = 0;
  let negativeScore = 0;
  
  sentimentKeywords.positive.forEach(word => {
    if (content.includes(word)) positiveScore++;
  });
  
  sentimentKeywords.negative.forEach(word => {
    if (content.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

/**
 * 获取情绪强度
 */
export function getIntensity(content: string): CommentIntensity {
  const intenseMarks = ['！', '!', '？', '?', '...', '。。。'];
  let intensity = 1;
  
  intenseMarks.forEach(mark => {
    const count = content.split(mark).length - 1;
    if (count >= 3) intensity = 3;
    else if (count >= 1 && intensity < 2) intensity = 2;
  });
  
  return intensity as CommentIntensity;
}

/**
 * 提取标签
 */
export function extractTags(content: string, playerType: PlayerType): string[] {
  const tags: string[] = [];
  const keywords = playerTypeKeywords[playerType];
  
  keywords.forEach(keyword => {
    if (content.includes(keyword) && !tags.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  // 添加通用标签
  const commonTags = ['老公', '剧情', '抽卡', '氪金', '活动'];
  commonTags.forEach(tag => {
    if (content.includes(tag) && !tags.includes(tag)) {
      tags.push(tag);
    }
  });
  
  return tags.slice(0, 3); // 最多3个标签
}

/**
 * 生成完整评论
 */
export function generateComment(
  type: CommentType,
  playerType: PlayerType
): CommentTemplate {
  const content = generateCommentContent(type, playerType);
  const sentiment = analyzeSentiment(content);
  const intensity = getIntensity(content);
  const tags = extractTags(content, playerType);
  
  return {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    content,
    sentiment,
    intensity,
    playerType,
    tags
  };
}

/**
 * 批量生成评论
 */
export function generateComments(
  type: CommentType,
  playerType: PlayerType,
  count: number
): CommentTemplate[] {
  const comments: CommentTemplate[] = [];
  for (let i = 0; i < count; i++) {
    comments.push(generateComment(type, playerType));
  }
  return comments;
}

/**
 * 获取随机玩家类型
 */
export function getRandomPlayerType(): PlayerType {
  const types: PlayerType[] = ['氪金大佬', '剧情党', '外观党', '休闲玩家'];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * 获取随机评论类型
 */
export function getRandomCommentType(): CommentType {
  const types: CommentType[] = ['roast', 'recommend', 'drama', 'meme'];
  return types[Math.floor(Math.random() * types.length)];
}
