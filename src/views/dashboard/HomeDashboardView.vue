<template>
    <div class="home-dashboard">
        <div class="dashboard-container">
            <!-- Welcome Header -->
            <div class="welcome-header">
                <div class="welcome-text">
                    <h1>Welcome back, {{ currentUser?.firstName || 'Musician' }}!</h1>
                    <p v-if="userRole">{{ userRole }} Dashboard</p>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
                <Card>
                    <template #content>
                        <div class="loading-content">
                            <i class="pi pi-spinner pi-spin"></i>
                            <p>Loading your dashboard...</p>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Band Leader Dashboard -->
            <div v-else-if="isBandLeader()" class="dashboard-grid">
                <!-- Upcoming Events Card -->
                <Card class="dashboard-card">
                    <template #title>
                        <div class="card-header">
                            <div class="card-title">
                                <i class="pi pi-calendar"></i>
                                <span>Upcoming Events</span>
                            </div>
                            <Button
                                label="View All"
                                link
                                size="small"
                                @click="$router.push('/events?tab=my-events')"
                            />
                        </div>
                    </template>
                    <template #content>
                        <div v-if="upcomingEvents.length > 0" class="events-list">
                            <div v-for="event in upcomingEvents.slice(0, 3)" :key="event.id" class="event-item">
                                <div class="event-info">
                                    <h4>{{ event.eventTitle }}</h4>
                                    <div class="event-meta">
                                        <span><i class="pi pi-calendar"></i> {{ formatDate(event.datetime) }}</span>
                                        <span><i class="pi pi-map-marker"></i> {{ event.location }}</span>
                                    </div>
                                </div>
                                <Tag value="Playing" severity="success" />
                            </div>
                        </div>
                        <div v-else class="empty-state">
                            <i class="pi pi-calendar"></i>
                            <p>No upcoming events</p>
                        </div>
                    </template>
                </Card>

                <!-- Open Events Card -->
                <Card class="dashboard-card">
                    <template #title>
                        <div class="card-header">
                            <div class="card-title">
                                <i class="pi pi-search"></i>
                                <span>Open Events</span>
                            </div>
                            <Button
                                label="Browse All"
                                link
                                size="small"
                                @click="$router.push('/events?tab=browse')"
                            />
                        </div>
                    </template>
                    <template #content>
                        <div v-if="openEvents.length > 0" class="events-list">
                            <div v-for="event in openEvents.slice(0, 3)" :key="event.id" class="event-item">
                                <div class="event-info">
                                    <h4>{{ event.eventTitle }}</h4>
                                    <div class="event-meta">
                                        <span><i class="pi pi-calendar"></i> {{ formatDate(event.datetime) }}</span>
                                        <span><i class="pi pi-map-marker"></i> {{ event.location }}</span>
                                    </div>
                                </div>
                                <Button
                                    label="Accept"
                                    icon="pi pi-check-circle"
                                    severity="success"
                                    size="small"
                                    @click="acceptEvent(event)"
                                />
                            </div>
                        </div>
                        <div v-else class="empty-state">
                            <i class="pi pi-search"></i>
                            <p>No open events available</p>
                        </div>
                    </template>
                </Card>

                <!-- Fill-In Requests Card -->
                <Card class="dashboard-card">
                    <template #title>
                        <div class="card-header">
                            <div class="card-title">
                                <i class="pi pi-bell"></i>
                                <span>Fill-In Requests</span>
                                <Badge v-if="fillInRequests.length > 0" :value="fillInRequests.length" severity="info" />
                            </div>
                            <Button
                                label="View All"
                                link
                                size="small"
                                @click="$router.push('/fill-in-requests')"
                            />
                        </div>
                    </template>
                    <template #content>
                        <div v-if="fillInRequests.length > 0" class="requests-list">
                            <div v-for="request in fillInRequests.slice(0, 3)" :key="request.id" class="request-item">
                                <div class="request-info">
                                    <h4>{{ request.eventName }}</h4>
                                    <p>{{ request.fillInDescription }}</p>
                                    <div class="request-meta">
                                        <span><i class="pi pi-user"></i> {{ request.originalMemberName }}</span>
                                        <span><i class="pi pi-clock"></i> {{ formatDate(request.eventDate) }}</span>
                                    </div>
                                </div>
                                <Tag
                                    :value="request.status"
                                    :severity="getStatusSeverity(request.status)"
                                />
                            </div>
                        </div>
                        <div v-else class="empty-state">
                            <i class="pi pi-bell"></i>
                            <p>No fill-in requests</p>
                        </div>
                    </template>
                </Card>

                <!-- Membership Requests Card -->
                <Card class="dashboard-card">
                    <template #title>
                        <div class="card-header">
                            <div class="card-title">
                                <i class="pi pi-users"></i>
                                <span>Membership Requests</span>
                                <Badge v-if="membershipRequests.length > 0" :value="membershipRequests.length" severity="warning" />
                            </div>
                            <Button
                                label="Manage"
                                link
                                size="small"
                                @click="$router.push('/join-create-band')"
                            />
                        </div>
                    </template>
                    <template #content>
                        <div v-if="membershipRequests.length > 0" class="requests-list">
                            <div v-for="request in membershipRequests.slice(0, 3)" :key="request.id" class="request-item">
                                <div class="request-info">
                                    <h4>{{ request.firstName }} {{ request.lastName }}</h4>
                                    <p>{{ request.instrument || 'No instrument specified' }}</p>
                                    <div class="request-meta">
                                        <span><i class="pi pi-clock"></i> {{ formatTimeAgo(request.timeCreated) }}</span>
                                    </div>
                                </div>
                                <div class="request-actions">
                                    <Button
                                        icon="pi pi-check"
                                        severity="success"
                                        size="small"
                                        outlined
                                        @click="approveMembershipRequest(request)"
                                        :loading="processingRequest === request.id"
                                    />
                                    <Button
                                        icon="pi pi-times"
                                        severity="danger"
                                        size="small"
                                        outlined
                                        @click="rejectMembershipRequest(request)"
                                        :loading="processingRequest === request.id"
                                    />
                                </div>
                            </div>
                        </div>
                        <div v-else class="empty-state">
                            <i class="pi pi-users"></i>
                            <p>No membership requests</p>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Band Member Dashboard -->
            <div v-else-if="isBandMember()" class="dashboard-grid">
                <!-- Upcoming Events Card -->
                <Card class="dashboard-card">
                    <template #title>
                        <div class="card-header">
                            <div class="card-title">
                                <i class="pi pi-calendar"></i>
                                <span>Upcoming Events</span>
                            </div>
                            <Button
                                label="View All"
                                link
                                size="small"
                                @click="$router.push('/events?tab=my-events')"
                            />
                        </div>
                    </template>
                    <template #content>
                        <div v-if="upcomingEvents.length > 0" class="events-list">
                            <div v-for="event in upcomingEvents.slice(0, 3)" :key="event.id" class="event-item">
                                <div class="event-info">
                                    <h4>{{ event.eventTitle }}</h4>
                                    <div class="event-meta">
                                        <span><i class="pi pi-calendar"></i> {{ formatDate(event.datetime) }}</span>
                                        <span><i class="pi pi-map-marker"></i> {{ event.location }}</span>
                                    </div>
                                </div>
                                <Tag value="Playing" severity="success" />
                            </div>
                        </div>
                        <div v-else class="empty-state">
                            <i class="pi pi-calendar"></i>
                            <p>No upcoming events</p>
                        </div>
                    </template>
                </Card>

                <!-- Fill-In Requests Card -->
                <Card class="dashboard-card">
                    <template #title>
                        <div class="card-header">
                            <div class="card-title">
                                <i class="pi pi-bell"></i>
                                <span>Fill-In Requests</span>
                                <Badge v-if="fillInRequests.length > 0" :value="fillInRequests.length" severity="info" />
                            </div>
                            <Button
                                label="View All"
                                link
                                size="small"
                                @click="$router.push('/fill-in-requests')"
                            />
                        </div>
                    </template>
                    <template #content>
                        <div v-if="fillInRequests.length > 0" class="requests-list">
                            <div v-for="request in fillInRequests.slice(0, 3)" :key="request.id" class="request-item">
                                <div class="request-info">
                                    <h4>{{ request.eventName }}</h4>
                                    <p>{{ request.fillInDescription }}</p>
                                    <div class="request-meta">
                                        <span><i class="pi pi-user"></i> {{ request.originalMemberName }}</span>
                                        <span><i class="pi pi-clock"></i> {{ formatDate(request.eventDate) }}</span>
                                    </div>
                                </div>
                                <Tag
                                    :value="request.status"
                                    :severity="getStatusSeverity(request.status)"
                                />
                            </div>
                        </div>
                        <div v-else class="empty-state">
                            <i class="pi pi-bell"></i>
                            <p>No fill-in requests</p>
                        </div>
                    </template>
                </Card>

                <!-- Open Events Card (Read-Only) -->
                <Card class="dashboard-card">
                    <template #title>
                        <div class="card-header">
                            <div class="card-title">
                                <i class="pi pi-search"></i>
                                <span>Available Events</span>
                            </div>
                            <Button
                                label="Browse All"
                                link
                                size="small"
                                @click="$router.push('/events?tab=browse')"
                            />
                        </div>
                    </template>
                    <template #content>
                        <div v-if="openEvents.length > 0" class="events-list">
                            <div v-for="event in openEvents.slice(0, 3)" :key="event.id" class="event-item">
                                <div class="event-info">
                                    <h4>{{ event.eventTitle }}</h4>
                                    <div class="event-meta">
                                        <span><i class="pi pi-calendar"></i> {{ formatDate(event.datetime) }}</span>
                                        <span><i class="pi pi-map-marker"></i> {{ event.location }}</span>
                                    </div>
                                </div>
                                <div class="read-only-note">
                                    <small><i class="pi pi-info-circle"></i> Contact band leader to express interest</small>
                                </div>
                            </div>
                        </div>
                        <div v-else class="empty-state">
                            <i class="pi pi-search"></i>
                            <p>No open events available</p>
                        </div>
                    </template>
                </Card>

                <!-- Membership Requests Card (Read-Only) -->
                <Card class="dashboard-card">
                    <template #title>
                        <div class="card-header">
                            <div class="card-title">
                                <i class="pi pi-users"></i>
                                <span>New Member Requests</span>
                                <Badge v-if="membershipRequests.length > 0" :value="membershipRequests.length" severity="warning" />
                            </div>
                            <Button
                                label="View All"
                                link
                                size="small"
                                @click="$router.push('/join-create-band')"
                            />
                        </div>
                    </template>
                    <template #content>
                        <div v-if="membershipRequests.length > 0" class="requests-list">
                            <div v-for="request in membershipRequests.slice(0, 3)" :key="request.id" class="request-item">
                                <div class="request-info">
                                    <h4>{{ request.firstName }} {{ request.lastName }}</h4>
                                    <p>{{ request.instrument || 'No instrument specified' }}</p>
                                    <div class="request-meta">
                                        <span><i class="pi pi-clock"></i> {{ formatTimeAgo(request.timeCreated) }}</span>
                                    </div>
                                </div>
                                <div class="read-only-note">
                                    <small><i class="pi pi-info-circle"></i> Band leader will review</small>
                                </div>
                            </div>
                        </div>
                        <div v-else class="empty-state">
                            <i class="pi pi-users"></i>
                            <p>No membership requests</p>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Other User Roles (General User, etc.) -->
            <div v-else class="other-dashboard">
                <Card class="welcome-card">
                    <template #content>
                        <div class="welcome-content">
                            <div class="building-message">
                                <i class="pi pi-cog pi-spin building-icon"></i>
                                <h2>Dashboard Coming Soon</h2>
                                <p>We're working on personalized dashboards for {{ userRole || 'your role' }}. Check back soon!</p>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- Event Commitment Dialog -->
        <GigCommitmentDialog
            :visible="showCommitmentDialog"
            :event-details="selectedEvent"
            :loading="false"
            @update:visible="showCommitmentDialog = $event"
            @confirm="handleEventAccepted"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import GigCommitmentDialog from '@/components/band/GigCommitmentDialog.vue';
