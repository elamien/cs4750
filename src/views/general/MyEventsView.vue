<template>
    <div class="my-events">
        <div class="header">
            <h1>My Events</h1>
            <p>Manage events you've created</p>
        </div>
        
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

        <!-- Edit Event Dialog -->
        <Dialog 
            v-model:visible="editDialog" 
            :header="editingEvent ? 'Edit Event' : 'Create Event'"
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
                    <small v-if="createForm.eventDate && createAvailableSlots.length === 0" class="text-red-500">
                        No available slots for this date
                    </small>
                    <small v-else-if="!createForm.eventDate" class="text-gray-500">
                        Select a date first
                    </small>
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
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import { useReferenceData } from '@/composables/useReferenceData';

const toast = useToast();
const { genres, initializeGenres } = useReferenceData();

interface Event {
    id: string;
    userId: string;
    eventTitle: string;
    eventDate: string;
    timeSlot: number;
    datetime: string;
    location?: string | null;
    genre?: string | null;
    status: 'open' | 'filled' | 'expired';
    description?: string | null;
    assignedBandId?: string | null;
    bandName?: string | null;
    pendingInvitations: number;
}

interface Band {
    id: string;
    name: string;
    genre?: string | null;
    description?: string | null;
    total_events_played: number;
    memberCount: number;
}

interface TimeSlot {
    value: number;
    label: string;
}

// Get current user ID
const getCurrentUserId = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            return user.userId;
        } catch (error) {
            console.error('Error parsing saved user:', error);
            return null;
        }
    }
    return null;
};

const currentUserId = ref(getCurrentUserId());
const API_BASE_URL = 'http://localhost:3001/api';

// Data
const loading = ref(true);
const events = ref<Event[]>([]);

// Edit Dialog
const editDialog = ref(false);
const editingEvent = ref<Event | null>(null);
const saving = ref(false);
const editForm = ref({
    eventTitle: '',
    location: '',
    genre: '',
    eventDate: null as Date | null,
    timeSlot: null as number | null,
    description: ''
});
const editAvailableSlots = ref<TimeSlot[]>([]);

// Invite Band Dialog
const inviteBandDialog = ref(false);
const selectedEvent = ref<Event | null>(null);
const availableBands = ref<Band[]>([]);
const selectedBand = ref<string | null>(null);
const inviteMessage = ref('');
const loadingBands = ref(false);
const sending = ref(false);

// Delete Dialog
const deleteDialog = ref(false);
const eventToDelete = ref<Event | null>(null);
const deleting = ref(false);

// Create Dialog
const createDialog = ref(false);
const creating = ref(false);
const createForm = ref({
    eventTitle: '',
    location: '',
    genre: '',
    eventDate: null as Date | null,
    timeSlot: null as number | null,
    description: ''
});
const createAvailableSlots = ref<TimeSlot[]>([]);
const createTimeSlotOptions = computed(() => {
    if (!createForm.value.eventDate) {
        return [{ value: null, label: 'Please select a date first' }];
    } else if (createAvailableSlots.value.length === 0) {
        return [{ value: null, label: 'No slots available for this date' }];
    } else {
        return createAvailableSlots.value;
    }
});

// Computed
const selectedBandDetails = computed(() => 
    availableBands.value.find(band => band.id === selectedBand.value)
);

const editTimeSlotOptions = computed(() => {
    if (!editForm.value.eventDate) {
        return [{ value: null, label: 'Please select a date first' }];
    } else if (editAvailableSlots.value.length === 0) {
        return [{ value: null, label: 'No slots available for this date' }];
    } else {
        return editAvailableSlots.value;
    }
});

const isCreateFormValid = computed(() => {
    return !!(
        createForm.value.eventTitle &&
        createForm.value.eventDate &&
        createForm.value.timeSlot &&
        currentUserId.value
    );
});

// Utility functions
const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
};

const getTimeSlotText = (slot: number): string => {
    const slotMapping = {
        1: '8:00 AM - 9:00 AM',
        2: '9:00 AM - 10:00 AM',
        3: '10:00 AM - 11:00 AM',
        4: '11:00 AM - 12:00 PM'
    };
    return slotMapping[slot as keyof typeof slotMapping] || 'Unknown';
};

const getStatusSeverity = (status: string) => {
    switch (status) {
        case 'open': return 'info';
        case 'filled': return 'success';
        case 'expired': return 'warning';
        default: return 'secondary';
    }
};

