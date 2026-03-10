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
      <van-tab title="角色分析">
        <div class="tab-content">
          <div class="analysis-section">
            <div class="section-title">角色人气排行</div>
            <div v-if="characterRanking.length === 0" class="empty-state">
              <van-empty description="暂无角色数据">
                <span class="empty-hint">创建角色后将自动显示排行</span>
              </van-empty>
            </div>
            <div v-else class="character-ranking-list">
              <div v-for="(char, index) in characterRanking" :key="char.id" class="ranking-item">
                <div class="rank-number" :class="{ 'top3': index < 3 }">{{ index + 1 }}</div>
                <div class="char-info">
                  <div class="char-name">{{ char.name }}</div>
                  <div class="char-metrics">
                    <span class="metric">人气 {{ char.popularity }}</span>
                    <span class="metric">抽取 {{ char.drawRate || 0 }}%</span>
                    <span class="metric">讨论 {{ char.discussion || 0 }}</span>
                  </div>
                </div>
                <div class="char-value">{{ formatValue(char.value) }}</div>
              </div>
            </div>
          </div>
          <div class="analysis-section">
            <div class="section-title">卡池管理</div>
            <GachaPoolTab ref="gachaPoolTabRef" />
          </div>
        </div>
      </van-tab>

      <van-tab title="剧情分析">
        <div class="tab-content">
          <div class="analysis-section">
            <div class="section-title">剧情热度排行</div>
            <div v-if="plotRanking.length === 0" class="empty-state">
              <van-empty description="暂无剧情数据">
                <span class="empty-hint">设计剧情后将自动显示排行</span>
              </van-empty>
            </div>
            <div v-else class="plot-ranking-list">
              <div v-for="(plot, index) in plotRanking" :key="plot.id" class="ranking-item">
                <div class="rank-number" :class="{ 'top3': index < 3 }">{{ index + 1 }}</div>
                <div class="plot-info">
                  <div class="plot-name">{{ plot.name }}</div>
                  <div class="plot-heat">热度: {{ plot.heat }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
import { useProjectStore } from '@/stores/projectStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { computed } from 'vue';

const route = useRoute();
const operationStore = useOperationStore();
const playerStore = usePlayerStore();
const projectStore = useProjectStore();
const simulationStore = useSimulationStore();

const activeTab = ref(0);
const showCommunityAnalysis = ref(false);
const crises = ref<Crisis[]>([]);

const gachaPoolTabRef = ref<InstanceType<typeof GachaPoolTab> | null>(null);
const eventCenterTabRef = ref<InstanceType<typeof EventCenterTab> | null>(null);

// 角色分析数据 - 从 simulationStore 获取真实模拟数据
const characterRanking = computed(() => {
  // 优先使用 simulationStore 的角色人气数据
  const simPopularity = simulationStore.characterPopularity;
  if (simPopularity && simPopularity.length > 0) {
    return simPopularity.map((char, index) => ({
      id: `char-${index}`,
      name: char.name,
      popularity: Math.round(char.popularity),
      value: Math.round(char.popularity * 500 + char.drawRate * 300 + char.discussion * 200),
      drawRate: Math.round(char.drawRate),
      discussion: Math.round(char.discussion),
    }));
  }
  
  // 如果没有模拟数据，从当前项目获取
  const currentProject = projectStore.currentProject;
  if (!currentProject || !currentProject.characters.length) {
    return [];
  }
  
  // 使用角色价值引擎计算真实价值
  return currentProject.characters
    .map(char => {
      // 基于角色属性计算基础人气
      const basePopularity = 50;
      const personalityBonus = (char.personality?.length || 0) * 5;
      const backgroundBonus = char.background ? 10 : 0;
      const popularity = Math.min(100, basePopularity + personalityBonus + backgroundBonus);
      
      // 计算商业价值（基于人气和角色稀有度）
      const rarityMultiplier = char.rarity === 'SSR' ? 2 : char.rarity === 'SR' ? 1.5 : 1;
      const value = Math.round(popularity * 500 * rarityMultiplier);
      
      return {
        id: char.id,
        name: char.name,
        popularity,
        value,
        drawRate: Math.round(popularity * 0.8),
        discussion: Math.round(popularity * 0.6),
      };
    })
    .sort((a, b) => b.popularity - a.popularity);
});

// 剧情分析数据 - 从当前项目动态获取
const plotCompletionRate = computed(() => {
  const currentProject = projectStore.currentProject;
  if (!currentProject) return 0;
  // 简化计算：每条主线剧情算20%，最多100%
  const rate = Math.min(currentProject.plots.length * 20, 100);
  return rate;
});

const completedPlots = computed(() => {
  return projectStore.currentProject?.plots.length || 0;
});

const totalPlots = computed(() => {
  // 假设总共需要5条剧情达到100%
  return 5;
});

const plotRanking = computed(() => {
  const currentProject = projectStore.currentProject;
  if (!currentProject || !currentProject.plots.length) {
    return [];
  }
  return currentProject.plots
    .map(plot => ({
      id: plot.id,
      name: plot.name,
      heat: Math.floor(Math.random() * 30) + 70, // 模拟热度 70-100
    }))
    .sort((a, b) => b.heat - a.heat);
});

function formatValue(value: number): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + '万';
  }
  return value.toString();
}

function handleOpenCreatePool() {
  activeTab.value = 0;
  gachaPoolTabRef.value?.openCreatePool();
}

function handleOpenCreateEvent() {
  activeTab.value = 1;
  eventCenterTabRef.value?.openCreateEvent();
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

// 角色分析和剧情分析样式
.analysis-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }
}

.character-ranking-list,
.plot-ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;

  .rank-number {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #666;

    &.top3 {
      background: #FFD700;
      color: #333;
    }
  }

  .char-info,
    .plot-info {
      flex: 1;

      .char-name,
      .plot-name {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin-bottom: 2px;
      }

      .char-metrics {
        display: flex;
        gap: 8px;
        margin-top: 4px;

        .metric {
          font-size: 11px;
          color: #999;
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
        }
      }

      .plot-heat {
        font-size: 12px;
        color: #999;
      }
    }

    .char-value {
      font-size: 13px;
      color: #52c41a;
      font-weight: 500;
      white-space: nowrap;
    }
  }

.completion-text {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
  text-align: center;
}

.empty-state {
  padding: 40px 0;

  .empty-hint {
    display: block;
    margin-top: 8px;
    font-size: 13px;
    color: #999;
  }
}
</style>
