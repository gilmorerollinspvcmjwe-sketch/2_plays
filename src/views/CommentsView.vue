<template>
  <div class="comments-view">
    <!-- 舆论概览卡片 -->
    <div class="opinion-card">
      <div class="opinion-header">
        <h3 class="opinion-title">📊 舆情概览</h3>
        <van-tag :type="opinionTrendType" size="medium">
          {{ opinionTrendText }}
        </van-tag>
      </div>
      
      <div class="opinion-stats">
        <div class="stat-item">
          <div class="stat-label">舆论热度</div>
          <div class="stat-value" :class="getHeatClass(commentStore.publicOpinion.heat)">
            {{ commentStore.publicOpinion.heat }}
          </div>
          <div class="stat-bar">
            <div class="stat-fill" :style="{ width: `${commentStore.publicOpinion.heat}%` }"></div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">情感倾向</div>
          <div class="stat-value" :class="getSentimentClass(commentStore.publicOpinion.sentiment)">
            {{ commentStore.publicOpinion.sentiment > 0 ? '+' : '' }}{{ commentStore.publicOpinion.sentiment }}
          </div>
          <div class="stat-bar">
            <div class="stat-fill sentiment" :style="{ 
              width: `${Math.abs(commentStore.publicOpinion.sentiment)}%`,
              left: commentStore.publicOpinion.sentiment < 0 ? 'auto' : '50%',
              right: commentStore.publicOpinion.sentiment < 0 ? '50%' : 'auto'
            }"></div>
          </div>
        </div>
      </div>
      
      <!-- 触发事件 -->
      <div v-if="commentStore.publicOpinion.triggers.length > 0" class="opinion-triggers">
        <van-icon name="warning-o" color="#ee0a24" />
        <span class="trigger-text">{{ commentStore.publicOpinion.triggers[0] }}</span>
      </div>
    </div>

    <!-- 节奏事件提醒条 -->
    <van-notice-bar
      v-if="pendingRhythms.length > 0"
      left-icon="warning-o"
      :text="`有 ${pendingRhythms.length} 个节奏事件待处理`"
      color="#ee0a24"
      background="#ffe0e0"
      mode="closable"
      @click="showControlPanel = true"
      class="rhythm-alert"
    />

    <!-- 生成评论按钮 -->
    <div class="generate-section">
      <van-button
        type="primary"
        size="small"
        round
        block
        color="linear-gradient(to right, #FF69B4, #FFB6C1)"
        @click="handleGenerateComments"
      >
        ✍️ 生成新评论（消耗 20 积分）
      </van-button>
    </div>

    <!-- 多平台评论展示 -->
    <div class="platform-section">
      <PlatformComments />
    </div>

    <!-- 控评操作悬浮按钮 -->
    <van-floating-bubble
      axis="xy"
      magnetic="x"
      icon="warning-o"
      :badge="pendingRhythms.length > 0 ? pendingRhythms.length : undefined"
      @click="showControlPanel = true"
      class="control-bubble"
    />

    <!-- 控评操作面板 -->
    <van-popup v-model:show="showControlPanel" position="bottom" round :style="{ height: '50%' }">
      <div class="control-panel">
        <div class="panel-header">
          <h3>🎯 控评操作</h3>
          <van-icon name="cross" @click="showControlPanel = false" />
        </div>
        
        <div v-if="pendingRhythms.length === 0" class="empty-control">
          <van-empty description="暂无节奏事件" />
        </div>
        
        <div v-else class="control-options">
          <div class="rhythm-info">
            <p>当前有 <strong>{{ pendingRhythms.length }}</strong> 个节奏事件待处理</p>
            <p>预计声誉损失：<strong class="danger">{{ totalReputationLoss }}</strong></p>
          </div>
          
          <div class="option-cards">
            <div class="option-card" @click="handleControl('welfare')">
              <div class="option-icon">💎</div>
              <div class="option-title">发福利平息</div>
              <div class="option-cost">消耗 {{ pendingRhythms.length * 50 }} 钻石</div>
              <div class="option-desc">立即平息所有节奏，恢复声誉</div>
            </div>
            
            <div class="option-card" @click="handleControl('control')">
              <div class="option-icon">💰</div>
              <div class="option-title">控评操作</div>
              <div class="option-cost">消耗 {{ pendingRhythms.length * 100 }} 金币</div>
              <div class="option-desc">删除负面评论，控制舆论</div>
            </div>
            
            <div class="option-card" @click="handleControl('ignore')">
              <div class="option-icon">😶</div>
              <div class="option-title">装死</div>
              <div class="option-cost">免费</div>
              <div class="option-desc">50% 概率自然平息，50% 概率恶化</div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCommentStore, type CommentFilter, type GameComment } from '@/stores/commentStore';
import { useOperationStore } from '@/stores/operationStore';
import { showToast, showConfirmDialog } from 'vant';
import PlatformComments from '@/components/community/PlatformComments.vue';

