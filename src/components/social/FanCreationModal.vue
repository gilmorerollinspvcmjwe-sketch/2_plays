<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ height: '85%' }"
    @update:show="$emit('update:show', $event)"
  >
    <div class="fan-creation-modal">
      <div class="modal-header">
        <h3>✨ 创作中心</h3>
        <van-icon name="cross" @click="$emit('update:show', false)" />
      </div>

      <div class="modal-content">
        <div class="form-item">
          <label>创作类型</label>
          <div class="type-selector">
            <div
              v-for="type in creationTypes"
              :key="type.value"
              class="type-option"
              :class="{ selected: selectedType === type.value }"
              @click="selectType(type.value)"
            >
              <span class="type-icon">{{ type.icon }}</span>
              <span class="type-name">{{ type.label }}</span>
              <span class="type-cost">{{ type.cost }}积分</span>
            </div>
          </div>
        </div>

        <div class="form-item">
          <label>选择角色</label>
          <div class="character-selector">
            <div
              v-for="character in characters"
              :key="character.id"
              class="character-option"
              :class="{ selected: selectedCharacter?.id === character.id }"
              @click="selectCharacter(character)"
            >
              <div class="avatar">{{ character.name.charAt(0) }}</div>
              <span class="name">{{ character.name }}</span>
            </div>
          </div>
        </div>

        <div class="form-item" v-if="selectedType">
          <label>{{ typeLabel }}</label>
          
          <template v-if="selectedType === 'fanfic'">
            <van-field
              v-model="content"
              type="textarea"
              placeholder="写下你的故事...&#10;&#10;提示：可以用【甜文】【虐文】等标签开头"
              rows="8"
              autosize
              maxlength="2000"
              show-word-limit
            />
          </template>
          
          <template v-else-if="selectedType === 'fanart'">
            <div class="image-upload">
              <div v-if="imageUrl" class="image-preview">
                <img :src="imageUrl" alt="预览" />
                <van-icon name="cross" class="remove-btn" @click="imageUrl = ''" />
              </div>
              <div v-else class="upload-placeholder" @click="generateRandomImage">
                <van-icon name="photo-o" size="32" />
                <span>点击生成示例图片</span>
              </div>
            </div>
            <van-field
              v-model="content"
              type="textarea"
              placeholder="添加作品描述..."
              rows="2"
              maxlength="100"
              show-word-limit
            />
          </template>
          
          <template v-else-if="selectedType === 'emoji'">
            <div class="emoji-templates">
              <div
                v-for="emoji in emojiTemplates"
                :key="emoji"
                class="emoji-template"
                :class="{ selected: content === emoji }"
                @click="content = emoji"
              >
                {{ emoji }}
              </div>
            </div>
            <van-field
              v-model="content"
              type="textarea"
              placeholder="或自定义表情包文字..."
              rows="2"
              maxlength="50"
              show-word-limit
            />
          </template>
        </div>

        <div class="cost-info" v-if="selectedType">
          <van-icon name="diamond-o" color="#ff9500" />
          <span>消耗 <strong>{{ currentCost }}</strong> 积分创作</span>
          <span class="balance">（当前积分：{{ pointsStore.balance }}）</span>
        </div>
      </div>

      <div class="modal-footer">
        <van-button
          type="default"
          size="large"
          round
          @click="$emit('update:show', false)"
        >
          取消
        </van-button>
        <van-button
          type="primary"
          size="large"
          round
          color="linear-gradient(to right, #667eea, #764ba2)"
          :disabled="!canSubmit"
          :loading="submitting"
          @click="handleSubmit"
        >
          发布创作
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { showToast } from 'vant';
import { useGameStore } from '@/stores/gameStore';
import { usePointsStore } from '@/stores/points';
import { COST_MAP } from '@/stores/fanCreationStore';

interface Props {
  show: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  'create': [data: {
    type: 'fanfic' | 'fanart' | 'emoji';
    characterId: string;
    characterName: string;
    content: string;
    imageUrl?: string;
  }];
}>();

const gameStore = useGameStore();
const pointsStore = usePointsStore();

const selectedType = ref<'fanfic' | 'fanart' | 'emoji' | null>(null);
const selectedCharacter = ref<{ id: string; name: string } | null>(null);
const content = ref('');
const imageUrl = ref('');
const submitting = ref(false);

const creationTypes = [
  { value: 'fanfic' as const, label: '同人文', icon: '📝', cost: COST_MAP.fanfic },
  { value: 'fanart' as const, label: '同人图', icon: '🎨', cost: COST_MAP.fanart },
  { value: 'emoji' as const, label: '表情包', icon: '😄', cost: COST_MAP.emoji }
];

