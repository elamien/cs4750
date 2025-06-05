<template>
    <div class="my-events-content">
        <div class="header-actions">
            <Button 
                label="Create New Event" 
                icon="pi pi-plus" 
                @click="openCreateEventDialog"
            />
        </div>
        
        <div v-if="loading" class="loading-state">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
            <p>Loading your events...</p>
        </div>

        <div v-else-if="events.length === 0" class="empty-state">
            <Card>
                <template #content>
                    <div class="empty-content">
                        <i class="pi pi-calendar" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
                        <h3>No Events Yet</h3>
                        <p>You haven't created any events yet. Create your first event to get started!</p>
                        <Button 
                            label="Create Event" 
                            icon="pi pi-plus" 
                            @click="openCreateEventDialog"
                        />
                    </div>
                </template>
            </Card>
        </div>

        <div v-else class="events-grid">
            <Card v-for="event in events" :key="event.id" class="event-card">
                <template #title>
                    <div class="event-header">
                        <span>{{ event.eventTitle }}</span>
                        <Badge 
                            :value="event.status" 
                            :severity="getStatusSeverity(event.status)"
                        />
                    </div>
                </template>
                <template #subtitle>
                    <div class="event-meta">
                        <span><i class="pi pi-calendar"></i> {{ formatDate(event.eventDate) }}</span>
                        <span><i class="pi pi-clock"></i> {{ getTimeSlotText(event.timeSlot) }}</span>
                        <span><i class="pi pi-map-marker"></i> {{ event.location || 'Venue TBD' }}</span>
                    </div>
                </template>
                <template #content>
                    <p>{{ event.description || 'No description provided.' }}</p>
                    
                    <div class="event-details">
                        <div v-if="event.genre" class="detail-item">
                            <strong>Genre:</strong> {{ event.genre }}
                        </div>
                        
                        <div class="detail-item">
                            <strong>Status:</strong>
                            <span v-if="event.status === 'open'">Looking for bands</span>
                            <span v-else-if="event.status === 'filled'">Band assigned</span>
                            <span v-else>{{ event.status }}</span>
                        </div>
                        
                        <div v-if="event.bandName" class="detail-item">
                            <strong>Performing:</strong> {{ event.bandName }}
                        </div>
                        
                        <div v-if="event.pendingInvitations > 0" class="detail-item">
                            <strong>Pending Invitations:</strong> {{ event.pendingInvitations }}
                        </div>
                    </div>
                </template>
                <template #footer>
                    <div class="event-actions">
                        <Button 
                            label="Edit" 
                            icon="pi pi-pencil" 
                            severity="secondary"
                            @click="editEvent(event)"
                        />
                        <Button 
                            v-if="event.status === 'open'" 
                            label="Invite Band" 
                            icon="pi pi-send" 
                            severity="success"
                            @click="openInviteBandDialog(event)"
                        />
                        <Button 
                            label="Delete" 
                            icon="pi pi-trash" 
                            severity="danger"
                            outlined
                            @click="confirmDelete(event)"
                        />
                    </div>
                </template>
            </Card>
        </div>

        <!-- All dialogs (create, edit, invite, delete) -->
        <!-- Create Event Dialog -->
        <Dialog 
            v-model:visible="createDialog" 
            header="Create Event"
            :style="{ width: '600px' }"
            :modal="true"
        >
            <div class="create-form">
                <div class="field">
                    <label for="create-title">Event Title *</label>
                    <InputText 
                        id="create-title" 
                        v-model="createForm.eventTitle" 
                        placeholder="Enter event title"
                    />
                </div>
                
                <div class="field">
                    <label for="create-location">Location</label>
                    <InputText 
                        id="create-location" 
                        v-model="createForm.location" 
                        placeholder="Event location"
                    />
                </div>
                
                <div class="field">
                    <label for="create-genre">Genre</label>
                    <Dropdown 
                        id="create-genre" 
                        v-model="createForm.genre" 
                        :options="genres" 
                        optionLabel="name" 
                        optionValue="value"
                        placeholder="Select event genre"
                    />
                </div>
                
                <div class="field">
                    <label for="create-date">Date *</label>
                    <Calendar 
                        id="create-date" 
                        v-model="createForm.eventDate" 
                        placeholder="Select event date"
                        dateFormat="yy-mm-dd"
                        :minDate="new Date()"
                        @date-select="onCreateDateSelect"
                    />
                </div>
                
                <div class="field">
                    <label for="create-timeSlot">Time Slot *</label>
                    <Dropdown 
                        id="create-timeSlot" 
                        v-model="createForm.timeSlot" 
                        :options="createTimeSlotOptions" 
                        optionLabel="label" 
                        optionValue="value"
                        placeholder="Select time slot"
                    />
                </div>
                
                <div class="field">
                    <label for="create-description">Description</label>
                    <Textarea 
                        id="create-description" 
                        v-model="createForm.description" 
                        rows="4" 
                        placeholder="Describe your event..."
                    />
                </div>
            </div>
            
            <template #footer>
                <Button 
                    label="Cancel" 
                    icon="pi pi-times" 
                    @click="createDialog = false" 
                    severity="secondary"
                />
                <Button 
                    label="Create Event" 
                    icon="pi pi-plus" 
                    @click="createEvent"
                    :disabled="!isCreateFormValid"
                    :loading="creating"
                />
            </template>
        </Dialog>

        <!-- Edit Event Dialog -->
        <Dialog 
            v-model:visible="editDialog" 
            header="Edit Event"
            :style="{ width: '600px' }"
            :modal="true"
        >
            <div v-if="editingEvent" class="edit-form">
                <div class="field">
                    <label for="edit-title">Event Title</label>
                    <InputText 
                        id="edit-title" 
                        v-model="editForm.eventTitle" 
                        placeholder="Enter event title"
                    />
                </div>
                
                <div class="field">
                    <label for="edit-location">Location</label>
                    <InputText 
                        id="edit-location" 
                        v-model="editForm.location" 
                        placeholder="Event location"
                    />
                </div>
                
                <div class="field">
                    <label for="edit-genre">Genre</label>
                    <Dropdown 
                        id="edit-genre" 
                        v-model="editForm.genre" 
                        :options="genres" 
                        optionLabel="name" 
                        optionValue="value"
                        placeholder="Select event genre"
                    />
                </div>
                
                <div class="field">
                    <label for="edit-date">Date</label>
                    <Calendar 
                        id="edit-date" 
                        v-model="editForm.eventDate" 
                        placeholder="Select event date"
                        dateFormat="yy-mm-dd"
                        :minDate="new Date()"
                        @date-select="onEditDateSelect"
                    />
                </div>
                
                <div class="field">
                    <label for="edit-timeSlot">Time Slot</label>
                    <Dropdown 
                        id="edit-timeSlot" 
                        v-model="editForm.timeSlot" 
                        :options="editTimeSlotOptions" 
                        optionLabel="label" 
                        optionValue="value"
                        placeholder="Select time slot"
                    />
                </div>
                
                <div class="field">
                    <label for="edit-description">Description</label>
                    <Textarea 
                        id="edit-description" 
                        v-model="editForm.description" 
                        rows="4" 
                        placeholder="Describe your event..."
                    />
                </div>
            </div>
            
            <template #footer>
                <Button 
                    label="Cancel" 
                    icon="pi pi-times" 
                    @click="editDialog = false" 
                    severity="secondary"
                />
                <Button 
                    label="Save Changes" 
                    icon="pi pi-check" 
                    @click="saveEvent"
                    :loading="saving"
                />
            </template>
        </Dialog>

        <!-- Invite Band Dialog -->
        <Dialog 
            v-model:visible="inviteBandDialog" 
            header="Invite Band to Event"
            :style="{ width: '600px' }"
            :modal="true"
        >
            <div v-if="selectedEvent" class="invite-content">
                <h4>{{ selectedEvent.eventTitle }}</h4>
                <p>{{ formatDate(selectedEvent.eventDate) }} • {{ getTimeSlotText(selectedEvent.timeSlot) }}</p>
                
                <div v-if="loadingBands" class="loading-bands">
                    <i class="pi pi-spin pi-spinner"></i>
                    <span>Loading available bands...</span>
                </div>
                
                <div v-else-if="availableBands.length === 0" class="no-bands">
                    <p>No bands are available for this date/time slot.</p>
                </div>
                
                <div v-else class="bands-selection">
                    <div class="field">
                        <label for="select-band">Select Band</label>
                        <Dropdown 
                            id="select-band" 
                            v-model="selectedBand" 
                            :options="availableBands" 
                            optionLabel="name" 
                            optionValue="id"
                            placeholder="Choose a band to invite"
                        />
                    </div>
                    
                    <div v-if="selectedBand" class="band-details">
                        <h5>Band Details:</h5>
                        <div class="band-info">
                            <p><strong>Genre:</strong> {{ selectedBandDetails?.genre || 'N/A' }}</p>
                            <p><strong>Members:</strong> {{ selectedBandDetails?.memberCount || 0 }}</p>
                            <p><strong>Events Played:</strong> {{ selectedBandDetails?.total_events_played || 0 }}</p>
                            <p v-if="selectedBandDetails?.description">
                                <strong>Description:</strong> {{ selectedBandDetails.description }}
                            </p>
                        </div>
                    </div>
                    
                    <div class="field">
                        <label for="invite-message">Message (Optional)</label>
                        <Textarea 
                            id="invite-message" 
                            v-model="inviteMessage" 
                            rows="3" 
                            placeholder="Add a message for the band..."
                        />
                    </div>
                </div>
            </div>
            
            <template #footer>
                <Button 
                    label="Cancel" 
                    icon="pi pi-times" 
                    @click="inviteBandDialog = false" 
                    severity="secondary"
                />
                <Button 
                    label="Send Invitation" 
                    icon="pi pi-send" 
                    @click="sendInvitation"
                    :disabled="!selectedBand"
                    :loading="sending"
                />
            </template>
        </Dialog>

        <!-- Confirm Delete Dialog -->
        <Dialog 
            v-model:visible="deleteDialog" 
            header="Confirm Delete"
            :style="{ width: '450px' }"
            :modal="true"
        >
            <div v-if="eventToDelete" class="delete-content">
                <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--p-orange-500); margin-right: 1rem;"></i>
                <div>
                    <p>Are you sure you want to delete this event?</p>
                    <p><strong>{{ eventToDelete.eventTitle }}</strong></p>
                    <p class="warning-text">This action cannot be undone.</p>
                </div>
            </div>
            
            <template #footer>
                <Button 
                    label="Cancel" 
                    icon="pi pi-times" 
                    @click="deleteDialog = false" 
                    severity="secondary"
                />
                <Button 
                    label="Delete" 
                    icon="pi pi-trash" 
                    @click="deleteEvent"
                    severity="danger"
                    :loading="deleting"
                />
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Badge from 'primevue/badge';
import { useReferenceData } from '@/composables/useReferenceData';

