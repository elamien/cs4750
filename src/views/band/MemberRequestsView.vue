<template>
    <div class="member-requests">
        <div class="header">
            <h1>Member Requests</h1>
            <p>Review musicians who want to join your band</p>
        </div>
        
        <Card>
            <template #content>
                <p>Band leader view for accepting/denying band member requests.</p>
                <p><em>This is a placeholder view. Full functionality coming soon.</em></p>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
</script>

<style scoped>
.member-requests {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}
</style> 