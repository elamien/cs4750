<template>
    <div class="fill-in-requests-view">
        <div class="header">
            <h1>Fill-In Opportunities</h1>
            <p>Browse and offer to fill in for gigs needing musicians.</p>
        </div>

        <div class="requests-table-container">
            <DataTable 
                :value="displayRequests"
                responsiveLayout="scroll"
                paginator 
                :rows="10"
                :rowsPerPageOptions="[5, 10, 20]"
                v-if="displayRequests.length > 0"
                sortMode="multiple"
                removableSort
                class="p-datatable-hoverable-rows p-datatable-striped requests-datatable"
            >
                <template #header>
                    <div class="table-header">
                        <span>All Available Requests</span>
                        <!-- Add filtering options here later if needed -->
                    </div>
                </template>

                <Column field="bandName" header="Band" sortable style="width: 15%; min-width: 120px;">
                    <template #body="slotProps">
                        <Button :label="slotProps.data.bandName" link @click="viewBandDetails(slotProps.data.bandId)" class="p-button-link truncate-text" :title="slotProps.data.bandName" />
                    </template>
                </Column>

                <Column field="eventName" header="Event" sortable style="width: 22%; min-width: 180px;">
                    <template #body="slotProps">
                        <div>
                            <Button :label="slotProps.data.eventName" link @click="viewEventDetails(slotProps.data.eventId)" class="p-button-link event-name truncate-text" :title="slotProps.data.eventName"/>
                            <div class="event-sub-details">
                                <span><i class="pi pi-calendar-clock"></i> {{ slotProps.data.eventDate }}</span>
                                <span><i class="pi pi-map-marker"></i> {{ slotProps.data.eventVenue }}</span>
                            </div>
                        </div>
                    </template>
                </Column>

                <Column field="instrumentNeeded" header="Instrument" sortable style="width: 10%; min-width: 80px;"/>
                
                <Column field="originalMemberName" header="Original Member" sortable style="width: 12%; min-width: 110px;" />

                <Column header="Desc." style="width: 5%; min-width: 50px; text-align: center;"> 
                    <template #body="slotProps">
                        <i class="pi pi-info-circle description-tooltip-icon" 
                           v-tooltip.top="{ value: slotProps.data.description, showDelay: 300, hideDelay: 0 }"
                           tabindex="0" 
                        />
                    </template>
                </Column>
                
                <Column field="postedDateFormatted" header="Posted On" sortable style="width: 10%; min-width: 90px;"/>

                <Column field="status" header="Status" sortable style="width: 8%; min-width: 70px; text-align: center;">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.status.toUpperCase()" :severity="getStatusSeverity(slotProps.data.status)" />
                    </template>
                </Column>

                <Column header="Action" style="width: 18%; min-width: 150px; text-align: center;">
                    <template #body="slotProps">
                        <div v-if="slotProps.data.status === 'open'">
                            <Button 
                                label="Offer to Fill In"
                                icon="pi pi-user-plus"
                                size="small"
                                @click="handleOfferToFillIn(slotProps.data)"
                                :disabled="slotProps.data.originalMemberId === 'user5'" /> <!-- Mock: Disable if current user (user5) is original -->
                                <small v-if="slotProps.data.originalMemberId === 'user5'" class="text-muted-color">This is your request</small>
                        </div>
                        <div v-else>
                            <span>Filled by: <strong>{{ slotProps.data.filledByUserName }}</strong></span>
                        </div>
                    </template>
                </Column>

                <template #empty>
                    <div class="empty-state-dt">
                        <i class="pi pi-inbox" style="font-size: 2rem"></i>
                        <p>No fill-in requests match your criteria or none are currently available.</p>
                    </div>
                </template>
            </DataTable>
            
            <div v-else class="empty-state-full-page">
                <i class="pi pi-megaphone" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
                <h3>No Fill-In Requests Available</h3>
                <p>It seems there are no open fill-in requests at the moment. Check back soon!</p>
                <Button label="Browse Bands" icon="pi pi-users" @click="router.push('/browse/bands')" severity="secondary"/>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- Mock Data ---
