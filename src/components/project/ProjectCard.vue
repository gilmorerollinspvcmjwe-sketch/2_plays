<template>
  <div class="project-card" @click="handleClick">
    <div class="project-header">
      <div class="project-cover" :style="{ backgroundColor: coverColor }">
        <van-icon :name="statusConfig.icon" class="cover-icon" />
      </div>
      <div class="project-info">
        <div class="project-name">{{ project.name }}</div>
        <div class="project-tags">
          <van-tag :color="statusConfig.color" class="status-tag">
            {{ statusConfig.name }}
          </van-tag>
          <van-tag :color="riskColor" class="risk-tag" v-if="evaluation">
            {{ riskText }}
          </van-tag>
        </div>
      </div>
      <div v-if="hasPendingTasks" class="pending-badge">
        <van-badge :content="pendingCount" />
      </div>
    </div>

    <!-- 健康度评分 -->
    <div class="health-section" v-if="evaluation">
      <div class="health-header">
        <span class="health-label">项目健康度</span>
        <span class="health-score" :style="{ color: healthColor }">
          {{ evaluation.healthScore }}分
        </span>
      </div>
      <div class="health-bar">
        <div class="health-progress" :style="{ 
          width: evaluation.healthScore + '%',
          backgroundColor: healthColor 
        }"></div>
      </div>
    </div>

    <div class="project-progress">
      <div class="progress-header">
        <span class="progress-label">{{ progressLabel }}</span>
        <span class="progress-value">{{ progressValue }}%</span>
      </div>
      <van-progress 
        :percentage="progressValue" 
        :color="statusConfig.color"
        :stroke-width="8"
      />
    </div>

    <!-- 预期数据（仅在开发阶段显示） -->
    <div class="expectation-section" v-if="evaluation && isDeveloping">
      <div class="expectation-item">
        <van-icon name="star-o" class="expectation-icon" />
        <span class="expectation-label">预期评分</span>
        <span class="expectation-value">{{ evaluation.expectedRating.toFixed(1) }}</span>
      </div>
      <div class="expectation-item">
        <van-icon name="gold-coin-o" class="expectation-icon" />
        <span class="expectation-label">预期月收入</span>
        <span class="expectation-value">{{ formatNumber(evaluation.expectedRevenue) }}</span>
      </div>
    </div>

    <!-- 优化建议提示 -->
    <div class="suggestion-tip" v-if="hasSuggestions">
      <van-icon name="bulb-o" class="suggestion-icon" />
      <span class="suggestion-text">{{ firstSuggestion }}</span>
    </div>

    <div class="project-metrics">
      <div class="metric-item">
        <van-icon name="friends-o" class="metric-icon" />
        <span class="metric-value">{{ formatNumber(project.metrics.dau) }}</span>
        <span class="metric-label">DAU</span>
      </div>
      <div class="metric-item">
        <van-icon name="gold-coin-o" class="metric-icon" />
        <span class="metric-value">{{ formatNumber(project.metrics.dailyRevenue) }}</span>
        <span class="metric-label">日收</span>
      </div>
      <div class="metric-item">
        <van-icon name="star-o" class="metric-icon" />
        <span class="metric-value">{{ project.metrics.rating.toFixed(1) }}</span>
        <span class="metric-label">评分</span>
      </div>
    </div>

    <div class="project-footer">
      <div class="team-info">
        <van-icon name="manager-o" />
        <span>{{ totalTeamMembers }}人</span>
      </div>
      <div class="content-info">
        <span>{{ project.characters.length }}角色 · {{ project.plots.length }}剧情</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Project } from '@/types/project';
import { PROJECT_STATUS_CONFIG } from '@/types/project';
import { calculationEngine, type ProjectEvaluation } from '@/engine';

interface Props {
  project: Project;
  pendingCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  pendingCount: 0
});

const emit = defineEmits<{
  click: [projectId: string];
}>();

// 计算项目评估
const evaluation = computed<ProjectEvaluation | null>(() => {
  try {
    return calculationEngine.evaluateProject(props.project);
  } catch (e) {
    console.error('项目评估计算失败:', e);
    return null;
  }
});

