<template>
  <div class="character-creator">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="创建角色"
      left-arrow
      @click-left="goBack"
      class="creator-nav"
    >
      <template #right>
        <van-button
          size="small"
          plain
          type="primary"
          @click="saveAndExit"
        >
          保存退出
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 项目选择 -->
    <div class="project-selector">
      <div class="selector-label">绑定到项目</div>
      <div v-if="selectedProject" class="selected-project">
        <van-tag type="success" size="medium">
          📁 {{ selectedProject.name }}
        </van-tag>
        <van-button size="mini" plain @click="showProjectPicker = true">更换</van-button>
      </div>
      <div v-else class="no-project">
        <van-tag type="warning" size="medium">⚠️ 未选择项目</van-tag>
        <van-button size="mini" type="primary" @click="showProjectPicker = true">选择项目</van-button>
      </div>
    </div>

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

    <van-steps :active="currentStep" class="steps">
      <van-step>基础形象</van-step>
      <van-step>性格成长</van-step>
      <van-step>故事背景</van-step>
      <van-step>AI预览</van-step>
      <van-step>确认创建</van-step>
    </van-steps>

    <!-- Step 1: 基础形象 (合并：外貌+服装+美术风格+生日) -->
    <div v-if="currentStep === 0" class="step-content">
      <h3 class="step-title">基础形象</h3>

      <div class="subsection">
        <div class="subsection-title">外貌特征</div>
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
                size="24"
              />
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <van-divider />

      <div class="subsection">
        <div class="subsection-title">服装风格</div>
        <van-cell-group>
          <van-cell 
            v-for="option in clothingOptions" 
            :key="option.id"
            :title="option.label"
            :label="option.description"
            clickable
            @click="selectClothing(option)"
          >
            <template #right-icon>
              <van-icon 
                v-if="selectedClothing?.id === option.id" 
                name="checked" 
                color="#FF69B4"
                size="24"
              />
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <van-divider />

      <div class="subsection">
        <div class="subsection-title">美术风格</div>
        <div class="art-style-grid">
          <div 
            v-for="style in artStyles" 
            :key="style.id"
            class="art-style-card"
            :class="{ active: selectedArtStyle === style.id }"
            @click="selectedArtStyle = style.id"
          >
            <div class="style-icon">{{ style.icon }}</div>
            <div class="style-name">{{ style.name }}</div>
            <div class="style-desc">{{ style.description }}</div>
          </div>
        </div>
      </div>

      <van-divider />

      <div class="subsection">
        <div class="subsection-title">角色生日 <van-tag size="mini" type="primary" plain>可选</van-tag></div>
        <div class="birthday-section">
          <van-button 
            type="primary" 
            plain
            round
            block
            @click="randomBirthday"
            icon="dice"
            class="random-btn"
          >
            随机生成生日
          </van-button>
          
          <van-divider>或手动选择</van-divider>
          
          <div class="birthday-selectors">
            <van-field
              v-model="selectedMonth"
              label="月份"
              placeholder="选择月份"
              readonly
              clickable
              @click="showMonthPicker = true"
            >
              <template #right-icon>
                <van-icon name="arrow-down" />
              </template>
            </van-field>
            
            <van-field
              v-model="selectedDay"
              label="日期"
              placeholder="选择日期"
              readonly
              clickable
              @click="showDayPicker = true"
            >
              <template #right-icon>
                <van-icon name="arrow-down" />
              </template>
            </van-field>
          </div>
          
          <van-popup v-model:show="showMonthPicker" position="bottom" round>
            <van-picker
              :columns="monthColumns"
              @confirm="onMonthConfirm"
              @cancel="showMonthPicker = false"
            />
          </van-popup>
          
          <van-popup v-model:show="showDayPicker" position="bottom" round>
            <van-picker
              :columns="dayColumns"
              @confirm="onDayConfirm"
              @cancel="showDayPicker = false"
            />
          </van-popup>
          
          <div class="birthday-preview" v-if="birthdayMonth && birthdayDay">
            <van-notice-bar
              left-icon="birthday"
              background="#FFF5F7"
              color="#FF69B4"
            >
              🎂 生日：{{ birthdayMonth }}月{{ birthdayDay }}日
            </van-notice-bar>
            <p class="birthday-tip">生日当天角色人气 +20%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: 性格成长 (合并：性格标签+深度设定+成长弧线) -->
    <div v-if="currentStep === 1" class="step-content">
      <h3 class="step-title">性格成长</h3>

      <div class="subsection">
        <div class="subsection-title">性格标签（可多选）</div>
        <div class="tag-container">
          <van-checkbox-group v-model="selectedPersonalityTags" direction="horizontal">
            <van-checkbox 
              v-for="tag in personalityTags" 
              :key="tag.id"
              :name="tag.id"
              shape="square"
              class="personality-tag"
            >
              {{ tag.label }}
            </van-checkbox>
          </van-checkbox-group>
        </div>
      </div>

      <van-divider />

      <div class="subsection">
        <div class="subsection-title">深度设定 - 隐藏属性</div>
        <van-notice-bar
          v-if="attributeConflicts.length > 0"
          :text="attributeConflicts[0]"
          left-icon="warning-o"
          color="#ff6b6b"
          background="#fff5f5"
          class="conflict-notice"
        />
        <div class="radar-chart-container">
          <canvas ref="radarCanvas" width="200" height="200"></canvas>
        </div>
        <div class="attribute-sliders">
          <div v-for="(attr, key) in hiddenAttributes" :key="key" class="slider-item">
            <div class="slider-header">
              <span class="attr-name">{{ attrLabels[key] }}</span>
              <span class="attr-value">{{ attr }}</span>
            </div>
            <van-slider
              v-model="hiddenAttributes[key]"
              :min="0"
              :max="100"
              :step="5"
              bar-height="8px"
              active-color="#FF69B4"
              @change="drawRadarChart"
            />
          </div>
        </div>
      </div>

      <van-divider />

      <div class="subsection">
        <div class="subsection-title">成长弧线</div>
        <div class="growth-arc-grid">
          <div
            v-for="arc in growthArcs"
            :key="arc.id"
            class="growth-arc-card"
            :class="{ active: selectedGrowthArc === arc.id }"
            @click="selectGrowthArc(arc)"
          >
            <div class="arc-icon">{{ arc.icon }}</div>
            <div class="arc-name">{{ arc.name }}</div>
            <div class="arc-desc">{{ arc.description }}</div>
          </div>
        </div>
        <div v-if="selectedGrowthArc" class="growth-preview">
          <van-divider>成长曲线预览</van-divider>
          <div class="growth-curve">
            <svg viewBox="0 0 300 100" class="curve-svg">
              <path
                :d="getGrowthCurvePath()"
                fill="none"
                stroke="#FF69B4"
                stroke-width="3"
              />
              <circle
                v-for="(point, index) in growthPoints"
                :key="index"
                :cx="point.x"
                :cy="point.y"
                r="5"
                fill="#FF69B4"
              />
            </svg>
          </div>
          <van-collapse v-model="activeGrowthNodes">
            <van-collapse-item title="关键节点" name="1">
              <div class="growth-nodes">
                <div v-for="(node, index) in currentGrowthArc?.keyNodes" :key="index" class="growth-node">
                  <van-tag type="primary">节点 {{ index + 1 }}</van-tag>
                  <span class="node-desc">{{ node }}</span>
                </div>
              </div>
            </van-collapse-item>
          </van-collapse>
        </div>
      </div>
    </div>

    <!-- Step 3: 故事背景 (合并：声优+背景+关系+秘密) -->
    <div v-if="currentStep === 2" class="step-content">
      <h3 class="step-title">故事背景</h3>

      <div class="subsection">
        <div class="subsection-title">声优等级</div>
        <div class="voice-actor-grid">
          <div 
            v-for="actor in voiceActors" 
            :key="actor.id"
            class="voice-actor-card"
            :class="{ active: selectedVoiceActor === actor.id }"
            @click="selectedVoiceActor = actor.id"
          >
            <div class="actor-icon">{{ actor.icon }}</div>
            <div class="actor-name">{{ actor.name }}</div>
            <div class="actor-desc">{{ actor.description }}</div>
            <div class="actor-cost">成本：{{ actor.cost }}</div>
          </div>
        </div>
      </div>

      <van-divider />

      <div class="subsection">
        <div class="subsection-title">背景故事模板</div>
        <van-cell-group>
          <van-cell 
            v-for="tmpl in backgroundTemplates" 
            :key="tmpl.id"
            :title="tmpl.name"
            :label="tmpl.background?.substring(0, 50) + '...'"
            clickable
            @click="selectBackground(tmpl)"
          >
            <template #right-icon>
              <van-icon 
                v-if="selectedBackground?.id === tmpl.id" 
                name="checked" 
                color="#FF69B4"
                size="24"
              />
            </template>
          </van-cell>
        </van-cell-group>
        
        <div class="ai-polish-section" v-if="selectedBackground">
          <van-divider>AI 润色</van-divider>
          <van-button 
            type="primary" 
            block 
            round
            @click="aiPolish"
            :loading="aiLoading"
            color="linear-gradient(to right, #FF69B4, #FFB6C1)"
          >
            <template #icon>
              <van-icon name="brush-o" />
            </template>
            AI 润色背景故事（消耗 30 积分）
          </van-button>
          <p class="ai-tip">使用 AI 让背景故事更加生动精彩</p>
        </div>
      </div>

      <van-divider />

      <div class="subsection">
        <div class="subsection-title">角色名称</div>
        <van-field
          v-model="characterName"
          label="角色名称"
          placeholder="请输入角色名称"
          maxlength="20"
          show-word-limit
        />
      </div>

      <van-divider />

      <div class="subsection">
        <div class="subsection-title">角色关系 <van-tag size="mini" type="primary" plain>可选</van-tag></div>
        <div class="relationship-list">
          <van-empty v-if="relationships.length === 0" description="暂无关系，点击添加" />
          <van-cell-group v-else inset>
            <van-cell
              v-for="(rel, index) in relationships"
              :key="index"
              :title="rel.targetName"
              :label="rel.description"
            >
              <template #right-icon>
                <div class="rel-actions">
                  <van-tag :type="getRelationTypeColor(rel.type)">{{ getRelationTypeLabel(rel.type) }}</van-tag>
                  <span class="rel-strength">强度{{ rel.strength }}</span>
                  <van-icon name="delete-o" @click="removeRelationship(index)" />
                </div>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
        
        <van-button
          type="primary"
          block
          round
          icon="plus"
          @click="showAddRelation = true"
          class="add-relation-btn"
        >
          添加关系
        </van-button>
        
        <van-popup v-model:show="showAddRelation" position="bottom" round :style="{ height: '70%' }">
          <div class="add-relation-popup">
            <div class="popup-header">
              <h4>添加角色关系</h4>
              <van-icon name="cross" @click="showAddRelation = false" />
            </div>
            
            <van-cell-group inset>
              <van-field
                v-model="newRelation.targetName"
                label="角色名称"
                placeholder="输入相关角色名称"
              />
              
              <van-cell title="关系类型" is-link @click="showRelationTypePicker = true">
                <template #value>
                  {{ newRelation.type ? getRelationTypeLabel(newRelation.type) : '请选择' }}
                </template>
              </van-cell>
              
              <van-popup v-model:show="showRelationTypePicker" position="bottom" round>
                <van-picker
                  :columns="relationTypeColumns"
                  @confirm="onRelationTypeConfirm"
                  @cancel="showRelationTypePicker = false"
                />
              </van-popup>
              
              <van-cell title="关系强度">
                <template #value>
                  <van-stepper v-model="newRelation.strength" :min="1" :max="10" />
                </template>
              </van-cell>
              
              <van-field
                v-model="newRelation.description"
                label="关系描述"
                type="textarea"
                rows="3"
                placeholder="描述两个角色之间的关系..."
              />
            </van-cell-group>
            
            <div class="popup-actions">
              <van-button type="primary" block round @click="addRelationship">确认添加</van-button>
            </div>
          </div>
        </van-popup>
      </div>

      <van-divider />

      <div class="subsection">
        <div class="subsection-title">角色秘密 <van-tag size="mini" type="primary" plain>可选</van-tag></div>
        <div class="secret-list">
          <van-empty v-if="secrets.length === 0" description="暂无秘密，点击添加" />
          <van-cell-group v-else inset>
            <van-cell
              v-for="(secret, index) in secrets"
              :key="index"
              :title="getSecretTypeLabel(secret.type)"
              :label="secret.description"
            >
              <template #right-icon>
                <div class="secret-actions">
                  <van-tag type="warning">{{ getRevealConditionLabel(secret.revealCondition) }}</van-tag>
                  <van-icon name="delete-o" @click="removeSecret(index)" />
                </div>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
        
        <van-button
          type="primary"
          block
          round
          icon="plus"
          @click="showAddSecret = true"
          class="add-secret-btn"
        >
          添加秘密
        </van-button>
        
        <van-popup v-model:show="showAddSecret" position="bottom" round :style="{ height: '70%' }">
          <div class="add-secret-popup">
            <div class="popup-header">
              <h4>添加角色秘密</h4>
              <van-icon name="cross" @click="showAddSecret = false" />
            </div>
            
            <van-cell-group inset>
              <van-cell title="秘密类型" is-link @click="showSecretTypePicker = true">
                <template #value>
                  {{ newSecret.type ? getSecretTypeLabel(newSecret.type) : '请选择' }}
                </template>
              </van-cell>
              
              <van-popup v-model:show="showSecretTypePicker" position="bottom" round>
                <van-picker
                  :columns="secretTypeColumns"
                  @confirm="onSecretTypeConfirm"
                  @cancel="showSecretTypePicker = false"
                />
              </van-popup>
              
              <van-field
                v-model="newSecret.description"
                label="秘密内容"
                type="textarea"
                rows="3"
                placeholder="描述这个秘密的内容..."
              />
              
              <van-cell title="揭示条件" is-link @click="showRevealConditionPicker = true">
                <template #value>
                  {{ newSecret.revealCondition ? getRevealConditionLabel(newSecret.revealCondition) : '请选择' }}
                </template>
              </van-cell>
              
              <van-popup v-model:show="showRevealConditionPicker" position="bottom" round>
                <van-picker
                  :columns="revealConditionColumns"
                  @confirm="onRevealConditionConfirm"
                  @cancel="showRevealConditionPicker = false"
                />
              </van-popup>
              
              <van-field
                v-if="newSecret.revealCondition === 'affinity'"
                v-model="newSecret.revealValue"
                label="好感度阈值"
                type="number"
                placeholder="达到多少好感度时揭示"
              />
            </van-cell-group>
            
            <div class="popup-actions">
              <van-button type="primary" block round @click="addSecret">确认添加</van-button>
            </div>
          </div>
        </van-popup>
      </div>
    </div>

    <!-- Step 4: AI预览 -->
    <div v-if="currentStep === 3" class="step-content">
      <h3 class="step-title">AI人格预览</h3>
      
      <van-tabs v-model="activePreviewTab" type="card">
        <van-tab title="人格报告" name="personality">
          <div class="personality-report">
            <div class="report-card">
              <h4>人格特征</h4>
              <div class="personality-traits">
                <van-tag
                  v-for="trait in personalityTraits"
                  :key="trait"
                  type="primary"
                  size="medium"
                  class="trait-tag"
                >
                  {{ trait }}
                </van-tag>
              </div>
            </div>
            
            <div class="report-card">
              <h4>行为模式</h4>
              <van-cell-group inset>
                <van-cell
                  v-for="(behavior, index) in behaviorPatterns"
                  :key="index"
                  :title="behavior"
                  icon="user-o"
                />
              </van-cell-group>
            </div>
          </div>
        </van-tab>
        
        <van-tab title="示例对话" name="dialogue">
          <div class="dialogue-preview">
            <div class="dialogue-item" v-for="(dialogue, index) in sampleDialogues" :key="index">
              <div class="dialogue-scene">{{ dialogue.scene }}</div>
              <div class="dialogue-bubble">
                <div class="dialogue-text">{{ dialogue.text }}</div>
              </div>
            </div>
          </div>
        </van-tab>
        
        <van-tab title="兼容性" name="compatibility">
          <div class="compatibility-preview">
            <van-empty description="保存角色后查看兼容性分析" />
          </div>
        </van-tab>
      </van-tabs>
      
      <van-button
        type="primary"
        block
        round
        :loading="generatingPreview"
        @click="generateAIPreview"
        class="generate-btn"
      >
        生成AI预览
      </van-button>
    </div>

    <!-- Step 5: 确认创建 -->
    <div v-if="currentStep === 4" class="step-content">
      <h3 class="step-title">确认创建</h3>
      <div class="summary-card">
        <van-cell-group inset>
          <van-cell title="角色名称" :value="characterName || '未填写'" />
          <van-cell title="外貌" :value="selectedAppearance?.label || '未选择'" />
          <van-cell title="服装" :value="selectedClothing?.label || '未选择'" />
          <van-cell title="美术风格" :value="artStyles.find(s => s.id === selectedArtStyle)?.name || '未选择'" />
          <van-cell title="性格标签" :value="selectedPersonalityTags.length > 0 ? personalityTags.filter(t => selectedPersonalityTags.includes(t.id)).map(t => t.label).join('、') : '未选择'" />
          <van-cell title="成长弧线" :value="currentGrowthArc?.name || '未选择'" />
          <van-cell title="声优" :value="voiceActors.find(v => v.id === selectedVoiceActor)?.name || '未选择'" />
          <van-cell title="背景模板" :value="selectedBackground?.name || '未选择'" />
          <van-cell title="生日" :value="birthdayMonth && birthdayDay ? `${birthdayMonth}月${birthdayDay}日` : '未设置'" />
          <van-cell title="关系数" :value="relationships.length + ' 个'" />
          <van-cell title="秘密数" :value="secrets.length + ' 个'" />
        </van-cell-group>
      </div>
    </div>

    <!-- 导航按钮 -->
    <div class="nav-buttons">
      <van-button 
        v-if="currentStep > 0" 
        @click="currentStep--"
        plain
        round
        size="large"
      >
        上一步
      </van-button>
      <van-button 
        v-if="currentStep < 4" 
        type="primary" 
        @click="currentStep++"
        :disabled="!canNextStep"
        round
        size="large"
        color="linear-gradient(to right, #FF69B4, #FFB6C1)"
      >
        下一步
      </van-button>
      <van-button 
        v-if="currentStep === 4" 
        type="success" 
        @click="createCharacter"
        round
        size="large"
        color="linear-gradient(to right, #07c160, #10b981)"
      >
        完成创建
      </van-button>
    </div>

    <!-- 项目选择弹窗 -->
    <van-popup v-model:show="showProjectPicker" position="bottom" round :style="{ height: '60%' }">
      <div class="project-picker">
        <div class="picker-header">
          <span class="picker-title">选择项目</span>
          <van-icon name="cross" @click="showProjectPicker = false" />
        </div>
        <div class="picker-content">
          <van-empty v-if="availableProjects.length === 0" description="没有开发中的项目，请先创建项目" />
          <div v-else class="project-list">
            <div
              v-for="project in availableProjects"
              :key="project.id"
              class="project-item"
              @click="selectProject(project)"
            >
              <div class="project-info">
                <span class="project-name">{{ project.name }}</span>
                <span class="project-progress">进度 {{ project.progress?.toFixed(1) || 0 }}%</span>
              </div>
              <van-tag type="primary">选择</van-tag>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { TemplateManager } from '@/utils/templateManager';
