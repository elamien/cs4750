<template>
    <div class="browse-events-content">
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
            <div class="filter-row-toggle">
                <ToggleButton
                    v-model="showOpenGigsOnly"
                    onLabel="Show All Events"
                    offLabel="Show Open Gigs Only"
                    onIcon="pi pi-globe"
                    offIcon="pi pi-briefcase"
                />
            </div>
        </div>

        <div class="events-grid">
            <Card v-for="event in filteredEvents" :key="event.id" class="event-card">
                <template #title>{{ event.eventTitle }}</template>
                <template #subtitle>
                    <div class="event-meta">
                        <span><i class="pi pi-calendar"></i> {{ formatDate(event.eventDate) }}</span>
                        <span><i class="pi pi-clock"></i> {{ getTimeSlotText(event.timeSlot) }}</span>
                        <span><i class="pi pi-map-marker"></i> {{ event.location || 'Venue TBD' }}</span>
                    </div>
                </template>
                <template #content>
                    <p>{{ event.description || 'No description provided.' }}</p>
                    <div class="event-details">
                        <div class="detail-item">
                            <strong>Genre:</strong> {{ event.genre || 'N/A' }}
                        </div>
                        <div class="detail-item">
                            <strong>Posted by:</strong> {{ event.creatorName }} ({{ event.creatorRole }})
                        </div>
                        <div class="detail-item performing-row">
                            <div class="performing-section">
                                <strong>Performing:</strong>
                                <div class="bands-list">
                                    <div v-if="event.bandName" class="band-tags">
                                        <Tag
                                            :value="event.bandName"
                                            severity="info"
                                            class="band-tag clickable"
                                            @click="viewBandDetails(event.bandName)"
                                        />
                                    </div>
                                    <span v-else class="tba">TBA</span>
                                </div>
                            </div>
                            <div class="favorite-section">
                                <Button
                                    v-if="isAuthenticated"
                                    :icon="event.isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'"
                                    severity="secondary"
                                    outlined
                                    size="small"
                                    @click.stop="toggleFavorite(event.id)"
                                    :title="event.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
                                />
                            </div>
                        </div>
                    </div>
                </template>
                <template #footer>
                    <div class="event-actions">
                        <Button
                            v-if="isAuthenticated && isBandLeader() && event.status === 'open'"
                            label="Accept Gig"
                            icon="pi pi-check-circle"
                            severity="success"
                            @click="openCommitmentDialog(event)"
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

                <!-- Gig Commitment Warning Dialog -->
        <GigCommitmentDialog
            :visible="showCommitmentDialog"
            :event-details="selectedEventForCommitment"
            :loading="isAccepting"
            @update:visible="showCommitmentDialog = $event"
            @cancel="showCommitmentDialog = false"
            @confirm="confirmAcceptGig"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ToggleButton from 'primevue/togglebutton';
import GigCommitmentDialog from '@/components/band/GigCommitmentDialog.vue';
import { useReferenceData } from '@/composables/useReferenceData';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const toast = useToast();
const { genres, initializeGenres } = useReferenceData();
const { isAuthenticated, currentUser, isBandLeader } = useAuth();

interface EventListItem {
    id: string;
    eventTitle: string;
    eventDate: string;
    timeSlot: number;
    datetime: string;
    location?: string | null;
    genre?: string | null;
    status: 'open' | 'filled' | 'expired';
    description?: string | null;
    creatorName: string;
    creatorRole: string;
    assignedBandId?: number | null;
    bandName?: string | null;
    isFavorite: boolean;
}

const events = ref<EventListItem[]>([]);

// Filters
const selectedGenre = ref<{name: string, value: string} | null>(null);
const selectedDate = ref(null);
const searchTerm = ref('');
const showOpenGigsOnly = ref(false);
const showCommitmentDialog = ref(false);
const isAccepting = ref(false);
const selectedEventForCommitment = ref<EventListItem | null>(null);

const filteredEvents = computed(() => {
    return events.value.filter(event => {
        const matchesGenre = !selectedGenre.value || event.genre === selectedGenre.value.name;
        const matchesDate = !selectedDate.value ||
            (event.datetime && new Date(event.datetime).toDateString() === (selectedDate.value as Date).toDateString());
        const matchesSearch = !searchTerm.value ||
            event.eventTitle.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchTerm.value.toLowerCase());

        const matchesOpenGigs = !showOpenGigsOnly.value || event.status === 'open';

        return matchesGenre && matchesDate && matchesSearch && matchesOpenGigs;
    });
});

// Utility functions
const formatDate = (dateString: string): string => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const getTimeSlotText = (timeSlot: number): string => {
    const timeSlotMapping = {
        1: '8:00 AM - 9:00 AM',
        2: '9:00 AM - 10:00 AM',
        3: '10:00 AM - 11:00 AM',
        4: '11:00 AM - 12:00 PM'
    };
    return timeSlotMapping[timeSlot as keyof typeof timeSlotMapping] || 'Unknown Time';
};