const statusConfig = computed(() => PROJECT_STATUS_CONFIG[props.project.status]);

const isDeveloping = computed(() => 
  props.project.status === 'planning' || props.project.status === 'developing'
);

// 健康度颜色
const healthColor = computed(() => {
  if (!evaluation.value) return '#999';
  const score = evaluation.value.healthScore;
  if (score >= 80) return '#52c41a';
  if (score >= 60) return '#faad14';
  return '#ff4d4f';
});

// 风险等级
const riskColor = computed(() => {
  if (!evaluation.value) return '#999';
  switch (evaluation.value.riskLevel) {
    case 'high': return '#ff4d4f';
    case 'medium': return '#faad14';
    case 'low': return '#52c41a';
    default: return '#999';
  }
});

const riskText = computed(() => {
  if (!evaluation.value) return '未知';
  switch (evaluation.value.riskLevel) {
    case 'high': return '高风险';
    case 'medium': return '中风险';
    case 'low': return '低风险';
    default: return '未知';
  }
});

// 是否有建议
const hasSuggestions = computed(() => {
  return evaluation.value && evaluation.value.suggestions.length > 0;
});

const firstSuggestion = computed(() => {
  if (!evaluation.value || evaluation.value.suggestions.length === 0) {
    return '';
  }
  return evaluation.value.suggestions[0];
});

const coverColor = computed(() => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
  let hash = 0;
  for (let i = 0; i < props.project.name.length; i++) {
    hash = props.project.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
});

const hasPendingTasks = computed(() => props.pendingCount > 0);

const progressLabel = computed(() => {
  switch (props.project.status) {
    case 'planning':
      return '立项进度';
    case 'developing':
      return '开发进度';
    case 'released':
    case 'operating':
      return '运营天数';
    case 'declining':
      return '衰退程度';
    default:
      return '进度';
  }
});

const progressValue = computed(() => {
  if (props.project.status === 'operating' || props.project.status === 'declining') {
    const days = Math.floor((Date.now() - new Date(props.project.releasedAt || props.project.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(100, Math.round((days / 365) * 100));
  }
  return props.project.progress;
});

const totalTeamMembers = computed(() => {
  return props.project.team.planning + 
         props.project.team.art + 
         props.project.team.program + 
         props.project.team.operation;
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

function handleClick() {
  emit('click', props.project.id);
}
</script>

<style scoped>
.project-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.project-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.project-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.cover-icon {
  font-size: 24px;
  color: white;
}

.project-info {
  flex: 1;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.project-tags {
  display: flex;
  gap: 6px;
}

.status-tag, .risk-tag {
  font-size: 11px;
}

.pending-badge {
  margin-left: 8px;
}

/* 健康度样式 */
.health-section {
  margin-bottom: 12px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.health-label {
  font-size: 12px;
  color: #666;
}

.health-score {
  font-size: 14px;
  font-weight: 600;
}

.health-bar {
  height: 6px;
  background: #e8e8e8;
  border-radius: 3px;
  overflow: hidden;
}

.health-progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.project-progress {
  margin-bottom: 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.progress-label {
  font-size: 12px;
  color: #666;
}

.progress-value {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

/* 预期数据样式 */
.expectation-section {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  padding: 10px;
  background: #f0f7ff;
  border-radius: 8px;
}

.expectation-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.expectation-icon {
  color: #1890ff;
  font-size: 14px;
}

.expectation-label {
  color: #666;
}

.expectation-value {
  color: #1890ff;
  font-weight: 600;
}

/* 建议提示样式 */
.suggestion-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  padding: 8px 10px;
  background: #fff7e6;
  border-radius: 6px;
  font-size: 12px;
}

.suggestion-icon {
  color: #faad14;
  font-size: 14px;
  flex-shrink: 0;
}

.suggestion-text {
  color: #d48806;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-metrics {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-icon {
  font-size: 16px;
  color: #999;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.metric-label {
  font-size: 11px;
  color: #999;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.content-info {
  color: #666;
}
</style>
