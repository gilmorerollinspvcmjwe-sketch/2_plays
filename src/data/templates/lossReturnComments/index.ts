/**
 * 退坑评论模板
 */
export const lossCommentTemplates = [
  { content: '这游戏不值得，退坑了', tags: ['退坑', '失望'] },
  { content: '爆率太毒了，再见', tags: ['爆率', '退坑'] },
  { content: '累了，不会再爱了', tags: ['退坑', '疲惫'] },
  { content: '连续 100 抽不出货，真的玩不下去了', tags: ['爆率', '退坑'] },
  { content: '官方太坑了，删游保平安', tags: ['官方', '退坑'] },
  { content: '这概率是认真的吗？告辞', tags: ['概率', '退坑'] },
  { content: '玩了一个月，什么都没抽到，拜拜', tags: ['退坑', '失望'] },
  { content: '卡池太深了，平民玩家玩不起', tags: ['卡池', '退坑'] },
  { content: '歪了 5 次了，真的受不了', tags: ['歪卡', '退坑'] },
  { content: '这游戏不适合非酋，我走了', tags: ['非酋', '退坑'] },
  { content: '活动太肝了，实在跟不上', tags: ['活动', '退坑'] },
  { content: '剧情越来越水，没意思了', tags: ['剧情', '退坑'] },
  { content: '角色太丑了，没有抽的欲望', tags: ['角色', '退坑'] },
  { content: '氪金体验太差了，不玩了', tags: ['氪金', '退坑'] },
  { content: '等关服了，再见', tags: ['退坑', '失望'] },
  { content: '这运营是真的不行', tags: ['运营', '退坑'] },
  { content: '抽卡体验太差，已弃坑', tags: ['抽卡', '退坑'] },
  { content: '玩了这么久就这？退坑了', tags: ['退坑', '失望'] },
  { content: '保底 90 抽？疯了吧', tags: ['保底', '退坑'] },
  { content: '这游戏没有未来，早跑早好', tags: ['退坑', '看衰'] }
];

/**
 * 真香评论模板
 */
export const returnCommentTemplates = [
  { content: '还是舍不得老公们，我回来了', tags: ['真香', '回归'] },
  { content: '听说最近有良心池，回来看看', tags: ['卡池', '回归'] },
  { content: '真香，重新下载了', tags: ['真香', '回归'] },
  { content: '想了一周，还是放不下他', tags: ['角色', '回归'] },
  { content: '看到新卡池又回来了，这次一定要出货！', tags: ['卡池', '回归'] },
  { content: '退坑三天，想他想得睡不着', tags: ['角色', '回归'] },
  { content: '官方发福利了？那我回来看看', tags: ['福利', '回归'] },
  { content: '嘴上说着退坑，身体很诚实', tags: ['真香', '回归'] },
  { content: '新剧情出了？马上回来！', tags: ['剧情', '回归'] },
  { content: '还是家里好，外面太累了', tags: ['真香', '回归'] },
  { content: '看到同担的图又回来了', tags: ['同人', '回归'] },
  { content: '生日活动必须支持，回来了', tags: ['活动', '回归'] },
  { content: '退坑后才发现最爱还是他', tags: ['角色', '回归'] },
  { content: '听说爆率提升了？我来试试', tags: ['爆率', '回归'] },
  { content: '舍不得公会的小伙伴们，回来了', tags: ['社交', '回归'] }
];

/**
 * 获取随机退坑评论
 */
export function getRandomLossComment(): { content: string; tags: string[] } {
  const randomIndex = Math.floor(Math.random() * lossCommentTemplates.length);
  return lossCommentTemplates[randomIndex];
}

/**
 * 获取随机真香评论
 */
export function getRandomReturnComment(): { content: string; tags: string[] } {
  const randomIndex = Math.floor(Math.random() * returnCommentTemplates.length);
  return returnCommentTemplates[randomIndex];
}
