<template>
  <div class="market-dashboard">
    <van-nav-bar title="市场情报中心" left-arrow @click-left="$router.back()">
      <template #right>
        <van-icon name="refresh" size="20" @click="refreshData" />
      </template>
    </van-nav-bar>

    <div class="dashboard-content">
      <!-- 市场概览卡片 -->
      <van-cell-group class="overview-section" inset>
        <div class="section-header">
          <van-icon name="chart-trending-o" />
          <span>市场概览</span>
          <van-tag :type="marketHealth.type" size="medium">{{ marketHealth.text }}</van-tag>
        </div>
        <van-row gutter="16" class="overview-stats">
          <van-col span="8">
            <div class="stat-card">
              <div class="stat-value" :class="getTrendClass(marketTrends[0]?.growthRate)">
                {{ marketTrends[0]?.growthRate > 0 ? '+' : '' }}{{ marketTrends[0]?.growthRate || 0 }}%
              </div>
              <div class="stat-label">市场增长率</div>
            </div>
          </van-col>
          <van-col span="8">
            <div class="stat-card">
              <div class="stat-value">{{ activePlayers }}万</div>
              <div class="stat-label">活跃玩家</div>
            </div>
          </van-col>
          <van-col span="8">
            <div class="stat-card">
              <div class="stat-value">{{ marketShare }}%</div>
              <div class="stat-label">市场份额</div>
            </div>
          </van-col>
        </van-row>
      </van-cell-group>

      <!-- 热门趋势 -->
      <van-cell-group class="trends-section" inset>
        <div class="section-header">
          <van-icon name="fire-o" />
          <span>热门趋势</span>
          <span class="update-time">{{ updateTime }}</span>
        </div>
        <div class="trend-list">
          <div
            v-for="trend in marketTrends"
            :key="trend.id"
            class="trend-item"
            :class="{ 'hot-trend': trend.growthRate > 30 }"
            @click="showTrendDetail(trend)"
          >
            <div class="trend-icon">
              <van-icon :name="getTrendIcon(trend.category)" />
            </div>
            <div class="trend-info">
              <div class="trend-name">{{ trend.name }}</div>
              <div class="trend-category">{{ getCategoryName(trend.category) }}</div>
              <van-progress
                :percentage="Math.min(trend.strength * 10, 100)"
                :color="getTrendColor(trend.strength)"
                stroke-width="6"
              />
            </div>
            <div class="trend-stats">
              <div class="growth-rate" :class="getTrendClass(trend.growthRate)">
                {{ trend.growthRate > 0 ? '+' : '' }}{{ trend.growthRate }}%
              </div>
              <div class="duration">持续{{ trend.duration }}天</div>
            </div>
          </div>
        </div>
      </van-cell-group>

      <!-- 竞争对手情报 -->
      <van-cell-group class="competitors-section" inset>
        <div class="section-header">
          <van-icon name="eye-o" />
          <span>竞争对手情报</span>
          <van-tag type="primary" size="medium">{{ competitors.length }}家</van-tag>
        </div>
        <div class="competitor-list">
          <div
            v-for="competitor in sortedCompetitors"
            :key="competitor.id"
            class="competitor-card"
            @click="showCompetitorDetail(competitor)"
          >
            <div class="competitor-header">
              <div class="competitor-rank">#{{ competitor.rank }}</div>
              <div class="competitor-name">{{ competitor.name }}</div>
              <van-tag :type="getThreatLevelType(competitor.threatLevel)" size="small">
                {{ getThreatLevelText(competitor.threatLevel) }}
              </van-tag>
            </div>
            <div class="competitor-stats">
              <div class="stat">
                <span class="stat-label">评分</span>
                <van-rate :model-value="competitor.rating" readonly size="12" />
              </div>
              <div class="stat">
                <span class="stat-label">下载</span>
                <span class="stat-value">{{ formatNumber(competitor.downloads) }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">营收</span>
                <span class="stat-value">{{ formatMoney(competitor.revenue) }}</span>
              </div>
            </div>
            <div class="competitor-tags">
              <van-tag
                v-for="tag in competitor.tags.slice(0, 3)"
                :key="tag"
                type="default"
                size="small"
                plain
              >
                {{ tag }}
              </van-tag>
            </div>
          </div>
        </div>
      </van-cell-group>

      <!-- 节日活动日历 -->
      <van-cell-group class="festival-section" inset>
        <div class="section-header">
          <van-icon name="calendar-o" />
          <span>节日活动日历</span>
        </div>
        <van-swipe class="festival-swipe" :autoplay="3000" indicator-color="#1989fa">
          <van-swipe-item v-for="festival in upcomingFestivals" :key="festival.id">
            <div class="festival-card" :class="getFestivalClass(festival.impact)">
              <div class="festival-date">
                <div class="month">{{ formatMonth(festival.startDate) }}</div>
                <div class="day">{{ formatDay(festival.startDate) }}</div>
              </div>
              <div class="festival-info">
                <div class="festival-name">{{ festival.name }}</div>
                <div class="festival-desc">{{ festival.description }}</div>
                <div class="festival-bonus">
                  <van-icon name="gem-o" />
                  <span>消费提升 {{ festival.bonusMultiplier }}x</span>
                </div>
              </div>
              <div class="festival-countdown">
                <van-count-down :time="getCountdown(festival.startDate)">
                  <template #default="timeData">
                    <span class="countdown-text">{{ timeData.days }}天后</span>
                  </template>
                </van-count-down>
              </div>
            </div>
          </van-swipe-item>
        </van-swipe>
      </van-cell-group>

      <!-- 收入预测 -->
      <van-cell-group class="forecast-section" inset>
        <div class="section-header">
          <van-icon name="chart-line" />
          <span>收入预测</span>
          <van-tag type="success" size="medium">AI预测</van-tag>
        </div>
        <div class="forecast-chart">
          <div class="chart-header">
            <div class="forecast-total">
              <span class="label">预计总收入</span>
              <span class="value">{{ formatMoney(forecast.totalRevenue) }}</span>
            </div>
            <div class="forecast-confidence">
              <span class="label">置信度</span>
              <van-circle
                v-model:current-rate="forecast.confidence"
                :rate="forecast.confidence"
                :speed="100"
                :text="forecast.confidence + '%'"
                size="50px"
                layer-color="#ebedf0"
                :color="getConfidenceColor(forecast.confidence)"
              />
            </div>
          </div>
          <div class="forecast-breakdown">
            <div class="breakdown-item">
              <div class="item-label">
                <van-icon name="vip-card-o" />
                <span>付费用户</span>
              </div>
              <div class="item-bar">
                <div
                  class="bar-fill"
                  :style="{ width: (forecast.payingUsers / forecast.totalUsers * 100) + '%' }"
                ></div>
              </div>
              <div class="item-value">{{ forecast.payingUsers }}人</div>
            </div>
            <div class="breakdown-item">
              <div class="item-label">
                <van-icon name="balance-o" />
                <span>ARPU</span>
              </div>
              <div class="item-value highlight">¥{{ forecast.arpu }}</div>
            </div>
            <div class="breakdown-item">
              <div class="item-label">
                <van-icon name="replay" />
                <span>留存率</span>
              </div>
              <div class="item-value">{{ forecast.retention }}%</div>
            </div>
          </div>
        </div>
      </van-cell-group>

      <!-- 市场机会提示 -->
      <van-cell-group class="opportunity-section" inset>
        <div class="section-header">
          <van-icon name="bullhorn-o" />
          <span>市场机会</span>
        </div>
        <van-notice-bar
          v-for="opportunity in opportunities"
          :key="opportunity.id"
          :text="opportunity.message"
          :left-icon="opportunity.icon"
          :color="opportunity.color"
          background="#ecf9ff"
          class="opportunity-notice"
        />
      </van-cell-group>

      <!-- 市场事件 -->
      <van-cell-group class="events-section" inset>
        <div class="section-header">
          <van-icon name="bell-o" />
          <span>市场动态</span>
          <van-tag type="danger" size="medium">{{ getActiveEvents(marketEvents).length }}个活跃</van-tag>
        </div>
        <div class="event-list">
          <van-empty v-if="getActiveEvents(marketEvents).length === 0" description="暂无活跃事件" />
          <div
            v-for="event in getActiveEvents(marketEvents).slice(0, 5)"
            :key="event.id"
            class="event-item"
            @click="showEventDetail(event)"
          >
            <div class="event-icon" :style="{ backgroundColor: event.impact.revenue > 0 ? '#e8f5e9' : '#ffebee' }">
              <van-icon :name="event.type === 'competitor' ? 'eye-o' : event.type === 'festival' ? 'gift-o' : 'fire-o'" />
            </div>
            <div class="event-info">
              <div class="event-name">{{ event.name }}</div>
              <div class="event-desc">{{ event.description }}</div>
              <div class="event-impact">
                <span :style="{ color: getEventImpactColor(event.impact.revenue) }">
                  收入 {{ event.impact.revenue > 0 ? '+' : '' }}{{ event.impact.revenue }}%
                </span>
                <span class="event-duration">持续{{ event.duration }}天</span>
              </div>
            </div>
          </div>
        </div>
      </van-cell-group>

      <!-- 市场机会指数 -->
      <van-cell-group class="opportunity-index-section" inset v-if="marketOpportunity">
        <div class="section-header">
          <van-icon name="chart-line" />
          <span>市场机会指数</span>
          <van-tag :type="marketOpportunity.overallScore >= 70 ? 'success' : marketOpportunity.overallScore >= 50 ? 'warning' : 'danger'" size="medium">
            {{ marketOpportunity.overallScore }}分
          </van-tag>
        </div>
        <div class="opportunity-content">
          <div class="opportunity-analysis">{{ marketOpportunity.analysis }}</div>
          <div class="factor-list">
            <div v-for="factor in marketOpportunity.factors" :key="factor.name" class="factor-item">
              <span class="factor-name">{{ factor.name }}</span>
              <van-progress :percentage="factor.score" :stroke-width="8" />
              <span class="factor-score">{{ factor.score }}分</span>
            </div>
          </div>
        </div>
      </van-cell-group>

      <!-- 发布时间推荐 -->
      <van-cell-group class="release-time-section" inset v-if="releaseRecommendations.length > 0">
        <div class="section-header">
          <van-icon name="calendar-o" />
          <span>最佳发布时间</span>
        </div>
        <div class="recommendation-list">
          <div
            v-for="(rec, index) in releaseRecommendations.slice(0, 3)"
            :key="index"
            class="recommendation-item"
            :class="{ 'best': index === 0 }"
          >
            <div class="rec-rank">{{ index + 1 }}</div>
            <div class="rec-info">
              <div class="rec-date">{{ rec.date.toLocaleDateString('zh-CN') }}</div>
              <div class="rec-reason">{{ rec.reason }}</div>
            </div>
            <div class="rec-score">{{ rec.score }}分</div>
          </div>
        </div>
      </van-cell-group>

      <!-- 趋势预测 -->
      <van-cell-group class="trend-prediction-section" inset v-if="trendPrediction.length > 0">
        <div class="section-header">
          <van-icon name="trending-up" />
          <span>趋势预测 (14天)</span>
        </div>
        <div class="prediction-chart">
          <div class="prediction-bars">
            <div
              v-for="(pred, index) in trendPrediction.filter((_, i) => i % 3 === 0)"
              :key="index"
              class="prediction-bar"
            >
              <div class="bar" :style="{ height: pred.predictedStrength + '%', opacity: pred.confidence / 100 }"></div>
              <div class="bar-label">{{ pred.date.getMonth() + 1 }}/{{ pred.date.getDate() }}</div>
            </div>
          </div>
        </div>
      </van-cell-group>

      <!-- 风险评估 -->
      <van-cell-group class="risk-section" inset v-if="marketRisk">
        <div class="section-header">
          <van-icon name="warning-o" />
          <span>风险评估</span>
          <van-tag :type="getRiskLevelType(marketRisk.overallRisk)" size="medium">
            {{ getRiskLevelText(marketRisk.overallRisk) }}风险
          </van-tag>
        </div>
        <div class="risk-content">
          <div class="risk-factors">
            <div v-for="factor in marketRisk.riskFactors" :key="factor.factor" class="risk-factor">
              <span class="factor-name">{{ factor.factor }}</span>
              <van-tag :type="getRiskLevelType(factor.level)" size="small">{{ getRiskLevelText(factor.level) }}</van-tag>
              <span class="factor-desc">{{ factor.description }}</span>
            </div>
          </div>
          <van-divider>应对策略</van-divider>
          <van-cell-group inset>
            <van-cell
              v-for="(strategy, index) in marketRisk.mitigationStrategies"
              :key="index"
              :title="strategy"
              icon="shield-o"
            />
          </van-cell-group>
        </div>
      </van-cell-group>

      <!-- 模拟市场动态 -->
      <van-cell-group class="simulation-section" inset v-if="isInitialized">
        <div class="section-header">
          <van-icon name="coupon" />
          <span>🔮 模拟市场预测</span>
          <van-tag type="primary" size="medium">AI模拟</van-tag>
        </div>
        <div class="simulation-content">
          <div v-if="worldImpact" class="world-impact-grid">
            <div class="impact-item">
              <span class="impact-label">DAU影响</span>
              <span class="impact-value" :class="worldImpact.project.dauChange >= 0 ? 'positive' : 'negative'">
                {{ worldImpact.project.dauChange >= 0 ? '+' : '' }}{{ worldImpact.project.dauChange }}
              </span>
            </div>
            <div class="impact-item">
              <span class="impact-label">评分影响</span>
              <span class="impact-value" :class="worldImpact.project.ratingChange >= 0 ? 'positive' : 'negative'">
                {{ worldImpact.project.ratingChange >= 0 ? '+' : '' }}{{ worldImpact.project.ratingChange.toFixed(1) }}
              </span>
            </div>
            <div class="impact-item">
              <span class="impact-label">现金影响</span>
              <span class="impact-value" :class="worldImpact.company.cashChange >= 0 ? 'positive' : 'negative'">
                {{ worldImpact.company.cashChange >= 0 ? '+' : '' }}{{ worldImpact.company.cashChange }}
              </span>
            </div>
            <div class="impact-item">
              <span class="impact-label">声誉影响</span>
              <span class="impact-value" :class="worldImpact.company.reputationChange >= 0 ? 'positive' : 'negative'">
                {{ worldImpact.company.reputationChange >= 0 ? '+' : '' }}{{ worldImpact.company.reputationChange }}
              </span>
            </div>
          </div>
          <div class="retention-preview">
            <div class="retention-title">模拟留存预测</div>
            <div class="retention-bars">
              <div class="retention-item">
                <span class="retention-label">D1</span>
                <div class="retention-bar">
                  <div class="retention-fill" :style="{ width: currentRetention.d1 + '%' }"></div>
                </div>
                <span class="retention-value">{{ currentRetention.d1 }}%</span>
              </div>
              <div class="retention-item">
                <span class="retention-label">D7</span>
                <div class="retention-bar">
                  <div class="retention-fill" :style="{ width: currentRetention.d7 + '%' }"></div>
                </div>
                <span class="retention-value">{{ currentRetention.d7 }}%</span>
              </div>
              <div class="retention-item">
                <span class="retention-label">D30</span>
                <div class="retention-bar">
                  <div class="retention-fill" :style="{ width: currentRetention.d30 + '%' }"></div>
                </div>
                <span class="retention-value">{{ currentRetention.d30 }}%</span>
              </div>
            </div>
          </div>
          <div v-if="characterPopularity.length > 0" class="character-preview">
            <div class="character-title">🔥 角色热度预测</div>
            <div class="character-list">
              <div v-for="(char, index) in characterPopularity.slice(0, 3)" :key="char.name" class="character-item">
                <span class="char-rank">{{ index + 1 }}</span>
                <span class="char-name">{{ char.name }}</span>
                <span class="char-popularity">{{ char.popularity }}%</span>
              </div>
            </div>
          </div>
        </div>
      </van-cell-group>
    </div>

    <!-- 趋势详情弹窗 -->
    <van-popup v-model:show="showTrendPopup" position="bottom" round :style="{ height: '60%' }">
      <div class="popup-content" v-if="selectedTrend">
        <div class="popup-header">
          <h3>{{ selectedTrend.name }}</h3>
          <van-icon name="cross" @click="showTrendPopup = false" />
        </div>
        <div class="trend-detail">
          <div class="detail-section">
            <h4>趋势分析</h4>
            <p>{{ selectedTrend.description }}</p>
          </div>
          <div class="detail-section">
            <h4>热门元素</h4>
            <div class="hot-elements">
              <van-tag
                v-for="element in selectedTrend.hotElements"
                :key="element"
                type="primary"
                size="medium"
                class="element-tag"
              >
                {{ element }}
              </van-tag>
            </div>
          </div>
          <div class="detail-section">
            <h4>建议策略</h4>
            <van-cell-group inset>
              <van-cell
                v-for="(suggestion, index) in selectedTrend.suggestions"
                :key="index"
                :title="suggestion"
                icon="bulb-o"
              />
            </van-cell-group>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 竞争对手详情弹窗 -->
    <van-popup v-model:show="showCompetitorPopup" position="bottom" round :style="{ height: '70%' }">
      <div class="popup-content" v-if="selectedCompetitor">
        <div class="popup-header">
          <h3>{{ selectedCompetitor.name }}</h3>
          <van-icon name="cross" @click="showCompetitorPopup = false" />
        </div>
        <div class="competitor-detail">
          <div class="detail-stats">
            <div class="stat-row">
              <div class="stat-item">
                <div class="stat-value">{{ selectedCompetitor.rating }}</div>
                <div class="stat-label">评分</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatNumber(selectedCompetitor.downloads) }}</div>
                <div class="stat-label">下载</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatMoney(selectedCompetitor.revenue) }}</div>
                <div class="stat-label">营收</div>
              </div>
            </div>
          </div>
          <div class="detail-section">
            <h4>优势分析</h4>
            <van-cell-group inset>
              <van-cell
                v-for="(strength, index) in selectedCompetitor.strengths"
                :key="index"
                :title="strength"
                icon="star-o"
              />
            </van-cell-group>
          </div>
          <div class="detail-section">
            <h4>劣势分析</h4>
            <van-cell-group inset>
              <van-cell
                v-for="(weakness, index) in selectedCompetitor.weaknesses"
                :key="index"
                :title="weakness"
                icon="warning-o"
              />
            </van-cell-group>
          </div>
          <div class="detail-section">
            <h4>应对策略</h4>
            <van-cell-group inset>
              <van-cell
                v-for="(strategy, index) in selectedCompetitor.counterStrategies"
                :key="index"
                :title="strategy"
                icon="shield-o"
              />
            </van-cell-group>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 事件详情弹窗 -->
    <van-popup v-model:show="showEventPopup" position="bottom" round :style="{ height: '60%' }">
      <div class="popup-content" v-if="selectedEvent">
        <div class="popup-header">
          <h3>{{ selectedEvent.name }}</h3>
          <van-icon name="cross" @click="showEventPopup = false" />
        </div>
        <div class="event-detail">
          <div class="detail-section">
            <h4>事件描述</h4>
            <p>{{ selectedEvent.description }}</p>
          </div>
          <div class="detail-section">
            <h4>影响分析</h4>
            <van-cell-group inset>
              <van-cell title="收入影响" :label="selectedEvent.impact.revenue + '%'">
                <template #right-icon>
                  <van-icon :name="selectedEvent.impact.revenue > 0 ? 'arrow-up' : 'arrow-down'" :color="getEventImpactColor(selectedEvent.impact.revenue)" />
                </template>
              </van-cell>
              <van-cell title="下载影响" :label="selectedEvent.impact.downloads + '%'" />
              <van-cell title="留存影响" :label="selectedEvent.impact.retention + '%'" />
            </van-cell-group>
          </div>
          <div class="detail-section">
            <h4>持续时间</h4>
            <p>从 {{ selectedEvent.startDate.toLocaleDateString('zh-CN') }} 开始，持续 {{ selectedEvent.duration }} 天</p>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { MarketTrend, Competitor, Festival, RevenueForecast, MarketEvent, MarketEnvironment } from '@/types/market';
