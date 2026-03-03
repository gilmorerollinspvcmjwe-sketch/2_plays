<template>
  <div class="comment-list">
    <h3 class="section-title">
      玩家评论
      <span class="count">({{ comments.length }})</span>
    </h3>

    <div v-if="comments.length === 0" class="empty-state">
      <van-empty description="暂无评论，快去生成一些吧">
        <template #image>
          <div class="empty-icon">💬</div>
        </template>
      </van-empty>
    </div>

    <div v-else class="comments-container">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="comment in displayComments"
            :key="comment.id"
            class="comment-card"
          >
            <!-- 头部信息 -->
            <div class="comment-header">
              <div class="user-info">
                <div class="avatar">{{ getAvatar(comment.playerType) }}</div>
                <div class="user-meta">
                  <span class="username">{{ getUsername(comment.playerType) }}</span>
                  <span class="time">{{ formatTime(comment.createdAt) }}</span>
                </div>
              </div>
              <van-tag
                :type="getSentimentType(comment.sentiment)"
                size="small"
                class="sentiment-tag"
              >
                {{ getSentimentLabel(comment.sentiment) }}
              </van-tag>
            </div>

            <!-- 评论内容 -->
            <div class="comment-content">
              <p>{{ comment.content }}</p>
            </div>

            <!-- 标签 -->
            <div class="comment-tags" v-if="comment.tags.length > 0">
              <van-tag
                v-for="tag in comment.tags"
                :key="tag"
                plain
                size="mini"
                class="tag"
              >
                #{{ tag }}
              </van-tag>
            </div>

            <!-- 互动按钮 -->
            <div class="comment-actions">
              <div
                class="action-btn"
                :class="{ active: comment.isLiked }"
                @click="handleLike(comment)"
              >
                <van-icon :name="comment.isLiked ? 'like' : 'like-o'" />
                <span>{{ comment.likes || '点赞' }}</span>
              </div>
              <div class="action-btn" @click="handleReply(comment)">
                <van-icon name="comment-o" />
                <span>{{ comment.replies || '回复' }}</span>
              </div>
              <div class="action-btn" @click="handleShare(comment)">
                <van-icon name="share-o" />
                <span>分享</span>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { showToast, showDialog } from 'vant';
import type { GameComment } from '@/stores/commentStore';
import type { CommentSentiment, PlayerType } from '@/types/template';

interface Props {
  comments: GameComment[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  like: [id: string];
  reply: [id: string];
  share: [comment: GameComment];
}>();

// 列表状态
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const pageSize = 10;
const currentPage = ref(1);

// 显示的评论
const displayComments = computed(() => {
  return props.comments.slice(0, currentPage.value * pageSize);
});

// 头像映射
const avatarMap: Record<PlayerType, string> = {
  '氪金大佬': '💎',
  '剧情党': '📖',
  '外观党': '✨',
  '休闲玩家': '☕'
};

// 用户名映射
const usernameMap: Record<PlayerType, string> = {
  '氪金大佬': '神秘氪佬',
  '剧情党': '剧情分析师',
  '外观党': '颜值控',
  '休闲玩家': '佛系玩家'
};

// 获取头像
function getAvatar(playerType: PlayerType): string {
  return avatarMap[playerType] || '👤';
}

// 获取用户名
function getUsername(playerType: PlayerType): string {
  const baseName = usernameMap[playerType] || '玩家';
  const randomId = Math.floor(Math.random() * 9999);
  return `${baseName}_${randomId}`;
}

// 情感标签类型
function getSentimentType(sentiment: CommentSentiment): string {
  const map: Record<CommentSentiment, string> = {
    positive: 'success',
    negative: 'danger',
    neutral: 'default'
  };
  return map[sentiment];
}

// 情感标签文字
function getSentimentLabel(sentiment: CommentSentiment): string {
  const map: Record<CommentSentiment, string> = {
    positive: '好评',
    negative: '差评',
    neutral: '中立'
  };
  return map[sentiment];
}

// 格式化时间
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  } else {
    return `${Math.floor(diff / 86400000)}天前`;
  }
}

// 点赞
function handleLike(comment: GameComment) {
  emit('like', comment.id);
}

// 回复
function handleReply(comment: GameComment) {
  showDialog({
    title: '回复评论',
    message: '功能开发中，敬请期待',
    confirmButtonText: '知道了'
  });
  emit('reply', comment.id);
}

// 分享
function handleShare(comment: GameComment) {
  showToast('已复制到剪贴板');
  emit('share', comment);
}

// 下拉刷新
function onRefresh() {
  setTimeout(() => {
    refreshing.value = false;
    showToast('刷新成功');
  }, 1000);
}

// 加载更多
function onLoad() {
  setTimeout(() => {
    if (currentPage.value * pageSize >= props.comments.length) {
      finished.value = true;
    } else {
      currentPage.value++;
      loading.value = false;
    }
  }, 500);
}
</script>

<style scoped lang="scss">
.comment-list {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  .count {
    font-size: 14px;
    color: #999;
    font-weight: normal;
  }
}

.empty-state {
  padding: 32px 0;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }
}

.comments-container {
  min-height: 300px;
}

.comment-card {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFB6C1, #FF69B4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .username {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .time {
    font-size: 12px;
    color: #999;
  }
}

.sentiment-tag {
  flex-shrink: 0;
}

.comment-content {
  margin-bottom: 12px;

  p {
    font-size: 14px;
    color: #333;
    line-height: 1.6;
    margin: 0;
  }
}

.comment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;

  .tag {
    margin: 0;
  }
}

.comment-actions {
  display: flex;
  gap: 24px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;

  &:active {
    opacity: 0.7;
  }

  &.active {
    color: #FF69B4;
  }

  .van-icon {
    font-size: 16px;
  }
}
</style>
