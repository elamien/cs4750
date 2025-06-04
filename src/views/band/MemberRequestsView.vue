<template>
    <div class="member-requests">
        <div class="header">
            <h1>Membership Applications</h1>
            <p>Review and manage requests from musicians wanting to join your band.</p>
        </div>
        
        <Card>
            <template #content>
                <p>Band Leader view for managing incoming membership requests. Functionality includes viewing applicant details, and accepting or denying their request to join the band.</p>
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