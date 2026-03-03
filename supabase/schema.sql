-- ============================================
-- Supabase 数据库初始化脚本
-- 乙女游戏创作模拟器 - 数据库架构
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 用户表 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 添加索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- 添加评论
COMMENT ON TABLE users IS '用户信息表';
COMMENT ON COLUMN users.id IS '用户唯一标识';
COMMENT ON COLUMN users.email IS '用户邮箱';
COMMENT ON COLUMN users.nickname IS '用户昵称';
COMMENT ON COLUMN users.avatar_url IS '用户头像 URL';
COMMENT ON COLUMN users.created_at IS '创建时间';

-- ============================================
-- 2. 游戏表 (games)
-- ============================================
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 添加索引
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_at ON games(created_at DESC);
CREATE INDEX idx_games_title ON games(title);

-- 添加评论
COMMENT ON TABLE games IS '游戏项目表';
COMMENT ON COLUMN games.id IS '游戏唯一标识';
COMMENT ON COLUMN games.user_id IS '创作者用户 ID';
COMMENT ON COLUMN games.title IS '游戏标题';
COMMENT ON COLUMN games.description IS '游戏描述';
COMMENT ON COLUMN games.cover_image_url IS '封面图片 URL';
COMMENT ON COLUMN games.status IS '游戏状态：draft-草稿，published-已发布，archived-已归档';
COMMENT ON COLUMN games.play_count IS '游玩次数';
COMMENT ON COLUMN games.like_count IS '点赞次数';
COMMENT ON COLUMN games.created_at IS '创建时间';
COMMENT ON COLUMN games.updated_at IS '更新时间';

-- ============================================
-- 3. 角色表 (characters)
-- ============================================
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  personality TEXT,
  appearance TEXT,
  clothing TEXT,
  character_type VARCHAR(50) DEFAULT 'main' CHECK (character_type IN ('main', 'supporting', 'minor')),
  image_url VARCHAR(500),
  voice_actor VARCHAR(100),
  age INTEGER,
  birthday DATE,
  blood_type VARCHAR(10),
  zodiac_sign VARCHAR(20),
  hobby TEXT,
  favorite TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 添加索引
CREATE INDEX idx_characters_game_id ON characters(game_id);
CREATE INDEX idx_characters_name ON characters(name);
CREATE INDEX idx_characters_type ON characters(character_type);

-- 添加评论
COMMENT ON TABLE characters IS '游戏角色表';
COMMENT ON COLUMN characters.id IS '角色唯一标识';
COMMENT ON COLUMN characters.game_id IS '所属游戏 ID';
COMMENT ON COLUMN characters.name IS '角色名称';
COMMENT ON COLUMN characters.description IS '角色描述';
COMMENT ON COLUMN characters.personality IS '性格特点';
COMMENT ON COLUMN characters.appearance IS '外貌特征';
COMMENT ON COLUMN characters.clothing IS '服装风格';
COMMENT ON COLUMN characters.character_type IS '角色类型：main-主角，supporting-配角，minor-次要角色';
COMMENT ON COLUMN characters.image_url IS '角色图片 URL';
COMMENT ON COLUMN characters.voice_actor IS '声优';
COMMENT ON COLUMN characters.age IS '年龄';
COMMENT ON COLUMN characters.birthday IS '生日';
COMMENT ON COLUMN characters.blood_type IS '血型';
COMMENT ON COLUMN characters.zodiac_sign IS '星座';
COMMENT ON COLUMN characters.hobby IS '爱好';
COMMENT ON COLUMN characters.favorite IS '喜好';
COMMENT ON COLUMN characters.created_at IS '创建时间';
COMMENT ON COLUMN characters.updated_at IS '更新时间';

-- ============================================
-- 4. 剧情表 (plots)
-- ============================================
CREATE TABLE IF NOT EXISTS plots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  route_type VARCHAR(50) DEFAULT 'main' CHECK (route_type IN ('main', 'branch', 'special', 'ending')),
  route_id VARCHAR(100),
  chapter_number INTEGER,
  scene_order INTEGER,
  branch_options JSONB,
  requirements JSONB,
  unlock_conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 添加索引
CREATE INDEX idx_plots_game_id ON plots(game_id);
CREATE INDEX idx_plots_route_type ON plots(route_type);
CREATE INDEX idx_plots_chapter ON plots(chapter_number);
CREATE INDEX idx_plots_route_id ON plots(route_id);

