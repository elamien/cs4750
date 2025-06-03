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
                <template #header>
                    <img :src="event.image" :alt="event.name" class="event-image" />
                </template>
                <template #title>{{ event.name }}</template>
                <template #subtitle>
                    <div class="event-meta">
                        <span><i class="pi pi-calendar"></i> {{ formatDate(event.date) }}</span>
                        <span><i class="pi pi-clock"></i> {{ event.time }}</span>
                        <span><i class="pi pi-map-marker"></i> {{ event.venue }}</span>
                    </div>
                </template>
                <template #content>
                    <p>{{ event.description }}</p>
                    <div class="event-details">
                        <div class="detail-item">
                            <strong>Genre:</strong> {{ event.genre }}
                        </div>
                        <div class="detail-item">
                            <strong>Slots Available:</strong> {{ event.slotsAvailable }}/{{ event.totalSlots }}
                        </div>
                        <div class="detail-item">
                            <strong>Pay Rate:</strong> {{ event.payRate }}
                        </div>
                    </div>
                    <div class="event-tags">
                        <Tag v-for="tag in event.tags" :key="tag" :value="tag" severity="info" />
                    </div>
                </template>
                <template #footer>
                    <div class="event-actions">
                        <Button label="View Details" icon="pi pi-eye" @click="viewEventDetails(event.id)" />
                        <Button 
                            v-if="isSignedIn && event.slotsAvailable > 0" 
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
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
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

const events = ref([
    {
        id: 1,
        name: 'Summer Music Festival',
        genre: 'Rock',
        date: new Date('2024-07-15'),
        time: '7:00 PM',
        venue: 'Downtown Amphitheater',
        description: 'Annual summer festival featuring local and regional bands. Great opportunity for exposure.',
        slotsAvailable: 2,
        totalSlots: 5,
        payRate: '$200-400',
        tags: ['Festival', 'Multiple Genres', 'Large Venue'],
        image: 'https://picsum.photos/400/200?random=11',
        isFavorite: false
    },
    {
        id: 2,
        name: 'Jazz Night at The Blue Note',
        genre: 'Jazz',
        date: new Date('2024-06-20'),
        time: '8:30 PM',
        venue: 'The Blue Note',
        description: 'Weekly jazz night featuring different ensembles. Intimate setting with jazz enthusiasts.',
        slotsAvailable: 1,
        totalSlots: 1,
        payRate: '$150-250',
        tags: ['Weekly Event', 'Jazz Club', 'Intimate'],
        image: 'https://picsum.photos/400/200?random=12',
        isFavorite: true
    },
    {
        id: 3,
        name: 'University Alumni Weekend',
        genre: 'Folk',
        date: new Date('2024-08-03'),
        time: '2:00 PM',
        venue: 'UVA Lawn',
        description: 'Afternoon performances for university alumni weekend celebration.',
        slotsAvailable: 3,
        totalSlots: 4,
        payRate: '$300-500',
        tags: ['University Event', 'Afternoon', 'Alumni'],
        image: 'https://picsum.photos/400/200?random=13',
        isFavorite: false
    },
    {
        id: 4,
        name: 'Electronic Dance Night',
        genre: 'Electronic',
        date: new Date('2024-06-25'),
        time: '10:00 PM',
        venue: 'Club Neon',
        description: 'High-energy electronic dance night. Looking for DJs and electronic acts.',
        slotsAvailable: 0,
        totalSlots: 3,
        payRate: '$100-300',
        tags: ['Club Event', 'Late Night', 'Dance'],
        image: 'https://picsum.photos/400/200?random=14',
        isFavorite: false
    }
]);

// Filters
const selectedGenre = ref(null);
const selectedDate = ref(null);
const searchTerm = ref('');

const filteredEvents = computed(() => {
    return events.value.filter(event => {
        const matchesGenre = !selectedGenre.value || event.genre === selectedGenre.value.name;
        const matchesDate = !selectedDate.value || 
            event.date.toDateString() === selectedDate.value.toDateString();
        const matchesSearch = !searchTerm.value || 
            event.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            event.venue.toLowerCase().includes(searchTerm.value.toLowerCase());
        
        return matchesGenre && matchesDate && matchesSearch;
    });
});

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
const viewEventDetails = (eventId: number) => {
    console.log('Viewing event details for:', eventId);
    // Would navigate to event detail page
};

const requestToPlay = (eventId: number) => {
    console.log('Requesting to play at event:', eventId);
    // Would open request modal or navigate to request page
};

const toggleFavorite = (eventId: number) => {
    const event = events.value.find(e => e.id === eventId);
    if (event) {
        event.isFavorite = !event.isFavorite;
    }
};
</script>

<style scoped>
.browse-events {
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

.events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
}

.event-card {
    height: fit-content;
}

.event-image {
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
}

.detail-item {
    font-size: 0.9rem;
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
    color: var(--p-text-muted-color);
}

.no-results h3 {
    margin: 1rem 0 0.5rem;
}
</style> 