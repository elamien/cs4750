<template>
  <div 
    class="ambient-music-background"
    :class="{ 'music-active': isGlobalMusicPlaying }"
  >
    <!-- Pure ambient blurred lighting -->
    <div v-for="i in 6" :key="i" class="blob-container" :class="`blob-${i}`">
      <div class="blob-blur"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMusicState } from '@/composables/useMusicState'

// Global music state
const { isGlobalMusicPlaying } = useMusicState()
</script>

<style scoped>
/* Ambient Music Background */
.ambient-music-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 2s ease-in-out;
  overflow: hidden;
}

.ambient-music-background.music-active {
  opacity: 1;
}

/* Blob container - handles positioning and animation */
.blob-container {
  position: absolute;
}

/* Organic morphing lava lamp blobs */
.blob-blur {
  position: absolute;
  background: linear-gradient(315deg, #ffbc00, #ff0058);
  filter: blur(60px);
  opacity: 0.8;
  z-index: 1;
  /* Organic morphing shapes instead of circles */
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  animation-timing-function: ease-in-out;
}

.blob-1 {
  width: 400px;
  height: 400px;
  top: -10%;
  left: -15%;
  animation: float-1 35s ease-in-out infinite;
  animation-delay: 0s;
}

.blob-1 .blob-blur {
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  animation: float-1 35s ease-in-out infinite, morph-1 15s ease-in-out infinite;
  animation-delay: 0s, -2s;
}

.blob-2 {
  width: 500px;
  height: 500px;
  top: 120%;
  right: -20%;
  animation: float-2 42s ease-in-out infinite;
  animation-delay: -5s;
}

.blob-2 .blob-blur {
  width: 220%;
  height: 220%;
  top: -60%;
  left: -60%;
  animation: float-2 42s ease-in-out infinite, morph-2 18s ease-in-out infinite;
  animation-delay: -5s, -7s;
}

.blob-3 {
  width: 350px;
  height: 350px;
  bottom: -25%;
  left: -10%;
  animation: float-3 50s ease-in-out infinite;
  animation-delay: -12s;
}

.blob-3 .blob-blur {
  width: 180%;
  height: 180%;
  top: -40%;
  left: -40%;
  animation: float-3 50s ease-in-out infinite, morph-3 22s ease-in-out infinite;
  animation-delay: -12s, -4s;
}

.blob-4 {
  width: 450px;
  height: 450px;
  top: 50%;
  right: -30%;
  animation: float-4 38s ease-in-out infinite;
  animation-delay: -18s;
}

.blob-4 .blob-blur {
  width: 210%;
  height: 210%;
  top: -55%;
  left: -55%;
  animation: float-4 38s ease-in-out infinite, morph-4 16s ease-in-out infinite;
  animation-delay: -18s, -9s;
}

.blob-5 {
  width: 300px;
  height: 300px;
  top: -20%;
  left: 50%;
  animation: float-5 45s ease-in-out infinite;
  animation-delay: -22s;
}

.blob-5 .blob-blur {
  width: 190%;
  height: 190%;
  top: -45%;
  left: -45%;
  animation: float-5 45s ease-in-out infinite, morph-5 20s ease-in-out infinite;
  animation-delay: -22s, -11s;
}

.blob-6 {
  width: 600px;
  height: 600px;
  bottom: -40%;
  right: 30%;
  animation: float-6 55s ease-in-out infinite;
  animation-delay: -28s;
}

.blob-6 .blob-blur {
  width: 250%;
  height: 250%;
  top: -75%;
  left: -75%;
  animation: float-6 55s ease-in-out infinite, morph-6 25s ease-in-out infinite;
  animation-delay: -28s, -15s;
}

/* Individual blob animations - each moves in unique patterns crossing screen boundaries */
@keyframes float-1 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  25% { transform: translate(150vw, 30vh) scale(1.2) rotate(90deg); }
  50% { transform: translate(-20vw, 80vh) scale(0.8) rotate(180deg); }
  75% { transform: translate(60vw, -10vh) scale(1.1) rotate(270deg); }
}

@keyframes float-2 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  33% { transform: translate(-80vw, -50vh) scale(1.3) rotate(120deg); }
  66% { transform: translate(40vw, -30vh) scale(0.7) rotate(240deg); }
}

@keyframes float-3 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  20% { transform: translate(30vw, -150vh) scale(1.15) rotate(72deg); }
  40% { transform: translate(120vw, -20vh) scale(0.9) rotate(144deg); }
  60% { transform: translate(50vw, 40vh) scale(1.25) rotate(216deg); }
  80% { transform: translate(-10vw, -5vh) scale(0.85) rotate(288deg); }
}

@keyframes float-4 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  30% { transform: translate(-120vw, 20vh) scale(1.1) rotate(108deg); }
  70% { transform: translate(20vw, 150vh) scale(0.9) rotate(252deg); }
}

@keyframes float-5 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  25% { transform: translate(-40vw, 120vh) scale(1.2) rotate(90deg); }
  50% { transform: translate(80vw, 50vh) scale(0.8) rotate(180deg); }
  75% { transform: translate(10vw, -30vh) scale(1.05) rotate(270deg); }
}

