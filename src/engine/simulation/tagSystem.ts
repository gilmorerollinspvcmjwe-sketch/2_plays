export type PlayerTag = '学生' | '上班族' | '自由职业' | '零氪' | '微氪' | '中氪' | '重氪' | '神豪' | '剧情党' | '强度党' | 'XP党' | '咸鱼党' | '社交党' | '甜宠控' | '虐恋控' | '颜狗' | '声优控';

export type ContentTag = '甜宠' | '虐恋' | '悬疑' | '治愈' | '病娇' | '温柔' | '高冷' | '年下' | '搞笑' | '感人' | '日常' | '长剧情' | '短剧情';

export type ActivityTag = '高福利' | '高难度' | '情人节' | '周年庆' | '联动' | '签到' | '限时';

export type EventTag = '正面' | '负面' | '中性' | '危机' | '口碑' | '炎上';

export interface TagEffect {
  sourceTag: string;
  targetBehavior: string;
  effect: number;
  condition?: string;
}

export interface TagSystem {
  getPlayerEffect(playerTags: string[], behavior: string): number;
  getContentEffect(contentTags: string[], targetBehavior: string): number;
  getActivityEffect(activityTags: string[]): number;
  calculateCombinedEffect(playerTags: string[], contentTags: string[]): Map<string, number>;
}

const PLAYER_TAG_EFFECTS: TagEffect[] = [
  { sourceTag: '剧情党', targetBehavior: 'TapTap评论概率', effect: 0.5 },
  { sourceTag: '剧情党', targetBehavior: '剧情跳过率', effect: -0.3 },
  { sourceTag: '剧情党', targetBehavior: '在线时长', effect: 0.2 },
  { sourceTag: '社交党', targetBehavior: '微博活跃概率', effect: 0.4 },
  { sourceTag: '社交党', targetBehavior: '好友邀请概率', effect: 0.5 },
  { sourceTag: '社交党', targetBehavior: '公会参与率', effect: 0.4 },
  { sourceTag: '甜宠控', targetBehavior: '甜宠角色抽卡概率', effect: 0.3 },
  { sourceTag: '甜宠控', targetBehavior: '抽卡消费意愿', effect: 0.15 },
  { sourceTag: '甜宠控', targetBehavior: '剧情满意度', effect: 0.2 },
  { sourceTag: '虐恋控', targetBehavior: '虐恋角色抽卡概率', effect: 0.3 },
  { sourceTag: '虐恋控', targetBehavior: '剧情付费意愿', effect: 0.2 },
  { sourceTag: '颜狗', targetBehavior: '立绘评分权重', effect: 0.4 },
  { sourceTag: '颜狗', targetBehavior: '抽卡概率', effect: 0.1 },
  { sourceTag: '声优控', targetBehavior: '声优评分权重', effect: 0.4 },
  { sourceTag: '声优控', targetBehavior: '抽卡概率', effect: 0.1 },
  { sourceTag: '零氪', targetBehavior: '抽卡概率', effect: -0.3 },
  { sourceTag: '零氪', targetBehavior: '广告观看概率', effect: 0.5 },
  { sourceTag: '零氪', targetBehavior: '登录天数', effect: 0.1 },
  { sourceTag: '微氪', targetBehavior: '抽卡概率', effect: -0.2 },
  { sourceTag: '微氪', targetBehavior: '首充概率', effect: 0.5 },
  { sourceTag: '微氪', targetBehavior: '月卡概率', effect: 0.3 },
  { sourceTag: '中氪', targetBehavior: '抽卡概率', effect: 0.1 },
  { sourceTag: '中氪', targetBehavior: '礼包购买概率', effect: 0.4 },
  { sourceTag: '中氪', targetBehavior: '月卡概率', effect: 0.5 },
  { sourceTag: '重氪', targetBehavior: '抽卡概率', effect: 0.3 },
  { sourceTag: '重氪', targetBehavior: '礼包购买概率', effect: 0.6 },
  { sourceTag: '重氪', targetBehavior: '限定抽卡概率', effect: 0.4 },
  { sourceTag: '神豪', targetBehavior: '抽卡概率', effect: 0.5 },
  { sourceTag: '神豪', targetBehavior: '全角色收集意愿', effect: 0.8 },
  { sourceTag: '神豪', targetBehavior: '礼包购买概率', effect: 0.9 },
  { sourceTag: '强度党', targetBehavior: 'PVP参与率', effect: 0.5 },
  { sourceTag: '强度党', targetBehavior: '角色练度焦虑', effect: 0.6 },
  { sourceTag: '强度党', targetBehavior: '强度讨论概率', effect: 0.7 },
  { sourceTag: 'XP党', targetBehavior: 'XP角色抽卡概率', effect: 0.5 },
  { sourceTag: 'XP党', targetBehavior: '角色评论意愿', effect: 0.3 },
  { sourceTag: '咸鱼党', targetBehavior: '在线时长', effect: -0.4 },
  { sourceTag: '咸鱼党', targetBehavior: '任务完成率', effect: -0.3 },
  { sourceTag: '咸鱼党', targetBehavior: '流失风险', effect: 0.2 },
  { sourceTag: '学生', targetBehavior: '在线时段_晚间', effect: 0.4 },
  { sourceTag: '学生', targetBehavior: '周末活跃度', effect: 0.3 },
  { sourceTag: '上班族', targetBehavior: '在线时段_午间', effect: 0.3 },
  { sourceTag: '上班族', targetBehavior: '工作日活跃度', effect: -0.2 },
  { sourceTag: '自由职业', targetBehavior: '在线时段_随机', effect: 0.3 },
  { sourceTag: '自由职业', targetBehavior: '在线时长', effect: 0.2 },
];

