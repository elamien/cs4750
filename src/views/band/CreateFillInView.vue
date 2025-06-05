<template>
    <div class="create-fill-in">
        <div class="header">
            <h1>Post a Fill-In Request</h1>
            <p>Need a substitute musician for an upcoming event? Post a request here.</p>
        </div>

        <div v-if="loading" class="loading-state">
            <Card>
                <template #content>
                    <div class="loading-content">
                        <i class="pi pi-spinner pi-spin"></i>
                        <p>Loading your band information...</p>
                    </div>
                </template>
            </Card>
        </div>
        
        <div v-else-if="!userBand.id" class="no-band-state">
        <Card>
            <template #content>
                    <div class="empty-content">
                        <i class="pi pi-exclamation-triangle"></i>
                        <h3>No Band Found</h3>
                        <p>You need to be a band leader to create fill-in requests.</p>
                        <Button 
                            label="Go to Band Management" 
                            icon="pi pi-users" 
                            @click="router.push('/join-create-band')"
                        />
                    </div>
                </template>
            </Card>
        </div>

        <div v-else class="fill-in-form-container">
            <Card>
                <template #title>Create Fill-In Request for {{ userBand.name }}</template>
                <template #content>
                    <form @submit.prevent="createFillInRequest" class="fill-in-form">
                        <div class="form-grid">
                            <div class="field span-2">
                                <label for="event">Event *</label>
                                <Dropdown 
                                    id="event"
                                    v-model="form.eventId"
                                    :options="upcomingEvents"
                                    optionLabel="displayName"
                                    optionValue="id"
                                    placeholder="Select the event that needs coverage"
                                    class="w-full"
                                    :class="{ 'p-invalid': !form.eventId && formSubmitted }"
                                />
                                <small v-if="!form.eventId && formSubmitted" class="p-error">Please select an event</small>
                            </div>

                            <div class="field">
                                <label for="slot">Slot *</label>
                                <Dropdown 
                                    id="slot"
                                    v-model="form.slotNumber"
                                    :options="availableSlotOptions"
                                    optionLabel="name"
                                    optionValue="value"
                                    placeholder="Select the slot"
                                    class="w-full"
                                    :class="{ 'p-invalid': !form.slotNumber && formSubmitted }"
                                    :disabled="!form.eventId || availableSlotOptions.length === 0"
                                />
                                <small v-if="!form.slotNumber && formSubmitted" class="p-error">Please select a slot</small>
                                <small v-if="form.eventId && availableSlotOptions.length === 0" class="p-info">
                                    Your band is not scheduled to play any slots for this event
                                </small>
                            </div>

                            <div class="field">
                                <label for="unavailableMember">Unavailable Member *</label>
                                <Dropdown 
                                    id="unavailableMember"
                                    v-model="form.unavailableMemberId"
                                    :options="bandMembers"
                                    optionLabel="fullName"
                                    optionValue="id"
                                    placeholder="Who is unavailable?"
                                    class="w-full"
                                    :class="{ 'p-invalid': !form.unavailableMemberId && formSubmitted }"
                                />
                                <small v-if="!form.unavailableMemberId && formSubmitted" class="p-error">Please select the unavailable member</small>
                            </div>

                            <div class="field">
                                <label for="instrument">Instrument/Role Needed *</label>
                                <Dropdown 
                                    id="instrument"
                                    v-model="form.instrumentNeeded"
                                    :options="instruments"
                                    optionLabel="name"
                                    optionValue="value"
                                    placeholder="What instrument is needed?"
                                    class="w-full"
                                    :class="{ 'p-invalid': !form.instrumentNeeded && formSubmitted }"
                                    editable
                                />
                                <small v-if="!form.instrumentNeeded && formSubmitted" class="p-error">Please specify the instrument needed</small>
                            </div>

                            <div class="field span-2">
                                <label for="description">Requirements & Description *</label>
                                <Textarea 
                                    id="description"
                                    v-model="form.description"
                                    rows="4"
                                    placeholder="Describe the requirements, skill level needed, any special notes..."
                                    class="w-full"
                                    :class="{ 'p-invalid': !form.description && formSubmitted }"
                                />
                                <small v-if="!form.description && formSubmitted" class="p-error">Please provide a description</small>
                            </div>
                        </div>

                        <div class="form-actions">
                            <Button 
                                label="Cancel" 
                                icon="pi pi-times" 
                                @click="router.back()"
                                severity="secondary"
                                outlined
                            />
                            <Button 
                                label="Post Fill-In Request" 
                                icon="pi pi-send" 
                                type="submit"
                                :loading="submitting"
                            />
                        </div>
                    </form>
                </template>
            </Card>

            <!-- Preview Section -->
            <Card v-if="hasFormData" class="preview-card">
                <template #title>
                    <div class="preview-header">
                        <i class="pi pi-eye"></i>
                        <span>Preview</span>
                    </div>
                </template>
                <template #content>
                    <div class="request-preview">
                        <div class="preview-item">
                            <strong>Band:</strong> {{ userBand.name }}
                        </div>
                        <div v-if="selectedEvent" class="preview-item">
                            <strong>Event:</strong> {{ selectedEvent.eventTitle }}
                            <div class="event-details">
                                <span><i class="pi pi-calendar"></i> {{ formatDate(selectedEvent.datetime) }}</span>
                                <span><i class="pi pi-map-marker"></i> {{ selectedEvent.location || 'Location TBD' }}</span>
                            </div>
                        </div>
                        <div v-if="form.slotNumber" class="preview-item">
                            <strong>Time Slot:</strong> {{ getSlotDisplayName(form.slotNumber) }}
                        </div>
                        <div v-if="selectedMember" class="preview-item">
                            <strong>Unavailable Member:</strong> {{ selectedMember.fullName }}
                        </div>
                        <div v-if="form.instrumentNeeded" class="preview-item">
                            <strong>Instrument Needed:</strong> {{ form.instrumentNeeded }}
                        </div>
                        <div v-if="form.description" class="preview-item">
                            <strong>Description:</strong>
                            <p class="description-preview">{{ form.description }}</p>
                        </div>
                    </div>
            </template>
        </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import { useReferenceData } from '@/composables/useReferenceData';

