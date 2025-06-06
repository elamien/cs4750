<template>
    <div class="band-header">
        <h1>{{ bandInfo.name || 'Loading...' }}</h1>
        <p v-if="bandInfo.name">{{ bandInfo.genre }} • {{ bandInfo.members.length }} members</p>
    </div>
</template>

<script setup lang="ts">
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

<style scoped>
.band-header {
    text-align: center;
    margin-bottom: 2rem;
}

.band-header h1 {
    color: var(--theme-main-text);
    margin-bottom: 0.5rem;
}

.band-header p {
    color: var(--theme-secondary-text);
    font-size: 1.1rem;
}
</style> 