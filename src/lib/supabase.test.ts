/**
 * Supabase 数据库连接和 CRUD 操作测试示例
 * 
 * 使用方法：
 * 1. 确保已安装依赖：npm install @supabase/supabase-js
 * 2. 复制 .env.example 为 .env 并填入你的 Supabase 凭据
 * 3. 运行测试：npx tsx src/lib/supabase.test.ts
 */

import { supabase, dbOperations } from './supabase'

async function testConnection() {
  console.log('=== 测试数据库连接 ===')
  
  try {
    // 测试连接
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ 连接失败:', error.message)
      return false
    }
    
    console.log('✅ 数据库连接成功!')
    return true
  } catch (err) {
    console.error('❌ 连接错误:', err)
    return false
  }
}

async function testUserOperations() {
  console.log('\n=== 测试用户 CRUD 操作 ===')
  
  const testEmail = `test_${Date.now()}@example.com`
  
  try {
    // 1. 创建用户
    console.log('\n1. 创建用户...')
    const newUser = await dbOperations.createUser({
      email: testEmail,
      nickname: '测试用户'
    })
    console.log('✅ 创建用户成功:', newUser.nickname)
    
    // 2. 查询用户
    console.log('\n2. 查询用户...')
    const user = await dbOperations.getUserById(newUser.id)
    console.log('✅ 查询用户成功:', user.email)
    
    // 3. 更新用户
    console.log('\n3. 更新用户...')
    const updatedUser = await dbOperations.updateUser(newUser.id, {
      nickname: '更新后的昵称'
    })
    console.log('✅ 更新用户成功:', updatedUser.nickname)
    
    // 4. 删除用户
    console.log('\n4. 删除用户...')
    await dbOperations.deleteUser(newUser.id)
    console.log('✅ 删除用户成功')
    
    return true
  } catch (err) {
    console.error('❌ 用户操作测试失败:', err)
    return false
  }
}

async function testGameOperations() {
  console.log('\n=== 测试游戏 CRUD 操作 ===')
  
  // 首先创建一个测试用户
  const testEmail = `game_test_${Date.now()}@example.com`
  let userId: string
  
  try {
    const user = await dbOperations.createUser({
      email: testEmail,
      nickname: '游戏创作者'
    })
    userId = user.id
    console.log('✅ 创建测试用户成功')
    
    // 1. 创建游戏
    console.log('\n1. 创建游戏...')
    const newGame = await dbOperations.createGame({
      user_id: userId,
      title: '我的乙女游戏',
      description: '这是一个测试游戏描述',
      status: 'draft'
    })
    console.log('✅ 创建游戏成功:', newGame.title)
    
    // 2. 查询用户的游戏列表
    console.log('\n2. 查询用户的游戏列表...')
    const games = await dbOperations.getGamesByUserId(userId)
    console.log('✅ 查询成功，共', games.length, '个游戏')
    
    // 3. 更新游戏
    console.log('\n3. 更新游戏状态...')
    const updatedGame = await dbOperations.updateGame(newGame.id, {
      status: 'published'
    })
    console.log('✅ 更新游戏成功，状态:', updatedGame.status)
    
    // 4. 删除游戏
    console.log('\n4. 删除游戏...')
    await dbOperations.deleteGame(newGame.id)
    console.log('✅ 删除游戏成功')
    
    // 清理测试用户
    await dbOperations.deleteUser(userId)
    
    return true
  } catch (err) {
    console.error('❌ 游戏操作测试失败:', err)
    return false
  }
}

