export interface DateDialogue {
  id: string;
  characterLine: string;
  playerChoices: {
    text: string;
    intimacyChange: number;
    response: string;
  }[];
}

export interface DateScene {
  id: string;
  name: string;
  background: string;
  description: string;
  requiredLevel: number;
  dialogues: DateDialogue[];
  rewards: {
    baseIntimacy: number;
    bonusIntimacy: number;
  };
}

export const dateScenes: DateScene[] = [
  {
    id: 'cafe',
    name: '咖啡馆',
    background: 'linear-gradient(135deg, #D4A574 0%, #C4956A 50%, #8B6914 100%)',
    description: '温馨的咖啡馆，适合轻松的午后约会',
    requiredLevel: 5,
    rewards: {
      baseIntimacy: 5,
      bonusIntimacy: 10
    },
    dialogues: [
      {
        id: 'cafe_1',
        characterLine: '这家咖啡馆的环境真不错呢，你常来这里吗？',
        playerChoices: [
          {
            text: '是啊，我很喜欢这里的氛围，想和你一起分享',
            intimacyChange: 10,
            response: '原来是这样...能和你一起分享喜欢的地方，我很开心。'
          },
          {
            text: '偶尔会来，主要是想找个安静的地方',
            intimacyChange: 5,
            response: '嗯，这里确实很安静，适合放松心情。'
          },
          {
            text: '不太常来，只是随便找了个地方',
            intimacyChange: -5,
            response: '...这样啊，那下次我们可以一起去我喜欢的地方。'
          }
        ]
      },
      {
        id: 'cafe_2',
        characterLine: '你想喝点什么？我请客。',
        playerChoices: [
          {
            text: '那就来一杯拿铁吧，和你一起喝更有味道',
            intimacyChange: 10,
            response: '好，那我也来一杯拿铁，和你一起品尝。'
          },
          {
            text: '谢谢，我要一杯美式就好',
            intimacyChange: 5,
            response: '好的，稍等我一下。'
          },
          {
            text: '不用了，我自己来',
            intimacyChange: -5,
            response: '...好吧，如果你坚持的话。'
          }
        ]
      },
      {
        id: 'cafe_3',
        characterLine: '说起来，你最近在忙什么呢？',
        playerChoices: [
          {
            text: '在想你什么时候会约我出来',
            intimacyChange: 15,
            response: '（脸红）你...你这个人，真是的...其实我也一直在想这个问题。'
          },
          {
            text: '工作有点忙，不过能和你出来放松一下真好',
            intimacyChange: 10,
            response: '辛苦了，那今天我们就好好放松一下吧。'
          },
          {
            text: '没什么特别的，就是日常的事情',
            intimacyChange: 5,
            response: '这样啊，那今天有什么特别的计划吗？'
          }
        ]
      }
    ]
  },
  {
    id: 'cinema',
    name: '电影院',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    description: '浪漫的电影院，一起观看精彩的电影',
    requiredLevel: 5,
    rewards: {
      baseIntimacy: 5,
      bonusIntimacy: 10
    },
    dialogues: [
      {
        id: 'cinema_1',
        characterLine: '听说最近有部电影很不错，你想看什么类型的？',
        playerChoices: [
          {
            text: '想和你一起看爱情片，感觉会很浪漫',
            intimacyChange: 15,
            response: '爱...爱情片吗？（脸红）那...那就看那个吧。'
          },
          {
            text: '动作片怎么样？会很刺激',
            intimacyChange: 10,
            response: '动作片也不错呢，那就这个吧！'
          },
          {
            text: '随便，你决定就好',
            intimacyChange: 0,
            response: '那...那就看这部吧，听说评价不错。'
          }
        ]
      },
      {
        id: 'cinema_2',
        characterLine: '（电影开始）...这个场景好紧张啊...',
        playerChoices: [
          {
            text: '（轻轻握住手）别怕，有我在',
            intimacyChange: 15,
            response: '（脸红）你...你在做什么...不过...不要松开...'
          },
          {
            text: '确实挺紧张的，你还好吗？',
            intimacyChange: 10,
            response: '嗯...还好有你在身边。'
          },
          {
            text: '这有什么好紧张的',
            intimacyChange: -5,
            response: '...是吗，可能是我胆子太小了...'
          }
        ]
      },
      {
        id: 'cinema_3',
        characterLine: '电影结束了，你觉得怎么样？',
        playerChoices: [
          {
            text: '电影很好看，但和你在一起才是最棒的',
            intimacyChange: 15,
            response: '你...你这个人，总是说这种让人心跳加速的话...'
          },
          {
            text: '还不错，下次我们再一起来看吧',
            intimacyChange: 10,
            response: '好啊，我很期待下次的约会。'
          },
          {
            text: '一般般吧',
            intimacyChange: 5,
            response: '是吗...不过能和你一起出来，我还是很开心。'
          }
        ]
      }
    ]
  },
  {
    id: 'amusement_park',
    name: '游乐园',
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 50%, #4ECDC4 100%)',
    description: '欢乐的游乐园，充满欢笑和刺激',
    requiredLevel: 5,
    rewards: {
      baseIntimacy: 5,
      bonusIntimacy: 15
    },
    dialogues: [
      {
        id: 'park_1',
        characterLine: '哇，游乐园好热闹啊！你想先玩什么？',
        playerChoices: [
          {
            text: '想和你一起坐摩天轮，听说那里看风景最美',
            intimacyChange: 15,
            response: '摩天轮吗...听说在那里告白会成功呢...（小声）'
          },
          {
            text: '过山车怎么样？会很刺激！',
            intimacyChange: 10,
            response: '过山车...有点害怕，不过如果你在的话...我可以试试。'
          },
          {
            text: '随便转转吧，人太多了',
            intimacyChange: 0,
            response: '嗯...那我们就慢慢逛逛吧。'
          }
        ]
      },
      {
        id: 'park_2',
        characterLine: '（在旋转木马前）这个看起来很浪漫呢...',
        playerChoices: [
          {
            text: '那我们一起坐吧，我想和你留下美好的回忆',
            intimacyChange: 15,
            response: '好...好啊！（开心）我会一直记住这一刻的。'
          },
          {
            text: '想坐就坐吧，我陪你',
            intimacyChange: 10,
            response: '谢谢你愿意陪我，那我们走吧！'
          },
          {
            text: '这个有点幼稚吧...',
            intimacyChange: -5,
            response: '...是吗，那就算了...（失落）'
          }
        ]
      },
      {
        id: 'park_3',
        characterLine: '今天玩得真开心，谢谢你陪我',
        playerChoices: [
          {
            text: '能和你在一起，每一天都是最开心的',
            intimacyChange: 15,
            response: '（脸红）你...你总是这样...不过...我也是这么想的。'
          },
          {
            text: '我也很开心，下次我们再来吧',
            intimacyChange: 10,
            response: '好啊！下次我们玩更多项目！'
          },
          {
            text: '嗯，还不错',
            intimacyChange: 5,
            response: '那就好...我也玩得很开心。'
          }
        ]
      }
    ]
  },
  {
    id: 'beach',
    name: '海边',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    description: '浪漫的海边，海风轻拂，夕阳西下',
    requiredLevel: 6,
    rewards: {
      baseIntimacy: 8,
      bonusIntimacy: 15
    },
    dialogues: [
      {
        id: 'beach_1',
        characterLine: '海风好舒服啊...你看，夕阳好美。',
        playerChoices: [
          {
            text: '是很美，但在我眼中，你比夕阳更美',
            intimacyChange: 15,
            response: '（脸红）你...你说什么呢...不过...谢谢...'
          },
          {
            text: '是啊，能和你一起看夕阳真好',
            intimacyChange: 10,
            response: '嗯，我也觉得这一刻很珍贵。'
          },
          {
            text: '还行吧，就是有点冷',
            intimacyChange: 0,
            response: '冷吗？那...要不要靠近一点？'
          }
        ]
      },
      {
        id: 'beach_2',
        characterLine: '（走在沙滩上）我们写点什么在沙滩上吧？',
        playerChoices: [
          {
            text: '写下我们的名字，让大海见证我们的约定',
            intimacyChange: 15,
            response: '约定...吗？（脸红）好...那就写吧...'
          },
          {
            text: '好啊，写点开心的回忆',
            intimacyChange: 10,
            response: '嗯！希望这些回忆能永远留在心里。'
          },
          {
            text: '写了也会被海水冲走，没意义',
            intimacyChange: -5,
            response: '...是吗...但我还是想记住这一刻...'
          }
        ]
      },
      {
        id: 'beach_3',
        characterLine: '时间过得好快，天都快黑了...',
        playerChoices: [
          {
            text: '和你在一起，时间总是不够用，不想分开',
            intimacyChange: 15,
            response: '我也是...其实...我也舍不得离开你...'
          },
          {
            text: '是啊，不过今天真的很开心',
            intimacyChange: 10,
            response: '我也是，谢谢你陪我来这里。'
          },
          {
            text: '差不多该回去了',
            intimacyChange: 5,
            response: '嗯...那我们回去吧...'
          }
        ]
      }
    ]
  },
  {
    id: 'home',
    name: '家中',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    description: '温馨的家中，享受二人世界的宁静',
    requiredLevel: 7,
    rewards: {
      baseIntimacy: 10,
      bonusIntimacy: 20
    },
    dialogues: [
      {
        id: 'home_1',
        characterLine: '谢谢你邀请我来你家...有点紧张呢...',
        playerChoices: [
          {
            text: '别紧张，就把这里当成自己家，因为我想让你感到安心',
            intimacyChange: 15,
            response: '你总是这么温柔...那我...就不客气了...'
          },
          {
            text: '放松点，我们只是聊聊天',
            intimacyChange: 10,
            response: '嗯...那我就放心了...'
          },
          {
            text: '紧张什么，又不是第一次见面',
            intimacyChange: 0,
            response: '也...也是呢...我太紧张了...'
          }
        ]
      },
      {
        id: 'home_2',
        characterLine: '你家里布置得好温馨...能看出你很用心生活',
        playerChoices: [
          {
            text: '因为想让你来的时候能感到温暖',
            intimacyChange: 15,
            response: '（脸红）你...你早就想邀请我来了吗...'
          },
          {
            text: '谢谢，你喜欢就好',
            intimacyChange: 10,
            response: '嗯，我很喜欢，感觉很舒服。'
          },
          {
            text: '还行吧，随便布置的',
            intimacyChange: 5,
            response: '这样啊...不过我觉得很有品味呢。'
          }
        ]
      },
      {
        id: 'home_3',
        characterLine: '今天能和你独处...我很开心...',
        playerChoices: [
          {
            text: '我也是，其实我一直期待着这一天',
            intimacyChange: 15,
            response: '（脸红）你...你这个人...总是说这种话...不过...我也是...'
          },
          {
            text: '我也很开心，以后我们可以经常这样',
            intimacyChange: 10,
            response: '真的吗？那...我会很期待的...'
          },
          {
            text: '嗯，还不错',
            intimacyChange: 5,
            response: '那就好...我也觉得今天很特别...'
          }
        ]
      }
    ]
  }
];

export function getDateSceneById(id: string): DateScene | undefined {
  return dateScenes.find(scene => scene.id === id);
}

export function getUnlockedDateScenes(level: number): DateScene[] {
  return dateScenes.filter(scene => scene.requiredLevel <= level);
}
