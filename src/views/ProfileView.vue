<template>
  <div class="profile-view">
    <!-- 用户卡片 -->
    <div class="user-card">
      <div class="avatar">
        <van-icon name="user-circle-o" size="64" color="#FF69B4" />
      </div>
      <div class="user-info">
        <div class="title-badge" v-if="currentTitle">
          <span class="title-icon">{{ currentTitle.icon }}</span>
          <span class="title-name">{{ currentTitle.name }}</span>
        </div>
        <h3 class="username">游戏创作者</h3>
        <p class="user-id">ID: 88888888</p>
        <div class="creator-level" v-if="creatorStore.growth.level > 1">
          <van-tag color="#FF69B4" round size="small">
            Lv.{{ creatorStore.growth.level }} 创作者
          </van-tag>
        </div>
      </div>
    </div>

    <!-- 核心数据概览 -->
    <div class="stats-grid">
      <div class="stat-item" @click="goToCreatorCenter">
        <div class="stat-value">{{ creatorStore.growth.stats.gamesCreated }}</div>
        <div class="stat-label">创建游戏</div>
      </div>
      <div class="stat-item" @click="goToCreatorCenter">
        <div class="stat-value">{{ formatNumber(creatorStore.growth.stats.totalPlayers) }}</div>
        <div class="stat-label">总人气</div>
      </div>
      <div class="stat-item" @click="goToPointsShop">
        <div class="stat-value">{{ pointsStore.balance }}</div>
        <div class="stat-label">积分</div>
      </div>
    </div>

    <!-- 快捷签到（可折叠） -->
    <div class="signin-section">
      <div class="signin-header" @click="toggleSignInCalendar">
        <div class="signin-info">
          <van-icon name="calendar-o" size="20" color="#FF69B4" />
          <span class="signin-title">每日签到</span>
          <van-tag v-if="pointsStore.checkedInToday" type="success" round size="small">已签到</van-tag>
          <van-tag v-else color="#FF69B4" round size="small">未签到</van-tag>
        </div>
        <div class="signin-meta">
          <span class="consecutive-days">连续 {{ pointsStore.consecutiveSignInDays }} 天</span>
          <van-icon :name="isSignInExpanded ? 'arrow-up' : 'arrow-down'" color="#999" />
        </div>
      </div>
      
      <!-- 折叠时显示快速签到按钮 -->
      <div v-if="!isSignInExpanded && !pointsStore.checkedInToday" class="quick-signin">
        <van-button 
          type="primary" 
          size="small" 
          round 
          block
          color="linear-gradient(135deg, #FF69B4, #FF1493)"
          @click="handleQuickSignIn"
        >
          立即签到
        </van-button>
      </div>
      
      <!-- 展开时显示完整日历 -->
      <SignInCalendar v-if="isSignInExpanded" :embedded="true" @signin-success="onSignInSuccess" />
    </div>

    <!-- 功能菜单（精简版 - 仅3项） -->
    <van-cell-group inset class="menu-list">
      <van-cell title="创作者中心" is-link @click="goToCreatorCenter">
        <template #icon>
          <van-icon name="user-o" class="menu-icon" color="#FF69B4" />
        </template>
        <template #label>
          <span class="cell-label">技能树、成就墙、称号管理</span>
        </template>
      </van-cell>
      
      <van-cell title="积分商城" is-link to="/points">
        <template #icon>
          <van-icon name="gem-o" class="menu-icon" color="#FFD700" />
        </template>
        <template #label>
          <span class="cell-label">当前积分: {{ pointsStore.balance }}</span>
        </template>
      </van-cell>
      
      <van-cell 
        v-if="!companyStore.hasCompany" 
        title="创建新公司" 
        is-link 
        to="/company-setup"
      >
        <template #icon>
          <van-icon name="add-o" class="menu-icon" color="#07c160" />
        </template>
        <template #label>
          <span class="cell-label">重新开始，创建新的游戏公司</span>
        </template>
      </van-cell>
    </van-cell-group>

    <div class="version-info">
      <p>乙女游戏创作者模拟器 v1.0.0</p>
      <p>Made with 💕 for 乙游玩家</p>
    </div>

    <!-- 签到奖励弹窗 -->
    <van-popup v-model:show="showRewardPopup" round :style="{ padding: '24px', width: '80%', maxWidth: '320px' }">
      <div class="reward-popup">
        <div class="reward-icon">🎉</div>
        <h4 class="reward-title">签到成功！</h4>
        <p class="reward-desc">
          连续签到第 <strong>{{ rewardInfo?.consecutiveDays }}</strong> 天
        </p>
        <div class="reward-items">
          <div class="reward-item">
            <span class="item-icon">💰</span>
            <span class="item-value">+{{ rewardInfo?.reward?.points }} 积分</span>
          </div>
          <div v-if="rewardInfo?.reward?.gift" class="reward-item special">
            <span class="item-icon">🎁</span>
            <span class="item-value">神秘礼物</span>
          </div>
        </div>
        <van-button type="primary" block @click="showRewardPopup = false">
          太棒了！
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePointsStore, type SignInReward } from '@/stores/points';
import { useCreatorGrowthStore } from '@/stores/creatorGrowth';
import { useCompanyStore } from '@/stores/companyStore';
import SignInCalendar from '@/components/signin/SignInCalendar.vue';
import { showToast } from 'vant';

