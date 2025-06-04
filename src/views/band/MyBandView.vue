<template>
    <div class="my-band">
        <div class="header">
            <h1>{{ bandInfo.name }}</h1>
            <p>{{ bandInfo.genre }} • {{ bandInfo.members.length }} members</p>
        </div>

        <div class="band-content">
            <div class="band-sections">
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
                                            @click="setAvailability(event.id, true)"
                                        />
                                        <Button 
                                            label="Not Available" 
                                            icon="pi pi-times" 
                                            severity="danger"
                                            size="small"
                                            :outlined="event.myAvailability !== false"
                                            @click="setAvailability(event.id, false)"
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

                <Card class="band-info-section">
                    <template #title>Band Information</template>
                    <template #content>
                        <div class="band-details">
                            <div class="detail-item">
                                <strong>Genre:</strong> {{ bandInfo.genre }}
                            </div>
                            <div class="detail-item">
                                <strong>Email:</strong> {{ bandInfo.email || 'N/A' }}
                            </div>
                            <div class="detail-item">
                                <strong>Phone:</strong> {{ bandInfo.phoneNumber || 'N/A' }}
                            </div>
                            <div class="detail-item">
                                <strong>Description:</strong>
                                <p>{{ bandInfo.description || 'No description provided.' }}</p>
                            </div>
                        </div>
                    </template>
                </Card>

                <Card class="members-section">
                    <template #title>Band Members</template>
                    <template #content>
                        <div class="members-list">
                            <div v-for="member in bandInfo.members" :key="member.id" class="member-item">
                                <Avatar :label="member.firstName.charAt(0)" shape="circle" />
                                <div class="member-info">
                                    <strong>{{ member.firstName }} {{ member.lastName }}</strong>
                                    <div class="member-role">
                                        {{ member.instrument || 'N/A' }}
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

// --- Mock User Data (for current band member) ---
const mockCurrentMemberId = ref('user2'); // Example: Sarah Davis is the current member viewing this

// --- Data Interfaces (aligned with core_db_structure.sql) ---
interface BandUser { // Based on user table for band members
    id: string; // user_id
    firstName: string;
    lastName: string;
    instrument?: string | null;
    isLeader?: boolean; // Derived from band_leader table or a flag
}

interface BandInfo { // Based on band table
    id: string; // band_id
    name: string;
    genre?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    description?: string | null;
    members: BandUser[];
    // total_events_played and events_played_ytd could be added if needed
}

interface BandEvent { // Based on event table
    id: number; // event_id, assuming number for mock data simplicity
    eventTitle: string;
    datetime: string; // ISO string
    location?: string | null;
    description?: string | null;
    myAvailability: boolean | null; // true for available, false for not, null for pending/not set by current user
}


// Mock band data
const bandInfo = ref<BandInfo>({
    id: 'band123',
    name: 'The Jazz Collective',
    genre: 'Jazz',
    email: 'jazzcollective@example.com',
    phoneNumber: '555-JAZZ',
    description: 'A smooth jazz ensemble bringing classic and contemporary sounds to Charlottesville. We focus on improvisation and creating a dynamic live experience.',
    members: [
        {
            id: 'leader1',
            firstName: 'Mike',
            lastName: 'Johnson',
            instrument: 'Piano, Vocals',
            isLeader: true
        },
        {
            id: 'user2',
            firstName: 'Sarah',
            lastName: 'Davis',
            instrument: 'Saxophone',
            isLeader: false
        },
        {
            id: 'user3',
            firstName: 'John',
            lastName: 'Doe',
            instrument: 'Guitar, Bass',
            isLeader: false
        },
    ]
});

const upcomingEvents = ref<BandEvent[]>([
    {
        id: 1,
        eventTitle: 'Jazz Night at The Blue Note',
        datetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'The Blue Note',
        description: 'Weekly jazz night performance. Standard repertoire plus some original compositions.',
        myAvailability: true // Sarah is available
    },
    {
        id: 2,
        eventTitle: 'Summer Music Festival',
        datetime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Downtown Amphitheater',
        description: 'Main stage performance at the annual summer festival. 45-minute set.',
        myAvailability: null // Sarah hasn't responded yet (Pending)
    },
    {
        id: 3,
        eventTitle: 'Private Wedding',
        datetime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Riverside Gardens',
        description: 'Wedding reception performance. Mix of jazz standards and popular requests.',
        myAvailability: false // Sarah is not available
    }
]);

const showLeaveDialog = ref(false);

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
    return 'warning'; // For null (Pending)
};

// Actions
const setAvailability = (eventId: number, availability: boolean) => {
    const event = upcomingEvents.value.find(e => e.id === eventId);
    if (event) {
        event.myAvailability = availability;
        console.log(`User ${mockCurrentMemberId.value} set availability for event ${eventId} to ${availability}`);
        // In a real app, this would trigger an API call to update band_member_event_availability table
        // with user_id, band_id, event_id, is_available
    }
};

const confirmLeaveBand = () => {
    showLeaveDialog.value = true;
};

const leaveBand = () => {
    console.log(`User ${mockCurrentMemberId.value} is leaving band: ${bandInfo.value.name}`);
    showLeaveDialog.value = false;
    // In a real app, this would trigger an API call to:
    // 1. Remove user from band_member table (or update their role)
    // 2. Add a record to band_membership_history table with action 'left'
    // Then, likely redirect the user (e.g., to /join-create-band or home)
    // For mock: router.push('/'); 
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