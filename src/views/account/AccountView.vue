<template>
    <div class="account-view">
        <div class="header">
            <h1>My Account</h1>
            <p>Manage your personal information and preferences</p>
        </div>

        <div class="account-content">
            <div class="account-sections">
                <Card class="profile-section">
                    <template #title>Profile Information</template>
                    <template #content>
                        <div class="form-grid">
                            <div class="field">
                                <label for="firstName">First Name</label>
                                <InputText 
                                    id="firstName" 
                                    v-model="profile.firstName" 
                                    class="w-full"
                                />
                            </div>
                            <div class="field">
                                <label for="lastName">Last Name</label>
                                <InputText 
                                    id="lastName" 
                                    v-model="profile.lastName" 
                                    class="w-full"
                                />
                            </div>
                            <div class="field">
                                <label for="email">Email</label>
                                <InputText 
                                    id="email" 
                                    v-model="profile.email" 
                                    type="email"
                                    class="w-full"
                                />
                            </div>
                            <div class="field">
                                <label for="phone">Phone</label>
                                <InputText 
                                    id="phone" 
                                    v-model="profile.phone" 
                                    class="w-full"
                                />
                            </div>
                            <div class="field span-2">
                                <label for="bio">Bio</label>
                                <Textarea 
                                    id="bio" 
                                    v-model="profile.bio" 
                                    rows="4"
                                    placeholder="Tell us about yourself..."
                                    class="w-full"
                                />
                            </div>
                        </div>
                        <div class="form-actions">
                            <Button label="Save Profile" icon="pi pi-save" @click="saveProfile" />
                        </div>
                    </template>
                </Card>

                <Card class="musical-info-section">
                    <template #title>Musical Information</template>
                    <template #content>
                        <div class="form-grid">
                            <div class="field">
                                <label for="instruments">Primary Instruments</label>
                                <MultiSelect 
                                    id="instruments"
                                    v-model="profile.instruments" 
                                    :options="instrumentOptions"
                                    optionLabel="name"
                                    placeholder="Select your instruments"
                                    class="w-full"
                                />
                            </div>
                            <div class="field">
                                <label for="genres">Preferred Genres</label>
                                <MultiSelect 
                                    id="genres"
                                    v-model="profile.genres" 
                                    :options="genreOptions"
                                    optionLabel="name"
                                    placeholder="Select your genres"
                                    class="w-full"
                                />
                            </div>
                            <div class="field">
                                <label for="experience">Years of Experience</label>
                                <Dropdown 
                                    id="experience"
                                    v-model="profile.experience" 
                                    :options="experienceOptions"
                                    optionLabel="label"
                                    placeholder="Select experience level"
                                    class="w-full"
                                />
                            </div>
                            <div class="field">
                                <label for="availability">Availability</label>
                                <MultiSelect 
                                    id="availability"
                                    v-model="profile.availability" 
                                    :options="availabilityOptions"
                                    optionLabel="label"
                                    placeholder="Select your availability"
                                    class="w-full"
                                />
                            </div>
                        </div>
                        <div class="form-actions">
                            <Button label="Save Musical Info" icon="pi pi-save" @click="saveMusicalInfo" />
                        </div>
                    </template>
                </Card>


            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import MultiSelect from 'primevue/multiselect';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

// Mock profile data
const profile = ref({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    bio: 'Passionate musician with 10+ years of experience in jazz and blues.',
    instruments: [
        { name: 'Guitar', value: 'guitar' },
        { name: 'Bass', value: 'bass' }
    ],
    genres: [
        { name: 'Jazz', value: 'jazz' },
        { name: 'Blues', value: 'blues' }
    ],
    experience: { label: '5-10 years', value: '5-10' },
    availability: [
        { label: 'Weekends', value: 'weekends' },
        { label: 'Evenings', value: 'evenings' }
    ]
});



// Options for dropdowns and multiselects
const instrumentOptions = ref([
    { name: 'Guitar', value: 'guitar' },
    { name: 'Bass', value: 'bass' },
    { name: 'Drums', value: 'drums' },
    { name: 'Piano', value: 'piano' },
    { name: 'Vocals', value: 'vocals' },
    { name: 'Saxophone', value: 'saxophone' },
    { name: 'Trumpet', value: 'trumpet' },
    { name: 'Violin', value: 'violin' }
]);

const genreOptions = ref([
    { name: 'Rock', value: 'rock' },
    { name: 'Jazz', value: 'jazz' },
    { name: 'Blues', value: 'blues' },
    { name: 'Folk', value: 'folk' },
    { name: 'Electronic', value: 'electronic' },
    { name: 'Pop', value: 'pop' },
    { name: 'Classical', value: 'classical' },
    { name: 'Country', value: 'country' }
]);

const experienceOptions = ref([
    { label: 'Beginner (0-2 years)', value: '0-2' },
    { label: 'Intermediate (3-5 years)', value: '3-5' },
    { label: 'Advanced (5-10 years)', value: '5-10' },
    { label: 'Professional (10+ years)', value: '10+' }
]);

const availabilityOptions = ref([
    { label: 'Weekdays', value: 'weekdays' },
    { label: 'Weekends', value: 'weekends' },
    { label: 'Mornings', value: 'mornings' },
    { label: 'Afternoons', value: 'afternoons' },
    { label: 'Evenings', value: 'evenings' },
    { label: 'Nights', value: 'nights' }
]);

// Actions
const saveProfile = () => {
    console.log('Saving profile:', profile.value);
    // Would save to backend
};

const saveMusicalInfo = () => {
    console.log('Saving musical info:', {
        instruments: profile.value.instruments,
        genres: profile.value.genres,
        experience: profile.value.experience,
        availability: profile.value.availability
    });
    // Would save to backend
};


</script>

<style scoped>
.account-view {
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

.account-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
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
    justify-content: flex-end;
}


</style> 