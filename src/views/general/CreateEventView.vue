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
                        <Calendar id="date" v-model="eventForm.datetime" placeholder="Select date and time" showTime hourFormat="12" />
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
                    <Button label="Create Event" icon="pi pi-plus" @click="createEvent" />
                    <Button label="Cancel" severity="secondary" outlined @click="resetForm" />
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
    datetime: Date | null; // Changed to Date | null for Calendar v-model
    genre: string | null;
    description: string;
    status: 'open' | 'filled' | 'expired'; // Default to 'open' on creation
    user_id: number | null; // Creator of the event
}

const eventForm = ref<EventForm>({
    eventTitle: '',
    location: '',
    datetime: null, // Stays null, but now typed as Date | null
    genre: null,
    description: '',
    status: 'open',
    user_id: currentUserId.value
    // Note: slot_one, slot_two, slot_three, slot_four from event table are not included here.
    // They are nullable and may be handled in a different view/process (e.g., event update by owner/admin).
});

// Genre options now fetched from API via useReferenceData composable

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
    // Convert date to ISO string if it's a Date object from Calendar
    let finalDateTimeISO: string | null = null;
    if (eventForm.value.datetime instanceof Date) {
        finalDateTimeISO = eventForm.value.datetime.toISOString();
    }

    const eventDataToSubmit = {
        userId: eventForm.value.user_id, // Backend expects userId, not user_id
        eventTitle: eventForm.value.eventTitle,
        datetime: finalDateTimeISO,
        location: eventForm.value.location,
        genre: eventForm.value.genre,
        description: eventForm.value.description,
        status: 'open' // Always 'open' on creation from this form
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
        datetime: null,
        genre: null,
        description: '',
        status: 'open',
        user_id: currentUserId.value // Reset with current user ID
    };
};

// Initialize reference data on component mount
onMounted(async () => {
    await initializeGenres();
});
</script>

<style scoped>
.create-event {
    max-width: 700px; /* Increased width for better layout with genre */
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem; /* Increased gap slightly */
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
</style> 