import { generateRandomEvent, getActiveEvents, calculateCombinedImpact, eventHistory } from '@/utils/marketEvents';
import { calculateMarketOpportunity, recommendReleaseTime, predictTrend, assessMarketRisk } from '@/utils/marketPrediction';
import { useSimulationStore } from '@/stores/simulationStore';
import { storeToRefs } from 'pinia';

const simulationStore = useSimulationStore();
const { isInitialized, worldImpact, currentRetention, sentimentDistribution, gachaDistribution, characterPopularity } = storeToRefs(simulationStore);

// 市场趋势数据
const marketTrends = ref<MarketTrend[]>([
  {
    id: '1',
    name: '古风仙侠',
    category: 'setting',
    strength: 8,
    growthRate: 35,
    duration: 45,
    description: '传统古风题材持续升温，仙侠元素深受玩家喜爱',
    affectedTags: ['古风', '仙侠', '修真'],
    suggestions: ['增加古风服饰', '融入仙侠剧情', '设计修真系统']
  },
  {
    id: '2',
    name: '年下弟弟',
    category: 'character',
    strength: 9,
    growthRate: 52,
    duration: 30,
    description: '年下弟弟角色人气飙升，姐弟恋题材大受欢迎',
    affectedTags: ['年下', '弟弟', '姐弟恋'],
    suggestions: ['设计年下角色', '增加姐弟恋剧情线', '强化弟弟属性']
  },
  {
    id: '3',
    name: '悬疑推理',
    category: 'plot',
    strength: 7,
    growthRate: 28,
    duration: 20,
    description: '悬疑推理剧情受到追捧，玩家喜欢烧脑体验',
    affectedTags: ['悬疑', '推理', '侦探'],
    suggestions: ['增加悬疑元素', '设计推理玩法', '加入侦探角色']
  },
  {
    id: '4',
    name: '职场恋爱',
    category: 'setting',
    strength: 6,
    growthRate: 18,
    duration: 60,
    description: '职场恋爱题材稳定受欢迎，贴近现实生活',
    affectedTags: ['职场', '办公室', '上司'],
    suggestions: ['设计职场场景', '增加办公室恋情', '加入职场竞争']
  }
]);

