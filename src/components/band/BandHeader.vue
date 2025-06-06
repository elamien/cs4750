<template>
    <div class="band-header">
        <h1>{{ bandInfo.name || 'Loading...' }}</h1>
        <p v-if="bandInfo.name">{{ bandInfo.genre }} • {{ bandInfo.members.length }} members</p>
    </div>
</template>

<script setup lang="ts">
// Import dedicated CSS file
import '@/assets/components/band-header.css';

interface BandUser {
    id: string;
    firstName: string;
    lastName: string;
    instrument?: string | null;
    role?: string;
}

interface BandInfo {
    id: string;
    name: string;
    genre?: string | null;
    description?: string | null;
    location?: string | null;
    members: BandUser[];
}

defineProps<{
    bandInfo: BandInfo;
}>();
</script>

<!-- Styles moved to dedicated CSS file: src/assets/components/band-header.css --> 