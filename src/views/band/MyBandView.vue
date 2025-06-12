<template>
    <div class="my-band-view">
        <BandHeader
            :band-info="bandInfo"
            @leave-band="handleLeaveBand"
            @post-fill-in-request="handlePostFillInRequest"
            @band-updated="handleBandUpdated"
        />

        <div class="band-content">
            <div class="band-sections">
                <BandUpcomingEvents
                    class="events-section"
                    :upcoming-events="upcomingEvents"
                    @set-availability="setAvailability"
                />

                <BandMembers
                    class="members-section"
                    :members="bandInfo.members"
                    @members-updated="handleMembersUpdated"
                />

                <BandMemberRequests
                    class="member-requests-section"
                    :band-id="bandInfo.id"
                    @requests-updated="handleRequestsUpdated"
                />

                <BandFillInRequests
                    class="fill-in-requests-section"
                    :band-id="bandInfo.id"
                    :band-members="bandInfo.members"
                    @create-fill-in-request="handlePostFillInRequest"
                />
            </div>
        </div>

        <!-- Leader Promotion Dialog -->
        <LeaderPromotionDialog
            :visible="showPromoteLeaderDialog"
            :eligible-leaders="eligibleLeaders"
            :selected-new-leader="selectedNewLeader"
            :promoting-leader="promotingLeader"
            @update:visible="showPromoteLeaderDialog = $event"
            @update:selected-new-leader="selectedNewLeader = $event"
            @cancel="showPromoteLeaderDialog = false"
            @force-leave="forceLeave"
            @promote-and-leave="promoteAndLeave"
        />

        <!-- Leave Band Dialog -->
        <LeaveBandDialog
            :visible="showLeaveBandDialog"
            :band-name="bandInfo.name"
            :is-only-member="isOnlyMember"
            :loading="leavingBand"
            @update:visible="showLeaveBandDialog = $event"
            @cancel="showLeaveBandDialog = false"
            @confirm="confirmLeaveBand"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuth } from '@/composables/useAuth';

// Import dedicated CSS file
import '@/assets/views/my-band-view.css';

// Import decomposed components
import BandHeader from '@/components/band/BandHeader.vue';
import BandUpcomingEvents from '@/components/band/BandUpcomingEvents.vue';
import BandMembers from '@/components/band/BandMembers.vue';
import BandMemberRequests from '@/components/band/BandMemberRequests.vue';
import BandFillInRequests from '@/components/band/BandFillInRequests.vue';
import LeaderPromotionDialog from '@/components/band/LeaderPromotionDialog.vue';
import LeaveBandDialog from '@/components/band/LeaveBandDialog.vue';

// TypeScript interfaces
interface BandUser {
    id: string;
    firstName: string;
    lastName: string;
    instrument?: string | null;
    role?: string;
}

interface BandInfo {
    id: string;
    name: string;
    genre?: string | null;
    description?: string | null;
    location?: string | null;
    members: BandUser[];
}

interface BandEvent {
    id: string;
    eventTitle: string;
    datetime: string;
    location?: string | null;
    description?: string | null;
    myAvailability: boolean | null;
}

// Composables
const router = useRouter();
const toast = useToast();
const { getUserId, refreshUserFromServer } = useAuth();

// Reactive state
const bandInfo = ref<BandInfo>({
    id: '',
    name: '',
    genre: null,
    description: null,
    location: null,
    members: []
});

const upcomingEvents = ref<BandEvent[]>([]);

// Dialog states
const showPromoteLeaderDialog = ref(false);
const showLeaveBandDialog = ref(false);
const selectedNewLeader = ref<string | null>(null);

// Loading states
const promotingLeader = ref(false);
const leavingBand = ref(false);

// Computed properties
const currentUser = computed(() => {
    return { id: getUserId() || '' };
});

const isLeader = computed(() => {
    return bandInfo.value.members.some(
        member => member.id === currentUser.value.id && member.role === 'Band Leader'
    );
});

const eligibleLeaders = computed(() => {
    return bandInfo.value.members.filter(
        member => member.id !== currentUser.value.id
    );
});

const isOnlyMember = computed(() => {
    return bandInfo.value.members.length === 1;
});

