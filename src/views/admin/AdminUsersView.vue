<template>
    <div class="admin-users">
        <div class="header">
            <h1>User Management</h1>
            <p>Manage all users in the system</p>
        </div>
        
        <Card>
            <template #content>
                <p>WXTJ Executive view for managing all system users. Functionality includes viewing user details, deleting users, and changing user roles.</p>
                <p><em>This is a placeholder view. Full functionality coming soon.</em></p>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
</script>

<style scoped>
.admin-users {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}
</style> 