const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// API functions
const fetchEvents = async () => {
    try {
        if (!currentUserId.value) return;
        
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId.value}/events`);
        if (!response.ok) throw new Error('Failed to fetch events');
        
        events.value = await response.json();
    } catch (error) {
        console.error('Error fetching events:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load events',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const fetchAvailableSlots = async (date: string, excludeEventId?: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/events/available-slots/${date}`);
        if (!response.ok) throw new Error('Failed to fetch available slots');
        
        const data = await response.json();
        let availableSlots = data.availableSlots;
        
        // If editing an event, include its current slot as available
        if (excludeEventId && editingEvent.value) {
            const currentSlot = editingEvent.value.timeSlot;
            const slotInfo = {
                1: { label: 'Slot 1 (8:00 AM - 9:00 AM)', time: '8:00 AM' },
                2: { label: 'Slot 2 (9:00 AM - 10:00 AM)', time: '9:00 AM' },
                3: { label: 'Slot 3 (10:00 AM - 11:00 AM)', time: '10:00 AM' },
                4: { label: 'Slot 4 (11:00 AM - 12:00 PM)', time: '11:00 AM' }
            };
            
            // Add current slot if not already in available slots
            if (!availableSlots.some((slot: TimeSlot) => slot.value === currentSlot)) {
                availableSlots = [...availableSlots, {
                    value: currentSlot,
                    label: slotInfo[currentSlot as keyof typeof slotInfo].label,
                    time: slotInfo[currentSlot as keyof typeof slotInfo].time
                }];
                availableSlots.sort((a: TimeSlot, b: TimeSlot) => a.value - b.value);
            }
        }
        
        if (excludeEventId) {
            editAvailableSlots.value = availableSlots;
        } else {
            createAvailableSlots.value = availableSlots;
        }
    } catch (error) {
        console.error('Error fetching available slots:', error);
        if (excludeEventId) {
            editAvailableSlots.value = [];
        } else {
            createAvailableSlots.value = [];
        }
    }
};

const fetchAvailableBands = async (eventId: string) => {
    try {
        loadingBands.value = true;
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/available-bands`);
        if (!response.ok) throw new Error('Failed to fetch available bands');
        
        availableBands.value = await response.json();
    } catch (error) {
        console.error('Error fetching available bands:', error);
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

// Event handlers
const editEvent = (event: Event) => {
    editingEvent.value = event;
    editForm.value = {
        eventTitle: event.eventTitle,
        location: event.location || '',
        genre: event.genre || '',
        eventDate: new Date(event.eventDate),
        timeSlot: event.timeSlot,
        description: event.description || ''
    };
    editDialog.value = true;
    
    // Fetch available slots for the current date
    if (event.eventDate) {
        fetchAvailableSlots(event.eventDate, event.id);
    }
};

const onEditDateSelect = () => {
    if (editForm.value.eventDate) {
        const dateStr = formatDateForAPI(editForm.value.eventDate);
        fetchAvailableSlots(dateStr, editingEvent.value?.id);
        editForm.value.timeSlot = null; // Reset time slot when date changes
    }
};

const saveEvent = async () => {
    if (!editingEvent.value || !currentUserId.value) return;
    
    try {
        saving.value = true;
        
        const updateData = {
            userId: currentUserId.value,
            eventTitle: editForm.value.eventTitle,
            eventDate: formatDateForAPI(editForm.value.eventDate!),
            timeSlot: editForm.value.timeSlot,
            location: editForm.value.location,
            genre: editForm.value.genre,
            description: editForm.value.description
        };
        
        const response = await fetch(`${API_BASE_URL}/events/${editingEvent.value.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update event');
        }
        
        toast.add({
            severity: 'success',
            summary: 'Event Updated',
            detail: 'Event has been updated successfully',
            life: 3000
        });
        
        editDialog.value = false;
        await fetchEvents(); // Refresh the events list
        
    } catch (error) {
        console.error('Error updating event:', error);
        toast.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: error instanceof Error ? error.message : 'Failed to update event',
            life: 3000
        });
    } finally {
        saving.value = false;
    }
};

const openInviteBandDialog = async (event: Event) => {
    selectedEvent.value = event;
    selectedBand.value = null;
    inviteMessage.value = '';
    inviteBandDialog.value = true;
    
    await fetchAvailableBands(event.id);
};

const sendInvitation = async () => {
    if (!selectedEvent.value || !selectedBand.value || !currentUserId.value) return;
    
    try {
        sending.value = true;
        
        const response = await fetch(`${API_BASE_URL}/events/${selectedEvent.value.id}/invite-band`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserId.value,
                bandId: selectedBand.value,
                message: inviteMessage.value
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send invitation');
        }
        
        const result = await response.json();
        
        toast.add({
            severity: 'success',
            summary: 'Invitation Sent',
            detail: result.message,
            life: 3000
        });
        
        inviteBandDialog.value = false;
        await fetchEvents(); // Refresh to update pending invitations count
        
    } catch (error) {
        console.error('Error sending invitation:', error);
        toast.add({
            severity: 'error',
            summary: 'Invitation Failed',
            detail: error instanceof Error ? error.message : 'Failed to send invitation',
            life: 3000
        });
    } finally {
        sending.value = false;
    }
};

