<template>
    <div class="band-members">
        <div class="header">
            <h1>Manage Band Members</h1>
            <p>View your current band members and manage membership.</p>
        </div>
        
        <div v-if="loading" class="loading-state">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
            <p>Loading band members...</p>
        </div>

        <div v-else-if="!bandInfo.id" class="no-band-state">
            <Card>
                <template #content>
                    <div class="empty-state">
                        <i class="pi pi-users" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
                        <h3>No Band Found</h3>
                        <p>You are not currently associated with any band. You need to be a band leader to access this page.</p>
                    </div>
                </template>
            </Card>
        </div>

        <div v-else class="band-content">
            <!-- Band Overview -->
            <Card class="band-overview-card">
                <template #title>
                    <div class="band-title">
                        <i class="pi pi-users"></i>
                        {{ bandInfo.name }}
                    </div>
                </template>
                <template #subtitle>{{ bandInfo.genre || 'No genre specified' }}</template>
                <template #content>
                    <p v-if="bandInfo.description">{{ bandInfo.description }}</p>
                    <p v-else class="no-description">No description provided.</p>
                    
                    <div class="member-count">
                        <strong>Total Members: {{ bandMembers.length }}</strong>
                    </div>
                </template>
            </Card>

            <!-- Band Members List -->
            <Card class="members-list-card">
                <template #title>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span>Band Members</span>
                        <Badge :value="`${bandMembers.length} member${bandMembers.length !== 1 ? 's' : ''}`" />
                    </div>
                </template>
                <template #content>
                    <div v-if="bandMembers.length > 0" class="members-grid">
                        <div v-for="member in bandMembers" :key="member.id" class="member-card">
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
                                        class="role-badge"
                                    />
                                    <span v-if="member.instrument" class="instrument">
                                        <i class="pi pi-music"></i> {{ member.instrument }}
                                    </span>
                                    <span v-else class="no-instrument">
                                        <i class="pi pi-minus"></i> No instrument specified
                                    </span>
                                </div>
                            </div>
                            <div class="member-actions" v-if="member.role !== 'Band Leader'">
                                <Button 
                                    icon="pi pi-user-minus" 
                                    severity="danger" 
                                    outlined
                                    size="small"
                                    @click="confirmRemoveMember(member)"
                                    title="Remove member from band"
                                />
                            </div>
                        </div>
                    </div>
                    <div v-else class="no-members">
                        <i class="pi pi-users" style="font-size: 2rem; color: var(--p-text-muted-color);"></i>
                        <p>No members found for this band.</p>
                    </div>
                </template>
            </Card>

            <!-- Management Actions -->
            <Card class="actions-card">
                <template #title>Membership Management</template>
                <template #content>
                    <div class="management-actions">
                        <div class="action-item">
                            <div class="action-info">
                                <h4>Review Join Requests</h4>
                                <p>Approve or decline pending membership requests.</p>
                            </div>
                            <Button 
                                label="View Requests" 
                                icon="pi pi-inbox"
                                outlined
                                @click="viewMemberRequests"
                            />
                        </div>
                        
                        <div class="action-item">
                            <div class="action-info">
                                <h4>Invite New Members</h4>
                                <p>Send invitations to potential band members.</p>
                            </div>
                            <Button 
                                label="Send Invites" 
                                icon="pi pi-send"
                                outlined
                                disabled
                                title="Coming soon"
                            />
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Remove Member Confirmation Dialog -->
        <Dialog 
            v-model:visible="showRemoveDialog" 
            modal 
            header="Remove Band Member" 
            :style="{ width: '25rem' }"
        >
            <p v-if="memberToRemove">
                Are you sure you want to remove <strong>{{ memberToRemove.firstName }} {{ memberToRemove.lastName }}</strong> from the band? This action cannot be undone.
            </p>
            <template #footer>
                <Button 
                    label="Cancel" 
                    severity="secondary" 
                    @click="showRemoveDialog = false" 
                />
                <Button 
                    label="Remove Member" 
                    severity="danger" 
                    @click="removeMember" 
                />
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

