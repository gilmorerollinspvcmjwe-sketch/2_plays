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
          component: () => import('@/views/creator/CharacterCreator.vue')
        },
        {
          path: 'creator/plot',
          name: 'plot',
          component: () => import('@/views/creator/PlotDesigner.vue')
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
        }
      ]
    }
  ]
})

export default router