import { usePointsStore } from '@/stores/points';
import { useGameStore, type ArtStyle, type VoiceActorLevel, type CharacterBirthday } from '@/stores/gameStore';
import { useProjectStore } from '@/stores/projectStore';
import { useCreatorGrowthStore, SKILL_EFFECTS } from '@/stores/creatorGrowth';
import { showToast, showDialog } from 'vant';
import type { HiddenAttributes, GrowthArcType, CharacterRelationship, CharacterSecret } from '@/types/character';
import { generatePersonality, generateBehavior, generateSampleDialogue } from '@/utils/characterAI';

const router = useRouter();
const projectStore = useProjectStore();
const creatorStore = useCreatorGrowthStore();
const currentStep = ref(0);
const selectedAppearance = ref<any>(null);
const selectedClothing = ref<any>(null);
const selectedPersonalityTags = ref<string[]>([]);
const selectedArtStyle = ref<ArtStyle>('japanese');
const selectedVoiceActor = ref<VoiceActorLevel>('newcomer');
const selectedBackground = ref<any>(null);
const aiLoading = ref(false);
const pointsStore = usePointsStore();
const gameStore = useGameStore();

const characterName = ref('');

const birthdayMonth = ref<number>(0);
const birthdayDay = ref<number>(0);
const selectedMonth = ref('');
const selectedDay = ref('');
const showMonthPicker = ref(false);
const showDayPicker = ref(false);

