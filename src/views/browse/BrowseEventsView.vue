<template>
    <div class="browse-events">
        <div class="header">
            <h1>Browse Events</h1>
            <p>Find upcoming events and performances</p>
        </div>

        <div class="filters">
            <div class="filter-row">
                <div class="field">
                    <label for="genre">Genre</label>
                    <Dropdown 
                        id="genre"
                        v-model="selectedGenre" 
                        :options="genres" 
                        optionLabel="name" 
                        placeholder="All Genres"
                        class="w-full"
                    />
                </div>
                <div class="field">
                    <label for="date">Date</label>
                    <Calendar 
                        id="date"
                        v-model="selectedDate" 
                        placeholder="Select date"
                        class="w-full"
                    />
                </div>
                <div class="field">
                    <label for="search">Search</label>
                    <InputText 
                        id="search"
                        v-model="searchTerm" 
                        placeholder="Search events..."
                        class="w-full"
                    />
                </div>
            </div>
        </div>

        <div class="events-grid">
            <Card v-for="event in filteredEvents" :key="event.id" class="event-card">
                <template #title>{{ event.eventTitle }}</template>
                <template #subtitle>
                    <div class="event-meta">
                        <span><i class="pi pi-calendar"></i> {{ formatDate(event.datetime) }}</span>
                        <span><i class="pi pi-clock"></i> {{ formatTime(event.datetime) }}</span>
                        <span><i class="pi pi-map-marker"></i> {{ event.location || 'Venue TBD' }}</span>
                    </div>
                </template>
                <template #content>
                    <p>{{ event.description || 'No description provided.' }}</p>
                    <div class="event-details">
                        <div class="detail-item">
                            <strong>Genre:</strong> {{ event.genre || 'N/A' }}
                        </div>
                        <div class="detail-item status-row">
                            <div class="status-tag">
                                <strong>Status:</strong> <Tag :value="event.status.toUpperCase()" :severity="getEventStatusSeverity(event.status)" />
                        </div>
                            <Button label="View Details" icon="pi pi-eye" @click="viewEventDetails(event.id)" />
                        </div>
                    </div>
                </template>
                <template #footer>
                    <div class="event-actions">
                        <Button 
                            v-if="isSignedIn && event.status === 'open'"
                            label="Request to Play" 
                            icon="pi pi-send" 
                            severity="success"
                            @click="requestToPlay(event.id)" 
                        />
                        <Button 
                            v-if="isSignedIn" 
                            :label="event.isFavorite ? 'Unfavorite' : 'Favorite'" 
                            :icon="event.isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'" 
                            severity="secondary"
                            @click="toggleFavorite(event.id)" 
                        />
                    </div>
                </template>
            </Card>
        </div>

        <div v-if="filteredEvents.length === 0" class="no-results">
            <i class="pi pi-calendar" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
            <h3>No events found</h3>
            <p>Try adjusting your filters or search terms</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

// TypeScript interface for dev state


// Auth state (placeholder - replace with real authentication)
const authState = ref<{
    isSignedIn: boolean;
    currentUser: { id: string; name: string; email: string; role: string } | null;
}>({
    isSignedIn: false,
    currentUser: null
});
const isSignedIn = computed(() => authState.value.isSignedIn);
const currentUser = computed(() => authState.value.currentUser);

// TODO: Consider fetching genreOptions from config or API
const genres = ref([
    { name: 'Rock', value: 'rock' },
    { name: 'Jazz', value: 'jazz' },
    { name: 'Blues', value: 'blues' },
    { name: 'Folk', value: 'folk' },
    { name: 'Electronic', value: 'electronic' },
    { name: 'Pop', value: 'pop' }
]);

interface EventListItem {
    id: string; // event_id (INT in DB, string from API)
    eventTitle: string; // Corresponds to event_title
    datetime: string; // ISO string from DB DATETIME field
    location?: string | null;
    genre?: string | null;
    status: 'open' | 'filled' | 'expired';
    description?: string | null;
    // Consider adding slot_one to slot_four if to be displayed directly
    // creatorName?: string; // If API provides joined user name
    isFavorite: boolean; // Derived by API based on current user
}

const events = ref<EventListItem[]>([]); // Will be populated by API call

// Filters
const selectedGenre = ref<{name: string, value: string} | null>(null); // Match Dropdown option structure
const selectedDate = ref(null);
const searchTerm = ref('');

const filteredEvents = computed(() => {
    return events.value.filter(event => {
        const matchesGenre = !selectedGenre.value || event.genre === selectedGenre.value.name;
        const matchesDate = !selectedDate.value || 
            (event.datetime && new Date(event.datetime).toDateString() === (selectedDate.value as Date).toDateString());
        const matchesSearch = !searchTerm.value || 
            event.eventTitle.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchTerm.value.toLowerCase());
        
        return matchesGenre && matchesDate && matchesSearch;
    });
});