// API functions
const fetchBandInfo = async () => {
    try {
        // First get user's band status to find their band ID
        const currentUserId = getUserId();
        if (!currentUserId) {
            throw new Error('User not authenticated');
        }
        console.log('MyBandView: Using currentUserId:', currentUserId);
        const statusResponse = await fetch(`/api/users/${currentUserId}/band-status`);

        if (!statusResponse.ok) {
            throw new Error('Failed to fetch user band status');
        }

        const statusData = await statusResponse.json();

        if (!statusData.memberBands || statusData.memberBands.length === 0) {
            throw new Error('User is not a member of any band');
        }

        // Get the first band (assuming single band per user)
        const userBand = statusData.memberBands[0];
        const bandId = userBand.id;

        // Get detailed band information
        const bandResponse = await fetch(`/api/bands/${bandId}`);
        if (!bandResponse.ok) {
            throw new Error('Failed to fetch band details');
        }
        const bandData = await bandResponse.json();

        // Get band members
        const membersResponse = await fetch(`/api/bands/${bandId}/members`);
        if (!membersResponse.ok) {
            throw new Error('Failed to fetch band members');
        }
        const membersData = await membersResponse.json();

        // Combine the data
        bandInfo.value = {
            ...bandData,
            members: membersData
        };

        console.log('MyBandView: Band info loaded:', bandInfo.value);
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

const fetchUpcomingEvents = async () => {
    try {
        // First get user's band status to find their band ID
        const currentUserId = getUserId();
        if (!currentUserId) {
            throw new Error('User not authenticated');
        }
        const statusResponse = await fetch(`/api/users/${currentUserId}/band-status`);

        if (!statusResponse.ok) {
            throw new Error('Failed to fetch user band status');
        }

        const statusData = await statusResponse.json();

        if (!statusData.memberBands || statusData.memberBands.length === 0) {
            upcomingEvents.value = [];
            return;
        }

        // Get the first band (assuming single band per user)
        const userBand = statusData.memberBands[0];
        const bandId = userBand.id;

        // Get band events with user's availability
        const response = await fetch(`/api/bands/${bandId}/events?userId=${currentUserId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        upcomingEvents.value = data;
    } catch (error) {
        console.error('Error fetching events:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load upcoming events',
            life: 3000
        });
    }
};

// Event handlers
const setAvailability = async (eventId: string, availability: boolean) => {
    try {
        // First get user's band ID
        const currentUserId = getUserId();
        if (!currentUserId) {
            throw new Error('User not authenticated');
        }
        const statusResponse = await fetch(`/api/users/${currentUserId}/band-status`);

        if (!statusResponse.ok) {
            throw new Error('Failed to fetch user band status');
        }

        const statusData = await statusResponse.json();
        if (!statusData.memberBands || statusData.memberBands.length === 0) {
            throw new Error('User is not a member of any band');
        }

        const userBand = statusData.memberBands[0];
        const bandId = userBand.id;

        const response = await fetch(`/api/bands/${bandId}/events/${eventId}/availability`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUserId,
                isAvailable: availability
            })
        });

        if (!response.ok) {
            throw new Error('Failed to set availability');
        }

        // Update local state
        const eventIndex = upcomingEvents.value.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
            upcomingEvents.value[eventIndex].myAvailability = availability;
        }

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Availability updated to ${availability ? 'Available' : 'Not Available'}`,
            life: 3000
        });
    } catch (error) {
        console.error('Error setting availability:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update availability',
            life: 3000
        });
    }
};

const handleLeaveBand = () => {
    if (isLeader.value && eligibleLeaders.value.length > 0) {
        showPromoteLeaderDialog.value = true;
    } else {
        showLeaveBandDialog.value = true;
    }
};

const promoteAndLeave = async () => {
    if (!selectedNewLeader.value) return;

    promotingLeader.value = true;

    try {
        const response = await fetch('/api/bands/promote-and-leave', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                newLeaderId: selectedNewLeader.value
            })
        });

        if (!response.ok) {
            throw new Error('Failed to promote new leader');
        }

        // Refresh user data from server to update roles
        await refreshUserFromServer();

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'New leader promoted successfully. You have left the band.',
            life: 3000
        });

        router.push('/');
    } catch (error) {
        console.error('Error promoting leader:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to promote new leader',
            life: 3000
        });
    } finally {
        promotingLeader.value = false;
        showPromoteLeaderDialog.value = false;
    }
};

const forceLeave = async () => {
    leavingBand.value = true;

    try {
        // Get current user ID and band ID
        const currentUserId = getUserId();
        if (!currentUserId) {
            throw new Error('User not authenticated');
        }
        const bandId = bandInfo.value.id;

        const response = await fetch(`/api/bands/${bandId}/leave`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUserId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to leave band');
        }

        // Refresh user data from server to update roles
        await refreshUserFromServer();

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'You have left the band. The band has been disbanded.',
            life: 3000
        });

        router.push('/');
    } catch (error) {
        console.error('Error leaving band:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to leave band',
            life: 3000
        });
    } finally {
        leavingBand.value = false;
        showPromoteLeaderDialog.value = false;
    }
};

const confirmLeaveBand = async () => {
    leavingBand.value = true;

    try {
        // Get current user ID and band ID
        const currentUserId = getUserId();
        if (!currentUserId) {
            throw new Error('User not authenticated');
        }
        const bandId = bandInfo.value.id;

        const response = await fetch(`/api/bands/${bandId}/leave`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUserId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to leave band');
        }

        // Refresh user data from server to update roles
        await refreshUserFromServer();

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'You have successfully left the band.',
            life: 3000
        });

        router.push('/');
    } catch (error) {
        console.error('Error leaving band:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to leave band',
            life: 3000
        });
    } finally {
        leavingBand.value = false;
        showLeaveBandDialog.value = false;
    }
};

const handleBandUpdated = (updatedBandInfo: BandInfo) => {
    // Update the local band info state with the new band information
    bandInfo.value = {
        ...bandInfo.value,
        ...updatedBandInfo
    };
};

const handleMembersUpdated = (updatedMembers: BandUser[]) => {
    // Update the local band info state with the new members array
    bandInfo.value = {
        ...bandInfo.value,
        members: updatedMembers
    };
};

const handlePostFillInRequest = () => {
    // Navigate to the fill-in request creation page
    router.push('/my-band/create-fill-in');
};

const handleRequestsUpdated = () => {
    // When member requests are approved, we should refresh the band members list
    fetchBandInfo(); // This will reload all band data including new members
};

// Lifecycle
onMounted(() => {
    fetchBandInfo();
    fetchUpcomingEvents();
});
</script>

<!-- Styles moved to dedicated CSS file: src/assets/views/my-band-view.css -->
