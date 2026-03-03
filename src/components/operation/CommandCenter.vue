<template>
  <div class="command-center">
    <!-- 顶部实时指标 -->
    <div class="metrics-header">
      <div class="metric-card online">
        <div class="metric-icon">
          <van-icon name="friends-o" size="20" />
        </div>
        <div class="metric-content">
          <span class="metric-value">{{ formatNumber(realtimeData.onlinePlayers) }}</span>
          <span class="metric-label">在线人数</span>
          <span class="metric-trend" :class="onlineTrend.type">
            <van-icon :name="onlineTrend.icon" size="12" />
            {{ onlineTrend.value }}
          </span>
        </div>
      </div>
      <div class="metric-card revenue">
        <div class="metric-icon" style="background: #FFD700">
          <van-icon name="gold-coin-o" size="20" />
        </div>
        <div class="metric-content">
          <span class="metric-value">{{ formatNumber(realtimeData.revenue) }}</span>
          <span class="metric-label">实时收入</span>
          <span class="metric-trend" :class="revenueTrend.type">
            <van-icon :name="revenueTrend.icon" size="12" />
            {{ revenueTrend.value }}
          </span>
        </div>
      </div>
      <div class="metric-card rating">
        <div class="metric-icon" :style="{ background: ratingColor }">
          <van-icon name="star-o" size="20" />
        </div>
        <div class="metric-content">
          <span class="metric-value" :style="{ color: ratingColor }">{{ realtimeData.rating }}</span>
          <span class="metric-label">实时评分</span>
          <span class="metric-grade">{{ realtimeData.ratingGrade }}</span>
        </div>
      </div>
      <div class="metric-card heat">
        <div class="metric-icon" :style="{ background: heatColor }">
          <van-icon name="fire-o" size="20" />
        </div>
        <div class="metric-content">
          <span class="metric-value" :style="{ color: heatColor }">{{ realtimeData.heat }}</span>
          <span class="metric-label">节奏热度</span>
          <span class="metric-status">{{ heatStatus }}</span>
        </div>
      </div>
    </div>

    <!-- 实时评论流 -->
    <div class="comments-section">
      <div class="section-header">
        <h4>
          <van-icon name="chat-o" />
          实时评论
          <van-tag v-if="unreadComments > 0" color="#FF69B4" round size="small">
            {{ unreadComments }}条新消息
          </van-tag>
        </h4>
        <div class="header-actions">
          <span class="sentiment-summary">
            <span class="positive">{{ sentimentStats.positive }}%</span>
            <span class="neutral">{{ sentimentStats.neutral }}%</span>
            <span class="negative">{{ sentimentStats.negative }}%</span>
          </span>
          <van-icon name="expand-o" @click="showFullComments = true" />
        </div>
      </div>
      <div class="comments-stream" ref="commentsRef">
        <div
          v-for="comment in displayComments"
          :key="comment.id"
          class="comment-item"
          :class="[comment.sentiment, { 'is-new': comment.isNew }]"
        >
          <div class="comment-avatar" :style="{ background: getSegmentColor(comment.segment) }">
            <van-icon :name="getSegmentIcon(comment.segment)" size="14" />
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">{{ comment.author }}</span>
              <van-tag size="mini" :color="getSegmentColor(comment.segment)">
                {{ getSegmentName(comment.segment) }}
              </van-tag>
              <span class="comment-time">{{ comment.time }}</span>
            </div>
            <p class="comment-text">{{ comment.content }}</p>
            <div v-if="comment.isHot" class="hot-badge">
              <van-icon name="fire" size="12" />
              热门
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速运营操作 -->
    <div class="quick-actions">
      <h4 class="section-title">
        <van-icon name="setting-o" />
        快速运营
      </h4>
      <div class="actions-grid">
        <div class="action-card" @click="showGachaAdjust = true">
          <div class="action-icon" style="background: #FF69B4">
            <van-icon name="gem-o" size="24" />
          </div>
          <span class="action-name">调整爆率</span>
          <span class="action-desc">当前: {{ currentGachaRate }}%</span>
        </div>
        <div class="action-card" @click="showWelfarePanel = true">
          <div class="action-icon" style="background: #52c41a">
            <van-icon name="gift-o" size="24" />
          </div>
          <span class="action-name">发放福利</span>
          <span class="action-desc">提升满意度</span>
        </div>
        <div class="action-card" @click="showEventPanel = true">
          <div class="action-icon" style="background: #1890ff">
            <van-icon name="calendar-o" size="24" />
          </div>
          <span class="action-name">开启活动</span>
          <span class="action-desc">增加活跃度</span>
        </div>
        <div class="action-card" @click="showCrisisPanel = true">
          <div class="action-icon" :style="{ background: hasCrisis ? '#ff4d4f' : '#faad14' }">
            <van-icon name="warning-o" size="24" />
          </div>
          <span class="action-name">危机处理</span>
          <span class="action-desc">{{ hasCrisis ? '有危机待处理' : '暂无危机' }}</span>
        </div>
      </div>
    </div>

    <!-- 视觉特效层 -->
    <div class="effects-layer" v-if="showEffects">
      <div v-if="effectType === 'positive'" class="effect positive-effect">
        <div class="coins">
          <span v-for="i in 20" :key="i" class="coin">💰</span>
        </div>
        <div class="flowers">
          <span v-for="i in 15" :key="i" class="flower">🌸</span>
        </div>
      </div>
      <div v-if="effectType === 'negative'" class="effect negative-effect">
        <div class="shake-overlay"></div>
        <div class="warning-border"></div>
      </div>
      <div v-if="effectType === 'achievement'" class="effect achievement-effect">
        <div class="achievement-popup">
          <van-icon name="medal-o" size="64" />
          <h3>成就达成！</h3>
          <p>{{ achievementText }}</p>
        </div>
      </div>
    </div>

    <!-- 爆率调整弹窗 -->
    <van-popup v-model:show="showGachaAdjust" round class="gacha-popup">
      <div class="popup-content">
        <h4>调整卡池爆率</h4>
        <div class="rate-slider">
          <div class="rate-display">
            <span class="rate-value">{{ newGachaRate }}%</span>
            <span class="rate-label">SSR爆率</span>
          </div>
          <van-slider v-model="newGachaRate" :min="0.1" :max="5" :step="0.1" bar-height="8px" />
          <div class="rate-hints">
            <span>0.1%</span>
            <span>5%</span>
          </div>
        </div>
        <div class="rate-impact">
          <p>预计影响:</p>
          <div class="impact-tags">
            <van-tag :type="newGachaRate > currentGachaRate ? 'success' : 'danger'">
              强度党{{ newGachaRate > currentGachaRate ? '满意' : '不满' }}
            </van-tag>
            <van-tag :type="newGachaRate > currentGachaRate ? 'danger' : 'success'">
              收入{{ newGachaRate > currentGachaRate ? '下降' : '上升' }}
            </van-tag>
          </div>
        </div>
        <div class="popup-actions">
          <van-button round @click="showGachaAdjust = false">取消</van-button>
          <van-button round type="primary" color="#FF69B4" @click="confirmGachaAdjust">
            确认调整
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 福利发放弹窗 -->
    <van-popup v-model:show="showWelfarePanel" round class="welfare-popup">
      <div class="popup-content">
        <h4>发放玩家福利</h4>
        <div class="welfare-options">
          <div
            v-for="option in welfareOptions"
            :key="option.id"
            class="welfare-option"
            :class="{ selected: selectedWelfare === option.id }"
            @click="selectedWelfare = option.id"
          >
            <div class="option-icon" :style="{ background: option.color }">
              <van-icon :name="option.icon" size="24" />
            </div>
            <div class="option-info">
              <span class="option-name">{{ option.name }}</span>
              <span class="option-desc">{{ option.desc }}</span>
            </div>
            <div class="option-cost">
              <van-icon name="gold-coin-o" size="14" />
              {{ option.cost }}
            </div>
          </div>
        </div>
        <div class="popup-actions">
          <van-button round @click="showWelfarePanel = false">取消</van-button>
          <van-button round type="primary" color="#52c41a" @click="confirmWelfare">
            发放福利
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 全屏评论弹窗 -->
    <van-popup
      v-model:show="showFullComments"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <div class="full-comments">
        <div class="popup-header">
          <h4>全部评论</h4>
          <van-icon name="cross" @click="showFullComments = false" />
        </div>
        <div class="comments-filter">
          <van-tabs v-model="commentFilter" type="card">
            <van-tab title="全部" name="all" />
            <van-tab title="好评" name="positive" />
            <van-tab title="差评" name="negative" />
          </van-tabs>
        </div>
        <div class="full-comments-list">
          <div
            v-for="comment in filteredComments"
            :key="comment.id"
            class="full-comment-item"
            :class="comment.sentiment"
          >
            <div class="comment-main">
              <div class="comment-avatar" :style="{ background: getSegmentColor(comment.segment) }">
                <van-icon :name="getSegmentIcon(comment.segment)" size="16" />
              </div>
              <div class="comment-body">
                <div class="comment-meta">
                  <span class="author">{{ comment.author }}</span>
                  <van-tag size="mini" :color="getSegmentColor(comment.segment)">
                    {{ getSegmentName(comment.segment) }}
                  </van-tag>
                  <span class="time">{{ comment.time }}</span>
                </div>
                <p class="text">{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { PLAYER_SEGMENTS, type PlayerSegmentType } from '@/types/playerSegments';
import { showToast, showDialog } from 'vant';

// 实时数据
const realtimeData = ref({
  onlinePlayers: 1234,
  revenue: 50000,
  revenuePerMinute: 833,
  rating: 8.5,
  ratingGrade: 'A',
  heat: 45,
  satisfaction: 75
});

// 评论数据
interface Comment {
  id: string;
  author: string;
  content: string;
  segment: PlayerSegmentType;
  sentiment: 'positive' | 'negative' | 'neutral';
  time: string;
  isNew: boolean;
  isHot: boolean;
}

const comments = ref<Comment[]>([]);
const displayComments = ref<Comment[]>([]);
const unreadComments = ref(0);
const commentFilter = ref('all');

// 弹窗控制
const showGachaAdjust = ref(false);
const showWelfarePanel = ref(false);
const showEventPanel = ref(false);
const showCrisisPanel = ref(false);
const showFullComments = ref(false);

// 爆率调整
const currentGachaRate = ref(2.0);
const newGachaRate = ref(2.0);

// 福利选项
const selectedWelfare = ref('');
const welfareOptions = [
  { id: 'gems', name: '发放钻石', desc: '每人100钻石', cost: 10000, icon: 'gem-o', color: '#FF69B4' },
  { id: 'tickets', name: '抽卡券', desc: '每人10张抽卡券', cost: 15000, icon: 'coupon-o', color: '#1890ff' },
  { id: 'materials', name: '养成材料', desc: '大量养成材料', cost: 8000, icon: 'cluster-o', color: '#52c41a' },
  { id: 'apology', name: '道歉补偿', desc: '道歉+大补偿包', cost: 25000, icon: 'smile-comment-o', color: '#faad14' }
];

// 特效控制
const showEffects = ref(false);
const effectType = ref<'positive' | 'negative' | 'achievement'>('positive');
const achievementText = ref('');

// 危机状态
const hasCrisis = ref(false);

// 趋势计算
const onlineTrend = computed(() => {
  const trend = Math.random() > 0.5 ? 'up' : 'down';
  const value = Math.floor(Math.random() * 10) + 1;
  return {
    type: trend,
    icon: trend === 'up' ? 'arrow-up' : 'arrow-down',
    value: `${value}%`
  };
});

const revenueTrend = computed(() => {
  const trend = Math.random() > 0.5 ? 'up' : 'down';
  const value = Math.floor(Math.random() * 20) + 5;
  return {
    type: trend,
    icon: trend === 'up' ? 'arrow-up' : 'arrow-down',
    value: `${value}%`
  };
});

const ratingColor = computed(() => {
  const r = realtimeData.value.rating;
  if (r >= 9) return '#52c41a';
  if (r >= 7) return '#faad14';
  return '#ff4d4f';
});

const heatColor = computed(() => {
  const h = realtimeData.value.heat;
  if (h < 30) return '#52c41a';
  if (h < 60) return '#faad14';
  return '#ff4d4f';
});

const heatStatus = computed(() => {
  const h = realtimeData.value.heat;
  if (h < 30) return '平静';
  if (h < 60) return '有节奏';
  return '危机中';
});

const sentimentStats = computed(() => {
  const total = comments.value.length || 1;
  const positive = Math.round((comments.value.filter(c => c.sentiment === 'positive').length / total) * 100);
  const negative = Math.round((comments.value.filter(c => c.sentiment === 'negative').length / total) * 100);
  const neutral = 100 - positive - negative;
  return { positive, negative, neutral };
});

const filteredComments = computed(() => {
  if (commentFilter.value === 'all') return comments.value;
  return comments.value.filter(c => c.sentiment === commentFilter.value);
});

// 生成模拟评论
function generateMockComment(): Comment {
  const segments: PlayerSegmentType[] = ['story', 'visual', 'power', 'whale', 'f2p', 'cp', 'solo'];
  const segment = segments[Math.floor(Math.random() * segments.length)];
  
  const templates: Record<string, string[]> = {
    positive: ['这次更新不错', '卡面太好看了', '爆率还可以', '福利真香', '剧情写得好', '我推好帅'],
    negative: ['爆率太低了', '剧情崩了', '立绘劝退', '官方太黑', '退钱', '弃坑预警'],
    neutral: ['观望中', '再看看', '一般般', '还行吧']
  };
  
  const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];
  const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
  
  return {
    id: `comment_${Date.now()}_${Math.random()}`,
    author: `玩家${Math.floor(Math.random() * 9999)}`,
    content: templates[sentiment][Math.floor(Math.random() * templates[sentiment].length)],
    segment,
    sentiment,
    time: '刚刚',
    isNew: true,
    isHot: Math.random() > 0.9
  };
}

