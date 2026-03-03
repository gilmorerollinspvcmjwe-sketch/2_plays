<template>
  <div class="sentiment-overview">
    <h3 class="section-title">舆情概览</h3>
    
    <!-- 满意度圆环 -->
    <div class="satisfaction-section">
      <div class="satisfaction-circle">
        <van-circle
          v-model:current-rate="satisfactionRate"
          :rate="satisfactionRate"
          :speed="100"
          :text="satisfactionText"
          :stroke-width="60"
          :color="satisfactionColor"
          size="120px"
        />
      </div>
      <div class="satisfaction-info">
        <span class="label">玩家满意度</span>
        <span class="emoji">{{ satisfactionEmoji }}</span>
      </div>
    </div>

    <!-- 情感分布 -->
    <div class="sentiment-distribution">
      <h4 class="subsection-title">情感分布</h4>
      <div class="sentiment-bars">
        <div class="sentiment-item">
          <span class="sentiment-label">正面</span>
          <div class="progress-bar">
            <div 
              class="progress-fill positive" 
              :style="{ width: positivePercent + '%' }"
            ></div>
          </div>
          <span class="sentiment-count">{{ stats.positive }}</span>
        </div>
        
        <div class="sentiment-item">
          <span class="sentiment-label">中性</span>
          <div class="progress-bar">
            <div 
              class="progress-fill neutral" 
              :style="{ width: neutralPercent + '%' }"
            ></div>
          </div>
          <span class="sentiment-count">{{ stats.neutral }}</span>
        </div>
        
        <div class="sentiment-item">
          <span class="sentiment-label">负面</span>
          <div class="progress-bar">
            <div 
              class="progress-fill negative" 
              :style="{ width: negativePercent + '%' }"
            ></div>
          </div>
          <span class="sentiment-count">{{ stats.negative }}</span>
        </div>
      </div>
    </div>

    <!-- 今日数据 -->
    <div class="today-stats">
      <div class="stat-item">
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">总评论</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ todayComments }}</span>
        <span class="stat-label">今日新增</span>
      </div>
    </div>

    <!-- 热门标签 -->
    <div class="hot-tags" v-if="stats.hotTags.length > 0">
      <h4 class="subsection-title">热门话题</h4>
      <div class="tag-cloud">
        <van-tag
          v-for="tag in stats.hotTags.slice(0, 8)"
          :key="tag.tag"
          :type="getTagType(tag.count)"
          class="hot-tag"
          size="medium"
        >
          {{ tag.tag }} ({{ tag.count }})
        </van-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SentimentStats } from '@/stores/commentStore';

interface Props {
  stats: SentimentStats;
}

const props = defineProps<Props>();

// 满意度
const satisfactionRate = computed(() => props.stats.satisfaction);
const satisfactionText = computed(() => `${props.stats.satisfaction}%`);

const satisfactionColor = computed(() => {
  const rate = props.stats.satisfaction;
  if (rate >= 80) return '#07c160';
  if (rate >= 60) return '#ff976a';
  return '#ee0a24';
});

const satisfactionEmoji = computed(() => {
  const rate = props.stats.satisfaction;
  if (rate >= 80) return '😊';
  if (rate >= 60) return '😐';
  return '😰';
});

// 情感分布百分比
const total = computed(() => props.stats.total || 1);
const positivePercent = computed(() => (props.stats.positive / total.value) * 100);
const neutralPercent = computed(() => (props.stats.neutral / total.value) * 100);
const negativePercent = computed(() => (props.stats.negative / total.value) * 100);

// 今日评论数（模拟）
const todayComments = computed(() => {
  return Math.floor(props.stats.total * 0.3);
});

// 标签类型
function getTagType(count: number): string {
  if (count >= 10) return 'danger';
  if (count >= 5) return 'warning';
  return 'primary';
}
</script>

<style scoped lang="scss">
.sentiment-overview {
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
}

.satisfaction-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.satisfaction-circle {
  flex-shrink: 0;
}

.satisfaction-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .label {
    font-size: 14px;
    color: #666;
  }
  
  .emoji {
    font-size: 24px;
  }
}

.subsection-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.sentiment-distribution {
  margin-bottom: 20px;
}

.sentiment-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sentiment-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sentiment-label {
  width: 40px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
  
  &.positive {
    background: linear-gradient(90deg, #07c160, #10b981);
  }
  
  &.neutral {
    background: linear-gradient(90deg, #ff976a, #ffa94d);
  }
  
  &.negative {
    background: linear-gradient(90deg, #ee0a24, #ff4d4f);
  }
}

.sentiment-count {
  width: 40px;
  text-align: right;
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.today-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #FF69B4;
  }
  
  .stat-label {
    font-size: 12px;
    color: #999;
  }
}

.hot-tags {
  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .hot-tag {
    margin: 0;
  }
}
</style>
