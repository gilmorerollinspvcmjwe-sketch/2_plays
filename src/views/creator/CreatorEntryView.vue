<template>
  <div class="creator-entry">
    <BackButton title="游戏开发" />

    <div class="entry-content">
      <!-- 项目选择提示 -->
      <div v-if="!currentProject" class="no-project">
        <van-empty description="请先选择一个项目">
          <van-button type="primary" @click="goToHome">
            返回首页选择项目
          </van-button>
        </van-empty>
      </div>

      <template v-else>
        <!-- 当前项目信息 -->
        <div class="project-info">
          <div class="project-name">{{ currentProject.name }}</div>
          <div class="project-status">
            <van-tag :type="getStatusType(currentProject.status)">
              {{ getStatusText(currentProject.status) }}
            </van-tag>
          </div>
        </div>

        <!-- 快速操作区 -->
        <div class="quick-actions">
          <div class="action-title">快速操作</div>
          <div class="action-grid">
            <div class="action-card primary" @click="handleCreateProject">
              <div class="action-icon">
                <van-icon name="plus" color="#fff" />
              </div>
              <div class="action-name">创建项目</div>
            </div>
            <div class="action-card" @click="goToTeamManagement">
              <div class="action-icon" style="background: #e6f7ff;">
                <van-icon name="friends-o" color="#1890ff" />
              </div>
              <div class="action-name">团队管理</div>
            </div>
          </div>
        </div>

        <!-- 开发选项 -->
        <div class="dev-options">
          <div class="option-title">内容开发</div>

          <div class="option-grid">
            <!-- 创建角色 -->
            <div class="option-card" @click="goToCharacterCreator">
              <div class="option-icon" style="background: #e6f7ff;">
                <van-icon name="user-o" color="#1890ff" />
              </div>
              <div class="option-info">
                <div class="option-name">创建角色</div>
                <div class="option-desc">设计角色形象、性格、背景</div>
                <div class="option-count">
                  已有 {{ currentProject.characters.length }} 个角色
                </div>
              </div>
              <van-icon name="arrow" class="option-arrow" />
            </div>

            <!-- 设计剧情 -->
            <div class="option-card" @click="goToPlotDesigner">
              <div class="option-icon" style="background: #f6ffed;">
                <van-icon name="description" color="#52c41a" />
              </div>
              <div class="option-info">
                <div class="option-name">设计剧情</div>
                <div class="option-desc">编写故事线、分支、结局</div>
                <div class="option-count">
                  已有 {{ currentProject.plots.length }} 条剧情
                </div>
              </div>
              <van-icon name="arrow" class="option-arrow" />
            </div>
          </div>
        </div>

        <!-- 项目进度 -->
        <div class="project-progress" v-if="currentProject.status === 'planning' || currentProject.status === 'developing'">
          <div class="progress-title">开发进度</div>
          <van-progress :percentage="currentProject.progress" :stroke-width="12" />
          <div class="progress-hint">
            <template v-if="currentProject.status === 'planning'">
              <div v-if="!canStartDev" class="hint-text">
                需要至少2个角色、1条剧情、2人团队才能开始开发
              </div>
              <div v-else class="hint-text ready">
                前置条件已满足，可以开始开发
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showDialog, showToast } from 'vant';
import BackButton from '@/components/common/BackButton.vue';
import { useProjectStore } from '@/stores/projectStore';
import { useCompanyStore } from '@/stores/companyStore';

const router = useRouter();
const projectStore = useProjectStore();
const companyStore = useCompanyStore();

const currentProject = computed(() => projectStore.currentProject);
const showCreateProject = ref(false);

// 是否可以开始开发
const canStartDev = computed(() => {
  if (!currentProject.value) return false;
  const hasChars = currentProject.value.characters.length >= 2;
  const hasPlots = currentProject.value.plots.length >= 1;
  const teamSize = currentProject.value.team.planning + currentProject.value.team.art +
                   currentProject.value.team.program + currentProject.value.team.operation;
  return hasChars && hasPlots && teamSize >= 2;
});

function getStatusType(status: string): 'primary' | 'success' | 'warning' | 'danger' | 'default' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'default'> = {
    planning: 'primary',
    developing: 'warning',
    released: 'success',
    operating: 'success'
  };
  return types[status] || 'default';
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    planning: '立项中',
    developing: '开发中',
    released: '已发布',
    operating: '运营中'
  };
  return texts[status] || status;
}

async function goToHome() {
  try {
    await router.push('/');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function handleCreateProject() {
  // 检查资金
  if (!companyStore.canSpend(100000)) {
    showToast('资金不足，需要10万元立项费用');
    return;
  }
  
  // 弹出确认对话框
  try {
    await showDialog({
      title: '创建新项目',
      message: '创建新项目需要10万元立项费用，是否继续？',
      showCancelButton: true,
    });
    // 用户确认，跳转到项目创建页面
    showCreateProject.value = true;
  } catch {
    // 用户取消，不做任何操作
  }
}

async function goToTeamManagement() {
  try {
    await router.push('/team');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function goToCharacterCreator() {
  if (!currentProject.value) return;
  projectStore.setCurrentProject(currentProject.value.id);
  try {
    await router.push('/creator/character');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}

async function goToPlotDesigner() {
  if (!currentProject.value) return;
  projectStore.setCurrentProject(currentProject.value.id);
  try {
    await router.push('/creator/plot');
  } catch (error) {
    console.error('导航失败:', error);
    showToast('页面跳转失败');
  }
}
</script>

<style scoped>
.creator-entry {
  min-height: 100vh;
  background: #f5f5f5;
}

.entry-content {
  padding: 16px;
}

.no-project {
  padding: 60px 0;
}

.project-info {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* 快速操作区 */
.quick-actions {
  margin-bottom: 16px;
}

.action-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  padding-left: 4px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:active {
  transform: scale(0.98);
}

.action-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-card.primary .action-icon {
  background: rgba(255, 255, 255, 0.2) !important;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.action-name {
  font-size: 14px;
  font-weight: 500;
}

/* 开发选项 */
.dev-options {
  margin-bottom: 16px;
}

.option-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  padding-left: 4px;
}

.option-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.option-card:active {
  transform: scale(0.98);
}

.option-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.option-info {
  flex: 1;
}

.option-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}

.option-count {
  font-size: 12px;
  color: #1890ff;
}

.option-arrow {
  color: #ccc;
  font-size: 16px;
}

/* 项目进度 */
.project-progress {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.progress-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.progress-hint {
  margin-top: 12px;
}

.hint-text {
  font-size: 12px;
  color: #999;
}

.hint-text.ready {
  color: #52c41a;
}
</style>
