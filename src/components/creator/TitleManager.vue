<template>
  <div class="title-manager">
    <div class="title-intro">
      <h4>🏆 称号管理</h4>
      <p>解锁称号，展示你的成就</p>
    </div>
    
    <!-- 当前称号 -->
    <div class="current-title-section">
      <div class="section-label">当前称号</div>
      <div class="current-title-card" v-if="currentTitle">
        <div class="title-icon-large">{{ currentTitle.icon }}</div>
        <div class="title-info">
          <div class="title-name-large">{{ currentTitle.name }}</div>
          <div class="title-desc">{{ currentTitle.description }}</div>
        </div>
      </div>
      <div v-else class="no-title">
        <van-icon name="medal-o" size="48" color="#ddd" />
        <p>暂无称号，去解锁成就吧</p>
      </div>
    </div>
    
    <!-- 称号列表 -->
    <div class="titles-list-section">
      <div class="section-label">已解锁称号 ({{ unlockedTitles.length }}/{{ allTitles.length }})</div>
      <div class="titles-grid">
        <div 
          v-for="title in unlockedTitles" 
          :key="title.id"
          class="title-item"
          :class="{ active: currentTitle?.id === title.id }"
          @click="equipTitle(title)"
        >
          <div class="title-icon">{{ title.icon }}</div>
          <div class="title-name">{{ title.name }}</div>
          <van-tag v-if="currentTitle?.id === title.id" type="primary" size="mini" color="#FF69B4">佩戴中</van-tag>
        </div>
      </div>
    </div>
    
    <!-- 未解锁称号 -->
    <div class="locked-titles-section" v-if="lockedTitles.length > 0">
      <div class="section-label">未解锁称号</div>
      <div class="titles-grid locked">
        <div 
          v-for="title in lockedTitles" 
          :key="title.id"
          class="title-item locked"
        >
          <div class="title-icon">🔒</div>
          <div class="title-name">{{ title.name }}</div>
          <div class="unlock-hint">{{ title.unlockHint }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePointsStore, type Title } from '@/stores/points';
import { showToast } from 'vant';

const pointsStore = usePointsStore();

// 当前称号
const currentTitle = computed(() => pointsStore.currentTitle);

// 所有称号配置
const allTitles: Title[] = [
  { id: 'novice', name: '新手创作者', icon: '🌱', description: '刚开始创作之旅', condition: 'default' },
  { id: 'rising', name: '崛起之星', icon: '⭐', description: '累计获得1000人气', condition: 'popularity_1000' },
  { id: 'popular', name: '人气创作者', icon: '🔥', description: '累计获得10000人气', condition: 'popularity_10000' },
  { id: 'master', name: '大师级创作者', icon: '👑', description: '累计获得100000人气', condition: 'popularity_100000' },
  { id: 'rich', name: '富可敌国', icon: '💎', description: '单日收入超过10000', condition: 'revenue_10000' },
  { id: 'lucky', name: '欧皇附体', icon: '🍀', description: '十连抽获得3个SSR', condition: 'gacha_lucky' },
  { id: 'crisis_master', name: '危机处理大师', icon: '🛡️', description: '成功处理10次危机', condition: 'crisis_10' },
  { id: 'social_butterfly', name: '社交达人', icon: '💬', description: '收到100条评论', condition: 'comments_100' },
];

// 已解锁的称号
const unlockedTitles = computed(() => {
  return allTitles.filter(title => 
    pointsStore.unlockedTitles.includes(title.id)
  );
});

// 未解锁的称号
const lockedTitles = computed(() => {
  return allTitles.filter(title => 
    !pointsStore.unlockedTitles.includes(title.id)
  ).map(title => ({
    ...title,
    unlockHint: getUnlockHint(title.condition)
  }));
});

function getUnlockHint(condition: string): string {
  const hints: Record<string, string> = {
    'default': '初始称号',
    'popularity_1000': '人气达到1000',
    'popularity_10000': '人气达到10000',
    'popularity_100000': '人气达到100000',
    'revenue_10000': '单日收入10000+',
    'gacha_lucky': '十连3SSR',
    'crisis_10': '处理10次危机',
    'comments_100': '收到100条评论'
  };
  return hints[condition] || '完成特定成就';
}

function equipTitle(title: Title) {
  if (currentTitle.value?.id === title.id) {
    showToast('该称号已佩戴');
    return;
  }
  
  const result = pointsStore.equipTitle(title.id);
  if (result.success) {
    showToast(`已佩戴称号：${title.name}`);
  } else {
    showToast(result.message);
  }
}
</script>

<style scoped lang="scss">
.title-manager {
  padding: 0 0 16px;
}

.title-intro {
  text-align: center;
  margin-bottom: 20px;
  
  h4 {
    font-size: 18px;
    color: #333;
    margin: 0 0 8px;
  }
  
  p {
    font-size: 14px;
    color: #999;
    margin: 0;
  }
}

.section-label {
  font-size: 14px;
  font-weight: bold;
  color: #666;
  margin-bottom: 12px;
  padding-left: 4px;
}

// 当前称号
.current-title-section {
  margin-bottom: 24px;
}

.current-title-card {
  background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
}

.title-icon-large {
  font-size: 48px;
}

.title-info {
  flex: 1;
}

.title-name-large {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
}

.title-desc {
  font-size: 14px;
  opacity: 0.9;
}

.no-title {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  
  p {
    font-size: 14px;
    color: #999;
    margin-top: 12px;
  }
}

// 称号列表
.titles-list-section {
  margin-bottom: 24px;
}

.titles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  
  &.locked {
    opacity: 0.6;
  }
}

.title-item {
  background: white;
  border-radius: 12px;
  padding: 16px 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  cursor: pointer;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.active {
    border: 2px solid #FF69B4;
    background: #FFF5F7;
  }
  
  &.locked {
    cursor: not-allowed;
    background: #f5f5f5;
    
    &:active {
      transform: none;
    }
  }
}

.title-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.title-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unlock-hint {
  font-size: 11px;
  color: #999;
}

// 未解锁区域
.locked-titles-section {
  .section-label {
    color: #999;
  }
}
</style>
