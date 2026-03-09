<template>
  <div class="home-view">
    <!-- 公司数据看板 -->
    <CompanyDashboard
      :company-name="companyName"
      :company-level="companyLevel"
      :stats="companyStats"
      :total-employees="employeeStore.totalEmployees"
      :average-satisfaction="employeeStore.averageSatisfaction"
      @create-project="showCreateProject = true"
      @team-management="goToTeamManagement"
      @recruit="goToRecruit"
    />

    <!-- 游戏开发快速入口 -->
    <div class="section" v-if="currentProject">
      <div class="section-header">
        <span class="section-title">游戏开发</span>
        <van-tag type="primary" v-if="currentProject">{{ currentProject.name }}</van-tag>
      </div>

      <div class="quick-dev-card">
        <div class="dev-options-flex">
          <!-- 创建角色 -->
          <div class="dev-option" @click="goToCharacterCreator">
            <div class="option-icon" style="background: #e6f7ff;">
              <van-icon name="user-o" color="#1890ff" size="20" />
            </div>
            <div class="option-name">创建角色</div>
            <div class="option-count" v-if="currentProject">
              {{ currentProject.characters.length }} 个
            </div>
          </div>

          <!-- 设计剧情 -->
          <div class="dev-option" @click="goToPlotDesigner">
            <div class="option-icon" style="background: #f6ffed;">
              <van-icon name="description" color="#52c41a" size="20" />
            </div>
            <div class="option-name">设计剧情</div>
            <div class="option-count" v-if="currentProject">
              {{ currentProject.plots.length }} 条
            </div>
          </div>

          <!-- 剧情分析 -->
          <div class="dev-option" @click="goToPlotAnalysis">
            <div class="option-icon" style="background: #fff7e6;">
              <van-icon name="chart-bar-o" color="#faad14" size="20" />
            </div>
            <div class="option-name">剧情分析</div>
          </div>

          <!-- 角色排行 -->
          <div class="dev-option" @click="goToCharacterRanking">
            <div class="option-icon" style="background: #f9f0ff;">
              <van-icon name="trophy-o" color="#722ed1" size="20" />
            </div>
            <div class="option-name">角色排行</div>
          </div>
        </div>

        <!-- 开发进度 -->
        <div class="dev-progress" v-if="currentProject && (currentProject.status === 'planning' || currentProject.status === 'developing')">
          <div class="progress-label">进度: {{ currentProject.progress }}%</div>
          <van-progress :percentage="currentProject.progress" :stroke-width="6" color="#FF69B4" />
          <div class="progress-hint" v-if="currentProject.status === 'planning' && !canStartDev">
            需要至少2个角色、1条剧情、2人团队才能开始开发
          </div>
          <div class="progress-hint ready" v-else-if="currentProject.status === 'planning' && canStartDev">
            前置条件已满足，可以开始开发
          </div>
        </div>
      </div>
    </div>

    <!-- 待处理事项 -->
    <div v-if="pendingTasks.length > 0" class="section">
      <!-- 折叠提示条 -->
      <div class="pending-collapse-bar" @click="isPendingTasksExpanded = !isPendingTasksExpanded">
        <div class="pending-collapse-left">
          <span class="section-title">待处理事项</span>
          <van-tag type="danger">{{ pendingTasks.length }}</van-tag>
        </div>
        <van-icon :name="isPendingTasksExpanded ? 'arrow-up' : 'arrow-down'" class="pending-collapse-icon" />
      </div>
      <!-- 展开的列表 -->
      <transition name="expand">
        <div v-show="isPendingTasksExpanded" class="pending-list">
          <div
            v-for="task in pendingTasks"
            :key="task.id"
            class="pending-item"
            @click="handlePendingTask(task)"
          >
            <van-icon :name="task.icon" class="pending-icon" />
            <div class="pending-content">
              <div class="pending-title">{{ task.title }}</div>
              <div class="pending-desc">{{ task.description }}</div>
            </div>
            <van-icon name="arrow" class="pending-arrow" />
          </div>
        </div>
      </transition>
    </div>

    <!-- 项目列表 -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">我的项目</span>
        <van-tag type="primary">{{ projectStore.projects.length }}</van-tag>
      </div>

      <!-- 进行中项目 -->
      <div v-if="activeProjects.length > 0" class="project-section">
        <div class="project-section-title">进行中</div>
        <div class="project-scroll-container">
          <div
            v-for="project in activeProjects"
            :key="project.id"
            class="project-card-wrapper"
          >
            <ProjectCard
              :project="project"
              :pending-count="getProjectPendingCount(project.id)"
              @click="goToProject"
            />
          </div>
        </div>
      </div>

      <!-- 运营中项目 -->
      <div v-if="operatingProjects.length > 0" class="project-section">
        <div class="project-section-title">运营中</div>
        <div class="project-scroll-container">
          <div
            v-for="project in operatingProjects"
            :key="project.id"
            class="project-card-wrapper"
          >
            <ProjectCard
              :project="project"
              @click="goToProject"
            />
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="projectStore.projects.length === 0" class="empty-state">
        <van-empty description="还没有项目">
          <van-button type="primary" @click="showCreateProject = true">
            创建第一个项目
          </van-button>
        </van-empty>
      </div>
    </div>

    <!-- 市场动态 -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">市场动态</span>
      </div>
      <div class="market-scroll-container">
        <div v-for="(news, index) in marketNews" :key="index" class="news-item">
          <van-tag :type="news.type" size="small" class="news-tag">
            {{ news.tag }}
          </van-tag>
          <span class="news-text">{{ news.text }}</span>
        </div>
      </div>
    </div>

    <!-- 创建项目弹窗 -->
    <van-dialog
      v-model:show="showCreateProject"
      title="创建新项目"
      show-cancel-button
      @confirm="handleCreateProject"
    >
      <div class="create-project-form">
        <van-field
          v-model="newProject.name"
          label="项目名称"
          placeholder="请输入项目名称"
          :rules="[{ required: true }]"
        />
        <van-field
          v-model="newProject.positioning"
          label="项目定位"
          readonly
          placeholder="选择定位"
          @click="showPositioningPicker = true"
        />
        <van-field
          v-model="newProject.budget"
          label="开发预算"
          type="number"
          placeholder="请输入预算"
        />
      </div>
    </van-dialog>

    <!-- 定位选择器 -->
    <van-popup v-model:show="showPositioningPicker" position="bottom">
      <van-picker
        :columns="positioningColumns"
        @confirm="onPositioningConfirm"
        @cancel="showPositioningPicker = false"
      />
    </van-popup>

    <!-- 新手引导 -->
    <OnboardingGuide />
    
    <!-- 每日总结弹窗 -->
    <DailySummary 
      v-model:show="showDailySummary"
      :report="dailyReport"
      @continue="handleDailySummaryClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useProjectStore } from '@/stores/projectStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useTaskStore } from '@/stores/taskStore';
