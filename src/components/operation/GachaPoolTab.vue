<template>
  <div class="tab-content">
    <!-- 建议UP角色 -->
    <div v-if="recommendedUpCharacters.length > 0" class="recommended-section">
      <div class="section-header">
        <span class="section-title">💡 建议UP角色</span>
        <span class="section-desc">人气高但未UP，点击可直接创建卡池</span>
      </div>
      <div class="recommended-list">
        <van-tag
          v-for="char in recommendedUpCharacters"
          :key="char.characterId"
          type="warning"
          size="medium"
          class="recommended-tag"
          @click="createPoolForCharacter(char)"
        >
          {{ char.name }} ({{ char.popularity }})
        </van-tag>
      </div>
    </div>

    <div v-if="operationStore.gachaPools.length === 0" class="empty-state">
      <van-empty description="暂无卡池">
        <van-button
          type="primary"
          size="small"
          round
          color="linear-gradient(to right, #FF69B4, #FFB6C1)"
          @click="showCreatePool = true"
        >
          创建卡池
        </van-button>
      </van-empty>
    </div>
    <div v-else class="pool-list">
      <van-card
        v-for="pool in operationStore.gachaPools"
        :key="pool.id"
        :title="pool.name"
        :desc="`UP: ${pool.upCharacters.join(', ')}`"
        class="pool-card"
      >
        <template #tags>
          <van-tag :type="getStatusType(pool.status)">
            {{ getStatusLabel(pool.status) }}
          </van-tag>
          <van-tag plain>SSR {{ pool.rates.ssr }}%</van-tag>
          <van-tag
            v-if="pool.popularityBonus && pool.popularityBonus !== 1"
            :type="pool.popularityBonus > 1 ? 'success' : 'danger'"
            class="popularity-bonus-tag"
          >
            人气{{ pool.popularityBonus > 1 ? '+' : '' }}{{ Math.round((pool.popularityBonus - 1) * 100) }}%
          </van-tag>
        </template>
        <template #footer>
          <span class="pool-stats">抽卡：{{ pool.totalDraws }} | 收入：{{ pool.revenue }}</span>
        </template>
      </van-card>
    </div>
    <div class="simulator-action">
      <van-button
        type="primary"
        size="large"
        round
        block
        color="linear-gradient(to right, #FF69B4, #FFB6C1)"
        @click="showGachaSimulator = true"
      >
        🎮 抽卡模拟
      </van-button>
    </div>

    <!-- 创建卡池弹窗 -->
    <van-dialog
      v-model:show="showCreatePool"
      title="创建卡池"
      show-cancel-button
      @confirm="handleCreatePool"
    >
      <van-field
        v-model="poolForm.name"
        label="卡池名称"
        placeholder="请输入卡池名称"
      />
      <van-field
        v-model="poolForm.upCharacters"
        label="UP角色"
        placeholder="用逗号分隔多个角色"
      />
      <div class="form-item">
        <label class="form-label">SSR概率: {{ poolForm.rates.ssr }}%</label>
        <van-slider v-model="poolForm.rates.ssr" :min="1" :max="5" :step="0.5" />
      </div>
      <div class="form-item">
        <label class="form-label">预算等级</label>
        <van-radio-group v-model="poolForm.budget" direction="horizontal">
          <van-radio name="低">低</van-radio>
          <van-radio name="中">中</van-radio>
          <van-radio name="高">高</van-radio>
        </van-radio-group>
      </div>
      <div class="form-item prediction-button-wrapper">
        <van-button
          type="primary"
          size="small"
          round
          block
          color="linear-gradient(to right, #667eea, #764ba2)"
          @click="handlePreviewPrediction"
          :disabled="!poolForm.name"
        >
          <template #icon>
            <van-icon name="chart-trending-o" />
          </template>
          查看效果预测
        </van-button>
      </div>
    </van-dialog>

    <!-- 抽卡模拟器弹窗 -->
    <van-popup
      v-model:show="showGachaSimulator"
      position="center"
      round
      :style="{ width: '95%', height: '85%' }"
    >
      <div class="simulator-popup">
        <div class="simulator-header">
          <h3>✨ 抽卡模拟器 ✨</h3>
          <van-icon name="cross" size="20" @click="showGachaSimulator = false" />
        </div>
        <div class="simulator-content">
          <GachaSimulator />
        </div>
      </div>
    </van-popup>

    <!-- 效果预测面板弹窗 -->
    <van-popup
      v-model:show="showPredictionPanel"
      position="bottom"
      round
      :style="{ height: '85%' }"
    >
      <div class="prediction-popup">
        <div class="prediction-header">
          <h3>🔮 效果预测</h3>
          <van-icon name="cross" size="20" @click="showPredictionPanel = false" />
        </div>
        <div class="prediction-content">
          <OperationPredictionPanel
            v-if="currentPrediction"
            :decision="currentDecision"
            :prediction="currentPrediction"
            @confirm="handleConfirmPrediction"
            @adjust="handleAdjustPrediction"
          />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { showToast, showSuccessToast, showDialog } from 'vant';
