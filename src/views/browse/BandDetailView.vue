<template>
    <div class="band-detail">
        <div v-if="loading" class="loading">
            <Card>
                <template #content>
                    <div style="text-align: center; padding: 2rem;">
                        <i class="pi pi-spinner pi-spin" style="font-size: 2rem; color: var(--hoojams-orange);"></i>
                        <p style="margin-top: 1rem; color: var(--p-text-muted-color);">Loading band details...</p>
                    </div>
                </template>
            </Card>
        </div>

        <div v-else-if="!bandDetails.id" class="not-found">
            <Card>
                <template #content>
                    <div style="text-align: center; padding: 2rem;">
                        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--p-text-muted-color);"></i>
                        <h3 style="margin: 1rem 0;">Band Not Found</h3>
                        <p>The band you're looking for doesn't exist or has been removed.</p>
                        <Button 
                            label="Back to Browse Bands" 
                            icon="pi pi-arrow-left" 
                            @click="router.push('/browse/bands')"
                            style="margin-top: 1rem;"
                        />
                    </div>
                </template>
            </Card>
        </div>

        <div v-else class="band-content">
            <!-- Header Section -->
            <div class="band-header">
                <Button 
                    icon="pi pi-arrow-left" 
                    label="Back to Browse" 
                    severity="secondary" 
                    outlined 
                    @click="router.push('/browse/bands')"
                    class="back-button"
                />
                
                <div class="band-title-section">
                    <h1>{{ bandDetails.name }}</h1>
                    <div class="band-badges">
                        <Badge v-if="bandDetails.genre" :value="bandDetails.genre" severity="info" />
                        <Badge v-if="bandDetails.location" :value="bandDetails.location" severity="secondary" />
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <Button 
                        v-if="canFavorite" 
                        :label="bandDetails.isFavorite ? 'Unfavorite' : 'Favorite'" 
                        :icon="bandDetails.isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'" 
                        :severity="bandDetails.isFavorite ? 'danger' : 'secondary'"
                        @click="toggleFavorite" 
                        outlined
                    />
                    <Button 
                        v-if="canRequestToJoin" 
                        label="Request to Join" 
                        icon="pi pi-user-plus" 
                        @click="requestToJoin"
                    />
                    <Button 
                        v-if="isOwnBand" 
                        label="Manage Band" 
                        icon="pi pi-cog" 
                        @click="router.push('/my-band')"
                    />
                </div>
            </div>

            <!-- Basic Information (Available to all) -->
            <Card class="basic-info-card">
                <template #title>Band Information</template>
                <template #content>
                    <div class="info-grid">
                        <div class="info-item">
                            <label><i class="pi pi-music"></i> Genre:</label>
                            <p>{{ bandDetails.genre || 'Not specified' }}</p>
                        </div>
                        <div class="info-item">
                            <label><i class="pi pi-map-marker"></i> Location:</label>
                            <p>{{ bandDetails.location || 'Not specified' }}</p>
                        </div>

                        <div class="info-item full-width">
                            <label><i class="pi pi-file-text"></i> Description:</label>
                            <p>{{ bandDetails.description || 'No description provided.' }}</p>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Contact Information (Role-based visibility) -->
            <Card v-if="canSeeContact" class="contact-info-card">
                <template #title>Contact Information</template>
                <template #content>
                    <div class="contact-grid">
                        <div v-if="bandDetails.email" class="contact-item">
                            <label><i class="pi pi-envelope"></i> Email:</label>
                            <p>{{ bandDetails.email }}</p>
                        </div>
                        <div v-if="bandDetails.phoneNumber" class="contact-item">
                            <label><i class="pi pi-phone"></i> Phone:</label>
                            <p>{{ bandDetails.phoneNumber }}</p>
                        </div>
                    </div>
                    <p v-if="!bandDetails.email && !bandDetails.phoneNumber" class="no-contact">
                        No public contact information available.
                    </p>
                </template>
            </Card>

            <!-- Member Information (Role-based visibility) -->
            <Card v-if="canSeeMembers" class="members-card">
                <template #title>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span>Band Members</span>
                        <Badge :value="`${bandMembers.length} member${bandMembers.length !== 1 ? 's' : ''}`" />
                    </div>
                </template>
                <template #content>
                    <div v-if="bandMembers.length > 0" class="members-list">
                        <div v-for="member in bandMembers" :key="member.id" class="member-item">
                            <Avatar 
                                :label="getInitials(member.firstName, member.lastName)" 
                                size="large"
                                shape="circle"
                                :style="{ backgroundColor: member.role === 'Band Leader' ? 'var(--hoojams-orange)' : 'var(--p-surface-500)' }"
                            />
                            <div class="member-info">
                                <h4>{{ member.firstName }} {{ member.lastName }}</h4>
                                <div class="member-details">
                                    <Badge 
                                        :value="member.role" 
                                        :severity="member.role === 'Band Leader' ? 'warning' : 'info'"
                                    />
                                    <span v-if="member.instrument" class="instrument">
                                        <i class="pi pi-music"></i> {{ member.instrument }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p v-else class="no-members">
                        No member information available.
                    </p>
                </template>
            </Card>



            <!-- Admin Section (WXTJ only) -->
            <Card v-if="isAdmin" class="admin-card">
                <template #title>
                    <span style="color: var(--p-red-500);">
                        <i class="pi pi-shield"></i> Admin Information
                    </span>
                </template>
                <template #content>
                    <div class="admin-info">
                        <p><strong>Band ID:</strong> {{ bandDetails.id }}</p>
                        <p><strong>Created:</strong> {{ bandDetails.dateCreated || 'Unknown' }}</p>
                        <p><strong>Status:</strong> {{ bandDetails.status || 'Active' }}</p>
                        <div class="admin-actions">
                            <Button label="Edit Band" icon="pi pi-pencil" severity="warning" outlined />
                            <Button label="View Logs" icon="pi pi-list" severity="info" outlined />
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Avatar from 'primevue/avatar';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// TypeScript interfaces

interface BandDetails {
    id: string;
    name: string;
    genre?: string | null;
    description?: string | null;
    location?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    isFavorite: boolean;
    dateCreated?: string;
    status?: string;
}

interface BandMember {
    id: string;
    firstName: string;
    lastName: string;
    instrument?: string | null;
    role: string;
}



interface UserBandRelationship {
    isSignedIn: boolean;
    userRole: string;
    relationshipToBand: 'same_band' | 'different_band' | 'no_band' | 'anonymous';
    canSeeMembers: boolean;
    canSeeContact: boolean;
    canRequestToJoin: boolean;
    canFavorite: boolean;
    isOwnBand: boolean;
    isAdmin: boolean;
}

// Reactive data
const loading = ref(true);
const bandDetails = ref<BandDetails>({
    id: '',
    name: '',
    genre: null,
    description: null,
    location: null,
    email: null,
    phoneNumber: null,
    isFavorite: false
});

const bandMembers = ref<BandMember[]>([]);
const userRelationship = ref<UserBandRelationship>({
    isSignedIn: false,
    userRole: 'anonymous',
    relationshipToBand: 'anonymous',
    canSeeMembers: false,
    canSeeContact: false,
    canRequestToJoin: false,
    canFavorite: false,
    isOwnBand: false,
    isAdmin: false
});

// Get current user ID from localStorage
const getCurrentUserId = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            return String(user.userId);
        } catch (error) {
            console.error('Error parsing saved user:', error);
            return null;
        }
    }
    return null;
};

