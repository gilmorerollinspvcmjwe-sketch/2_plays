# 角色/剧情创建最后一步 redesign 设计方案

## 一、现状分析

### 当前问题
1. **最后一步显示"去创建"按钮**：与顶部已显示的项目选择重复，逻辑混乱
2. **没有已设计角色/剧情列表**：玩家保存后无法查看已创建的内容
3. **项目选择分散**：顶部选择项目和最后一步的提示不一致

### 当前流程
```
角色创建流程（12步）:
Step 1-10: 外貌/服装/性格/.../AI预览
Step 11: 生日设置（最后一步）
  - 选择生日
  - 输入角色名称
  - 点击"保存退出"
  - 如果没选项目，提示"去创建"

剧情设计流程:
- 选择剧情模板
- 设计分支
- 点击"保存"
  - 如果没选项目，提示"去创建"
```

---

## 二、设计目标

### 核心目标
1. **最后一步确认项目**：显示已选择的项目，允许修改或选择新项目
2. **展示已设计列表**：显示当前玩家已创建的角色/剧情列表
3. **提供创建新项目的入口**：如果没有合适项目，可以跳转创建

### 用户体验流程
```
角色创建最后一步:
┌─────────────────────────────────────────────────────────────┐
│  确认保存                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📁 将保存到项目: [项目名称]                                  │
│     [更换项目]  [创建新项目]                                  │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  👤 角色预览: [角色名称]                                      │
│     外貌: xxx | 性格: xxx | 生日: x月x日                      │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  📋 该项目已设计的角色 (3):                                   │
│     ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│     │ 角色A   │ │ 角色B   │ │ 角色C   │                     │
│     └─────────┘ └─────────┘ └─────────┘                     │
│     [查看全部]                                               │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│     [取消]              [确认保存]                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、详细设计方案

### 3.1 角色创建最后一步改造

#### 3.1.1 新增确认步骤（Step 12）

```vue
<!-- Step 12: 确认保存 -->
<div v-if="currentStep === 12" class="step-content confirm-step">
  <h3 class="step-title">确认保存</h3>
  
  <!-- 项目确认区域 -->
  <div class="project-confirm-section">
    <div class="section-title">📁 保存到项目</div>
    
    <div v-if="selectedProject" class="selected-project-card">
      <div class="project-info">
        <span class="project-name">{{ selectedProject.name }}</span>
        <van-tag :type="getProjectStatusType(selectedProject.status)">
          {{ getProjectStatusText(selectedProject.status) }}
        </van-tag>
      </div>
      <div class="project-stats">
        <span>角色: {{ selectedProject.characters?.length || 0 }}</span>
        <span>剧情: {{ selectedProject.plots?.length || 0 }}</span>
      </div>
    </div>
    
    <div v-else class="no-project-warning">
      <van-empty description="尚未选择项目">
        <template #description>
          <span class="warning-text">⚠️ 请先选择要保存的项目</span>
        </template>
      </van-empty>
    </div>
    
    <div class="project-actions">
      <van-button 
        type="primary" 
        plain 
        round 
        size="small"
        @click="showProjectPicker = true"
      >
        {{ selectedProject ? '更换项目' : '选择项目' }}
      </van-button>
      <van-button 
        type="primary" 
        plain 
        round 
        size="small"
        @click="goToCreateProject"
      >
        创建新项目
      </van-button>
    </div>
  </div>
  
  <van-divider />
  
  <!-- 角色预览 -->
  <div class="character-preview-section">
    <div class="section-title">👤 角色预览</div>
    <div class="character-card">
      <div class="character-name">{{ characterName || '未命名角色' }}</div>
      <div class="character-tags">
        <van-tag type="primary" v-if="selectedAppearance">{{ selectedAppearance.label }}</van-tag>
        <van-tag type="success" v-if="selectedPersonalityTags.length">
          {{ selectedPersonalityTags.join(', ') }}
        </van-tag>
        <van-tag type="warning" v-if="birthdayMonth && birthdayDay">
          {{ birthdayMonth }}月{{ birthdayDay }}日
        </van-tag>
      </div>
      <div class="character-attributes" v-if="selectedBackground">
        <p class="attribute-text">{{ selectedBackground.description?.substring(0, 50) }}...</p>
      </div>
    </div>
  </div>
  
  <van-divider />
  
  <!-- 已设计角色列表 -->
  <div class="existing-characters-section" v-if="selectedProject">
    <div class="section-title">
      📋 该项目已设计的角色 
      <span class="count">({{ projectCharacters.length }})</span>
    </div>
    
    <div v-if="projectCharacters.length > 0" class="character-list">
      <div 
        v-for="char in displayedCharacters" 
        :key="char.id"
        class="character-item"
      >
        <div class="char-avatar">{{ char.name?.charAt(0) || '?' }}</div>
        <div class="char-info">
          <div class="char-name">{{ char.name }}</div>
          <div class="char-tags">
            <van-tag type="primary" size="mini" v-if="char.personality?.length">
              {{ char.personality[0] }}
            </van-tag>
          </div>
        </div>
      </div>
      
      <van-button 
        v-if="projectCharacters.length > 3"
        type="default" 
        plain 
        block 
        size="small"
        @click="showAllCharacters = true"
      >
        查看全部 {{ projectCharacters.length }} 个角色
      </van-button>
    </div>
    
    <div v-else class="empty-hint">
      <span class="hint-text">该项目还没有角色，你将是第一个！</span>
    </div>
  </div>
  
  <!-- 底部按钮 -->
  <div class="confirm-actions">
    <van-button 
      type="default" 
      block 
      round
      @click="currentStep--"
    >
      返回修改
    </van-button>
    <van-button 
      type="primary" 
      block 
      round
      :disabled="!canSave"
      @click="confirmSave"
    >
      确认保存
    </van-button>
  </div>
