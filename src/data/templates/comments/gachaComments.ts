/**
 * 抽卡类评论模板
 */

export const gachaCommentTemplates = {
  // 欧皇类 - 运气好的玩家
  lucky: [
    '十连三黄！今天运气爆棚！！！',
    '单抽出奇迹！一发入魂！！',
    '终于抽到老公了！氪了{amount}单也值得！',
    '这爆率我爱了，{count}连出了{ssrCount}个SSR',
    '今天是什么神仙日子，连出两个UP角色',
    '免费单抽出货，这波血赚',
    '刚说完想要就出了，这游戏懂我',
    '转运了转运了，连续三个十连都有SSR',
    '第一次这么欧，必须截图留念',
    '这就是传说中的新手保护期吗',
    '随手一抽，没想到出货了',
    '今天宜抽卡，姐妹们冲啊',
    '玄学有用！按攻略说的方位抽真的出货了',
    '刚充完钱就出货，这游戏太会了',
    '保底之前出货，这波不亏',
    '双黄蛋！我好了',
    '三黄蛋！我死了！',
    '连出三个新角色，今天是我的幸运日',
    '白嫖党也能欧，感动哭了',
    '这就是命运的安排吗，一发入魂'
  ],

  // 非酋类 - 运气差的玩家
  unlucky: [
    '抽了{count}连全是R卡，这爆率认真的吗？？？',
    '氪了{amount}单还没出，我要报警了',
    '保底人保底魂，保底都是人上人',
    '又双叒叕歪了，我心态崩了',
    '这爆率，我直接emo',
    '抽卡前：这次一定出；抽卡后：我是小丑',
    '我的钱包在哭泣，我的心脏在滴血',
    '连续{count}个十连无SSR，这合理吗',
    'UP池歪了{count}次，我服了',
    '别人十连三黄，我十连十R',
    '这游戏是不是针对我',
    '氪金体验极差，建议改名《保底模拟器》',
    '抽完卡想退游了',
    '我的存款：-9999',
    '这爆率，策划是不是没有心',
    '抽了{count}万钻，就一个SSR还歪了',
    '别人玩游戏我玩心态',
    '这卡池有毒，大家谨慎抽取',
    '我怀疑这游戏根本没有UP角色',
    '抽卡一时爽，钱包火葬场'
  ],

  // 晒卡类 - 炫耀抽卡结果
  showoff: [
    '新老公get！立绘太帅了prprpr',
    '满破达成！钱包在哭泣但心在笑',
    '全图鉴收集完成，可以安心养老了',
    '新角色{count}命，这波氪得值',
    '终于等到你，还好我没放弃',
    '新老婆太美了，我直接嗨老婆',
    '限定角色毕业，可以安心等下个池子了',
    '图鉴党狂喜，又添一员大将',
    '新角色技能好强，必抽人权卡',
    '满命毕业，伤害爆炸',
    '新角色立绘、建模、声优都在线，完美',
    '抽到即毕业，资源早就准备好了',
    '新角色和我预期的完全一样，太满意了',
    '限定全收集，继续当我的图鉴党',
    '新角色{count}连毕业，运气不错',
    '终于可以把新角色放进队伍了',
    '新角色剧情太甜了，抽得不亏',
    '为了新角色氪了{amount}单，值得',
    '新角色配音太苏了，我死了',
    '新角色服装好精致，细节控狂喜'
  ],

  // 建议类 - 对抽卡系统的建议
  suggestion: [
    '建议提高UP概率，{count}连不出太劝退了',
    '能不能加个保底继承？每次重置太坑了',
    '卡池太深了，新手怎么活啊',
    '建议增加软保底机制',
    '能不能出个必得池，贵点也行',
    'UP概率能不能再透明一点',
    '建议增加抽卡记录查询',
    '能不能降低保底次数',
    '建议增加免费抽卡途径',
    '卡池轮换能不能快一点',
    '建议增加角色试用',
    '能不能出个自选UP池',
    '建议降低重复角色的价值',
    '能不能增加抽卡保底提示',
    '建议优化抽卡动画，太浪费时间',
    '能不能出个抽卡模拟器',
    '建议增加好友助战系统',
    '能不能降低高星角色的获取难度',
    '建议增加保底兑换商店',
    '能不能出个新手保护期'
  ],

  // 观望类 - 犹豫要不要抽
  hesitate: [
    '这个新角色强不强？值得抽吗',
    '下个池子好像更好，要不要等',
    '资源不够了，纠结要不要氪金',
    '这个角色和现有角色搭配吗',
    '抽还是不抽，这是个问题',
    '等评测出来再决定抽不抽',
    '手里只有{count}抽，能出货吗',
    '这个角色是常驻还是限定',
    '等复刻还是现在抽，好纠结',
    '看大家抽卡结果再决定',
    '这个角色剧情戏份多吗',
    '值不值得为了立绘抽',
    '强度党在犹豫，有没有大佬给建议',
    '等新角色实战视频出来再抽',
    '手里资源只够保底，要不要赌',
    '这个角色是版本答案吗',
    '抽了怕后悔，不抽也怕后悔',
    '等周年庆还是现在抽',
    '这个角色保值吗',
    '纠结党求建议，抽还是不抽'
  ]
};

// 获取随机抽卡评论
export function getRandomGachaComment(type?: keyof typeof gachaCommentTemplates): string {
  const types = Object.keys(gachaCommentTemplates) as Array<keyof typeof gachaCommentTemplates>;
  const selectedType = type || types[Math.floor(Math.random() * types.length)];
  const templates = gachaCommentTemplates[selectedType];
  let template = templates[Math.floor(Math.random() * templates.length)];
  
  // 替换变量
  const variables: Record<string, string | number> = {
    count: Math.floor(Math.random() * 100) + 50,
    amount: Math.floor(Math.random() * 10) + 1,
    ssrCount: Math.floor(Math.random() * 3) + 1
  };
  
  Object.keys(variables).forEach(key => {
    template = template.replace(`{${key}}`, String(variables[key]));
  });
  
  return template;
}

// 根据玩家类型获取评论
export function getGachaCommentByPlayerType(playerType: '氪金大佬' | '剧情党' | '外观党' | '休闲玩家'): string {
  switch (playerType) {
    case '氪金大佬':
      return getRandomGachaComment('showoff');
    case '休闲玩家':
      return getRandomGachaComment(Math.random() > 0.5 ? 'lucky' : 'unlucky');
    default:
      return getRandomGachaComment();
  }
}