const CONTENT_TAG_EFFECTS: TagEffect[] = [
  { sourceTag: '甜宠', targetBehavior: '核心玩家留存', effect: 0.15 },
  { sourceTag: '甜宠', targetBehavior: '新手留存', effect: 0.2 },
  { sourceTag: '甜宠', targetBehavior: '口碑评分', effect: 0.1 },
  { sourceTag: '虐恋', targetBehavior: '核心玩家留存', effect: 0.15 },
  { sourceTag: '虐恋', targetBehavior: '剧情付费率', effect: 0.25 },
  { sourceTag: '虐恋', targetBehavior: '口碑评分', effect: 0.05 },
  { sourceTag: '病娇', targetBehavior: '核心玩家留存', effect: 0.2 },
  { sourceTag: '病娇', targetBehavior: '新手留存', effect: -0.1 },
  { sourceTag: '病娇', targetBehavior: '话题热度', effect: 0.3 },
  { sourceTag: '治愈', targetBehavior: '新手留存', effect: 0.25 },
  { sourceTag: '治愈', targetBehavior: '口碑评分', effect: 0.2 },
  { sourceTag: '治愈', targetBehavior: '流失召回率', effect: 0.15 },
  { sourceTag: '高冷', targetBehavior: '抽卡概率', effect: 0.15 },
  { sourceTag: '高冷', targetBehavior: '角色人气', effect: 0.2 },
  { sourceTag: '温柔', targetBehavior: '新手留存', effect: 0.15 },
  { sourceTag: '温柔', targetBehavior: '口碑评分', effect: 0.1 },
  { sourceTag: '年下', targetBehavior: '用户年龄_年轻', effect: 0.2 },
  { sourceTag: '年下', targetBehavior: '社交分享概率', effect: 0.15 },
  { sourceTag: '长剧情', targetBehavior: '在线时长', effect: 0.3 },
  { sourceTag: '长剧情', targetBehavior: '流失风险', effect: 0.1 },
  { sourceTag: '长剧情', targetBehavior: '核心玩家留存', effect: 0.2 },
  { sourceTag: '长剧情', targetBehavior: '剧情满意度', effect: 0.25 },
  { sourceTag: '短剧情', targetBehavior: '在线时长', effect: -0.2 },
  { sourceTag: '短剧情', targetBehavior: '日活频率', effect: 0.3 },
  { sourceTag: '短剧情', targetBehavior: '流失召回率', effect: 0.1 },
  { sourceTag: '悬疑', targetBehavior: '话题热度', effect: 0.25 },
  { sourceTag: '悬疑', targetBehavior: '留存曲线', effect: 0.1 },
  { sourceTag: '悬疑', targetBehavior: '讨论度', effect: 0.3 },
  { sourceTag: '搞笑', targetBehavior: '新手留存', effect: 0.15 },
  { sourceTag: '搞笑', targetBehavior: '口碑评分', effect: 0.15 },
  { sourceTag: '感人', targetBehavior: '剧情付费率', effect: 0.2 },
  { sourceTag: '感人', targetBehavior: '社交分享概率', effect: 0.25 },
  { sourceTag: '感人', targetBehavior: '口碑评分', effect: 0.2 },
  { sourceTag: '日常', targetBehavior: '新手留存', effect: 0.1 },
  { sourceTag: '日常', targetBehavior: '日活稳定性', effect: 0.2 },
];

