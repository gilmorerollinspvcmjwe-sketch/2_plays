<template>
  <div class="player-segments">
    <!-- 头部概览 -->
    <div class="overview-section">
      <div class="overview-card total-players">
        <div class="card-icon">
          <van-icon name="friends-o" size="24" />
        </div>
        <div class="card-content">
          <span class="card-value">{{ formatNumber(community.totalPlayers) }}</span>
          <span class="card-label">总玩家数</span>
        </div>
      </div>
      <div class="overview-card satisfaction">
        <div class="card-icon" :style="{ background: satisfactionColor }">
          <van-icon name="smile-o" size="24" />
        </div>
        <div class="card-content">
          <span class="card-value" :style="{ color: satisfactionColor }">{{ community.overallSatisfaction }}%</span>
          <span class="card-label">整体满意度</span>
        </div>
      </div>
      <div class="overview-card active-rate">
        <div class="card-icon" style="background: #52c41a">
          <van-icon name="fire-o" size="24" />
        </div>
        <div class="card-content">
          <span class="card-value">{{ Math.round(community.activeRate * 100) }}%</span>
          <span class="card-label">活跃率</span>
        </div>
      </div>
      <div class="overview-card retention">
        <div class="card-icon" style="background: #722ed1">
          <van-icon name="chart-trending-o" size="24" />
        </div>
        <div class="card-content">
          <span class="card-value">{{ Math.round(community.retentionRate * 100) }}%</span>
          <span class="card-label">留存率</span>
        </div>
      </div>
    </div>

    <!-- 玩家类型分布 -->
    <div class="segments-section">
      <h4 class="section-title">
        <van-icon name="pie-chart-o" />
        玩家类型分布
      </h4>
      <div class="segments-grid">
        <div
          v-for="segment in segmentDetails"
          :key="segment.type"
          class="segment-card"
          :class="{ 'high-sentiment': segment.sentiment > 0.3, 'low-sentiment': segment.sentiment < -0.3 }"
          @click="showSegmentDetail(segment)"
        >
          <div class="segment-header">
            <div class="segment-icon" :style="{ background: segment.color }">
              <van-icon :name="segment.icon" size="20" />
            </div>
            <div class="segment-info">
              <span class="segment-name">{{ segment.name }}</span>
              <span class="segment-count">{{ formatNumber(segment.count) }}人</span>
            </div>
            <div class="segment-percent">{{ segment.percent }}%</div>
          </div>
          <div class="segment-stats">
            <div class="stat-item">
              <span class="stat-label">满意度</span>
              <van-progress
                :percentage="segment.satisfaction"
                :color="getSatisfactionColor(segment.satisfaction)"
                stroke-width="6"
                :show-pivot="false"
              />
            </div>
            <div class="stat-item sentiment">
              <span class="stat-label">情绪</span>
              <div class="sentiment-bar">
                <div
                  class="sentiment-fill"
                  :style="{
                    width: `${Math.abs(segment.sentiment) * 50}%`,
                    background: segment.sentiment > 0 ? '#52c41a' : '#ff4d4f',
                    marginLeft: segment.sentiment < 0 ? 'auto' : '50%',
                    marginRight: segment.sentiment > 0 ? 'auto' : '50%'
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 热点话题 -->
    <div class="topics-section" v-if="community.hotTopics.length > 0">
      <h4 class="section-title">
        <van-icon name="hot-o" />
        热点话题
        <van-tag v-if="trendingCount > 0" color="#ff4d4f" round size="small">
          {{ trendingCount }}个 trending
        </van-tag>
      </h4>
      <div class="topics-list">
        <div
          v-for="topic in sortedTopics"
          :key="topic.id"
          class="topic-item"
          :class="[topic.type, { trending: topic.isTrending }]"
        >
          <div class="topic-header">
            <div class="topic-type-tag" :class="topic.type">
              {{ getTopicTypeLabel(topic.type) }}
            </div>
            <div class="topic-heat">
              <van-icon name="fire-o" />
              <span>{{ topic.heat }}°</span>
            </div>
          </div>
          <p class="topic-title">{{ topic.title }}</p>
          <div class="topic-footer">
            <span class="topic-participants">
              <van-icon name="friends-o" size="12" />
              {{ formatNumber(topic.participants) }}人参与
            </span>
            <div class="topic-segments">
              <van-tag
                v-for="segType in topic.relatedSegments.slice(0, 3)"
                :key="segType"
                size="mini"
                :color="getSegmentColor(segType)"
              >
                {{ getSegmentName(segType) }}
              </van-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 情感趋势 -->
    <div class="sentiment-trend-section">
      <h4 class="section-title">
        <van-icon name="chart-line" />
        情感趋势
      </h4>
      <div class="sentiment-chart">
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-dot" style="background: #52c41a"></div>
            <span>正面</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background: #999"></div>
            <span>中性</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background: #ff4d4f"></div>
            <span>负面</span>
          </div>
        </div>
        <div class="sentiment-bars">
          <div
            v-for="segment in segmentDetails.slice(0, 5)"
            :key="segment.type"
            class="sentiment-row"
          >
            <span class="row-label">{{ segment.name }}</span>
            <div class="row-bar">
              <div
                class="bar-segment positive"
                :style="{ width: `${segment.positiveRatio}%` }"
              />
              <div
                class="bar-segment neutral"
                :style="{ width: `${segment.neutralRatio}%` }"
              />
              <div
                class="bar-segment negative"
                :style="{ width: `${segment.negativeRatio}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 玩家类型详情弹窗 -->
    <van-popup
      v-model:show="showDetail"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div class="segment-detail" v-if="selectedSegment">
        <div class="detail-header">
          <div class="detail-icon" :style="{ background: selectedSegment.color }">
            <van-icon :name="selectedSegment.icon" size="32" />
          </div>
          <div class="detail-title">
            <h3>{{ selectedSegment.name }}</h3>
            <p>{{ selectedSegment.description }}</p>
          </div>
          <van-icon name="cross" class="close-btn" @click="showDetail = false" />
        </div>
        <div class="detail-content">
          <div class="detail-section">
            <h4>特征</h4>
            <div class="tags">
              <van-tag
                v-for="char in selectedSegment.characteristics"
                :key="char"
                round
                type="primary"
              >
                {{ char }}
              </van-tag>
            </div>
          </div>
          <div class="detail-section">
            <h4>关注重点</h4>
            <div class="focus-list">
              <div
                v-for="focus in selectedSegment.focusAreas"
                :key="focus"
                class="focus-item"
              >
                <van-icon name="check" />
                {{ focus }}
              </div>
            </div>
          </div>
          <div class="detail-section">
            <h4>敏感度分析</h4>
            <div class="sensitivity-list">
              <div class="sensitivity-item">
                <span>剧情</span>
                <van-progress :percentage="selectedSegment.sensitivity.plot * 100" />
              </div>
              <div class="sensitivity-item">
                <span>美术</span>
                <van-progress :percentage="selectedSegment.sensitivity.visual * 100" />
              </div>
              <div class="sensitivity-item">
                <span>爆率</span>
                <van-progress :percentage="selectedSegment.sensitivity.gacha * 100" />
              </div>
              <div class="sensitivity-item">
                <span>福利</span>
                <van-progress :percentage="selectedSegment.sensitivity.welfare * 100" />
              </div>
              <div class="sensitivity-item">
                <span>角色</span>
                <van-progress :percentage="selectedSegment.sensitivity.character * 100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PLAYER_SEGMENTS, type PlayerCommunity, type PlayerSegmentType } from '@/types/playerSegments';

