<template>
  <div class="operation-prediction-panel">
    <!-- 预测置信度 -->
    <div class="confidence-section">
      <div class="confidence-header">
        <span class="confidence-label">预测置信度</span>
        <span class="confidence-value" :class="getConfidenceClass(adjustedConfidence)">
          {{ (adjustedConfidence * 100).toFixed(0) }}%
        </span>
        <van-tag v-if="creatorStore.getSkillLevel('dataAnalysis') > 0" type="success" size="small">
          +{{ creatorStore.getSkillLevel('dataAnalysis') * 5 }}%
        </van-tag>
      </div>
      <div class="confidence-bar">
        <div
          class="confidence-fill"
          :class="getConfidenceClass(adjustedConfidence)"
          :style="{ width: (adjustedConfidence * 100) + '%' }"
        ></div>
      </div>
      <p class="confidence-desc">{{ getConfidenceDesc(adjustedConfidence) }}</p>
      <p v-if="showDeepAnalysis" class="deep-analysis-hint">
        <van-icon name="chart-trending-o" /> 已解锁深度分析 (Lv.3+)
      </p>
    </div>

    <!-- 效果预测卡片 -->
    <div class="effects-section">
      <!-- 即时效果 -->
      <div class="effect-card immediate">
        <div class="effect-header">
          <span class="effect-icon">⚡</span>
          <span class="effect-title">即时效果</span>
          <span class="effect-time">0-1天</span>
        </div>
        <div class="effect-list">
          <div 
            v-for="(effect, index) in prediction.predictedEffects.immediate" 
            :key="'immediate-' + index"
            class="effect-item"
          >
            <span class="effect-metric">{{ getMetricLabel(effect.metric) }}</span>
            <span 
              class="effect-change"
              :class="effect.change >= 0 ? 'positive' : 'negative'"
            >
              {{ effect.change >= 0 ? '+' : '' }}{{ effect.change.toFixed(1) }}
            </span>
          </div>
          <div v-if="prediction.predictedEffects.immediate.length === 0" class="effect-empty">
            无即时效果
          </div>
        </div>
      </div>

      <!-- 短期效果 -->
      <div class="effect-card short-term">
        <div class="effect-header">
          <span class="effect-icon">📈</span>
          <span class="effect-title">短期效果</span>
          <span class="effect-time">1-7天</span>
        </div>
        <div class="effect-list">
          <div 
            v-for="(effect, index) in prediction.predictedEffects.shortTerm" 
            :key="'short-' + index"
            class="effect-item"
          >
            <span class="effect-metric">{{ getMetricLabel(effect.metric) }}</span>
            <span 
              class="effect-change"
              :class="effect.change >= 0 ? 'positive' : 'negative'"
            >
              {{ effect.change >= 0 ? '+' : '' }}{{ effect.change.toFixed(1) }}
            </span>
          </div>
          <div v-if="prediction.predictedEffects.shortTerm.length === 0" class="effect-empty">
            无短期效果
          </div>
        </div>
      </div>

      <!-- 长期效果 -->
      <div class="effect-card long-term">
        <div class="effect-header">
          <span class="effect-icon">🎯</span>
          <span class="effect-title">长期效果</span>
          <span class="effect-time">7-30天</span>
        </div>
        <div class="effect-list">
          <div 
            v-for="(effect, index) in prediction.predictedEffects.longTerm" 
            :key="'long-' + index"
            class="effect-item"
          >
            <span class="effect-metric">{{ getMetricLabel(effect.metric) }}</span>
            <span 
              class="effect-change"
              :class="effect.change >= 0 ? 'positive' : 'negative'"
            >
              {{ effect.change >= 0 ? '+' : '' }}{{ effect.change.toFixed(1) }}
            </span>
          </div>
          <div v-if="prediction.predictedEffects.longTerm.length === 0" class="effect-empty">
            无长期效果
          </div>
        </div>
      </div>
    </div>

    <!-- 因果关系图 -->
    <div class="causality-section">
      <div class="section-header">
        <span class="section-title">因果关系图</span>
        <span class="section-subtitle">{{ getDecisionTypeLabel(decision.type) }}</span>
      </div>
      <div class="causality-graph">
        <div class="causality-node source">
          <div class="node-icon">{{ getDecisionIcon(decision.type) }}</div>
          <div class="node-label">{{ decision.name || '决策' }}</div>
        </div>
        <div class="causality-arrows">
          <div 
            v-for="(effect, index) in allEffects" 
            :key="'arrow-' + index"
            class="causality-arrow"
            :class="effect.delay"
          >
            <div class="arrow-line" :class="effect.change >= 0 ? 'positive' : 'negative'"></div>
            <div class="arrow-label">{{ getDelayLabel(effect.delay) }}</div>
          </div>
        </div>
        <div class="causality-targets">
          <div 
            v-for="(target, index) in uniqueTargets" 
            :key="'target-' + index"
            class="causality-node target"
          >
            <div class="node-icon">{{ getTargetIcon(target) }}</div>
            <div class="node-label">{{ getTargetLabel(target) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 参数调整 -->
    <div class="adjustment-section">
      <div class="section-header">
        <span class="section-title">参数调整</span>
        <van-button size="mini" round @click="resetAdjustments">重置</van-button>
      </div>
      <div class="adjustment-list">
        <div class="adjustment-item">
          <span class="adjustment-label">强度系数</span>
          <van-slider 
            v-model="adjustments.intensity" 
            :min="0.5" 
            :max="2" 
            :step="0.1"
            @change="onAdjustmentChange"
          />
          <span class="adjustment-value">{{ adjustments.intensity.toFixed(1) }}x</span>
        </div>
        <div class="adjustment-item">
          <span class="adjustment-label">市场敏感度</span>
          <van-slider 
            v-model="adjustments.marketSensitivity" 
            :min="0.5" 
            :max="2" 
            :step="0.1"
            @change="onAdjustmentChange"
          />
          <span class="adjustment-value">{{ adjustments.marketSensitivity.toFixed(1) }}x</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-section">
      <van-button 
        type="primary" 
        block 
        round
        color="linear-gradient(to right, #FF69B4, #FFB6C1)"
        @click="$emit('confirm')"
      >
        确认执行
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCreatorGrowthStore, SKILL_EFFECTS } from '@/stores/creatorGrowth';
import type { OperationPrediction, OperationDecision, Effect } from '@/stores/operationStore';

interface Props {
  decision: OperationDecision;
  prediction: OperationPrediction;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'confirm': [];
  'adjust': [adjustments: { intensity: number; marketSensitivity: number }];
}>();

const creatorStore = useCreatorGrowthStore();

// 参数调整
const adjustments = ref({
  intensity: 1,
  marketSensitivity: 1
});

// 计算预测置信度（应用数据分析技能加成）
const adjustedConfidence = computed(() => {
  const daLevel = creatorStore.getSkillLevel('dataAnalysis');
  const baseConfidence = props.prediction.confidence;
  const accuracyBonus = SKILL_EFFECTS.dataAnalysis.predictionAccuracy(daLevel);
  return Math.min(0.95, baseConfidence + accuracyBonus);
});

// 是否解锁深度分析
const showDeepAnalysis = computed(() => {
  const daLevel = creatorStore.getSkillLevel('dataAnalysis');
  return SKILL_EFFECTS.dataAnalysis.unlockDeepAnalysis(daLevel);
});

// 所有效果的集合
const allEffects = computed(() => {
  const effects: (Effect & { delay: string })[] = [];
  props.prediction.predictedEffects.immediate.forEach(e => effects.push({ ...e, delay: 'immediate' }));
  props.prediction.predictedEffects.shortTerm.forEach(e => effects.push({ ...e, delay: 'short' }));
  props.prediction.predictedEffects.longTerm.forEach(e => effects.push({ ...e, delay: 'long' }));
  return effects;
});

// 唯一的目标模块
const uniqueTargets = computed(() => {
  const targets = new Set<string>();
  allEffects.value.forEach(e => {
    if (e.targetModule) {
      targets.add(e.targetModule);
    }
  });
  return Array.from(targets);
});

// 置信度样式
function getConfidenceClass(confidence: number): string {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

// 置信度描述
function getConfidenceDesc(confidence: number): string {
  if (confidence >= 0.8) return '基于历史数据的高置信度预测';
  if (confidence >= 0.5) return '基于相似案例的中等置信度预测';
  return '新类型决策，预测不确定性较高';
}

// 指标标签
function getMetricLabel(metric: string): string {
  const labels: Record<string, string> = {
    'satisfaction': '玩家满意度',
    'dailyRevenue': '日收入',
    'retention': '留存率',
    'marketShare': '市场份额',
    'reputation': '声誉',
    'negativeSentiment': '负面情绪',
    'incident_trigger': '事件触发',
    'activePlayers': '活跃玩家',
    'totalDraws': '抽卡次数'
  };
  return labels[metric] || metric;
}

// 决策类型标签
function getDecisionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'gacha': '卡池决策',
    'event': '活动决策',
    'welfare': '福利决策',
    'incident': '事件处理',
    'market': '市场决策'
  };
  return labels[type] || '运营决策';
}

