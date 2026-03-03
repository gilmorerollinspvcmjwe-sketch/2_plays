/**
 * 运营事件模板库
 * 用于模拟运营过程中可能遇到的各种事件
 */

import type { IncidentType, IncidentSeverity, IncidentSolution, IncidentTemplate } from '@/types/template';

// 爆率争议事件
const dropRateIncidents: Omit<IncidentTemplate, 'id'>[] = [
  {
    type: 'dropRate',
    name: '百连无SSR',
    description: '有玩家在论坛发帖称自己连续100抽未获得SSR角色，引发大量玩家共鸣和不满。',
    severity: '高',
    triggerCondition: '玩家连续抽取100次未获得SSR',
    playerReactions: [
      '这爆率太假了，我也抽了80连没出',
      '退游了，这游戏不值得',
      '官方出来解释！',
      '是不是暗改爆率了？'
    ],
    solutions: [
      {
        action: '发放补偿（10连抽）',
        cost: '中',
        effect: '缓解玩家情绪，声誉+5'
      },
      {
        action: '提高当期UP概率',
        cost: '高',
        effect: '大幅提升满意度，但收入下降'
      },
      {
        action: '发布公告解释概率机制',
        cost: '低',
        effect: '轻微缓解，部分玩家接受'
      }
    ]
  },
  {
    type: 'dropRate',
    name: 'UP角色不出',
    description: '玩家质疑UP角色概率，认为实际概率低于公示值。',
    severity: '中',
    triggerCondition: 'UP角色抽取次数超过期望值',
    playerReactions: [
      'UP了个寂寞',
      '歪了三次，这UP是假的吧',
      '概率欺诈！',
      '再也不氪了'
    ],
    solutions: [
      {
        action: '开启UP角色保底活动',
        cost: '中',
        effect: '玩家满意度提升'
      },
      {
        action: '公示详细抽取数据',
        cost: '低',
        effect: '透明度提升，质疑减少'
      }
    ]
  },
  {
    type: 'dropRate',
    name: '暗改爆率质疑',
    description: '玩家对比历史数据，怀疑官方暗改了抽卡概率。',
    severity: '高',
    triggerCondition: '连续多日玩家反馈爆率异常',
    playerReactions: [
      '以前不是这样的，肯定改了',
      '有数据为证，官方别装死',
      '信任危机',
      '集体退游警告'
    ],
    solutions: [
      {
        action: '公开概率代码审计报告',
        cost: '高',
        effect: '彻底澄清，恢复信任'
      },
      {
        action: '限时提升爆率',
        cost: '高',
        effect: '短期平息，但收入受损'
      }
    ]
  },
  {
    type: 'dropRate',
    name: '对比竞品爆率',
    description: '玩家将本游戏与竞品对比，认为爆率过低。',
    severity: '中',
    triggerCondition: '竞品同期推出高爆率活动',
    playerReactions: [
      '人家XX游戏爆率比你高多了',
      '学学人家吧',
      '转游了拜拜',
      '不改进就弃坑'
    ],
    solutions: [
      {
        action: '推出限时高爆率卡池',
        cost: '中',
        effect: '留住玩家，但利润下降'
      },
      {
        action: '强调自身特色优势',
        cost: '低',
        effect: '部分玩家被说服'
      }
    ]
  },
  {
    type: 'dropRate',
    name: '氪金无回报',
    description: '重氪玩家反馈投入大量资金但收益不成正比。',
    severity: '高',
    triggerCondition: '单个玩家氪金超过5000元',
    playerReactions: [
      '氪了几千还是非酋',
      '这游戏对氪金玩家不友好',
      '后悔氪金了',
      '要求退款'
    ],
    solutions: [
      {
        action: '推出VIP专属保底机制',
        cost: '高',
        effect: '重氪玩家满意度大幅提升'
      },
      {
        action: '发放专属客服和补偿',
        cost: '中',
        effect: '个别安抚，防止流失'
      }
    ]
  }
];