// 隐藏属性
const hiddenAttributes = ref<HiddenAttributes>({
  tsundere: 50,
  gentle: 50,
  scheming: 50,
  innocent: 50,
  mature: 50,
  playful: 50,
  possessive: 50,
  protective: 50
});

const attrLabels: Record<keyof HiddenAttributes, string> = {
  tsundere: '傲娇值',
  gentle: '温柔值',
  scheming: '腹黑值',
  innocent: '天真值',
  mature: '成熟值',
  playful: '活泼值',
  possessive: '占有欲',
  protective: '保护欲'
};

const radarCanvas = ref<HTMLCanvasElement | null>(null);

// 成长弧线
const selectedGrowthArc = ref<GrowthArcType | null>(null);
const currentGrowthArc = ref<any>(null);
const activeGrowthNodes = ref<string[]>([]);
const growthPoints = ref<{x: number, y: number}[]>([]);

const growthArcs = [
  {
    id: 'weak_to_strong' as GrowthArcType,
    name: '弱小到强大',
    icon: '💪',
    description: '从脆弱无助成长为坚强独立',
    keyNodes: ['初次相遇时的脆弱', '面对困难的挣扎', '获得力量的转折', '成长为独当一面']
  },
  {
    id: 'cold_to_warm' as GrowthArcType,
    name: '冷漠到温柔',
    icon: '❤️',
    description: '从冰冷疏离变得温暖贴心',
    keyNodes: ['冷漠的初次印象', '逐渐打开心扉', '展现温柔一面', '完全接纳对方']
  },
  {
    id: 'rebel_to_mature' as GrowthArcType,
    name: '叛逆到成熟',
    icon: '🌱',
    description: '从叛逆不羁成长为成熟稳重',
    keyNodes: ['叛逆的初期表现', '遭遇挫折', '开始反思', '蜕变成长']
  },
  {
    id: 'closed_to_open' as GrowthArcType,
    name: '封闭到开放',
    icon: '🔓',
    description: '从封闭内心到敞开心扉',
    keyNodes: ['封闭自我的状态', '建立信任', '分享秘密', '完全信任']
  },
  {
    id: 'arrogant_to_humble' as GrowthArcType,
    name: '傲慢到谦逊',
    icon: '🙏',
    description: '从傲慢自负变得谦逊有礼',
    keyNodes: ['傲慢的初期态度', '遭遇打击', '认识不足', '谦逊待人']
  },
  {
    id: 'fearful_to_brave' as GrowthArcType,
    name: '恐惧到勇敢',
    icon: '🦁',
    description: '从胆怯恐惧成长为勇敢无畏',
    keyNodes: ['被恐惧支配', '面对恐惧', '获得勇气', '成为勇者']
  }
];

