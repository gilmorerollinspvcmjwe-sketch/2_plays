<template>
  <div class="interaction-config">
    <h3 class="step-title">配置互动系统</h3>

    <!-- 触摸反应配置 -->
    <div class="config-section">
      <h4 class="section-subtitle">
        <van-icon name="hand-o" />
        触摸反应
      </h4>
      <van-cell-group inset>
        <van-field
          v-model="config.touchReactions.head"
          label="摸头反应"
          placeholder="例如：他微微低下头，露出温柔的笑容"
          type="textarea"
          rows="2"
        />
        <van-field
          v-model="config.touchReactions.hug"
          label="拥抱反应"
          placeholder="例如：他轻轻回抱住你，在你耳边低语"
          type="textarea"
          rows="2"
        />
        <van-field
          v-model="config.touchReactions.hand"
          label="牵手反应"
          placeholder="例如：他握紧你的手，十指相扣"
          type="textarea"
          rows="2"
        />
        <van-field
          v-model="config.touchReactions.confess"
          label="告白反应"
          placeholder="例如：他的眼中闪烁着真挚的光芒"
          type="textarea"
          rows="2"
        />
      </van-cell-group>
    </div>

    <!-- 语音触发词 -->
    <div class="config-section">
      <h4 class="section-subtitle">
        <van-icon name="volume-o" />
        语音触发词
      </h4>
      <div class="tag-input-container">
        <van-tag
          v-for="(trigger, index) in config.voiceTriggers"
          :key="index"
          closeable
          size="medium"
          class="voice-tag"
          @close="removeVoiceTrigger(index)"
        >
          {{ trigger }}
        </van-tag>
        <van-field
          v-model="newVoiceTrigger"
          placeholder="输入触发词，按回车添加"
          @keyup.enter="addVoiceTrigger"
        >
          <template #button>
            <van-button size="small" type="primary" @click="addVoiceTrigger">
              添加
            </van-button>
          </template>
        </van-field>
      </div>
      <p class="tip-text">当玩家说出这些词时，角色会有特殊反应</p>
    </div>

    <!-- 约会场景 -->
    <div class="config-section">
      <h4 class="section-subtitle">
        <van-icon name="location-o" />
        约会场景
      </h4>
      <van-checkbox-group v-model="config.dateScenes">
        <van-cell-group inset>
          <van-cell
            v-for="scene in dateSceneOptions"
            :key="scene.value"
            :title="scene.label"
            :label="scene.description"
            clickable
            @click="toggleDateScene(scene.value)"
          >
            <template #right-icon>
              <van-checkbox :name="scene.value" ref="checkboxes" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-checkbox-group>
    </div>

    <!-- 好感度系统 -->
    <div class="config-section">
      <h4 class="section-subtitle">
        <van-icon name="like-o" />
        好感度系统
      </h4>
      <van-cell-group inset>
        <van-cell center title="启用好感度系统">
          <template #right-icon>
            <van-switch v-model="config.affectionEnabled" />
          </template>
        </van-cell>
      </van-cell-group>
      <p class="tip-text" v-if="config.affectionEnabled">
        好感度系统已启用，玩家的选择会影响角色好感度
      </p>
      <p class="tip-text" v-else>
        好感度系统已关闭，剧情按固定路线发展
      </p>
    </div>

    <!-- 快捷配置 -->
    <div class="config-section">
      <h4 class="section-subtitle">快捷配置</h4>
      <div class="quick-configs">
        <van-button
          v-for="preset in interactionPresets"
          :key="preset.name"
          size="small"
          plain
          round
          @click="applyPreset(preset)"
        >
          {{ preset.name }}
        </van-button>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="action-buttons">
      <van-button
        type="primary"
        block
        round
        size="large"
        color="linear-gradient(to right, #FF69B4, #FFB6C1)"
        @click="saveConfig"
      >
        保存配置
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { showToast } from 'vant';
import type { InteractionConfig } from '@/stores/gameStore';

const emit = defineEmits<{
  save: [config: InteractionConfig];
}>();

// 配置数据
const config = reactive<InteractionConfig>({
  touchReactions: {
    head: '',
    hug: '',
    hand: '',
    confess: ''
  },
  voiceTriggers: ['早安', '晚安', '喜欢你', '谢谢'],
  dateScenes: ['cafe', 'park'],
  affectionEnabled: true
});

// 新触发词输入
const newVoiceTrigger = ref('');

