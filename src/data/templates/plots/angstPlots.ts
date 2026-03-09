/**
 * 虐恋路线剧情模板补充
 */

export const angstPlotTemplates = [
  {
    id: "angst_003",
    routeType: "angst",
    title: "禁忌之恋",
    summary: "他是你名义上的哥哥，这份感情注定不被世俗接受。在道德与爱情之间，你们该何去何从？",
    difficulty: "困难",
    chapters: [
      {
        chapter: 1,
        title: "重组家庭",
        scene: "新家客厅，尴尬的气氛",
        keyEvent: "父母再婚，他成为了你的继兄",
        choices: ["保持距离", "尝试友好", "心生好感"],
        selectedChoice: 0
      },
      {
        chapter: 2,
        title: "暗生情愫",
        scene: "深夜客厅，只有电视的声音",
        keyEvent: "独处时的暧昧氛围，心跳加速",
        choices: ["逃避离开", "装作无事", "暗示心意"],
        selectedChoice: 0
      },
      {
        chapter: 3,
        title: "被发现",
        scene: "学校走廊，同学窃窃私语",
        keyEvent: "你们的关系被人发现，流言四起",
        choices: ["否认关系", "承认一切", "暂时分开"],
        selectedChoice: 0
      },
      {
        chapter: 4,
        title: "父母反对",
        scene: "家中客厅，父母愤怒",
        keyEvent: "父母发现真相，强烈反对",
        choices: ["坚持爱情", "选择分手", "暂时隐瞒"],
        selectedChoice: 0
      },
      {
        chapter: 5,
        title: "艰难抉择",
        scene: "车站月台，即将分离",
        keyEvent: "他即将出国，你们面临最后的选择",
        choices: ["一起离开", "留下等待", "就此别过"],
        selectedChoice: 0
      }
    ]
  },
  {
    id: "angst_004",
    routeType: "angst",
    title: "身份悬殊",
    summary: "富家千金与穷小子的爱情，在金钱与阶级的鸿沟面前，能否修成正果？",
    difficulty: "困难",
    chapters: [
      {
        chapter: 1,
        title: "意外相遇",
        scene: "便利店",
        keyEvent: "你在便利店打工的他，因一次意外相识",
        choices: ["留下联系方式", "默默离开", "帮助解围"],
        selectedChoice: 0
      },
      {
        chapter: 2,
        title: "身份揭露",
        scene: "慈善晚宴",
        keyEvent: "在晚宴上，他才发现你是豪门千金",
        choices: ["主动解释", "保持距离", "坦诚相待"],
        selectedChoice: 0
      },
      {
        chapter: 3,
        title: "家庭阻挠",
        scene: "你家豪宅",
        keyEvent: "父母得知你们的关系，强烈反对",
        choices: ["据理力争", "暂时妥协", "私奔逃离"],
        selectedChoice: 0
      },
      {
        chapter: 4,
        title: "误会重重",
        scene: "咖啡厅",
        keyEvent: "误会他接近你是为了钱，心碎分手",
        choices: ["听他解释", "坚决分手", "暗中调查"],
        selectedChoice: 0
      },
      {
        chapter: 5,
        title: "破镜重圆",
        scene: "初次相遇的便利店",
        keyEvent: "多年后重逢，误会终于解开",
        choices: ["重新开始", "祝福彼此", "保持朋友"],
        selectedChoice: 0
      }
    ]
  },
  {
    id: "angst_005",
    routeType: "angst",
    title: "生离死别",
    summary: "他得了绝症，剩下的日子只想和你在一起。你们能否创造奇迹？",
    difficulty: "困难",
    chapters: [
      {
        chapter: 1,
        title: "异常症状",
        scene: "医院",
        keyEvent: "他频繁晕倒，检查结果令人震惊",
        choices: ["陪伴检查", "询问详情", "默默担心"],
        selectedChoice: 0
      },
      {
        chapter: 2,
        title: "真相揭晓",
        scene: "病房",
        keyEvent: "得知他只剩半年时间",
        choices: ["崩溃大哭", "强颜欢笑", "决心陪伴"],
        selectedChoice: 0
      },
      {
        chapter: 3,
        title: "珍惜时光",
        scene: "海边",
        keyEvent: "你们决定用剩下的时间完成愿望清单",
        choices: ["环游世界", "平淡生活", "完成梦想"],
        selectedChoice: 0
      },
      {
        chapter: 4,
        title: "病情恶化",
        scene: "重症监护室",
        keyEvent: "他的病情突然恶化",
        choices: ["日夜守护", "寻找名医", "完成心愿"],
        selectedChoice: 0
      },
      {
        chapter: 5,
        title: "最后告别",
        scene: "病房",
        keyEvent: "他在你怀中安详离去",
        choices: ["坚强活下去", "追随而去", "永远怀念"],
        selectedChoice: 0
      }
    ]
  },
  {
    id: "angst_006",
    routeType: "angst",
    title: "前世今生",
    summary: "前世的羁绊，今生的错过。你们能否打破命运的轮回？",
    difficulty: "困难",
    chapters: [
      {
        chapter: 1,
        title: "奇怪梦境",
        scene: "卧室",
        keyEvent: "你开始频繁梦见古代的场景",
        choices: ["记录梦境", "寻找解释", "告诉他人"],
        selectedChoice: 0
      },
      {
        chapter: 2,
        title: "似曾相识",
        scene: "博物馆",
        keyEvent: "在博物馆看到一幅古画，画中人与你一模一样",
        choices: ["深入研究", "拍照记录", "询问专家"],
        selectedChoice: 0
      },
      {
        chapter: 3,
        title: "记忆觉醒",
        scene: "古寺",
        keyEvent: "在古寺中，前世的记忆逐渐苏醒",
        choices: ["接受记忆", "抗拒过去", "寻找真相"],
        selectedChoice: 0
      },
      {
        chapter: 4,
        title: "宿命对决",
        scene: "梦境与现实交界",
        keyEvent: "前世的悲剧即将重演",
        choices: ["改变命运", "接受宿命", "牺牲自己"],
        selectedChoice: 0
      },
      {
        chapter: 5,
        title: "打破轮回",
        scene: "初遇的地方",
        keyEvent: "用今生的爱打破前世的诅咒",
        choices: ["永远在一起", "来世再见", "各自安好"],
        selectedChoice: 0
      }
    ]
  }
];
