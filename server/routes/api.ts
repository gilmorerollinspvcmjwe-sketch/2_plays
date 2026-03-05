import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, optionalAuth, generateToken, AuthRequest } from '../middleware/auth';
import { BadRequestError, UnauthorizedError } from '../middleware/errorHandler';
import { AIServiceManager } from '../services/ai';

const router = Router();

let aiManager: AIServiceManager | null = null;

export function setAIServiceManager(manager: AIServiceManager) {
  aiManager = manager;
}

router.get('/version', (req: Request, res: Response) => {
  res.json({
    success: true,
    version: '1.0.0',
    name: 'Game Platform API',
  });
});

router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('验证失败');
    }

    const { username, password } = req.body;

    if (password !== 'demo123') {
      throw new UnauthorizedError('用户名或密码错误');
    }

    const token = generateToken({
      userId: 'user_' + Date.now(),
      username,
      role: 'user',
    });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          userId: 'user_' + Date.now(),
          username,
          role: 'user',
        },
      },
    });
  }
);

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 20 }).withMessage('用户名长度 3-20 个字符'),
    body('email').isEmail().withMessage('邮箱格式不正确'),
    body('password').isLength({ min: 6 }).withMessage('密码至少 6 个字符'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('验证失败');
    }

    const { username, email, password } = req.body;

    const token = generateToken({
      userId: 'user_' + Date.now(),
      username,
      role: 'user',
    });

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          userId: 'user_' + Date.now(),
          username,
          email,
          role: 'user',
        },
      },
    });
  }
);

router.get('/profile', authenticate, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

router.get('/public-data', optionalAuth, (req: AuthRequest, res: Response) => {
  const isAuthenticated = !!req.user;
  
  res.json({
    success: true,
    data: {
      message: isAuthenticated ? '欢迎回来，已认证用户' : '欢迎访问，游客',
      isAuthenticated,
      user: req.user || null,
      publicInfo: {
        serverTime: new Date().toISOString(),
        features: ['游戏列表', '排行榜', '新闻资讯'],
      },
    },
  });
});

router.get(
  '/protected',
  authenticate,
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      message: '访问成功！这是受保护的资源',
      data: {
        user: req.user,
        accessedAt: new Date().toISOString(),
      },
    });
  }
);

router.post(
  '/games',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('游戏标题不能为空'),
    body('description').optional().trim(),
    body('category').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('验证失败');
    }

    const { title, description, category } = req.body;

    const newGame = {
      id: 'game_' + Date.now(),
      title,
      description,
      category: category || 'general',
      createdBy: req.user?.userId,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: '游戏创建成功',
      data: newGame,
    });
  }
);

router.get('/games', optionalAuth, async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '10', category } = req.query;
  
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  
  const mockGames = [
    { id: '1', title: '超级马里奥', category: 'action', rating: 4.8 },
    { id: '2', title: '俄罗斯方块', category: 'puzzle', rating: 4.9 },
    { id: '3', title: '吃豆人', category: 'arcade', rating: 4.7 },
    { id: '4', title: '街头霸王', category: 'fighting', rating: 4.6 },
    { id: '5', title: '索尼克', category: 'action', rating: 4.5 },
  ];

  let filteredGames = mockGames;
  if (category) {
    filteredGames = mockGames.filter((game) => game.category === category);
  }

  res.json({
    success: true,
    data: {
      games: filteredGames,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredGames.length,
      },
    },
  });
});

router.get('/ai/health', (req: Request, res: Response) => {
  if (!aiManager) {
    res.json({
      success: false,
      message: 'AI 服务未初始化',
      available: false
    });
    return;
  }
  
  const availableProviders = aiManager.getAvailableProviders();
  res.json({
    success: true,
    message: 'AI 服务健康检查通过',
    available: true,
    providers: availableProviders,
    timestamp: new Date().toISOString()
  });
});