const toast = useToast();
const { genres, initializeGenres } = useReferenceData();

// Current user (placeholder)
const currentUserId = ref('2');

// Data interfaces
interface MyEvent {
    id: string;
    userId: string;
    eventTitle: string;
    eventDate: string;
    timeSlot: number;
    datetime: string;
    location?: string;
    genre?: string;
    status: 'open' | 'filled' | 'expired';
    description?: string;
    assignedBandId?: string;
    bandName?: string;
    pendingInvitations: number;
}

interface AvailableBand {
    id: string;
    name: string;
    genre?: string;
    memberCount?: number;
    description?: string;
    total_events_played?: number;
}

// State
const loading = ref(false);
const events = ref<MyEvent[]>([]);

// Dialog states
const createDialog = ref(false);
const editDialog = ref(false);
const inviteBandDialog = ref(false);
const deleteDialog = ref(false);

// Loading states
const creating = ref(false);
const saving = ref(false);
const sending = ref(false);
const deleting = ref(false);
const loadingBands = ref(false);

// Form data
const createForm = ref({
    eventTitle: '',
    eventDate: null as Date | null,
    timeSlot: null as number | null,
    location: '',
    genre: '',
    description: ''
});

const editForm = ref({
    eventTitle: '',
    eventDate: null as Date | null,
    timeSlot: null as number | null,
    location: '',
    genre: '',
    description: ''
});