import CompanyDashboard from '@/components/project/CompanyDashboard.vue';
import ProjectCard from '@/components/project/ProjectCard.vue';
import DailySummary from '@/components/report/DailySummary.vue';
import OnboardingGuide from '@/components/OnboardingGuide.vue';
import type { ProjectPositioning } from '@/types/project';
import { PROJECT_POSITIONING_CONFIG } from '@/types/project';
import type { DailyReport } from '@/stores/taskStore';

const router = useRouter();
const projectStore = useProjectStore();
const employeeStore = useEmployeeStore();
const simulationStore = useSimulationStore();
const onboardingStore = useOnboardingStore();
const taskStore = useTaskStore();

// 公司信息
const companyName = ref('我的游戏公司');
const companyLevel = ref(1);

// 待处理事项折叠状态
const isPendingTasksExpanded = ref(false);

// 创建项目弹窗
const showCreateProject = ref(false);
const showPositioningPicker = ref(false);

// 每日总结弹窗
const showDailySummary = ref(false);
const dailyReport = ref<DailyReport | null>(null);

const newProject = ref({
  name: '',
  positioning: '' as ProjectPositioning | '',
  budget: 50000
});

const positioningColumns = [
  { text: '大众向', value: 'mass' },
  { text: '小众向', value: 'niche' },
  { text: '实验性', value: 'experimental' }
];

