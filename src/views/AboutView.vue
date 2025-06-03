<template>
  <div class="about">
    <div class="content">
      <h1>About Our Band Management System</h1>
      <div class="about-content">
        <p>
          Our Band Management System is designed to streamline the organization and 
          coordination of musical ensembles. Whether you're managing a school band, 
          orchestra, or community ensemble, our platform provides the tools you need 
          to keep everyone in harmony.
        </p>
        
        <h2>Features</h2>
        <ul>
          <li>Comprehensive member management</li>
          <li>Event and rehearsal scheduling</li>
          <li>Attendance tracking</li>
          <li>Music library organization</li>
          <li>Role-based access control</li>
          <li>Performance analytics</li>
        </ul>
        
        <h2>User Roles</h2>
        <div class="roles">
          <div class="role-card">
            <h3>Band Members</h3>
            <p>Access schedules, music library, and track personal attendance.</p>
          </div>
          <div class="role-card">
            <h3>Band Leaders</h3>
            <p>Manage members, schedule events, and generate reports.</p>
          </div>
          <div class="role-card">
            <h3>Executives</h3>
            <p>System administration and multi-band management capabilities.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .about {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.content h1 {
  color: var(--p-text-color);
  margin-bottom: 2rem;
  text-align: center;
}

.about-content {
  line-height: 1.6;
  color: var(--p-text-color);
}

.about-content h2 {
  color: var(--p-primary-color);
  margin: 2rem 0 1rem 0;
}

.about-content ul {
  margin: 1rem 0;
  padding-left: 2rem;
}

.about-content li {
  margin: 0.5rem 0;
}

.roles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.role-card {
  padding: 1.5rem;
  border: 1px solid var(--p-border-color);
  border-radius: 8px;
  background: var(--p-surface-card);
}

.role-card h3 {
  color: var(--p-primary-color);
  margin-bottom: 1rem;
  }

.role-card p {
  color: var(--p-text-secondary-color);
  margin: 0;
}
</style>
