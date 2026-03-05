<template>
  <div class="simulation-panel">
    <div class="panel-header">
      <h3>🎮 玩家模拟系统</h3>
      <div class="day-indicator">第 {{ currentDay }} 天</div>
    </div>

    <div class="panel-controls">
      <button 
        class="next-day-btn" 
        @click="handleNextDay" 
        :disabled="isRunning || !isInitialized"
      >
        {{ isRunning ? '模拟中...' : '▶ 下一天' }}
      </button>
      <button 
        class="init-btn" 
        @click="handleInitialize"
        :disabled="isRunning || isInitialized"
      >
        {{ isRunning ? '初始化中...' : '🔄 初始化' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="lastResult" class="result-display">
      <div class="section world-section" v-if="worldImpact">
        <h4>🌍 世界变化</h4>
        <div class="data-grid four-col">
          <div class="data-item">
            <span class="label">DAU变化</span>
            <span class="value" :class="worldImpact.project.dauChange >= 0 ? 'positive' : 'negative'">
              {{ worldImpact.project.dauChange >= 0 ? '+' : '' }}{{ worldImpact.project.dauChange }}
            </span>
          </div>
          <div class="data-item">
            <span class="label">评分变化</span>
            <span class="value" :class="worldImpact.project.ratingChange >= 0 ? 'positive' : 'negative'">
              {{ worldImpact.project.ratingChange >= 0 ? '+' : '' }}{{ worldImpact.project.ratingChange.toFixed(1) }}
            </span>
          </div>
          <div class="data-item">
            <span class="label">现金变化</span>
            <span class="value" :class="worldImpact.company.cashChange >= 0 ? 'positive' : 'negative'">
              {{ worldImpact.company.cashChange >= 0 ? '+' : '' }}{{ worldImpact.company.cashChange }}
            </span>
          </div>
          <div class="data-item">
            <span class="label">声誉变化</span>
            <span class="value" :class="worldImpact.company.reputationChange >= 0 ? 'positive' : 'negative'">
              {{ worldImpact.company.reputationChange >= 0 ? '+' : '' }}{{ worldImpact.company.reputationChange }}
            </span>
          </div>
        </div>
      </div>

      <div class="section">
        <h4>📊 核心指标</h4>
        <div class="data-grid">
          <div class="data-item">
            <span class="label">DAU</span>
            <span class="value">{{ lastResult.globalImpact.project.dau }}</span>
          </div>
          <div class="data-item">
            <span class="label">留存 D1/D7/D30</span>
            <span class="value retention">{{ currentRetention.d1 }}% / {{ currentRetention.d7 }}% / {{ currentRetention.d30 }}%</span>
          </div>
          <div class="data-item">
            <span class="label">评分</span>
            <span class="value">{{ lastResult.globalImpact.project.rating.toFixed(1) }}</span>
          </div>
          <div class="data-item">
            <span class="label">现金</span>
            <span class="value positive">¥{{ formatMoney(lastResult.globalImpact.company.cash) }}</span>
          </div>
          <div class="data-item">
            <span class="label">满意度</span>
            <span class="value">{{ (lastResult.globalImpact.project.satisfaction * 100).toFixed(1) }}%</span>
          </div>
          <div class="data-item">
            <span class="label">声誉</span>
            <span class="value">{{ lastResult.globalImpact.company.reputation }}/100</span>
          </div>
        </div>
      </div>

      <div class="section sentiment-section">
        <h4>😊 情绪分布</h4>
        <div class="sentiment-bars">
          <div class="sentiment-item positive">
            <span class="sentiment-label">正面</span>
            <div class="sentiment-bar">
              <div class="sentiment-fill" :style="{ width: sentimentDistribution.positive + '%' }"></div>
            </div>
            <span class="sentiment-value">{{ sentimentDistribution.positive }}%</span>
          </div>
          <div class="sentiment-item neutral">
            <span class="sentiment-label">中性</span>
            <div class="sentiment-bar">
              <div class="sentiment-fill" :style="{ width: sentimentDistribution.neutral + '%' }"></div>
            </div>
            <span class="sentiment-value">{{ sentimentDistribution.neutral }}%</span>
          </div>
          <div class="sentiment-item negative">
            <span class="sentiment-label">负面</span>
            <div class="sentiment-bar">
              <div class="sentiment-fill" :style="{ width: sentimentDistribution.negative + '%' }"></div>
            </div>
            <span class="sentiment-value">{{ sentimentDistribution.negative }}%</span>
          </div>
        </div>
      </div>

      <div class="section gacha-section">
        <h4>🎰 抽卡统计</h4>
        <div class="gacha-bars">
          <div class="gacha-item ssr">
            <span class="gacha-label">SSR</span>
            <div class="gacha-bar">
              <div class="gacha-fill" :style="{ width: gachaDistribution.SSR + '%' }"></div>
            </div>
            <span class="gacha-value">{{ gachaDistribution.SSR }}%</span>
          </div>
          <div class="gacha-item sr">
            <span class="gacha-label">SR</span>
            <div class="gacha-bar">
              <div class="gacha-fill" :style="{ width: gachaDistribution.SR + '%' }"></div>
            </div>
            <span class="gacha-value">{{ gachaDistribution.SR }}%</span>
          </div>
          <div class="gacha-item r">
            <span class="gacha-label">R</span>
            <div class="gacha-bar">
              <div class="gacha-fill" :style="{ width: gachaDistribution.R + '%' }"></div>
            </div>
            <span class="gacha-value">{{ gachaDistribution.R }}%</span>
          </div>
          <div class="gacha-item n">
            <span class="gacha-label">N</span>
            <div class="gacha-bar">
              <div class="gacha-fill" :style="{ width: gachaDistribution.N + '%' }"></div>
            </div>
            <span class="gacha-value">{{ gachaDistribution.N }}%</span>
          </div>
        </div>
      </div>

      <div v-if="recentEvents.length > 0" class="section events-section">
        <h4>🎯 运营事件</h4>
        <div 
          v-for="event in recentEvents.slice(-3)" 
          :key="event.id" 
          class="event-card"
          :class="event.type"
        >
          <div class="event-header">
            <span class="event-type">{{ event.type }}</span>
            <span class="event-title">{{ event.title }}</span>
          </div>
          <p class="event-desc">{{ event.description }}</p>
        </div>
      </div>

      <div v-if="confessions.length > 0" class="section">
        <h4>💌 告白墙 ({{ confessions.length }}条)</h4>
        <div class="mini-list">
          <div 
            v-for="confession in confessions.slice(0, 3)" 
            :key="confession.id"
            class="mini-item"
          >
            <span class="confession-type">{{ confession.type }}</span>
            <span class="confession-content">{{ confession.content }}</span>
          </div>
        </div>
      </div>

      <div v-if="fanworks.length > 0" class="section">
        <h4>🎨 同人广场 ({{ fanworks.length }}件)</h4>
        <div class="mini-list">
          <div 
            v-for="fanwork in fanworks.slice(0, 3)" 
            :key="fanwork.id"
            class="mini-item"
          >
            <span class="fanwork-type">{{ fanwork.type }}</span>
            <span class="fanwork-quality" :class="fanwork.quality">{{ fanwork.quality }}</span>
            <span class="fanwork-likes">❤️ {{ fanwork.likes }}</span>
          </div>
        </div>
      </div>

      <div v-if="characterPopularity.length > 0" class="section">
        <h4>🏆 角色热度排行</h4>
        <div class="character-list">
          <div 
            v-for="(char, index) in characterPopularity.slice(0, 4)" 
            :key="char.name"
            class="character-item"
          >
            <span class="char-rank">{{ index + 1 }}</span>
            <span class="char-name">{{ char.name }}</span>
            <span class="char-popularity">人气 {{ char.popularity }}%</span>
            <span class="char-drawrate">抽卡 {{ char.drawRate }}%</span>
          </div>
        </div>
      </div>

      <div v-if="plotCompletion.length > 0" class="section">
        <h4>📖 剧情完成率</h4>
        <div class="plot-list">
          <div 
            v-for="plot in plotCompletion" 
            :key="plot.name"
            class="plot-item"
          >
            <span class="plot-name">{{ plot.name }}</span>
            <div class="plot-bar">
              <div class="plot-fill" :style="{ width: plot.completionRate + '%' }"></div>
            </div>
            <span class="plot-rate">{{ plot.completionRate }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="isInitialized" class="empty-state">
      <p>点击"下一天"开始模拟</p>
    </div>

    <div v-else class="empty-state">
      <p>点击"初始化"启动模拟系统</p>
    </div>

    <div v-if="history.length > 0" class="history-section">
      <h4>📜 历史记录 ({{ history.length }}天)</h4>
      <div class="history-preview">
        <span>第{{ history.length }}天 | DAU: {{ history[history.length-1]?.globalImpact.project.dau || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSimulationStore } from '@/stores/simulationStore';

const store = useSimulationStore();
const { 
  currentDay, 
  isRunning, 
  lastResult, 
  history, 
  error, 
  isInitialized,
  recentConfessions,
  recentFanworks,
  recentEvents,
  worldImpact,
  currentRetention,
  sentimentDistribution,
  gachaDistribution,
  characterPopularity,
  plotCompletion
} = storeToRefs(store);

const confessions = computed(() => recentConfessions.value);
const fanworks = computed(() => recentFanworks.value);
const events = computed(() => recentEvents.value);

function formatMoney(value: number): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + 'w';
  }
  return value.toString();
}

async function handleInitialize() {
  await store.initialize();
}

async function handleNextDay() {
  await store.tick();
}
</script>

<style scoped>
.simulation-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 20px;
  color: #fff;
  min-width: 320px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
}

.day-indicator {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
}

.panel-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.next-day-btn, .init-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-day-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.next-day-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
}

