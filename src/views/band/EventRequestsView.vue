<template>
    <div class="event-requests">
        <div class="header">
            <h1>Event Invitations</h1>
            <p>Review invitations from event organizers for your band to play.</p>
        </div>
        
        <div v-if="loading" class="loading-state">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
            <p>Loading invitations...</p>
        </div>

        <div v-else-if="!bandInfo.id" class="no-band-state">
            <Card>
                <template #content>
                    <div class="empty-state">
                        <i class="pi pi-calendar" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
                        <h3>No Band Found</h3>
                        <p>You need to be a band leader to view event invitations.</p>
                    </div>
                </template>
            </Card>
        </div>

        <div v-else>
            <!-- Pending Invitations -->
            <Card v-if="pendingInvitations.length > 0" class="invitations-card">
                <template #title>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="pi pi-clock"></i>
                        Pending Invitations
                    </div>
                </template>
                <template #content>
                    <div class="invitations-grid">
                        <div v-for="invitation in pendingInvitations" :key="invitation.id" class="invitation-card pending">
                            <div class="invitation-header">
                                <div class="event-info">
                                    <h4>{{ invitation.eventTitle }}</h4>
                                    <div class="event-details">
                                        <span class="event-date">
                                            <i class="pi pi-calendar"></i>
                                            {{ formatDate(invitation.eventDateTime) }}
                                        </span>
                                        <span class="event-location">
                                            <i class="pi pi-map-marker"></i>
                                            {{ invitation.eventLocation || 'Location TBD' }}
                                        </span>
                                        <span v-if="invitation.eventGenre" class="event-genre">
                                            <i class="pi pi-tag"></i>
                                            {{ invitation.eventGenre }}
                                        </span>
                                    </div>
                                </div>
                                <Badge value="Pending" severity="warning" />
                            </div>
                            
                            <div v-if="invitation.eventDescription" class="event-description">
                                <strong>Event Description:</strong>
                                <p>{{ invitation.eventDescription }}</p>
                            </div>
                            
                            <div v-if="invitation.message" class="invitation-message">
                                <strong>Invitation Message:</strong>
                                <p>"{{ invitation.message }}"</p>
                            </div>
                            
                            <div class="invitation-meta">
                                <span class="invitation-date">
                                    <i class="pi pi-envelope"></i>
                                    Invited {{ formatDate(invitation.timeCreated) }}
                                </span>
                                <span class="organizer-info">
                                    <i class="pi pi-user"></i>
                                    By {{ invitation.organizerName }}
                                </span>
                            </div>
                            
                            <div class="invitation-actions">
                                <Button 
                                    label="Accept" 
                                    icon="pi pi-check"
                                    severity="success"
                                    @click="acceptInvitation(invitation)"
                                    :loading="processingInvitation === invitation.id"
                                />
                                <Button 
                                    label="Decline" 
                                    icon="pi pi-times"
                                    severity="danger"
                                    outlined
                                    @click="declineInvitation(invitation)"
                                    :loading="processingInvitation === invitation.id"
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- No Pending Invitations -->
            <Card v-else class="no-invitations-card">
                <template #content>
                    <div class="empty-state">
                        <i class="pi pi-calendar" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
                        <h3>No Pending Invitations</h3>
                        <p>Event organizers haven't invited your band to any events yet.</p>
                        <p>Keep promoting your band and check back later!</p>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// Data interfaces
interface BandInfo {
    id: string;
    name: string;
    genre?: string | null;
}

interface EventInvitation {
    id: string;
    eventId: string;
    bandId: string;
    status: 'pending' | 'approved' | 'rejected';
    message?: string | null;
    timeCreated: string;
    timeResponded?: string | null;
    organizerName: string;
    eventTitle: string;
    eventDateTime: string;
    eventLocation?: string | null;
    eventGenre?: string | null;
    eventDescription?: string | null;
}

// Reactive data
const loading = ref(true);
const processingInvitation = ref<string | null>(null);

const bandInfo = ref<BandInfo>({
    id: '',
    name: '',
    genre: null
});

const eventInvitations = ref<EventInvitation[]>([]);

// Computed properties
const pendingInvitations = computed(() => 
    eventInvitations.value.filter(invitation => invitation.status === 'pending')
);

// Get current user ID from localStorage
const getCurrentUserId = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            return user.userId;
        } catch (error) {
            console.error('Error parsing saved user:', error);
            return null;
        }
    }
    return null;
};

const currentUserId = ref(getCurrentUserId());