@keyframes float-6 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  16% { transform: translate(-60vw, -20vh) scale(1.3) rotate(60deg); }
  33% { transform: translate(30vw, -80vh) scale(0.7) rotate(120deg); }
  50% { transform: translate(100vw, 10vh) scale(1.1) rotate(180deg); }
  66% { transform: translate(-20vw, 60vh) scale(0.9) rotate(240deg); }
  83% { transform: translate(50vw, -40vh) scale(1.2) rotate(300deg); }
}

@keyframes float-7 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  40% { transform: translate(140vw, -40vh) scale(1.15) rotate(144deg); }
  60% { transform: translate(80vw, 100vh) scale(0.85) rotate(216deg); }
}

@keyframes float-8 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  20% { transform: translate(-150vw, -60vh) scale(1.25) rotate(72deg); }
  40% { transform: translate(-30vw, 20vh) scale(0.8) rotate(144deg); }
  60% { transform: translate(60vw, -100vh) scale(1.1) rotate(216deg); }
  80% { transform: translate(120vw, 30vh) scale(0.9) rotate(288deg); }
}

/* Organic morphing animations - lava lamp style */
@keyframes morph-1 {
  0%, 100% { 
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    transform: scale(1);
  }
  20% { 
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
    transform: scale(1.1, 0.9);
  }
  40% { 
    border-radius: 70% 30% 50% 60% / 30% 50% 60% 40%;
    transform: scale(0.8, 1.2);
  }
  60% { 
    border-radius: 40% 70% 60% 30% / 70% 40% 50% 30%;
    transform: scale(1.2, 0.8);
  }
  80% { 
    border-radius: 50% 50% 40% 60% / 40% 70% 30% 60%;
    transform: scale(0.9, 1.1);
  }
}

@keyframes morph-2 {
  0%, 100% { 
    border-radius: 40% 60% 60% 40% / 70% 30% 50% 60%;
    transform: scale(1);
  }
  25% { 
    border-radius: 60% 40% 30% 70% / 40% 60% 70% 30%;
    transform: scale(1.3, 0.7);
  }
  50% { 
    border-radius: 30% 70% 40% 60% / 60% 40% 30% 70%;
    transform: scale(0.7, 1.3);
  }
  75% { 
    border-radius: 70% 30% 60% 40% / 30% 70% 40% 60%;
    transform: scale(1.1, 0.9);
  }
}

@keyframes morph-3 {
  0%, 100% { 
    border-radius: 50% 50% 30% 70% / 50% 60% 40% 30%;
    transform: scale(1) rotate(0deg);
  }
  30% { 
    border-radius: 70% 30% 60% 40% / 30% 50% 70% 60%;
    transform: scale(0.8, 1.4) rotate(90deg);
  }
  60% { 
    border-radius: 40% 60% 50% 50% / 60% 30% 50% 70%;
    transform: scale(1.5, 0.6) rotate(180deg);
  }
  90% { 
    border-radius: 60% 40% 70% 30% / 40% 70% 30% 50%;
    transform: scale(0.9, 1.2) rotate(270deg);
  }
}

@keyframes morph-4 {
  0%, 100% { 
    border-radius: 30% 70% 40% 60% / 40% 30% 60% 70%;
    transform: scale(1);
  }
  20% { 
    border-radius: 60% 40% 70% 30% / 70% 50% 30% 40%;
    transform: scale(1.2, 0.8);
  }
  40% { 
    border-radius: 50% 50% 60% 40% / 30% 70% 50% 30%;
    transform: scale(0.6, 1.4);
  }
  60% { 
    border-radius: 70% 30% 50% 50% / 60% 40% 70% 50%;
    transform: scale(1.4, 0.6);
  }
  80% { 
    border-radius: 40% 60% 30% 70% / 50% 30% 40% 70%;
    transform: scale(0.9, 1.3);
  }
}

@keyframes morph-5 {
  0%, 100% { 
    border-radius: 60% 40% 50% 50% / 30% 60% 40% 70%;
    transform: scale(1);
  }
  33% { 
    border-radius: 40% 60% 30% 70% / 60% 40% 70% 30%;
    transform: scale(0.7, 1.5);
  }
  66% { 
    border-radius: 70% 30% 60% 40% / 50% 30% 60% 50%;
    transform: scale(1.5, 0.7);
  }
}

@keyframes morph-6 {
  0%, 100% { 
    border-radius: 50% 50% 40% 60% / 60% 40% 30% 70%;
    transform: scale(1);
  }
  16% { 
    border-radius: 30% 70% 50% 50% / 40% 60% 50% 30%;
    transform: scale(1.1, 0.9);
  }
  33% { 
    border-radius: 60% 40% 30% 70% / 70% 30% 60% 40%;
    transform: scale(0.8, 1.2);
  }
  50% { 
    border-radius: 40% 60% 70% 30% / 30% 70% 40% 60%;
    transform: scale(1.3, 0.8);
  }
  66% { 
    border-radius: 70% 30% 60% 40% / 50% 40% 70% 30%;
    transform: scale(0.9, 1.4);
  }
  83% { 
    border-radius: 50% 50% 50% 50% / 60% 30% 50% 70%;
    transform: scale(1.2, 0.9);
  }
}

/* Movement animations */
</style> 