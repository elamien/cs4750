<template>
    <Card class="band-info-section">
        <template #title>Band Information</template>
        <template #content>
            <div class="band-details">
                <div class="detail-item">
                    <strong>Genre:</strong> {{ bandInfo.genre || 'N/A' }}
                </div>
                <div class="detail-item">
                    <strong>Location:</strong> {{ bandInfo.location || 'N/A' }}
                </div>
                <div class="detail-item">
                    <strong>Description:</strong>
                    <p>{{ bandInfo.description || 'No description provided.' }}</p>
                </div>
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';

interface BandInfo {
    id: string;
    name: string;
    genre?: string | null;
    description?: string | null;
    location?: string | null;
    members: unknown[];
}

defineProps<{
    bandInfo: BandInfo;
}>();
</script>

<style scoped>
.band-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: var(--theme-main-text);
}

.detail-item p {
    margin: 0.5rem 0 0;
    line-height: 1.5;
    color: var(--theme-secondary-text);
}
</style> 