// Utility functions
const formatDate = (isoDateTimeString: string): string => {
    if (!isoDateTimeString) return 'Date TBD';
    const date = new Date(isoDateTimeString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

const formatTime = (isoDateTimeString: string): string => {
    if (!isoDateTimeString) return 'Time TBD';
    const date = new Date(isoDateTimeString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const getEventStatusSeverity = (status: EventListItem['status']) => {
  switch (status) {
    case 'open': return 'success';
    case 'filled': return 'warning';
    case 'expired': return 'danger';
    default: return 'info';
  }
};

// Actions
const viewEventDetails = (eventId: string) => {
    console.log('Viewing event details for:', eventId);
    // router.push(`/browse/events/${eventId}`);
};

const requestToPlay = async (eventId: string) => {
    console.log('Requesting to play at event:', eventId);
    
    // Check if user is signed in and has a valid ID
    if (!currentUser.value || !currentUser.value.id) {
        console.error('User not signed in or invalid user ID');
        return;
    }
    
    const requestingUserId = currentUser.value.id;
    // TODO: Get actual band ID - for now using a mock band ID
    const bandId = '1'; // Mock band ID - should come from user's band context
    
    try {
        const response = await fetch(`${API_BASE_URL}/event-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                bandId: bandId,
                eventId: eventId,
                requestingUserId: requestingUserId,
                message: 'We would love to play at your event!' // Default message
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit request');
        }

        const result = await response.json();
        console.log('Event request submitted:', result.message);
        // TODO: Show success toast message
        alert('Request to play submitted successfully!'); // Temporary success display
    } catch (error) {
        console.error('Failed to submit event request:', error);
        // TODO: Show error toast message
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit request';
        alert(`Error: ${errorMessage}`); // Temporary error display
    }
};

const toggleFavorite = async (eventId: string) => {
    // Check if user is signed in and has a valid ID
    if (!currentUser.value || !currentUser.value.id) {
        console.error('User not signed in or invalid user ID');
        return;
    }
    
    const currentUserId = currentUser.value.id;
    
    const event = events.value.find(e => e.id === eventId);
    if (!event) return;

    const newFavoriteStatus = !event.isFavorite;
    const originalStatus = event.isFavorite;
    
    // Optimistic update
    event.isFavorite = newFavoriteStatus;

    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId}/favorite-events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                eventId: eventId, 
                makeFavorite: newFavoriteStatus 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update favorite status');
        }

        const result = await response.json();
        console.log('Event favorite status updated:', result.message);
        // TODO: Show success toast message
    } catch (error) {
        console.error('Failed to toggle event favorite:', error);
        // Revert optimistic update on error
        event.isFavorite = originalStatus;
        // TODO: Show error toast message
        const errorMessage = error instanceof Error ? error.message : 'Failed to update favorite';
        alert(`Error: ${errorMessage}`); // Temporary error display
    }
};

// TODO: Add API_BASE_URL like in other views
const API_BASE_URL = 'http://localhost:3001/api'; // Placeholder

const fetchEvents = async () => {
  try {
    console.log('BrowseEventsView - Starting fetchEvents, API URL:', `${API_BASE_URL}/events`);
    console.log('BrowseEventsView - Current auth state:', authState.value);
    
    // TODO: Implement backend filtering for genre, date, searchTerm
    const response = await fetch(`${API_BASE_URL}/events`); // Assuming endpoint /api/events
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    type ApiEvent = Omit<EventListItem, 'id' | 'isFavorite' | 'status'> & {
        id: number | string;
        eventTitle: string; // Ensure eventTitle is not optional in ApiEvent if it's required by EventListItem
        datetime: string;
        status: string; // API might send status as string
        isFavorite?: boolean;
    };

    const apiData: ApiEvent[] = await response.json();

    console.log('BrowseEventsView - API response received:', apiData);
    
    events.value = apiData.map((eventFromApi: ApiEvent) => ({
      ...eventFromApi,
      id: String(eventFromApi.id),
      eventTitle: eventFromApi.eventTitle, // Explicitly map if name differs or for required assertion
      datetime: eventFromApi.datetime, // Assuming API provides it as ISO string
      status: eventFromApi.status as EventListItem['status'], // Cast if API string matches enum
      isFavorite: eventFromApi.isFavorite ?? false,
    }));
    
    console.log('BrowseEventsView - Events state updated:', events.value);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    // TODO: Show user-friendly error message in UI
    }
};

onMounted(() => {
  fetchEvents();
});
</script>

<style scoped>
.browse-events {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    color: var(--theme-main-text);
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}

.header h1 {
    color: var(--theme-main-text) !important;
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.header p {
    color: var(--theme-secondary-text);
    font-size: 1.1rem;
}

.filters {
    background: var(--p-surface-card);
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    border: 1px solid var(--p-surface-border);
}

.filter-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field label {
    font-weight: 600;
    color: var(--theme-main-text);
}

.events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
}

.event-card {
    height: fit-content;
}

.event-card .p-card-title {
    color: var(--theme-main-text) !important;
    font-weight: 600;
}

.event-card .p-card-content {
    color: var(--theme-main-text);
}

.event-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
    color: var(--theme-secondary-text);
}

.event-meta span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.event-details {
    margin: 16px 0 0 0;
}

.detail-item {
    font-size: 0.9rem;
}

.detail-item.status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
}

.detail-item .status-tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.detail-item strong {
    color: var(--theme-main-text);
    font-weight: 600;
}

.detail-item p {
    color: var(--theme-main-text);
    margin: 0.25rem 0;
}

/* Ensure status text is visible */
.p-tag {
    color: white !important; /* Keep tag text white for contrast on colored backgrounds */
}

.event-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.event-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.event-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.no-results {
    text-align: center;
    padding: 3rem;
    color: var(--theme-secondary-text);
}

.no-results h3 {
    margin: 1rem 0 0.5rem;
    color: var(--theme-main-text);
}

.no-results p {
    color: var(--theme-secondary-text);
}

.event-card :deep(.p-card-body) {
    padding: 0;
}
</style> 