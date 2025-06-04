<template>
    <div class="band-info">
        <div class="header">
            <h1>Band Settings & Information</h1>
            <p>Manage your band's public profile, details, and leadership.</p>
        </div>

        <div v-if="loading" class="loading">
            <Card>
                <template #content>
                    <div style="text-align: center; padding: 2rem;">
                        <i class="pi pi-spinner pi-spin" style="font-size: 2rem; color: var(--hoojams-orange);"></i>
                        <p style="margin-top: 1rem; color: var(--p-text-muted-color);">Loading band information...</p>
                    </div>
                </template>
            </Card>
        </div>
        
        <div v-else-if="!bandInfo.id" class="no-band">
        <Card>
            <template #content>
                    <div style="text-align: center; padding: 2rem;">
                        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--p-text-muted-color);"></i>
                        <h3 style="margin: 1rem 0;">No Band Found</h3>
                        <p>You are not currently associated with any band. You need to be a band leader to access this page.</p>
                        <Button 
                            label="Go to Join/Create Band" 
                            icon="pi pi-users" 
                            @click="router.push('/join-create-band')"
                            style="margin-top: 1rem;"
                        />
                    </div>
                </template>
            </Card>
        </div>

        <div v-else class="band-content">
            <!-- Band Information Card -->
            <Card class="band-details-card">
                <template #title>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span>{{ bandInfo.name }}</span>
                        <Button 
                            :label="editMode ? 'Cancel' : 'Edit'"
                            :icon="editMode ? 'pi pi-times' : 'pi pi-pencil'"
                            :severity="editMode ? 'secondary' : 'primary'"
                            @click="toggleEditMode"
                            outlined
                        />
                    </div>
                </template>
                <template #content>
                    <div v-if="!editMode" class="band-display">
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label><i class="pi pi-tag"></i> Genre:</label>
                                <p>{{ bandInfo.genre || 'Not specified' }}</p>
                            </div>
                            <div class="detail-item">
                                <label><i class="pi pi-map-marker"></i> Location:</label>
                                <p>{{ bandInfo.location || 'Not specified' }}</p>
                            </div>
                            <div class="detail-item full-width">
                                <label><i class="pi pi-file-text"></i> Description:</label>
                                <p>{{ bandInfo.description || 'No description provided' }}</p>
                            </div>
                        </div>
                    </div>

                    <div v-else class="band-edit">
                        <form @submit.prevent="saveBandInfo" class="edit-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="band-name">Band Name *</label>
                                    <InputText 
                                        id="band-name"
                                        v-model="editForm.name" 
                                        placeholder="Enter band name"
                                        required
                                    />
                                </div>
                                <div class="form-group">
                                    <label for="band-genre">Genre</label>
                                    <InputText 
                                        id="band-genre"
                                        v-model="editForm.genre" 
                                        placeholder="e.g., Rock, Jazz, Classical"
                                    />
                                </div>
                                <div class="form-group">
                                    <label for="band-location">Location</label>
                                    <InputText 
                                        id="band-location"
                                        v-model="editForm.location" 
                                        placeholder="e.g., Charlottesville, VA"
                                    />
                                </div>
                                <div class="form-group full-width">
                                    <label for="band-description">Description</label>
                                    <Textarea 
                                        id="band-description"
                                        v-model="editForm.description" 
                                        placeholder="Tell people about your band..."
                                        rows="4"
                                    />
                                </div>
                            </div>
                            <div class="form-actions">
                                <Button 
                                    type="submit" 
                                    label="Save Changes" 
                                    icon="pi pi-check"
                                    :loading="saving"
                                />
                                <Button 
                                    type="button"
                                    label="Cancel" 
                                    icon="pi pi-times"
                                    severity="secondary"
                                    outlined
                                    @click="cancelEdit"
                                />
                            </div>
                        </form>
                    </div>
                </template>
            </Card>

            <!-- Band Members Summary -->
            <Card class="members-summary-card">
                <template #title>
                    <span>Band Members</span>
                </template>
                <template #content>
                    <div v-if="bandMembers.length === 0" class="no-members">
                        <p><i class="pi pi-users"></i> No members found</p>
                    </div>
                    <div v-else class="members-grid">
                        <div 
                            v-for="member in bandMembers" 
                            :key="member.id"
                            class="member-card"
                        >
                            <Avatar 
                                :label="getInitials(member.firstName, member.lastName)"
                                size="large"
                                style="background-color: var(--hoojams-orange); color: white;"
                            />
                            <div class="member-info">
                                <h4>{{ member.firstName }} {{ member.lastName }}</h4>
                                <Tag 
                                    :value="member.role" 
                                    :severity="member.role === 'Band Leader' ? 'success' : 'secondary'"
                                    class="role-tag"
                                />
                                <p v-if="member.instrument" class="instrument">
                                    <i class="pi pi-music"></i> {{ member.instrument }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="members-actions">
                        <Button 
                            label="Manage Members" 
                            icon="pi pi-users"
                            outlined
                            @click="router.push('/my-band/members')"
                        />
                    </div>
                </template>
            </Card>

            <!-- Quick Actions -->
            <Card class="actions-card">
                <template #title>
                    <span>Quick Actions</span>
                </template>
                <template #content>
                    <div class="actions-grid">
                        <Button 
                            label="View My Band Dashboard" 
                            icon="pi pi-home"
                            @click="router.push('/my-band')"
                            outlined
                        />
                        <Button 
                            label="Manage Members" 
                            icon="pi pi-users"
                            @click="router.push('/my-band/members')"
                            outlined
                        />
                        <Button 
                            label="Event Requests" 
                            icon="pi pi-calendar"
                            @click="router.push('/my-band/event-requests')"
                            outlined
                        />
                        <Button 
                            label="Membership Requests" 
                            icon="pi pi-user-plus"
                            @click="router.push('/my-band/member-requests')"
                            outlined
                        />
                    </div>
            </template>
        </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

// TypeScript interface for dev state


// Data interfaces
interface BandInfo {
    id: string;
    name: string;
    genre?: string | null;
    description?: string | null;
    location?: string | null;
}

interface BandMember {
    id: string;
    firstName: string;
    lastName: string;
    instrument?: string | null;
    role: string;
}

// Reactive data
const loading = ref(true);
const editMode = ref(false);
const saving = ref(false);

const bandInfo = ref<BandInfo>({
    id: '',
    name: '',
    genre: null,
    description: null,
    location: null
});

const bandMembers = ref<BandMember[]>([]);

const editForm = ref({
    name: '',
    genre: '',
    location: '',
    description: ''
});

// Get current user ID (placeholder - replace with real authentication)
const getCurrentUserId = () => {
    // TODO: Replace with real authentication
    return null;
};

const currentUserId = ref(getCurrentUserId());

// Function to reload all data
const loadAllData = async () => {
    loading.value = true;
    try {
        await fetchBandInfo();
        if (bandInfo.value.id) {
            await fetchBandMembers();
        }
    } catch (error) {
        console.error('Error loading band data:', error);
    } finally {
        loading.value = false;
    }
};

// Function to update current user (called when dev panel changes user)
const updateCurrentUser = () => {
    const newUserId = getCurrentUserId();
    if (currentUserId.value !== newUserId) {
        currentUserId.value = newUserId;
        loadAllData();
    }
};

// API Functions
const fetchBandInfo = async () => {
    try {
        console.log('BandInfoView - Fetching band info for user:', currentUserId.value);
        
        // First, get the user's band information
        const response = await fetch(`/api/users/${currentUserId.value}/band-status`);
        if (!response.ok) throw new Error('Failed to fetch user band status');
        
        const bandStatus = await response.json();
        console.log('BandInfoView - Band status response:', bandStatus);
        
        // Check if user has a band
        if (!bandStatus.isMemberOfBand || bandStatus.memberBands.length === 0) {
            bandInfo.value = { id: '', name: '', genre: null, description: null, location: null };
            return;
        }
        
        // Get the first band (users should only have one band)
        const userBand = bandStatus.memberBands[0];
        const bandId = userBand.id;
        
        // Fetch detailed band information
        const bandResponse = await fetch(`/api/bands/${bandId}`);
        if (!bandResponse.ok) throw new Error('Failed to fetch band details');
        
        const band = await bandResponse.json();
        bandInfo.value = {
            id: band.id,
            name: band.name,
            genre: band.genre,
            description: band.description,
            location: band.location
        };
        
        console.log('BandInfoView - Band info loaded:', bandInfo.value);
    } catch (error) {
        console.error('Error fetching band info:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load band information',
            life: 3000
        });
    }
};

