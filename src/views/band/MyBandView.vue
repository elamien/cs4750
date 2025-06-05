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

        <!-- Leader Promotion Dialog -->
        <Dialog 
            v-model:visible="showPromoteDialog" 
            modal 
            header="Promote New Leader" 
            :style="{ width: '30rem' }"
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
                        @click="selectedNewLeader = member.id"
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
                    @click="cancelPromotion" 
                />
                <Button 
                    v-if="eligibleLeaders.length === 0"
                    label="Leave Anyway" 
                    severity="danger" 
                    @click="forceLeaveAsLastMember"
                />
                <Button 
                    v-else
                    label="Promote & Leave" 
                    severity="primary" 
                    @click="promoteAndLeave"
                    :disabled="!selectedNewLeader"
                    :loading="promotingLeader"
                />
            </template>
        </Dialog>

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
                    :loading="leavingBand"
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
const showPromoteDialog = ref(false);
const loading = ref(true);
const leavingBand = ref(false);
const promotingLeader = ref(false);

const eligibleLeaders = ref<BandUser[]>([]);
const selectedNewLeader = ref<string | null>(null);

// TypeScript interface for dev state


// Get current user ID from localStorage
const getCurrentUserId = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            return String(user.userId);
        } catch (error) {
            console.error('Error parsing saved user:', error);
            return null;
        }
    }
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

// Fetch eligible leaders for promotion
const fetchEligibleLeaders = async () => {
    try {
        const bandId = bandInfo.value.id;
        const response = await fetch(`/api/bands/${bandId}/eligible-leaders?currentUserId=${currentUserId.value}`);
        if (!response.ok) throw new Error('Failed to fetch eligible leaders');
        
        const members = await response.json();
        eligibleLeaders.value = members;
    } catch (error) {
        console.error('Error fetching eligible leaders:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load eligible leaders',
            life: 3000
        });
    }
};

// Utility function for initials
const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Check if user is leader and handle leave band logic
const checkLeaderStatusAndLeave = async () => {
    try {
        const bandId = bandInfo.value.id;
        const response = await fetch(`/api/bands/${bandId}/leave`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUserId.value
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            if (result.requiresLeaderPromotion) {
                // User is leader and needs to promote someone
                await fetchEligibleLeaders();
                showLeaveDialog.value = false;
                showPromoteDialog.value = true;
                return;
            }
            throw new Error(result.message || 'Failed to leave band');
        }
        
        // Successfully left
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `You have left ${bandInfo.value.name}`,
            life: 3000
        });
        
        showLeaveDialog.value = false;
        
        // Redirect to home
        setTimeout(() => {
            router.push('/');
        }, 1000);
        
    } catch (error) {
        console.error('Error leaving band:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to leave band',
            life: 3000
        });
        showLeaveDialog.value = false;
    }
};

// Promote member to leader and then leave
const promoteAndLeave = async () => {
    if (!selectedNewLeader.value) return;
    
    promotingLeader.value = true;
    try {
        // First promote the new leader
        const bandId = bandInfo.value.id;
        const promoteResponse = await fetch(`/api/bands/${bandId}/promote-leader`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentUserId: currentUserId.value,
                newLeaderId: selectedNewLeader.value
            })
        });
        
        if (!promoteResponse.ok) {
            const error = await promoteResponse.json();
            throw new Error(error.message || 'Failed to promote leader');
        }
        
        // Then leave the band
        const leaveResponse = await fetch(`/api/bands/${bandId}/leave`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUserId.value
            })
        });
        
        if (!leaveResponse.ok) {
            throw new Error('Failed to leave band after promotion');
        }
        
        const newLeaderName = eligibleLeaders.value.find(m => m.id === selectedNewLeader.value);
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `${newLeaderName?.firstName} ${newLeaderName?.lastName} is now the band leader. You have left ${bandInfo.value.name}.`,
            life: 5000
        });
        
        showPromoteDialog.value = false;
        
        // Redirect to home
        setTimeout(() => {
            router.push('/');
        }, 1000);
        
    } catch (error) {
        console.error('Error promoting leader and leaving:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to promote leader and leave band',
            life: 3000
        });
    } finally {
        promotingLeader.value = false;
    }
};

// Cancel promotion dialog
const cancelPromotion = () => {
    showPromoteDialog.value = false;
    selectedNewLeader.value = null;
    eligibleLeaders.value = [];
};

// Force leave as last member
const forceLeaveAsLastMember = async () => {
    leavingBand.value = true;
    try {
        const bandId = bandInfo.value.id;
        const response = await fetch(`/api/bands/${bandId}/leave`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUserId.value
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to leave band');
        }
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `You have left ${bandInfo.value.name}`,
            life: 3000
        });
        
        showPromoteDialog.value = false;
        
        // Redirect to home
        setTimeout(() => {
            router.push('/');
        }, 1000);
        
    } catch (error) {
        console.error('Error leaving band:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to leave band',
            life: 3000
        });
    } finally {
        leavingBand.value = false;
    }
};

const leaveBand = async () => {
    leavingBand.value = true;
    try {
        await checkLeaderStatusAndLeave();
    } finally {
        leavingBand.value = false;
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
    color: var(--theme-main-text);
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}

.header h1 {
    color: var(--theme-main-text);
    margin-bottom: 0.5rem;
}

.header p {
    color: var(--theme-secondary-text);
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

.band-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: var(--theme-main-text);
}

.detail-item p {
    margin: 0.5rem 0 0;
    line-height: 1.5;
    color: var(--theme-secondary-text);
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