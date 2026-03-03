<template>
  <div class="confession-wall">
    <div class="wall-header">
      <h3 class="title">💌 告白墙</h3>
      <van-button
        type="primary"
        size="small"
        round
        color="linear-gradient(to right, #ff6b9d, #ff8a80)"
        @click="showPostModal = true"
      >
        <template #icon>
          <van-icon name="edit" />
        </template>
        发布告白
      </van-button>
    </div>

    <div v-if="hotConfessions.length > 0" class="hot-section">
      <div class="section-title">
        <span class="fire-icon">🔥</span>
        热门告白
      </div>
      <div class="hot-list">
        <div
          v-for="confession in hotConfessions"
          :key="confession.id"
          class="hot-card"
          @click="viewConfession(confession)"
        >
          <div class="hot-content">
            <div class="character-tag">{{ confession.characterName }}</div>
            <p class="content-text">{{ confession.content }}</p>
            <div class="meta">
              <span class="author">by {{ confession.authorName }}</span>
              <span class="heat">🔥 {{ confession.heat }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="all-confessions">
      <div class="section-title">全部告白</div>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多告白了"
          @load="onLoad"
        >
          <div class="waterfall-container">
            <div
              v-for="confession in displayConfessions"
              :key="confession.id"
              class="confession-card"
              :class="{ 'is-hot': confession.isHot }"
            >
              <div class="card-header">
                <span class="character-name">{{ confession.characterName }}</span>
                <van-tag v-if="confession.isHot" type="danger">热门</van-tag>
              </div>
              <p class="card-content">{{ confession.content }}</p>
              <div class="card-footer">
                <span class="author">{{ confession.authorName }}</span>
                <span class="time">{{ formatTime(confession.createdAt) }}</span>
              </div>
              <div class="card-actions">
                <div class="action-btn" @click="handleLike(confession)">
                  <van-icon
                    :name="confession.isLiked ? 'like' : 'like-o'"
                    :color="confession.isLiked ? '#ff6b9d' : '#999'"
                  />
                  <span :class="{ liked: confession.isLiked }">{{ confession.likes }}</span>
                </div>
                <div class="action-btn">
                  <van-icon name="fire-o" color="#ff9500" />
                  <span>{{ confession.heat }}</span>
                </div>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <ConfessionPost
      v-model:show="showPostModal"
      @post="handlePost"
    />

    <van-popup
      v-model:show="showDetail"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div v-if="selectedConfession" class="detail-popup">
        <div class="detail-header">
          <h4>{{ selectedConfession.characterName }}</h4>
          <van-icon name="cross" @click="showDetail = false" />
        </div>
        <div class="detail-content">
          <p>{{ selectedConfession.content }}</p>
        </div>
        <div class="detail-meta">
          <span>by {{ selectedConfession.authorName }}</span>
          <span>{{ formatTime(selectedConfession.createdAt) }}</span>
        </div>
        <div class="detail-actions">
          <van-button
            :type="selectedConfession.isLiked ? 'danger' : 'default'"
            size="large"
            round
            @click="handleLike(selectedConfession)"
          >
            <van-icon :name="selectedConfession.isLiked ? 'like' : 'like-o'" />
            {{ selectedConfession.isLiked ? '已点赞' : '点赞' }} ({{ selectedConfession.likes }})
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { showToast } from 'vant';
import { useConfessionStore, type Confession } from '@/stores/confessionStore';
import { usePointsStore } from '@/stores/points';
import ConfessionPost from './ConfessionPost.vue';

const confessionStore = useConfessionStore();
const pointsStore = usePointsStore();

const showPostModal = ref(false);
const showDetail = ref(false);
const selectedConfession = ref<Confession | null>(null);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const pageSize = 10;
const currentPage = ref(1);

const hotConfessions = computed(() => confessionStore.hotConfessions);

const allConfessions = computed(() => confessionStore.recentConfessions);

const displayConfessions = ref<Confession[]>([]);

function loadConfessions() {
  const start = 0;
  const end = currentPage.value * pageSize;
  displayConfessions.value = allConfessions.value.slice(start, end);
  finished.value = displayConfessions.value.length >= allConfessions.value.length;
  loading.value = false;
}

function onLoad() {
  setTimeout(() => {
    currentPage.value++;
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    const newConfessions = allConfessions.value.slice(start, end);
    
    if (newConfessions.length === 0) {
      finished.value = true;
    } else {
      displayConfessions.value = [...displayConfessions.value, ...newConfessions];
    }
    loading.value = false;
  }, 500);
}

function onRefresh() {
  setTimeout(() => {
    currentPage.value = 1;
    loadConfessions();
    refreshing.value = false;
    showToast('刷新成功');
  }, 1000);
}

async function handleLike(confession: Confession) {
  const result = await confessionStore.likeConfession(confession.id, 'user_1');
  if (result.success) {
    showToast(result.message);
  }
}

function viewConfession(confession: Confession) {
  selectedConfession.value = confession;
  showDetail.value = true;
}

async function handlePost(data: { characterId: string; characterName: string; content: string }) {
  const result = await confessionStore.postConfession(
    data.characterId,
    data.characterName,
    data.content,
    'user_1',
    '我'
  );
  
  if (result.success) {
    showToast('告白发布成功！');
    showPostModal.value = false;
    await pointsStore.unlockAchievement('first_confession');
    currentPage.value = 1;
    loadConfessions();
  } else {
    showToast(result.message);
  }
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
  if (confessionStore.confessions.length === 0) {
    confessionStore.generateMockConfessions(20);
  }
  loadConfessions();
});
</script>

<style scoped lang="scss">
.confession-wall {
  background: linear-gradient(180deg, #fff5f7 0%, #ffffff 100%);
  min-height: 100vh;
  padding: 16px;
}

.wall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .title {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin: 0;
  }
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  .fire-icon {
    font-size: 18px;
  }
}

.hot-section {
  margin-bottom: 24px;
  
  .hot-list {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  .hot-card {
    flex-shrink: 0;
    width: 200px;
    background: linear-gradient(135deg, #fff0f3 0%, #ffe4e8 100%);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #ffb6c1;
    
    .hot-content {
      .character-tag {
        display: inline-block;
        background: linear-gradient(to right, #ff6b9d, #ff8a80);
        color: white;
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 10px;
        margin-bottom: 8px;
      }
      
      .content-text {
        font-size: 14px;
        color: #333;
        line-height: 1.5;
        margin: 0 0 8px 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .meta {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #999;
        
        .heat {
          color: #ff9500;
        }
      }
    }
  }
}

.waterfall-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.confession-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.is-hot {
    border: 1px solid #ff6b9d;
    background: linear-gradient(135deg, #fff5f7 0%, #ffffff 100%);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .character-name {
      font-size: 13px;
      font-weight: bold;
      color: #ff6b9d;
    }
  }
  
  .card-content {
    font-size: 14px;
    color: #333;
    line-height: 1.6;
    margin: 0 0 12px 0;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #999;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .card-actions {
    display: flex;
    gap: 16px;
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #999;
      
      .liked {
        color: #ff6b9d;
      }
    }
  }
}

.detail-popup {
  padding: 20px;
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h4 {
      margin: 0;
      font-size: 18px;
      color: #ff6b9d;
    }
  }
  
  .detail-content {
    background: #f8f8f8;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    
    p {
      margin: 0;
      font-size: 16px;
      line-height: 1.8;
      color: #333;
    }
  }
  
  .detail-meta {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #999;
    margin-bottom: 20px;
  }
  
  .detail-actions {
    .van-button {
      width: 100%;
    }
  }
}
</style>
