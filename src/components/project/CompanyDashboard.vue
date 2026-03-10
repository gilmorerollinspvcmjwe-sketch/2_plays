<template>
  <div class="company-dashboard">
    <div class="company-header">
      <div class="company-name">{{ companyName }}</div>
      <div class="company-level">Lv.{{ companyLevel }}</div>
    </div>
    <div class="fund-display" :class="fundsStatusClass">
      <van-icon name="gold-coin-o" class="fund-icon" />
      <span class="fund-amount">{{ formatMoney(companyFunds) }}</span>
      <span class="fund-status">{{ fundsStatusText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  companyName: string;
  companyLevel: number;
  companyFunds: number;
}

const props = withDefaults(defineProps<Props>(), {
  companyName: '我的游戏公司',
  companyLevel: 1,
  companyFunds: 500000
});

// 资金状态计算
const fundsStatusClass = computed(() => {
  if (props.companyFunds > 300000) return 'sufficient';
  if (props.companyFunds >= 100000) return 'tight';
  return 'depleted';
});

// 资金状态文本
const fundsStatusText = computed(() => {
  if (props.companyFunds > 300000) return '资金充足';
  if (props.companyFunds >= 100000) return '资金紧张';
  return '资金不足';
});

function formatMoney(amount: number): string {
  if (amount >= 100000000) {
    return (amount / 100000000).toFixed(2) + '亿';
  }
  if (amount >= 10000) {
    return (amount / 10000).toFixed(2) + '万';
  }
  return amount.toLocaleString();
}
</script>

<style scoped>
.company-dashboard {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px;
  margin: 12px 16px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.company-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.company-name {
  font-size: 16px;
  font-weight: 600;
}

.company-level {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
}

.fund-display {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 6px 14px;
}

.fund-icon {
  font-size: 16px;
  color: #FFD700;
}

.fund-amount {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.fund-status {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 8px;
}

.fund-display.sufficient .fund-status {
  color: #52c41a;
  background: #f6ffed;
}

.fund-display.tight .fund-status {
  color: #faad14;
  background: #fffbe6;
}

.fund-display.depleted .fund-status {
  color: #ff4d4f;
  background: #fff2f0;
}
</style>