const props = defineProps<{
  community: PlayerCommunity;
}>();

const showDetail = ref(false);
const selectedSegment = ref<any>(null);

const segmentDetails = computed(() => {
  return props.community.segments.map(seg => {
    const config = PLAYER_SEGMENTS.find(s => s.type === seg.type);
    const percent = props.community.totalPlayers > 0
      ? Math.round((seg.count / props.community.totalPlayers) * 100)
      : 0;
    
    // 计算情感分布（模拟数据）
    const positiveRatio = Math.max(0, Math.min(100, 50 + seg.sentiment * 50));
    const negativeRatio = Math.max(0, Math.min(100, 50 - seg.sentiment * 50));
    const neutralRatio = Math.max(0, 100 - positiveRatio - negativeRatio);
    
    return {
      ...seg,
      ...config,
      percent,
      positiveRatio,
      negativeRatio,
      neutralRatio
    };
  });
});

const sortedTopics = computed(() => {
  return [...props.community.hotTopics].sort((a, b) => b.heat - a.heat);
});

const trendingCount = computed(() => {
  return props.community.hotTopics.filter(t => t.isTrending).length;
});

const satisfactionColor = computed(() => {
  const s = props.community.overallSatisfaction;
  if (s >= 80) return '#52c41a';
  if (s >= 60) return '#faad14';
  return '#ff4d4f';
});

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

function getSatisfactionColor(satisfaction: number): string {
  if (satisfaction >= 80) return '#52c41a';
  if (satisfaction >= 60) return '#faad14';
  return '#ff4d4f';
}

function getTopicTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    positive: '好评',
    negative: '差评',
    neutral: '中立',
    controversial: '争议'
  };
  return labels[type] || type;
}

function getSegmentColor(type: PlayerSegmentType): string {
  const segment = PLAYER_SEGMENTS.find(s => s.type === type);
  return segment?.color || '#999';
}

function getSegmentName(type: PlayerSegmentType): string {
  const segment = PLAYER_SEGMENTS.find(s => s.type === type);
  return segment?.name || type;
}

function showSegmentDetail(segment: any) {
  selectedSegment.value = segment;
  showDetail.value = true;
}
</script>

<style scoped lang="scss">
.player-segments {
  padding: 16px;
}

.overview-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #FF69B4;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  .card-content {
    display: flex;
    flex-direction: column;
    
    .card-value {
      font-size: 20px;
      font-weight: bold;
      color: #333;
    }
    
    .card-label {
      font-size: 12px;
      color: #999;
      margin-top: 2px;
    }
  }
}

.segments-section {
  margin-bottom: 20px;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #333;
  }
}

.segments-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.segment-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.high-sentiment {
    border: 1px solid #52c41a;
  }
  
  &.low-sentiment {
    border: 1px solid #ff4d4f;
  }
  
  .segment-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    
    .segment-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .segment-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .segment-name {
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }
      
      .segment-count {
        font-size: 12px;
        color: #999;
      }
    }
    
    .segment-percent {
      font-size: 16px;
      font-weight: bold;
      color: #FF69B4;
    }
  }
  
  .segment-stats {
    .stat-item {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .stat-label {
        display: block;
        font-size: 11px;
        color: #999;
        margin-bottom: 4px;
      }
    }
    
    .sentiment-bar {
      height: 6px;
      background: #f0f0f0;
      border-radius: 3px;
      position: relative;
      overflow: hidden;
      
      .sentiment-fill {
        height: 100%;
        border-radius: 3px;
        transition: all 0.3s ease;
      }
    }
  }
}

.topics-section {
  margin-bottom: 20px;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #333;
  }
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.topic-item {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  &.trending {
    border: 1px solid #ff4d4f;
  }
  
  &.positive {
    border-left: 3px solid #52c41a;
  }
  
  &.negative {
    border-left: 3px solid #ff4d4f;
  }
  
  &.controversial {
    border-left: 3px solid #faad14;
  }
  
  .topic-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .topic-type-tag {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      
      &.positive {
        background: #f6ffed;
        color: #52c41a;
      }
      
      &.negative {
        background: #fff2f0;
        color: #ff4d4f;
      }
      
      &.controversial {
        background: #fffbe6;
        color: #faad14;
      }
      
      &.neutral {
        background: #f5f5f5;
        color: #999;
      }
    }
    
    .topic-heat {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ff4d4f;
      font-size: 12px;
      font-weight: bold;
    }
  }
  
  .topic-title {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #333;
    line-height: 1.5;
  }
  
  .topic-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .topic-participants {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #999;
    }
    
    .topic-segments {
      display: flex;
      gap: 4px;
    }
  }
}

.sentiment-trend-section {
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #333;
  }
}

.sentiment-chart {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  .chart-legend {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 16px;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #666;
      
      .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
    }
  }
  
  .sentiment-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .sentiment-row {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .row-label {
      width: 60px;
      font-size: 12px;
      color: #666;
      text-align: right;
    }
    
    .row-bar {
      flex: 1;
      height: 16px;
      background: #f0f0f0;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      
      .bar-segment {
        height: 100%;
        transition: width 0.3s ease;
        
        &.positive {
          background: #52c41a;
        }
        
        &.neutral {
          background: #999;
        }
        
        &.negative {
          background: #ff4d4f;
        }
      }
    }
  }
}

.segment-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .detail-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E8 100%);
    
    .detail-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .detail-title {
      flex: 1;
      
      h3 {
        margin: 0 0 4px 0;
        font-size: 20px;
        color: #333;
      }
      
      p {
        margin: 0;
        font-size: 13px;
        color: #666;
      }
    }
    
    .close-btn {
      font-size: 24px;
      color: #999;
      cursor: pointer;
    }
  }
  
  .detail-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    
    .detail-section {
      margin-bottom: 20px;
      
      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #333;
      }
      
      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .focus-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        
        .focus-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #666;
        }
      }
      
      .sensitivity-list {
        .sensitivity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          
          span {
            width: 50px;
            font-size: 13px;
            color: #666;
          }
        }
      }
    }
  }
}
</style>
