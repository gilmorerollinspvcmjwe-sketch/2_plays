<template>
  <div class="operation-dashboard">
    <h3 class="section-title">运营数据</h3>
    
    <!-- 数据卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.dailyRevenue) }}</span>
          <span class="stat-label">今日收入</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.activePlayers) }}</span>
          <span class="stat-label">活跃玩家</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🎲</div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.totalDraws) }}</span>
          <span class="stat-label">总抽卡数</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🎪</div>
        <div class="stat-info">
          <span class="stat-value">{{ ongoingEvents.length }}</span>
          <span class="stat-label">进行中活动</span>
        </div>
      </div>
    </div>

    <!-- 声誉值 -->
    <div class="reputation-section">
      <div class="reputation-header">
        <span class="reputation-label">游戏声誉</span>
        <span class="reputation-emoji">{{ reputationEmoji }}</span>
      </div>
      <div class="reputation-bar">
        <div 
          class="reputation-fill" 
          :style="{ width: stats.reputation + '%', backgroundColor: reputationColor }"
        ></div>
      </div>
      <div class="reputation-value">{{ stats.reputation }}/100</div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <van-button 
        type="primary" 
        size="small" 
        round
        color="linear-gradient(to right, #FF69B4, #FFB6C1)"
        @click="$emit('create-pool')"
      >
        <template #icon>
          <van-icon name="plus" />
        </template>
        创建卡池
      </van-button>
      
      <van-button 
        type="primary" 
        size="small" 
        round
        color="linear-gradient(to right, #07c160, #10b981)"
        @click="$emit('create-event')"
      >
        <template #icon>
          <van-icon name="plus" />
        </template>
        创建活动
      </van-button>
      
      <van-button 
        type="warning" 
        size="small" 
        round
        @click="$emit('simulate-day')"
      >
        <template #icon>
          <van-icon name="clock-o" />
        </template>
        模拟一天
      </van-button>
    </div>

    <!-- 待处理事件提示 -->
    <div v-if="pendingIncidents.length > 0" class="incident-alert">
      <van-notice-bar
        left-icon="warning-o"
        color="#ee0a24"
        background="#ffe0e0"
        :text="`有 ${pendingIncidents.length} 个运营事件待处理`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OperationStats } from '@/stores/operationStore';

interface Props {
  stats: OperationStats;
  reputationEmoji: string;
  reputationColor: string;
  ongoingEvents: any[];
  pendingIncidents: any[];
}

defineProps<Props>();

defineEmits<{
  'create-pool': [];
  'create-event': [];
  'simulate-day': [];
}>();

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  return num.toString();
}
</script>

<style scoped lang="scss">
.operation-dashboard {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #FFF5F7, #FFE4E8);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 32px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.reputation-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 12px;
}

.reputation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reputation-label {
  font-size: 14px;
  color: #666;
}

.reputation-emoji {
  font-size: 24px;
}

.reputation-bar {
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.reputation-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.reputation-value {
  text-align: right;
  font-size: 12px;
  color: #999;
}

.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.incident-alert {
  margin-top: 8px;
}
</style>
