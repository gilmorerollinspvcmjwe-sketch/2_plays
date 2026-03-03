/**
 * 多平台评论模板库
 * 包含抖音、小红书、微博、B 站、贴吧等平台的评论模板
 */

// ============ 类型定义 ============

export type PlatformType = 
  | 'douyin'         // 抖音
  | 'xiaohongshu'    // 小红书
  | 'weibo'          // 微博
  | 'bilibili'       // B 站
  | 'tieba';         // 贴吧

export type PlatformCommentSentiment = 'positive' | 'neutral' | 'negative';

export interface PlatformCommentTemplate {
  id: string;
  platform: PlatformType;
  content: string;
  baseLikes: number;      // 基础点赞数 (10-500)
  sentiment: PlatformCommentSentiment;
  tags: string[];
}

// ============ 抖音评论模板 ============
const douyinComments: PlatformCommentTemplate[] = [
  {
    id: 'dy_001',
    platform: 'douyin',
    content: '家人们谁懂啊，这游戏真的绝绝子！😭💖',
    baseLikes: 156,
    sentiment: 'positive',
    tags: ['绝绝子', '推荐']
  },
  {
    id: 'dy_002',
    platform: 'douyin',
    content: '真的会谢，抽了 100 连全是 R 卡😅',
    baseLikes: 234,
    sentiment: 'negative',
    tags: ['爆率', '吐槽']
  },
  {
    id: 'dy_003',
    platform: 'douyin',
    content: '狠狠懂了！男主也太帅了吧✨🔥',
    baseLikes: 189,
    sentiment: 'positive',
    tags: ['男主', '颜值']
  },
  {
    id: 'dy_004',
    platform: 'douyin',
    content: '家人们，这个剧情我真的会哭死😭💕',
    baseLikes: 267,
    sentiment: 'positive',
    tags: ['剧情', '感人']
  },
  {
    id: 'dy_005',
    platform: 'douyin',
    content: '这爆率真的会谢，退游了家人们',
    baseLikes: 312,
    sentiment: 'negative',
    tags: ['退游', '爆率']
  },
  {
    id: 'dy_006',
    platform: 'douyin',
    content: '绝绝子！这个皮肤设计太美了✨',
    baseLikes: 145,
    sentiment: 'positive',
    tags: ['皮肤', '外观']
  },
  {
    id: 'dy_007',
    platform: 'douyin',
    content: '家人们谁懂啊，氪了 500 还是抽不到😭',
    baseLikes: 423,
    sentiment: 'negative',
    tags: ['氪金', '抽卡']
  },
  {
    id: 'dy_008',
    platform: 'douyin',
    content: '狠狠懂了，这才是乙游该有的样子！💖',
    baseLikes: 178,
    sentiment: 'positive',
    tags: ['乙游', '推荐']
  },
  {
    id: 'dy_009',
    platform: 'douyin',
    content: '真的会谢，服务器又炸了😅🔥',
    baseLikes: 289,
    sentiment: 'negative',
    tags: ['服务器', '优化']
  },
  {
    id: 'dy_010',
    platform: 'douyin',
    content: '家人们，这个配音我真的会爱死😭✨',
    baseLikes: 201,
    sentiment: 'positive',
    tags: ['配音', '声优']
  },
  {
    id: 'dy_011',
    platform: 'douyin',
    content: '绝绝子！活动福利太多了吧💖🔥',
    baseLikes: 167,
    sentiment: 'positive',
    tags: ['活动', '福利']
  },
  {
    id: 'dy_012',
    platform: 'douyin',
    content: '真的会谢，这剧情走向我服了😅',
    baseLikes: 256,
    sentiment: 'negative',
    tags: ['剧情', '编剧']
  },
  {
    id: 'dy_013',
    platform: 'douyin',
    content: '家人们谁懂啊，男主太撩了我受不了😭💕',
    baseLikes: 334,
    sentiment: 'positive',
    tags: ['男主', '撩人']
  },
  {
    id: 'dy_014',
    platform: 'douyin',
    content: '狠狠懂了！这游戏太上头了🔥',
    baseLikes: 198,
    sentiment: 'positive',
    tags: ['上头', '推荐']
  },
  {
    id: 'dy_015',
    platform: 'douyin',
    content: '真的会谢，卡池毒得要命😅💔',
    baseLikes: 278,
    sentiment: 'negative',
    tags: ['卡池', '吐槽']
  },
  {
    id: 'dy_016',
    platform: 'douyin',
    content: '绝绝子！这个立绘我能看一天✨',
    baseLikes: 156,
    sentiment: 'positive',
    tags: ['立绘', '画风']
  },
  {
    id: 'dy_017',
    platform: 'douyin',
    content: '家人们，这个结局我真的会哭死😭',
    baseLikes: 389,
    sentiment: 'positive',
    tags: ['结局', '感人']
  },
  {
    id: 'dy_018',
    platform: 'douyin',
    content: '真的会谢，加载慢得要死😅',
    baseLikes: 234,
    sentiment: 'negative',
    tags: ['优化', '加载']
  },
  {
    id: 'dy_019',
    platform: 'douyin',
    content: '狠狠懂了！姐妹们快冲这个活动💖🔥',
    baseLikes: 212,
    sentiment: 'positive',
    tags: ['活动', '推荐']
  },
  {
    id: 'dy_020',
    platform: 'douyin',
    content: '家人们谁懂啊，这游戏音乐太好听了😭✨',
    baseLikes: 167,
    sentiment: 'positive',
    tags: ['音乐', 'OST']
  }
];