// 决策图标
function getDecisionIcon(type: string): string {
  const icons: Record<string, string> = {
    'gacha': '🎲',
    'event': '🎉',
    'welfare': '🎁',
    'incident': '⚠️',
    'market': '📊'
  };
  return icons[type] || '📋';
}

// 延迟标签
function getDelayLabel(delay: string): string {
  const labels: Record<string, string> = {
    'immediate': '即时',
    'short': '短期',
    'long': '长期'
  };
  return labels[delay] || delay;
}

// 目标图标
function getTargetIcon(target: string): string {
  const icons: Record<string, string> = {
    'gacha': '🎲',
    'event': '🎉',
    'welfare': '🎁',
    'playerData': '👥',
    'incident': '⚠️',
    'social': '💬',
    'market': '📊'
  };
  return icons[target] || '🎯';
}

// 目标标签
function getTargetLabel(target: string): string {
  const labels: Record<string, string> = {
    'gacha': '卡池',
    'event': '活动',
    'welfare': '福利',
    'playerData': '玩家',
    'incident': '事件',
    'social': '社交',
    'market': '市场'
  };
  return labels[target] || target;
}

// 参数调整变化
function onAdjustmentChange() {
  emit('adjust', { ...adjustments.value });
}

// 重置调整
function resetAdjustments() {
  adjustments.value = {
    intensity: 1,
    marketSensitivity: 1
  };
  emit('adjust', { ...adjustments.value });
}

