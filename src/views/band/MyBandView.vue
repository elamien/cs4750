<template>
    <div class="my-band">
        <div class="header">
            <h1>{{ bandInfo.name }}</h1>
            <p>{{ bandInfo.genre }} • {{ bandInfo.memberCount }} members</p>
        </div>

        <div class="band-content">
            <div class="band-sections">
                <Card class="events-section">
                    <template #title>Upcoming Events</template>
                    <template #content>
                        <div v-if="upcomingEvents.length > 0" class="events-list">
                            <div v-for="event in upcomingEvents" :key="event.id" class="event-item">
                                <div class="event-info">
                                    <h4>{{ event.name }}</h4>
                                    <div class="event-meta">
                                        <span><i class="pi pi-calendar"></i> {{ formatDate(event.date) }}</span>
                                        <span><i class="pi pi-clock"></i> {{ event.time }}</span>
                                        <span><i class="pi pi-map-marker"></i> {{ event.venue }}</span>
                                    </div>
                                    <p>{{ event.description }}</p>
                                </div>
                                <div class="availability-section">
                                    <div class="availability-status">
                                        <strong>Your Status:</strong>
                                        <Tag 
                                            :value="event.myAvailability" 
                                            :severity="getAvailabilitySeverity(event.myAvailability)"
                                        />
                                    </div>
                                    <div class="availability-actions">
                                        <Button 
                                            label="Available" 
                                            icon="pi pi-check" 
                                            severity="success"
                                            size="small"
                                            :outlined="event.myAvailability !== 'Available'"
                                            @click="setAvailability(event.id, 'Available')"
                                        />
                                        <Button 
                                            label="Not Available" 
                                            icon="pi pi-times" 
                                            severity="danger"
                                            size="small"
                                            :outlined="event.myAvailability !== 'Not Available'"
                                            @click="setAvailability(event.id, 'Not Available')"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-events">
                            <i class="pi pi-calendar" style="font-size: 2rem; color: var(--p-text-muted-color);"></i>
                            <p>No upcoming events scheduled</p>
                        </div>
                    </template>
                </Card>

                <Card class="band-info-section">
                    <template #title>Band Information</template>
                    <template #content>
                        <div class="band-details">
                            <div class="detail-item">
                                <strong>Genre:</strong> {{ bandInfo.genre }}
                            </div>
                            <div class="detail-item">
                                <strong>Formed:</strong> {{ bandInfo.formed }}
                            </div>
                            <div class="detail-item">
                                <strong>Description:</strong>
                                <p>{{ bandInfo.description }}</p>
                            </div>
                        </div>
                    </template>
                </Card>

                <Card class="members-section">
                    <template #title>Band Members</template>
                    <template #content>
                        <div class="members-list">
                            <div v-for="member in bandInfo.members" :key="member.id" class="member-item">
                                <Avatar :label="member.name.charAt(0)" shape="circle" />
                                <div class="member-info">
                                    <strong>{{ member.name }}</strong>
                                    <div class="member-role">
                                        {{ member.instruments.join(', ') }}
                                        <Tag v-if="member.isLeader" value="Leader" severity="warn" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>

                <Card class="actions-section">
                    <template #title>Band Actions</template>
                    <template #content>
                        <div class="band-actions">
                            <Button 
                                label="Leave Band" 
                                icon="pi pi-sign-out" 
                                severity="danger"
                                outlined
                                @click="confirmLeaveBand"
                            />
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- Leave Band Confirmation Dialog -->
        <Dialog 
            v-model:visible="showLeaveDialog" 
            modal 
            header="Leave Band" 
            :style="{ width: '25rem' }"
        >
            <p>Are you sure you want to leave {{ bandInfo.name }}? This action cannot be undone.</p>
            <template #footer>
                <Button 
                    label="Cancel" 
                    severity="secondary" 
                    @click="showLeaveDialog = false" 
                />
                <Button 
                    label="Leave Band" 
                    severity="danger" 
                    @click="leaveBand" 
                />
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';

// Mock band data
const bandInfo = ref({
    name: 'The Jazz Collective',
    genre: 'Jazz',
    memberCount: 5,
    formed: 'January 2023',
    description: 'A smooth jazz ensemble bringing classic and contemporary sounds to Charlottesville. We focus on improvisation and creating a dynamic live experience.',
    members: [
        {
            id: 1,
            name: 'Mike Johnson',
            instruments: ['Piano', 'Vocals'],
            isLeader: true
        },
        {
            id: 2,
            name: 'Sarah Davis',
            instruments: ['Saxophone'],
            isLeader: false
        },
        {
            id: 3,
            name: 'John Doe',
            instruments: ['Guitar', 'Bass'],
            isLeader: false
        },
        {
            id: 4,
            name: 'Lisa Williams',
            instruments: ['Drums'],
            isLeader: false
        },
        {
            id: 5,
            name: 'Tom Brown',
            instruments: ['Trumpet'],
            isLeader: false
        }
    ]
});

const upcomingEvents = ref([
    {
        id: 1,
        name: 'Jazz Night at The Blue Note',
        date: new Date('2024-06-25'),
        time: '8:00 PM',
        venue: 'The Blue Note',
        description: 'Weekly jazz night performance. Standard repertoire plus some original compositions.',
        myAvailability: 'Available'
    },
    {
        id: 2,
        name: 'Summer Music Festival',
        date: new Date('2024-07-15'),
        time: '7:00 PM',
        venue: 'Downtown Amphitheater',
        description: 'Main stage performance at the annual summer festival. 45-minute set.',
        myAvailability: 'Pending'
    },
    {
        id: 3,
        name: 'Private Wedding',
        date: new Date('2024-08-03'),
        time: '6:30 PM',
        venue: 'Riverside Gardens',
        description: 'Wedding reception performance. Mix of jazz standards and popular requests.',
        myAvailability: 'Not Available'
    }
]);

const showLeaveDialog = ref(false);

// Utility functions
const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

const getAvailabilitySeverity = (availability: string) => {
    switch (availability) {
        case 'Available': return 'success';
        case 'Not Available': return 'danger';
        case 'Pending': return 'warning';
        default: return 'info';
    }
};

// Actions
const setAvailability = (eventId: number, availability: string) => {
    const event = upcomingEvents.value.find(e => e.id === eventId);
    if (event) {
        event.myAvailability = availability;
        console.log(`Set availability for event ${eventId} to ${availability}`);
        // Would save to backend
    }
};

const confirmLeaveBand = () => {
    showLeaveDialog.value = true;
};

const leaveBand = () => {
    console.log('Leaving band:', bandInfo.value.name);
    showLeaveDialog.value = false;
    // Would leave band and redirect to join/create band page
};
</script>

<style scoped>
.my-band {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}

.header h1 {
    color: var(--p-text-color);
    margin-bottom: 0.5rem;
}

.header p {
    color: var(--p-text-muted-color);
    font-size: 1.1rem;
}

.band-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

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
    color: var(--p-text-color);
}

.event-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: var(--p-text-muted-color);
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
    color: var(--p-text-muted-color);
}

.band-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.detail-item p {
    margin: 0.5rem 0 0;
    line-height: 1.5;
}

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

.band-actions {
    display: flex;
    justify-content: center;
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