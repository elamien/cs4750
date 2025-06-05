<template>
    <div class="events">
        <TabView v-model:activeIndex="activeTab" @update:activeIndex="updateRoute">
            <TabPanel header="Browse Events" value="browse">
                <BrowseEventsComponent />
            </TabPanel>
            
            <TabPanel header="My Events" value="my-events">
                <MyEventsComponent />
            </TabPanel>
        </TabView>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import BrowseEventsComponent from '@/components/events/BrowseEventsComponent.vue';
import MyEventsComponent from '@/components/events/MyEventsComponent.vue';

const route = useRoute();
const router = useRouter();

// Active tab index (0 = Browse, 1 = My Events)
const activeTab = ref(0);

// Set initial tab based on route query or hash
onMounted(() => {
    const tab = route.query.tab as string;
    if (tab === 'my-events') {
        activeTab.value = 1;
    } else if (tab === 'browse') {
        activeTab.value = 0;
    }
});

// Update URL when tab changes (optional, for bookmarkable URLs)
const updateRoute = (index: number) => {
    const tabName = index === 1 ? 'my-events' : 'browse';
    router.replace({ query: { ...route.query, tab: tabName } });
};
</script>

<style scoped>
.events {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

/* Custom TabView styling to match the join-create-band theme */
:deep(.p-tabview) {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

:deep(.p-tabview-nav) {
    background: var(--p-surface-100);
    border-bottom: 1px solid var(--p-surface-border);
    padding: 0;
}

:deep(.p-tabview-nav-link) {
    padding: 1rem 2rem;
    font-weight: 500;
    font-size: 1rem;
    border: none;
    background: transparent;
    color: var(--p-text-color);
    transition: all 0.2s ease;
}

:deep(.p-tabview-nav-link:hover) {
    background: var(--p-surface-200);
}

:deep(.p-tabview-nav-link:focus) {
    box-shadow: none;
}

:deep(.p-tabview-selected .p-tabview-nav-link) {
    background: var(--p-primary-color);
    color: white;
}

:deep(.p-tabview-panels) {
    background: transparent;
    padding: 0;
}

:deep(.p-tabview-panel) {
    padding: 0;
}

@media (max-width: 768px) {
    .events {
        padding: 1rem;
    }
    
    :deep(.p-tabview-nav-link) {
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
    }
}
</style> 