// 竞争对手数据
const competitors = ref<Competitor[]>([
  {
    id: '1',
    name: '恋与制作人',
    rating: 4.8,
    downloads: 5000000,
    revenue: 80000000,
    tags: ['现代', '职场', '超能力'],
    strengths: ['剧情质量高', '角色塑造出色', '运营稳定'],
    weaknesses: ['玩法单一', '更新慢', '氪金点多'],
    threatLevel: 5,
    rank: 1
  },
  {
    id: '2',
    name: '光与夜之恋',
    rating: 4.6,
    downloads: 3500000,
    revenue: 50000000,
    tags: ['现代', '时尚', '设计师'],
    strengths: ['美术精美', '音乐优秀', '声优阵容强'],
    weaknesses: ['剧情拖沓', '活动重复', '福利少'],
    threatLevel: 4,
    rank: 2
  },
  {
    id: '3',
    name: '未定事件簿',
    rating: 4.5,
    downloads: 2000000,
    revenue: 30000000,
    tags: ['推理', '律师', '悬疑'],
    strengths: ['推理玩法创新', '剧情逻辑强', '女主独立'],
    weaknesses: ['门槛较高', '节奏慢', '男性角色少'],
    threatLevel: 3,
    rank: 3
  },
  {
    id: '4',
    name: '时空中的绘旅人',
    rating: 4.4,
    downloads: 1500000,
    revenue: 20000000,
    tags: ['穿越', '多世界', '画家'],
    strengths: ['世界观宏大', '穿越设定新颖', '剧情分支多'],
    weaknesses: ['系统复杂', '新手引导差', '资源获取难'],
    threatLevel: 3,
    rank: 4
  }
]);

