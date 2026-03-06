<template>
  <div class="comment-list">
    <!-- 渠道切换 Tab -->
    <van-tabs
      v-model:active="activePlatform"
      :color="currentPlatformColor"
      :title-active-color="currentPlatformColor"
      :title-inactive-color="platformTitleInactiveColor"
      class="platform-tabs"
      sticky
      :offset-top="0"
    >
      <van-tab
        v-for="platform in platforms"
        :key="platform.value"
        :name="platform.value"
        :title="platform.label"
      >
        <template #title>
          <span class="tab-title">
            <span class="platform-icon">{{ platform.icon }}</span>
            <span>{{ platform.label }}</span>
          </span>
        </template>
      </van-tab>
    </van-tabs>

    <h3 class="section-title">
      玩家评论
      <span class="count">({{ filteredComments.length }})</span>
    </h3>

    <div v-if="filteredComments.length === 0" class="empty-state">
      <van-empty description="暂无评论，上线项目后将根据玩家反馈生成真实评论">
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
            :style="{ borderLeftColor: platformColorMap[activePlatform] + '40' }"
          >
            <!-- 头部信息 -->
            <div class="comment-header">
              <div class="user-info">
                <div class="avatar" :style="{ background: getAvatarBackground(comment.platform) }">
                  {{ getAvatar(comment.playerType) }}
                </div>
                <div class="user-meta">
                  <span class="username">{{ getUsername(comment.playerType) }}</span>
                  <span class="platform-badge" :style="{ background: platformColorMap[comment.platform || 'weibo'] + '20', color: platformColorMap[comment.platform || 'weibo'] }">
                    {{ getPlatformLabel(comment.platform) }}
                  </span>
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

            <!-- 关联信息 -->
            <div class="association-info" v-if="comment.characterName || comment.plotTitle || comment.projectName">
              <van-tag
                v-if="comment.characterName"
                size="mini"
                class="association-tag"
                type="primary"
              >
                <van-icon name="user-o" />
                {{ comment.characterName }}
              </van-tag>
              <van-tag
                v-if="comment.plotTitle"
                size="mini"
                class="association-tag"
                type="success"
              >
                <van-icon name="bookmark-o" />
                {{ comment.plotTitle }}
              </van-tag>
              <van-tag
                v-if="comment.projectName && !comment.characterName && !comment.plotTitle"
                size="mini"
                class="association-tag"
                type="warning"
              >
                <van-icon name="apps-o" />
                {{ comment.projectName }}
              </van-tag>
            </div>

            <!-- 标签 -->
            <div class="comment-tags" v-if="comment.tags.length > 0">
              <van-tag
                v-for="tag in comment.tags"
                :key="tag"
                plain
                size="mini"
                class="tag"
                :color="platformColorMap[activePlatform] + '30'"
                :text-color="platformColorMap[activePlatform]"
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
                <span>{{ comment.comments || '回复' }}</span>
              </div>
              <div class="action-btn" @click="handleShare(comment)">
                <van-icon name="share-o" />
                <span>分享</span>
              </div>
              <div class="action-btn heat-btn">
                <van-icon name="fire-o" />
                <span>{{ formatHeat(comment.heat) }}</span>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { showToast, showDialog } from 'vant';
import type { GameComment, PlatformType } from '@/stores/commentStore';
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

// 平台配置
const platforms = [
  { value: 'douyin' as PlatformType, label: '抖音', icon: '🎵', color: '#000000' },
  { value: 'xiaohongshu' as PlatformType, label: '小红书', icon: '📕', color: '#ff2442' },
  { value: 'weibo' as PlatformType, label: '微博', icon: '🧣', color: '#fa7d3c' },
  { value: 'bilibili' as PlatformType, label: 'B 站', icon: '📺', color: '#fb7299' },
  { value: 'tieba' as PlatformType, label: '贴吧', icon: '🎯', color: '#3385ff' }
];

// 平台颜色映射
const platformColorMap: Record<PlatformType, string> = {
  douyin: '#000000',
  xiaohongshu: '#ff2442',
  weibo: '#fa7d3c',
  bilibili: '#fb7299',
  tieba: '#3385ff'
};

// 当前选中的平台
const activePlatform = ref<PlatformType>('douyin');

// 计算属性
const currentPlatformColor = computed(() => {
  return platformColorMap[activePlatform.value];
});

const platformTitleInactiveColor = computed(() => {
  return activePlatform.value === 'douyin' ? '#666666' : '#999999';
});

// 按平台筛选评论
const filteredComments = computed(() => {
  return props.comments.filter(comment => comment.platform === activePlatform.value);
});

// 列表状态
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const pageSize = 10;
const currentPage = ref(1);

// 显示的评论
const displayComments = computed(() => {
  return filteredComments.value.slice(0, currentPage.value * pageSize);
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

// 获取头像背景色
function getAvatarBackground(platform?: PlatformType): string {
  const colorMap: Record<PlatformType, string> = {
    douyin: 'linear-gradient(135deg, #1a1a1a, #333333)',
    xiaohongshu: 'linear-gradient(135deg, #ff2442, #ff6b7a)',
    weibo: 'linear-gradient(135deg, #fa7d3c, #ffb347)',
    bilibili: 'linear-gradient(135deg, #fb7299, #ffb6c1)',
    tieba: 'linear-gradient(135deg, #3385ff, #66a3ff)'
  };
  return colorMap[platform || 'weibo'];
}

// 获取用户名
function getUsername(playerType: PlayerType): string {
  const baseName = usernameMap[playerType] || '玩家';
  const randomId = Math.floor(Math.random() * 9999);
  return `${baseName}_${randomId}`;
}

// 获取平台标签
function getPlatformLabel(platform?: PlatformType): string {
  const platformLabels: Record<PlatformType, string> = {
    douyin: '抖音',
    xiaohongshu: '小红书',
    weibo: '微博',
    bilibili: 'B站',
    tieba: '贴吧'
  };
  return platformLabels[platform || 'weibo'] || '微博';
}

// 格式化热度
function formatHeat(heat: number): string {
  if (heat >= 1000) {
    return (heat / 1000).toFixed(1) + 'k';
  }
  return Math.round(heat).toString();
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
    if (currentPage.value * pageSize >= filteredComments.value.length) {
      finished.value = true;
    } else {
      currentPage.value++;
      loading.value = false;
    }
  }, 500);
}

// 监听平台切换，重置分页
watch(activePlatform, () => {
  currentPage.value = 1;
  finished.value = false;
});

// 监听评论变化，重置分页
watch(() => props.comments, () => {
  currentPage.value = 1;
  finished.value = false;
}, { deep: true });
</script>

<style scoped lang="scss">
.comment-list {
  background: white;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
}

.platform-tabs {
  :deep(.van-tabs__wrap) {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .tab-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;

    .platform-icon {
      font-size: 16px;
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 16px;
  margin-bottom: 12px;
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
  padding: 0 16px 16px;
}

.comment-card {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #fafafa;
  }
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .username {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .platform-badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    width: fit-content;
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
    word-break: break-all;
  }
}

.association-info {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;

  .association-tag {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 2px 6px;
    font-size: 11px;

    .van-icon {
      font-size: 10px;
    }
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
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
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

  &.heat-btn {
    margin-left: auto;
    color: #ff6b6b;
  }

  .van-icon {
    font-size: 16px;
  }
}
</style>