interface User {
  id: string;
  name: string;
}

interface Band {
  id: string;
  name: string;
  genre: string;
}

interface Event {
  id: string;
  bandId: string;
  name: string;
  date: string; // ISO string
  venue: string;
}

interface FillInRequest {
  id: string;
  bandId: string;
  eventId: string;
  instrumentNeeded: string;
  description: string;
  originalMemberId: string; // Member needing to be filled in for
  datePosted: string; // ISO string
  status: 'open' | 'filled';
  filledByMemberId?: string | null; // ID of the member who filled the request
  // requestedByMemberId: string; // Band leader/member who created it - useful for context if needed later
}

const mockUsers = ref<User[]>([
  { id: 'user1', name: 'Alice Wonderland' },
  { id: 'user2', name: 'Bob The Builder' },
  { id: 'user3', name: 'Charlie Chaplin' },
  { id: 'user4', name: 'Diana Prince' },
  { id: 'user5', name: 'Edward Scissorhands' },
  { id: 'leader1', name: 'Captain Kirk' }, // A band leader
]);

const mockBands = ref<Band[]>([
  { id: 'band1', name: 'The Cosmic Keys', genre: 'Psychedelic Rock' },
  { id: 'band2', name: 'Blue Note Trio', genre: 'Jazz Fusion' },
  { id: 'band3', name: 'Country Road', genre: 'Modern Country' },
]);

const mockEvents = ref<Event[]>([
  { id: 'event1', bandId: 'band1', name: 'Galaxy Grooves Fest', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), venue: 'The Starship Club' },
  { id: 'event2', bandId: 'band2', name: 'Smooth Jazz Night', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), venue: 'The Velvet Lounge' },
  { id: 'event3', bandId: 'band1', name: 'Retro Rewind', date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), venue: '8-Bit Bar' },
]);

const fillInRequests = ref<FillInRequest[]>([
  {
    id: 'req1',
    bandId: 'band1',
    eventId: 'event1',
    instrumentNeeded: 'Drums',
    description: 'Our drummer spontaneously decided to join a silent retreat. Need a solid rock drummer for our upcoming festival slot. Originals and some classic rock covers.',
    originalMemberId: 'user1', // Alice was the original drummer
    datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
  },
  {
    id: 'req2',
    bandId: 'band2',
    eventId: 'event2',
    instrumentNeeded: 'Upright Bass',
    description: 'Seeking a skilled upright bass player for a sophisticated jazz evening. Must be able_to read charts and improvise.',
    originalMemberId: 'user2', // Bob
    datePosted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'filled',
    filledByMemberId: 'user4', // Diana filled this
  },
  {
    id: 'req3',
    bandId: 'band1',
    eventId: 'event3',
    instrumentNeeded: 'Keyboard (Synth)',
    description: 'Keyboardist needed for a retro 80s night. Think Depeche Mode, New Order. Must have own vintage synth sounds or good emulations.',
    originalMemberId: 'user3', // Charlie
    datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
  },
]);

// --- Helper Functions ---
const getUserName = (userId?: string | null): string => {
  if (!userId) return 'N/A';
  const user = mockUsers.value.find(u => u.id === userId);
  return user ? user.name : 'Unknown User';
};

const getBandName = (bandId: string): string => {
  const band = mockBands.value.find(b => b.id === bandId);
  return band ? band.name : 'Unknown Band';
};