import { useAuth } from '@/composables/useAuth';

// Import dedicated CSS file
import '@/assets/views/home-dashboard.css';

const router = useRouter();
const toast = useToast();
const { currentUser, isAuthenticated, isBandLeader, isBandMember, isWXTJExecutive, isGeneralUser, getPrimaryRole } = useAuth();

// Types
interface DashboardEvent {
    id: string;
    eventTitle: string;
    datetime: string;
    location: string;
    status: string;
    creatorName?: string;
    bandName?: string;
}

interface FillInRequest {
    id: string;
    bandId: string;
    eventName: string;
    eventDate: string;
    fillInDescription: string;
    originalMemberName: string;
    status: 'pending' | 'accepted' | 'rejected';
}

interface MembershipRequest {
    id: string;
    firstName: string;
    lastName: string;
    instrument?: string;
    timeCreated: string;
    status: 'pending' | 'approved' | 'rejected';
}

// State
const loading = ref(true);
const upcomingEvents = ref<DashboardEvent[]>([]);
const openEvents = ref<DashboardEvent[]>([]);
const fillInRequests = ref<FillInRequest[]>([]);
const membershipRequests = ref<MembershipRequest[]>([]);
const processingRequest = ref<string | null>(null);
const showCommitmentDialog = ref(false);
const selectedEvent = ref<DashboardEvent | null>(null);

