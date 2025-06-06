<template>
  <div class="about">
    <div class="header">
      <h1>About HooJams</h1>
      <p>Connecting musicians and creating opportunities in the Charlottesville community</p>
    </div>

    <!-- Landing Page Image -->
    <div class="landing-image-container">
      <img src="@/assets/landing-page-image.png" alt="Musicians performing together" class="landing-image" />
    </div>

    <div class="content">
      <Card class="about-section">
        <template #title>Our Mission</template>
        <template #content>
          <p>
            HooJams is dedicated to fostering the local music scene by connecting talented musicians 
            with bands, events, and opportunities. We believe that music brings people together and 
            creates lasting bonds within our community.
          </p>
        </template>
      </Card>

      <Card class="about-section">
        <template #title>What We Do</template>
        <template #content>
          <ul>
            <li><strong>Band Formation:</strong> Help musicians find like-minded bandmates</li>
            <li><strong>Event Coordination:</strong> Connect bands with venues and event organizers</li>
            <li><strong>Fill-In Services:</strong> Provide substitute musicians when needed</li>
            <li><strong>Community Building:</strong> Foster relationships within the local music scene</li>
          </ul>
        </template>
      </Card>

      <Card class="about-section">
        <template #title>How It Works</template>
        <template #content>
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Create Your Profile</h4>
                <p>Tell us about your musical background, instruments, and preferences</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Find Your Match</h4>
                <p>Browse bands looking for members or events seeking performers</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Make Music</h4>
                <p>Connect, collaborate, and create amazing musical experiences</p>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="about-section">
        <template #title>Get Involved</template>
        <template #content>
          <p>
            Whether you're a seasoned performer or just starting your musical journey, 
            HooJams has something for you. Join our community and discover new opportunities 
            to share your passion for music.
          </p>
          <div class="cta-buttons">
                            <Button label="Browse Bands" icon="pi pi-users" @click="$router.push('/bands')" />
            <Button label="Browse Events" icon="pi pi-calendar" severity="secondary" @click="$router.push('/events')" />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import Button from 'primevue/button';
</script>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--theme-main-text);
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  color: var(--theme-main-text);
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.header p {
  color: var(--theme-secondary-text);
  font-size: 1.2rem;
}

.landing-image-container {
  text-align: center;
  margin: 3rem 0;
  padding: 1rem;
}

.landing-image {
  max-width: 100%;
  width: 600px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.landing-image:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.about-section ul {
  line-height: 1.8;
  padding-left: 1rem;
  color: var(--theme-main-text);
}

.about-section li {
  margin-bottom: 0.5rem;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-number {
  background: var(--hoojams-orange);
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 0.5rem;
  color: var(--theme-main-text);
}

.step-content p {
  margin: 0;
  color: var(--theme-secondary-text);
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .about {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }

  .landing-image-container {
    margin: 2rem 0;
    padding: 0.5rem;
  }

  .landing-image {
    width: 100%;
    max-width: 400px;
  }
  
  .cta-buttons {
    flex-direction: column;
  }
}
</style>
