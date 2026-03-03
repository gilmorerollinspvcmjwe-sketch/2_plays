<template>
  <div class="branch-preview">
    <van-nav-bar title="剧情分支预览" left-arrow @click-left="$emit('close')" />

    <div class="preview-content">
      <!-- 路径模拟器 -->
      <van-cell-group class="simulator-section" inset>
        <div class="section-header">
          <van-icon name="guide-o" />
          <span>剧情走向模拟</span>
        </div>

        <div class="simulator-path">
          <div
            v-for="(node, index) in simulationPath"
            :key="node.id"
            class="path-node"
            :class="{ 'choice-node': node.type === 'choice', 'active': currentNodeIndex === index }"
          >
            <div class="node-connector" v-if="index > 0">
              <van-icon name="arrow-down" />
            </div>
            <div class="node-content">
              <van-tag :type="getNodeTypeColor(node.type)" size="small">
                {{ getNodeTypeLabel(node.type) }}
              </van-tag>
              <div class="node-text">{{ node.content }}</div>
            </div>

            <!-- 选择分支 -->
            <div v-if="node.type === 'choice' && currentNodeIndex === index" class="choice-options">
              <van-button
                v-for="option in node.options"
                :key="option.id"
                type="primary"
                plain
                size="small"
                block
                class="choice-btn"
                @click="selectOption(option)"
              >
                {{ option.text }}
              </van-button>
            </div>
          </div>
        </div>

        <div class="simulator-actions" v-if="currentNodeIndex < simulationPath.length - 1">
          <van-button type="primary" block round @click="continueSimulation">
            继续剧情
          </van-button>
        </div>
        <div class="simulator-actions" v-else-if="reachedEnding">
          <van-tag type="success" size="large" class="ending-tag">
            已到达结局: {{ currentEnding?.name }}
          </van-tag>
          <van-button type="primary" plain block round @click="resetSimulation">
            重新开始模拟
          </van-button>
        </div>
      </van-cell-group>

      <!-- 多结局预览 -->
      <van-cell-group class="endings-section" inset>
        <div class="section-header">
          <van-icon name="medal-o" />
          <span>多结局预览 ({{ endings.length }}个)</span>
        </div>

        <div class="endings-list">
          <div
            v-for="ending in endings"
            :key="ending.id"
            class="ending-card"
            :class="{ 'reachable': isEndingReachable(ending.id), 'selected': selectedEnding?.id === ending.id }"
            @click="selectEnding(ending)"
          >
            <div class="ending-header">
              <van-tag :type="getEndingTypeColor(ending.type)">
                {{ getEndingTypeLabel(ending.type) }}
              </van-tag>
              <span class="ending-name">{{ ending.name }}</span>
              <span class="ending-probability" v-if="endingProbabilities[ending.id]">
                {{ endingProbabilities[ending.id] }}%
              </span>
            </div>
            <div class="ending-condition">
              <van-icon name="info-o" />
              <span>{{ ending.condition }}</span>
            </div>
            <div class="ending-description">{{ ending.description }}</div>
          </div>
        </div>
      </van-cell-group>

      <!-- 时长估算 -->
      <van-cell-group class="duration-section" inset>
        <div class="section-header">
          <van-icon name="clock-o" />
          <span>剧情时长估算</span>
        </div>

        <div class="duration-stats">
          <div class="duration-item">
            <div class="duration-label">最短路径</div>
            <div class="duration-value">{{ minDuration }}分钟</div>
            <div class="duration-bar">
              <div class="bar-fill" :style="{ width: (minDuration / maxDuration * 100) + '%' }"></div>
            </div>
          </div>
          <div class="duration-item">
            <div class="duration-label">平均时长</div>
            <div class="duration-value highlight">{{ avgDuration }}分钟</div>
            <div class="duration-bar">
              <div class="bar-fill highlight" :style="{ width: (avgDuration / maxDuration * 100) + '%' }"></div>
            </div>
          </div>
          <div class="duration-item">
            <div class="duration-label">最长路径</div>
            <div class="duration-value">{{ maxDuration }}分钟</div>
            <div class="duration-bar">
              <div class="bar-fill" :style="{ width: '100%' }"></div>
            </div>
          </div>
        </div>

        <van-divider>阅读统计</van-divider>

        <van-row gutter="16" class="reading-stats">
          <van-col span="8">
            <div class="stat-box">
              <div class="stat-number">{{ totalNodes }}</div>
              <div class="stat-label">总节点</div>
            </div>
          </van-col>
          <van-col span="8">
            <div class="stat-box">
              <div class="stat-number">{{ choiceNodes }}</div>
              <div class="stat-label">选择点</div>
            </div>
          </van-col>
          <van-col span="8">
            <div class="stat-box">
              <div class="stat-number">{{ textNodes }}</div>
              <div class="stat-label">文本量</div>
            </div>
          </van-col>
        </van-row>
      </van-cell-group>

      <!-- 路径对比 -->
      <van-cell-group class="comparison-section" inset v-if="selectedPaths.length > 0">
        <div class="section-header">
          <van-icon name="exchange" />
          <span>路径对比</span>
        </div>

        <div class="path-comparison">
          <div
            v-for="(path, index) in selectedPaths"
            :key="index"
            class="comparison-path"
            :class="{ 'path-a': index === 0, 'path-b': index === 1 }"
          >
            <div class="path-header">
              <span class="path-label">路径 {{ String.fromCharCode(65 + index) }}</span>
              <van-tag type="primary">{{ path.ending }}</van-tag>
            </div>
            <div class="path-nodes">
              <div
                v-for="node in path.nodes"
                :key="node.id"
                class="comparison-node"
                :class="{ 'divergent': node.isDivergent }"
              >
                <van-icon :name="node.icon" />
                <span class="node-name">{{ node.name }}</span>
              </div>
            </div>
            <div class="path-stats">
              <span>{{ path.nodeCount }}个节点</span>
              <span>{{ path.duration }}分钟</span>
            </div>
          </div>
        </div>

        <div class="divergence-point" v-if="divergenceNode">
          <van-notice-bar
            left-icon="branch-o"
            text="两条路径在此处产生分歧"
            color="#1989fa"
            background="#ecf9ff"
          />
          <div class="divergence-info">
            <span class="divergence-label">分歧点:</span>
            <span class="divergence-text">{{ divergenceNode.content }}</span>
          </div>
        </div>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { PlotBranch, PlotNode, Ending } from '@/types/plotBranch';