.init-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.init-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: rgba(255, 82, 82, 0.2);
  border: 1px solid #ff5252;
  color: #ff5252;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.result-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 14px;
}

.section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #a0aec0;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.data-grid.four-col {
  grid-template-columns: repeat(4, 1fr);
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-item .label {
  font-size: 11px;
  color: #718096;
}

.data-item .value {
  font-size: 16px;
  font-weight: bold;
}

.data-item .value.positive {
  color: #48bb78;
}

.data-item .value.negative {
  color: #f56565;
}

.data-item .value.retention {
  font-size: 12px;
}

.sentiment-section .sentiment-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sentiment-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sentiment-label {
  width: 36px;
  font-size: 12px;
  color: #a0aec0;
}

.sentiment-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.sentiment-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.sentiment-item.positive .sentiment-fill {
  background: linear-gradient(90deg, #48bb78, #68d391);
}

.sentiment-item.neutral .sentiment-fill {
  background: linear-gradient(90deg, #a0aec0, #cbd5e0);
}

.sentiment-item.negative .sentiment-fill {
  background: linear-gradient(90deg, #f56565, #fc8181);
}

.sentiment-value {
  width: 40px;
  text-align: right;
  font-size: 12px;
  font-weight: bold;
}

.gacha-section .gacha-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gacha-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gacha-label {
  width: 32px;
  font-size: 12px;
  font-weight: bold;
}

.gacha-item.ssr .gacha-label { color: #f6ad55; }
.gacha-item.sr .gacha-label { color: #9f7aea; }
.gacha-item.r .gacha-label { color: #4299e1; }
.gacha-item.n .gacha-label { color: #a0aec0;

}

.gacha-bar {
  flex: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
}

.gacha-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.gacha-item.ssr .gacha-fill { background: linear-gradient(90deg, #dd6b20, #f6ad55); }
.gacha-item.sr .gacha-fill { background: linear-gradient(90deg, #805ad5, #9f7aea); }
.gacha-item.r .gacha-fill { background: linear-gradient(90deg, #3182ce, #4299e1); }
.gacha-item.n .gacha-fill { background: linear-gradient(90deg, #718096, #a0aec0); }

.gacha-value {
  width: 36px;
  text-align: right;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.events-section .event-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
}

.events-section .event-card.正面 {
  border-left: 3px solid #48bb78;
}

.events-section .event-card.负面 {
  border-left: 3px solid #f56565;
}

.events-section .event-card.中性 {
  border-left: 3px solid #4facfe;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.event-type {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}

.event-title {
  font-weight: bold;
  font-size: 13px;
}

.event-desc {
  font-size: 11px;
  color: #a0aec0;
  margin: 0;
}

.mini-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mini-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.confession-type, .fanwork-type {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  background: rgba(255, 255, 255, 0.1);
}

.confession-content {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #a0aec0;
}

.fanwork-quality.优质 { color: #f6e05e; }
.fanwork-quality.普通 { color: #a0aec0; }
.fanwork-quality.粗糙 { color: #718096; }

.character-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.character-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 12px;
}

.char-rank {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

.char-name {
  flex: 1;
  font-weight: bold;
}

.char-popularity, .char-drawrate {
  font-size: 11px;
  color: #a0aec0;
}

.plot-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plot-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plot-name {
  width: 80px;
  font-size: 11px;
  color: #a0aec0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plot-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.plot-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
}

.plot-rate {
  width: 36px;
  text-align: right;
  font-size: 11px;
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #718096;
}

.history-section {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.history-section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
}

.history-preview {
  font-size: 11px;
  color: #718096;
}
</style>