const router = useRouter();
const pointsStore = usePointsStore();
const creatorStore = useCreatorGrowthStore();
const companyStore = useCompanyStore();

const currentTitle = computed(() => pointsStore.currentTitle);

// 签到日历展开状态
const isSignInExpanded = ref(false);

// 签到奖励弹窗
const showRewardPopup = ref(false);
const rewardInfo = ref<{
  consecutiveDays: number;
  reward: { points: number; gift?: boolean };
} | null>(null);

// 切换签到日历展开状态
function toggleSignInCalendar() {
  isSignInExpanded.value = !isSignInExpanded.value;
}

// 快速签到
async function handleQuickSignIn() {
  const result = await pointsStore.checkIn();
  
  if (result.success) {
    rewardInfo.value = {
      consecutiveDays: pointsStore.consecutiveSignInDays,
      reward: result.reward || { points: 10 }
    };
    showRewardPopup.value = true;
  } else {
    showToast(result.message);
  }
}

// 签到成功回调
function onSignInSuccess(result: { consecutiveDays: number; reward: SignInReward }) {
  rewardInfo.value = result;
  showRewardPopup.value = true;
  isSignInExpanded.value = false;
}

// 跳转到创作者中心
function goToCreatorCenter() {
  router.push('/creator-center');
}

// 跳转到积分商城
function goToPointsShop() {
  router.push('/points');
}

function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}
</script>

<style scoped lang="scss">
.profile-view {
  padding: 16px;
  padding-bottom: 80px;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
}

.user-card {
  background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
}

.avatar {
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  color: white;
  flex: 1;
}

.title-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.3);
  padding: 4px 10px;
  border-radius: 12px;
  margin-bottom: 6px;
}

.title-icon {
  font-size: 12px;
}

.title-name {
  font-size: 12px;
  font-weight: bold;
}

.username {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
}

.user-id {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 4px 0;
}

.creator-level {
  margin-top: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #FF69B4;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 12px;
    color: #999;
  }
}

.signin-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.signin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.signin-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.signin-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.signin-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.consecutive-days {
  font-size: 13px;
  color: #FF69B4;
  font-weight: 500;
}

.quick-signin {
  padding-top: 12px;
}

.menu-list {
  margin-bottom: 16px;
  
  .menu-icon {
    margin-right: 8px;
    font-size: 20px;
  }
  
  .cell-label {
    font-size: 12px;
    color: #999;
  }
}

.version-info {
  text-align: center;
  padding: 24px;
  
  p {
    font-size: 12px;
    color: #999;
    margin: 4px 0;
  }
}

.reward-popup {
  text-align: center;
}

.reward-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.reward-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px;
}

.reward-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px;

  strong {
    color: #FF69B4;
    font-size: 18px;
  }
}

.reward-items {
  margin-bottom: 20px;
}

.reward-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 8px;

  &.special {
    background: linear-gradient(135deg, #FFF9E6, #FFECB3);
  }
}

.item-icon {
  font-size: 20px;
}

.item-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
</style>
