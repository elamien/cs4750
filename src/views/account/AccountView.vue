<template>
    <div class="account-view">
        <div class="header">
            <h1>My Account</h1>
            <p>Manage your personal information and preferences</p>
        </div>

        <div v-if="loading" class="loading-state">
            <Card>
                <template #content>
                    <div class="loading-content">
                        <i class="pi pi-spinner pi-spin"></i>
                        <p>Loading your profile...</p>
                    </div>
                </template>
            </Card>
        </div>

        <div v-else class="account-content">
                <Card class="profile-section">
                <template #title>
                    <div class="section-header">
                        <span>Profile Information</span>
                        <div class="section-actions">
                            <Button
                                v-if="!isEditing"
                                label="Edit Profile"
                                icon="pi pi-pencil"
                                @click="startEditing"
                                severity="secondary"
                            />
                            <div v-else class="edit-actions">
                                <Button
                                    label="Cancel"
                                    icon="pi pi-times"
                                    @click="cancelEditing"
                                    severity="secondary"
                                    outlined
                                />
                                <Button
                                    label="Save Changes"
                                    icon="pi pi-check"
                                    @click="saveProfile"
                                    :loading="saving"
                                    :disabled="!hasChanges"
                                />
                            </div>
                        </div>
                    </div>
                </template>
                    <template #content>
                    <!-- View Mode -->
                    <div v-if="!isEditing" class="profile-view">
                        <div class="view-grid">
                            <div class="view-field">
                                <label>Name</label>
                                <p>{{ profile.firstName }} {{ profile.lastName }}</p>
                            </div>
                            <div class="view-field">
                                <label>Email</label>
                                <p>{{ profile.email }}</p>
                            </div>
                            <div class="view-field">
                                <label>Phone</label>
                                <p>{{ profile.phoneNumber || 'Not provided' }}</p>
                            </div>
                            <div class="view-field">
                                <label>Primary Instrument</label>
                                <p>{{ profile.instrument || 'Not specified' }}</p>
                            </div>
                            <div class="view-field">
                                <label>Primary Genre</label>
                                <p>{{ profile.genre || 'Not specified' }}</p>
                            </div>
                            <div class="view-field span-2">
                                <label>Bio</label>
                                <p class="bio-text">{{ profile.bio || 'No bio provided' }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Edit Mode -->
                    <div v-else class="profile-edit">
                        <div class="form-grid">
                            <div class="field" :class="{ 'field-modified': isFieldModified('firstName') }">
                                <label for="firstName">First Name *</label>
                                <InputText
                                    id="firstName"
                                    v-model="editForm.firstName"
                                    class="w-full"
                                    :class="{ 'p-invalid': editErrors.firstName }"
                                    @input="validateForm"
                                />
                                <small v-if="editErrors.firstName" class="p-error">{{ editErrors.firstName }}</small>
                            </div>
                            <div class="field" :class="{ 'field-modified': isFieldModified('lastName') }">
                                <label for="lastName">Last Name *</label>
                                <InputText
                                    id="lastName"
                                    v-model="editForm.lastName"
                                    class="w-full"
                                    :class="{ 'p-invalid': editErrors.lastName }"
                                    @input="validateForm"
                                />
                                <small v-if="editErrors.lastName" class="p-error">{{ editErrors.lastName }}</small>
                            </div>
                            <div class="field" :class="{ 'field-modified': isFieldModified('email') }">
                                <label for="email">Email *</label>
                                <InputText
                                    id="email"
                                    v-model="editForm.email"
                                    type="email"
                                    class="w-full"
                                    :class="{ 'p-invalid': editErrors.email }"
                                    @input="validateForm"
                                />
                                <small v-if="editErrors.email" class="p-error">{{ editErrors.email }}</small>
                            </div>
                            <div class="field" :class="{ 'field-modified': isFieldModified('phoneNumber') }">
                                <label for="phone">Phone</label>
                                <InputText
                                    id="phone"
                                    v-model="editForm.phoneNumber"
                                    class="w-full"
                                />
                            </div>
                            <div class="field" :class="{ 'field-modified': isFieldModified('instrument') }">
                                <label for="instrument">Primary Instrument</label>
                                <Dropdown
                                    id="instrument"
                                    v-model="editForm.instrument"
                                    :options="instruments"
                                    optionLabel="name"
                                    optionValue="value"
                                    placeholder="Select your primary instrument"
                                    class="w-full"
                                    showClear
                                />
                            </div>
                            <div class="field" :class="{ 'field-modified': isFieldModified('genre') }">
                                <label for="genre">Primary Genre</label>
                                <Dropdown
                                    id="genre"
                                    v-model="editForm.genre"
                                    :options="genres"
                                    optionLabel="name"
                                    optionValue="value"
                                    placeholder="Select your primary genre"
                                    class="w-full"
                                    showClear
                                />
                            </div>
                            <div class="field span-2" :class="{ 'field-modified': isFieldModified('bio') }">
                                <label for="bio">Bio</label>
                                <Textarea
                                    id="bio"
                                    v-model="editForm.bio"
                                    rows="4"
                                    placeholder="Tell us about yourself..."
                                    class="w-full"
                                    :class="{ 'p-invalid': editErrors.bio }"
                                    @input="validateForm"
                                    maxlength="255"
                                />
                                <div class="field-footer">
                                    <small v-if="editErrors.bio" class="p-error">{{ editErrors.bio }}</small>
                                    <small class="char-count" :class="{ 'char-limit-warning': (editForm.bio?.length || 0) > 230 }">
                                        {{ editForm.bio?.length || 0 }}/255 characters
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div v-if="hasChanges" class="changes-summary">
                            <div class="changes-indicator">
                                <i class="pi pi-exclamation-circle"></i>
                                <span>You have unsaved changes</span>
                            </div>
                        </div>
                        </div>
                    </template>
                </Card>

                <!-- Roles Section -->
                <Card class="roles-section">
                    <template #title>
                        <div class="section-header">
                            <span>Account Roles</span>
                            <i class="pi pi-info-circle"
                               v-tooltip.top="'Your roles determine what features and permissions you have access to'"
                               style="color: var(--p-text-muted-color); cursor: help;">
                            </i>
                        </div>
                    </template>
                    <template #content>
                        <div class="roles-content">
                            <div class="roles-grid">
                                <!-- Base Roles -->
                                <div class="role-category">
                                    <h4>Base Role</h4>
                                    <div class="role-badges">
                                        <div v-if="isWXTJExecutive()" class="account-role-badge executive">
                                            <i class="pi pi-star"></i>
                                            <span>WXTJ Executive</span>
                                        </div>
                                        <div v-else class="account-role-badge general">
                                            <i class="pi pi-user"></i>
                                            <span>General User</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Specialized Roles -->
                                <div class="role-category">
                                    <h4>Band Roles</h4>
                                    <div class="role-badges">
                                        <div v-if="isBandLeader()" class="account-role-badge leader">
                                            <i class="pi pi-crown"></i>
                                            <span>Band Leader</span>
                                        </div>
                                        <div v-if="isBandMember()" class="account-role-badge member">
                                            <i class="pi pi-users"></i>
                                            <span>Band Member</span>
                                        </div>
                                        <div v-if="!isBandLeader() && !isBandMember()" class="account-role-badge none">
                                            <i class="pi pi-minus"></i>
                                            <span>No band roles</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Role Permissions Info -->
                            <div class="role-permissions">
                                <h4>Current Permissions</h4>
                                <div class="permissions-list">
                                    <div v-if="isWXTJExecutive()" class="permission-item">
                                        <i class="pi pi-check-circle" style="color: var(--p-green-500);"></i>
                                        <span>Full administrative access to all features</span>
                                    </div>
                                    <div v-if="isBandLeader()" class="permission-item">
                                        <i class="pi pi-check-circle" style="color: var(--p-green-500);"></i>
                                        <span>Manage band members and accept event requests</span>
                                    </div>
                                    <div v-if="isBandMember()" class="permission-item">
                                        <i class="pi pi-check-circle" style="color: var(--p-green-500);"></i>
                                        <span>View band events and respond to fill-in requests</span>
                                    </div>
                                    <div class="permission-item">
                                        <i class="pi pi-check-circle" style="color: var(--p-green-500);"></i>
                                        <span>Browse events and save favorites</span>
                                    </div>
                                    <div v-if="isGeneralUser() && !isBandMember() && !isBandLeader()" class="permission-item">
                                        <i class="pi pi-check-circle" style="color: var(--p-green-500);"></i>
                                        <span>Create or request to join one band</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>
        </div>

        <!-- Unsaved Changes Confirmation Dialog -->
        <Dialog
            v-model:visible="showCancelDialog"
            modal
            header="Unsaved Changes"
            :style="{ width: '450px' }"
            :closable="false"
        >
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--p-orange-500);"></i>
                <div class="confirmation-text">
                    <p>You have unsaved changes that will be lost.</p>
                    <p>Are you sure you want to cancel editing?</p>
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <Button
                        label="Keep Editing"
                        icon="pi pi-pencil"
                        @click="showCancelDialog = false"
                        severity="secondary"
                        outlined
                    />
                    <Button
                        label="Discard Changes"
                        icon="pi pi-trash"
                        @click="confirmCancelEditing"
                        severity="danger"
                    />
        </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useReferenceData } from '@/composables/useReferenceData';
