<template>
  <div class="image-generator">
    <h3 class="step-title">生成角色立绘</h3>

    <!-- 角色信息展示 -->
    <div v-if="characterInfo" class="character-preview">
      <h4>{{ characterInfo.name }}</h4>
      <p>{{ characterInfo.appearance }} · {{ characterInfo.clothing }}</p>
    </div>

    <!-- 生成选项 -->
    <div class="generate-options">
      <h4 class="section-subtitle">选择生成类型</h4>
      <van-radio-group v-model="generateType">
        <van-cell-group inset>
          <van-cell title="角色立绘" clickable @click="generateType = 'avatar'">
            <template #label>生成角色头像和半身像（消耗 50 积分）</template>
            <template #right-icon>
              <van-radio name="avatar" />
            </template>
          </van-cell>
          <van-cell title="CG 插图" clickable @click="generateType = 'cg'">
            <template #label>生成剧情场景插图（消耗 100 积分）</template>
            <template #right-icon>
              <van-radio name="cg" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </div>

    <!-- 风格选择 -->
    <div class="style-options">
      <h4 class="section-subtitle">选择画风</h4>
      <div class="style-grid">
        <div
          v-for="style in artStyles"
          :key="style.value"
          class="style-item"
          :class="{ active: selectedStyle === style.value }"
          @click="selectedStyle = style.value"
        >
          <div class="style-preview">{{ style.emoji }}</div>
          <span class="style-name">{{ style.label }}</span>
        </div>
      </div>
    </div>

    <!-- 生成按钮 -->
    <div class="generate-action">
      <van-button
        type="primary"
        block
        round
        size="large"
        :loading="generating"
        :disabled="!canGenerate"
        color="linear-gradient(to right, #FF69B4, #FFB6C1)"
        @click="handleGenerate"
      >
        <template #icon>
          <van-icon name="photo-o" />
        </template>
        {{ generating ? '生成中...' : `生成图片（消耗 ${cost} 积分）` }}
      </van-button>
      <p class="tip-text">当前余额: {{ pointsStore.balance }} 积分</p>
    </div>

    <!-- 生成结果 -->
    <div v-if="generatedImages.length > 0" class="generated-images">
      <h4 class="section-subtitle">生成结果</h4>
      <div class="image-grid">
        <div
          v-for="(image, index) in generatedImages"
          :key="index"
          class="image-item"
          :class="{ selected: selectedImage === image }"
          @click="selectImage(image)"
        >
          <img :src="image" alt="生成的图片" />
          <div v-if="selectedImage === image" class="selected-badge">✓</div>
        </div>
      </div>
      <van-button
        v-if="selectedImage"
        type="success"
        block
        round
        @click="confirmImage"
      >
        使用此图片
      </van-button>
    </div>

    <!-- 预留提示 -->
    <van-notice-bar
      color="#FF69B4"
      background="#FFF5F7"
      left-icon="info-o"
      text="AI 图片生成功能即将上线，当前使用示例图片"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePointsStore } from '@/stores/points';
import { aiService } from '@/services/aiService';
import { showToast, showDialog } from 'vant';

interface Props {
  characterInfo?: {
    name: string;
    appearance: string;
    clothing: string;
    personality: string[];
  };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [imageUrl: string];
}>();

const pointsStore = usePointsStore();

const generateType = ref<'avatar' | 'cg'>('avatar');
const selectedStyle = ref('anime');
const generating = ref(false);
const generatedImages = ref<string[]>([]);
const selectedImage = ref<string>('');

const cost = computed(() => generateType.value === 'avatar' ? 50 : 100);
const canGenerate = computed(() => pointsStore.balance >= cost.value);

const artStyles = [
  { value: 'anime', label: '日式动漫', emoji: '🎨' },
  { value: 'realistic', label: '写实风格', emoji: '📷' },
  { value: 'watercolor', label: '水彩风格', emoji: '🖌️' },
  { value: 'pixel', label: '像素风格', emoji: '👾' }
];

async function handleGenerate() {
  if (!canGenerate.value) {
    showDialog({
      title: '积分不足',
      message: `需要 ${cost.value} 积分，当前余额 ${pointsStore.balance}`,
      confirmButtonText: '去赚积分'
    });
    return;
  }

  generating.value = true;

  try {
    // 扣除积分
    const result = await pointsStore.spendPoints(cost.value, `生成${generateType.value === 'avatar' ? '角色立绘' : 'CG插图'}`);
    if (!result.success) {
      showToast(result.message);
      generating.value = false;
      return;
    }

    // 调用 AI 服务生成图片
    const prompt = generatePrompt();
    const imageUrl = await aiService.generateImage(prompt, generateType.value);

    // 生成多张示例图
    generatedImages.value = [
      imageUrl,
      imageUrl.replace('random=1', 'random=4'),
      imageUrl.replace('random=1', 'random=5'),
      imageUrl.replace('random=1', 'random=6')
    ];

    showToast('图片生成完成');
  } catch (error) {
    showToast('图片生成失败，请重试');
  } finally {
    generating.value = false;
  }
}

function generatePrompt(): string {
  if (!props.characterInfo) return 'anime character';

  const { name, appearance, clothing, personality } = props.characterInfo;
  return `${appearance} anime character, ${clothing}, ${personality.join(', ')}, ${selectedStyle.value} style, high quality, detailed`;
}

function selectImage(image: string) {
  selectedImage.value = image;
}

function confirmImage() {
  if (selectedImage.value) {
    emit('select', selectedImage.value);
    showToast('图片已选择');
  }
}
</script>

<style scoped lang="scss">
.image-generator {
  padding: 16px;
  background: linear-gradient(180deg, #FFF5F7 0%, #FFE4E8 100%);
  min-height: 100vh;
  padding-bottom: 100px;
}

.step-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.character-preview {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;

  h4 {
    margin: 0 0 8px 0;
    color: #333;
  }

  p {
    margin: 0;
    color: #999;
    font-size: 14px;
  }
}

.section-subtitle {
  font-size: 14px;
  font-weight: bold;
  color: #666;
  margin-bottom: 12px;
}

.generate-options,
.style-options {
  margin-bottom: 20px;
}

.style-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.style-item {
  background: white;
  border-radius: 12px;
  padding: 16px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;

  &.active {
    border-color: #FF69B4;
    background: #FFF5F7;
  }

  .style-preview {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .style-name {
    font-size: 12px;
    color: #666;
  }
}

.generate-action {
  margin-bottom: 20px;

  .tip-text {
    text-align: center;
    font-size: 12px;
    color: #999;
    margin-top: 8px;
  }
}

.generated-images {
  margin-bottom: 20px;

  .image-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .image-item {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    border: 3px solid transparent;

    &.selected {
      border-color: #FF69B4;
    }

    img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .selected-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      background: #FF69B4;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
  }
}
</style>
