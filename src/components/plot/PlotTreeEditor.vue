<template>
  <div class="plot-tree-editor">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-left">
        <van-button icon="arrow-left" size="small" plain @click="goBack">返回</van-button>
      </div>
      <div class="header-title">剧情树编辑器</div>
      <div class="header-right">
        <van-button icon="checked" size="small" type="primary" @click="saveAndReturn">保存并返回</van-button>
      </div>
    </div>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-section">
        <span class="section-title">添加节点</span>
        <div class="node-buttons">
          <button
            v-for="type in nodeTypes"
            :key="type.value"
            class="node-btn"
            :class="type.value"
            @click="addNode(type.value)"
          >
            <van-icon :name="type.icon" />
            {{ type.label }}
          </button>
        </div>
      </div>
      <div class="toolbar-section">
        <span class="section-title">操作</span>
        <div class="action-buttons">
          <button class="action-btn" @click="clearSelection">
            <van-icon name="cross" />
            取消选择
          </button>
          <button class="action-btn delete" @click="deleteSelectedNode" :disabled="!selectedNode">
            <van-icon name="delete-o" />
            删除节点
          </button>
          <button class="action-btn save" @click="savePlot">
            <van-icon name="success" />
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 画布区域 -->
    <div
      class="canvas-container"
      ref="canvasRef"
      @mousedown="handleCanvasMouseDown"
      @mousemove="handleCanvasMouseMove"
      @mouseup="handleCanvasMouseUp"
      @wheel="handleWheel"
    >
      <!-- 网格背景 -->
      <div class="grid-background" :style="gridStyle"></div>

      <!-- SVG 连接线 -->
      <svg class="connections-layer" :style="svgStyle">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="28"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#999" />
          </marker>
        </defs>
        <path
          v-for="(connection, index) in connections"
          :key="index"
          :d="connection.path"
          class="connection-line"
          :class="{ active: connection.active }"
          marker-end="url(#arrowhead)"
          @click="selectConnection(connection)"
        />
      </svg>

      <!-- 节点层 -->
      <div class="nodes-layer" :style="nodesLayerStyle">
        <div
          v-for="node in plot.nodes"
          :key="node.id"
          class="plot-node"
          :class="[node.type, { selected: selectedNode?.id === node.id }]"
          :style="getNodeStyle(node)"
          @mousedown.stop="handleNodeMouseDown($event, node)"
          @mousemove.stop="handleNodeMouseMove($event, node)"
          @mouseup.stop="handleNodeMouseUp($event, node)"
          @click.stop="selectNode(node)"
        >
          <div class="node-header">
            <van-icon :name="getNodeIcon(node.type)" />
            <span class="node-type-label">{{ getNodeTypeLabel(node.type) }}</span>
          </div>
          <div class="node-content">
            <p class="node-text">{{ node.content || '点击编辑' }}</p>
          </div>
          <div class="node-ports">
            <div class="port input" @mousedown.stop="startConnection($event, node, 'input')"></div>
            <div class="port output" @mousedown.stop="startConnection($event, node, 'output')"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 属性面板 -->
    <div v-if="selectedNode" class="properties-panel">
      <h4>节点属性</h4>
      <div class="property-group">
        <label>内容</label>
        <textarea
          v-model="selectedNode.content"
          rows="3"
          placeholder="输入节点内容..."
        ></textarea>
      </div>
      <div class="property-group" v-if="selectedNode.type === 'choice'">
        <label>选项设置 ({{ selectedNode.connections.length }}个选项)</label>
        <div v-for="(conn, idx) in selectedNode.connections" :key="idx" class="choice-option">
          <input
            :value="'选项' + (idx + 1) + ': ' + conn"
            placeholder="选项文字"
            readonly
          />
        </div>
        <button class="add-option-btn" @click="addChoiceOption">
          <van-icon name="plus" /> 添加选项
        </button>
      </div>
      <div class="property-group">
        <label>情感值</label>
        <van-slider v-model="selectedNode.emotion" :min="-1" :max="1" :step="0.1" />
        <span class="emotion-value">{{ selectedNode.emotion > 0 ? '+' : '' }}{{ selectedNode.emotion }}</span>
      </div>
    </div>

    <!-- 质量报告 -->
    <div class="quality-report" v-if="showQualityReport">
      <h4>剧情质量报告</h4>
      <div class="score-section">
        <div class="score-item">
          <span class="label">逻辑性</span>
          <van-progress :percentage="qualityReport.logicScore" :color="getScoreColor(qualityReport.logicScore)" />
        </div>
        <div class="score-item">
          <span class="label">情感浓度</span>
          <van-progress :percentage="qualityReport.emotionScore" :color="getScoreColor(qualityReport.emotionScore)" />
        </div>
        <div class="score-item">
          <span class="label">分支丰富度</span>
          <van-progress :percentage="qualityReport.branchScore" :color="getScoreColor(qualityReport.branchScore)" />
        </div>
        <div class="overall-score">
          <span class="label">综合评分</span>
          <span class="score" :style="{ color: getScoreColor(qualityReport.overallScore) }">
            {{ qualityReport.overallScore }}
          </span>
        </div>
      </div>
      <div class="issues-section" v-if="qualityReport.issues.length > 0">
        <h5>问题</h5>
        <ul>
          <li v-for="(issue, idx) in qualityReport.issues" :key="idx">{{ issue }}</li>
        </ul>
      </div>
      <div class="suggestions-section" v-if="qualityReport.suggestions.length > 0">
        <h5>建议</h5>
        <ul>
          <li v-for="(suggestion, idx) in qualityReport.suggestions" :key="idx">{{ suggestion }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter as useVanillaRouter } from 'vue-router';
