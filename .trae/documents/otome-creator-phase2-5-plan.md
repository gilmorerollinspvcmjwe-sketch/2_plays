# 乙女游戏创作者模拟器 - 阶段 2-5 详细实施计划

## 📋 概述

本文档详细说明阶段 2-5 的实施步骤，包括：
- **阶段二**：开发预设素材库（100+ 模板）
- **阶段三**：实现文字化游戏开发系统
- **阶段四**：实现移动端 UI 与流程
- **阶段五**：AI 与收费系统

---

## 🎯 阶段二：开发预设素材库（100+ 模板）- 2 周

### 目标
创建 100+ 个预设模板，作为 AI 生成失败时的兜底方案，同时支持快速模式。

### 实施步骤

#### Step 1: 创建素材库目录结构
```
src/data/templates/
├── characters/           # 角色模板
│   ├── index.ts         # 导出文件
│   ├── president.ts     # 霸道总裁类
│   ├── senior.ts        # 温柔学长类
│   ├── youngmaster.ts   # 腹黑少爷类
│   ├── sunshine.ts      # 阳光少年类
│   ├── elite.ts         # 高冷精英类
│   └── other.ts         # 其他经典人设
├── plots/               # 剧情模板
│   ├── index.ts
│   ├── sweet.ts        # 甜宠路线
│   ├── angst.ts        # 虐恋路线
│   └── suspense.ts     # 悬疑路线
├── comments/           # 评论模板
│   ├── index.ts
│   ├── roast.ts        # 吐槽向
│   ├── recommend.ts    # 安利向
│   ├── drama.ts        # 节奏向
│   └── meme.ts         # 玩梗向
├── events/             # 活动模板
│   ├── index.ts
│   ├── festival.ts     # 节日活动
│   ├── birthday.ts     # 角色生日
│   └── collaboration.ts # 联动活动
└── incidents/          # 事件模板
    ├── index.ts
    ├── dropRate.ts     # 爆率争议
    ├── plotIssue.ts    # 剧情雷点
    ├── welfare.ts      # 福利节奏
    └── other.ts        # 其他事件
```

#### Step 2: 定义模板数据结构

**角色模板接口** (`src/types/template.ts`):
```typescript
interface CharacterTemplate {
  id: string;
  category: 'president' | 'senior' | 'youngmaster' | 'sunshine' | 'elite' | 'other';
  name: string;  // 模板名称
  tags: string[];  // 标签
  personality: string;  // 性格描述
  appearance: string;  // 外貌描述
  clothing: string;  # 服装描述
  background: string;  // 背景故事
  voiceActor: '新人' | '资深' | '顶流';  // 声优定位
  popularity: number;  // 人气值 1-10
}
```

**剧情模板接口**:
```typescript
interface PlotTemplate {
  id: string;
  routeType: 'sweet' | 'angst' | 'suspense';
  title: string;
  summary: string;
  chapters: PlotChapter[];
  difficulty: '简单' | '中等' | '困难';
}

interface PlotChapter {
  chapter: number;
  title: string;
  scene: string;  // 场景描述
  keyEvent: string;  // 关键事件
  choices: string[];  // 分支选项
}
```

**评论模板接口**:
```typescript
interface CommentTemplate {
  id: string;
  type: 'roast' | 'recommend' | 'drama' | 'meme';
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  intensity: 1 | 2 | 3;  // 情绪强度
  playerType: '氪金大佬' | '剧情党' | '外观党' | '休闲玩家';
  tags: string[];
}
```

#### Step 3: 实现角色模板（30 个）

**文件**: `src/data/templates/characters/president.ts`

```typescript
import type { CharacterTemplate } from '@/types/template';

export const presidentTemplates: CharacterTemplate[] = [
  {
    id: 'president_001',
    category: 'president',
    name: '冷峻总裁',
    tags: ['霸道', '冷峻', '占有欲强', '总裁'],
    personality: '外表冷漠疏离，内心炽热深情。行事果断，掌控欲强，对认定的人极度专一。',
    appearance: '剑眉星目，鼻梁高挺，薄唇微抿。黑色短发梳理整齐，眼神锐利如鹰。',
    clothing: '黑色定制西装，白色衬衫，深蓝色领带，袖扣精致。',
    background: '顾氏集团继承人，28 岁执掌千亿商业帝国。因家族联姻与你相遇，从契约婚姻到真心相爱。',
    voiceActor: '顶流',
    popularity: 9
  },
  {
    id: 'president_002',
    category: 'president',
    name: '强势霸总',
    tags: ['强势', '霸道', '独占欲', '年上'],
    personality: '极度强势，说一不二。习惯掌控一切，包括你的所有。占有欲爆棚，不允许任何人靠近你。',
    appearance: '轮廓深邃，眉骨立体，眼神带着压迫感。寸头，小麦色皮肤，荷尔蒙爆棚。',
    clothing: '深色西装，解开两颗扣子的衬衫，露出锁骨。',
    background: '商界传奇，白手起家的商业帝国缔造者。在一次商业晚宴上对你一见钟情，展开强势追求。',
    voiceActor: '资深',
    popularity: 8
  },
  // ... 继续创建 5 个霸道总裁类模板
];
```

