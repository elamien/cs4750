<template>
    <div class="band-header">
        <div class="header-content">
            <div class="band-info">
                <h1>{{ bandInfo.name || 'Loading...' }}</h1>
                <p v-if="bandInfo.name">{{ bandInfo.genre }} • {{ bandInfo.members.length }} members</p>
            </div>
            <div v-if="bandInfo.name" class="header-actions">
                <Button
                    label="Leave"
                    icon="pi pi-sign-out"
                    severity="danger"
                    outlined
                    @click="emit('leaveBand')"
                />
                <Button
                    v-if="isCurrentUserLeader"
                    label="Edit"
                    icon="pi pi-cog"
                    severity="secondary"
                    outlined
                    @click="showBandInfoModal"
                />
            </div>
        </div>

        <!-- Band Info Modal -->
        <Dialog
            v-model:visible="showBandInfoDialog"
            modal
            header="Band Information"
            :style="{ width: '600px' }"
            class="band-info-modal"
        >
            <div class="modal-content">
                <BandInformation
                    :bandInfo="bandInfo"
                    @band-updated="handleBandUpdated"
                />
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import BandInformation from './BandInformation.vue';

// Import dedicated CSS file
import '@/assets/components/band-header.css';

interface BandUser {
    id: string;
    firstName: string;
    lastName: string;
    instrument?: string | null;
    role?: string;
}

interface BandInfo {
    id: string;
    name: string;
    genre?: string | null;
    description?: string | null;
    location?: string | null;
    members: BandUser[];
}

const props = defineProps<{
    bandInfo: BandInfo;
}>();

const emit = defineEmits<{
    leaveBand: [];
    bandUpdated: [bandInfo: BandInfo];
}>();

// Modal state
const showBandInfoDialog = ref(false);

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

// Check if current user is a band leader
const isCurrentUserLeader = computed(() => {
    if (!currentUserId) return false;
    return props.bandInfo.members.some(member =>
        member.id === currentUserId && member.role === 'Band Leader'
    );
});



// Show band info modal
const showBandInfoModal = () => {
    showBandInfoDialog.value = true;
};

// Handle band information updated
const handleBandUpdated = (updatedBandInfo: BandInfo) => {
    emit('bandUpdated', updatedBandInfo);
};
</script>

<!-- Styles moved to dedicated CSS file: src/assets/components/band-header.css -->
