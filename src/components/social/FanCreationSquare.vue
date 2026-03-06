<template>
  <div class="fan-creation-square">
    <div class="square-header">
      <h3 class="title">✨ 同人广场</h3>
      <div class="stats" v-if="fanworkStore.hasFanworks">
        <span class="stat-item">作品: {{ fanworkStore.totalCount }}</span>
        <span class="stat-item">热度: {{ formatHeat(fanworkStore.totalHeat) }}</span>
      </div>
    </div>

    <van-tabs
      v-model:active="activeTab"
      sticky
      color="#667eea"
      title-active-color="#667eea"
    >
      <van-tab title="全部" name="all">
        <template #title>
          <span class="tab-title">📋 全部</span>
        </template>
      </van-tab>
      <van-tab title="绘画" name="绘画">
        <template #title>
          <span class="tab-title">🎨 绘画</span>
        </template>
      </van-tab>
      <van-tab title="文稿" name="文稿">
        <template #title>
          <span class="tab-title">📝 文稿</span>
        </template>
      </van-tab>
      <van-tab title="视频" name="视频">
        <template #title>
          <span class="tab-title">🎬 视频</span>
        </template>
      </van-tab>
      <van-tab title="COS" name="COS">
        <template #title>
          <span class="tab-title">👘 COS</span>
        </template>
      </van-tab>
    </van-tabs>

    <div class="creation-list">
      <!-- 空状态 -->
      <div v-if="!fanworkStore.hasFanworks" class="empty-state">
        <van-empty description="还没有同人作品" image="default">
          <template #description>
            <div class="empty-description">
              <p class="empty-title">还没有同人作品</p>
              <p class="empty-subtitle">等项目积累一定热度后会激发创作灵感</p>
            </div>
          </template>
        </van-empty>
      </div>

      <!-- 有数据时的列表 -->
      <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多作品了"
          @load="onLoad"
        >
          <div class="fanwork-list">
            <div
              v-for="fanwork in displayFanworks"
              :key="fanwork.id"
              class="fanwork-card"
              @click="viewFanwork(fanwork)"
            >
              <!-- 图片类型（绘画/COS） -->
              <div v-if="fanwork.type === '绘画' || fanwork.type === 'COS'" class="image-card">
                <img
                  :src="fanwork.imageUrl || 'https://picsum.photos/400/300'"
                  :alt="fanwork.title"
                  class="fanwork-image"
                />
                <div class="image-overlay">
                  <span class="quality-badge" :style="{ background: getQualityColor(fanwork.quality) }">
                    {{ fanwork.quality }}
                  </span>
                  <span class="type-badge">{{ fanwork.type }}</span>
                </div>
                <div class="image-info">
                  <h4 class="fanwork-title">{{ fanwork.title }}</h4>
                  <div class="association-info" v-if="fanwork.characterName || fanwork.plotTitle">
                    <span v-if="fanwork.characterName" class="assoc-tag character">
                      <van-icon name="user-o" /> {{ fanwork.characterName }}
                    </span>
                    <span v-if="fanwork.plotTitle" class="assoc-tag plot">
                      <van-icon name="bookmark-o" /> {{ fanwork.plotTitle }}
                    </span>
                    <span v-if="fanwork.cpPairNames && fanwork.cpPairNames.length > 1" class="assoc-tag cp">
                      <van-icon name="like-o" /> {{ fanwork.cpPairNames.join('×') }}
                    </span>
                  </div>
                  <div class="fanwork-meta">
                    <span class="author">by {{ fanwork.authorName }}</span>
                    <div class="stats">
                      <span><van-icon name="like-o" /> {{ fanwork.likes }}</span>
                      <span><van-icon name="eye-o" /> {{ formatViews(fanwork.views) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 文本类型（文稿/视频） -->
              <div v-else class="text-card">
                <div class="card-header">
                  <div class="type-quality">
                    <span class="type-tag">{{ fanwork.type }}</span>
                    <span class="quality-tag" :style="{ color: getQualityColor(fanwork.quality) }">
                      {{ fanwork.quality }}
                    </span>
                  </div>
                  <span class="time">{{ formatTime(fanwork.createdAt) }}</span>
                </div>
                <h4 class="fanwork-title">{{ fanwork.title }}</h4>
                <p class="fanwork-excerpt">{{ getExcerpt(fanwork.content) }}</p>
                <div class="association-info" v-if="fanwork.characterName || fanwork.plotTitle">
                  <span v-if="fanwork.characterName" class="assoc-tag character">
                    <van-icon name="user-o" /> {{ fanwork.characterName }}
                  </span>
                  <span v-if="fanwork.plotTitle" class="assoc-tag plot">
                    <van-icon name="bookmark-o" /> {{ fanwork.plotTitle }}
                  </span>
                  <span v-if="fanwork.cpPairNames && fanwork.cpPairNames.length > 1" class="assoc-tag cp">
                    <van-icon name="like-o" /> {{ fanwork.cpPairNames.join('×') }}
                  </span>
                </div>
                <div class="card-footer">
                  <span class="author">by {{ fanwork.authorName }}</span>
                  <div class="stats">
                    <span><van-icon name="like-o" /> {{ fanwork.likes }}</span>
                    <span><van-icon name="eye-o" /> {{ formatViews(fanwork.views) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 详情弹窗 -->
    <van-popup
      v-model:show="showDetail"
      position="bottom"
      round
      :style="{ height: selectedFanwork?.type === '绘画' || selectedFanwork?.type === 'COS' ? '85%' : '75%' }"
    >
      <div v-if="selectedFanwork" class="detail-popup">
        <div class="detail-header">
          <div class="detail-type-quality">
            <span class="detail-type">{{ selectedFanwork.type }}</span>
            <span class="detail-quality" :style="{ color: getQualityColor(selectedFanwork.quality) }">
              {{ selectedFanwork.quality }}
            </span>
          </div>
          <van-icon name="cross" @click="showDetail = false" />
        </div>

        <!-- 图片展示 -->
        <div v-if="selectedFanwork.type === '绘画' || selectedFanwork.type === 'COS'" class="detail-image">
          <img
            :src="selectedFanwork.imageUrl || 'https://picsum.photos/400/400'"
            :alt="selectedFanwork.title"
          />
        </div>

        <div class="detail-content-wrapper">
          <h3 class="detail-title">{{ selectedFanwork.title }}</h3>

          <!-- 关联信息 -->
          <div class="detail-association" v-if="selectedFanwork.characterName || selectedFanwork.plotTitle">
            <div class="assoc-title">作品关联</div>
            <div class="assoc-list">
              <span v-if="selectedFanwork.projectName" class="detail-assoc-tag project">
                <van-icon name="apps-o" /> {{ selectedFanwork.projectName }}
              </span>
              <span v-if="selectedFanwork.characterName" class="detail-assoc-tag character">
                <van-icon name="user-o" /> {{ selectedFanwork.characterName }}
              </span>
              <span v-if="selectedFanwork.plotTitle" class="detail-assoc-tag plot">
                <van-icon name="bookmark-o" /> {{ selectedFanwork.plotTitle }}
              </span>
              <span v-if="selectedFanwork.cpPairNames && selectedFanwork.cpPairNames.length > 1" class="detail-assoc-tag cp">
                <van-icon name="like-o" /> {{ selectedFanwork.cpPairNames.join(' × ') }}
              </span>
            </div>
          </div>

          <!-- 标签 -->
          <div class="detail-tags" v-if="selectedFanwork.tags && selectedFanwork.tags.length > 0">
            <span v-for="tag in selectedFanwork.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>

          <!-- 内容 -->
          <div class="detail-content">
            <p>{{ selectedFanwork.content }}</p>
          </div>
        </div>

        <div class="detail-meta">
          <span class="author">by {{ selectedFanwork.authorName }}</span>
          <span class="time">{{ formatTime(selectedFanwork.createdAt) }}</span>
        </div>

        <div class="detail-stats">
          <div class="stat-item">
            <van-icon name="eye-o" />
            <span>{{ formatViews(selectedFanwork.views) }} 浏览</span>
          </div>
          <div class="stat-item">
            <van-icon name="like-o" />
            <span>{{ selectedFanwork.likes }} 点赞</span>
          </div>
        </div>

        <div class="detail-actions">
          <van-button
            :type="selectedFanwork.isLiked ? 'danger' : 'default'"
            size="large"
            round
            @click="handleLike(selectedFanwork)"
          >
            <van-icon :name="selectedFanwork.isLiked ? 'like' : 'like-o'" />
            {{ selectedFanwork.isLiked ? '已点赞' : '点赞' }}
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { showToast } from 'vant';
import {
  useFanworkStore,
  QUALITY_STYLES,
  type Fanwork,
  type FanworkUIType,
} from '@/stores/fanworkStore';

const fanworkStore = useFanworkStore();

const activeTab = ref<'all' | FanworkUIType>('all');
const showDetail = ref(false);
const selectedFanwork = ref<Fanwork | null>(null);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const pageSize = 10;
const currentPage = ref(1);
const displayFanworks = ref<Fanwork[]>([]);

// 当前筛选后的同人作品
const currentFanworks = computed(() => {
  if (activeTab.value === 'all') {
    return fanworkStore.fanworks;
  }
  return fanworkStore.fanworksByType[activeTab.value] || [];
});

// 加载同人作品
function loadFanworks() {
  currentPage.value = 1;
  const start = 0;
  const end = pageSize;
  displayFanworks.value = currentFanworks.value.slice(start, end);
  finished.value = displayFanworks.value.length >= currentFanworks.value.length;
  loading.value = false;
}

// 加载更多
function onLoad() {
  setTimeout(() => {
    currentPage.value++;
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    const newFanworks = currentFanworks.value.slice(start, end);

    if (newFanworks.length === 0) {
      finished.value = true;
    } else {
      displayFanworks.value = [...displayFanworks.value, ...newFanworks];
    }
    loading.value = false;
  }, 500);
}

// 刷新
function onRefresh() {
  setTimeout(() => {
    // 同步 simulationStore 的数据
    fanworkStore.syncFromSimulation();
    loadFanworks();
    refreshing.value = false;
    showToast('刷新成功');
  }, 1000);
}

// 监听标签切换
watch(activeTab, () => {
  fanworkStore.setFilter(activeTab.value);
  loadFanworks();
});

// 监听 store 数据变化
watch(
  () => currentFanworks.value.length,
  () => {
    loadFanworks();
  }
);

// 点赞
async function handleLike(fanwork: Fanwork) {
  const result = await fanworkStore.toggleLike(fanwork.id);
  if (result.success) {
    showToast(result.message);
  }
}

// 查看详情
function viewFanwork(fanwork: Fanwork) {
  selectedFanwork.value = fanwork;
  showDetail.value = true;
}

// 获取质量颜色
function getQualityColor(quality: string): string {
  return QUALITY_STYLES[quality as keyof typeof QUALITY_STYLES]?.color || '#999';
}

// 获取内容摘要
function getExcerpt(content?: string): string {
  if (!content) return '';
  return content.slice(0, 80) + (content.length > 80 ? '...' : '');
}

// 格式化热度
function formatHeat(heat: number): string {
  if (heat >= 10000) {
    return (heat / 10000).toFixed(1) + 'w';
  }
  return heat.toString();
}

// 格式化浏览量
function formatViews(views: number): string {
  if (views >= 10000) {
    return (views / 10000).toFixed(1) + 'w';
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'k';
  }
  return views.toString();
}

// 格式化时间
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString();
}

onMounted(() => {
  // 同步 simulationStore 的数据
  fanworkStore.syncFromSimulation();
  loadFanworks();
});
</script>

<style scoped lang="scss">
.fan-creation-square {
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  min-height: 100vh;
}

.square-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;

  .title {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin: 0;
  }

  .stats {
    display: flex;
    gap: 12px;

    .stat-item {
      font-size: 12px;
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      padding: 4px 8px;
      border-radius: 10px;
    }
  }
}

.tab-title {
  font-size: 13px;
}

.creation-list {
  padding: 16px;
}

// 空状态
.empty-state {
  padding: 40px 0;

  .empty-description {
    text-align: center;

    .empty-title {
      font-size: 16px;
      color: #333;
      margin: 0 0 8px 0;
    }

    .empty-subtitle {
      font-size: 13px;
      color: #999;
      margin: 0;
    }
  }
}

// 同人作品列表
.fanwork-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fanwork-card {
  cursor: pointer;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }
}

// 图片卡片（绘画/COS）
.image-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .fanwork-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .image-overlay {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    gap: 6px;

    .quality-badge,
    .type-badge {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      color: white;
    }

    .type-badge {
      background: rgba(0, 0, 0, 0.5);
    }
  }

  .image-info {
    padding: 12px;

    .fanwork-title {
      font-size: 15px;
      font-weight: bold;
      color: #333;
      margin: 0 0 8px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .association-info {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;
    }

    .fanwork-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .author {
        font-size: 12px;
        color: #999;
      }

      .stats {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: #999;

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }
}

// 文本卡片（文稿/视频）
.text-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .type-quality {
      display: flex;
      gap: 8px;
      align-items: center;

      .type-tag {
        font-size: 12px;
        color: #667eea;
        background: rgba(102, 126, 234, 0.1);
        padding: 2px 8px;
        border-radius: 4px;
      }

      .quality-tag {
        font-size: 12px;
        font-weight: bold;
      }
    }

    .time {
      font-size: 11px;
      color: #ccc;
    }
  }

  .fanwork-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin: 0 0 8px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fanwork-excerpt {
    font-size: 13px;
    color: #666;
    line-height: 1.6;
    margin: 0 0 10px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .association-info {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;

    .author {
      font-size: 12px;
      color: #999;
    }

    .stats {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #999;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

// 关联标签
.assoc-tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 2px;

  &.character {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

  &.plot {
    background: rgba(78, 205, 196, 0.1);
    color: #4ecdc4;
  }

  &.cp {
    background: rgba(255, 107, 107, 0.1);
    color: #ff6b6b;
  }
}

// 详情弹窗
.detail-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .detail-type-quality {
      display: flex;
      gap: 8px;
      align-items: center;

      .detail-type {
        font-size: 14px;
        color: #667eea;
        background: rgba(102, 126, 234, 0.1);
        padding: 4px 10px;
        border-radius: 4px;
      }

      .detail-quality {
        font-size: 14px;
        font-weight: bold;
      }
    }
  }

  .detail-image {
    width: 100%;
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;

    img {
      width: 100%;
      height: auto;
      display: block;
    }
  }

  .detail-content-wrapper {
    flex: 1;
    overflow-y: auto;

    .detail-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin: 0 0 16px 0;
    }

    .detail-association {
      margin-bottom: 16px;

      .assoc-title {
        font-size: 13px;
        color: #999;
        margin-bottom: 8px;
      }

      .assoc-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }

    .detail-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;

      .tag {
        font-size: 12px;
        color: #667eea;
        background: rgba(102, 126, 234, 0.1);
        padding: 4px 10px;
        border-radius: 12px;
      }
    }

    .detail-content {
      background: #f8f8f8;
      border-radius: 12px;
      padding: 16px;

      p {
        margin: 0;
        font-size: 14px;
        line-height: 1.8;
        color: #333;
        white-space: pre-wrap;
      }
    }
  }

  .detail-meta {
    display: flex;
    justify-content: space-between;
    margin: 16px 0;
    font-size: 13px;
    color: #999;

    .author {
      color: #667eea;
      font-weight: bold;
    }
  }

  .detail-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    padding: 12px;
    background: #f8f8f8;
    border-radius: 8px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #666;
    }
  }

  .detail-actions {
    .van-button {
      width: 100%;
    }
  }
}

// 详情页关联标签
.detail-assoc-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;

  &.project {
    background: rgba(155, 89, 182, 0.1);
    color: #9b59b6;
  }

  &.character {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

  &.plot {
    background: rgba(78, 205, 196, 0.1);
    color: #4ecdc4;
  }

  &.cp {
    background: rgba(255, 107, 107, 0.1);
    color: #ff6b6b;
  }
}
</style>
