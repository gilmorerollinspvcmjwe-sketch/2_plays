<template>
  <div class="creator-profile">
    <!-- 创作者卡片 -->
    <div class="creator-card">
      <div class="creator-avatar" :style="{ background: levelConfig.color }">
        <van-icon :name="levelConfig.icon" size="48" />
      </div>
      <div class="creator-info">
        <h3 class="creator-name">创作者</h3>
        <div class="creator-level">
          <van-tag :color="levelConfig.color" round size="large">
            Lv.{{ growth.level }} {{ levelConfig.name }}
          </van-tag>
        </div>
        <p class="creator-title">{{ levelConfig.title }}</p>
      </div>
    </div>

    <!-- 等级进度 -->
    <div class="level-progress-section">
      <div class="progress-header">
        <span class="label">等级进度</span>
        <span class="value">{{ Math.round(levelProgress) }}%</span>
      </div>
      <van-progress
        :percentage="levelProgress"
        :color="levelConfig.color"
        stroke-width="10"
        :show-pivot="false"
      />
      <div class="exp-info">
        <span>{{ growth.totalExperience }} / {{ nextLevelExp }} EXP</span>
      </div>
    </div>

    <!-- 创作者统计 -->
    <div class="stats-section">
      <h4 class="section-title">创作统计</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <van-icon name="apps-o" size="24" />
          <span class="value">{{ growth.stats.gamesCreated }}</span>
          <span class="label">游戏作品</span>
        </div>
        <div class="stat-item">
          <van-icon name="gold-coin-o" size="24" />
          <span class="value">{{ formatNumber(growth.stats.totalRevenue) }}</span>
          <span class="label">累计收入</span>
        </div>
        <div class="stat-item">
          <van-icon name="friends-o" size="24" />
          <span class="value">{{ formatNumber(growth.stats.totalPlayers) }}</span>
          <span class="label">服务玩家</span>
        </div>
        <div class="stat-item">
          <van-icon name="shield-o" size="24" />
          <span class="value">{{ growth.stats.crisesResolved }}</span>
          <span class="label">化解危机</span>
        </div>
      </div>
    </div>

    <!-- 技能树 -->
    <div class="skills-section">
      <h4 class="section-title">
        技能树
        <span class="skill-points">可用技能点: {{ availableSkillPoints }}</span>
      </h4>
      <div class="skills-grid">
        <div
          v-for="skill in skillsWithConfig"
          :key="skill.type"
          class="skill-card"
          :class="{ maxed: skill.level >= skill.maxLevel }"
          @click="showSkillDetail(skill)"
        >
          <div class="skill-icon" :style="{ background: skill.color }">
            <van-icon :name="skill.icon" size="24" />
          </div>
          <div class="skill-info">
            <span class="name">{{ skill.name }}</span>
            <span class="level">Lv.{{ skill.level }}/{{ skill.maxLevel }}</span>
          </div>
          <van-progress
            :percentage="(skill.level / skill.maxLevel) * 100"
            :color="skill.color"
            stroke-width="4"
            :show-pivot="false"
          />
        </div>
      </div>
    </div>

    <!-- 成就墙 -->
    <div class="achievements-section">
      <h4 class="section-title">
        成就墙
        <van-tag color="#FFD700" round>{{ unlockedAchievements.length }}/{{ totalAchievements }}</van-tag>
      </h4>
      <div class="achievements-grid">
        <div
          v-for="achievement in achievementsWithConfig"
          :key="achievement.type"
          class="achievement-item"
          :class="{ unlocked: achievement.unlocked, locked: !achievement.unlocked }"
          @click="showAchievementDetail(achievement)"
        >
          <div class="achievement-icon" :style="{ background: achievement.unlocked ? achievement.color : '#ccc' }">
            <van-icon :name="achievement.icon" size="24" />
          </div>
          <span class="name">{{ achievement.name }}</span>
          <div v-if="!achievement.unlocked" class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: (achievement.progress / achievement.requirement.value * 100) + '%' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 解锁内容 -->
    <div class="unlocks-section">
      <h4 class="section-title">已解锁功能</h4>
      <div class="unlocks-list">
        <div v-for="(unlock, index) in unlockedFeatures" :key="index" class="unlock-item">
          <van-icon name="success" color="#52c41a" />
          <span>{{ unlock }}</span>
        </div>
      </div>
    </div>

    <!-- 技能详情弹窗 -->
    <van-popup v-model:show="showSkillPopup" round class="skill-popup">
      <div v-if="selectedSkill" class="skill-detail">
        <div class="detail-header" :style="{ background: selectedSkill.color }">
          <van-icon :name="selectedSkill.icon" size="48" />
          <h3>{{ selectedSkill.name }}</h3>
          <p>当前等级: Lv.{{ selectedSkill.level }}/{{ selectedSkill.maxLevel }}</p>
        </div>
        <div class="detail-content">
          <p class="description">{{ selectedSkill.description }}</p>
          <div class="effects-list">
            <h4>当前效果</h4>
            <div v-for="(effect, index) in selectedSkill.effects" :key="index" class="effect-item">
              <van-icon name="arrow" />
              {{ effect.description }}
            </div>
          </div>
          <div v-if="selectedSkill.level < selectedSkill.maxLevel && availableSkillPoints > 0" class="upgrade-section">
            <van-button
              round
              block
              type="primary"
              :color="selectedSkill.color"
              @click="upgradeSkill(selectedSkill.type)"
            >
              升级技能 (消耗1技能点)
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 成就详情弹窗 -->
    <van-popup v-model:show="showAchievementPopup" round class="achievement-popup">
      <div v-if="selectedAchievement" class="achievement-detail">
        <div class="detail-header" :style="{ background: selectedAchievement.color }">
          <van-icon :name="selectedAchievement.icon" size="48" />
          <h3>{{ selectedAchievement.name }}</h3>
          <van-tag v-if="selectedAchievement.unlocked" color="#52c41a">已解锁</van-tag>
          <van-tag v-else type="default">未解锁</van-tag>
        </div>
        <div class="detail-content">
          <p class="description">{{ selectedAchievement.description }}</p>
          <div class="requirement">
            <h4>解锁条件</h4>
            <p>{{ selectedAchievement.requirement.description }}</p>
            <div v-if="!selectedAchievement.unlocked" class="progress">
              <span>进度: {{ selectedAchievement.progress }} / {{ selectedAchievement.requirement.value }}</span>
              <van-progress
                :percentage="(selectedAchievement.progress / selectedAchievement.requirement.value) * 100"
                :color="selectedAchievement.color"
              />
            </div>
          </div>
          <div class="reward">
            <h4>奖励</h4>
            <p>
              <van-icon name="gem-o" />
              {{ selectedAchievement.reward.exp }} 经验值
            </p>
            <p v-if="selectedAchievement.reward.title">
              <van-icon name="medal-o" />
              称号: {{ selectedAchievement.reward.title }}
            </p>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { CreatorGrowth, SkillType, AchievementType } from '@/types/creatorGrowth';
