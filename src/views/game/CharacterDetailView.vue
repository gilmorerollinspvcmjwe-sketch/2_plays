<template>
  <div class="character-detail-view">
    <van-nav-bar
      :title="character?.name || '角色详情'"
      left-arrow
      @click-left="goBack"
    />

    <div v-if="loading" class="loading-state">
      <van-loading type="spinner" color="#FF69B4" />
      <p>加载中...</p>
    </div>

    <template v-else-if="character">
      <div class="character-header" :style="{ background: headerGradient }">
        <div class="avatar-section">
          <div class="avatar">
            <van-icon name="user-o" size="48" />
          </div>
          <div class="basic-info">
            <h2 class="name">{{ character.name }}</h2>
            <div class="tags">
              <van-tag v-for="tag in character.personality.slice(0, 3)" :key="tag" plain>
                {{ tag }}
              </van-tag>
            </div>
          </div>
        </div>
        <div class="popularity-badge">
          <van-icon name="fire" color="#FF69B4" />
          <span>{{ character.popularity?.popularity || 50 }}</span>
        </div>
      </div>

      <div class="info-section">
        <div class="section-card">
          <h3 class="section-title">基本信息</h3>
          <van-cell-group inset>
            <van-cell title="外貌" :value="character.appearance" />
            <van-cell title="服装" :value="character.clothing" />
            <van-cell title="背景" :value="character.background" />
          </van-cell-group>
        </div>

        <div class="section-card">
          <h3 class="section-title">亲密度</h3>
          <IntimacyBar
            :character-id="character.id"
            :show-unlocks="true"
            :show-interaction="true"
            @interact="handleInteract"
            @level-up="handleLevelUp"
          />
        </div>

        <div class="section-card">
          <h3 class="section-title">
            <van-icon name="volume-o" />
            角色心声
          </h3>
          <CharacterVoice :character-id="character.id" />
        </div>

        <div class="section-card" v-if="intimacyLevel >= 5">
          <h3 class="section-title">
            <van-icon name="calendar-o" />
            约会功能
          </h3>
          <div class="date-section">
            <p class="date-hint">亲密度达到5级，已解锁约会功能！</p>
            <van-button
              type="primary"
              round
              block
              color="linear-gradient(to right, #FF69B4, #FFB6C1)"
              @click="showDateSelector = true"
            >
              <van-icon name="like" />
              开始约会
            </van-button>
          </div>
        </div>

        <div class="section-card locked-hint" v-else>
          <h3 class="section-title">
            <van-icon name="lock" />
            约会功能
          </h3>
          <p class="locked-text">
            亲密度达到 <span class="highlight">5级</span> 解锁约会功能
          </p>
          <van-progress
            :percentage="intimacyProgress"
            stroke-width="8"
            color="#FF69B4"
            track-color="#f5f5f5"
          />
          <p class="current-level">当前等级：Lv.{{ intimacyLevel }}</p>
        </div>

        <div class="section-card" v-if="character.popularity">
          <h3 class="section-title">人气数据</h3>
          <div class="popularity-stats">
            <div class="stat-item">
              <van-icon name="fire" color="#FF69B4" />
              <span class="label">人气值</span>
              <span class="value">{{ character.popularity.popularity }}</span>
            </div>
            <div class="stat-item">
              <van-icon name="chat-o" color="#1989fa" />
              <span class="label">讨论热度</span>
              <span class="value">{{ character.popularity.discussionHeat }}</span>
            </div>
            <div class="stat-item">
              <van-icon name="gift-o" color="#FFD700" />
              <span class="label">抽取次数</span>
              <span class="value">{{ character.popularity.gachaCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <van-empty v-else description="角色不存在">
      <van-button type="primary" @click="goBack">返回</van-button>
    </van-empty>

    <DateSelector
      v-model:show="showDateSelector"
      :character="character ? { id: character.id, name: character.name } : null"
      :intimacy-level="intimacyLevel"
      @start="handleStartDate"
    />

    <DateScene
      v-model:show="showDateScene"
      :scene="currentDateScene"
      :character="character ? { id: character.id, name: character.name } : null"
      :current-intimacy="character?.intimacy?.totalExperience || 0"
      @complete="handleDateComplete"
    />

    <!-- 生日通知 -->
    <BirthdayNotification
      :character="character"
      :show="showBirthdayNotification"
      @celebrate="handleCelebrateBirthday"
      @close="showBirthdayNotification = false"
    />

    <!-- 生日礼物弹窗 -->
    <BirthdayGiftModal
      v-model:show="showGiftModal"
      :character-id="character?.id || ''"
      :character-name="character?.name || ''"
      @gift-sent="handleGiftSent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showSuccessToast, showDialog } from 'vant';
import { useGameStore, INTIMACY_LEVEL_NAMES } from '@/stores/gameStore';
import { usePointsStore } from '@/stores/points';
import IntimacyBar from '@/components/character/IntimacyBar.vue';
import CharacterVoice from '@/components/character/CharacterVoice.vue';
import DateSelector from '@/components/date/DateSelector.vue';
import DateScene from '@/components/date/DateScene.vue';
import BirthdayNotification from '@/components/character/BirthdayNotification.vue';
import BirthdayGiftModal from '@/components/character/BirthdayGiftModal.vue';
import type { DateScene as DateSceneType } from '@/data/templates/dates';

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();
const pointsStore = usePointsStore();

const loading = ref(true);
const showDateSelector = ref(false);
const showDateScene = ref(false);
const currentDateScene = ref<DateSceneType | null>(null);
const showBirthdayNotification = ref(false);
const showGiftModal = ref(false);

const characterId = computed(() => route.params.characterId as string);
const gameId = computed(() => route.params.gameId as string);

const character = computed(() => {
  const game = gameStore.games.find(g => g.id === gameId.value);
  if (!game) return null;
  return game.characters.find(c => c.id === characterId.value) || null;
});

const intimacyLevel = computed(() => {
  return character.value?.intimacy?.level || 1;
});

const intimacyProgress = computed(() => {
  return gameStore.getIntimacyProgress(characterId.value);
});

const headerGradient = computed(() => {
  const level = intimacyLevel.value;
  const gradients: Record<number, string> = {
    1: 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)',
    2: 'linear-gradient(135deg, #8BC34A 0%, #AED581 100%)',
    3: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
    4: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)',
    5: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
    6: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
    7: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
    8: 'linear-gradient(135deg, #F44336 0%, #E57373 100%)',
    9: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)',
    10: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)'
  };
  return gradients[level] || gradients[1];
});

