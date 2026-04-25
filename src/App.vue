<template>
  <div class="h-screen w-screen overflow-hidden relative">
    <!-- 增强的背景星空 -->
    <div class="absolute inset-0 z-0 overflow-hidden">
      <!-- 原有星空层 -->
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>

      <!-- 新增星云层 -->
      <div class="nebula-layer nebula-1"></div>
      <div class="nebula-layer nebula-2"></div>
      <div class="nebula-layer nebula-3"></div>

      <!-- 光影效果层 -->
      <div class="light-glow"></div>
      <div class="light-glare"></div>

      <!-- 动态粒子层 -->
      <div class="particle-layer"></div>

      <!-- 银河光带 -->
      <div class="galaxy-band"></div>
    </div>

    <!-- 主要路由视图 -->
    <router-view />

    <!-- 全局通知 -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import NotificationContainer from './components/NotificationContainer.vue'

// 创建星空背景
import { onMounted, ref } from 'vue'

const performanceMode = ref(false)

onMounted(() => {
  createStarfield()
  createParticles()
  setupBackgroundEffects()
})

function createStarfield() {
  const starsContainer = document.querySelector('.stars')
  const starsContainer2 = document.querySelector('.stars2')
  const starsContainer3 = document.querySelector('.stars3')

  if (starsContainer && starsContainer2 && starsContainer3) {
    createStars(starsContainer, 80, 1) // 减少星星数量以提高性能
    createStars(starsContainer2, 40, 2)
    createStars(starsContainer3, 20, 3)
  }
}

function createStars(container: Element, count: number, size: number) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div')
    star.className = 'star absolute bg-white rounded-full animate-pulse'
    star.style.left = `${Math.random() * 100}%`
    star.style.top = `${Math.random() * 100}%`
    star.style.width = `${size}px`
    star.style.height = `${size}px`
    star.style.opacity = `${Math.random() * 0.5 + 0.2}`
    star.style.animationDuration = `${Math.random() * 3 + 2}s`
    star.style.animationDelay = `${Math.random() * 2}s`
    star.style.willChange = 'transform, opacity'
    container.appendChild(star)
  }
}

function createParticles() {
  const particleLayer = document.querySelector('.particle-layer')
  if (particleLayer) {
    const particleCount = performanceMode.value ? 10 : 20 // 性能模式减少粒子

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      particle.style.width = `${Math.random() * 3 + 1}px`
      particle.style.height = particle.style.width
      particle.style.animationDuration = `${Math.random() * 20 + 10}s`
      particle.style.animationDelay = `${Math.random() * 5}s`
      particle.style.setProperty('--random-x', `${Math.random() * 100 - 50}px`)
      particle.style.willChange = 'transform'
      particleLayer.appendChild(particle)
    }
  }
}

function setupBackgroundEffects() {
  // 根据系统性能调整效果
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  performanceMode.value = mediaQuery.matches

  // 监听系统偏好变化
  mediaQuery.addEventListener('change', (e) => {
    performanceMode.value = e.matches
    updateEffectsForPerformance()
  })

  updateEffectsForPerformance()
}

function updateEffectsForPerformance() {
  const nebulaLayers = document.querySelectorAll('.nebula-layer')
  const glowLayers = document.querySelectorAll('.light-glow, .light-glare')

  if (performanceMode.value) {
    // 性能模式：减少动画和效果
    nebulaLayers.forEach(layer => {
      (layer as HTMLElement).style.animation = 'none'
    })
    glowLayers.forEach(layer => {
      (layer as HTMLElement).style.animation = 'none'
    })
  } else {
    // 正常模式：启用所有效果
    nebulaLayers.forEach(layer => {
      const layerEl = layer as HTMLElement
      if (layerEl.classList.contains('nebula-1')) {
        layerEl.style.animation = 'nebula-drift-1 60s linear infinite'
      } else if (layerEl.classList.contains('nebula-2')) {
        layerEl.style.animation = 'nebula-drift-2 80s linear infinite'
      } else if (layerEl.classList.contains('nebula-3')) {
        layerEl.style.animation = 'nebula-drift-3 100s linear infinite'
      }
    })

    glowLayers.forEach(layer => {
      const layerEl = layer as HTMLElement
      if (layerEl.classList.contains('light-glow')) {
        layerEl.style.animation = 'pulse-glow-wide 15s ease-in-out infinite'
      } else if (layerEl.classList.contains('light-glare')) {
        layerEl.style.animation = 'glare-drift 25s linear infinite'
      }
    })
  }
}
</script>