// 节日数据
const festivals = ref<Festival[]>([
  {
    id: '1',
    name: '情人节活动',
    startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    description: '浪漫情人节，限定剧情与服装上线',
    bonusMultiplier: 2.5,
    specialEvents: ['情人节限定卡池', '约会剧情', '情侣服装'],
    impact: 'high'
  },
  {
    id: '2',
    name: '白色情人节',
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 51 * 24 * 60 * 60 * 1000),
    description: '回礼之日，特别剧情与道具',
    bonusMultiplier: 2.0,
    specialEvents: ['回礼剧情', '限定道具', '双倍掉落'],
    impact: 'medium'
  },
  {
    id: '3',
    name: '周年庆典',
    startDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
    description: '游戏周年庆，海量福利与活动',
    bonusMultiplier: 3.0,
    specialEvents: ['周年限定角色', '登录奖励', '特别剧情'],
    impact: 'high'
  }
]);

// 收入预测数据
const forecast = ref<RevenueForecast>({
  totalRevenue: 1500000,
  totalUsers: 50000,
  payingUsers: 2500,
  arpu: 600,
  retention: 35,
  confidence: 78
});

// 市场机会
const opportunities = ref([
  {
    id: '1',
    message: '年下弟弟趋势持续升温，建议推出相关角色',
    icon: 'fire',
    color: '#ff6b6b'
  },
  {
    id: '2',
    message: '情人节活动即将到来，提前准备限定内容',
    icon: 'gift',
    color: '#ff69b4'
  },
  {
    id: '3',
    message: '竞争对手"恋与制作人"近期更新缓慢，是吸引玩家的好时机',
    icon: 'aim',
    color: '#4ecdc4'
  }
]);