// 角色关系
const relationships = ref<CharacterRelationship[]>([]);
const showAddRelation = ref(false);
const showRelationTypePicker = ref(false);
const newRelation = ref<Partial<CharacterRelationship>>({
  targetId: '',
  targetName: '',
  type: 'friendly',
  strength: 5,
  description: ''
});

const relationTypeColumns = [
  { text: '友好', value: 'friendly' },
  { text: '敌对', value: 'hostile' },
  { text: '暧昧', value: 'romantic' },
  { text: '竞争', value: 'competitive' },
  { text: '保护', value: 'protective' },
  { text: '依赖', value: 'dependent' }
];

// 角色秘密
const secrets = ref<CharacterSecret[]>([]);
const showAddSecret = ref(false);
const showSecretTypePicker = ref(false);
const showRevealConditionPicker = ref(false);
const newSecret = ref<Partial<CharacterSecret>>({
  type: 'background',
  description: '',
  revealCondition: 'affinity',
  revealValue: 50
});

const secretTypeColumns = [
  { text: '身世秘密', value: 'background' },
  { text: '能力秘密', value: 'ability' },
  { text: '情感秘密', value: 'emotion' },
  { text: '过去创伤', value: 'trauma' },
  { text: '隐藏身份', value: 'identity' },
  { text: '特殊使命', value: 'mission' }
];

const revealConditionColumns = [
  { text: '好感度达到', value: 'affinity' },
  { text: '特定剧情节点', value: 'plot' },
  { text: '随机触发', value: 'random' },
  { text: '玩家选择后', value: 'choice' }
];