</div>
```

#### 3.1.2 新增数据和方法

```typescript
// 新增响应式数据
const showAllCharacters = ref(false);

// 计算属性：项目角色列表
const projectCharacters = computed(() => {
  if (!selectedProject.value) return [];
  return selectedProject.value.characters?.map((charId: string) => {
    return gameStore.characters.find(c => c.id === charId);
  }).filter(Boolean) || [];
});

// 显示的角色（最多3个）
const displayedCharacters = computed(() => {
  return projectCharacters.value.slice(0, 3);
});

// 是否可以保存
const canSave = computed(() => {
  return !!selectedProject.value && !!characterName.value.trim();
});

// 获取项目状态类型
function getProjectStatusType(status: string): string {
  const types: Record<string, string> = {
    developing: 'primary',
    published: 'success',
    ended: 'default'
  };
  return types[status] || 'default';
}

// 获取项目状态文本
function getProjectStatusText(status: string): string {
  const texts: Record<string, string> = {
    developing: '开发中',
    published: '已发布',
    ended: '已结束'
  };
  return texts[status] || status;
}

// 跳转到创建项目
function goToCreateProject() {
  router.push('/publish');
}

// 确认保存
async function confirmSave() {
  if (!canSave.value) {
    if (!selectedProject.value) {
      showToast('请先选择项目');
      return;
    }
    if (!characterName.value.trim()) {
      showToast('请输入角色名称');
      return;
    }
  }
  
  // 执行保存逻辑
  await saveCharacter();
}
```

#### 3.1.3 角色列表弹窗

```vue
<!-- 全部角色弹窗 -->
<van-popup v-model:show="showAllCharacters" position="bottom" round :style="{ height: '70%' }">
  <div class="all-characters-popup">
    <div class="popup-header">
      <h3>项目角色列表</h3>
      <van-icon name="cross" @click="showAllCharacters = false" />
    </div>
    
    <div class="characters-list">
      <van-cell-group>
        <van-cell 
          v-for="char in projectCharacters" 
          :key="char.id"
          :title="char.name"
          :label="char.personality?.join(', ')"
          center
        >
          <template #icon>
            <div class="char-avatar-large">{{ char.name?.charAt(0) }}</div>
          </template>
          <template #right-icon>
            <van-tag :type="char.popularity?.base > 80 ? 'danger' : 'primary'">
              人气 {{ char.popularity?.base || 0 }}
            </van-tag>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</van-popup>
