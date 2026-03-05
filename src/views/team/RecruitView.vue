<template>
  <div class="recruit-view">
    <BackButton title="招聘员工" />

    <div class="recruit-content">
      <!-- 发布招聘 -->
      <div class="section-card">
        <div class="section-title">发布招聘</div>
        <div class="form-group">
          <div class="form-item">
            <span class="form-label">职位</span>
            <van-radio-group v-model="recruitForm.position" direction="horizontal">
              <van-radio name="planning">策划</van-radio>
              <van-radio name="art">美术</van-radio>
              <van-radio name="program">程序</van-radio>
              <van-radio name="operation">运营</van-radio>
            </van-radio-group>
          </div>

          <div class="form-item">
            <span class="form-label">等级要求</span>
            <van-radio-group v-model="recruitForm.level" direction="horizontal">
              <van-radio name="junior">初级</van-radio>
              <van-radio name="mid">中级</van-radio>
              <van-radio name="senior">高级</van-radio>
              <van-radio name="expert">专家</van-radio>
            </van-radio-group>
          </div>

          <div class="form-item">
            <span class="form-label">薪资范围</span>
            <div class="salary-range">
              <van-field
                v-model="recruitForm.minSalary"
                type="number"
                placeholder="最低"
              />
              <span class="range-separator">-</span>
              <van-field
                v-model="recruitForm.maxSalary"
                type="number"
                placeholder="最高"
              />
            </div>
          </div>
        </div>

        <van-button type="primary" block @click="postJob">
          发布招聘信息
        </van-button>
      </div>

      <!-- 正在招聘 -->
      <div v-if="employeeStore.jobPostings.length > 0" class="section-card">
        <div class="section-title">正在招聘</div>
        <div class="posting-list">
          <div
            v-for="posting in employeeStore.jobPostings"
            :key="posting.id"
            class="posting-item"
          >
            <div class="posting-header">
              <div class="posting-title">
                <van-icon :name="getPositionIcon(posting.position)" />
                <span>{{ getPositionName(posting.position) }} - {{ getLevelName(posting.level) }}</span>
              </div>
              <van-tag type="primary">{{ posting.applicants.length }}人应聘</van-tag>
            </div>
            <div class="posting-salary">
              ¥{{ formatNumber(posting.minSalary) }} - ¥{{ formatNumber(posting.maxSalary) }}
            </div>
            <div class="applicant-preview">
              <div
                v-for="applicant in posting.applicants.slice(0, 3)"
                :key="applicant.id"
                class="applicant-avatar"
              >
                {{ applicant.name.charAt(0) }}
              </div>
              <span v-if="posting.applicants.length > 3" class="more-applicants">
                +{{ posting.applicants.length - 3 }}
              </span>
            </div>
            <van-button
              type="primary"
              size="small"
              block
              @click="viewApplicants(posting)"
            >
              查看应聘者
            </van-button>
          </div>
        </div>
      </div>

      <!-- 招聘提示 -->
      <div class="tips-card">
        <div class="tips-title">
          <van-icon name="info-o" />
          招聘小贴士
        </div>
        <div class="tips-list">
          <div class="tip-item">• 薪资越高，吸引的应聘者质量越好</div>
          <div class="tip-item">• 不同职位需要不同的技能属性</div>
          <div class="tip-item">• 员工的性格特质会影响工作效率</div>
          <div class="tip-item">• 高级员工需要更高的薪资期望</div>
        </div>
      </div>
    </div>

    <!-- 应聘者列表弹窗 -->
    <van-popup
      v-model:show="showApplicants"
      position="bottom"
      :style="{ height: '70%' }"
    >
      <div class="applicants-popup">
        <div class="popup-header">
          <span class="popup-title">应聘者列表</span>
          <van-icon name="cross" @click="showApplicants = false" />
        </div>

        <div v-if="selectedPosting" class="applicants-list">
          <div
            v-for="applicant in selectedPosting.applicants"
            :key="applicant.id"
            class="applicant-card"
          >
            <div class="applicant-header">
              <div class="applicant-avatar large">
                {{ applicant.name.charAt(0) }}
              </div>
              <div class="applicant-info">
                <div class="applicant-name">
                  {{ applicant.name }}
                  <van-tag :color="getLevelColor(applicant.level)" size="small">
                    {{ getLevelName(applicant.level) }}
                  </van-tag>
                </div>
                <div class="applicant-specialty">
                  {{ getSpecialtyName(applicant.specialty) }} · {{ getTraitName(applicant.trait) }}
                </div>
              </div>
              <div class="applicant-salary">
                ¥{{ formatNumber(applicant.expectedSalary) }}
              </div>
            </div>

            <div class="applicant-skills">
              <div class="skill-row">
                <span class="skill-name">策划</span>
                <van-progress :percentage="applicant.skills.planning" :stroke-width="6" />
              </div>
              <div class="skill-row">
                <span class="skill-name">美术</span>
                <van-progress :percentage="applicant.skills.art" :stroke-width="6" />
              </div>
              <div class="skill-row">
                <span class="skill-name">程序</span>
                <van-progress :percentage="applicant.skills.program" :stroke-width="6" />
              </div>
              <div class="skill-row">
                <span class="skill-name">运营</span>
                <van-progress :percentage="applicant.skills.operation" :stroke-width="6" />
              </div>
            </div>

            <div class="applicant-resume">
              {{ applicant.resume }}
            </div>

            <div class="applicant-actions">
              <van-button
                type="primary"
                size="small"
                block
                @click="hireApplicant(applicant)"
              >
                雇佣
              </van-button>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useEmployeeStore } from '@/stores/employeeStore';