// Edit/Invite data
const editingEvent = ref<MyEvent | null>(null);
const selectedEvent = ref<MyEvent | null>(null);
const eventToDelete = ref<MyEvent | null>(null);

// Band invitation data
const availableBands = ref<AvailableBand[]>([]);
const selectedBand = ref<string | null>(null);
const inviteMessage = ref('');

// Time slot options
const allTimeSlots = [
    { label: '8:00 AM - 9:00 AM', value: 1 },
    { label: '9:00 AM - 10:00 AM', value: 2 },
    { label: '10:00 AM - 11:00 AM', value: 3 },
    { label: '11:00 AM - 12:00 PM', value: 4 }
];

// Available slots for create/edit
const createAvailableSlots = ref<number[]>([]);
const editAvailableSlots = ref<number[]>([]);

// Computed properties
const createTimeSlotOptions = computed(() => 
    allTimeSlots.filter(slot => createAvailableSlots.value.includes(slot.value))
);

const editTimeSlotOptions = computed(() => 
    allTimeSlots.filter(slot => editAvailableSlots.value.includes(slot.value))
);

const selectedBandDetails = computed(() => 
    availableBands.value.find(band => band.id === selectedBand.value)
);

const isCreateFormValid = computed(() => 
    createForm.value.eventTitle && 
    createForm.value.eventDate && 
    createForm.value.timeSlot
);

