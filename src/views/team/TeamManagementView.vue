<template>
  <div class="team-management">
    <BackButton title="团队管理" />

    <div class="team-content">
      <!-- 团队概览 -->
      <div class="overview-card">
        <div class="overview-header">
          <span class="overview-title">团队概览</span>
          <van-tag v-if="creatorStore.getSkillLevel('projectManagement') > 0" type="success" size="small">
            效率+{{ creatorStore.getSkillLevel('projectManagement') * 5 }}%
          </van-tag>
        </div>
        <div class="overview-stats">
          <div class="stat-item">
            <span class="stat-value">{{ employeeStore.totalEmployees }}</span>
            <span class="stat-label">总人数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ employeeStore.assignedEmployees.length }}</span>
            <span class="stat-label">已分配</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ employeeStore.availableEmployees.length }}</span>
            <span class="stat-label">待分配</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ teamEfficiency }}%</span>
            <span class="stat-label">团队效率</span>
          </div>
        </div>
      </div>

      <!-- 按职位分组显示 -->
      <div
        v-for="(employees, position) in employeeStore.employeesByPosition"
        :key="position"
        class="position-section"
      >
        <div class="position-header">
          <div class="position-title">
            <van-icon :name="getPositionIcon(position)" />
            <span>{{ getPositionName(position) }}</span>
            <van-tag type="primary">{{ employees.length }}</van-tag>
          </div>
        </div>

        <div v-if="employees.length > 0" class="employee-list">
          <div
            v-for="employee in employees"
            :key="employee.id"
            class="employee-card"
            :class="{ 'high-risk': isHighRisk(employee) }"
            @click="viewEmployee(employee)"
          >
            <div class="employee-header">
              <div class="employee-avatar">
                {{ employee.name.charAt(0) }}
              </div>
              <div class="employee-info">
                <div class="employee-name">
                  {{ employee.name }}
                  <van-tag :color="getLevelColor(employee.level)" size="small">
                    {{ getLevelName(employee.level) }}
                  </van-tag>
                </div>
                <div class="employee-project">
                  <template v-if="employee.assignedProjectId">
                    <van-icon name="cluster-o" />
                    {{ getProjectName(employee.assignedProjectId) }}
                  </template>
                  <template v-else>
                    <span class="unassigned">未分配</span>
                  </template>
                </div>
              </div>
              <div v-if="isHighRisk(employee)" class="risk-badge">
                <van-icon name="warning-o" color="#ff4d4f" />
              </div>
            </div>

            <div class="employee-stats">
              <div class="stat-bar">
                <span class="bar-label">疲劳</span>
                <van-progress
                  :percentage="employee.fatigue"
                  :stroke-width="6"
                  :color="getFatigueColor(employee.fatigue)"
                />
              </div>
              <div class="stat-bar">
                <span class="bar-label">满意</span>
                <van-progress
                  :percentage="employee.satisfaction"
                  :stroke-width="6"
                  color="#52c41a"
                />
              </div>
            </div>

            <div class="employee-footer">
              <span class="specialty">{{ getSpecialtyName(employee.specialty) }}</span>
              <span class="salary">¥{{ formatNumber(employee.salary) }}</span>
            </div>
          </div>
        </div>

        <van-empty v-else :description="`暂无${getPositionName(position)}`" />
      </div>

      <!-- 快捷操作 -->
      <div class="action-buttons">
        <van-button type="primary" block @click="goToRecruit">
          <van-icon name="plus" />
          招聘员工
        </van-button>
        <van-button type="default" block @click="restAll">
          全员休息
        </van-button>
      </div>
    </div>

    <!-- 员工详情弹窗 -->
    <van-action-sheet
      v-model:show="showEmployeeDetail"
      :title="selectedEmployee?.name"
    >
      <div v-if="selectedEmployee" class="employee-detail">
        <div class="detail-section">
          <div class="detail-label">基本信息</div>
          <van-cell-group>
            <van-cell title="职位" :value="getPositionName(selectedEmployee.position)" />
            <van-cell title="等级" :value="getLevelName(selectedEmployee.level)" />
            <van-cell title="专长" :value="getSpecialtyName(selectedEmployee.specialty)" />
            <van-cell title="性格" :value="getTraitName(selectedEmployee.trait)" />
          </van-cell-group>
        </div>

        <div class="detail-section">
          <div class="detail-label">技能属性</div>
          <div class="skills-grid">
            <div class="skill-item">
              <span>策划</span>
              <van-progress :percentage="selectedEmployee.skills.planning" />
            </div>
            <div class="skill-item">
              <span>美术</span>
              <van-progress :percentage="selectedEmployee.skills.art" />
            </div>
            <div class="skill-item">
              <span>程序</span>
              <van-progress :percentage="selectedEmployee.skills.program" />
            </div>
            <div class="skill-item">
              <span>运营</span>
              <van-progress :percentage="selectedEmployee.skills.operation" />
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">状态</div>
          <van-cell-group>
            <van-cell title="疲劳度">
              <template #value>
                <van-progress :percentage="selectedEmployee.fatigue" style="width: 100px;" />
              </template>
            </van-cell>
            <van-cell title="满意度">
              <template #value>
                <van-progress :percentage="selectedEmployee.satisfaction" style="width: 100px;" color="#52c41a" />
              </template>
            </van-cell>
            <van-cell title="经验值" :value="selectedEmployee.experience" />
            <van-cell title="薪资" :value="`¥${formatNumber(selectedEmployee.salary)}`" />
          </van-cell-group>
        </div>

        <div class="detail-actions">
          <van-button
            v-if="!selectedEmployee.assignedProjectId"
            type="primary"
            block
            @click="assignProject"
          >
            分配项目
          </van-button>
          <van-button
            v-else
            type="default"
            block
            @click="unassignProject"
          >
            移除分配
          </van-button>
          <van-button
            v-if="canPromote(selectedEmployee)"
            type="success"
            block
            @click="promote"
          >
            晋升
          </van-button>
          <van-button
            v-if="!selectedEmployee.assignedProjectId"
            type="default"
            block
            @click="restEmployee"
          >
            休息
          </van-button>
          <van-button
            type="danger"
            block
            plain
            @click="fireEmployee"
          >
            解雇
          </van-button>
        </div>
      </div>
    </van-action-sheet>

    <!-- 分配项目弹窗 -->
    <van-popup v-model:show="showAssignProject" position="bottom">
      <van-picker
        title="选择项目"
        :columns="projectColumns"
        @confirm="onAssignConfirm"
        @cancel="showAssignProject = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useProjectStore } from '@/stores/projectStore';