```

---

### 3.2 剧情设计最后一步改造

#### 3.2.1 新增确认区域

```vue
<!-- 剧情确认保存区域 -->
<div class="plot-confirm-section">
  <h3 class="section-title">确认保存剧情</h3>
  
  <!-- 项目确认 -->
  <div class="project-confirm-section">
    <div class="section-subtitle">📁 保存到项目</div>
    
    <div v-if="selectedProject" class="selected-project-card">
      <div class="project-info">
        <span class="project-name">{{ selectedProject.name }}</span>
        <van-tag :type="getProjectStatusType(selectedProject.status)">
          {{ getProjectStatusText(selectedProject.status) }}
        </van-tag>
      </div>
      <div class="project-stats">
        <span>角色: {{ selectedProject.characters?.length || 0 }}</span>
        <span>剧情: {{ selectedProject.plots?.length || 0 }}</span>
      </div>
    </div>
    
    <div v-else class="no-project-warning">
      <van-empty description="尚未选择项目" />
    </div>
    
    <div class="project-actions">
      <van-button 
        type="primary" 
        plain 
        round 
        size="small"
        @click="showProjectPicker = true"
      >
        {{ selectedProject ? '更换项目' : '选择项目' }}
      </van-button>
      <van-button 
        type="primary" 
        plain 
        round 
        size="small"
        @click="goToCreateProject"
      >
        创建新项目
      </van-button>
    </div>
  </div>
  
  <van-divider />
  
  <!-- 剧情预览 -->
  <div class="plot-preview-section" v-if="selectedPlot">
    <div class="section-subtitle">📖 剧情预览</div>
    <div class="plot-card">
      <div class="plot-title">{{ selectedPlot.title }}</div>
      <div class="plot-summary">{{ selectedPlot.summary }}</div>
      <div class="plot-tags">
        <van-tag :type="routeTypeColor">{{ routeTypeText }}</van-tag>
        <van-tag type="primary">{{ selectedPlot.chapters?.length || 0 }} 章节</van-tag>
        <van-tag type="warning">难度 {{ selectedPlot.difficulty }}/5</van-tag>
      </div>
    </div>
  </div>
  
  <van-divider />
  
  <!-- 已设计剧情列表 -->
  <div class="existing-plots-section" v-if="selectedProject">
    <div class="section-subtitle">
      📋 该项目已设计的剧情
      <span class="count">({{ projectPlots.length }})</span>
    </div>
    
    <div v-if="projectPlots.length > 0" class="plot-list">
      <div 
        v-for="plot in displayedPlots" 
        :key="plot.id"
        class="plot-item"
      >
        <div class="plot-info">
          <div class="plot-name">{{ plot.title }}</div>
          <div class="plot-route">
            <van-tag :type="getRouteTypeColor(plot.routeType)" size="mini">
              {{ getRouteTypeText(plot.routeType) }}
            </van-tag>
            <span class="chapter-count">{{ plot.chapters?.length || 0 }} 章</span>
          </div>
        </div>
      </div>
      
      <van-button 
        v-if="projectPlots.length > 3"
        type="default" 
        plain 
        block 
        size="small"
        @click="showAllPlots = true"
      >
        查看全部 {{ projectPlots.length }} 个剧情
      </van-button>
    </div>
    
    <div v-else class="empty-hint">
      <span class="hint-text">该项目还没有剧情，你将是第一个！</span>
    </div>
  </div>
  
  <!-- 保存按钮 -->
  <div class="save-actions">
    <van-button 
      type="primary" 
      block 
      round
      :disabled="!canSavePlot"
      @click="confirmSavePlot"
    >
      确认保存
    </van-button>
  </div>
</div>
```

#### 3.2.2 新增计算属性

```typescript
// 项目剧情列表
const projectPlots = computed(() => {
  if (!selectedProject.value) return [];
  return selectedProject.value.plots?.map((plotId: string) => {
    return gameStore.plots.find(p => p.id === plotId);
  }).filter(Boolean) || [];
});

// 显示的剧情（最多3个）
const displayedPlots = computed(() => {
  return projectPlots.value.slice(0, 3);
});

// 是否可以保存
const canSavePlot = computed(() => {
  return !!selectedProject.value && !!selectedPlot.value;
});

// 路线类型颜色
const routeTypeColor = computed(() => {
  const colors: Record<string, string> = {
    sweet: 'success',
    angst: 'warning',
    suspense: 'danger'
  };
  return colors[selectedRoute.value] || 'primary';
});