import { useOperationStore } from '@/stores/operationStore';
import { useGameStore } from '@/stores/gameStore';
import { getStatusType, getStatusLabel, getPopularityColor } from '@/utils/operationHelpers';
import GachaSimulator from '@/components/gacha/GachaSimulator.vue';
import OperationPredictionPanel from '@/components/operation/OperationPredictionPanel.vue';
import type { OperationDecision, OperationPrediction } from '@/stores/operationStore';

const operationStore = useOperationStore();
const gameStore = useGameStore();

const popularityRanking = computed(() => operationStore.getCharacterPopularityRanking(10));
const recommendedUpCharacters = computed(() => operationStore.getRecommendedUpCharacters());

const showCreatePool = ref(false);
const showGachaSimulator = ref(false);
const showPredictionPanel = ref(false);

const currentDecision = ref<OperationDecision>({
  id: '',
  type: 'gacha',
  name: '',
  params: {},
  timestamp: Date.now()
});
const currentPrediction = ref<OperationPrediction | null>(null);

const poolForm = ref({
  name: '',
  upCharacters: '',
  rates: { ssr: 2, sr: 8, r: 90 },
  budget: '中' as const,
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 7 * 86400000).toISOString()
});

function refreshPopularityRanking() {
  showToast('人气排行已刷新');
}

async function handleCharacterClick(char: { characterId: string; name: string; popularity: number; isInPool: boolean }) {
  if (char.isInPool) {
    showToast(`${char.name} 正在UP中`);
  } else if (char.popularity >= 60) {
    showDialog({
      title: '创建UP卡池',
      message: `${char.name} 当前人气 ${char.popularity}，建议创建UP卡池可获得收益加成！`,
      showCancelButton: true,
      confirmButtonText: '创建卡池',
      cancelButtonText: '取消'
    }).then(() => {
      createPoolForCharacter(char);
    }).catch(() => {});
  } else {
    showToast(`${char.name} 当前人气 ${char.popularity}`);
  }
}

async function createPoolForCharacter(char: { characterId: string; name: string; popularity: number }) {
  let bonusText = '';
  if (char.popularity >= 80) bonusText = '人气加成: +50%';
  else if (char.popularity >= 60) bonusText = '人气加成: +20%';
  else if (char.popularity < 40) bonusText = '人气惩罚: -20%';

  const result = await operationStore.createGachaPool({
    name: `${char.name} UP池`,
    upCharacters: [char.characterId],
    rates: { ssr: 2, sr: 8, r: 90 },
    budget: '中',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 7 * 86400000).toISOString()
  });

  if (result.success) {
    showSuccessToast(`${char.name} UP卡池创建成功！${bonusText}`);
  } else {
    showToast(result.message);
  }
}

