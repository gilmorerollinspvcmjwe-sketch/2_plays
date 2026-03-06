<template>
  <div class="confession-wall">
    <div class="wall-header">
      <h3 class="title">💌 告白墙</h3>
      <span class="subtitle" v-if="confessionStore.totalCount > 0">
        共 {{ confessionStore.totalCount }} 条告白
      </span>
    </div>

    <!-- 空状态展示 -->
    <div v-if="!confessionStore.hasConfessions" class="empty-state">
      <div class="empty-icon">💝</div>
      <p class="empty-text">告白墙空空如也，等角色获得人气后会有玩家来告白哦</p>
      <div class="empty-hint">
        <van-icon name="info-o" />
        <span>角色人气达到 20 后将自动生成告白</span>
      </div>
    </div>

    <template v-else>
      <!-- 热门告白 -->
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
              <!-- 角色信息标签 -->
              <div class="character-tag">
                <van-icon name="user-o" />
                {{ confession.characterName }}
              </div>
              <p class="content-text">{{ confession.content }}</p>
              <div class="meta">
                <span class="author">by {{ confession.authorName }}</span>
                <span class="heat">🔥 {{ confession.heat }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 全部告白 -->
      <div class="all-confessions">
        <div class="section-title">
          <span>全部告白</span>
          <span class="section-count">{{ displayConfessions.length }}</span>
        </div>
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
                :class="{ 'is-hot': confession.isHot, [`sentiment-${confession.sentiment}`]: confession.sentiment }"
              >
                <!-- 卡片头部：角色信息 -->
                <div class="card-header">
                  <div class="character-info">
                    <van-icon name="user-circle-o" class="character-icon" />
                    <span class="character-name">{{ confession.characterName }}</span>
                  </div>
                  <van-tag v-if="confession.isHot" type="danger" size="small">热门</van-tag>
                  <van-tag v-else-if="confession.sentiment === 'negative'" type="warning" size="small">
                    退坑
                  </van-tag>
                </div>
                
                <!-- 告白内容 -->
                <p class="card-content">{{ confession.content }}</p>
                
                <!-- 卡片底部：作者和时间 -->
                <div class="card-footer">
                  <span class="author">
                    <van-icon name="contact" />
                    {{ confession.authorName }}
                  </span>
                  <span class="time">{{ formatTime(confession.createdAt) }}</span>
                </div>
                
                <!-- 操作按钮 -->
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
    </template>

    <!-- 告白详情弹窗 -->
    <van-popup
      v-model:show="showDetail"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div v-if="selectedConfession" class="detail-popup">
        <div class="detail-header">
          <div class="detail-character">
            <van-icon name="user-circle-o" />
            <h4>{{ selectedConfession.characterName }}</h4>
          </div>
          <van-icon name="cross" @click="showDetail = false" />
        </div>
        <div class="detail-content">
          <p>{{ selectedConfession.content }}</p>
        </div>
        <div class="detail-meta">
          <span class="detail-author">
            <van-icon name="contact" />
            by {{ selectedConfession.authorName }}
          </span>
          <span>{{ formatTime(selectedConfession.createdAt) }}</span>
        </div>
        <div class="detail-stats">
          <div class="stat-item">
            <van-icon name="like-o" />
            <span>{{ selectedConfession.likes }} 点赞</span>
          </div>
          <div class="stat-item">
            <van-icon name="fire-o" />
            <span>{{ selectedConfession.heat }} 热度</span>
          </div>
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
import { ref, computed, onMounted, watch } from 'vue';
import { showToast } from 'vant';
import { useConfessionStore, type Confession } from '@/stores/confessionStore';

const confessionStore = useConfessionStore();

// ==================== State ====================
const showDetail = ref(false);
const selectedConfession = ref<Confession | null>(null);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const pageSize = 10;
const currentPage = ref(1);
const currentUserId = 'local_user';

// ==================== Computed ====================
const hotConfessions = computed(() => confessionStore.hotConfessions);
const allConfessions = computed(() => confessionStore.recentConfessions);

const displayConfessions = ref<Confession[]>([]);

// ==================== Methods ====================

/**
 * 加载告白列表
 */
function loadConfessions() {
  const start = 0;
  const end = currentPage.value * pageSize;
  displayConfessions.value = allConfessions.value.slice(start, end);
  finished.value = displayConfessions.value.length >= allConfessions.value.length;
  loading.value = false;
}

/**
 * 加载更多
 */
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

/**
 * 刷新列表
 */
function onRefresh() {
  setTimeout(() => {
    currentPage.value = 1;
    loadConfessions();
    refreshing.value = false;
    showToast('刷新成功');
  }, 1000);
}

/**
 * 点赞/取消点赞
 */
async function handleLike(confession: Confession) {
  const result = await confessionStore.likeConfession(confession.id, currentUserId);
  if (result.success) {
    showToast(result.message);
  }
}

/**
 * 查看告白详情
 */
function viewConfession(confession: Confession) {
  selectedConfession.value = confession;
  showDetail.value = true;
}

/**
 * 格式化时间
 */
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

// ==================== Lifecycle ====================
onMounted(() => {
  loadConfessions();
});

watch(allConfessions, () => {
  loadConfessions();
}, { deep: true });
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
  
  .subtitle {
    font-size: 13px;
    color: #999;
  }
}

