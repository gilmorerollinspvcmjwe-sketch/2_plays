/**
 * 神秘转学生类角色模板（5个）
 */

import type { CharacterTemplate } from '@/types/template';

export const mysteriousTransferTemplates: CharacterTemplate[] = [
  {
    id: 'mysterious_transfer_001',
    category: 'mysterious_transfer',
    name: '神秘转学生',
    tags: ['神秘', '转学生', '过往', '救赎'],
    personality: '沉默寡言，很少谈及过去。眼神中藏着秘密，却在你的陪伴下逐渐敞开心扉。',
    appearance: '黑色长发，遮住一只眼睛的刘海，神秘的眼神。气质阴郁，却在你靠近时会露出微笑。',
    clothing: '黑色校服，高领毛衣，简约神秘风。',
    background: '突然转来的学生，没有人知道他的过去。你主动与他搭话，成为他黑暗中的一束光。',
    voiceActor: '资深',
    popularity: 8
  },
  {
    id: 'mysterious_transfer_002',
    category: 'mysterious_transfer',
    name: '异国留学生',
    tags: ['异国', '留学生', '文化差异', '浪漫'],
    personality: '来自异国他乡，带着独特的文化魅力。对你充满好奇，用不同的方式表达爱意。',
    appearance: '铂金色短发，碧蓝的眼睛，立体的五官。气质优雅，带着异域风情。',
    clothing: '校服，有时会穿着家乡风格的配饰，混搭风。',
    background: '从欧洲来的交换生，语言不太流利。你帮助他适应新环境，他教你异国的浪漫。',
    voiceActor: '资深',
    popularity: 8
  },
  {
    id: 'mysterious_transfer_003',
    category: 'mysterious_transfer',
    name: '失忆少年',
    tags: ['失忆', '神秘', '依赖', '温柔'],
    personality: '失去了过去的记忆，对世界充满迷茫。唯独对你有着莫名的熟悉感和依赖。',
    appearance: '柔软的灰发，迷茫的眼神，脆弱的气质。身材纤细，让人想要保护。',
    clothing: '简单的白衬衫，深色裤子，干净清爽。',
    background: '在雨夜被你救起的失忆少年，只记得你的名字。你帮助他寻找过去，却发现了惊人的秘密。',
    voiceActor: '新人',
    popularity: 7
  },
  {
    id: 'mysterious_transfer_004',
    category: 'mysterious_transfer',
    name: '夜行怪盗',
    tags: ['怪盗', '神秘', '双面', '刺激'],
    personality: '白天是普通学生，夜晚是神秘的怪盗。在你面前会展现真实的自我，带你体验刺激的生活。',
    appearance: '黑色短发，锐利的眼神，神秘的笑容。身材灵活，动作敏捷。',
    clothing: '白天是校服，夜晚是黑色紧身衣，反差极大。',
    background: '为了寻找某样宝物而来到这座城市。你意外发现了他的秘密，成为他的共犯和挚爱。',
    voiceActor: '资深',
    popularity: 8
  },
  {
    id: 'mysterious_transfer_005',
    category: 'mysterious_transfer',
    name: '时间旅行者',
    tags: ['科幻', '时间旅行', '宿命', '深情'],
    personality: '来自未来的时间旅行者，知道你们的结局却无法改变。在有限的时间里，用尽全力爱你。',
    appearance: '银白色短发，深邃的眼眸中藏着沧桑。气质成熟，与年龄不符。',
    clothing: '未来风格的服装，简约而有科技感。',
    background: '从未来穿越而来，只为拯救你的生命。在改变历史的过程中，你们相爱了。',
    voiceActor: '顶流',
    popularity: 9
  }
];