const getEventDetails = (eventId: string): Event | undefined => {
  return mockEvents.value.find(e => e.id === eventId);
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const getStatusSeverity = (status: 'open' | 'filled') => {
  return status === 'open' ? 'success' : 'secondary';
};

// --- Actions ---
const handleOfferToFillIn = (request: FillInRequest) => {
  // In a real app, this would involve checking user eligibility,
  // current role, if they are already in the band, etc.
  // Then, an API call would be made.
  // For mock purposes, let's assume 'user5' (Edward) is offering.
  const offeringUserId = 'user5'; 
  
  // Prevent offering if already filled or if the user is the original member
  if (request.status === 'filled' || request.originalMemberId === offeringUserId) {
    console.warn('Cannot offer for this request.');
    // Optionally, show a toast message to the user
    return;
  }

  console.log(`User ${getUserName(offeringUserId)} offered to fill in for request ID: ${request.id}`);
  const reqIndex = fillInRequests.value.findIndex(r => r.id === request.id);
  if (reqIndex > -1) {
    fillInRequests.value[reqIndex].status = 'filled';
    fillInRequests.value[reqIndex].filledByMemberId = offeringUserId;
    // In a real app, you might want to show a success message (e.g., PrimeVue Toast)
    // alert('Your offer has been submitted! The band leader will be notified.');
  }
};

const viewBandDetails = (bandId: string) => {
  // For now, just log. In a real app, this could navigate to a band profile page.
  console.log('View band details for:', bandId);
  // Example navigation: router.push(`/browse/bands/${bandId}`);
};

const viewEventDetails = (eventId: string) => {
  // For now, just log. In a real app, this could navigate to an event details page.
  console.log('View event details for:', eventId);
};

// Computed property for display, joining request data with names
const displayRequests = computed(() => {
  return fillInRequests.value.map(req => {
    const event = getEventDetails(req.eventId);
    return {
      ...req,
      bandName: getBandName(req.bandId),
      eventName: event ? event.name : 'Unknown Event',
      eventDate: event ? formatDate(event.date) : 'N/A',
      eventVenue: event ? event.venue : 'N/A',
      originalMemberName: getUserName(req.originalMemberId),
      filledByUserName: req.status === 'filled' ? getUserName(req.filledByMemberId) : undefined,
      postedDateFormatted: formatDate(req.datePosted)
    };
  });
});

// Old functions below are no longer needed with the new workflow
// const getUrgencySeverity = (urgency: string) => { ... };
// const acceptRequest = (requestId: string) => { ... };
// const declineRequest = (requestId: string) => { ... };
// const contactBand = (requestId: string) => { ... };
</script>

<style scoped>
.fill-in-requests-view {
    max-width: 1200px; /* Increased from 1000px */
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

.requests-table-container {
    margin-bottom: 2rem;
}

.requests-datatable .p-datatable-header {
    border-bottom: 1px solid var(--p-surface-border);
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.2rem;
    font-weight: 600;
}

.event-sub-details {
    display: flex;
    flex-direction: column; /* Stack date and venue */
    gap: 0.25rem; /* Smaller gap */
    font-size: 0.85rem;
    color: var(--p-text-muted-color);
    margin-top: 0.3rem;
}

.event-sub-details span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.event-name {
    font-weight: 600;
}

.description-cell {
    max-width: 300px; /* Adjust as needed */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: help; /* Indicate that it's hoverable for full text */
}

.p-button-link {
    padding: 0.25rem 0.5rem;
    font-weight: normal; /* Reset PrimeVue link button weight if needed */
}

.p-button-link.event-name {
    font-weight: 600; /* Make event name specifically bold */
}

.empty-state-full-page, .empty-state-dt {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--p-text-muted-color);
}

.empty-state-full-page h3, .empty-state-dt h3 {
    margin: 1rem 0 0.5rem;
    color: var(--p-text-color);
}

.empty-state-full-page p, .empty-state-dt p {
    margin-bottom: 1.5rem;
}

/* Ensure DataTable itself has some breathing room if paginator is at bottom */
.requests-datatable {
    margin-bottom: 1rem;
}

/* Specificity for action column text */
.requests-datatable .p-column-titlelter .p-button {
    width: auto; /* Reset any potential full-width from media queries */
}

.requests-datatable td .text-muted-color {
    font-size: 0.8rem;
    display: block;
    margin-top: 0.25rem;
}

@media (max-width: 768px) {
    .fill-in-requests-view {
        padding: 1rem;
    }
    .header h1 {
        font-size: 1.8rem;
    }
    .header p {
        font-size: 1rem;
    }
    .event-sub-details {
        font-size: 0.8rem;
    }
}
</style> 