// ==================== 空状态 ====================
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.8;
  }
  
  .empty-text {
    font-size: 16px;
    color: #666;
    margin: 0 0 12px 0;
    line-height: 1.6;
  }
  
  .empty-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #999;
    background: #f5f5f5;
    padding: 8px 16px;
    border-radius: 16px;
    
    .van-icon {
      font-size: 14px;
    }
  }
}

// ==================== 区块标题 ====================
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
  
  .section-count {
    font-size: 13px;
    color: #999;
    font-weight: normal;
    margin-left: auto;
  }
}

// ==================== 热门告白 ====================
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
    width: 220px;
    background: linear-gradient(135deg, #fff0f3 0%, #ffe4e8 100%);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #ffb6c1;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:active {
      transform: scale(0.98);
    }
    
    .hot-content {
      .character-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: linear-gradient(to right, #ff6b9d, #ff8a80);
        color: white;
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 12px;
        margin-bottom: 10px;
        
        .van-icon {
          font-size: 12px;
        }
      }
      
      .content-text {
        font-size: 14px;
        color: #333;
        line-height: 1.5;
        margin: 0 0 10px 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #999;
        
        .author {
          color: #666;
        }
        
        .heat {
          color: #ff9500;
          font-weight: bold;
        }
      }
    }
  }
}

// ==================== 全部告白 ====================
.all-confessions {
  .waterfall-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .confession-card {
    background: white;
    border-radius: 12px;
    padding: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
    
    &:active {
      transform: scale(0.98);
    }
    
    &.is-hot {
      border: 1px solid #ff6b9d;
      background: linear-gradient(135deg, #fff5f7 0%, #ffffff 100%);
    }
    
    &.sentiment-negative {
      border-left: 3px solid #ff976a;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      
      .character-info {
        display: flex;
        align-items: center;
        gap: 6px;
        
        .character-icon {
          font-size: 16px;
          color: #ff6b9d;
        }
        
        .character-name {
          font-size: 13px;
          font-weight: bold;
          color: #ff6b9d;
        }
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
      align-items: center;
      font-size: 12px;
      color: #999;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
      
      .author {
        display: flex;
        align-items: center;
        gap: 4px;
        
        .van-icon {
          font-size: 12px;
        }
      }
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
        cursor: pointer;
        
        &:active {
          opacity: 0.7;
        }
        
        .liked {
          color: #ff6b9d;
        }
      }
    }
  }
}

// ==================== 详情弹窗 ====================
.detail-popup {
  padding: 20px;
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .detail-character {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .van-icon {
        font-size: 24px;
        color: #ff6b9d;
      }
      
      h4 {
        margin: 0;
        font-size: 18px;
        color: #ff6b9d;
      }
    }
    
    .van-icon {
      font-size: 20px;
      color: #999;
      cursor: pointer;
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
    align-items: center;
    font-size: 14px;
    color: #999;
    margin-bottom: 16px;
    
    .detail-author {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
  
  .detail-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding: 12px;
    background: #fafafa;
    border-radius: 8px;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #666;
      
      .van-icon {
        font-size: 16px;
        color: #999;
      }
    }
  }
  
  .detail-actions {
    .van-button {
      width: 100%;
    }
  }
}
</style>
