<script setup lang="ts">
// Home page for the band management system
import { ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';

// Mock auth state - this would come from a store in a real app
const isSignedIn = ref(false);
const showAuthModal = ref(false);
</script>

<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <img src="@/assets/hoojams-logo-v2.png" alt="HooJams Logo" class="hero-logo" />
        <h1>Welcome to HooJams</h1>
        <p class="hero-subtitle">Connect with musicians, find gigs, and create amazing music together</p>
        <div class="hero-actions">
          <Button v-if="!isSignedIn" label="Get Started" icon="pi pi-sign-in" size="large" @click="showAuthModal = true" />
          <Button label="Browse Bands" icon="pi pi-users" severity="secondary" outlined @click="$router.push('/browse/bands')" />
          <Button label="Browse Events" icon="pi pi-calendar" severity="secondary" outlined @click="$router.push('/browse/events')" />
        </div>
      </div>
    </div>
    
    <div class="features-section">
      <div class="container">
        <h2>Why Choose HooJams?</h2>
        <div class="features-grid">
          <Card class="feature-card">
            <template #header>
              <i class="pi pi-users feature-icon"></i>
            </template>
            <template #title>Find Your Band</template>
            <template #content>
              <p>Connect with like-minded musicians and form lasting musical partnerships</p>
            </template>
          </Card>
          
          <Card class="feature-card">
            <template #header>
              <i class="pi pi-calendar feature-icon"></i>
            </template>
            <template #title>Discover Gigs</template>
            <template #content>
              <p>Browse local events and performances looking for talented musicians</p>
            </template>
          </Card>
          
          <Card class="feature-card">
            <template #header>
              <i class="pi pi-music feature-icon"></i>
            </template>
            <template #title>Showcase Your Talent</template>
            <template #content>
              <p>Create a profile that highlights your musical skills and experience</p>
            </template>
          </Card>
        </div>
      </div>
    </div>
    
    <div class="cta-section">
      <div class="container">
        <h2>Ready to Make Music?</h2>
        <p>Join the HooJams community and start your musical journey today</p>
        <Button v-if="!isSignedIn" label="Sign Up Now" icon="pi pi-user-plus" size="large" @click="showAuthModal = true" />
        <Button v-else label="Complete Your Profile" icon="pi pi-user" size="large" @click="$router.push('/account')" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
}

.hero-section {
  background: linear-gradient(135deg, var(--hoojams-orange) 0%, var(--hoojams-orange-hover) 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-logo {
  height: 80px;
  margin-bottom: 2rem;
  filter: brightness(0) invert(1);
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
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
  color: var(--p-text-color);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
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
  color: var(--p-text-color);
}

.cta-section p {
  font-size: 1.1rem;
  color: var(--p-text-muted-color);
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 1rem;
    min-height: 50vh;
  }
  
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .features-section,
  .cta-section {
    padding: 2rem 1rem;
  }
  
  .features-section h2,
  .cta-section h2 {
    font-size: 2rem;
  }
}
</style>