// Computed
const userRole = computed(() => {
    if (!isAuthenticated.value) return null;

    // Check roles in priority order
    if (isWXTJExecutive()) return 'WXTJ Executive';
    if (isBandLeader()) return 'Band Leader';
    if (isBandMember()) return 'Band Member';
    if (isGeneralUser()) return 'General User';

    // Fallback to primary role
    return getPrimaryRole() || 'User';
});

// API Functions
const fetchUpcomingEvents = async () => {
    try {
        if (!currentUser.value?.userId) return;

        // Get user's band first
        const statusResponse = await fetch(`/api/users/${currentUser.value.userId}/band-status`);
        if (!statusResponse.ok) return;

        const statusData = await statusResponse.json();
        if (!statusData.memberBands || statusData.memberBands.length === 0) return;

        const bandId = statusData.memberBands[0].id;

        // Get band's upcoming events
        const response = await fetch(`/api/bands/${bandId}/events?userId=${currentUser.value.userId}`);
        if (!response.ok) return;

        const events = await response.json();
        upcomingEvents.value = events.slice(0, 5); // Limit to 5 most recent
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
    }
};

const fetchOpenEvents = async () => {
    try {
        if (!currentUser.value?.userId) return;

        const response = await fetch(`/api/events?userId=${currentUser.value.userId}`);
        if (!response.ok) return;

        const events = await response.json();
        // Filter for open events only
        openEvents.value = events
            .filter((event: DashboardEvent) => event.status === 'open')
            .slice(0, 5);
    } catch (error) {
        console.error('Error fetching open events:', error);
    }
};

