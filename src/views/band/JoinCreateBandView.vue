<template>
    <div class="join-create-band">
        <TabView v-if="!currentUserProfile.hasCreatedBand" v-model:activeIndex="activeTab" @update:activeIndex="updateRoute">
            <TabPanel header="Join a Band" value="join">
                <div v-if="currentUserProfile.hasPendingRequest" class="notice-message">
                    <i class="pi pi-info-circle"></i>
                    <div class="pending-request-details">
                        <h4>Pending Band Request</h4>
                        <template v-if="(currentUserProfile as any).pendingRequests && (currentUserProfile as any).pendingRequests.length > 0">
                            <div v-for="request in (currentUserProfile as any).pendingRequests" 
                                 :key="request.id" 
                                 class="request-card">
                                <div class="request-info">
                                    <strong>{{ request.bandName }}</strong>
                                    <span v-if="request.bandGenre" class="genre-badge">{{ request.bandGenre }}</span>
                                </div>
                                <div v-if="request.message" class="request-message">
                                    <em>"{{ request.message }}"</em>
                                </div>
                                <div class="request-date">
                                    Submitted: {{ new Date(request.timeCreated).toLocaleDateString() }}
                                </div>
                            </div>
                        </template>
                        <p class="restriction-text">You cannot send more requests or create a band until this is resolved.</p>
                    </div>
                </div>
                <div v-else-if="currentUserProfile.hasCreatedBand" class="notice-message">
                     <i class="pi pi-info-circle"></i>
                    You have already created a band. You cannot join another or create more.
                </div>
                <div v-else>
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
                                optionValue="value"
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
                                <div class="band-needs" v-if="band.needs && band.needs.length > 0">
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
                                    :disabled="currentUserProfile.hasPendingRequest || currentUserProfile.hasCreatedBand"
                            />
                        </template>
                    </Card>
                </div>

                <div v-else class="empty-state">
                    <i class="pi pi-users" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
                    <h3>No bands found</h3>
                        <p>Try adjusting your search or create your own band (if eligible)</p>
                    </div>
                </div>
            </TabPanel>

            <TabPanel header="Create a Band" value="create">
                 <div v-if="currentUserProfile.hasCreatedBand" class="notice-message">
                     <i class="pi pi-info-circle"></i>
                    You have already created a band. You cannot create another.
                </div>
                 <div v-else-if="currentUserProfile.hasPendingRequest" class="notice-message">
                    <i class="pi pi-info-circle"></i>
                    <div class="pending-request-details">
                        <h4>Pending Band Request</h4>
                        <template v-if="(currentUserProfile as any).pendingRequests && (currentUserProfile as any).pendingRequests.length > 0">
                            <div v-for="request in (currentUserProfile as any).pendingRequests" 
                                 :key="request.id" 
                                 class="request-card">
                                <div class="request-info">
                                    <strong>{{ request.bandName }}</strong>
                                    <span v-if="request.bandGenre" class="genre-badge">{{ request.bandGenre }}</span>
                                </div>
                                <div v-if="request.message" class="request-message">
                                    <em>"{{ request.message }}"</em>
                                </div>
                                <div class="request-date">
                                    Submitted: {{ new Date(request.timeCreated).toLocaleDateString() }}
                                </div>
                            </div>
                        </template>
                        <p class="restriction-text">You cannot create a band while you have a pending request.</p>
                    </div>
                </div>
                <Card v-else class="create-band-form">
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
                                    optionValue="value" 
                                    placeholder="Select genre"
                                />
                            </div>

                            <div class="field">
                                <label for="bandLocation">Location (Optional)</label>
                                <InputText 
                                    id="bandLocation" 
                                    v-model="bandForm.location" 
                                    placeholder="City, State"
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
                            

                        </div>
                        
                        <div class="form-actions">
                            <Button 
                                label="Create Band" 
                                icon="pi pi-plus" 
                                @click="createBand"
                                :disabled="currentUserProfile.hasCreatedBand || currentUserProfile.hasPendingRequest"
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

            <TabPanel header="Browse Bands" value="browse">
                <BrowseBandsComponent />
            </TabPanel>
        </TabView>
        <div v-else class="notice-message already-created-band-message">
            <i class="pi pi-check-circle"></i>
            You have successfully created a band! Manage your band from your dashboard.
            <Button label="Go to My Band" @click="goToMyBand" class="p-button-sm p-button-raised p-button-primary" style="margin-top: 1rem;"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// Import dedicated CSS file
import '@/assets/views/join-create-band.css';
import Card from 'primevue/card';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { useReferenceData } from '@/composables/useReferenceData';
import BrowseBandsComponent from '@/components/events/BrowseBandsComponent.vue';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { genres, initializeGenres } = useReferenceData();

// Active tab index (0 = Join, 1 = Create, 2 = Browse)
const activeTab = ref(0);

// --- Data Interfaces (aligned with core_db_structure.sql) ---
interface BandListItem {
    id: string;
    name: string;
    genre: string;
    memberCount: number;
    description: string;
    location?: string;
    needs?: string[];
}

