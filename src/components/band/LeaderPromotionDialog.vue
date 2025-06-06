<template>
    <Dialog 
        :visible="visible" 
        modal 
        header="Promote New Leader" 
        :style="{ width: '30rem' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="promote-leader-content">
            <p>As the band leader, you must promote another member to leader before leaving the band.</p>
            <p><strong>Choose a new leader:</strong></p>
            
            <div v-if="eligibleLeaders.length === 0" class="no-members">
                <p>No other members are available to promote. You are the only member of this band.</p>
            </div>
            
            <div v-else class="leader-candidates">
                <div 
                    v-for="member in eligibleLeaders" 
                    :key="member.id" 
                    class="candidate-item"
                    :class="{ selected: selectedNewLeader === member.id }"
                    @click="$emit('update:selectedNewLeader', member.id)"
                >
                    <Avatar :label="getInitials(member.firstName, member.lastName)" shape="circle" />
                    <div class="candidate-info">
                        <strong>{{ member.firstName }} {{ member.lastName }}</strong>
                        <span class="candidate-details">
                            {{ member.instrument || 'No instrument specified' }}
                        </span>
                    </div>
                    <i v-if="selectedNewLeader === member.id" class="pi pi-check-circle selected-icon"></i>
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
                v-if="eligibleLeaders.length === 0"
                label="Leave Anyway" 
                severity="danger" 
                @click="$emit('forceLeave')"
            />
            <Button 
                v-else
                label="Promote & Leave" 
                severity="primary" 
                @click="$emit('promoteAndLeave')"
                :disabled="!selectedNewLeader"
                :loading="promotingLeader"
            />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
// Import dedicated CSS file
import '@/assets/components/band-dialogs.css';

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';

interface BandUser {
    id: string;
    firstName: string;
    lastName: string;
    instrument?: string | null;
    role?: string;
}

defineProps<{
    visible: boolean;
    eligibleLeaders: BandUser[];
    selectedNewLeader: string | null;
    promotingLeader: boolean;
}>();

defineEmits<{
    'update:visible': [value: boolean];
    'update:selectedNewLeader': [id: string];
    cancel: [];
    forceLeave: [];
    promoteAndLeave: [];
}>();

// Utility function for initials
const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
</script>

<!-- Styles moved to dedicated CSS file: src/assets/components/band-dialogs.css --> 