const commentStore = useCommentStore();
const operationStore = useOperationStore();

const showControlPanel = ref(false);

// 筛选状态
const filter = ref<CommentFilter>({
  type: 'all',
  sentiment: 'all',
  playerType: 'all'
});

// 未解决的节奏事件
const pendingRhythms = computed(() => {
  return commentStore.getPendingRhythmEvents();
});

// 总声誉损失
const totalReputationLoss = computed(() => {
  return pendingRhythms.value.reduce((sum, e) => sum + Math.abs(e.reputationImpact), 0);
});

// 舆论趋势类型
const opinionTrendType = computed(() => {
  const trend = commentStore.publicOpinion.trend;
  if (trend === 'up') return 'success';
  if (trend === 'down') return 'danger';
  return 'default';
});

// 舆论趋势文字
const opinionTrendText = computed(() => {
  const trend = commentStore.publicOpinion.trend;
  if (trend === 'up') return '📈 上升';
  if (trend === 'down') return '📉 下降';
  return '➡️ 稳定';
});

// 处理控评操作
async function handleControl(method: 'welfare' | 'control' | 'ignore') {
  if (pendingRhythms.value.length === 0) {
    showToast('当前无节奏事件');
    return;
  }

  if (method !== 'ignore') {
    const confirmed = await showConfirmDialog({
      title: '确认操作',
      message: method === 'welfare' 
        ? `消耗 ${pendingRhythms.value.length * 50} 钻石发福利？`
        : `消耗 ${pendingRhythms.value.length * 100} 金币控评？`
    });
    if (confirmed !== 'confirm') return;
  }

  const result = await commentStore.controlOpinion(method);
  
  if (result.success) {
    showToast({
      message: result.message,
      icon: 'success'
    });
    showControlPanel.value = false;
    
    // 如果声誉有恢复，显示额外提示
    if (result.reputationChange && result.reputationChange > 0) {
      setTimeout(() => {
        showToast(`声誉恢复 +${result.reputationChange}`);
      }, 1000);
    }
  } else {
    showToast({
      message: result.message,
      icon: 'fail'
    });
  }
}

// 生成评论
async function handleGenerateComments() {
  const result = await commentStore.generateNewComments({
    playerType: 'casual',
    commentType: 'game',
    count: 5
  });
  
  if (result.success) {
    showToast(result.message);
  } else {
    showToast(result.message);
  }
}

// 获取热度等级颜色
function getHeatClass(heat: number): string {
  if (heat > 80) return 'high';
  if (heat > 50) return 'medium';
  return 'low';
}

// 获取情感等级颜色
function getSentimentClass(sentiment: number): string {
  if (sentiment > 50) return 'positive';
  if (sentiment < -50) return 'negative';
  return 'neutral';
}

// 初始化
onMounted(() => {
  commentStore.initDefaultComments();
  commentStore.updatePublicOpinion();
});
</script>

<style scoped lang="scss">
.comments-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  padding: 16px;
  padding-bottom: 80px;
}

// 舆论概览卡片
.opinion-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.opinion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.opinion-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.opinion-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  
  &.high { color: #ee0a24; }
  &.medium { color: #ff976a; }
  &.low { color: #07c160; }
  
  &.positive { color: #07c160; }
  &.negative { color: #ee0a24; }
  &.neutral { color: #999; }
}

.stat-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF69B4, #FFB6C1);
  border-radius: 3px;
  transition: width 0.3s ease;
  
  &.sentiment {
    background: linear-gradient(90deg, #ee0a24, #07c160);
  }
}

.opinion-triggers {
  margin-top: 12px;
  padding: 8px;
  background: #ffe0e0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  .trigger-text {
    font-size: 12px;
    color: #ee0a24;
  }
}

// 节奏事件提醒条
.rhythm-alert {
  margin-bottom: 16px;
  border-radius: 8px;
  cursor: pointer;
}

// 生成评论按钮
.generate-section {
  margin: 16px;
  
  .van-button {
    height: 40px;
    font-size: 14px;
  }
}

// 多平台评论区域
.platform-section {
  margin-bottom: 16px;
}

// 控评操作悬浮按钮
.control-bubble {
  position: fixed;
  bottom: 80px;
  right: 16px;
  z-index: 100;
}

// 控评操作面板
.control-panel {
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
  }
}

.empty-control {
  padding: 40px 0;
}

.rhythm-info {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  
  p {
    margin: 8px 0;
    font-size: 14px;
    
    strong {
      font-size: 16px;
      
      &.danger {
        color: #ee0a24;
      }
    }
  }
}

.option-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.option-card {
  background: white;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.95);
    border-color: #FF69B4;
  }
  
  .option-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  .option-title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .option-cost {
    font-size: 12px;
    color: #FF69B4;
    margin-bottom: 8px;
  }
  
  .option-desc {
    font-size: 11px;
    color: #999;
    line-height: 1.4;
  }
}
</style>
