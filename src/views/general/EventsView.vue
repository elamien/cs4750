<template>
    <div class="events">
        <!-- Glass Submenu for signed-in users -->
        <GlassSubmenu
            v-if="isAuthenticated && !loading && activeSection"
            :menu-items="submenuItems"
            :active-item="activeSection"
            @item-selected="handleSectionChange"
        />

        <!-- Main Content Area -->
        <div class="main-content" :class="{ 'no-submenu': !isAuthenticated }">
            <!-- Loading State -->
            <div v-if="loading || (isAuthenticated && !activeSection)" class="content-section">
                <div class="empty-state">
                    <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--p-primary-color);"></i>
                    <h3>Loading...</h3>
                </div>
            </div>

            <!-- Browse Events Section -->
            <div v-else-if="activeSection === 'browse' || !isAuthenticated" class="content-section" :class="{ 'full-width': !isAuthenticated }">
                <BrowseEventsComponent />
            </div>

            <!-- My Events Section -->
            <div v-else-if="activeSection === 'my-events'" class="content-section">
                <MyEventsComponent />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BrowseEventsComponent from '@/components/events/BrowseEventsComponent.vue';
import MyEventsComponent from '@/components/events/MyEventsComponent.vue';
import GlassSubmenu from '@/components/ui/GlassSubmenu.vue';
import { useAuth } from '@/composables/useAuth';

const route = useRoute();
const router = useRouter();
const { isAuthenticated } = useAuth();

// Active section for glass submenu
const activeSection = ref('');
const loading = ref(true);

// Submenu items
const submenuItems = computed(() => {
    const items = [
        { label: 'Browse', value: 'browse', icon: 'pi pi-search' },
        { label: 'My Events', value: 'my-events', icon: 'pi pi-calendar' }
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

    if (isAuthenticated.value) {
        // Set initial section from URL or default to first item
        const sectionFromUrl = route.query.tab as string;
        if (sectionFromUrl && ['browse', 'my-events'].includes(sectionFromUrl)) {
            activeSection.value = sectionFromUrl;
        } else {
            // Default to the first item in submenuItems
            const firstItem = submenuItems.value[0];
            if (firstItem) {
                activeSection.value = firstItem.value;
            }
        }
    } else {
        // For anonymous users, always show browse
        activeSection.value = 'browse';
    }

    loading.value = false;
});
</script>

<style scoped>
/* EventsView Styles - Glass Submenu Layout */
.events {
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

    /* Transparent background */
    background: transparent;
    border: none;
    box-shadow: none;
}

/* Full width content when no submenu (anonymous users) */
.main-content.no-submenu {
    margin-left: 0;
    width: 100%;
    max-width: none;
}

.content-section {
    max-width: 1000px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
}

/* Full width content section for anonymous users */
.content-section.full-width {
    max-width: none;
    margin: 0;
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

    .main-content.no-submenu {
        margin-left: 0;
        width: 100%;
        max-width: none;
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

    .main-content.no-submenu {
        margin-left: 0;
        width: 100%;
        max-width: none;
        padding: 1rem;
    }
}

/* Dark mode adjustments for main-content */
[data-theme="dark"] .main-content {
    background: transparent;
    border: none;
}
</style>
