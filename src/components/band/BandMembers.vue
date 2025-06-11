<template>
    <div>
        <Card class="members-section glass-card">
        <template #title>
            <div class="members-header">
                <div class="members-title">
                    <span>Band Members</span>
                </div>
                <div class="members-actions">
                    <Button
                        v-if="selectedMembers.length > 0"
                        :label="`Remove ${selectedMembers.length} Member${selectedMembers.length !== 1 ? 's' : ''}`"
                        icon="pi pi-trash"
                        severity="danger"
                        size="small"
                        @click="bulkRemoveMembers"
                    />
                    <Button
                        :label="isEditMode ? 'Cancel' : 'Manage'"
                        :icon="isEditMode ? 'pi pi-times' : 'pi pi-cog'"
                        :severity="isEditMode ? 'secondary' : 'primary'"
                        size="small"
                        @click="toggleEditMode"
                    />
                </div>
            </div>
        </template>
        <template #content>
            <div class="members-list">
                <!-- Select All Checkbox (when in edit mode) -->
                <div v-if="isEditMode" class="select-all-row">
                    <Checkbox
                        v-model="selectAll"
                        @change="toggleSelectAll"
                        binary
                    />
                    <label>Select All Members</label>
                </div>

                <div v-for="member in members" :key="member.id" class="member-item glass-item" :class="{ 'edit-mode': isEditMode }">
                    <!-- Selection Checkbox (when in edit mode) -->
                    <Checkbox
                        v-if="isEditMode && member.role !== 'leader'"
                        v-model="selectedMembers"
                        :value="member.id"
                        binary
                        class="member-checkbox"
                    />

                    <Avatar :label="getInitials(member.firstName, member.lastName)" shape="circle" />

                    <div class="member-info">
                        <div class="member-name">
                            <strong>{{ member.firstName }} {{ member.lastName }}</strong>
                            <Tag v-if="member.role === 'leader'" value="Leader" severity="warn" />
                        </div>

                        <div class="member-details">
                            <div class="member-instrument">
                                <i class="pi pi-music"></i>
                                {{ member.instrument || 'No instrument specified' }}
                            </div>
                        </div>
                    </div>

                    <!-- Member Actions -->
                    <div class="member-actions">
                        <div v-if="isEditMode && member.role !== 'leader'" class="edit-actions">
                            <Button
                                icon="pi pi-trash"
                                severity="danger"
                                outlined
                                size="small"
                                @click="confirmRemoveMember(member)"
                                title="Remove member"
                            />
                        </div>
                    </div>
                </div>

                <div v-if="members.length === 0" class="no-members">
                    <i class="pi pi-users" style="font-size: 2rem; color: var(--p-text-muted-color);"></i>
                    <p>No members found for this band.</p>
                </div>
            </div>
        </template>
    </Card>

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
                :loading="removingMember"
            />
        </template>
    </Dialog>

    <!-- Bulk Remove Confirmation Dialog -->
    <Dialog
        v-model:visible="showBulkRemoveDialog"
        modal
        header="Remove Multiple Members"
        :style="{ width: '30rem' }"
    >
        <p>Are you sure you want to remove <strong>{{ selectedMembers.length }}</strong> member(s) from the band? This action cannot be undone.</p>
        <ul class="members-to-remove">
            <li v-for="memberId in selectedMembers" :key="memberId">
                {{ getMemberName(memberId) }}
            </li>
        </ul>
        <template #footer>
            <Button
                label="Cancel"
                severity="secondary"
                @click="showBulkRemoveDialog = false"
            />
            <Button
                label="Remove Members"
                severity="danger"
                @click="confirmBulkRemove"
                :loading="bulkRemoving"
            />
        </template>
    </Dialog>
    </div>
</template>

<script setup lang="ts">
// Import dedicated CSS file
import '@/assets/components/band-members.css';

import { ref, watch } from 'vue';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

