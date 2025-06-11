<template>
    <div class="admin">
        <!-- Glass Submenu -->
        <GlassSubmenu
            v-if="!loading && activeSection"
            title="Admin Panel"
            :menu-items="submenuItems"
            :active-item="activeSection"
            @item-selected="handleSectionChange"
        />

        <!-- Main Content Area -->
        <div class="main-content">
            <!-- Loading State -->
            <div v-if="loading || !activeSection" class="content-section">
                <div class="empty-state">
                    <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--p-primary-color);"></i>
                    <h3>Loading...</h3>
                </div>
            </div>

            <!-- Manage Users Section -->
            <div v-else-if="activeSection === 'users'" class="content-section">
                <AdminUsersComponent />
            </div>

            <!-- Manage Bands Section -->
            <div v-else-if="activeSection === 'bands'" class="content-section">
                <AdminBandsComponent />
            </div>

            <!-- Manage Events Section -->
            <div v-else-if="activeSection === 'events'" class="content-section">
                <AdminEventsComponent />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminUsersComponent from './AdminUsersView.vue';
import AdminBandsComponent from './AdminBandsView.vue';
import AdminEventsComponent from './AdminEventsView.vue';
import GlassSubmenu from '@/components/ui/GlassSubmenu.vue';

const route = useRoute();
const router = useRouter();

// Active section for glass submenu
const activeSection = ref('');
const loading = ref(true);

// Submenu items
const submenuItems = computed(() => {
    const items = [
        { label: 'Manage Users', value: 'users', icon: 'pi pi-users' },
        { label: 'Manage Bands', value: 'bands', icon: 'pi pi-users' },
        { label: 'Manage Events', value: 'events', icon: 'pi pi-calendar' }
    ];

    return items;
});

// Event Handlers
const handleSectionChange = (section: string) => {
    activeSection.value = section;
    // Update URL to reflect the current section
    router.replace({ query: { tab: section } });
};

// Lifecycle
onMounted(async () => {
    loading.value = true;

    // Set initial section from URL or default to first item
    const sectionFromUrl = route.query.tab as string;
    if (sectionFromUrl && ['users', 'bands', 'events'].includes(sectionFromUrl)) {
        activeSection.value = sectionFromUrl;
    } else {
        // Default to the first item in submenuItems
        const firstItem = submenuItems.value[0];
        if (firstItem) {
            activeSection.value = firstItem.value;
        }
    }

    loading.value = false;
});
</script>

<style scoped>
/* AdminView Styles - Glass Submenu Layout */
.admin {
    width: 100%;
    position: relative;
}

/* Main content area - positioned to account for dynamic glass submenu */
.main-content {
    margin-left: var(--submenu-content-margin, 280px); /* Dynamic space based on actual submenu width */
    width: calc(100vw - var(--submenu-content-margin, 280px)); /* Ensure it doesn't overflow */
    max-width: calc(100vw - var(--submenu-content-margin, 280px));
    padding: 2rem;
    box-sizing: border-box;
    overflow-x: auto; /* Handle any internal overflow gracefully */
    transition: margin-left 0.2s ease, width 0.2s ease; /* Smooth transition when submenu resizes */
}

.content-section {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
}

.empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--p-text-muted-color);
    border: 1px dashed var(--p-surface-border);
    border-radius: 8px;
    margin-bottom: 1rem;
}

.empty-state h3 {
    margin: 1rem 0 0.5rem;
    color: var(--p-text-color);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .main-content {
        margin-left: 220px;
        width: calc(100vw - 220px);
        max-width: calc(100vw - 220px);
        padding: 1.5rem;
    }
}

@media (max-width: 480px) {
    .main-content {
        margin-left: 200px;
        width: calc(100vw - 200px);
        max-width: calc(100vw - 200px);
        padding: 1rem;
    }
}
</style>
