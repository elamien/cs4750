<template>
    <Card class="actions-section">
        <template #title>Band Actions</template>
        <template #content>
            <div class="band-actions">
                <Button 
                    label="Leave Band" 
                    icon="pi pi-sign-out" 
                    severity="danger"
                    outlined
                    @click="$emit('leaveBand')"
                />
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import Button from 'primevue/button';

defineEmits<{
    leaveBand: [];
}>();
</script>

<style scoped>
.band-actions {
    display: flex;
    justify-content: center;
}
</style> 