import { containsProfanity } from '@/utils/profanityFilter';
import { useAuth } from '@/composables/useAuth';

// Aligned with `user` table from core_db_structure.sql
interface UserProfile {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    bio: string | null;
    instrument: string | null;
    genre: string | null;
}

// Get current authenticated user ID from auth system
const { getUserId, isWXTJExecutive, isBandLeader, isBandMember, isGeneralUser } = useAuth();
const currentUserId = computed(() => getUserId());

// Reference data (fetched from API)
const { genres, instruments, initializeGenres, initializeInstruments } = useReferenceData();

// State management
const loading = ref(true);
const saving = ref(false);
const isEditing = ref(false);
const showCancelDialog = ref(false);

const profile = ref<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: null,
    bio: null,
    instrument: null,
    genre: null
});

const editForm = ref<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: null,
    bio: null,
    instrument: null,
    genre: null
});

const originalProfile = ref<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: null,
    bio: null,
    instrument: null,
    genre: null
});

const editErrors = ref<Record<string, string>>({});

// Options (fetched from API via useReferenceData composable)
// genreOptions and instrumentOptions are now available as 'genres' and 'instruments' from the composable

const API_BASE_URL = 'http://localhost:3001/api';

// Computed properties
const hasChanges = computed(() => {
    return Object.keys(editForm.value).some(key => {
        const currentValue = editForm.value[key as keyof UserProfile];
        const originalValue = originalProfile.value[key as keyof UserProfile];
        return currentValue !== originalValue;
    });
});

