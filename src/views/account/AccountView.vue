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
                                    v-model="profile.phoneNumber" 
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
                        <div class="form-grid musical-info-grid">
                             <div class="field">
                                <label for="instrument">Primary Instrument</label>
                                <Dropdown 
                                    id="instrument"
                                    v-model="profile.instrument"
                                    :options="instrumentOptions"
                                    optionLabel="name"
                                    optionValue="value"
                                    placeholder="Select your primary instrument"
                                    class="w-full"
                                />
                            </div>
                            <div class="field">
                                <label for="genre">Primary Genre</label>
                                <Dropdown 
                                    id="genre"
                                    v-model="profile.genre"
                                    :options="genreOptions"
                                    optionLabel="name"
                                    optionValue="value"
                                    placeholder="Select your primary genre"
                                    class="w-full"
                                />
                            </div>
                        </div>
                        <div class="form-actions">
                            <Button label="Save Profile" icon="pi pi-save" @click="saveProfile" />
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
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    bio: string | null;
    instrument: string | null;
    genre: string | null;
}

const profile = ref<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '555-123-4567',
    bio: 'Passionate musician with 10+ years of experience in jazz and blues.',
    instrument: 'guitar',
    genre: 'jazz'
});

const instrumentOptions = ref([
    { name: 'Guitar', value: 'guitar' },
    { name: 'Bass', value: 'bass' },
    { name: 'Drums', value: 'drums' },
    { name: 'Piano', value: 'piano' },
    { name: 'Vocals', value: 'vocals' },
    { name: 'Saxophone', value: 'saxophone' },
    { name: 'Trumpet', value: 'trumpet' },
    { name: 'Violin', value: 'violin' },
    { name: 'Other', value: 'other' }
]);

const genreOptions = ref([
    { name: 'Rock', value: 'rock' },
    { name: 'Jazz', value: 'jazz' },
    { name: 'Blues', value: 'blues' },
    { name: 'Folk', value: 'folk' },
    { name: 'Electronic', value: 'electronic' },
    { name: 'Pop', value: 'pop' },
    { name: 'Classical', value: 'classical' },
    { name: 'Country', value: 'country' },
    { name: 'Hip Hop', value: 'hiphop' },
    { name: 'Other', value: 'other' }
]);

const saveProfile = () => {
    console.log('Saving profile (all user table fields):', profile.value);
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

.musical-info-grid {
    margin-top: 1.5rem;
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
    margin-top: 1rem;
}

</style> 