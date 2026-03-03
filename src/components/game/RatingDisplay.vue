<template>
  <div class="rating-display">
    <div class="rating-summary" @click="toggleExpand">
      <div class="rating-main">
        <div class="rating-score">
          <span class="score-value">{{ rating.overall.toFixed(1) }}</span>
          <div class="stars-container">
            <div class="stars">
              <span
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= Math.floor(rating.overall), half: i === Math.ceil(rating.overall) && rating.overall % 1 >= 0.5 }"
              >
                ★
              </span>
            </div>
          </div>
        </div>
        <div class="rating-grade" :style="{ backgroundColor: gradeColor }">
          {{ grade }}
        </div>
      </div>
      <van-icon :name="expanded ? 'arrow-up' : 'arrow-down'" class="expand-icon" />
    </div>

    <transition name="slide">
      <div v-if="expanded" class="rating-details">
        <div class="detail-item">
          <div class="detail-header">
            <span class="detail-label">角色质量</span>
            <span class="detail-weight">40%</span>
          </div>
          <div class="detail-bar-container">
            <div
              class="detail-bar"
              :style="{
                width: `${(rating.characterQuality / 5) * 100}%`,
                backgroundColor: getBarColor(rating.characterQuality)
              }"
            ></div>
          </div>
          <span class="detail-value">{{ rating.characterQuality.toFixed(1) }}</span>
        </div>

        <div class="detail-item">
          <div class="detail-header">
            <span class="detail-label">剧情质量</span>
            <span class="detail-weight">30%</span>
          </div>
          <div class="detail-bar-container">
            <div
              class="detail-bar"
              :style="{
                width: `${(rating.plotQuality / 5) * 100}%`,
                backgroundColor: getBarColor(rating.plotQuality)
              }"
            ></div>
          </div>
          <span class="detail-value">{{ rating.plotQuality.toFixed(1) }}</span>
        </div>

        <div class="detail-item">
          <div class="detail-header">
            <span class="detail-label">运营质量</span>
            <span class="detail-weight">20%</span>
          </div>
          <div class="detail-bar-container">
            <div
              class="detail-bar"
              :style="{
                width: `${(rating.operationQuality / 5) * 100}%`,
                backgroundColor: getBarColor(rating.operationQuality)
              }"
            ></div>
          </div>
          <span class="detail-value">{{ rating.operationQuality.toFixed(1) }}</span>
        </div>

        <div class="detail-item">
          <div class="detail-header">
            <span class="detail-label">爆率合理性</span>
            <span class="detail-weight">10%</span>
          </div>
          <div class="detail-bar-container">
            <div
              class="detail-bar"
              :style="{
                width: `${(rating.gachaFairness / 5) * 100}%`,
                backgroundColor: getBarColor(rating.gachaFairness)
              }"
            ></div>
          </div>
          <span class="detail-value">{{ rating.gachaFairness.toFixed(1) }}</span>
        </div>

        <div class="rating-tips">
          <van-icon name="info-o" />
          <span>评分基于角色设定、剧情内容、运营数据等多维度计算</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore, type GameRating, type RatingGrade } from '@/stores/gameStore';

const props = defineProps<{
  gameId: string;
}>();

const gameStore = useGameStore();
const expanded = ref(false);

const rating = computed<GameRating>(() => {
  return gameStore.calculateGameRating(props.gameId);
});

const grade = computed<RatingGrade>(() => {
  return gameStore.getRatingGrade(rating.value.overall);
});

const gradeColor = computed<string>(() => {
  return gameStore.getRatingGradeColor(grade.value);
});

function toggleExpand() {
  expanded.value = !expanded.value;
}

function getBarColor(value: number): string {
  if (value >= 4.5) return '#FFD700';
  if (value >= 4.0) return '#52c41a';
  if (value >= 3.0) return '#1890ff';
  if (value >= 2.0) return '#faad14';
  return '#ff4d4f';
}
</script>

<style scoped lang="scss">
.rating-display {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.rating-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #fafafa;
  }
}

.rating-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.rating-score {
  display: flex;
  align-items: center;
  gap: 12px;

  .score-value {
    font-size: 32px;
    font-weight: bold;
    color: #333;
  }

  .stars-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stars {
    display: flex;
    gap: 2px;

    .star {
      font-size: 18px;
      color: #e0e0e0;
      transition: color 0.2s;

      &.filled {
        color: #FFD700;
      }

      &.half {
        position: relative;
        color: #e0e0e0;

        &::before {
          content: '★';
          position: absolute;
          left: 0;
          width: 50%;
          overflow: hidden;
          color: #FFD700;
        }
      }
    }
  }
}

.rating-grade {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.expand-icon {
  font-size: 20px;
  color: #999;
  transition: transform 0.3s;
}

.rating-details {
  padding: 0 16px 16px;
  border-top: 1px solid #f0f0f0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.detail-header {
  min-width: 80px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .detail-label {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }

  .detail-weight {
    font-size: 11px;
    color: #999;
  }
}

.detail-bar-container {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.detail-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.detail-value {
  min-width: 32px;
  text-align: right;
  font-size: 14px;
  font-weight: bold;
  color: #666;
}

.rating-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 10px 12px;
  background: #f9f9f9;
  border-radius: 8px;
  font-size: 12px;
  color: #999;

  .van-icon {
    font-size: 14px;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
