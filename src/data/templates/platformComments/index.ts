/**
 * 多平台评论模板库
 * 包含抖音、小红书、微博、B站、贴吧等平台的评论模板
 * 评论类型：短评(10-30字)、中评(30-80字)、长评(80-200字)、随手记(记录式)
 */

export type PlatformType = 
  | 'douyin'         // 抖音
  | 'xiaohongshu'    // 小红书
  | 'weibo'          // 微博
  | 'bilibili'       // B站
  | 'tieba';         // 贴吧

export type PlatformCommentSentiment = 'positive' | 'neutral' | 'negative';
export type CommentLength = 'short' | 'medium' | 'long' | 'diary';

export interface PlatformCommentTemplate {
  id: string;
  platform: PlatformType;
  content: string;
  baseLikes: number;
  sentiment: PlatformCommentSentiment;
  tags: string[];
  length: CommentLength;
}

// ============ 抖音评论模板 (40条) ============
// 抖音特点：短平快、情绪化、emoji多、口语化
const douyinComments: PlatformCommentTemplate[] = [
  // 短评 (10-30字)
  { id: 'dy_001', platform: 'douyin', content: '啊啊啊这也太甜了吧！', baseLikes: 156, sentiment: 'positive', tags: ['甜', '剧情'], length: 'short' },
  { id: 'dy_002', platform: 'douyin', content: '抽卡又歪了，气死我了', baseLikes: 234, sentiment: 'negative', tags: ['抽卡', '吐槽'], length: 'short' },
  { id: 'dy_003', platform: 'douyin', content: '男主声音好好听', baseLikes: 189, sentiment: 'positive', tags: ['配音', '男主'], length: 'short' },
  { id: 'dy_004', platform: 'douyin', content: '这爆率认真的吗？', baseLikes: 312, sentiment: 'negative', tags: ['爆率', '质疑'], length: 'short' },
  { id: 'dy_005', platform: 'douyin', content: '画风我爱了', baseLikes: 145, sentiment: 'positive', tags: ['画风', '美术'], length: 'short' },
  { id: 'dy_006', platform: 'douyin', content: '剧情刀死我了', baseLikes: 267, sentiment: 'negative', tags: ['剧情', '虐'], length: 'short' },
  { id: 'dy_007', platform: 'douyin', content: '新活动冲鸭！', baseLikes: 178, sentiment: 'positive', tags: ['活动'], length: 'short' },
  { id: 'dy_008', platform: 'douyin', content: '服务器又炸了', baseLikes: 289, sentiment: 'negative', tags: ['服务器'], length: 'short' },
  
  // 中评 (30-80字)
  { id: 'dy_009', platform: 'douyin', content: '家人们谁懂啊，这个剧情真的绝了！男主太会了，我直接原地升天！姐妹们快去玩！', baseLikes: 423, sentiment: 'positive', tags: ['剧情', '推荐'], length: 'medium' },
  { id: 'dy_010', platform: 'douyin', content: '真的会谢，氪了500连张SSR都没见到。这爆率是不是有问题啊？退钱！', baseLikes: 567, sentiment: 'negative', tags: ['氪金', '爆率'], length: 'medium' },
  { id: 'dy_011', platform: 'douyin', content: '绝绝子！这个立绘质量我能吹爆！每一张都可以当壁纸，美术组加鸡腿！', baseLikes: 334, sentiment: 'positive', tags: ['立绘', '美术'], length: 'medium' },
  { id: 'dy_012', platform: 'douyin', content: '狠狠懂了，白嫖党也能玩得很开心。福利给得挺多的，不氪金也能抽到喜欢的卡。', baseLikes: 289, sentiment: 'positive', tags: ['白嫖', '福利'], length: 'medium' },
  { id: 'dy_013', platform: 'douyin', content: '这剧情走向我服了，编剧是不是喝多了？我家男主怎么可能做这种事！OOC太严重了！', baseLikes: 445, sentiment: 'negative', tags: ['剧情', 'OOC'], length: 'medium' },
  { id: 'dy_014', platform: 'douyin', content: '家人们，这个配音阵容太豪华了吧！都是我喜欢的大大，耳朵怀孕了！', baseLikes: 378, sentiment: 'positive', tags: ['配音', '声优'], length: 'medium' },
  { id: 'dy_015', platform: 'douyin', content: '活动太肝了，每天要做两小时任务。这是游戏还是上班啊？求减负！', baseLikes: 412, sentiment: 'negative', tags: ['肝度', '活动'], length: 'medium' },
  
  // 长评 (80-200字)
  { id: 'dy_016', platform: 'douyin', content: '玩了三个月了，说说感受。剧情方面真的没得说，甜虐交织拿捏得恰到好处。男主的人设也很立体，不是那种扁平的霸道总裁模板。抽卡爆率中规中矩，月卡党表示能玩。就是有时候活动太肝，希望能优化一下。总体来说值得入坑！', baseLikes: 678, sentiment: 'positive', tags: ['测评', '综合'], length: 'long' },
  { id: 'dy_017', platform: 'douyin', content: '退坑了，真的玩不下去了。连续三个活动都是逼氪，不花钱就拿不到核心奖励。剧情也越来越水，感觉编剧换人了。最气的是客服态度，反馈问题永远得不到解决。祝好吧，曾经爱过。', baseLikes: 823, sentiment: 'negative', tags: ['退坑', '吐槽'], length: 'long' },
  { id: 'dy_018', platform: 'douyin', content: '新入坑的姐妹看过来！新手期福利超多，前七天登录送SSR。建议先推主线，资源别乱花。抽卡建议等UP池，别在普池浪费钻石。剧情建议慢慢看，跳过会错过很多细节。有问题可以问我！', baseLikes: 756, sentiment: 'positive', tags: ['攻略', '新手'], length: 'long' },
  
  // 随手记
  { id: 'dy_019', platform: 'douyin', content: '今天抽到了人生中第一张SSR，记录一下！虽然是大保底，但还是很开心。希望下次能欧一点！', baseLikes: 234, sentiment: 'positive', tags: ['记录', '抽卡'], length: 'diary' },
  { id: 'dy_020', platform: 'douyin', content: '昨晚熬夜推剧情，哭到凌晨三点。男主那段告白真的太戳我了，今天眼睛还是肿的。', baseLikes: 456, sentiment: 'positive', tags: ['记录', '剧情'], length: 'diary' },
  
  // 继续补充...
  { id: 'dy_021', platform: 'douyin', content: '卡关了，求助！', baseLikes: 89, sentiment: 'neutral', tags: ['求助'], length: 'short' },
  { id: 'dy_022', platform: 'douyin', content: '这个BGM叫什么？', baseLikes: 123, sentiment: 'neutral', tags: ['音乐'], length: 'short' },
  { id: 'dy_023', platform: 'douyin', content: '双黄蛋！吸欧气！', baseLikes: 567, sentiment: 'positive', tags: ['欧气', '抽卡'], length: 'short' },
  { id: 'dy_024', platform: 'douyin', content: '又保底了，非酋实锤', baseLikes: 345, sentiment: 'negative', tags: ['非酋'], length: 'short' },
  { id: 'dy_025', platform: 'douyin', content: '新卡面美哭我', baseLikes: 289, sentiment: 'positive', tags: ['卡面'], length: 'short' },
  { id: 'dy_026', platform: 'douyin', content: '这剧情我吐了', baseLikes: 234, sentiment: 'negative', tags: ['剧情'], length: 'short' },
  { id: 'dy_027', platform: 'douyin', content: '求加好友！', baseLikes: 67, sentiment: 'neutral', tags: ['社交'], length: 'short' },
  { id: 'dy_028', platform: 'douyin', content: '官方大大看看我', baseLikes: 156, sentiment: 'neutral', tags: ['官方'], length: 'short' },
  
  { id: 'dy_029', platform: 'douyin', content: '真的服了，每次更新都要重新下载资源包。我的流量不要钱吗？能不能优化一下更新方式？', baseLikes: 445, sentiment: 'negative', tags: ['优化', '更新'], length: 'medium' },
  { id: 'dy_030', platform: 'douyin', content: '姐妹们，这个约会剧情太甜了！男主居然亲手做了蛋糕给我，还害羞了！这谁顶得住啊！', baseLikes: 534, sentiment: 'positive', tags: ['约会', '甜'], length: 'medium' },
  { id: 'dy_031', platform: 'douyin', content: '对比了一下隔壁游戏，感觉这个福利还算可以。至少白嫖能玩，不像某些游戏不氪金寸步难行。', baseLikes: 378, sentiment: 'positive', tags: ['对比', '福利'], length: 'medium' },
  { id: 'dy_032', platform: 'douyin', content: '这个活动的UI设计得好乱，找了半天才找到入口。新手引导也做得不够清楚，希望能改进。', baseLikes: 289, sentiment: 'negative', tags: ['UI', '体验'], length: 'medium' },
  
  { id: 'dy_033', platform: 'douyin', content: '作为一个剧情党，这游戏的文案真的让我惊喜。每个角色都有自己的成长弧线，不是那种脸谱化的人设。特别是虐恋线，写得很有张力，不是为虐而虐。配音也很到位，情绪拿捏得很准。唯一不足的是更新太慢，等得好辛苦。', baseLikes: 623, sentiment: 'positive', tags: ['剧情党', '测评'], length: 'long' },
  { id: 'dy_034', platform: 'douyin', content: '从开服玩到现在，见证了这个游戏的起起落落。开服时福利很好，玩家也很多。后来几次运营事故流失了不少人。最近几个活动感觉有回暖的迹象，希望能继续保持。毕竟投入了很多感情，不希望看到它凉掉。', baseLikes: 712, sentiment: 'neutral', tags: ['老玩家', '感慨'], length: 'long' },
  
  { id: 'dy_035', platform: 'douyin', content: '今天终于把亲密度肝到10级了！解锁了隐藏剧情，男主居然向我求婚了！激动得手都在抖！', baseLikes: 445, sentiment: 'positive', tags: ['记录', '成就'], length: 'diary' },
  { id: 'dy_036', platform: 'douyin', content: '又又又歪了，这次歪了三个才出UP。记录一下我的非酋之路，看看什么时候能转运。', baseLikes: 334, sentiment: 'negative', tags: ['记录', '非酋'], length: 'diary' },
  
  { id: 'dy_037', platform: 'douyin', content: '出金了！！！', baseLikes: 789, sentiment: 'positive', tags: ['抽卡'], length: 'short' },
  { id: 'dy_038', platform: 'douyin', content: '这什么鬼剧情', baseLikes: 234, sentiment: 'negative', tags: ['剧情'], length: 'short' },
  { id: 'dy_039', platform: 'douyin', content: '求问这个怎么过', baseLikes: 56, sentiment: 'neutral', tags: ['求助'], length: 'short' },
  { id: 'dy_040', platform: 'douyin', content: '已退坑，祝好', baseLikes: 178, sentiment: 'negative', tags: ['退坑'], length: 'short' }
];

