<template>
    <Dialog
        :visible="visible"
        modal
        header="Confirm Gig Commitment"
        :style="{ width: '30rem' }"
        @update:visible="$emit('update:visible', $event)"
    >
        <div v-if="eventDetails">
            <p>Are you sure you want to commit to this event?</p>
            <div class="event-summary">
                <h4>{{ eventDetails.eventTitle }}</h4>
                <div class="event-meta">
                    <span><i class="pi pi-calendar"></i> {{ formatDate(eventDetails.datetime) }}</span>
                    <span><i class="pi pi-map-marker"></i> {{ eventDetails.location }}</span>
                </div>
            </div>
            <div class="warning-box">
                <i class="pi pi-exclamation-triangle warning-icon"></i>
                <div class="warning-content">
                    <strong>Important Commitment Policy</strong>
                    <p>Once you accept this gig, you <strong>cannot</strong> toggle back to available if you cancel. You can only cancel your commitment, and you'll need to re-apply through Browse Events if you change your mind.</p>
                    <p>Additionally, you <strong>cannot cancel within 24 hours</strong> of the event without emergency contact.</p>
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
                label="I Understand - Commit to Gig"
                severity="success"
                @click="$emit('confirm')"
                :loading="loading"
            />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
// Import dedicated CSS file (shared with other band dialogs)
import '@/assets/components/band-dialogs.css';

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

interface EventDetails {
    id: string;
    eventTitle: string;
    datetime: string;
    location?: string | null;
    description?: string | null;
}

defineProps<{
    visible: boolean;
    eventDetails: EventDetails | null;
    loading: boolean;
}>();

defineEmits<{
    'update:visible': [value: boolean];
    cancel: [];
    confirm: [];
}>();

// Utility function for date formatting
const formatDate = (dateString: string) => {
    if (!dateString) return 'Date TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};
</script>

<style scoped>
.event-summary {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--p-surface-50);
    border-radius: 6px;
    border-left: 4px solid var(--hoojams-orange);
}

.event-summary h4 {
    margin: 0 0 0.5rem;
    color: var(--theme-main-text);
}

.event-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
    color: var(--theme-secondary-text);
}

.event-meta span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
</style>
