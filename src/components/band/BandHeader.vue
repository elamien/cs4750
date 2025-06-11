<template>
    <div class="band-header">
        <div class="header-content">
            <div class="band-info">
                <h1>{{ bandInfo.name || 'Loading...' }}</h1>
                <p v-if="bandInfo.name">{{ bandInfo.genre }} • {{ bandInfo.members.length }} members</p>
            </div>
            <div v-if="bandInfo.name" class="header-actions">
                <Button
                    label="Edit"
                    icon="pi pi-cog"
                    severity="secondary"
                    outlined
                    @click="showBandInfoModal"
                    ref="infoButton"
                />
                <Button
                    label="Actions"
                    icon="pi pi-ellipsis-h"
                    severity="secondary"
                    outlined
                    @click="toggleActionsMenu"
                    ref="actionsButton"
                />
                <Menu
                    ref="actionsMenu"
                    :model="actionMenuItems"
                    :popup="true"
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
import Menu from 'primevue/menu';
import Dialog from 'primevue/dialog';
import BandInformation from './BandInformation.vue';
import type { MenuItem } from 'primevue/menuitem';

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

defineProps<{
    bandInfo: BandInfo;
}>();

const emit = defineEmits<{
    postFillInRequest: [];
    leaveBand: [];
    bandUpdated: [bandInfo: BandInfo];
}>();

// Refs for menu and modal
const actionsMenu = ref();
const actionsButton = ref();
const infoButton = ref();

// Modal state
const showBandInfoDialog = ref(false);

// Menu items
const actionMenuItems = computed<MenuItem[]>(() => [
    {
        label: 'Request Fill-in',
        icon: 'pi pi-send',
        command: () => emit('postFillInRequest')
    },
    {
        separator: true
    },
    {
        label: 'Leave Band',
        icon: 'pi pi-sign-out',
        command: () => emit('leaveBand'),
        class: 'text-red-500'
    }
]);

// Toggle actions menu
const toggleActionsMenu = (event: Event) => {
    actionsMenu.value.toggle(event);
};

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
