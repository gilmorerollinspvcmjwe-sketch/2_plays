/**
 * 评论模板导出文件
 */

export { gachaCommentTemplates, getRandomGachaComment, getGachaCommentByPlayerType } from './gachaComments';
export { characterCommentTemplates, getRandomCharacterComment, getCharacterCommentByPlayerType } from './characterComments';
export { eventCommentTemplates, getRandomEventComment, getEventCommentBySatisfaction } from './eventComments';

// 合并所有评论模板
import { gachaCommentTemplates } from './gachaComments';
import { characterCommentTemplates } from './characterComments';
import { eventCommentTemplates } from './eventComments';
import type { CommentType, PlayerType, CommentTemplate } from '@/types/template';

export const allCommentTemplates = {
  gacha: gachaCommentTemplates,
  character: characterCommentTemplates,
  event: eventCommentTemplates
};

// 评论类型列表
const commentTypes: CommentType[] = ['roast', 'recommend', 'drama', 'meme'];

// 玩家类型列表
const playerTypes: PlayerType[] = ['氪金大佬', '剧情党', '外观党', '休闲玩家'];

/**
 * 获取随机评论类型
 */
export function getRandomCommentType(): CommentType {
  return commentTypes[Math.floor(Math.random() * commentTypes.length)];
}

/**
 * 获取随机玩家类型
 */
export function getRandomPlayerType(): PlayerType {
  return playerTypes[Math.floor(Math.random() * playerTypes.length)];
}

/**
 * 生成单条评论
 * @param type 评论类型
 * @param playerType 玩家类型
 */
export function generateComment(
  type?: CommentType,
  playerType?: PlayerType
): CommentTemplate {
  const selectedType = type || getRandomCommentType();
  const selectedPlayerType = playerType || getRandomPlayerType();
  
  // 根据评论类型选择对应的模板
  let content = '';
  switch (selectedType) {
    case 'roast':
      content = getRandomGachaComment('unlucky');
      break;
    case 'recommend':
      content = getRandomCharacterComment('appearance');
      break;
    case 'drama':
      content = getRandomEventComment('positive');
      break;
    case 'meme':
      content = getRandomGachaComment('lucky');
      break;
    default:
      content = '这游戏真不错！';
  }
  
  return {
    id: `comment_${Date.now()}`,
    type: selectedType,
    content,
    sentiment: 'positive',
    intensity: 3,
    playerType: selectedPlayerType,
    tags: ['游戏', '评价']
  };
}

/**
 * 生成多条评论
 * @param count 评论数量
 * @param type 评论类型（可选）
 */
export function generateComments(count: number, type?: CommentType): CommentTemplate[] {
  const comments: CommentTemplate[] = [];
  for (let i = 0; i < count; i++) {
    comments.push(generateComment(type));
  }
  return comments;
}

// 获取所有评论模板的总数
export const getTotalCommentCount = (): number => {
  let count = 0;
  
  // 统计抽卡评论
  Object.values(gachaCommentTemplates).forEach(templates => {
    count += templates.length;
  });
  
  // 统计角色评论
  Object.values(characterCommentTemplates).forEach(templates => {
    count += templates.length;
  });
  
  // 统计活动评论
  Object.values(eventCommentTemplates).forEach(templates => {
    count += templates.length;
  });
  
  return count;
};

// 获取评论模板统计信息
export const getCommentTemplateStats = () => {
  return {
    gacha: {
      lucky: gachaCommentTemplates.lucky.length,
      unlucky: gachaCommentTemplates.unlucky.length,
      showoff: gachaCommentTemplates.showoff.length,
      suggestion: gachaCommentTemplates.suggestion.length,
      hesitate: gachaCommentTemplates.hesitate.length,
      total: Object.values(gachaCommentTemplates).reduce((sum, arr) => sum + arr.length, 0)
    },
    character: {
      appearance: characterCommentTemplates.appearance.length,
      personality: characterCommentTemplates.personality.length,
      voice: characterCommentTemplates.voice.length,
      strength: characterCommentTemplates.strength.length,
      story: characterCommentTemplates.story.length,
      total: Object.values(characterCommentTemplates).reduce((sum, arr) => sum + arr.length, 0)
    },
    event: {
      positive: eventCommentTemplates.positive.length,
      negative: eventCommentTemplates.negative.length,
      suggestion: eventCommentTemplates.suggestion.length,
      expect: eventCommentTemplates.expect.length,
      total: Object.values(eventCommentTemplates).reduce((sum, arr) => sum + arr.length, 0)
    },
    total: getTotalCommentCount()
  };
};