// AI预览
const activePreviewTab = ref('personality');
const generatingPreview = ref(false);
const personalityTraits = ref<string[]>([]);
const behaviorPatterns = ref<string[]>([]);
const sampleDialogues = ref<{scene: string, text: string}[]>([]);

const monthColumns = computed(() => {
  return Array.from({ length: 12 }, (_, i) => ({
    text: `${i + 1}月`,
    value: i + 1
  }));
});

const dayColumns = computed(() => {
  if (!birthdayMonth.value) return [];
  const daysInMonth = new Date(2024, birthdayMonth.value, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => ({
    text: `${i + 1}日`,
    value: i + 1
  }));
});

const appearanceOptions = ref([
  { id: '1', label: '剑眉星目', description: '英气逼人，眼神锐利，气质冷峻' },
  { id: '2', label: '温润如玉', description: '温和儒雅，如沐春风，气质温润' },
  { id: '3', label: '冷峻棱角', description: '轮廓深邃，气质冷峻，禁欲系' },
  { id: '4', label: '桃花眼眸', description: '眼含笑意，桃花眼，风流倜傥' },
  { id: '5', label: '清澈明亮', description: '眼神清澈，阳光帅气，少年感' },
  { id: '6', label: '忧郁深邃', description: '眼神忧郁，气质深沉，文艺范' },
]);

const clothingOptions = ref([
  { id: '1', label: '白色衬衫 + 黑色西装', description: '正式商务风格，霸道总裁标配' },
  { id: '2', label: '休闲卫衣 + 牛仔裤', description: '休闲运动风格，阳光少年感' },
  { id: '3', label: '古风长衫 + 玉佩', description: '古典优雅风格，温润如玉' },
  { id: '4', label: '白大褂 + 听诊器', description: '医生制服，禁欲系精英' },
  { id: '5', label: '篮球服 + 护腕', description: '运动风格，阳光活力' },
  { id: '6', label: '针织衫 + 围巾', description: '温暖治愈风格，温柔学长' },
]);

const personalityTags = ref([
  { id: '1', label: '傲娇' },
  { id: '2', label: '温柔' },
  { id: '3', label: '高冷' },
  { id: '4', label: '阳光' },
  { id: '5', label: '腹黑' },
  { id: '6', label: '病娇' },
  { id: '7', label: '忠犬' },
  { id: '8', label: '霸道' },
]);

const artStyles = ref([
  { id: 'japanese' as ArtStyle, name: '日系', icon: '🌸', description: '精致细腻，大眼萌系，少女漫风格' },
  { id: 'korean' as ArtStyle, name: '韩系', icon: '🎨', description: '时尚现代，线条流畅，都市感强' },
  { id: 'chinese' as ArtStyle, name: '国风', icon: '🏮', description: '古典优雅，水墨韵味，仙侠风格' },
  { id: 'realistic' as ArtStyle, name: '写实', icon: '🖼️', description: '真实质感，细节丰富，电影感' },
  { id: 'chibi' as ArtStyle, name: 'Q版', icon: '✨', description: '可爱萌趣，头身比夸张，治愈系' },
]);

const voiceActors = ref([
  { id: 'newcomer' as VoiceActorLevel, name: '新人声优', icon: '🎤', description: '新人配音，潜力无限', cost: '低' },
  { id: 'experienced' as VoiceActorLevel, name: '资深声优', icon: '🎭', description: '经验丰富，情感细腻', cost: '中' },
  { id: 'top' as VoiceActorLevel, name: '顶流声优', icon: '⭐', description: '人气声优，粉丝基础强', cost: '高' },
]);

const backgroundTemplates = ref(TemplateManager.getAllCharacters());

// 属性冲突检测
const attributeConflicts = computed(() => {
  const conflicts: string[] = [];
  const attrs = hiddenAttributes.value;
  
  if (attrs.tsundere > 70 && attrs.gentle > 70) {
    conflicts.push('傲娇值和温柔值都较高，可能产生性格冲突');
  }
  if (attrs.scheming > 70 && attrs.innocent > 70) {
    conflicts.push('腹黑值和天真值都较高，角色可能显得矛盾');
  }
  if (attrs.mature > 70 && attrs.playful > 70) {
    conflicts.push('成熟值和活泼值都较高，建议调整平衡');
  }
  if (attrs.possessive > 80) {
    conflicts.push('占有欲过高，可能导致玩家不适');
  }
  
  return conflicts;
});

const canNextStep = computed(() => {
  switch (currentStep.value) {
    case 0: // Basic Image: appearance + clothing + art required, birthday optional
      return !!selectedAppearance.value && !!selectedClothing.value && !!selectedArtStyle.value;
    case 1: // Personality: at least one tag + growth arc
      return selectedPersonalityTags.value.length > 0 && !!selectedGrowthArc.value;
    case 2: // Story: voice + background + name required, relations/secrets optional
      return !!selectedVoiceActor.value && !!selectedBackground.value && !!characterName.value.trim();
    case 3: // AI Preview: always can proceed
      return true;
    case 4: // Confirm: always can proceed
      return true;
    default:
      return false;
  }
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

// 雷达图绘制
const drawRadarChart = () => {
  if (!radarCanvas.value) return;
  
  const canvas = radarCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 70;
  const attrs = Object.keys(hiddenAttributes.value) as (keyof HiddenAttributes)[];
  const count = attrs.length;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制背景网格
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let j = 0; j < count; j++) {
      const angle = (Math.PI * 2 / count) * j - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius * i / 5);
      const y = centerY + Math.sin(angle) * (radius * i / 5);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  
  // 绘制轴线
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.strokeStyle = '#d0d0d0';
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // 绘制标签
    const labelX = centerX + Math.cos(angle) * (radius + 20);
    const labelY = centerY + Math.sin(angle) * (radius + 20);
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(attrLabels[attrs[i]].substring(0, 2), labelX, labelY);
  }
  
  // 绘制数据
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255, 105, 180, 0.3)';
  ctx.strokeStyle = '#FF69B4';
  ctx.lineWidth = 2;
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
    const value = hiddenAttributes.value[attrs[i]] / 100;
    const x = centerX + Math.cos(angle) * (radius * value);
    const y = centerY + Math.sin(angle) * (radius * value);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

// 成长弧线选择
const selectGrowthArc = (arc: any) => {
  selectedGrowthArc.value = arc.id;
  currentGrowthArc.value = arc;
  calculateGrowthCurve();
};