// ============ 小红书评论模板 ============
const xiaohongshuComments: PlatformCommentTemplate[] = [
  {
    id: 'xhs_001',
    platform: 'xiaohongshu',
    content: '姐妹们冲！这个乙游真的绝了💕🌸',
    baseLikes: 234,
    sentiment: 'positive',
    tags: ['推荐', '乙游']
  },
  {
    id: 'xhs_002',
    platform: 'xiaohongshu',
    content: '亲测好用！这个抽卡技巧分享给你们🎀',
    baseLikes: 312,
    sentiment: 'positive',
    tags: ['攻略', '抽卡']
  },
  {
    id: 'xhs_003',
    platform: 'xiaohongshu',
    content: '按头安利！男主太帅了我没了💄✨',
    baseLikes: 278,
    sentiment: 'positive',
    tags: ['男主', '安利']
  },
  {
    id: 'xhs_004',
    platform: 'xiaohongshu',
    content: '真香警告！一开始不玩后来真香了💕',
    baseLikes: 189,
    sentiment: 'positive',
    tags: ['真香', '推荐']
  },
  {
    id: 'xhs_005',
    platform: 'xiaohongshu',
    content: '姐妹们，这个皮肤真的必入！🌸🎀',
    baseLikes: 256,
    sentiment: 'positive',
    tags: ['皮肤', '外观']
  },
  {
    id: 'xhs_006',
    platform: 'xiaohongshu',
    content: '亲测好用！这个活动福利超多💕',
    baseLikes: 201,
    sentiment: 'positive',
    tags: ['活动', '福利']
  },
  {
    id: 'xhs_007',
    platform: 'xiaohongshu',
    content: '按头安利！剧情写得真的很好💄',
    baseLikes: 167,
    sentiment: 'positive',
    tags: ['剧情', '文案']
  },
  {
    id: 'xhs_008',
    platform: 'xiaohongshu',
    content: '真香警告！这游戏太上头了姐妹们🌸',
    baseLikes: 298,
    sentiment: 'positive',
    tags: ['上头', '推荐']
  },
  {
    id: 'xhs_009',
    platform: 'xiaohongshu',
    content: '姐妹们冲这个卡池！我出金了！💕✨',
    baseLikes: 345,
    sentiment: 'positive',
    tags: ['抽卡', '欧气']
  },
  {
    id: 'xhs_010',
    platform: 'xiaohongshu',
    content: '亲测好用！新手入坑攻略来了🎀',
    baseLikes: 423,
    sentiment: 'positive',
    tags: ['攻略', '新手']
  },
  {
    id: 'xhs_011',
    platform: 'xiaohongshu',
    content: '按头安利！这个配音阵容太豪华了💄',
    baseLikes: 178,
    sentiment: 'positive',
    tags: ['配音', '声优']
  },
  {
    id: 'xhs_012',
    platform: 'xiaohongshu',
    content: '真香警告！一开始觉得一般后来真香💕',
    baseLikes: 234,
    sentiment: 'positive',
    tags: ['真香', '评价']
  },
  {
    id: 'xhs_013',
    platform: 'xiaohongshu',
    content: '姐妹们，这个结局我哭死了😭🌸',
    baseLikes: 289,
    sentiment: 'positive',
    tags: ['剧情', '结局']
  },
  {
    id: 'xhs_014',
    platform: 'xiaohongshu',
    content: '亲测好用！这个时装搭配绝了🎀💄',
    baseLikes: 212,
    sentiment: 'positive',
    tags: ['时装', '搭配']
  },
  {
    id: 'xhs_015',
    platform: 'xiaohongshu',
    content: '按头安利！男主互动太甜了💕✨',
    baseLikes: 267,
    sentiment: 'positive',
    tags: ['男主', '互动']
  },
  {
    id: 'xhs_016',
    platform: 'xiaohongshu',
    content: '真香警告！这游戏音乐太好听了🌸',
    baseLikes: 156,
    sentiment: 'positive',
    tags: ['音乐', 'OST']
  },
  {
    id: 'xhs_017',
    platform: 'xiaohongshu',
    content: '姐妹们冲！这个活动不要错过💕🎀',
    baseLikes: 198,
    sentiment: 'positive',
    tags: ['活动', '推荐']
  },
  {
    id: 'xhs_018',
    platform: 'xiaohongshu',
    content: '亲测好用！这个玩法很有意思💄',
    baseLikes: 145,
    sentiment: 'positive',
    tags: ['玩法', '攻略']
  },
  {
    id: 'xhs_019',
    platform: 'xiaohongshu',
    content: '按头安利！立绘精美到爆炸🌸✨',
    baseLikes: 223,
    sentiment: 'positive',
    tags: ['立绘', '画风']
  },
  {
    id: 'xhs_020',
    platform: 'xiaohongshu',
    content: '真香警告！白嫖党也能玩得开心💕',
    baseLikes: 312,
    sentiment: 'positive',
    tags: ['白嫖', '福利']
  }
];