interface Props {
  plotBranch: PlotBranch;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'selectEnding']);

// 模拟状态
const simulationPath = ref<PlotNode[]>([]);
const currentNodeIndex = ref(0);
const reachedEnding = ref(false);
const currentEnding = ref<Ending | null>(null);
const selectedEnding = ref<Ending | null>(null);

// 结局数据
const endings = computed(() => props.plotBranch?.endings || []);

// 结局可达性概率
const endingProbabilities = computed(() => {
  const probs: Record<string, number> = {};
  endings.value.forEach(ending => {
    probs[ending.id] = Math.round(ending.probability * 100);
  });
  return probs;
});

// 时长统计
const minDuration = computed(() => {
  const minNodes = Math.min(...endings.value.map(e => e.requiredNodes.length));
  return Math.round(minNodes * 0.5); // 假设每个节点0.5分钟
});

const maxDuration = computed(() => {
  const maxNodes = Math.max(...endings.value.map(e => e.requiredNodes.length));
  return Math.round(maxNodes * 0.5);
});

const avgDuration = computed(() => {
  if (endings.value.length === 0) return 0;
  const totalNodes = endings.value.reduce((sum, e) => sum + e.requiredNodes.length, 0);
  return Math.round((totalNodes / endings.value.length) * 0.5);
});

// 节点统计
const totalNodes = computed(() => props.plotBranch?.nodes?.length || 0);
const choiceNodes = computed(() =>
  props.plotBranch?.nodes?.filter(n => n.type === 'choice').length || 0
);
const textNodes = computed(() =>
  props.plotBranch?.nodes?.reduce((sum, n) => sum + (n.content?.length || 0), 0) || 0
);

// 路径对比
const selectedPaths = ref<Array<{
  ending: string;
  nodes: Array<{ id: string; name: string; icon: string; isDivergent: boolean }>;
  nodeCount: number;
  duration: number;
}>>([]);