import type { PlotBranch, PlotNode, PlotNodeType } from '@/types/plotBranch';
import { initPlotBranch, analyzePlotQuality } from '@/types/plotBranch';
import { showToast, showDialog } from 'vant';
import { useGameStore } from '@/stores/gameStore';
import { storeToRefs } from 'pinia';

const route = useRoute();
const vanRouter = useVanillaRouter();
const gameStore = useGameStore();
const { currentGame } = storeToRefs(gameStore);

const props = defineProps<{
  initialPlot?: PlotBranch;
  plotId?: string;
}>();

const emit = defineEmits<{
  (e: 'save', plot: PlotBranch): void;
  (e: 'back'): void;
}>();

// 剧情数据
const plot = reactive<PlotBranch>(props.initialPlot || initPlotBranch());

// 画布状态
const canvasRef = ref<HTMLElement | null>(null);
const scale = ref(1);
const offset = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const isConnecting = ref(false);
const dragNode = ref<PlotNode | null>(null);
const selectedNode = ref<PlotNode | null>(null);
const connectionStart = ref<{ node: PlotNode; type: 'input' | 'output' } | null>(null);
const mousePos = ref({ x: 0, y: 0 });
const showQualityReport = ref(true);

// 节点类型配置
const nodeTypes = [
  { value: 'start' as PlotNodeType, label: '开始', icon: 'play-circle-o' },
  { value: 'dialogue' as PlotNodeType, label: '对话', icon: 'chat-o' },
  { value: 'choice' as PlotNodeType, label: '选择', icon: 'question-o' },
  { value: 'condition' as PlotNodeType, label: '条件', icon: 'filter-o' },
  { value: 'event' as PlotNodeType, label: '事件', icon: 'bell-o' },
  { value: 'ending' as PlotNodeType, label: '结局', icon: 'flag-o' }
];

// 质量报告
const qualityReport = computed(() => analyzePlotQuality(plot));

// 样式计算
const gridStyle = computed(() => ({
  backgroundSize: `${20 * scale.value}px ${20 * scale.value}px`,
  transform: `translate(${offset.value.x}px, ${offset.value.y}px)`
}));

const svgStyle = computed(() => ({
  transform: `translate(${offset.value.x}px, ${offset.value.y}px) scale(${scale.value})`
}));

const nodesLayerStyle = computed(() => ({
  transform: `translate(${offset.value.x}px, ${offset.value.y}px) scale(${scale.value})`
}));

// 连接线计算
const connections = computed(() => {
  const lines: { path: string; active: boolean; from: string; to: string }[] = [];
  
  plot.nodes.forEach(node => {
    node.connections.forEach(targetId => {
      const targetNode = plot.nodes.find(n => n.id === targetId);
      if (targetNode) {
        const startX = node.position.x + 100;
        const startY = node.position.y + 30;
        const endX = targetNode.position.x;
        const endY = targetNode.position.y + 30;
        
        // 贝塞尔曲线
        const controlX1 = startX + (endX - startX) / 2;
        const controlY1 = startY;
        const controlX2 = startX + (endX - startX) / 2;
        const controlY2 = endY;
        
        const path = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
        
        lines.push({
          path,
          active: selectedNode.value?.id === node.id || selectedNode.value?.id === targetId,
          from: node.id,
          to: targetId
        });
      }
    });
  });
  
  return lines;
});

