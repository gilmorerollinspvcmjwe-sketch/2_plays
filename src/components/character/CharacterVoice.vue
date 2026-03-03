<template>
  <div class="character-voice">
    <!-- 心声入口按钮 -->
    <div class="voice-trigger" @click="showVoicePanel = true">
      <div class="voice-icon" :class="{ 'has-unread': unreadCount > 0 }">
        <van-icon name="volume-o" size="24" />
        <div v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</div>
      </div>
      <span class="voice-label">角色心声</span>
    </div>

    <!-- 心声面板弹窗 -->
    <van-popup
      v-model:show="showVoicePanel"
      position="bottom"
      round
      :style="{ height: '70%' }"
      class="voice-popup"
    >
      <div class="voice-panel">
        <!-- 头部信息 -->
        <div class="panel-header">
          <div class="character-info">
            <div class="character-avatar">
              <van-icon name="user-o" size="32" />
            </div>
            <div class="character-meta">
              <h3 class="character-name">{{ character?.name }}</h3>
              <div class="bond-level">
                <van-tag color="#FF69B4" round size="small">
                  羁绊 Lv.{{ bondLevel }} {{ bondLevelName }}
                </van-tag>
              </div>
            </div>
          </div>
          <van-icon name="cross" class="close-btn" @click="showVoicePanel = false" />
        </div>

        <!-- 羁绊进度 -->
        <div class="bond-progress-section">
          <div class="progress-header">
            <span class="progress-label">羁绊进度</span>
            <span class="progress-value">{{ bondProgress }}%</span>
          </div>
          <van-progress
            :percentage="bondProgress"
            :color="bondProgressColor"
            stroke-width="8"
            :show-pivot="false"
          />
          <p class="progress-desc">{{ bondLevelDescription }}</p>
        </div>

        <!-- 互动按钮区 -->
        <div class="interaction-section">
          <h4 class="section-title">今日互动</h4>
          <div class="interaction-grid">
            <div
              v-for="interaction in availableInteractions"
              :key="interaction.type"
              class="interaction-item"
              :class="{ disabled: !interaction.canInteract }"
              @click="handleInteraction(interaction)"
            >
              <div class="interaction-icon" :style="{ background: interaction.color }">
                <van-icon :name="interaction.icon" size="20" />
              </div>
              <span class="interaction-name">{{ interaction.name }}</span>
              <span class="interaction-exp">+{{ interaction.experience }}EXP</span>
              <span v-if="!interaction.canInteract" class="cooldown-text">
                {{ interaction.cooldownText }}
              </span>
            </div>
          </div>
        </div>

        <!-- 心声列表 -->
        <div class="voice-list-section">
          <h4 class="section-title">
            心声记录
            <van-tag v-if="unreadCount > 0" color="#FF69B4" round size="small">
              {{ unreadCount }}条未读
            </van-tag>
          </h4>
          <div class="voice-list" ref="voiceListRef">
            <div
              v-for="voice in voices"
              :key="voice.id"
              class="voice-item"
              :class="{ unread: !voice.isRead, [voice.type]: true }"
              @click="readVoice(voice)"
            >
              <div class="voice-avatar">
                <van-icon name="user-o" size="20" />
              </div>
              <div class="voice-content">
                <p class="voice-text">{{ voice.content }}</p>
                <span class="voice-time">{{ formatTime(voice.timestamp) }}</span>
              </div>
              <div v-if="!voice.isRead" class="unread-dot"></div>
            </div>
            <van-empty v-if="voices.length === 0" description="暂无心声记录" />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 心声详情弹窗 -->
    <van-dialog
      v-model:show="showVoiceDetail"
      title="角色心声"
      confirm-button-text="知道了"
      confirm-button-color="#FF69B4"
    >
      <div class="voice-detail">
        <div class="detail-avatar">
          <van-icon name="user-o" size="48" />
        </div>
        <p class="detail-text">{{ selectedVoice?.content }}</p>
        <div class="detail-meta">
          <span class="detail-type">{{ getVoiceTypeLabel(selectedVoice?.type) }}</span>
          <span class="detail-time">{{ formatTime(selectedVoice?.timestamp || '') }}</span>
        </div>
      </div>
    </van-dialog>

    <!-- 互动结果提示 -->
    <van-popup v-model:show="showInteractionResult" round class="result-popup">
      <div class="interaction-result">
        <div class="result-icon" :style="{ background: resultColor }">
          <van-icon :name="resultIcon" size="32" />
        </div>
        <h4 class="result-title">{{ resultTitle }}</h4>
        <p class="result-message">{{ resultMessage }}</p>
        <div v-if="resultVoice" class="result-voice">
          <van-divider>角色说</van-divider>
          <p class="voice-quote">"{{ resultVoice.content }}"</p>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import type { CharacterVoice as VoiceType } from '@/types/characterBond';
