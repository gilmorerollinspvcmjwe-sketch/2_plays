<template>
  <div class="points-shop">
    <!-- 当前积分 -->
    <van-card
      :title="`当前积分`"
      :desc="`${pointsStore.balance} 积分`"
      thumb="🪙"
    >
      <template #num>
        <div class="points-summary">
          <span>累计获取：{{ pointsStore.totalEarned }}</span>
          <span>累计消耗：{{ pointsStore.totalSpent }}</span>
        </div>
      </template>
    </van-card>

    <!-- 积分获取 -->
    <van-cell-group title="获取积分" inset>
      <van-cell 
        title="每日签到" 
        label="每日 +10 积分"
        center
      >
        <template #right-icon>
          <van-button 
            size="mini" 
            type="primary"
            :disabled="pointsStore.checkedInToday"
            @click="handleCheckIn"
          >
            {{ pointsStore.checkedInToday ? '已签到' : '签到' }}
          </van-button>
        </template>
      </van-cell>
      
      <van-cell 
        title="分享游戏" 
        label="每次 +20 积分"
        center
        @click="handleShare"
      >
        <template #right-icon>
          <van-icon name="share-o" size="20" />
        </template>
      </van-cell>

      <van-cell 
        title="成就系统" 
        label="完成成就获取大量积分"
        is-link
        to="/achievements"
      />
    </van-cell-group>

    <!-- 积分消耗 -->
    <van-cell-group title="消耗积分" inset>
      <van-cell 
        title="AI 角色立绘生成" 
        label="消耗 50 积分/次"
        center
        @click="handleGenerateCharacter"
      >
        <template #right-icon>
          <van-tag type="primary">50 积分</van-tag>
        </template>
      </van-cell>
      
      <van-cell 
        title="AI CG 插图生成" 
        label="消耗 100 积分/次"
        center
        @click="handleGenerateCG"
      >
        <template #right-icon>
          <van-tag type="danger">100 积分</van-tag>
        </template>
      </van-cell>

      <van-cell 
        title="AI 剧情润色" 
        label="消耗 30 积分/次"
        center
        @click="handlePolishPlot"
      >
        <template #right-icon>
          <van-tag type="success">30 积分</van-tag>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 积分记录 -->
    <van-cell-group title="积分记录" inset>
      <van-empty 
        v-if="pointsStore.history.length === 0"
        description="暂无积分记录"
      />
      
      <van-cell 
        v-for="record in pointsStore.history" 
        :key="record.id"
        :title="record.reason"
        :label="formatTime(record.timestamp)"
      >
        <template #right-icon>
          <span :class="record.type === 'earn' ? 'text-green' : 'text-red'">
            {{ record.type === 'earn' ? '+' : '-' }}{{ record.amount }}
          </span>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 积分说明 -->
    <van-cell-group title="积分说明" inset>
      <van-cell>
        <template #label>
          <div class="points-tips">
            <p>1. 每日签到可获得 10 积分</p>
            <p>2. 分享游戏可获得 20 积分</p>
            <p>3. 完成成就可获得大量积分</p>
            <p>4. 积分可用于 AI 图片生成、剧情润色等服务</p>
            <p>5. 积分永久有效，不会过期</p>
          </div>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { usePointsStore } from '@/stores/points';
import { showToast, showDialog } from 'vant';

const pointsStore = usePointsStore();

// 签到
const handleCheckIn = async () => {
  const result = await pointsStore.checkIn();
  showToast(result.message);
};

// 分享
const handleShare = async () => {
  try {
    // 调用分享 API
    if (navigator.share) {
      await navigator.share({
        title: '乙女游戏创作者模拟器',
        text: '来玩这款超有趣的乙游模拟器，打造属于你的乙女游戏！',
        url: window.location.href
      });
      const result = await pointsStore.shareGame();
      showToast(result.message);
    } else {
      // 复制链接
      await navigator.clipboard.writeText(window.location.href);
      const result = await pointsStore.shareGame();
      showToast('链接已复制，' + result.message);
    }
  } catch (error) {
    showToast('分享失败');
  }
};

// 生成角色立绘
const handleGenerateCharacter = async () => {
  if (pointsStore.balance < 50) {
    showDialog({
      title: '积分不足',
      message: '生成角色立绘需要 50 积分，当前积分不足。快去签到或完成成就获取积分吧！',
      confirmButtonText: '去赚积分'
    });
    return;
  }

  showDialog({
    title: '确认生成',
    message: '将消耗 50 积分生成 AI 角色立绘，确认继续？',
    showCancelButton: true,
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(async () => {
    const result = await pointsStore.spendPoints(50, 'AI 角色立绘生成');
    if (result.success) {
      showToast('生成成功！');
      // TODO: 调用 AI 生成接口
    } else {
      showToast(result.message);
    }
  }).catch(() => {
    // 取消
  });
};

// 生成 CG 插图
const handleGenerateCG = async () => {
  if (pointsStore.balance < 100) {
    showDialog({
      title: '积分不足',
      message: '生成 CG 插图需要 100 积分，当前积分不足。',
      confirmButtonText: '去赚积分'
    });
    return;
  }

  showDialog({
    title: '确认生成',
    message: '将消耗 100 积分生成 AI CG 插图，确认继续？',
    showCancelButton: true,
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(async () => {
    const result = await pointsStore.spendPoints(100, 'AI CG 插图生成');
    if (result.success) {
      showToast('生成成功！');
      // TODO: 调用 AI 生成接口
    } else {
      showToast(result.message);
    }
  }).catch(() => {
    // 取消
  });
};

// 润色剧情
const handlePolishPlot = async () => {
  if (pointsStore.balance < 30) {
    showDialog({
      title: '积分不足',
      message: '润色剧情需要 30 积分，当前积分不足。',
      confirmButtonText: '去赚积分'
    });
    return;
  }

  showDialog({
    title: '确认润色',
    message: '将消耗 30 积分润色剧情，确认继续？',
    showCancelButton: true,
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(async () => {
    const result = await pointsStore.spendPoints(30, 'AI 剧情润色');
    if (result.success) {
      showToast('润色成功！');
      // TODO: 调用 AI 润色接口
    } else {
      showToast(result.message);
    }
  }).catch(() => {
    // 取消
  });
};

// 格式化时间
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
};
</script>

<style scoped lang="scss">
.points-shop {
  padding: 16px 0;
  padding-bottom: 60px;
}

.points-summary {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.points-tips {
  font-size: 12px;
  color: #666;
  line-height: 1.8;

  p {
    margin: 4px 0;
  }
}

.text-green {
  color: #07c160;
  font-weight: bold;
}

.text-red {
  color: #ee0a24;
  font-weight: bold;
}
</style>
