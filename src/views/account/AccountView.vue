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
import { ref, onMounted } from 'vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

// Aligned with `user` table from core_db_structure.sql
interface UserProfile {
    id?: string; // user_id (for API calls)
    firstName: string; // first_name VARCHAR(100) NOT NULL
    lastName: string; // last_name VARCHAR(100) NOT NULL
    email: string; // email VARCHAR(255) UNIQUE NOT NULL
    phoneNumber: string | null; // phone_number VARCHAR(20)
    bio: string | null; // bio TEXT
    instrument: string | null; // instrument VARCHAR(100)
    genre: string | null; // genre VARCHAR(100)
}

// TODO: Replace with actual logged-in user ID from auth store
const currentUserId = ref('2'); // Real user ID - Charles Mingus

const profile = ref<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: null,
    bio: null,
    instrument: null,
    genre: null
});

// TODO: Consider fetching these options from config or API
const instrumentOptions = ref([
    { name: 'Guitar', value: 'Guitar' },
    { name: 'Bass', value: 'Bass' },
    { name: 'Drums', value: 'Drums' },
    { name: 'Piano', value: 'Piano' },
    { name: 'Vocals', value: 'Vocals' },
    { name: 'Saxophone', value: 'Saxophone' },
    { name: 'Trumpet', value: 'Trumpet' },
    { name: 'Violin', value: 'Violin' },
    { name: 'Other', value: 'Other' }
]);

const genreOptions = ref([
    { name: 'Rock', value: 'Rock' },
    { name: 'Jazz', value: 'Jazz' },
    { name: 'Blues', value: 'Blues' },
    { name: 'Folk', value: 'Folk' },
    { name: 'Electronic', value: 'Electronic' },
    { name: 'Pop', value: 'Pop' },
    { name: 'Classical', value: 'Classical' },
    { name: 'Country', value: 'Country' },
    { name: 'Hip Hop', value: 'Hip Hop' },
    { name: 'Other', value: 'Other' }
]);

const API_BASE_URL = 'http://localhost:3001/api';

// Fetch user profile from backend
const fetchProfile = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId.value}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();
        
        // Map API response to profile
        profile.value = {
            id: String(userData.id),
            firstName: userData.firstName || userData.first_name || '',
            lastName: userData.lastName || userData.last_name || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || userData.phone_number || null,
            bio: userData.bio || null,
            instrument: userData.instrument || null,
            genre: userData.genre || null
        };
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // TODO: Show error toast
        alert('Failed to load profile data'); // Temporary error display
    }
};

const saveProfile = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId.value}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: profile.value.firstName,
                lastName: profile.value.lastName,
                email: profile.value.email,
                phoneNumber: profile.value.phoneNumber,
                bio: profile.value.bio,
                instrument: profile.value.instrument,
                genre: profile.value.genre
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
        }

        const updatedUser = await response.json();
        console.log('Profile updated successfully:', updatedUser);
        // TODO: Show success toast
        alert('Profile saved successfully!'); // Temporary success display
    } catch (error) {
        console.error('Failed to save profile:', error);
        // TODO: Show error toast
        const errorMessage = error instanceof Error ? error.message : 'Failed to save profile';
        alert(`Error: ${errorMessage}`); // Temporary error display
    }
};

onMounted(() => {
    fetchProfile();
});

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