<template>
    <Card class="members-section">
        <template #title>Band Members</template>
        <template #content>
            <div class="members-list">
                <div v-for="member in members" :key="member.id" class="member-item">
                    <Avatar :label="member.firstName.charAt(0)" shape="circle" />
                    <div class="member-info">
                        <strong>{{ member.firstName }} {{ member.lastName }}</strong>
                        <div class="member-role">
                            {{ member.instrument || 'N/A' }}
                            <Tag v-if="member.role === 'leader'" value="Leader" severity="warn" />
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';

interface BandUser {
    id: string;
    firstName: string;
    lastName: string;
    instrument?: string | null;
    role?: string;
}

defineProps<{
    members: BandUser[];
}>();
</script>

<style scoped>
.members-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.member-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--p-surface-border);
    border-radius: 6px;
    background: var(--p-surface-0);
}

.member-info {
    flex: 1;
}

.member-role {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--p-text-muted-color);
    margin-top: 0.25rem;
}
</style> 