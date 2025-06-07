<template>
    <Card class="member-requests-section">
        <template #title>
            <div class="requests-header">
                <span>Membership Requests</span>
                <Badge v-if="pendingRequests.length > 0" :value="pendingRequests.length" severity="warning" />
            </div>
        </template>
        <template #content>
            <div v-if="loading" class="loading-state">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Loading requests...</span>
            </div>
            
            <div v-else-if="pendingRequests.length === 0" class="no-requests-state">
                <i class="pi pi-inbox" style="font-size: 2rem; color: var(--p-text-muted-color);"></i>
                <p>No pending membership requests</p>
            </div>
            
            <div v-else class="requests-list">
                <div v-for="request in pendingRequests" :key="request.id" class="request-item">
                    <Avatar 
                        :label="getInitials(request.firstName, request.lastName)" 
                        size="large"
                        shape="circle"
                    />
                    
                    <div class="request-info">
                        <div class="applicant-name">
                            <strong>{{ request.firstName }} {{ request.lastName }}</strong>
                            <Badge value="Pending" severity="warning" />
                        </div>
                        
                        <div class="applicant-details">
                            <div v-if="request.instrument" class="detail-item">
                                <i class="pi pi-music"></i>
                                <span>{{ request.instrument }}</span>
                            </div>
                            <div class="detail-item">
                                <i class="pi pi-envelope"></i>
                                <span>{{ request.email }}</span>
                            </div>
                            <div class="detail-item">
                                <i class="pi pi-calendar"></i>
                                <span>{{ formatDate(request.timeCreated) }}</span>
                            </div>
                        </div>
                        
                        <div v-if="request.message" class="request-message">
                            <em>"{{ request.message }}"</em>
                        </div>
                    </div>
                    
                    <div class="request-actions">
                        <Button 
                            icon="pi pi-check"
                            severity="success"
                            size="small"
                            @click="approveRequest(request)"
                            :loading="processingRequest === request.id"
                            title="Approve request"
                        />
                        <Button 
                            icon="pi pi-times"
                            severity="danger"
                            outlined
                            size="small"
                            @click="rejectRequest(request)"
                            :loading="processingRequest === request.id"
                            title="Reject request"
                        />
                    </div>
                </div>
            </div>
            
            <div v-if="pendingRequests.length > 3" class="view-all-section">
                <Button 
                    label="View All Requests" 
                    icon="pi pi-external-link"
                    severity="secondary"
                    outlined
                    size="small"
                    @click="viewAllRequests"
                />
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

interface MembershipRequest {
    id: string;
    userId: string;
    status: 'pending' | 'approved' | 'rejected';
    message?: string | null;
    timeCreated: string;
    firstName: string;
    lastName: string;
    email: string;
    instrument?: string | null;
}

const props = defineProps<{
    bandId?: string;
}>();

const emit = defineEmits<{
    requestsUpdated: [];
}>();

// State
const loading = ref(true);
const processingRequest = ref<string | null>(null);
const membershipRequests = ref<MembershipRequest[]>([]);

// Computed - show only first 3 requests to keep dashboard clean
const pendingRequests = ref<MembershipRequest[]>([]);

// Get current user ID
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

const currentUserId = getCurrentUserId();

// Get current band ID
const getCurrentBandId = () => {
    // Use band ID from props, fallback to hardcoded value for development
    return props.bandId || '1';
};

// Utility functions
const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString();
    }
};

