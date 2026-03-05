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

        <!-- 开发选项 -->
        <div class="dev-options">
          <div class="option-title">选择开发内容</div>

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

            <!-- 剧情分析 -->
            <div class="option-card" @click="goToPlotAnalysis">
              <div class="option-icon" style="background: #fff7e6;">
                <van-icon name="chart-bar-o" color="#faad14" />
              </div>
              <div class="option-info">
                <div class="option-name">剧情分析</div>
                <div class="option-desc">查看完成率、流失点分析</div>
              </div>
              <van-icon name="arrow" class="option-arrow" />
            </div>

            <!-- 角色排行 -->
            <div class="option-card" @click="goToCharacterRanking">
              <div class="option-icon" style="background: #f9f0ff;">
                <van-icon name="trophy-o" color="#722ed1" />
              </div>
              <div class="option-info">
                <div class="option-name">角色排行</div>
                <div class="option-desc">查看角色价值排名</div>
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
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import BackButton from '@/components/common/BackButton.vue';
import { useProjectStore } from '@/stores/projectStore';

const router = useRouter();
const projectStore = useProjectStore();

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

function goToHome() {
  router.push('/');
}

function goToCharacterCreator() {
  if (!currentProject.value) return;
  projectStore.setCurrentProject(currentProject.value.id);
  router.push('/creator/character');
}

function goToPlotDesigner() {
  if (!currentProject.value) return;
  projectStore.setCurrentProject(currentProject.value.id);
  router.push('/creator/plot');
}

function goToPlotAnalysis() {
  if (!currentProject.value) return;
  router.push(`/plot-analysis/${currentProject.value.id}`);
}

function goToCharacterRanking() {
  router.push('/character-ranking');
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

.option-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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
