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

    <!-- 待处理事项 -->
    <div v-if="pendingTasks.length > 0" class="section">
      <div class="section-header">
        <span class="section-title">待处理事项</span>
        <van-tag type="danger">{{ pendingTasks.length }}</van-tag>
      </div>
      <div class="pending-list">
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
        <ProjectCard
          v-for="project in activeProjects"
          :key="project.id"
          :project="project"
          :pending-count="getProjectPendingCount(project.id)"
          @click="goToProject"
        />
      </div>

      <!-- 运营中项目 -->
      <div v-if="operatingProjects.length > 0" class="project-section">
        <div class="project-section-title">运营中</div>
        <ProjectCard
          v-for="project in operatingProjects"
          :key="project.id"
          :project="project"
          @click="goToProject"
        />
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
        <van-icon name="fire-o" color="#ff4d4f" />
      </div>
      <div class="market-news">
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
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
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

.pending-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.pending-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
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

.market-news {
  background: white;
  border-radius: 12px;
  padding: 12px;
}

.news-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.news-item:last-child {
  border-bottom: none;
}

.news-tag {
  flex-shrink: 0;
}

.news-text {
  font-size: 13px;
  color: #666;
}

.empty-state {
  padding: 40px 0;
}

.create-project-form {
  padding: 16px;
}
</style>
