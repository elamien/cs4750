<template>
    <div class="create-fill-in">
        <div class="header">
            <h1>Post a Fill-In Request</h1>
            <p>Need a substitute musician for an upcoming event? Post a request here.</p>
        </div>
        
        <Card>
            <template #content>
                <p>Band Leader view for creating fill-in requests when a regular band member is unavailable for a scheduled event. Specify the event, instrument needed, and a description of the requirements.</p>
                <p><em>This is a placeholder view. Full functionality coming soon.</em></p>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
</script>

<style scoped>
.create-fill-in {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}
</style> 