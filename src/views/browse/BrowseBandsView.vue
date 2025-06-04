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
                    <img :src="band.mockImage || 'https://picsum.photos/400/200?random=' + band.id" :alt="band.name" class="band-image" />
                </template>
                <template #title>{{ band.name }}</template>
                <template #subtitle>{{ band.genre }} • {{ band.memberCount }} members (mocked)</template>
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const router = useRouter();

const isSignedIn = ref(true);

interface BandListItem {
    id: string | number;
    name: string;
    genre?: string | null;
    description?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    totalEventsPlayed?: number;
    memberCount: number;
    mockImage?: string;
    isFavorite: boolean;
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

const bands = ref<BandListItem[]>([
    {
        id: 'band1',
        name: 'The Jazz Collective',
        genre: 'Jazz',
        memberCount: 5,
        description: 'A smooth jazz ensemble bringing classic and contemporary sounds to Charlottesville.',
        email: 'jazz.collective@example.com',
        phoneNumber: '555-1234',
        totalEventsPlayed: 25,
        mockImage: 'https://picsum.photos/400/200?random=1',
        isFavorite: false,
    },
    {
        id: 'band2',
        name: 'Blue Ridge Rockers',
        genre: 'Rock',
        memberCount: 4,
        description: 'High-energy rock band specializing in classic and modern rock hits.',
        email: 'brr@example.com',
        phoneNumber: '555-5678',
        totalEventsPlayed: 150,
        mockImage: 'https://picsum.photos/400/200?random=2',
        isFavorite: true,
    },
    {
        id: 'band3',
        name: 'Acoustic Duo',
        genre: 'Folk',
        memberCount: 2,
        description: 'Intimate acoustic performances perfect for smaller venues and events.',
        email: null,
        phoneNumber: '555-9012',
        totalEventsPlayed: 78,
        mockImage: 'https://picsum.photos/400/200?random=3',
        isFavorite: false,
    },
    {
        id: 'band4',
        name: 'Electronic Fusion',
        genre: 'Electronic',
        memberCount: 3,
        description: 'Cutting-edge electronic music with live instrumental accompaniment.',
        email: 'efusion@example.com',
        phoneNumber: null,
        totalEventsPlayed: 40,
        mockImage: 'https://picsum.photos/400/200?random=4',
        isFavorite: false,
    }
]);

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

const viewBandDetails = (bandId: string | number) => {
    console.log('Viewing band details for:', bandId);
    router.push(`/browse/bands/${bandId}`);
};

const toggleFavorite = (bandId: string | number) => {
    const band = bands.value.find(b => b.id === bandId);
    if (band) {
        band.isFavorite = !band.isFavorite;
        console.log(`Band ${bandId} favorite status: ${band.isFavorite}`);
    }
};
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