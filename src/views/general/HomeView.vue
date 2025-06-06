<script setup lang="ts">
// About page for the HooJams music platform
import { computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';

// Get real authentication state from localStorage
const getCurrentUser = () => {
  const savedUser = localStorage.getItem('currentUser');
  return savedUser ? JSON.parse(savedUser) : null;
};

const isSignedIn = computed(() => {
  return getCurrentUser() !== null;
});
</script>

<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text-container">
          <h1>About HooJams</h1>
          <p class="hero-subtitle">Your local band management platform for connecting musicians, discovering opportunities, and building the local music community</p>
        </div>
      </div>
    </div>
    
    <div class="features-section">
      <div class="container">
        <h2>What We Offer</h2>
        <div class="features-grid">
          <Card class="feature-card">
            <template #header>
              <i class="pi pi-users feature-icon"></i>
            </template>
            <template #title>Band Management</template>
            <template #content>
              <p>Create and manage your band, invite members, and coordinate activities all in one place</p>
            </template>
          </Card>
          
          <Card class="feature-card">
            <template #header>
              <i class="pi pi-calendar feature-icon"></i>
            </template>
            <template #title>Event Discovery</template>
            <template #content>
              <p>Find local performances, gigs, and music events looking for talented artists</p>
            </template>
          </Card>
          
          <Card class="feature-card">
            <template #header>
              <i class="pi pi-heart feature-icon"></i>
            </template>
            <template #title>Music Community</template>
            <template #content>
              <p>Connect with fellow musicians, find fill-in opportunities, and grow your network</p>
            </template>
          </Card>
        </div>
      </div>
    </div>
    
    <div class="cta-section">
      <div class="container">
        <h2>Join the HooJams Community</h2>
        <p>Whether you're a seasoned musician or just starting out, HooJams helps you connect with the local music scene and find your place in it.</p>
        <Button v-if="isSignedIn" label="Complete Your Profile" icon="pi pi-user" size="large" @click="$router.push('/account')" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
}

.hero-section {
  background-image: url('@/assets/landing-page-v2.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  margin: 2rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-text-container {
  padding: 3rem 2rem;
  backdrop-filter: blur(25px);
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.3);
  -webkit-backdrop-filter: blur(25px);
  border: 3px solid rgba(0, 0, 0, 0.8);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
  color: white;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: white;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-actions .p-button-secondary.p-button-outlined {
  color: white !important;
  border-color: #cccccc !important;
}

.features-section {
  padding: 4rem 2rem;
  background: var(--p-surface-ground);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.features-section h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: var(--theme-main-text);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  color: var(--theme-main-text);
}

.feature-icon {
  font-size: 3rem;
  color: var(--hoojams-orange);
  margin: 1rem 0;
}

.cta-section {
  padding: 4rem 2rem;
  background: var(--p-surface-card);
  text-align: center;
}

.cta-section h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--theme-main-text);
}

.cta-section p {
  font-size: 1.1rem;
  color: var(--theme-secondary-text);
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 1rem;
    min-height: 50vh;
  }
  
  .hero-section h1 {
    font-size: 2rem;
    color: white;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-text-container {
    padding: 2rem 1.5rem;
  }
  
  .features-section,
  .cta-section {
    padding: 2rem 1rem;
  }
  
  .features-section h2,
  .cta-section h2 {
    font-size: 2rem;
    color: var(--theme-main-text);
  }
}
</style>
