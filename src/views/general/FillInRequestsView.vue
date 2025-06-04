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
                           v-tooltip.top="{ value: slotProps.data.fillInDescription, showDelay: 300, hideDelay: 0 }"
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
                        <div v-if="slotProps.data.status === 'pending'">
                            <Button 
                                label="Offer to Fill In"
                                icon="pi pi-user-plus"
                                size="small"
                                @click="handleOfferToFillIn(slotProps.data)"
                                :disabled="slotProps.data.fillInMemberId === mockCurrentUser.id" /> 
                                <small v-if="slotProps.data.fillInMemberId === mockCurrentUser.id" class="text-muted-color">This is your request</small>
                        </div>
                        <div v-else-if="slotProps.data.status === 'accepted'">
                            <span>Filled by: <strong>{{ slotProps.data.acceptedByUserName }}</strong></span>
                        </div>
                        <div v-else-if="slotProps.data.status === 'rejected'">
                            <Tag value="REJECTED" severity="danger" />
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

// --- Mock Current User (simulating logged-in user from App.vue or auth store) ---
const mockCurrentUser = ref({ id: 'user5', name: 'Edward Scissorhands' }); // Per permissions, any signed-in user can accept

// --- Data Interfaces (aligned with core_db_structure.sql) ---
interface User { // From user table
  id: string; // Corresponds to user_id
  name: string; // Concatenation of first_name, last_name
}

interface Band { // From band table
  id: string; // Corresponds to band_id
  name: string;
  genre: string;
}

interface Event { // From event table
  id: string; // Corresponds to event_id
  bandId: string; // Assumed, though not directly in fill_in_request, but needed for context
  name: string; // Corresponds to event_title
  date: string; // Corresponds to datetime
  venue: string; // Corresponds to location
}

interface FillInRequest { // From fill_in_request table
  id: string; // Corresponds to fill_in_request_id
  bandId: string;
  eventId: string;
  instrumentNeeded: string; // Not directly in fill_in_request table, but essential info. Assume it's part of description or a related lookup. For simplicity, keeping it.
  fillInDescription: string; // Corresponds to fill_in_description
  fillInMemberId: string; // Corresponds to fill_in_member_id (original member)
  timeCreated: string; // Corresponds to time_created (ISO string)
  status: 'pending' | 'accepted' | 'rejected';
  acceptedByUserId?: string | null; // Corresponds to accepted_by_user_id
  timeResponded?: string | null; // Corresponds to time_responded (ISO string)
}

// --- Mock Data ---
const mockUsers = ref<User[]>([
  { id: 'user1', name: 'Alice Wonderland' },
  { id: 'user2', name: 'Bob The Builder' },
  { id: 'user3', name: 'Charlie Chaplin' },
  { id: 'user4', name: 'Diana Prince' },
  { id: 'user5', name: 'Edward Scissorhands' }, // Current mock user
  { id: 'leader1', name: 'Captain Kirk' }, 
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
    instrumentNeeded: 'Drums', // Keeping for UI, though not in DB table directly
    fillInDescription: 'Our drummer spontaneously decided to join a silent retreat. Need a solid rock drummer for our upcoming festival slot. Originals and some classic rock covers.',
    fillInMemberId: 'user1', // Alice was the original drummer
    timeCreated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'req2',
    bandId: 'band2',
    eventId: 'event2',
    instrumentNeeded: 'Upright Bass',
    fillInDescription: 'Seeking a skilled upright bass player for a sophisticated jazz evening. Must be able_to read charts and improvise.',
    fillInMemberId: 'user2', // Bob
    timeCreated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'accepted',
    acceptedByUserId: 'user4', // Diana filled this
    timeResponded: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req3',
    bandId: 'band1',
    eventId: 'event3',
    instrumentNeeded: 'Keyboard (Synth)',
    fillInDescription: 'Keyboardist needed for a retro 80s night. Think Depeche Mode, New Order. Must have own vintage synth sounds or good emulations.',
    fillInMemberId: 'user3', // Charlie
    timeCreated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
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

const getStatusSeverity = (status: FillInRequest['status']) => {
  switch (status) {
    case 'pending': return 'success'; // 'pending' is the new 'open'
    case 'accepted': return 'secondary'; // 'accepted' is the new 'filled'
    case 'rejected': return 'danger';
    default: return 'info';
  }
};

// --- Actions ---
const handleOfferToFillIn = (request: FillInRequest) => {
  // Permission: "All users ROLE (except anon) can: Accept any pending fill in requests"
  // This component view should ideally only be shown to signed-in users.
  // The button is disabled if the current user is the original member.
  
  const offeringUserId = mockCurrentUser.value.id; 
  
  if (request.status !== 'pending' || request.fillInMemberId === offeringUserId) {
    console.warn('Cannot offer for this request or already handled.');
    // Optionally, show a toast message to the user
    return;
  }

  console.log(`User ${getUserName(offeringUserId)} offered to fill in for request ID: ${request.id}`);
  const reqIndex = fillInRequests.value.findIndex(r => r.id === request.id);
  if (reqIndex > -1) {
    fillInRequests.value[reqIndex].status = 'accepted';
    fillInRequests.value[reqIndex].acceptedByUserId = offeringUserId;
    fillInRequests.value[reqIndex].timeResponded = new Date().toISOString();
    // In a real app, you might want to show a success message (e.g., PrimeVue Toast)
    // alert('Your offer has been submitted! The band leader will be notified.'); 
    // The SQL implies the band leader creates the request, any user can accept.
  }
};

const viewBandDetails = (bandId: string) => {
  console.log('View band details for:', bandId);
  // router.push(`/browse/bands/${bandId}`);
};

const viewEventDetails = (eventId: string) => {
  console.log('View event details for:', eventId);
};

// Computed property for display, joining request data with names
const displayRequests = computed(() => {
  return fillInRequests.value.map(req => {
    const event = getEventDetails(req.eventId);
    return {
      ...req, // Spread the original request object
      bandName: getBandName(req.bandId),
      eventName: event ? event.name : 'Unknown Event',
      eventDate: event ? formatDate(event.date) : 'N/A',
      eventVenue: event ? event.venue : 'N/A',
      originalMemberName: getUserName(req.fillInMemberId), // Use fillInMemberId
      acceptedByUserName: req.status === 'accepted' ? getUserName(req.acceptedByUserId) : undefined,
      postedDateFormatted: formatDate(req.timeCreated) // Use timeCreated
    };
  });
});

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