// 基础数据
const activePlayers = ref(1250);
const marketShare = ref(8.5);
const updateTime = ref('刚刚');

// 市场事件
const marketEvents = ref<MarketEvent[]>([]);
const showEventPopup = ref(false);
const selectedEvent = ref<MarketEvent | null>(null);

// 市场预测
const marketOpportunity = ref<{
  overallScore: number;
  factors: Array<{ name: string; score: number; weight: number }>;
  analysis: string;
} | null>(null);
const releaseRecommendations = ref<Array<{ date: Date; score: number; reason: string }>>([]);
const trendPrediction = ref<Array<{ date: Date; predictedStrength: number; confidence: number }>>([]);
const marketRisk = ref<{
  overallRisk: 'low' | 'medium' | 'high';
  riskFactors: Array<{ factor: string; level: 'low' | 'medium' | 'high'; description: string }>;
  mitigationStrategies: string[];
} | null>(null);

// 市场环境（用于事件生成和预测）
const marketEnvironment = computed<MarketEnvironment>(() => ({
  trend: marketTrends.value[0],
  competitors: competitors.value,
  festivals: festivals.value,
  overallHeat: marketTrends.value.reduce((sum, t) => sum + t.strength, 0) / marketTrends.value.length,
  marketShare: marketShare.value
}));

