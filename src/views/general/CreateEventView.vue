<template>
    <div class="create-event">
        <div class="header">
            <h1>Create Event</h1>
            <p>Post a new event and invite bands to apply</p>
        </div>

        <Card class="form-card">
            <template #content>
                <div class="form-grid">
                    <div class="field">
                        <label for="eventName">Event Name</label>
                        <InputText id="eventName" v-model="eventForm.eventTitle" placeholder="Enter event name" />
                    </div>
                    
                    <div class="field">
                        <label for="venue">Venue</label>
                        <InputText id="venue" v-model="eventForm.location" placeholder="Event location" />
                    </div>
                    
                    <div class="field">
                        <label for="genre">Genre</label>
                        <Dropdown 
                            id="genre" 
                            v-model="eventForm.genre" 
                            :options="genres" 
                            optionLabel="name" 
                            optionValue="value"
                            placeholder="Select event genre"
                        />
                    </div>
                    
                    <div class="field">
                        <label for="date">Date</label>
                        <Calendar 
                            id="date" 
                            ref="datePickerRef"
                            v-model="eventForm.eventDate" 
                            placeholder="Select event date"
                            dateFormat="yy-mm-dd"
                            :disabledDates="disabledDates"
                            :minDate="new Date()"
                            @date-select="onDateSelect"
                            @update:modelValue="onDateSelect"
                        />
                    </div>
                    
                    <div class="field">
                        <label for="timeSlot">Time Slot</label>
                        <Dropdown 
                            id="timeSlot" 
                            v-model="eventForm.timeSlot" 
                            :options="timeSlotOptions" 
                            optionLabel="label" 
                            optionValue="value"
                            placeholder="Select time slot"
                            @change="handleTimeSlotChange"
                            @click="handleTimeSlotClick"
                        />
                        <small v-if="eventForm.eventDate && availableSlots.length === 0" class="text-red-500">
                            No available slots for this date
                        </small>
                        <small v-else-if="!eventForm.eventDate" class="text-gray-500">
                            Select a date first
                        </small>
                    </div>
                    
                    <div class="field span-2">
                        <label for="description">Description</label>
                        <Textarea 
                            id="description" 
                            v-model="eventForm.description" 
                            rows="4" 
                            placeholder="Describe your event..."
                        />
                    </div>
                </div>
                
                <div class="form-actions">
                    <Button 
                        label="Create Event" 
                        icon="pi pi-plus" 
                        @click="createEvent"
                        :disabled="!isFormValid"
                    />
                    <Button label="Cancel" severity="secondary" outlined @click="resetForm" />
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { useReferenceData } from '@/composables/useReferenceData';

const toast = useToast();
const router = useRouter();

// Get current user ID from localStorage
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

// Reference data (fetched from API)
const { genres, initializeGenres } = useReferenceData();

interface EventForm {
    eventTitle: string;
    location: string | null;
    eventDate: Date | null;
    timeSlot: number | null;
    genre: string | null;
    description: string;
    status: 'open' | 'filled' | 'expired';
    user_id: number | null;
}

interface TimeSlot {
    value: number;
    label: string;
    time: string;
}

interface AvailableDateResponse {
    date: string;
    occupiedSlots: number;
    availableSlots: number;
}

const eventForm = ref<EventForm>({
    eventTitle: '',
    location: '',
    eventDate: null,
    timeSlot: null,
    genre: null,
    description: '',
    status: 'open',
    user_id: currentUserId.value
});

const availableDates = ref<Date[]>([]);
const disabledDates = ref<Date[]>([]);
const availableSlots = ref<TimeSlot[]>([]);
const datePickerRef = ref();

// Computed property to check if form is valid
const isFormValid = computed(() => {
    return !!(
        eventForm.value.eventTitle &&
        eventForm.value.eventDate &&
        eventForm.value.timeSlot &&
        eventForm.value.user_id
    );
});