function handlePreviewPrediction() {
  if (!poolForm.value.name) {
    showToast('请先填写卡池名称');
    return;
  }

  const decision: OperationDecision = {
    id: `preview_${Date.now()}`,
    type: 'gacha',
    name: poolForm.value.name,
    description: `UP角色: ${poolForm.value.upCharacters}`,
    params: {
      action: 'rate_change',
      value: poolForm.value.rates.ssr,
      newRate: poolForm.value.rates.ssr,
      oldRate: 2,
      upCharacterPopularity: 50,
      budget: poolForm.value.budget
    },
    timestamp: Date.now()
  };

  currentDecision.value = decision;
  currentPrediction.value = operationStore.generatePrediction(decision);
  showPredictionPanel.value = true;
}

async function handleConfirmPrediction() {
  showPredictionPanel.value = false;
  await handleCreatePool();
}

function handleAdjustPrediction(adjustments: { intensity: number; marketSensitivity: number }) {
  if (currentDecision.value) {
    const adjustedDecision = {
      ...currentDecision.value,
      params: {
        ...currentDecision.value.params,
        intensityMultiplier: adjustments.intensity,
        marketSensitivity: adjustments.marketSensitivity
      }
    };
    currentPrediction.value = operationStore.generatePrediction(adjustedDecision);
  }
}

async function handleCreatePool() {
  if (!poolForm.value.name || !poolForm.value.upCharacters) {
    showToast('请填写完整信息');
    return;
  }

  const result = await operationStore.createGachaPool({
    name: poolForm.value.name,
    upCharacters: poolForm.value.upCharacters.split(',').map(s => s.trim()),
    rates: poolForm.value.rates,
    budget: poolForm.value.budget,
    startTime: poolForm.value.startTime,
    endTime: poolForm.value.endTime
  });

  if (result.success) {
    showToast(result.message);
    showCreatePool.value = false;
    resetPoolForm();

    if (currentDecision.value.id) {
      setTimeout(() => {
        operationStore.trackActualEffects(currentDecision.value.id);
      }, 1000);
    }
  } else {
    showToast(result.message);
  }
}

function resetPoolForm() {
  poolForm.value = {
    name: '',
    upCharacters: '',
    rates: { ssr: 2, sr: 8, r: 90 },
    budget: '中',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 7 * 86400000).toISOString()
  };
}

function openCreatePool() {
  showCreatePool.value = true;
}

defineExpose({ openCreatePool, poolForm });
</script>

<style scoped lang="scss">
.tab-content {
  padding: 16px;
  min-height: 300px;
}

.popularity-ranking-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .ranking-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .ranking-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }

  .ranking-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .ranking-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      background: #f5f5f5;
      cursor: pointer;
      transition: all 0.3s;

      &:hover { background: #e8e8e8; }
      &.is-up { background: #f6ffed; border: 1px solid #b7eb8f; }
      &.is-recommended { background: #fffbe6; border: 1px solid #ffe58f; }

      .rank-number {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 12px;
        font-weight: bold;
        color: #666;
        background: #e0e0e0;

        &.rank-1 { background: #ffd700; color: #fff; }
        &.rank-2 { background: #c0c0c0; color: #fff; }
        &.rank-3 { background: #cd7f32; color: #fff; }
      }

      .char-name {
        width: 80px;
        font-size: 14px;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .popularity-bar {
        flex: 1;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;

        .popularity-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s;
        }
      }

      .popularity-value {
        width: 30px;
        text-align: right;
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }

      .status-tag {
        margin-left: 4px;
      }
    }
  }
}

.recommended-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .section-header {
    margin-bottom: 12px;

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }

    .section-desc {
      display: block;
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  }

  .recommended-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .recommended-tag {
      cursor: pointer;
    }
  }
}

.empty-state {
  padding: 32px 0;
}

.pool-list {
  .pool-card {
    margin-bottom: 12px;
    background: white;
    border-radius: 8px;
  }

  .pool-stats {
    font-size: 12px;
    color: #999;
  }

  .popularity-bonus-tag {
    margin-left: 4px;
  }
}

.simulator-action {
  margin-top: 16px;
}

.simulator-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .simulator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .simulator-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
}

.prediction-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .prediction-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .prediction-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
}

.form-item {
  padding: 12px 16px;

  .form-label {
    display: block;
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }
}

.prediction-button-wrapper {
  padding-top: 8px;
}
</style>
