<template>
  <div class="broken-heart-wrapper" @click="breakHeart" v-tooltip="tooltip">
    <div class="heart-circle">
      <div class="heart-container" :class="{ broken: isBroken, falling: isFalling }">
        <div class="left-side sides">
          <div class="half">
            <div class="heart"></div>
          </div>
          <div class="points">
            <div class="point pt1"></div>
            <div class="point pt4"></div>
            <div class="point pt2"></div>
            <div class="point pt3"></div>
          </div>
        </div>

        <div class="right-side sides">
          <div class="half">
            <div class="heart"></div>
          </div>
          <div class="points">
            <div class="point pt1"></div>
            <div class="point pt2"></div>
            <div class="point pt3"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'

interface Props {
  tooltip?: string
  size?: 'small' | 'medium' | 'large'
  color?: string
}

withDefaults(defineProps<Props>(), {
  tooltip: 'Remove from favorites',
  size: 'small',
  color: '#fc2e5a'
})

const emit = defineEmits<{
  broken: []
}>()

const isBroken = ref(false)
const isFalling = ref(false)

const breakHeart = () => {
  if (isBroken.value) return

  isBroken.value = true

  // Start falling animation after break animation
  setTimeout(() => {
    isFalling.value = true

    // Reset after fall animation completes
    setTimeout(() => {
      emit('broken')
      // Optional: reset the heart after a delay
      setTimeout(() => {
        isBroken.value = false
        isFalling.value = false
      }, 500)
    }, 1000) // Fall duration
  }, 350) // Break animation duration
}
</script>

<style scoped>
.broken-heart-wrapper {
  display: inline-block;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.broken-heart-wrapper:hover {
  transform: scale(1.1);
}

.heart-circle {
  border-radius: 50%;
  height: 2rem;
  width: 2rem;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.broken-heart-wrapper.large .heart-circle {
  height: 3rem;
  width: 3rem;
  border-width: 4px;
}

.broken-heart-wrapper.medium .heart-circle {
  height: 2.5rem;
  width: 2.5rem;
  border-width: 3px;
}

.heart-container {
  left: 11%;
  position: absolute;
  top: 20%;
  transition: all 0.35s ease;
}

.heart-container.broken {
  left: 6%;
  top: 23%;
}

.heart-container.falling {
  animation: fallToGround 1s ease-in forwards;
}

.heart {
  height: 1.3rem;
  position: relative;
  width: 0.7rem;
}

.heart:before,
.heart:after {
  background: v-bind(color);
  border-radius: 0.7rem 0.7rem 0 0;
  content: "";
  height: 1.1rem;
  left: 0.7rem;
  position: absolute;
  top: 0.05rem;
  width: 0.7rem;
  transform: rotate(-45deg);
  transform-origin: 0 100%;
}

.heart:after {
  left: 0;
  transform: rotate(45deg);
  transform-origin: 100% 100%;
}

/* Split the heart in two */
.sides {
  float: left;
  position: relative;
  transition: all 0.35s ease;
}

.half {
  overflow: hidden;
  position: relative;
  width: 0.7rem;
}

.right-side .heart:after,
.right-side .heart:before {
  left: -0.7rem;
}

/* Create the rip in the center */
.points {
  position: absolute;
  top: 0.3rem;
}

.left-side .points { left: 100%; }
.right-side .points { right: 100%; }

.point {
  border-bottom: 0.1rem solid transparent;
  border-left: 0.2rem solid v-bind(color);
  border-top: 0.1rem solid transparent;
  height: 0;
  width: 0;
}

.right-side .point {
  border-bottom: 0.1rem solid transparent;
  border-left: none;
  border-right: 0.2rem solid v-bind(color);
  border-top: 0.1rem solid transparent;
  position: relative;
}

.left-side .point {
  left: -0.04rem;
  position: relative;
  top: 0.04rem;
  transform: rotate(-2deg);
}

.left-side .pt1 {
  left: -0.07rem;
  top: -0.05rem;
  transform: rotate(29deg);
}

.left-side .pt2 {
  top: 0.01rem;
}

.left-side .pt3 {
  left: -0.07rem;
  top: 0.05rem;
  transform: rotate(29deg);
}

.left-side .pt4 {
  left: -0.09rem;
  position: absolute;
  top: 0.07rem;
  transform: rotate(-9deg);
}

.right-side .point {
  right: -0.04rem;
  top: -0.07rem;
  transform: rotate(-15deg);
}

.right-side .pt2 {
  top: -0.09rem;
}

.right-side .pt3 {
  right: -0.07rem;
  top: -0.08rem;
  transform: rotate(-26deg);
}

.broken .left-side {
  margin-right: 0.08rem;
  transform: rotate(-10deg);
}

.broken .right-side {
  margin-left: 0.08rem;
  transform: rotate(10deg);
}

/* Falling animation */
.falling .left-side {
  animation: fallLeft 1s ease-in forwards;
}

.falling .right-side {
  animation: fallRight 1s ease-in forwards;
}

@keyframes fallToGround {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(3rem);
    opacity: 0.3;
  }
}

@keyframes fallLeft {
  0% {
    transform: rotate(-10deg) translateY(0) translateX(0);
    opacity: 1;
  }
  50% {
    transform: rotate(-45deg) translateY(1.5rem) translateX(-0.8rem);
    opacity: 0.7;
  }
  100% {
    transform: rotate(-90deg) translateY(3rem) translateX(-1.5rem);
    opacity: 0;
  }
}

@keyframes fallRight {
  0% {
    transform: rotate(10deg) translateY(0) translateX(0);
    opacity: 1;
  }
  50% {
    transform: rotate(45deg) translateY(1.5rem) translateX(0.8rem);
    opacity: 0.7;
  }
  100% {
    transform: rotate(90deg) translateY(3rem) translateX(1.5rem);
    opacity: 0;
  }
}

/* Hover effects */
.broken-heart-wrapper:hover .heart:before,
.broken-heart-wrapper:hover .heart:after,
.broken-heart-wrapper:hover .point {
  filter: brightness(1.1);
}

/* Size variants */
.broken-heart-wrapper.large .heart {
  height: 1.8rem;
  width: 1rem;
}

.broken-heart-wrapper.large .heart:before,
.broken-heart-wrapper.large .heart:after {
  height: 1.6rem;
  width: 1rem;
  left: 1rem;
}

.broken-heart-wrapper.large .right-side .heart:after,
.broken-heart-wrapper.large .right-side .heart:before {
  left: -1rem;
}

.broken-heart-wrapper.large .half {
  width: 1rem;
}

.broken-heart-wrapper.medium .heart {
  height: 1.5rem;
  width: 0.85rem;
}

.broken-heart-wrapper.medium .heart:before,
.broken-heart-wrapper.medium .heart:after {
  height: 1.35rem;
  width: 0.85rem;
  left: 0.85rem;
}

.broken-heart-wrapper.medium .right-side .heart:after,
.broken-heart-wrapper.medium .right-side .heart:before {
  left: -0.85rem;
}

.broken-heart-wrapper.medium .half {
  width: 0.85rem;
}
</style>
