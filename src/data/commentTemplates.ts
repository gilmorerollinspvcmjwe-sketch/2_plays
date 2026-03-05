/**
 * 评论模板数据
 * 用于玩家状态变化时自动生成评论
 */

// 退坑评论模板
export const quitCommentTemplates = [
  { content: '这游戏不值得，退坑了', tags: ['退坑', '失望'] },
  { content: '爆率太毒了，再见', tags: ['爆率', '退坑'] },
  { content: '剧情太虐，承受不住', tags: ['剧情', '退坑'] },
  { content: '运营太抠，玩不下去了', tags: ['运营', '退坑'] },
  { content: '累了，不会再爱了', tags: ['退坑', '疲惫'] },
  { content: '连续 100 抽不出货，真的玩不下去了', tags: ['爆率', '退坑'] },
  { content: '官方太坑了，删游保平安', tags: ['官方', '退坑'] },
  { content: '这概率是认真的吗？告辞', tags: ['概率', '退坑'] },
  { content: '卡池太深了，平民玩家玩不起', tags: ['卡池', '退坑'] },
  { content: '歪了 5 次了，真的受不了', tags: ['歪卡', '退坑'] }
];

// 真香评论模板
export const returnCommentTemplates = [
  { content: '还是舍不得老公们，我回来了', tags: ['真香', '回归'] },
  { content: '听说最近有良心池，回来看看', tags: ['卡池', '回归'] },
  { content: '被朋友安利了新剧情，真香', tags: ['剧情', '回归'] },
  { content: '离开后发现还是这个最好玩', tags: ['真香', '回归'] },
  { content: '真香，重新下载了', tags: ['真香', '回归'] },
  { content: '想了一周，还是放不下他', tags: ['角色', '回归'] },
  { content: '看到新卡池又回来了，这次一定要出货！', tags: ['卡池', '回归'] },
  { content: '退坑三天，想他想得睡不着', tags: ['角色', '回归'] },
  { content: '官方发福利了？那我回来看看', tags: ['福利', '回归'] },
  { content: '嘴上说着退坑，身体很诚实', tags: ['真香', '回归'] }
];

// 安利评论模板
export const recommendationTemplates = [
  { content: '安利给姐妹，剧情超棒！', tags: ['安利', '剧情'] },
  { content: '这游戏的男主太香了，推荐！', tags: ['安利', '角色'] },
  { content: '入坑不亏，福利很好', tags: ['安利', '福利'] },
  { content: '画风精美，剧情有深度，值得一玩', tags: ['安利', '画风'] },
  { content: '姐妹们快入坑，这个男主绝了！', tags: ['安利', '角色'] },
  { content: '剧情党狂喜，强烈推荐！', tags: ['安利', '剧情'] },
  { content: '这游戏的卡面质量太高了', tags: ['安利', '卡面'] },
  { content: '声优阵容豪华，体验感拉满', tags: ['安利', '声优'] },
  { content: '活动福利多，新人入坑好时机', tags: ['安利', '福利'] },
  { content: '每天上线看看老公就满足了', tags: ['安利', '角色'] }
];

// 平台权重配置
export const platformWeights = [
  { platform: 'weibo', weight: 0.40, name: '微博' },
  { platform: 'douyin', weight: 0.35, name: '抖音' },
  { platform: 'tieba', weight: 0.25, name: '贴吧' }
];

// 评论类型定义
export type CommentType = 'quit' | 'return' | 'recommendation';

// 平台类型
export type PlatformType = 'weibo' | 'douyin' | 'tieba';

/**
 * 根据权重随机选择平台
 */
export function getRandomPlatform(): PlatformType {
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (const item of platformWeights) {
    cumulativeWeight += item.weight;
    if (random < cumulativeWeight) {
      return item.platform as PlatformType;
    }
  }
  
  return 'weibo';
}

/**
 * 获取随机退坑评论
 */
export function getRandomQuitComment(): { content: string; tags: string[] } {
  const randomIndex = Math.floor(Math.random() * quitCommentTemplates.length);
  return quitCommentTemplates[randomIndex];
}

/**
 * 获取随机真香评论
 */
export function getRandomReturnComment(): { content: string; tags: string[] } {
  const randomIndex = Math.floor(Math.random() * returnCommentTemplates.length);
  return returnCommentTemplates[randomIndex];
}

/**
 * 获取随机安利评论
 */
export function getRandomRecommendationComment(): { content: string; tags: string[] } {
  const randomIndex = Math.floor(Math.random() * recommendationTemplates.length);
  return recommendationTemplates[randomIndex];
}

/**
 * 获取多条随机评论
 * @param type 评论类型
 * @param count 数量
 */
export function getRandomComments(
  type: CommentType,
  count: number
): Array<{ content: string; tags: string[]; type: CommentType }> {
  const results: Array<{ content: string; tags: string[]; type: CommentType }> = [];
  
  for (let i = 0; i < count; i++) {
    let comment: { content: string; tags: string[] };
    
    switch (type) {
      case 'quit':
        comment = getRandomQuitComment();
        break;
      case 'return':
        comment = getRandomReturnComment();
        break;
      case 'recommendation':
        comment = getRandomRecommendationComment();
        break;
      default:
        comment = getRandomQuitComment();
    }
    
    results.push({ ...comment, type });
  }
  
  return results;
}