const fetchFillInRequests = async () => {
    try {
        if (!currentUser.value?.userId) return;

        // Get user's band first
        const statusResponse = await fetch(`/api/users/${currentUser.value.userId}/band-status`);
        if (!statusResponse.ok) return;

        const statusData = await statusResponse.json();
        if (!statusData.memberBands || statusData.memberBands.length === 0) return;

        const bandId = statusData.memberBands[0].id;

        // Get all fill-in requests and filter by band
        const response = await fetch(`/api/fill-in-requests`);
        if (!response.ok) return;

        const allRequests = await response.json();
        // Filter to only show requests from this band
        const bandRequests = allRequests.filter((request: FillInRequest) => request.bandId === bandId);

        fillInRequests.value = bandRequests.slice(0, 5);
    } catch (error) {
        console.error('Error fetching fill-in requests:', error);
    }
};

const fetchMembershipRequests = async () => {
    try {
        if (!currentUser.value?.userId) return;

        // Get user's band first
        const statusResponse = await fetch(`/api/users/${currentUser.value.userId}/band-status`);
        if (!statusResponse.ok) return;

        const statusData = await statusResponse.json();
        if (!statusData.memberBands || statusData.memberBands.length === 0) return;

        const bandId = statusData.memberBands[0].id;

        // Get band's membership requests
        const response = await fetch(`/api/bands/${bandId}/membership-requests`);
        if (!response.ok) return;

        const requests = await response.json();
        membershipRequests.value = requests
            .filter((req: MembershipRequest) => req.status === 'pending')
            .slice(0, 5);
    } catch (error) {
        console.error('Error fetching membership requests:', error);
    }
};