// 更新实时数据
function updateRealtimeData() {
  // 模拟数据波动
  realtimeData.value.onlinePlayers += Math.floor(Math.random() * 100) - 50;
  realtimeData.value.onlinePlayers = Math.max(100, realtimeData.value.onlinePlayers);
  
  realtimeData.value.revenue += Math.floor(Math.random() * 1000) - 200;
  realtimeData.value.revenue = Math.max(0, realtimeData.value.revenue);
  
  // 随机生成新评论
  if (Math.random() > 0.7) {
    const newComment = generateMockComment();
    comments.value.unshift(newComment);
    if (comments.value.length > 100) {
      comments.value.pop();
    }
    displayComments.value = comments.value.slice(0, 10);
    unreadComments.value++;
    
    // 触发特效
    if (newComment.sentiment === 'positive' && Math.random() > 0.8) {
      triggerEffect('positive');
    }
  }
}

// 触发特效
function triggerEffect(type: 'positive' | 'negative' | 'achievement') {
  effectType.value = type;
  showEffects.value = true;
  
  if (type === 'achievement') {
    achievementText.value = '获得"良心官方"称号';
  }
  
  setTimeout(() => {
    showEffects.value = false;
  }, 3000);
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// 获取玩家类型信息
function getSegmentColor(type: PlayerSegmentType): string {
  const segment = PLAYER_SEGMENTS.find(s => s.type === type);
  return segment?.color || '#999';
}

function getSegmentIcon(type: PlayerSegmentType): string {
  const segment = PLAYER_SEGMENTS.find(s => s.type === type);
  return segment?.icon || 'user-o';
}

function getSegmentName(type: PlayerSegmentType): string {
  const segment = PLAYER_SEGMENTS.find(s => s.type === type);
  return segment?.name || type;
}

// 确认调整爆率
function confirmGachaAdjust() {
  showGachaAdjust.value = false;
  currentGachaRate.value = newGachaRate.value;
  
  if (newGachaRate.value > currentGachaRate.value) {
    showToast('爆率已提高，玩家满意度上升');
    triggerEffect('positive');
  } else {
    showToast('爆率已降低，收入将提升');
  }
}

// 确认发放福利
function confirmWelfare() {
  if (!selectedWelfare.value) {
    showToast('请选择福利类型');
    return;
  }
  showWelfarePanel.value = false;
  showToast('福利已发放，玩家满意度大幅提升');
  triggerEffect('positive');
}

let updateInterval: number | null = null;

onMounted(() => {
  // 初始化一些评论
  for (let i = 0; i < 10; i++) {
    const comment = generateMockComment();
    comment.isNew = false;
    comments.value.push(comment);
  }
  displayComments.value = comments.value.slice(0, 10);
  
  // 启动实时更新
  updateInterval = window.setInterval(updateRealtimeData, 2000);
});

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});
</script>

