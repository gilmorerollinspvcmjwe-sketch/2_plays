<template>
  <van-config-provider>
    <router-view />
    <OnboardingGuide v-if="showOnboarding" />
    <AchievementPopup
      v-if="showAchievement"
      :achievement="currentAchievement"
      :auto-close="true"
      :duration="4000"
      @close="closeAchievement"
    />
  </van-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const showOnboarding = ref(false);
const showAchievement = ref(false);
const currentAchievement = ref({
  name: '',
  description: '',
  points: 0,
  icon: '🏆'
});

const achievementConfig: Record<string, { description: string; icon: string }> = {
  first_game: { description: '成功发布了一款游戏', icon: '🎮' },
  first_comment: { description: '发表了第一条评论', icon: '💬' },
  '10_comments': { description: '发表了 10 条评论', icon: '🗣️' },
  popular_game: { description: '游戏人气突破 1000', icon: '🔥' },
  first_income: { description: '获得第一笔收益', icon: '💰' },
  rich: { description: '累计收益超过 10000', icon: '💎' },
  hot_comment: { description: '评论获得 10 个点赞', icon: '❤️' },
  handle_incident: { description: '成功处理一次舆情危机', icon: '🛡️' },
  rich_day: { description: '单日收益超过 100', icon: '🌟' },
  high_reputation: { description: '游戏评分超过 4.5', icon: '⭐' },
  hot_confession: { description: '告白获得 10 个点赞', icon: '💌' },
  hot_creation: { description: '创作获得 10 个点赞', icon: '✨' },
  first_confession: { description: '发布了第一条告白', icon: '💗' },
  first_creation: { description: '发布了第一个创作', icon: '🎨' }
};

onMounted(async () => {
  console.log('App mounted');
  
  try {
    // 延迟加载 OnboardingGuide
    const onboardingModule = await import('@/components/OnboardingGuide.vue');
    showOnboarding.value = true;
    
    // 延迟加载 AchievementPopup 和 pointsStore
    const [achievementModule, pointsModule] = await Promise.all([
      import('@/components/animations/AchievementPopup.vue'),
      import('@/stores/points')
    ]);
    
    const pointsStore = pointsModule.usePointsStore();
    
    pointsStore.setAchievementCallback((achievement) => {
      const config = achievementConfig[achievement.key] || { description: '达成成就', icon: '🏆' };
      currentAchievement.value = {
        name: achievement.name,
        description: config.description,
        points: achievement.points,
        icon: config.icon
      };
      showAchievement.value = true;
    });
    
    console.log('App initialization complete');
  } catch (error) {
    console.error('App init error:', error);
  }
});

function closeAchievement() {
  showAchievement.value = false;
}
</script>

<style lang="scss">
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
