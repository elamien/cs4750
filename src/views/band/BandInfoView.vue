<template>
    <div class="band-info">
        <div class="header">
            <h1>Band Information</h1>
            <p>Manage your band's details and settings</p>
        </div>
        
        <Card>
            <template #content>
                <p>Band leader view for managing band information, settings, and leadership transfer.</p>
                <p><em>This is a placeholder view. Full functionality coming soon.</em></p>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
</script>

<style scoped>
.band-info {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}
</style> 