const router = useRouter();
const { instruments, initializeInstruments } = useReferenceData();

// Interfaces
interface BandInfo {
    id: string;
    name: string;
    genre?: string;
}

interface BandMember {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    instrument?: string;
}

interface EventInfo {
    id: string;
    eventTitle: string;
    datetime: string;
    location?: string;
    genre?: string;
    displayName: string;
    slotOne?: string;
    slotTwo?: string;
    slotThree?: string;
    slotFour?: string;
    availableSlots?: number[];
}

interface FillInForm {
    eventId: string;
    slotNumber: number;
    unavailableMemberId: string;
    instrumentNeeded: string;
    description: string;
}

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

const currentUserId = ref(getCurrentUserId());

// State
const loading = ref(true);
const submitting = ref(false);
const formSubmitted = ref(false);

const userBand = ref<BandInfo>({
    id: '',
    name: '',
    genre: ''
});

const bandMembers = ref<BandMember[]>([]);
const upcomingEvents = ref<EventInfo[]>([]);

const form = ref<FillInForm>({
    eventId: '',
    slotNumber: 1,
    unavailableMemberId: '',
    instrumentNeeded: '',
    description: ''
});

// Options
const slotOptions = ref([
    { name: 'Slot 1 (8:00 AM - 9:00 AM)', value: 1, timeRange: '8:00 AM - 9:00 AM' },
    { name: 'Slot 2 (9:00 AM - 10:00 AM)', value: 2, timeRange: '9:00 AM - 10:00 AM' },
    { name: 'Slot 3 (10:00 AM - 11:00 AM)', value: 3, timeRange: '10:00 AM - 11:00 AM' },
    { name: 'Slot 4 (11:00 AM - 12:00 PM)', value: 4, timeRange: '11:00 AM - 12:00 PM' }
]);

const API_BASE_URL = 'http://localhost:3001/api';

// Computed properties
const hasFormData = computed(() => {
    return form.value.eventId || form.value.slotNumber || form.value.unavailableMemberId || 
           form.value.instrumentNeeded || form.value.description;
});

const selectedEvent = computed(() => {
    return upcomingEvents.value.find(event => event.id === form.value.eventId);
});

const selectedMember = computed(() => {
    return bandMembers.value.find(member => member.id === form.value.unavailableMemberId);
});

const isFormValid = computed(() => {
    return form.value.eventId && 
           form.value.slotNumber && 
           form.value.unavailableMemberId && 
           form.value.instrumentNeeded && 
           form.value.description;
});

// Utility functions
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};

const getSlotDisplayName = (slotNumber: number) => {
    const slot = slotOptions.value.find(s => s.value === slotNumber);
    return slot ? slot.name : `Slot ${slotNumber}`;
};

// Computed property for available slot options based on selected event
const availableSlotOptions = computed(() => {
    if (!form.value.eventId || !selectedEvent.value) {
        return [];
    }
    
    const event = selectedEvent.value;
    const bandName = userBand.value.name;
    const availableSlots: number[] = [];
    
    // Check which slots the band is playing in
    if (event.slotOne === bandName) availableSlots.push(1);
    if (event.slotTwo === bandName) availableSlots.push(2);
    if (event.slotThree === bandName) availableSlots.push(3);
    if (event.slotFour === bandName) availableSlots.push(4);
    
    // Return only the slot options where the band is playing
    return slotOptions.value.filter(slot => availableSlots.includes(slot.value));
});

