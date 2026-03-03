<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ height: '80%' }"
    @update:show="$emit('update:show', $event)"
  >
    <div class="confession-post">
      <div class="post-header">
        <h3>💌 发布告白</h3>
        <van-icon name="cross" @click="$emit('update:show', false)" />
      </div>

      <div class="post-content">
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

        <div class="form-item">
          <label>告白内容</label>
          <van-field
            v-model="content"
            type="textarea"
            placeholder="写下你想对TA说的话..."
            rows="5"
            autosize
            maxlength="200"
            show-word-limit
          />
        </div>

        <div class="preview-section" v-if="selectedCharacter && content">
          <label>预览效果</label>
          <div class="preview-card">
            <div class="preview-header">
              <span class="character-tag">{{ selectedCharacter.name }}</span>
            </div>
            <p class="preview-content">{{ content }}</p>
            <div class="preview-footer">
              <span>by 我</span>
            </div>
          </div>
        </div>

        <div class="cost-info">
          <van-icon name="diamond-o" color="#ff9500" />
          <span>消耗 <strong>10</strong> 积分发布告白</span>
        </div>
      </div>

      <div class="post-footer">
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
          color="linear-gradient(to right, #ff6b9d, #ff8a80)"
          :disabled="!canSubmit"
          :loading="submitting"
          @click="handleSubmit"
        >
          发布
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { showToast } from 'vant';
import { useGameStore } from '@/stores/gameStore';
import { usePointsStore } from '@/stores/points';

interface Props {
  show: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  'post': [data: { characterId: string; characterName: string; content: string }];
}>();

const gameStore = useGameStore();
const pointsStore = usePointsStore();

const selectedCharacter = ref<{ id: string; name: string } | null>(null);
const content = ref('');
const submitting = ref(false);

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

const canSubmit = computed(() => {
  return selectedCharacter.value && content.value.trim().length >= 5;
});

function selectCharacter(character: { id: string; name: string }) {
  selectedCharacter.value = character;
}

async function handleSubmit() {
  if (!selectedCharacter.value || !content.value.trim()) {
    showToast('请选择角色并填写告白内容');
    return;
  }

  if (pointsStore.balance < 10) {
    showToast('积分不足，需要10积分');
    return;
  }

  submitting.value = true;
  
  emit('post', {
    characterId: selectedCharacter.value.id,
    characterName: selectedCharacter.value.name,
    content: content.value.trim()
  });

  submitting.value = false;
  content.value = '';
  selectedCharacter.value = null;
}

onMounted(() => {
  // Initialize
});
</script>

<style scoped lang="scss">
.confession-post {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #fff5f7 0%, #ffffff 100%);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }
}

.post-content {
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
      border-color: #ff6b9d;
      background: #fff5f7;
    }
    
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff6b9d, #ff8a80);
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

.preview-section {
  margin-bottom: 20px;
  
  .preview-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #ffb6c1;
    
    .preview-header {
      margin-bottom: 12px;
      
      .character-tag {
        display: inline-block;
        background: linear-gradient(to right, #ff6b9d, #ff8a80);
        color: white;
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 10px;
      }
    }
    
    .preview-content {
      font-size: 14px;
      color: #333;
      line-height: 1.6;
      margin: 0 0 12px 0;
    }
    
    .preview-footer {
      font-size: 12px;
      color: #999;
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
}

.post-footer {
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