**类似方式创建**:
- `senior.ts`: 5 个温柔学长类
- `youngmaster.ts`: 5 个腹黑少爷类
- `sunshine.ts`: 5 个阳光少年类
- `elite.ts`: 5 个高冷精英类
- `other.ts`: 5 个其他经典人设（病娇、忠犬、傲娇等）

#### Step 4: 实现剧情模板（20 个）

**文件**: `src/data/templates/plots/sweet.ts`

```typescript
import type { PlotTemplate } from '@/types/template';

export const sweetPlotTemplates: PlotTemplate[] = [
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
        choices: ['道歉并帮忙捡书', '默默捡起自己的书离开', '责备他走路不看路']
      },
      {
        chapter: 2,
        title: '意外的同桌',
        scene: '高二（3）班教室',
        keyEvent: '老师宣布调座位，他成为了你的新同桌。',
        choices: ['友好打招呼', '保持距离', '假装不认识']
      },
      // ... 继续 5-7 个章节
    ],
    difficulty: '简单'
  },
  // ... 继续创建 7 个甜宠路线模板
];
```

**类似方式创建**:
- `angst.ts`: 7 个虐恋路线
- `suspense.ts`: 6 个悬疑路线

#### Step 5: 实现评论模板（50 个）

**文件**: `src/data/templates/comments/roast.ts`

```typescript
import type { CommentTemplate } from '@/types/template';

export const roastCommentTemplates: CommentTemplate[] = [
  {
    id: 'roast_001',
    type: 'roast',
    content: '这卡池也太非了吧！！！连抽 20 发连个 SSR 都没有，官方你出来解释一下爆率！！！',
    sentiment: 'negative',
    intensity: 3,
    playerType: '氪金大佬',
    tags: ['卡池', '爆率', '非酋', '愤怒']
  },
  {
    id: 'roast_002',
    type: 'roast',
    content: '剧情刀傻了，我老公怎么就 BE 了？？？编剧你没有心！！！还我 HE！！！',
    sentiment: 'negative',
    intensity: 3,
    playerType: '剧情党',
    tags: ['剧情', 'BE', '刀片', '编剧']
  },
  // ... 继续创建 15 个吐槽向模板
];
```

**类似方式创建**:
- `recommend.ts`: 15 个安利向
- `drama.ts`: 10 个节奏向
- `meme.ts`: 10 个玩梗向

#### Step 6: 实现活动模板（20 个）

**文件**: `src/data/templates/events/festival.ts`

```typescript
import type { EventTemplate } from '@/types/template';

export const festivalEventTemplates: EventTemplate[] = [
  {
    id: 'festival_001',
    type: 'festival',
    name: '情人节限定活动',
    description: '浪漫情人节，与心仪的他共度甜蜜时光',
    duration: 7,  // 活动持续天数
    rewards: [
      '限定 SSR 卡面【巧克力之恋】',
      '情人节专属剧情',
      '头像框【爱心巧克力】',
      '钻石 x1000'
    ],
    mechanics: [
      '完成日常任务获得巧克力材料',
      '制作巧克力送给角色提升好感度',
      '好感度达到指定值解锁专属剧情',
      '限定卡池 SSR 概率 UP'
    ],
    budget: '中等'  // 预算等级
  },
  // ... 继续创建 10 个节日活动模板
];
```

**类似方式创建**:
- `birthday.ts`: 5 个角色生日活动
- `collaboration.ts`: 5 个联动活动

#### Step 7: 实现事件模板（20 个）

**文件**: `src/data/templates/incidents/dropRate.ts`

```typescript
import type { IncidentTemplate } from '@/types/template';

export const dropRateIncidentTemplates: IncidentTemplate[] = [
  {
    id: 'drop_001',
    type: 'dropRate',
    name: '集体非酋事件',
    description: '玩家集体反馈卡池爆率过低，要求官方提高 SSR 概率',
    severity: '高',  // 严重程度
    triggerCondition: '连续 3 天 SSR 抽取率低于 0.3%',
    playerReactions: [
      '评论区集体要求提高爆率',
      'TapTap 评分下降',
      '超话出现退坑言论',
      '对比竞品游戏福利'
    ],
    solutions: [
      {
        action: '立即提高爆率到 2%',
        cost: '高',
        effect: '快速平息节奏，玩家满意度回升'
      },
      {
        action: '发放补偿钻石 x1000',
        cost: '中',
        effect: '暂时缓解，但仍有不满'
      },
      {
        action: '官方发布公告解释',
        cost: '低',
        effect: '效果有限，需配合其他措施'
      }
    ]
  },
  // ... 继续创建 5 个爆率争议事件
];
```

**类似方式创建**:
- `plotIssue.ts`: 5 个剧情雷点事件
- `welfare.ts`: 5 个福利节奏事件
- `other.ts`: 5 个其他事件（运营事故、公关危机等）

#### Step 8: 创建模板管理工具

**文件**: `src/utils/templateManager.ts`