// 剧情雷点事件
const plotIssueIncidents: Omit<IncidentTemplate, 'id'>[] = [
  {
    type: 'plotIssue',
    name: '角色OOC',
    description: '新剧情中角色行为与设定严重不符，引发粉丝不满。',
    severity: '中',
    triggerCondition: '发布新剧情章节',
    playerReactions: [
      '我家老公不可能这样！',
      '编剧是不是没看过前面的剧情',
      'OOC太严重了',
      '这角色被毁了'
    ],
    solutions: [
      {
        action: '发布剧情修正补丁',
        cost: '中',
        effect: '挽回口碑，玩家认可'
      },
      {
        action: '编剧出面解释创作思路',
        cost: '低',
        effect: '部分玩家理解，争议减少'
      }
    ]
  },
  {
    type: 'plotIssue',
    name: '剧情逻辑BUG',
    description: '剧情出现明显逻辑漏洞，玩家纷纷吐槽。',
    severity: '中',
    triggerCondition: '剧情审核不严',
    playerReactions: [
      '这剧情逻辑不通啊',
      '编剧吃书了',
      '前后矛盾',
      '能不能认真点'
    ],
    solutions: [
      {
        action: '紧急修复剧情文案',
        cost: '中',
        effect: '快速止损'
      },
      {
        action: '发放剧情BUG奖励',
        cost: '低',
        effect: '转移注意力'
      }
    ]
  },
  {
    type: 'plotIssue',
    name: '结局烂尾',
    description: '剧情大结局让玩家大失所望，评价崩盘。',
    severity: '高',
    triggerCondition: '主线剧情完结',
    playerReactions: [
      '追了这么久就这就这？',
      '烂尾！退钱！',
      '对得起我们的感情吗',
      '编剧出来挨打'
    ],
    solutions: [
      {
        action: '推出真·结局DLC',
        cost: '高',
        effect: '挽回口碑，延长生命周期'
      },
      {
        action: '开放结局投票重制',
        cost: '中',
        effect: '玩家参与感提升'
      }
    ]
  },
  {
    type: 'plotIssue',
    name: 'CP争议',
    description: '官方CP安排引发不同派系玩家激烈争论。',
    severity: '中',
    triggerCondition: '确定官方CP关系',
    playerReactions: [
      '我磕的CP BE了',
      '官方懂个屁的CP',
      '退坑了，心累',
      '还我XX和XX！'
    ],
    solutions: [
      {
        action: '推出多结局选项',
        cost: '高',
        effect: '各派系都满意'
      },
      {
        action: '增加其他角色剧情线',
        cost: '中',
        effect: '分散注意力'
      }
    ]
  },
  {
    type: 'plotIssue',
    name: '敏感内容争议',
    description: '剧情涉及敏感话题，引发舆论争议。',
    severity: '高',
    triggerCondition: '文案审核不严',
    playerReactions: [
      '这内容不合适吧',
      '举报了',
      '官方怎么过审的',
      '游戏要被封了？'
    ],
    solutions: [
      {
        action: '立即下架修改相关内容',
        cost: '高',
        effect: '避免更大危机'
      },
      {
        action: '发布道歉声明',
        cost: '低',
        effect: '平息舆论'
      }
    ]
  }
];

