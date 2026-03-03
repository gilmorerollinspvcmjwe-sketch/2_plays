<template>
  <div class="crisis-alert">
    <!-- 危机列表 -->
    <div v-if="activeCrises.length > 0" class="crisis-list">
      <div
        v-for="crisis in activeCrises"
        :key="crisis.id"
        class="crisis-card"
        :class="[crisis.level, crisis.status]"
        @click="showCrisisDetail(crisis)"
      >
        <div class="crisis-header">
          <div class="crisis-level-badge" :style="{ background: getLevelColor(crisis.level) }">
            <van-icon :name="getLevelIcon(crisis.level)" size="16" />
            <span>{{ getLevelName(crisis.level) }}</span>
          </div>
          <div class="crisis-heat">
            <van-icon name="fire-o" />
            <span>{{ crisis.heat }}°</span>
          </div>
        </div>
        <h4 class="crisis-title">{{ crisis.title }}</h4>
        <p class="crisis-description">{{ crisis.description }}</p>
        <div class="crisis-footer">
          <span class="crisis-status">{{ getStatusName(crisis.status) }}</span>
          <span class="crisis-participants">
            <van-icon name="friends-o" size="12" />
            {{ formatNumber(crisis.participants) }}人参与
          </span>
        </div>
        <div class="crisis-progress">
          <div
            class="progress-bar"
            :style="{ width: crisis.heat + '%', background: getLevelColor(crisis.level) }"
          />
        </div>
      </div>
    </div>

    <!-- 无危机状态 -->
    <div v-else class="no-crisis">
      <div class="peace-icon">
        <van-icon name="shield-o" size="48" />
      </div>
      <p>当前无危机</p>
      <span class="peace-subtitle">运营平稳，继续保持</span>
    </div>

    <!-- 危机详情弹窗 -->
    <van-popup
      v-model:show="showDetail"
      position="bottom"
      round
      :style="{ height: '75%' }"
      class="crisis-detail-popup"
    >
      <div v-if="selectedCrisis" class="crisis-detail">
        <!-- 头部 -->
        <div class="detail-header" :style="{ background: getLevelColor(selectedCrisis.level) }">
          <div class="header-content">
            <div class="level-badge">
              <van-icon :name="getLevelIcon(selectedCrisis.level)" size="24" />
              <span>{{ getLevelName(selectedCrisis.level) }}危机</span>
            </div>
            <h3>{{ selectedCrisis.title }}</h3>
            <p>{{ selectedCrisis.description }}</p>
          </div>
          <van-icon name="cross" class="close-btn" @click="showDetail = false" />
        </div>

        <!-- 危机状态 -->
        <div class="detail-status">
          <div class="status-item">
            <span class="label">当前热度</span>
            <div class="heat-display">
              <van-icon name="fire-o" :color="getLevelColor(selectedCrisis.level)" />
              <span class="value" :style="{ color: getLevelColor(selectedCrisis.level) }">
                {{ selectedCrisis.heat }}°
              </span>
            </div>
          </div>
          <div class="status-item">
            <span class="label">参与人数</span>
            <span class="value">{{ formatNumber(selectedCrisis.participants) }}人</span>
          </div>
          <div class="status-item">
            <span class="label">持续时间</span>
            <span class="value">{{ getDuration(selectedCrisis.startTime) }}</span>
          </div>
        </div>

        <!-- 影响玩家群体 -->
        <div class="affected-segments">
          <h4>受影响玩家群体</h4>
          <div class="segments-tags">
            <van-tag
              v-for="segment in selectedCrisis.relatedSegments"
              :key="segment"
              round
              :color="getSegmentColor(segment)"
            >
              {{ getSegmentName(segment) }}
            </van-tag>
          </div>
        </div>

        <!-- 危机时间线 -->
        <div class="crisis-timeline">
          <h4>危机发展</h4>
          <div class="timeline">
            <div
              v-for="(entry, index) in selectedCrisis.history"
              :key="index"
              class="timeline-item"
            >
              <div class="timeline-dot" :class="entry.status" />
              <div class="timeline-content">
                <span class="time">{{ formatTime(entry.timestamp) }}</span>
                <p class="description">{{ entry.description }}</p>
                <span class="heat">热度: {{ entry.heat }}°</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 处理选项 -->
        <div v-if="!selectedCrisis.isResolved" class="crisis-options">
          <h4>选择处理方式</h4>
          <div class="options-list">
            <div
              v-for="option in availableOptions"
              :key="option.type"
              class="option-card"
              :class="{ selected: selectedOption === option.type }"
              @click="selectedOption = option.type"
            >
              <div class="option-icon" :style="{ background: getOptionColor(option.type) }">
                <van-icon :name="option.icon" size="20" />
              </div>
              <div class="option-info">
                <span class="name">{{ option.name }}</span>
                <span class="description">{{ option.description }}</span>
                <div class="option-stats">
                  <span class="cost">
                    <van-icon name="gold-coin-o" size="12" />
                    {{ option.cost }}
                  </span>
                  <span class="risk" :class="getRiskLevel(option.risk)">
                    风险: {{ Math.round(option.risk * 100) }}%
                  </span>
                  <span class="effectiveness">
                    效果: {{ Math.round(option.effectiveness * 100) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 处理结果 -->
        <div v-else-if="selectedCrisis.resolution" class="resolution-result">
          <h4>处理结果</h4>
          <div class="result-card" :class="selectedCrisis.resolution.outcome">
            <div class="result-icon">
              <van-icon
                :name="selectedCrisis.resolution.outcome === 'success' ? 'success' : 
                       selectedCrisis.resolution.outcome === 'partial' ? 'info-o' : 'cross'"
                size="32"
              />
            </div>
            <p class="result-feedback">{{ selectedCrisis.resolution.feedback }}</p>
            <div class="result-stats">
              <div class="stat">
                <span class="label">满意度</span>
                <span class="value" :class="getChangeClass(selectedCrisis.resolution.satisfactionChange)">
                  {{ selectedCrisis.resolution.satisfactionChange > 0 ? '+' : '' }}
                  {{ selectedCrisis.resolution.satisfactionChange }}
                </span>
              </div>
              <div class="stat">
                <span class="label">玩家数</span>
                <span class="value" :class="getChangeClass(selectedCrisis.resolution.playerChange)">
                  {{ selectedCrisis.resolution.playerChange > 0 ? '+' : '' }}
                  {{ selectedCrisis.resolution.playerChange }}
                </span>
              </div>
              <div class="stat">
                <span class="label">声誉</span>
                <span class="value" :class="getChangeClass(selectedCrisis.resolution.reputationChange)">
                  {{ selectedCrisis.resolution.reputationChange > 0 ? '+' : '' }}
                  {{ selectedCrisis.resolution.reputationChange }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div v-if="!selectedCrisis.isResolved" class="action-buttons">
          <van-button
            round
            block
            type="primary"
            size="large"
            :color="getLevelColor(selectedCrisis.level)"
            :disabled="!selectedOption"
            @click="handleCrisis"
          >
            确认处理
          </van-button>
          <van-button
            round
            block
            size="large"
            style="margin-top: 12px"
            @click="showDetail = false"
          >
            稍后再说
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 处理结果弹窗 -->
    <van-dialog
      v-model:show="showResult"
      title="危机处理结果"
      confirm-button-text="知道了"
      :confirm-button-color="resultColor"
    >
      <div v-if="handleResult" class="handle-result">
        <div class="result-icon-large" :class="handleResult.outcome">
          <van-icon
            :name="handleResult.outcome === 'success' ? 'success' : 
                   handleResult.outcome === 'partial' ? 'info-o' : 'cross'"
            size="48"
          />
        </div>
        <p class="result-title">
          {{ handleResult.outcome === 'success' ? '处理成功！' : 
             handleResult.outcome === 'partial' ? '处理尚可' : '处理失败' }}
        </p>
        <p class="result-desc">{{ handleResult.feedback }}</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Crisis, CrisisOption, CrisisResolution } from '@/types/crisis';
import { CRISIS_LEVELS, CRISIS_OPTIONS, resolveCrisis } from '@/types/crisis';
import { PLAYER_SEGMENTS } from '@/types/playerSegments';
import { showToast } from 'vant';

const props = defineProps<{
  crises: Crisis[];
}>();

const emit = defineEmits<{
  (e: 'resolve', crisisId: string, resolution: CrisisResolution): void;
}>();

const showDetail = ref(false);
const showResult = ref(false);
const selectedCrisis = ref<Crisis | null>(null);
const selectedOption = ref<CrisisOption | ''>('');
const handleResult = ref<CrisisResolution | null>(null);

const activeCrises = computed(() => {
  return props.crises.filter(c => !c.isResolved);
});

const availableOptions = computed(() => {
  return CRISIS_OPTIONS;
});

const resultColor = computed(() => {
  if (!handleResult.value) return '#999';
  const colors = {
    success: '#52c41a',
    partial: '#faad14',
    failure: '#ff4d4f'
  };
  return colors[handleResult.value.outcome];
});

function getLevelColor(level: string): string {
  const config = CRISIS_LEVELS.find(l => l.level === level);
  return config?.color || '#999';
}

function getLevelIcon(level: string): string {
  const config = CRISIS_LEVELS.find(l => l.level === level);
  return config?.icon || 'info-o';
}

function getLevelName(level: string): string {
  const config = CRISIS_LEVELS.find(l => l.level === level);
  return config?.name || level;
}

function getStatusName(status: string): string {
  const names: Record<string, string> = {
    warning: '预警中',
    fermenting: '发酵中',
    outbreak: '已爆发',
    handling: '处理中',
    resolved: '已解决',
    escalated: '已升级'
  };
  return names[status] || status;
}

function getOptionColor(type: string): string {
  const colors: Record<string, string> = {
    ignore: '#999',
    apologize: '#52c41a',
    adjust: '#1890ff',
    distract: '#FF69B4'
  };
  return colors[type] || '#999';
}

function getRiskLevel(risk: number): string {
  if (risk < 0.3) return 'low';
  if (risk < 0.6) return 'medium';
  return 'high';
}

function getChangeClass(value: number): string {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

function getSegmentColor(type: string): string {
  const segment = PLAYER_SEGMENTS.find(s => s.type === type);
  return segment?.color || '#999';
}

function getSegmentName(type: string): string {
  const segment = PLAYER_SEGMENTS.find(s => s.type === type);
  return segment?.name || type;
}

function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function getDuration(startTime: string): string {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  const hours = Math.floor((now - start) / (1000 * 60 * 60));
  
  if (hours < 1) return '不到1小时';
  if (hours < 24) return `${hours}小时`;
  const days = Math.floor(hours / 24);
  return `${days}天${hours % 24}小时`;
}

function showCrisisDetail(crisis: Crisis) {
  selectedCrisis.value = crisis;
  selectedOption.value = '';
  showDetail.value = true;
}

function handleCrisis() {
  if (!selectedCrisis.value || !selectedOption.value) return;
  
  const result = resolveCrisis(
    selectedCrisis.value,
    selectedOption.value,
    {
      satisfaction: 70,
      playerCount: 1000,
      reputation: 80
    }
  );
  
  handleResult.value = result;
  showDetail.value = false;
  showResult.value = true;
  
  emit('resolve', selectedCrisis.value.id, result);
  
  if (result.outcome === 'success') {
    showToast('危机处理成功！口碑反转！');
  } else if (result.outcome === 'partial') {
    showToast('危机处理尚可');
  } else {
    showToast('危机处理失败，情况恶化');
  }
}
</script>

<style scoped lang="scss">
.crisis-alert {
  padding: 16px;
}

.crisis-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.crisis-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.minor {
    border-left-color: #faad14;
  }
  
  &.moderate {
    border-left-color: #ff7a45;
  }
  
  &.severe {
    border-left-color: #ff4d4f;
  }
  
  &.critical {
    border-left-color: #820014;
  }
  
  .crisis-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .crisis-level-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 12px;
      color: white;
      font-size: 12px;
    }
    
    .crisis-heat {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ff4d4f;
      font-weight: bold;
      font-size: 14px;
    }
  }
  
  .crisis-title {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #333;
  }
  
  .crisis-description {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: #666;
    line-height: 1.5;
  }
  
  .crisis-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .crisis-status {
      font-size: 12px;
      color: #999;
    }
    
    .crisis-participants {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #999;
    }
  }
  
  .crisis-progress {
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;
    
    .progress-bar {
      height: 100%;
      border-radius: 2px;
      transition: width 0.3s ease;
    }
  }
}