// 计算属性
const marketHealth = computed(() => {
  const avgGrowth = marketTrends.value.reduce((sum, t) => sum + t.growthRate, 0) / marketTrends.value.length;
  if (avgGrowth > 30) return { type: 'success' as const, text: '繁荣' };
  if (avgGrowth > 15) return { type: 'primary' as const, text: '良好' };
  if (avgGrowth > 0) return { type: 'warning' as const, text: '平稳' };
  return { type: 'danger' as const, text: '低迷' };
});

const sortedCompetitors = computed(() => {
  return [...competitors.value].sort((a, b) => a.rank - b.rank);
});

const upcomingFestivals = computed(() => {
  return festivals.value.filter(f => f.startDate > new Date()).slice(0, 3);
});

// 弹窗控制
const showTrendPopup = ref(false);
const showCompetitorPopup = ref(false);
const selectedTrend = ref<MarketTrend | null>(null);
const selectedCompetitor = ref<Competitor | null>(null);

// 方法
const refreshData = () => {
  // 模拟刷新数据
  updateTime.value = new Date().toLocaleTimeString();
  // 随机微调数据
  forecast.value.confidence = Math.min(95, Math.max(60, forecast.value.confidence + Math.random() * 10 - 5));

  // 生成新的市场事件
  const newEvent = generateRandomEvent(marketEnvironment.value, ['古风', '恋爱']);
  if (newEvent) {
    marketEvents.value.push(newEvent);
    eventHistory.addEvent(newEvent);
  }

  // 更新市场预测
  updateMarketPredictions();
};

// 更新市场预测
const updateMarketPredictions = () => {
  // 计算市场机会指数
  marketOpportunity.value = calculateMarketOpportunity(marketEnvironment.value, ['古风', '恋爱']);

  // 获取发布时间推荐
  releaseRecommendations.value = recommendReleaseTime(marketEnvironment.value, ['古风', '恋爱']);

  // 预测趋势
  trendPrediction.value = predictTrend(marketTrends.value, 14);

  // 评估市场风险
  marketRisk.value = assessMarketRisk(marketEnvironment.value, ['古风', '恋爱']);
};

// 显示事件详情
const showEventDetail = (event: MarketEvent) => {
  selectedEvent.value = event;
  showEventPopup.value = true;
};

// 获取事件影响颜色
const getEventImpactColor = (impact: number) => {
  if (impact > 0) return '#07c160';
  if (impact < 0) return '#ff4d4f';
  return '#969799';
};

// 获取风险等级样式
const getRiskLevelType = (level: 'low' | 'medium' | 'high') => {
  const types = { low: 'success', medium: 'warning', high: 'danger' };
  return types[level];
};

// 获取风险等级文本
const getRiskLevelText = (level: 'low' | 'medium' | 'high') => {
  const texts = { low: '低', medium: '中', high: '高' };
  return texts[level];
};

const showTrendDetail = (trend: MarketTrend) => {
  selectedTrend.value = trend;
  showTrendPopup.value = true;
};

const showCompetitorDetail = (competitor: Competitor) => {
  selectedCompetitor.value = competitor;
  showCompetitorPopup.value = true;
};

const getTrendClass = (rate: number) => {
  if (rate > 30) return 'trend-up-high';
  if (rate > 0) return 'trend-up';
  if (rate < -10) return 'trend-down-high';
  return 'trend-down';
};

const getTrendIcon = (category: string) => {
  const icons: Record<string, string> = {
    setting: 'location-o',
    character: 'user-o',
    plot: 'bookmark-o',
    gameplay: 'game-o'
  };
  return icons[category] || 'trending-o';
};

const getCategoryName = (category: string) => {
  const names: Record<string, string> = {
    setting: '世界观',
    character: '角色',
    plot: '剧情',
    gameplay: '玩法'
  };
  return names[category] || category;
};

const getTrendColor = (strength: number) => {
  if (strength >= 8) return '#ff6b6b';
  if (strength >= 6) return '#ffa502';
  return '#2ed573';
};

const getThreatLevelType = (level: number) => {
  if (level >= 5) return 'danger';
  if (level >= 3) return 'warning';
  return 'success';
};

