<template>
  <div class="profile-view">
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
      </div>
    </div>

    <CreatorProfile
      :growth="creatorStore.growth"
      @upgrade-skill="handleUpgradeSkill"
    />

    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value">{{ creatorStore.growth.stats.gamesCreated }}</div>
        <div class="stat-label">创建游戏</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ formatNumber(creatorStore.growth.stats.totalPlayers) }}</div>
        <div class="stat-label">总人气</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ pointsStore.balance }}</div>
        <div class="stat-label">积分</div>
      </div>
    </div>

    <SignInCalendar />

    <AchievementWall />

    <TitleSelector />

    <PlayerSegments
      v-if="communityStore.communityData"
      :community="communityStore.communityData"
      :strategies="communityStore.getAllStrategies()"
    />

    <van-cell-group inset class="menu-list">
      <van-cell title="玩家社区分析" is-link to="/admin">
        <template #icon>
          <van-icon name="chart-trending-o" class="menu-icon" color="#722ed1" />
        </template>
      </van-cell>
      
      <van-cell title="积分商城" is-link to="/points">
        <template #icon>
          <van-icon name="gem-o" class="menu-icon" color="#FFD700" />
        </template>
      </van-cell>
      
      <van-cell title="成就系统" is-link to="/achievements">
        <template #icon>
          <van-icon name="medal-o" class="menu-icon" color="#FF6B6B" />
        </template>
      </van-cell>
      
      <van-cell title="团队管理" is-link to="/team-management">
        <template #icon>
          <van-icon name="friends-o" class="menu-icon" color="#1989fa" />
        </template>
      </van-cell>
      
      <van-cell title="招聘员工" is-link to="/recruit">
        <template #icon>
          <van-icon name="user-add-o" class="menu-icon" color="#07c160" />
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
      </van-cell>
      
      <van-cell title="关于我们" is-link to="/about">
        <template #icon>
          <van-icon name="info-o" class="menu-icon" color="#1989fa" />
        </template>
      </van-cell>
    </van-cell-group>

    <div class="version-info">
      <p>乙女游戏创作者模拟器 v1.0.0</p>
      <p>Made with 💕 for 乙游玩家</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { usePointsStore } from '@/stores/points';
import { useCommunityStore } from '@/stores/communityStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCreatorGrowthStore } from '@/stores/creatorGrowth';
import { useCompanyStore } from '@/stores/companyStore';
import type { SkillType } from '@/types/creatorGrowth';
import SignInCalendar from '@/components/signin/SignInCalendar.vue';
import AchievementWall from '@/components/achievement/AchievementWall.vue';
import TitleSelector from '@/components/achievement/TitleSelector.vue';
import PlayerSegments from '@/components/community/PlayerSegments.vue';
import CreatorProfile from '@/components/creator/CreatorProfile.vue';
import { showToast } from 'vant';

const pointsStore = usePointsStore();
const communityStore = useCommunityStore();
const playerStore = usePlayerStore();
const creatorStore = useCreatorGrowthStore();
const companyStore = useCompanyStore();
const currentTitle = computed(() => pointsStore.currentTitle);

function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

async function handleUpgradeSkill(type: SkillType) {
  const skillPoints = creatorStore.availableSkillPoints;
  
  if (skillPoints <= 0) {
    showToast('技能点不足，升级创作者等级可获得技能点');
    return;
  }
  
  const result = await pointsStore.spendPoints(100, '技能升级');
  
  if (result.success) {
    const upgradeResult = creatorStore.upgradeSkill(type);
    if (upgradeResult.success) {
      showToast(`${upgradeResult.message}，消耗 100 积分`);
    } else {
      showToast(upgradeResult.message);
      await pointsStore.spendPoints(-100, '技能升级失败返还');
    }
  } else {
    showToast('积分不足，需要 100 积分');
  }
}

onMounted(() => {
  // 初始化社区数据
  communityStore.initializeCommunity();
  
  // 从 playerStore 同步数据
  if (playerStore.players.length > 0) {
    communityStore.updateFromPlayers(playerStore.players);
  }
});
</script>

<style scoped lang="scss">
.profile-view {
  padding: 16px;
  padding-bottom: 80px;
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
  margin: 0;
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

.menu-list {
  margin-bottom: 16px;
  
  .menu-icon {
    margin-right: 8px;
    font-size: 20px;
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
</style>
