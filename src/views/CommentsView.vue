<template>
  <div class="comments-view">
    <!-- 情感分析概览 -->
    <SentimentOverview :stats="commentStore.sentimentStats" />

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

    <!-- AI 评论生成器 -->
    <CommentGenerator @generate="handleGeneratedComments" />

    <!-- 评论列表（已整合多渠道功能） -->
    <CommentList
      :comments="displayedComments"
      @like="handleLikeComment"
      @reply="handleReplyComment"
      @share="handleShareComment"
    />

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
import { showToast, showConfirmDialog, showDialog } from 'vant';
import CommentGenerator from '@/components/comments/CommentGenerator.vue';
import CommentList from '@/components/comments/CommentList.vue';
import SentimentOverview from '@/components/comments/SentimentOverview.vue';

const commentStore = useCommentStore();
const operationStore = useOperationStore();

const showControlPanel = ref(false);

// 筛选状态
const filter = ref<CommentFilter>({
  type: 'all',
  sentiment: 'all',
  playerType: 'all'
});

// 显示所有评论
const displayedComments = computed(() => {
  return commentStore.comments;
});

// 未解决的节奏事件
const pendingRhythms = computed(() => {
  return commentStore.getPendingRhythmEvents();
});

// 总声誉损失
const totalReputationLoss = computed(() => {
  return pendingRhythms.value.reduce((sum, e) => sum + Math.abs(e.reputationImpact), 0);
});

// 处理生成的评论
function handleGeneratedComments(newComments: GameComment[]) {
  showToast({
    message: `成功生成${newComments.length}条评论`,
    icon: 'success'
  });
}

// 处理点赞
function handleLikeComment(id: string) {
  const success = commentStore.likeComment(id);
  if (success) {
    showToast('已点赞');
  }
}

// 处理回复
function handleReplyComment(id: string) {
  showDialog({
    title: '回复评论',
    message: '功能开发中，敬请期待',
    confirmButtonText: '知道了'
  });
}

// 处理分享
function handleShareComment(comment: GameComment) {
  showToast('已复制到剪贴板');
}

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

// 节奏事件提醒条
.rhythm-alert {
  margin-bottom: 16px;
  border-radius: 8px;
  cursor: pointer;
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
