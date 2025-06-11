<template>
    <Card class="actions-section glass-card">
        <template #title>Band Actions</template>
        <template #content>
            <div class="band-actions">
                <Button
                    label="Request Fill-in"
                    icon="pi pi-send"
                    severity="primary"
                    @click="$emit('postFillInRequest')"
                />
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
// Import dedicated CSS file
import '@/assets/components/band-actions.css';

import Card from 'primevue/card';
import Button from 'primevue/button';

defineEmits<{
    postFillInRequest: [];
    leaveBand: [];
}>();
</script>

<!-- Styles moved to dedicated CSS file: src/assets/components/band-actions.css -->
