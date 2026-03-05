<template>
  <van-popup v-model:show="showPopup" position="bottom" round>
    <div class="birthday-gift-modal">
      <van-nav-bar title="选择生日礼物" left-arrow @click-left="handleClose" />
      
      <div class="gift-list">
        <div 
          v-for="gift in gifts" 
          :key="gift.id"
          class="gift-item"
          :class="{ selected: selectedGift?.id === gift.id }"
          @click="selectGift(gift)"
        >
          <div class="gift-icon">{{ gift.icon }}</div>
          <div class="gift-info">
            <h4 class="gift-name">{{ gift.name }}</h4>
            <p class="gift-description">{{ gift.description }}</p>
            <div class="gift-cost">
              <van-icon name="gold-coin" />
              <span>{{ gift.cost }} 积分</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="confirm-actions">
        <van-button 
          block 
          type="primary" 
          :disabled="!selectedGift"
          :loading="sending"
          @click="handleSendGift"
        >
          赠送礼物 ({{ selectedGift?.cost || 0 }} 积分)
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePointsStore } from '@/stores/points'
import { showToast, showSuccessToast, showDialog } from 'vant'

interface Props {
  show: boolean
  characterId: string
  characterName: string
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'gift-sent', giftId: string, cost: number): void
}

interface Gift {
  id: string
  name: string
  description: string
  icon: string
  cost: number
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  characterId: '',
  characterName: ''
})

const emit = defineEmits<Emits>()

const pointsStore = usePointsStore()

const showPopup = computed({
  get: () => props.show,
  set: (value) => {
    emit('update:show', value)
  }
})

const selectedGift = ref<Gift | null>(null)
const sending = ref(false)

const gifts: Gift[] = [
  {
    id: 'cake',
    name: '生日蛋糕',
    description: '甜蜜的生日蛋糕，带来满满的幸福感',
    icon: '🎂',
    cost: 100
  },
  {
    id: 'flowers',
    name: '花束',
    description: '精美的花束，表达你的心意',
    icon: '💐',
    cost: 200
  },
  {
    id: 'necklace',
    name: '项链',
    description: '精致的项链，永恒的纪念',
    icon: '📿',
    cost: 500
  },
  {
    id: 'ring',
    name: '戒指',
    description: '闪耀的戒指，承诺的象征',
    icon: '💍',
    cost: 1000
  }
]

const selectGift = (gift: Gift) => {
  selectedGift.value = gift
}

const handleClose = () => {
  showPopup.value = false
}

const handleSendGift = async () => {
  if (!selectedGift.value) return
  
  if (pointsStore.balance < selectedGift.value.cost) {
    showDialog({
      title: '积分不足',
      message: '您的积分不足以购买这个礼物，请继续努力赚取积分吧！',
      confirmButtonText: '知道了'
    })
    return
  }
  
  sending.value = true
  
  try {
    // 消耗积分
    pointsStore.spendPoints(selectedGift.value.cost, `赠送${props.characterName}生日礼物：${selectedGift.value.name}`)
    
    showSuccessToast('礼物赠送成功！')
    emit('gift-sent', selectedGift.value.id, selectedGift.value.cost)
    handleClose()
  } catch (error) {
    showToast('赠送失败，请重试')
  } finally {
    sending.value = false
  }
}
</script>

<style scoped lang="scss">
.birthday-gift-modal {
  max-height: 70vh;
  overflow-y: auto;
  
  .gift-list {
    padding: 16px;
    
    .gift-item {
      display: flex;
      align-items: center;
      padding: 12px;
      margin-bottom: 12px;
      border-radius: 8px;
      border: 2px solid #eee;
      transition: all 0.3s;
      cursor: pointer;
      
      &.selected {
        border-color: #FF69B4;
        background-color: #FFF5F7;
      }
      
      &:active {
        transform: scale(0.98);
      }
      
      .gift-icon {
        font-size: 36px;
        margin-right: 12px;
      }
      
      .gift-info {
        flex: 1;
        
        .gift-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .gift-description {
          font-size: 12px;
          color: #999;
          margin-bottom: 4px;
        }
        
        .gift-cost {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #FF69B4;
          font-size: 14px;
          font-weight: bold;
        }
      }
    }
  }
  
  .confirm-actions {
    padding: 16px;
    border-top: 1px solid #eee;
  }
}
</style>