// API functions
const fetchMembershipRequests = async () => {
    if (!currentUserId) {
        console.log('BandMemberRequests: No current user ID');
        return;
    }
    
    loading.value = true;
    
    try {
        const bandId = getCurrentBandId();
        console.log('BandMemberRequests: Fetching requests for band ID:', bandId);
        console.log('BandMemberRequests: Current user ID:', currentUserId);
        
        const response = await fetch(`/api/bands/${bandId}/membership-requests`);
        
        if (!response.ok) {
            console.error('BandMemberRequests: API response not ok:', response.status, response.statusText);
            throw new Error('Failed to fetch membership requests');
        }
        
        const requests = await response.json();
        console.log('BandMemberRequests: Fetched requests:', requests);
        membershipRequests.value = requests;
        
        // Show only first 3 pending requests on dashboard
        pendingRequests.value = requests
            .filter((request: MembershipRequest) => request.status === 'pending')
            .slice(0, 3);
        
        console.log('BandMemberRequests: Pending requests:', pendingRequests.value);
            
    } catch (error) {
        console.error('Error fetching membership requests:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load membership requests',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const approveRequest = async (request: MembershipRequest) => {
    if (!currentUserId) return;
    
    processingRequest.value = request.id;
    
    try {
        const bandId = getCurrentBandId();
        const response = await fetch(`/api/bands/${bandId}/membership-requests/${request.id}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                respondedByUserId: currentUserId
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to approve request');
        }
        
        toast.add({
            severity: 'success',
            summary: 'Request Approved',
            detail: `${request.firstName} ${request.lastName} has been added to the band`,
            life: 3000
        });
        
        // Refresh requests and emit update
        await fetchMembershipRequests();
        emit('requestsUpdated');
        
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
    if (!currentUserId) return;
    
    processingRequest.value = request.id;
    
    try {
        const bandId = getCurrentBandId();
        const response = await fetch(`/api/bands/${bandId}/membership-requests/${request.id}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                respondedByUserId: currentUserId
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to reject request');
        }
        
        toast.add({
            severity: 'info',
            summary: 'Request Rejected',
            detail: `${request.firstName} ${request.lastName}'s request has been rejected`,
            life: 3000
        });
        
        // Refresh requests
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

const viewAllRequests = () => {
    router.push('/my-band/member-requests');
};

// Lifecycle
onMounted(() => {
    // Only fetch if we already have a band ID
    if (props.bandId) {
        fetchMembershipRequests();
    }
});

// Watch for band ID changes
watch(() => props.bandId, (newBandId) => {
    if (newBandId) {
        console.log('BandMemberRequests: Band ID changed to:', newBandId);
        fetchMembershipRequests();
    }
}, { immediate: true });

// Expose refresh function for parent component
defineExpose({
    refreshRequests: fetchMembershipRequests
});
</script>

<style scoped>
.member-requests-section {
    margin-bottom: 2rem;
}

.requests-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.loading-state {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
    padding: 2rem;
    color: var(--theme-secondary-text);
}

.no-requests-state {
    text-align: center;
    padding: 2rem;
    color: var(--theme-secondary-text);
}

.no-requests-state i {
    margin-bottom: 0.5rem;
    display: block;
}

.requests-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.request-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: var(--p-surface-50);
    border-radius: var(--p-border-radius);
    border: 1px solid var(--p-surface-200);
}

.request-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.applicant-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.applicant-name strong {
    color: var(--theme-main-text);
    font-size: 1rem;
}

.applicant-details {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--theme-secondary-text);
    font-size: 0.9rem;
}

.detail-item i {
    color: var(--hoojams-orange);
    font-size: 0.8rem;
}

.request-message {
    color: var(--theme-secondary-text);
    font-size: 0.9rem;
    margin-top: 0.25rem;
}

.request-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
}

.view-all-section {
    text-align: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--p-surface-200);
}

/* Compact layout for side-by-side display */
.request-item {
    align-items: center;
}

.request-info {
    gap: 0.25rem;
}

.applicant-details {
    gap: 0.5rem;
}

.detail-item {
    font-size: 0.85rem;
}

/* Responsive design */
@media (max-width: 1023px) {
    .request-item {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
    }
    
    .request-actions {
        flex-direction: row;
        justify-content: center;
    }
    
    .applicant-details {
        flex-direction: column;
        gap: 0.5rem;
    }
}
</style> 