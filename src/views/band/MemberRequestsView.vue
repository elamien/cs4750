<template>
    <div class="member-requests">
        <div class="header">
            <h1>Membership Applications</h1>
            <p>Review and manage requests from musicians wanting to join your band.</p>
        </div>
        
        <div v-if="loading" class="loading-state">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
            <p>Loading membership requests...</p>
        </div>

        <div v-else-if="!bandInfo.id" class="no-band-state">
            <Card>
                <template #content>
                    <div class="empty-state">
                        <i class="pi pi-users" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
                        <h3>No Band Found</h3>
                        <p>You are not currently associated with any band. You need to be a band leader to access this page.</p>
                    </div>
                </template>
            </Card>
        </div>

        <div v-else class="requests-content">
            <!-- Band Overview -->
            <Card class="band-overview-card">
                <template #title>
                    <div class="band-title">
                        <i class="pi pi-inbox"></i>
                        Membership Requests for {{ bandInfo.name }}
                    </div>
                </template>
                <template #subtitle>{{ bandInfo.genre || 'No genre specified' }}</template>
                <template #content>
                    <div class="request-stats">
                        <div class="stat-item">
                            <Badge :value="`${pendingRequests.length}`" severity="warning" />
                            <span>Pending Requests</span>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Pending Requests -->
            <Card v-if="pendingRequests.length > 0" class="pending-requests-card">
                <template #title>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="pi pi-clock"></i>
                        Pending Applications
                    </div>
                </template>
                <template #content>
                    <div class="requests-grid">
                        <div v-for="request in pendingRequests" :key="request.id" class="request-card pending">
                            <div class="request-header">
                                <Avatar 
                                    :label="getInitials(request.firstName, request.lastName)" 
                                    size="large"
                                    shape="circle"
                                    style="background-color: var(--p-surface-500);"
                                />
                                <div class="applicant-info">
                                    <h4>{{ request.firstName }} {{ request.lastName }}</h4>
                                    <div class="applicant-details">
                                        <span v-if="request.instrument" class="instrument">
                                            <i class="pi pi-music"></i> {{ request.instrument }}
                                        </span>
                                        <span v-if="request.genre" class="genre">
                                            <i class="pi pi-tag"></i> {{ request.genre }}
                                        </span>
                                        <span class="email">
                                            <i class="pi pi-envelope"></i> {{ request.email }}
                                        </span>
                                    </div>
                                </div>
                                <Badge value="Pending" severity="warning" />
                            </div>
                            
                            <div v-if="request.message" class="request-message">
                                <strong>Message:</strong>
                                <p>"{{ request.message }}"</p>
                            </div>
                            
                            <div v-if="request.bio" class="applicant-bio">
                                <strong>Bio:</strong>
                                <p>{{ request.bio }}</p>
                            </div>
                            
                            <div class="request-meta">
                                <span class="request-date">
                                    <i class="pi pi-calendar"></i>
                                    Applied {{ formatDate(request.timeCreated) }}
                                </span>
                            </div>
                            
                            <div class="request-actions">
                                <Button 
                                    label="Approve" 
                                    icon="pi pi-check"
                                    severity="success"
                                    @click="approveRequest(request)"
                                    :loading="processingRequest === request.id"
                                />
                                <Button 
                                    label="Reject" 
                                    icon="pi pi-times"
                                    severity="danger"
                                    outlined
                                    @click="rejectRequest(request)"
                                    :loading="processingRequest === request.id"
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- No Pending Requests -->
            <Card v-else class="no-requests-card">
                <template #content>
                    <div class="empty-state">
                        <i class="pi pi-inbox" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
                        <h3>No Pending Requests</h3>
                        <p>There are currently no membership applications for your band.</p>
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
import Avatar from 'primevue/avatar';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// Data interfaces
interface BandInfo {
    id: string;
    name: string;
    genre?: string | null;
}

interface MembershipRequest {
    id: string;
    userId: string;
    status: 'pending' | 'approved' | 'rejected';
    message?: string | null;
    timeCreated: string;
    timeResponded?: string | null;
    respondedByUserId?: string | null;
    firstName: string;
    lastName: string;
    email: string;
    instrument?: string | null;
    genre?: string | null;
    bio?: string | null;
}

// Reactive data
const loading = ref(true);
const processingRequest = ref<string | null>(null);

const bandInfo = ref<BandInfo>({
    id: '',
    name: '',
    genre: null
});

const membershipRequests = ref<MembershipRequest[]>([]);

// Computed properties
const pendingRequests = computed(() => 
    membershipRequests.value.filter(request => request.status === 'pending')
);

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

