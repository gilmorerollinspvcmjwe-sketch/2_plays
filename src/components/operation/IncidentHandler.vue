<template>
  <div class="incident-handler">
    <!-- 待处理事件提醒 -->
    <div v-if="pendingIncidents.length > 0" class="pending-alert">
      <van-notice-bar
        left-icon="warning-o"
        :text="`有 ${pendingIncidents.length} 个运营事件待处理！`"
        color="#ee0a24"
        background="#ffe0e0"
        mode="closeable"
      />
    </div>

    <!-- 事件列表 -->
    <div class="incident-list">
      <van-empty v-if="allIncidents.length === 0" description="暂无运营事件" />
      
      <div v-else class="incident-cards">
        <div
          v-for="incident in allIncidents"
          :key="incident.id"
          class="incident-card"
          :class="{ 'is-pending': incident.status === 'pending', 'is-resolved': incident.status === 'resolved' }"
          @click="handleIncidentClick(incident)"
        >
          <div class="card-header">
            <div class="incident-type">
              <span class="type-icon">{{ getIncidentIcon(incident.type) }}</span>
              <span class="type-name">{{ getIncidentTypeName(incident.type) }}</span>
            </div>
            <div class="incident-badges">
              <van-tag :type="getSeverityType(incident.severity)" size="small">
                {{ incident.severity }}
              </van-tag>
              <van-tag :type="getStatusType(incident.status)" size="small" plain>
                {{ getStatusLabel(incident.status) }}
              </van-tag>
            </div>
          </div>
          
          <h4 class="incident-name">{{ incident.name }}</h4>
          <p class="incident-description">{{ incident.description }}</p>
          
          <div class="incident-meta">
            <span class="meta-time">
              <van-icon name="clock-o" />
              {{ formatTime(incident.createdAt) }}
            </span>
            <span v-if="incident.resolvedAt" class="meta-resolved">
              已解决
            </span>
          </div>
          
          <!-- 已解决显示处理方案 -->
          <div v-if="incident.status === 'resolved' && incident.selectedSolution" class="resolved-solution">
            <van-tag type="success" size="small">
              处理方案: {{ incident.selectedSolution.action }}
            </van-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 事件处理弹窗 -->
    <van-popup v-model:show="showHandleDialog" position="bottom" round :style="{ height: '75%' }">
      <div class="handle-dialog" v-if="selectedIncident">
        <div class="dialog-header">
          <h3>{{ selectedIncident.name }}</h3>
          <van-icon name="cross" @click="showHandleDialog = false" />
        </div>
        
        <div class="dialog-content">
          <!-- 事件信息 -->
          <div class="info-section">
            <div class="info-tags">
              <van-tag :type="getSeverityType(selectedIncident.severity)">
                {{ selectedIncident.severity }}严重
              </van-tag>
              <van-tag :type="getIncidentTypeColor(selectedIncident.type)">
                {{ getIncidentTypeName(selectedIncident.type) }}
              </van-tag>
            </div>
            <p class="info-description">{{ selectedIncident.description }}</p>
          </div>
          
          <!-- 玩家反应 -->
          <div class="reactions-section">
            <h4>💬 玩家反应</h4>
            <div class="reactions-list">
              <div 
                v-for="(reaction, index) in selectedIncident.playerReactions" 
                :key="index"
                class="reaction-item"
              >
                <span class="reaction-avatar">👤</span>
                <span class="reaction-text">{{ reaction }}</span>
              </div>
            </div>
          </div>
          
          <!-- 处理方案 -->
          <div class="solutions-section">
            <h4>🎯 选择处理方案</h4>
            <div class="solutions-list">
              <div
                v-for="(solution, index) in selectedIncident.solutions"
                :key="index"
                class="solution-item"
                :class="{ 'is-selected': selectedSolution === solution }"
                @click="selectedSolution = solution"
              >
                <div class="solution-radio">
                  <van-radio :name="solution" v-model="selectedSolution">
                    <template #default></template>
                  </van-radio>
                </div>
                <div class="solution-content">
                  <div class="solution-header">
                    <span class="solution-action">{{ solution.action }}</span>
                    <van-tag :type="getBudgetType(solution.cost)" size="mini">
                      {{ solution.cost }}成本
                    </van-tag>
                  </div>
                  <p class="solution-effect">{{ solution.effect }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dialog-actions">
          <van-button 
            block 
            round 
            type="primary"
            color="linear-gradient(to right, #FF69B4, #FFB6C1)"
            @click="handleResolve"
            :loading="resolving"
            :disabled="!selectedSolution"
          >
            确认处理
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOperationStore, type OperationIncident } from '@/stores/operationStore';
import { getIncidentTypeName, getSeverityType } from '@/data/templates/incidents';
import { showToast } from 'vant';