const getThreatLevelText = (level: number) => {
  if (level >= 5) return '极高';
  if (level >= 4) return '高';
  if (level >= 3) return '中';
  return '低';
};

const getFestivalClass = (impact: string) => {
  return impact === 'high' ? 'festival-high' : 'festival-medium';
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return '#07c160';
  if (confidence >= 60) return '#ff976a';
  return '#ee0a24';
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatMoney = (amount: number) => {
  if (amount >= 100000000) return '¥' + (amount / 100000000).toFixed(1) + '亿';
  if (amount >= 10000) return '¥' + (amount / 10000).toFixed(1) + '万';
  return '¥' + amount;
};

const formatMonth = (date: Date) => {
  return (date.getMonth() + 1) + '月';
};

const formatDay = (date: Date) => {
  return date.getDate();
};

const getCountdown = (date: Date) => {
  return date.getTime() - Date.now();
};

onMounted(() => {
  refreshData();
  // 初始化市场预测
  updateMarketPredictions();
});
</script>

<style scoped lang="scss">
.market-dashboard {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.dashboard-content {
  padding: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #ebedf0;
  font-size: 16px;
  font-weight: 600;
  color: #323233;

  .van-icon {
    font-size: 20px;
    color: #1989fa;
  }

  .update-time {
    margin-left: auto;
    font-size: 12px;
    color: #969799;
    font-weight: normal;
  }
}

// 概览统计
.overview-section {
  margin-bottom: 12px;
}

.overview-stats {
  padding: 16px;
}

.stat-card {
  text-align: center;
  padding: 12px 8px;
  background: #f7f8fa;
  border-radius: 8px;

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #323233;
    margin-bottom: 4px;

    &.trend-up {
      color: #07c160;
    }

    &.trend-up-high {
      color: #ff6b6b;
    }

    &.trend-down {
      color: #ff976a;
    }

    &.trend-down-high {
      color: #ee0a24;
    }
  }

  .stat-label {
    font-size: 12px;
    color: #969799;
  }
}

// 趋势列表
.trends-section {
  margin-bottom: 12px;
}

.trend-list {
  padding: 8px;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #fafafa;
  transition: all 0.3s;

  &:last-child {
    margin-bottom: 0;
  }

  &.hot-trend {
    background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
    border: 1px solid #ffdbdb;
  }

  &:active {
    transform: scale(0.98);
  }
}

.trend-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;

  .van-icon {
    font-size: 20px;
    color: #1989fa;
  }
}

.trend-info {
  flex: 1;

  .trend-name {
    font-size: 14px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 2px;
  }

  .trend-category {
    font-size: 12px;
    color: #969799;
    margin-bottom: 6px;
  }
}

.trend-stats {
  text-align: right;

  .growth-rate {
    font-size: 16px;
    font-weight: 700;

    &.trend-up {
      color: #07c160;
    }

    &.trend-up-high {
      color: #ff6b6b;
    }
  }

  .duration {
    font-size: 11px;
    color: #969799;
  }
}

// 竞争对手
.competitors-section {
  margin-bottom: 12px;
}

.competitor-list {
  padding: 8px;
}

.competitor-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  &:active {
    background: #f0f0f0;
  }
}

.competitor-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  .competitor-rank {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ffd700;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .competitor-name {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: #323233;
  }
}

.competitor-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;

  .stat {
    display: flex;
    align-items: center;
    gap: 4px;

    .stat-label {
      font-size: 11px;
      color: #969799;
    }

    .stat-value {
      font-size: 12px;
      color: #323233;
      font-weight: 500;
    }
  }
}

.competitor-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

// 节日活动
.festival-section {
  margin-bottom: 12px;
}

.festival-swipe {
  height: 140px;
  padding: 12px;

  .van-swipe-item {
    padding: 0 4px;
  }
}

.festival-card {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);

  &.festival-high {
    background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
  }

  &.festival-medium {
    background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  }
}

.festival-date {
  text-align: center;
  min-width: 50px;

  .month {
    font-size: 12px;
    color: #666;
  }

  .day {
    font-size: 28px;
    font-weight: 700;
    color: #323233;
  }
}

.festival-info {
  flex: 1;

  .festival-name {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 4px;
  }

  .festival-desc {
    font-size: 12px;
    color: #666;
    margin-bottom: 6px;
  }

  .festival-bonus {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #ff6b6b;
    font-weight: 500;

    .van-icon {
      font-size: 14px;
    }
  }
}

.festival-countdown {
  .countdown-text {
    font-size: 14px;
    color: #1989fa;
    font-weight: 500;
  }
}

// 收入预测
.forecast-section {
  margin-bottom: 12px;
}

.forecast-chart {
  padding: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.forecast-total {
  .label {
    display: block;
    font-size: 12px;
    color: #969799;
    margin-bottom: 4px;
  }

  .value {
    font-size: 24px;
    font-weight: 700;
    color: #07c160;
  }
}

.forecast-confidence {
  text-align: center;

  .label {
    display: block;
    font-size: 11px;
    color: #969799;
    margin-bottom: 4px;
  }
}

.forecast-breakdown {
  .breakdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #ebedf0;

    &:last-child {
      border-bottom: none;
    }

    .item-label {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 80px;
      font-size: 13px;
      color: #666;

      .van-icon {
        font-size: 16px;
        color: #1989fa;
      }
    }

    .item-bar {
      flex: 1;
      height: 8px;
      background: #ebedf0;
      border-radius: 4px;
      overflow: hidden;

      .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #1989fa, #07c160);
        border-radius: 4px;
        transition: width 0.5s ease;
      }
    }

    .item-value {
      width: 60px;
      text-align: right;
      font-size: 13px;
      color: #323233;
      font-weight: 500;

      &.highlight {
        color: #ff6b6b;
      }
    }
  }
}

