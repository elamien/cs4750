<template>
    <div class="event-requests">
        <div class="header">
            <h1>Event Requests</h1>
            <p>Review and manage event booking requests</p>
        </div>
        
        <Card>
            <template #content>
                <p>Band leader view for accepting/denying event requests sent to the band.</p>
                <p><em>This is a placeholder view. Full functionality coming soon.</em></p>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
</script>

<style scoped>
.event-requests {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}
</style> 