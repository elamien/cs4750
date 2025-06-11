<template>
    <Card class="events-section glass-card">
        <template #title>Upcoming Events</template>
        <template #content>
            <div v-if="upcomingEvents.length > 0" class="events-list">
                <div v-for="event in upcomingEvents" :key="event.id" class="event-item glass-item">
                    <div class="event-info">
                        <h4>{{ event.eventTitle }}</h4>
                        <div class="event-meta">
                            <span><i class="pi pi-calendar"></i> {{ formatDate(event.datetime) }}</span>
                            <span><i class="pi pi-map-marker"></i> {{ event.location }}</span>
                            <span><i class="pi pi-user"></i> {{ event.creatorName }}</span>
                        </div>
                        <p>{{ event.description }}</p>
                    </div>
                    <div class="availability-section">
                        <div class="availability-status">
                            <strong>Your Status:</strong>
                            <Tag
                                value="Playing"
                                severity="success"
                            />
                            <Button
                                icon="pi pi-info-circle"
                                severity="info"
                                size="small"
                                outlined
                                @click="showCommitmentInfo(event)"
                                class="info-button"
                                v-tooltip="'View commitment details'"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="no-events">
                <i class="pi pi-calendar" style="font-size: 2rem; color: var(--p-text-muted-color);"></i>
                <p>No upcoming events scheduled for your band.</p>
            </div>
        </template>
    </Card>

    <!-- Commitment Info Dialog -->
    <Dialog
        :visible="showInfoDialog"
        modal
        header="Event Commitment"
        :style="{ width: '25rem' }"
        @update:visible="showInfoDialog = $event"
    >
        <div v-if="selectedEvent">
            <div class="event-summary">
                <h4>{{ selectedEvent.eventTitle }}</h4>
                <div class="event-meta">
                    <span><i class="pi pi-calendar"></i> {{ formatDate(selectedEvent.datetime) }}</span>
                    <span><i class="pi pi-map-marker"></i> {{ selectedEvent.location }}</span>
                    <span><i class="pi pi-user"></i> Posted by {{ selectedEvent.creatorName }} ({{ selectedEvent.creatorRole }})</span>
                </div>
            </div>
            <div class="commitment-info">
                <p><i class="pi pi-check-circle" style="color: green;"></i> <strong>Your band is committed to this event.</strong></p>
                <p>Since you agreed to the commitment terms, this booking cannot be cancelled through the platform.</p>
                <p>For emergency cancellations, please contact the event organizer directly.</p>
            </div>
        </div>
        <template #footer>
            <Button
                label="Understood"
                icon="pi pi-check"
                @click="showInfoDialog = false"
                severity="secondary"
            />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
// Import dedicated CSS file
import '@/assets/components/band-upcoming-events.css';

import { ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';

interface BandEvent {
    id: string;
    eventTitle: string;
    datetime: string;
    location?: string | null;
    description?: string | null;
    myAvailability: boolean | null;
    creatorName: string;
    creatorRole: string;
}

defineProps<{
    upcomingEvents: BandEvent[];
}>();

// Note: No longer need emit for setAvailability since events in upcoming are already committed

// Reactive state for info dialog
const showInfoDialog = ref(false);
const selectedEvent = ref<BandEvent | null>(null);

// Dialog functions
const showCommitmentInfo = (event: BandEvent) => {
    selectedEvent.value = event;
    showInfoDialog.value = true;
};

// Utility functions
const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};

// Removed old availability functions since we now only show "Playing" status
</script>

<!-- Styles moved to dedicated CSS file: src/assets/components/band-upcoming-events.css -->
