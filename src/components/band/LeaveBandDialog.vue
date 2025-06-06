<template>
    <Dialog 
        :visible="visible" 
        modal 
        header="Leave Band" 
        :style="{ width: '25rem' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <p>Are you sure you want to leave {{ bandName }}? This action cannot be undone.</p>
        <template #footer>
            <Button 
                label="Cancel" 
                severity="secondary" 
                @click="$emit('cancel')" 
            />
            <Button 
                label="Leave Band" 
                severity="danger" 
                @click="$emit('confirm')" 
                :loading="loading"
            />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
// Import dedicated CSS file (shared with LeaderPromotionDialog)
import '@/assets/components/band-dialogs.css';

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

defineProps<{
    visible: boolean;
    bandName: string;
    loading: boolean;
}>();

defineEmits<{
    'update:visible': [value: boolean];
    cancel: [];
    confirm: [];
}>();
</script> 