// Computed properties for permissions
const canSeeMembers = computed(() => userRelationship.value.canSeeMembers);
const canSeeContact = computed(() => userRelationship.value.canSeeContact);
const canRequestToJoin = computed(() => userRelationship.value.canRequestToJoin);
const canFavorite = computed(() => userRelationship.value.canFavorite);
const isOwnBand = computed(() => userRelationship.value.isOwnBand);
const isAdmin = computed(() => userRelationship.value.isAdmin);

// API Functions
const fetchBandDetails = async () => {
    const bandId = route.params.id as string;
    const currentUserId = getCurrentUserId();
    
    try {
        // Build URL with user context for permissions
        let url = `http://localhost:3001/api/bands/${bandId}/details`;
        if (currentUserId) {
            url += `?userId=${currentUserId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                bandDetails.value = { id: '', name: '', isFavorite: false };
                return;
            }
            throw new Error('Failed to fetch band details');
        }
        
        const data = await response.json();
        bandDetails.value = data.band;
        bandMembers.value = data.members || [];
        userRelationship.value = data.userRelationship;
    } catch (error) {
        console.error('Error fetching band details:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load band details',
            life: 3000
        });
    }
};

const toggleFavorite = async () => {
    if (!canFavorite.value) return;
    
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    const newFavoriteStatus = !bandDetails.value.isFavorite;
    const originalStatus = bandDetails.value.isFavorite;
    
    // Optimistic update
    bandDetails.value.isFavorite = newFavoriteStatus;
    
    try {
        const response = await fetch(`/api/users/${currentUserId}/favorite-bands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                bandId: bandDetails.value.id, 
                makeFavorite: newFavoriteStatus 
            })
        });
        
        if (!response.ok) throw new Error('Failed to update favorite status');
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Band ${newFavoriteStatus ? 'added to' : 'removed from'} favorites`,
            life: 3000
        });
    } catch (error) {
        // Revert on error
        bandDetails.value.isFavorite = originalStatus;
        console.error('Failed to toggle favorite:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update favorite status',
            life: 3000
        });
    }
};

const requestToJoin = async () => {
    if (!canRequestToJoin.value) return;
    
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    try {
        const response = await fetch(`/api/bands/${bandDetails.value.id}/join-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserId,
                message: `I would like to join ${bandDetails.value.name}.`
            })
        });
        
        if (!response.ok) throw new Error('Failed to send join request');
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Join request sent successfully!',
            life: 3000
        });
        
        // Update relationship status
        userRelationship.value.canRequestToJoin = false;
    } catch (error) {
        console.error('Failed to send join request:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to send join request',
            life: 3000
        });
    }
};