const validateForm = () => {
    editErrors.value = {};

    if (!editForm.value.firstName) {
        editErrors.value.firstName = 'First name is required.';
    } else if (containsProfanity(editForm.value.firstName)) {
        editErrors.value.firstName = 'Inappropriate language is not allowed.';
    }

    if (!editForm.value.lastName) {
        editErrors.value.lastName = 'Last name is required.';
    } else if (containsProfanity(editForm.value.lastName)) {
        editErrors.value.lastName = 'Inappropriate language is not allowed.';
    }

    if (!editForm.value.email) {
        editErrors.value.email = 'Email is required.';
    } else if (!isValidEmail(editForm.value.email)) {
        editErrors.value.email = 'Please enter a valid email.';
    }

    if (editForm.value.bio && editForm.value.bio.length > 255) {
        editErrors.value.bio = 'Bio must be 255 characters or less.';
    } else if (containsProfanity(editForm.value.bio)) {
        editErrors.value.bio = 'Inappropriate language is not allowed in bio.';
    }
};

// Utility functions
const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isFieldModified = (fieldName: keyof UserProfile) => {
    const currentValue = editForm.value[fieldName];
    const originalValue = originalProfile.value[fieldName];
    return currentValue !== originalValue;
};

// Profile management functions
const startEditing = () => {
    // Copy current profile to edit form
    editForm.value = { ...profile.value };
    originalProfile.value = { ...profile.value };
    isEditing.value = true;
};