.no-crisis {
  text-align: center;
  padding: 40px 20px;
  
  .peace-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #52c41a 0%, #95de64 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin: 0 auto 16px;
  }
  
  p {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #333;
    font-weight: bold;
  }
  
  .peace-subtitle {
    font-size: 14px;
    color: #999;
  }
}

.crisis-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  
  .detail-header {
    padding: 24px;
    color: white;
    position: relative;
    
    .header-content {
      .level-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        font-size: 14px;
        margin-bottom: 12px;
      }
      
      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
      }
      
      p {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
      }
    }
    
    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 24px;
      cursor: pointer;
      opacity: 0.8;
    }
  }
  
  .detail-status {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 16px;
    background: #f9f9f9;
    
    .status-item {
      text-align: center;
      
      .label {
        display: block;
        font-size: 12px;
        color: #999;
        margin-bottom: 4px;
      }
      
      .heat-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        
        .value {
          font-size: 20px;
          font-weight: bold;
        }
      }
      
      .value {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }
    }
  }
  
  .affected-segments {
    padding: 16px;
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #333;
    }
    
    .segments-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
  
  .crisis-timeline {
    padding: 16px;
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #333;
    }
    
    .timeline {
      position: relative;
      padding-left: 20px;
      
      &::before {
        content: '';
        position: absolute;
        left: 5px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e8e8e8;
      }
      
      .timeline-item {
        position: relative;
        margin-bottom: 16px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .timeline-dot {
          position: absolute;
          left: -17px;
          top: 4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #d9d9d9;
          border: 2px solid white;
          
          &.warning { background: #faad14; }
          &.fermenting { background: #ff7a45; }
          &.outbreak { background: #ff4d4f; }
          &.handling { background: #1890ff; }
          &.resolved { background: #52c41a; }
        }
        
        .timeline-content {
          .time {
            font-size: 12px;
            color: #999;
          }
          
          .description {
            margin: 4px 0;
            font-size: 14px;
            color: #333;
          }
          
          .heat {
            font-size: 12px;
            color: #ff7a45;
          }
        }
      }
    }
  }
  
  .crisis-options {
    padding: 16px;
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #333;
    }
    
    .options-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .option-card {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      
      &.selected {
        border-color: #FF69B4;
        background: #FFF5F7;
      }
      
      .option-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }
      
      .option-info {
        flex: 1;
        
        .name {
          display: block;
          font-size: 15px;
          font-weight: bold;
          color: #333;
          margin-bottom: 2px;
        }
        
        .description {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 6px;
        }
        
        .option-stats {
          display: flex;
          gap: 12px;
          font-size: 12px;
          
          .cost {
            display: flex;
            align-items: center;
            gap: 2px;
            color: #FF69B4;
          }
          
          .risk {
            &.low { color: #52c41a; }
            &.medium { color: #faad14; }
            &.high { color: #ff4d4f; }
          }
          
          .effectiveness {
            color: #1890ff;
          }
        }
      }
    }
  }
  
  .resolution-result {
    padding: 16px;
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #333;
    }
    
    .result-card {
      background: #f9f9f9;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      
      &.success {
        background: #f6ffed;
        border: 1px solid #52c41a;
      }
      
      &.partial {
        background: #fffbe6;
        border: 1px solid #faad14;
      }
      
      &.failure {
        background: #fff2f0;
        border: 1px solid #ff4d4f;
      }
      
      .result-icon {
        margin-bottom: 12px;
      }
      
      .result-feedback {
        margin: 0 0 16px 0;
        font-size: 15px;
        color: #333;
      }
      
      .result-stats {
        display: flex;
        justify-content: space-around;
        
        .stat {
          text-align: center;
          
          .label {
            display: block;
            font-size: 12px;
            color: #999;
            margin-bottom: 4px;
          }
          
          .value {
            font-size: 18px;
            font-weight: bold;
            
            &.positive { color: #52c41a; }
            &.negative { color: #ff4d4f; }
            &.neutral { color: #999; }
          }
        }
      }
    }
  }
  
  .action-buttons {
    padding: 16px;
    margin-top: auto;
  }
}

.handle-result {
  padding: 20px;
  text-align: center;
  
  .result-icon-large {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: white;
    
    &.success {
      background: #52c41a;
    }
    
    &.partial {
      background: #faad14;
    }
    
    &.failure {
      background: #ff4d4f;
    }
  }
  
  .result-title {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }
  
  .result-desc {
    margin: 0;
    font-size: 14px;
    color: #666;
  }
}
</style>