// Utility functions
const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Lifecycle
onMounted(async () => {
    await fetchBandDetails();
    loading.value = false;
});
</script>

<style scoped>
.band-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.band-header {
    margin-bottom: 2rem;
}

.back-button {
    margin-bottom: 1rem;
}

.band-title-section {
    margin-bottom: 1rem;
}

.band-title-section h1 {
    margin: 0 0 0.5rem 0;
    color: var(--p-text-color);
}

.band-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.action-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
}

.band-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.info-grid, .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.info-item, .contact-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.info-item.full-width {
    grid-column: 1 / -1;
}

.info-item label, .contact-item label {
    font-weight: 600;
    color: var(--p-text-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.info-item p, .contact-item p {
    margin: 0;
    color: var(--p-text-muted-color);
    line-height: 1.5;
}

.members-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.member-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--p-surface-ground);
    border-radius: 8px;
    border: 1px solid var(--p-surface-border);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.member-info h4 {
    margin: 0 0 0.5rem 0;
    color: var(--p-text-color);
}

.member-details {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.instrument {
    color: var(--p-text-muted-color);
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.no-contact, .no-members {
    text-align: center;
    padding: 2rem;
    color: var(--p-text-muted-color);
}

.admin-card {
    border: 2px solid var(--p-red-200);
}

.admin-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.admin-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

@media (max-width: 768px) {
    .info-grid, .contact-grid {
        grid-template-columns: 1fr;
    }
    
    .action-buttons {
        flex-direction: column;
    }
    
    .member-item {
        flex-direction: column;
        align-items: flex-start;
        text-align: center;
    }
    
    .admin-actions {
        flex-direction: column;
    }
}
</style> 