const cancelEditing = () => {
    if (hasChanges.value) {
        showCancelDialog.value = true;
        return;
    }

    // Reset edit form to original values
    editForm.value = { ...originalProfile.value };
    isEditing.value = false;
};

const confirmCancelEditing = () => {
    // Reset edit form to original values
    editForm.value = { ...originalProfile.value };
    isEditing.value = false;
    showCancelDialog.value = false;
};

const fetchProfile = async () => {
    if (!currentUserId.value) {
        console.error('User not authenticated');
        alert('Please sign in to view your profile');
        return;
    }

    loading.value = true;
    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId.value}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();

        // Map API response to profile
        const mappedProfile = {
            id: String(userData.id),
            firstName: userData.firstName || userData.first_name || '',
            lastName: userData.lastName || userData.last_name || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || userData.phone_number || null,
            bio: userData.bio || null,
            instrument: userData.instrument || null,
            genre: userData.genre || null
        };

        profile.value = mappedProfile;
        originalProfile.value = { ...mappedProfile };
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        alert('Failed to load profile data');
    } finally {
        loading.value = false;
    }
};

const saveProfile = async () => {
    validateForm();
    if (Object.keys(editErrors.value).length > 0) {
        // Using alert for now as per existing implementation, but a toast would be better.
        alert('Please fix the errors before saving.');
        return;
    }
    if (!currentUserId.value) {
        console.error('User not authenticated');
        alert('Please sign in to save your profile');
        return;
    }

    saving.value = true;
    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId.value}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: editForm.value.firstName,
                lastName: editForm.value.lastName,
                email: editForm.value.email,
                phoneNumber: editForm.value.phoneNumber,
                bio: editForm.value.bio,
                instrument: editForm.value.instrument,
                genre: editForm.value.genre
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
        }

        await response.json();

        // Update profile with saved data
        profile.value = { ...editForm.value };
        originalProfile.value = { ...editForm.value };
        isEditing.value = false;

        alert('Profile saved successfully!');
    } catch (error) {
        console.error('Failed to save profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save profile';
        alert(`Error: ${errorMessage}`);
    } finally {
        saving.value = false;
    }
};

// Prevent navigation with unsaved changes
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (isEditing.value && hasChanges.value) {
        event.preventDefault();
        event.returnValue = '';
    }
};

onMounted(async () => {
    // Initialize reference data
    await Promise.all([
        initializeGenres(),
        initializeInstruments()
    ]);

    fetchProfile();
    window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style scoped>
.account-view {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    color: var(--theme-main-text);
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

.loading-state {
    margin-bottom: 2rem;
}

.loading-content {
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

.loading-content p {
    color: var(--theme-secondary-text);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.edit-actions {
    display: flex;
    gap: 0.5rem;
}

/* View Mode Styles */
.view-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.view-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.view-field.span-2 {
    grid-column: 1 / -1;
}

.view-field label {
    font-weight: 600;
    color: var(--theme-secondary-text);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.view-field p {
    color: var(--theme-main-text);
    font-size: 1rem;
    margin: 0;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--p-surface-border);
}

.bio-text {
    white-space: pre-wrap;
    line-height: 1.5;
    border-bottom: none !important;
}

/* Edit Mode Styles */
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
    position: relative;
}

.field.span-2 {
    grid-column: 1 / -1;
}

.field label {
    font-weight: 600;
    color: var(--theme-main-text);
}

.field-modified {
    position: relative;
}

.field-modified::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--hoojams-orange);
    border-radius: 2px;
}

.field-modified label::after {
    content: ' •';
    color: var(--hoojams-orange);
    font-weight: bold;
}

.field-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-top: 0.25rem;
}

.char-count {
    font-size: 0.75rem;
    color: var(--p-text-muted-color);
    white-space: nowrap;
}

.char-limit-warning {
    color: var(--p-orange-500) !important;
    font-weight: 500;
}

.changes-summary {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--p-highlight-bg);
    border: 1px solid var(--p-highlight-border);
    border-radius: 6px;
}

