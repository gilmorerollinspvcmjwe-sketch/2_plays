<template>
  <div class="platform-comments" :style="{ background: platformBackground }">
    <!-- 平台切换 Tab -->
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

    <!-- 排序选项 -->
    <div class="sort-bar">
      <van-cell-group inset>
        <van-cell
          title="排序方式"
          :value="sortLabel"
          is-link
          @click="showSortPicker = true"
        />
      </van-cell-group>
    </div>

    <!-- 评论统计 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-value">{{ totalComments }}</span>
        <span class="stat-label">条评论</span>
      </div>
      <div class="stat-item">
        <van-tag :color="platformColorMap[currentPlatform]" size="medium">
          {{ currentPlatformLabel }}
        </van-tag>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多评论了"
          @load="onLoad"
        >
          <div
            v-for="comment in displayComments"
            :key="comment.id"
            class="comment-card"
            :style="{ borderColor: platformColorMap[currentPlatform] + '20' }"
          >
            <!-- 评论内容 -->
            <div class="comment-content">
              <p class="text">
                <span class="platform-emoji">{{ getPlatformEmoji(currentPlatform) }}</span>
                {{ comment.content }}
                <span class="platform-emoji">{{ getPlatformEmoji(currentPlatform) }}</span>
              </p>
            </div>

            <!-- 标签 -->
            <div class="comment-tags" v-if="comment.tags.length > 0">
              <van-tag
                v-for="tag in comment.tags"
                :key="tag"
                plain
                :color="platformColorMap[currentPlatform] + '10'"
                :text-color="platformColorMap[currentPlatform]"
                size="mini"
                class="tag"
              >
                #{{ tag }}
              </van-tag>
            </div>

            <!-- 情感标签 -->
            <div class="sentiment-section">
              <van-tag
                :type="getSentimentType(comment.sentiment)"
                :color="getSentimentColor(comment.sentiment)"
                size="small"
                class="sentiment-tag"
              >
                {{ getSentimentLabel(comment.sentiment) }}
              </van-tag>
            </div>

            <!-- 互动数据 -->
            <div class="comment-actions">
              <div class="action-item" @click="handleLike(comment)">
                <van-icon 
                  :name="comment.isLiked ? 'like' : 'like-o'" 
                  :color="comment.isLiked ? platformColorMap[currentPlatform] : platformColorMap[currentPlatform]" 
                />
                <span class="action-text">{{ comment.likes }}</span>
              </div>
              <div class="action-item" @click="handleShare(comment)">
                <van-icon name="share-o" :color="platformColorMap[currentPlatform]" />
                <span class="action-text">{{ comment.shares }}</span>
              </div>
              <div class="action-item" @click="handleComment(comment)">
                <van-icon name="comment-o" :color="platformColorMap[currentPlatform]" />
                <span class="action-text">{{ comment.comments }}</span>
              </div>
              <div class="action-item">
                <van-icon name="star-o" :color="platformColorMap[currentPlatform]" />
                <span class="action-text">{{ formatNumber(comment.heat) }}</span>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 排序选择器 -->
    <van-popup v-model:show="showSortPicker" position="bottom" round>
      <van-picker
        :columns="sortOptions"
        v-model="currentSort"
        @confirm="onSortConfirm"
        @cancel="showSortPicker = false"
        :title="'排序方式'"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { showToast } from 'vant';
import { useCommentStore, type GameComment, type PlatformType } from '@/stores/commentStore';

type PlatformCommentSentiment = 'positive' | 'negative' | 'neutral';

// 引入 Store
const commentStore = useCommentStore();

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

// 平台背景色（带透明度）
const platformBackgroundMap: Record<PlatformType, string> = {
  douyin: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)',
  xiaohongshu: 'linear-gradient(180deg, #fff5f6 0%, #ffe4e6 100%)',
  weibo: 'linear-gradient(180deg, #fff9f5 0%, #fff0e6 100%)',
  bilibili: 'linear-gradient(180deg, #fff5f7 0%, #ffeef2 100%)',
  tieba: 'linear-gradient(180deg, #f5f9ff 0%, #e8f0ff 100%)'
};

// 排序选项
const sortOptions = [
  { text: '最热排序', value: 'hot' },
  { text: '最新排序', value: 'new' },
  { text: '好评优先', value: 'positive' },
  { text: '差评优先', value: 'negative' }
];

// 状态
const activePlatform = ref<PlatformType>('douyin');
const currentSort = ref('hot');
const showSortPicker = ref(false);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const allComments = ref<GameComment[]>([]);
const displayComments = ref<GameComment[]>([]);
const pageSize = 10;
const currentPage = ref(1);

