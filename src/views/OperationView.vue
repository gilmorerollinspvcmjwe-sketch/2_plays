<template>
  <div class="operation-view">
    <!-- 运营数据概览 -->
    <OperationDashboard
      :stats="operationStore.stats"
      :reputation-emoji="operationStore.reputationEmoji"
      :reputation-color="operationStore.reputationColor"
      :ongoing-events="operationStore.ongoingEvents"
      :pending-incidents="operationStore.pendingIncidents"
      @create-pool="handleOpenCreatePool"
      @create-event="handleOpenCreateEvent"
      @simulate-day="handleSimulateDay"
    />

    <!-- 玩家社区分析入口 -->
    <div class="community-analysis-section">
      <van-cell
        title="玩家社区分析"
        label="查看玩家数据、情感分析、运营建议"
        is-link
        @click="showCommunityAnalysis = true"
      >
        <template #icon>
          <div class="analysis-icon">📊</div>
        </template>
      </van-cell>
    </div>

    <!-- Tab 切换 -->
    <van-tabs v-model="activeTab" class="operation-tabs">
      <van-tab title="卡池管理">
        <GachaPoolTab ref="gachaPoolTabRef" />
      </van-tab>

      <van-tab title="活动中心">
        <EventCenterTab ref="eventCenterTabRef" />
      </van-tab>

      <van-tab title="运营事件">
        <IncidentTab />
      </van-tab>

      <van-tab title="玩家数据">
        <PlayerDataTab />
      </van-tab>

      <van-tab title="福利发放">
        <WelfareTab />
      </van-tab>

      <van-tab title="告白墙">
        <div class="tab-content no-padding">
          <ConfessionWall />
        </div>
      </van-tab>

      <van-tab title="同人广场">
        <div class="tab-content no-padding">
          <FanCreationSquare />
        </div>
      </van-tab>

      <van-tab title="市场情报">
        <div class="tab-content no-padding">
          <MarketDashboard :embedded="true" />
        </div>
      </van-tab>

      <van-tab title="效果追踪">
        <EffectTrackingTab />
      </van-tab>
    </van-tabs>

    <!-- 危机警报组件 -->
    <CrisisAlert
      :crises="crises"
      @resolve="handleResolveCrisis"
    />

    <!-- 玩家社区分析弹窗 -->
    <van-popup
      v-model:show="showCommunityAnalysis"
      position="bottom"
      round
      :style="{ height: '80%' }"
      class="community-analysis-popup"
    >
      <div class="popup-header">
        <h3>📊 玩家社区分析</h3>
        <van-icon name="cross" size="20" @click="showCommunityAnalysis = false" />
      </div>
      <div class="popup-content">
        <PlayerSegments />
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useOperationStore } from '@/stores/operationStore';
import { usePlayerStore } from '@/stores/playerStore';
import { showToast, showSuccessToast } from 'vant';
import { resolveCrisis, type Crisis, type CrisisOption } from '@/types/crisis';
import OperationDashboard from '@/components/operation/OperationDashboard.vue';
import GachaPoolTab from '@/components/operation/GachaPoolTab.vue';
import EventCenterTab from '@/components/operation/EventCenterTab.vue';
import IncidentTab from '@/components/operation/IncidentTab.vue';
import PlayerDataTab from '@/components/operation/PlayerDataTab.vue';
import WelfareTab from '@/components/operation/WelfareTab.vue';
import EffectTrackingTab from '@/components/operation/EffectTrackingTab.vue';
import ConfessionWall from '@/components/social/ConfessionWall.vue';
import FanCreationSquare from '@/components/social/FanCreationSquare.vue';
import MarketDashboard from '@/components/market/MarketDashboard.vue';
import CrisisAlert from '@/components/crisis/CrisisAlert.vue';
import PlayerSegments from '@/components/community/PlayerSegments.vue';

const route = useRoute();
const operationStore = useOperationStore();
const playerStore = usePlayerStore();

const activeTab = ref(0);
const showCommunityAnalysis = ref(false);
const crises = ref<Crisis[]>([]);

const gachaPoolTabRef = ref<InstanceType<typeof GachaPoolTab> | null>(null);
const eventCenterTabRef = ref<InstanceType<typeof EventCenterTab> | null>(null);

function handleOpenCreatePool() {
  activeTab.value = 0;
  gachaPoolTabRef.value?.openCreatePool();
}

function handleOpenCreateEvent() {
  activeTab.value = 1;
  eventCenterTabRef.value?.openCreateEvent();
}

function handleSimulateDay() {
  operationStore.simulateOneDay();
  showToast('已模拟一天运营数据');
}

function handleResolveCrisis(crisisId: string, option: CrisisOption) {
  const crisisIndex = crises.value.findIndex(c => c.id === crisisId);
  if (crisisIndex === -1) return;

  const crisis = crises.value[crisisIndex];
  const resolution = resolveCrisis(crisis, option, {
    satisfaction: 70,
    playerCount: playerStore.players.length,
    reputation: operationStore.stats.reputation
  });

  crisis.resolution = resolution;

  if (resolution.outcome === 'success') {
    crisis.status = 'resolved';
    crisis.isResolved = true;
    showSuccessToast('危机已成功解决！');
    setTimeout(() => {
      crises.value = crises.value.filter(c => c.id !== crisisId);
    }, 3000);
    return;
  }

  if (resolution.outcome === 'partial') {
    crisis.status = 'handling';
    showToast('危机已部分缓解，请继续关注后续舆情');
    return;
  }

  crisis.status = 'escalated';
  showToast('处理失败，请尝试其他方案');
}

function handleUrlParams() {
  const action = route.query.action as string | undefined;
  const templateStr = route.query.template as string | undefined;

  if (!action || !templateStr) return;

  try {
    const template = JSON.parse(templateStr);

    switch (action) {
      case 'welfare':
        activeTab.value = 4;
        showToast(`已预填充${template.type === 'batch_recall' ? '批量召回' : '福利'}配置，请确认后发放`);
        break;

      case 'event':
        activeTab.value = 1;
        setTimeout(() => {
          eventCenterTabRef.value?.openCreateEvent();
        }, 300);
        showToast('已预填充活动配置，请确认后创建');
        break;

      case 'gacha':
        activeTab.value = 0;
        showToast('已切换到卡池管理，请创建卡池');
        break;

      default:
        break;
    }
  } catch (e) {
    console.error('解析URL参数失败:', e);
  }
}

onMounted(() => {
  operationStore.initDefaultData();
  operationStore.loadTrackedEffects();
  crises.value = [];
  handleUrlParams();
});
</script>

<style scoped lang="scss">
.operation-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  padding: 16px;
  padding-bottom: 80px;
}

.community-analysis-section {
  margin: 16px 0;

  :deep(.van-cell) {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .analysis-icon {
    font-size: 24px;
    margin-right: 12px;
    display: flex;
    align-items: center;
  }
}

.community-analysis-popup {
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    background: white;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .popup-content {
    height: calc(100% - 60px);
    overflow-y: auto;
    padding: 16px;
    background: #f5f5f5;
  }
}

.operation-tabs {
  background: white;
  border-radius: 12px;
  overflow: hidden;

  :deep(.van-tabs__nav) {
    background: white;
  }
}

.tab-content {
  padding: 16px;
  min-height: 300px;

  &.no-padding {
    padding: 0;
  }
}
</style>
