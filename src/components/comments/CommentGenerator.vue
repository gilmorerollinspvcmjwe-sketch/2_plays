<template>
  <div class="comment-generator">
    <h3 class="section-title">
      <van-icon name="brush-o" />
      AI 评论生成器
    </h3>
    
    <!-- 玩家类型选择 -->
    <div class="form-item">
      <label class="form-label">玩家类型</label>
      <div class="player-types">
        <van-tag
          v-for="type in playerTypes"
          :key="type.value"
          :type="selectedPlayerType === type.value ? 'primary' : 'default'"
          :color="selectedPlayerType === type.value ? 'linear-gradient(to right, #FF69B4, #FFB6C1)' : ''"
          class="player-tag"
          size="large"
          @click="selectedPlayerType = type.value"
        >
          {{ type.label }}
        </van-tag>
      </div>
    </div>

    <!-- 评论类型选择 -->
    <div class="form-item">
      <label class="form-label">评论类型</label>
      <div class="comment-types">
        <van-tag
          v-for="type in commentTypes"
          :key="type.value"
          :type="selectedCommentType === type.value ? 'primary' : 'default'"
          :color="selectedCommentType === type.value ? 'linear-gradient(to right, #FF69B4, #FFB6C1)' : ''"
          class="comment-tag"
          size="large"
          @click="selectedCommentType = type.value"
        >
          {{ type.label }}
        </van-tag>
      </div>
    </div>

    <!-- 生成数量 -->
    <div class="form-item">
      <label class="form-label">
        生成数量: {{ generateCount }}条
      </label>
      <van-slider
        v-model="generateCount"
        :min="1"
        :max="10"
        :step="1"
        bar-height="4px"
        active-color="#FF69B4"
      />
    </div>

    <!-- 积分消耗提示 -->
    <div class="cost-info">
      <van-icon name="gem-o" color="#FFD700" />
      <span class="cost-text">
        预计消耗 <strong>{{ totalCost }}</strong> 积分
      </span>
      <span class="balance-text">
        (当前余额: {{ pointsStore.balance }})
      </span>
    </div>

    <!-- 生成按钮 -->
    <van-button
      type="primary"
      block
      round
      size="large"
      :loading="commentStore.isGenerating"
      :disabled="!canGenerate"
      color="linear-gradient(to right, #FF69B4, #FFB6C1)"
      @click="handleGenerate"
    >
      <template #icon>
        <van-icon name="magic" />
      </template>
      {{ commentStore.isGenerating ? '生成中...' : '生成评论' }}
    </van-button>

    <!-- 提示信息 -->
    <p class="tip-text">
      💡 使用 AI 模拟不同玩家群体的真实反馈
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCommentStore } from '@/stores/commentStore';
import { usePointsStore } from '@/stores/points';
import { showToast, showDialog } from 'vant';
import type { PlayerType, CommentType } from '@/types/template';

const commentStore = useCommentStore();
const pointsStore = usePointsStore();

const emit = defineEmits<{
  generate: [comments: any[]];
}>();

// 选项数据
const playerTypes = [
  { label: '💎 氪金大佬', value: '氪金大佬' as PlayerType },
  { label: '📖 剧情党', value: '剧情党' as PlayerType },
  { label: '✨ 外观党', value: '外观党' as PlayerType },
  { label: '☕ 休闲玩家', value: '休闲玩家' as PlayerType }
];

const commentTypes = [
  { label: '😤 吐槽', value: 'roast' as CommentType },
  { label: '👍 推荐', value: 'recommend' as CommentType },
  { label: '💭 讨论', value: 'drama' as CommentType },
  { label: '😂 梗图', value: 'meme' as CommentType }
];

// 选中状态
const selectedPlayerType = ref<PlayerType>('剧情党');
const selectedCommentType = ref<CommentType>('roast');
const generateCount = ref(3);

// 计算属性
const costPerComment = 20;
const totalCost = computed(() => generateCount.value * costPerComment);
const canGenerate = computed(() => {
  return pointsStore.balance >= totalCost.value && !commentStore.isGenerating;
});

// 生成评论
async function handleGenerate() {
  if (!canGenerate.value) {
    if (pointsStore.balance < totalCost.value) {
      showDialog({
        title: '积分不足',
        message: `需要${totalCost.value}积分，当前余额${pointsStore.balance}。快去签到获取积分吧！`,
        confirmButtonText: '去赚积分'
      });
    }
    return;
  }

  const result = await commentStore.generateNewComments({
    playerType: selectedPlayerType.value,
    commentType: selectedCommentType.value,
    count: generateCount.value
  });

  if (result.success) {
    showToast({
      message: result.message,
      icon: 'success'
    });
    emit('generate', result.comments);
  } else {
    showToast({
      message: result.message,
      icon: 'fail'
    });
  }
}
</script>

<style scoped lang="scss">
.comment-generator {
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.player-types,
.comment-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.player-tag,
.comment-tag {
  cursor: pointer;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.95);
  }
}

.cost-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #FFF5F7;
  border-radius: 8px;
  margin-bottom: 16px;
  
  .cost-text {
    font-size: 14px;
    color: #333;
    
    strong {
      color: #FF69B4;
      font-size: 16px;
    }
  }
  
  .balance-text {
    font-size: 12px;
    color: #999;
    margin-left: auto;
  }
}

.tip-text {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 12px;
  margin-bottom: 0;
}
</style>