// 计算属性
const currentPlatformColor = computed(() => {
  return platformColorMap[activePlatform.value];
});

const platformTitleInactiveColor = computed(() => {
  return activePlatform.value === 'douyin' ? '#666666' : '#999999';
});

const platformBackground = computed(() => {
  return platformBackgroundMap[activePlatform.value];
});

const currentPlatformLabel = computed(() => {
  const platform = platforms.find(p => p.value === activePlatform.value);
  return platform?.label || '';
});

const totalComments = computed(() => {
  return allComments.value.length;
});

const sortLabel = computed(() => {
  const option = sortOptions.find(o => o.value === currentSort.value);
  return option?.text || '最热排序';
});

// 情感标签类型
function getSentimentType(sentiment: PlatformCommentSentiment): string {
  const map: Record<PlatformCommentSentiment, string> = {
    positive: 'success',
    negative: 'danger',
    neutral: 'default'
  };
  return map[sentiment];
}

// 情感标签颜色
function getSentimentColor(sentiment: PlatformCommentSentiment): string | undefined {
  const map: Record<PlatformCommentSentiment, string> = {
    positive: '#52c41a',
    negative: '#ff4d4f',
    neutral: '#999999'
  };
  return map[sentiment];
}

// 情感标签文字
function getSentimentLabel(sentiment: PlatformCommentSentiment): string {
  const map: Record<PlatformCommentSentiment, string> = {
    positive: '好评',
    negative: '差评',
    neutral: '中立'
  };
  return map[sentiment];
}

// 格式化数字（四舍五入取整）
function formatNumber(num: number): number {
  return Math.round(num);
}

// 加载评论（完全从 Store 获取）
function loadComments(platform: PlatformType) {
  loading.value = true;
  
  // 从 Store 获取所有评论
  const allStoreComments = commentStore.comments;
  
  // 按平台筛选评论
  // 如果评论有 platform 字段，则精确匹配
  // 如果没有 platform 字段，则根据内容特征智能分配
  const platformComments = allStoreComments.filter(comment => {
    // 如果评论已指定平台，直接匹配
    if (comment.platform) {
      return comment.platform === platform;
    }
    
    // 没有平台标记的评论，根据内容特征智能分配
    return assignPlatformByContent(comment, platform);
  });
  
  // 如果该平台评论不足，从所有评论中补充
  let finalComments = [...platformComments];
  if (finalComments.length < 5) {
    const otherComments = allStoreComments.filter(c => 
      !finalComments.includes(c) && 
      (!c.platform || c.platform !== platform)
    );
    finalComments = [...finalComments, ...otherComments.slice(0, 10 - finalComments.length)];
  }
  
  // 排序
  const sorted = sortComments(finalComments, currentSort.value);
  
  allComments.value = sorted;
  displayComments.value = sorted.slice(0, pageSize);
  currentPage.value = 1;
  finished.value = sorted.length <= pageSize;
  loading.value = false;
}

// 根据评论内容特征智能分配平台
function assignPlatformByContent(comment: GameComment, targetPlatform: PlatformType): boolean {
  const content = comment.content.toLowerCase();
  
  // 平台特征关键词
  const platformKeywords: Record<PlatformType, string[]> = {
    douyin: ['家人们', '谁懂啊', '绝绝子', '咱就是说', '真的会谢', 'yyds', '破防了'],
    xiaohongshu: ['姐妹们', '亲测', '安利', '种草', '拔草', '集美', '真的爱了', '太绝了'],
    weibo: ['热搜', '求图', '塌房', '吃瓜', '实锤', '转发', '微博', '热搜榜'],
    bilibili: ['前方高能', '泪目', '爷青回', '下次一定', '一键三连', 'up主', '弹幕'],
    tieba: ['有一说一', '老哥们', '白嫖', '氪金', '肝帝', '大佬', '萌新']
  };
  
  const keywords = platformKeywords[targetPlatform] || [];
  return keywords.some(keyword => content.includes(keyword));
}

// 排序评论
function sortComments(
  comments: GameComment[],
  sortType: string
): GameComment[] {
  const sorted = [...comments];
  
  switch (sortType) {
    case 'hot':
      // 按热度降序
      sorted.sort((a, b) => b.heat - a.heat);
      break;
    case 'new':
      // 按时间降序
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'positive':
      // 好评优先
      sorted.sort((a, b) => {
        if (a.sentiment === 'positive' && b.sentiment !== 'positive') return -1;
        if (a.sentiment !== 'positive' && b.sentiment === 'positive') return 1;
        return b.heat - a.heat;
      });
      break;
    case 'negative':
      // 差评优先
      sorted.sort((a, b) => {
        if (a.sentiment === 'negative' && b.sentiment !== 'negative') return -1;
        if (a.sentiment !== 'negative' && b.sentiment === 'negative') return 1;
        return b.heat - a.heat;
      });
      break;
  }
  
  return sorted;
}