```typescript
import { characterTemplates } from '@/data/templates/characters';
import { plotTemplates } from '@/data/templates/plots';
import { commentTemplates } from '@/data/templates/comments';
import { eventTemplates } from '@/data/templates/events';
import { incidentTemplates } from '@/data/templates/incidents';

export class TemplateManager {
  // 随机获取角色模板
  static getRandomCharacter(category?: string): CharacterTemplate {
    const templates = category 
      ? characterTemplates.filter(t => t.category === category)
      : characterTemplates;
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }

  // 根据标签筛选角色模板
  static getCharactersByTags(tags: string[]): CharacterTemplate[] {
    return characterTemplates.filter(t => 
      tags.some(tag => t.tags.includes(tag))
    );
  }

  // 获取剧情模板
  static getPlotByRoute(routeType: string): PlotTemplate[] {
    return plotTemplates.filter(t => t.routeType === routeType);
  }

  // 随机获取评论模板
  static getRandomComment(
    type?: string,
    playerType?: string
  ): CommentTemplate {
    let templates = commentTemplates;
    
    if (type) {
      templates = templates.filter(t => t.type === type);
    }
    if (playerType) {
      templates = templates.filter(t => t.playerType === playerType);
    }
    
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }

  // 获取活动模板
  static getEventByType(type: string): EventTemplate[] {
    return eventTemplates.filter(t => t.type === type);
  }

  // 获取事件模板
  static getIncidentByType(type: string): IncidentTemplate[] {
    return incidentTemplates.filter(t => t.type === type);
  }

  // 获取所有模板统计
  static getTemplateStats() {
    return {
      characters: characterTemplates.length,
      plots: plotTemplates.length,
      comments: commentTemplates.length,
      events: eventTemplates.length,
      incidents: incidentTemplates.length,
      total: characterTemplates.length + plotTemplates.length + 
             commentTemplates.length + eventTemplates.length + 
             incidentTemplates.length
    };
  }
}
```

#### Step 9: 创建模板选择 UI 组件

**文件**: `src/components/template/TemplateSelector.vue`

```vue
<template>
  <div class="template-selector">
    <van-tabs v-model:active="activeTab">
      <van-tab title="角色" name="character">
        <character-list 
          :templates="characterTemplates"
          @select="handleSelect"
        />
      </van-tab>
      <van-tab title="剧情" name="plot">
        <plot-list 
          :templates="plotTemplates"
          @select="handleSelect"
        />
      </van-tab>
      <!-- 其他标签页 -->
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { TemplateManager } from '@/utils/templateManager';

const activeTab = ref('character');
const characterTemplates = ref(TemplateManager.getRandomCharacter());
const plotTemplates = ref(TemplateManager.getPlotByRoute('sweet'));

const emit = defineEmits(['select']);
const handleSelect = (template: any) => {
  emit('select', template);
};
</script>
```

#### Step 10: 测试与优化

- 编写单元测试验证模板加载
- 测试模板随机选择功能
- 优化模板数据结构
- 添加模板搜索功能
- 创建模板预览组件

### 交付物
- ✅ 30 个角色模板
- ✅ 20 个剧情模板
- ✅ 50 个评论模板
- ✅ 20 个活动模板
- ✅ 20 个事件模板
- ✅ 模板管理工具类
- ✅ 模板选择 UI 组件

---

## 🎮 阶段三：实现文字化游戏开发系统 - 3 周

### 目标
实现基于文字选择的游戏开发系统，让玩家通过选择题而非填空题的方式创作游戏。

### 实施步骤

#### Step 1: 创建角色创建组件

**文件**: `src/views/creator/CharacterCreator.vue`

