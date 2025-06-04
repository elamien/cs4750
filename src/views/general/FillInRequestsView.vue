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
                                :disabled="slotProps.data.fillInMemberId === currentUser.id" /> 
                                <small v-if="slotProps.data.fillInMemberId === currentUser.id" class="text-muted-color">This is your request</small>
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
import { ref, computed, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { useRouter } from 'vue-router';

const router = useRouter();

// TODO: Replace with actual logged-in user from auth store or context
const currentUser = ref({ id: '2', firstName: 'Charles', lastName: 'Mingus' }); 

// --- Data Interfaces (aligned with core_db_structure.sql) ---
// Note: IDs are INT in DB but often string in APIs/frontend. Kept as string for now.
// TODO: These interfaces will be used when API calls are implemented to type responses or request bodies.
/*
interface User { // From user table
  id: string; // Corresponds to user_id INT
  firstName: string; // Corresponds to first_name VARCHAR(100)
  lastName: string; // Corresponds to last_name VARCHAR(100)
  // bio, email, phone_number, genre, instrument can be added if needed by this view
}

interface Band { // From band table
  id: string; // Corresponds to band_id INT
  name: string; // Corresponds to name VARCHAR(255)
  // genre, email, phone_number, description, etc. can be added if needed
}

interface EventDetails { // Represents event details as needed by this view (likely a DTO from API)
  id: string; // Corresponds to event_id INT
  name: string; // Corresponds to event_title VARCHAR(255)
  date: string; // Corresponds to datetime DATETIME (formatted string)
  venue: string; // Corresponds to location VARCHAR(255)
  // Other event fields like genre, description can be added
}
*/

interface FillInRequest { // From fill_in_request table
  id: string; // Corresponds to fill_in_request_id INT
  bandId: string; // Corresponds to band_id INT
  eventId: string; // Corresponds to event_id INT
  fillInDescription: string; // Corresponds to fill_in_description TEXT
  fillInMemberId: string; // Corresponds to fill_in_member_id INT (original member)
  timeCreated: string; // Corresponds to time_created TIMESTAMP (ISO string)
  status: 'pending' | 'accepted' | 'rejected'; // Corresponds to status ENUM
  acceptedByUserId?: string | null; // Corresponds to accepted_by_user_id INT
  timeResponded?: string | null; // Corresponds to time_responded TIMESTAMP (ISO string)

  // Fields to be populated by joining/API, matching displayRequests structure:
  bandName?: string;
  eventName?: string;
  eventDate?: string;
  eventVenue?: string;
  originalMemberName?: string; // e.g., "firstName lastName"
  acceptedByUserName?: string; // e.g., "firstName lastName"
  postedDateFormatted?: string;
}

// --- Data State ---
// This will be populated by an API call, e.g., in onMounted
const allFillInRequests = ref<FillInRequest[]>([]); 

// --- Helper Functions ---
// TODO: These helper functions for resolving names/details might become obsolete 
// if the API provides fully populated FillInRequest objects.

/*
const formatUserName = (user?: { firstName: string; lastName: string }): string => {
  if (!user || !user.firstName || !user.lastName) return 'Unknown User';
  return `${user.firstName} ${user.lastName}`;
};
*/

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

const API_BASE_URL = 'http://localhost:3001/api'; // Backend API URL

// Fetch all fill-in requests
const fetchFillInRequests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/fill-in-requests`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    allFillInRequests.value = data;
  } catch (error) {
    console.error('Failed to fetch fill-in requests:', error);
    // TODO: Show user-friendly error message in UI (e.g., using a toast)
  }
};

onMounted(() => {
  fetchFillInRequests();
});

// Update handleOfferToFillIn to call the API
const handleOfferToFillIn = async (request: FillInRequest) => {
  const offeringUserId = currentUser.value.id;

  if (request.status !== 'pending' || request.fillInMemberId === offeringUserId) {
    console.warn('Cannot offer for this request or already handled.');
    // TODO: Show toast message to user
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/fill-in-requests/${request.id}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: offeringUserId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result.message, result.request);

    // Update the local state with the accepted request from the server response
    const reqIndex = allFillInRequests.value.findIndex(r => r.id === result.request.id);
    if (reqIndex > -1) {
      allFillInRequests.value[reqIndex] = result.request;
    }
    // TODO: Show success toast message

  } catch (error) {
    console.error('Failed to accept fill-in request:', error);
    // TODO: Show user-friendly error message in UI (e.g., using a toast)
    // alert(`Error: ${error.message}`); // Temporary alert
  }
};

const viewBandDetails = (bandId: string) => {
  console.log('View band details for:', bandId);
  // router.push(`/browse/bands/${bandId}`);
};

const viewEventDetails = (eventId: string) => {
  console.log('View event details for:', eventId);
  // router.push(`/events/${eventId}`); // Example future route
};

// Computed property for display. 
// Assumes API will provide most of this data pre-joined or additional fetches are made.
const displayRequests = computed(() => {
  // TODO: This mapping will change significantly based on how data is fetched from the API.
  // If API returns fully formed FillInRequest objects (with bandName, eventName, etc.),
  // then this map might just format dates or names.
  // For now, it directly uses fields from the updated FillInRequest interface.
  return allFillInRequests.value.map(req => ({
    ...req,
    // Ensure these fields are provided by the API or fetched separately and added to `allFillInRequests` items
    // bandName: req.bandName || 'Unknown Band', // Example placeholder
    // eventName: req.eventName || 'Unknown Event', // Example placeholder
    // eventDate: req.eventDate ? formatDate(req.eventDate) : 'N/A', // Assuming eventDate is ISO string
    // eventVenue: req.eventVenue || 'N/A', // Example placeholder
    // originalMemberName: req.originalMemberName || 'Unknown Member', // Example placeholder
    // acceptedByUserName: req.status === 'accepted' ? (req.acceptedByUserName || 'Unknown Accepter') : undefined,
    postedDateFormatted: req.timeCreated ? formatDate(req.timeCreated) : 'N/A'
  }));
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