router.post(
  '/ai/polish-character',
  [
    body('character').optional().isObject(),
  ],
  async (req: Request, res: Response) => {
    if (!aiManager) {
      throw new BadRequestError('AI 服务未初始化');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('验证失败');
    }

    const { character } = req.body;

    try {
      const response = await aiManager.generateCharacter(
        `请润色以下角色设定，使其更加生动、有吸引力：\n\n${character?.background || character?.description || '请根据已有信息润色角色'}`
      );

      res.json({
        success: response.success,
        result: response.content,
        provider: response.provider,
        fallback: response.fallback
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

router.post(
  '/ai/fill-plot',
  [
    body('plotContent').optional().isString(),
    body('chapters').optional().isArray(),
  ],
  async (req: Request, res: Response) => {
    if (!aiManager) {
      throw new BadRequestError('AI 服务未初始化');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('验证失败');
    }

    const { plotContent, chapters } = req.body;

    try {
      const context = chapters && chapters.length > 0 
        ? `当前剧情章节：\n${JSON.stringify(chapters, null, 2)}\n\n` 
        : '';
      
      const response = await aiManager.processLongText(
        `${context}${plotContent || ''}`,
        '请根据以上剧情内容，生成一段过渡剧情，使故事更加流畅自然。要求文笔优美，情节连贯。'
      );

      res.json({
        success: response.success,
        result: response.content,
        provider: response.provider,
        fallback: response.fallback
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

router.post(
  '/ai/generate-comments',
  [
    body('playerType').optional().isString(),
    body('commentType').optional().isString(),
    body('count').optional().isNumeric(),
  ],
  async (req: Request, res: Response) => {
    if (!aiManager) {
      throw new BadRequestError('AI 服务未初始化');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('验证失败');
    }

    const { playerType, commentType, count = 5, gameId } = req.body;

    try {
      const prompt = `请生成${count}条游戏评论，玩家类型：${playerType || '普通玩家'}，评论类型：${commentType || '一般评论'}${gameId ? `，游戏 ID：${gameId}` : ''}`;
      
      const comments: string[] = [];
      for (let i = 0; i < count; i++) {
        const response = await aiManager.sendRequest({
          provider: 'minimax',
          messages: [
            { role: 'system', content: '你是一个专业的游戏评论家，擅长生成有趣、有深度的游戏评论。' },
            { role: 'user', content: prompt }
          ],
          taskType: 'comment',
          temperature: 0.8,
          maxTokens: 300
        });

        if (response.success) {
          comments.push(response.content);
        }
      }

      res.json({
        success: true,
        comments: comments.map((content, index) => ({
          id: `comment_${Date.now()}_${index}`,
          content,
          type: commentType || 'general',
          playerType: playerType || 'normal',
          createdAt: new Date().toISOString()
        })),
        count: comments.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

router.post(
  '/ai/generate-dialogue',
  [
    body('character').optional().isObject(),
    body('scene').optional().isString(),
    body('mood').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    if (!aiManager) {
      throw new BadRequestError('AI 服务未初始化');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('验证失败');
    }

    const { character, scene, mood } = req.body;

    try {
      const characterDesc = character ? JSON.stringify(character) : '一个有个性的角色';
      const sceneDesc = scene || '日常场景';
      const moodDesc = mood || '平静';

      const response = await aiManager.sendRequest({
        provider: 'deepseek',
        messages: [
          { 
            role: 'system', 
            content: `你是一个专业的对话生成助手，擅长根据角色设定、场景和情绪生成符合角色性格的对话。角色信息：${characterDesc}` 
          },
          { 
            role: 'user', 
            content: `请为以下场景生成一句对话：\n场景：${sceneDesc}\n情绪：${moodDesc}\n\n要求：对话要符合角色性格，简洁自然，富有表现力。` 
          }
        ],
        taskType: 'general',
        temperature: 0.9,
        maxTokens: 200
      });

      res.json({
        success: response.success,
        dialogue: response.content,
        provider: response.provider,
        fallback: response.fallback
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

router.post(
  '/ai/generate-plot',
  [
    body('title').trim().notEmpty().withMessage('剧情标题不能为空'),
    body('routeType').optional().isString(),
    body('characters').optional().isArray(),
    body('chapterCount').optional().isNumeric(),
  ],
  async (req: Request, res: Response) => {
    if (!aiManager) {
      throw new BadRequestError('AI 服务未初始化');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('验证失败');
    }

    const { title, routeType = 'sweet', characters = [], chapterCount = 5 } = req.body;

    try {
      const routeStyles: Record<string, string> = {
        sweet: '温馨甜蜜',
        angst: '虐心催泪',
        suspense: '悬疑紧张'
      };

      const response = await aiManager.sendRequest({
        provider: 'kimi',
        messages: [
          { 
            role: 'system', 
            content: '你是一个专业的剧情策划师，擅长创作引人入胜的互动剧情。' 
          },
          { 
            role: 'user', 
            content: `请为以下剧情生成大纲：\n标题：${title}\n风格：${routeStyles[routeType] || '温馨甜蜜'}\n主要角色：${characters.join(', ') || '主角'}\n章节数：${chapterCount}\n\n要求：生成每个章节的标题、场景、关键事件和选择支。` 
          }
        ],
        taskType: 'long_text',
        temperature: 0.8,
        maxTokens: 2000
      });

      const plot = {
        title,
        routeType,
        style: routeStyles[routeType] || '温馨甜蜜',
        content: response.content,
        generatedBy: response.provider,
        createdAt: new Date().toISOString()
      };

      res.json({
        success: response.success,
        plot,
        provider: response.provider,
        fallback: response.fallback
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

router.post(
  '/ai/generate-image',
  [
    body('prompt').trim().notEmpty().withMessage('图片描述不能为空'),
    body('type').optional().isIn(['avatar', 'cg']),
  ],
  async (req: Request, res: Response) => {
    if (!aiManager) {
      throw new BadRequestError('AI 服务未初始化');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('验证失败');
    }

    const { prompt, type = 'avatar' } = req.body;

    try {
      const imageSize = type === 'avatar' ? '400x400' : '800x600';
      const response = await aiManager.sendRequest({
        provider: 'qwen',
        messages: [
          { 
            role: 'system', 
            content: '你是一个专业的 AI 绘画提示词优化助手，擅长将简单的描述优化为详细的绘画提示词。' 
          },
          { 
            role: 'user', 
            content: `请优化以下图片生成提示词，使其更加详细、专业：\n\n${prompt}\n\n要求：包含风格、色彩、构图、光影等细节描述。` 
          }
        ],
        taskType: 'general',
        temperature: 0.7,
        maxTokens: 500
      });

      const optimizedPrompt = response.content;
      
      const imageUrl = `https://picsum.photos/${imageSize.replace('x', '/')}?random=${Date.now()}`;

      res.json({
        success: true,
        imageUrl,
        prompt: optimizedPrompt,
        originalPrompt: prompt,
        type,
        provider: 'placeholder',
        message: '当前使用占位图，实际项目中应调用真实 AI 绘画 API'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

router.use((req: Request) => {
  throw new BadRequestError(`API 路由 ${req.originalUrl} 不存在`);
});

export { router as apiRouter };