// ============ 微博评论模板 ============
const weiboComments: PlatformCommentTemplate[] = [
  {
    id: 'wb_001',
    platform: 'weibo',
    content: '塌房了！这爆率是认真的吗？📢🔥',
    baseLikes: 456,
    sentiment: 'negative',
    tags: ['爆率', '吐槽']
  },
  {
    id: 'wb_002',
    platform: 'weibo',
    content: '求图！有人抽到 SSR 吗？蹲一个🍉👀',
    baseLikes: 234,
    sentiment: 'neutral',
    tags: ['抽卡', '求图']
  },
  {
    id: 'wb_003',
    platform: 'weibo',
    content: '蹲后续！这个剧情走向太有意思了📢',
    baseLikes: 312,
    sentiment: 'positive',
    tags: ['剧情', '讨论']
  },
  {
    id: 'wb_004',
    platform: 'weibo',
    content: '有一说一，这游戏立绘确实不错🔥',
    baseLikes: 189,
    sentiment: 'positive',
    tags: ['立绘', '评价']
  },
  {
    id: 'wb_005',
    platform: 'weibo',
    content: '塌房了！服务器又炸了官方出来！📢🍉',
    baseLikes: 523,
    sentiment: 'negative',
    tags: ['服务器', '官方']
  },
  {
    id: 'wb_006',
    platform: 'weibo',
    content: '求图！这个皮肤实际效果怎么样？👀',
    baseLikes: 167,
    sentiment: 'neutral',
    tags: ['皮肤', '外观']
  },
  {
    id: 'wb_007',
    platform: 'weibo',
    content: '蹲后续！男主身份到底是什么？🔥📢',
    baseLikes: 278,
    sentiment: 'neutral',
    tags: ['男主', '剧情']
  },
  {
    id: 'wb_008',
    platform: 'weibo',
    content: '有一说一，配音阵容确实豪华🍉',
    baseLikes: 201,
    sentiment: 'positive',
    tags: ['配音', '声优']
  },
  {
    id: 'wb_009',
    platform: 'weibo',
    content: '塌房了！这剧情走向我服了📢🔥',
    baseLikes: 389,
    sentiment: 'negative',
    tags: ['剧情', '编剧']
  },
  {
    id: 'wb_010',
    platform: 'weibo',
    content: '求图！有人欧皇附体吗？晒晒👀🍉',
    baseLikes: 245,
    sentiment: 'neutral',
    tags: ['欧皇', '抽卡']
  },
  {
    id: 'wb_011',
    platform: 'weibo',
    content: '蹲后续！这个活动奖励到底是什么？📢',
    baseLikes: 178,
    sentiment: 'neutral',
    tags: ['活动', '奖励']
  },
  {
    id: 'wb_012',
    platform: 'weibo',
    content: '有一说一，福利确实比隔壁多🔥',
    baseLikes: 234,
    sentiment: 'positive',
    tags: ['福利', '对比']
  },
  {
    id: 'wb_013',
    platform: 'weibo',
    content: '塌房了！卡池毒得要命📢🍉',
    baseLikes: 367,
    sentiment: 'negative',
    tags: ['卡池', '吐槽']
  },
  {
    id: 'wb_014',
    platform: 'weibo',
    content: '求图！这个结局有人看懂了吗？👀',
    baseLikes: 298,
    sentiment: 'neutral',
    tags: ['结局', '讨论']
  },
  {
    id: 'wb_015',
    platform: 'weibo',
    content: '蹲后续！官方什么时候出解释？🔥📢',
    baseLikes: 412,
    sentiment: 'neutral',
    tags: ['官方', '公告']
  },
  {
    id: 'wb_016',
    platform: 'weibo',
    content: '有一说一，音乐确实好听🍉',
    baseLikes: 156,
    sentiment: 'positive',
    tags: ['音乐', '评价']
  },
  {
    id: 'wb_017',
    platform: 'weibo',
    content: '塌房了！这优化是认真的吗？📢🔥',
    baseLikes: 334,
    sentiment: 'negative',
    tags: ['优化', '吐槽']
  },
  {
    id: 'wb_018',
    platform: 'weibo',
    content: '求图！有人抽到限定角色吗？👀🍉',
    baseLikes: 267,
    sentiment: 'neutral',
    tags: ['限定', '抽卡']
  },
  {
    id: 'wb_019',
    platform: 'weibo',
    content: '蹲后续！这个伏笔什么时候回收？📢',
    baseLikes: 223,
    sentiment: 'neutral',
    tags: ['剧情', '伏笔']
  },
  {
    id: 'wb_020',
    platform: 'weibo',
    content: '有一说一，这游戏确实上头🔥👀',
    baseLikes: 289,
    sentiment: 'positive',
    tags: ['评价', '推荐']
  }
];

