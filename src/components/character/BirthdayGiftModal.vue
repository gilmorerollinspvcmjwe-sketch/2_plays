<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    round
    closeable
    :style="{ height: '70%' }"
    class="birthday-gift-modal"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h3>🎂 {{ character?.name }}的生日礼物</h3>
        <p class="birthday-date" v-if="character?.birthday">
          {{ character.birthday.month }}月{{ character.birthday.day }}日
        </p>
      </div>
      
      <div class="intimacy-info">
        <span class="current-level">
          亲密度：Lv.{{ currentIntimacy?.level || 1 }}
        </span>
        <span class="level-name">
          {{ levelName }}
        </span>
      </div>
      
      <van-divider>选择礼物</van-divider>
      
      <div class="gift-options">
        <div
          v-for="gift in giftOptions"
          :key="gift.id"
          class="gift-card"
          :class="{ selected: selectedGift?.id === gift.id, disabled: !canAfford(gift) }"
          @click="selectGift(gift)"
        >
          <div class="gift-icon">{{ gift.icon }}</div>
          <div class="gift-name">{{ gift.name }}</div>
          <div class="gift-desc">{{ gift.description }}</div>
          <div class="gift-cost">
            <van-icon name="diamond" color="#FF69B4" />
            {{ gift.diamondCost }}
          </div>
          <div class="gift-reward">
            亲密度 +{{ gift.intimacyBonus }}
          </div>
        </div>
      </div>
      
      <div class="diamond-balance">
        <van-icon name="diamond" color="#FF69B4" />
        当前钻石：{{ diamondBalance }}
      </div>
      
      <div class="modal-footer">
        <van-button
          type="primary"
          block
          round
          :disabled="!selectedGift || !canAfford(selectedGift)"
          :loading="sending"
          @click="sendGift"
          color="linear-gradient(to right, #FF69B4, #FFB6C1)"
        >
          送出礼物
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore, INTIMACY_LEVEL_NAMES, type Character } from '@/stores/gameStore';
import { showToast, showSuccessToast } from 'vant';

interface Gift {
  id: string;
  name: string;
  icon: string;
  description: string;
  diamondCost: number;
  intimacyBonus: number;
}

const props = defineProps<{
  show: boolean;
  character: Character | null;
}>();

const emit = defineEmits(['update:show', 'gift-sent']);

const gameStore = useGameStore();
const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
});

const selectedGift = ref<Gift | null>(null);
const sending = ref(false);

const giftOptions: Gift[] = [
  {
    id: 'normal',
    name: '普通礼物',
    icon: '🎁',
    description: '一份心意满满的小礼物',
    diamondCost: 50,
    intimacyBonus: 50
  },
  {
    id: 'exquisite',
    name: '精美礼物',
    icon: '🎀',
    description: '精心挑选的精美礼物',
    diamondCost: 150,
    intimacyBonus: 200
  },
  {
    id: 'luxury',
    name: '奢华礼物',
    icon: '💎',
    description: '顶级奢华的生日惊喜',
    diamondCost: 500,
    intimacyBonus: 800
  }
];

const currentIntimacy = computed(() => {
  if (!props.character) return null;
  return gameStore.getCharacterIntimacy(props.character.id);
});

const levelName = computed(() => {
  const level = currentIntimacy.value?.level || 1;
  return INTIMACY_LEVEL_NAMES[level] || '陌生人';
});

const diamondBalance = computed(() => {
  return gameStore.currentGame?.resources.diamond || 0;
});

const canAfford = (gift: Gift | null) => {
  if (!gift) return false;
  return diamondBalance.value >= gift.diamondCost;
};

const selectGift = (gift: Gift) => {
  if (canAfford(gift)) {
    selectedGift.value = gift;
  } else {
    showToast('钻石不足');
  }
};

const sendGift = async () => {
  if (!props.character || !selectedGift.value) return;
  
  if (!canAfford(selectedGift.value)) {
    showToast('钻石不足');
    return;
  }
  
  sending.value = true;
  
  const consumeResult = gameStore.consumeResources(
    'diamond',
    selectedGift.value.diamondCost,
    `送给${props.character.name}的生日礼物`
  );
  
  if (!consumeResult.success) {
    showToast(consumeResult.message);
    sending.value = false;
    return;
  }
  
  const intimacyResult = gameStore.addIntimacy(
    props.character.id,
    selectedGift.value.intimacyBonus,
    '生日礼物'
  );
  
  if (intimacyResult.success) {
    const message = intimacyResult.levelUp
      ? `礼物送出成功！${intimacyResult.message}`
      : `礼物送出成功！亲密度 +${selectedGift.value.intimacyBonus}`;
    
    showSuccessToast(message);
    
    emit('gift-sent', {
      characterId: props.character.id,
      gift: selectedGift.value,
      intimacyResult
    });
    
    visible.value = false;
  } else {
    showToast(intimacyResult.message);
  }
  
  sending.value = false;
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    selectedGift.value = null;
  }
});
</script>

<style scoped lang="scss">
.birthday-gift-modal {
  .modal-content {
    padding: 20px 16px;
    padding-top: 40px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .modal-header {
    text-align: center;
    margin-bottom: 16px;
    
    h3 {
      font-size: 20px;
      color: #333;
      margin: 0 0 8px 0;
    }
    
    .birthday-date {
      font-size: 14px;
      color: #FF69B4;
      margin: 0;
    }
  }
  
  .intimacy-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E8 100%);
    border-radius: 12px;
    margin-bottom: 16px;
    
    .current-level {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    
    .level-name {
      font-size: 14px;
      color: #FF69B4;
    }
  }
  
  .gift-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px;
  }
  
  .gift-card {
    background: white;
    border: 2px solid #f0f0f0;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.selected {
      border-color: #FF69B4;
      background: linear-gradient(135deg, #FFF5F7 0%, #FFE4E8 100%);
    }
    
    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .gift-icon {
      font-size: 32px;
      text-align: center;
      margin-bottom: 8px;
    }
    
    .gift-name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      text-align: center;
      margin-bottom: 4px;
    }
    
    .gift-desc {
      font-size: 12px;
      color: #999;
      text-align: center;
      margin-bottom: 8px;
    }
    
    .gift-cost {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 14px;
      color: #FF69B4;
      margin-bottom: 4px;
    }
    
    .gift-reward {
      text-align: center;
      font-size: 12px;
      color: #07c160;
    }
  }
  
  .diamond-balance {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #666;
  }
  
  .modal-footer {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
