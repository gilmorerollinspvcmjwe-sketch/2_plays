<template>
  <div class="fan-creation-square">
    <div class="square-header">
      <h3 class="title">✨ 同人广场</h3>
      <van-button
        type="primary"
        size="small"
        round
        color="linear-gradient(to right, #667eea, #764ba2)"
        @click="showCreateModal = true"
      >
        <template #icon>
          <van-icon name="plus" />
        </template>
        创作
      </van-button>
    </div>

    <van-tabs
      v-model:active="activeTab"
      sticky
      color="#667eea"
      title-active-color="#667eea"
    >
      <van-tab title="同人文" name="fanfic">
        <template #title>
          <span class="tab-title">📝 同人文</span>
        </template>
      </van-tab>
      <van-tab title="同人图" name="fanart">
        <template #title>
          <span class="tab-title">🎨 同人图</span>
        </template>
      </van-tab>
      <van-tab title="表情包" name="emoji">
        <template #title>
          <span class="tab-title">😄 表情包</span>
        </template>
      </van-tab>
    </van-tabs>

    <div class="creation-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多作品了"
          @load="onLoad"
        >
          <div v-if="activeTab === 'fanfic'" class="fanfic-list">
            <div
              v-for="creation in displayCreations"
              :key="creation.id"
              class="fanfic-card"
              @click="viewCreation(creation)"
            >
              <div class="card-header">
                <span class="character-tag">{{ creation.characterName }}</span>
                <span class="author">{{ creation.authorName }}</span>
              </div>
              <h4 class="card-title">{{ getFanficTitle(creation.content) }}</h4>
              <p class="card-excerpt">{{ getFanficExcerpt(creation.content) }}</p>
              <div class="card-footer">
                <div class="stats">
                  <span><van-icon name="like-o" /> {{ creation.likes }}</span>
                  <span><van-icon name="star-o" /> {{ creation.collections }}</span>
                </div>
                <span class="time">{{ formatTime(creation.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'fanart'" class="fanart-grid">
            <div
              v-for="creation in displayCreations"
              :key="creation.id"
              class="fanart-card"
              @click="viewCreation(creation)"
            >
              <img
                :src="creation.imageUrl || 'https://picsum.photos/200/200'"
                :alt="creation.characterName"
                class="fanart-image"
              />
              <div class="fanart-overlay">
                <span class="character-name">{{ creation.characterName }}</span>
                <div class="fanart-stats">
                  <span><van-icon name="like-o" /> {{ creation.likes }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'emoji'" class="emoji-grid">
            <div
              v-for="creation in displayCreations"
              :key="creation.id"
              class="emoji-card"
              @click="viewCreation(creation)"
            >
              <div class="emoji-content">{{ creation.content }}</div>
              <div class="emoji-footer">
                <span class="character-name">{{ creation.characterName }}</span>
                <span class="likes"><van-icon name="like-o" /> {{ creation.likes }}</span>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <FanCreationModal
      v-model:show="showCreateModal"
      @create="handleCreate"
    />

    <van-popup
      v-model:show="showDetail"
      position="bottom"
      round
      :style="{ height: activeTab === 'fanart' ? '80%' : '70%' }"
    >
      <div v-if="selectedCreation" class="detail-popup">
        <div class="detail-header">
          <h4>{{ TYPE_NAMES[selectedCreation.type] }}</h4>
          <van-icon name="cross" @click="showDetail = false" />
        </div>

        <div v-if="selectedCreation.type === 'fanart'" class="detail-image">
          <img
            :src="selectedCreation.imageUrl || 'https://picsum.photos/400/400'"
            :alt="selectedCreation.characterName"
          />
        </div>

        <div v-else class="detail-content">
          <p>{{ selectedCreation.content }}</p>
        </div>

        <div class="detail-meta">
          <span class="character">{{ selectedCreation.characterName }}</span>
          <span class="author">by {{ selectedCreation.authorName }}</span>
          <span class="time">{{ formatTime(selectedCreation.createdAt) }}</span>
        </div>

        <div class="detail-stats">
          <div class="stat-item">
            <van-icon name="like-o" />
            <span>{{ selectedCreation.likes }} 点赞</span>
          </div>
          <div class="stat-item">
            <van-icon name="star-o" />
            <span>{{ selectedCreation.collections }} 收藏</span>
          </div>
        </div>

        <div class="detail-actions">
          <van-button
            :type="selectedCreation.isLiked ? 'danger' : 'default'"
            size="large"
            round
            @click="handleLike(selectedCreation)"
          >
            <van-icon :name="selectedCreation.isLiked ? 'like' : 'like-o'" />
            {{ selectedCreation.isLiked ? '已点赞' : '点赞' }}
          </van-button>
          <van-button
            :type="selectedCreation.isCollected ? 'warning' : 'default'"
            size="large"
            round
            @click="handleCollect(selectedCreation)"
          >
            <van-icon :name="selectedCreation.isCollected ? 'star' : 'star-o'" />
            {{ selectedCreation.isCollected ? '已收藏' : '收藏' }}
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { showToast } from 'vant';
import { useFanCreationStore, TYPE_NAMES, type FanCreation } from '@/stores/fanCreationStore';
import { usePointsStore } from '@/stores/points';
import FanCreationModal from './FanCreationModal.vue';

const fanCreationStore = useFanCreationStore();
const pointsStore = usePointsStore();

const activeTab = ref<'fanfic' | 'fanart' | 'emoji'>('fanfic');
const showCreateModal = ref(false);
const showDetail = ref(false);
const selectedCreation = ref<FanCreation | null>(null);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const pageSize = 10;
const currentPage = ref(1);
const displayCreations = ref<FanCreation[]>([]);

const currentCreations = computed(() => {
  switch (activeTab.value) {
    case 'fanfic':
      return fanCreationStore.fanfics;
    case 'fanart':
      return fanCreationStore.fanarts;
    case 'emoji':
      return fanCreationStore.emojis;
    default:
      return [];
  }
});

function loadCreations() {
  currentPage.value = 1;
  const start = 0;
  const end = pageSize;
  displayCreations.value = currentCreations.value.slice(start, end);
  finished.value = displayCreations.value.length >= currentCreations.value.length;
  loading.value = false;
}

function onLoad() {
  setTimeout(() => {
    currentPage.value++;
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    const newCreations = currentCreations.value.slice(start, end);
    
    if (newCreations.length === 0) {
      finished.value = true;
    } else {
      displayCreations.value = [...displayCreations.value, ...newCreations];
    }
    loading.value = false;
  }, 500);
}

function onRefresh() {
  setTimeout(() => {
    loadCreations();
    refreshing.value = false;
    showToast('刷新成功');
  }, 1000);
}

watch(activeTab, () => {
  loadCreations();
});

async function handleLike(creation: FanCreation) {
  const result = await fanCreationStore.likeCreation(creation.id, 'user_1');
  if (result.success) {
    showToast(result.message);
  }
}

async function handleCollect(creation: FanCreation) {
  const result = await fanCreationStore.collectCreation(creation.id);
  if (result.success) {
    showToast(result.message);
  }
}

function viewCreation(creation: FanCreation) {
  selectedCreation.value = creation;
  showDetail.value = true;
}

async function handleCreate(data: {
  type: 'fanfic' | 'fanart' | 'emoji';
  characterId: string;
  characterName: string;
  content: string;
  imageUrl?: string;
}) {
  const result = await fanCreationStore.createFanCreation(
    data.type,
    data.characterId,
    data.characterName,
    data.content,
    'user_1',
    '我',
    data.imageUrl
  );

  if (result.success) {
    showToast(`${TYPE_NAMES[data.type]}创作成功！`);
    showCreateModal.value = false;
    await pointsStore.unlockAchievement('first_creation');
    activeTab.value = data.type;
    loadCreations();
  } else {
    showToast(result.message);
  }
}

function getFanficTitle(content: string): string {
  const lines = content.split('\n');
  const firstLine = lines[0] || '';
  if (firstLine.startsWith('【') && firstLine.includes('】')) {
    return firstLine;
  }
  return firstLine.slice(0, 20) + (firstLine.length > 20 ? '...' : '');
}

function getFanficExcerpt(content: string): string {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length > 1) {
    const excerpt = lines.slice(1).join(' ').slice(0, 100);
    return excerpt + (excerpt.length >= 100 ? '...' : '');
  }
  return content.slice(0, 100) + (content.length > 100 ? '...' : '');
}

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
  if (fanCreationStore.creations.length === 0) {
    fanCreationStore.generateMockCreations(15);
  }
  loadCreations();
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
}

.tab-title {
  font-size: 14px;
}

.creation-list {
  padding: 16px;
}

.fanfic-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fanfic-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .character-tag {
      background: linear-gradient(to right, #667eea, #764ba2);
      color: white;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 10px;
    }
    
    .author {
      font-size: 12px;
      color: #999;
    }
  }
  
  .card-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin: 0 0 8px 0;
  }
  
  .card-excerpt {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin: 0 0 12px 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    
    .stats {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #999;
      
      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
    
    .time {
      font-size: 12px;
      color: #999;
    }
  }
}

.fanart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.fanart-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  
  .fanart-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .fanart-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    color: white;
    
    .character-name {
      font-size: 14px;
      font-weight: bold;
      display: block;
      margin-bottom: 4px;
    }
    
    .fanart-stats {
      font-size: 12px;
      
      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.emoji-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  
  .emoji-content {
    font-size: 32px;
    margin-bottom: 12px;
  }
  
  .emoji-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #999;
    
    .likes {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.detail-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h4 {
      margin: 0;
      font-size: 18px;
      color: #667eea;
    }
  }
  
  .detail-image {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    
    img {
      max-width: 100%;
      max-height: 300px;
      border-radius: 12px;
    }
  }
  
  .detail-content {
    flex: 1;
    background: #f8f8f8;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    overflow-y: auto;
    
    p {
      margin: 0;
      font-size: 15px;
      line-height: 1.8;
      color: #333;
      white-space: pre-wrap;
    }
  }
  
  .detail-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #999;
    
    .character {
      color: #667eea;
      font-weight: bold;
    }
  }
  
  .detail-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 20px;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #666;
    }
  }
  
  .detail-actions {
    display: flex;
    gap: 12px;
    
    .van-button {
      flex: 1;
    }
  }
}
</style>