// Utility functions
const formatDate = (dateString: string): string => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

const getTimeSlotText = (timeSlot: number): string => {
    const timeSlotMapping = {
        1: '8:00 AM - 9:00 AM',
        2: '9:00 AM - 10:00 AM',
        3: '10:00 AM - 11:00 AM',
        4: '11:00 AM - 12:00 PM'
    };
    return timeSlotMapping[timeSlot as keyof typeof timeSlotMapping] || 'Unknown Time';
};

const getStatusSeverity = (status: string) => {
    switch (status) {
        case 'open': return 'success';
        case 'filled': return 'info';
        case 'expired': return 'warning';
        default: return 'secondary';
    }
};

// API functions
const API_BASE_URL = 'http://localhost:3001/api';

const fetchMyEvents = async () => {
    loading.value = true;
    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId.value}/events`);
        if (!response.ok) throw new Error('Failed to fetch events');
        
        const data = await response.json();
        events.value = data.map((event: any) => ({
            ...event,
            id: String(event.id),
            userId: String(event.userId),
            assignedBandId: event.assignedBandId ? String(event.assignedBandId) : null
        }));
    } catch (error) {
        console.error('Failed to fetch events:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load your events',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

// Dialog functions
const openCreateEventDialog = () => {
    createForm.value = {
        eventTitle: '',
        eventDate: null,
        timeSlot: null,
        location: '',
        genre: '',
        description: ''
    };
    createAvailableSlots.value = [];
    createDialog.value = true;
};

const editEvent = (event: MyEvent) => {
    editingEvent.value = event;
    editForm.value = {
        eventTitle: event.eventTitle,
        eventDate: new Date(event.eventDate),
        timeSlot: event.timeSlot,
        location: event.location || '',
        genre: event.genre || '',
        description: event.description || ''
    };
    editAvailableSlots.value = [];
    editDialog.value = true;
    
    // Load available slots for edit date
    if (editForm.value.eventDate) {
        onEditDateSelect();
    }
};

const confirmDelete = (event: MyEvent) => {
    eventToDelete.value = event;
    deleteDialog.value = true;
};

const openInviteBandDialog = async (event: MyEvent) => {
    selectedEvent.value = event;
    selectedBand.value = null;
    inviteMessage.value = '';
    inviteBandDialog.value = true;
    
    // Load available bands
    await loadAvailableBands(event.id);
};

// Date selection handlers
const onCreateDateSelect = async () => {
    if (createForm.value.eventDate) {
        const dateStr = createForm.value.eventDate.toISOString().split('T')[0];
        await loadAvailableSlots(dateStr, 'create');
    }
};

const onEditDateSelect = async () => {
    if (editForm.value.eventDate) {
        const dateStr = editForm.value.eventDate.toISOString().split('T')[0];
        await loadAvailableSlots(dateStr, 'edit', editingEvent.value?.id);
    }
};

const loadAvailableSlots = async (dateStr: string, type: 'create' | 'edit', excludeEventId?: string) => {
    try {
        const params = new URLSearchParams({ date: dateStr });
        if (excludeEventId) {
            params.append('excludeEventId', excludeEventId);
        }
        
        const response = await fetch(`${API_BASE_URL}/events/available-slots?${params}`);
        if (!response.ok) throw new Error('Failed to fetch available slots');
        
        const { availableSlots } = await response.json();
        
        if (type === 'create') {
            createAvailableSlots.value = availableSlots;
            if (!availableSlots.includes(createForm.value.timeSlot)) {
                createForm.value.timeSlot = null;
            }
        } else {
            editAvailableSlots.value = availableSlots;
            if (!availableSlots.includes(editForm.value.timeSlot)) {
                editForm.value.timeSlot = null;
            }
        }
    } catch (error) {
        console.error('Failed to load available slots:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load available time slots',
            life: 3000
        });
    }
};

const loadAvailableBands = async (eventId: string) => {
    loadingBands.value = true;
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/available-bands`);
        if (!response.ok) throw new Error('Failed to fetch available bands');
        
        availableBands.value = await response.json();
    } catch (error) {
        console.error('Failed to load available bands:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load available bands',
            life: 3000
        });
    } finally {
        loadingBands.value = false;
    }
};

