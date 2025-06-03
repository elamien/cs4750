<script setup lang="ts">
// Home page for the band management system
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1>Welcome to HooJams</h1>
      <p>Manage your band activities, schedules, and members all in one place.</p>
    </div>
    
    <div class="features">
      <div class="feature-card">
        <i class="pi pi-calendar" style="font-size: 2rem; color: var(--p-primary-color);"></i>
        <h3>Schedule Management</h3>
        <p>Keep track of rehearsals, performances, and events.</p>
      </div>
      
      <div class="feature-card">
        <i class="pi pi-users" style="font-size: 2rem; color: var(--p-primary-color);"></i>
        <h3>Member Management</h3>
        <p>Manage band members, roles, and attendance.</p>
      </div>
      
      <div class="feature-card">
        <i class="pi pi-file-music" style="font-size: 2rem; color: var(--p-primary-color);"></i>
        <h3>Music Library</h3>
        <p>Organize your sheet music and repertoire.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  margin-bottom: 4rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--theme-main-text);
  background: linear-gradient(135deg, var(--hoojams-orange), var(--hoojams-cream));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: 1.25rem;
  color: var(--theme-main-text);
  opacity: 0.8;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  border: 2px solid var(--theme-card-border);
  border-radius: 12px;
  background: var(--theme-card-bg);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: var(--hoojams-orange);
}

.feature-card h3 {
  margin: 1rem 0;
  color: var(--theme-card-text);
}

.feature-card p {
  color: var(--theme-card-text);
  opacity: 0.8;
  line-height: 1.6;
}
</style>
