import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, optionalAuth, generateToken, AuthRequest } from '../middleware/auth';
import { BadRequestError, UnauthorizedError } from '../middleware/errorHandler';

const router = Router();

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

router.use((req, res) => {
  throw new BadRequestError(`API 路由 ${req.originalUrl} 不存在`);
});

export { router as apiRouter };
