<template>
  <div class="skill-tree">
    <div class="skill-intro">
      <h4>🎯 创作者技能</h4>
      <p>提升技能等级，增强游戏开发能力</p>
    </div>
    
    <div class="skills-list">
      <div 
        v-for="skill in creatorStore.growth.skills" 
        :key="skill.name"
        class="skill-card"
        :class="{ 'can-upgrade': canUpgradeSkill(skill) }"
        @click="handleSkillClick(skill)"
      >
        <div class="skill-header">
          <div class="skill-icon">{{ getSkillIcon(skill.name) }}</div>
          <div class="skill-info">
            <div class="skill-name">{{ skill.name }}</div>
            <div class="skill-level">Lv.{{ skill.level }}</div>
          </div>
          <van-tag 
            v-if="canUpgradeSkill(skill)" 
            type="primary" 
            size="small"
            color="#FF69B4"
          >
            可升级
          </van-tag>
        </div>
        
        <div class="skill-desc">{{ skill.description }}</div>
        
        <div class="skill-effect">
          <span class="effect-label">当前效果:</span>
          <span class="effect-value">{{ getSkillEffect(skill) }}</span>
        </div>
        
        <div class="skill-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (skill.level / 10 * 100) + '%' }"></div>
          </div>
          <span class="progress-text">{{ skill.level }}/10</span>
        </div>
      </div>
    </div>
    
    <div class="skill-points-info">
      <van-icon name="points" color="#FFD700" />
      <span>可用技能点: <strong>{{ creatorStore.growth.skillPoints }}</strong></span>
    </div>
    
    <!-- 技能升级弹窗 -->
    <van-dialog
      v-model:show="showUpgradeDialog"
      :title="selectedSkill?.name"
      show-cancel-button
      @confirm="confirmUpgrade"
    >
      <div class="upgrade-dialog-content">
        <p>{{ selectedSkill?.description }}</p>
        <div class="upgrade-info">
          <div class="current-level">
            <span>当前等级:</span>
            <strong>Lv.{{ selectedSkill?.level }}</strong>
          </div>
          <div class="next-level">
            <span>升级后:</span>
            <strong>Lv.{{ (selectedSkill?.level || 0) + 1 }}</strong>
          </div>
          <div class="effect-preview">
            <span>效果提升:</span>
            <strong>{{ getUpgradePreview(selectedSkill) }}</strong>
          </div>
        </div>
        <p class="upgrade-cost">
          <van-icon name="points" color="#FFD700" />
          消耗 1 技能点
        </p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCreatorGrowthStore, type CreatorSkill, SKILL_EFFECTS } from '@/stores/creatorGrowth';
import { showToast } from 'vant';

const creatorStore = useCreatorGrowthStore();

const showUpgradeDialog = ref(false);
const selectedSkill = ref<CreatorSkill | null>(null);

const skillIcons: Record<string, string> = {
  '文案功底': '✍️',
  '美术鉴赏': '🎨',
  '项目管理': '📊',
  '数据分析': '📈'
};

function getSkillIcon(name: string): string {
  return skillIcons[name] || '⭐';
}

function canUpgradeSkill(skill: CreatorSkill): boolean {
  return creatorStore.growth.skillPoints > 0 && skill.level < 10;
}

function getSkillEffect(skill: CreatorSkill): string {
  const effects = SKILL_EFFECTS[skill.id as keyof typeof SKILL_EFFECTS];
  if (!effects) return '暂无效果';
  
  // 根据技能类型返回对应的效果描述
  switch (skill.id) {
    case 'copywriting':
      return `剧情质量+${(effects.plotQualityBonus(skill.level) * 100).toFixed(0)}%`;
    case 'artAppreciation':
      return `角色人气+${(effects.characterPopularityBonus(skill.level) * 100).toFixed(0)}%`;
    case 'projectManagement':
      return `团队效率+${(effects.teamEfficiencyBonus(skill.level) * 100).toFixed(0)}%`;
    case 'dataAnalysis':
      return effects.unlockDeepAnalysis(skill.level) ? '已解锁深度分析' : '预测准确度提升';
    default:
      return '技能效果';
  }
}