// ============ B 站评论模板 ============
const bilibiliComments: PlatformCommentTemplate[] = [
  {
    id: 'bili_001',
    platform: 'bilibili',
    content: '前方高能！这个剧情我哭死😂🎉',
    baseLikes: 345,
    sentiment: 'positive',
    tags: ['剧情', '高能']
  },
  {
    id: 'bili_002',
    platform: 'bilibili',
    content: '泪目了，这结局太感人了😂👍',
    baseLikes: 412,
    sentiment: 'positive',
    tags: ['结局', '感人']
  },
  {
    id: 'bili_003',
    platform: 'bilibili',
    content: '名场面！这个片段我能看十遍📺🎉',
    baseLikes: 289,
    sentiment: 'positive',
    tags: ['名场面', '经典']
  },
  {
    id: 'bili_004',
    platform: 'bilibili',
    content: '下次一定！这次先白嫖了😂',
    baseLikes: 523,
    sentiment: 'neutral',
    tags: ['白嫖', '下次一定']
  },
  {
    id: 'bili_005',
    platform: 'bilibili',
    content: '前方高能！男主太帅了救命😂👍',
    baseLikes: 367,
    sentiment: 'positive',
    tags: ['男主', '高能']
  },
  {
    id: 'bili_006',
    platform: 'bilibili',
    content: '泪目了，这个配音太棒了🎉📺',
    baseLikes: 234,
    sentiment: 'positive',
    tags: ['配音', '声优']
  },
  {
    id: 'bili_007',
    platform: 'bilibili',
    content: '名场面！这个转折我没想到😂',
    baseLikes: 298,
    sentiment: 'positive',
    tags: ['剧情', '转折']
  },
  {
    id: 'bili_008',
    platform: 'bilibili',
    content: '下次一定！等活动打折再说😂👍',
    baseLikes: 456,
    sentiment: 'neutral',
    tags: ['活动', '白嫖']
  },
  {
    id: 'bili_009',
    platform: 'bilibili',
    content: '前方高能！这个爆率我服了😂🎉',
    baseLikes: 378,
    sentiment: 'negative',
    tags: ['爆率', '吐槽']
  },
  {
    id: 'bili_010',
    platform: 'bilibili',
    content: '泪目了，这游戏太用心了📺👍',
    baseLikes: 267,
    sentiment: 'positive',
    tags: ['评价', '用心']
  },
  {
    id: 'bili_011',
    platform: 'bilibili',
    content: '名场面！这个立绘我能看一天😂',
    baseLikes: 312,
    sentiment: 'positive',
    tags: ['立绘', '画风']
  },
  {
    id: 'bili_012',
    platform: 'bilibili',
    content: '下次一定！先攒攒资源🎉',
    baseLikes: 389,
    sentiment: 'neutral',
    tags: ['资源', '白嫖']
  },
  {
    id: 'bili_013',
    platform: 'bilibili',
    content: '前方高能！这个活动福利超多😂👍',
    baseLikes: 245,
    sentiment: 'positive',
    tags: ['活动', '福利']
  },
  {
    id: 'bili_014',
    platform: 'bilibili',
    content: '泪目了，这个剧情太戳我了📺🎉',
    baseLikes: 334,
    sentiment: 'positive',
    tags: ['剧情', '感人']
  },
  {
    id: 'bili_015',
    platform: 'bilibili',
    content: '名场面！这个 BGM 绝了😂',
    baseLikes: 223,
    sentiment: 'positive',
    tags: ['音乐', 'BGM']
  },
  {
    id: 'bili_016',
    platform: 'bilibili',
    content: '下次一定！这次池子太毒了😂👍',
    baseLikes: 401,
    sentiment: 'negative',
    tags: ['卡池', '吐槽']
  },
  {
    id: 'bili_017',
    platform: 'bilibili',
    content: '前方高能！这个皮肤太美了🎉📺',
    baseLikes: 278,
    sentiment: 'positive',
    tags: ['皮肤', '外观']
  },
  {
    id: 'bili_018',
    platform: 'bilibili',
    content: '泪目了，这游戏太上头了😂',
    baseLikes: 356,
    sentiment: 'positive',
    tags: ['上头', '推荐']
  },
  {
    id: 'bili_019',
    platform: 'bilibili',
    content: '名场面！这个互动太甜了👍🎉',
    baseLikes: 289,
    sentiment: 'positive',
    tags: ['互动', '甜']
  },
  {
    id: 'bili_020',
    platform: 'bilibili',
    content: '下次一定！等测评出来再说😂📺',
    baseLikes: 312,
    sentiment: 'neutral',
    tags: ['测评', '观望']
  }
];

