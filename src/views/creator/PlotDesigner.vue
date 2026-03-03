<template>
  <div class="plot-designer">
    <!-- 游戏信息提示 -->
    <div v-if="gameStore.currentGame" class="game-info">
      <van-tag type="primary" size="medium">
        📁 {{ gameStore.currentGame.title }}
      </van-tag>
    </div>
    <div v-else class="game-info">
      <van-tag type="warning" size="medium">
        ⚠️ 未选择游戏项目
      </van-tag>
    </div>

    <!-- 路线选择 -->
    <van-tabs v-model:active="selectedRoute" class="route-tabs">
      <van-tab name="sweet" title="甜宠">
        <div class="route-description">甜蜜的恋爱故事，HE 结局</div>
      </van-tab>
      <van-tab name="angst" title="虐恋">
        <div class="route-description">虐心虐身，玻璃渣里找糖</div>
      </van-tab>
      <van-tab name="suspense" title="悬疑">
        <div class="route-description">悬疑推理，真相只有一个</div>
      </van-tab>
    </van-tabs>

    <!-- 剧情模板选择 -->
    <div class="template-selection">
      <h3 class="section-title">选择剧情模板</h3>
      <van-swipe-cell 
        v-for="plot in currentTemplates" 
        :key="plot.id"
        class="plot-card"
      >
        <van-card
          :title="plot.title"
          :desc="plot.summary"
          @click="selectPlot(plot)"
          :class="{ 'selected': selectedPlot?.id === plot.id }"
        >
          <template #tags>
            <van-tag plain :type="getDifficultyType(plot.difficulty)">
              {{ plot.difficulty }}
            </van-tag>
            <van-tag plain type="primary">
              {{ plot.chapters.length }} 章
            </van-tag>
          </template>
          
          <template #footer>
            <van-button 
              size="mini" 
              :type="selectedPlot?.id === plot.id ? 'primary' : 'default'"
              round
            >
              {{ selectedPlot?.id === plot.id ? '已选择' : '选择' }}
            </van-button>
          </template>
        </van-card>
      </van-swipe-cell>
    </div>

    <!-- 章节编辑 -->
    <div v-if="selectedPlot" class="chapter-editor">
      <van-divider>章节预览</van-divider>
      
      <van-collapse v-model="activeChapters">
        <van-collapse-item 
          v-for="chapter in selectedPlot.chapters" 
          :key="chapter.chapter"
          :title="`第${chapter.chapter}章：${chapter.title}`"
          :name="chapter.chapter"
        >
          <div class="chapter-detail">
            <div class="scene-info">
              <van-icon name="location-o" />
              <span>场景：{{ chapter.scene }}</span>
            </div>
            
            <div class="event-info">
              <van-icon name="description" />
              <span>关键事件：{{ chapter.keyEvent }}</span>
            </div>
            
            <!-- 分支选项 -->
            <div class="choices-section">
              <h4>分支选项：</h4>
              <van-radio-group v-model="chapter.selectedChoice">
                <van-cell-group>
                  <van-cell 
                    v-for="(choice, index) in chapter.choices" 
                    :key="index"
                    :title="choice"
                    clickable
                    @click="chapter.selectedChoice = index"
                  >
                    <template #right-icon>
                      <van-radio :name="index" />
                    </template>
                  </van-cell>
                </van-cell-group>
              </van-radio-group>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>
      
      <!-- 剧情分析 -->
      <div class="analysis-section" v-if="selectedPlot">
        <van-divider>剧情质量分析</van-divider>
        <van-button
          type="primary"
          plain
          block
          round
          @click="analyzePlot"
          icon="chart-trending-o"
        >
          分析剧情质量
        </van-button>
      </div>

      <!-- 分支预览 -->
      <div class="preview-section" v-if="selectedPlot">
        <van-divider>剧情分支预览</van-divider>
        <van-button
          type="primary"
          plain
          block
          round
          @click="showBranchPreview = true"
          icon="guide-o"
        >
          预览分支走向
        </van-button>
      </div>

      <!-- AI 补全 -->
      <div class="ai-section">
        <van-button 
          type="primary" 
          block 
          round
          @click="aiFillTransitions"
          :loading="aiLoading"
          color="linear-gradient(to right, #FF69B4, #FFB6C1)"
        >
          <template #icon>
            <van-icon name="magic" />
          </template>
          AI 补全过渡剧情（消耗 30 积分）
        </van-button>
        <p class="ai-tip">AI 将自动补全章节间的过渡剧情，让故事更流畅</p>
      </div>
    </div>

    <!-- 剧情分析弹窗 -->
    <van-popup v-model:show="showAnalysis" position="bottom" round :style="{ height: '70%' }">
      <div class="analysis-popup">
        <div class="popup-header">
          <h3>剧情质量分析报告</h3>
          <van-icon name="cross" @click="showAnalysis = false" />
        </div>
        <div class="analysis-content" v-if="analysisReport">
          <div class="score-cards">
            <div class="score-card">
              <van-circle
                v-model:current-rate="analysisReport.overallScore"
                :rate="analysisReport.overallScore"
                :speed="100"
                :text="analysisReport.overallScore + ''"
                size="80px"
                layer-color="#ebedf0"
                color="#FF69B4"
              />
              <span class="score-label">综合评分</span>
            </div>
            <div class="score-details">
              <div class="score-item">
                <span class="label">逻辑</span>
                <van-progress :percentage="analysisReport.logicScore" color="#07c160" />
              </div>
              <div class="score-item">
                <span class="label">情感</span>
                <van-progress :percentage="analysisReport.emotionScore" color="#1989fa" />
              </div>
              <div class="score-item">
                <span class="label">分支</span>
                <van-progress :percentage="analysisReport.branchScore" color="#ff976a" />
              </div>
            </div>
          </div>

          <van-divider>优化建议</van-divider>
          <van-cell-group inset>
            <van-cell
              v-for="(suggestion, index) in analysisReport.suggestions"
              :key="index"
              :title="suggestion"
              icon="bulb-o"
            />
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- 分支预览弹窗 -->
    <van-popup v-model:show="showBranchPreview" position="bottom" round :style="{ height: '80%' }">
      <BranchPreview
        v-if="showBranchPreview && plotBranchData"
        :plot-branch="plotBranchData"
        @close="showBranchPreview = false"
        @select-ending="onSelectEnding"
      />
    </van-popup>

    <!-- 完成按钮 -->
    <div v-if="selectedPlot" class="complete-section">
      <van-button 
        type="success" 
        block 
        round
        size="large"
        @click="savePlot"
        color="linear-gradient(to right, #07c160, #10b981)"
      >
        保存剧情设计
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { TemplateManager } from '@/utils/templateManager';
import { usePointsStore } from '@/stores/points';
import { useGameStore } from '@/stores/gameStore';
import { showToast, showDialog } from 'vant';
import BranchPreview from '@/components/plot/BranchPreview.vue';
import { generateQualityReport } from '@/utils/plotAnalyzer';
import type { PlotQualityReport, PlotBranch } from '@/types/plotBranch';

