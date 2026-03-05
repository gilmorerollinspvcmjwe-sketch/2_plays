<template>
  <div class="company-dashboard">
    <div class="dashboard-header">
      <div class="company-name">{{ companyName }}</div>
      <div class="company-level">Lv.{{ companyLevel }}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #e6f7ff;">
          <van-icon name="gold-coin-o" color="#1890ff" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatMoney(stats.totalRevenue) }}</div>
          <div class="stat-label">总收入</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #f6ffed;">
          <van-icon name="chart-trending-o" color="#52c41a" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.activeProjects }}/{{ stats.totalProjects }}</div>
          <div class="stat-label">活跃项目</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #fff7e6;">
          <van-icon name="friends-o" color="#fa8c16" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ totalEmployees }}</div>
          <div class="stat-label">团队人数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #f9f0ff;">
          <van-icon name="smile-o" color="#722ed1" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ Math.round(averageSatisfaction) }}%</div>
          <div class="stat-label">团队满意度</div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <div class="action-item" @click="handleCreateProject">
        <div class="action-icon" style="background: #e6f7ff;">
          <van-icon name="plus" color="#1890ff" />
        </div>
        <span class="action-label">创建项目</span>
      </div>
      <div class="action-item" @click="handleTeamManagement">
        <div class="action-icon" style="background: #f6ffed;">
          <van-icon name="manager-o" color="#52c41a" />
        </div>
        <span class="action-label">团队管理</span>
      </div>
      <div class="action-item" @click="handleViewReports">
        <div class="action-icon" style="background: #fff7e6;">
          <van-icon name="chart-bar-o" color="#fa8c16" />
        </div>
        <span class="action-label">查看报表</span>
      </div>
      <div class="action-item" @click="handleRecruit">
        <div class="action-icon" style="background: #f9f0ff;">
          <van-icon name="search" color="#722ed1" />
        </div>
        <span class="action-label">招聘员工</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Stats {
  totalRevenue: number;
  activeProjects: number;
  totalProjects: number;
}

interface Props {
  companyName: string;
  companyLevel: number;
  stats: Stats;
  totalEmployees: number;
  averageSatisfaction: number;
}

withDefaults(defineProps<Props>(), {
  companyName: '我的游戏公司',
  companyLevel: 1,
  stats: () => ({
    totalRevenue: 0,
    activeProjects: 0,
    totalProjects: 0
  }),
  totalEmployees: 0,
  averageSatisfaction: 70
});

const emit = defineEmits<{
  createProject: [];
  teamManagement: [];
  viewReports: [];
  recruit: [];
}>();

function formatMoney(amount: number): string {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'K';
  }
  return amount.toString();
}

function handleCreateProject() {
  emit('createProject');
}

function handleTeamManagement() {
  emit('teamManagement');
}

function handleViewReports() {
  emit('viewReports');
}

function handleRecruit() {
  emit('recruit');
}
</script>

<style scoped>
.company-dashboard {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  color: white;
  margin-bottom: 16px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.company-name {
  font-size: 20px;
  font-weight: 600;
}

.company-level {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.3s;
}

.action-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.action-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}
</style>