// ============ 贴吧评论模板 ============
const tiebaComments: PlatformCommentTemplate[] = [
  {
    id: 'tb_001',
    platform: 'tieba',
    content: '有一说一，这游戏确实能玩🤔👌',
    baseLikes: 234,
    sentiment: 'positive',
    tags: ['评价', '推荐']
  },
  {
    id: 'tb_002',
    platform: 'tieba',
    content: '白嫖党路过，这福利还行💪🎮',
    baseLikes: 312,
    sentiment: 'positive',
    tags: ['白嫖', '福利']
  },
  {
    id: 'tb_003',
    platform: 'tieba',
    content: '理性讨论，这个卡池爆率正常吗？🤔',
    baseLikes: 267,
    sentiment: 'neutral',
    tags: ['卡池', '讨论']
  },
  {
    id: 'tb_004',
    platform: 'tieba',
    content: '劝退！这爆率太毒了👌💔',
    baseLikes: 389,
    sentiment: 'negative',
    tags: ['爆率', '劝退']
  },
  {
    id: 'tb_005',
    platform: 'tieba',
    content: '有一说一，立绘确实不错🤔👍',
    baseLikes: 198,
    sentiment: 'positive',
    tags: ['立绘', '评价']
  },
  {
    id: 'tb_006',
    platform: 'tieba',
    content: '白嫖党表示这游戏能玩💪🎮',
    baseLikes: 245,
    sentiment: 'positive',
    tags: ['白嫖', '评价']
  },
  {
    id: 'tb_007',
    platform: 'tieba',
    content: '理性讨论，这剧情走向合理吗？🤔',
    baseLikes: 278,
    sentiment: 'neutral',
    tags: ['剧情', '讨论']
  },
  {
    id: 'tb_008',
    platform: 'tieba',
    content: '劝退！服务器天天炸👌😅',
    baseLikes: 423,
    sentiment: 'negative',
    tags: ['服务器', '劝退']
  },
  {
    id: 'tb_009',
    platform: 'tieba',
    content: '有一说一，配音阵容挺强🤔👍',
    baseLikes: 167,
    sentiment: 'positive',
    tags: ['配音', '声优']
  },
  {
    id: 'tb_010',
    platform: 'tieba',
    content: '白嫖党狂喜！这个活动福利多💪🎉',
    baseLikes: 334,
    sentiment: 'positive',
    tags: ['活动', '福利']
  },
  {
    id: 'tb_011',
    platform: 'tieba',
    content: '理性讨论，这游戏寿命多久？🤔',
    baseLikes: 289,
    sentiment: 'neutral',
    tags: ['讨论', '寿命']
  },
  {
    id: 'tb_012',
    platform: 'tieba',
    content: '劝退！这优化没救了👌💔',
    baseLikes: 356,
    sentiment: 'negative',
    tags: ['优化', '劝退']
  },
  {
    id: 'tb_013',
    platform: 'tieba',
    content: '有一说一，音乐确实好听🤔🎮',
    baseLikes: 178,
    sentiment: 'positive',
    tags: ['音乐', '评价']
  },
  {
    id: 'tb_014',
    platform: 'tieba',
    content: '白嫖党表示抽卡不要太贪心💪👌',
    baseLikes: 223,
    sentiment: 'neutral',
    tags: ['抽卡', '建议']
  },
  {
    id: 'tb_015',
    platform: 'tieba',
    content: '理性讨论，这个强度平衡吗？🤔',
    baseLikes: 256,
    sentiment: 'neutral',
    tags: ['强度', '平衡']
  },
  {
    id: 'tb_016',
    platform: 'tieba',
    content: '劝退！客服态度太差👌😤',
    baseLikes: 312,
    sentiment: 'negative',
    tags: ['客服', '劝退']
  },
  {
    id: 'tb_017',
    platform: 'tieba',
    content: '有一说一，剧情写得还可以🤔📖',
    baseLikes: 201,
    sentiment: 'positive',
    tags: ['剧情', '文案']
  },
  {
    id: 'tb_018',
    platform: 'tieba',
    content: '白嫖党也能玩得开心，亲测💪🎮',
    baseLikes: 267,
    sentiment: 'positive',
    tags: ['白嫖', '亲测']
  },
  {
    id: 'tb_019',
    platform: 'tieba',
    content: '理性讨论，这游戏值得氪吗？🤔',
    baseLikes: 345,
    sentiment: 'neutral',
    tags: ['氪金', '讨论']
  },
  {
    id: 'tb_020',
    platform: 'tieba',
    content: '劝退！这卡池太深了别碰👌💸',
    baseLikes: 378,
    sentiment: 'negative',
    tags: ['卡池', '劝退']
  }
];