-- 添加评论
COMMENT ON TABLE plots IS '游戏剧情表';
COMMENT ON COLUMN plots.id IS '剧情唯一标识';
COMMENT ON COLUMN plots.game_id IS '所属游戏 ID';
COMMENT ON COLUMN plots.title IS '剧情标题';
COMMENT ON COLUMN plots.content IS '剧情内容';
COMMENT ON COLUMN plots.route_type IS '路线类型：main-主线，branch-分支，special-特殊，ending-结局';
COMMENT ON COLUMN plots.route_id IS '路线 ID';
COMMENT ON COLUMN plots.chapter_number IS '章节编号';
COMMENT ON COLUMN plots.scene_order IS '场景顺序';
COMMENT ON COLUMN plots.branch_options IS '分支选项 (JSON 格式)';
COMMENT ON COLUMN plots.requirements IS '前置要求 (JSON 格式)';
COMMENT ON COLUMN plots.unlock_conditions IS '解锁条件 (JSON 格式)';
COMMENT ON COLUMN plots.created_at IS '创建时间';
COMMENT ON COLUMN plots.updated_at IS '更新时间';

-- ============================================
-- 5. 评论表 (comments)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  sentiment VARCHAR(20) DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0,
  is_spoiler BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 添加索引
CREATE INDEX idx_comments_game_id ON comments(game_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_rating ON comments(rating);
CREATE INDEX idx_comments_sentiment ON comments(sentiment);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- 添加评论
COMMENT ON TABLE comments IS '游戏评论表';
COMMENT ON COLUMN comments.id IS '评论唯一标识';
COMMENT ON COLUMN comments.game_id IS '所属游戏 ID';
COMMENT ON COLUMN comments.user_id IS '评论者用户 ID';
COMMENT ON COLUMN comments.content IS '评论内容';
COMMENT ON COLUMN comments.rating IS '评分 (1-5)';
COMMENT ON COLUMN comments.sentiment IS '情感倾向：positive-正面，neutral-中性，negative-负面';
COMMENT ON COLUMN comments.parent_id IS '父评论 ID (用于回复)';
COMMENT ON COLUMN comments.like_count IS '点赞次数';
COMMENT ON COLUMN comments.is_spoiler IS '是否包含剧透';
COMMENT ON COLUMN comments.created_at IS '创建时间';
COMMENT ON COLUMN comments.updated_at IS '更新时间';

-- ============================================
-- 6. 数据表 (analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  metrics VARCHAR(100) NOT NULL,
  value NUMERIC NOT NULL,
  date DATE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 添加索引
CREATE INDEX idx_analytics_game_id ON analytics(game_id);
CREATE INDEX idx_analytics_metrics ON analytics(metrics);
CREATE INDEX idx_analytics_date ON analytics(date DESC);
CREATE INDEX idx_analytics_game_date ON analytics(game_id, date DESC);

-- 添加评论
COMMENT ON TABLE analytics IS '游戏数据统计表';
COMMENT ON COLUMN analytics.id IS '统计记录唯一标识';
COMMENT ON COLUMN analytics.game_id IS '所属游戏 ID';
COMMENT ON COLUMN analytics.metrics IS '指标名称 (如：play_count, like_count, comment_count, completion_rate 等)';
COMMENT ON COLUMN analytics.value IS '指标值';
COMMENT ON COLUMN analytics.date IS '统计日期';
COMMENT ON COLUMN analytics.metadata IS '附加元数据 (JSON 格式)';
COMMENT ON COLUMN analytics.created_at IS '创建时间';

-- ============================================
-- 7. 创建更新时间触发器函数
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要 updated_at 的表添加触发器
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plots_updated_at
  BEFORE UPDATE ON plots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. Row Level Security (RLS) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- ===== Users 表 RLS 策略 =====

-- 允许用户查看自己的信息
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 允许用户更新自己的信息
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- 允许所有认证用户查看其他用户的基本信息（用于显示评论者等）
CREATE POLICY "Authenticated users can view other users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- ===== Games 表 RLS 策略 =====

-- 允许所有用户查看已发布的游戏
CREATE POLICY "Anyone can view published games"
  ON games FOR SELECT
  USING (status = 'published');

-- 允许用户查看自己的所有游戏（包括草稿）
CREATE POLICY "Users can view own games"
  ON games FOR SELECT
  USING (auth.uid() = user_id);

-- 允许用户创建游戏
CREATE POLICY "Users can create games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的游戏
CREATE POLICY "Users can update own games"
  ON games FOR UPDATE
  USING (auth.uid() = user_id);

-- 允许用户删除自己的游戏
CREATE POLICY "Users can delete own games"
  ON games FOR DELETE
  USING (auth.uid() = user_id);

-- ===== Characters 表 RLS 策略 =====

-- 允许查看已发布游戏中的角色
CREATE POLICY "Anyone can view characters in published games"
  ON characters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = characters.game_id
      AND games.status = 'published'
    )
  );