interface BandUser {
    id: string;
    firstName: string;
    lastName: string;
    instrument?: string | null;
    role?: string;
}

const props = defineProps<{
    members: BandUser[];
}>();

const emit = defineEmits<{
    membersUpdated: [members: BandUser[]];
}>();

// State
const isEditMode = ref(false);
const selectedMembers = ref<string[]>([]);
const selectAll = ref(false);
const showRemoveDialog = ref(false);
const showBulkRemoveDialog = ref(false);
const memberToRemove = ref<BandUser | null>(null);

// Loading states
const removingMember = ref(false);
const bulkRemoving = ref(false);

// Get current user ID
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

const currentUserId = getCurrentUserId();

// Get current band ID
const getCurrentBandId = () => {
    // This should come from parent component or global state
    // For now, we'll get it from the URL or props
    return '1'; // TODO: Get actual band ID
};

// Utility functions
const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getMemberName = (memberId: string): string => {
    const member = props.members.find(m => m.id === memberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
};

// Edit mode functions
const toggleEditMode = () => {
    if (isEditMode.value) {
        // Cancel edit mode
        selectedMembers.value = [];
        selectAll.value = false;
    }
    isEditMode.value = !isEditMode.value;
};

// Selection functions
const toggleSelectAll = () => {
    if (selectAll.value) {
        selectedMembers.value = props.members
            .filter(member => member.role !== 'leader')
            .map(member => member.id);
    } else {
        selectedMembers.value = [];
    }
};

// Watch for changes in selectedMembers to update selectAll
watch(selectedMembers, (newSelected) => {
    const selectableMembers = props.members.filter(member => member.role !== 'leader');
    selectAll.value = newSelected.length === selectableMembers.length && selectableMembers.length > 0;
}, { deep: true });

// Remove member functions
const confirmRemoveMember = (member: BandUser) => {
    memberToRemove.value = member;
    showRemoveDialog.value = true;
};

const removeMember = async () => {
    if (!memberToRemove.value || !currentUserId) return;

    removingMember.value = true;

    try {
        const bandId = getCurrentBandId();
        const response = await fetch(`/api/bands/${bandId}/members/${memberToRemove.value.id}/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentUserId: currentUserId
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

        // Update local data
        const updatedMembers = props.members.filter(member => member.id !== memberToRemove.value?.id);
        emit('membersUpdated', updatedMembers);

    } catch (error) {
        console.error('Error removing member:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to remove member',
            life: 3000
        });
    } finally {
        removingMember.value = false;
    }
};

// Bulk actions
const bulkRemoveMembers = () => {
    if (selectedMembers.value.length === 0) return;
    showBulkRemoveDialog.value = true;
};

const confirmBulkRemove = async () => {
    if (selectedMembers.value.length === 0 || !currentUserId) return;

    bulkRemoving.value = true;

    try {
        const bandId = getCurrentBandId();
        const promises = selectedMembers.value.map(memberId =>
            fetch(`/api/bands/${bandId}/members/${memberId}/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentUserId: currentUserId
                })
            })
        );

        const results = await Promise.all(promises);

        // Check if all requests were successful
        const failures = results.filter(result => !result.ok);
        if (failures.length > 0) {
            throw new Error(`Failed to remove ${failures.length} member(s)`);
        }

        toast.add({
            severity: 'success',
            summary: 'Members Removed',
            detail: `${selectedMembers.value.length} member(s) have been removed from the band`,
            life: 3000
        });

        showBulkRemoveDialog.value = false;

        // Update local data
        const updatedMembers = props.members.filter(member => !selectedMembers.value.includes(member.id));
        emit('membersUpdated', updatedMembers);

        selectedMembers.value = [];

    } catch (error) {
        console.error('Error removing members:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to remove some members',
            life: 3000
        });
    } finally {
        bulkRemoving.value = false;
    }
};
</script>

<!-- Remove the scoped styles since we're using dedicated CSS file -->
