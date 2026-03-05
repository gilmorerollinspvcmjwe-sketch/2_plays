<template>
  <van-popup v-model:show="showPopup" position="top" :style="{ background: 'linear-gradient(180deg, #FFE4E8 0%, #FFF5F7 100%)' }">
    <div class="birthday-notification">
      <div class="birthday-icon">🎂</div>
      <h3 class="birthday-title">生日快乐！</h3>
      <p class="birthday-message">
        今天是 <span class="character-name">{{ character?.name }}</span> 的生日
        <br>
        为他准备一份特别的礼物吧！
      </p>
      <div class="birthday-actions">
        <van-button size="small" plain @click="handleClose">
          稍后再说
        </van-button>
        <van-button size="small" type="primary" @click="handleCelebrate">
          🎁 庆祝生日
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Character } from '@/types'

interface Props {
  character: Character | null
  show: boolean
}

interface Emits {
  (e: 'celebrate', characterId: string): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  character: null
})

const emit = defineEmits<Emits>()

const showPopup = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) {
      emit('close')
    }
  }
})

const handleClose = () => {
  emit('close')
}

const handleCelebrate = () => {
  if (props.character) {
    emit('celebrate', props.character.id)
  }
}
</script>

<style scoped lang="scss">
.birthday-notification {
  padding: 24px 16px;
  text-align: center;
  
  .birthday-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }
  
  .birthday-title {
    font-size: 20px;
    font-weight: bold;
    color: #FF69B4;
    margin-bottom: 8px;
  }
  
  .birthday-message {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 16px;
    
    .character-name {
      color: #FF69B4;
      font-weight: bold;
    }
  }
  
  .birthday-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
}
</style>