// ============ 平台评论数据映射 ============
const platformCommentMap: Record<PlatformType, PlatformCommentTemplate[]> = {
  douyin: douyinComments,
  xiaohongshu: xiaohongshuComments,
  weibo: weiboComments,
  bilibili: bilibiliComments,
  tieba: tiebaComments
};

// ============ 平台特色用语 ============
const platformKeywords: Record<PlatformType, string[]> = {
  douyin: ['家人们谁懂啊', '绝绝子', '真的会谢', '狠狠懂了'],
  xiaohongshu: ['姐妹们冲', '亲测好用', '按头安利', '真香警告'],
  weibo: ['塌房了', '求图', '蹲后续', '有一说一'],
  bilibili: ['前方高能', '泪目', '名场面', '下次一定'],
  tieba: ['有一说一', '白嫖党', '理性讨论', '劝退']
};

// ============ 平台 emoji 风格 ============
const platformEmojis: Record<PlatformType, string[]> = {
  douyin: ['😭', '💖', '✨', '🔥'],
  xiaohongshu: ['💕', '🌸', '🎀', '💄'],
  weibo: ['📢', '🔥', '🍉', '👀'],
  bilibili: ['😂', '👍', '🎉', '📺'],
  tieba: ['🤔', '👌', '💪', '🎮']
};

// ============ 导出函数 ============

/**
 * 获取指定平台的所有评论模板
 */