```vue
<template>
  <div class="character-creator">
    <van-steps :active="currentStep">
      <van-step>外貌</van-step>
      <van-step>服装</van-step>
      <van-step>性格</van-step>
      <van-step>背景</van-step>
    </van-steps>

    <!-- Step 1: 外貌选择 -->
    <div v-if="currentStep === 0" class="step-content">
      <h3>选择外貌特征</h3>
      <van-cell-group>
        <van-cell 
          v-for="option in appearanceOptions" 
          :key="option.id"
          :title="option.label"
          :label="option.description"
          clickable
          @click="selectAppearance(option)"
        >
          <template #right-icon>
            <van-icon 
              v-if="selectedAppearance?.id === option.id" 
              name="checked" 
              color="#FF69B4"
            />
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- Step 2: 服装选择 -->
    <div v-if="currentStep === 1" class="step-content">
      <h3>选择服装风格</h3>
      <van-cell-group>
        <van-cell 
          v-for="option in clothingOptions" 
          :key="option.id"
          :title="option.label"
          :label="option.description"
          clickable
          @click="selectClothing(option)"
        />
      </van-cell-group>
    </div>

    <!-- Step 3: 性格标签 -->
    <div v-if="currentStep === 2" class="step-content">
      <h3>选择性格标签（可多选）</h3>
      <van-checkbox-group v-model="selectedPersonalityTags">
        <van-checkbox 
          v-for="tag in personalityTags" 
          :key="tag.id"
          :name="tag.id"
        >
          {{ tag.label }}
        </van-checkbox>
      </van-checkbox-group>
    </div>

    <!-- Step 4: 背景故事 -->
    <div v-if="currentStep === 3" class="step-content">
      <h3>选择背景故事模板</h3>
      <van-cell-group>
        <van-cell 
          v-for="template in backgroundTemplates" 
          :key="template.id"
          :title="template.name"
          :label="template.summary"
          clickable
          @click="selectBackground(template)"
        />
      </van-cell-group>
      
      <!-- AI 润色选项 -->
      <van-button 
        type="primary" 
        block 
        @click="aiPolish"
        :loading="aiLoading"
      >
        AI 润色背景故事
      </van-button>
    </div>

    <!-- 导航按钮 -->
    <div class="nav-buttons">
      <van-button 
        v-if="currentStep > 0" 
        @click="currentStep--"
      >
        上一步
      </van-button>
      <van-button 
        v-if="currentStep < 3" 
        type="primary" 
        @click="currentStep++"
        :disabled="!canNextStep"
      >
        下一步
      </van-button>
      <van-button 
        v-if="currentStep === 3" 
        type="success" 
        @click="createCharacter"
      >
        完成创建
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { TemplateManager } from '@/utils/templateManager';
import { AIService } from '@/services/ai';

const currentStep = ref(0);
const selectedAppearance = ref();
const selectedClothing = ref();
const selectedPersonalityTags = ref([]);
const selectedBackground = ref();
const aiLoading = ref(false);

// 外貌选项
const appearanceOptions = ref([
  { id: '1', label: '剑眉星目', description: '英气逼人，眼神锐利' },
  { id: '2', label: '温润如玉', description: '温和儒雅，如沐春风' },
  { id: '3', label: '冷峻棱角', description: '轮廓深邃，气质冷峻' },
  // ... 更多选项
]);

// 服装选项
const clothingOptions = ref([
  { id: '1', label: '白色衬衫 + 黑色西装', description: '正式商务风格' },
  { id: '2', label: '休闲卫衣', description: '休闲运动风格' },
  { id: '3', label: '古风长衫', description: '古典优雅风格' },
  // ... 更多选项
]);

// 性格标签
const personalityTags = ref([
  { id: '1', label: '傲娇' },
  { id: '2', label: '温柔' },
  { id: '3', label: '高冷' },
  { id: '4', label: '阳光' },
  { id: '5', label: '腹黑' },
  { id: '6', label: '病娇' },
  // ... 更多标签
]);

// 背景故事模板
const backgroundTemplates = ref(
  TemplateManager.getRandomCharacter()
);

const canNextStep = computed(() => {
  if (currentStep.value === 0) return !!selectedAppearance.value;
  if (currentStep.value === 1) return !!selectedClothing.value;
  if (currentStep.value === 2) return selectedPersonalityTags.value.length > 0;
  if (currentStep.value === 3) return !!selectedBackground.value;
  return false;
});

const selectAppearance = (option: any) => {
  selectedAppearance.value = option;
};

const selectClothing = (option: any) => {
  selectedClothing.value = option;
};

const selectBackground = (template: any) => {
  selectedBackground.value = template;
};

const aiPolish = async () => {
  aiLoading.value = true;
  try {
    const polished = await AIService.polishBackground(
      selectedBackground.value.background
    );
    selectedBackground.value.background = polished;
  } catch (error) {
    // 失败时使用预设模板
    console.error('AI 润色失败，使用预设模板');
  } finally {
    aiLoading.value = false;
  }
};

const createCharacter = () => {
  const character = {
    appearance: selectedAppearance.value,
    clothing: selectedClothing.value,
    personality: selectedPersonalityTags.value,
    background: selectedBackground.value
  };
  
  // 保存到数据库或传递给父组件
  emit('create', character);
};

const emit = defineEmits(['create']);
</script>
```

#### Step 2: 创建剧情设计组件

**文件**: `src/views/creator/PlotDesigner.vue`

