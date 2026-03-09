/**
 * 活动类评论模板
 */

export const eventCommentTemplates = {
  // 好评 - 对活动的正面评价
  positive: [
    '活动剧情太甜了！官方发糖我死了',
    '奖励好丰厚，白嫖党狂喜',
    '活动玩法有趣，不肝不氪',
    '限定皮肤太好看了，必入',
    '这次活动剧情写得太好了',
    '活动奖励的钻石好多，良心',
    '新活动的小游戏好有趣',
    '限定CG太美了，收藏了',
    '活动的UI设计好精美',
    '这次活动的音乐好好听',
    '活动剧情和角色互动好甜',
    '奖励的道具都很实用',
    '活动难度适中，体验很好',
    '限定称号好有排面',
    '活动的剧情配音太棒了',
    '这次活动的设计很用心',
    '活动奖励的角色好强',
    '限定背景好好看',
    '活动的剧情长度刚好',
    '这次活动我给满分'
  ],

  // 差评 - 对活动的负面评价
  negative: [
    '活动太肝了，根本做不完',
    '奖励抠门，打发叫花子呢',
    '活动剧情水，毫无诚意',
    'BUG一堆，体验极差',
    '活动难度太高，新手没法玩',
    '奖励和付出不成正比',
    '活动玩法太无聊了',
    '限定皮肤质量一般',
    '活动的剧情好短，不够看',
    '活动掉率太低了',
    '活动时间太短，肝不完',
    '活动的任务设计不合理',
    '奖励重复，没有新意',
    '活动的引导做得太差',
    '活动BUG影响游戏体验',
    '活动的剧情逻辑不通',
    '限定角色的强度一般',
    '活动的UI好丑',
    '活动的音乐好吵',
    '这次活动很失望'
  ],

  // 建议 - 对活动的改进建议
  suggestion: [
    '建议降低难度，新手太难了',
    '希望增加自动战斗，手打好累',
    '活动时间太短，延长一点吧',
    '建议增加跳过功能',
    '希望奖励能更丰富一些',
    '建议优化活动界面',
    '希望增加活动剧情回顾',
    '建议降低活动门槛',
    '希望增加活动提示',
    '建议优化活动流程',
    '希望增加活动预览',
    '建议增加活动帮助',
    '希望活动能常驻',
    '建议增加活动排行榜',
    '希望增加活动分享功能',
    '建议优化活动加载速度',
    '希望增加活动收藏功能',
    '建议增加活动提醒',
    '希望活动奖励能自选',
    '建议增加活动难度选择'
  ],

  // 期待 - 对未来活动的期待
  expect: [
    '期待下个活动',
    '希望下次活动剧情更甜',
    '期待新的限定角色',
    '希望下次奖励更丰厚',
    '期待新的活动玩法',
    '希望下次活动难度适中',
    '期待新的限定皮肤',
    '希望下次活动不肝',
    '期待新的活动剧情',
    '希望下次活动有惊喜',
    '期待周年庆活动',
    '希望下次活动有联动',
    '期待新的活动角色',
    '希望下次活动优化体验',
    '期待新的活动模式',
    '希望下次活动有新意',
    '期待节日活动',
    '希望下次活动有福利',
    '期待新的活动剧情线',
    '希望下次活动更精彩'
  ]
};

// 获取随机活动评论
export function getRandomEventComment(type?: keyof typeof eventCommentTemplates): string {
  const types = Object.keys(eventCommentTemplates) as Array<keyof typeof eventCommentTemplates>;
  const selectedType = type || types[Math.floor(Math.random() * types.length)];
  const templates = eventCommentTemplates[selectedType];
  return templates[Math.floor(Math.random() * templates.length)];
}

// 根据活动满意度获取评论
export function getEventCommentBySatisfaction(satisfaction: 'high' | 'medium' | 'low'): string {
  switch (satisfaction) {
    case 'high':
      return getRandomEventComment('positive');
    case 'low':
      return getRandomEventComment('negative');
    default:
      return getRandomEventComment();
  }
}
