<template>
  <van-cell-group class="daily-task-card" inset>
    <div class="card-header">
      <div class="header-left">
        <van-icon name="todo-list-o" />
        <span class="title">每日任务</span>
      </div>
      <div class="header-right">
        <span class="progress-text">{{ taskStore.dailyProgress.current }}/{{ taskStore.dailyProgress.total }}</span>
        <van-button 
          v-if="taskStore.allDailyCompleted" 
          size="small" 
          type="primary"
          @click="handleClaimAll"
        >
          领取全部
        </van-button>
      </div>
    </div>
    
    <div class="progress-bar-container">
      <van-progress 
        :percentage="taskStore.dailyProgress.percentage" 
        stroke-width="8"
        color="linear-gradient(to right, #FF69B4, #FFB6C1)"
      />
    </div>

    <div class="task-list">
      <div 
        v-for="task in taskStore.dailyTasks" 
        :key="task.id" 
        class="task-item"
        :class="{ completed: task.completed }"
      >
        <div class="task-info">
          <div class="task-title">
            <van-icon v-if="task.completed" name="success" color="#07c160" />
            <van-icon v-else name="circle" color="#ccc" />
            <span>{{ task.title }}</span>
          </div>
          <div class="task-desc">{{ task.description }}</div>
        </div>
        
        <div class="task-reward">
          <template v-if="task.reward.gold">
            <span class="reward-gold">+{{ task.reward.gold }}</span>
            <span class="reward-icon">💰</span>
          </template>
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

    <div v-if="taskStore.allDailyCompleted" class="all-complete-bonus">
      <van-icon name="gem" color="#FF69B4" />
      <span>全部完成奖励：+50💎</span>
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
      message: `获得 ${reward.gold ? reward.gold + '金币' : ''} ${reward.diamond ? reward.diamond + '钻石' : ''}`,
      icon: 'success'
    });
  }
}

function handleClaimAll() {
  const reward = taskStore.claimAllDailyRewards();
  if (reward.gold > 0 || reward.diamond > 0) {
    showToast({
      message: `获得 ${reward.gold}金币 ${reward.diamond}钻石`,
      icon: 'success'
    });
  }
}
</script>

<style scoped lang="scss">
.daily-task-card {
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
    color: #FF69B4;
  }
  
  .title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  
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
      color: #07c160;
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
  
  .reward-gold {
    color: #ff976a;
    font-weight: 500;
  }
  
  .reward-diamond {
    color: #1989fa;
    font-weight: 500;
  }
  
  .reward-icon {
    font-size: 14px;
  }
}

.all-complete-bonus {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(to right, #fff5f7, #fff);
  border-top: 1px solid #ebedf0;
  font-size: 14px;
  color: #FF69B4;
}
</style>
