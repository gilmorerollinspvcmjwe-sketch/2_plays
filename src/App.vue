<template>
  <van-config-provider>
    <router-view />
    <OnboardingGuide />
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
import OnboardingGuide from '@/components/OnboardingGuide.vue';
import AchievementPopup from '@/components/animations/AchievementPopup.vue';
import { usePointsStore } from '@/stores/points';

const pointsStore = usePointsStore();

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
  '10_comments': { description: '发表了10条评论', icon: '🗣️' },
  popular_game: { description: '游戏人气突破1000', icon: '🔥' },
  first_income: { description: '获得第一笔收益', icon: '💰' },
  rich: { description: '累计收益超过10000', icon: '💎' },
  hot_comment: { description: '评论获得10个点赞', icon: '❤️' },
  handle_incident: { description: '成功处理一次舆情危机', icon: '🛡️' },
  rich_day: { description: '单日收益超过100', icon: '🌟' },
  high_reputation: { description: '游戏评分超过4.5', icon: '⭐' },
  hot_confession: { description: '告白获得10个点赞', icon: '💌' },
  hot_creation: { description: '创作获得10个点赞', icon: '✨' },
  first_confession: { description: '发布了第一条告白', icon: '💗' },
  first_creation: { description: '发布了第一个创作', icon: '🎨' }
};

onMounted(() => {
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