const selectedRoute = ref('sweet');
const selectedPlot = ref<any>(null);
const activeChapters = ref<number[]>([]);
const aiLoading = ref(false);
const showAnalysis = ref(false);
const showBranchPreview = ref(false);
const analysisReport = ref<PlotQualityReport | null>(null);
const pointsStore = usePointsStore();
const gameStore = useGameStore();

// 将选中的剧情转换为 PlotBranch 格式
const plotBranchData = computed<PlotBranch | null>(() => {
  if (!selectedPlot.value) return null;

  const nodes = selectedPlot.value.chapters.map((ch: any, index: number) => ({
    id: `node_${index}`,
    type: index === 0 ? 'start' : 'dialogue' as const,
    content: ch.keyEvent,
    connections: index < selectedPlot.value.chapters.length - 1 ? [`node_${index + 1}`] : [],
    conditions: [],
    effects: []
  }));

  // 添加结局节点
  nodes.push({
    id: 'ending',
    type: 'ending' as const,
    content: '故事结局',
    connections: [],
    conditions: [],
    effects: []
  });

  // 最后一个章节连接到结局
  if (nodes.length > 1) {
    nodes[nodes.length - 2].connections = ['ending'];
  }

  return {
    id: selectedPlot.value.id,
    name: selectedPlot.value.title,
    nodes,
    endings: [{
      id: 'ending',
      name: selectedPlot.value.routeType === 'sweet' ? '甜蜜结局' :
            selectedPlot.value.routeType === 'angst' ? '虐心结局' : '真相大白',
      type: selectedPlot.value.routeType === 'sweet' ? 'happy' :
            selectedPlot.value.routeType === 'angst' ? 'sad' : 'normal',
      condition: '完成所有章节',
      description: '根据你的选择达成最终结局',
      requiredNodes: nodes.map(n => n.id),
      probability: 1.0
    }]
  };
});

