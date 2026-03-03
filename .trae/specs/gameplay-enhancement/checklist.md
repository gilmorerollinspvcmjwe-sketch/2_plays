# Checklist

## 阶段一：操作反馈动画增强

- [x] CelebrationAnimation.vue 组件创建完成，支持烟花动画效果
- [x] AchievementPopup.vue 组件创建完成，显示成就名称和积分奖励
- [x] PopularityRise.vue 组件创建完成，显示人气上升动画
- [x] MilestoneToast.vue 组件创建完成，显示里程碑达成提示
- [x] 游戏发布成功时触发烟花动画
- [x] 成就解锁时显示徽章弹出动画
- [x] 角色人气上升超过10点时显示上升动画

## 阶段二：里程碑与生日系统

- [x] gameStore.ts 包含里程碑数据结构和计算方法
- [x] MilestoneCard.vue 组件显示5类里程碑进度
- [x] GameDetailView.vue 包含里程碑展示区域
- [x] 里程碑达成时发放积分奖励
- [x] Character 接口包含 birthday 字段
- [x] CharacterCreator.vue 包含生日设置步骤
- [x] 生日当天触发生日提醒通知
- [x] 生日限定卡池正常开放
- [x] 生日礼物赠送功能正常工作

## 阶段三：亲密度与约会系统

- [x] gameStore.ts 包含亲密度数据和方法
- [x] IntimacyBar.vue 显示亲密度等级和进度
- [x] 每日互动增加亲密度
- [x] 送礼物增加亲密度
- [x] 亲密度达到3/5/7/10级时解锁对应内容
- [x] DateScene.vue 约会场景组件创建完成
- [x] 约会对话选项影响亲密度
- [x] 约会结束后获得奖励

## 阶段四：榜单与评分系统

- [x] 游戏评分计算逻辑正确（角色40%+剧情30%+运营20%+爆率10%）
- [x] RatingDisplay.vue 显示1.0-5.0评分
- [x] leaderboardStore.ts 管理榜单数据
- [x] BestsellerList.vue 显示前10名畅销游戏
- [x] PopularityRanking.vue 显示前20名角色
- [x] HomeView.vue 包含榜单展示区域

## 阶段五：社交功能

- [x] confessionStore.ts 管理告白数据
- [x] ConfessionWall.vue 显示告白列表
- [x] 发布告白消耗10积分
- [x] 告白点赞增加热度
- [x] fanCreationStore.ts 管理同人创作数据
- [x] FanCreationSquare.vue 显示同人作品
- [x] 同人创作消耗对应积分
- [x] 同人点赞给创作者积分奖励

## 阶段六：成就与称号系统

- [x] 新增里程碑、人气相关成就
- [x] AchievementWall.vue 显示成就墙
- [x] 称号系统数据结构完整
- [x] TitleSelector.vue 称号选择器
- [x] 称号显示在个人主页

## 阶段七：签到系统增强

- [x] 连续签到奖励递增逻辑正确
- [x] SignInCalendar.vue 显示月度签到日历
- [x] 第7天奖励包含随机礼物