function handleSkillClick(skill: CreatorSkill) {
  if (!canUpgradeSkill(skill)) {
    if (skill.level >= 10) {
      showToast('该技能已达到最高等级');
    } else {
      showToast('技能点不足，通过升级获得技能点');
    }
    return;
  }
  
  selectedSkill.value = skill;
  showUpgradeDialog.value = true;
}

function getUpgradePreview(skill: CreatorSkill | null): string {
  if (!skill) return '';
  const effects = SKILL_EFFECTS[skill.id as keyof typeof SKILL_EFFECTS];
  if (!effects) return '';
  
  const currentLevel = skill.level;
  const nextLevel = currentLevel + 1;
  
  switch (skill.id) {
    case 'copywriting':
      const currentPlot = (effects.plotQualityBonus(currentLevel) * 100).toFixed(0);
      const nextPlot = (effects.plotQualityBonus(nextLevel) * 100).toFixed(0);
      return `${currentPlot}% → ${nextPlot}%`;
    case 'artAppreciation':
      const currentPop = (effects.characterPopularityBonus(currentLevel) * 100).toFixed(0);
      const nextPop = (effects.characterPopularityBonus(nextLevel) * 100).toFixed(0);
      return `${currentPop}% → ${nextPop}%`;
    case 'projectManagement':
      const currentEff = (effects.teamEfficiencyBonus(currentLevel) * 100).toFixed(0);
      const nextEff = (effects.teamEfficiencyBonus(nextLevel) * 100).toFixed(0);
      return `${currentEff}% → ${nextEff}%`;
    default:
      return '效果增强';
  }
}

function confirmUpgrade() {
  if (!selectedSkill.value) return;
  
  const result = creatorStore.upgradeSkill(selectedSkill.value.id);
  
  if (result.success) {
    showToast(`升级成功！${selectedSkill.value.name} 达到 Lv.${selectedSkill.value.level + 1}`);
  } else {
    showToast(result.message);
  }
}
</script>

<style scoped lang="scss">
.skill-tree {
  padding: 0 0 16px;
}

.skill-intro {
  text-align: center;
  margin-bottom: 20px;
  
  h4 {
    font-size: 18px;
    color: #333;
    margin: 0 0 8px;
  }
  
  p {
    font-size: 14px;
    color: #999;
    margin: 0;
  }
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  
  &.can-upgrade {
    border: 1px solid #FF69B4;
    cursor: pointer;
    
    &:active {
      transform: scale(0.98);
    }
  }
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.skill-icon {
  font-size: 32px;
}

.skill-info {
  flex: 1;
}

.skill-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.skill-level {
  font-size: 14px;
  color: #FF69B4;
}

.skill-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.skill-effect {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #FFF5F7;
  border-radius: 8px;
  
  .effect-label {
    font-size: 12px;
    color: #999;
  }
  
  .effect-value {
    font-size: 13px;
    color: #FF69B4;
    font-weight: 500;
  }
}

.skill-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .progress-bar {
    flex: 1;
    height: 6px;
    background: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FFB6C1, #FF69B4);
    border-radius: 3px;
    transition: width 0.3s;
  }
  
  .progress-text {
    font-size: 12px;
    color: #999;
    min-width: 40px;
    text-align: right;
  }
}

.skill-points-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  font-size: 14px;
  color: #666;
  
  strong {
    color: #FF69B4;
    font-size: 18px;
  }
}

.upgrade-dialog-content {
  padding: 16px;
  
  p {
    font-size: 14px;
    color: #666;
    margin: 0 0 16px;
    line-height: 1.5;
  }
  
  .upgrade-info {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
    
    > div {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
        padding-top: 8px;
        border-top: 1px dashed #ddd;
      }
    }
    
    span {
      font-size: 13px;
      color: #999;
    }
    
    strong {
      font-size: 14px;
      color: #333;
    }
  }
  
  .upgrade-cost {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #FF69B4;
    font-weight: 500;
  }
}
</style>
