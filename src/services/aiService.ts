/**
 * AI 服务层
 * 封装后端 AI 接口调用，支持多模型切换
 * 当前使用模拟数据，后续可替换为真实 API 调用
 */

import type { Character } from '@/stores/gameStore';
import type { CommentType, PlayerType, CommentTemplate } from '@/types/template';
import { generateComment, generateComments as generateCommentTemplates } from '@/data/templates/comments';
import {
  getConfig,
  setProvider,
  setUseMock,
  getProviderForTask,
  getModelConfig,
  getAllProviders,
  type AIProvider
} from '@/config/aiConfig';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function mockDelay(ms: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface GenerateCommentParams {
  playerType: PlayerType;
  commentType: CommentType;
  count: number;
  gameId?: string;
}

export interface GenerateDialogueParams {
  character: Partial<Character>;
  scene: 'touch' | 'hug' | 'confess' | 'daily';
  mood?: 'happy' | 'sad' | 'angry' | 'shy';
}

export interface GeneratePlotParams {
  title: string;
  routeType: 'sweet' | 'angst' | 'suspense';
  characters: string[];
  chapterCount: number;
}

export interface AIService {
  polishCharacter(character: Partial<Character>): Promise<string>;
  fillPlot(plotContent: string, chapters: any[]): Promise<string>;
  generateComments(params: GenerateCommentParams): Promise<CommentTemplate[]>;
  generateDialogue(params: GenerateDialogueParams): Promise<string>;
  generatePlotChapter(params: GeneratePlotParams): Promise<any>;
  generateImage(prompt: string, type: 'avatar' | 'cg'): Promise<string>;
  healthCheck(): Promise<boolean>;
  setProvider(provider: AIProvider): void;
  setMockMode(useMock: boolean): void;
  getCurrentProvider(): AIProvider;
  getAvailableProviders(): AIProvider[];
}

class AIServiceImpl implements AIService {
  private currentProvider: AIProvider;

  constructor() {
    this.currentProvider = getConfig().currentProvider;
  }

  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  getAvailableProviders(): AIProvider[] {
    return getAllProviders();
  }

  setProvider(provider: AIProvider): void {
    this.currentProvider = provider;
    setProvider(provider);
  }

  setMockMode(useMock: boolean): void {
    setUseMock(useMock);
  }

  async polishCharacter(character: Partial<Character>): Promise<string> {
    const config = getConfig();
    
    if (config.useMock) {
      await mockDelay(1500);
      const originalBackground = character.background || '';
      const polishSuffix = `

【AI 润色 - ${getModelConfig(this.currentProvider).name}】
他的眼神中藏着无尽的温柔，仿佛整个世界都为你而存在。每一次相遇，都是命运的安排。

在那个樱花飘落的午后，阳光透过树叶的缝隙洒在他的侧脸上，你忽然意识到——这个人，将会改变你的一生。

他看似冷漠的外表下，隐藏着一颗炽热的心。只有你能看到，他在无人注意时，嘴角那一抹不易察觉的微笑。`;
      return originalBackground + polishSuffix;
    }
    
    try {
      const response = await fetch(`${BASE_URL}/ai/polish-character`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character, provider: this.currentProvider })
      });
      
      if (!response.ok) throw new Error('API 调用失败');
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('AI 润色失败:', error);
      return character.background || '';
    }
  }
  
  async fillPlot(plotContent: string, chapters: any[]): Promise<string> {
    const config = getConfig();
    
    if (config.useMock) {
      await mockDelay(1500);
      return `
【AI 补全过渡剧情 - ${getModelConfig(this.currentProvider).name}】

时光荏苒，转眼间已经过去了一个月。

在这段时间里，你们的关系悄然发生着变化。那些不经意的眼神交汇，那些默契的相视一笑，都在诉说着一种难以言喻的情愫。

直到那个雨夜，一切终于有了答案...

（过渡剧情已根据上下文自动生成，让故事更加流畅自然）`;
    }
    
    try {
      const response = await fetch(`${BASE_URL}/ai/fill-plot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plotContent, chapters, provider: this.currentProvider })
      });
      
      if (!response.ok) throw new Error('API 调用失败');
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('AI 补全失败:', error);
      return '';
    }
  }
  
  async generateComments(params: GenerateCommentParams): Promise<CommentTemplate[]> {
    const config = getConfig();
    
    if (config.useMock) {
      await mockDelay(1000);
      const comments = generateCommentTemplates(params.commentType, params.playerType, params.count);
      return comments.map(comment => ({ ...comment }));
    }
    
    try {
      const response = await fetch(`${BASE_URL}/ai/generate-comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, provider: this.currentProvider })
      });
      
      if (!response.ok) throw new Error('API 调用失败');
      const data = await response.json();
      return data.comments;
    } catch (error) {
      console.error('AI 生成评论失败:', error);
      return generateCommentTemplates(params.commentType, params.playerType, params.count);
    }
  }

  async generateDialogue(params: GenerateDialogueParams): Promise<string> {
    const config = getConfig();
    const provider = getProviderForTask('dialogue');
    
    if (config.useMock) {
      await mockDelay(1000);
      
      const dialogues: Record<string, Record<string, string[]>> = {
        touch: {
          happy: [
            '嗯？想摸摸我的头吗？...好吧，就这一次。',
            '你的手很温暖呢...让我有点不想移开了。',
            '被你这样对待，我竟然一点也不讨厌呢。'
          ],
          sad: [
            '...现在，可以让我一个人静一静吗？',
            '抱歉，我现在没有心情和你开玩笑。',
            '如果你是来安慰我的...谢谢。'
          ],
          shy: [
            '你、你突然靠这么近干什么...',
            '不要突然摸我的头啊！会...会让人误会的。',
            '笨蛋...这种事情，应该让我来做才对。'
          ],
          angry: [
            '别碰我！我现在不想和你说话。',
            '你是故意的吧？明知道我在生气。',
            '...算了，这次就原谅你。'
          ]
        },
        hug: {
          happy: [
            '就这样...让我抱一会儿。',
            '你的心跳声，我听得一清二楚哦。',
            '如果是你的话...我可以一直这样。'
          ],
          sad: [
            '...能让我靠一会儿吗？就一会儿。',
            '你的怀抱...意外地让人安心。',
            '谢谢你...一直陪在我身边。'
          ],
          shy: [
            '等、等等！你怎么突然——',
            '我的脸...肯定很红吧...别看我！',
            '这、这样也太近了...心跳好快...'
          ],
          angry: [
            '放开我！...算了，随你便。',
            '你是想用这种方式让我消气吗？',
            '...真是拿你没办法。'
          ]
        },
        confess: {
          happy: [
            '其实...我也喜欢你很久了。',
            '你终于说出口了。我等这句话等了好久。',
            '以后，请多多指教了，我的...恋人。'
          ],
          sad: [
            '对不起...我现在还没有办法回应你的感情。',
            '你值得更好的人...而不是像我这样的。',
            '谢谢你的心意...但请给我一些时间。'
          ],
          shy: [
            '我、我也...那个...就是...喜欢你！',
            '这、这种事情应该由我来说才对吧！',
            '笨蛋...我当然是愿意的啊...'
          ],
          angry: [
            '你是认真的吗？...好吧，我接受。',
            '哼，既然你都这么说了，我就勉为其难答应你。',
            '...这次就原谅你之前的所作所为吧。'
          ]
        },
        daily: {
          happy: [
            '今天天气不错呢，要不要一起出去走走？',
            '你今天看起来心情很好，发生什么事了吗？',
            '能和你在一起，就是最幸福的事了。'
          ],
          sad: [
            '...没什么，只是有点累而已。',
            '你今天有空吗？我想...和你待一会儿。',
            '看到你，心情稍微好了一点。'
          ],
          shy: [
            '那个...今天...你看起来很好看...',
            '没、没什么！我只是随便看看！',
            '和你在一起的时候，总觉得时间过得特别快...'
          ],
          angry: [
            '今天不想理你。',
            '...你还知道来找我啊。',
            '哼，看在你主动来找我的份上，原谅你了。'
          ]
        }
      };
      
      const sceneDialogues = dialogues[params.scene] || dialogues.daily;
      const moodDialogues = sceneDialogues[params.mood || 'happy'] || sceneDialogues.happy;
      return moodDialogues[Math.floor(Math.random() * moodDialogues.length)];
    }
    
    try {
      const response = await fetch(`${BASE_URL}/ai/generate-dialogue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, provider })
      });
      
      if (!response.ok) throw new Error('API 调用失败');
      const data = await response.json();
      return data.dialogue;
    } catch (error) {
      console.error('AI 生成对话失败:', error);
      return '...（沉默）';
    }
  }

  async generatePlotChapter(params: GeneratePlotParams): Promise<any> {
    const config = getConfig();
    const provider = getProviderForTask('plot');
    
    if (config.useMock) {
      await mockDelay(2000);
      
      const routeStyles: Record<string, string> = {
        sweet: '温馨甜蜜',
        angst: '虐心催泪',
        suspense: '悬疑紧张'
      };
      
      return {
        title: params.title,
        routeType: params.routeType,
        style: routeStyles[params.routeType],
        chapters: Array.from({ length: params.chapterCount }, (_, i) => ({
          chapter: i + 1,
          title: `第${i + 1}章：${['初遇', '心动', '告白', '考验', '承诺'][i % 5]}`,
          scene: ['樱花飘落的校园', '繁华的商业街', '安静的咖啡馆', '雨夜的屋檐下', '星空下的天台'][i % 5],
          keyEvent: `${params.characters[0] || '主角'}与你的关系逐渐升温，${['一个意外的相遇', '一次深入的交谈', '一场误会的化解', '一个重要的决定', '一份真挚的告白'][i % 5]}让你们更加靠近。`,
          choices: [
            '上前搭话',
            '默默观察',
            '转身离开',
            '微笑回应'
          ],
          selectedChoice: -1
        })),
        generatedBy: getModelConfig(provider).name
      };
    }
    
    try {
      const response = await fetch(`${BASE_URL}/ai/generate-plot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, provider })
      });
      
      if (!response.ok) throw new Error('API 调用失败');
      const data = await response.json();
      return data.plot;
    } catch (error) {
      console.error('AI 生成剧情失败:', error);
      return null;
    }
  }
  
  async generateImage(prompt: string, type: 'avatar' | 'cg'): Promise<string> {
    const config = getConfig();
    
    if (config.useMock) {
      await mockDelay(2000);
      const placeholderImages = {
        avatar: [
          'https://picsum.photos/400/400?random=1',
          'https://picsum.photos/400/400?random=2',
          'https://picsum.photos/400/400?random=3'
        ],
        cg: [
          'https://picsum.photos/800/600?random=1',
          'https://picsum.photos/800/600?random=2',
          'https://picsum.photos/800/600?random=3'
        ]
      };
      const images = placeholderImages[type];
      return images[Math.floor(Math.random() * images.length)];
    }
    
    try {
      const response = await fetch(`${BASE_URL}/ai/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type, provider: this.currentProvider })
      });
      
      if (!response.ok) throw new Error('API 调用失败');
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('AI 生成图片失败:', error);
      throw new Error('图片生成失败，请重试');
    }
  }
  
  async healthCheck(): Promise<boolean> {
    const config = getConfig();
    if (config.useMock) return true;
    
    try {
      const response = await fetch(`${BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.error('AI 服务健康检查失败:', error);
      return false;
    }
  }
}

export const aiService = new AIServiceImpl();
export default aiService;
