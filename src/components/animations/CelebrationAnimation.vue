<template>
  <Teleport to="body">
    <Transition name="celebration">
      <div v-if="isVisible" class="celebration-container">
        <canvas ref="canvasRef" class="fireworks-canvas"></canvas>
        <div class="celebration-text">
          <span class="text-content">{{ text }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

interface Props {
  autoPlay?: boolean;
  duration?: number;
  text?: string;
}

const props = withDefaults(defineProps<Props>(), {
  autoPlay: true,
  duration: 3000,
  text: '恭喜!'
});

const isVisible = ref(false);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId: number | null = null;
let particles: Particle[] = [];
let ctx: CanvasRenderingContext2D | null = null;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  trail: { x: number; y: number; alpha: number }[];
}

const colors = [
  '#FF69B4',
  '#FFB6C1',
  '#FF1493',
  '#FFD700',
  '#FFA500',
  '#FF6B9D',
  '#FFC0CB',
  '#FF85A2'
];

function createParticle(x: number, y: number) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 6 + 2;
  const particle: Particle = {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 4 + 2,
    alpha: 1,
    decay: Math.random() * 0.015 + 0.01,
    trail: []
  };
  return particle;
}

function createFirework() {
  if (!canvasRef.value) return;
  const x = Math.random() * canvasRef.value.width;
  const y = Math.random() * canvasRef.value.height * 0.5;
  const particleCount = Math.floor(Math.random() * 30) + 20;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle(x, y));
  }
}

function animate() {
  if (!ctx || !canvasRef.value) return;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  
  particles = particles.filter(particle => {
    particle.trail.push({ x: particle.x, y: particle.y, alpha: particle.alpha });
    if (particle.trail.length > 5) {
      particle.trail.shift();
    }
    
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.05;
    particle.alpha -= particle.decay;
    
    particle.trail.forEach((point, index) => {
      ctx!.beginPath();
      ctx!.arc(point.x, point.y, particle.size * 0.5, 0, Math.PI * 2);
      ctx!.fillStyle = particle.color;
      ctx!.globalAlpha = point.alpha * (index / particle.trail.length) * 0.5;
      ctx!.fill();
    });
    
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.alpha;
    ctx.fill();
    
    ctx.globalAlpha = 1;
    
    return particle.alpha > 0;
  });
  
  animationId = requestAnimationFrame(animate);
}

function startAnimation() {
  if (!canvasRef.value) return;
  
  const canvas = canvasRef.value;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');
  
  isVisible.value = true;
  particles = [];
  
  const fireworkInterval = setInterval(() => {
    createFirework();
  }, 200);
  
  animate();
  
  setTimeout(() => {
    clearInterval(fireworkInterval);
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    isVisible.value = false;
  }, props.duration);
}

function handleResize() {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth;
    canvasRef.value.height = window.innerHeight;
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
  if (props.autoPlay) {
    startAnimation();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});

watch(() => props.autoPlay, (newVal) => {
  if (newVal) {
    startAnimation();
  }
});

defineExpose({
  start: startAnimation
});
</script>

<style scoped lang="scss">
.celebration-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: none;
}

.fireworks-canvas {
  width: 100%;
  height: 100%;
}

.celebration-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  animation: textPulse 0.5s ease-in-out infinite alternate;
  
  .text-content {
    font-size: 48px;
    font-weight: bold;
    color: #FF69B4;
    text-shadow: 
      0 0 10px rgba(255, 105, 180, 0.8),
      0 0 20px rgba(255, 105, 180, 0.6),
      0 0 30px rgba(255, 105, 180, 0.4),
      2px 2px 4px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #FF69B4, #FFD700, #FF69B4);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 1s ease infinite;
  }
}

@keyframes textPulse {
  from {
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    transform: translate(-50%, -50%) scale(1.05);
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.celebration-enter-active {
  animation: fadeIn 0.3s ease-out;
}

.celebration-leave-active {
  animation: fadeOut 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