const operationStore = useOperationStore();

const showHandleDialog = ref(false);
const selectedIncident = ref<OperationIncident | null>(null);
const selectedSolution = ref<any>(null);
const resolving = ref(false);

// 所有事件
const allIncidents = computed(() => {
  return operationStore.incidents;
});

// 待处理事件
const pendingIncidents = computed(() => {
  return operationStore.pendingIncidents;
});

function getIncidentIcon(type: string): string {
  const map: Record<string, string> = {
    dropRate: '🎲',
    plotIssue: '📖',
    welfare: '🎁',
    other: '⚠️'
  };
  return map[type] || '⚠️';
}

function getIncidentTypeColor(type: string): string {
  const map: Record<string, string> = {
    dropRate: 'primary',
    plotIssue: 'warning',
    welfare: 'success',
    other: 'danger'
  };
  return map[type] || 'default';
}

function getStatusType(status: string): string {
  const map: Record<string, string> = {
    pending: 'danger',
    processing: 'warning',
    resolved: 'success'
  };
  return map[status] || 'default';
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决'
  };
  return map[status] || status;
}

function getBudgetType(budget: string): string {
  const map: Record<string, string> = {
    '低': 'success',
    '中': 'warning',
    '高': 'danger'
  };
  return map[budget] || 'default';
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return minutes < 1 ? '刚刚' : `${minutes}分钟前`;
  }
  
  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function handleIncidentClick(incident: OperationIncident) {
  if (incident.status === 'pending') {
    selectedIncident.value = incident;
    selectedSolution.value = null;
    showHandleDialog.value = true;
  }
}

async function handleResolve() {
  if (!selectedIncident.value || !selectedSolution.value) {
    showToast('请选择处理方案');
    return;
  }
  
  resolving.value = true;
  
  const result = await operationStore.handleIncident(
    selectedIncident.value.id,
    selectedSolution.value
  );
  
  if (result.success) {
    showToast({
      message: '事件处理成功',
      icon: 'success'
    });
    showHandleDialog.value = false;
    selectedIncident.value = null;
    selectedSolution.value = null;
  } else {
    showToast({
      message: result.message,
      icon: 'fail'
    });
  }
  
  resolving.value = false;
}
</script>

<style scoped lang="scss">
.incident-handler {
  min-height: 100%;
}

.pending-alert {
  margin-bottom: 12px;
}

.incident-list {
  padding: 12px;
}

.incident-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.incident-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid transparent;
  
  &.is-pending {
    border-left-color: #ee0a24;
    background: linear-gradient(135deg, #fff5f5, white);
  }
  
  &.is-resolved {
    border-left-color: #07c160;
    opacity: 0.8;
  }
  
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

.incident-type {
  display: flex;
  align-items: center;
  gap: 6px;
}

.type-icon {
  font-size: 20px;
}

.type-name {
  font-size: 13px;
  color: #666;
}

.incident-badges {
  display: flex;
  gap: 6px;
}

.incident-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
}

.incident-description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.incident-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.meta-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-resolved {
  color: #07c160;
}

.resolved-solution {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e0e0e0;
}

// 处理弹窗
.handle-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dialog-header {
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

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.info-section {
  margin-bottom: 20px;
}

.info-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.info-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.reactions-section,
.solutions-section {
  margin-bottom: 20px;
  
  h4 {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin: 0 0 12px 0;
  }
}

.reactions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reaction-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.reaction-avatar {
  font-size: 16px;
}

.reaction-text {
  font-size: 13px;
  color: #666;
}

.solutions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.solution-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  
  &.is-selected {
    border-color: #FF69B4;
    background: #fff5f7;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.solution-radio {
  flex-shrink: 0;
}

.solution-content {
  flex: 1;
}

.solution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.solution-action {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.solution-effect {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.dialog-actions {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
