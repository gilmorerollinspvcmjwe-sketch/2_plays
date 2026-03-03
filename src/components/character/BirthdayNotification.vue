<template>
  <div class="birthday-notification" v-if="todayBirthdays.length > 0 || upcomingBirthdays.length > 0">
    <van-notice-bar
      v-if="todayBirthdays.length > 0"
      left-icon="birthday"
      background="linear-gradient(to right, #FFF5F7, #FFE4E8)"
      color="#FF69B4"
      scrollable
    >
      🎂 今天是 {{ todayBirthdays.map(c => c.name).join('、') }} 的生日！
    </van-notice-bar>
    
    <div class="birthday-list" v-if="showList">
      <van-cell-group title="🎂 今日生日">
        <van-cell
          v-for="char in todayBirthdays"
          :key="char.id"
          :title="char.name"
          :label="`人气 +20%`"
          clickable
          @click="$emit('select-character', char)"
        >
          <template #icon>
            <span class="birthday-icon">🎂</span>
          </template>
          <template #right-icon>
            <van-tag type="danger" size="medium">今日</van-tag>
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group title="📅 即将到来" v-if="upcomingBirthdays.length > 0">
        <van-cell
          v-for="{ character, daysUntil } in upcomingBirthdays"
          :key="character.id"
          :title="character.name"
          :label="`${character.birthday?.month}月${character.birthday?.day}日`"
          clickable
          @click="$emit('select-character', character)"
        >
          <template #icon>
            <span class="upcoming-icon">🎁</span>
          </template>
          <template #right-icon>
            <van-tag type="primary" size="medium">{{ daysUntil }}天后</van-tag>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    
    <div class="toggle-btn" v-if="upcomingBirthdays.length > 0" @click="showList = !showList">
      <van-icon :name="showList ? 'arrow-up' : 'arrow-down'" />
      {{ showList ? '收起' : '查看更多生日' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();
const showList = ref(false);

const emit = defineEmits(['select-character']);

const todayBirthdays = computed(() => {
  return gameStore.getTodayBirthdayCharacters();
});

const upcomingBirthdays = computed(() => {
  return gameStore.getUpcomingBirthdays(30).filter(item => item.daysUntil > 0);
});
</script>

<style scoped lang="scss">
.birthday-notification {
  margin-bottom: 16px;
  
  .birthday-list {
    margin-top: 8px;
    background: white;
    border-radius: 12px;
    overflow: hidden;
  }
  
  .birthday-icon,
  .upcoming-icon {
    font-size: 20px;
    margin-right: 8px;
  }
  
  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px;
    background: white;
    border-radius: 8px;
    margin-top: 8px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    
    &:hover {
      background: #f9f9f9;
    }
  }
}

:deep(.van-cell-group__title) {
  padding-left: 16px;
  font-size: 14px;
  color: #666;
}

:deep(.van-cell) {
  padding: 12px 16px;
  
  &:active {
    background: #f9f9f9;
  }
}
</style>