// CRUD operations
const createEvent = async () => {
    if (!isCreateFormValid.value) return;
    
    creating.value = true;
    try {
        const eventData = {
            eventTitle: createForm.value.eventTitle,
            eventDate: createForm.value.eventDate?.toISOString().split('T')[0],
            timeSlot: createForm.value.timeSlot,
            location: createForm.value.location || null,
            genre: createForm.value.genre || null,
            description: createForm.value.description || null
        };
        
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create event');
        }
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Event created successfully',
            life: 3000
        });
        
        createDialog.value = false;
        await fetchMyEvents();
    } catch (error) {
        console.error('Failed to create event:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to create event',
            life: 3000
        });
    } finally {
        creating.value = false;
    }
};

const saveEvent = async () => {
    if (!editingEvent.value) return;
    
    saving.value = true;
    try {
        const eventData = {
            eventTitle: editForm.value.eventTitle,
            eventDate: editForm.value.eventDate?.toISOString().split('T')[0],
            timeSlot: editForm.value.timeSlot,
            location: editForm.value.location || null,
            genre: editForm.value.genre || null,
            description: editForm.value.description || null
        };
        
        const response = await fetch(`${API_BASE_URL}/events/${editingEvent.value.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update event');
        }
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Event updated successfully',
            life: 3000
        });
        
        editDialog.value = false;
        await fetchMyEvents();
    } catch (error) {
        console.error('Failed to update event:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to update event',
            life: 3000
        });
    } finally {
        saving.value = false;
    }
};

const deleteEvent = async () => {
    if (!eventToDelete.value) return;
    
    deleting.value = true;
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventToDelete.value.id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete event');
        }
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Event deleted successfully',
            life: 3000
        });
        
        deleteDialog.value = false;
        await fetchMyEvents();
    } catch (error) {
        console.error('Failed to delete event:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to delete event',
            life: 3000
        });
    } finally {
        deleting.value = false;
    }
};

const sendInvitation = async () => {
    if (!selectedEvent.value || !selectedBand.value) return;
    
    sending.value = true;
    try {
        const response = await fetch(`${API_BASE_URL}/events/${selectedEvent.value.id}/invite-band`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bandId: selectedBand.value,
                message: inviteMessage.value || null
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send invitation');
        }
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Invitation sent successfully',
            life: 3000
        });
        
        inviteBandDialog.value = false;
        await fetchMyEvents();
    } catch (error) {
        console.error('Failed to send invitation:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to send invitation',
            life: 3000
        });
    } finally {
        sending.value = false;
    }
};

// Initialize
onMounted(async () => {
    await initializeGenres();
    await fetchMyEvents();
});
</script>

<style scoped>
.my-events-content {
    padding: 1.5rem;
    color: var(--theme-main-text);
}

.header-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1.5rem;
}

.loading-state, .empty-state {
    text-align: center;
    padding: 3rem;
}

.empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
}

.event-card {
    height: fit-content;
}

.event-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.event-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
    color: var(--theme-secondary-text);
}

.event-meta span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.event-details {
    margin-top: 1rem;
}

.detail-item {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.detail-item strong {
    color: var(--theme-main-text);
}

.event-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.field label {
    font-weight: 600;
    color: var(--theme-main-text);
}

.delete-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.warning-text {
    color: var(--p-orange-500);
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

.invite-content h4 {
    margin: 0 0 0.5rem 0;
    color: var(--p-primary-color);
}

.band-details {
    background: var(--p-surface-100);
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
}

.band-details h5 {
    margin: 0 0 0.5rem 0;
    color: var(--p-text-color);
}

.band-info p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
}

.loading-bands {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    text-align: center;
}

.no-bands {
    padding: 1rem;
    text-align: center;
    color: var(--p-text-muted-color);
}

@media (max-width: 768px) {
    .events-grid {
        grid-template-columns: 1fr;
    }
    
    .event-actions {
        flex-direction: column;
    }
    
    .event-header {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style> 