// Data interfaces
interface BandInfo {
    id: string;
    name: string;
    genre?: string | null;
    description?: string | null;
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
const showRemoveDialog = ref(false);
const memberToRemove = ref<BandMember | null>(null);

const bandInfo = ref<BandInfo>({
    id: '',
    name: '',
    genre: null,
    description: null
});

const bandMembers = ref<BandMember[]>([]);

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

const currentUserId = ref(getCurrentUserId());

// API Functions
const fetchBandInfo = async () => {
    if (!currentUserId.value) {
        console.error('User not authenticated');
        return;
    }

    try {
        // First, get the user's band information
        const response = await fetch(`/api/users/${currentUserId.value}/band-status`);
        if (!response.ok) throw new Error('Failed to fetch user band status');
        
        const bandStatus = await response.json();
        
        // Check if user has a band
        if (!bandStatus.isMemberOfBand || bandStatus.memberBands.length === 0) {
            bandInfo.value = { id: '', name: '', genre: null, description: null };
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
            description: band.description
        };
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
    if (!bandInfo.value.id) return;

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

// Utility functions
const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const confirmRemoveMember = (member: BandMember) => {
    memberToRemove.value = member;
    showRemoveDialog.value = true;
};

const removeMember = async () => {
    if (!memberToRemove.value || !currentUserId.value || !bandInfo.value.id) return;

    try {
        const response = await fetch(`/api/bands/${bandInfo.value.id}/members/${memberToRemove.value.id}/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentUserId: currentUserId.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to remove member');
        }

        toast.add({
            severity: 'success',
            summary: 'Member Removed',
            detail: `${memberToRemove.value.firstName} ${memberToRemove.value.lastName} has been removed from the band`,
            life: 3000
        });

        showRemoveDialog.value = false;
        memberToRemove.value = null;

        // Refresh the members list
        await fetchBandMembers();
    } catch (error) {
        console.error('Error removing member:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to remove member',
            life: 3000
        });
    }
};

const viewMemberRequests = () => {
    router.push('/my-band/member-requests');
};

// Lifecycle
onMounted(() => {
    loadAllData();
});
</script>

<style scoped>
.band-members {
    max-width: 1000px;
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
}

.loading-state, .no-band-state {
    text-align: center;
    padding: 3rem;
}

.loading-state i {
    margin-bottom: 1rem;
    color: var(--hoojams-orange);
}

.empty-state {
    text-align: center;
    padding: 2rem;
}

.empty-state i {
    margin-bottom: 1rem;
}

.empty-state h3 {
    color: var(--theme-main-text);
    margin-bottom: 0.5rem;
}

.band-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.band-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.no-description {
    color: var(--theme-secondary-text);
    font-style: italic;
}

.member-count {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--p-surface-border);
}

.members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.member-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--p-surface-border);
    border-radius: 8px;
    background: var(--p-surface-0);
    position: relative;
}

.member-info {
    flex: 1;
}

.member-info h4 {
    margin: 0 0 0.5rem;
    color: var(--theme-main-text);
}

.member-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.role-badge {
    align-self: flex-start;
}

.instrument, .no-instrument {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.9rem;
    color: var(--theme-secondary-text);
}

.member-actions {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
}

.no-members {
    text-align: center;
    padding: 2rem;
}

.no-members i {
    margin-bottom: 1rem;
}

.management-actions {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.action-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid var(--p-surface-border);
    border-radius: 6px;
    background: var(--p-surface-50);
}

.action-info h4 {
    margin: 0 0 0.25rem;
    color: var(--theme-main-text);
}

.action-info p {
    margin: 0;
    color: var(--theme-secondary-text);
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .band-members {
        padding: 1rem;
    }
    
    .members-grid {
        grid-template-columns: 1fr;
    }
    
    .action-item {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
}
</style> 