// 计算属性
const companyStats = computed(() => ({
  totalRevenue: projectStore.companyStats.totalRevenue,
  activeProjects: projectStore.companyStats.activeProjects,
  totalProjects: projectStore.companyStats.totalProjects
}));

const activeProjects = computed(() => [
  ...projectStore.planningProjects,
  ...projectStore.developingProjects
]);

const operatingProjects = computed(() => projectStore.operatingProjects);

// 当前项目
const currentProject = computed(() => projectStore.currentProject);

// 是否可以开始开发
const canStartDev = computed(() => {
  if (!currentProject.value) return false;
  const hasChars = currentProject.value.characters.length >= 2;
  const hasPlots = currentProject.value.plots.length >= 1;
  const teamSize = currentProject.value.team.planning + currentProject.value.team.art +
                   currentProject.value.team.program + currentProject.value.team.operation;
  return hasChars && hasPlots && teamSize >= 2;
});

// 待处理事项
interface PendingTask {
  id: string;
  type: 'character' | 'plot' | 'team' | 'event' | 'development';
  icon: string;
  title: string;
  description: string;
  projectId: string;
}

const pendingTasks = computed<PendingTask[]>(() => {
  const tasks: PendingTask[] = [];

  projectStore.projects.forEach(project => {
    const totalTeam = project.team.planning + project.team.art + project.team.program + project.team.operation;

    // 立项阶段：检查前置条件
    if (project.status === 'planning') {
      // 角色不足
      if (project.characters.length < 2) {
        tasks.push({
          id: `char_${project.id}`,
          type: 'character',
          icon: 'user-o',
          title: `${project.name} - 需要更多角色`,
          description: `当前${project.characters.length}个角色，需要至少2个才能开始开发`,
          projectId: project.id
        });
      }

      // 剧情不足
      if (project.plots.length < 1) {
        tasks.push({
          id: `plot_${project.id}`,
          type: 'plot',
          icon: 'description',
          title: `${project.name} - 需要编写剧情`,
          description: '至少需要1条剧情才能开始开发',
          projectId: project.id
        });
      }

      // 团队不足
      if (totalTeam < 2) {
        tasks.push({
          id: `team_${project.id}`,
          type: 'team',
          icon: 'friends-o',
          title: `${project.name} - 需要组建团队`,
          description: `当前${totalTeam}人，需要至少2人才能开始开发`,
          projectId: project.id
        });
      }

      // 全部满足，可以开始开发
      if (project.characters.length >= 2 && project.plots.length >= 1 && totalTeam >= 2) {
        tasks.push({
          id: `ready_${project.id}`,
          type: 'development',
          icon: 'play-circle-o',
          title: `${project.name} - 可以开始开发`,
          description: '前置条件已满足，点击开始开发',
          projectId: project.id
        });
      }
    }

    // 开发阶段：检查进度
    if (project.status === 'developing') {
      const requiredTeam = Math.ceil(project.progress / 20);
      if (totalTeam < requiredTeam) {
        tasks.push({
          id: `need_team_${project.id}`,
          type: 'team',
          icon: 'friends-o',
          title: `${project.name} - 需要更多人员`,
          description: `当前进度${project.progress}%，需要${requiredTeam}人团队才能继续`,
          projectId: project.id
        });
      }
    }
  });

  return tasks.slice(0, 5); // 最多显示5个
});

function getProjectPendingCount(projectId: string): number {
  return pendingTasks.value.filter(t => t.projectId === projectId).length;
}

