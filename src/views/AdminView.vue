<template>
  <div class="admin-view">
    <div class="header">
      <h2>🎮 玩家社区分析</h2>
      <div class="actions">
        <van-button type="primary" size="small" @click="initializeData" :loading="initializing">
          初始化数据
        </van-button>
        <van-button type="default" size="small" @click="updateData" :loading="updating">
          更新数据
        </van-button>
        <van-button type="default" size="small" @click="simulatePlayers">
          模拟玩家
        </van-button>
      </div>
    </div>

    <div v-if="!communityStore.communityData" class="empty-state">
      <van-empty description="暂无玩家数据，请先初始化或模拟玩家" />
      <div class="empty-actions">
        <van-button type="primary" block round @click="simulatePlayers">
          快速模拟 100 名玩家
        </van-button>
      </div>
    </div>

    <template v-else>
      <PlayerSegments
        :community="communityStore.communityData"
        :strategies="communityStore.getAllStrategies()"
      />

      <div class="section">
        <h3>📊 玩家状态分布</h3>
        <div class="state-stats">
          <div
            v-for="(count, state) in playerStats"
            :key="state"
            class="state-card"
            :class="getStateClass(state)"
          >
            <div class="state-value">{{ count }}</div>
            <div class="state-label">{{ getStateName(state) }}</div>
            <div v-if="getSegmentAction(state as PlayerState)" class="state-action">
              <van-button
                size="mini"
                :type="getSegmentAction(state as PlayerState)?.suggestedAction.type === 'welfare' ? 'danger' : 'primary'"
                round
                @click="executeSuggestedAction(getSegmentAction(state as PlayerState)!)"
              >
                {{ getSegmentAction(state as PlayerState)?.suggestedAction.title }}
              </van-button>
              <div class="predicted-outcome">
                预计{{ getSegmentAction(state as PlayerState)?.suggestedAction.type === 'welfare' ? '召回率' : '参与率' }}: 
                {{ Math.round((getSegmentAction(state as PlayerState)?.suggestedAction.predictedOutcome.successRate || 0) * 100) }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="highRiskAlert" class="section">
        <div class="risk-alert">
          <div class="risk-alert-header">
            <van-icon name="warning-o" size="20" />
            <span class="risk-title">高风险玩家预警</span>
          </div>
          <div class="risk-content">
            <p>检测到 {{ highRiskAlert.atRiskCount }} 名玩家处于流失风险状态，{{ highRiskAlert.lostCount }} 名玩家已流失</p>
            <p class="risk-suggestion">建议立即执行召回策略，预计可挽回 {{ Math.round(highRiskAlert.predictedRecovered) }} 名玩家</p>
          </div>
          <div class="risk-actions">
            <van-button
              type="danger"
              size="small"
              round
              @click="executeBatchRecall"
            >
              一键召回流失玩家
            </van-button>
          </div>
        </div>
      </div>

      <div v-if="payingPlayerAction" class="section">
        <div class="paying-player-card">
          <div class="paying-header">
            <span class="paying-title">💎 付费玩家专属运营</span>
            <van-tag type="warning">{{ payingPlayerAction.count }} 人</van-tag>
          </div>
          <p class="paying-desc">检测到 {{ payingPlayerAction.count }} 名付费玩家，建议创建专属活动提升留存</p>
          <div class="paying-actions">
            <van-button
              type="warning"
              size="small"
              round
              @click="executeSuggestedAction(payingPlayerAction)"
            >
              创建专属活动
            </van-button>
            <span class="predicted-rate">预计参与率: {{ Math.round(payingPlayerAction.suggestedAction.predictedOutcome.successRate * 100) }}%</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>📈 历史趋势</h3>
        <div class="history-list">
          <div
            v-for="(history, index) in recentHistory"
            :key="index"
            class="history-item"
          >
            <div class="history-day">第 {{ history.day }}天</div>
            <div class="history-stats">
              <span>满意度：{{ history.satisfaction }}%</span>
              <span>活跃率：{{ Math.round(history.activeRate * 100) }}%</span>
              <span>留存率：{{ Math.round(history.retentionRate * 100) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore, PlayerState } from '@/stores/playerStore';
import { useCommunityStore } from '@/stores/communityStore';
import PlayerSegments from '@/components/community/PlayerSegments.vue';
import { showToast } from 'vant';

const router = useRouter();
const playerStore = usePlayerStore();
const communityStore = useCommunityStore();

const initializing = ref(false);
const updating = ref(false);

interface OperationConfig {
  type: string;
  diamonds?: number;
  tickets?: number;
  description?: string;
  targetPlayers?: string[];
}

interface PlayerSegmentAction {
  segment: PlayerState;
  count: number;
  suggestedAction: {
    type: 'welfare' | 'event' | 'gacha';
    title: string;
    description: string;
    template: Partial<OperationConfig>;
    predictedOutcome: {
      successRate: number;
      affectedPlayers: number;
    };
  };
}

interface HighRiskAlert {
  atRiskCount: number;
  lostCount: number;
  predictedRecovered: number;
}

const playerStats = computed(() => {
  return playerStore.getPlayerStateStats();
});

const recentHistory = computed(() => {
  const history = communityStore.history.slice(-7).reverse();
  return history.map((h, index) => ({
    day: history.length - index,
    satisfaction: Math.round(h.overallSatisfaction),
    activeRate: h.activeRate,
    retentionRate: h.retentionRate
  }));
});

const segmentActions = computed(() => {
  return generateSegmentActions();
});

const highRiskAlert = computed<HighRiskAlert | null>(() => {
  const stats = playerStore.getPlayerStateStats();
  const atRiskCount = stats[PlayerState.AT_RISK] || 0;
  const lostCount = stats[PlayerState.LOST] || 0;

  if (atRiskCount > 5 || lostCount > 10) {
    return {
      atRiskCount,
      lostCount,
      predictedRecovered: Math.round((atRiskCount + lostCount) * 0.35)
    };
  }
  return null;
});

const payingPlayerAction = computed<PlayerSegmentAction | null>(() => {
  const stats = playerStore.getPlayerStateStats();
  const payingCount = stats[PlayerState.PAYING] || 0;

  if (payingCount > 0) {
    return {
      segment: PlayerState.PAYING,
      count: payingCount,
      suggestedAction: {
        type: 'event',
        title: '创建专属活动',
        description: `为 ${payingCount} 名付费玩家创建专属福利活动，提升留存率`,
        template: {
          type: 'vip_exclusive',
          diamonds: 500,
          tickets: 10,
          description: '付费玩家专属福利'
        },
        predictedOutcome: {
          successRate: 0.75,
          affectedPlayers: payingCount
        }
      }
    };
  }
  return null;
});

function generateSegmentActions(): PlayerSegmentAction[] {
  const stats = playerStore.getPlayerStateStats();
  const actions: PlayerSegmentAction[] = [];

  const lostCount = stats[PlayerState.LOST] || 0;
  if (lostCount > 0) {
    actions.push({
      segment: PlayerState.LOST,
      count: lostCount,
      suggestedAction: {
        type: 'welfare',
        title: '一键召回',
        description: `向 ${lostCount} 名流失玩家发送召回福利`,
        template: {
          type: 'return',
          diamonds: 100,
          tickets: 5,
          description: '回归玩家专属福利'
        },
        predictedOutcome: {
          successRate: 0.35,
          affectedPlayers: Math.round(lostCount * 0.35)
        }
      }
    });
  }

  const atRiskCount = stats[PlayerState.AT_RISK] || 0;
  if (atRiskCount > 0) {
    actions.push({
      segment: PlayerState.AT_RISK,
      count: atRiskCount,
      suggestedAction: {
        type: 'welfare',
        title: '挽留福利',
        description: `向 ${atRiskCount} 名风险玩家发放挽留礼包`,
        template: {
          type: 'retention',
          diamonds: 50,
          tickets: 3,
          description: '玩家关怀礼包'
        },
        predictedOutcome: {
          successRate: 0.55,
          affectedPlayers: Math.round(atRiskCount * 0.55)
        }
      }
    });
  }

  return actions;
}

function getSegmentAction(state: PlayerState): PlayerSegmentAction | undefined {
  return segmentActions.value.find(a => a.segment === state);
}

function executeSuggestedAction(action: PlayerSegmentAction) {
  const { type, template } = action.suggestedAction;

  router.push({
    path: '/operation',
    query: {
      action: type,
      template: JSON.stringify(template),
      segment: action.segment,
      count: action.count.toString()
    }
  });

  showToast(`正在跳转到运营页面，预填充${action.suggestedAction.title}配置`);
}

function executeBatchRecall() {
  const lostCount = playerStats.value[PlayerState.LOST] || 0;
  const atRiskCount = playerStats.value[PlayerState.AT_RISK] || 0;
  const totalCount = lostCount + atRiskCount;

  if (totalCount === 0) {
    showToast('当前没有需要召回的玩家');
    return;
  }

  router.push({
    path: '/operation',
    query: {
      action: 'welfare',
      template: JSON.stringify({
        type: 'batch_recall',
        diamonds: 200,
        tickets: 10,
        description: `批量召回 ${totalCount} 名流失/风险玩家`
      }),
      segment: 'batch',
      count: totalCount.toString()
    }
  });

  showToast('正在跳转到运营页面，执行批量召回');
}

function initializeData() {
  initializing.value = true;
  communityStore.initializeCommunity();
  setTimeout(() => {
    initializing.value = false;
  }, 500);
}

function updateData() {
  updating.value = true;
  communityStore.updateCommunityData();
  setTimeout(() => {
    updating.value = false;
  }, 500);
}

function simulatePlayers() {
  const count = 100;
  playerStore.createMultiplePlayers(count, '模拟玩家');
  communityStore.initializeCommunity();
}

function getStateName(state: string): string {
  const names: Record<string, string> = {
    NEW: '新玩家',
    ACTIVE: '活跃玩家',
    PAYING: '付费玩家',
    AT_RISK: '有风险',
    LOST: '流失玩家',
    RETURNED: '回流玩家'
  };
  return names[state] || state;
}

function getStateClass(state: string): string {
  const classes: Record<string, string> = {
    NEW: 'new',
    ACTIVE: 'active',
    PAYING: 'paying',
    AT_RISK: 'at-risk',
    LOST: 'lost',
    RETURNED: 'returned'
  };
  return classes[state] || '';
}

onMounted(() => {
  if (playerStore.players.length > 0) {
    communityStore.initializeCommunity();
  }
});
</script>

<style scoped lang="scss">
.admin-view {
  padding: 16px;
  padding-bottom: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h2 {
    margin: 0;
    font-size: 20px;
    color: #333;
  }
  
  .actions {
    display: flex;
    gap: 8px;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 16px;
  
  .empty-actions {
    margin-top: 24px;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }
}

.section {
  margin-top: 24px;
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #333;
  }
}

.state-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.state-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  &.new {
    border-left: 3px solid #1890ff;
  }
  
  &.active {
    border-left: 3px solid #52c41a;
  }
  
  &.paying {
    border-left: 3px solid #faad14;
  }
  
  &.at-risk {
    border-left: 3px solid #ff9c6e;
  }
  
  &.lost {
    border-left: 3px solid #ff4d4f;
  }
  
  &.returned {
    border-left: 3px solid #722ed1;
  }
  
  .state-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
  }
  
  .state-label {
    font-size: 12px;
    color: #999;
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .history-day {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
  }

  .history-stats {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #666;
  }
}

.state-action {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e0e0e0;

  .predicted-outcome {
    margin-top: 4px;
    font-size: 11px;
    color: #999;
  }
}

.risk-alert {
  background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%);
  border: 1px solid #ff4d4f;
  border-radius: 12px;
  padding: 16px;

  .risk-alert-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .van-icon {
      color: #ff4d4f;
    }

    .risk-title {
      font-size: 16px;
      font-weight: bold;
      color: #cf1322;
    }
  }

  .risk-content {
    margin-bottom: 12px;

    p {
      margin: 4px 0;
      font-size: 14px;
      color: #333;
    }

    .risk-suggestion {
      color: #ff4d4f;
      font-weight: 500;
    }
  }

  .risk-actions {
    display: flex;
    justify-content: flex-end;
  }
}

.paying-player-card {
  background: linear-gradient(135deg, #fffbe6 0%, #ffe7ba 100%);
  border: 1px solid #faad14;
  border-radius: 12px;
  padding: 16px;

  .paying-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .paying-title {
      font-size: 16px;
      font-weight: bold;
      color: #d48806;
    }
  }

  .paying-desc {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #333;
  }

  .paying-actions {
    display: flex;
    align-items: center;
    gap: 12px;

    .predicted-rate {
      font-size: 13px;
      color: #fa8c16;
      font-weight: 500;
    }
  }
}
</style>
