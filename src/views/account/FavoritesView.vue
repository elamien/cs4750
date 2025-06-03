<template>
    <div class="favorites-view">
        <div class="header">
            <h1>My Favorites</h1>
            <p>Your saved bands and events</p>
        </div>

        <TabView>
            <TabPanel header="Favorite Bands">
                <div v-if="favoriteBands.length > 0" class="favorites-grid">
                    <Card v-for="band in favoriteBands" :key="band.id" class="favorite-card">
                        <template #header>
                            <img :src="band.image" :alt="band.name" class="favorite-image" />
                        </template>
                        <template #title>{{ band.name }}</template>
                        <template #subtitle>{{ band.genre }} • {{ band.members }} members</template>
                        <template #content>
                            <p>{{ band.description }}</p>
                            <div class="tags">
                                <Tag v-for="tag in band.tags" :key="tag" :value="tag" severity="secondary" />
                            </div>
                        </template>
                        <template #footer>
                            <div class="card-actions">
                                <Button label="View Details" icon="pi pi-eye" @click="viewBandDetails(band.id)" />
                                <Button 
                                    label="Remove" 
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
                    <Button label="Browse Bands" icon="pi pi-users" @click="$router.push('/browse/bands')" />
                </div>
            </TabPanel>

            <TabPanel header="Favorite Events">
                <div v-if="favoriteEvents.length > 0" class="favorites-grid">
                    <Card v-for="event in favoriteEvents" :key="event.id" class="favorite-card">
                        <template #header>
                            <img :src="event.image" :alt="event.name" class="favorite-image" />
                        </template>
                        <template #title>{{ event.name }}</template>
                        <template #subtitle>
                            <div class="event-meta">
                                <span><i class="pi pi-calendar"></i> {{ formatDate(event.date) }}</span>
                                <span><i class="pi pi-map-marker"></i> {{ event.venue }}</span>
                            </div>
                        </template>
                        <template #content>
                            <p>{{ event.description }}</p>
                            <div class="event-details">
                                <div><strong>Genre:</strong> {{ event.genre }}</div>
                                <div><strong>Pay:</strong> {{ event.payRate }}</div>
                            </div>
                        </template>
                        <template #footer>
                            <div class="card-actions">
                                <Button label="View Details" icon="pi pi-eye" @click="viewEventDetails(event.id)" />
                                <Button 
                                    v-if="event.slotsAvailable > 0"
                                    label="Request to Play" 
                                    icon="pi pi-send" 
                                    severity="success"
                                    @click="requestToPlay(event.id)" 
                                />
                                <Button 
                                    label="Remove" 
                                    icon="pi pi-heart-fill" 
                                    severity="danger"
                                    outlined
                                    @click="removeFavoriteEvent(event.id)" 
                                />
                            </div>
                        </template>
                    </Card>
                </div>
                <div v-else class="empty-state">
                    <i class="pi pi-calendar" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
                    <h3>No favorite events yet</h3>
                    <p>Browse events and add them to your favorites</p>
                    <Button label="Browse Events" icon="pi pi-calendar" @click="$router.push('/browse/events')" />
                </div>
            </TabPanel>
        </TabView>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Card from 'primevue/card';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

// Mock favorite bands data
const favoriteBands = ref([
    {
        id: 2,
        name: 'Blue Ridge Rockers',
        genre: 'Rock',
        members: 4,
        description: 'High-energy rock band specializing in classic and modern rock hits.',
        tags: ['Classic Rock', 'Modern Rock', 'Full Band'],
        image: 'https://picsum.photos/400/200?random=2'
    },
    {
        id: 5,
        name: 'Mountain Folk Trio',
        genre: 'Folk',
        members: 3,
        description: 'Traditional and contemporary folk music from the Blue Ridge Mountains.',
        tags: ['Traditional', 'Acoustic', 'Harmony'],
        image: 'https://picsum.photos/400/200?random=5'
    }
]);

// Mock favorite events data
const favoriteEvents = ref([
    {
        id: 2,
        name: 'Jazz Night at The Blue Note',
        genre: 'Jazz',
        date: new Date('2024-06-20'),
        venue: 'The Blue Note',
        description: 'Weekly jazz night featuring different ensembles. Intimate setting with jazz enthusiasts.',
        slotsAvailable: 1,
        payRate: '$150-250',
        image: 'https://picsum.photos/400/200?random=12'
    }
]);

// Utility functions
const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

// Actions
const viewBandDetails = (bandId: number) => {
    console.log('Viewing band details for:', bandId);
    // Would navigate to band detail page
};

const viewEventDetails = (eventId: number) => {
    console.log('Viewing event details for:', eventId);
    // Would navigate to event detail page
};

const requestToPlay = (eventId: number) => {
    console.log('Requesting to play at event:', eventId);
    // Would open request modal or navigate to request page
};

const removeFavoriteBand = (bandId: number) => {
    const index = favoriteBands.value.findIndex(b => b.id === bandId);
    if (index > -1) {
        favoriteBands.value.splice(index, 1);
    }
};

const removeFavoriteEvent = (eventId: number) => {
    const index = favoriteEvents.value.findIndex(e => e.id === eventId);
    if (index > -1) {
        favoriteEvents.value.splice(index, 1);
    }
};
</script>

<style scoped>
.favorites-view {
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

.favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.favorite-card {
    height: fit-content;
}

.favorite-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.event-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
    color: var(--p-text-muted-color);
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

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.card-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
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
</style> 