.changes-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--theme-main-text);
}

.changes-indicator i {
    color: var(--hoojams-orange);
}

/* Confirmation Dialog Styles */
.confirmation-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 0;
}

.confirmation-text {
    flex: 1;
}

.confirmation-text p {
    margin: 0 0 0.5rem 0;
    color: var(--theme-main-text);
}

.confirmation-text p:last-child {
    margin-bottom: 0;
    font-weight: 600;
}

.dialog-footer {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

/* Responsive adjustments */
@media (max-width: 640px) {
    .account-view {
        padding: 1rem;
    }

    .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

    .edit-actions {
        justify-content: center;
    }

    .view-grid,
    .form-grid {
        grid-template-columns: 1fr;
    }

    .field.span-2 {
        grid-column: 1;
    }
}

/* Roles Section Styles */
.roles-section {
    margin-top: 2rem;
}

.roles-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.roles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.role-category h4 {
    margin: 0 0 1rem 0;
    color: var(--theme-main-text);
    font-size: 1.1rem;
    font-weight: 600;
    border-bottom: 2px solid var(--p-surface-border);
    padding-bottom: 0.5rem;
}

.role-badges {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.account-role-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid;
    font-weight: 500;
}

.account-role-badge.executive {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.1));
    border-color: rgba(168, 85, 247, 0.3);
    color: var(--p-purple-600);
}

.account-role-badge.general {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
    border-color: rgba(59, 130, 246, 0.3);
    color: var(--p-blue-600);
}

.account-role-badge.leader {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
    border-color: rgba(245, 158, 11, 0.3);
    color: var(--p-yellow-600);
}

.account-role-badge.member {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1));
    border-color: rgba(34, 197, 94, 0.3);
    color: var(--p-green-600);
}

.account-role-badge.none {
    background: var(--p-surface-100);
    border-color: var(--p-surface-border);
    color: var(--p-text-muted-color);
}

.account-role-badge.unknown {
    background: linear-gradient(135deg, rgba(107, 114, 128, 0.1), rgba(75, 85, 99, 0.1));
    border-color: rgba(107, 114, 128, 0.3);
    color: var(--p-text-color);
}

[data-theme="dark"] .account-role-badge.executive {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2));
    color: var(--p-purple-400);
}

[data-theme="dark"] .account-role-badge.general {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2));
    color: var(--p-blue-400);
}

[data-theme="dark"] .account-role-badge.leader {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2));
    color: var(--p-yellow-400);
}

[data-theme="dark"] .account-role-badge.member {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2));
    color: var(--p-green-400);
}

[data-theme="dark"] .account-role-badge.none {
    background: var(--p-surface-700);
}

.role-permissions h4 {
    margin: 0 0 1rem 0;
    color: var(--theme-main-text);
    font-size: 1.1rem;
    font-weight: 600;
    border-bottom: 2px solid var(--p-surface-border);
    padding-bottom: 0.5rem;
}

.permissions-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.permission-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    color: var(--theme-main-text);
}

.permission-item i {
    font-size: 1rem;
    flex-shrink: 0;
}

/* Responsive adjustments for roles section */
@media (max-width: 640px) {
    .roles-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .account-role-badge {
        padding: 0.5rem 0.75rem;
    }
}
</style>
