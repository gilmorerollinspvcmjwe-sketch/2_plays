/**
 * 角色AI人格系统
 * 基于角色设定生成AI人格特征和行为模式
 */

import type {
  HiddenAttributes,
  AIPersonality,
  GrowthArcType,
  CharacterSecret,
  CharacterRelationship
} from '@/types/character';

// 人格特质库
const PERSONALITY_TRAITS: Record<string, string[]> = {
  tsundere: ['傲娇', '口是心非', '刀子嘴豆腐心', '不坦率', '容易害羞'],
  gentle: ['温柔', '体贴', '善解人意', '包容', '温暖'],
  scheming: ['腹黑', '精明', '善于算计', '深不可测', '运筹帷幄'],
  innocent: ['纯真', '天真', '单纯', '无邪', '直率'],
  mature: ['成熟', '稳重', '可靠', '有担当', '深思熟虑'],
  playful: ['调皮', '活泼', '爱开玩笑', '古灵精怪', '精力充沛'],
  possessive: ['占有欲强', '爱吃醋', '独占欲', '控制欲', '霸道'],
  protective: ['保护欲强', '守护型', '骑士精神', '护短', '安全感']
};

// 说话风格模板
const SPEECH_STYLES: Record<string, string[]> = {
  tsundere: [
    '哼，才不是为了你呢！',
    '别误会了，我只是顺便而已。',
    '笨蛋，这种小事都做不好。'
  ],
  gentle: [
    '没关系，我会一直在你身边。',
    '你的感受我都能理解。',
    '慢慢来，不着急。'
  ],
  scheming: [
    '呵呵，事情变得有趣了呢。',
    '一切都在计划之中。',
    '你猜，我下一步会怎么做？'
  ],
  innocent: [
    '哇，真的吗？好厉害！',
    '我不太懂，你可以教我吗？',
    '我觉得这样很好呀！'
  ],
  mature: [
    '这件事需要从长计议。',
    '我相信你的判断。',
    '有时候，放手也是一种选择。'
  ],
  playful: [
    '嘿嘿，被我骗到了吧！',
    '来陪我玩嘛~',
    '这个主意太有趣了！'
  ],
  possessive: [
    '你是我的，谁也抢不走。',
    '不许看别人，只准看着我。',
    '你的时间都是我的。'
  ],
  protective: [
    '有我在，别怕。',
    '我会保护你的，永远。',
    '任何人都不能伤害你。'
  ]
};

// 行为模式
const BEHAVIOR_PATTERNS: Record<string, string[]> = {
  tsundere: ['明明关心却装作不在意', '口是心非地帮助对方', '在关键时刻展现温柔'],
  gentle: ['默默守护在对方身边', '细心观察对方的需求', '用温柔化解矛盾'],
  scheming: ['暗中布局达成目的', '用计谋解决问题', '表面无害实则掌控全局'],
  innocent: ['用纯真打动他人', '无意中发现真相', '以直率面对复杂'],
  mature: ['在危机时保持冷静', '给予理性的建议', '承担责任保护大家'],
  playful: ['用幽默缓解紧张', '制造惊喜和欢乐', '以玩笑掩饰真心'],
  possessive: ['暗中排除情敌', '时刻关注对方动向', '宣示主权'],
  protective: ['挡在对方面前', '默默解决危险', '成为坚实的后盾']
};

// 情感触发点
const EMOTIONAL_TRIGGERS: Record<string, string[]> = {
  tsundere: ['被说中心事', '对方感谢自己', '看到对方和别人亲近'],
  gentle: ['对方遇到困难', '看到不公平的事', '被需要的感觉'],
  scheming: ['计划被打乱', '发现有趣的目标', '被挑战智慧'],
  innocent: ['被欺骗', '看到美好的事物', '被温柔对待'],
  mature: ['有人需要保护', '面临重大抉择', '看到他人成长'],
  playful: ['无聊的时候', '发现有趣的事', '和朋友在一起'],
  possessive: ['对方关注别人', '被忽视的感觉', '有人接近自己的所有物'],
  protective: ['重要的人遇险', '看到弱者被欺负', '承诺需要兑现']
};

// 决策影响因素
const DECISION_FACTORS: Record<string, string[]> = {
  tsundere: ['自尊心', '对方的感受', '自己的形象'],
  gentle: ['他人的幸福', '和谐的关系', '长远的未来'],
  scheming: ['利益最大化', '长远布局', '隐藏真实意图'],
  innocent: ['直觉', '简单直接', '当下的感受'],
  mature: ['理性分析', '责任与义务', '最佳解决方案'],
  playful: ['有趣程度', '当下心情', '朋友的意见'],
  possessive: ['独占欲', '安全感', '控制局面'],
  protective: ['重要之人的安全', '自己的承诺', '正义感']
};

