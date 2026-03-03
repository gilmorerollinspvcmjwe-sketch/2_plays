<template>
  <div class="publish-view">
    <h2 class="page-title">🚀 发布游戏</h2>

    <!-- 游戏选择 -->
    <div class="game-selection">
      <h3 class="section-title">选择要发布的游戏</h3>
      <van-cell-group>
        <van-cell
          v-for="game in gameStore.draftGames"
          :key="game.id"
          :title="game.title"
          :label="game.description"
          clickable
          @click="selectGame(game)"
          :class="{ 'selected': selectedGame?.id === game.id }"
        >
          <template #right-icon>
            <van-icon
              v-if="selectedGame?.id === game.id"
              name="checked"
              color="#FF69B4"
              size="24"
            />
          </template>
          <template #label>
            <div class="game-stats">
              <van-tag plain>角色: {{ game.characters.length }}</van-tag>
              <van-tag plain>剧情: {{ game.plots.length }}</van-tag>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <van-empty v-if="gameStore.draftGames.length === 0" description="暂无待发布的游戏">
        <van-button
          type="primary"
          size="small"
          round
          color="linear-gradient(to right, #FF69B4, #FFB6C1)"
          @click="$router.push('/creator')"
        >
          去创建游戏
        </van-button>
      </van-empty>
    </div>

    <!-- 发布检查 -->
    <div v-if="selectedGame" class="publish-check">
      <h3 class="section-title">发布检查</h3>
      <van-cell-group>
        <van-cell title="角色检查">
          <template #right-icon>
            <van-icon
              :name="checkList.characters ? 'checked' : 'warning-o'"
              :color="checkList.characters ? '#07c160' : '#ff976a'"
              size="20"
            />
          </template>
          <template #label>
            {{ selectedGame.characters.length }} 个角色
            <span v-if="!checkList.characters" class="check-tip">（至少需要1个角色）</span>
          </template>
        </van-cell>

        <van-cell title="剧情检查">
          <template #right-icon>
            <van-icon
              :name="checkList.plots ? 'checked' : 'warning-o'"
              :color="checkList.plots ? '#07c160' : '#ff976a'"
              size="20"
            />
          </template>
          <template #label>
            {{ selectedGame.plots.length }} 条剧情
            <span v-if="!checkList.plots" class="check-tip">（至少需要1条剧情）</span>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 发布预览 -->
    <div v-if="selectedGame && canPublish" class="publish-preview">
      <h3 class="section-title">发布预览</h3>
      <van-card
        :title="selectedGame.title"
        :desc="selectedGame.description || '暂无描述'"
        class="preview-card"
      >
        <template #tags>
          <van-tag type="primary">角色 {{ selectedGame.characters.length }}</van-tag>
          <van-tag type="success">剧情 {{ selectedGame.plots.length }}</van-tag>
        </template>
        <template #footer>
          <span class="preview-time">预计发布时间: {{ formatTime(new Date()) }}</span>
        </template>
      </van-card>
    </div>

    <!-- 发布按钮 -->
    <div v-if="selectedGame" class="publish-action">
      <van-button
        type="primary"
        block
        round
        size="large"
        :disabled="!canPublish"
        :loading="publishing"
        color="linear-gradient(to right, #FF69B4, #FFB6C1)"
        @click="handlePublish"
      >
        <template #icon>
          <van-icon name="guide-o" />
        </template>
        {{ canPublish ? '确认发布' : '请完善游戏内容' }}
      </van-button>

      <p v-if="!canPublish" class="publish-tip">
        请确保游戏至少包含1个角色和1条剧情
      </p>
    </div>

    <!-- 已发布游戏列表 -->
    <div class="published-games">
      <h3 class="section-title">已发布的游戏</h3>
      <van-cell-group v-if="gameStore.publishedGames.length > 0">
        <van-cell
          v-for="game in gameStore.publishedGames"
          :key="game.id"
          :title="game.title"
        >
          <template #label>
            <div class="published-info">
              <span>发布于 {{ formatTime(game.publishedAt) }}</span>
              <van-tag type="success">已发布</van-tag>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
      <van-empty v-else description="暂无已发布的游戏" />
    </div>

    <CelebrationAnimation 
      v-if="showCelebration" 
      :auto-play="true" 
      :duration="3000"
      text="发布成功！"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore, type Game } from '@/stores/gameStore';
import { usePointsStore } from '@/stores/points';
import { showToast, showDialog } from 'vant';
import CelebrationAnimation from '@/components/animations/CelebrationAnimation.vue';

const gameStore = useGameStore();
const pointsStore = usePointsStore();

const showCelebration = ref(false);

const selectedGame = ref<Game | null>(null);
const publishing = ref(false);

// 检查列表
const checkList = computed(() => {
  if (!selectedGame.value) {
    return { characters: false, plots: false };
  }
  return {
    characters: selectedGame.value.characters.length > 0,
    plots: selectedGame.value.plots.length > 0
  };
});

// 是否可以发布
const canPublish = computed(() => {
  return checkList.value.characters && checkList.value.plots;
});

// 选择游戏
function selectGame(game: Game) {
  selectedGame.value = game;
  gameStore.setCurrentGame(game.id);
}

// 发布游戏
async function handlePublish() {
  if (!selectedGame.value || !canPublish.value) {
    showToast('请完善游戏内容');
    return;
  }

  const result = await showDialog({
    title: '确认发布',
    message: `确定要发布游戏《${selectedGame.value.title}》吗？发布后游戏将对玩家可见。`,
    showCancelButton: true,
    confirmButtonText: '确认发布',
    cancelButtonText: '再等等'
  });

  if (result === 'confirm') {
    publishing.value = true;

    setTimeout(() => {
      const publishResult = gameStore.publishGame(selectedGame.value!.id);

      if (publishResult.success) {
        showCelebration.value = true;
        pointsStore.unlockAchievement('first_game');
        selectedGame.value = null;
      } else {
        showToast(publishResult.message);
      }

      publishing.value = false;
    }, 1500);
  }
}

// 格式化时间
function formatTime(timestamp: string | Date | undefined): string {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<style scoped lang="scss">
.publish-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  padding: 16px;
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  margin-top: 24px;
}

.game-selection {
  .selected {
    background: #FFF5F7;
  }

  .game-stats {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }
}

.publish-check {
  .check-tip {
    color: #ff976a;
    font-size: 12px;
  }
}

.publish-preview {
  .preview-card {
    background: white;
    border-radius: 12px;

    :deep(.van-card) {
      background: white;
    }
  }

  .preview-time {
    font-size: 12px;
    color: #999;
  }
}

.publish-action {
  margin-top: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;

  .publish-tip {
    text-align: center;
    font-size: 12px;
    color: #999;
    margin-top: 8px;
    margin-bottom: 0;
  }
}

.published-games {
  margin-top: 32px;

  .published-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;

    span {
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
