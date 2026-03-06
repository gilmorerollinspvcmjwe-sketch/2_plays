<template>
  <div class="tab-content">
    <van-cell-group title="全服补偿" inset>
      <van-field
        v-model="welfareForm.content"
        label="补偿内容"
        placeholder="例如：钻石x1000"
      />
      <van-cell>
        <template #right-icon>
          <van-button
            type="primary"
            size="small"
            round
            color="linear-gradient(to right, #FF69B4, #FFB6C1)"
            @click="handleSendWelfare('compensation')"
          >
            发放
          </van-button>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group title="兑换码" inset class="welfare-group">
      <van-field
        v-model="welfareForm.redeemCode"
        label="兑换码"
        placeholder="输入兑换码"
      />
      <van-cell>
        <template #right-icon>
          <van-button
            type="primary"
            size="small"
            round
            @click="handleGenerateRedeemCode"
          >
            生成
          </van-button>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { showToast } from 'vant';
import { useOperationStore } from '@/stores/operationStore';

const operationStore = useOperationStore();

const welfareForm = ref({
  content: '',
  redeemCode: ''
});

async function handleSendWelfare(type: 'compensation' | 'login' | 'redeem') {
  if (!welfareForm.value.content) {
    showToast('请输入补偿内容');
    return;
  }

  const result = await operationStore.sendWelfare(
    type,
    welfareForm.value.content,
    100
  );

  if (result.success) {
    showToast(result.message);
    welfareForm.value.content = '';
  }
}

function handleGenerateRedeemCode() {
  const code = 'GIFT' + Math.random().toString(36).substr(2, 6).toUpperCase();
  welfareForm.value.redeemCode = code;
  showToast('兑换码已生成');
}
</script>

<style scoped lang="scss">
.tab-content {
  padding: 16px;
  min-height: 300px;
}

.welfare-group {
  margin-top: 16px;
}
</style>
