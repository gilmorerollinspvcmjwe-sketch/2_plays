<template>
  <div class="tab-content">
    <!-- 活动模板选择器 -->
    <div class="template-section">
      <div class="section-header">
        <h4>📋 从模板创建活动</h4>
        <van-button
          type="primary"
          size="small"
          round
          color="linear-gradient(to right, #07c160, #10b981)"
          @click="showTemplateSelector = true"
        >
          浏览模板
        </van-button>
      </div>
      <p class="section-desc">20+ 精心设计的活动模板，一键创建</p>
    </div>

    <!-- 活动列表 -->
    <div v-if="operationStore.events.length === 0" class="empty-state">
      <van-empty description="暂无活动">
        <van-button
          type="primary"
          size="small"
          round
          color="linear-gradient(to right, #07c160, #10b981)"
          @click="showCreateEvent = true"
        >
          创建活动
        </van-button>
      </van-empty>
    </div>
    <div v-else class="event-list">
      <van-cell
        v-for="event in operationStore.events"
        :key="event.id"
        :title="event.name"
        :label="event.description"
        class="event-cell"
      >
        <template #icon>
          <div class="event-icon">{{ getEventIcon(event.type) }}</div>
        </template>
        <template #right-icon>
          <van-tag :type="getStatusType(event.status)">
            {{ getStatusLabel(event.status) }}
          </van-tag>
        </template>
      </van-cell>
    </div>

    <!-- 创建活动弹窗 -->
    <van-dialog
      v-model:show="showCreateEvent"
      title="创建活动"
      show-cancel-button
      @confirm="handleCreateEvent"
    >
      <van-field
        v-model="eventForm.name"
        label="活动名称"
        placeholder="请输入活动名称"
      />
      <van-field
        v-model="eventForm.description"
        label="活动描述"
        type="textarea"
        rows="2"
        placeholder="请输入活动描述"
      />
      <div class="form-item">
        <label class="form-label">活动类型</label>
        <van-radio-group v-model="eventForm.type" direction="horizontal">
          <van-radio name="festival">节日</van-radio>
          <van-radio name="birthday">生日</van-radio>
          <van-radio name="collaboration">联动</van-radio>
        </van-radio-group>
      </div>
    </van-dialog>

    <!-- 活动模板选择器弹窗 -->
    <van-popup
      v-model:show="showTemplateSelector"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <EventTemplateSelector />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { showToast } from 'vant';
import { useOperationStore } from '@/stores/operationStore';
import { getStatusType, getStatusLabel, getEventIcon } from '@/utils/operationHelpers';
import EventTemplateSelector from '@/components/operation/EventTemplateSelector.vue';

const operationStore = useOperationStore();

const showCreateEvent = ref(false);
const showTemplateSelector = ref(false);

const eventForm = ref({
  name: '',
  description: '',
  type: 'festival' as const,
  rewards: ['钻石x500'],
  mechanics: ['完成任务'],
  budget: '中' as const,
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 14 * 86400000).toISOString()
});

async function handleCreateEvent() {
  if (!eventForm.value.name || !eventForm.value.description) {
    showToast('请填写完整信息');
    return;
  }

  const result = await operationStore.createEvent({
    name: eventForm.value.name,
    description: eventForm.value.description,
    type: eventForm.value.type,
    rewards: eventForm.value.rewards,
    mechanics: eventForm.value.mechanics,
    budget: eventForm.value.budget,
    startTime: eventForm.value.startTime,
    endTime: eventForm.value.endTime
  });

  if (result.success) {
    showToast(result.message);
    showCreateEvent.value = false;
    resetEventForm();
  } else {
    showToast(result.message);
  }
}

function resetEventForm() {
  eventForm.value = {
    name: '',
    description: '',
    type: 'festival',
    rewards: ['钻石x500'],
    mechanics: ['完成任务'],
    budget: '中',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 14 * 86400000).toISOString()
  };
}

function openCreateEvent() {
  showCreateEvent.value = true;
}

defineExpose({ openCreateEvent, eventForm });
</script>

<style scoped lang="scss">
.tab-content {
  padding: 16px;
  min-height: 300px;
}

.template-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h4 {
      margin: 0;
      font-size: 16px;
    }
  }

  .section-desc {
    margin: 8px 0 0;
    font-size: 13px;
    color: #999;
  }
}

.event-list {
  .event-cell {
    margin-bottom: 8px;
    border-radius: 8px;
    overflow: hidden;
  }

  .event-icon {
    font-size: 24px;
    margin-right: 12px;
    display: flex;
    align-items: center;
  }
}

.empty-state {
  padding: 20px 0;
}

.form-item {
  padding: 12px 16px;

  .form-label {
    display: block;
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }
}
</style>
