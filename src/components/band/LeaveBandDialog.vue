<template>
    <Dialog 
        :visible="visible" 
        modal 
        header="Leave Band" 
        :style="{ width: '25rem' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <p v-if="!isOnlyMember">Are you sure you want to leave {{ bandName }}? This action cannot be undone.</p>
        <div v-else>
            <p>Are you sure you want to leave {{ bandName }}?</p>
            <div class="warning-box">
                <i class="pi pi-exclamation-triangle warning-icon"></i>
                <div class="warning-content">
                    <strong>The band will be permanently deleted</strong>
                    <p>Since you are the only member, leaving will delete the entire band. This action cannot be undone.</p>
                </div>
            </div>
        </div>
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