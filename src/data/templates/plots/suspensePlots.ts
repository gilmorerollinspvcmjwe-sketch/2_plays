/**
 * 悬疑路线剧情模板补充
 */

export const suspensePlotTemplates = [
  {
    id: "suspense_003",
    routeType: "suspense",
    title: "失忆之谜",
    summary: "你失去了记忆，他是唯一知道真相的人。但你能相信他吗？",
    difficulty: "困难",
    chapters: [
      {
        chapter: 1,
        title: "醒来",
        scene: "医院病房",
        keyEvent: "你醒来发现自己失去了所有记忆，一个陌生男人守在床边",
        choices: ["信任他", "保持警惕", "询问详情"],
        selectedChoice: 0
      },
      {
        chapter: 2,
        title: "碎片记忆",
        scene: "家中",
        keyEvent: "回到所谓的家，你开始看到一些奇怪的画面",
        choices: ["深入探索", "向他询问", "装作无事"],
        selectedChoice: 0
      },
      {
        chapter: 3,
        title: "真相浮现",
        scene: "旧仓库",
        keyEvent: "你发现了隐藏的日记，真相开始浮出水面",
        choices: ["继续调查", "当面质问", "暗中观察"],
        selectedChoice: 0
      },
      {
        chapter: 4,
        title: "身份揭晓",
        scene: "警察局",
        keyEvent: "你发现自己的真实身份，以及他的秘密",
        choices: ["选择原谅", "离开他", "共同面对"],
        selectedChoice: 0
      },
      {
        chapter: 5,
        title: "新的开始",
        scene: "海边",
        keyEvent: "真相大白，你们面临最后的选择",
        choices: ["重新开始", "各自安好", "永不分离"],
        selectedChoice: 0
      }
    ]
  },
  {
    id: "suspense_004",
    routeType: "suspense",
    title: "替身疑云",
    summary: "有人冒充你，而真正的你成了替身。谁才是真实的你？",
    difficulty: "困难",
    chapters: [
      {
        chapter: 1,
        title: "身份互换",
        scene: "陌生房间",
        keyEvent: "你醒来发现自己被囚禁，有人冒充你的身份生活",
        choices: ["设法逃脱", "观察环境", "寻求帮助"],
        selectedChoice: 0
      },
      {
        chapter: 2,
        title: "神秘救星",
        scene: "废弃建筑",
        keyEvent: "一个神秘男人救了你，声称是你的未婚夫",
        choices: ["相信他", "保持怀疑", "试探身份"],
        selectedChoice: 0
      },
      {
        chapter: 3,
        title: "双面人生",
        scene: "城市街头",
        keyEvent: "你看到了自己和那个冒充者在一起",
        choices: ["当场揭穿", "暗中调查", "等待时机"],
        selectedChoice: 0
      },
      {
        chapter: 4,
        title: "真相大白",
        scene: "实验室",
        keyEvent: "原来你是被克隆的，而他是阻止这一切的科学家",
        choices: ["接受真相", "否定一切", "寻找出路"],
        selectedChoice: 0
      },
      {
        chapter: 5,
        title: "自我认同",
        scene: "天台",
        keyEvent: "即使你是克隆人，他也选择了你",
        choices: ["接受自己", "牺牲自己", "逃离一切"],
        selectedChoice: 0
      }
    ]
  },
  {
    id: "suspense_005",
    routeType: "suspense",
    title: "时间循环",
    summary: "同一天不断重复，只有你们记得一切。如何打破循环？",
    difficulty: "困难",
    chapters: [
      {
        chapter: 1,
        title: "重复的一天",
        scene: "卧室",
        keyEvent: "你发现今天和昨天一模一样",
        choices: ["告诉他人", "独自探索", "享受循环"],
        selectedChoice: 0
      },
      {
        chapter: 2,
        title: "同类",
        scene: "学校",
        keyEvent: "你发现他也记得昨天的事",
        choices: ["寻求合作", "保持距离", "试探他"],
        selectedChoice: 0
      },
      {
        chapter: 3,
        title: "寻找规律",
        scene: "图书馆",
        keyEvent: "你们开始记录每一天，寻找打破循环的方法",
        choices: ["改变大事", "改变小事", "顺其自然"],
        selectedChoice: 0
      },
      {
        chapter: 4,
        title: "循环真相",
        scene: "实验室",
        keyEvent: "发现循环与一次实验事故有关",
        choices: ["阻止事故", "接受循环", "寻找牺牲者"],
        selectedChoice: 0
      },
      {
        chapter: 5,
        title: "打破循环",
        scene: "事故发生地",
        keyEvent: "必须有人牺牲才能结束循环",
        choices: ["你牺牲", "他牺牲", "共同面对"],
        selectedChoice: 0
      }
    ]
  },
  {
    id: "suspense_006",
    routeType: "suspense",
    title: "密室逃脱",
    summary: "被困在密室中，必须解开谜题才能逃脱。而幕后黑手就在你们之中...",
    difficulty: "困难",
    chapters: [
      {
        chapter: 1,
        title: "醒来",
        scene: "密室",
        keyEvent: "你醒来发现被困在密室，身边还有几个陌生人",
        choices: ["自我介绍", "保持沉默", "寻找出口"],
        selectedChoice: 0
      },
      {
        chapter: 2,
        title: "第一个谜题",
        scene: "密室中央",
        keyEvent: "墙上的屏幕亮起，显示第一个谜题",
        choices: ["主动解题", "让他人解", "合作解决"],
        selectedChoice: 0
      },
      {
        chapter: 3,
        title: "信任危机",
        scene: "密室暗房",
        keyEvent: "有人暗中破坏，你们开始互相怀疑",
        choices: ["指认凶手", "保护自己", "寻找真相"],
        selectedChoice: 0
      },
      {
        chapter: 4,
        title: "真相浮现",
        scene: "密室控制室",
        keyEvent: "发现这一切都是某个人的复仇计划",
        choices: ["劝说他", "制服他", "理解他"],
        selectedChoice: 0
      },
      {
        chapter: 5,
        title: "最后谜题",
        scene: "最终房间",
        keyEvent: "最后一个谜题需要牺牲一个人才能解开",
        choices: ["你牺牲", "他牺牲", "共同牺牲"],
        selectedChoice: 0
      }
    ]
  }
];