// Navigate to band details page
const viewBandDetails = async (bandName: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/bands?search=${encodeURIComponent(bandName)}`);
        if (response.ok) {
            const bands: { id: string; name: string }[] = await response.json();
            const band = bands.find(b => b.name === bandName);
            if (band) {
                router.push(`/bands/${band.id}`);
            }
        }
    } catch (error) {
        console.error('Error finding band:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not find band details',
            life: 3000
        });
    }
};

const openCommitmentDialog = (event: EventListItem) => {
    selectedEventForCommitment.value = event;
    showCommitmentDialog.value = true;
};

const confirmAcceptGig = async () => {
    if (!selectedEventForCommitment.value) return;

    isAccepting.value = true;
    try {
        const response = await fetch(`${API_BASE_URL}/events/${selectedEventForCommitment.value.id}/accept-gig`, {
            method: 'POST',
            headers: {
                // Assuming authentication token is sent via cookies or a dedicated header
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: currentUser.value?.userId }) // Send current user ID to identify the band
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to accept gig. It might have been taken.');
        }

        toast.add({
            severity: 'success',
            summary: 'Gig Accepted!',
            detail: `Your band is now scheduled to play at "${selectedEventForCommitment.value.eventTitle}".`,
            life: 5000
        });

        // Refresh events to show updated status
        await fetchEvents();

    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Could Not Accept Gig',
            detail: error instanceof Error ? error.message : 'An unexpected error occurred.',
            life: 5000
        });
    } finally {
        isAccepting.value = false;
        showCommitmentDialog.value = false;
        selectedEventForCommitment.value = null;
    }
};

const toggleFavorite = async (eventId: string) => {
    console.log('toggleFavorite called for event:', eventId);

    if (!currentUser.value || !currentUser.value.userId) {
        console.error('User not signed in or invalid user ID');
        return;
    }

    const currentUserId = currentUser.value.userId;
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
    } catch (error) {
        console.error('Failed to toggle event favorite:', error);
        event.isFavorite = originalStatus;
        const errorMessage = error instanceof Error ? error.message : 'Failed to update favorite';
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 3000
        });
    }
};

const API_BASE_URL = 'http://localhost:3001/api';

const fetchEvents = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        type ApiEvent = Omit<EventListItem, 'id' | 'isFavorite' | 'status'> & {
            id: number | string;
            eventTitle: string;
            datetime: string;
            status: string;
            creatorName: string;
            creatorRole: string;
            isFavorite?: boolean;
        };

        const apiData: ApiEvent[] = await response.json();

        events.value = apiData.map((eventFromApi: ApiEvent) => ({
            ...eventFromApi,
            id: String(eventFromApi.id),
            eventTitle: eventFromApi.eventTitle,
            datetime: eventFromApi.datetime,
            status: eventFromApi.status as EventListItem['status'],
            creatorName: eventFromApi.creatorName,
            creatorRole: eventFromApi.creatorRole,
            isFavorite: eventFromApi.isFavorite ?? false,
        }));
    } catch (error) {
        console.error('Failed to fetch events:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load events',
            life: 3000
        });
    }
};

onMounted(async () => {
    await initializeGenres();
    fetchEvents();
});
</script>

<style scoped>
.browse-events-content {
    padding: 1.5rem;
    color: var(--theme-main-text);
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

.filter-row-toggle {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
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

.detail-item strong {
    color: var(--theme-main-text);
    font-weight: 600;
}

.detail-item p {
    color: var(--theme-main-text);
    margin: 0.25rem 0;
}

.p-tag {
    color: white !important;
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

.bands-list {
    margin-top: 0.5rem;
}

.band-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.band-tag {
    cursor: pointer;
    transition: transform 0.2s ease;
}

.band-tag:hover {
    transform: scale(1.05);
}

.tba {
    color: var(--theme-secondary-text);
    font-style: italic;
    font-size: 0.9rem;
    background: var(--p-surface-100);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    border: 1px dashed var(--p-surface-300);
}

.performing-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.performing-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
}

.performing-section strong {
    flex-shrink: 0;
}

.favorite-section {
    flex-shrink: 0;
}

.accept-dialog-content .gig-details-card {
    margin-top: 1rem;
    background: var(--p-surface-50);
    border: 1px solid var(--p-surface-border);
}

.accept-dialog-content .gig-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.accept-dialog-content .gig-details span {
     display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--theme-secondary-text);
}

.accept-dialog-content .confirmation-text {
    font-weight: 600;
    color: var(--p-primary-color);
    margin-top: 1rem;
}
</style>