const characters = computed(() => {
  const currentGame = gameStore.currentGame;
  if (currentGame && currentGame.characters.length > 0) {
    return currentGame.characters.map(c => ({ id: c.id, name: c.name }));
  }
  return [
    { id: 'char_1', name: '霸道总裁 - 陆沉' },
    { id: 'char_2', name: '温柔学长 - 许墨' },
    { id: 'char_3', name: '阳光少年 - 白起' },
    { id: 'char_4', name: '神秘特工 - 李泽言' }
  ];
});

const emojiTemplates = [
  '[爱你] ❤️💕',
  '[生气] 😤💢',
  '[害羞] 😳🌸',
  '[开心] 🥰✨',
  '[哭泣] 😭💧',
  '[震惊] 😱❗',
  '[思考] 🤔💭',
  '[晚安] 😴🌙',
  '[早安] ☀️👋',
  '[想你] 💭💕'
];

const typeLabel = computed(() => {
  if (!selectedType.value) return '';
  const labels: Record<string, string> = {
    fanfic: '故事内容',
    fanart: '作品描述',
    emoji: '表情内容'
  };
  return labels[selectedType.value];
});

const currentCost = computed(() => {
  if (!selectedType.value) return 0;
  return COST_MAP[selectedType.value];
});

const canSubmit = computed(() => {
  if (!selectedType.value || !selectedCharacter.value) return false;
  
  if (selectedType.value === 'fanfic') {
    return content.value.trim().length >= 20;
  } else if (selectedType.value === 'fanart') {
    return imageUrl.value && content.value.trim().length > 0;
  } else {
    return content.value.trim().length > 0;
  }
});

function selectType(type: 'fanfic' | 'fanart' | 'emoji') {
  selectedType.value = type;
  content.value = '';
  imageUrl.value = '';
}

function selectCharacter(character: { id: string; name: string }) {
  selectedCharacter.value = character;
}

function generateRandomImage() {
  const randomId = Math.floor(Math.random() * 1000);
  imageUrl.value = `https://picsum.photos/400/300?random=${randomId}`;
  showToast('已生成示例图片');
}

async function handleSubmit() {
  if (!selectedType.value || !selectedCharacter.value) {
    showToast('请选择创作类型和角色');
    return;
  }

  if (pointsStore.balance < currentCost.value) {
    showToast(`积分不足，需要${currentCost.value}积分`);
    return;
  }

  if (selectedType.value === 'fanart' && !imageUrl.value) {
    showToast('请生成或上传图片');
    return;
  }

  submitting.value = true;

  emit('create', {
    type: selectedType.value,
    characterId: selectedCharacter.value.id,
    characterName: selectedCharacter.value.name,
    content: content.value.trim(),
    imageUrl: imageUrl.value || undefined
  });

  submitting.value = false;
  content.value = '';
  imageUrl.value = '';
  selectedType.value = null;
  selectedCharacter.value = null;
}
</script>

<style scoped lang="scss">
.fan-creation-modal {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
  
  h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.form-item {
  margin-bottom: 20px;
  
  label {
    display: block;
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 12px;
  }
}

.type-selector {
  display: flex;
  gap: 12px;
  
  .type-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 16px 12px;
    background: white;
    border-radius: 12px;
    border: 2px solid #f0f0f0;
    transition: all 0.2s;
    
    &.selected {
      border-color: #667eea;
      background: #f5f7ff;
    }
    
    .type-icon {
      font-size: 28px;
    }
    
    .type-name {
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }
    
    .type-cost {
      font-size: 12px;
      color: #ff9500;
    }
  }
}

.character-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  .character-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: white;
    border-radius: 12px;
    border: 2px solid #f0f0f0;
    transition: all 0.2s;
    
    &.selected {
      border-color: #667eea;
      background: #f5f7ff;
    }
    
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
    }
    
    .name {
      font-size: 13px;
      color: #333;
      flex: 1;
    }
  }
}

.image-upload {
  margin-bottom: 12px;
  
  .image-preview {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .remove-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border-radius: 50%;
      padding: 4px;
      font-size: 16px;
    }
  }
  
  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 150px;
    background: #f8f8f8;
    border-radius: 12px;
    border: 2px dashed #ddd;
    color: #999;
    font-size: 14px;
  }
}

.emoji-templates {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 12px;
  
  .emoji-template {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    background: white;
    border-radius: 8px;
    border: 2px solid #f0f0f0;
    font-size: 16px;
    transition: all 0.2s;
    
    &.selected {
      border-color: #667eea;
      background: #f5f7ff;
    }
  }
}

.cost-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff9e6;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  
  strong {
    color: #ff9500;
  }
  
  .balance {
    color: #999;
    font-size: 12px;
  }
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: white;
  
  .van-button {
    flex: 1;
  }
}
</style>
