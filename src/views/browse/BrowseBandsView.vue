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
                        :options="genres" 
                        optionLabel="name" 
                        placeholder="All Genres"
                        class="w-full"
                    />
                </div>
                <div class="field">
                    <label for="slot">Time Slot</label>
                    <Dropdown 
                        id="slot"
                        v-model="selectedSlot" 
                        :options="timeSlots" 
                        optionLabel="name" 
                        placeholder="Any Time"
                        class="w-full"
                    />
                </div>
                <div class="field">
                    <label for="search">Search</label>
                    <InputText 
                        id="search"
                        v-model="searchTerm" 
                        placeholder="Search bands..."
                        class="w-full"
                    />
                </div>
            </div>
        </div>

        <div class="bands-grid">
            <Card v-for="band in filteredBands" :key="band.id" class="band-card">
                <template #header>
                    <img :src="band.image" :alt="band.name" class="band-image" />
                </template>
                <template #title>{{ band.name }}</template>
                <template #subtitle>{{ band.genre }} • {{ band.members }} members</template>
                <template #content>
                    <p>{{ band.description }}</p>
                    <div class="band-tags">
                        <Tag v-for="tag in band.tags" :key="tag" :value="tag" severity="secondary" />
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
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

// Mock data
const isSignedIn = ref(true); // This would come from auth store

const genres = ref([
    { name: 'Rock', value: 'rock' },
    { name: 'Jazz', value: 'jazz' },
    { name: 'Blues', value: 'blues' },
    { name: 'Folk', value: 'folk' },
    { name: 'Electronic', value: 'electronic' },
    { name: 'Pop', value: 'pop' }
]);

const timeSlots = ref([
    { name: 'Morning (9-12 PM)', value: 'morning' },
    { name: 'Afternoon (12-5 PM)', value: 'afternoon' },
    { name: 'Evening (5-9 PM)', value: 'evening' },
    { name: 'Night (9+ PM)', value: 'night' }
]);

const bands = ref([
    {
        id: 1,
        name: 'The Jazz Collective',
        genre: 'Jazz',
        members: 5,
        description: 'A smooth jazz ensemble bringing classic and contemporary sounds to Charlottesville.',
        tags: ['Smooth Jazz', 'Instrumental', 'Available Weekends'],
        image: 'https://picsum.photos/400/200?random=1',
        isFavorite: false,
        timeSlot: 'evening'
    },
    {
        id: 2,
        name: 'Blue Ridge Rockers',
        genre: 'Rock',
        members: 4,
        description: 'High-energy rock band specializing in classic and modern rock hits.',
        tags: ['Classic Rock', 'Modern Rock', 'Full Band'],
        image: 'https://picsum.photos/400/200?random=2',
        isFavorite: true,
        timeSlot: 'night'
    },
    {
        id: 3,
        name: 'Acoustic Duo',
        genre: 'Folk',
        members: 2,
        description: 'Intimate acoustic performances perfect for smaller venues and events.',
        tags: ['Acoustic', 'Vocals', 'Covers & Originals'],
        image: 'https://picsum.photos/400/200?random=3',
        isFavorite: false,
        timeSlot: 'afternoon'
    },
    {
        id: 4,
        name: 'Electronic Fusion',
        genre: 'Electronic',
        members: 3,
        description: 'Cutting-edge electronic music with live instrumental accompaniment.',
        tags: ['EDM', 'Live Mixing', 'Dance'],
        image: 'https://picsum.photos/400/200?random=4',
        isFavorite: false,
        timeSlot: 'night'
    }
]);

// Filters
const selectedGenre = ref(null);
const selectedSlot = ref(null);
const searchTerm = ref('');

const filteredBands = computed(() => {
    return bands.value.filter(band => {
        const matchesGenre = !selectedGenre.value || band.genre === selectedGenre.value.name;
        const matchesSlot = !selectedSlot.value || band.timeSlot === selectedSlot.value.value;
        const matchesSearch = !searchTerm.value || 
            band.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            band.description.toLowerCase().includes(searchTerm.value.toLowerCase());
        
        return matchesGenre && matchesSlot && matchesSearch;
    });
});

// Actions
const viewBandDetails = (bandId: number) => {
    console.log('Viewing band details for:', bandId);
    // Would navigate to band detail page
};

const toggleFavorite = (bandId: number) => {
    const band = bands.value.find(b => b.id === bandId);
    if (band) {
        band.isFavorite = !band.isFavorite;
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
    color: var(--p-text-color);
}

.bands-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
}

.band-card {
    height: fit-content;
}

.band-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.band-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.band-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.no-results {
    text-align: center;
    padding: 3rem;
    color: var(--p-text-muted-color);
}

.no-results h3 {
    margin: 1rem 0 0.5rem;
}
</style> 