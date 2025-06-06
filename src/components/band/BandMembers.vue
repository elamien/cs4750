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
// Import dedicated CSS file
import '@/assets/components/band-members.css';

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

<!-- Styles moved to dedicated CSS file: src/assets/components/band-members.css --> 