// ============ 小红书评论模板 (40条) ============
// 小红书特点：详细、种草/拔草、emoji多、女性向
const xiaohongshuComments: PlatformCommentTemplate[] = [
  // 短评
  { id: 'xhs_001', platform: 'xiaohongshu', content: '姐妹们冲！这个游戏真的绝', baseLikes: 234, sentiment: 'positive', tags: ['推荐'], length: 'short' },
  { id: 'xhs_002', platform: 'xiaohongshu', content: '避雷！爆率太低了', baseLikes: 312, sentiment: 'negative', tags: ['避雷'], length: 'short' },
  { id: 'xhs_003', platform: 'xiaohongshu', content: '画风太戳我了', baseLikes: 278, sentiment: 'positive', tags: ['画风'], length: 'short' },
  { id: 'xhs_004', platform: 'xiaohongshu', content: '剧情写得好好', baseLikes: 189, sentiment: 'positive', tags: ['剧情'], length: 'short' },
  { id: 'xhs_005', platform: 'xiaohongshu', content: '太肝了劝退', baseLikes: 256, sentiment: 'negative', tags: ['肝度'], length: 'short' },
  { id: 'xhs_006', platform: 'xiaohongshu', content: '白嫖党狂喜', baseLikes: 201, sentiment: 'positive', tags: ['白嫖'], length: 'short' },
  { id: 'xhs_007', platform: 'xiaohongshu', content: '求攻略', baseLikes: 167, sentiment: 'neutral', tags: ['求助'], length: 'short' },
  { id: 'xhs_008', platform: 'xiaohongshu', content: '已入坑', baseLikes: 145, sentiment: 'positive', tags: ['入坑'], length: 'short' },
  
  // 中评
  { id: 'xhs_009', platform: 'xiaohongshu', content: '亲测好用！这个抽卡技巧分享给你们：单抽垫刀，十连出货概率会高很多。我已经用这个方法抽到三张SSR了！', baseLikes: 567, sentiment: 'positive', tags: ['攻略', '技巧'], length: 'medium' },
  { id: 'xhs_010', platform: 'xiaohongshu', content: '按头安利！男主的人设太戳我了，不是那种油腻的霸总，而是有脆弱感的真实人设。姐妹们一定要试试他的个人线！', baseLikes: 445, sentiment: 'positive', tags: ['安利', '男主'], length: 'medium' },
  { id: 'xhs_011', platform: 'xiaohongshu', content: '真香警告！一开始觉得画风一般，玩了之后真香。剧情超级上头，我已经连续熬夜一周推剧情了。', baseLikes: 389, sentiment: 'positive', tags: ['真香', '上头'], length: 'medium' },
  { id: 'xhs_012', platform: 'xiaohongshu', content: '拔草！这个活动的奖励真的太少了，肝了一周就给了这么点东西。时间成本太高，不值得。', baseLikes: 423, sentiment: 'negative', tags: ['拔草', '活动'], length: 'medium' },
  { id: 'xhs_013', platform: 'xiaohongshu', content: '姐妹们，这个约会剧情甜到打滚！男主居然记得我说过的一切喜好，这种细节真的太戳了！', baseLikes: 534, sentiment: 'positive', tags: ['约会', '甜'], length: 'medium' },
  { id: 'xhs_014', platform: 'xiaohongshu', content: '理性讨论，这游戏的氪金点是不是有点多？月卡、战令、限时礼包，加起来一个月要几百块。', baseLikes: 378, sentiment: 'neutral', tags: ['氪金', '讨论'], length: 'medium' },
  
  // 长评
  { id: 'xhs_015', platform: 'xiaohongshu', content: '玩了两个月的新手来分享一下体验。首先剧情方面真的很棒，每个角色都有自己的故事线，不是那种敷衍的文案。画风也很精致，特别是CG质量很高。抽卡方面，个人感觉爆率还算可以，月卡党能玩得比较舒服。活动频率适中，不会太累。唯一的小缺点是新手引导有点简单，刚开始玩的时候有点懵。总体来说推荐入坑！', baseLikes: 823, sentiment: 'positive', tags: ['测评', '新手'], length: 'long' },
  { id: 'xhs_016', platform: 'xiaohongshu', content: '作为一个剧情党，必须说说这游戏的文案水平。甜宠线写得甜而不腻，虐恋线虐得合情合理，不是那种为虐而虐。角色的台词都很符合人设，不会出现OOC的情况。配音也很加分，情绪传达得很到位。唯一希望改进的是更新速度，一个月更一章真的不够看啊！', baseLikes: 756, sentiment: 'positive', tags: ['剧情党', '文案'], length: 'long' },
  { id: 'xhs_017', platform: 'xiaohongshu', content: '退坑留念帖。玩了一年多，见证了这个游戏的巅峰和低谷。开服时真的做得很好，福利多、剧情好、玩家氛围也好。后来几次运营事故，逼氪、剧情崩、装死，流失了很多老玩家。我也坚持不下去了。希望官方能反思一下吧，毕竟曾经真的很爱这个游戏。', baseLikes: 912, sentiment: 'negative', tags: ['退坑', '留念'], length: 'long' },
  
  // 随手记
  { id: 'xhs_018', platform: 'xiaohongshu', content: '今天终于抽到梦情卡了！记录一下这个历史时刻。从开服等到现在，中间歪了无数次，今天终于圆梦了！', baseLikes: 445, sentiment: 'positive', tags: ['记录', '圆梦'], length: 'diary' },
  { id: 'xhs_019', platform: 'xiaohongshu', content: '推完虐恋线，哭到妆都花了。男主最后那段独白真的太虐了，我现在想起来还会心痛。需要甜饼治愈一下。', baseLikes: 567, sentiment: 'positive', tags: ['记录', '情绪'], length: 'diary' },
  
  { id: 'xhs_020', platform: 'xiaohongshu', content: '求搭配建议', baseLikes: 78, sentiment: 'neutral', tags: ['求助'], length: 'short' },
  { id: 'xhs_021', platform: 'xiaohongshu', content: '这个值得买吗', baseLikes: 134, sentiment: 'neutral', tags: ['询问'], length: 'short' },
  { id: 'xhs_022', platform: 'xiaohongshu', content: '已种草', baseLikes: 223, sentiment: 'positive', tags: ['种草'], length: 'short' },
  { id: 'xhs_023', platform: 'xiaohongshu', content: '踩雷了', baseLikes: 189, sentiment: 'negative', tags: ['踩雷'], length: 'short' },
  { id: 'xhs_024', platform: 'xiaohongshu', content: '蹲一个攻略', baseLikes: 156, sentiment: 'neutral', tags: ['蹲'], length: 'short' },
  { id: 'xhs_025', platform: 'xiaohongshu', content: '美哭了', baseLikes: 345, sentiment: 'positive', tags: ['美术'], length: 'short' },
  { id: 'xhs_026', platform: 'xiaohongshu', content: '求问爆率', baseLikes: 112, sentiment: 'neutral', tags: ['询问'], length: 'short' },
  { id: 'xhs_027', platform: 'xiaohongshu', content: '入坑了', baseLikes: 267, sentiment: 'positive', tags: ['入坑'], length: 'short' },
  
  { id: 'xhs_028', platform: 'xiaohongshu', content: '新手避坑指南：不要急着抽普池，等UP池；资源不要乱花，优先升级主力卡；每日任务一定要做，积少成多；剧情不要跳过，有隐藏奖励。', baseLikes: 678, sentiment: 'positive', tags: ['攻略', '新手'], length: 'medium' },
  { id: 'xhs_029', platform: 'xiaohongshu', content: '这个活动的服装真的绝美！虽然要肝一点，但是为了这套衣服值了。搭配不同的发型会有不同效果，姐妹们可以试试。', baseLikes: 445, sentiment: 'positive', tags: ['活动', '服装'], length: 'medium' },
  { id: 'xhs_030', platform: 'xiaohongshu', content: '对比了几个乙游，这个的剧情确实算是上乘。没有那种尴尬的霸总台词，角色的反应都很真实。推荐剧情党入坑。', baseLikes: 534, sentiment: 'positive', tags: ['对比', '剧情'], length: 'medium' },
  
  { id: 'xhs_031', platform: 'xiaohongshu', content: '详细测评一下最近的更新。新剧情质量在线，解开了之前的几个伏笔，逻辑自洽。新角色的塑造也不错，有神秘感但不会太突兀。活动设计比上次合理，奖励也更多。但是卡池爆率感觉暗改了，身边几个朋友都保底。总体来说有进步，但还有改进空间。', baseLikes: 623, sentiment: 'neutral', tags: ['测评', '更新'], length: 'long' },
  
  { id: 'xhs_032', platform: 'xiaohongshu', content: '记录一下和男主的100天。从初遇到相知，每一个剧情都让我心动。虽然知道是虚拟的，但这份感情是真实的。谢谢你陪伴我度过这段时光。', baseLikes: 789, sentiment: 'positive', tags: ['记录', '感情'], length: 'diary' },
  { id: 'xhs_033', platform: 'xiaohongshu', content: '今天又是保底的一天。记录一下：第78抽才出SSR，还歪了。我的欧气什么时候才能来？', baseLikes: 334, sentiment: 'negative', tags: ['记录', '非酋'], length: 'diary' },
  
  { id: 'xhs_034', platform: 'xiaohongshu', content: '求问值不值得入坑', baseLikes: 89, sentiment: 'neutral', tags: ['询问'], length: 'short' },
  { id: 'xhs_035', platform: 'xiaohongshu', content: '已卸载', baseLikes: 234, sentiment: 'negative', tags: ['卸载'], length: 'short' },
  { id: 'xhs_036', platform: 'xiaohongshu', content: '这个好可爱', baseLikes: 178, sentiment: 'positive', tags: ['可爱'], length: 'short' },
  { id: 'xhs_037', platform: 'xiaohongshu', content: '剧情党狂喜', baseLikes: 289, sentiment: 'positive', tags: ['剧情党'], length: 'short' },
  { id: 'xhs_038', platform: 'xiaohongshu', content: '太氪了', baseLikes: 312, sentiment: 'negative', tags: ['氪金'], length: 'short' },
  { id: 'xhs_039', platform: 'xiaohongshu', content: '求好友', baseLikes: 67, sentiment: 'neutral', tags: ['社交'], length: 'short' },
  { id: 'xhs_040', platform: 'xiaohongshu', content: '画风爱了', baseLikes: 401, sentiment: 'positive', tags: ['画风'], length: 'short' }
];

