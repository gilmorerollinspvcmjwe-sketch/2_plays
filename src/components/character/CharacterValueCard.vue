<template>
  <div class="character-value-card" @click="handleClick">
    <div class="character-header">
      <div class="character-avatar-wrapper">
        <img
          v-if="character.avatar"
          :src="character.avatar"
          class="character-avatar"
          alt="角色头像"
        />
        <div v-else class="character-avatar placeholder">
          <van-icon name="user-o" />
        </div>
        <div class="value-rank" :class="valueRankClass">
          {{ valueRank }}
        </div>
      </div>
      <div class="character-info">
        <div class="character-name">{{ character.name }}</div>
        <div class="character-category">{{ categoryName }}</div>
        <div class="overall-value">
          <span class="value-label">综合价值</span>
          <span class="value-score" :style="{ color: valueColor }">
            {{ characterValue.overall }}
          </span>
          <span class="value-total">/100</span>
        </div>
      </div>
    </div>

    <!-- 价值雷达图/条形图 -->
    <div class="value-details">
      <div class="value-item">
        <div class="item-label">
          <van-icon name="fire-o" />
          人气
        </div>
        <div class="item-bar">
          <div
            class="item-progress"
            :style="{ width: characterValue.popularity + '%' }"
          ></div>
        </div>
        <div class="item-score">{{ characterValue.popularity }}</div>
      </div>
      <div class="value-item">
        <div class="item-label">
          <van-icon name="gold-coin-o" />
          商业价值
        </div>
        <div class="item-bar">
          <div
            class="item-progress commercial"
            :style="{ width: characterValue.commercialValue + '%' }"
          ></div>
        </div>
        <div class="item-score">{{ characterValue.commercialValue }}</div>
      </div>
      <div class="value-item">
        <div class="item-label">
          <van-icon name="like-o" />
          CP价值
        </div>
        <div class="item-bar">
          <div
            class="item-progress cp"
            :style="{ width: characterValue.cpValue + '%' }"
          ></div>
        </div>
        <div class="item-score">{{ characterValue.cpValue }}</div>
      </div>
      <div class="value-item">
        <div class="item-label">
          <van-icon name="description" />
          剧情承载
        </div>
        <div class="item-bar">
          <div
            class="item-progress plot"
            :style="{ width: characterValue.plotCapacity + '%' }"
          ></div>
        </div>
        <div class="item-score">{{ characterValue.plotCapacity }}</div>
      </div>
    </div>

    <!-- 优化建议 -->
    <div v-if="hasSuggestions" class="suggestion-bar">
      <van-icon name="bulb-o" class="suggestion-icon" />
      <span class="suggestion-text">{{ firstSuggestion }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Character } from '@/types/character';
import { calculationEngine } from '@/engine';
import type { CharacterValue } from '@/engine/calculationEngine';

interface Props {
  character: Character;
  metrics?: {
    plotExposure: number;
    gachaExposure: number;
    socialMentions: number;
    playerInteractions: number;
  };
}

const props = withDefaults(defineProps<Props>(), {
  metrics: () => ({
    plotExposure: 50,
    gachaExposure: 30,
    socialMentions: 40,
    playerInteractions: 35
  })
});

const emit = defineEmits<{
  click: [characterId: string];
}>();

// 计算角色价值
const characterValue = computed<CharacterValue>(() => {
  try {
    return calculationEngine.calculateCharacterValue(props.character, {
      baseScore: 30,
      ...props.metrics
    });
  } catch (e) {
    console.error('角色价值计算失败:', e);
    return {
      popularity: 30,
      commercialValue: 30,
      cpValue: 30,
      plotCapacity: 30,
      overall: 30,
      suggestions: []
    };
  }
});

// 价值等级
const valueRank = computed(() => {
  const overall = characterValue.value.overall;
  if (overall >= 80) return 'SSR';
  if (overall >= 60) return 'SR';
  if (overall >= 40) return 'R';
  return 'N';
});

const valueRankClass = computed(() => {
  const overall = characterValue.value.overall;
  if (overall >= 80) return 'rank-ssr';
  if (overall >= 60) return 'rank-sr';
  if (overall >= 40) return 'rank-r';
  return 'rank-n';
});

// 价值颜色
const valueColor = computed(() => {
  const overall = characterValue.value.overall;
  if (overall >= 80) return '#ff6b6b';
  if (overall >= 60) return '#ffd93d';
  if (overall >= 40) return '#6bcf7f';
  return '#a0aec0';
});

// 角色类型名称
const categoryName = computed(() => {
  const categoryMap: Record<string, string> = {
    president: '霸道总裁',
    senior: '温柔学长',
    younger_brother: '年下弟弟',
    cold_god: '高冷男神',
    sunshine_sports: '阳光运动',
    mysterious_transfer: '神秘转学生',
    childhood_sweetheart: '青梅竹马',
    yandere_artist: '病娇艺术家'
  };
  return categoryMap[props.character.category] || props.character.category;
});

// 是否有建议
const hasSuggestions = computed(() => {
  return characterValue.value.suggestions.length > 0;
});

const firstSuggestion = computed(() => {
  if (characterValue.value.suggestions.length === 0) return '';
  return characterValue.value.suggestions[0];
});

function handleClick() {
  emit('click', props.character.id);
}
</script>

<style scoped>
.character-value-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.character-value-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.character-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.character-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.character-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.character-avatar.placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-avatar.placeholder .van-icon {
  font-size: 28px;
  color: white;
}

.value-rank {
  position: absolute;
  bottom: -4px;
  right: -4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.rank-ssr {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
}

.rank-sr {
  background: linear-gradient(135deg, #ffd93d 0%, #ffed4a 100%);
  color: #8b6914;
}

.rank-r {
  background: linear-gradient(135deg, #6bcf7f 0%, #8ce99a 100%);
}

.rank-n {
  background: linear-gradient(135deg, #a0aec0 0%, #cbd5e0 100%);
}

.character-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.character-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.character-category {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.overall-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.value-label {
  font-size: 12px;
  color: #666;
}

.value-score {
  font-size: 24px;
  font-weight: 700;
}

.value-total {
  font-size: 12px;
  color: #999;
}

.value-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.value-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-label {
  width: 70px;
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.item-label .van-icon {
  font-size: 14px;
  color: #999;
}

.item-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.item-progress {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b 0%, #ff8e8e 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.item-progress.commercial {
  background: linear-gradient(90deg, #ffd93d 0%, #ffed4a 100%);
}

.item-progress.cp {
  background: linear-gradient(90deg, #ff6b9d 0%, #ff8fab 100%);
}

.item-progress.plot {
  background: linear-gradient(90deg, #4ecdc4 0%, #6ee7df 100%);
}

.item-score {
  width: 30px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  text-align: right;
  flex-shrink: 0;
}

.suggestion-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 10px;
  background: #fff7e6;
  border-radius: 6px;
  font-size: 12px;
}

.suggestion-icon {
  color: #faad14;
  font-size: 14px;
  flex-shrink: 0;
}

.suggestion-text {
  color: #d48806;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