// 计算成长曲线
const calculateGrowthCurve = () => {
  const points: {x: number, y: number}[] = [];
  const arc = currentGrowthArc.value;
  if (!arc) return;
  
  // 根据弧线类型生成不同的曲线
  const width = 300;
  const height = 100;
  const padding = 20;
  
  for (let i = 0; i <= 4; i++) {
    const x = padding + (width - 2 * padding) * (i / 4);
    let y;
    
    switch (arc.id) {
      case 'weak_to_strong':
        y = height - padding - (height - 2 * padding) * Math.pow(i / 4, 2);
        break;
      case 'cold_to_warm':
        y = height - padding - (height - 2 * padding) * (1 - Math.exp(-i));
        break;
      case 'rebel_to_mature':
        y = height - padding - (height - 2 * padding) * (0.5 + 0.5 * Math.sin((i - 1) * Math.PI / 3));
        break;
      default:
        y = height - padding - (height - 2 * padding) * (i / 4);
    }
    
    points.push({ x, y });
  }
  
  growthPoints.value = points;
};

// 获取成长曲线路径
const getGrowthCurvePath = () => {
  if (growthPoints.value.length === 0) return '';
  
  let path = `M ${growthPoints.value[0].x} ${growthPoints.value[0].y}`;
  
  for (let i = 1; i < growthPoints.value.length; i++) {
    const prev = growthPoints.value[i - 1];
    const curr = growthPoints.value[i];
    const cpX = (prev.x + curr.x) / 2;
    path += ` Q ${cpX} ${prev.y} ${curr.x} ${curr.y}`;
  }
  
  return path;
};

// 关系类型标签
const getRelationTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    friendly: '友好',
    hostile: '敌对',
    romantic: '暧昧',
    competitive: '竞争',
    protective: '保护',
    dependent: '依赖'
  };
  return labels[type] || type;
};

const getRelationTypeColor = (type: string) => {
  const colors: Record<string, any> = {
    friendly: 'success',
    hostile: 'danger',
    romantic: 'warning',
    competitive: 'primary',
    protective: 'success',
    dependent: 'default'
  };
  return colors[type] || 'default';
};

// 添加关系
const addRelationship = () => {
  if (!newRelation.value.targetName || !newRelation.value.type) {
    showToast('请填写完整的关系信息');
    return;
  }
  
  relationships.value.push({
    targetId: newRelation.value.targetId || Date.now().toString(),
    targetName: newRelation.value.targetName,
    type: newRelation.value.type as any,
    strength: newRelation.value.strength || 5,
    description: newRelation.value.description || ''
  });
  
  showAddRelation.value = false;
  newRelation.value = { targetId: '', targetName: '', type: 'friendly', strength: 5, description: '' };
  showToast('关系添加成功');
};

// 删除关系
const removeRelationship = (index: number) => {
  relationships.value.splice(index, 1);
  showToast('关系已删除');
};

// 关系类型选择
const onRelationTypeConfirm = ({ selectedOptions }: any) => {
  newRelation.value.type = selectedOptions[0].value;
  showRelationTypePicker.value = false;
};

// 秘密类型标签
const getSecretTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    background: '身世秘密',
    ability: '能力秘密',
    emotion: '情感秘密',
    trauma: '过去创伤',
    identity: '隐藏身份',
    mission: '特殊使命'
  };
  return labels[type] || type;
};

const getRevealConditionLabel = (condition: string) => {
  const labels: Record<string, string> = {
    affinity: '好感度',
    plot: '剧情节点',
    random: '随机触发',
    choice: '玩家选择'
  };
  return labels[condition] || condition;
};

// 添加秘密
const addSecret = () => {
  if (!newSecret.value.type || !newSecret.value.description) {
    showToast('请填写完整的秘密信息');
    return;
  }
  
  secrets.value.push({
    id: Date.now().toString(),
    type: newSecret.value.type as any,
    description: newSecret.value.description,
    revealCondition: newSecret.value.revealCondition as any,
    revealValue: newSecret.value.revealValue,
    isRevealed: false
  });
  
  showAddSecret.value = false;
  newSecret.value = { type: 'background', description: '', revealCondition: 'affinity', revealValue: 50 };
  showToast('秘密添加成功');
};

// 删除秘密
const removeSecret = (index: number) => {
  secrets.value.splice(index, 1);
  showToast('秘密已删除');
};

// 秘密类型选择
const onSecretTypeConfirm = ({ selectedOptions }: any) => {
  newSecret.value.type = selectedOptions[0].value;
  showSecretTypePicker.value = false;
};

// 揭示条件选择
const onRevealConditionConfirm = ({ selectedOptions }: any) => {
  newSecret.value.revealCondition = selectedOptions[0].value;
  showRevealConditionPicker.value = false;
};

// 生成AI预览
const generateAIPreview = async () => {
  generatingPreview.value = true;
  
  // 模拟AI生成延迟
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 基于隐藏属性生成人格特征
  const traits: string[] = [];
  const attrs = hiddenAttributes.value;
  
  if (attrs.tsundere > 60) traits.push('傲娇');
  if (attrs.gentle > 60) traits.push('温柔体贴');
  if (attrs.scheming > 60) traits.push('腹黑');
  if (attrs.innocent > 60) traits.push('天真无邪');
  if (attrs.mature > 60) traits.push('成熟稳重');
  if (attrs.playful > 60) traits.push('活泼开朗');
  if (attrs.possessive > 60) traits.push('占有欲强');
  if (attrs.protective > 60) traits.push('保护欲强');
  
  personalityTraits.value = traits.length > 0 ? traits : ['普通'];
  
  // 生成行为模式
  behaviorPatterns.value = [
    '在喜欢的人面前会不自觉地紧张',
    '遇到困难时倾向于独自承担',
    '对亲近的人表现出强烈的保护欲',
    '偶尔会展现出与平时不同的一面'
  ];
  
  // 生成示例对话
  sampleDialogues.value = [
    { scene: '初次相遇', text: '哼，别以为我会轻易接受你。不过...既然你来了，就好好表现吧。' },
    { scene: '好感度提升', text: '你...你干嘛一直盯着我看？才、才不是因为你在看我才脸红的！' },
    { scene: '深夜对话', text: '其实，我一直想对你说...谢谢你愿意陪在我身边。' }
  ];
  
  generatingPreview.value = false;
  showToast('AI预览生成完成');
};

onMounted(() => {
  nextTick(() => {
    drawRadarChart();
  });
});

