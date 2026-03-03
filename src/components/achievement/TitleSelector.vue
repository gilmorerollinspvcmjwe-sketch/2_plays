<template>
  <div class="title-selector">
    <div class="selector-header">
      <h3 class="selector-title">👑 我的称号</h3>
      <div class="current-title" v-if="currentTitle">
        <span class="current-icon">{{ currentTitle.icon }}</span>
        <span class="current-name">{{ currentTitle.name }}</span>
      </div>
    </div>

    <div class="title-preview" v-if="previewTitle">
      <div class="preview-card">
        <div class="preview-avatar">
          <van-icon name="user-circle-o" size="48" color="#FF69B4" />
        </div>
        <div class="preview-info">
          <div class="preview-title-badge">
            <span class="title-icon">{{ previewTitle.icon }}</span>
            <span class="title-name">{{ previewTitle.name }}</span>
          </div>
          <p class="preview-username">游戏创作者</p>
        </div>
      </div>
      <p class="preview-hint">预览效果</p>
    </div>

    <div class="title-list">
      <div
        v-for="title in titles"
        :key="title.id"
        class="title-item"
        :class="{ 
          unlocked: title.unlocked, 
          locked: !title.unlocked,
          active: currentTitleId === title.id 
        }"
        @click="handleTitleClick(title)"
      >
        <div class="title-left">
          <span class="title-icon">{{ title.icon }}</span>
          <div class="title-info">
            <span class="title-name">{{ title.name }}</span>
            <span class="title-condition">{{ title.condition }}</span>
          </div>
        </div>
        <div class="title-right">
          <van-tag v-if="currentTitleId === title.id" type="primary" size="medium">使用中</van-tag>
          <van-tag v-else-if="title.unlocked" type="success" size="medium">已解锁</van-tag>
          <van-tag v-else type="default" size="medium">未解锁</van-tag>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showConfirm" round :style="{ padding: '24px', width: '80%', maxWidth: '320px' }">
      <div class="confirm-dialog">
        <h4 class="confirm-title">装备称号</h4>
        <p class="confirm-desc">
          确定要装备「{{ selectedTitle?.name }}」称号吗？
        </p>
        <div class="confirm-actions">
          <van-button plain @click="showConfirm = false">取消</van-button>
          <van-button type="primary" @click="confirmEquip">确定</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePointsStore, type Title } from '@/stores/points';
import { showToast } from 'vant';

const pointsStore = usePointsStore();

const titles = computed(() => pointsStore.titles);
const currentTitleId = computed(() => pointsStore.currentTitleId);
const currentTitle = computed(() => pointsStore.currentTitle);

const previewTitle = ref<Title | null>(null);
const showConfirm = ref(false);
const selectedTitle = ref<Title | null>(null);

function handleTitleClick(title: Title) {
  if (!title.unlocked) {
    showToast('尚未解锁该称号');
    return;
  }
  
  previewTitle.value = title;
  
  if (currentTitleId.value !== title.id) {
    selectedTitle.value = title;
    showConfirm.value = true;
  }
}

function confirmEquip() {
  if (selectedTitle.value) {
    const result = pointsStore.setCurrentTitle(selectedTitle.value.id);
    showToast(result.message);
    showConfirm.value = false;
  }
}
</script>

<style scoped lang="scss">
.title-selector {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.selector-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.current-title {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  padding: 6px 12px;
  border-radius: 20px;
}

.current-icon {
  font-size: 16px;
}

.current-name {
  font-size: 13px;
  color: white;
  font-weight: bold;
}

.title-preview {
  margin-bottom: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.preview-avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-info {
  flex: 1;
}

.preview-title-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  padding: 2px 8px;
  border-radius: 10px;
  margin-bottom: 4px;

  .title-icon {
    font-size: 12px;
  }

  .title-name {
    font-size: 12px;
    color: white;
    font-weight: bold;
  }
}

.preview-username {
  font-size: 14px;
  color: #333;
  margin: 0;
}

.preview-hint {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin: 8px 0 0;
}

.title-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &.unlocked {
    background: #fafafa;
    border: 1px solid #e8e8e8;

    &:hover {
      background: #f5f5f5;
    }

    &.active {
      background: linear-gradient(135deg, #FFF5F7, #FFE4E8);
      border-color: rgba(255, 105, 180, 0.3);
    }
  }

  &.locked {
    background: #f5f5f5;
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.title-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 24px;
}

.title-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.title-condition {
  font-size: 12px;
  color: #999;
}

.title-right {
  :deep(.van-tag) {
    min-width: 50px;
    text-align: center;
  }
}

.confirm-dialog {
  text-align: center;
}

.confirm-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px;
}

.confirm-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;

  .van-button {
    min-width: 80px;
  }
}
</style>