// Computed property for time slot options - shows appropriate options or placeholder
const timeSlotOptions = computed(() => {
    if (!eventForm.value.eventDate) {
        // Return placeholder option when no date selected
        return [{ value: null, label: '📅 Please select a date first' }];
    } else if (availableSlots.value.length === 0) {
        // Return message when no slots available
        return [{ value: null, label: '❌ No slots available for this date' }];
    } else {
        // Return actual available slots
        return availableSlots.value;
    }
});

// Format date to YYYY-MM-DD for API calls
const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// Fetch available dates from API
const fetchAvailableDates = async () => {
    console.log('🔍 DEBUG: fetchAvailableDates called');
    try {
        const API_BASE_URL = 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE_URL}/events/available-dates`);
        console.log('🔍 DEBUG: available-dates response status:', response.status);
        
        const data = await response.json();
        console.log('🔍 DEBUG: available-dates data:', data);
        
        // Convert string dates to Date objects for available dates
        const available = data.map((item: AvailableDateResponse) => new Date(item.date));
        availableDates.value = available;
        console.log('🔍 DEBUG: availableDates converted:', availableDates.value);
        
        // Create disabled dates array (next 60 days minus available dates)
        const today = new Date();
        const next60Days = [];
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            next60Days.push(date);
        }
        
        disabledDates.value = next60Days.filter(date => {
            return !available.some((availableDate: Date) => 
                availableDate.toDateString() === date.toDateString()
            );
        });
        console.log('🔍 DEBUG: disabledDates calculated:', disabledDates.value.length);
        
    } catch (error) {
        console.error('❌ DEBUG: Failed to fetch available dates:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load available dates',
            life: 3000
        });
    }
};

// Fetch available slots for selected date
const fetchAvailableSlots = async (date: Date) => {
    console.log('🔍 DEBUG: fetchAvailableSlots called with date:', date);
    try {
        const API_BASE_URL = 'http://localhost:3001/api';
        const dateStr = formatDateForAPI(date);
        console.log('🔍 DEBUG: formatted date string:', dateStr);
        
        const response = await fetch(`${API_BASE_URL}/events/available-slots/${dateStr}`);
        console.log('🔍 DEBUG: available-slots response status:', response.status);
        
        const data = await response.json();
        console.log('🔍 DEBUG: available-slots data:', data);
        
        availableSlots.value = data.availableSlots;
        console.log('🔍 DEBUG: availableSlots set to:', availableSlots.value);
        
        // Reset time slot if current selection is no longer available
        if (eventForm.value.timeSlot && !data.availableSlots.some((slot: TimeSlot) => slot.value === eventForm.value.timeSlot)) {
            console.log('🔍 DEBUG: resetting timeSlot because current selection not available');
            eventForm.value.timeSlot = null;
        }
        
    } catch (error) {
        console.error('❌ DEBUG: Failed to fetch available slots:', error);
        availableSlots.value = [];
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load available time slots',
            life: 3000
        });
    }
};

// Handle date selection
const onDateSelect = (value: Date | Date[] | (Date | null)[] | null | undefined) => {
    console.log('🔍 DEBUG: onDateSelect called with value:', value);
    console.log('🔍 DEBUG: eventForm.eventDate before:', eventForm.value.eventDate);
    
    // Handle single date selection
    if (value instanceof Date) {
        console.log('🔍 DEBUG: valid Date object received, fetching slots');
        fetchAvailableSlots(value);
    } else {
        console.log('🔍 DEBUG: clearing slots because value is not a Date:', typeof value);
        availableSlots.value = [];
        eventForm.value.timeSlot = null;
    }
};

// Watch for date changes
watch(() => eventForm.value.eventDate, (newDate, oldDate) => {
    console.log('🔍 DEBUG: eventDate watcher triggered:', { newDate, oldDate });
    if (newDate) {
        fetchAvailableSlots(newDate);
    } else {
        console.log('🔍 DEBUG: clearing slots because eventDate is null');
        availableSlots.value = [];
        eventForm.value.timeSlot = null;
    }
});

// Handle time slot click for better UX
const handleTimeSlotClick = () => {
    console.log('🔍 DEBUG: handleTimeSlotClick called, eventDate:', eventForm.value.eventDate);
    if (!eventForm.value.eventDate) {
        // Focus the date picker to help user
        setTimeout(() => {
            if (datePickerRef.value) {
                datePickerRef.value.$el.querySelector('input').focus();
            }
        }, 100);
    }
};

// Handle time slot selection/change
const handleTimeSlotChange = (event: { value: number | null }) => {
    console.log('🔍 DEBUG: handleTimeSlotChange called with:', event);
    
    // If they selected the "select date first" placeholder option
    if (!eventForm.value.eventDate && event.value === null) {
        console.log('🔍 DEBUG: User clicked on "select date first" option');
        
        // Reset the dropdown value since it's not a real selection
        eventForm.value.timeSlot = null;
        
        // Focus date picker to help user
        setTimeout(() => {
            if (datePickerRef.value) {
                datePickerRef.value.$el.querySelector('input').focus();
            }
        }, 100);
    }
};

const createEvent = async () => {
    // Ensure user_id is set (should be from logged-in user)
    if (!eventForm.value.user_id) {
        console.error("User ID is missing, cannot create event.");
        toast.add({
            severity: 'error',
            summary: 'Authentication Error',
            detail: 'Please sign in to create events',
            life: 3000
        });
        return;
    }

    if (!isFormValid.value) {
        toast.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Please fill in all required fields',
            life: 3000
        });
        return;
    }

    const eventDataToSubmit = {
        userId: eventForm.value.user_id,
        eventTitle: eventForm.value.eventTitle,
        eventDate: formatDateForAPI(eventForm.value.eventDate!),
        timeSlot: eventForm.value.timeSlot,
        location: eventForm.value.location,
        genre: eventForm.value.genre,
        description: eventForm.value.description,
        status: 'open'
    };
    
    console.log('Creating event:', eventDataToSubmit);
    
    try {
        const API_BASE_URL = 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventDataToSubmit)
        });
        
        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.message || 'Failed to create event');
        }
        
        const createdEvent = await response.json();
        console.log('Event created successfully:', createdEvent);
        
        toast.add({
            severity: 'success',
            summary: 'Event Created!',
            detail: `"${eventForm.value.eventTitle}" has been successfully created`,
            life: 4000
        });
        
        resetForm(); // Reset form after successful creation
        
        // Navigate to browse events page
        router.push('/browse/events');
    } catch (error) {
        console.error('Error creating event:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        toast.add({
            severity: 'error',
            summary: 'Event Creation Failed',
            detail: errorMessage,
            life: 5000
        });
    }
};

const resetForm = () => {
    eventForm.value = {
        eventTitle: '',
        location: '',
        eventDate: null,
        timeSlot: null,
        genre: null,
        description: '',
        status: 'open',
        user_id: currentUserId.value
    };
    availableSlots.value = [];
};

// Initialize reference data on component mount
onMounted(async () => {
    console.log('🔍 DEBUG: Component mounted, initializing data');
    await initializeGenres();
    await fetchAvailableDates();
    console.log('🔍 DEBUG: Initial availableSlots value:', availableSlots.value);
    console.log('🔍 DEBUG: Initial eventForm state:', eventForm.value);
});
</script>

<style scoped>
.create-event {
    max-width: 800px;
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

.form-card {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
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
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid var(--p-surface-border);
}

/* Responsive design */
@media (max-width: 768px) {
    .create-event {
        padding: 1rem;
    }
    
    .form-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .field.span-2 {
        grid-column: 1;
    }
    
    .form-actions {
        flex-direction: column;
    }
}
</style> 