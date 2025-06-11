<template>
    <Card class="fill-in-requests-section glass-card">
        <template #title>
            <div class="fill-in-requests-header-row">
                <div class="fill-in-requests-header">Fill-In Requests</div>
                <button class="fill-in-requests-header request-button" @click="$emit('createFillInRequest')">
                    <i class="pi pi-plus"></i>
                    Request Fill-In
                </button>
            </div>
        </template>
        <template #content>
            <div v-if="loading" class="loading-state">
                <i class="pi pi-spinner pi-spin"></i>
                <p>Loading fill-in requests...</p>
            </div>

            <div v-else-if="fillInRequests.length === 0" class="empty-state">
                <div class="empty-content">
                    <i class="pi pi-calendar-times"></i>
                    <p>Your band hasn't posted any fill-in requests yet.</p>
                    <Button
                        label="Create Fill-In Request"
                        icon="pi pi-plus"
                        @click="$emit('createFillInRequest')"
                        severity="primary"
                        size="small"
                    />
                </div>
            </div>

                        <div v-else class="requests-list">
                <div v-for="request in displayRequests" :key="request.id" class="request-item glass-item">
                    <div class="event-header">
                        <h4>{{ request.eventName }}</h4>
                        <small>{{ formatEventDate(request.eventDate) }} • {{ request.eventVenue }}</small>
                    </div>

                    <div class="swap-display">
                        <div class="missing-person">
                            {{ request.originalMemberName }}
                        </div>
                        <div class="swap-icon">
                            <i class="pi pi-arrow-right-arrow-left"></i>
                        </div>
                        <div class="replacement-person">
                            <span v-if="request.status === 'accepted'" class="filled-by">
                                {{ request.acceptedByUserName }}
                            </span>
                            <span v-else class="pending-status">
                                Pending
                            </span>
                        </div>
                    </div>
                </div>

                <div v-if="fillInRequests.length >= 3" class="view-all-container">
                    <Button
                        label="View All Requests"
                        icon="pi pi-external-link"
                        @click="router.push('/fill-in-requests')"
                        severity="secondary"
                        outlined
                        size="small"
                    />
                </div>
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

interface FillInRequest {
    id: string;
    bandId: string;
    eventId: string;
    eventName: string;
    eventDate: string;
    eventVenue: string;
    slotNumber: number;
    fillInDescription: string;
    fillInMemberId: string;
    originalMemberName: string;
    status: 'pending' | 'accepted' | 'rejected';
    acceptedByUserId?: string | null;
    acceptedByUserName?: string | null;
    timeCreated: string;
    timeResponded?: string | null;
}

interface BandUser {
    id: string;
    firstName: string;
    lastName: string;
    instrument?: string | null;
    role?: string;
}

const props = defineProps<{
    bandId: string;
    bandMembers?: BandUser[];
}>();

defineEmits<{
    createFillInRequest: [];
}>();

// State
const loading = ref(true);
const fillInRequests = ref<FillInRequest[]>([]);

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

// Check if current user is a band leader
const isCurrentUserLeader = computed(() => {
    if (!currentUserId || !props.bandMembers) return false;
    return props.bandMembers.some(member =>
        member.id === currentUserId && member.role === 'Band Leader'
    );
});

// Computed
const displayRequests = computed(() => {
    // Show only first 3 requests on dashboard
    return fillInRequests.value.slice(0, 3);
});

// Helper functions
const formatEventDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// API functions
const fetchFillInRequests = async () => {
    if (!props.bandId) return;

    loading.value = true;
    try {
        const response = await fetch(`/api/fill-in-requests`);
        if (!response.ok) throw new Error('Failed to fetch fill-in requests');

        const allRequests = await response.json();
        // Filter to only show requests from this band
        fillInRequests.value = allRequests.filter((request: FillInRequest) =>
            request.bandId === props.bandId
        );
    } catch (error) {
        console.error('Error fetching fill-in requests:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load fill-in requests',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

// Lifecycle
onMounted(() => {
    if (props.bandId) {
        fetchFillInRequests();
    }
});

// Watch for band ID changes
watch(() => props.bandId, (newBandId) => {
    if (newBandId) {
        fetchFillInRequests();
    }
}, { immediate: true });
</script>

<style scoped>
.fill-in-requests-section {
    margin-bottom: 2rem;
}

div.p-card.p-component.fill-in-requests-section.glass-card {
    padding: 0;
}

.loading-state, .empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--p-text-muted-color);
}

.loading-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--p-primary-color);
}

.empty-content i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--p-text-muted-color);
}

.empty-content h4 {
    margin-bottom: 0.5rem;
    color: var(--p-text-color);
}

.empty-content p {
    margin-bottom: 1.5rem;
}

.requests-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.request-item {
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--p-border-color);
}

.event-header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--p-border-color);
}

.event-header h4 {
    margin: 0 0 0.25rem 0;
    color: var(--p-text-color);
}

.event-header small {
    color: var(--p-text-muted-color);
}

.swap-display {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.missing-person, .replacement-person {
    flex: 1;
    font-weight: 500;
}

.missing-person {
    color: var(--p-text-color);
    text-align: left;
}

.swap-icon {
    color: var(--p-text-muted-color);
    font-size: 1.2rem;
}

.replacement-person {
    text-align: right;
}

.filled-by {
    color: var(--p-green-600);
    font-weight: 600;
}

.pending-status {
    color: var(--p-orange-500);
    font-style: italic;
}

.view-all-container {
    text-align: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--p-border-color);
}

@media (max-width: 768px) {
    .request-header {
        flex-direction: column;
        gap: 1rem;
    }

    .request-details {
        grid-template-columns: 1fr;
    }

    .event-details {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>