import { BOND_INTERACTIONS, getBondProgress } from '@/types/characterBond';
import { showToast } from 'vant';

const props = defineProps<{
  characterId: string;
}>();

const gameStore = useGameStore();
const showVoicePanel = ref(false);
const showVoiceDetail = ref(false);
const showInteractionResult = ref(false);
const selectedVoice = ref<VoiceType | null>(null);
const voices = ref<VoiceType[]>([]);
const resultTitle = ref('');
const resultMessage = ref('');
const resultIcon = ref('success');
const resultColor = ref('#07c160');
const resultVoice = ref<VoiceType | null>(null);

const character = computed(() => {
  if (!gameStore.currentGame) return null;
  return gameStore.currentGame.characters.find(c => c.id === props.characterId) || null;
});

const bond = computed(() => {
  return gameStore.getCharacterBond(props.characterId);
});

const bondLevel = computed(() => bond.value?.level || 1);
const bondLevelName = computed(() => gameStore.getBondLevelName(bondLevel.value));
const unreadCount = computed(() => gameStore.getUnreadVoiceCount(props.characterId));
const bondProgress = computed(() => {
  if (!bond.value) return 0;
  return Math.round(getBondProgress(bond.value));
});

const bondProgressColor = computed(() => {
  const progress = bondProgress.value;
  if (progress >= 80) return '#FF69B4';
  if (progress >= 50) return '#FFB6C1';
  return '#FFE4E8';
});

const bondLevelDescription = computed(() => {
  const descriptions: Record<number, string> = {
    1: '你们刚刚相遇，彼此还在了解中',
    2: '你们开始熟悉，角色会向你倾诉心声',
    3: '你们配合默契，角色会在创作中给你灵感',
    4: '你们心意相通，角色会与你分享专属剧情',
    5: '你们是灵魂伴侣，角色会永远陪伴在你身边'
  };
  return descriptions[bondLevel.value] || descriptions[1];
});

const availableInteractions = computed(() => {
  return BOND_INTERACTIONS.map(config => {
    const canInteract = bond.value ? 
      !bond.value.interactions.some(i => 
        i.type === config.type && 
        new Date(i.timestamp).getTime() > Date.now() - config.cooldown * 60 * 60 * 1000
      ) : true;
    
    const lastInteraction = bond.value?.interactions
      .filter(i => i.type === config.type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    let cooldownText = '';
    if (!canInteract && lastInteraction) {
      const nextTime = new Date(lastInteraction.timestamp).getTime() + config.cooldown * 60 * 60 * 1000;
      const remaining = nextTime - Date.now();
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      cooldownText = hours > 0 ? `${hours}小时后` : `${minutes}分钟后`;
    }
    
    const colors: Record<string, string> = {
      'view': '#FF69B4',
      'encourage': '#FFB6C1',
      'discuss': '#87CEEB',
      'create': '#98FB98',
      'operate': '#DDA0DD'
    };
    
    return {
      ...config,
      canInteract,
      cooldownText,
      color: colors[config.type] || '#FF69B4'
    };
  });
});

async function loadVoices() {
  voices.value = gameStore.getCharacterVoices(props.characterId, 20);
}

function readVoice(voice: VoiceType) {
  selectedVoice.value = voice;
  showVoiceDetail.value = true;
  if (!voice.isRead) {
    gameStore.markVoiceAsRead(props.characterId, voice.id);
    loadVoices();
  }
}

function getVoiceTypeLabel(type?: string): string {
  const labels: Record<string, string> = {
    'daily': '日常',
    'encourage': '鼓励',
    'thanks': '感谢',
    'suggestion': '建议',
    'confession': '告白'
  };
  return labels[type || 'daily'] || '日常';
}

function formatTime(timestamp: string): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  
  return date.toLocaleDateString('zh-CN');
}

