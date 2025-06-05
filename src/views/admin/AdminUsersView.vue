<template>
    <div class="admin-users">
        <div class="header">
            <h1>User Management</h1>
            <p>Manage all users in the system</p>
        </div>
        
        <Card>
            <template #content>
                <div class="users-controls">
                    <div class="controls-left">
                        <h3>System Users</h3>
                        <p>Total Users: {{ users.length }}</p>
                    </div>
                    <div class="controls-right">
                        <Button 
                            icon="pi pi-refresh" 
                            label="Refresh" 
                            @click="fetchUsers"
                            :loading="loading"
                        />
                    </div>
                </div>
                
                <div v-if="loading" class="loading-state">
                    <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
                    <p>Loading users...</p>
                </div>
                
                <div v-else-if="users.length === 0" class="empty-state">
                    <p>No users found.</p>
                </div>
                
                <DataTable 
                    v-else
                    :value="users" 
                    stripedRows
                    showGridlines
                    responsiveLayout="scroll"
                    :paginator="true"
                    :rows="10"
                >
                    <Column field="id" header="ID" sortable style="width: 80px">
                        <template #body="{ data }">
                            <Tag severity="secondary">{{ data.id }}</Tag>
                        </template>
                    </Column>
                    
                    <Column field="firstName" header="Name" sortable>
                        <template #body="{ data }">
                            <div class="user-name">
                                <strong>{{ data.firstName }} {{ data.lastName }}</strong>
                                <small class="block text-500">{{ data.email }}</small>
                            </div>
                        </template>
                    </Column>
                    
                    <Column field="roleName" header="Role" sortable style="width: 180px">
                        <template #body="{ data }">
                            <Tag 
                                :severity="getRoleSeverity(data.roleName)" 
                                :icon="getRoleIcon(data.roleName)"
                            >
                                {{ data.roleName }}
                            </Tag>
                        </template>
                    </Column>
                    
                    <Column field="roleDetails" header="Status" sortable style="width: 220px">
                        <template #body="{ data }">
                            <span class="role-details">{{ data.roleDetails }}</span>
                        </template>
                    </Column>
                    
                    <Column field="genre" header="Genre" sortable style="width: 120px">
                        <template #body="{ data }">
                            <Tag v-if="data.genre" severity="info">{{ data.genre }}</Tag>
                            <span v-else class="text-500">—</span>
                        </template>
                    </Column>
                    
                    <Column field="instrument" header="Instrument" sortable style="width: 120px">
                        <template #body="{ data }">
                            <Tag v-if="data.instrument" severity="success">{{ data.instrument }}</Tag>
                            <span v-else class="text-500">—</span>
                        </template>
                    </Column>
                    
                    <Column header="Actions" style="width: 120px">
                        <template #body="{ data }">
                            <div class="action-buttons">
                                <Button 
                                    icon="pi pi-user" 
                                    severity="secondary" 
                                    text 
                                    @click="viewUser(data)"
                                    v-tooltip="'View Details'"
                                />
                                <Button 
                                    icon="pi pi-pencil" 
                                    severity="warning" 
                                    text 
                                    @click="editUser(data)"
                                    v-tooltip="'Edit Role'"
                                />
                                <Button 
                                    icon="pi pi-trash" 
                                    severity="danger" 
                                    text 
                                    @click="deleteUser(data)"
                                    v-tooltip="'Delete User'"
                                />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
        
        <!-- Confirmation Dialog -->
        <ConfirmDialog />
        
        <!-- User Details Modal -->
        <Dialog 
            v-model:visible="showUserDetailsModal" 
            modal 
            header="User Details" 
            :style="{ width: '50rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        >
            <div v-if="selectedUser" class="user-details">
                <!-- Header Section -->
                <div class="user-header">
                    <div class="user-avatar">
                        <i class="pi pi-user" style="font-size: 3rem; color: var(--p-primary-color)"></i>
                    </div>
                    <div class="user-info">
                        <h3>{{ selectedUser.firstName }} {{ selectedUser.lastName }}</h3>
                        <p class="user-email">{{ selectedUser.email }}</p>
                        <Tag 
                            :severity="getRoleSeverity(selectedUser.roleName)" 
                            :icon="getRoleIcon(selectedUser.roleName)"
                            class="role-tag"
                        >
                            {{ selectedUser.roleName }}
                        </Tag>
                    </div>
                </div>
                
                <!-- Details Grid -->
                <div class="details-grid">
                    <div class="detail-item">
                        <label>User ID</label>
                        <span>{{ selectedUser.id }}</span>
                    </div>
                    
                    <div class="detail-item">
                        <label>Email Address</label>
                        <span>{{ selectedUser.email }}</span>
                    </div>
                    
                    <div class="detail-item">
                        <label>Phone Number</label>
                        <span>{{ selectedUser.phoneNumber || 'Not provided' }}</span>
                    </div>
                    
                    <div class="detail-item">
                        <label>Role Status</label>
                        <span>{{ selectedUser.roleDetails }}</span>
                    </div>
                    
                    <div class="detail-item">
                        <label>Musical Genre</label>
                        <span>
                            <Tag v-if="selectedUser.genre" severity="info">{{ selectedUser.genre }}</Tag>
                            <span v-else class="text-500">Not specified</span>
                        </span>
                    </div>
                    
                    <div class="detail-item">
                        <label>Primary Instrument</label>
                        <span>
                            <Tag v-if="selectedUser.instrument" severity="success">{{ selectedUser.instrument }}</Tag>
                            <span v-else class="text-500">Not specified</span>
                        </span>
                    </div>
                    
                    <div class="detail-item span-2" v-if="selectedUser.bio">
                        <label>Bio</label>
                        <p class="bio-text">{{ selectedUser.bio }}</p>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="modal-actions">
                    <Button 
                        label="Edit User" 
                        icon="pi pi-pencil" 
                        severity="warning"
                        @click="editUserFromModal"
                    />
                    <Button 
                        label="Delete User" 
                        icon="pi pi-trash" 
                        severity="danger"
                        outlined
                        @click="deleteUserFromModal"
                    />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import Dialog from 'primevue/dialog'