// 其他类型事件
const otherIncidents: Omit<IncidentTemplate, 'id'>[] = [
  {
    type: 'other',
    name: '服务器故障',
    description: '由于技术问题，游戏服务器出现短暂中断，部分玩家无法正常登录游戏。',
    severity: '高',
    triggerCondition: '服务器负载过高或技术故障',
    playerReactions: [
      '怎么又维护了？',
      '我的每日任务还没做呢！',
      '补偿！必须补偿！',
      '技术团队行不行啊'
    ],
    solutions: [
      {
        action: '紧急修复并发放丰厚补偿',
        cost: '高',
        effect: '玩家谅解，声誉+3'
      },
      {
        action: '发布公告说明情况并道歉',
        cost: '低',
        effect: '部分玩家接受，声誉-2'
      }
    ]
  },
  {
    type: 'other',
    name: '数据异常',
    description: '部分玩家反馈游戏数据出现异常，包括角色等级、道具数量等显示错误。',
    severity: '高',
    triggerCondition: '数据库同步异常',
    playerReactions: [
      '我的钻石怎么少了？',
      '角色等级回档了？',
      '这数据不对啊',
      '要求数据恢复'
    ],
    solutions: [
      {
        action: '数据回滚并补偿损失',
        cost: '高',
        effect: '挽回玩家信任，声誉+5'
      },
      {
        action: '逐一核实并修复异常账号',
        cost: '中',
        effect: '解决问题但耗时较长'
      }
    ]
  },
  {
    type: 'other',
    name: '负面新闻报道',
    description: '有媒体发布关于游戏的负面报道，指责游戏存在诱导消费等问题。',
    severity: '中',
    triggerCondition: '媒体关注或玩家投诉引发',
    playerReactions: [
      '原来不只是我觉得坑',
      '媒体都报道了',
      '官方出来回应',
      '这波节奏大了'
    ],
    solutions: [
      {
        action: '发布官方声明澄清事实',
        cost: '中',
        effect: '平息舆论，声誉+2'
      },
      {
        action: '邀请媒体实地调研',
        cost: '低',
        effect: '增加透明度，声誉+5'
      }
    ]
  },
  {
    type: 'other',
    name: '竞品强势上线',
    description: '一款同类型乙女游戏强势上线，大量玩家转游，用户流失严重。',
    severity: '中',
    triggerCondition: '竞品同期上线',
    playerReactions: [
      '隔壁游戏福利更好',
      '我去试试新游戏',
      '你们不改进我就走了',
      '竞品画风真不错'
    ],
    solutions: [
      {
        action: '推出限时福利活动留住玩家',
        cost: '高',
        effect: '减少流失，声誉+3'
      },
      {
        action: '强调自身特色优势',
        cost: '低',
        effect: '部分玩家留下'
      }
    ]
  },
  {
    type: 'other',
    name: '版权纠纷',
    description: '收到版权方通知，游戏中部分素材存在版权争议，需要整改。',
    severity: '高',
    triggerCondition: '版权方投诉或自查发现',
    playerReactions: [
      '这角色要下架了？',
      '我的限定卡怎么办',
      '官方怎么审核的',
      '会不会影响游戏运营'
    ],
    solutions: [
      {
        action: '立即下架争议内容并补偿',
        cost: '高',
        effect: '避免法律风险，声誉+2'
      },
      {
        action: '与版权方协商授权',
        cost: '高',
        effect: '保留内容，声誉+5'
      }
    ]
  }
];