// 获取节点样式
function getNodeStyle(node: PlotNode) {
  return {
    left: `${node.position.x}px`,
    top: `${node.position.y}px`
  };
}

// 获取节点图标
function getNodeIcon(type: PlotNodeType): string {
  const icons: Record<string, string> = {
    start: 'play-circle-o',
    dialogue: 'chat-o',
    choice: 'question-o',
    condition: 'filter-o',
    event: 'bell-o',
    ending: 'flag-o'
  };
  return icons[type] || 'circle-o';
}

// 获取节点类型标签
function getNodeTypeLabel(type: PlotNodeType): string {
  const labels: Record<string, string> = {
    start: '开始',
    dialogue: '对话',
    choice: '选择',
    condition: '条件',
    event: '事件',
    ending: '结局'
  };
  return labels[type] || type;
}

// 获取分数颜色
function getScoreColor(score: number): string {
  if (score >= 80) return '#52c41a';
  if (score >= 60) return '#faad14';
  return '#ff4d4f';
}

// 添加节点
function addNode(type: PlotNodeType) {
  const newNode: PlotNode = {
    id: `node_${Date.now()}`,
    type,
    content: type === 'start' ? '剧情开始' : '',
    position: {
      x: 300 + Math.random() * 100,
      y: 200 + Math.random() * 100
    },
    connections: [],
    emotion: 0
  };
  
  if (type === 'ending') {
    newNode.connections = [];
  }
  
  plot.nodes.push(newNode);
  showToast(`已添加${getNodeTypeLabel(type)}节点`);
}

// 选择节点
function selectNode(node: PlotNode) {
  selectedNode.value = node;
}

// 清除选择
function clearSelection() {
  selectedNode.value = null;
}

// 删除选中节点
function deleteSelectedNode() {
  if (!selectedNode.value) return;
  
  const index = plot.nodes.findIndex(n => n.id === selectedNode.value!.id);
  if (index > -1) {
    // 移除其他节点对该节点的连接
    plot.nodes.forEach(node => {
      const connIndex = node.connections.indexOf(selectedNode.value!.id);
      if (connIndex > -1) {
        node.connections.splice(connIndex, 1);
      }
    });
    
    plot.nodes.splice(index, 1);
    selectedNode.value = null;
    showToast('节点已删除');
  }
}

// 添加选择选项
function addChoiceOption() {
  if (!selectedNode.value || selectedNode.value.type !== 'choice') return;
  
  const newNode: PlotNode = {
    id: `node_${Date.now()}`,
    type: 'dialogue',
    content: '选项结果',
    position: {
      x: selectedNode.value.position.x + 200,
      y: selectedNode.value.position.y + selectedNode.value.connections.length * 80
    },
    connections: [],
    emotion: 0
  };
  
  plot.nodes.push(newNode);
  selectedNode.value.connections.push(newNode.id);
}

// 开始连接
function startConnection(event: MouseEvent, node: PlotNode, type: 'input' | 'output') {
  if (type === 'output') {
    isConnecting.value = true;
    connectionStart.value = { node, type };
    event.stopPropagation();
  }
}

// 选择连接
function selectConnection(connection: any) {
  // 可以在这里添加连接编辑功能
}

// 画布鼠标事件
function handleCanvasMouseDown(event: MouseEvent) {
  if (isConnecting.value && connectionStart.value) {
    // 完成连接
    isConnecting.value = false;
    connectionStart.value = null;
  } else {
    // 开始拖拽画布
    isDragging.value = true;
    mousePos.value = { x: event.clientX, y: event.clientY };
  }
}

function handleCanvasMouseMove(event: MouseEvent) {
  const dx = event.clientX - mousePos.value.x;
  const dy = event.clientY - mousePos.value.y;
  
  if (isDragging.value && dragNode.value) {
    // 拖拽节点
    dragNode.value.position.x += dx / scale.value;
    dragNode.value.position.y += dy / scale.value;
    mousePos.value = { x: event.clientX, y: event.clientY };
  } else if (isDragging.value && !dragNode.value) {
    // 拖拽画布
    offset.value.x += dx;
    offset.value.y += dy;
    mousePos.value = { x: event.clientX, y: event.clientY };
  }
}

