<template>
    <div class="join-create-band">
        <div class="header">
            <h1>Join or Create a Band</h1>
            <p>Find your musical community</p>
        </div>

        <TabView>
            <TabPanel header="Join a Band">
                <div class="search-section">
                    <div class="search-filters">
                        <InputText 
                            v-model="searchTerm" 
                            placeholder="Search bands by name or genre..." 
                            class="search-input"
                        />
                        <Dropdown 
                            v-model="selectedGenre" 
                            :options="genres" 
                            optionLabel="name" 
                            placeholder="All Genres"
                        />
                    </div>
                </div>

                <div v-if="filteredBands.length > 0" class="bands-list">
                    <Card v-for="band in filteredBands" :key="band.id" class="band-card">
                        <template #title>{{ band.name }}</template>
                        <template #subtitle>{{ band.genre }} • {{ band.memberCount }} members</template>
                        <template #content>
                            <p>{{ band.description }}</p>
                            <div class="band-needs">
                                <strong>Looking for:</strong>
                                <div class="needs-tags">
                                    <Tag v-for="need in band.needs" :key="need" :value="need" />
                                </div>
                            </div>
                        </template>
                        <template #footer>
                            <Button 
                                label="Request to Join" 
                                icon="pi pi-user-plus" 
                                @click="requestToJoin(band.id)"
                            />
                        </template>
                    </Card>
                </div>

                <div v-else class="empty-state">
                    <i class="pi pi-users" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
                    <h3>No bands found</h3>
                    <p>Try adjusting your search or create your own band</p>
                </div>
            </TabPanel>

            <TabPanel header="Create a Band">
                <Card class="create-band-form">
                    <template #content>
                        <div class="form-grid">
                            <div class="field">
                                <label for="bandName">Band Name</label>
                                <InputText 
                                    id="bandName" 
                                    v-model="bandForm.name" 
                                    placeholder="Enter band name"
                                />
                            </div>
                            
                            <div class="field">
                                <label for="bandGenre">Primary Genre</label>
                                <Dropdown 
                                    id="bandGenre"
                                    v-model="bandForm.genre" 
                                    :options="genres"
                                    optionLabel="name"
                                    placeholder="Select genre"
                                />
                            </div>
                            
                            <div class="field span-2">
                                <label for="bandDescription">Description</label>
                                <Textarea 
                                    id="bandDescription"
                                    v-model="bandForm.description" 
                                    rows="4"
                                    placeholder="Describe your band's style and goals..."
                                />
                            </div>
                            
                            <div class="field span-2">
                                <label for="lookingFor">Looking for (instruments/roles)</label>
                                <MultiSelect 
                                    id="lookingFor"
                                    v-model="bandForm.lookingFor" 
                                    :options="instruments"
                                    optionLabel="name"
                                    placeholder="Select instruments you need"
                                />
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <Button 
                                label="Create Band" 
                                icon="pi pi-plus" 
                                @click="createBand"
                            />
                            <Button 
                                label="Reset" 
                                severity="secondary" 
                                outlined 
                                @click="resetBandForm"
                            />
                        </div>
                    </template>
                </Card>
            </TabPanel>
        </TabView>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

// Mock data
const genres = ref([
    { name: 'Rock', value: 'rock' },
    { name: 'Jazz', value: 'jazz' },
    { name: 'Blues', value: 'blues' },
    { name: 'Folk', value: 'folk' },
    { name: 'Electronic', value: 'electronic' },
    { name: 'Pop', value: 'pop' }
]);

const instruments = ref([
    { name: 'Guitar', value: 'guitar' },
    { name: 'Bass', value: 'bass' },
    { name: 'Drums', value: 'drums' },
    { name: 'Piano', value: 'piano' },
    { name: 'Vocals', value: 'vocals' },
    { name: 'Saxophone', value: 'saxophone' },
    { name: 'Trumpet', value: 'trumpet' }
]);

const bands = ref([
    {
        id: 1,
        name: 'The Groove Collective',
        genre: 'Jazz',
        memberCount: 3,
        description: 'A modern jazz ensemble looking to expand our sound with additional members.',
        needs: ['Bass', 'Drums']
    },
    {
        id: 2,
        name: 'Electric Storm',
        genre: 'Rock',
        memberCount: 2,
        description: 'Hard rock duo seeking additional members to complete the lineup.',
        needs: ['Guitar', 'Vocals']
    },
    {
        id: 3,
        name: 'Acoustic Vibes',
        genre: 'Folk',
        memberCount: 2,
        description: 'Folk duo looking for additional acoustic instruments and harmonies.',
        needs: ['Violin', 'Vocals']
    }
]);

// Search and filters
const searchTerm = ref('');
const selectedGenre = ref(null);

const filteredBands = computed(() => {
    return bands.value.filter(band => {
        const matchesSearch = !searchTerm.value || 
            band.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            band.description.toLowerCase().includes(searchTerm.value.toLowerCase());
        const matchesGenre = !selectedGenre.value || band.genre === selectedGenre.value.name;
        
        return matchesSearch && matchesGenre;
    });
});

// Create band form
const bandForm = ref({
    name: '',
    genre: null,
    description: '',
    lookingFor: []
});

// Actions
const requestToJoin = (bandId: number) => {
    console.log('Requesting to join band:', bandId);
    // Would send join request to backend
};

const createBand = () => {
    console.log('Creating band:', bandForm.value);
    // Would create band and make user the leader
};

const resetBandForm = () => {
    bandForm.value = {
        name: '',
        genre: null,
        description: '',
        lookingFor: []
    };
};
</script>

<style scoped>
.join-create-band {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}

.search-section {
    margin-bottom: 2rem;
}

.search-filters {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
}

.bands-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.band-card {
    width: 100%;
}

.band-needs {
    margin-top: 1rem;
}

.needs-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field.span-2 {
    grid-column: 1 / -1;
}

.field label {
    font-weight: 600;
    color: var(--p-text-color);
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
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
</style> 