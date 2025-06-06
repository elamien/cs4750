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
// Import dedicated CSS file
import '@/assets/components/band-information.css';

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

<!-- Styles moved to dedicated CSS file: src/assets/components/band-information.css --> 