// 下拉刷新
function onRefresh() {
  setTimeout(() => {
    loadComments(activePlatform.value);
    refreshing.value = false;
    showToast('刷新成功');
  }, 1000);
}

// 加载更多
function onLoad() {
  setTimeout(() => {
    const start = currentPage.value * pageSize;
    const end = start + pageSize;
    const newComments = allComments.value.slice(start, end);
    
    if (newComments.length === 0) {
      finished.value = true;
    } else {
      displayComments.value = [...displayComments.value, ...newComments];
      currentPage.value++;
      finished.value = displayComments.value.length >= allComments.value.length;
    }
    
    loading.value = false;
  }, 500);
}

// 排序确认
function onSortConfirm({ value }: { value: string }) {
  currentSort.value = value;
  showSortPicker.value = false;
  loadComments(activePlatform.value);
  showToast(`已按${sortLabel.value}排列`);
}

// 点赞处理
function handleLike(comment: GameComment) {
  if (comment.isLiked) {
    // 取消点赞
    commentStore.updateCommentInteraction(comment.id, 'like', false);
    comment.likes--;
    comment.isLiked = false;
  } else {
    // 点赞
    commentStore.updateCommentInteraction(comment.id, 'like', true);
    comment.likes++;
    comment.isLiked = true;
    showToast('点赞成功');
  }
}

// 分享处理
function handleShare(comment: GameComment) {
  commentStore.updateCommentInteraction(comment.id, 'share', true);
  comment.shares++;
  showToast('分享成功');
}

// 评论处理
function handleComment(comment: GameComment) {
  commentStore.updateCommentInteraction(comment.id, 'comment', true);
  comment.comments++;
  showToast('评论成功');
}

// 获取平台特有 emoji
function getPlatformEmoji(platform: PlatformType): string {
  const emojiMap: Record<PlatformType, string> = {
    douyin: '🔥',
    xiaohongshu: '✨',
    weibo: '🧣',
    bilibili: '📺',
    tieba: '🎯'
  };
  return emojiMap[platform] || '💬';
}

// 平台切换
function onPlatformChange() {
  loading.value = true;
  finished.value = false;
  displayComments.value = [];
  loadComments(activePlatform.value);
}

// 监听 Store 评论变化
watch(() => commentStore.comments, () => {
  loadComments(activePlatform.value);
}, { deep: true });

// 初始化
onMounted(() => {
  // 如果 Store 中没有评论，先生成一些
  if (commentStore.comments.length === 0) {
    commentStore.generateDailyComments(20);
  }
  loadComments(activePlatform.value);
});
</script>

<style scoped lang="scss">
.platform-comments {
  min-height: 100vh;
  padding-bottom: 20px;
  transition: background 0.3s ease;
}

.platform-tabs {
  :deep(.van-tabs__wrap) {
    background: rgba(255, 255, 255, 0.9);
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

.sort-bar {
  margin: 12px 16px;

  :deep(.van-cell) {
    padding: 12px 16px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
  }
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #333;
    }

    .stat-label {
      font-size: 14px;
      color: #999;
    }
  }
}

.comments-list {
  padding: 0 16px;
}

.comment-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

.comment-content {
  margin-bottom: 12px;

  .text {
    font-size: 15px;
    color: #333;
    line-height: 1.6;
    margin: 0;
    word-break: break-all;

    .platform-emoji {
      font-size: 14px;
      margin: 0 4px;
      opacity: 0.8;
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

.sentiment-section {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;

  .sentiment-tag {
    border-radius: 4px;
    font-weight: 500;
  }
}

.comment-actions {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);

  .action-item {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:active {
      opacity: 0.7;
    }

    .van-icon {
      font-size: 18px;
    }

    .action-text {
      font-size: 13px;
      color: #666;
    }
  }
}

// 抖音特殊样式
:deep(.douyin-theme) {
  .comment-card {
    background: rgba(30, 30, 30, 0.9);
    color: #fff;

    .comment-content .text {
      color: #fff;
    }

    .comment-actions .action-text {
      color: #ccc;
    }
  }
}
</style>