import BackButton from '@/components/common/BackButton.vue';
import type { JobPosting, JobApplicant, EmployeePosition, EmployeeLevel } from '@/types/employee';
import {
  getPositionName,
  getLevelName,
  getSpecialtyName,
  getTraitName,
  EMPLOYEE_POSITION_CONFIG,
  EMPLOYEE_LEVEL_CONFIG
} from '@/types/employee';

const router = useRouter();
const employeeStore = useEmployeeStore();

const showApplicants = ref(false);
const selectedPosting = ref<JobPosting | null>(null);

const recruitForm = reactive({
  position: 'planning' as EmployeePosition,
  level: 'junior' as EmployeeLevel,
  minSalary: 5000,
  maxSalary: 8000
});

function getPositionIcon(position: EmployeePosition): string {
  return EMPLOYEE_POSITION_CONFIG[position]?.icon || 'user-o';
}

function getLevelColor(level: string): string {
  return EMPLOYEE_LEVEL_CONFIG[level as keyof typeof EMPLOYEE_LEVEL_CONFIG]?.color || '#999';
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  return num.toLocaleString();
}

function postJob() {
  if (recruitForm.minSalary >= recruitForm.maxSalary) {
    showToast('最低薪资必须小于最高薪资');
    return;
  }

  employeeStore.postJob(
    recruitForm.position,
    recruitForm.level,
    recruitForm.minSalary,
    recruitForm.maxSalary
  );

  showToast('招聘信息已发布');
}

function viewApplicants(posting: JobPosting) {
  selectedPosting.value = posting;
  showApplicants.value = true;
}

function hireApplicant(applicant: JobApplicant) {
  if (!selectedPosting.value) return;

  const result = employeeStore.hireApplicant(selectedPosting.value.id, applicant.id);
  showToast(result.message);

  if (result.success) {
    showApplicants.value = false;
  }
}
</script>

<style scoped>
.recruit-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.recruit-content {
  padding: 16px;
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.salary-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.salary-range .van-field {
  flex: 1;
}

.range-separator {
  color: #999;
}

.posting-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.posting-item {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
}

.posting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.posting-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.posting-salary {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.applicant-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
}

.applicant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.applicant-avatar.large {
  width: 48px;
  height: 48px;
  font-size: 20px;
}

.more-applicants {
  font-size: 12px;
  color: #999;
}

.tips-card {
  background: #e6f7ff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #91d5ff;
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 12px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  font-size: 13px;
  color: #666;
}

.applicants-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.applicants-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.applicant-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.applicant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.applicant-info {
  flex: 1;
}

.applicant-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.applicant-specialty {
  font-size: 13px;
  color: #666;
}

.applicant-salary {
  font-size: 14px;
  font-weight: 600;
  color: #ff6b6b;
}

.applicant-skills {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.skill-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-name {
  font-size: 12px;
  color: #666;
  width: 40px;
}

.applicant-resume {
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.applicant-actions {
  display: flex;
  gap: 8px;
}
</style>
