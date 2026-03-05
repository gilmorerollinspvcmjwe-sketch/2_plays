import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue')
        },
        {
          path: 'creator',
          name: 'creator',
          component: () => import('@/views/creator/CreatorEntryView.vue'),
          meta: { title: '游戏开发' }
        },
        {
          path: 'creator/character',
          name: 'characterCreator',
          component: () => import('@/views/creator/CharacterCreator.vue'),
          meta: { title: '角色创建' }
        },
        {
          path: 'creator/plot',
          name: 'plotDesigner',
          component: () => import('@/views/creator/PlotDesigner.vue'),
          meta: { title: '剧情设计' }
        },
        {
          path: 'publish',
          name: 'publish',
          component: () => import('@/views/PublishView.vue')
        },
        {
          path: 'operation',
          name: 'operation',
          component: () => import('@/views/OperationView.vue')
        },
        {
          path: 'comments',
          name: 'comments',
          component: () => import('@/views/CommentsView.vue')
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue')
        },
        {
          path: 'points',
          name: 'points',
          component: () => import('@/views/PointsShop.vue')
        },
        {
          path: 'achievements',
          name: 'achievements',
          component: () => import('@/views/AchievementsView.vue')
        },
        {
          path: 'company-setup',
          name: 'companySetup',
          component: () => import('@/views/CompanySetupView.vue')
        },
        {
          path: 'game/:id',
          name: 'gameDetail',
          component: () => import('@/views/game/GameDetailView.vue')
        },
        {
          path: 'game/:gameId/character/:characterId',
          name: 'characterDetail',
          component: () => import('@/views/game/CharacterDetailView.vue')
        },
        {
          path: 'market',
          name: 'market',
          component: () => import('@/components/market/MarketDashboard.vue')
        },
        {
          path: 'creator/plot/editor',
          name: 'plotEditor',
          component: () => import('@/components/plot/PlotTreeEditor.vue')
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/AboutView.vue'),
          meta: { title: '关于我们' }
        },
        {
          path: 'project/:id',
          name: 'projectDetail',
          component: () => import('@/views/project/ProjectDetailView.vue'),
          meta: { title: '项目详情' }
        },
        {
          path: 'team-management',
          name: 'teamManagement',
          component: () => import('@/views/team/TeamManagementView.vue'),
          meta: { title: '团队管理' }
        },
        {
          path: 'recruit',
          name: 'recruit',
          component: () => import('@/views/team/RecruitView.vue'),
          meta: { title: '招聘员工' }
        },
        {
          path: 'character-ranking',
          name: 'characterRanking',
          component: () => import('@/views/character/CharacterRankingView.vue'),
          meta: { title: '角色价值排行' }
        },
        {
          path: 'plot-analysis/:id',
          name: 'plotAnalysis',
          component: () => import('@/views/plot/PlotAnalysisView.vue'),
          meta: { title: '剧情分析' }
        },
        {
          path: 'operation-impact',
          name: 'operationImpact',
          component: () => import('@/views/operation/OperationImpactView.vue'),
          meta: { title: '运营影响预测' }
        },
        {
          path: 'linkage-tracker',
          name: 'linkageTracker',
          component: () => import('@/views/operation/LinkageTrackerView.vue'),
          meta: { title: '联动效果追踪' }
        },
        {
          path: 'market-dashboard',
          name: 'marketDashboard',
          component: () => import('@/views/market/MarketDashboardView.vue'),
          meta: { title: '市场情报' }
        }
      ]
    }
  ]
})

export default router