// Event Handlers
const acceptEvent = (event: DashboardEvent) => {
    selectedEvent.value = event;
    showCommitmentDialog.value = true;
};

const handleEventAccepted = () => {
    toast.add({
        severity: 'success',
        summary: 'Event Accepted',
        detail: 'You have successfully accepted the event!',
        life: 3000
    });
    fetchUpcomingEvents(); // Refresh upcoming events
    fetchOpenEvents(); // Refresh open events
};

const approveMembershipRequest = async (request: MembershipRequest) => {
    if (!currentUser.value?.userId) return;

    processingRequest.value = request.id;

    try {
        // Get user's band first
        const statusResponse = await fetch(`/api/users/${currentUser.value.userId}/band-status`);
        if (!statusResponse.ok) throw new Error('Failed to get band info');

        const statusData = await statusResponse.json();
        if (!statusData.memberBands || statusData.memberBands.length === 0) {
            throw new Error('No band found');
        }

        const bandId = statusData.memberBands[0].id;

        const response = await fetch(`/api/bands/${bandId}/membership-requests/${request.id}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.value.userId })
        });

        if (!response.ok) throw new Error('Failed to approve request');

        toast.add({
            severity: 'success',
            summary: 'Request Approved',
            detail: `${request.firstName} ${request.lastName} has been added to your band!`,
            life: 3000
        });

        fetchMembershipRequests(); // Refresh requests
    } catch (error) {
        console.error('Error approving request:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to approve membership request',
            life: 3000
        });
    } finally {
        processingRequest.value = null;
    }
};

const rejectMembershipRequest = async (request: MembershipRequest) => {
    if (!currentUser.value?.userId) return;

    processingRequest.value = request.id;

    try {
        // Get user's band first
        const statusResponse = await fetch(`/api/users/${currentUser.value.userId}/band-status`);
        if (!statusResponse.ok) throw new Error('Failed to get band info');

        const statusData = await statusResponse.json();
        if (!statusData.memberBands || statusData.memberBands.length === 0) {
            throw new Error('No band found');
        }

        const bandId = statusData.memberBands[0].id;

        const response = await fetch(`/api/bands/${bandId}/membership-requests/${request.id}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.value.userId })
        });

        if (!response.ok) throw new Error('Failed to reject request');

        toast.add({
            severity: 'info',
            summary: 'Request Rejected',
            detail: `${request.firstName} ${request.lastName}'s request has been rejected`,
            life: 3000
        });

        fetchMembershipRequests(); // Refresh requests
    } catch (error) {
        console.error('Error rejecting request:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to reject membership request',
            life: 3000
        });
    } finally {
        processingRequest.value = null;
    }
};

// Utility Functions
const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};

const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'N/A';
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

const getStatusSeverity = (status: string) => {
    switch (status) {
        case 'pending': return 'warning';
        case 'accepted': return 'success';
        case 'rejected': return 'danger';
        default: return 'info';
    }
};

// Lifecycle
onMounted(async () => {
    if (!isAuthenticated.value) {
        router.push('/');
        return;
    }

    loading.value = true;

    try {
        await Promise.all([
            fetchUpcomingEvents(),
            fetchOpenEvents(),
            fetchFillInRequests(),
            fetchMembershipRequests()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    } finally {
        loading.value = false;
    }
});
</script>