interface BandForm {
    name: string;
    genre: string | null;
    description: string;
    location?: string | null;
}

interface UserBandStatus {
    isMemberOfBand: boolean;
    hasPendingRequest: boolean;
    hasCreatedBand: boolean;
    memberBands: Array<{
        id: string;
        name: string;
        role: string;
    }>;
}

// --- Reactive Data ---
const currentUserId = ref('2'); // TODO: Get from auth/session - using test user
const currentUserProfile = ref<UserBandStatus>({
    isMemberOfBand: false,
    hasCreatedBand: false, 
    hasPendingRequest: false,
    memberBands: []
});

const bands = ref<BandListItem[]>([]);
const loading = ref(true);
const searchTerm = ref('');
const selectedGenre = ref<string | null>(null);

const bandForm = ref<BandForm>({
    name: '',
    genre: null,
    description: '',
    location: ''
});

// --- Computed Properties ---
const filteredBands = computed(() => {
    return bands.value.filter(band => {
        const matchesSearch = !searchTerm.value || 
            band.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            band.description.toLowerCase().includes(searchTerm.value.toLowerCase());
        const matchesGenre = !selectedGenre.value || band.genre === selectedGenre.value;
        
        return matchesSearch && matchesGenre;
    });
});

// --- API Functions ---
const fetchUserBandStatus = async () => {
    try {
        const response = await fetch(`/api/users/${currentUserId.value}/band-status`);
        if (!response.ok) throw new Error('Failed to fetch user band status');
        
        const status: UserBandStatus = await response.json();
        currentUserProfile.value = status;
    } catch (error) {
        console.error('Error fetching user band status:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load your band status',
            life: 3000
        });
    }
};

const fetchBands = async () => {
    try {
        const response = await fetch('/api/bands');
        if (!response.ok) throw new Error('Failed to fetch bands');
        
        const bandsData: BandListItem[] = await response.json();
        bands.value = bandsData.map(band => ({
            id: band.id,
            name: band.name,
            genre: band.genre || 'Unknown',
            memberCount: band.memberCount,
            description: band.description || 'No description available.',
            location: band.location,
            needs: band.needs || []
        }));
    } catch (error) {
        console.error('Error fetching bands:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load available bands',
            life: 3000
        });
    }
};

const requestToJoin = async (bandId: string) => {
    if (currentUserProfile.value.hasCreatedBand || currentUserProfile.value.hasPendingRequest) return;
    
    try {
        const response = await fetch(`/api/bands/${bandId}/join-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUserId.value,
                message: 'I would like to join your band.'
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send join request');
        }
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Join request sent successfully!',
            life: 3000
        });
        
        // Refresh user status
        await fetchUserBandStatus();
        
    } catch (error) {
        console.error('Error requesting to join band:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to send join request',
            life: 3000
        });
    }
};

const createBand = async () => {
    if (currentUserProfile.value.hasCreatedBand || currentUserProfile.value.hasPendingRequest) return;
    
    if (!bandForm.value.name.trim()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Band name is required',
            life: 3000
        });
        return;
    }
    
    try {
        const response = await fetch('/api/bands', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: bandForm.value.name.trim(),
                genre: bandForm.value.genre,
                description: bandForm.value.description.trim(),
                location: bandForm.value.location?.trim(),
                creatorUserId: currentUserId.value
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create band');
        }
        
        const result = await response.json();
        const createdBand = result.band;
        const updatedUser = result.updatedUser;
        
        // Update localStorage with new user role
        if (updatedUser) {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Band "${createdBand.name}" created successfully! You are now the band leader.`,
            life: 5000
        });
        
        // Refresh user status
        await fetchUserBandStatus();
        
        // Clear form
        resetBandForm();
        
        // Redirect to band management page
        setTimeout(() => {
            router.push('/my-band');
        }, 1000);
        
    } catch (error) {
        console.error('Error creating band:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to create band',
            life: 3000
        });
    }
};

const resetBandForm = () => {
    bandForm.value = {
        name: '',
        genre: null,
        description: '',
        location: ''
    };
};

const goToMyBand = () => {
    router.push('/my-band');
};

// Update URL when tab changes
const updateRoute = (index: number) => {
    const tabName = index === 2 ? 'browse' : index === 1 ? 'create' : 'join';
    router.replace({ query: { ...route.query, tab: tabName } });
};

// --- Lifecycle ---
onMounted(async () => {
    await initializeGenres();
    
    // Set initial tab based on route query
    const tab = route.query.tab as string;
    if (tab === 'browse') {
        activeTab.value = 2;
    } else if (tab === 'create') {
        activeTab.value = 1;
    } else {
        activeTab.value = 0; // default to join
    }
    
    try {
        loading.value = true;
        
        // Fetch data
        await Promise.all([
            fetchUserBandStatus(),
            fetchBands()
        ]);
        
    } catch (error) {
        console.error('Error during component initialization:', error);
        toast.add({
            severity: 'error', 
            summary: 'Initialization Error',
            detail: 'Failed to load component data',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
});
</script>

<!-- Styles moved to dedicated CSS file: src/assets/views/join-create-band.css --> 