```vue
<template>
  <div class="plot-designer">
    <!-- 路线选择 -->
    <van-tabs v-model:active="selectedRoute">
      <van-tab name="sweet" title="甜宠">
        <plot-route-selector 
          :templates="sweetTemplates"
          @select="selectRoute"
        />
      </van-tab>
      <van-tab name="angst" title="虐恋">
        <plot-route-selector 
          :templates="angstTemplates"
          @select="selectRoute"
        />
      </van-tab>
      <van-tab name="suspense" title="悬疑">
        <plot-route-selector 
          :templates="suspenseTemplates"
          @select="selectRoute"
        />
      </van-tab>
    </van-tabs>

    <!-- 章节编辑 -->
    <div v-if="selectedPlot" class="chapter-editor">
      <h3>{{ selectedPlot.title }}</h3>
      <p>{{ selectedPlot.summary }}</p>
      
      <van-steps direction="vertical">
        <van-step 
          v-for="chapter in selectedPlot.chapters" 
          :key="chapter.chapter"
        >
          <h4>第{{ chapter.chapter }}章：{{ chapter.title }}</h4>
          <p>场景：{{ chapter.scene }}</p>
          <p>关键事件：{{ chapter.keyEvent }}</p>
          
          <!-- 分支选项编辑 -->
          <div class="choices-editor">
            <h5>分支选项：</h5>
            <van-cell-group>
              <van-cell 
                v-for="(choice, index) in chapter.choices" 
                :key="index"
                :title="`选项${index + 1}`"
              >
                <template #label>
                  <van-field 
                    v-model="chapter.choices[index]"
                    placeholder="输入选项内容"
                  />
                </template>
              </van-cell>
            </van-cell-group>
          </div>
        </van-step>
      </van-steps>
      
      <!-- AI 补全过渡剧情 -->
      <van-button 
        type="primary" 
        block 
        @click="aiFillTransitions"
        :loading="aiLoading"
      >
        AI 补全过渡剧情
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { TemplateManager } from '@/utils/templateManager';
import { AIService } from '@/services/ai';

const selectedRoute = ref('sweet');
const selectedPlot = ref();
const aiLoading = ref(false);

const sweetTemplates = ref(TemplateManager.getPlotByRoute('sweet'));
const angstTemplates = ref(TemplateManager.getPlotByRoute('angst'));
const suspenseTemplates = ref(TemplateManager.getPlotByRoute('suspense'));

const selectRoute = (plot: any) => {
  selectedPlot.value = plot;
};

const aiFillTransitions = async () => {
  aiLoading.value = true;
  try {
    const transitions = await AIService.fillPlotTransitions(
      selectedPlot.value
    );
    // 更新剧情
  } catch (error) {
    console.error('AI 补全失败');
  } finally {
    aiLoading.value = false;
  }
};
</script>
```

#### Step 3: 实现互动配置组件

**文件**: `src/views/creator/InteractionConfig.vue`

```vue
<template>
  <div class="interaction-config">
    <h3>互动配置</h3>
    
    <!-- 互动选项选择 -->
    <van-cell-group>
      <van-cell title="触摸反应">
        <template #label>
          <van-checkbox-group v-model="selectedTouchReactions">
            <van-checkbox 
              v-for="reaction in touchReactions" 
              :key="reaction.id"
              :name="reaction.id"
            >
              {{ reaction.label }}
            </van-checkbox>
          </van-checkbox-group>
        </template>
      </van-cell>
      
      <van-cell title="语音触发">
        <template #label>
          <van-checkbox-group v-model="selectedVoiceTriggers">
            <van-checkbox 
              v-for="trigger in voiceTriggers" 
              :key="trigger.id"
              :name="trigger.id"
            >
              {{ trigger.label }}
            </van-checkbox>
          </van-checkbox-group>
        </template>
      </van-cell>
      
      <van-cell title="约会场景">
        <template #label>
          <van-checkbox-group v-model="selectedDateScenes">
            <van-checkbox 
              v-for="scene in dateScenes" 
              :key="scene.id"
              :name="scene.id"
            >
              {{ scene.label }}
            </van-checkbox>
          </van-checkbox-group>
        </template>
      </van-cell>
    </van-cell-group>
    
    <!-- 好感度系统 -->
    <van-cell-group>
      <van-cell title="启用好感度系统">
        <template #right-icon>
          <van-switch v-model="enableAffection" />
        </template>
      </van-cell>
      
      <van-cell 
        v-if="enableAffection"
        title="好感度上限"
      >
        <template #label>
          <van-slider 
            v-model="affectionMax" 
            :max="1000" 
            :min="100"
            :step="50"
          />
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-button 
      type="success" 
      block 
      @click="saveConfig"
    >
      保存配置
    </van-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const selectedTouchReactions = ref([]);
const selectedVoiceTriggers = ref([]);
const selectedDateScenes = ref([]);
const enableAffection = ref(true);
const affectionMax = ref(500);

const touchReactions = ref([
  { id: '1', label: '摸头 - 害羞' },
  { id: '2', label: '摸头 - 享受' },
  { id: '3', label: '拥抱 - 回抱' },
  { id: '4', label: '拥抱 - 推开' },
  // ... 更多反应
]);

const voiceTriggers = ref([
  { id: '1', label: '早安语音' },
  { id: '2', label: '晚安语音' },
  { id: '3', label: '生日祝福' },
  // ... 更多触发
]);

const dateScenes = ref([
  { id: '1', label: '咖啡厅约会' },
  { id: '2', label: '游乐园约会' },
  { id: '3', label: '海边约会' },
  // ... 更多场景
]);

const saveConfig = () => {
  const config = {
    touchReactions: selectedTouchReactions.value,
    voiceTriggers: selectedVoiceTriggers.value,
    dateScenes: selectedDateScenes.value,
    affection: {
      enabled: enableAffection.value,
      max: affectionMax.value
    }
  };
  
  emit('save', config);
};

const emit = defineEmits(['save']);
</script>
```

#### Step 4: 创建 AI 服务集成

**文件**: `src/services/ai/index.ts`