const confirmDelete = (event: Event) => {
    eventToDelete.value = event;
    deleteDialog.value = true;
};

const deleteEvent = async () => {
    if (!eventToDelete.value || !currentUserId.value) return;
    
    try {
        deleting.value = true;
        
        const response = await fetch(`${API_BASE_URL}/events/${eventToDelete.value.id}?userId=${currentUserId.value}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete event');
        }
        
        const result = await response.json();
        
        toast.add({
            severity: 'success',
            summary: 'Event Deleted',
            detail: result.message,
            life: 3000
        });
        
        deleteDialog.value = false;
        await fetchEvents(); // Refresh the events list
        
    } catch (error) {
        console.error('Error deleting event:', error);
        toast.add({
            severity: 'error',
            summary: 'Delete Failed',
            detail: error instanceof Error ? error.message : 'Failed to delete event',
            life: 3000
        });
    } finally {
        deleting.value = false;
    }
};

const openCreateEventDialog = () => {
    // Reset form
    createForm.value = {
        eventTitle: '',
        location: '',
        genre: '',
        eventDate: null,
        timeSlot: null,
        description: ''
    };
    createAvailableSlots.value = [];
    createDialog.value = true;
};

const createEvent = async () => {
    if (!createForm.value.eventDate || !currentUserId.value) return;
    
    try {
        creating.value = true;
        
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserId.value,
                eventTitle: createForm.value.eventTitle,
                eventDate: formatDateForAPI(createForm.value.eventDate),
                timeSlot: createForm.value.timeSlot,
                location: createForm.value.location,
                genre: createForm.value.genre,
                description: createForm.value.description
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create event');
        }
        
        toast.add({
            severity: 'success',
            summary: 'Event Created',
            detail: 'Event has been created successfully',
            life: 3000
        });
        
        createDialog.value = false;
        // Reset form
        createForm.value = {
            eventTitle: '',
            location: '',
            genre: '',
            eventDate: null,
            timeSlot: null,
            description: ''
        };
        await fetchEvents(); // Refresh the events list
        
    } catch (error) {
        console.error('Error creating event:', error);
        toast.add({
            severity: 'error',
            summary: 'Create Failed',
            detail: error instanceof Error ? error.message : 'Failed to create event',
            life: 3000
        });
    } finally {
        creating.value = false;
    }
};

const onCreateDateSelect = () => {
    if (createForm.value.eventDate) {
        const dateStr = formatDateForAPI(createForm.value.eventDate);
        fetchAvailableSlots(dateStr);
        createForm.value.timeSlot = null; // Reset time slot when date changes
    }
};

// Lifecycle
onMounted(async () => {
    await initializeGenres();
    await fetchEvents();
});
</script>

<style scoped>
.my-events {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    margin-bottom: 1rem;
}

.header-actions {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
}

.loading-state {
    text-align: center;
    padding: 3rem;
}

.empty-state {
    margin: 2rem 0;
}

.empty-content {
    text-align: center;
    padding: 3rem;
}

.empty-content h3 {
    margin: 1rem 0 0.5rem 0;
    color: var(--p-text-color);
}

.empty-content p {
    color: var(--p-text-muted-color);
    margin-bottom: 2rem;
}

.events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.9rem;
    color: var(--p-text-muted-color);
}

.event-meta span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.event-details {
    margin-top: 1rem;
}

.detail-item {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.detail-item strong {
    color: var(--p-text-color);
}

.event-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.edit-form .field,
.create-form .field {
    margin-bottom: 1.5rem;
}

.edit-form label,
.create-form label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--p-text-color);
}

.text-red-500 {
    color: #ef4444;
}

.text-gray-500 {
    color: #6b7280;
}

.invite-content h4 {
    margin: 0 0 0.5rem 0;
    color: var(--p-text-color);
}

.invite-content > p {
    color: var(--p-text-muted-color);
    margin-bottom: 1.5rem;
}

.loading-bands {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    color: var(--p-text-muted-color);
}

.no-bands {
    padding: 1rem;
    text-align: center;
    color: var(--p-text-muted-color);
}

.bands-selection .field {
    margin-bottom: 1.5rem;
}

.band-details {
    background: var(--p-surface-50);
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
}

.band-details h5 {
    margin: 0 0 0.5rem 0;
    color: var(--p-text-color);
}

.band-info p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
}

.delete-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.warning-text {
    color: var(--p-orange-600);
    font-style: italic;
    margin-top: 0.5rem;
}

@media (max-width: 768px) {
    .my-events {
        padding: 1rem;
    }
    
    .events-grid {
        grid-template-columns: 1fr;
    }
    
    .event-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .event-meta {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .event-actions {
        flex-direction: column;
    }
    
    .delete-content {
        flex-direction: column;
        text-align: center;
    }
}
</style> 