const randomBirthday = () => {
  const randomMonth = Math.floor(Math.random() * 12) + 1;
  const daysInMonth = new Date(2024, randomMonth, 0).getDate();
  const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  
  birthdayMonth.value = randomMonth;
  birthdayDay.value = randomDay;
  selectedMonth.value = `${randomMonth}月`;
  selectedDay.value = `${randomDay}日`;
  
  showToast(`随机生日：${randomMonth}月${randomDay}日`);
};

const onMonthConfirm = ({ selectedOptions }: any) => {
  const selected = selectedOptions[0];
  birthdayMonth.value = selected.value;
  selectedMonth.value = selected.text;
  showMonthPicker.value = false;
  birthdayDay.value = 0;
  selectedDay.value = '';
};

const onDayConfirm = ({ selectedOptions }: any) => {
  const selected = selectedOptions[0];
  birthdayDay.value = selected.value;
  selectedDay.value = selected.text;
  showDayPicker.value = false;
};

const aiPolish = async () => {
  if (pointsStore.balance < 30) {
    showDialog({
      title: '积分不足',
      message: 'AI 润色需要 30 积分，当前积分不足。快去签到或完成成就获取积分吧！',
      confirmButtonText: '去赚积分'
    });
    return;
  }

  showDialog({
    title: '确认润色',
    message: '将消耗 30 积分使用 AI 润色背景故事，确认继续？',
    showCancelButton: true,
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(async () => {
    aiLoading.value = true;
    try {
      const result = await pointsStore.spendPoints(30, 'AI 润色背景故事');
      if (result.success) {
        setTimeout(() => {
          const polished = selectedBackground.value.background + '\n\n【AI 润色】他的眼神中藏着无尽的温柔，仿佛整个世界都为你而存在。每一次相遇，都是命运的安排。';
          selectedBackground.value.background = polished;
          showToast('润色成功！');
          aiLoading.value = false;
        }, 1500);
      } else {
        showToast(result.message);
        aiLoading.value = false;
      }
    } catch (error) {
      showToast('润色失败，请重试');
      aiLoading.value = false;
    }
  }).catch(() => {});
};

const createCharacter = () => {
  if (!characterName.value.trim()) {
    showToast('请输入角色名称');
    return;
  }

  // Auto-generate birthday if not set
  if (!birthdayMonth.value || !birthdayDay.value) {
    const randomMonth = Math.floor(Math.random() * 12) + 1;
    const daysInMonth = new Date(2024, randomMonth, 0).getDate();
    const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
    birthdayMonth.value = randomMonth;
    birthdayDay.value = randomDay;
  }

  if (!selectedProject.value) {
    showToast('请先选择要绑定的项目');
    showProjectPicker.value = true;
    return;
  }

  if (!gameStore.currentGame) {
    showDialog({
      title: '未选择游戏',
      message: '请先创建或选择一个游戏项目',
      confirmButtonText: '去创建'
    });
    return;
  }

  // 获取美术鉴赏技能等级并应用加成
  const artLevel = creatorStore.getSkillLevel('artAppreciation');
  const popularityBonus = SKILL_EFFECTS.artAppreciation.characterPopularityBonus(artLevel);

  const birthday: CharacterBirthday = {
    month: birthdayMonth.value,
    day: birthdayDay.value
  };

  const characterData = {
    name: characterName.value.trim(),
    appearance: selectedAppearance.value?.label || '',
    appearanceDesc: selectedAppearance.value?.description || '',
    clothing: selectedClothing.value?.label || '',
    clothingDesc: selectedClothing.value?.description || '',
    personality: selectedPersonalityTags.value,
    hiddenAttributes: hiddenAttributes.value,
    growthArc: selectedGrowthArc.value,
    relationships: relationships.value,
    secrets: secrets.value,
    artStyle: selectedArtStyle.value,
    voiceActor: selectedVoiceActor.value,
    background: selectedBackground.value?.background || selectedBackground.value?.description || '',
    birthday,
    // 应用美术鉴赏加成到角色人气
    popularity: {
      base: Math.round(100 * (1 + popularityBonus)),
      bonus: Math.round(popularityBonus * 100)
    }
  };

  const character = gameStore.addCharacter(characterData);

  if (character) {
    // 如果选择了项目，绑定角色到项目
    if (selectedProject.value) {
      projectStore.addCharacterToProject(selectedProject.value.id, character);
      showToast(`角色创建成功，已绑定到项目「${selectedProject.value.name}」！`);
    } else {
      showToast('角色创建成功！');
    }

    // 显示技能加成提示
    if (artLevel > 0) {
      showToast(`美术鉴赏Lv.${artLevel}加成: 人气+${artLevel * 4}%`);
    }

    emit('create', character);

    // 重置所有数据
    characterName.value = '';
    selectedAppearance.value = null;
    selectedClothing.value = null;
    selectedPersonalityTags.value = [];
    selectedArtStyle.value = 'japanese';
    selectedVoiceActor.value = 'newcomer';
    selectedBackground.value = null;
    selectedGrowthArc.value = null;
    currentGrowthArc.value = null;
    relationships.value = [];
    secrets.value = [];
    hiddenAttributes.value = {
      tsundere: 50,
      gentle: 50,
      scheming: 50,
      innocent: 50,
      mature: 50,
      playful: 50,
      possessive: 50,
      protective: 50
    };
    birthdayMonth.value = 0;
    birthdayDay.value = 0;
    selectedMonth.value = '';
    selectedDay.value = '';
    currentStep.value = 0;
  } else {
    showToast('角色创建失败，请重试');
  }
};

const emit = defineEmits(['create']);

// 返回首页
const goBack = () => {
  showDialog({
    title: '确认返回',
    message: '返回首页将丢失当前未保存的进度，是否继续？',
    showCancelButton: true,
    confirmButtonText: '确认返回',
    cancelButtonText: '继续创建'
  }).then(() => {
    router.push('/');
  }).catch(() => {
    // 用户取消，继续创建
  });
};

// 保存并退出
const saveAndExit = () => {
  if (!characterName.value.trim()) {
    showToast('请先输入角色名称');
    return;
  }

  showDialog({
    title: '保存并退出',
    message: '将保存当前进度并返回首页，已填写的信息会保留',
    showCancelButton: true,
    confirmButtonText: '保存退出',
    cancelButtonText: '继续创建'
  }).then(() => {
    // 这里可以添加保存草稿的逻辑
    showToast('进度已保存');
    router.push('/');
  }).catch(() => {
    // 用户取消，继续创建
  });
};

// 项目选择相关
const showProjectPicker = ref(false);
const selectedProject = ref<any>(null);

// 可选项目列表（所有项目）
const availableProjects = computed(() => {
  return projectStore.projects;
});

// 选择项目
function selectProject(project: any) {
  selectedProject.value = project;
  showProjectPicker.value = false;
  showToast(`已选择项目：${project.name}`);
}
</script>

<style scoped lang="scss">
.character-creator {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  padding-bottom: 100px;
}

.steps {
  padding: 20px 16px;
  background: white;
}

.step-content {
  padding: 16px;
}

.step-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
}

.subsection {
  margin-bottom: 8px;
}

.subsection-title {
  font-size: 15px;
  font-weight: bold;
  color: #555;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.summary-card {
  margin-top: 12px;
}

.tag-container {
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.personality-tag {
  margin: 8px;
  
  :deep(.van-checkbox__label) {
    color: #666;
  }
  
  :deep(.van-checkbox--checked) {
    .van-checkbox__label {
      color: #FF69B4;
    }
  }
}

.ai-polish-section {
  margin-top: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.ai-tip {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.creator-nav {
  margin-bottom: 8px;
}

.nav-buttons {
  position: fixed;
  bottom: 50px; // 为底部Tab导航栏留出空间
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: white;
  display: flex;
  gap: 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 99;

  .van-button {
    flex: 1;
  }
}

.character-creator {
  min-height: 100vh;
  padding-bottom: 120px; // 增加底部padding，为固定按钮和Tab栏留出空间
}

.game-info {
  padding: 12px 16px;
  background: white;
  text-align: center;
}

// 项目选择器样式
.project-selector {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;

  .selector-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .selected-project,
  .no-project {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

// 项目选择弹窗样式
.project-picker {
  display: flex;
  flex-direction: column;
  height: 100%;

  .picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;

    .picker-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  .picker-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }

  .project-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .project-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;

    &:active {
      background: #e8e8e8;
    }

    .project-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .project-name {
        font-size: 15px;
        font-weight: 500;
        color: #333;
      }

      .project-progress {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.name-input-section {
  margin-top: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

// 美术风格网格
.art-style-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.art-style-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
  
  &.active {
    border-color: #FF69B4;
    background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E8 100%);
  }
  
  .style-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  .style-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
  }
  
  .style-desc {
    font-size: 12px;
    color: #999;
    line-height: 1.4;
  }
}

// 声优选择网格
.voice-actor-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
}

.voice-actor-card {
  background: white;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
  
  &.active {
    border-color: #FF69B4;
    background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E8 100%);
  }
  
  .actor-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }
  
  .actor-name {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
  }
  
  .actor-desc {
    font-size: 11px;
    color: #999;
    margin-bottom: 4px;
  }
  
  .actor-cost {
    font-size: 12px;
    color: #FF69B4;
    font-weight: 500;
  }
}

.birthday-section {
  padding: 16px;
  background: white;
  border-radius: 12px;

  .random-btn {
    margin-bottom: 16px;
  }

  .birthday-selectors {
    margin-top: 12px;
  }

  .birthday-preview {
    margin-top: 16px;

    .birthday-tip {
      text-align: center;
      font-size: 12px;
      color: #FF69B4;
      margin-top: 8px;
    }
  }
}

// 深度设定 - 隐藏属性
.conflict-notice {
  margin-bottom: 16px;
}

.radar-chart-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;

  canvas {
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.attribute-sliders {
  background: white;
  border-radius: 12px;
  padding: 16px;

  .slider-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .slider-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;

      .attr-name {
        font-size: 14px;
        color: #333;
      }

      .attr-value {
        font-size: 14px;
        color: #FF69B4;
        font-weight: 600;
      }
    }
  }
}

// 成长弧线
.growth-arc-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.growth-arc-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;

  &.active {
    border-color: #FF69B4;
    background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E8 100%);
  }

  .arc-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .arc-name {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
  }

  .arc-desc {
    font-size: 11px;
    color: #999;
    line-height: 1.4;
  }
}