-- 允许用户查看自己游戏中的角色
CREATE POLICY "Users can view own characters"
  ON characters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = characters.game_id
      AND games.user_id = auth.uid()
    )
  );

-- 允许用户为自已的游戏创建角色
CREATE POLICY "Users can create characters for own games"
  ON characters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = characters.game_id
      AND games.user_id = auth.uid()
    )
  );

-- 允许用户更新自己游戏中的角色
CREATE POLICY "Users can update own characters"
  ON characters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = characters.game_id
      AND games.user_id = auth.uid()
    )
  );

-- 允许用户删除自己游戏中的角色
CREATE POLICY "Users can delete own characters"
  ON characters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = characters.game_id
      AND games.user_id = auth.uid()
    )
  );

-- ===== Plots 表 RLS 策略 =====

-- 允许查看已发布游戏中的剧情
CREATE POLICY "Anyone can view plots in published games"
  ON plots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = plots.game_id
      AND games.status = 'published'
    )
  );

-- 允许用户查看自己游戏中的剧情
CREATE POLICY "Users can view own plots"
  ON plots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = plots.game_id
      AND games.user_id = auth.uid()
    )
  );

-- 允许用户为自已的游戏创建剧情
CREATE POLICY "Users can create plots for own games"
  ON plots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = plots.game_id
      AND games.user_id = auth.uid()
    )
  );

-- 允许用户更新自己游戏中的剧情
CREATE POLICY "Users can update own plots"
  ON plots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = plots.game_id
      AND games.user_id = auth.uid()
    )
  );

-- 允许用户删除自己游戏中的剧情
CREATE POLICY "Users can delete own plots"
  ON plots FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = plots.game_id
      AND games.user_id = auth.uid()
    )
  );

-- ===== Comments 表 RLS 策略 =====

-- 允许查看所有评论（用于公开显示）
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

-- 允许认证用户创建评论
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的评论
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- 允许用户删除自己的评论
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- ===== Analytics 表 RLS 策略 =====

-- 允许游戏创建者查看自己游戏的统计数据
CREATE POLICY "Users can view own game analytics"
  ON analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = analytics.game_id
      AND games.user_id = auth.uid()
    )
  );

-- 允许游戏创建者插入统计数据
CREATE POLICY "Users can insert own game analytics"
  ON analytics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = analytics.game_id
      AND games.user_id = auth.uid()
    )
  );

-- 允许游戏创建者更新自己游戏的统计数据
CREATE POLICY "Users can update own game analytics"
  ON analytics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = analytics.game_id
      AND games.user_id = auth.uid()
    )
  );

-- 允许游戏创建者删除自己游戏的统计数据
CREATE POLICY "Users can delete own game analytics"
  ON analytics FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = analytics.game_id
      AND games.user_id = auth.uid()
    )
  );

-- ============================================
-- 9. 示例数据（可选）
-- ============================================

-- 插入示例用户
-- INSERT INTO users (email, nickname, avatar_url) VALUES
--   ('demo@example.com', 'Demo User', 'https://example.com/avatar.png');

-- 插入示例游戏
-- INSERT INTO games (user_id, title, description, status) VALUES
--   ('<user-id>', '我的乙女游戏', '这是一个示例游戏描述', 'published');

-- ============================================
-- 10. 视图（Views）
-- ============================================

-- 游戏统计视图
CREATE OR REPLACE VIEW game_stats AS
SELECT
  g.id,
  g.title,
  g.status,
  COUNT(DISTINCT c.id) AS character_count,
  COUNT(DISTINCT p.id) AS plot_count,
  COUNT(DISTINCT cm.id) AS comment_count,
  AVG(cm.rating) AS average_rating
FROM games g
LEFT JOIN characters c ON c.game_id = g.id
LEFT JOIN plots p ON p.game_id = g.id
LEFT JOIN comments cm ON cm.game_id = g.id
GROUP BY g.id, g.title, g.status;

-- 热门游戏视图
CREATE OR REPLACE VIEW popular_games AS
SELECT
  g.*,
  COUNT(DISTINCT cm.id) AS comment_count,
  COUNT(DISTINCT c.id) AS character_count
FROM games g
LEFT JOIN comments cm ON cm.game_id = g.id
LEFT JOIN characters c ON c.game_id = g.id
WHERE g.status = 'published'
GROUP BY g.id
ORDER BY g.play_count DESC, g.like_count DESC, comment_count DESC
LIMIT 20;

-- ============================================
-- 完成提示
-- ============================================
-- 数据库架构创建完成！
-- 请在 Supabase 控制台中执行此 SQL 脚本来初始化数据库。
