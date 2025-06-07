<template>
    <div class="home-dashboard">
        <div class="dashboard-container">
            <Card class="welcome-card">
                <template #content>
                    <div class="welcome-content">
                        <div class="logo-section">
                            <img src="@/assets/hoojams-logo-v2.png" alt="HooJams Logo" class="dashboard-logo" />
                            <h1>Welcome to HooJams</h1>
                        </div>
                        
                        <div class="building-message">
                            <i class="pi pi-cog pi-spin building-icon"></i>
                            <h2>Building...</h2>
                            <p>We're working hard to bring you an amazing dashboard experience. Check back soon for updates!</p>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
</script>

<style scoped>
.home-dashboard {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.dashboard-container {
    width: 100%;
}

.welcome-card {
    text-align: center;
    padding: 2rem;
}

.welcome-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
}

.logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.dashboard-logo {
    width: 80px;
    height: 80px;
    object-fit: contain;
}

.logo-section h1 {
    color: var(--theme-main-text);
    margin: 0;
    font-size: 2.5rem;
    font-weight: 700;
}

.building-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    background: linear-gradient(135deg, var(--hoojams-orange), var(--hoojams-orange-hover));
    border-radius: 12px;
    color: white;
    max-width: 500px;
}

.building-icon {
    font-size: 3rem;
    opacity: 0.9;
}

.building-message h2 {
    margin: 0;
    font-size: 2rem;
    font-weight: 600;
}

.building-message p {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.9;
    line-height: 1.6;
}

@media (max-width: 768px) {
    .home-dashboard {
        padding: 1rem;
    }
    
    .logo-section h1 {
        font-size: 2rem;
    }
    
    .building-message {
        padding: 1.5rem;
    }
    
    .building-message h2 {
        font-size: 1.5rem;
    }
}
</style> 