// 市场动态 - 从 simulationStore 获取实时数据
const marketNews = computed(() => {
  const trends = simulationStore.worldSimulator?.getGenreTrends?.() || [];
  const news = [];
  
  // 从市场趋势生成动态
  if (trends.length > 0) {
    const topTrend = trends[0];
    news.push({
      type: 'primary' as const,
      tag: '趋势',
      text: `${topTrend.genreName}题材热度${topTrend.growthRate > 0 ? '上升' : '下降'} ${Math.abs(topTrend.growthRate || 0).toFixed(0)}%`
    });
  }
  
  // 从竞品动态生成
  const competitorNews = simulationStore.competitorNews;
  if (competitorNews && competitorNews.length > 0) {
    const latest = competitorNews[competitorNews.length - 1];
    news.push({
      type: 'warning' as const,
      tag: '竞品',
      text: `${latest.companyName}${latest.title}`
    });
  }
  
  // 从市场机会生成
  if (simulationStore.marketOpportunity) {
    news.push({
      type: 'success' as const,
      tag: '机会',
      text: simulationStore.marketOpportunity.analysis || '市场机会待挖掘'
    });
  }
  
  return news;
});

// 方法
function onPositioningConfirm({ selectedOptions }: { selectedOptions: { text: string; value: ProjectPositioning }[] }) {
  newProject.value.positioning = selectedOptions[0].value;
  showPositioningPicker.value = false;
}

