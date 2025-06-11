<template>
    <div class="band-header">
        <div class="header-content">
            <div class="band-info">
                <h1>{{ bandInfo.name || 'Loading...' }}</h1>
                <p v-if="bandInfo.name">{{ bandInfo.genre }} • {{ bandInfo.members.length }} members</p>
            </div>
            <div v-if="bandInfo.name" class="header-actions">
                <Button
                    label="Actions"
                    icon="pi pi-cog"
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
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
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
}>();

// Refs for menu
const actionsMenu = ref();
const actionsButton = ref();

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
</script>

<!-- Styles moved to dedicated CSS file: src/assets/components/band-header.css -->