const divergenceNode = computed(() => {
  if (selectedPaths.value.length < 2) return null;

  const pathA = selectedPaths.value[0].nodes;
  const pathB = selectedPaths.value[1].nodes;

  // 找到分歧点
  for (let i = 0; i < Math.min(pathA.length, pathB.length); i++) {
    if (pathA[i].id !== pathB[i].id) {
      return props.plotBranch?.nodes?.find(n => n.id === pathA[i].id) || null;
    }
  }
  return null;
});

// 方法
const getNodeTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    start: 'success',
    dialogue: 'primary',
    choice: 'warning',
    condition: 'danger',
    event: 'default',
    ending: 'success'
  };
  return colors[type] || 'default';
};

const getNodeTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    start: '开始',
    dialogue: '对话',
    choice: '选择',
    condition: '条件',
    event: '事件',
    ending: '结局'
  };
  return labels[type] || type;
};

const getEndingTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    happy: 'success',
    sad: 'default',
    normal: 'primary',
    hidden: 'warning',
    bad: 'danger'
  };
  return colors[type] || 'default';
};

const getEndingTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    happy: '完美',
    sad: '伤感',
    normal: '普通',
    hidden: '隐藏',
    bad: '坏结局'
  };
  return labels[type] || type;
};

const isEndingReachable = (endingId: string) => {
  // 简化的可达性检查
  return endingProbabilities.value[endingId] > 0;
};

const selectEnding = (ending: Ending) => {
  selectedEnding.value = ending;

  // 添加到路径对比
  if (selectedPaths.value.length < 2) {
    const pathNodes = ending.requiredNodes.map(nodeId => {
      const node = props.plotBranch?.nodes?.find(n => n.id === nodeId);
      return {
        id: nodeId,
        name: node?.content?.substring(0, 10) + '...' || nodeId,
        icon: getNodeIcon(node?.type || 'dialogue'),
        isDivergent: false
      };
    });

    // 标记分歧点
    if (selectedPaths.value.length === 1) {
      const existingPath = selectedPaths.value[0].nodes;
      pathNodes.forEach((node, index) => {
        if (index >= existingPath.length || existingPath[index].id !== node.id) {
          node.isDivergent = true;
        }
      });
    }

    selectedPaths.value.push({
      ending: ending.name,
      nodes: pathNodes,
      nodeCount: pathNodes.length,
      duration: Math.round(pathNodes.length * 0.5)
    });
  } else {
    // 重置并添加新路径
    selectedPaths.value = [{
      ending: ending.name,
      nodes: ending.requiredNodes.map(nodeId => ({
        id: nodeId,
        name: props.plotBranch?.nodes?.find(n => n.id === nodeId)?.content?.substring(0, 10) + '...' || nodeId,
        icon: 'description',
        isDivergent: false
      })),
      nodeCount: ending.requiredNodes.length,
      duration: Math.round(ending.requiredNodes.length * 0.5)
    }];
  }

  emit('selectEnding', ending);
};

const getNodeIcon = (type: string) => {
  const icons: Record<string, string> = {
    start: 'play-circle-o',
    dialogue: 'chat-o',
    choice: 'question-o',
    condition: 'filter-o',
    event: 'bell-o',
    ending: 'check-circle-o'
  };
  return icons[type] || 'description';
};

const selectOption = (option: any) => {
  // 根据选择继续模拟
  const nextNode = props.plotBranch?.nodes?.find(n => n.id === option.nextNodeId);
  if (nextNode) {
    simulationPath.value.push(nextNode);
    currentNodeIndex.value++;

    if (nextNode.type === 'ending') {
      reachedEnding.value = true;
      currentEnding.value = endings.value.find(e => e.id === nextNode.id) || null;
    }
  }
};

const continueSimulation = () => {
  if (currentNodeIndex.value < simulationPath.value.length - 1) {
    currentNodeIndex.value++;
  }
};

const resetSimulation = () => {
  // 重置模拟
  const startNode = props.plotBranch?.nodes?.find(n => n.type === 'start');
  if (startNode) {
    simulationPath.value = [startNode];
    currentNodeIndex.value = 0;
    reachedEnding.value = false;
    currentEnding.value = null;
  }
};

onMounted(() => {
  // 初始化模拟路径
  resetSimulation();
});
</script>

<style scoped lang="scss">
.branch-preview {
  min-height: 100vh;
  background: #f7f8fa;
}

.preview-content {
  padding: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #ebedf0;
  font-size: 16px;
  font-weight: 600;
  color: #323233;

  .van-icon {
    font-size: 20px;
    color: #1989fa;
  }
}

