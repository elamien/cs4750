<template>
    <Card class="events-section">
        <template #title>Upcoming Events</template>
        <template #content>
            <div v-if="upcomingEvents.length > 0" class="events-list">
                <div v-for="event in upcomingEvents" :key="event.id" class="event-item">
                    <div class="event-info">
                        <h4>{{ event.eventTitle }}</h4>
                        <div class="event-meta">
                            <span><i class="pi pi-calendar"></i> {{ formatDate(event.datetime) }}</span>
                            <span><i class="pi pi-map-marker"></i> {{ event.location }}</span>
                        </div>
                        <p>{{ event.description }}</p>
                    </div>
                    <div class="availability-section">
                        <div class="availability-status">
                            <strong>Your Status:</strong>
                            <Tag 
                                :value="getAvailabilityText(event.myAvailability)" 
                                :severity="getAvailabilitySeverity(event.myAvailability)"
                            />
                        </div>
                        <div class="availability-actions">
                            <Button 
                                label="Available" 
                                icon="pi pi-check" 
                                severity="success"
                                size="small"
                                :outlined="event.myAvailability !== true"
                                @click="$emit('setAvailability', event.id, true)"
                            />
                            <Button 
                                label="Not Available" 
                                icon="pi pi-times" 
                                severity="danger"
                                size="small"
                                :outlined="event.myAvailability !== false"
                                @click="$emit('setAvailability', event.id, false)"
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
</template>

<script setup lang="ts">
// Import dedicated CSS file
import '@/assets/components/band-upcoming-events.css';

import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

interface BandEvent {
    id: string;
    eventTitle: string;
    datetime: string;
    location?: string | null;
    description?: string | null;
    myAvailability: boolean | null;
}

defineProps<{
    upcomingEvents: BandEvent[];
}>();

defineEmits<{
    setAvailability: [eventId: string, availability: boolean];
}>();

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

const getAvailabilityText = (availability: boolean | null): string => {
    if (availability === true) return 'Available';
    if (availability === false) return 'Not Available';
    return 'Pending';
};

const getAvailabilitySeverity = (availability: boolean | null) => {
    if (availability === true) return 'success';
    if (availability === false) return 'danger';
    return 'warning';
};
</script>

<!-- Styles moved to dedicated CSS file: src/assets/components/band-upcoming-events.css --> 