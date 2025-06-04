<template>
    <div class="event-requests">
        <div class="header">
            <h1>Event Applications & Invitations</h1>
            <p>Manage event opportunities for your band.</p>
        </div>
        
        <Card>
            <template #content>
                <p>Band Leader view for managing event requests and applications. This includes reviewing invitations from event organizers for your band to play, or applications your band has made to events. Functionality includes accepting or declining these opportunities.</p>
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