// 模拟器
.simulator-section {
  margin-bottom: 12px;
}

.simulator-path {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.path-node {
  position: relative;

  .node-connector {
    display: flex;
    justify-content: center;
    padding: 8px 0;
    color: #c8c9cc;
  }

  .node-content {
    background: #f7f8fa;
    border-radius: 8px;
    padding: 12px;

    .node-text {
      margin-top: 8px;
      font-size: 14px;
      color: #323233;
      line-height: 1.5;
    }
  }

  &.active {
    .node-content {
      background: #e3f2fd;
      border: 1px solid #1989fa;
    }
  }

  &.choice-node {
    .node-content {
      background: #fff7e6;
    }
  }
}

.choice-options {
  margin-top: 12px;
  padding-left: 16px;

  .choice-btn {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.simulator-actions {
  padding: 16px;

  .ending-tag {
    display: block;
    text-align: center;
    margin-bottom: 12px;
    padding: 12px;
  }
}

// 结局预览
.endings-section {
  margin-bottom: 12px;
}

.endings-list {
  padding: 8px;
}

.ending-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  opacity: 0.5;
  transition: all 0.3s;

  &:last-child {
    margin-bottom: 0;
  }

  &.reachable {
    opacity: 1;
    cursor: pointer;

    &:active {
      transform: scale(0.98);
    }
  }

  &.selected {
    background: #e3f2fd;
    border: 1px solid #1989fa;
  }

  .ending-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .ending-name {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
      color: #323233;
    }

    .ending-probability {
      font-size: 12px;
      color: #07c160;
      font-weight: 500;
    }
  }

  .ending-condition {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #969799;
    margin-bottom: 4px;

    .van-icon {
      font-size: 14px;
    }
  }

  .ending-description {
    font-size: 12px;
    color: #666;
    line-height: 1.4;
  }
}

// 时长估算
.duration-section {
  margin-bottom: 12px;
}

.duration-stats {
  padding: 16px;
}

.duration-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .duration-label {
    font-size: 12px;
    color: #969799;
    margin-bottom: 4px;
  }

  .duration-value {
    font-size: 18px;
    font-weight: 700;
    color: #323233;
    margin-bottom: 8px;

    &.highlight {
      color: #1989fa;
    }
  }

  .duration-bar {
    height: 8px;
    background: #ebedf0;
    border-radius: 4px;
    overflow: hidden;

    .bar-fill {
      height: 100%;
      background: #07c160;
      border-radius: 4px;
      transition: width 0.5s ease;

      &.highlight {
        background: #1989fa;
      }
    }
  }
}

.reading-stats {
  padding: 16px;

  .stat-box {
    text-align: center;
    padding: 12px;
    background: #f7f8fa;
    border-radius: 8px;

    .stat-number {
      font-size: 20px;
      font-weight: 700;
      color: #323233;
    }

    .stat-label {
      font-size: 12px;
      color: #969799;
      margin-top: 4px;
    }
  }
}

// 路径对比
.comparison-section {
  margin-bottom: 12px;
}

.path-comparison {
  display: flex;
  gap: 12px;
  padding: 16px;
}

.comparison-path {
  flex: 1;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;

  &.path-a {
    border-left: 3px solid #1989fa;
  }

  &.path-b {
    border-left: 3px solid #07c160;
  }

  .path-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .path-label {
      font-size: 14px;
      font-weight: 600;
      color: #323233;
    }
  }

  .path-nodes {
    .comparison-node {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 0;
      font-size: 12px;
      color: #666;

      &.divergent {
        color: #ff6b6b;
        font-weight: 500;

        .van-icon {
          color: #ff6b6b;
        }
      }

      .van-icon {
        font-size: 14px;
        color: #969799;
      }
    }
  }

  .path-stats {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #ebedf0;
    font-size: 12px;
    color: #969799;
  }
}

.divergence-point {
  padding: 0 16px 16px;

  .divergence-info {
    margin-top: 12px;
    padding: 12px;
    background: #fff7e6;
    border-radius: 8px;

    .divergence-label {
      font-size: 12px;
      color: #ff976a;
      font-weight: 500;
    }

    .divergence-text {
      font-size: 13px;
      color: #323233;
      margin-left: 8px;
    }
  }
}
</style>