async function handleCreateProject() {
  if (!newProject.value.name.trim()) {
    showToast('请输入项目名称');
    return;
  }
  if (!newProject.value.positioning) {
    showToast('请选择项目定位');
    return;
  }

  const project = projectStore.createProject({
    name: newProject.value.name,
    positioning: newProject.value.positioning,
    genre: ['romance'],
    targetAudience: ['female'],
    budget: {
      development: newProject.value.budget,
      operation: newProject.value.budget * 0.5,
      spent: 0
    },
    team: {
      planning: 0,
      art: 0,
      program: 0,
      operation: 0
    }
  });

  showToast('项目创建成功');
  showCreateProject.value = false;

  // 重置表单
  newProject.value = {
    name: '',
    positioning: '',
    budget: 50000
  };

  // 跳转到项目详情
  try {
    await router.push(`/project/${project.id}`);
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function goToProject(projectId: string) {
  try {
    await router.push(`/project/${projectId}`);
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function handlePendingTask(task: PendingTask) {
  projectStore.setCurrentProject(task.projectId);

  try {
    switch (task.type) {
      case 'character':
        await router.push('/creator/character');
        break;
      case 'plot':
        await router.push('/creator/plot');
        break;
      case 'team':
        await router.push('/team-management');
        break;
      case 'development':
        // 跳转到项目详情页，用户可以在那里点击开始开发
        await router.push(`/project/${task.projectId}`);
        break;
      default:
        await router.push(`/project/${task.projectId}`);
    }
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function goToTeamManagement() {
  try {
    await router.push('/team-management');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function goToRecruit() {
  try {
    await router.push('/recruit');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

// 游戏开发快速入口跳转方法
async function goToCharacterCreator() {
  if (!currentProject.value) {
    showToast('请先选择一个项目');
    return;
  }
  projectStore.setCurrentProject(currentProject.value.id);
  try {
    await router.push('/creator/character');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function goToPlotDesigner() {
  if (!currentProject.value) {
    showToast('请先选择一个项目');
    return;
  }
  projectStore.setCurrentProject(currentProject.value.id);
  try {
    await router.push('/creator/plot');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function goToPlotAnalysis() {
  if (!currentProject.value) {
    showToast('请先选择一个项目');
    return;
  }
  try {
    await router.push(`/plot-analysis/${currentProject.value.id}`);
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function goToCharacterRanking() {
  try {
    await router.push('/character-ranking');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

// 初始化
onMounted(() => {
  // 初始化默认项目和员工
  projectStore.initDefaultProject();
  employeeStore.initDefaultEmployees();
  
  // 触发每日登录任务（taskStore 已在 loadFromLocal 中自动初始化）
  taskStore.updateTaskProgress('daily_login');
  
  // 监听每日结算，显示每日总结弹窗
  simulationStore.setDailyReportCallback((report) => {
    dailyReport.value = report;
    showDailySummary.value = true;
  });
});

// 处理每日总结弹窗关闭
function handleDailySummaryClose() {
  showDailySummary.value = false;
  dailyReport.value = null;
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 16px;
  padding-bottom: 80px;
}

.section {
  margin: 8px 0;
  padding: 0 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.project-section {
  margin-bottom: 16px;
}

.project-section-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  padding-left: 4px;
}

/* 横向滚动容器 */
.project-scroll-container {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  white-space: nowrap;
  padding: 4px 4px 12px 4px;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.project-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.project-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.project-scroll-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.project-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.project-card-wrapper {
  flex: 0 0 auto;
  width: calc(50% - 6px);
  min-width: 160px;
}

.project-card-wrapper :deep(.project-card) {
  margin-bottom: 0;
}

.project-card-wrapper :deep(.project-header) {
  margin-bottom: 8px;
}

.project-card-wrapper :deep(.project-cover) {
  width: 36px;
  height: 36px;
}

.project-card-wrapper :deep(.cover-icon) {
  font-size: 18px;
}

.project-card-wrapper :deep(.project-name) {
  font-size: 14px;
}

.project-card-wrapper :deep(.project-tags) {
  flex-wrap: wrap;
}

.project-card-wrapper :deep(.health-section),
.project-card-wrapper :deep(.expectation-section),
.project-card-wrapper :deep(.suggestion-tip),
.project-card-wrapper :deep(.project-metrics),
.project-card-wrapper :deep(.project-footer) {
  display: none;
}

.project-card-wrapper :deep(.project-progress) {
  margin-bottom: 0;
}

.project-card-wrapper :deep(.progress-header) {
  margin-bottom: 4px;
}

.project-card-wrapper :deep(.progress-label),
.project-card-wrapper :deep(.progress-value) {
  font-size: 11px;
}

.pending-collapse-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pending-collapse-bar:active {
  background: #f5f5f5;
}

.pending-collapse-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pending-collapse-icon {
  color: #999;
  font-size: 16px;
  transition: transform 0.3s;
}

.pending-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 展开/收起过渡动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.pending-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.3s;
}

.pending-item:last-child {
  border-bottom: none;
}

.pending-item:hover {
  background: #fafafa;
}

.pending-icon {
  font-size: 20px;
  color: #ff4d4f;
  margin-right: 12px;
}

.pending-content {
  flex: 1;
}

.pending-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
}

.pending-desc {
  font-size: 12px;
  color: #999;
}

.pending-arrow {
  color: #ccc;
}

.market-scroll-container {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  white-space: nowrap;
  padding: 12px;
  background: white;
  border-radius: 12px;
  height: 60px;
  align-items: center;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.market-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.market-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.market-scroll-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.market-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.news-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 8px;
  flex-shrink: 0;
  width: auto;
}

.news-tag {
  flex-shrink: 0;
}

.news-text {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

.empty-state {
  padding: 40px 0;
}

.create-project-form {
  padding: 16px;
}

/* 游戏开发快速入口样式 */
.quick-dev-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.dev-options-flex {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.dev-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  border-radius: 10px;
  background: #fafafa;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  flex: 1;
  min-width: 0;
}

.dev-option:active {
  transform: scale(0.98);
  background: #f0f0f0;
}

.dev-option .option-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.dev-option .option-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.dev-option .option-count {
  font-size: 11px;
  color: #999;
}

.dev-progress {
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.dev-progress .progress-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.dev-progress .progress-hint {
  margin-top: 6px;
  font-size: 11px;
  color: #999;
}

.dev-progress .progress-hint.ready {
  color: #52c41a;
}
</style>
