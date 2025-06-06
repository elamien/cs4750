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

<style scoped>
.events-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.event-item {
    padding: 1rem;
    border: 1px solid var(--p-surface-border);
    border-radius: 6px;
    background: var(--p-surface-0);
}

.event-info h4 {
    margin: 0 0 0.5rem;
    color: var(--theme-main-text);
}

.event-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: var(--theme-secondary-text);
    margin-bottom: 0.5rem;
}

.event-meta span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.availability-section {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.availability-actions {
    display: flex;
    gap: 0.5rem;
}

.no-events {
    text-align: center;
    padding: 2rem;
    color: var(--theme-secondary-text);
}

@media (max-width: 768px) {
    .event-meta {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .availability-section {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .availability-actions {
        width: 100%;
    }
    
    .availability-actions .p-button {
        flex: 1;
    }
}
</style> 