function handleCanvasMouseUp() {
  isDragging.value = false;
  dragNode.value = null;
}

// 节点鼠标事件
function handleNodeMouseDown(event: MouseEvent, node: PlotNode) {
  event.stopPropagation();
  dragNode.value = node;
  selectedNode.value = node;
  mousePos.value = { x: event.clientX, y: event.clientY };
  isDragging.value = true;
}

// 节点鼠标移动
function handleNodeMouseMove(event: MouseEvent, node: PlotNode) {
  if (isConnecting.value && connectionStart.value) {
    // 正在创建连接，可以显示临时连线
  }
}

// 节点鼠标松开
function handleNodeMouseUp(event: MouseEvent, targetNode: PlotNode) {
  event.stopPropagation();
  if (isConnecting.value && connectionStart.value) {
    const startNode = connectionStart.value.node;
    const portType = connectionStart.value.type;
    
    // 不能连接到自己
    if (startNode.id === targetNode.id) {
      isConnecting.value = false;
      connectionStart.value = null;
      return;
    }
    
    // 如果是从输出端口开始连接
    if (portType === 'output') {
      // 检查是否已存在连接
      if (!startNode.connections.includes(targetNode.id)) {
        startNode.connections.push(targetNode.id);
      }
    }
    
    isConnecting.value = false;
    connectionStart.value = null;
    showToast('连接已创建');
  }
}

// 滚轮缩放
function handleWheel(event: WheelEvent) {
  event.preventDefault();
  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  scale.value = Math.max(0.5, Math.min(2, scale.value + delta));
}

// 保存
function savePlot() {
  if (!currentGame.value) {
    showToast('请先选择游戏');
    return;
  }

  // 计算质量评分（节点数量奖励）
  let qualityBonus = 1.0;
  let achievementUnlocked = false;
  if (plot.nodes.length > 10) {
    qualityBonus = 1.1; // +10%
    achievementUnlocked = true;
    showToast('🎉 剧情大师：复杂剧情质量+10%');
  }

  // 更新剧情数据到 gameStore
  const plotIndex = currentGame.value.plots.findIndex(p => p.id === plot.id);
  if (plotIndex !== -1) {
    // 更新现有剧情
    const game = currentGame.value;
    const existingPlot = game.plots[plotIndex];
    const updatedPlot = {
      ...existingPlot,
      chapters: convertPlotToChapters(plot)
    };
    // 添加扩展属性
    (updatedPlot as any).quality = ((existingPlot as any).quality || 1.0) * qualityBonus;
    (updatedPlot as any).nodeCount = plot.nodes.length;
    (updatedPlot as any).complexity = plot.nodes.length > 10 ? 'complex' : plot.nodes.length > 5 ? 'medium' : 'simple';
    game.plots[plotIndex] = updatedPlot;
    gameStore.saveToLocal();
    showToast('剧情已保存');
  } else {
    // 创建新剧情
    const newPlot: any = {
      id: plot.id,
      title: plot.name,
      summary: plot.description,
      routeType: 'sweet' as const,
      difficulty: plot.nodes.length > 10 ? 'complex' : plot.nodes.length > 5 ? 'medium' : 'simple',
      chapters: convertPlotToChapters(plot),
      characterIds: [],
      createdAt: new Date().toISOString()
    };
    // 添加扩展属性
    newPlot.quality = qualityBonus;
    newPlot.nodeCount = plot.nodes.length;
    gameStore.addPlot(newPlot);
    showToast(achievementUnlocked ? '剧情已创建！解锁剧情大师成就' : '剧情已创建');
  }

  emit('save', plot);
}

// 将 PlotBranch 转换为 Chapter 数组
function convertPlotToChapters(plotBranch: PlotBranch) {
  const chapters: any[] = [];
  const sortedNodes = sortNodesByPosition(plotBranch.nodes);
  
  sortedNodes.forEach((node, index) => {
    const chapter: any = {
      chapter: index + 1,
      title: `${getNodeTypeLabel(node.type)} - ${index + 1}`,
      scene: node.content,
      keyEvent: node.type === 'choice' ? '玩家选择' : node.type === 'ending' ? '结局' : '剧情推进',
      choices: [],
      selectedChoice: 0
    };
    
    if (node.type === 'choice' && node.connections.length > 0) {
      chapter.choices = node.connections.map((_, idx) => `选项${idx + 1}`);
    }
    
    chapters.push(chapter);
  });
  
  return chapters;
}