// 约会场景选项
const dateSceneOptions = [
  { value: 'cafe', label: '☕ 咖啡厅', description: '温馨的下午茶时光' },
  { value: 'park', label: '🌸 公园', description: '樱花树下的浪漫约会' },
  { value: 'library', label: '📚 图书馆', description: '安静的学习约会' },
  { value: 'beach', label: '🏖️ 海边', description: '夕阳下的海边漫步' },
  { value: 'cinema', label: '🎬 电影院', description: '一起看浪漫电影' },
  { value: 'restaurant', label: '🍽️ 餐厅', description: '精致的烛光晚餐' },
  { value: 'amusement', label: '🎡 游乐园', description: '刺激的游乐设施' },
  { value: 'shopping', label: '🛍️ 商场', description: '一起逛街购物' }
];

// 快捷配置预设
const interactionPresets = [
  {
    name: '🌸 温柔型',
    config: {
      touchReactions: {
        head: '他温柔地低下头，眼中满是宠溺',
        hug: '他轻轻拥你入怀，像抱着最珍贵的宝物',
        hand: '他小心翼翼地握住你的手，生怕弄疼你',
        confess: '他的眼中闪烁着温柔的光芒，轻声说："我也喜欢你"'
      },
      voiceTriggers: ['早安', '晚安', '喜欢你', '谢谢', '抱抱'],
      dateScenes: ['cafe', 'park', 'library'],
      affectionEnabled: true
    }
  },
  {
    name: '🔥 霸道型',
    config: {
      touchReactions: {
        head: '他挑了挑眉，但还是顺从地低下头',
        hug: '他强势地将你拉入怀中，不容拒绝',
        hand: '他霸道地握住你的手，十指紧扣',
        confess: '他眼神炽热，声音低沉："你只能是我的"'
      },
      voiceTriggers: ['过来', '听话', '别走', '看着我'],
      dateScenes: ['restaurant', 'cinema', 'shopping'],
      affectionEnabled: true
    }
  },
  {
    name: '☀️ 阳光型',
    config: {
      touchReactions: {
        head: '他开心地低下头，笑得像个孩子',
        hug: '他热情地抱住你，转了个圈',
        hand: '他兴奋地握住你的手，摇来摇去',
        confess: '他眼睛亮晶晶的，大声说："我也超级喜欢你！"'
      },
      voiceTriggers: ['一起玩', '好开心', '加油', '最棒了'],
      dateScenes: ['amusement', 'beach', 'park'],
      affectionEnabled: true
    }
  },
  {
    name: '❄️ 高冷型',
    config: {
      touchReactions: {
        head: '他微微一怔，耳尖微红但没有躲开',
        hug: '他身体僵硬了一瞬，然后轻轻回抱',
        hand: '他犹豫了一下，才缓缓握住你的手',
        confess: '他别过脸，声音很轻："...笨蛋，我也一样"'
      },
      voiceTriggers: ['谢谢', '抱歉', '没事', '晚安'],
      dateScenes: ['library', 'cafe'],
      affectionEnabled: true
    }
  }
];

// 添加语音触发词
function addVoiceTrigger() {
  const trigger = newVoiceTrigger.value.trim();
  if (!trigger) return;
  
  if (config.voiceTriggers.includes(trigger)) {
    showToast('触发词已存在');
    return;
  }
  
  if (config.voiceTriggers.length >= 10) {
    showToast('最多添加10个触发词');
    return;
  }
  
  config.voiceTriggers.push(trigger);
  newVoiceTrigger.value = '';
}

// 删除语音触发词
function removeVoiceTrigger(index: number) {
  config.voiceTriggers.splice(index, 1);
}

// 切换约会场景
function toggleDateScene(value: string) {
  const index = config.dateScenes.indexOf(value);
  if (index > -1) {
    config.dateScenes.splice(index, 1);
  } else {
    config.dateScenes.push(value);
  }
}

// 应用预设
function applyPreset(preset: typeof interactionPresets[0]) {
  Object.assign(config, preset.config);
  showToast(`已应用${preset.name}配置`);
}

// 保存配置
function saveConfig() {
  emit('save', { ...config });
  showToast('互动配置已保存');
}
</script>

<style scoped lang="scss">
.interaction-config {
  padding: 16px;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  min-height: 100vh;
  padding-bottom: 100px;
}

.step-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.config-section {
  margin-bottom: 24px;
}

.section-subtitle {
  font-size: 14px;
  font-weight: bold;
  color: #666;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-input-container {
  background: white;
  border-radius: 12px;
  padding: 12px;

  .voice-tag {
    margin: 4px;
  }
}

.tip-text {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  text-align: center;
}

.quick-configs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style>