<style scoped>
.stars, .stars2, .stars3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 星云层样式 */
.nebula-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  filter: blur(40px);
  mix-blend-mode: screen;
  opacity: 0.6;
  will-change: transform, opacity;
}

.nebula-1 {
  background: radial-gradient(
    circle at 30% 40%,
    rgba(94, 29, 255, 0.15) 0%,
    transparent 50%
  );
  animation: nebula-drift-1 60s linear infinite;
}

.nebula-2 {
  background: radial-gradient(
    circle at 70% 20%,
    rgba(255, 109, 0, 0.1) 0%,
    transparent 45%
  );
  animation: nebula-drift-2 80s linear infinite;
}

.nebula-3 {
  background: radial-gradient(
    circle at 50% 80%,
    rgba(0, 183, 255, 0.12) 0%,
    transparent 55%
  );
  animation: nebula-drift-3 100s linear infinite;
}

/* 光影效果 */
.light-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 255, 255, 0.05) 0%,
    transparent 70%
  );
  animation: pulse-glow-wide 15s ease-in-out infinite;
  filter: blur(60px);
  mix-blend-mode: screen;
  will-change: opacity;
}

.light-glare {
  position: absolute;
  top: 30%;
  left: 40%;
  width: 20%;
  height: 20%;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  animation: glare-drift 25s linear infinite;
  filter: blur(20px);
  mix-blend-mode: plus-lighter;
  will-change: transform;
}

/* 粒子层 */
.particle-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: particle-drift linear infinite;
  opacity: 0.3;
  will-change: transform;
}

/* 银河光带 */
.galaxy-band {
  position: absolute;
  top: 20%;
  left: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.03) 20%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.03) 80%,
    transparent 100%
  );
  filter: blur(30px);
  animation: galaxy-shift 120s linear infinite;
  mix-blend-mode: screen;
  will-change: transform;
}

/* 新增动画定义 */
@keyframes nebula-drift-1 {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.5;
  }
  33% {
    transform: translate(3%, 2%) scale(1.05);
    opacity: 0.7;
  }
  66% {
    transform: translate(-2%, 1%) scale(0.95);
    opacity: 0.6;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.5;
  }
}

@keyframes nebula-drift-2 {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.4;
  }
  33% {
    transform: translate(-4%, 2%) scale(1.03);
    opacity: 0.6;
  }
  66% {
    transform: translate(2%, -1%) scale(0.97);
    opacity: 0.5;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.4;
  }
}

@keyframes nebula-drift-3 {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  33% {
    transform: translate(3%, -3%) scale(0.95);
    opacity: 0.5;
  }
  66% {
    transform: translate(-2%, 2%) scale(1.02);
    opacity: 0.4;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
}

@keyframes pulse-glow-wide {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes glare-drift {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(5%, 8%) rotate(120deg);
  }
  66% {
    transform: translate(-3%, -4%) rotate(240deg);
  }
  100% {
    transform: translate(0, 0) rotate(360deg);
  }
}

@keyframes particle-drift {
  from {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.3;
  }
  90% {
    opacity: 0.3;
  }
  to {
    transform: translateY(-100px) translateX(var(--random-x, 0));
    opacity: 0;
  }
}

@keyframes galaxy-shift {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(10%) rotate(180deg);
  }
}

/* 性能优化：减少运动偏好时的动画 */
@media (prefers-reduced-motion: reduce) {
  .star,
  .nebula-layer,
  .light-glow,
  .light-glare,
  .particle,
  .galaxy-band {
    animation: none !important;
  }
}
</style>