import {
  CREATOR_LEVELS,
  SKILL_CONFIGS,
  ACHIEVEMENT_CONFIGS,
  getLevelProgress,
  upgradeSkill as upgradeSkillFn
} from '@/types/creatorGrowth';
import { showToast } from 'vant';

const props = defineProps<{
  growth: CreatorGrowth;
}>();

const emit = defineEmits<{
  (e: 'upgrade-skill', type: SkillType): void;
}>();

const showSkillPopup = ref(false);
const showAchievementPopup = ref(false);
const selectedSkill = ref<any>(null);
const selectedAchievement = ref<any>(null);

const levelConfig = computed(() => {
  return CREATOR_LEVELS[props.growth.level - 1];
});

const levelProgress = computed(() => {
  return getLevelProgress(props.growth);
});

const nextLevelExp = computed(() => {
  if (props.growth.level >= 5) return props.growth.totalExperience;
  return CREATOR_LEVELS[props.growth.level].expRequired;
});

const availableSkillPoints = computed(() => {
  // 简化计算：每升一级获得2个技能点
  const totalPoints = (props.growth.level - 1) * 2;
  const usedPoints = props.growth.skills.reduce((sum, s) => sum + s.level, 0);
  return Math.max(0, totalPoints - usedPoints);
});

const skillsWithConfig = computed(() => {
  return props.growth.skills.map(skill => {
    const config = SKILL_CONFIGS.find(c => c.type === skill.type);
    const effects = [];
    
    // 获取当前等级的效果
    for (let i = 1; i <= skill.level; i++) {
      const levelEffects = skill.type === 'planning' ? [
        { description: '剧情质量+' + (i * 3) + '%' }
      ] : skill.type === 'art' ? [
        { description: '美术质量+' + (i * 3) + '%' }
      ] : skill.type === 'operation' ? [
        { description: '活动效果+' + (i * 3) + '%' }
      ] : [
        { description: '市场预测+' + (i * 3) + '%' }
      ];
      effects.push(...levelEffects);
    }
    
    return {
      ...skill,
      ...config,
      effects: effects.slice(0, 3) // 只显示前3个效果
    };
  });
});