async function testCharacterOperations() {
  console.log('\n=== 测试角色 CRUD 操作 ===')
  
  let userId: string
  let gameId: string
  
  try {
    // 创建测试用户和游戏
    const user = await dbOperations.createUser({
      email: `char_test_${Date.now()}@example.com`,
      nickname: '角色创作者'
    })
    userId = user.id
    
    const game = await dbOperations.createGame({
      user_id: userId,
      title: '角色测试游戏',
      description: '测试',
      status: 'published'
    })
    gameId = game.id
    
    // 1. 创建角色
    console.log('\n1. 创建角色...')
    const newCharacter = await dbOperations.createCharacter({
      game_id: gameId,
      name: '李明',
      description: '阳光开朗的大学生',
      personality: '开朗、善良、有点傲娇',
      appearance: '黑色短发，棕色眼睛，身高 180cm',
      clothing: '休闲装，喜欢穿连帽衫'
    })
    console.log('✅ 创建角色成功:', newCharacter.name)
    
    // 2. 查询游戏角色列表
    console.log('\n2. 查询游戏角色列表...')
    const characters = await dbOperations.getCharactersByGameId(gameId)
    console.log('✅ 查询成功，共', characters.length, '个角色')
    
    // 3. 更新角色
    console.log('\n3. 更新角色信息...')
    const updatedCharacter = await dbOperations.updateCharacter(newCharacter.id, {
      personality: '开朗、善良、温柔'
    })
    console.log('✅ 更新角色成功，新性格:', updatedCharacter.personality)
    
    // 4. 删除角色
    console.log('\n4. 删除角色...')
    await dbOperations.deleteCharacter(newCharacter.id)
    console.log('✅ 删除角色成功')
    
    // 清理
    await dbOperations.deleteGame(gameId)
    await dbOperations.deleteUser(userId)
    
    return true
  } catch (err) {
    console.error('❌ 角色操作测试失败:', err)
    return false
  }
}

async function testPlotOperations() {
  console.log('\n=== 测试剧情 CRUD 操作 ===')
  
  let userId: string
  let gameId: string
  
  try {
    // 创建测试用户和游戏
    const user = await dbOperations.createUser({
      email: `plot_test_${Date.now()}@example.com`,
      nickname: '剧情创作者'
    })
    userId = user.id
    
    const game = await dbOperations.createGame({
      user_id: userId,
      title: '剧情测试游戏',
      description: '测试',
      status: 'published'
    })
    gameId = game.id
    
    // 1. 创建剧情
    console.log('\n1. 创建剧情...')
    const newPlot = await dbOperations.createPlot({
      game_id: gameId,
      title: '第一章：初遇',
      content: '在一个阳光明媚的下午，你在校园里遇到了他...',
      route_type: 'main',
      chapter_number: 1,
      scene_order: 1,
      branch_options: {
        options: [
          { id: 'a', text: '主动打招呼', next_scene: 2 },
          { id: 'b', text: '默默离开', next_scene: 3 }
        ]
      }
    })
    console.log('✅ 创建剧情成功:', newPlot.title)
    
    // 2. 查询游戏剧情列表
    console.log('\n2. 查询游戏剧情列表...')
    const plots = await dbOperations.getPlotsByGameId(gameId)
    console.log('✅ 查询成功，共', plots.length, '个剧情')
    
    // 3. 更新剧情
    console.log('\n3. 更新剧情内容...')
    const updatedPlot = await dbOperations.updatePlot(newPlot.id, {
      content: '在一个阳光明媚的下午，你在图书馆遇到了他...'
    })
    console.log('✅ 更新剧情成功')
    
    // 4. 删除剧情
    console.log('\n4. 删除剧情...')
    await dbOperations.deletePlot(newPlot.id)
    console.log('✅ 删除剧情成功')
    
    // 清理
    await dbOperations.deleteGame(gameId)
    await dbOperations.deleteUser(userId)
    
    return true
  } catch (err) {
    console.error('❌ 剧情操作测试失败:', err)
    return false
  }
}