const ACTIVITY_TAG_EFFECTS: TagEffect[] = [
  { sourceTag: '高福利', targetBehavior: '参与率', effect: 0.3 },
  { sourceTag: '高福利', targetBehavior: '期望管理', effect: 0.2 },
  { sourceTag: '高福利', targetBehavior: '付费转化率', effect: 0.15 },
  { sourceTag: '高福利', targetBehavior: '口碑评分', effect: 0.1 },
  { sourceTag: '高难度', targetBehavior: '参与率', effect: -0.2 },
  { sourceTag: '高难度', targetBehavior: '核心玩家参与率', effect: 0.3 },
  { sourceTag: '高难度', targetBehavior: '话题热度', effect: 0.25 },
  { sourceTag: '高难度', targetBehavior: '流失风险', effect: 0.15 },
  { sourceTag: '情人节', targetBehavior: '参与率', effect: 0.25 },
  { sourceTag: '情人节', targetBehavior: '付费转化率', effect: 0.3 },
  { sourceTag: '情人节', targetBehavior: '社交分享概率', effect: 0.35 },
  { sourceTag: '情人节', targetBehavior: '回流率', effect: 0.2 },
  { sourceTag: '周年庆', targetBehavior: '参与率', effect: 0.4 },
  { sourceTag: '周年庆', targetBehavior: '付费转化率', effect: 0.35 },
  { sourceTag: '周年庆', targetBehavior: '回流率', effect: 0.3 },
  { sourceTag: '周年庆', targetBehavior: '口碑评分', effect: 0.2 },
  { sourceTag: '联动', targetBehavior: '参与率', effect: 0.2 },
  { sourceTag: '联动', targetBehavior: '话题热度', effect: 0.4 },
  { sourceTag: '联动', targetBehavior: '拉新率', effect: 0.3 },
  { sourceTag: '联动', targetBehavior: '留存影响', effect: 0.1 },
  { sourceTag: '签到', targetBehavior: '参与率', effect: 0.5 },
  { sourceTag: '签到', targetBehavior: '日活贡献', effect: 0.3 },
  { sourceTag: '签到', targetBehavior: '流失降低', effect: 0.15 },
  { sourceTag: '限时', targetBehavior: '参与率', effect: 0.25 },
  { sourceTag: '限时', targetBehavior: '付费转化率', effect: 0.3 },
  { sourceTag: '限时', targetBehavior: '焦虑指数', effect: 0.35 },
  { sourceTag: '限时', targetBehavior: '流失风险', effect: 0.1 },
];

export class TagSystemImpl implements TagSystem {
  private playerTagEffects: TagEffect[];
  private contentTagEffects: TagEffect[];
  private activityTagEffects: TagEffect[];

