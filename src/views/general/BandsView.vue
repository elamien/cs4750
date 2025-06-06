<template>
    <div class="bands">
        <Card>
            <template #title>
                <div class="title-section">
                    <h1>Bands</h1>
                    <p>Discover amazing bands in the WXTJ community</p>
                </div>
            </template>
            <template #content>
                <BrowseBandsComponent />
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import BrowseBandsComponent from '@/components/events/BrowseBandsComponent.vue';
</script>

<style scoped>
.bands {
    padding: 2rem;
    color: var(--theme-main-text);
}

.title-section {
    text-align: center;
    margin-bottom: 1rem;
}

.title-section h1 {
    color: var(--theme-main-text);
    margin-bottom: 0.5rem;
    font-size: 2.5rem;
}

.title-section p {
    color: var(--theme-secondary-text);
    font-size: 1.2rem;
}

@media (max-width: 768px) {
    .bands {
        padding: 1rem;
    }
    
    .title-section h1 {
        font-size: 2rem;
    }
}
</style> 