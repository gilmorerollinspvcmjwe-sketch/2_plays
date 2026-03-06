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
          <van-tag type="primary" size="medium">{{ competitorList.length }}家</van-tag>
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

      <!-- 竞品动态 -->
      <van-cell-group class="competitor-news-section" inset v-if="(competitorNews || []).length > 0">
        <div class="section-header">
          <span>🏢</span>
          <span>竞品动态</span>
          <van-tag type="warning" size="medium">{{ competitorNews?.length || 0 }}条</van-tag>
        </div>
        <div class="news-list">
          <van-cell
            v-for="news in (competitorNews || []).slice(-5).reverse()"
            :key="news.id"
            :title="news.title"
            :label="news.content.slice(0, 50) + '...'"
            :value="`第${news.day}天`"
            size="small"
            is-link
            @click="showCompetitorNewsDetail(news)"
          >
            <template #icon>
              <span class="news-company-avatar">{{ news.companyAvatar }}</span>
            </template>
            <template #value>
              <van-tag :type="getNewsType(news.type)">{{ getNewsTypeText(news.type) }}</van-tag>
            </template>
          </van-cell>
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
import { useSimulationStore } from '@/stores/simulationStore';
import { storeToRefs } from 'pinia';

const simulationStore = useSimulationStore();
const { isInitialized, worldImpact, currentRetention, sentimentDistribution, gachaDistribution, characterPopularity, competitorNews, competitors, worldSimulator, globalMetrics } = storeToRefs(simulationStore);

// 竞品数据 - 从 simulationStore 获取
const competitorList = computed(() => {
  const comps = competitors.value || [];
  return comps.map((c: any, index: number) => ({
    id: c.id,
    name: c.name,
    rating: c.games?.[0]?.rating || 7,
    downloads: c.games?.[0]?.dau || 0,
    revenue: c.games?.[0]?.revenue || 0,
    tags: c.games?.[0]?.genre ? [c.games[0].genre] : [],
    strengths: [getPersonalityStrength(c.personality)],
    weaknesses: [getPersonalityWeakness(c.personality)],
    threatLevel: c.decisionWeights?.revenue > 0.5 ? 4 : 3,
    rank: index + 1,
  }));
});

// 个性化优势
function getPersonalityStrength(personality: string): string {
  const map: Record<string, string> = {
    innovator: '创新能力强',
    steady: '运营稳定',
    monetizer: '变现能力强',
    disruptor: '市场反应快',
    craftsman: '品质出众',
    learner: '学习能力强',
  };
  return map[personality] || '综合实力强';
}

// 个性化劣势
function getPersonalityWeakness(personality: string): string {
  const map: Record<string, string> = {
    innovator: '风险较高',
    steady: '创新不足',
    monetizer: '口碑较差',
    disruptor: '不稳定',
    craftsman: '更新较慢',
    learner: '缺乏特色',
  };
  return map[personality] || '暂无明显劣势';
}

// 市场趋势 - 从 WorldSimulator 获取
const marketTrends = computed(() => {
  if (!worldSimulator.value) return [];
  
  try {
    const trends = worldSimulator.value.getGenreTrends();
    return Array.from(trends.values()).map((t: any) => ({
      id: t.genreId,
      name: t.genreName,
      category: 'genre',
      strength: t.currentHeat || 5,
      growthRate: t.growthRate || 10,
      duration: t.peakDuration || 30,
      description: t.description || `${t.genreName}题材市场表现良好`,
      affectedTags: [t.genreName],
      suggestions: generateSuggestions(t),
    }));
  } catch (e) {
    return [];
  }
});

// 生成建议
function generateSuggestions(t: any): string[] {
  return [
    `推出${t.genreName}相关角色`,
    `设计${t.genreName}剧情`,
    `${t.genreName}活动可以提升热度`,
  ];
}

// 季节热点
const seasonalHots = computed(() => {
  if (!worldSimulator.value) return [];
  try {
    return worldSimulator.value.getSeasonalHots() || [];
  } catch (e) {
    return [];
  }
});

// 合并竞品动态到市场动态列表
const allMarketEvents = computed(() => {
  const events = [...marketEvents.value];
  
  // 添加竞品动态到列表
  const news = competitorNews.value || [];
  for (const n of news) {
    events.unshift({
      id: n.id,
      type: 'competitor' as const,
      title: n.title,
      content: n.content,
      day: n.day,
      impact: n.impact?.marketSentiment || 0,
      company: n.companyName,
    });
  }
  
  return events.slice(0, 20);
});