  constructor() {
    this.playerTagEffects = PLAYER_TAG_EFFECTS;
    this.contentTagEffects = CONTENT_TAG_EFFECTS;
    this.activityTagEffects = ACTIVITY_TAG_EFFECTS;
  }

  getPlayerEffect(playerTags: string[], behavior: string): number {
    let totalEffect = 0;
    let matchCount = 0;

    for (const playerTag of playerTags) {
      const effects = this.playerTagEffects.filter(
        (e) => e.sourceTag === playerTag && e.targetBehavior === behavior
      );
      for (const effect of effects) {
        totalEffect += effect.effect;
        matchCount++;
      }
    }

    return matchCount > 0 ? totalEffect / matchCount : 0;
  }

  getContentEffect(contentTags: string[], targetBehavior: string): number {
    let totalEffect = 0;
    let matchCount = 0;

    for (const contentTag of contentTags) {
      const effects = this.contentTagEffects.filter(
        (e) => e.sourceTag === contentTag && e.targetBehavior === targetBehavior
      );
      for (const effect of effects) {
        totalEffect += effect.effect;
        matchCount++;
      }
    }

    return matchCount > 0 ? totalEffect / matchCount : 0;
  }

  getActivityEffect(activityTags: string[]): number {
    let totalEffect = 0;
    let matchCount = 0;

    for (const activityTag of activityTags) {
      const effects = this.activityTagEffects.filter(
        (e) => e.sourceTag === activityTag && e.targetBehavior === '参与率'
      );
      for (const effect of effects) {
        totalEffect += effect.effect;
        matchCount++;
      }
    }

    return matchCount > 0 ? totalEffect / matchCount : 0;
  }

  calculateCombinedEffect(playerTags: string[], contentTags: string[]): Map<string, number> {
    const combinedEffects = new Map<string, number>();

    const playerBehaviors = new Set<string>();
    for (const effect of this.playerTagEffects) {
      playerBehaviors.add(effect.targetBehavior);
    }

    const contentBehaviors = new Set<string>();
    for (const effect of this.contentTagEffects) {
      contentBehaviors.add(effect.targetBehavior);
    }

    for (const behavior of playerBehaviors) {
      const effect = this.getPlayerEffect(playerTags, behavior);
      if (effect !== 0) {
        combinedEffects.set(`玩家.${behavior}`, effect);
      }
    }

    for (const behavior of contentBehaviors) {
      const effect = this.getContentEffect(contentTags, behavior);
      if (effect !== 0) {
        combinedEffects.set(`内容.${behavior}`, effect);
      }
    }

    return combinedEffects;
  }

  getAllPlayerTagEffects(): TagEffect[] {
    return [...this.playerTagEffects];
  }

  getAllContentTagEffects(): TagEffect[] {
    return [...this.contentTagEffects];
  }

  getAllActivityTagEffects(): TagEffect[] {
    return [...this.activityTagEffects];
  }

  addPlayerTagEffect(effect: TagEffect): void {
    this.playerTagEffects.push(effect);
  }

  addContentTagEffect(effect: TagEffect): void {
    this.contentTagEffects.push(effect);
  }

  addActivityTagEffect(effect: TagEffect): void {
    this.activityTagEffects.push(effect);
  }

  getPlayerTagsByCategory(category: '职业' | '消费' | '玩法' | 'XP'): PlayerTag[] {
    const tags: Record<string, PlayerTag[]> = {
      '职业': ['学生', '上班族', '自由职业'],
      '消费': ['零氪', '微氪', '中氪', '重氪', '神豪'],
      '玩法': ['剧情党', '强度党', 'XP党', '咸鱼党', '社交党'],
      'XP': ['甜宠控', '虐恋控', '颜狗', '声优控'],
    };
    return tags[category] || [];
  }
}

export const TagSystem = new TagSystemImpl();