// API functions
const fetchBandInfo = async () => {
    try {
        if (!currentUserId.value) {
            console.error('No current user ID available');
            return;
        }

        // Get user's band info (reuse existing pattern from other views)
        const response = await fetch(`http://localhost:3001/api/users/${currentUserId.value}/band-status`);
        if (!response.ok) throw new Error('Failed to fetch band status');
        
        const status = await response.json();
        if (status.memberBands && status.memberBands.length > 0) {
            const userBand = status.memberBands[0]; // Get first band
            bandInfo.value = {
                id: userBand.id,
                name: userBand.name,
                genre: userBand.genre
            };
        }
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

const fetchEventInvitations = async () => {
    try {
        if (!bandInfo.value.id) return;

        // This would need a new backend endpoint
        const response = await fetch(`http://localhost:3001/api/bands/${bandInfo.value.id}/event-invitations`);
        if (!response.ok) throw new Error('Failed to fetch event invitations');
        
        const invitations: EventInvitation[] = await response.json();
        eventInvitations.value = invitations.map((invitation: EventInvitation) => ({
            ...invitation,
            id: String(invitation.id),
            eventId: String(invitation.eventId),
            bandId: String(invitation.bandId)
        }));
    } catch (error) {
        console.error('Error fetching event invitations:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load event invitations',
            life: 3000
        });
    }
};

const acceptInvitation = async (invitation: EventInvitation) => {
    processingInvitation.value = invitation.id;
    
    try {
        const response = await fetch(`http://localhost:3001/api/bands/${bandInfo.value.id}/event-invitations/${invitation.id}/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUserId.value
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to accept invitation');
        }
        
        toast.add({
            severity: 'success',
            summary: 'Invitation Accepted',
            detail: `Your band will play at "${invitation.eventTitle}"!`,
            life: 5000
        });
        
        // Refresh the invitations list
        await fetchEventInvitations();
        
    } catch (error) {
        console.error('Error accepting invitation:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to accept invitation',
            life: 3000
        });
    } finally {
        processingInvitation.value = null;
    }
};

const declineInvitation = async (invitation: EventInvitation) => {
    processingInvitation.value = invitation.id;
    
    try {
        const response = await fetch(`http://localhost:3001/api/bands/${bandInfo.value.id}/event-invitations/${invitation.id}/decline`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUserId.value
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to decline invitation');
        }
        
        toast.add({
            severity: 'info',
            summary: 'Invitation Declined',
            detail: `You declined the invitation for "${invitation.eventTitle}"`,
            life: 3000
        });
        
        // Refresh the invitations list
        await fetchEventInvitations();
        
    } catch (error) {
        console.error('Error declining invitation:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to decline invitation',
            life: 3000
        });
    } finally {
        processingInvitation.value = null;
    }
};

// Utility functions
const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};

// Load all data
const loadAllData = async () => {
    loading.value = true;
    try {
        await fetchBandInfo();
        if (bandInfo.value.id) {
            await fetchEventInvitations();
        }
    } finally {
        loading.value = false;
    }
};

// Lifecycle
onMounted(() => {
    loadAllData();
});
</script>

<style scoped>
.event-requests {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}

.loading-state {
    text-align: center;
    padding: 3rem;
}

.loading-state i {
    margin-bottom: 1rem;
}

.empty-state {
    text-align: center;
    padding: 3rem;
}

.empty-state h3 {
    margin: 1rem 0 0.5rem 0;
    color: var(--p-text-color);
}

.empty-state p {
    color: var(--p-text-muted-color);
    margin: 0.5rem 0;
}

.invitations-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.invitation-card {
    border: 1px solid var(--p-surface-border);
    border-radius: 8px;
    padding: 1.5rem;
    background: var(--p-surface-ground);
}

.invitation-card.pending {
    border-left: 4px solid var(--p-amber-500);
}

.invitation-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.event-info h4 {
    margin: 0 0 0.5rem 0;
    color: var(--p-text-color);
    font-size: 1.2rem;
}

.event-details {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.9rem;
    color: var(--p-text-muted-color);
}

.event-details span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.event-description,
.invitation-message {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--p-surface-50);
    border-radius: 6px;
    border-left: 3px solid var(--p-primary-500);
}

.event-description strong,
.invitation-message strong {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--p-text-color);
}

.event-description p,
.invitation-message p {
    margin: 0;
    color: var(--p-text-muted-color);
    line-height: 1.5;
}

.invitation-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 1rem 0;
    font-size: 0.9rem;
    color: var(--p-text-muted-color);
}

.invitation-meta span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.invitation-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
}

@media (max-width: 768px) {
    .event-requests {
        padding: 1rem;
    }
    
    .invitation-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .event-details {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .invitation-meta {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .invitation-actions {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .invitation-actions .p-button {
        width: 100%;
    }
}
</style> 