<style scoped lang="scss">
.command-center {
  padding: 16px;
  position: relative;
}

.metrics-header {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  .metric-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: #FF69B4;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  .metric-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    
    .metric-value {
      font-size: 20px;
      font-weight: bold;
      color: #333;
    }
    
    .metric-label {
      font-size: 12px;
      color: #999;
    }
    
    .metric-trend {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 11px;
      margin-top: 2px;
      
      &.up {
        color: #52c41a;
      }
      
      &.down {
        color: #ff4d4f;
      }
    }
    
    .metric-grade {
      font-size: 11px;
      color: #FF69B4;
      margin-top: 2px;
    }
    
    .metric-status {
      font-size: 11px;
      color: #faad14;
      margin-top: 2px;
    }
  }
}

.comments-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    h4 {
      margin: 0;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .sentiment-summary {
        display: flex;
        gap: 8px;
        font-size: 12px;
        
        .positive {
          color: #52c41a;
        }
        
        .neutral {
          color: #999;
        }
        
        .negative {
          color: #ff4d4f;
        }
      }
    }
  }
}

.comments-stream {
  max-height: 300px;
  overflow-y: auto;
  
  .comment-item {
    display: flex;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.is-new {
      animation: slideIn 0.5s ease;
    }
    
    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    
    .comment-content {
      flex: 1;
      
      .comment-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        
        .comment-author {
          font-size: 13px;
          font-weight: bold;
          color: #333;
        }
        
        .comment-time {
          font-size: 11px;
          color: #999;
          margin-left: auto;
        }
      }
      
      .comment-text {
        margin: 0;
        font-size: 13px;
        color: #666;
        line-height: 1.5;
      }
      
      .hot-badge {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 2px 6px;
        background: #fff2f0;
        color: #ff4d4f;
        border-radius: 4px;
        font-size: 11px;
        margin-top: 4px;
      }
    }
  }
}