// API Functions
const fetchBandInfo = async () => {
    if (!currentUserId.value) {
        console.error('User not authenticated');
        return;
    }

    try {
        // First, get the user's band information
        const response = await fetch(`/api/users/${currentUserId.value}/band-status`);
        if (!response.ok) throw new Error('Failed to fetch user band status');
        
        const bandStatus = await response.json();
        
        // Check if user has a band
        if (!bandStatus.isMemberOfBand || bandStatus.memberBands.length === 0) {
            bandInfo.value = { id: '', name: '', genre: null };
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
            genre: band.genre
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

const fetchMembershipRequests = async () => {
    if (!bandInfo.value.id) return;

    try {
        const response = await fetch(`/api/bands/${bandInfo.value.id}/membership-requests`);
        if (!response.ok) throw new Error('Failed to fetch membership requests');
        
        const requests = await response.json();
        membershipRequests.value = requests;
    } catch (error) {
        console.error('Error fetching membership requests:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load membership requests',
            life: 3000
        });
    }
};

const loadAllData = async () => {
    loading.value = true;
    try {
        await fetchBandInfo();
        if (bandInfo.value.id) {
            await fetchMembershipRequests();
        }
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        loading.value = false;
    }
};

// Actions
const approveRequest = async (request: MembershipRequest) => {
    processingRequest.value = request.id;
    
    try {
        const response = await fetch(`/api/bands/${bandInfo.value.id}/membership-requests/${request.id}/approve`, {
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
            throw new Error(error.message || 'Failed to approve request');
        }
        
        toast.add({
            severity: 'success',
            summary: 'Request Approved',
            detail: `${request.firstName} ${request.lastName} has been added to your band!`,
            life: 5000
        });
        
        // Refresh the requests list
        await fetchMembershipRequests();
        
    } catch (error) {
        console.error('Error approving request:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to approve request',
            life: 3000
        });
    } finally {
        processingRequest.value = null;
    }
};

const rejectRequest = async (request: MembershipRequest) => {
    processingRequest.value = request.id;
    
    try {
        const response = await fetch(`/api/bands/${bandInfo.value.id}/membership-requests/${request.id}/reject`, {
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
            throw new Error(error.message || 'Failed to reject request');
        }
        
        toast.add({
            severity: 'info',
            summary: 'Request Rejected',
            detail: `${request.firstName} ${request.lastName}'s application has been rejected`,
            life: 3000
        });
        
        // Refresh the requests list
        await fetchMembershipRequests();
        
    } catch (error) {
        console.error('Error rejecting request:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to reject request',
            life: 3000
        });
    } finally {
        processingRequest.value = null;
    }
};

// Utility functions
const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

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

// Lifecycle
onMounted(() => {
    loadAllData();
});
</script>

<style scoped>
.member-requests {
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
}

.loading-state, .no-band-state {
    text-align: center;
    padding: 3rem;
}

.loading-state i {
    margin-bottom: 1rem;
    color: var(--hoojams-orange);
}

.empty-state {
    text-align: center;
    padding: 2rem;
}

.empty-state i {
    margin-bottom: 1rem;
}

.empty-state h3 {
    color: var(--theme-main-text);
    margin-bottom: 0.5rem;
}

.requests-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.band-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.request-stats {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.requests-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.request-card {
    padding: 1.5rem;
    border: 1px solid var(--p-surface-border);
    border-radius: 8px;
    background: var(--p-surface-0);
}

.request-card.pending {
    border-left: 4px solid var(--p-orange-500);
}

.request-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.applicant-info {
    flex: 1;
}

.applicant-info h4 {
    margin: 0 0 0.5rem;
    color: var(--theme-main-text);
}

.applicant-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.instrument, .genre, .email {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.9rem;
    color: var(--theme-secondary-text);
}

.request-message, .applicant-bio {
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--p-surface-50);
    border-radius: 4px;
}

.request-message strong, .applicant-bio strong {
    color: var(--theme-main-text);
}

.request-message p, .applicant-bio p {
    margin: 0.5rem 0 0;
    font-style: italic;
    color: var(--theme-secondary-text);
}

.request-meta {
    margin-bottom: 1rem;
}

.request-date {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.9rem;
    color: var(--theme-secondary-text);
}

.request-actions {
    display: flex;
    gap: 1rem;
}

@media (max-width: 768px) {
    .member-requests {
        padding: 1rem;
    }
    
    .request-stats {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .request-actions {
        flex-direction: column;
    }
}
</style> 