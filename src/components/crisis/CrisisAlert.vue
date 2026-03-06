<template>
  <van-popup v-model:show="showPopup" position="top" :style="{ background: 'linear-gradient(180deg, #FFE4E8 0%, #FFF5F7 100%)' }">
    <div class="crisis-alert" v-if="crises.length > 0">
      <div class="crisis-header">
        <van-icon name="warning-o" class="crisis-icon" />
        <h3 class="crisis-title">危机警报</h3>
        <van-icon name="cross" class="close-icon" @click="showPopup = false" />
      </div>

      <div class="crisis-list">
        <div
          v-for="crisis in crises"
          :key="crisis.id"
          class="crisis-item"
          :class="[crisis.level, crisis.status]"
        >
          <div class="crisis-info">
            <div class="crisis-top">
              <span class="crisis-level">{{ getLevelName(crisis.level) }}</span>
              <van-tag :type="crisis.status === 'resolved' ? 'success' : 'danger'">
                {{ crisis.status === 'resolved' ? '已解决' : '待处理' }}
              </van-tag>
            </div>
            <h4 class="crisis-name">{{ crisis.title }}</h4>
            <p class="crisis-desc">{{ crisis.description }}</p>
            <div class="crisis-stats">
              <span>🔥 热度：{{ crisis.heat }}%</span>
              <span>👥 影响：{{ crisis.participants }}人</span>
              <span :class="['sentiment', crisis.status === 'resolved' ? 'positive' : 'negative']">
                {{ crisis.status === 'resolved' ? '已缓解' : '处理中' }}
              </span>
            </div>
          </div>

          <div class="crisis-actions" v-if="crisis.status !== 'resolved' && crisis.options?.length">
            <div class="action-title">处理方案：</div>
            <div class="action-list">
              <div
                v-for="option in getOptionConfigs(crisis.options)"
                :key="option.type"
                class="action-item"
                @click="handleResolve(crisis.id, option)"
              >
                <div class="action-text">{{ option.name }}</div>
                <div class="action-meta">
                  <span>💰 {{ option.cost }}积分</span>
                  <span>✓ {{ ((1 - option.risk) * 100).toFixed(0) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { showDialog } from 'vant'
import { CRISIS_OPTIONS, type Crisis, type CrisisOption, type CrisisOptionConfig } from '@/types/crisis'

interface Props {
  crises: Crisis[]
}

interface Emits {
  (e: 'resolve', crisisId: string, option: CrisisOption): void
}

const props = withDefaults(defineProps<Props>(), {
  crises: () => []
})

const emit = defineEmits<Emits>()

const showPopup = ref(false)

watch(() => props.crises.length, (newLength) => {
  if (newLength > 0) {
    showPopup.value = true
  } else {
    showPopup.value = false
  }
}, { immediate: true })

const getLevelName = (level: string): string => {
  const map: Record<string, string> = {
    minor: '一般',
    moderate: '中等',
    severe: '严重',
    critical: '危急'
  }
  return map[level] || level
}

const getOptionConfigs = (options: CrisisOption[]): CrisisOptionConfig[] => {
  return options
    .map(option => CRISIS_OPTIONS.find(config => config.type === option))
    .filter((option): option is CrisisOptionConfig => Boolean(option))
}

const handleResolve = (crisisId: string, option: CrisisOptionConfig) => {
  showDialog({
    title: '确认处理',
    message: `确定要使用"${option.name}"方案处理危机吗？\n消耗：${option.cost}积分\n预估成功率：${((1 - option.risk) * 100).toFixed(0)}%`,
    confirmButtonText: '确认处理',
    cancelButtonText: '再想想'
  }).then(() => {
    emit('resolve', crisisId, option.type)
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.crisis-alert {
  padding: 16px;
  
  .crisis-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    .crisis-icon {
      font-size: 24px;
      color: #ff4d4f;
      margin-right: 8px;
    }
    
    .crisis-title {
      flex: 1;
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
    
    .close-icon {
      font-size: 20px;
      color: #999;
      cursor: pointer;
    }
  }
  
  .crisis-list {
    .crisis-item {
      background: white;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      border-left: 4px solid #ddd;
      
      &.minor {
        border-left-color: #1890ff;
      }
      
      &.moderate {
        border-left-color: #fa8c16;
      }
      
      &.severe {
        border-left-color: #ff4d4f;
      }
      
      &.critical {
        border-left-color: #722ed1;
        background: linear-gradient(135deg, #FFF5F7 0%, white 100%);
      }
      
      .crisis-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .crisis-level {
          font-size: 12px;
          font-weight: bold;
          padding: 2px 8px;
          border-radius: 4px;
          background: #f0f0f0;
        }
      }
      
      .crisis-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      
      .crisis-desc {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }
      
      .crisis-stats {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: #999;
        
        .sentiment {
          &.positive {
            color: #52c41a;
          }
          
          &.negative {
            color: #ff4d4f;
          }
        }
      }
      
      .crisis-actions {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;
        
        .action-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .action-list {
          .action-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: #f5f5f5;
            border-radius: 4px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.3s;
            
            &:active {
              transform: scale(0.98);
              background: #e6e6e6;
            }
            
            .action-text {
              font-size: 14px;
              font-weight: bold;
            }
            
            .action-meta {
              display: flex;
              gap: 8px;
              font-size: 12px;
              color: #666;
            }
          }
        }
      }
    }
  }
}
</style>
