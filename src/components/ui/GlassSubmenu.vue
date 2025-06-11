<template>
    <div class="glass-submenu">
        <div class="submenu-header" v-if="title">
            <h3>{{ title }}</h3>
        </div>
        <nav class="submenu-nav">
            <div
                v-for="item in menuItems"
                :key="item.value"
                class="submenu-item"
                :class="{ active: item.value === activeItem }"
                @click="$emit('itemSelected', item.value)"
            >
                <i v-if="item.icon" :class="item.icon" class="submenu-icon"></i>
                <span class="submenu-label">{{ item.label }}</span>
            </div>
        </nav>
    </div>
</template>

<script setup lang="ts">
interface MenuItem {
    label: string;
    value: string;
    icon?: string;
}

interface Props {
    title?: string;
    menuItems: MenuItem[];
    activeItem: string;
}

defineProps<Props>();

defineEmits<{
    itemSelected: [value: string];
}>();
</script>

<style scoped>
.glass-submenu {
    position: fixed;
    top: calc(var(--navbar-height, 80px) + 2rem);
    left: 1rem;
    width: 250px;
    height: fit-content;
    max-height: calc(100vh - var(--navbar-height, 80px) - 4rem);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    z-index: 100;
    overflow-y: auto;
}

.submenu-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.submenu-header h3 {
    margin: 0;
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
}

.submenu-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.submenu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: rgba(255, 255, 255, 0.8);
    background: transparent;
    border: 1px solid transparent;
}

.submenu-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: white;
    transform: translateY(-1px);
}

.submenu-item.active {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
    font-weight: 600;
}

.submenu-icon {
    font-size: 1.1rem;
    min-width: 1.1rem;
}

.submenu-label {
    font-size: 0.95rem;
}

/* Dark mode adjustments */
[data-theme="dark"] .glass-submenu {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .submenu-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] .submenu-item.active {
    background: rgba(255, 255, 255, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .glass-submenu {
        width: 200px;
        padding: 1rem;
        left: 0.5rem;
        top: calc(var(--navbar-height, 80px) + 1rem);
    }

    .submenu-item {
        padding: 0.5rem 0.75rem;
    }

    .submenu-label {
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    .glass-submenu {
        width: 180px;
    }
}
</style>