// ============ 微博评论模板 (40条) ============
// 微博特点：话题性强、转发多、讨论深入、有争议
const weiboComments: PlatformCommentTemplate[] = [
  // 短评
  { id: 'wb_001', platform: 'weibo', content: '塌房了，这爆率认真的？', baseLikes: 456, sentiment: 'negative', tags: ['爆率'], length: 'short' },
  { id: 'wb_002', platform: 'weibo', content: '求图，有人抽到吗', baseLikes: 234, sentiment: 'neutral', tags: ['求图'], length: 'short' },
  { id: 'wb_003', platform: 'weibo', content: '剧情太可了', baseLikes: 312, sentiment: 'positive', tags: ['剧情'], length: 'short' },
  { id: 'wb_004', platform: 'weibo', content: '官方出来解释', baseLikes: 523, sentiment: 'negative', tags: ['官方'], length: 'short' },
  { id: 'wb_005', platform: 'weibo', content: '蹲一个后续', baseLikes: 178, sentiment: 'neutral', tags: ['蹲'], length: 'short' },
  { id: 'wb_006', platform: 'weibo', content: '有一说一，立绘不错', baseLikes: 289, sentiment: 'positive', tags: ['立绘'], length: 'short' },
  { id: 'wb_007', platform: 'weibo', content: '这剧情我服了', baseLikes: 389, sentiment: 'negative', tags: ['剧情'], length: 'short' },
  { id: 'wb_008', platform: 'weibo', content: '转发抽奖', baseLikes: 567, sentiment: 'neutral', tags: ['抽奖'], length: 'short' },
  
  // 中评
  { id: 'wb_009', platform: 'weibo', content: '理性讨论，这次活动的难度是不是设置得不太合理？新手玩家根本打不过，老玩家又觉得太简单。建议分层设计。', baseLikes: 445, sentiment: 'neutral', tags: ['讨论', '难度'], length: 'medium' },
  { id: 'wb_010', platform: 'weibo', content: '蹲后续！这个剧情伏笔埋得太深了，男主的真实身份到底是什么？我已经迫不及待想看下一章了！', baseLikes: 534, sentiment: 'positive', tags: ['剧情', '伏笔'], length: 'medium' },
  { id: 'wb_011', platform: 'weibo', content: '塌房了！连续三次活动逼氪，不花钱就拿不到核心奖励。这是把玩家当韭菜割吗？退钱！', baseLikes: 823, sentiment: 'negative', tags: ['逼氪', '吐槽'], length: 'medium' },
  { id: 'wb_012', platform: 'weibo', content: '有一说一，这个配音阵容确实豪华，都是业界大佬。制作组在声音这块是下了血本的，值得肯定。', baseLikes: 378, sentiment: 'positive', tags: ['配音'], length: 'medium' },
  { id: 'wb_013', platform: 'weibo', content: '求图！有人截到那个隐藏CG吗？我选错了选项没触发，求个图让我看看是什么内容！', baseLikes: 289, sentiment: 'neutral', tags: ['求图', 'CG'], length: 'medium' },
  
  // 长评
  { id: 'wb_014', platform: 'weibo', content: '作为一个从开服玩到现在的老玩家，说几句心里话。这游戏开服时是真的良心，福利多、剧情好、运营也听玩家意见。但是近半年来，逼氪越来越严重，活动越来越肝，剧情质量也在下滑。我知道游戏要赚钱，但是能不能不要这么急功近利？很多玩家都是因为热爱才留下来的，不要让这份热爱被消耗殆尽。', baseLikes: 1234, sentiment: 'negative', tags: ['老玩家', '感慨'], length: 'long' },
  { id: 'wb_015', platform: 'weibo', content: '详细分析一下这次更新的内容。新剧情方面，逻辑基本自洽，伏笔回收得不错，但是节奏有点快，某些转折略显突兀。新角色塑造有亮点，但是和主线衔接不够自然。活动设计比上次有进步，奖励更合理，但是UI还是太乱。卡池爆率体感没有变化，身边统计学大保底居多。总体来说有进步，但还有很大提升空间。', baseLikes: 912, sentiment: 'neutral', tags: ['分析', '更新'], length: 'long' },
  { id: 'wb_016', platform: 'weibo', content: '给新入坑的玩家一些建议。首先，这游戏白嫖能玩，但是要有耐心。其次，资源一定要规划好，不要乱花。第三，剧情建议慢慢看，质量真的不错。第四，抽卡等UP池，普池性价比低。第五，加几个活跃的好友，可以互相帮助。总体来说是一款值得投入时间的游戏，但是要保持理性消费。', baseLikes: 845, sentiment: 'positive', tags: ['攻略', '建议'], length: 'long' },
  
  // 随手记
  { id: 'wb_017', platform: 'weibo', content: '记录一下今天的抽卡：前70抽无事发生，第78抽出了SSR，虽然歪了但是new不亏。继续攒钻等下一个池子。', baseLikes: 334, sentiment: 'neutral', tags: ['记录', '抽卡'], length: 'diary' },
  { id: 'wb_018', platform: 'weibo', content: '推完新剧情，心情久久不能平静。男主最后那个选择真的让我意外，编剧太会写了。需要缓一缓，太虐了。', baseLikes: 567, sentiment: 'positive', tags: ['记录', '剧情'], length: 'diary' },
  
  { id: 'wb_019', platform: 'weibo', content: '这优化没救了', baseLikes: 445, sentiment: 'negative', tags: ['优化'], length: 'short' },
  { id: 'wb_020', platform: 'weibo', content: '求组队', baseLikes: 123, sentiment: 'neutral', tags: ['组队'], length: 'short' },
  { id: 'wb_021', platform: 'weibo', content: '剧情党满足了', baseLikes: 389, sentiment: 'positive', tags: ['剧情党'], length: 'short' },
  { id: 'wb_022', platform: 'weibo', content: '服务器又炸', baseLikes: 678, sentiment: 'negative', tags: ['服务器'], length: 'short' },
  { id: 'wb_023', platform: 'weibo', content: '新卡好看', baseLikes: 256, sentiment: 'positive', tags: ['卡面'], length: 'short' },
  { id: 'wb_024', platform: 'weibo', content: '什么时候更新', baseLikes: 189, sentiment: 'neutral', tags: ['更新'], length: 'short' },
  { id: 'wb_025', platform: 'weibo', content: '已退坑', baseLikes: 534, sentiment: 'negative', tags: ['退坑'], length: 'short' },
  { id: 'wb_026', platform: 'weibo', content: '真香', baseLikes: 445, sentiment: 'positive', tags: ['真香'], length: 'short' },
  
  { id: 'wb_027', platform: 'weibo', content: '对比了一下同期的几个乙游，这个的剧情确实算是中上水平。没有那种尴尬的霸总文学，角色的行为逻辑也比较合理。推荐。', baseLikes: 623, sentiment: 'positive', tags: ['对比', '推荐'], length: 'medium' },
  { id: 'wb_028', platform: 'weibo', content: '这个活动的奖励计算有问题吧？我算了下，不氪金根本拿不完奖励，这是变相逼氪吗？', baseLikes: 712, sentiment: 'negative', tags: ['奖励', '质疑'], length: 'medium' },
  { id: 'wb_029', platform: 'weibo', content: '蹲一个真结局的触发条件，我打了三遍都没打出来，有没有大佬知道要怎么选？', baseLikes: 289, sentiment: 'neutral', tags: ['求助', '结局'], length: 'medium' },
  
  { id: 'wb_030', platform: 'weibo', content: '从游戏设计的角度分析一下这个系统。优点：1.降低了随机性，让玩家有保底预期；2.增加了付费动力；3.延长了游戏寿命。缺点：1.对非酋不友好；2.可能造成玩家疲劳；3.需要平衡好概率。总体来说是一个常见且有效的设计，但是具体数值需要反复测试。', baseLikes: 534, sentiment: 'neutral', tags: ['分析', '设计'], length: 'long' },
  
  { id: 'wb_031', platform: 'weibo', content: '今天是在一起的第365天。一年前的今天，我在游戏里遇见了他。虽然知道是虚拟的，但是这一年的陪伴是真实的。谢谢你。', baseLikes: 923, sentiment: 'positive', tags: ['记录', '纪念'], length: 'diary' },
  { id: 'wb_032', platform: 'weibo', content: '保底记录：第1次80抽，第2次76抽，第3次90抽。平均82抽一个SSR。这爆率正常吗？', baseLikes: 445, sentiment: 'negative', tags: ['记录', '统计'], length: 'diary' },
  
  { id: 'wb_033', platform: 'weibo', content: '求问这关怎么过', baseLikes: 89, sentiment: 'neutral', tags: ['求助'], length: 'short' },
  { id: 'wb_034', platform: 'weibo', content: '这剧情不合理', baseLikes: 334, sentiment: 'negative', tags: ['剧情'], length: 'short' },
  { id: 'wb_035', platform: 'weibo', content: '画风我可以', baseLikes: 267, sentiment: 'positive', tags: ['画风'], length: 'short' },
  { id: 'wb_036', platform: 'weibo', content: '官方装死', baseLikes: 567, sentiment: 'negative', tags: ['官方'], length: 'short' },
  { id: 'wb_037', platform: 'weibo', content: '新活动冲', baseLikes: 189, sentiment: 'positive', tags: ['活动'], length: 'short' },
  { id: 'wb_038', platform: 'weibo', content: '这卡必抽', baseLikes: 445, sentiment: 'positive', tags: ['抽卡'], length: 'short' },
  { id: 'wb_039', platform: 'weibo', content: '什么时候修bug', baseLikes: 312, sentiment: 'negative', tags: ['bug'], length: 'short' },
  { id: 'wb_040', platform: 'weibo', content: '剧情封神', baseLikes: 756, sentiment: 'positive', tags: ['剧情'], length: 'short' }
];

