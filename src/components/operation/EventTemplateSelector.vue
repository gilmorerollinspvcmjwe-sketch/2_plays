<template>
  <div class="event-template-selector">
    <!-- 类型筛选 -->
    <div class="type-filter">
      <van-tabs v-model:active="activeType" sticky swipeable>
        <van-tab title="全部" name="all">
          <template #title>
            <div class="tab-title">
              <span class="tab-icon">📋</span>
              <span>全部</span>
            </div>
          </template>
        </van-tab>
        <van-tab title="节日" name="festival">
          <template #title>
            <div class="tab-title">
              <span class="tab-icon">🎉</span>
              <span>节日</span>
            </div>
          </template>
        </van-tab>
        <van-tab title="生日" name="birthday">
          <template #title>
            <div class="tab-title">
              <span class="tab-icon">🎂</span>
              <span>生日</span>
            </div>
          </template>
        </van-tab>
        <van-tab title="联动" name="collaboration">
          <template #title>
            <div class="tab-title">
              <span class="tab-icon">🤝</span>
              <span>联动</span>
            </div>
          </template>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 模板列表 -->
    <div class="template-list">
      <van-empty v-if="filteredTemplates.length === 0" description="暂无模板" />
      
      <div v-else class="template-cards">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="template-card"
          @click="selectTemplate(template)"
        >
          <div class="card-header">
            <div class="template-type-badge" :style="{ backgroundColor: getTypeColor(template.type) }">
              {{ getTypeName(template.type) }}
            </div>
            <div class="template-budget" :class="`budget-${template.budget}`">
              {{ template.budget }}预算
            </div>
          </div>
          
          <h4 class="template-name">{{ template.name }}</h4>
          <p class="template-description">{{ template.description }}</p>
          
          <div class="template-meta">
            <span class="meta-item">
              <van-icon name="clock-o" />
              {{ template.duration }}天
            </span>
            <span class="meta-item">
              <van-icon name="gift-o" />
              {{ template.rewards.length }}项奖励
            </span>
          </div>
          
          <div class="template-rewards">
            <van-tag
              v-for="(reward, index) in template.rewards.slice(0, 3)"
              :key="index"
              plain
              size="mini"
              type="primary"
            >
              {{ reward }}
            </van-tag>
            <van-tag v-if="template.rewards.length > 3" plain size="mini">+{{ template.rewards.length - 3 }}</van-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 模板详情弹窗 -->
    <van-popup v-model:show="showDetail" position="bottom" round :style="{ height: '70%' }">
      <div class="template-detail" v-if="selectedTemplate">
        <div class="detail-header">
          <h3>{{ selectedTemplate.name }}</h3>
          <van-icon name="cross" @click="showDetail = false" />
        </div>
        
        <div class="detail-content">
          <div class="detail-type">
            <van-tag :color="getTypeColor(selectedTemplate.type)" size="medium">
              {{ getTypeName(selectedTemplate.type) }}
            </van-tag>
            <van-tag :type="getBudgetType(selectedTemplate.budget)" size="medium">
              {{ selectedTemplate.budget }}预算
            </van-tag>
          </div>
          
          <p class="detail-description">{{ selectedTemplate.description }}</p>
          
          <div class="detail-section">
            <h4>⏱️ 活动时长</h4>
            <p>{{ selectedTemplate.duration }} 天</p>
          </div>
          
          <div class="detail-section">
            <h4>🎁 活动奖励</h4>
            <div class="rewards-list">
              <van-tag
                v-for="(reward, index) in selectedTemplate.rewards"
                :key="index"
                plain
                size="small"
                type="primary"
              >
                {{ reward }}
              </van-tag>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>🎮 玩法机制</h4>
            <ul class="mechanics-list">
              <li v-for="(mechanic, index) in selectedTemplate.mechanics" :key="index">
                {{ mechanic }}
              </li>
            </ul>
          </div>
          
          <!-- 预期效果 -->
          <div class="detail-section expected-impact" v-if="expectedImpact">
            <h4>📊 预期效果</h4>
            <div class="impact-stats">
              <div class="impact-item">
                <span class="impact-label">参与人数</span>
                <span class="impact-value">{{ expectedImpact.expectedParticipants }}</span>
              </div>
              <div class="impact-item">
                <span class="impact-label">预期收入</span>
                <span class="impact-value">{{ expectedImpact.expectedRevenue }}</span>
              </div>
              <div class="impact-item">
                <span class="impact-label">声誉变化</span>
                <span class="impact-value" :class="expectedImpact.reputationChange > 0 ? 'positive' : 'negative'">
                  {{ expectedImpact.reputationChange > 0 ? '+' : '' }}{{ expectedImpact.reputationChange }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-actions">
          <van-button 
            block 
            round 
            type="primary"
            color="linear-gradient(to right, #FF69B4, #FFB6C1)"
            @click="createFromTemplate"
            :loading="creating"
          >
            使用此模板创建活动
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useOperationStore } from '@/stores/operationStore';
import type { EventTemplate, EventType, BudgetLevel } from '@/types/template';
import { showToast } from 'vant';

