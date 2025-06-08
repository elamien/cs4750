<template>
    <div class="join-create-band">
        <!-- Glass Submenu -->
        <GlassSubmenu 
            v-if="!loading && activeSection"
            title="Band Management"
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
            
            <!-- Join a Band Section -->
            <div v-if="activeSection === 'join'" class="content-section">
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
                                <div class="request-actions">
                                    <Button 
                                        label="Cancel Request" 
                                        icon="pi pi-times" 
                                        severity="secondary" 
                                        size="small"
                                        @click="cancelRequest(request.id, request.bandId)"
                                        :loading="cancellingRequestId === request.id"
                                    />
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
            </div>

            <!-- Create a Band Section -->
            <div v-if="activeSection === 'create'" class="content-section">
                 <div v-if="currentUserProfile.hasCreatedBand" class="notice-message">
                     <i class="pi pi-info-circle"></i>
                    <div>
                        <p>You have already created a band. You cannot create another.</p>
                        <Button 
                            label="Manage My Band" 
                            icon="pi pi-cog" 
                            @click="activeSection = 'my-band'"
                            style="margin-top: 1rem;"
                        />
                    </div>
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
                                <div class="request-actions">
                                    <Button 
                                        label="Cancel Request" 
                                        icon="pi pi-times" 
                                        severity="secondary" 
                                        size="small"
                                        @click="cancelRequest(request.id, request.bandId)"
                                        :loading="cancellingRequestId === request.id"
                                    />
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
                                    :class="{ 'p-invalid': bandFormErrors.name }"
                                    @input="validateBandForm"
                                />
                                <small v-if="bandFormErrors.name" class="p-error">{{ bandFormErrors.name }}</small>
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
                                    :class="{ 'p-invalid': bandFormErrors.description }"
                                    @input="validateBandForm"
                                    maxlength="255"
                                />
                                <div class="field-footer">
                                    <small v-if="bandFormErrors.description" class="p-error">{{ bandFormErrors.description }}</small>
                                    <small class="char-count" :class="{ 'char-limit-warning': bandForm.description.length > 230 }">
                                        {{ bandForm.description.length }}/255 characters
                                    </small>
                                </div>
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
            </div>

            <!-- Browse Bands Section -->
            <div v-if="activeSection === 'browse'" class="content-section">
                <BrowseBandsComponent />
            </div>

            <!-- My Band Section -->
            <div v-if="activeSection === 'my-band' && currentUserProfile.isMemberOfBand" class="content-section">
                <MyBandComponent />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuth } from '@/composables/useAuth';

// Import dedicated CSS file
import '@/assets/views/join-create-band.css';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import BrowseBandsComponent from '@/components/events/BrowseBandsComponent.vue';
import MyBandComponent from './MyBandView.vue';
import GlassSubmenu from '@/components/ui/GlassSubmenu.vue';
import { useReferenceData } from '@/composables/useReferenceData';
import { containsProfanity } from '@/utils/profanityFilter';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { genres, initializeGenres } = useReferenceData();
const { getUserId } = useAuth();

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
const currentUserId = computed(() => getUserId());
const currentUserProfile = ref<UserBandStatus>({
    isMemberOfBand: false,
    hasCreatedBand: false, 
    hasPendingRequest: false,
    memberBands: []
});

// Active section for glass submenu
const activeSection = ref('');

// Submenu items
const submenuItems = computed(() => {
    const items = [];
    
    // Add "My Band" item first if user is member of a band
    if (currentUserProfile.value.isMemberOfBand) {
        items.push({ label: 'My Band', value: 'my-band', icon: 'pi pi-users' });
    }
    
    // Add remaining items in order
    items.push(
        { label: 'Browse Bands', value: 'browse', icon: 'pi pi-search' },
        { label: 'Join a Band', value: 'join', icon: 'pi pi-user-plus' },
        { label: 'Create a Band', value: 'create', icon: 'pi pi-plus' }
    );
    
    return items;
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
const bandFormErrors = ref<Record<string, string>>({});
const cancellingRequestId = ref<string | null>(null);

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

// --- Event Handlers ---
const handleSectionChange = (section: string) => {
    activeSection.value = section;
    // Update URL to reflect the current section
    router.replace({ query: { section } });
};

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
            detail: 'Failed to send join request',
            life: 3000
        });
    }
};

const cancelRequest = async (requestId: string, bandId: string) => {
    cancellingRequestId.value = requestId;
    
    try {
        const response = await fetch(`/api/bands/${bandId}/join-requests/${requestId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to cancel request');
        }
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Join request cancelled successfully!',
            life: 3000
        });
        
        // Refresh user status
        await fetchUserBandStatus();
        
    } catch (error) {
        console.error('Error cancelling request:', error);
        toast.add({
            severity: 'error',
            summary: 'Error', 
            detail: 'Failed to cancel join request',
            life: 3000
        });
    } finally {
        cancellingRequestId.value = null;
    }
};

const validateBandForm = () => {
    bandFormErrors.value = {};
    
    if (!bandForm.value.name.trim()) {
        bandFormErrors.value.name = 'Band name is required.';
    } else if (containsProfanity(bandForm.value.name)) {
        bandFormErrors.value.name = 'Inappropriate language is not allowed.';
    }
    
    if (!bandForm.value.description.trim()) {
        bandFormErrors.value.description = 'Description is required.';
    } else if (bandForm.value.description.length > 255) {
        bandFormErrors.value.description = 'Description must be 255 characters or less.';
    } else if (containsProfanity(bandForm.value.description)) {
        bandFormErrors.value.description = 'Inappropriate language is not allowed.';
    }
    
    return Object.keys(bandFormErrors.value).length === 0;
};

const createBand = async () => {
    if (!validateBandForm() || currentUserProfile.value.hasCreatedBand || currentUserProfile.value.hasPendingRequest) {
        return;
    }
    
    
    try {
        const response = await fetch('/api/bands', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: bandForm.value.name,
                genre: bandForm.value.genre,
                description: bandForm.value.description,
                location: bandForm.value.location || null,
                creatorUserId: currentUserId.value
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create band');
        }
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Band created successfully!',
            life: 3000
        });
        
        // Reset form and refresh data
        resetBandForm();
        await fetchUserBandStatus();
        
        // Switch to My Band tab
        activeSection.value = 'my-band';
        
    } catch (error) {
        console.error('Error creating band:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create band',
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
    bandFormErrors.value = {};
};

// --- Lifecycle ---
onMounted(async () => {
    loading.value = true;
    
    // Initialize reference data
    await initializeGenres();
    
    // Load initial data
    await Promise.all([
        fetchUserBandStatus(),
        fetchBands()
    ]);
    
    // Set initial section from URL or default to first item
    const sectionFromUrl = route.query.section as string;
    if (sectionFromUrl && ['join', 'create', 'browse', 'my-band'].includes(sectionFromUrl)) {
        activeSection.value = sectionFromUrl;
    } else {
        // Default to the first item in submenuItems
        const firstItem = submenuItems.value[0];
        if (firstItem) {
            activeSection.value = firstItem.value;
        }
    }
    
    loading.value = false;
});

// Watch for changes in user status to update submenu
watch(() => currentUserProfile.value.isMemberOfBand, () => {
    // The submenu will automatically update due to computed property
}, { deep: true });
</script>

<!-- Styles handled in dedicated CSS file: src/assets/views/join-create-band.css --> 