async function testCommentOperations() {
  console.log('\n=== 测试评论 CRUD 操作 ===')
  
  let userId1: string
  let userId2: string
  let gameId: string
  
  try {
    // 创建测试用户和游戏
    const user1 = await dbOperations.createUser({
      email: `comment_test1_${Date.now()}@example.com`,
      nickname: '评论者 1'
    })
    userId1 = user1.id
    
    const user2 = await dbOperations.createUser({
      email: `comment_test2_${Date.now()}@example.com`,
      nickname: '评论者 2'
    })
    userId2 = user2.id
    
    const game = await dbOperations.createGame({
      user_id: userId1,
      title: '评论测试游戏',
      description: '测试',
      status: 'published'
    })
    gameId = game.id
    
    // 1. 创建评论
    console.log('\n1. 创建评论...')
    const newComment = await dbOperations.createComment({
      game_id: gameId,
      user_id: userId2,
      content: '这个游戏很有趣！',
      rating: 5,
      sentiment: 'positive'
    })
    console.log('✅ 创建评论成功，评分:', newComment.rating)
    
    // 2. 查询游戏评论列表
    console.log('\n2. 查询游戏评论列表...')
    const comments = await dbOperations.getCommentsByGameId(gameId)
    console.log('✅ 查询成功，共', comments.length, '条评论')
    
    // 3. 更新评论
    console.log('\n3. 更新评论...')
    const updatedComment = await dbOperations.updateComment(newComment.id, {
      content: '这个游戏非常有趣，强烈推荐！'
    })
    console.log('✅ 更新评论成功')
    
    // 4. 删除评论
    console.log('\n4. 删除评论...')
    await dbOperations.deleteComment(newComment.id)
    console.log('✅ 删除评论成功')
    
    // 清理
    await dbOperations.deleteGame(gameId)
    await dbOperations.deleteUser(userId1)
    await dbOperations.deleteUser(userId2)
    
    return true
  } catch (err) {
    console.error('❌ 评论操作测试失败:', err)
    return false
  }
}

async function testAnalyticsOperations() {
  console.log('\n=== 测试统计数据 CRUD 操作 ===')
  
  let userId: string
  let gameId: string
  
  try {
    // 创建测试用户和游戏
    const user = await dbOperations.createUser({
      email: `analytics_test_${Date.now()}@example.com`,
      nickname: '数据分析师'
    })
    userId = user.id
    
    const game = await dbOperations.createGame({
      user_id: userId,
      title: '数据分析测试游戏',
      description: '测试',
      status: 'published'
    })
    gameId = game.id
    
    // 1. 创建统计数据
    console.log('\n1. 创建统计数据...')
    const today = new Date().toISOString().split('T')[0]
    const newAnalytic = await dbOperations.createAnalytics({
      game_id: gameId,
      metrics: 'play_count',
      value: 100,
      date: today
    })
    console.log('✅ 创建统计数据成功:', newAnalytic.metrics, '=', newAnalytic.value)
    
    // 2. 查询游戏统计数据
    console.log('\n2. 查询游戏统计数据...')
    const analytics = await dbOperations.getAnalyticsByGameId(gameId)
    console.log('✅ 查询成功，共', analytics.length, '条记录')
    
    // 3. 更新统计数据
    console.log('\n3. 更新统计数据...')
    const updatedAnalytic = await dbOperations.updateAnalytics(newAnalytic.id, {
      value: 150
    })
    console.log('✅ 更新统计数据成功，新值:', updatedAnalytic.value)
    
    // 4. 删除统计数据
    console.log('\n4. 删除统计数据...')
    await dbOperations.deleteAnalytics(newAnalytic.id)
    console.log('✅ 删除统计数据成功')
    
    // 清理
    await dbOperations.deleteGame(gameId)
    await dbOperations.deleteUser(userId)
    
    return true
  } catch (err) {
    console.error('❌ 统计数据操作测试失败:', err)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 开始运行 Supabase CRUD 操作测试\n')
  console.log('===========================================')
  
  // 测试连接
  const isConnected = await testConnection()
  if (!isConnected) {
    console.log('\n❌ 数据库连接失败，请检查环境配置')
    return
  }
  
  // 运行所有测试
  const results = {
    '用户操作': await testUserOperations(),
    '游戏操作': await testGameOperations(),
    '角色操作': await testCharacterOperations(),
    '剧情操作': await testPlotOperations(),
    '评论操作': await testCommentOperations(),
    '统计数据操作': await testAnalyticsOperations()
  }
  
  // 输出测试结果
  console.log('\n===========================================')
  console.log('📊 测试结果汇总:')
  console.log('===========================================')
  
  for (const [test, passed] of Object.entries(results)) {
    const icon = passed ? '✅' : '❌'
    console.log(`${icon} ${test}: ${passed ? '通过' : '失败'}`)
  }
  
  const allPassed = Object.values(results).every(r => r)
  console.log('\n===========================================')
  if (allPassed) {
    console.log('🎉 所有测试通过!')
  } else {
    console.log('⚠️  部分测试失败，请检查错误信息')
  }
  console.log('===========================================')
}

// 运行测试
runAllTests().catch(console.error)
