import { ref, readonly } from 'vue'

// Global music state
const isGlobalMusicPlaying = ref(false)

export function useMusicState() {
  const setMusicPlaying = (playing: boolean) => {
    isGlobalMusicPlaying.value = playing
  }

  return {
    isGlobalMusicPlaying: readonly(isGlobalMusicPlaying),
    setMusicPlaying
  }
} 