// ============ B站评论模板 (40条) ============
// B站特点：玩梗、弹幕文化、二次元、有深度
const bilibiliComments: PlatformCommentTemplate[] = [
  // 短评
  { id: 'bili_001', platform: 'bilibili', content: '前方高能！', baseLikes: 345, sentiment: 'positive', tags: ['高能'], length: 'short' },
  { id: 'bili_002', platform: 'bilibili', content: '泪目了', baseLikes: 412, sentiment: 'positive', tags: ['泪目'], length: 'short' },
  { id: 'bili_003', platform: 'bilibili', content: '名场面', baseLikes: 289, sentiment: 'positive', tags: ['名场面'], length: 'short' },
  { id: 'bili_004', platform: 'bilibili', content: '下次一定', baseLikes: 523, sentiment: 'neutral', tags: ['白嫖'], length: 'short' },
  { id: 'bili_005', platform: 'bilibili', content: 'awsl', baseLikes: 367, sentiment: 'positive', tags: ['awsl'], length: 'short' },
  { id: 'bili_006', platform: 'bilibili', content: '这谁顶得住', baseLikes: 445, sentiment: 'positive', tags: ['顶不住'], length: 'short' },
  { id: 'bili_007', platform: 'bilibili', content: '非酋落泪', baseLikes: 298, sentiment: 'negative', tags: ['非酋'], length: 'short' },
  { id: 'bili_008', platform: 'bilibili', content: '欧吃矛', baseLikes: 456, sentiment: 'negative', tags: ['欧皇'], length: 'short' },
  
  // 中评
  { id: 'bili_009', platform: 'bilibili', content: '前方高能！这段剧情我吹爆！编剧太会写了，这个转折我完全没有预料到，头皮发麻！', baseLikes: 534, sentiment: 'positive', tags: ['剧情', '高能'], length: 'medium' },
  { id: 'bili_010', platform: 'bilibili', content: '泪目了，这个结局太感人了。男主最后那个眼神，我直接破防。这就是爱情啊！', baseLikes: 623, sentiment: 'positive', tags: ['结局', '感人'], length: 'medium' },
  { id: 'bili_011', platform: 'bilibili', content: '名场面打卡！这个片段我能看十遍，每次看都会心动。这就是乙游的魅力啊！', baseLikes: 445, sentiment: 'positive', tags: ['名场面', '打卡'], length: 'medium' },
  { id: 'bili_012', platform: 'bilibili', content: '下次一定！这次池子太毒了，先白嫖为敬。等活动快结束了再看看要不要氪。', baseLikes: 567, sentiment: 'neutral', tags: ['白嫖', '池子'], length: 'medium' },
  { id: 'bili_013', platform: 'bilibili', content: '这爆率我服了，百连无SSR。这就是传说中的概率吗？爱了爱了（反话）。', baseLikes: 712, sentiment: 'negative', tags: ['爆率', '吐槽'], length: 'medium' },
  { id: 'bili_014', platform: 'bilibili', content: 'awsl！男主太会了！这个撩人的技巧，我直接原地升天。这就是成熟男人的魅力吗？', baseLikes: 489, sentiment: 'positive', tags: ['男主', '撩人'], length: 'medium' },
  
  // 长评
  { id: 'bili_015', platform: 'bilibili', content: '从游戏设计的角度来分析一下这个抽卡系统。首先，保底机制是必要的，它给了玩家一个明确的预期，降低了随机性带来的负面体验。其次，概率设置需要在营收和玩家体验之间找到平衡点。太高的概率会影响收入，太低的概率会劝退玩家。这个游戏的概率设置属于行业中等水平，不算良心也不算黑心。建议月卡党攒钻等UP池，不要头铁硬抽。', baseLikes: 823, sentiment: 'neutral', tags: ['分析', '设计'], length: 'long' },
  { id: 'bili_016', platform: 'bilibili', content: '作为一个剧情党，必须说说这游戏的文案水平。优点：1.角色塑造立体，不是脸谱化；2.剧情逻辑自洽，没有明显BUG；3.情感描写细腻，能引发共鸣；4.配音质量高，情绪传达准确。缺点：1.更新速度慢；2.某些支线剧情质量不稳定；3.结局处理有时过于仓促。总体来说，在乙游中算是中上水平，值得剧情党入坑。', baseLikes: 756, sentiment: 'positive', tags: ['剧情党', '测评'], length: 'long' },
  { id: 'bili_017', platform: 'bilibili', content: '退坑玩家回来说几句。这游戏开服时是真的好玩，我肝了三个月。但是后来活动越来越逼氪，剧情也开始水，就慢慢失去了兴趣。最近听说有改进，回来看看。希望官方能记住，玩家是因为热爱才留下来的，不要让这份热爱变成失望。', baseLikes: 912, sentiment: 'neutral', tags: ['回坑', '感慨'], length: 'long' },
  
  // 随手记
  { id: 'bili_018', platform: 'bilibili', content: '记录一下抽卡：今天十连双黄，终于转运了！把欧气分享给大家，祝各位都能抽到想要的卡！', baseLikes: 534, sentiment: 'positive', tags: ['记录', '欧气'], length: 'diary' },
  { id: 'bili_019', platform: 'bilibili', content: '推完新剧情，心情复杂。这个结局不是我期待的，但是仔细想想又是最合理的。编剧厉害。', baseLikes: 445, sentiment: 'positive', tags: ['记录', '剧情'], length: 'diary' },
  
  { id: 'bili_020', platform: 'bilibili', content: '这也太甜了', baseLikes: 378, sentiment: 'positive', tags: ['甜'], length: 'short' },
  { id: 'bili_021', platform: 'bilibili', content: '刀死我了', baseLikes: 423, sentiment: 'negative', tags: ['刀'], length: 'short' },
  { id: 'bili_022', platform: 'bilibili', content: '我酸了', baseLikes: 267, sentiment: 'negative', tags: ['酸'], length: 'short' },
  { id: 'bili_023', platform: 'bilibili', content: '这就是爱情', baseLikes: 534, sentiment: 'positive', tags: ['爱情'], length: 'short' },
  { id: 'bili_024', platform: 'bilibili', content: '氪金大佬', baseLikes: 189, sentiment: 'neutral', tags: ['氪金'], length: 'short' },
  { id: 'bili_025', platform: 'bilibili', content: '白嫖党路过', baseLikes: 445, sentiment: 'neutral', tags: ['白嫖'], length: 'short' },
  { id: 'bili_026', platform: 'bilibili', content: '求BGM', baseLikes: 156, sentiment: 'neutral', tags: ['音乐'], length: 'short' },
  { id: 'bili_027', platform: 'bilibili', content: '已三连', baseLikes: 623, sentiment: 'positive', tags: ['三连'], length: 'short' },
  
  { id: 'bili_028', platform: 'bilibili', content: '这个活动的玩法挺有新意的，不是那种无脑刷的。需要动点脑子，但是不会太难。奖励也还算合理，值得一玩。', baseLikes: 378, sentiment: 'positive', tags: ['活动', '玩法'], length: 'medium' },
  { id: 'bili_029', platform: 'bilibili', content: '对比开服时的福利，现在确实缩水了不少。虽然理解游戏要赚钱，但是幅度能不能小一点？慢慢调整不行吗？', baseLikes: 534, sentiment: 'negative', tags: ['福利', '对比'], length: 'medium' },
  { id: 'bili_030', platform: 'bilibili', content: '这个配音真的太绝了！情绪拿捏得恰到好处，特别是那段哭戏，我直接跟着哭了。声优大大nb！', baseLikes: 623, sentiment: 'positive', tags: ['配音', '声优'], length: 'medium' },
  
  { id: 'bili_031', platform: 'bilibili', content: '详细测评一下各个男主的个人线。总裁线：甜宠为主，适合喜欢霸道爱情的玩家；学长线：细水长流，感情描写细腻；弟弟线：年下养成，反差萌十足；神秘线：悬疑元素多，剧情最精彩。总体来说各有特色，建议都体验一下。', baseLikes: 712, sentiment: 'positive', tags: ['测评', '男主'], length: 'long' },
  
  { id: 'bili_032', platform: 'bilibili', content: '今天是在一起的第100天。虽然知道是虚拟的，但是这一百天的陪伴是真实的。谢谢你，我的男主角。', baseLikes: 845, sentiment: 'positive', tags: ['记录', '纪念'], length: 'diary' },
  { id: 'bili_033', platform: 'bilibili', content: '保底记录更新：第90抽终于出了。这次是大保底，下次应该能欧一点吧？大概。', baseLikes: 378, sentiment: 'negative', tags: ['记录', '保底'], length: 'diary' },
  
  { id: 'bili_034', platform: 'bilibili', content: '这卡必抽', baseLikes: 445, sentiment: 'positive', tags: ['抽卡'], length: 'short' },
  { id: 'bili_035', platform: 'bilibili', content: '等一个攻略', baseLikes: 234, sentiment: 'neutral', tags: ['攻略'], length: 'short' },
  { id: 'bili_036', platform: 'bilibili', content: '太氪了告辞', baseLikes: 312, sentiment: 'negative', tags: ['氪金'], length: 'short' },
  { id: 'bili_037', platform: 'bilibili', content: '剧情封神', baseLikes: 756, sentiment: 'positive', tags: ['剧情'], length: 'short' },
  { id: 'bili_038', platform: 'bilibili', content: '官方懂我', baseLikes: 289, sentiment: 'positive', tags: ['官方'], length: 'short' },
  { id: 'bili_039', platform: 'bilibili', content: '什么时候更新', baseLikes: 445, sentiment: 'neutral', tags: ['更新'], length: 'short' },
  { id: 'bili_040', platform: 'bilibili', content: '已退坑', baseLikes: 267, sentiment: 'negative', tags: ['退坑'], length: 'short' }
];