// 福利节奏事件
const welfareIncidents: Omit<IncidentTemplate, 'id'>[] = [
  {
    type: 'welfare',
    name: '福利太少',
    description: '玩家普遍认为游戏福利不够，白嫖体验差。',
    severity: '中',
    triggerCondition: '连续两周无大型活动',
    playerReactions: [
      '这游戏太抠了',
      '福利呢？就这点？',
      '不氪金没法玩',
      '学学其他游戏'
    ],
    solutions: [
      {
        action: '紧急追加登录奖励',
        cost: '中',
        effect: '短期满意度提升'
      },
      {
        action: '预告即将推出的福利活动',
        cost: '低',
        effect: '稳定玩家情绪'
      }
    ]
  },
  {
    type: 'welfare',
    name: '肝度太高',
    description: '活动要求过于肝，玩家抱怨没时间完成。',
    severity: '中',
    triggerCondition: '活动每日任务超过2小时',
    playerReactions: [
      '这是游戏还是上班',
      '没时间肝啊',
      '奖励拿不到了',
      '减负！'
    ],
    solutions: [
      {
        action: '降低活动难度和要求',
        cost: '低',
        effect: '玩家好评'
      },
      {
        action: '推出扫荡功能',
        cost: '中',
        effect: '长期解决肝度问题'
      }
    ]
  },
  {
    type: 'welfare',
    name: '逼氪嫌疑',
    description: '新活动被玩家认为是在逼氪，引发不满。',
    severity: '高',
    triggerCondition: '活动奖励与付费强绑定',
    playerReactions: [
      '不氪金拿不到核心奖励',
      '吃相难看',
      '退游了',
      '这是逼氪！'
    ],
    solutions: [
      {
        action: '增加白嫖获取途径',
        cost: '中',
        effect: '平衡付费与免费玩家'
      },
      {
        action: '调整奖励结构',
        cost: '低',
        effect: '缓解逼氪印象'
      }
    ]
  },
  {
    type: 'welfare',
    name: '对比外服福利',
    description: '玩家发现外服福利比国服好，引发不公平感。',
    severity: '中',
    triggerCondition: '外服推出专属福利',
    playerReactions: [
      '区别对待？',
      '国服玩家不是人？',
      '要公平对待',
      '我们也想要'
    ],
    solutions: [
      {
        action: '国服同步推出同等福利',
        cost: '中',
        effect: '平息不满'
      },
      {
        action: '解释福利差异原因',
        cost: '低',
        effect: '部分玩家理解'
      }
    ]
  },
  {
    type: 'welfare',
    name: '节日无活动',
    description: '重要节日没有推出对应活动，玩家失望。',
    severity: '低',
    triggerCondition: '节假日无特别活动',
    playerReactions: [
      '节日就这么过了？',
      '别的游戏都有活动',
      '太敷衍了',
      '失望'
    ],
    solutions: [
      {
        action: '紧急上线节日活动',
        cost: '高',
        effect: '挽回口碑'
      },
      {
        action: '发放节日补偿',
        cost: '中',
        effect: '缓解失望情绪'
      }
    ]
  }
];

// 生成唯一ID
function generateId(): string {
  return `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 所有事件模板
export const incidentTemplates: IncidentTemplate[] = [
  ...dropRateIncidents.map(t => ({ ...t, id: generateId() })),
  ...plotIssueIncidents.map(t => ({ ...t, id: generateId() })),
  ...welfareIncidents.map(t => ({ ...t, id: generateId() })),
  ...otherIncidents.map(t => ({ ...t, id: generateId() }))
];

/**
 * 按类型获取事件模板
 */
export function getIncidentsByType(type: IncidentType): IncidentTemplate[] {
  return incidentTemplates.filter(i => i.type === type);
}

/**
 * 按严重程度获取事件模板
 */
export function getIncidentsBySeverity(severity: IncidentSeverity): IncidentTemplate[] {
  return incidentTemplates.filter(i => i.severity === severity);
}

/**
 * 随机获取一个事件模板
 */
export function getRandomIncident(): IncidentTemplate {
  return incidentTemplates[Math.floor(Math.random() * incidentTemplates.length)];
}

/**
 * 根据条件获取随机事件
 */
export function generateRandomIncident(
  type?: IncidentType,
  severity?: IncidentSeverity
): IncidentTemplate {
  let pool = incidentTemplates;
  
  if (type) {
    pool = pool.filter(i => i.type === type);
  }
  
  if (severity) {
    pool = pool.filter(i => i.severity === severity);
  }
  
  if (pool.length === 0) {
    pool = incidentTemplates;
  }
  
  const template = pool[Math.floor(Math.random() * pool.length)];
  
  // 生成新的唯一ID
  return {
    ...template,
    id: generateId()
  };
}

/**
 * 获取事件类型名称
 */
export function getIncidentTypeName(type: IncidentType): string {
  const map: Record<IncidentType, string> = {
    dropRate: '爆率争议',
    plotIssue: '剧情雷点',
    welfare: '福利节奏',
    other: '其他事件'
  };
  return map[type];
}

/**
 * 获取严重程度样式
 */
export function getSeverityType(severity: IncidentSeverity): string {
  const map: Record<IncidentSeverity, string> = {
    '低': 'success',
    '中': 'warning',
    '高': 'danger'
  };
  return map[severity];
}