```typescript
import { request } from './request';

export class AIService {
  // 润色背景故事
  static async polishBackground(background: string): Promise<string> {
    const response = await request.post('/ai/polish', {
      text: background,
      taskType: 'character'
    });
    return response.data.content;
  }

  // 补全剧情过渡
  static async fillPlotTransitions(plot: any): Promise<any> {
    const response = await request.post('/ai/plot/transitions', {
      plot: plot,
      taskType: 'long_text'
    });
    return response.data.chapters;
  }

  // 生成评论
  static async generateComment(
    type: 'roast' | 'recommend' | 'drama' | 'meme',
    context: string
  ): Promise<string> {
    const response = await request.post('/ai/comment/generate', {
      type,
      context,
      taskType: 'comment'
    });
    return response.data.content;
  }

  // 生成角色设定
  static async generateCharacter(description: string): Promise<any> {
    const response = await request.post('/ai/character/generate', {
      description,
      taskType: 'character'
    });
    return response.data.character;
  }
}
```

### 交付物
- ✅ 角色创建组件（文字化）
- ✅ 剧情设计组件（模板 + AI 补全）
- ✅ 互动配置组件（简化）
- ✅ AI 服务集成
- ✅ 模板选择器组件

---

## 📱 阶段四：实现移动端 UI 与流程 - 2 周

### 目标
实现移动端友好的 UI 界面，包括底部导航、模板选择、评论区等核心页面。

### 实施步骤

#### Step 1: 创建主界面布局

**文件**: `src/layouts/MainLayout.vue`

```vue
<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <van-nav-bar 
      :title="pageTitle"
      left-arrow
      @click-left="goBack"
    />

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 底部 Tab 导航 -->
    <van-tabbar v-model="activeTab" route>
      <van-tabbar-item to="/home" icon="home-o">
        首页
      </van-tabbar-item>
      <van-tabbar-item to="/creator" icon="edit">
        开发
      </van-tabbar-item>
      <van-tabbar-item to="/operation" icon="shop-o">
        运营
      </van-tabbar-item>
      <van-tabbar-item to="/comments" icon="comment-o">
        评论
      </van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeTab = ref(0);

const pageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    '/home': '乙游模拟器',
    '/creator': '游戏开发',
    '/operation': '游戏运营',
    '/comments': '玩家评论',
    '/profile': '个人中心'
  };
  return titleMap[route.path] || '乙游模拟器';
});

const goBack = () => {
  history.back();
};
</script>

<style scoped>
.main-layout {
  padding-bottom: 50px; /* 为底部导航留空间 */
}

.main-content {
  min-height: calc(100vh - 100px);
}
</style>
```

#### Step 2: 实现首页

**文件**: `src/views/HomeView.vue`

```vue
<template>
  <div class="home-view">
    <!-- 快捷操作卡片 -->
    <van-card
      title="快速开始"
      desc="创建你的第一款乙女游戏"
      :thumb="quickStartIcon"
      @click="quickStart"
    />

    <!-- 我的游戏列表 -->
    <van-cell-group title="我的游戏">
      <van-cell 
        v-for="game in games" 
        :key="game.id"
        :title="game.title"
        :label="`状态：${game.status} | 人气：${game.popularity}`"
        clickable
        @click="goToGame(game.id)"
      >
        <template #right-icon>
          <van-icon name="arrow" />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 热门游戏推荐 -->
    <van-cell-group title="热门推荐">
      <van-swipe-cell 
        v-for="game in popularGames" 
        :key="game.id"
      >
        <van-card
          :title="game.title"
          :desc="game.description"
          :thumb="game.cover"
        >
          <template #tags>
            <van-tag plain type="primary">
              {{ game.genre }}
            </van-tag>
          </template>
        </van-card>
      </van-swipe-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { dbOperations } from '@/lib/supabase';

const router = useRouter();
const games = ref([]);
const popularGames = ref([]);
const quickStartIcon = ref('🎮');

onMounted(async () => {
  // 加载我的游戏
  const { data: myGames } = await dbOperations.getGames();
  games.value = myGames || [];
  
  // 加载热门游戏
  const { data: popular } = await dbOperations.getPopularGames();
  popularGames.value = popular || [];
});

const quickStart = () => {
  router.push('/creator/new');
};

const goToGame = (gameId: string) => {
  router.push(`/game/${gameId}`);
};
</script>
```

#### Step 3: 实现评论区页面

**文件**: `src/views/CommentsView.vue`

```vue
<template>
  <div class="comments-view">
    <!-- 评论筛选 -->
    <van-tabs v-model:active="filterType">
      <van-tab name="all" title="全部" />
      <van-tab name="positive" title="好评" />
      <van-tab name="negative" title="差评" />
      <van-tab name="drama" title="节奏" />
    </van-tabs>

    <!-- 评论列表 -->
    <van-pull-refresh 
      v-model="refreshing" 
      @refresh="onRefresh"
    >
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell 
          v-for="comment in comments" 
          :key="comment.id"
          class="comment-item"
        >
          <template #title>
            <div class="comment-header">
              <van-tag 
                :type="getSentimentType(comment.sentiment)"
                size="mini"
              >
                {{ getSentimentLabel(comment.sentiment) }}
              </van-tag>
              <span class="player-type">{{ comment.playerType }}</span>
            </div>
          </template>
          
          <template #label>
            <div class="comment-content">
              {{ comment.content }}
            </div>
            <div class="comment-meta">
              <span>{{ formatTime(comment.created_at) }}</span>
              <van-button 
                icon="good-job-o" 
                size="mini"
                plain
              >
                {{ comment.likeCount }}
              </van-button>
            </div>
          </template>
        </van-cell>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { dbOperations } from '@/lib/supabase';

const filterType = ref('all');
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);
const comments = ref([]);

const onLoad = async () => {
  const { data } = await dbOperations.getComments({
    filter: filterType.value,
    limit: 20
  });
  
  comments.value = [...comments.value, ...data];
  loading.value = false;
  finished.value = data.length < 20;
};

const onRefresh = async () => {
  comments.value = [];
  finished.value = false;
  await onLoad();
  refreshing.value = false;
};

const getSentimentType = (sentiment: string) => {
  const map = {
    positive: 'success',
    negative: 'danger',
    neutral: 'primary'
  };
  return map[sentiment] || 'primary';
};

const getSentimentLabel = (sentiment: string) => {
  const map = {
    positive: '好评',
    negative: '差评',
    neutral: '中立'
  };
  return map[sentiment] || '中立';
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};
</script>
```

