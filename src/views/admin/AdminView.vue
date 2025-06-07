<template>
    <div class="admin">
        <div class="admin-tabs-container">
            <TabView v-model:activeIndex="activeTab" @update:activeIndex="updateRoute">
                <TabPanel header="Manage Users" value="users">
                    <div class="admin-content">
                        <AdminUsersComponent />
                    </div>
                </TabPanel>
                
                <TabPanel header="Manage Bands" value="bands">
                    <div class="admin-content">
                        <AdminBandsComponent />
                    </div>
                </TabPanel>
                
                <TabPanel header="Manage Events" value="events">
                    <div class="admin-content">
                        <AdminEventsComponent />
                    </div>
                </TabPanel>
            </TabView>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import AdminUsersComponent from './AdminUsersView.vue';
import AdminBandsComponent from './AdminBandsView.vue';
import AdminEventsComponent from './AdminEventsView.vue';

const route = useRoute();
const router = useRouter();

// Active tab index (0 = Users, 1 = Bands, 2 = Events)
const activeTab = ref(0);

// Set initial tab based on route query
onMounted(() => {
    const tab = route.query.tab as string;
    if (tab === 'bands') {
        activeTab.value = 1;
    } else if (tab === 'events') {
        activeTab.value = 2;
    } else {
        activeTab.value = 0; // default to users
    }
});

// Update URL when tab changes
const updateRoute = (index: number) => {
    const tabName = index === 2 ? 'events' : index === 1 ? 'bands' : 'users';
    router.replace({ query: { ...route.query, tab: tabName } });
};
</script>

<style scoped>
.admin {
    width: 100%;
}

.admin-tabs-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 2rem 0 2rem;
}

.admin-content {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    padding: 2rem;
}

/* Custom TabView styling to match other pages */
:deep(.p-tabview) {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: visible;
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
    .admin-tabs-container {
        padding: 1rem 1rem 0 1rem;
    }
    
    .admin-content {
        padding: 1rem;
    }
    
    :deep(.p-tabview-nav-link) {
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
    }
}
</style> 