// 市场机会
.opportunity-section {
  margin-bottom: 12px;
}

.opportunity-notice {
  margin: 8px;
  border-radius: 8px;
}

// 弹窗样式
.popup-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #323233;
  }

  .van-icon {
    font-size: 20px;
    color: #969799;
    padding: 4px;
  }
}

.trend-detail,
.competitor-detail {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.detail-section {
  margin-bottom: 20px;

  h4 {
    font-size: 14px;
    color: #323233;
    margin-bottom: 12px;
    padding-left: 8px;
    border-left: 3px solid #1989fa;
  }

  p {
    font-size: 13px;
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
}

.hot-elements {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.element-tag {
  margin: 0;
}

.detail-stats {
  background: #f7f8fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.stat-row {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #323233;
  }

  .stat-label {
    font-size: 12px;
    color: #969799;
    margin-top: 4px;
  }
}

// 市场事件
.events-section {
  margin-bottom: 12px;
}

.event-list {
  padding: 8px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #fafafa;
  transition: all 0.3s;

  &:last-child {
    margin-bottom: 0;
  }

  &:active {
    transform: scale(0.98);
    background: #f0f0f0;
  }
}

.event-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  .van-icon {
    font-size: 20px;
    color: #666;
  }
}

.event-info {
  flex: 1;

  .event-name {
    font-size: 14px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 2px;
  }

  .event-desc {
    font-size: 12px;
    color: #666;
    line-height: 1.4;
    margin-bottom: 4px;
  }

  .event-impact {
    display: flex;
    gap: 12px;
    font-size: 11px;

    .event-duration {
      color: #969799;
    }
  }
}

.event-detail {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

// 市场机会指数
.opportunity-index-section {
  margin-bottom: 12px;
}

.opportunity-content {
  padding: 16px;
}

.opportunity-analysis {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.factor-list {
  .factor-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .factor-name {
      width: 80px;
      font-size: 13px;
      color: #666;
    }

    .van-progress {
      flex: 1;
    }

    .factor-score {
      width: 40px;
      text-align: right;
      font-size: 12px;
      color: #323233;
      font-weight: 500;
    }
  }
}

// 发布时间推荐
.release-time-section {
  margin-bottom: 12px;
}

.recommendation-list {
  padding: 8px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #fafafa;

  &:last-child {
    margin-bottom: 0;
  }

  &.best {
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    border: 1px solid #a5d6a7;

    .rec-rank {
      background: #4caf50;
    }
  }
}

.rec-rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #bdbdbd;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rec-info {
  flex: 1;

  .rec-date {
    font-size: 14px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 2px;
  }

  .rec-reason {
    font-size: 12px;
    color: #666;
    line-height: 1.4;
  }
}

.rec-score {
  font-size: 16px;
  font-weight: 700;
  color: #07c160;
}

// 趋势预测
.trend-prediction-section {
  margin-bottom: 12px;
}

.prediction-chart {
  padding: 16px;
}

.prediction-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 120px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebedf0;
}

.prediction-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .bar {
    width: 24px;
    background: linear-gradient(to top, #1989fa, #64b5f6);
    border-radius: 4px 4px 0 0;
    min-height: 4px;
    transition: all 0.3s ease;
  }

  .bar-label {
    font-size: 11px;
    color: #969799;
  }
}

// 风险评估
.risk-section {
  margin-bottom: 12px;
}

.risk-content {
  padding: 16px;
}

.risk-factors {
  margin-bottom: 16px;
}

.risk-factor {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  .factor-name {
    width: 80px;
    font-size: 13px;
    color: #323233;
    font-weight: 500;
  }

  .factor-desc {
    flex: 1;
    font-size: 12px;
    color: #666;
  }
}

.simulation-section {
  margin-bottom: 12px;
}

.simulation-content {
  padding: 16px;
}

.world-impact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.impact-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.impact-label {
  font-size: 12px;
  color: #969799;
  margin-bottom: 4px;
}

.impact-value {
  font-size: 18px;
  font-weight: bold;

  &.positive {
    color: #07c160;
  }

  &.negative {
    color: #ee0a24;
  }
}

.retention-preview {
  margin-bottom: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
}

.retention-title, .character-title {
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin-bottom: 12px;
}

.retention-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.retention-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.retention-label {
  width: 28px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.retention-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.retention-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78, #68d391);
  border-radius: 4px;
}

.retention-value {
  width: 36px;
  text-align: right;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.character-preview {
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.character-title {
  color: #323233;
  margin-bottom: 8px;
}

.character-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.character-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 6px;
}

.char-rank {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  color: white;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.char-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
}

.char-popularity {
  font-size: 12px;
  color: #ff6b6b;
  font-weight: bold;
}
</style>