// 监听决策变化，重置调整
watch(() => props.decision, () => {
  resetAdjustments();
}, { deep: true });
</script>

<style scoped lang="scss">
.operation-prediction-panel {
  padding: 16px;
  background: #f8f8f8;
  min-height: 100%;
}

// 置信度区域
.confidence-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .confidence-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .confidence-label {
      font-size: 14px;
      color: #666;
    }

    .confidence-value {
      font-size: 20px;
      font-weight: bold;

      &.high {
        color: #52c41a;
      }

      &.medium {
        color: #fa8c16;
      }

      &.low {
        color: #ff4d4f;
      }
    }
  }

  .confidence-bar {
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;

    .confidence-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;

      &.high {
        background: linear-gradient(90deg, #52c41a, #73d13d);
      }

      &.medium {
        background: linear-gradient(90deg, #fa8c16, #ffc53d);
      }

      &.low {
        background: linear-gradient(90deg, #ff4d4f, #ff7875);
      }
    }
  }

  .confidence-desc {
    font-size: 12px;
    color: #999;
    margin: 0;
  }

  .deep-analysis-hint {
    font-size: 12px;
    color: #52c41a;
    margin: 8px 0 0 0;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

// 效果区域
.effects-section {
  margin-bottom: 16px;
}

.effect-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid;

  &.immediate {
    border-left-color: #52c41a;
  }

  &.short-term {
    border-left-color: #fa8c16;
  }

  &.long-term {
    border-left-color: #1890ff;
  }

  .effect-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .effect-icon {
      font-size: 20px;
    }

    .effect-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      flex: 1;
    }

    .effect-time {
      font-size: 12px;
      color: #999;
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 4px;
    }
  }

  .effect-list {
    .effect-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .effect-metric {
        font-size: 14px;
        color: #666;
      }

      .effect-change {
        font-size: 16px;
        font-weight: bold;

        &.positive {
          color: #52c41a;
        }

        &.negative {
          color: #ff4d4f;
        }
      }
    }

    .effect-empty {
      text-align: center;
      padding: 16px;
      color: #999;
      font-size: 14px;
    }
  }
}

// 因果关系区域
.causality-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }

    .section-subtitle {
      font-size: 12px;
      color: #999;
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 4px;
    }
  }
}

.causality-graph {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  overflow-x: auto;

  .causality-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 60px;

    .node-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      background: linear-gradient(135deg, #FF69B4, #FFB6C1);
      box-shadow: 0 2px 8px rgba(255, 105, 180, 0.3);
    }

    .node-label {
      font-size: 12px;
      color: #666;
      text-align: center;
    }

    &.source .node-icon {
      background: linear-gradient(135deg, #FF69B4, #FFB6C1);
    }

    &.target .node-icon {
      background: linear-gradient(135deg, #52c41a, #73d13d);
    }
  }

  .causality-arrows {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .causality-arrow {
      display: flex;
      align-items: center;
      gap: 4px;

      .arrow-line {
        width: 40px;
        height: 2px;
        position: relative;

        &.positive {
          background: #52c41a;
        }

        &.negative {
          background: #ff4d4f;
        }

        &::after {
          content: '';
          position: absolute;
          right: -4px;
          top: -3px;
          width: 0;
          height: 0;
          border-left: 6px solid currentColor;
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
        }
      }

      .arrow-label {
        font-size: 10px;
        color: #999;
      }
    }
  }

  .causality-targets {
    display: flex;
    gap: 8px;
  }
}

// 参数调整区域
.adjustment-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }

  .adjustment-list {
    .adjustment-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .adjustment-label {
        width: 80px;
        font-size: 14px;
        color: #666;
      }

      :deep(.van-slider) {
        flex: 1;
      }

      .adjustment-value {
        width: 48px;
        text-align: right;
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
    }
  }
}

// 操作区域
.action-section {
  padding: 8px 0;
}
</style>
