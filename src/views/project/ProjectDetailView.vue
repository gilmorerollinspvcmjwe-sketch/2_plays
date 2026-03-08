<template>
  <div class="project-detail">
    <BackButton title="项目详情" />

    <div v-if="project" class="project-content">
      <!-- 项目头部信息 -->
      <div class="project-header">
        <div class="project-title-section">
          <h1 class="project-name">{{ project.name }}</h1>
          <van-tag :color="statusConfig.color" size="medium">
            {{ statusConfig.name }}
          </van-tag>
        </div>
        <div class="project-meta">
          <span class="meta-item">
            <van-icon name="clock-o" />
            {{ formatDate(project.createdAt) }}
          </span>
          <span class="meta-item">
            <van-icon name="label-o" />
            {{ positioningName }}
          </span>
        </div>
      </div>

      <!-- 项目评估卡片 -->
      <div v-if="evaluation" class="evaluation-card">
        <div class="evaluation-header">
          <span class="evaluation-title">项目评估</span>
          <van-tag :type="riskType">{{ riskText }}</van-tag>
        </div>
        <div class="evaluation-content">
          <div class="health-score">
            <van-circle
              v-model:current-rate="healthScore"
              :rate="evaluation.healthScore"
              :stroke-width="60"
              :color="healthColor"
              :size="80"
            />
            <span class="score-label">健康度</span>
          </div>
          <div class="evaluation-stats">
            <div class="stat-row">
              <span class="stat-label">预期评分</span>
              <span class="stat-value">{{ evaluation.expectedRating.toFixed(1) }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">预期首月收入</span>
              <span class="stat-value">¥{{ formatNumber(evaluation.expectedRevenue) }}</span>
            </div>
          </div>
        </div>

        <!-- 详细评估分析 -->
        <div class="evaluation-details">
          <div class="detail-title">详细分析</div>
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">角色完成度</div>
              <div class="detail-bar">
                <div class="detail-progress" :style="{ width: characterCompletion + '%', backgroundColor: getScoreColor(characterCompletion) }"></div>
              </div>
              <div class="detail-score" :style="{ color: getScoreColor(characterCompletion) }">{{ characterCompletion }}%</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">剧情完成度</div>
              <div class="detail-bar">
                <div class="detail-progress" :style="{ width: plotCompletion + '%', backgroundColor: getScoreColor(plotCompletion) }"></div>
              </div>
              <div class="detail-score" :style="{ color: getScoreColor(plotCompletion) }">{{ plotCompletion }}%</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">团队匹配</div>
              <div class="detail-bar">
                <div class="detail-progress" :style="{ width: teamMatch + '%', backgroundColor: getScoreColor(teamMatch) }"></div>
              </div>
              <div class="detail-score" :style="{ color: getScoreColor(teamMatch) }">{{ teamMatch }}%</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">预算充足</div>
              <div class="detail-bar">
                <div class="detail-progress" :style="{ width: budgetScore + '%', backgroundColor: getScoreColor(budgetScore) }"></div>
              </div>
              <div class="detail-score" :style="{ color: getScoreColor(budgetScore) }">{{ budgetScore }}%</div>
            </div>
          </div>
        </div>

        <!-- 风险因素 -->
        <div v-if="evaluation.riskFactors.length > 0" class="risk-factors">
          <div class="risk-title">
            <van-icon name="warning-o" color="#ff4d4f" />
            风险因素
          </div>
          <div
            v-for="(factor, index) in evaluation.riskFactors"
            :key="index"
            class="risk-item"
          >
            <van-icon name="close" color="#ff4d4f" />
            {{ factor }}
          </div>
        </div>

        <div v-if="evaluation.suggestions.length > 0" class="suggestions">
          <div class="suggestion-title">
            <van-icon name="bulb-o" color="#faad14" />
            改进建议
          </div>
          <div
            v-for="(suggestion, index) in evaluation.suggestions"
            :key="index"
            class="suggestion-item"
          >
            <span class="suggestion-number">{{ index + 1 }}</span>
            {{ suggestion }}
          </div>
        </div>
      </div>

      <!-- 项目进度 -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">开发进度</span>
          <span class="progress-text">{{ project.progress }}%</span>
        </div>
        <van-progress :percentage="project.progress" :stroke-width="12" />
        <div class="progress-actions">
          <!-- 立项阶段：检查是否可以开始开发 -->
          <template v-if="project.status === 'planning'">
            <van-button
              v-if="canStartDevelopment"
              type="primary"
              size="small"
              @click="startDevelopment"
            >
              开始开发
            </van-button>
            <div v-else class="prerequisites">
              <div class="prerequisite-item" :class="{ met: hasCharacters }">
                <van-icon :name="hasCharacters ? 'success' : 'cross'" />
                至少2个角色 ({{ project.characters.length }}/2)
              </div>
              <div class="prerequisite-item" :class="{ met: hasPlots }">
                <van-icon :name="hasPlots ? 'success' : 'cross'" />
                至少1条剧情 ({{ project.plots.length }}/1)
              </div>
              <div class="prerequisite-item" :class="{ met: hasTeam }">
                <van-icon :name="hasTeam ? 'success' : 'cross'" />
                至少2人团队 ({{ totalTeamMembers }}/2)
              </div>
            </div>
          </template>

          <!-- 开发阶段：推进进度 -->
          <template v-if="project.status === 'developing'">
            <van-button
              type="primary"
              size="small"
              :disabled="!canIncreaseProgress"
              @click="increaseProgress"
            >
              推进进度
            </van-button>
            <div v-if="!canIncreaseProgress" class="progress-hint">
              需要更多团队成员才能继续推进
            </div>
          </template>

          <!-- 发布阶段：开始运营 -->
          <van-button
            v-if="project.status === 'released'"
            type="primary"
            size="small"
            @click="startOperation"
          >
            开始运营
          </van-button>
        </div>
      </div>

      <!-- 团队配置 -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">团队配置</span>
          <span class="team-count">{{ totalTeamMembers }}人</span>
        </div>
        <div class="team-grid">
          <div class="team-item">
            <van-icon name="edit" />
            <span class="team-label">策划</span>
            <span class="team-value">{{ project.team.planning }}</span>
          </div>
          <div class="team-item">
            <van-icon name="photo-o" />
            <span class="team-label">美术</span>
            <span class="team-value">{{ project.team.art }}</span>
          </div>
          <div class="team-item">
            <van-icon name="code-o" />
            <span class="team-label">程序</span>
            <span class="team-value">{{ project.team.program }}</span>
          </div>
          <div class="team-item">
            <van-icon name="chart-trending-o" />
            <span class="team-label">运营</span>
            <span class="team-value">{{ project.team.operation }}</span>
          </div>
        </div>
        <van-button
          type="default"
          size="small"
          block
          @click="manageTeam"
        >
          管理团队
        </van-button>
      </div>

      <!-- 角色列表 -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">角色</span>
          <van-tag type="primary">{{ project.characters.length }}</van-tag>
        </div>
        <div v-if="project.characters.length > 0" class="character-list">
          <div
            v-for="character in project.characters"
            :key="character.id"
            class="character-item"
            @click="viewCharacter(character.id)"
          >
            <img
              v-if="character.avatar"
              :src="character.avatar"
              class="character-avatar"
            />
            <div v-else class="character-avatar placeholder">
              <van-icon name="user-o" />
            </div>
            <span class="character-name">{{ character.name }}</span>
          </div>
        </div>
        <van-empty v-else description="还没有角色">
          <van-button type="primary" size="small" @click="createCharacter">
            创建角色
          </van-button>
        </van-empty>
        <div class="button-group">
          <van-button
            v-if="project.characters.length > 0"
            type="default"
            size="small"
            @click="createCharacter"
          >
            创建新角色
          </van-button>
          <van-button
            type="primary"
            size="small"
            @click="showCharacterSelector = true"
          >
            选择已有角色
          </van-button>
        </div>
      </div>

      <!-- 剧情列表 -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">剧情</span>
          <van-tag type="primary">{{ project.plots.length }}</van-tag>
        </div>
        <div v-if="project.plots.length > 0" class="plot-list">
          <div
            v-for="plot in project.plots"
            :key="plot.id"
            class="plot-item"
            @click="viewPlot(plot.id)"
          >
            <van-icon name="description" />
            <div class="plot-info">
              <span class="plot-title">{{ plot.title }}</span>
              <span class="plot-chapters">{{ plot.chapters?.length || 0 }}章</span>
            </div>
          </div>
        </div>
        <van-empty v-else description="还没有剧情">
          <van-button type="primary" size="small" @click="createPlot">
            创建剧情
          </van-button>
        </van-empty>
        <div class="button-group">
          <van-button
            v-if="project.plots.length > 0"
            type="default"
            size="small"
            @click="createPlot"
          >
            创建新剧情
          </van-button>
          <van-button
            type="primary"
            size="small"
            @click="showPlotSelector = true"
          >
            选择已有剧情
          </van-button>
        </div>
      </div>

      <!-- 运营数据 -->
      <div v-if="['released', 'operating', 'declining'].includes(project.status)" class="section-card">
        <div class="section-header">
          <span class="section-title">运营数据</span>
        </div>
        <div class="metrics-grid">
          <div class="metric-box">
            <span class="metric-value">{{ formatNumber(project.metrics.dau) }}</span>
            <span class="metric-label">DAU</span>
          </div>
          <div class="metric-box">
            <span class="metric-value">{{ formatNumber(project.metrics.dailyRevenue) }}</span>
            <span class="metric-label">日收入</span>
          </div>
          <div class="metric-box">
            <span class="metric-value">{{ project.metrics.rating.toFixed(1) }}</span>
            <span class="metric-label">评分</span>
          </div>
          <div class="metric-box">
            <span class="metric-value">{{ Math.round(project.metrics.satisfaction) }}%</span>
            <span class="metric-label">满意度</span>
          </div>
        </div>
      </div>

      <!-- 历史记录 -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">历史记录</span>
        </div>
        <van-steps direction="vertical" :active="0">
          <van-step
            v-for="event in project.history.slice(0, 5)"
            :key="event.id"
          >
            <h4>{{ event.title }}</h4>
            <p>{{ event.description }}</p>
            <span class="event-time">{{ formatDateTime(event.timestamp) }}</span>
          </van-step>
        </van-steps>
      </div>
    </div>

    <van-empty v-else description="项目不存在" />

    <!-- 角色选择弹窗 -->
    <van-popup v-model:show="showCharacterSelector" position="bottom" round :style="{ height: '70%' }">
      <div class="selector-popup">
        <div class="selector-header">
          <span class="selector-title">选择角色</span>
          <van-icon name="cross" @click="showCharacterSelector = false" />
        </div>
        <div class="selector-list">
          <van-empty v-if="availableCharacters.length === 0" description="没有可绑定的角色，请先创建角色" />
          <div
            v-for="character in availableCharacters"
            :key="character.id"
            class="selector-item"
            @click="bindCharacter(character)"
          >
            <van-image
              v-if="character.avatar"
              :src="character.avatar"
              class="selector-avatar"
              round
            />
            <div v-else class="selector-avatar placeholder">
              <van-icon name="user-o" />
            </div>
            <div class="selector-info">
              <span class="selector-name">{{ character.name }}</span>
              <span class="selector-desc">{{ character.title || '暂无称号' }}</span>
            </div>
            <van-tag type="primary">选择</van-tag>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 剧情选择弹窗 -->
    <van-popup v-model:show="showPlotSelector" position="bottom" round :style="{ height: '70%' }">
      <div class="selector-popup">
        <div class="selector-header">
          <span class="selector-title">选择剧情</span>
          <van-icon name="cross" @click="showPlotSelector = false" />
        </div>
        <div class="selector-list">
          <van-empty v-if="availablePlots.length === 0" description="没有可绑定的剧情，请先创建剧情" />
          <div
            v-for="plot in availablePlots"
            :key="plot.id"
            class="selector-item"
            @click="bindPlot(plot)"
          >
            <van-icon name="description" class="selector-icon" />
            <div class="selector-info">
              <span class="selector-name">{{ plot.title }}</span>
              <span class="selector-desc">{{ plot.chapters?.length || 0 }}章</span>
            </div>
            <van-tag type="primary">选择</van-tag>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import { useProjectStore } from '@/stores/projectStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useGameStore } from '@/stores/gameStore';
import BackButton from '@/components/common/BackButton.vue';
import { PROJECT_STATUS_CONFIG, PROJECT_POSITIONING_CONFIG } from '@/types/project';
import type { Character, Plot } from '@/stores/gameStore';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const employeeStore = useEmployeeStore();
const gameStore = useGameStore();

// 弹窗显示状态
const showCharacterSelector = ref(false);
const showPlotSelector = ref(false);

// 可绑定的角色（已创建但未绑定到当前项目的角色）
const availableCharacters = computed(() => {
  if (!project.value) return [];
  const currentGame = gameStore.currentGame;
  if (!currentGame) return [];
  
  const boundCharacterIds = new Set(project.value.characters.map(c => c.id));
  return currentGame.characters.filter(c => !boundCharacterIds.has(c.id));
});

// 可绑定的剧情（已创建但未绑定到当前项目的剧情）
const availablePlots = computed(() => {
  if (!project.value) return [];
  const currentGame = gameStore.currentGame;
  if (!currentGame) return [];
  
  const boundPlotIds = new Set(project.value.plots.map(p => p.id));
  return currentGame.plots.filter(p => !boundPlotIds.has(p.id));
});

// 绑定角色到项目
function bindCharacter(character: Character) {
  if (!project.value) return;
  
  const success = projectStore.addCharacterToProject(project.value.id, character);
  if (success) {
    showToast('角色绑定成功');
    showCharacterSelector.value = false;
  } else {
    showToast('绑定失败，请重试');
  }
}

// 绑定剧情到项目
function bindPlot(plot: Plot) {
  if (!project.value) return;
  
  const success = projectStore.addPlotToProject(project.value.id, plot);
  if (success) {
    showToast('剧情绑定成功');
    showPlotSelector.value = false;
  } else {
    showToast('绑定失败，请重试');
  }
}

const projectId = computed(() => route.params.id as string);

const project = computed(() => {
  return projectStore.projects.find(p => p.id === projectId.value) || null;
});

const statusConfig = computed(() => {
  if (!project.value) return PROJECT_STATUS_CONFIG.planning;
  return PROJECT_STATUS_CONFIG[project.value.status];
});

const positioningName = computed(() => {
  if (!project.value) return '';
  return PROJECT_POSITIONING_CONFIG[project.value.positioning]?.name || project.value.positioning;
});

const evaluation = computed(() => {
  if (!project.value) return null;
  return projectStore.evaluateProject(project.value.id);
});

const healthScore = computed(() => evaluation.value?.healthScore || 0);

const healthColor = computed(() => {
  const score = evaluation.value?.healthScore || 0;
  if (score >= 80) return '#52c41a';
  if (score >= 60) return '#faad14';
  return '#ff4d4f';
});

const riskType = computed(() => {
  const level = evaluation.value?.riskLevel;
  if (level === 'high') return 'danger';
  if (level === 'medium') return 'warning';
  return 'success';
});

const riskText = computed(() => {
  const level = evaluation.value?.riskLevel;
  if (level === 'high') return '高风险';
  if (level === 'medium') return '中风险';
  return '低风险';
});

// 详细评估指标
const characterCompletion = computed(() => {
  if (!project.value) return 0;
  return Math.min(100, project.value.characters.length * 20);
});

const plotCompletion = computed(() => {
  if (!project.value) return 0;
  return Math.min(100, project.value.plots.length * 25);
});

const teamMatch = computed(() => {
  if (!project.value) return 0;
  const teamSize = project.value.team.planning + project.value.team.art + project.value.team.program + project.value.team.operation;
  return Math.min(100, teamSize * 10);
});

const budgetScore = computed(() => {
  if (!project.value) return 0;
  const totalBudget = project.value.budget.development + project.value.budget.operation;
  return Math.min(100, Math.round(totalBudget / 1000));
});

function getScoreColor(score: number): string {
  if (score >= 80) return '#52c41a';
  if (score >= 60) return '#faad14';
  return '#ff4d4f';
}

const totalTeamMembers = computed(() => {
  if (!project.value) return 0;
  return project.value.team.planning + 
         project.value.team.art + 
         project.value.team.program + 
         project.value.team.operation;
});

// 开发前置条件
const hasCharacters = computed(() => (project.value?.characters.length || 0) >= 2);
const hasPlots = computed(() => (project.value?.plots.length || 0) >= 1);
const hasTeam = computed(() => totalTeamMembers.value >= 2);

const canStartDevelopment = computed(() => {
  return hasCharacters.value && hasPlots.value && hasTeam.value;
});

// 进度推进条件
const canIncreaseProgress = computed(() => {
  if (!project.value) return false;
  // 进度越高，需要的团队人数越多
  const requiredTeam = Math.ceil(project.value.progress / 20);
  return totalTeamMembers.value >= requiredTeam;
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return `${formatDate(dateStr)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

async function startDevelopment() {
  const result = projectStore.advanceProjectStatus(projectId.value);
  if (result.success) {
    showToast('已开始开发');
  } else {
    showToast(result.message);
  }
}

async function increaseProgress() {
  const currentProgress = project.value?.progress || 0;
  const newProgress = Math.min(100, currentProgress + 10);
  projectStore.updateProjectProgress(projectId.value, newProgress);
  showToast(`进度已更新至${newProgress}%`);
}

async function startOperation() {
  const result = projectStore.advanceProjectStatus(projectId.value);
  if (result.success) {
    showToast('已开始运营');
  } else {
    showToast(result.message);
  }
}

async function manageTeam() {
  try {
    await router.push('/team-management');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function createCharacter() {
  projectStore.setCurrentProject(projectId.value);
  try {
    await router.push('/creator/character');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function viewCharacter(characterId: string) {
  try {
    await router.push(`/game/${projectId.value}/character/${characterId}`);
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function createPlot() {
  projectStore.setCurrentProject(projectId.value);
  try {
    await router.push('/creator/plot');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function viewPlot(plotId: string) {
  try {
    await router.push('/creator/plot/editor');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

onMounted(() => {
  if (project.value) {
    projectStore.setCurrentProject(projectId.value);
  }
});
</script>

<style scoped>
.project-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.project-content {
  padding: 16px;
}

.project-header {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.project-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.project-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.project-meta {
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.progress-text {
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
}

.progress-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.team-count {
  font-size: 14px;
  color: #666;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.team-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.team-item .van-icon {
  font-size: 20px;
  color: #666;
}

.team-label {
  font-size: 12px;
  color: #999;
}

.team-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.evaluation-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.evaluation-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.evaluation-content {
  display: flex;
  gap: 20px;
  align-items: center;
}

.health-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.score-label {
  font-size: 12px;
  color: #666;
}

.evaluation-stats {
  flex: 1;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: 600;
  color: #333;
}

.suggestions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.suggestion-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  color: #666;
}

.character-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.character-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.character-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.character-avatar.placeholder {
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-avatar.placeholder .van-icon {
  font-size: 24px;
  color: #999;
}

.character-name {
  font-size: 12px;
  color: #666;
}

.plot-list {
  margin-bottom: 12px;
}

.plot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.plot-item .van-icon {
  font-size: 20px;
  color: #1890ff;
}

.plot-info {
  flex: 1;
}

.plot-title {
  font-size: 14px;
  color: #333;
  display: block;
}

.plot-chapters {
  font-size: 12px;
  color: #999;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.metric-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.metric-box .metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.metric-box .metric-label {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.event-time {
  font-size: 12px;
  color: #999;
}

/* 详细评估样式 */
.evaluation-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.detail-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-label {
  width: 80px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.detail-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.detail-progress {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.detail-score {
  width: 40px;
  font-size: 13px;
  font-weight: 600;
  text-align: right;
  flex-shrink: 0;
}

/* 风险因素样式 */
.risk-factors {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.risk-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #ff4d4f;
  margin-bottom: 8px;
}

.risk-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  color: #666;
}

/* 建议样式增强 */
.suggestion-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
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

/* 前置条件样式 */
.prerequisites {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.prerequisite-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #ff4d4f;
}

.prerequisite-item.met {
  color: #52c41a;
}

.prerequisite-item .van-icon {
  font-size: 16px;
}

.progress-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

/* 按钮组样式 */
.button-group {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.button-group .van-button {
  flex: 1;
}

/* 选择器弹窗样式 */
.selector-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.selector-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.selector-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.selector-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.selector-item:active {
  background: #e8e8e8;
}

.selector-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.selector-avatar.placeholder {
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selector-avatar.placeholder .van-icon {
  font-size: 24px;
  color: #999;
}

.selector-icon {
  font-size: 24px;
  color: #666;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  border-radius: 8px;
  flex-shrink: 0;
}

.selector-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.selector-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.selector-desc {
  font-size: 12px;
  color: #999;
}
</style>
