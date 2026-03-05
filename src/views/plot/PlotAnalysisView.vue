<template>
  <div class="plot-analysis">
    <BackButton title="剧情分析" />

    <div class="analysis-content">
      <!-- 剧情选择器 -->
      <div class="plot-selector">
        <div class="selector-label">选择剧情</div>
        <van-dropdown-menu>
          <van-dropdown-item v-model="selectedPlotId" :options="plotOptions" />
        </van-dropdown-menu>
      </div>

      <!-- 整体完成率 -->
      <div class="completion-card" v-if="analysis">
        <div class="completion-header">
          <span class="card-title">整体完成率</span>
          <span class="completion-rate" :style="{ color: getCompletionColor(analysis.completion.overallRate) }">
            {{ (analysis.completion.overallRate * 100).toFixed(0) }}%
          </span>
        </div>
        <div class="completion-progress">
          <div 
            class="progress-fill" 
            :style="{ 
              width: (analysis.completion.overallRate * 100) + '%',
              backgroundColor: getCompletionColor(analysis.completion.overallRate)
            }"
          ></div>
        </div>
        <div class="completion-stats">
          <div class="stat-item">
            <span class="stat-value">{{ analysis.completion.averageTime.toFixed(0) }}</span>
            <span class="stat-label">平均通关(分钟)</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ (analysis.completion.replayRate * 100).toFixed(0) }}%</span>
            <span class="stat-label">重玩率</span>
          </div>
        </div>
      </div>

      <!-- 章节完成率 -->
      <div class="chapters-card" v-if="analysis">
        <div class="card-title">章节完成率</div>
        <div class="chapters-list">
          <div 
            v-for="(chapter, index) in analysis.completion.chapterRates" 
            :key="chapter.chapterId"
            class="chapter-item"
          >
            <div class="chapter-info">
              <span class="chapter-number">第{{ index + 1 }}章</span>
              <span class="chapter-rate" :style="{ color: getCompletionColor(chapter.rate) }">
                {{ (chapter.rate * 100).toFixed(0) }}%
              </span>
            </div>
            <div class="chapter-bar">
              <div 
                class="chapter-progress" 
                :style="{ 
                  width: (chapter.rate * 100) + '%',
                  backgroundColor: getCompletionColor(chapter.rate)
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 情感曲线 -->
      <div class="emotion-card" v-if="analysis">
        <div class="card-title">情感曲线分析</div>
        <div class="emotion-chart">
          <div class="chart-y-axis">
            <span>10</span>
            <span>5</span>
            <span>0</span>
            <span>-5</span>
            <span>-10</span>
          </div>
          <div class="chart-content">
            <div class="chart-line">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <!-- 预期曲线 -->
                <polyline
                  :points="getExpectedCurvePoints"
                  fill="none"
                  stroke="#1890ff"
                  stroke-width="2"
                  stroke-dasharray="4,4"
                />
                <!-- 实际曲线 -->
                <polyline
                  :points="getActualCurvePoints"
                  fill="none"
                  stroke="#52c41a"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="chart-x-axis">
              <span v-for="(chapter, index) in analysis.completion.chapterRates" :key="index">
                {{ index + 1 }}
              </span>
            </div>
          </div>
        </div>
        <div class="emotion-legend">
          <div class="legend-item">
            <div class="legend-line expected"></div>
            <span>预期情感</span>
          </div>
          <div class="legend-item">
            <div class="legend-line actual"></div>
            <span>实际情感</span>
          </div>
        </div>
        <div class="emotion-deviation" v-if="analysis.emotionalCurve.deviation > 5">
          <van-icon name="warning-o" color="#faad14" />
          <span>情感曲线偏离预期 {{ analysis.emotionalCurve.deviation.toFixed(1) }}，建议调整剧情节奏</span>
        </div>
      </div>

      <!-- 流失点分析 -->
      <div class="dropoff-card" v-if="analysis && analysis.dropOffPoints.length > 0">
        <div class="card-title">
          <van-icon name="warning-o" color="#ff4d4f" />
          流失点分析
        </div>
        <div class="dropoff-list">
          <div 
            v-for="(point, index) in analysis.dropOffPoints" 
            :key="index"
            class="dropoff-item"
            :class="{ 'critical': point.severity === 'critical' }"
          >
            <div class="dropoff-header">
              <span class="dropoff-chapter">{{ point.chapterName }}</span>
              <van-tag :type="point.severity === 'critical' ? 'danger' : 'warning'">
                {{ point.severity === 'critical' ? '严重' : '警告' }}
              </van-tag>
            </div>
            <div class="dropoff-rate">
              流失率: {{ (point.dropOffRate * 100).toFixed(0) }}%
            </div>
            <div class="dropoff-reasons">
              <div 
                v-for="(reason, rIndex) in point.possibleReasons" 
                :key="rIndex"
                class="reason-item"
              >
                <van-icon name="info-o" />
                {{ reason }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 改进建议 -->
      <div class="suggestions-card" v-if="analysis && analysis.suggestions.length > 0">
        <div class="card-title">
          <van-icon name="bulb-o" color="#faad14" />
          改进建议
        </div>
        <div class="suggestions-list">
          <div 
            v-for="(suggestion, index) in analysis.suggestions" 
            :key="index"
            class="suggestion-item"
          >
            <span class="suggestion-number">{{ index + 1 }}</span>
            {{ suggestion }}
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <van-empty v-if="!analysis" description="暂无分析数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import BackButton from '@/components/common/BackButton.vue';
import { plotAnalysisEngine, type PlotAnalysisResult } from '@/engine';
import { useProjectStore } from '@/stores/projectStore';

const route = useRoute();
const projectStore = useProjectStore();

const projectId = computed(() => route.params.id as string);
const project = computed(() => projectStore.projects.find(p => p.id === projectId.value));

// 剧情选项
const plotOptions = computed(() => {
  if (!project.value) return [];
  return project.value.plots.map((plot, index) => ({
    text: plot.title || `剧情 ${index + 1}`,
    value: plot.id
  }));
});

const selectedPlotId = ref('');

// 初始化选择第一个剧情
watch(plotOptions, (options) => {
  if (options.length > 0 && !selectedPlotId.value) {
    selectedPlotId.value = options[0].value;
  }
}, { immediate: true });

// 获取分析数据
const analysis = computed<PlotAnalysisResult | null>(() => {
  if (!project.value || !selectedPlotId.value) return null;
  
  const plot = project.value.plots.find(p => p.id === selectedPlotId.value);
  if (!plot) return null;

  // 模拟章节数据
  const chapters = plot.chapters?.map((chapter, index) => ({
    id: chapter.id || `chapter_${index}`,
    name: chapter.title || `第${index + 1}章`,
    expectedEmotion: chapter.expectedEmotion || Math.sin(index * 0.5) * 5
  })) || [];

  // 模拟玩家行为数据
  const playerData = Array.from({ length: 100 }, (_, i) => ({
    playerId: `player_${i}`,
    chapterProgress: chapters.map((c, idx) => ({
      chapterId: c.id,
      completed: Math.random() > (idx * 0.1),
      timestamp: Date.now() - Math.random() * 86400000
    })),
    choices: [],
    emotions: chapters.map(c => ({
      chapterId: c.id,
      emotion: c.expectedEmotion + (Math.random() - 0.5) * 4
    })),
    sessionDuration: 30 + Math.random() * 60
  }));

  return plotAnalysisEngine.analyzePlot(plot.id, chapters, playerData);
});

// 获取完成率颜色
function getCompletionColor(rate: number): string {
  if (rate >= 0.8) return '#52c41a';
  if (rate >= 0.6) return '#faad14';
  return '#ff4d4f';
}

// 计算情感曲线点
const getExpectedCurvePoints = computed(() => {
  if (!analysis.value) return '';
  const curve = analysis.value.emotionalCurve.expectedCurve;
  if (curve.length === 0) return '';
  
  const width = 100;
  const height = 100;
  const stepX = width / (curve.length - 1);
  
  return curve.map((value, index) => {
    const x = index * stepX;
    const y = height - ((value + 10) / 20) * height;
    return `${x},${y}`;
  }).join(' ');
});

const getActualCurvePoints = computed(() => {
  if (!analysis.value) return '';
  const curve = analysis.value.emotionalCurve.actualCurve;
  if (curve.length === 0) return '';
  
  const width = 100;
  const height = 100;
  const stepX = width / (curve.length - 1);
  
  return curve.map((value, index) => {
    const x = index * stepX;
    const y = height - ((value + 10) / 20) * height;
    return `${x},${y}`;
  }).join(' ');
});
</script>

<style scoped>
.plot-analysis {
  min-height: 100vh;
  background: #f5f5f5;
}

.analysis-content {
  padding: 16px;
}

/* 剧情选择器 */
.plot-selector {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.selector-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

/* 完成率卡片 */
.completion-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.completion-rate {
  font-size: 24px;
  font-weight: 700;
}

.completion-progress {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.completion-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item .stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-item .stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 章节卡片 */
.chapters-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chapter-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chapter-number {
  font-size: 13px;
  color: #666;
}

.chapter-rate {
  font-size: 13px;
  font-weight: 600;
}

.chapter-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.chapter-progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 情感曲线卡片 */
.emotion-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.emotion-chart {
  display: flex;
  height: 150px;
  margin-bottom: 16px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 8px;
  font-size: 11px;
  color: #999;
}

.chart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-line {
  flex: 1;
  position: relative;
  background: #f8f9fa;
  border-radius: 4px;
}

.chart-line svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.chart-x-axis {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  font-size: 11px;
  color: #999;
}

.emotion-legend {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.legend-line {
  width: 20px;
  height: 2px;
}

.legend-line.expected {
  background: #1890ff;
  border-top: 2px dashed #1890ff;
}

.legend-line.actual {
  background: #52c41a;
}

.emotion-deviation {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px;
  background: #fff7e6;
  border-radius: 6px;
  font-size: 12px;
  color: #d48806;
}

/* 流失点卡片 */
.dropoff-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.dropoff-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dropoff-item {
  padding: 12px;
  background: #fff7e6;
  border-radius: 8px;
  border-left: 3px solid #faad14;
}

.dropoff-item.critical {
  background: #fff1f0;
  border-left-color: #ff4d4f;
}

.dropoff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dropoff-chapter {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.dropoff-rate {
  font-size: 13px;
  color: #ff4d4f;
  margin-bottom: 8px;
}

.dropoff-reasons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reason-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

/* 建议卡片 */
.suggestions-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.suggestion-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #faad14;
  color: white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
</style>