.quick-actions {
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #333;
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
  
  .action-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  .action-name {
    font-size: 13px;
    color: #333;
    font-weight: bold;
  }
  
  .action-desc {
    font-size: 11px;
    color: #999;
  }
}

.effects-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.positive-effect {
  .coins, .flowers {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  
  .coin, .flower {
    position: absolute;
    font-size: 24px;
    animation: fall 3s linear forwards;
  }
  
  @for $i from 1 through 20 {
    .coin:nth-child(#{$i}) {
      left: random(100) * 1%;
      animation-delay: random(3) * 0.5s;
      animation-duration: 2s + random(2);
    }
  }
  
  @for $i from 1 through 15 {
    .flower:nth-child(#{$i}) {
      left: random(100) * 1%;
      animation-delay: random(3) * 0.3s;
      animation-duration: 2.5s + random(2);
    }
  }
}

.negative-effect {
  .shake-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(255, 77, 79, 0.1);
    animation: shake 0.5s ease-in-out 3;
  }
  
  .warning-border {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border: 3px solid #ff4d4f;
    border-radius: 16px;
    animation: pulse-border 1s ease-in-out infinite;
  }
}

.achievement-effect {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  
  .achievement-popup {
    background: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    animation: popIn 0.5s ease;
    
    h3 {
      margin: 16px 0 8px 0;
      color: #FF69B4;
    }
    
    p {
      margin: 0;
      color: #666;
    }
  }
}