// 路线类型文本
const routeTypeText = computed(() => {
  const texts: Record<string, string> = {
    sweet: '甜宠线',
    angst: '虐恋线',
    suspense: '悬疑线'
  };
  return texts[selectedRoute.value] || selectedRoute.value;
});
```

---

### 3.3 项目选择弹窗改造

#### 3.3.1 显示所有项目

```vue
<!-- 项目选择弹窗 -->
<van-popup v-model:show="showProjectPicker" position="bottom" round :style="{ height: '70%' }">
  <div class="project-picker-popup">
    <div class="popup-header">
      <h3>选择项目</h3>
      <van-icon name="cross" @click="showProjectPicker = false" />
    </div>
    
    <div class="project-list">
      <van-cell-group>
        <van-cell 
          v-for="project in allProjects" 
          :key="project.id"
          :title="project.name"
          clickable
          @click="selectProject(project)"
        >
          <template #label>
            <div class="project-meta">
              <van-tag :type="getProjectStatusType(project.status)" size="mini">
                {{ getProjectStatusText(project.status) }}
              </van-tag>
              <span class="meta-text">
                角色 {{ project.characters?.length || 0 }} | 
                剧情 {{ project.plots?.length || 0 }}
              </span>
            </div>
          </template>
          <template #right-icon>
            <van-icon 
              v-if="selectedProject?.id === project.id" 
              name="checked" 
              color="#FF69B4" 
            />
          </template>
        </van-cell>
      </van-cell-group>
      
      <!-- 空状态 -->
      <van-empty v-if="allProjects.length === 0" description="还没有项目">
        <van-button type="primary" round @click="goToCreateProject">
          创建第一个项目
        </van-button>
      </van-empty>
    </div>
  </div>
</van-popup>
```

---

## 四、样式设计

```scss
// 确认步骤样式
.confirm-step {
  padding: 16px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .project-confirm-section {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .selected-project-card {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    
    .project-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      
      .project-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }
    
    .project-stats {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #666;
    }
  }
  
  .project-actions {
    display: flex;
    gap: 8px;
  }
  
  .character-preview-section {
    .character-card {
      background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E8 100%);
      border-radius: 12px;
      padding: 16px;
      
      .character-name {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
      }
      
      .character-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }
    }
  }
  
  .existing-characters-section {
    .character-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .character-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      
      .char-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF69B4, #FFB6C1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
      }
      
      .char-info {
        flex: 1;
        
        .char-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }
      }
    }
  }
  
  .confirm-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }
}

// 弹窗样式
.all-characters-popup,
.project-picker-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .characters-list,
  .project-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
  
  .char-avatar-large {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF69B4, #FFB6C1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    font-weight: 600;
    margin-right: 12px;
  }
}
```

---

## 五、实施步骤

### Step 1: 修改 CharacterCreator.vue (2小时)
- [ ] 添加 Step 12 确认保存步骤
- [ ] 添加项目确认区域
- [ ] 添加角色预览区域
- [ ] 添加已设计角色列表
- [ ] 添加角色列表弹窗
- [ ] 添加相关计算属性和方法
- [ ] 修改步骤总数（11 → 12）

### Step 2: 修改 PlotDesigner.vue (2小时)
- [ ] 添加确认保存区域
- [ ] 添加项目确认区域
- [ ] 添加剧情预览区域
- [ ] 添加已设计剧情列表
- [ ] 添加剧情列表弹窗
- [ ] 添加相关计算属性和方法

### Step 3: 更新项目选择弹窗 (30分钟)
- [ ] 显示所有项目（包括已发布）
- [ ] 显示项目状态标签
- [ ] 显示项目角色/剧情数量

### Step 4: 测试验证 (30分钟)
- [ ] 测试角色创建最后一步
- [ ] 测试剧情设计最后一步
- [ ] 测试项目选择功能
- [ ] 测试列表显示功能

---

## 六、验收标准

### 功能验收
- [ ] 角色创建最后一步显示项目确认
- [ ] 显示已设计角色列表
- [ ] 可以更换项目
- [ ] 可以跳转创建新项目
- [ ] 剧情设计最后一步显示项目确认
- [ ] 显示已设计剧情列表

### 用户体验
- [ ] 界面清晰，信息层次分明
- [ ] 操作流畅，反馈及时
- [ ] 空状态提示友好
- [ ] 列表展示美观

---

## 七、风险与注意事项

1. **数据一致性**：确保从 projectStore 和 gameStore 读取的数据同步
2. **性能考虑**：角色/剧情列表数据量大时需要虚拟滚动
3. **状态管理**：保存后需要刷新列表数据