#### Step 4: 实现乙女风格主题

**文件**: `src/styles/theme.scss`

```scss
// 乙女风格配色
$primary-color: #FFB6C1;      // 粉色
$secondary-color: #FFC0CB;    // 浅粉色
$accent-color: #FF69B4;       // 亮粉色
$text-color: #333333;
$background-color: #FFF5F7;   // 浅粉背景

// 应用到 Vant 组件
:root {
  --van-primary-color: #{$primary-color};
  --van-button-primary-background-color: #{$accent-color};
  --van-button-primary-border-color: #{$accent-color};
  --van-cell-background-color: #{$background-color};
  --van-tabbar-item-active-color: #{$accent-color};
}

// 自定义样式
.bilibili-gradient {
  background: linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%);
}

.emoji-decoration {
  font-size: 1.2em;
  margin: 0 4px;
}

// 卡片样式
.game-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(255, 105, 180, 0.2);
  transition: transform 0.3s;
  
  &:active {
    transform: scale(0.98);
  }
}
```

### 交付物
- ✅ 主界面布局（底部 Tab 导航）
- ✅ 首页（游戏列表、快捷操作）
- ✅ 评论区页面（瀑布流、下拉刷新）
- ✅ 乙女风格主题（粉色系）
- ✅ 响应式布局（移动端适配）

---

## 💰 阶段五：AI 与收费系统 - 1 周

### 目标
实现 AI 图片生成收费系统和兜底逻辑。

### 实施步骤

#### Step 1: 接入即梦 2.0 API

**文件**: `server/services/ai/providers/jimeng.ts`

```typescript
import { AIProvider, AIResponse } from '../types';

export class JimengProvider {
  private apiKey: string;
  private baseUrl = 'https://api.jimeng.ai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // 生成角色立绘
  async generateCharacter(
    description: string,
    style: 'anime' | 'realistic' = 'anime'
  ): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/images/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: description,
          style,
          size: '512x512'
        })
      });

      const data = await response.json();
      
      return {
        success: true,
        content: data.imageUrl,
        provider: 'jimeng',
        model: 'jimeng-2.0'
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        provider: 'jimeng',
        model: 'jimeng-2.0',
        error: error.message
      };
    }
  }

  // 生成 CG 插图
  async generateCG(
    scene: string,
    characters: string[]
  ): Promise<AIResponse> {
    const prompt = `${scene}, 角色：${characters.join(', ')}`;
    return this.generateCharacter(prompt, 'anime');
  }
}
```

#### Step 2: 实现 AI 积分系统

**文件**: `src/stores/points.ts`

```typescript
import { defineStore } from 'pinia';

interface PointsState {
  balance: number;
  history: PointsHistory[];
}

interface PointsHistory {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: string;
}

export const usePointsStore = defineStore('points', {
  state: (): PointsState => ({
    balance: 0,
    history: []
  }),

  actions: {
    // 签到获取积分
    async checkIn() {
      const points = 10; // 每日签到奖励
      this.balance += points;
      this.addToHistory('earn', points, '每日签到');
      await this.saveToDatabase();
    },

    // 成就奖励
    async unlockAchievement(achievement: string) {
      const pointsMap: Record<string, number> = {
        'first_game': 100,
        '10_comments': 50,
        'popular_game': 200
      };
      const points = pointsMap[achievement] || 0;
      this.balance += points;
      this.addToHistory('earn', points, `成就解锁：${achievement}`);
      await this.saveToDatabase();
    },

    // 分享奖励
    async shareGame() {
      const points = 20;
      this.balance += points;
      this.addToHistory('earn', points, '分享游戏');
    },

    // 消耗积分（AI 图片生成）
    async spendPoints(
      amount: number, 
      reason: string
    ): Promise<boolean> {
      if (this.balance < amount) {
        return false;
      }
      
      this.balance -= amount;
      this.addToHistory('spend', amount, reason);
      await this.saveToDatabase();
      return true;
    },

    addToHistory(
      type: 'earn' | 'spend', 
      amount: number, 
      reason: string
    ) {
      this.history.unshift({
        id: Date.now().toString(),
        type,
        amount,
        reason,
        timestamp: new Date().toISOString()
      });
    },

    async saveToDatabase() {
      // 保存到 Supabase
    }
  }
});
```

