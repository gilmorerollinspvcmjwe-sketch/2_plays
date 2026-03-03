<template>
  <div class="resource-manager">
    <!-- 资源概览 -->
    <div class="resource-overview">
      <h3 class="section-title">💰 资源管理</h3>
      
      <!-- 资源卡片 -->
      <div class="resource-cards">
        <div class="resource-card gold">
          <div class="resource-icon">💰</div>
          <div class="resource-info">
            <span class="resource-value">{{ currentGame?.resources.gold || 0 }}</span>
            <span class="resource-name">金币</span>
          </div>
        </div>
        <div class="resource-card diamond">
          <div class="resource-icon">💎</div>
          <div class="resource-info">
            <span class="resource-value">{{ currentGame?.resources.diamond || 0 }}</span>
            <span class="resource-name">钻石</span>
          </div>
        </div>
        <div class="resource-card popularity">
          <div class="resource-icon">🔥</div>
          <div class="resource-info">
            <span class="resource-value">{{ currentGame?.resources.popularity || 0 }}</span>
            <span class="resource-name">人气</span>
          </div>
        </div>
        <div class="resource-card devpoints">
          <div class="resource-icon">⚡</div>
          <div class="resource-info">
            <span class="resource-value">{{ currentGame?.resources.devPoints || 0 }}</span>
            <span class="resource-name">开发点</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分配策略 -->
    <div class="strategy-section">
      <h4 class="subsection-title">📊 分配策略</h4>
      <div class="strategy-selector">
        <van-radio-group v-model="selectedStrategy" direction="horizontal">
          <van-radio name="conservative">
            <template #default>
              <div class="strategy-option">
                <span class="strategy-name">保守型</span>
                <span class="strategy-desc">稳扎稳打</span>
              </div>
            </template>
          </van-radio>
          <van-radio name="steady">
            <template #default>
              <div class="strategy-option">
                <span class="strategy-name">稳健型</span>
                <span class="strategy-desc">平衡发展</span>
              </div>
            </template>
          </van-radio>
          <van-radio name="aggressive">
            <template #default>
              <div class="strategy-option">
                <span class="strategy-name">激进型</span>
                <span class="strategy-desc">快速扩张</span>
              </div>
            </template>
          </van-radio>
        </van-radio-group>
      </div>
      
      <!-- 策略预览 -->
      <div v-if="strategyPreview.length > 0" class="strategy-preview">
        <div v-for="item in strategyPreview" :key="item.area" class="allocation-item">
          <span class="allocation-name">{{ item.area }}</span>
          <div class="allocation-bar">
            <div class="allocation-fill" :style="{ width: `${item.percentage}%` }"></div>
          </div>
          <span class="allocation-value">{{ item.amount }} ({{ item.percentage }}%)</span>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h4 class="subsection-title">⚡ 快捷操作</h4>
      <div class="action-buttons">
        <van-button 
          size="small" 
          type="primary"
          color="linear-gradient(to right, #FF69B4, #FFB6C1)"
          @click="handleDailyIncome"
          :loading="dailyIncomeLoading"
        >
          领取每日收入
        </van-button>
        <van-button 
          size="small" 
          plain
          @click="showHistory = true"
        >
          查看记录
        </van-button>
      </div>
    </div>

    <!-- 资源变动记录弹窗 -->
    <van-popup v-model:show="showHistory" position="bottom" round :style="{ height: '60%' }">
      <div class="history-popup">
        <div class="popup-header">
          <h3>资源变动记录</h3>
          <van-icon name="cross" @click="showHistory = false" />
        </div>
        
        <div class="history-filter">
          <van-tabs v-model:active="historyFilter" sticky>
            <van-tab title="全部" name="all"></van-tab>
            <van-tab title="金币" name="gold"></van-tab>
            <van-tab title="钻石" name="diamond"></van-tab>
            <van-tab title="人气" name="popularity"></van-tab>
            <van-tab title="开发点" name="devPoints"></van-tab>
          </van-tabs>
        </div>
        
        <div class="history-list">
          <van-empty v-if="filteredHistory.length === 0" description="暂无记录" />
          <div v-else class="history-items">
            <div 
              v-for="item in filteredHistory" 
              :key="item.id" 
              class="history-item"
              :class="item.type"
            >
              <div class="history-icon">
                {{ item.type === 'income' ? '📈' : '📉' }}
              </div>
              <div class="history-info">
                <div class="history-main">
                  <span class="history-resource">{{ getResourceName(item.resource) }}</span>
                  <span class="history-amount" :class="item.type">
                    {{ item.type === 'income' ? '+' : '-' }}{{ item.amount }}
                  </span>
                </div>
                <div class="history-sub">
                  <span class="history-reason">{{ item.reason }}</span>
                  <span class="history-time">{{ formatTime(item.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore, type ResourceStrategy, type GameResources } from '@/stores/gameStore';
import { showToast } from 'vant';

const gameStore = useGameStore();
const currentGame = computed(() => gameStore.currentGame);

const selectedStrategy = ref<ResourceStrategy>('steady');
const strategyPreview = ref<{ area: string; amount: number; percentage: number }[]>([]);
const showHistory = ref(false);
const historyFilter = ref('all');
const dailyIncomeLoading = ref(false);

// 监听策略变化，更新预览
watch(selectedStrategy, (newStrategy) => {
  const result = gameStore.applyResourceStrategy(newStrategy);
  if (result.success) {
    strategyPreview.value = result.allocations;
  }
}, { immediate: true });

// 过滤后的历史记录
const filteredHistory = computed(() => {
  const history = gameStore.getResourceHistory(undefined, 50);
  if (historyFilter.value === 'all') {
    return history;
  }
  return history.filter(h => h.resource === historyFilter.value);
});

// 获取资源名称
function getResourceName(resource: keyof GameResources): string {
  const map: Record<string, string> = {
    gold: '金币',
    diamond: '钻石',
    popularity: '人气',
    devPoints: '开发点'
  };
  return map[resource] || resource;
}

// 格式化时间
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 领取每日收入
async function handleDailyIncome() {
  dailyIncomeLoading.value = true;
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const result = gameStore.simulateDailyIncome();
  
  if (result.gold > 0) {
    showToast({
      message: `获得 ${result.gold}金币 ${result.devPoints}开发点 ${result.popularity}人气`,
      icon: 'success'
    });
  } else {
    showToast({
      message: '今日收入已领取',
      icon: 'warning'
    });
  }
  
  dailyIncomeLoading.value = false;
}
</script>

<style scoped lang="scss">
.resource-manager {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 16px 0;
}

.subsection-title {
  font-size: 14px;
  font-weight: bold;
  color: #666;
  margin: 16px 0 12px 0;
}

.resource-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.resource-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #f9f9f9;
  
  &.gold { border-left: 4px solid #FFD700; }
  &.diamond { border-left: 4px solid #00CED1; }
  &.popularity { border-left: 4px solid #FF6347; }
  &.devpoints { border-left: 4px solid #9370DB; }
}

.resource-icon {
  font-size: 28px;
}

.resource-info {
  display: flex;
  flex-direction: column;
}

.resource-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.resource-name {
  font-size: 12px;
  color: #999;
}

.strategy-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.strategy-selector {
  :deep(.van-radio-group) {
    justify-content: space-between;
  }
  
  :deep(.van-radio) {
    margin-right: 0;
  }
}

.strategy-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
}

.strategy-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.strategy-desc {
  font-size: 11px;
  color: #999;
}

.strategy-preview {
  margin-top: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.allocation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.allocation-name {
  width: 70px;
  font-size: 13px;
  color: #666;
}

.allocation-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.allocation-fill {
  height: 100%;
  background: linear-gradient(to right, #FF69B4, #FFB6C1);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.allocation-value {
  width: 100px;
  font-size: 12px;
  color: #999;
  text-align: right;
}

.quick-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

// 历史记录弹窗
.history-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    margin: 0;
    font-size: 16px;
  }
}

.history-filter {
  border-bottom: 1px solid #f0f0f0;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  
  &.income {
    border-left: 3px solid #07c160;
  }
  
  &.expense {
    border-left: 3px solid #ee0a24;
  }
}

.history-icon {
  font-size: 20px;
}

.history-info {
  flex: 1;
}

.history-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.history-resource {
  font-size: 14px;
  color: #333;
}

.history-amount {
  font-size: 14px;
  font-weight: bold;
  
  &.income {
    color: #07c160;
  }
  
  &.expense {
    color: #ee0a24;
  }
}

.history-sub {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-reason {
  font-size: 12px;
  color: #666;
}

.history-time {
  font-size: 11px;
  color: #999;
}
</style>