// API functions
const fetchBandEvents = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) throw new Error('Failed to fetch events');
        
        const allEvents = await response.json() as EventInfo[];
        const bandName = userBand.value.name;
        
        // Filter events where this band is playing in any slot
        const bandEvents = allEvents.filter((event: EventInfo) => 
            event.slotOne === bandName || 
            event.slotTwo === bandName || 
            event.slotThree === bandName || 
            event.slotFour === bandName
        );
        
        // Map to the format needed for the dropdown
        upcomingEvents.value = bandEvents.map((event: EventInfo) => ({
            id: event.id,
            eventTitle: event.eventTitle,
            datetime: event.datetime,
            location: event.location,
            genre: event.genre,
            slotOne: event.slotOne,
            slotTwo: event.slotTwo,
            slotThree: event.slotThree,
            slotFour: event.slotFour,
            displayName: `${event.eventTitle} - ${formatDate(event.datetime)}`
        }));
        
    } catch (error) {
        console.error('Error fetching band events:', error);
        alert('Failed to load events');
    }
};
const fetchUserBandInfo = async () => {
    if (!currentUserId.value) {
        console.error('User not authenticated');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId.value}/band-status`);
        if (!response.ok) throw new Error('Failed to fetch user band status');
        
        const bandStatus = await response.json();
        
        if (!bandStatus.isMemberOfBand || bandStatus.memberBands.length === 0) {
            userBand.value = { id: '', name: '', genre: '' };
            return;
        }
        
        // Get the user's band (assuming they only have one)
        const band = bandStatus.memberBands[0];
        userBand.value = {
            id: band.id,
            name: band.name,
            genre: band.genre || ''
        };
        
        // Fetch band members (using mock data for now)
        bandMembers.value = [
            { id: '6', firstName: 'Mike', lastName: 'Member', fullName: 'Mike Member', instrument: 'Guitar' },
            { id: '7', firstName: 'Gary', lastName: 'General', fullName: 'Gary General', instrument: 'Drums' }
        ];
        
        // Fetch events where this band is scheduled to play
        await fetchBandEvents();
        
    } catch (error) {
        console.error('Error fetching user band info:', error);
        alert('Failed to load band information');
    }
};

const createFillInRequest = async () => {
    formSubmitted.value = true;
    
    if (!isFormValid.value) {
        alert('Please fill in all required fields');
        return;
    }

    if (!currentUserId.value) {
        alert('Please sign in to create a fill-in request');
        return;
    }

    submitting.value = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/fill-in-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bandId: userBand.value.id,
                eventId: form.value.eventId,
                slotNumber: form.value.slotNumber,
                fillInMemberId: form.value.unavailableMemberId,
                fillInDescription: form.value.description
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create fill-in request');
        }

        const result = await response.json();
        console.log('Fill-in request created successfully:', result);
        
        alert('Fill-in request posted successfully!');
        router.push('/fill-in-requests');
        
    } catch (error) {
        console.error('Failed to create fill-in request:', error);
        alert('Error creating fill-in request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
        submitting.value = false;
    }
};

// Watch for event changes to reset slot selection
watch(() => form.value.eventId, () => {
    // Reset slot selection when event changes
    form.value.slotNumber = 1;
});

onMounted(async () => {
    loading.value = true;
    
    try {
        await initializeInstruments();
        await fetchUserBandInfo();
    } catch (error) {
        console.error('Error during component initialization:', error);
        alert('Failed to initialize component');
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.create-fill-in {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}

.header h1 {
    color: var(--theme-main-text);
    margin-bottom: 0.5rem;
}

.header p {
    color: var(--theme-secondary-text);
    font-size: 1.1rem;
}

.loading-state, .no-band-state {
    margin-bottom: 2rem;
}

.loading-content, .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    gap: 1rem;
}

.loading-content i {
    font-size: 2rem;
    color: var(--hoojams-orange);
}

.empty-content i {
    font-size: 2rem;
    color: var(--theme-secondary-text);
}

.empty-content h3 {
    margin: 0;
    color: var(--theme-main-text);
}

.fill-in-form-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.fill-in-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
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
    color: var(--theme-main-text);
}

.form-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1rem;
}

/* Preview Section */
.preview-card {
    border: 2px dashed var(--p-surface-border);
    background: var(--p-surface-ground);
}

.preview-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--theme-secondary-text);
}

.request-preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.preview-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.preview-item strong {
    color: var(--theme-main-text);
    font-weight: 600;
}

.event-details {
    display: flex;
    gap: 1rem;
    margin-top: 0.25rem;
    font-size: 0.9rem;
    color: var(--theme-secondary-text);
}

.event-details span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.description-preview {
    margin: 0.5rem 0 0 0;
    padding: 1rem;
    background: var(--p-surface-card);
    border-radius: 6px;
    border-left: 3px solid var(--hoojams-orange);
    white-space: pre-wrap;
    line-height: 1.5;
}

/* Responsive */
@media (max-width: 640px) {
    .create-fill-in {
        padding: 1rem;
    }
    
    .form-grid {
        grid-template-columns: 1fr;
    }
    
    .field.span-2 {
        grid-column: 1;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .event-details {
        flex-direction: column;
        gap: 0.5rem;
    }
}
</style> 