async function handleInteraction(interaction: typeof availableInteractions.value[0]) {
  if (!interaction.canInteract) {
    showToast(`请${interaction.cooldownText}后再试`);
    return;
  }
  
  const result = gameStore.interactWithCharacter(props.characterId, interaction.type);
  
  if (result.success) {
    resultTitle.value = '互动成功';
    resultMessage.value = result.message;
    resultIcon.value = 'success';
    resultColor.value = '#07c160';
    resultVoice.value = result.voice || null;
    
    await loadVoices();
  } else {
    resultTitle.value = '互动失败';
    resultMessage.value = result.message;
    resultIcon.value = 'cross';
    resultColor.value = '#ff4d4f';
    resultVoice.value = null;
  }
  
  showInteractionResult.value = true;
}

watch(showVoicePanel, (newVal) => {
  if (newVal) {
    loadVoices();
  }
});

onMounted(() => {
  loadVoices();
});
</script>

<style scoped lang="scss">
.character-voice {
  display: inline-block;
}

.voice-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 8px;
  
  .voice-icon {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FF69B4;
    transition: all 0.3s ease;
    
    &.has-unread {
      animation: pulse 2s infinite;
    }
    
    .unread-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background: #ff4d4f;
      color: white;
      border-radius: 9px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .voice-label {
    font-size: 12px;
    color: #666;
  }
  
  &:active .voice-icon {
    transform: scale(0.95);
  }
}

.voice-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  
  .character-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .character-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .character-name {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: bold;
    }
  }
  
  .close-btn {
    font-size: 24px;
    color: #999;
    cursor: pointer;
  }
}

.bond-progress-section {
  padding: 16px;
  background: white;
  margin-bottom: 8px;
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .progress-label {
      font-size: 14px;
      color: #666;
    }
    
    .progress-value {
      font-size: 14px;
      font-weight: bold;
      color: #FF69B4;
    }
  }
  
  .progress-desc {
    margin: 8px 0 0 0;
    font-size: 12px;
    color: #999;
    text-align: center;
  }
}

.interaction-section {
  padding: 16px;
  background: white;
  margin-bottom: 8px;
  
  .section-title {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .interaction-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }
  
  .interaction-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 8px 4px;
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &:not(.disabled):active {
      transform: scale(0.95);
      background: #f5f5f5;
    }
    
    .interaction-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .interaction-name {
      font-size: 12px;
      color: #333;
    }
    
    .interaction-exp {
      font-size: 10px;
      color: #FF69B4;
    }
    
    .cooldown-text {
      font-size: 10px;
      color: #999;
    }
  }
}

.voice-list-section {
  flex: 1;
  padding: 16px;
  background: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  .section-title {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .voice-list {
    flex: 1;
    overflow-y: auto;
    
    .voice-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      margin-bottom: 8px;
      background: #f9f9f9;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      
      &.unread {
        background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E8 100%);
      }
      
      &:active {
        transform: scale(0.98);
      }
      
      .voice-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }
      
      .voice-content {
        flex: 1;
        min-width: 0;
        
        .voice-text {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: #333;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .voice-time {
          font-size: 12px;
          color: #999;
        }
      }
      
      .unread-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #FF69B4;
        flex-shrink: 0;
        margin-top: 4px;
      }
    }
  }
}

.voice-detail {
  padding: 20px;
  text-align: center;
  
  .detail-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin: 0 auto 16px;
  }
  
  .detail-text {
    font-size: 16px;
    color: #333;
    line-height: 1.6;
    margin: 0 0 16px 0;
  }
  
  .detail-meta {
    display: flex;
    justify-content: center;
    gap: 16px;
    
    .detail-type {
      padding: 4px 12px;
      background: #FFF5F7;
      color: #FF69B4;
      border-radius: 12px;
      font-size: 12px;
    }
    
    .detail-time {
      font-size: 12px;
      color: #999;
    }
  }
}

.interaction-result {
  padding: 24px;
  text-align: center;
  
  .result-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin: 0 auto 16px;
  }
  
  .result-title {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #333;
  }
  
  .result-message {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #666;
  }
  
  .result-voice {
    .voice-quote {
      font-size: 14px;
      color: #FF69B4;
      font-style: italic;
      margin: 8px 0 0 0;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 105, 180, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 105, 180, 0);
  }
}
</style>