import { useCreatorGrowthStore, SKILL_EFFECTS } from '@/stores/creatorGrowth';
import BackButton from '@/components/common/BackButton.vue';
import type { Employee, EmployeePosition } from '@/types/employee';
import {
  getPositionName,
  getLevelName,
  getSpecialtyName,
  getTraitName,
  EMPLOYEE_POSITION_CONFIG,
  EMPLOYEE_LEVEL_CONFIG,
  canPromote,
  calculateTurnoverRisk
} from '@/types/employee';

const router = useRouter();
const employeeStore = useEmployeeStore();
const projectStore = useProjectStore();
const creatorStore = useCreatorGrowthStore();

const showEmployeeDetail = ref(false);
const showAssignProject = ref(false);
const selectedEmployee = ref<Employee | null>(null);

const projectColumns = computed(() => {
  return projectStore.projects
    .filter(p => ['planning', 'developing'].includes(p.status))
    .map(p => ({ text: p.name, value: p.id }));
});

// 计算团队效率（应用项目管理技能加成）
const teamEfficiency = computed(() => {
  const pmLevel = creatorStore.getSkillLevel('projectManagement');
  const baseEfficiency = 100;
  const efficiencyBonus = SKILL_EFFECTS.projectManagement.teamEfficiencyBonus(pmLevel);
  return Math.round(baseEfficiency * (1 + efficiencyBonus));
});

// 计算疲劳度减缓
const fatigueReduction = computed(() => {
  const pmLevel = creatorStore.getSkillLevel('projectManagement');
  return SKILL_EFFECTS.projectManagement.fatigueReduction(pmLevel);
});