// ============ 贴吧评论模板 (40条) ============
// 贴吧特点：硬核、吐槽、老玩家多、理性讨论
const tiebaComments: PlatformCommentTemplate[] = [
  // 短评
  { id: 'tb_001', platform: 'tieba', content: '有一说一，能玩', baseLikes: 234, sentiment: 'positive', tags: ['评价'], length: 'short' },
  { id: 'tb_002', platform: 'tieba', content: '白嫖党路过', baseLikes: 312, sentiment: 'neutral', tags: ['白嫖'], length: 'short' },
  { id: 'tb_003', platform: 'tieba', content: '理性讨论，爆率正常吗', baseLikes: 267, sentiment: 'neutral', tags: ['讨论'], length: 'short' },
  { id: 'tb_004', platform: 'tieba', content: '劝退，太毒了', baseLikes: 389, sentiment: 'negative', tags: ['劝退'], length: 'short' },
  { id: 'tb_005', platform: 'tieba', content: '立绘确实不错', baseLikes: 198, sentiment: 'positive', tags: ['立绘'], length: 'short' },
  { id: 'tb_006', platform: 'tieba', content: '服务器又炸', baseLikes: 445, sentiment: 'negative', tags: ['服务器'], length: 'short' },
  { id: 'tb_007', platform: 'tieba', content: '剧情还可以', baseLikes: 178, sentiment: 'positive', tags: ['剧情'], length: 'short' },
  { id: 'tb_008', platform: 'tieba', content: '这优化没救了', baseLikes: 356, sentiment: 'negative', tags: ['优化'], length: 'short' },
  
  // 中评
  { id: 'tb_009', platform: 'tieba', content: '有一说一，这游戏的剧情在乙游里算是中上水平。没有那种尴尬的霸总文学，角色的行为也比较符合逻辑。推荐剧情党入坑。', baseLikes: 445, sentiment: 'positive', tags: ['剧情', '推荐'], length: 'medium' },
  { id: 'tb_010', platform: 'tieba', content: '白嫖党表示这游戏能玩。虽然抽卡比较慢，但是慢慢攒也能抽到想要的卡。就是需要有耐心。', baseLikes: 378, sentiment: 'positive', tags: ['白嫖', '体验'], length: 'medium' },
  { id: 'tb_011', platform: 'tieba', content: '理性讨论，这个卡池的爆率是不是有点问题？我身边几个朋友都是大保底，这正常吗？', baseLikes: 534, sentiment: 'neutral', tags: ['讨论', '爆率'], length: 'medium' },
  { id: 'tb_012', platform: 'tieba', content: '劝退！这游戏逼氪太严重了。不花钱就拿不到核心奖励，活动也是给氪金玩家准备的。', baseLikes: 623, sentiment: 'negative', tags: ['逼氪', '劝退'], length: 'medium' },
  { id: 'tb_013', platform: 'tieba', content: '老玩家说一句，这游戏开服时是真的良心。现在嘛...一言难尽。希望官方能找回初心。', baseLikes: 712, sentiment: 'negative', tags: ['老玩家', '感慨'], length: 'medium' },
  
  // 长评
  { id: 'tb_014', platform: 'tieba', content: '详细分析一下这游戏的优缺点。优点：1.剧情质量高，逻辑自洽；2.画风精致，CG质量在线；3.配音阵容豪华；4.白嫖能玩，不逼氪。缺点：1.更新速度慢；2.活动有时太肝；3.服务器不稳定；4.客服响应慢。总体来说是一款值得尝试的乙游，但是需要调整好心态，不要急于求成。', baseLikes: 823, sentiment: 'neutral', tags: ['分析', '测评'], length: 'long' },
  { id: 'tb_015', platform: 'tieba', content: '从开服玩到现在，说说我的感受。开服时福利确实好，玩家氛围也不错。后来几次运营事故，逼氪、剧情崩、装死，流失了不少人。我也差点退坑。但是最近几个活动感觉有回暖，剧情质量回来了，福利也多了一些。希望官方能保持下去，毕竟投入了很多时间和感情，不希望看到它凉掉。', baseLikes: 756, sentiment: 'neutral', tags: ['老玩家', '测评'], length: 'long' },
  { id: 'tb_016', platform: 'tieba', content: '给萌新一些建议。首先，这游戏白嫖能玩，但是进度会比较慢。其次，资源一定要规划，不要乱花。第三，抽卡等UP池，普池性价比低。第四，剧情建议慢慢看，质量不错。第五，加几个活跃好友，可以互相帮助。最后，保持理性消费，不要上头。', baseLikes: 845, sentiment: 'positive', tags: ['攻略', '萌新'], length: 'long' },
  
  // 随手记
  { id: 'tb_017', platform: 'tieba', content: '记录一下今天的抽卡情况：攒了三个月的钻，终于抽到梦情卡了。虽然是保底，但是值了。', baseLikes: 334, sentiment: 'positive', tags: ['记录', '抽卡'], length: 'diary' },
  { id: 'tb_018', platform: 'tieba', content: '推完新剧情，心情复杂。这个结局处理得还可以，但是某些转折略显突兀。总体来说满意。', baseLikes: 267, sentiment: 'positive', tags: ['记录', '剧情'], length: 'diary' },
  
  { id: 'tb_019', platform: 'tieba', content: '这游戏寿命多久', baseLikes: 289, sentiment: 'neutral', tags: ['寿命'], length: 'short' },
  { id: 'tb_020', platform: 'tieba', content: '客服态度太差', baseLikes: 423, sentiment: 'negative', tags: ['客服'], length: 'short' },
  { id: 'tb_021', platform: 'tieba', content: '值得氪吗', baseLikes: 178, sentiment: 'neutral', tags: ['氪金'], length: 'short' },
  { id: 'tb_022', platform: 'tieba', content: '卡池太深别碰', baseLikes: 534, sentiment: 'negative', tags: ['卡池'], length: 'short' },
  { id: 'tb_023', platform: 'tieba', content: '音乐好听', baseLikes: 223, sentiment: 'positive', tags: ['音乐'], length: 'short' },
  { id: 'tb_024', platform: 'tieba', content: '强度平衡吗', baseLikes: 156, sentiment: 'neutral', tags: ['强度'], length: 'short' },
  { id: 'tb_025', platform: 'tieba', content: '亲测能玩', baseLikes: 312, sentiment: 'positive', tags: ['亲测'], length: 'short' },
  { id: 'tb_026', platform: 'tieba', content: '什么时候关服', baseLikes: 267, sentiment: 'negative', tags: ['关服'], length: 'short' },
  
  { id: 'tb_027', platform: 'tieba', content: '这个活动的难度设置不合理。新手打不过，老玩家又觉得太简单。建议分层设计，让不同练度的玩家都能有体验。', baseLikes: 445, sentiment: 'neutral', tags: ['难度', '建议'], length: 'medium' },
  { id: 'tb_028', platform: 'tieba', content: '对比了一下同期的几个乙游，这个的综合质量算是中等偏上。剧情、画风、配音都在线，就是运营有时候拉胯。', baseLikes: 534, sentiment: 'neutral', tags: ['对比', '评价'], length: 'medium' },
  { id: 'tb_029', platform: 'tieba', content: '这个优化真的没救了。每次更新都要下载一大堆资源，手机内存不够用了。能不能优化一下？', baseLikes: 378, sentiment: 'negative', tags: ['优化', '吐槽'], length: 'medium' },
  
  { id: 'tb_030', platform: 'tieba', content: '从概率论的角度分析一下抽卡。假设SSR概率是2%，那么期望值是50抽一个。但是概率是独立的，所以可能出现连续几百抽不出货的情况。保底机制就是为了防止这种极端情况。这个游戏90抽保底，属于行业平均水平。建议月卡党攒钻等UP池，不要头铁。', baseLikes: 623, sentiment: 'neutral', tags: ['分析', '概率'], length: 'long' },
  
  { id: 'tb_031', platform: 'tieba', content: '今天是在一起的第200天。虽然知道是虚拟的，但是这段陪伴是真实的。记录一下。', baseLikes: 445, sentiment: 'positive', tags: ['记录', '纪念'], length: 'diary' },
  { id: 'tb_032', platform: 'tieba', content: '保底记录：第1次82抽，第2次88抽，第3次90抽。平均86.7抽一个SSR。这算非还是欧？', baseLikes: 289, sentiment: 'neutral', tags: ['记录', '统计'], length: 'diary' },
  
  { id: 'tb_033', platform: 'tieba', content: '这剧情不合理', baseLikes: 334, sentiment: 'negative', tags: ['剧情'], length: 'short' },
  { id: 'tb_034', platform: 'tieba', content: '官方装死', baseLikes: 567, sentiment: 'negative', tags: ['官方'], length: 'short' },
  { id: 'tb_035', platform: 'tieba', content: '新活动还行', baseLikes: 189, sentiment: 'positive', tags: ['活动'], length: 'short' },
  { id: 'tb_036', platform: 'tieba', content: '求攻略', baseLikes: 123, sentiment: 'neutral', tags: ['攻略'], length: 'short' },
  { id: 'tb_037', platform: 'tieba', content: '已退坑', baseLikes: 445, sentiment: 'negative', tags: ['退坑'], length: 'short' },
  { id: 'tb_038', platform: 'tieba', content: '回坑看看', baseLikes: 267, sentiment: 'neutral', tags: ['回坑'], length: 'short' },
  { id: 'tb_039', platform: 'tieba', content: '这卡强吗', baseLikes: 178, sentiment: 'neutral', tags: ['强度'], length: 'short' },
  { id: 'tb_040', platform: 'tieba', content: '剧情党满足', baseLikes: 401, sentiment: 'positive', tags: ['剧情党'], length: 'short' }
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

export function getPlatformComments(platform: PlatformType): PlatformCommentTemplate[] {
  return platformCommentMap[platform] || [];
}

export function getAllPlatformComments(): PlatformCommentTemplate[] {
  return Object.values(platformCommentMap).flat();
}

export function getRandomPlatformComment(platform: PlatformType): PlatformCommentTemplate | null {
  const comments = getPlatformComments(platform);
  if (comments.length === 0) return null;
  return comments[Math.floor(Math.random() * comments.length)];
}

export function getRandomPlatformComments(count: number = 10): PlatformCommentTemplate[] {
  const all = getAllPlatformComments();
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getCommentsByLength(length: CommentLength): PlatformCommentTemplate[] {
  return getAllPlatformComments().filter(c => c.length === length);
}

export function getCommentsBySentiment(sentiment: PlatformCommentSentiment): PlatformCommentTemplate[] {
  return getAllPlatformComments().filter(c => c.sentiment === sentiment);
}

export function getPlatformName(platform: PlatformType): string {
  const map: Record<PlatformType, string> = {
    douyin: '抖音',
    xiaohongshu: '小红书',
    weibo: '微博',
    bilibili: 'B站',
    tieba: '贴吧'
  };
  return map[platform];
}

export function getPlatformEmoji(platform: PlatformType): string {
  const map: Record<PlatformType, string> = {
    douyin: '🎵',
    xiaohongshu: '📕',
    weibo: '🌐',
    bilibili: '📺',
    tieba: '🏠'
  };
  return map[platform];
}

export function generatePlatformComment(platform: PlatformType): PlatformCommentTemplate {
  const template = getRandomPlatformComment(platform);
  if (!template) {
    throw new Error(`No comments found for platform: ${platform}`);
  }
  return {
    ...template,
    id: `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    baseLikes: Math.floor(Math.random() * 500) + 50
  };
}

export function generatePlatformComments(platform: PlatformType, count: number): PlatformCommentTemplate[] {
  return Array.from({ length: count }, () => generatePlatformComment(platform));
}

export function generateMultiPlatformComments(countPerPlatform: number = 10): Record<PlatformType, PlatformCommentTemplate[]> {
  return {
    douyin: generatePlatformComments('douyin', countPerPlatform),
    xiaohongshu: generatePlatformComments('xiaohongshu', countPerPlatform),
    weibo: generatePlatformComments('weibo', countPerPlatform),
    bilibili: generatePlatformComments('bilibili', countPerPlatform),
    tieba: generatePlatformComments('tieba', countPerPlatform)
  };
}