const achievementsWithConfig = computed(() => {
  return ACHIEVEMENT_CONFIGS.map(config => {
    const unlocked = props.growth.achievements.find(a => a.type === config.type);
    
    let progress = 0;
    switch (config.type) {
      case 'first_game':
        progress = props.growth.stats.gamesCreated;
        break;
      case 'comeback':
        progress = props.growth.stats.comebackCount;
        break;
      case 'hit_maker':
        progress = props.growth.stats.consecutiveSRating;
        break;
      case 'player_friend':
        progress = props.growth.stats.goodOfficialCount;
        break;
      case 'crisis_master':
        progress = props.growth.stats.crisesResolved;
        break;
      case 'bond_master':
        progress = props.growth.stats.maxBondCount;
        break;
      case 'rich_creator':
        progress = props.growth.stats.totalRevenue;
        break;
      case 'perfectionist':
        progress = 0;
        break;
    }
    
    return {
      ...config,
      unlocked: !!unlocked,
      progress: Math.min(progress, config.requirement.value),
      unlockedAt: unlocked?.unlockedAt
    };
  });
});

const unlockedAchievements = computed(() => {
  return achievementsWithConfig.value.filter(a => a.unlocked);
});

const totalAchievements = computed(() => {
  return ACHIEVEMENT_CONFIGS.length;
});

const unlockedFeatures = computed(() => {
  const features: string[] = [];
  for (let i = 0; i < props.growth.level; i++) {
    features.push(...CREATOR_LEVELS[i].unlocks);
  }
  return features;
});

function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function showSkillDetail(skill: any) {
  selectedSkill.value = skill;
  showSkillPopup.value = true;
}

function showAchievementDetail(achievement: any) {
  selectedAchievement.value = achievement;
  showAchievementPopup.value = true;
}

function upgradeSkill(type: SkillType) {
  const result = upgradeSkillFn(props.growth, type);
  if (result.success) {
    emit('upgrade-skill', type);
    showToast(result.message);
    showSkillPopup.value = false;
  } else {
    showToast(result.message);
  }
}
</script>

<style scoped lang="scss">
.creator-profile {
  padding: 16px;
}

.creator-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  
  .creator-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  .creator-info {
    flex: 1;
    
    .creator-name {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: #333;
    }
    
    .creator-level {
      margin-bottom: 4px;
    }
    
    .creator-title {
      margin: 0;
      font-size: 14px;
      color: #999;
    }
  }
}

.level-progress-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .label {
      font-size: 14px;
      color: #666;
    }
    
    .value {
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }
  }
  
  .exp-info {
    text-align: center;
    margin-top: 8px;
    font-size: 12px;
    color: #999;
  }
}

.stats-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  .section-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #333;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 4px;
    background: #f9f9f9;
    border-radius: 8px;
    
    .value {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    
    .label {
      font-size: 11px;
      color: #999;
    }
  }
}

.skills-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  .section-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .skill-points {
      font-size: 13px;
      color: #FF69B4;
      font-weight: normal;
    }
  }
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.skill-card {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.maxed {
    background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E8 100%);
  }
  
  .skill-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 8px;
  }
  
  .skill-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .name {
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }
    
    .level {
      font-size: 12px;
      color: #999;
    }
  }
}

.achievements-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  .section-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.achievement-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 4px;
  background: #f9f9f9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.locked {
    opacity: 0.6;
  }
  
  &.unlocked {
    background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E8 100%);
  }
  
  .achievement-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  .name {
    font-size: 11px;
    color: #666;
    text-align: center;
  }
  
  .progress-bar {
    width: 100%;
    height: 3px;
    background: #e8e8e8;
    border-radius: 2px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: #FF69B4;
      border-radius: 2px;
      transition: width 0.3s ease;
    }
  }
}

.unlocks-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  .section-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #333;
  }
}

.unlocks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .unlock-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #f6ffed;
    border-radius: 8px;
    font-size: 14px;
    color: #333;
  }
}

.skill-popup, .achievement-popup {
  .skill-detail, .achievement-detail {
    .detail-header {
      padding: 24px;
      text-align: center;
      color: white;
      
      h3 {
        margin: 12px 0 4px 0;
        font-size: 20px;
      }
      
      p {
        margin: 0;
        opacity: 0.9;
      }
    }
    
    .detail-content {
      padding: 20px;
      
      .description {
        margin: 0 0 16px 0;
        font-size: 14px;
        color: #666;
        line-height: 1.6;
      }
      
      .effects-list, .requirement, .reward {
        margin-bottom: 16px;
        
        h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #333;
        }
        
        .effect-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 14px;
          color: #666;
        }
        
        .progress {
          margin-top: 8px;
          
          span {
            display: block;
            font-size: 12px;
            color: #999;
            margin-bottom: 4px;
          }
        }
        
        p {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 4px 0;
          font-size: 14px;
          color: #666;
        }
      }
      
      .upgrade-section {
        margin-top: 20px;
      }
    }
  }
}
</style>