// 收入预测数据
const festivals = computed<Festival[]>(() => {
  const now = new Date();
  const year = now.getFullYear();
  const result: Festival[] = [];
  
  // 情人节（2月14日）
  const valentine = new Date(year, 1, 14);
  if (valentine > now) {
    result.push({
      id: 'valentine',
      name: '情人节活动',
      startDate: valentine,
      endDate: new Date(valentine.getTime() + 7 * 24 * 60 * 60 * 1000),
      description: '浪漫情人节，限定剧情与服装上线',
      bonusMultiplier: 2.5,
      specialEvents: ['情人节限定卡池', '约会剧情', '情侣服装'],
      impact: 'high'
    });
  }
  
  // 白色情人节（3月14日）
  const whiteDay = new Date(year, 2, 14);
  if (whiteDay > now) {
    result.push({
      id: 'white_day',
      name: '白色情人节',
      startDate: whiteDay,
      endDate: new Date(whiteDay.getTime() + 7 * 24 * 60 * 60 * 1000),
      description: '回礼之日，特别剧情与道具',
      bonusMultiplier: 2.0,
      specialEvents: ['回礼剧情', '限定道具', '双倍掉落'],
      impact: 'medium'
    });
  }
  
  // 五一劳动节
  const laborDay = new Date(year, 4, 1);
  if (laborDay > now) {
    result.push({
      id: 'labor_day',
      name: '五一活动',
      startDate: laborDay,
      endDate: new Date(laborDay.getTime() + 7 * 24 * 60 * 60 * 1000),
      description: '劳动节假期活动',
      bonusMultiplier: 2.0,
      specialEvents: ['登录奖励', '限时副本', '限定道具'],
      impact: 'medium'
    });
  }
  
  // 周年庆（假设为1月1日）
  const anniversary = new Date(year, 0, 1);
  if (anniversary > now) {
    result.push({
      id: 'anniversary',
      name: '周年庆典',
      startDate: anniversary,
      endDate: new Date(anniversary.getTime() + 10 * 24 * 60 * 60 * 1000),
      description: '游戏周年庆，海量福利与活动',
      bonusMultiplier: 3.0,
      specialEvents: ['周年限定角色', '登录奖励', '特别剧情'],
      impact: 'high'
    });
  }
  
  return result;
});

// 收入预测数据
const forecast = ref<RevenueForecast>({
  totalRevenue: 1500000,
  totalUsers: 50000,
  payingUsers: 2500,
  arpu: 600,
  retention: 35,
  confidence: 78
});

// 市场机会 - 从 WorldSimulator 动态生成
const opportunities = computed(() => {
  const result: Array<{ id: string; message: string; icon: string; color: string }> = [];
  
  // 从市场趋势生成机会
  const trends = marketTrends.value;
  if (trends.length > 0) {
    const topTrend = trends[0];
    result.push({
      id: 'trend_1',
      message: `${topTrend.name}趋势持续升温，建议推出相关角色`,
      icon: 'fire',
      color: '#ff6b6b'
    });
  }
  
  // 从节日数据生成机会
  const festivalsData = festivals.value;
  if (festivalsData.length > 0) {
    const nextFestival = festivalsData[0];
    result.push({
      id: 'festival_1',
      message: `${nextFestival.name}即将到来，提前准备限定内容`,
      icon: 'gift',
      color: '#ff69b4'
    });
  }
  
  // 从竞品动态生成机会
  const news = competitorNews.value;
  if (news.length > 0) {
    const latest = news[news.length - 1];
    if (latest.impact?.marketSentiment < 0) {
      result.push({
        id: 'competitor_1',
        message: `竞争对手${latest.companyName}遭遇负面评价，是吸引玩家的好时机`,
        icon: 'aim',
        color: '#4ecdc4'
      });
    }
  }
  
  return result;
});

// 基础数据 - 从 simulationStore 获取
const activePlayers = computed(() => {
  return globalMetrics.value.totalActivePlayers || 0;
});

const marketShare = computed(() => {
  // 简单计算：玩家DAU / 市场总规模
  const totalMarketSize = 1000000; // 假设市场规模
  return ((globalMetrics.value.totalActivePlayers || 0) / totalMarketSize * 100).toFixed(2);
});

const updateTime = ref('刚刚');

// 市场事件
const marketEvents = ref<MarketEvent[]>([]);
const showEventPopup = ref(false);
const selectedEvent = ref<MarketEvent | null>(null);