.growth-preview {
  margin-top: 20px;
  padding: 0 16px;

  .growth-curve {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;

    .curve-svg {
      width: 100%;
      height: 100px;
    }
  }

  .growth-nodes {
    .growth-node {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .node-desc {
        font-size: 13px;
        color: #666;
      }
    }
  }
}

// 角色关系
.relationship-list {
  margin-bottom: 16px;
}

.add-relation-btn {
  margin: 0 16px;
}

.add-relation-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #ebedf0;

    h4 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .van-icon {
      font-size: 20px;
      color: #999;
    }
  }

  .popup-actions {
    padding: 16px;
    margin-top: auto;
  }
}

.rel-actions {
  display: flex;
  align-items: center;
  gap: 8px;

  .rel-strength {
    font-size: 12px;
    color: #999;
  }

  .van-icon {
    color: #ff6b6b;
    font-size: 18px;
  }
}

// 角色秘密
.secret-list {
  margin-bottom: 16px;
}

.add-secret-btn {
  margin: 0 16px;
}

.add-secret-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #ebedf0;

    h4 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .van-icon {
      font-size: 20px;
      color: #999;
    }
  }

  .popup-actions {
    padding: 16px;
    margin-top: auto;
  }
}

.secret-actions {
  display: flex;
  align-items: center;
  gap: 8px;

  .van-icon {
    color: #ff6b6b;
    font-size: 18px;
  }
}

// AI预览
.personality-report {
  padding: 16px;

  .report-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #333;
      padding-left: 8px;
      border-left: 3px solid #FF69B4;
    }

    .personality-traits {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .trait-tag {
        margin: 0;
      }
    }
  }
}

.dialogue-preview {
  padding: 16px;

  .dialogue-item {
    margin-bottom: 20px;

    .dialogue-scene {
      font-size: 12px;
      color: #999;
      margin-bottom: 8px;
      text-align: center;
    }

    .dialogue-bubble {
      background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E8 100%);
      border-radius: 16px;
      padding: 16px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 20px;
        top: -8px;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid #FFF5F7;
      }

      .dialogue-text {
        font-size: 14px;
        color: #333;
        line-height: 1.6;
      }
    }
  }
}

.generate-btn {
  margin: 16px;
}
</style>
