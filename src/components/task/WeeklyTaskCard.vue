<template>
  <van-cell-group class="weekly-task-card" inset>
    <div class="card-header">
      <div class="header-left">
        <van-icon name="calendar-o" />
        <span class="title">每周任务</span>
      </div>
      <div class="header-right">
        <span class="progress-text">{{ taskStore.weeklyProgress.current }}/{{ taskStore.weeklyProgress.total }}</span>
      </div>
    </div>
    
    <div class="progress-bar-container">
      <van-progress 
        :percentage="taskStore.weeklyProgress.percentage" 
        stroke-width="8"
        color="linear-gradient(to right, #1989fa, #4fc3f7)"
      />
    </div>

    <div class="task-list">
      <div 
        v-for="task in taskStore.weeklyTasks" 
        :key="task.id" 
        class="task-item"
        :class="{ completed: task.completed }"
      >
        <div class="task-info">
          <div class="task-title">
            <van-icon v-if="task.completed" name="success" color="#1989fa" />
            <van-icon v-else name="circle" color="#ccc" />
            <span>{{ task.title }}</span>
          </div>
          <div class="task-desc">{{ task.description }}</div>
        </div>
        
        <div class="task-reward">
          <template v-if="task.reward.diamond">
            <span class="reward-diamond">+{{ task.reward.diamond }}</span>
            <span class="reward-icon">💎</span>
          </template>
        </div>

        <van-button 
          v-if="task.completed && !task.claimed"
          size="mini"
          type="primary"
          @click="handleClaim(task.id)"
        >
          领取
        </van-button>
        <van-button 
          v-else-if="task.claimed"
          size="mini"
          disabled
        >
          已领取
        </van-button>
      </div>
    </div>
  </van-cell-group>
</template>

<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore';
import { showToast } from 'vant';

const taskStore = useTaskStore();

function handleClaim(taskId: string) {
  const reward = taskStore.claimReward(taskId);
  if (reward) {
    showToast({
      message: `获得 ${reward.diamond || 0}钻石`,
      icon: 'success'
    });
  }
}
</script>

<style scoped lang="scss">
.weekly-task-card {
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #ebedf0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .van-icon {
    font-size: 20px;
    color: #1989fa;
  }
  
  .title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
}

.header-right {
  .progress-text {
    font-size: 14px;
    color: #969799;
  }
}

.progress-bar-container {
  padding: 8px 16px;
}

.task-list {
  padding: 8px 16px;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f7f8fa;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.completed {
    .task-title {
      color: #1989fa;
    }
  }
}

.task-info {
  flex: 1;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #323233;
  margin-bottom: 4px;
}

.task-desc {
  font-size: 12px;
  color: #969799;
  margin-left: 24px;
}

.task-reward {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 12px;
  
  .reward-diamond {
    color: #1989fa;
    font-weight: 500;
  }
  
  .reward-icon {
    font-size: 14px;
  }
}
</style>
