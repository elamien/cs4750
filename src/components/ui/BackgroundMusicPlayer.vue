<template>
  <Transition name="music-player" appear>
    <div v-if="showPlayer" class="music-player-wrapper">
      <div 
        class="music-player"
        :class="{ 'player-hidden': !isVisible }"
      >
        <div class="player-content">
          <button 
            @click="togglePlay" 
            class="play-button"
            :class="{ 'playing': isPlaying }"
          >
            <div class="play-icon" v-if="!isPlaying">▶</div>
            <div class="pause-icon" v-else>⏸</div>
          </button>
          
          <div class="music-info">
            <div class="music-label">Epic Background Music</div>
            <div class="title-container">
              <div class="scrolling-title" :class="{ 'scrolling': isPlaying }">
                {{ formattedTitle }}
              </div>
            </div>
          </div>
          
          <button @click="hidePlayer" class="close-button">✕</button>
        </div>
        
        <audio 
          ref="audioPlayer" 
          loop 
          preload="none"
          @loadstart="onLoadStart"
          @canplay="onCanPlay"
        >
          <source src="/Hasley-badAtLove-Instrumental.mp3" type="audio/mpeg">
        </audio>
        
        <!-- Audio wave animation -->
        <div v-if="!hasInteracted" class="audio-wave-indicator">
          <div class="wave-ring"></div>
          <div class="wave-ring wave-ring-delayed"></div>
        </div>
      </div>
      
      <!-- Floating music notes - positioned outside player for free movement -->
      <div v-if="isPlaying" class="music-notes-container">
        <div 
          v-for="note in musicNotes" 
          :key="note.id"
          class="floating-note"
          :style="{ 
            left: note.x + 'px', 
            animationDelay: note.delay + 's',
            fontSize: note.size + 'px'
          }"
        >
          {{ note.symbol }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const audioPlayer = ref<HTMLAudioElement>()
const isPlaying = ref(false)
const isVisible = ref(true)
const showPlayer = ref(false)
const hasInteracted = ref(false)
const isDismissedThisSession = ref(false)

// Music notes animation
const musicNotes = ref<Array<{
  id: number
  symbol: string
  x: number
  delay: number
  size: number
}>>([])

let noteId = 0
let noteInterval: number | null = null

const noteSymbols = ['♪', '♫', '♬', '♩', '𝄞']

const createMusicNote = () => {
  const note = {
    id: noteId++,
    symbol: noteSymbols[Math.floor(Math.random() * noteSymbols.length)],
    x: Math.random() * 150 + 25, // Random x position starting from the player area
    delay: 0,
    size: 18 + Math.random() * 10 // Random size between 18-28px
  }
  
  musicNotes.value.push(note)
  
  // Remove note after animation completes
  setTimeout(() => {
    const index = musicNotes.value.findIndex(n => n.id === note.id)
    if (index > -1) {
      musicNotes.value.splice(index, 1)
    }
  }, 4000)
}

const startMusicNotes = () => {
  if (noteInterval) return
  
  noteInterval = window.setInterval(() => {
    createMusicNote()
  }, 800) // Create a note every 800ms
}

const stopMusicNotes = () => {
  if (noteInterval) {
    clearInterval(noteInterval)
    noteInterval = null
  }
  musicNotes.value = []
}

const filename = 'Hasley-badAtLove-Instrumental.mp3'
const formattedTitle = computed(() => {
  return filename
    .replace('.mp3', '')
    .split('-')
    .join(' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
})

const togglePlay = async () => {
  hasInteracted.value = true
  
  if (!audioPlayer.value) return
  
  try {
    if (isPlaying.value) {
      audioPlayer.value.pause()
      isPlaying.value = false
      stopMusicNotes()
    } else {
      await audioPlayer.value.play()
      isPlaying.value = true
      startMusicNotes()
    }
  } catch (error) {
    console.log('Audio play failed:', error)
  }
}

const hidePlayer = () => {
  if (isPlaying.value) {
    audioPlayer.value?.pause()
    isPlaying.value = false
    stopMusicNotes()
  }
  isDismissedThisSession.value = true
  isVisible.value = false
  setTimeout(() => {
    showPlayer.value = false
    // Mark as dismissed for this session only - will show again on reload
    sessionStorage.setItem('musicPlayerDismissed', 'true')
  }, 300)
}

const onLoadStart = () => {
  console.log('Audio loading...')
}

const onCanPlay = () => {
  console.log('Audio ready to play')
}

onMounted(() => {
  // Clear any previous session dismissal on page load/reload
  sessionStorage.removeItem('musicPlayerDismissed')
  isDismissedThisSession.value = false
  
  // Always show on page load/reload
  setTimeout(() => {
    if (!isDismissedThisSession.value) {
      showPlayer.value = true
    }
  }, 1500) // Show after 1.5s for better UX
})
</script>

<style scoped>
.music-player-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.music-player {
  background: var(--hoojams-orange);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--hoojams-orange-hover);
  overflow: hidden;
  max-width: 300px;
  transition: all 0.3s ease;
}

.player-hidden {
  opacity: 0;
  transform: translateY(100px);
}

.player-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  color: white;
}

.play-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.play-button:hover {
  background: var(--hoojams-orange-hover);
  transform: scale(1.05);
}

.play-button.playing {
  background: var(--hoojams-orange-hover);
  animation: playing-pulse 2s infinite;
}

.play-icon, .pause-icon {
  font-size: 16px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.music-info {
  flex: 1;
  min-width: 0;
}

.music-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
  margin-bottom: 2px;
}

.title-container {
  width: 180px;
  overflow: hidden;
  position: relative;
}

.scrolling-title {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: transform 0.3s ease;
}

.scrolling-title.scrolling {
  animation: scroll-text 15s linear infinite;
}

.close-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Audio Wave Indicator */
.audio-wave-indicator {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  overflow: visible;
  z-index: 5;
  pointer-events: none;
}

.wave-ring {
  position: absolute;
  inset: -2px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 14px;
  animation: wave-expand 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  will-change: inset, opacity;
}

.wave-ring-delayed {
  animation-delay: 2s;
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}



/* Music Notes Animation */
.music-notes-container {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 300px;
  height: 200px;
  pointer-events: none;
  overflow: visible;
  z-index: 999;
}

.floating-note {
  position: absolute;
  bottom: 60px;
  color: white;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: float-up 4s ease-out forwards;
  pointer-events: none;
  z-index: 10;
}

/* Animations */
@keyframes float-up {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 1;
  }
  25% {
    transform: translateY(-30px) translateX(-10px) scale(1.2);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-80px) translateX(10px) scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: translateY(-150px) translateX(-5px) scale(0.8);
    opacity: 0;
  }
}

@keyframes scroll-text {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

@keyframes playing-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); }
}

@keyframes wave-expand {
  0% {
    inset: -2px;
    opacity: 0.6;
  }
  25% {
    inset: -12px;
    opacity: 0;
  }
  100% {
    inset: -20px;
    opacity: 0;
  }
}



/* Transition animations */
.music-player-enter-active,
.music-player-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.music-player-enter-from {
  opacity: 0;
  transform: translateY(100px) scale(0.8);
}

.music-player-leave-to {
  opacity: 0;
  transform: translateY(100px) scale(0.8);
}

/* Responsive */
@media (max-width: 640px) {
  .music-player {
    bottom: 10px;
    right: 10px;
    max-width: 250px;
  }
  
  .title-container {
    width: 140px;
  }
}
</style> 