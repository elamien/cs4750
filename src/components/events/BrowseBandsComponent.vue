<template>
    <div class="browse-bands-content">
        <div class="filters">
            <div class="filter-row">
                <div class="field">
                    <label for="genre">Genre</label>
                    <Dropdown
                        id="genre"
                        v-model="selectedGenre"
                        :options="genres"
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
                <template #title>{{ band.name }}</template>
                <template #subtitle>{{ band.genre }}</template>
                <template #content>
                    <p class="band-description">{{ band.description || 'No description available.' }}</p>
                    <div class="band-details">
                        <span v-if="band.email"><i class="pi pi-envelope"></i> {{ band.email }}</span>
                        <span v-if="band.phoneNumber"><i class="pi pi-phone"></i> {{ band.phoneNumber }}</span>
                    </div>
                </template>
                <template #footer>
                    <div class="band-actions">
                        <Button label="View Details" icon="pi pi-eye" @click.stop="viewBandDetails(band.id)" />
                        <Button
                            v-if="isSignedIn"
                            :label="band.isFavorite ? 'Unfavorite' : 'Favorite'"
                            :icon="band.isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'"
                            severity="secondary"
                            @click.stop="toggleFavorite(band.id)"
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
import { useReferenceData } from '@/composables/useReferenceData';

const router = useRouter();
const { genres, initializeGenres } = useReferenceData();

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

interface BandListItem {
    id: string;
    name: string;
    genre?: string | null;
    description?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    isFavorite: boolean;
}

const bands = ref<BandListItem[]>([]);

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
    } catch (error) {
        console.error('Failed to toggle favorite:', error);
        band.isFavorite = originalStatus;
        const errorMessage = error instanceof Error ? error.message : 'Failed to update favorite';
        alert(`Error: ${errorMessage}`);
    }
};

const API_BASE_URL = 'http://localhost:3001/api';

const fetchBands = async () => {
    try {
        let url = `${API_BASE_URL}/bands`;
        const params = new URLSearchParams();

        // Add userId parameter if user is authenticated
        if (currentUser.value && currentUser.value.id) {
            params.append('userId', currentUser.value.id);
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        type ApiBand = Omit<BandListItem, 'id' | 'isFavorite'> & {
            id: number | string;
            isFavorite?: boolean;
        };

        const apiData: ApiBand[] = await response.json();

        bands.value = apiData.map((bandFromApi: ApiBand) => ({
            ...bandFromApi,
            id: String(bandFromApi.id),
            isFavorite: bandFromApi.isFavorite ?? false,
        }));
    } catch (error) {
        console.error('Failed to fetch bands:', error);
    }
};

onMounted(async () => {
    await initializeGenres();
    fetchBands();
});
</script>

<style scoped>
.browse-bands-content {
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

.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field label {
    font-weight: 600;
    color: var(--theme-main-text);
}

.bands-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
}

.band-card {
    height: fit-content;
}

.band-description {
    color: var(--theme-main-text);
    margin-bottom: 1rem;
}

.band-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--theme-secondary-text);
}

.band-details span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.band-actions {
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

@media (max-width: 768px) {
    .bands-grid {
        grid-template-columns: 1fr;
    }

    .band-actions {
        flex-direction: column;
    }
}
</style>