#### Step 3: 实现兜底逻辑

**文件**: `src/utils/fallback.ts`

```typescript
import { TemplateManager } from './templateManager';

export class FallbackManager {
  // AI 请求超时处理
  static handleTimeout(taskType: string): string {
    const templates = {
      comment: '[评论] 由于响应超时，暂时无法生成评论。请稍后重试。',
      character: '[角色设定] 由于响应超时，暂时无法生成角色设定。请稍后重试。',
      long_text: '[长文本] 由于响应超时，暂时无法处理长文本。请稍后重试。',
      multimodal: '[多模态] 由于响应超时，暂时无法处理图片内容。请稍后重试。',
      general: '[系统] 由于响应超时，暂时无法完成请求。请稍后重试。'
    };
    
    return templates[taskType] || templates.general;
  }

  // AI 请求失败处理
  static handleFailure(taskType: string): any {
    // 返回预设模板
    switch (taskType) {
      case 'comment':
        return TemplateManager.getRandomComment();
      case 'character':
        return TemplateManager.getRandomCharacter();
      case 'plot':
        return TemplateManager.getPlotByRoute('sweet')[0];
      default:
        return null;
    }
  }

  // 快速模式
  static useQuickMode(taskType: string): any {
    // 直接使用预设模板，跳过 AI
    return this.handleFailure(taskType);
  }
}
```

#### Step 4: 创建积分商城页面

**文件**: `src/views/PointsShop.vue`

```vue
<template>
  <div class="points-shop">
    <van-cell-group title="当前积分">
      <van-cell 
        title="积分余额" 
        :value="pointsStore.balance.toString()"
      >
        <template #icon>
          <van-icon name="coin" color="#FFD700" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group title="积分获取">
      <van-cell 
        title="每日签到" 
        label="每日 +10 积分"
        clickable
        @click="checkIn"
      >
        <template #right-icon>
          <van-button 
            size="mini" 
            type="primary"
            :disabled="checkedIn"
          >
            {{ checkedIn ? '已签到' : '签到' }}
          </van-button>
        </template>
      </van-cell>
      
      <van-cell 
        title="分享游戏" 
        label="每次 +20 积分"
        clickable
        @click="shareGame"
      />
    </van-cell-group>

    <van-cell-group title="积分消耗">
      <van-cell 
        title="AI 角色立绘生成" 
        label="消耗 50 积分/次"
        clickable
        @click="generateCharacter"
      />
      
      <van-cell 
        title="AI CG 插图生成" 
        label="消耗 100 积分/次"
        clickable
        @click="generateCG"
      />
    </van-cell-group>

    <van-cell-group title="积分记录">
      <van-cell 
        v-for="record in pointsStore.history" 
        :key="record.id"
        :title="record.reason"
        :label="formatTime(record.timestamp)"
      >
        <template #right-icon>
          <span :class="record.type === 'earn' ? 'text-green' : 'text-red'">
            {{ record.type === 'earn' ? '+' : '-' }}{{ record.amount }}
          </span>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePointsStore } from '@/stores/points';

const pointsStore = usePointsStore();
const checkedIn = ref(false);

const checkIn = async () => {
  await pointsStore.checkIn();
  checkedIn.value = true;
};

const shareGame = async () => {
  await pointsStore.shareGame();
};

const generateCharacter = async () => {
  const success = await pointsStore.spendPoints(50, 'AI 角色立绘生成');
  if (success) {
    // 调用 AI 生成
  } else {
    // 积分不足提示
  }
};

const generateCG = async () => {
  const success = await pointsStore.spendPoints(100, 'AI CG 插图生成');
  if (success) {
    // 调用 AI 生成
  }
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};
</script>
```

### 交付物
- ✅ 即梦 2.0 API 接入
- ✅ AI 积分系统（获取、消耗、记录）
- ✅ 兜底逻辑（超时、失败处理）
- ✅ 快速模式开关
- ✅ 积分商城页面

---

## 📊 总结

### 时间规划
- **阶段二**：2 周 - 100+ 模板开发
- **阶段三**：3 周 - 文字化游戏开发系统
- **阶段四**：2 周 - 移动端 UI 与流程
- **阶段五**：1 周 - AI 与收费系统

**总计**：8 周完成核心功能开发

### 关键交付物
1. 100+ 预设模板（角色 30、剧情 20、评论 50、活动 20、事件 20）
2. 文字化游戏开发系统（角色创建、剧情设计、互动配置）
3. 移动端 UI（底部导航、首页、评论区、乙女风格）
4. AI 系统（多模型集成、图片生成、积分系统、兜底逻辑）

### 技术亮点
- **模板兜底**：AI 失败时自动切换预设模板
- **文字化交互**：选择题代替填空题，降低门槛
- **多模型支持**：5 个国产大模型，智能切换
- **移动端优化**：Vant UI、响应式、PWA 支持
- **成本控制**：文字 LLM 便宜，图片生成收费

---

*文档版本：v1.0*  
*创建时间：2026-03-02*  
*最后更新：2026-03-02*
