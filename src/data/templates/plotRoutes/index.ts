/**
 * 剧情路线模板
 * 包含甜宠、虐恋、悬疑三种核心路线
 */

export interface PlotRouteTemplate {
  type: 'sweet' | 'angst' | 'suspense';
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  chapterStructure: {
    chapter: number;
    theme: string;
    keyEvent: string;
    choices: string[];
  }[];
  endingTypes: ('he' | 'be' | 'ne' | 'secret')[];
  playerAppeal: string;
}

export const plotRouteTemplates: PlotRouteTemplate[] = [
  {
    type: 'sweet',
    name: '甜宠路线',
    description: '全程高甜，糖分超标，适合喜欢轻松愉快剧情的玩家',
    difficulty: 'easy',
    chapterStructure: [
      {
        chapter: 1,
        theme: '初遇',
        keyEvent: '命运般的相遇',
        choices: ['主动搭话', '默默观察', '假装不在意']
      },
      {
        chapter: 2,
        theme: '靠近',
        keyEvent: '共同经历小事件',
        choices: ['接受他的帮助', '独自解决', '寻求他人帮助']
      },
      {
        chapter: 3,
        theme: '暧昧',
        keyEvent: '心动的瞬间',
        choices: ['暗示心意', '保持距离', '直接表白']
      },
      {
        chapter: 4,
        theme: '确认',
        keyEvent: '告白/被告白',
        choices: ['接受告白', '需要时间考虑', '委婉拒绝']
      },
      {
        chapter: 5,
        theme: '甜蜜',
        keyEvent: '正式交往',
        choices: ['公开恋情', '低调交往', '先保密']
      }
    ],
    endingTypes: ['he'],
    playerAppeal: '喜欢轻松愉快、甜甜蜜蜜的玩家'
  },
  {
    type: 'angst',
    name: '虐恋路线',
    description: '先虐后甜，玻璃渣里找糖，情感张力十足',
    difficulty: 'hard',
    chapterStructure: [
      {
        chapter: 1,
        theme: '相遇',
        keyEvent: '美好的开始',
        choices: ['一见钟情', '日久生情', '不打不相识']
      },
      {
        chapter: 2,
        theme: '阻碍',
        keyEvent: '出现误会/阻碍',
        choices: ['解释清楚', '选择沉默', '赌气离开']
      },
      {
        chapter: 3,
        theme: '分离',
        keyEvent: '被迫分开',
        choices: ['坚持等待', '尝试忘记', '远走他乡']
      },
      {
        chapter: 4,
        theme: '挣扎',
        keyEvent: '各自的成长',
        choices: ['专注事业', '寻找真相', '自我救赎']
      },
      {
        chapter: 5,
        theme: '重逢',
        keyEvent: '解开误会',
        choices: ['主动求和', '等待对方', '重新开始']
      },
      {
        chapter: 6,
        theme: '圆满',
        keyEvent: '破镜重圆',
        choices: ['原谅过去', '珍惜现在', '展望未来']
      }
    ],
    endingTypes: ['he', 'be'],
    playerAppeal: '喜欢情感张力、剧情起伏的玩家'
  },
  {
    type: 'suspense',
    name: '悬疑路线',
    description: '解开谜团，共同探案，充满推理元素',
    difficulty: 'medium',
    chapterStructure: [
      {
        chapter: 1,
        theme: '案件',
        keyEvent: '神秘事件发生',
        choices: ['独自调查', '寻求帮助', '报警处理']
      },
      {
        chapter: 2,
        theme: '调查',
        keyEvent: '联手查案',
        choices: ['相信他的判断', '提出自己的推理', '收集更多证据']
      },
      {
        chapter: 3,
        theme: '危机',
        keyEvent: '陷入危险',
        choices: ['勇敢面对', '寻求保护', '智取脱险']
      },
      {
        chapter: 4,
        theme: '真相',
        keyEvent: '揭开谜底',
        choices: ['接受真相', '质疑证据', '继续追查']
      },
      {
        chapter: 5,
        theme: '结局',
        keyEvent: '事件解决',
        choices: ['庆祝胜利', '反思过程', '展望未来']
      }
    ],
    endingTypes: ['he', 'ne'],
    playerAppeal: '喜欢推理、悬疑元素的玩家'
  }
];

// 章节事件库
export const chapterEvents = {
  romantic: [
    '雨天共撑一把伞',
    '意外摔倒被接住',
    '生病时被照顾',
    '一起看烟花',
    '被困在电梯里',
    '醉酒后的真心话',
    '深夜的告白',
    '意外的吻',
    '吃醋的场景',
    '守护的瞬间'
  ],
  conflict: [
    '误会吃醋',
    '前任出现',
    '家族反对',
    '事业选择分歧',
    '秘密被揭露',
    '被迫分离',
    '信任危机',
    '第三者插足',
    '身份差距',
    '价值观冲突'
  ],
  reconciliation: [
    '解开误会',
    '主动道歉',
    '危机中相救',
    '深夜长谈',
    '共同面对困难',
    '重新告白',
    '放下过去',
    '互相理解',
    '重新开始',
    '承诺未来'
  ],
  suspense: [
    '发现关键线索',
    '遭遇嫌疑人',
    '被跟踪监视',
    '发现隐藏房间',
    '收到威胁信',
    '证人突然死亡',
    '证据被销毁',
    '真凶现身',
    '最后的对决',
    '真相大白'
  ]
};

// 结局模板
export const endingTemplates = {
  he: [
    {
      title: '幸福结局',
      condition: '亲密度达到10级，完成所有关键选择',
      content: '经过种种考验，你们终于走到了一起。在众人的祝福中，你们许下了永恒的誓言。'
    },
    {
      title: '甜蜜结局',
      condition: '选择偏向甜蜜的选项',
      content: '你们开始了甜蜜的同居生活，每一天都充满了幸福和欢笑。'
    },
    {
      title: '圆满结局',
      condition: '完成所有支线任务',
      content: '不仅收获了爱情，还实现了各自的梦想。这是最好的结局。'
    }
  ],
  be: [
    {
      title: '遗憾结局',
      condition: '关键选择失误',
      content: '因为误会和错过，你们最终没有在一起。但这段感情成为了彼此心中永远的回忆。'
    },
    {
      title: '牺牲结局',
      condition: '选择牺牲自己',
      content: '为了保护对方，你选择了离开。虽然心痛，但你知道这是最好的选择。'
    },
    {
      title: '错过结局',
      condition: '多次拒绝对方',
      content: '当意识到自己的心意时，对方已经离开。有些人一旦错过就不再。'
    }
  ],
  ne: [
    {
      title: '开放结局',
      condition: '保持中立选择',
      content: '故事在这里暂停，未来的路还很长。也许有一天，你们会再次相遇。'
    },
    {
      title: '成长结局',
      condition: '专注个人成长',
      content: '虽然没能在一起，但你们都成为了更好的人。这或许也是一种圆满。'
    }
  ],
  secret: [
    {
      title: '隐藏结局',
      condition: '完成所有隐藏条件',
      content: '你发现了一个惊人的秘密，原来一切都是命运的安排...'
    }
  ]
};