// 剧情模板
const sweetTemplates = ref([
  {
    id: 'sweet_001',
    routeType: 'sweet',
    title: '樱花树下的初遇',
    summary: '在樱花盛开的季节，你与新来的转校生在樱花树下意外相遇，从此展开甜蜜的校园恋爱故事。',
    chapters: [
      {
        chapter: 1,
        title: '樱花雨中的邂逅',
        scene: '樱花飘落的校园小道',
        keyEvent: '你抱着书本匆忙赶路，撞上了迎面走来的他，书本散落一地。',
        choices: ['道歉并帮忙捡书', '默默捡起自己的书离开', '责备他走路不看路'],
        selectedChoice: 0
      },
      {
        chapter: 2,
        title: '意外的同桌',
        scene: '高二（3）班教室',
        keyEvent: '老师宣布调座位，他成为了你的新同桌。',
        choices: ['友好打招呼', '保持距离', '假装不认识'],
        selectedChoice: 0
      },
      {
        chapter: 3,
        title: '图书馆的独处',
        scene: '学校图书馆',
        keyEvent: '放学后你在图书馆学习，发现他也在这里。',
        choices: ['主动搭话', '假装没看见', '换到别的位置'],
        selectedChoice: 0
      }
    ],
    difficulty: '简单'
  },
  {
    id: 'sweet_002',
    routeType: 'sweet',
    title: '咖啡店的邂逅',
    summary: '在常去的咖啡店里，你遇到了一个神秘的陌生人，从此生活发生了改变。',
    chapters: [
      {
        chapter: 1,
        title: '拿铁与美式',
        scene: '街角咖啡店',
        keyEvent: '你点错了咖啡，他主动跟你交换。',
        choices: ['感谢并接受', '婉拒', '请他喝咖啡作为感谢'],
        selectedChoice: 0
      },
      {
        chapter: 2,
        title: '再次相遇',
        scene: '咖啡店',
        keyEvent: '第二天你又遇到了他，原来他是新来的咖啡师。',
        choices: ['惊喜地打招呼', '装作不认识', '调侃他'],
        selectedChoice: 0
      }
    ],
    difficulty: '简单'
  }
]);

const angstTemplates = ref([
  {
    id: 'angst_001',
    routeType: 'angst',
    title: '错过的时光',
    summary: '青梅竹马的你和他，因为一场误会而分离，多年后重逢，能否解开误会？',
    chapters: [
      {
        chapter: 1,
        title: '童年回忆',
        scene: '老家的小巷',
        keyEvent: '你回到老家，意外遇到了小时候的玩伴。',
        choices: ['装作不认识', '主动打招呼', '默默观察'],
        selectedChoice: 0
      },
      {
        chapter: 2,
        title: '当年的误会',
        scene: '旧居',
        keyEvent: '他提起当年的误会，你才知道真相。',
        choices: ['解释清楚', '保持沉默', '责怪他'],
        selectedChoice: 0
      }
    ],
    difficulty: '中等'
  }
]);

const suspenseTemplates = ref([
  {
    id: 'suspense_001',
    routeType: 'suspense',
    title: '午夜钟声',
    summary: '古老的钟楼每到午夜就会响起神秘的钟声，而你发现这背后隐藏着一个惊人的秘密。',
    chapters: [
      {
        chapter: 1,
        title: '神秘钟声',
        scene: '古老钟楼',
        keyEvent: '你听到午夜钟声，发现钟楼里有人影。',
        choices: ['上去查看', '报警', '装作没看见'],
        selectedChoice: 0
      }
    ],
    difficulty: '困难'
  }
]);

// 当前显示的模板
const currentTemplates = computed(() => {
  switch (selectedRoute.value) {
    case 'sweet':
      return sweetTemplates.value;
    case 'angst':
      return angstTemplates.value;
    case 'suspense':
      return suspenseTemplates.value;
    default:
      return sweetTemplates.value;
  }
});

// 监听路线变化，重置选择
watch(selectedRoute, () => {
  selectedPlot.value = null;
  activeChapters.value = [];
});

const selectPlot = (plot: any) => {
  selectedPlot.value = plot;
  // 默认展开第一章
  activeChapters.value = [1];
};