/**
 * 生成AI人格
 * @param hiddenAttributes 隐藏属性
 * @param personality 显性性格
 * @param background 背景故事
 */
export function generatePersonality(
  hiddenAttributes: HiddenAttributes,
  personality: string[],
  background: string
): AIPersonality {
  const traits: string[] = [];
  const speechStyleSamples: string[] = [];
  const behaviorPatterns: string[] = [];
  const emotionalTriggers: string[] = [];
  const decisionFactors: string[] = [];

  // 找出最高的隐藏属性
  const sortedAttributes = Object.entries(hiddenAttributes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // 基于最高属性生成特质
  for (const [attr, value] of sortedAttributes) {
    if (value > 60) {
      const attrTraits = PERSONALITY_TRAITS[attr];
      if (attrTraits) {
        traits.push(...attrTraits.slice(0, 2));
      }

      const attrSpeech = SPEECH_STYLES[attr];
      if (attrSpeech) {
        speechStyleSamples.push(...attrSpeech.slice(0, 1));
      }

      const attrBehavior = BEHAVIOR_PATTERNS[attr];
      if (attrBehavior) {
        behaviorPatterns.push(...attrBehavior.slice(0, 1));
      }

      const attrTriggers = EMOTIONAL_TRIGGERS[attr];
      if (attrTriggers) {
        emotionalTriggers.push(...attrTriggers.slice(0, 1));
      }

      const attrFactors = DECISION_FACTORS[attr];
      if (attrFactors) {
        decisionFactors.push(...attrFactors.slice(0, 1));
      }
    }
  }

  // 去重
  const uniqueTraits = [...new Set(traits)];
  const uniqueTriggers = [...new Set(emotionalTriggers)];
  const uniqueFactors = [...new Set(decisionFactors)];

  // 生成说话风格描述
  const speechStyle = generateSpeechStyleDescription(uniqueTraits, personality);

  return {
    traits: uniqueTraits,
    speechStyle,
    behaviorPatterns: [...new Set(behaviorPatterns)],
    emotionalTriggers: uniqueTriggers,
    decisionFactors: uniqueFactors
  };
}

/**
 * 生成说话风格描述
 */
function generateSpeechStyleDescription(traits: string[], personality: string[]): string {
  const descriptions: string[] = [];

  if (traits.includes('傲娇') || traits.includes('不坦率')) {
    descriptions.push('说话常常口是心非，明明关心却装作不在意');
  }
  if (traits.includes('温柔') || traits.includes('体贴')) {
    descriptions.push('语气温柔，善于用言语安慰和鼓励他人');
  }
  if (traits.includes('腹黑') || traits.includes('精明')) {
    descriptions.push('说话意味深长，常常话中有话');
  }
  if (traits.includes('纯真') || traits.includes('天真')) {
    descriptions.push('说话直率单纯，不拐弯抹角');
  }
  if (traits.includes('成熟') || traits.includes('稳重')) {
    descriptions.push('说话沉稳有条理，给人可靠的感觉');
  }
  if (traits.includes('调皮') || traits.includes('活泼')) {
    descriptions.push('说话幽默风趣，喜欢开玩笑');
  }

  if (descriptions.length === 0) {
    descriptions.push('说话风格自然，根据情境变化');
  }

  return descriptions.join('；');
}

/**
 * 生成角色行为模式
 * @param personality AI人格
 * @param situation 情境描述
 */
export function generateBehavior(
  personality: AIPersonality,
  situation: string
): string {
  const patterns = personality.behaviorPatterns;
  if (patterns.length === 0) {
    return '根据情况做出自然反应';
  }

  // 根据情境选择最合适的行为模式
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return randomPattern;
}

/**
 * 生成角色内心独白
 * @param personality AI人格
 * @param context 当前情境
 * @param emotion 当前情绪
 */
export function generateInnerMonologue(
  personality: AIPersonality,
  context: string,
  emotion: 'happy' | 'sad' | 'angry' | 'worried' | 'excited' | 'calm' = 'calm'
): string {
  const monologues: Record<string, string[]> = {
    happy: [
      '（心里美滋滋的，但表面上还是要保持镇定）',
      '（太开心了，希望这种感觉能一直持续下去）',
      '（这就是幸福的感觉吗...）'
    ],
    sad: [
      '（心里很难受，但不能让别人看出来）',
      '（为什么事情会变成这样...）',
      '（好想一个人静一静...）'
    ],
    angry: [
      '（气死我了，但我要保持冷静）',
      '（这种人真是不可理喻）',
      '（我绝对不会原谅的...）'
    ],
    worried: [
      '（该怎么办才好...）',
      '（希望一切都能顺利）',
      '（我不能表现出不安...）'
    ],
    excited: [
      '（太期待了！终于要开始了！）',
      '（心跳得好快，好紧张...）',
      '（这是我梦寐以求的时刻！）'
    ],
    calm: [
      '（保持冷静，好好思考下一步）',
      '（事情还在掌控之中）',
      '（顺其自然吧...）'
    ]
  };

  const emotionMonologues = monologues[emotion] || monologues.calm;
  return emotionMonologues[Math.floor(Math.random() * emotionMonologues.length)];
}

/**
 * 生成角色反应
 * @param personality AI人格
 * @param event 事件描述
 * @param intensity 事件强度 0-100
 */
export function generateReaction(
  personality: AIPersonality,
  event: string,
  intensity: number
): {
  immediate: string;
  internal: string;
  followUp: string;
} {
  const traits = personality.traits;
  let immediate = '';
  let internal = '';
  let followUp = '';

  // 基于特质生成反应
  if (traits.includes('傲娇') || traits.includes('不坦率')) {
    if (intensity > 70) {
      immediate = '哼！那种事情...我才不在乎呢！';
      internal = '（其实心里非常在意）';
      followUp = '（转过身去，但偷偷关注着）';
    } else {
      immediate = '哦，是吗？';
      internal = '（有点在意，但不想表现出来）';
      followUp = '（若无其事地转移话题）';
    }
  } else if (traits.includes('温柔') || traits.includes('体贴')) {
    immediate = '你还好吗？需要我帮忙吗？';
    internal = '（很担心对方的情况）';
    followUp = '（默默为对方做些力所能及的事）';
  } else if (traits.includes('腹黑') || traits.includes('精明')) {
    immediate = '呵呵，有趣...';
    internal = '（已经开始盘算如何利用这个情况）';
    followUp = '（露出意味深长的微笑）';
  } else if (traits.includes('纯真') || traits.includes('天真')) {
    immediate = '哇！真的吗？';
    internal = '（单纯地感到惊讶或开心）';
    followUp = '（直接表达自己的想法）';
  } else {
    immediate = '这样啊...';
    internal = '（在思考这件事的影响）';
    followUp = '（做出理性的回应）';
  }

  return { immediate, internal, followUp };
}

/**
 * 生成示例对话
 * @param personality AI人格
 * @param scenario 场景类型
 */
export function generateSampleDialogue(
  personality: AIPersonality,
  scenario: 'greeting' | 'confession' | 'argument' | 'comfort' | 'teasing' = 'greeting'
): string[] {
  const dialogues: Record<string, Record<string, string[]>> = {
    greeting: {
      tsundere: ['哼，早安啦...别误会，我只是顺便说一声！', '你来啦？等、等你很久了啦！'],
      gentle: ['早安，今天也要加油哦。', '见到你真开心，今天过得怎么样？'],
      scheming: ['呵呵，终于来了呢，我等你很久了。', '今天的你，看起来格外有趣呢。'],
      innocent: ['早安！今天的天气真好呢！', '哇，见到你好开心！'],
      mature: ['早安，准备好了吗？', '新的一天开始了，一起努力吧。']
    },
    confession: {
      tsundere: ['笨、笨蛋！我喜欢你啦！别让我再说第二遍！', '才、才不是因为喜欢你才对你好的呢！'],
      gentle: ['我喜欢你，从很久以前就开始了。', '你的存在，对我来说就是最大的幸福。'],
      scheming: ['你已经被我锁定了，逃不掉的。', '从见到你的第一眼起，你就已经是我的了。'],
      innocent: ['那个...我喜欢你！可以和我交往吗？', '每次见到你，我的心都会跳得好快！'],
      mature: ['我想和你一起走下去，你愿意吗？', '我爱你，这是我最认真的告白。']
    },
    argument: {
      tsundere: ['哼！不理你了！', '明明是你的错！'],
      gentle: ['我们能好好谈谈吗？', '我不想和你吵架...'],
      scheming: ['呵呵，你以为这样就能赢我吗？', '你的一举一动都在我的预料之中。'],
      innocent: ['为什么要吵架呢...', '我不明白，我们能和好吗？'],
      mature: ['冷静一下，我们理性地讨论这个问题。', '我理解你的想法，但请听听我的观点。']
    },
    comfort: {
      tsundere: ['别、别哭了啦！我会陪在你身边的！', '笨蛋，有我在呢，怕什么！'],
      gentle: ['没关系，一切都会好起来的。', '想哭就哭吧，我会一直陪着你。'],
      scheming: ['告诉我，是谁让你难过的？', '放心，我会帮你解决一切的。'],
      innocent: ['不要难过啦，笑一笑嘛！', '我会努力让你开心起来的！'],
      mature: ['困难只是暂时的，我相信你能度过。', '不管发生什么，我都在你身边。']
    },
    teasing: {
      tsundere: ['笨、笨蛋！你脸红什么啊！', '才、才没有在意你呢！'],
      gentle: ['呵呵，你真可爱。', '和你开玩笑真有趣呢。'],
      scheming: ['你的反应比我想象的还要有趣。', '被我说中了吧？'],
      innocent: ['嘿嘿，被我骗到了吧！', '开玩笑的啦，别当真~'],
      mature: ['偶尔也要放松一下嘛。', '你的反应总是让我意外。']
    }
  };

  // 根据特质选择对话风格
  let style = 'mature';
  if (personality.traits.includes('傲娇') || personality.traits.includes('不坦率')) {
    style = 'tsundere';
  } else if (personality.traits.includes('温柔') || personality.traits.includes('体贴')) {
    style = 'gentle';
  } else if (personality.traits.includes('腹黑') || personality.traits.includes('精明')) {
    style = 'scheming';
  } else if (personality.traits.includes('纯真') || personality.traits.includes('天真')) {
    style = 'innocent';
  }

  const scenarioDialogues = dialogues[scenario];
  return scenarioDialogues[style] || scenarioDialogues.mature;
}

/**
 * 分析角色兼容性
 * @param personality1 角色1人格
 * @param personality2 角色2人格
 */
export function analyzeCompatibility(
  personality1: AIPersonality,
  personality2: AIPersonality
): {
  score: number;
  description: string;
  dynamics: string[];
} {
  let score = 50; // 基础分
  const dynamics: string[] = [];

  const traits1 = personality1.traits;
  const traits2 = personality2.traits;

  // 互补特质加分
  if ((traits1.includes('傲娇') && traits2.includes('温柔')) ||
      (traits2.includes('傲娇') && traits1.includes('温柔'))) {
    score += 20;
    dynamics.push('温柔的包容能化解傲娇的防备');
  }

  if ((traits1.includes('腹黑') && traits2.includes('纯真')) ||
      (traits2.includes('腹黑') && traits1.includes('纯真'))) {
    score += 15;
    dynamics.push('腹黑的守护与纯真的信任形成有趣的互动');
  }

  if ((traits1.includes('成熟') && traits2.includes('调皮')) ||
      (traits2.includes('成熟') && traits1.includes('调皮'))) {
    score += 15;
    dynamics.push('成熟与调皮的互补让生活充满乐趣');
  }

  // 相似特质加分
  const commonTraits = traits1.filter(t => traits2.includes(t));
  if (commonTraits.length > 0) {
    score += commonTraits.length * 5;
    dynamics.push('相似的特质让你们更容易理解彼此');
  }

  // 冲突特质减分
  if ((traits1.includes('占有欲强') && traits2.includes('占有欲强'))) {
    score -= 10;
    dynamics.push('双方都很强势，可能会产生权力争夺');
  }

  score = Math.max(0, Math.min(100, score));

  let description = '';
  if (score >= 80) {
    description = '天作之合！你们之间有着强烈的化学反应。';
  } else if (score >= 60) {
    description = '相当般配，互补的特质让你们的关系更加有趣。';
  } else if (score >= 40) {
    description = '普通水平，需要更多磨合和理解。';
  } else {
    description = '挑战较大，但如果能克服差异，关系会更加深厚。';
  }

  return { score, description, dynamics };
}

/**
 * 生成人格报告
 * @param personality AI人格
 */
export function generatePersonalityReport(personality: AIPersonality): string {
  const sections: string[] = [];

  // 人格特质
  sections.push(`【人格特质】\n${personality.traits.join('、')}`);

  // 说话风格
  sections.push(`\n【说话风格】\n${personality.speechStyle}`);

  // 行为模式
  sections.push(`\n【典型行为】\n${personality.behaviorPatterns.join('\n')}`);

  // 情感触发点
  sections.push(`\n【情感触发点】\n${personality.emotionalTriggers.join('、')}`);

  // 决策方式
  sections.push(`\n【决策方式】\n做决定时主要考虑：${personality.decisionFactors.join('、')}`);

  return sections.join('\n');
}