.popup-content {
  padding: 20px;
  
  h4 {
    margin: 0 0 20px 0;
    text-align: center;
    font-size: 18px;
  }
}

.rate-slider {
  margin-bottom: 20px;
  
  .rate-display {
    text-align: center;
    margin-bottom: 16px;
    
    .rate-value {
      font-size: 36px;
      font-weight: bold;
      color: #FF69B4;
    }
    
    .rate-label {
      display: block;
      font-size: 14px;
      color: #999;
    }
  }
  
  .rate-hints {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #999;
    margin-top: 8px;
  }
}

.rate-impact {
  margin-bottom: 20px;
  
  p {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #666;
  }
  
  .impact-tags {
    display: flex;
    gap: 8px;
  }
}

.popup-actions {
  display: flex;
  gap: 12px;
  
  .van-button {
    flex: 1;
  }
}

.welfare-options {
  margin-bottom: 20px;
}

.welfare-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.selected {
    background: #FFF5F7;
    border: 1px solid #FF69B4;
  }
  
  .option-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  .option-info {
    flex: 1;
    
    .option-name {
      display: block;
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }
    
    .option-desc {
      display: block;
      font-size: 12px;
      color: #999;
    }
  }
  
  .option-cost {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #FF69B4;
  }
}

.full-comments {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f5f5f5;
    
    h4 {
      margin: 0;
    }
  }
  
  .comments-filter {
    padding: 12px 16px;
  }
  
  .full-comments-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 16px;
  }
  
  .full-comment-item {
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;
    
    &.positive {
      border-left: 3px solid #52c41a;
      padding-left: 12px;
    }
    
    &.negative {
      border-left: 3px solid #ff4d4f;
      padding-left: 12px;
    }
    
    .comment-main {
      display: flex;
      gap: 12px;
      
      .comment-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }
      
      .comment-body {
        flex: 1;
        
        .comment-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          
          .author {
            font-size: 14px;
            font-weight: bold;
            color: #333;
          }
          
          .time {
            font-size: 12px;
            color: #999;
            margin-left: auto;
          }
        }
        
        .text {
          margin: 0;
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }
      }
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fall {
  from {
    transform: translateY(-100px) rotate(0deg);
    opacity: 1;
  }
  to {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@keyframes pulse-border {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes popIn {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
