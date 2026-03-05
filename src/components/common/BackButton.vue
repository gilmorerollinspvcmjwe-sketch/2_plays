<template>
  <van-nav-bar
    :title="title"
    :left-arrow="showBack"
    @click-left="handleBack"
    :border="false"
    class="back-button-nav"
  >
    <template #right v-if="$slots.right">
      <slot name="right" />
    </template>
  </van-nav-bar>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';

interface Props {
  title?: string;
  showBack?: boolean;
  backPath?: string;
  backFallback?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showBack: true,
  backPath: '',
  backFallback: '/'
});

const router = useRouter();
const route = useRoute();

const handleBack = () => {
  // 如果指定了返回路径，直接跳转
  if (props.backPath) {
    router.push(props.backPath);
    return;
  }

  // 如果有历史记录，返回上一页
  if (window.history.length > 1) {
    router.back();
  } else {
    // 没有历史记录，跳转到回退路径
    router.push(props.backFallback);
  }
};
</script>

<style scoped>
.back-button-nav {
  background: transparent;
}

:deep(.van-nav-bar__title) {
  font-weight: 600;
  color: #333;
}

:deep(.van-nav-bar__arrow) {
  font-size: 20px;
  color: #333;
}
</style>