const getDifficultyType = (difficulty: string) => {
  const map: Record<string, string> = {
    '简单': 'success',
    '中等': 'warning',
    '困难': 'danger'
  };
  return map[difficulty] || 'default';
};

const aiFillTransitions = async () => {
  if (pointsStore.balance < 30) {
    showDialog({
      title: '积分不足',
      message: 'AI 补全需要 30 积分，当前积分不足。',
      confirmButtonText: '去赚积分'
    });
    return;
  }

  showDialog({
    title: '确认补全',
    message: '将消耗 30 积分使用 AI 补全过渡剧情，确认继续？',
    showCancelButton: true,
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(async () => {
    aiLoading.value = true;
    try {
      const result = await pointsStore.spendPoints(30, 'AI 补全过渡剧情');
      if (result.success) {
        // 模拟 AI 补全效果
        setTimeout(() => {
          showToast('补全成功！过渡剧情已添加');
          aiLoading.value = false;
        }, 1500);
      } else {
        showToast(result.message);
        aiLoading.value = false;
      }
    } catch (error) {
      showToast('补全失败，请重试');
      aiLoading.value = false;
    }
  }).catch(() => {
    // 取消
  });
};

const savePlot = () => {
  if (!gameStore.currentGame) {
    showDialog({
      title: '未选择游戏',
      message: '请先创建或选择一个游戏项目',
      confirmButtonText: '去创建'
    });
    return;
  }
  
  if (!selectedPlot.value) {
    showToast('请先选择剧情模板');
    return;
  }
  
  // 构建剧情数据
  const plotData = {
    title: selectedPlot.value.title,
    summary: selectedPlot.value.summary,
    routeType: selectedRoute.value as 'sweet' | 'angst' | 'suspense',
    difficulty: selectedPlot.value.difficulty,
    chapters: selectedPlot.value.chapters.map((ch: any) => ({
      chapter: ch.chapter,
      title: ch.title,
      scene: ch.scene,
      keyEvent: ch.keyEvent,
      choices: ch.choices,
      selectedChoice: ch.selectedChoice
    })),
    characterIds: [] // 可以后续关联角色
  };
  
  const plot = gameStore.addPlot(plotData);
  
  if (plot) {
    showToast('剧情设计已保存！');
    emit('save', plot);
    
    // 重置选择
    selectedPlot.value = null;
    activeChapters.value = [];
  } else {
    showToast('保存失败，请重试');
  }
};

const emit = defineEmits(['save']);

// 分析剧情质量
const analyzePlot = () => {
  if (!plotBranchData.value) return;

  analysisReport.value = generateQualityReport(plotBranchData.value);
  showAnalysis.value = true;
};

// 选择结局
const onSelectEnding = (ending: any) => {
  showToast(`已选择结局：${ending.name}`);
};
</script>

<style scoped lang="scss">
.plot-designer {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  padding-bottom: 100px;
}

.route-tabs {
  :deep(.van-tabs__line) {
    background: linear-gradient(to right, #FF69B4, #FFB6C1);
  }
}

.route-description {
  padding: 12px 16px;
  font-size: 14px;
  color: #666;
  background: white;
  text-align: center;
}

.template-selection {
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.plot-card {
  margin-bottom: 12px;
  
  :deep(.van-card) {
    background: white;
    border-radius: 12px;
    
    &.selected {
      border: 2px solid #FF69B4;
    }
  }
}

.chapter-editor {
  padding: 16px;
  background: white;
  margin: 0 16px 16px;
  border-radius: 12px;
}

.chapter-detail {
  padding: 12px;
}

.scene-info,
.event-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #666;
  font-size: 14px;
}

.choices-section {
  margin-top: 16px;
  
  h4 {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }
}

.ai-section {
  margin-top: 24px;
  padding: 16px;
  background: #FFF5F7;
  border-radius: 12px;
}

.ai-tip {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.complete-section {
  padding: 16px;
  background: white;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.game-info {
  padding: 12px 16px;
  background: white;
  text-align: center;
}

.analysis-section,
.preview-section {
  margin-top: 16px;
}

.analysis-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }

  .van-icon {
    font-size: 20px;
    color: #999;
  }
}

.analysis-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.score-cards {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .score-label {
    font-size: 12px;
    color: #666;
  }
}

.score-details {
  flex: 1;

  .score-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      width: 40px;
      font-size: 13px;
      color: #666;
    }

    .van-progress {
      flex: 1;
    }
  }
}
</style>