// 按位置排序节点（简单的从上到下，从左到右排序）
function sortNodesByPosition(nodes: PlotNode[]): PlotNode[] {
  return [...nodes].sort((a, b) => {
    if (a.position.y !== b.position.y) {
      return a.position.y - b.position.y;
    }
    return a.position.x - b.position.x;
  });
}

// 返回
function goBack() {
  const returnTo = route.query.returnTo as string;
  if (returnTo) {
    // 如果是从其他页面跳转过来的，返回原页面
    vanRouter.push(returnTo);
  } else {
    emit('back');
    vanRouter.back();
  }
}

// 保存并返回
function saveAndReturn() {
  savePlot();
  const returnTo = route.query.returnTo as string;
  if (returnTo) {
    // 检查是否是通过 window.open 打开的新窗口
    if (window.opener) {
      window.close();
    } else {
      vanRouter.push(returnTo);
    }
  } else {
    emit('back');
    vanRouter.back();
  }
}

// 加载现有剧情
function loadPlot(plotId: string) {
  if (!currentGame.value) return;

  const plotData = currentGame.value.plots.find(p => p.id === plotId);
  if (plotData) {
    // 将 Chapter 数据转换回 PlotBranch
    const convertedPlot = convertChaptersToPlot(plotData);
    Object.assign(plot, convertedPlot);
  }
}

// 根据项目ID加载剧情
function loadProjectPlots(projectId: string) {
  if (!currentGame.value) return;

  // 查找项目中关联的剧情（使用类型断言访问扩展属性）
  const projectPlot = currentGame.value.plots.find(p => (p as any).projectId === projectId);
  if (projectPlot) {
    const convertedPlot = convertChaptersToPlot(projectPlot);
    Object.assign(plot, convertedPlot);
    showToast('已加载项目关联的剧情');
  } else {
    // 创建新剧情，关联到项目
    plot.name = '新剧情';
    showToast('为项目创建新剧情');
  }
}

// 将 Chapter 转换为 PlotBranch
function convertChaptersToPlot(plotData: any): PlotBranch {
  const plotBranch = initPlotBranch();
  plotBranch.id = plotData.id;
  plotBranch.name = plotData.title;
  plotBranch.description = plotData.summary;

  // 根据章节创建节点
  if (plotData.chapters && plotData.chapters.length > 0) {
    plotData.chapters.forEach((chapter: any, index: number) => {
      let nodeType: PlotNodeType = 'dialogue';
      if (index === 0) nodeType = 'start';
      if (chapter.choices && chapter.choices.length > 0) nodeType = 'choice';
      if (chapter.keyEvent === '结局') nodeType = 'ending';

      plotBranch.nodes.push({
        id: `node_${index}`,
        type: nodeType,
        content: chapter.scene,
        position: {
          x: 400,
          y: 50 + index * 150
        },
        connections: [],
        emotion: 0
      });
    });

    // 连接节点
    for (let i = 0; i < plotBranch.nodes.length - 1; i++) {
      plotBranch.nodes[i].connections.push(plotBranch.nodes[i + 1].id);
    }
  }

  return plotBranch;
}

onMounted(() => {
  // 如果有 plotId 参数，加载现有剧情
  const plotId = props.plotId || (route.query.plotId as string);
  if (plotId) {
    loadPlot(plotId);
  }

  // 解析 projectId 和 returnTo 参数
  const projectId = route.query.projectId as string;
  const returnTo = route.query.returnTo as string;

  if (projectId) {
    loadProjectPlots(projectId);
  }
});
</script>

<style scoped lang="scss">
.plot-tree-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  
  .header-left,
  .header-right {
    flex: 1;
  }
  
  .header-right {
    display: flex;
    justify-content: flex-end;
  }
  
  .header-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    text-align: center;
  }
}

.toolbar {
  display: flex;
  gap: 20px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  
  .toolbar-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .section-title {
      font-size: 12px;
      color: #999;
    }
  }
}