// 市场预测 - 从 WorldSimulator 和工具函数动态生成
const marketOpportunity = computed(() => {
  if (!worldSimulator.value || marketTrends.value.length === 0) return null;
  
  const trend = marketTrends.value[0];
  const score = Math.min(100, Math.round((trend.strength || 5) * 10 + 30));
  
  return {
    overallScore: score,
    factors: [
      { name: '市场热度', score: trend.strength || 5, weight: 0.4 },
      { name: '增长趋势', score: Math.min(10, trend.growthRate || 5), weight: 0.3 },
      { name: '竞争程度', score: 6, weight: 0.3 },
    ],
    analysis: `${trend.name}题材市场表现良好，建议把握窗口期推出相关内容`,
  };
});

const releaseRecommendations = computed(() => {
  const results: Array<{ date: Date; score: number; reason: string }> = [];
  
  // 从节日数据生成推荐
  const nextFestival = festivals.value[0];
  if (nextFestival) {
    const festivalDate = new Date(nextFestival.startDate);
    results.push({
      date: festivalDate,
      score: Math.round(nextFestival.bonusMultiplier * 30),
      reason: `配合${nextFestival.name}活动，可获得${nextFestival.bonusMultiplier}倍收益`,
    });
  }
  
  // 从市场趋势生成推荐
  if (marketTrends.value.length > 0) {
    const trend = marketTrends.value[0];
    const recommendDate = new Date();
    recommendDate.setDate(recommendDate.getDate() + 7);
    results.push({
      date: recommendDate,
      score: 70 + (trend.strength || 5),
      reason: `${trend.name}趋势上升期，推出可获得市场红利`,
    });
  }
  
  return results.slice(0, 3);
});

const trendPrediction = computed(() => {
  const results: Array<{ date: Date; predictedStrength: number; confidence: number }> = [];
  const trends = marketTrends.value;
  
  if (trends.length > 0) {
    const trend = trends[0];
    for (let i = 1; i <= 14; i += 3) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      results.push({
        date,
        predictedStrength: Math.min(10, (trend.strength || 5) + i * 0.1),
        confidence: Math.max(50, 90 - i * 3),
      });
    }
  }
  
  return results;
});

const marketRisk = computed(() => {
  // 基于竞品动态和世界影响评估风险
  const news = competitorNews.value || [];
  const recentNegative = news.filter(n => n.impact?.marketSentiment < -5).length;
  
  let overallRisk: 'low' | 'medium' | 'high' = 'low';
  if (recentNegative > 3) overallRisk = 'high';
  else if (recentNegative > 1) overallRisk = 'medium';
  
  return {
    overallRisk,
    riskFactors: [
      { factor: '市场竞争', level: recentNegative > 2 ? 'high' : 'low', description: '竞品活动频繁' },
      { factor: '市场饱和度', level: 'medium', description: '市场已接近饱和' },
      { factor: '玩家流失风险', level: 'low', description: '玩家活跃度稳定' },
    ],
    mitigationStrategies: [
      '差异化定位，避免与强势竞品正面竞争',
      '关注细分市场，寻找蓝海机会',
      '加强玩家社区运营，提升粘性',
    ],
  };
});

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
  return [...competitorList.value].sort((a, b) => a.rank - b.rank);
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

// 更新市场预测 - 现在是 computed，无需手动更新
const updateMarketPredictions = () => {
  // 市场预测已改为 computed，自动响应变化
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

// 获取竞品动态类型
const getNewsType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'new_game': 'primary',
    'major_update': 'success',
    'gacha_event': 'warning',
    'scandal': 'danger',
    'collaboration': 'primary',
    'price_war': 'danger',
    'award': 'success',
    'financial': 'primary',
    'player_migration': 'warning',
    'market_shift': 'success',
  };
  return typeMap[type] || 'default';
};

// 获取竞品动态类型文本
const getNewsTypeText = (type: string): string => {
  const textMap: Record<string, string> = {
    'new_game': '新游',
    'major_update': '大更',
    'gacha_event': '卡池',
    'scandal': '丑闻',
    'collaboration': '联动',
    'price_war': '价格战',
    'award': '获奖',
    'financial': '融资',
    'player_migration': '流失',
    'market_shift': '风向',
  };
  return textMap[type] || '动态';
};

// 显示竞品动态详情
const showCompetitorNewsDetail = (news: any) => {
  selectedEvent.value = {
    id: news.id,
    type: 'competitor' as any,
    title: news.title,
    description: news.content,
    impact: { type: 'neutral' as any, value: news.impact?.marketSentiment || 0 },
    duration: 1,
    startTime: new Date().toISOString(),
    name: news.companyName,
  };
  showEventPopup.value = true;
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

// 竞品动态
.competitor-news-section {
  margin-bottom: 12px;
}

.news-list {
  padding: 8px;
}

.news-company-avatar {
  font-size: 20px;
  margin-right: 8px;
}
</style>