function getPositionIcon(position: EmployeePosition): string {
  return EMPLOYEE_POSITION_CONFIG[position]?.icon || 'user-o';
}

function getLevelColor(level: string): string {
  return EMPLOYEE_LEVEL_CONFIG[level as keyof typeof EMPLOYEE_LEVEL_CONFIG]?.color || '#999';
}

function getFatigueColor(fatigue: number): string {
  if (fatigue >= 80) return '#ff4d4f';
  if (fatigue >= 60) return '#faad14';
  return '#52c41a';
}

function isHighRisk(employee: Employee): boolean {
  return calculateTurnoverRisk(employee) > 0.5;
}

function getProjectName(projectId: string): string {
  const project = projectStore.projects.find(p => p.id === projectId);
  return project?.name || '未知项目';
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  return num.toLocaleString();
}

function viewEmployee(employee: Employee) {
  selectedEmployee.value = employee;
  showEmployeeDetail.value = true;
}

async function goToRecruit() {
  try {
    await router.push('/recruit');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function restAll() {
  const pmLevel = creatorStore.getSkillLevel('projectManagement');
  const fatigueReductionRate = SKILL_EFFECTS.projectManagement.fatigueReduction(pmLevel);

  const result = employeeStore.restAllAvailableEmployees();

  // 显示技能加成提示
  if (pmLevel > 0) {
    showToast(`项目管理Lv.${pmLevel}加成: 疲劳恢复+${Math.round(fatigueReductionRate * 100)}%`);
  } else {
    showToast(result.message);
  }
}

function assignProject() {
  showAssignProject.value = true;
}

function onAssignConfirm({ selectedOptions }: { selectedOptions: { text: string; value: string }[] }) {
  if (selectedEmployee.value) {
    employeeStore.assignToProject(selectedEmployee.value.id, selectedOptions[0].value);
    showToast('分配成功');
    showAssignProject.value = false;
    showEmployeeDetail.value = false;
  }
}

function unassignProject() {
  if (selectedEmployee.value) {
    employeeStore.assignToProject(selectedEmployee.value.id, null);
    showToast('已移除分配');
    showEmployeeDetail.value = false;
  }
}

function promote() {
  if (selectedEmployee.value) {
    const result = employeeStore.promoteEmployee(selectedEmployee.value.id);
    showToast(result.message);
    if (result.success) {
      showEmployeeDetail.value = false;
    }
  }
}

function restEmployee() {
  if (selectedEmployee.value) {
    const result = employeeStore.restEmployee(selectedEmployee.value.id);
    showToast(result.message);
    if (result.success) {
      showEmployeeDetail.value = false;
    }
  }
}

async function fireEmployee() {
  if (!selectedEmployee.value) return;

  await showDialog({
    title: '确认解雇',
    message: `确定要解雇${selectedEmployee.value.name}吗？`,
    showCancelButton: true
  });

  const result = employeeStore.fireEmployee(selectedEmployee.value.id);
  showToast(result.message);
  if (result.success) {
    showEmployeeDetail.value = false;
  }
}
</script>

<style scoped>
.team-management {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.team-content {
  padding: 16px;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.overview-header {
  margin-bottom: 12px;
}

.overview-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.position-section {
  margin-bottom: 16px;
}

.position-header {
  margin-bottom: 12px;
}

.position-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.employee-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.employee-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.employee-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.employee-card.high-risk {
  border: 1px solid #ff4d4f;
}

.employee-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.employee-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.employee-info {
  flex: 1;
}

.employee-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.employee-project {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.unassigned {
  color: #999;
}

.risk-badge {
  font-size: 20px;
}

.employee-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar-label {
  font-size: 12px;
  color: #666;
  width: 40px;
}

.employee-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.specialty {
  font-size: 12px;
  color: #1890ff;
  background: #e6f7ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.salary {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.employee-detail {
  padding: 16px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skill-item span {
  font-size: 13px;
  color: #666;
  width: 50px;
}

.detail-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
}
</style>
