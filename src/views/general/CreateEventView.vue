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
                        <InputText id="eventName" v-model="eventForm.name" placeholder="Enter event name" />
                    </div>
                    
                    <div class="field">
                        <label for="venue">Venue</label>
                        <InputText id="venue" v-model="eventForm.venue" placeholder="Event location" />
                    </div>
                    
                    <div class="field">
                        <label for="date">Date</label>
                        <Calendar id="date" v-model="eventForm.date" placeholder="Select date" />
                    </div>
                    
                    <div class="field">
                        <label for="time">Time</label>
                        <InputText id="time" v-model="eventForm.time" placeholder="Event time" />
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
import { ref } from 'vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';

const eventForm = ref({
    name: '',
    venue: '',
    date: null,
    time: '',
    description: ''
});

const createEvent = () => {
    console.log('Creating event:', eventForm.value);
    // Would submit to backend
};

const resetForm = () => {
    eventForm.value = {
        name: '',
        venue: '',
        date: null,
        time: '',
        description: ''
    };
};
</script>

<style scoped>
.create-event {
    max-width: 600px;
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
</style> 