const fetchBandMembers = async () => {
    try {
        const response = await fetch(`/api/bands/${bandInfo.value.id}/members`);
        if (!response.ok) throw new Error('Failed to fetch band members');
        
        const members = await response.json();
        bandMembers.value = members.map((member: { id: string; firstName: string; lastName: string; instrument?: string; role: string }) => ({
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            instrument: member.instrument,
            role: member.role
        }));
        
        console.log('BandInfoView - Band members loaded:', bandMembers.value);
    } catch (error) {
        console.error('Error fetching band members:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load band members',
            life: 3000
        });
    }
};

const saveBandInfo = async () => {
    if (!editForm.value.name.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: 'Band name is required',
            life: 3000
        });
        return;
    }

    saving.value = true;
    try {
        const response = await fetch(`/api/bands/${bandInfo.value.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: editForm.value.name.trim(),
                genre: editForm.value.genre.trim() || null,
                location: editForm.value.location.trim() || null,
                description: editForm.value.description.trim() || null
            })
        });

        if (!response.ok) throw new Error('Failed to update band information');

        // Update local state
        bandInfo.value = {
            ...bandInfo.value,
            name: editForm.value.name.trim(),
            genre: editForm.value.genre.trim() || null,
            location: editForm.value.location.trim() || null,
            description: editForm.value.description.trim() || null
        };

        editMode.value = false;
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Band information updated successfully',
            life: 3000
        });
    } catch (error) {
        console.error('Error saving band info:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update band information',
            life: 3000
        });
    } finally {
        saving.value = false;
    }
};

// UI Functions
const toggleEditMode = () => {
    if (editMode.value) {
        cancelEdit();
    } else {
        // Populate edit form with current data
        editForm.value = {
            name: bandInfo.value.name,
            genre: bandInfo.value.genre || '',
            location: bandInfo.value.location || '',
            description: bandInfo.value.description || ''
        };
        editMode.value = true;
    }
};

const cancelEdit = () => {
    editMode.value = false;
    editForm.value = { name: '', genre: '', location: '', description: '' };
};

const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Lifecycle
onMounted(async () => {
    await loadAllData();
    
    // In development mode, poll for user changes from developer panel
    if (import.meta.env.DEV) {
        const pollInterval = setInterval(updateCurrentUser, 1000);
        
        onUnmounted(() => {
            clearInterval(pollInterval);
        });
    }
});
</script>

<style scoped>
.band-info {
    max-width: 1000px;
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

.band-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.band-details-card,
.members-summary-card,
.actions-card {
    margin-bottom: 0;
}

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.detail-item.full-width {
    grid-column: 1 / -1;
}

.detail-item label {
    font-weight: 600;
    color: var(--p-text-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.detail-item p {
    margin: 0;
    color: var(--p-text-muted-color);
    line-height: 1.5;
}

.edit-form {
    width: 100%;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-group label {
    font-weight: 600;
    color: var(--p-text-color);
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    border-top: 1px solid var(--p-surface-border);
    padding-top: 1.5rem;
}

.members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.member-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--p-surface-border);
    border-radius: 6px;
    background: var(--p-surface-0);
}

.member-info h4 {
    margin: 0 0 0.5rem;
    color: var(--p-text-color);
}

.role-tag {
    margin-bottom: 0.5rem;
}

.instrument {
    margin: 0.5rem 0 0;
    font-size: 0.9rem;
    color: var(--p-text-muted-color);
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.members-actions,
.actions-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.no-members {
    text-align: center;
    padding: 2rem;
    color: var(--p-text-muted-color);
}

@media (max-width: 768px) {
    .detail-grid,
    .form-grid {
        grid-template-columns: 1fr;
    }
    
    .members-grid {
        grid-template-columns: 1fr;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .actions-grid {
        grid-template-columns: 1fr;
    }
}
</style> 