.node-buttons {
  display: flex;
  gap: 8px;
}

.node-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
  
  &:hover {
    border-color: #FF69B4;
    color: #FF69B4;
  }
  
  &.dialogue { border-color: #1890ff; color: #1890ff; }
  &.choice { border-color: #faad14; color: #faad14; }
  &.condition { border-color: #722ed1; color: #722ed1; }
  &.event { border-color: #52c41a; color: #52c41a; }
  &.ending { border-color: #ff4d4f; color: #ff4d4f; }
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  
  &:hover:not(:disabled) {
    border-color: #FF69B4;
    color: #FF69B4;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.delete:hover:not(:disabled) {
    border-color: #ff4d4f;
    color: #ff4d4f;
  }
  
  &.save {
    background: #52c41a;
    color: white;
    border-color: #52c41a;
    
    &:hover {
      background: #73d13d;
    }
  }
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
}

.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(to right, #e8e8e8 1px, transparent 1px),
    linear-gradient(to bottom, #e8e8e8 1px, transparent 1px);
  pointer-events: none;
}

.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  .connection-line {
    fill: none;
    stroke: #999;
    stroke-width: 2;
    pointer-events: stroke;
    cursor: pointer;
    
    &:hover {
      stroke: #FF69B4;
      stroke-width: 3;
    }
    
    &.active {
      stroke: #FF69B4;
    }
  }
}

.nodes-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.plot-node {
  position: absolute;
  width: 200px;
  background: white;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  cursor: move;
  user-select: none;
  transition: box-shadow 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.selected {
    border-color: #FF69B4;
    box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.2);
  }
  
  &.start { border-color: #52c41a; background: #f6ffed; }
  &.dialogue { border-color: #1890ff; background: #e6f7ff; }
  &.choice { border-color: #faad14; background: #fffbe6; }
  &.condition { border-color: #722ed1; background: #f9f0ff; }
  &.event { border-color: #52c41a; background: #f6ffed; }
  &.ending { border-color: #ff4d4f; background: #fff1f0; }
  
  .node-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: 6px 6px 0 0;
    font-size: 12px;
    font-weight: bold;
  }
  
  .node-content {
    padding: 12px;
    
    .node-text {
      margin: 0;
      font-size: 13px;
      color: #333;
      line-height: 1.5;
      min-height: 40px;
    }
  }
  
  .node-ports {
    position: relative;
    height: 20px;
    
    .port {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #999;
      border-radius: 50%;
      top: 50%;
      transform: translateY(-50%);
      cursor: crosshair;
      
      &:hover {
        background: #FF69B4;
        transform: translateY(-50%) scale(1.2);
      }
      
      &.input {
        left: -6px;
      }
      
      &.output {
        right: -6px;
      }
    }
  }
}

.properties-panel {
  position: fixed;
  right: 20px;
  top: 80px;
  width: 280px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  
  h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #333;
  }
  
  .property-group {
    margin-bottom: 16px;
    
    label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 6px;
    }
    
    textarea,
    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 13px;
      
      &:focus {
        outline: none;
        border-color: #FF69B4;
      }
    }
    
    .emotion-value {
      display: block;
      text-align: center;
      margin-top: 4px;
      font-size: 12px;
      color: #666;
    }
  }
  
  .choice-option {
    margin-bottom: 8px;
    
    input {
      width: 100%;
    }
  }
  
  .add-option-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 12px;
    color: #666;
    
    &:hover {
      border-color: #FF69B4;
      color: #FF69B4;
    }
  }
}

.quality-report {
  position: fixed;
  left: 20px;
  bottom: 20px;
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
  
  h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #333;
  }
  
  .score-section {
    margin-bottom: 16px;
    
    .score-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      
      .label {
        width: 70px;
        font-size: 12px;
        color: #666;
      }
      
      .van-progress {
        flex: 1;
      }
    }
    
    .overall-score {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #e8e8e8;
      
      .label {
        font-size: 13px;
        font-weight: bold;
        color: #333;
      }
      
      .score {
        font-size: 24px;
        font-weight: bold;
      }
    }
  }
  
  .issues-section,
  .suggestions-section {
    margin-bottom: 12px;
    
    h5 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #666;
    }
    
    ul {
      margin: 0;
      padding-left: 16px;
      
      li {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }
    }
  }
}
</style>