onMounted(() => {
  gameStore.setCurrentGame(gameId.value);
  
  // 检查是否是角色生日
  setTimeout(() => {
    if (character.value && gameStore.isCharacterBirthday(character.value.id)) {
      showBirthdayNotification.value = true;
    }
    loading.value = false;
  }, 300);
});

function goBack() {
  router.back();
}

function handleInteract() {
  showToast('互动成功！');
}

function handleLevelUp(level: number) {
  showDialog({
    title: '亲密度提升！',
    message: `恭喜！与 ${character.value?.name} 的亲密度提升至 ${level} 级「${INTIMACY_LEVEL_NAMES[level]}」！`,
    confirmButtonText: '太棒了'
  });
}

function handleStartDate(scene: DateSceneType) {
  currentDateScene.value = scene;
  showDateSelector.value = false;
  showDateScene.value = true;
}

function handleDateComplete(totalIntimacy: number) {
  const result = gameStore.addIntimacy(characterId.value, totalIntimacy, '约会');
  
  if (result.success) {
    showToast(`约会结束，获得 ${totalIntimacy} 点亲密度！`);
    
    if (result.levelUp) {
      setTimeout(() => {
        handleLevelUp(result.newLevel);
      }, 500);
    }
  }
  
  showDateScene.value = false;
  currentDateScene.value = null;
}

function handleCelebrateBirthday(characterId: string) {
  showBirthdayNotification.value = false;
  showGiftModal.value = true;
}

function handleGiftSent(giftId: string, cost: number) {
  // 庆祝生日并赠送礼物
  const result = gameStore.celebrateBirthday(characterId.value);
  
  if (result.success) {
    showSuccessToast(`赠送成功！消耗 ${cost} 积分`);
    
    // 解锁成就
    if (pointsStore) {
      pointsStore.unlockAchievement('birthday_celebrator');
    }
  }
}
</script>

<style scoped lang="scss">
.character-detail-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  padding-bottom: 40px;

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px;

    p {
      margin-top: 16px;
      color: #999;
    }
  }

  .character-header {
    padding: 24px 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 16px;

      .avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        backdrop-filter: blur(10px);
      }

      .basic-info {
        .name {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: bold;
          color: white;
        }

        .tags {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
      }
    }

    .popularity-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.3);
      padding: 6px 12px;
      border-radius: 20px;
      backdrop-filter: blur(10px);

      span {
        color: white;
        font-weight: bold;
        font-size: 16px;
      }
    }
  }

  .info-section {
    padding: 0 16px;
    margin-top: -16px;
  }

  .section-card {
    background: white;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: bold;
      color: #333;

      .van-icon {
        color: #FF69B4;
      }
    }
  }

  .date-section {
    .date-hint {
      text-align: center;
      color: #52c41a;
      font-size: 14px;
      margin-bottom: 16px;
    }
  }

  .locked-hint {
    background: #f9f9f9;

    .locked-text {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-bottom: 12px;

      .highlight {
        color: #FF69B4;
        font-weight: bold;
      }
    }

    .current-level {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 8px;
    }
  }

  .popularity-stats {
    display: flex;
    justify-content: space-around;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;

      .label {
        font-size: 12px;
        color: #999;
      }

      .value {
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
    }
  }
}
</style>
