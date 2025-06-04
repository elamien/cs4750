<template>
    <div class="browse-bands">
        <div class="header">
            <h1>Browse Bands</h1>
            <p>Discover bands and musicians in your area</p>
        </div>

        <div class="filters">
            <div class="filter-row">
                <div class="field">
                    <label for="genre">Genre</label>
                    <Dropdown 
                        id="genre"
                        v-model="selectedGenre" 
                        :options="genreOptions" 
                        optionLabel="name" 
                        optionValue="value"
                        placeholder="All Genres"
                        showClear
                        class="w-full"
                    />
                </div>
                <div class="field">
                    <label for="search">Search</label>
                    <InputText 
                        id="search"
                        v-model="searchTerm" 
                        placeholder="Search bands by name or description..."
                        class="w-full"
                    />
                </div>
            </div>
        </div>

        <div class="bands-grid">
            <Card v-for="band in filteredBands" :key="band.id" class="band-card">
                <template #header>
                    <img src="https://via.placeholder.com/400x200/cccccc/969696?text=Band+Image" :alt="band.name" class="band-image" />
                </template>
                <template #title>{{ band.name }}</template>
                <template #subtitle>{{ band.genre }}</template>
                <template #content>
                    <p class="band-description">{{ band.description || 'No description available.' }}</p>
                    <div class="band-details">
                        <span v-if="band.email"><i class="pi pi-envelope"></i> {{ band.email }}</span>
                        <span v-if="band.phoneNumber"><i class="pi pi-phone"></i> {{ band.phoneNumber }}</span>
                        <span><i class="pi pi-calendar-check"></i> Events Played: {{ band.totalEventsPlayed ?? 0 }}</span>
                    </div>
                </template>
                <template #footer>
                    <div class="band-actions">
                        <Button label="View Details" icon="pi pi-eye" @click="viewBandDetails(band.id)" />
                        <Button 
                            v-if="isSignedIn" 
                            :label="band.isFavorite ? 'Unfavorite' : 'Favorite'" 
                            :icon="band.isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'" 
                            severity="secondary"
                            @click="toggleFavorite(band.id)" 
                        />
                    </div>
                </template>
            </Card>
        </div>

        <div v-if="filteredBands.length === 0" class="no-results">
            <i class="pi pi-search" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
            <h3>No bands found</h3>
            <p>Try adjusting your filters or search terms</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const router = useRouter();

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

interface BandListItem { // Aligned with `band` table + `isFavorite` from user context
    id: string; // band_id (INT in DB, string in API/frontend)
    name: string;
    genre?: string | null;
    description?: string | null;
    email?: string | null;
    phoneNumber?: string | null; // Corresponds to phone_number
    totalEventsPlayed?: number;
    // events_played_ytd?: number; // Available in DB, can be added if needed
    isFavorite: boolean; // Derived by API based on current user
}

const genreOptions = ref([
    { name: 'Rock', value: 'Rock' },
    { name: 'Jazz', value: 'Jazz' },
    { name: 'Blues', value: 'Blues' },
    { name: 'Folk', value: 'Folk' },
    { name: 'Electronic', value: 'Electronic' },
    { name: 'Pop', value: 'Pop' },
    { name: 'Country', value: 'Country' },
    { name: 'Other', value: 'Other' }
]);
// TODO: Consider fetching genreOptions from config or API

const bands = ref<BandListItem[]>([]); // Will be populated by API call

const selectedGenre = ref<string | null>(null);
const searchTerm = ref('');

const filteredBands = computed(() => {
    return bands.value.filter(band => {
        const matchesGenre = !selectedGenre.value || band.genre === selectedGenre.value;
        const matchesSearch = !searchTerm.value || 
            band.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            (band.description && band.description.toLowerCase().includes(searchTerm.value.toLowerCase()));
        
        return matchesGenre && matchesSearch;
    });
});

const viewBandDetails = (bandId: string) => {
    router.push({ name: 'band-detail', params: { id: bandId } });
};

const toggleFavorite = async (bandId: string) => {
    // Check if user is signed in and has a valid ID
    if (!currentUser.value || !currentUser.value.id) {
        console.error('User not signed in or invalid user ID');
        return;
    }
    
    const currentUserId = currentUser.value.id;
    
    const band = bands.value.find(b => b.id === bandId);
    if (!band) return;

    const newFavoriteStatus = !band.isFavorite;
    const originalStatus = band.isFavorite;
    
    // Optimistic update
    band.isFavorite = newFavoriteStatus;

    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId}/favorite-bands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                bandId: bandId, 
                makeFavorite: newFavoriteStatus 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update favorite status');
        }

        const result = await response.json();
        console.log('Favorite status updated:', result.message);
        // TODO: Show success toast message
    } catch (error) {
        console.error('Failed to toggle favorite:', error);
        // Revert optimistic update on error
        band.isFavorite = originalStatus;
        // TODO: Show error toast message
        const errorMessage = error instanceof Error ? error.message : 'Failed to update favorite';
        alert(`Error: ${errorMessage}`); // Temporary error display
    }
};

// TODO: Add API_BASE_URL like in FillInRequestsView.vue
const API_BASE_URL = 'http://localhost:3001/api'; // Placeholder, ensure this is correct

const fetchBands = async () => {
  try {
    console.log('BrowseBandsView - Starting fetchBands, API URL:', `${API_BASE_URL}/bands`);
    console.log('BrowseBandsView - Current auth state:', authState.value);
    
    // TODO: Add query parameters for filtering (selectedGenre, searchTerm) on the backend
    const response = await fetch(`${API_BASE_URL}/bands`); // Assuming an endpoint /api/bands
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Define the expected raw shape of a band object from the API
    type ApiBand = Omit<BandListItem, 'id' | 'isFavorite'> & {
      id: number | string; // API might send id as number
      isFavorite?: boolean; // API might not send this if user not logged in / no favorites data
    };

    const apiData: ApiBand[] = await response.json();
    
    console.log('BrowseBandsView - API response received:', apiData);
    
    bands.value = apiData.map((bandFromApi: ApiBand) => ({
      ...bandFromApi,
      id: String(bandFromApi.id), // Ensure id is string for BandListItem
      isFavorite: bandFromApi.isFavorite ?? false, // Default to false if undefined
    })); 
    
    console.log('BrowseBandsView - Bands state updated:', bands.value);
  } catch (error) {
    console.error('Failed to fetch bands:', error);
    // TODO: Show user-friendly error message in UI (e.g., using a toast)
    }
};

onMounted(() => {
  fetchBands();
});
</script>

<style scoped>
.browse-bands {
    max-width: 1200px;
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

.filters {
    background: var(--p-surface-card);
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    border: 1px solid var(--p-surface-border);
}

.filter-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field label {
    font-weight: 600;
    color: var(--p-text-color);
}

.bands-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
}

.band-card {
    height: fit-content;
    display: flex;
    flex-direction: column;
}

.band-card .p-card-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.band-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
}

.band-description {
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: var(--p-text-muted-color);
    flex-grow: 1;
}

.band-details {
    font-size: 0.85rem;
    color: var(--p-text-color);
    margin-bottom: 1rem;
}

.band-details span {
    display: block;
    margin-bottom: 0.3rem;
}

.band-details i {
    margin-right: 0.5rem;
    color: var(--p-primary-color);
}

.band-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: auto;
}

.no-results {
    text-align: center;
    padding: 3rem;
    color: var(--p-text-muted-color);
}

.no-results h3 {
    margin: 1rem 0 0.5rem;
}

@media (max-width: 600px) {
    .filter-row {
        grid-template-columns: 1fr;
    }
}
</style> 