<template>
  <div class="company-setup-view">
    <div class="setup-container">
      <h1 class="setup-title">🏢 创立你的游戏公司</h1>
      <p class="setup-subtitle">开启你的乙女游戏创作之旅</p>

      <!-- 步骤条 -->
      <van-steps :active="currentStep" class="setup-steps">
        <van-step>公司命名</van-step>
        <van-step>Logo 设计</van-step>
        <van-step>团队组建</van-step>
      </van-steps>

      <!-- 步骤 1: 公司命名 -->
      <div v-if="currentStep === 0" class="step-content">
        <h2 class="step-title">给你的公司起个名字</h2>
        <van-field
          v-model="companyForm.name"
          label="公司名称"
          placeholder="例如：梦想工作室"
          maxlength="20"
          show-word-limit
          :rules="[{ required: true, message: '请输入公司名称' }]"
        />
        <div class="name-suggestions">
          <p class="suggestion-label">推荐名称：</p>
          <div class="suggestion-tags">
            <van-tag
              v-for="name in suggestedNames"
              :key="name"
              plain
              size="medium"
              class="suggestion-tag"
              @click="companyForm.name = name"
            >
              {{ name }}
            </van-tag>
          </div>
        </div>
      </div>

      <!-- 步骤 2: Logo 设计 -->
      <div v-if="currentStep === 1" class="step-content">
        <h2 class="step-title">设计公司 Logo</h2>
        <div class="logo-preview">
          <div class="logo-display">
            <span class="logo-emoji">{{ companyForm.logoEmoji }}</span>
            <span class="logo-text">{{ companyForm.logoText || '公司名称' }}</span>
          </div>
        </div>
        <van-field
          v-model="companyForm.logoEmoji"
          label="Logo 图标"
          placeholder="选择一个 emoji"
          maxlength="2"
        />
        <div class="emoji-picker">
          <span
            v-for="emoji in commonEmojis"
            :key="emoji"
            class="emoji-option"
            @click="companyForm.logoEmoji = emoji"
          >
            {{ emoji }}
          </span>
        </div>
        <van-field
          v-model="companyForm.logoText"
          label="Logo 文字"
          placeholder="例如：DREAM"
          maxlength="10"
          show-word-limit
        />
      </div>

      <!-- 步骤 3: 团队组建 -->
      <div v-if="currentStep === 2" class="step-content">
        <h2 class="step-title">组建初始团队</h2>
        <p class="team-desc">你的初始团队成员已经准备就绪！</p>
        <div class="team-list">
          <van-card
            v-for="member in defaultTeam"
            :key="member.id"
            :title="member.name"
            :desc="member.role"
            class="member-card"
          >
            <template #thumb>
              <div class="member-avatar">{{ member.avatar }}</div>
            </template>
            <template #tags>
              <van-tag
                v-for="skill in member.skills"
                :key="skill"
                plain
                size="mini"
                class="skill-tag"
              >
                {{ skill }}
              </van-tag>
            </template>
          </van-card>
        </div>
      </div>

      <!-- 导航按钮 -->
      <div class="step-actions">
        <van-button
          v-if="currentStep > 0"
          plain
          round
          @click="currentStep--"
        >
          上一步
        </van-button>
        <van-button
          v-if="currentStep < 2"
          type="primary"
          round
          color="linear-gradient(to right, #FF69B4, #FFB6C1)"
          @click="nextStep"
        >
          下一步
        </van-button>
        <van-button
          v-else
          type="primary"
          round
          color="linear-gradient(to right, #FF69B4, #FFB6C1)"
          @click="createCompany"
        >
          创立公司
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useCompanyStore } from '@/stores/companyStore';
import { showToast } from 'vant';
import { useRouter } from 'vue-router';

const router = useRouter();
const companyStore = useCompanyStore();

const currentStep = ref(0);

const companyForm = reactive({
  name: '',
  logoEmoji: '🎮',
  logoText: ''
});

const suggestedNames = [
  '梦想工作室',
  '心动游戏',
  '樱花社',
  '恋爱物语',
  '甜蜜制作组',
  '浪漫工坊'
];

const commonEmojis = ['🎮', '🌸', '💕', '✨', '🎨', '💎', '🌟', '💖', '🎭', '🌈'];

const defaultTeam = [
  {
    id: '1',
    name: '小明',
    role: '策划',
    avatar: '👨‍💼',
    skills: ['剧情设计', '活动策划']
  },
  {
    id: '2',
    name: '小红',
    role: '美术',
    avatar: '👩‍🎨',
    skills: ['角色设计', '场景绘制']
  },
  {
    id: '3',
    name: '小华',
    role: '程序',
    avatar: '👨‍💻',
    skills: ['前端开发', 'Bug修复']
  }
];

function nextStep() {
  if (currentStep.value === 0 && !companyForm.name.trim()) {
    showToast('请输入公司名称');
    return;
  }
  if (currentStep.value === 1 && !companyForm.logoText.trim()) {
    companyForm.logoText = companyForm.name;
  }
  currentStep.value++;
}

function createCompany() {
  if (!companyForm.name.trim()) {
    showToast('请输入公司名称');
    return;
  }

  companyStore.createCompany(
    companyForm.name,
    companyForm.logoEmoji,
    companyForm.logoText || companyForm.name
  );

  showToast('公司创立成功！');
  router.push('/');
}
</script>

<style scoped lang="scss">
.company-setup-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  padding: 20px;
  padding-bottom: 80px;
}

.setup-container {
  max-width: 500px;
  margin: 0 auto;
}

.setup-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 8px;
}

.setup-subtitle {
  font-size: 14px;
  color: #999;
  text-align: center;
  margin-bottom: 32px;
}

.setup-steps {
  margin-bottom: 32px;
}

.step-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.step-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.name-suggestions {
  margin-top: 20px;

  .suggestion-label {
    font-size: 12px;
    color: #999;
    margin-bottom: 8px;
  }

  .suggestion-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .suggestion-tag {
    cursor: pointer;
  }
}

.logo-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;

  .logo-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px 48px;
    background: linear-gradient(135deg, #FFB6C1, #FF69B4);
    border-radius: 16px;

    .logo-emoji {
      font-size: 48px;
    }

    .logo-text {
      font-size: 18px;
      font-weight: bold;
      color: white;
    }
  }
}

.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;

  .emoji-option {
    font-size: 24px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.2);
    }
  }
}

.team-desc {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 16px;
}

.team-list {
  .member-card {
    margin-bottom: 12px;
    background: #f9f9f9;
    border-radius: 12px;

    :deep(.van-card__thumb) {
      width: 60px;
      height: 60px;
      margin-right: 12px;
    }
  }

  .member-avatar {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #FFB6C1, #FF69B4);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  .skill-tag {
    margin-right: 4px;
  }
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