interface User {
    id: string
    firstName: string
    lastName: string
    bio?: string
    email: string
    phoneNumber?: string
    genre?: string
    instrument?: string
    roleName: string
    roleDetails: string
}

const users = ref<User[]>([])
const loading = ref(true)
const confirm = useConfirm()
const toast = useToast()
const showUserDetailsModal = ref(false)
const selectedUser = ref<User | null>(null)

const fetchUsers = async () => {
    loading.value = true
    try {
        const response = await fetch('/api/users')
        if (response.ok) {
            users.value = await response.json()
        } else {
            console.error('Failed to fetch users')
        }
    } catch (error) {
        console.error('Error fetching users:', error)
    } finally {
        loading.value = false
    }
}

const getRoleSeverity = (roleName: string) => {
    switch (roleName) {
        case 'WXTJ Executive': return 'danger'
        case 'Band Leader': return 'warning'
        case 'Band Member': return 'success'
        case 'General User': return 'info'
        default: return 'secondary'
    }
}

const getRoleIcon = (roleName: string) => {
    switch (roleName) {
        case 'WXTJ Executive': return 'pi pi-shield'
        case 'Band Leader': return 'pi pi-crown'
        case 'Band Member': return 'pi pi-users'
        case 'General User': return 'pi pi-user'
        default: return 'pi pi-question'
    }
}

const viewUser = (user: User) => {
    selectedUser.value = user
    showUserDetailsModal.value = true
}

const editUserFromModal = () => {
    if (selectedUser.value) {
        editUser(selectedUser.value)
        showUserDetailsModal.value = false
    }
}

const deleteUserFromModal = () => {
    if (selectedUser.value) {
        deleteUser(selectedUser.value)
        showUserDetailsModal.value = false
    }
}

const editUser = (user: User) => {
    // TODO: Implement edit user role modal
    console.log('Edit user:', user)
}

const deleteUser = (user: User) => {
    confirm.require({
        message: `Are you sure you want to delete "${user.firstName} ${user.lastName}"?`,
        header: 'Delete User Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                const response = await fetch(`/api/users/${user.id}`, {
                    method: 'DELETE'
                })
                
                const data = await response.json()
                
                if (response.ok) {
                    toast.add({
                        severity: 'success',
                        summary: 'User Deleted',
                        detail: `${user.firstName} ${user.lastName} has been deleted successfully.`,
                        life: 5000
                    })
                    
                    // Refresh the users list
                    await fetchUsers()
                } else {
                    toast.add({
                        severity: 'error',
                        summary: 'Delete Failed',
                        detail: data.message || 'Failed to delete user.',
                        life: 5000
                    })
                }
            } catch (error) {
                console.error('Error deleting user:', error)
                toast.add({
                    severity: 'error',
                    summary: 'Delete Error',
                    detail: 'An error occurred while deleting the user.',
                    life: 5000
                })
            }
        }
    })
}

onMounted(() => {
    fetchUsers()
})
</script>

<style scoped>
.admin-users {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}

.users-controls {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--p-surface-border);
}

.controls-left h3 {
    margin: 0 0 0.5rem 0;
    color: var(--p-text-color);
}

.controls-left p {
    margin: 0;
    color: var(--p-text-muted-color);
    font-size: 0.9rem;
}

.user-name {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.role-details {
    font-size: 0.85rem;
    color: var(--p-text-muted-color);
}

.action-buttons {
    display: flex;
    gap: 0.25rem;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--p-text-muted-color);
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

/* User Details Modal Styling */
.user-details {
    padding: 1rem 0;
}

.user-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--p-surface-border);
}

.user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--p-surface-100);
}

.user-info h3 {
    margin: 0 0 0.5rem 0;
    color: var(--p-text-color);
    font-size: 1.5rem;
}

.user-email {
    margin: 0 0 1rem 0;
    color: var(--p-text-muted-color);
    font-size: 0.95rem;
}

.role-tag {
    margin-top: 0.5rem;
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.detail-item.span-2 {
    grid-column: 1 / -1;
}

.detail-item label {
    font-weight: 600;
    color: var(--p-text-color);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.detail-item span {
    color: var(--p-text-muted-color);
}

.bio-text {
    margin: 0;
    line-height: 1.6;
    color: var(--p-text-color);
    background: var(--p-surface-50);
    padding: 1rem;
    border-radius: 6px;
    border-left: 3px solid var(--p-primary-color);
}

.modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid var(--p-surface-border);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .admin-users {
        padding: 1rem;
    }
    
    .users-controls {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .action-buttons {
        flex-direction: column;
    }
}
</style> 