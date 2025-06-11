<template>
    <div class="favorites-view">
        <!-- Glass Submenu -->
        <GlassSubmenu
            v-if="!loading && activeSection"
            title="My Favorites"
            :menu-items="submenuItems"
            :active-item="activeSection"
            @item-selected="handleSectionChange"
        />

        <!-- Main Content Area -->
        <div class="main-content">
            <!-- Loading State -->
            <div v-if="loading || !activeSection" class="content-section">
                <div class="empty-state">
                    <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--p-primary-color);"></i>
                    <h3>Loading...</h3>
                </div>
            </div>

            <!-- Favorite Bands Section -->
            <div v-else-if="activeSection === 'bands'" class="content-section">
                <div v-if="favoriteBands.length > 0" class="favorites-grid">
                    <Card v-for="band in favoriteBands" :key="band.id" class="favorite-card">
                        <template #header>
                            <img src="https://via.placeholder.com/400x200/cccccc/969696?text=Band+Image" :alt="band.name" class="favorite-image" />
                        </template>
                        <template #title>{{ band.name }}</template>
                        <template #subtitle>{{ band.genre }}</template>
                        <template #content>
                            <p class="band-description">{{ band.description || 'No description available.' }}</p>
                            <div class="band-contact">
                                <span v-if="band.email"><i class="pi pi-envelope"></i> {{ band.email }}</span>
                                <span v-if="band.phoneNumber"><i class="pi pi-phone"></i> {{ band.phoneNumber }}</span>
                            </div>
                        </template>
                        <template #footer>
                            <div class="card-actions">
                                <Button label="View Band" icon="pi pi-eye" @click="viewBandDetails(band.id)" />
                                <Button
                                    label="Remove Favorite"
                                    icon="pi pi-heart-fill"
                                    severity="danger"
                                    outlined
                                    @click="removeFavoriteBand(band.id)"
                                />
                            </div>
                        </template>
                    </Card>
                </div>
                <div v-else class="empty-state">
                    <i class="pi pi-heart" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
                    <h3>No favorite bands yet</h3>
                    <p>Browse bands and add them to your favorites</p>
                    <Button label="Browse Bands" icon="pi pi-users" @click="router.push('/bands')" />
                </div>
            </div>

            <!-- Favorite Events Section -->
            <div v-else-if="activeSection === 'events'" class="content-section">
                <div v-if="favoriteEvents.length > 0" class="favorites-grid">
                    <Card v-for="event in favoriteEvents" :key="event.id" class="favorite-card">
                        <template #header>
                             <img src="https://via.placeholder.com/400x200/cccccc/969696?text=Event+Image" :alt="event.eventTitle" class="favorite-image" />
                        </template>
                        <template #title>{{ event.eventTitle }}</template>
                        <template #subtitle>
                            <div class="event-meta">
                                <span><i class="pi pi-calendar"></i> {{ formatDate(event.datetime) }}</span>
                                <span><i class="pi pi-map-marker"></i> {{ event.location }}</span>
                            </div>
                        </template>
                        <template #content>
                            <p class="event-description">{{ event.description || 'No description available.' }}</p>
                            <div class="event-details">
                                <div class="genre-row">
                                    <span><strong>Genre:</strong> {{ event.genre || 'N/A' }}</span>
                                                                                                            <BrokenHeart
                                        @broken="removeFavoriteEvent(event.id)"
                                        tooltip="Remove from favorites"
                                        size="small"
                                    />
                                </div>
                                <!-- slotsAvailable & payRate removed as not in core event table -->
                            </div>
                        </template>
                        <template #footer>
                            <div class="card-actions">
                                <!-- Request to Play logic would depend on event status and if band slots are defined -->
                                <!-- <Button
                                    v-if="event.status === 'open'" // Assuming event has a status from DB
                                    label="Request to Play"
                                    icon="pi pi-send"
                                    severity="success"
                                    @click="requestToPlay(event.id)"
                                /> -->
                            </div>
                        </template>
                    </Card>
                </div>
                <div v-else class="empty-state">
                    <i class="pi pi-calendar" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
                    <h3>No favorite events yet</h3>
                    <p>Browse events and add them to your favorites</p>
                    <Button label="Browse Events" icon="pi pi-calendar" @click="router.push('/events')" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import GlassSubmenu from '@/components/ui/GlassSubmenu.vue';
import BrokenHeart from '@/components/ui/BrokenHeart.vue';

const route = useRoute();
const router = useRouter();

// Active section for glass submenu
const activeSection = ref('');
const loading = ref(true);

// Submenu items
const submenuItems = computed(() => {
    const items = [
        { label: 'Favorite Bands', value: 'bands', icon: 'pi pi-users' },
        { label: 'Favorite Events', value: 'events', icon: 'pi pi-calendar' }
    ];

    return items;
});

// Event Handlers
const handleSectionChange = (section: string) => {
    activeSection.value = section;
    // Update URL to reflect the current section
    router.replace({ query: { section } });
};

// Get current authenticated user ID from localStorage
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

const currentUserId = ref(getCurrentUserId())

// --- Data Interfaces (aligned with core_db_structure.sql) ---
interface FavoriteBandItem { // Based on `band` table + favorites
    id: string; // band_id
    name: string;
    genre?: string | null;
    description?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
}

interface FavoriteEventItem { // Based on `event` table + favorites
    id: string; // event_id
    eventTitle: string;
    datetime: string; // ISO string
    location?: string | null;
    genre?: string | null;
    description?: string | null;
    status?: 'open' | 'filled' | 'expired';
}