const operationStore = useOperationStore();

const activeType = ref('all');
const showDetail = ref(false);
const selectedTemplate = ref<EventTemplate | null>(null);
const creating = ref(false);
const expectedImpact = ref<{ expectedParticipants: number; expectedRevenue: number; reputationChange: number } | null>(null);

// 所有模板
const allTemplates = computed(() => {
  return operationStore.getEventTemplates();
});

// 过滤后的模板
const filteredTemplates = computed(() => {
  if (activeType.value === 'all') {
    return allTemplates.value;
  }
  return operationStore.getEventTemplates(activeType.value as EventType);
});

// 监听选中模板变化，计算预期效果
watch(selectedTemplate, (template) => {
  if (template) {
    // 创建一个临时事件对象用于计算
    const tempEvent = {
      id: 'temp',
      type: template.type,
      name: template.name,
      description: template.description,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + template.duration * 86400000).toISOString(),
      rewards: template.rewards,
      mechanics: template.mechanics,
      budget: template.budget as BudgetLevel,
      participants: 0,
      status: 'upcoming' as const
    };
    expectedImpact.value = operationStore.calculateEventImpact(tempEvent);
  } else {
    expectedImpact.value = null;
  }
});

function getTypeName(type: EventType): string {
  const map: Record<EventType, string> = {
    festival: '节日活动',
    birthday: '角色生日',
    collaboration: '联动活动'
  };
  return map[type];
}

function getTypeColor(type: EventType): string {
  const map: Record<EventType, string> = {
    festival: '#FF69B4',
    birthday: '#FFB6C1',
    collaboration: '#DDA0DD'
  };
  return map[type];
}

function getBudgetType(budget: string): string {
  const map: Record<string, string> = {
    '低': 'success',
    '中': 'warning',
    '高': 'danger'
  };
  return map[budget] || 'default';
}

function selectTemplate(template: EventTemplate) {
  selectedTemplate.value = template;
  showDetail.value = true;
}

async function createFromTemplate() {
  if (!selectedTemplate.value) return;
  
  creating.value = true;
  
  const result = await operationStore.createEventFromTemplate(selectedTemplate.value);
  
  if (result.success) {
    showToast({
      message: '活动创建成功',
      icon: 'success'
    });
    showDetail.value = false;
    selectedTemplate.value = null;
  } else {
    showToast({
      message: result.message,
      icon: 'fail'
    });
  }
  
  creating.value = false;
}
</script>

<style scoped lang="scss">
.event-template-selector {
  background: #f5f5f5;
  min-height: 100%;
}

.type-filter {
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.tab-icon {
  font-size: 16px;
}

.template-list {
  padding: 12px;
}

.template-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.template-type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: bold;
}

.template-budget {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  
  &.budget-低 {
    background: #e8f5e9;
    color: #4caf50;
  }
  
  &.budget-中 {
    background: #fff3e0;
    color: #ff9800;
  }
  
  &.budget-高 {
    background: #ffebee;
    color: #f44336;
  }
}

.template-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
}

.template-description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.template-rewards {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

// 详情弹窗
.template-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    margin: 0;
    font-size: 18px;
  }
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.detail-type {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 20px;
  
  h4 {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 13px;
    color: #666;
    margin: 0;
  }
}

.rewards-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mechanics-list {
  margin: 0;
  padding-left: 20px;
  
  li {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
  }
}

.expected-impact {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
}

.impact-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.impact-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.impact-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.impact-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  
  &.positive {
    color: #07c160;
  }
  
  &.negative {
    color: #ee0a24;
  }
}

.detail-actions {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