export function getPlatformComments(platform: PlatformType): PlatformCommentTemplate[] {
  return platformCommentMap[platform] || [];
}

/**
 * 获取所有平台的评论模板
 */
export function getAllPlatformComments(): PlatformCommentTemplate[] {
  return Object.values(platformCommentMap).flat();
}

/**
 * 获取指定平台的随机评论
 */
export function getRandomPlatformComment(platform: PlatformType): PlatformCommentTemplate | null {
  const comments = getPlatformComments(platform);
  if (comments.length === 0) return null;
  return comments[Math.floor(Math.random() * comments.length)];
}

/**
 * 获取所有平台的随机评论
 */
export function getRandomComment(): PlatformCommentTemplate | null {
  const allComments = getAllPlatformComments();
  if (allComments.length === 0) return null;
  return allComments[Math.floor(Math.random() * allComments.length)];
}

/**
 * 根据情感倾向筛选评论
 */
export function filterCommentsBySentiment(
  platform: PlatformType,
  sentiment: PlatformCommentSentiment
): PlatformCommentTemplate[] {
  const comments = getPlatformComments(platform);
  return comments.filter(comment => comment.sentiment === sentiment);
}

/**
 * 获取平台特色用语
 */
export function getPlatformKeywords(platform: PlatformType): string[] {
  return platformKeywords[platform] || [];
}

/**
 * 获取平台 emoji 风格
 */
export function getPlatformEmojis(platform: PlatformType): string[] {
  return platformEmojis[platform] || [];
}

/**
 * 生成指定数量的随机评论
 */
export function generateRandomComments(count: number): PlatformCommentTemplate[] {
  const allComments = getAllPlatformComments();
  const result: PlatformCommentTemplate[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * allComments.length);
    result.push({
      ...allComments[randomIndex],
      id: `${allComments[randomIndex].id}_${Date.now()}_${i}`
    });
  }
  
  return result;
}

/**
 * 获取平台评论统计
 */
export function getPlatformStats(platform: PlatformType): {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  avgLikes: number;
} {
  const comments = getPlatformComments(platform);
  const total = comments.length;
  const positive = comments.filter(c => c.sentiment === 'positive').length;
  const neutral = comments.filter(c => c.sentiment === 'neutral').length;
  const negative = comments.filter(c => c.sentiment === 'negative').length;
  const avgLikes = total > 0 
    ? Math.round(comments.reduce((sum, c) => sum + c.baseLikes, 0) / total)
    : 0;
  
  return { total, positive, neutral, negative, avgLikes };
}

/**
 * 获取所有平台统计
 */
export function getAllPlatformStats(): Record<PlatformType, {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  avgLikes: number;
}> {
  const platforms: PlatformType[] = ['douyin', 'xiaohongshu', 'weibo', 'bilibili', 'tieba'];
  const stats: Record<PlatformType, any> = {} as any;
  
  platforms.forEach(platform => {
    stats[platform] = getPlatformStats(platform);
  });
  
  return stats;
}

/**
 * 根据标签筛选评论
 */
export function filterCommentsByTag(
  platform: PlatformType,
  tag: string
): PlatformCommentTemplate[] {
  const comments = getPlatformComments(platform);
  return comments.filter(comment => comment.tags.includes(tag));
}

/**
 * 获取点赞数范围内的评论
 */
export function filterCommentsByLikes(
  platform: PlatformType,
  minLikes: number,
  maxLikes: number
): PlatformCommentTemplate[] {
  const comments = getPlatformComments(platform);
  return comments.filter(
    comment => comment.baseLikes >= minLikes && comment.baseLikes <= maxLikes
  );
}

/**
 * 创建自定义评论模板
 */
export function createCustomComment(
  platform: PlatformType,
  content: string,
  baseLikes: number,
  sentiment: PlatformCommentSentiment,
  tags: string[]
): PlatformCommentTemplate {
  return {
    id: `custom_${platform}_${Date.now()}`,
    platform,
    content,
    baseLikes: Math.max(10, Math.min(500, baseLikes)), // 限制在 10-500 范围
    sentiment,
    tags
  };
}

/**
 * 获取随机平台类型
 */
export function getRandomPlatform(): PlatformType {
  const platforms: PlatformType[] = ['douyin', 'xiaohongshu', 'weibo', 'bilibili', 'tieba'];
  return platforms[Math.floor(Math.random() * platforms.length)];
}