// Will be populated by API calls
const favoriteBands = ref<FavoriteBandItem[]>([]);
const favoriteEvents = ref<FavoriteEventItem[]>([]);

const API_BASE_URL = 'http://localhost:3001/api';

// Fetch user's favorite bands
const fetchFavoriteBands = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId.value}/favorite-bands`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        type ApiFavoriteBand = Omit<FavoriteBandItem, 'id'> & {
            id: number | string;
        };

        const bandsData: ApiFavoriteBand[] = await response.json();
        favoriteBands.value = bandsData.map((band: ApiFavoriteBand) => ({
            ...band,
            id: String(band.id)
        }));
    } catch (error) {
        console.error('Failed to fetch favorite bands:', error);
        // TODO: Show error toast
    }
};

// Fetch user's favorite events
const fetchFavoriteEvents = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId.value}/favorite-events`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        type ApiFavoriteEvent = Omit<FavoriteEventItem, 'id'> & {
            id: number | string;
        };

        const eventsData: ApiFavoriteEvent[] = await response.json();
        favoriteEvents.value = eventsData.map((event: ApiFavoriteEvent) => ({
            ...event,
            id: String(event.id),
            datetime: event.datetime // Should already be ISO string from API
        }));
    } catch (error) {
        console.error('Failed to fetch favorite events:', error);
        // TODO: Show error toast
    }
};

// Utility functions
const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};

// Actions
const viewBandDetails = (bandId: string) => {
    console.log('Viewing band details for:', bandId);
            router.push(`/bands/${bandId}`);
};



const removeFavoriteBand = async (bandId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId.value}/favorite-bands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bandId: bandId,
                makeFavorite: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove favorite');
        }

        // Remove from local state on success
    const index = favoriteBands.value.findIndex(b => b.id === bandId);
    if (index > -1) {
        favoriteBands.value.splice(index, 1);
    }
        console.log(`Removed band ${bandId} from favorites.`);
        // TODO: Show success toast
    } catch (error) {
        console.error('Failed to remove favorite band:', error);
        // TODO: Show error toast
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove favorite';
        alert(`Error: ${errorMessage}`); // Temporary error display
    }
};

const removeFavoriteEvent = async (eventId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId.value}/favorite-events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventId: eventId,
                makeFavorite: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove favorite');
        }

        // Remove from local state on success
    const index = favoriteEvents.value.findIndex(e => e.id === eventId);
    if (index > -1) {
        favoriteEvents.value.splice(index, 1);
    }
        console.log(`Removed event ${eventId} from favorites.`);
        // TODO: Show success toast
    } catch (error) {
        console.error('Failed to remove favorite event:', error);
        // TODO: Show error toast
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove favorite';
        alert(`Error: ${errorMessage}`); // Temporary error display
    }
};

onMounted(async () => {
    loading.value = true;

    // Set initial section from URL or default to first item
    const sectionFromUrl = route.query.section as string;
    if (sectionFromUrl && ['bands', 'events'].includes(sectionFromUrl)) {
        activeSection.value = sectionFromUrl;
    } else {
        // Default to the first item in submenuItems
        const firstItem = submenuItems.value[0];
        if (firstItem) {
            activeSection.value = firstItem.value;
        }
    }

    await Promise.all([
        fetchFavoriteBands(),
        fetchFavoriteEvents()
    ]);

    loading.value = false;
});
</script>

<style scoped>
/* FavoritesView Styles - Glass Submenu Layout */
.favorites-view {
    width: 100%;
    position: relative;
}

/* Main content area - positioned to account for fixed glass submenu */
.main-content {
    margin-left: 280px; /* Space for the glass submenu */
    width: calc(100vw - 280px); /* Ensure it doesn't overflow */
    max-width: calc(100vw - 280px);
    padding: 2rem;
    box-sizing: border-box;
    overflow-x: auto; /* Handle any internal overflow gracefully */
}

.content-section {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
}

.favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.favorite-card {
    height: fit-content;
    display: flex;
    flex-direction: column;
}

.favorite-card .p-card-content {
    flex-grow: 1;
}

.favorite-image {
    width: 100%;
    height: 180px; /* Adjusted height */
    object-fit: cover;
}

.band-description, .event-description {
    margin-bottom: 1rem;
    font-size: 0.95rem;
    color: var(--p-text-muted-color);
    min-height: 60px; /* Ensure some min height for consistency */
}

.band-contact {
    font-size: 0.85rem;
    color: var(--p-text-color);
}
.band-contact span {
    display: block;
    margin-bottom: 0.25rem;
}
.band-contact i {
    margin-right: 0.5rem;
}


.event-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
    color: var(--p-text-muted-color);
    margin-bottom: 0.5rem; /* Added margin */
}

.event-meta span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.event-details {
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.genre-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}



/* .tags removed as it was specific to old band mock data */

.card-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: auto; /* Push actions to bottom */
}

.empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--p-text-muted-color);
}

.empty-state h3 {
    margin: 1rem 0 0.5rem;
    color: var(--p-text-color);
}

.empty-state p {
    margin-bottom: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .main-content {
        margin-left: 220px;
        width: calc(100vw - 220px);
        max-width: calc(100vw - 220px);
        padding: 1.5rem;
    }

    .favorites-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
}

@media (max-width: 480px) {
    .main-content {
        margin-left: 200px;
        width: calc(100vw - 200px);
        max-width: calc(100vw - 200px);
        padding: 1rem;
    }

    .favorites-grid {
        grid-template-columns: 1fr;
    }
}
</style>
