<template>
  <div class="character-ranking">
    <BackButton title="角色价值排行榜" />

    <div class="ranking-content">
      <!-- 排序选项 -->
      <div class="sort-section">
        <div class="sort-label">排序方式</div>
        <div class="sort-options">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            class="sort-btn"
            :class="{ active: currentSort === option.value }"
            @click="currentSort = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- 统计概览 -->
      <div class="stats-overview">
        <div class="stat-box">
          <div class="stat-value">{{ totalCharacters }}</div>
          <div class="stat-label">总角色数</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ ssrCount }}</div>
          <div class="stat-label">SSR角色</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ avgValue }}</div>
          <div class="stat-label">平均价值</div>
        </div>
      </div>

      <!-- 角色列表 -->
      <div class="ranking-list">
        <div
          v-for="(item, index) in sortedCharacters"
          :key="item.character.id"
          class="ranking-item"
          @click="viewCharacter(item.character.id)"
        >
          <div class="rank-number" :class="getRankClass(index)">
            {{ index + 1 }}
          </div>
          <CharacterValueCard
            :character="item.character"
            :metrics="item.metrics"
            @click="viewCharacter(item.character.id)"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <van-empty v-if="sortedCharacters.length === 0" description="暂无角色数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import BackButton from '@/components/common/BackButton.vue';
import CharacterValueCard from '@/components/character/CharacterValueCard.vue';
import { calculationEngine } from '@/engine';
import type { CharacterValue } from '@/engine/calculationEngine';
import type { Character } from '@/types/character';

const router = useRouter();
const projectStore = useProjectStore();

// 排序选项
const sortOptions = [
  { label: '综合', value: 'overall' },
  { label: '人气', value: 'popularity' },
  { label: '商业', value: 'commercial' },
  { label: 'CP', value: 'cp' }
];

const currentSort = ref('overall');

// 获取所有角色
const allCharacters = computed(() => {
  const characters: { character: Character; metrics: any; value: CharacterValue }[] = [];
  
  projectStore.projects.forEach(project => {
    project.characters.forEach(character => {
      // 模拟一些指标数据
      const metrics = {
        plotExposure: Math.floor(Math.random() * 100),
        gachaExposure: Math.floor(Math.random() * 100),
        socialMentions: Math.floor(Math.random() * 100),
        playerInteractions: Math.floor(Math.random() * 100)
      };
      
      const value = calculationEngine.calculateCharacterValue(character, {
        baseScore: 30,
        ...metrics
      });
      
      characters.push({ character, metrics, value });
    });
  });
  
  return characters;
});

// 排序后的角色
const sortedCharacters = computed(() => {
  const sorted = [...allCharacters.value];
  
  switch (currentSort.value) {
    case 'popularity':
      sorted.sort((a, b) => b.value.popularity - a.value.popularity);
      break;
    case 'commercial':
      sorted.sort((a, b) => b.value.commercialValue - a.value.commercialValue);
      break;
    case 'cp':
      sorted.sort((a, b) => b.value.cpValue - a.value.cpValue);
      break;
    case 'overall':
    default:
      sorted.sort((a, b) => b.value.overall - a.value.overall);
  }
  
  return sorted;
});

// 统计数据
const totalCharacters = computed(() => allCharacters.value.length);

const ssrCount = computed(() => {
  return allCharacters.value.filter(item => item.value.overall >= 80).length;
});

const avgValue = computed(() => {
  if (allCharacters.value.length === 0) return 0;
  const total = allCharacters.value.reduce((sum, item) => sum + item.value.overall, 0);
  return Math.round(total / allCharacters.value.length);
});

// 获取排名样式
function getRankClass(index: number): string {
  if (index === 0) return 'rank-1';
  if (index === 1) return 'rank-2';
  if (index === 2) return 'rank-3';
  return '';
}

// 查看角色详情
async function viewCharacter(characterId: string) {
  // 找到角色所在的项目
  for (const project of projectStore.projects) {
    const character = project.characters.find(c => c.id === characterId);
    if (character) {
      try {
        await router.push(`/game/${project.id}/character/${characterId}`);
      } catch (error) {
        console.error('导航失败:', error);
        showToast('页面跳转失败');
      }
      return;
    }
  }
}
</script>

<style scoped>
.character-ranking {
  min-height: 100vh;
  background: #f5f5f5;
}

.ranking-content {
  padding: 16px;
}

/* 排序选项 */
.sort-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.sort-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.sort-options {
  display: flex;
  gap: 8px;
}

.sort-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.sort-btn.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.stat-box {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

/* 排名列表 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.rank-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
  margin-top: 16px;
}

.rank-number.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4a 100%);
  color: #8b6914;
}

.rank-number.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #666;
}

.rank-number.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #daa520 100%);
  color: white;
}

.ranking-item :deep(.character-value-card) {
  flex: 1;
  margin-bottom: 0;
}
</style>
