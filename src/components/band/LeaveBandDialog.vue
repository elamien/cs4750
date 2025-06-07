<template>
    <Dialog 
        :visible="visible" 
        modal 
        header="Leave Band" 
        :style="{ width: '25rem' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <p v-if="!isOnlyMember">Are you sure you want to leave {{ bandName }}? This action cannot be undone.</p>
        <p v-else>
            <strong>Are you sure you want to leave {{ bandName }}?</strong><br/>
            Since you are the only member, <strong>the band will be permanently deleted</strong>. This action cannot be undone.
        </p>
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
    isOnlyMember: boolean;
    loading: boolean;
}>();

defineEmits<{
    'update:visible': [value: boolean];
    cancel: [];
    confirm: [];
}>();
</script> 