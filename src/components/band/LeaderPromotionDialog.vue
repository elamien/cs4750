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

<style scoped>
.promote-leader-content {
    padding: 1rem 0;
}

.promote-leader-content p {
    margin-bottom: 1rem;
    color: var(--theme-main-text);
}

.no-members {
    text-align: center;
    padding: 1rem;
    color: var(--theme-secondary-text);
}

.leader-candidates {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 300px;
    overflow-y: auto;
}

.candidate-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--p-surface-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--p-surface-0);
}

.candidate-item:hover {
    background: var(--p-surface-50);
    border-color: var(--hoojams-orange);
}

.candidate-item.selected {
    background: var(--p-primary-50);
    border-color: var(--p-primary-500);
}

.candidate-info {
    flex: 1;
}

.candidate-info strong {
    display: block;
    color: var(--theme-main-text);
    margin-bottom: 0.25rem;
}

.candidate-details {
    font-size: 0.9rem;
    color: var(--theme-secondary-text);
}

.selected-icon {
    color: var(--p-primary-500);
    font-size: 1.2rem;
}

@media (max-width: 768px) {
    .candidate-item {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
    }
    
    .selected-icon {
        margin-top: 0.5rem;
    }
}
</style> 