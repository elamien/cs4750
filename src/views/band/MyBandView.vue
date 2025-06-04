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
                                <strong>Location:</strong> {{ bandInfo.location || 'N/A' }}
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
                                        <Tag v-if="member.role === 'leader'" value="Leader" severity="warn" />
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

// --- Data Interfaces (aligned with core_db_structure.sql) ---
interface BandUser { // Based on user table for band members
    id: string; // user_id
    firstName: string;
    lastName: string;
    instrument?: string | null;
    role?: string; // From band_member table
}

interface BandInfo { // Based on band table
    id: string; // band_id
    name: string;
    genre?: string | null;
    description?: string | null;
    location?: string | null;
    members: BandUser[];
}

interface BandEvent { // Based on event table
    id: string; // event_id
    eventTitle: string;
    datetime: string; // ISO string
    location?: string | null;
    description?: string | null;
    myAvailability: boolean | null; // true for available, false for not, null for pending/not set by current user
}

// API Response Interfaces
interface APIBandMember {
    id: string;
    firstName: string;
    lastName: string;
    instrument?: string;
    role: string;
}

interface APIBandEvent {
    id: string;
    name: string;
    eventTitle?: string;
    datetime: string;
    location?: string;
    description?: string;
    myAvailability: boolean | null;
}

// --- Reactive Data ---
const bandInfo = ref<BandInfo>({
    id: '',
    name: '',
    genre: null,
    description: null,
    location: null,
    members: []
});

const upcomingEvents = ref<BandEvent[]>([]);
const showLeaveDialog = ref(false);
const loading = ref(true);

// TypeScript interface for dev state


// Get current user ID (placeholder - replace with real authentication)
const getCurrentUserId = () => {
    // TODO: Replace with real authentication
    // For now, return null (anonymous user)
    return null;
};

const currentUserId = ref(getCurrentUserId());

// Function to reload all data
const loadAllData = async () => {
    loading.value = true;
    try {
        await fetchBandInfo();
        if (bandInfo.value.id) {
            await Promise.all([
                fetchBandMembers(),
                fetchBandEvents()
            ]);
        }
    } catch (error) {
        console.error('Error loading band data:', error);
    } finally {
        loading.value = false;
    }
};

// Function to update current user (called when dev panel changes user)
const updateCurrentUser = () => {
    const newUserId = getCurrentUserId();
    if (currentUserId.value !== newUserId) {
        currentUserId.value = newUserId;
        // Reload all data for the new user
        loadAllData();
    }
};

// --- API Functions ---
const fetchBandInfo = async () => {
    try {
        console.log('MyBandView - Fetching band info for user:', currentUserId.value);
        // First, get the user's band information
        const response = await fetch(`/api/users/${currentUserId.value}/band-status`);
        if (!response.ok) throw new Error('Failed to fetch user band status');
        
        const bandStatus = await response.json();
        console.log('MyBandView - Band status response:', bandStatus);
        
        // Check if user has a band
        if (!bandStatus.isMemberOfBand || bandStatus.memberBands.length === 0) {
            // User has no band - show empty state
            bandInfo.value = {
                id: '',
                name: '',
                genre: null,
                description: null,
                location: null,
                members: []
            };
            return;
        }
        
        // Get the first band (users should only have one band)
        const userBand = bandStatus.memberBands[0];
        const bandId = userBand.id;
        
        // Fetch detailed band information
        const bandResponse = await fetch(`/api/bands/${bandId}`);
        if (!bandResponse.ok) throw new Error('Failed to fetch band details');
        
        const band = await bandResponse.json();
        bandInfo.value = {
            id: band.id,
            name: band.name,
            genre: band.genre,
            description: band.description,
            location: band.location,
            members: []
        };
    } catch (error) {
        console.error('Error fetching band info:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load band information',
            life: 3000
        });
    }
};

const fetchBandMembers = async () => {
    try {
        const bandId = bandInfo.value.id || '1';
        const response = await fetch(`/api/bands/${bandId}/members`);
        if (!response.ok) throw new Error('Failed to fetch band members');
        
        const members: APIBandMember[] = await response.json();
        bandInfo.value.members = members.map((member: APIBandMember) => ({
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            instrument: member.instrument,
            role: member.role
        }));
    } catch (error) {
        console.error('Error fetching band members:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load band members',
            life: 3000
        });
    }
};

const fetchBandEvents = async () => {
    try {
        const bandId = bandInfo.value.id || '1';
        const response = await fetch(`/api/bands/${bandId}/events`);
        // TODO: User authentication should be handled via secure session/tokens, not URL params
        if (!response.ok) throw new Error('Failed to fetch band events');
        
        const events: APIBandEvent[] = await response.json();

        // Filter for upcoming events only
        const now = new Date();
        upcomingEvents.value = events
            .filter((event: APIBandEvent) => new Date(event.datetime) > now)
            .map((event: APIBandEvent) => ({
                id: event.id,
                eventTitle: event.eventTitle || event.name,
                datetime: event.datetime,
                location: event.location,
                description: event.description,
                myAvailability: event.myAvailability
            }));
    } catch (error) {
        console.error('Error fetching band events:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load band events',
            life: 3000
        });
    }
};

const setAvailability = async (eventId: string, availability: boolean) => {
    try {
        const bandId = bandInfo.value.id || '1';
        const response = await fetch(`/api/bands/${bandId}/events/${eventId}/availability`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUserId.value,
                isAvailable: availability
            })
        });
        
        if (!response.ok) throw new Error('Failed to update availability');
        
        // Update local state
    const event = upcomingEvents.value.find(e => e.id === eventId);
    if (event) {
        event.myAvailability = availability;
        }
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Availability updated to ${availability ? 'Available' : 'Not Available'}`,
            life: 3000
        });
    } catch (error) {
        console.error('Error updating availability:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update availability',
            life: 3000
        });
    }
};

const leaveBand = async () => {
    try {
        const bandId = bandInfo.value.id || '1';
        const response = await fetch(`/api/bands/${bandId}/leave`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUserId.value
            })
        });
        
        if (!response.ok) throw new Error('Failed to leave band');
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `You have left ${bandInfo.value.name}`,
            life: 3000
        });
        
        showLeaveDialog.value = false;
        
        // Redirect to home or band selection page
        setTimeout(() => {
            router.push('/');
        }, 1000);
        
    } catch (error) {
        console.error('Error leaving band:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to leave band',
            life: 3000
        });
        showLeaveDialog.value = false;
    }
};

// --- Utility Functions ---
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

const confirmLeaveBand = () => {
    showLeaveDialog.value = true;
};

// --- Lifecycle ---
onMounted(async () => {
    // Load initial data
    await loadAllData();
    
    // In development mode, poll for user changes from developer panel
    if (import.meta.env.DEV) {
        const pollInterval = setInterval(updateCurrentUser, 1000);
        
        // Cleanup on unmount
        onUnmounted(() => {
            clearInterval(pollInterval);
        });
    }
});
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