<template>
    <div v-if="showPanel" class="developer-panel">
        <div class="panel-header" @mousedown="startDrag">
            <div class="header-content">
                <i class="pi pi-wrench"></i>
                <span>Developer Controls</span>
            </div>
            <button 
                class="collapse-button" 
                @click.stop="collapsed = !collapsed"
                :title="collapsed ? 'Expand Panel' : 'Collapse Panel'"
            >
                <i :class="['pi', collapsed ? 'pi-chevron-down' : 'pi-chevron-up']"></i>
            </button>
        </div>
        
        <div v-if="!collapsed" class="panel-content">
            <div class="current-state">
                <div class="state-item">
                    <strong>Status:</strong>
                    <Tag 
                        :value="isSignedIn ? 'Signed In' : 'Anonymous'" 
                        :severity="isSignedIn ? 'success' : 'secondary'"
                    />
                </div>
                <div v-if="isSignedIn" class="state-item">
                    <strong>Role:</strong>
                    <Tag :value="formatRole(userRole)" severity="info" />
                </div>
            </div>
            
            <div class="controls-section">
                <div class="control-group">
                    <label>Authentication:</label>
                    <div class="button-group">
                        <Button 
                            label="Sign Out" 
                            size="small" 
                            severity="secondary"
                            :disabled="!isSignedIn"
                            @click="signOut"
                        />
                        <Button 
                            label="Sign In" 
                            size="small" 
                            severity="success"
                            :disabled="isSignedIn"
                            @click="signIn"
                        />
                    </div>
                </div>
                
                <div v-if="isSignedIn" class="control-group">
                    <label>Development Mode:</label>
                    <div class="mode-selector">
                        <Button 
                            label="Impersonate User" 
                            size="small"
                            :severity="devMode === 'impersonate' ? 'primary' : 'secondary'"
                            :outlined="devMode !== 'impersonate'"
                            @click="setDevMode('impersonate')"
                        />
                        <Button 
                            label="Preview Role" 
                            size="small"
                            :severity="devMode === 'preview' ? 'primary' : 'secondary'"
                            :outlined="devMode !== 'preview'"
                            @click="setDevMode('preview')"
                        />
                    </div>
                </div>
                
                <div v-if="isSignedIn && devMode === 'impersonate'" class="control-group">
                    <label>Impersonate Test User:</label>
                    <div class="user-buttons">
                        <Button 
                            v-for="user in testUsers" 
                            :key="user.id"
                            :label="user.name"
                            size="small"
                            :severity="currentTestUser?.id === user.id ? 'primary' : 'secondary'"
                            :outlined="currentTestUser?.id !== user.id"
                            @click="impersonateUser(user)"
                        />
                    </div>
                    <div v-if="currentTestUser" class="impersonation-info">
                        <small><strong>Full access as:</strong> {{ currentTestUser.name }} ({{ currentTestUser.email }})</small>
                    </div>
                </div>
                
                <div v-if="isSignedIn && devMode === 'preview'" class="control-group">
                    <label>Preview Role View (Read-Only):</label>
                    <div class="role-buttons">
                        <Button 
                            v-for="role in roles" 
                            :key="role.value"
                            :label="role.label"
                            size="small"
                            :severity="userRole === role.value ? 'primary' : 'secondary'"
                            :outlined="userRole !== role.value"
                            @click="previewRole(role.value as 'general' | 'band_member' | 'band_leader' | 'exec')"
                        />
                    </div>
                    <div class="preview-info">
                        <small><strong>Preview mode:</strong> Read-only view of {{ formatRole(userRole) }} permissions</small>
                    </div>
                </div>
                
                <div class="control-group">
                    <label>Quick Actions:</label>
                    <div class="button-group">
                        <Button 
                            label="Show Auth Modal" 
                            size="small" 
                            severity="info"
                            outlined
                            @click="showAuth"
                        />
                        <Button 
                            label="Trigger Onboarding" 
                            size="small" 
                            severity="warning"
                            outlined
                            @click="triggerOnboarding"
                        />
                    </div>
                </div>
            </div>
            
            <div class="navigation-preview">
                <label>Current Navigation:</label>
                <div class="nav-items">
                    <Tag 
                        v-for="item in currentNavItems" 
                        :key="item.label"
                        :value="item.label"
                        severity="secondary"
                        class="nav-tag"
                    />
                </div>
            </div>
            
            <div class="tips">
                <strong>💡 Developer Tips:</strong>
                <ul>
                    <li><strong>Impersonate Mode:</strong> Full CRUD access as specific test users</li>
                    <li><strong>Preview Mode:</strong> Read-only view of what each role type sees</li>
                    <li>Test user credentials are shown for reference (not needed for dev)</li>
                    <li>Drag the header to move this panel around</li>
                    <li>Sign out to test anonymous user experience</li>
                </ul>
            </div>
            
            <div class="panel-actions">
                <div class="position-controls">
                    <Button 
                        label="Reset Position" 
                        size="small" 
                        severity="secondary"
                        outlined
                        @click="resetPosition"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

// Show panel in development
const showPanel = ref(import.meta.env.DEV);
const collapsed = ref(false);

// Drag functionality
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const position = ref({ x: 16, y: 16 }); // Default position (1rem = 16px)

// Mock global state - in a real app, these would be injected or from a store
const isSignedIn = ref(false);
const userRole = ref<'general' | 'band_member' | 'band_leader' | 'exec'>('general');

// Development mode state
const devMode = ref<'impersonate' | 'preview'>('preview');
const currentTestUser = ref<TestUser | null>(null);

// Test user interface
interface TestUser {
    id: string;
    name: string;
    email: string;
    role: 'general' | 'band_member' | 'band_leader' | 'exec';
    credentials: {
        password: string;
    };
}

// Role definitions
const roles = ref([
    { value: 'general', label: 'General User' },
    { value: 'band_member', label: 'Band Member' },
    { value: 'band_leader', label: 'Band Leader' },
    { value: 'exec', label: 'WXTJ Executive' }
]);

// Test users from database (aligned with test data)
const testUsers = ref<TestUser[]>([
    {
        id: '1',
        name: 'John Bonham',
        email: 'john.bonham@test.com', 
        role: 'band_member',
        credentials: { password: 'drummer123' }
    },
    {
        id: '2', 
        name: 'Charles Mingus',
        email: 'charles.mingus@test.com',
        role: 'band_member', 
        credentials: { password: 'bass123' }
    },
    {
        id: '3',
        name: 'David Gilmour', 
        email: 'david.gilmour@test.com',
        role: 'band_member',
        credentials: { password: 'guitar123' }
    },
    {
        id: '4',
        name: 'Diana Krall',
        email: 'diana.krall@test.com', 
        role: 'band_member',
        credentials: { password: 'piano123' }
    },
    {
        id: '5',
        name: 'Sarah Leader',
        email: 'bandleader@test.com',
        role: 'band_leader', 
        credentials: { password: 'leader123' }
    },
    {
        id: '6',
        name: 'Mike Member', 
        email: 'bandmember@test.com',
        role: 'band_member',
        credentials: { password: 'member123' }
    },
    {
        id: '7',
        name: 'Gary General',
        email: 'general@test.com',
        role: 'general',
        credentials: { password: 'general123' }
    },
    {
        id: '8',
        name: 'Wesley Executive',
        email: 'wxtj.exec@virginia.edu', 
        role: 'exec',
        credentials: { password: 'exec123' }
    }
]);

// Mock navigation items based on role
const currentNavItems = computed(() => {
    if (!isSignedIn.value) {
        return [
            { label: 'Browse Bands' },
            { label: 'Browse Events' },
            { label: 'Sign In' }
        ];
    }
    
    const baseItems = [
        { label: 'My Account' },
        { label: 'Browse Bands' },
        { label: 'Browse Events' },
        { label: 'Favorites' },
        { label: 'Create Event' },
        { label: 'Fill-In Requests' }
    ];
    
    switch (userRole.value) {
        case 'general':
            return [...baseItems, { label: 'Join/Create Band' }];
        case 'band_member':
            return [...baseItems, { label: 'My Band' }];
        case 'band_leader':
            return [...baseItems, { label: 'My Band Management' }];
        case 'exec':
            return [...baseItems, { label: 'Join/Create Band' }, { label: 'Admin Panel' }];
        default:
            return baseItems;
    }
});

// Helper functions
const formatRole = (role: string) => {
    return roles.value.find(r => r.value === role)?.label || role;
};

// Type for window dev functions
interface WindowWithDevFunctions extends Window {
    toggleSignIn?: () => void;
    setUserRole?: (role: string) => void;
    showAuthModal?: () => void;
    triggerOnboarding?: () => void;
    getDevState?: () => { isSignedIn: boolean; userRole: string };
}

declare const window: WindowWithDevFunctions;

// Drag functionality
const startDrag = (e: MouseEvent) => {
    // Check if the mousedown event originated from the collapse button
    const target = e.target as HTMLElement;
    if (target.closest('.collapse-button')) {
        return; // Do not start drag if click is on collapse button
    }

    isDragging.value = true;
    dragOffset.value = {
        x: e.clientX - position.value.x,
        y: e.clientY - position.value.y
    };
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    e.preventDefault();
};

const onDrag = (e: MouseEvent) => {
    if (!isDragging.value) return;
    
    const newX = e.clientX - dragOffset.value.x;
    const newY = e.clientY - dragOffset.value.y;
    
    // Keep panel within viewport bounds
    const maxX = window.innerWidth - 320; // Panel max width
    const maxY = window.innerHeight - 100; // Give some bottom margin
    
    position.value = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
    };
};

const stopDrag = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    savePosition();
};

// Position persistence
const savePosition = () => {
    localStorage.setItem('dev-panel-position', JSON.stringify(position.value));
};

const loadPosition = () => {
    const saved = localStorage.getItem('dev-panel-position');
    if (saved) {
        try {
            const savedPosition = JSON.parse(saved);
            // Validate position is within current viewport
            const maxX = window.innerWidth - 320;
            const maxY = window.innerHeight - 100;
            
            position.value = {
                x: Math.max(0, Math.min(savedPosition.x, maxX)),
                y: Math.max(0, Math.min(savedPosition.y, maxY))
            };
        } catch {
            // Invalid saved position, use default
        }
    }
};

// Reset position to default (top-right)
const resetPosition = () => {
    position.value = { x: window.innerWidth - 320 - 16, y: 16 };
    savePosition();
};

// Actions
const signIn = () => {
    isSignedIn.value = true;
    userRole.value = 'general';
    // Call global function if available
    if (window.toggleSignIn) {
        window.toggleSignIn();
    }
};

const signOut = () => {
    isSignedIn.value = false;
    // Call global function if available
    if (window.toggleSignIn) {
        window.toggleSignIn();
    }
};

// Development mode functions
const setDevMode = (mode: 'impersonate' | 'preview') => {
    devMode.value = mode;
    // Reset any current impersonation when switching modes
    if (mode === 'preview') {
        currentTestUser.value = null;
    }
};

const impersonateUser = (user: TestUser) => {
    currentTestUser.value = user;
    userRole.value = user.role;
    // Call global function if available
    if (window.setUserRole) {
        window.setUserRole(user.role);
    }
    console.log(`🎭 Impersonating ${user.name} (${user.email}) with full CRUD access`);
};

const previewRole = (role: 'general' | 'band_member' | 'band_leader' | 'exec') => {
    userRole.value = role;
    currentTestUser.value = null; // Clear any impersonation
    // Call global function if available  
    if (window.setUserRole) {
        window.setUserRole(role);
    }
    console.log(`👀 Previewing ${formatRole(role)} view (read-only)`);
};

const showAuth = () => {
    if (window.showAuthModal) {
        window.showAuthModal();
    }
};

const triggerOnboarding = () => {
    if (window.triggerOnboarding) {
        window.triggerOnboarding();
    }
};

// Lifecycle
onMounted(() => {
    loadPosition();
    
    // Handle window resize
    const handleResize = () => {
        const maxX = window.innerWidth - 320;
        const maxY = window.innerHeight - 100;
        
        position.value = {
            x: Math.max(0, Math.min(position.value.x, maxX)),
            y: Math.max(0, Math.min(position.value.y, maxY))
        };
    };
    
    window.addEventListener('resize', handleResize);
    
    onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
    });
});

// Listen for global state changes
if (typeof window !== 'undefined') {
    // Sync with global state periodically
    setInterval(() => {
        if (window.getDevState) {
            const state = window.getDevState();
            isSignedIn.value = state.isSignedIn;
            userRole.value = state.userRole as 'general' | 'band_member' | 'band_leader' | 'exec';
        }
    }, 1000);
}
</script>

<style scoped>
.developer-panel {
    position: fixed;
    left: v-bind('position.x + "px"');
    top: v-bind('position.y + "px"');
    background: var(--p-surface-card);
    border: 2px solid var(--hoojams-orange);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    max-width: 320px;
    font-size: 0.9rem;
    user-select: none;
    transition: box-shadow 0.2s ease;
}

.developer-panel:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--hoojams-orange);
    color: white;
    cursor: move;
    font-weight: 600;
    position: relative;
}

.panel-header:hover {
    background: var(--hoojams-orange-hover);
}

.panel-header:active {
    cursor: grabbing;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    pointer-events: none; /* Prevent blocking drag */
}

.collapse-button {
    background: none;
    border: none; /* Removed temporary debug border */
    color: white;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    pointer-events: auto;
    min-width: 30px;
    min-height: 30px;
    z-index: 1;
}

.collapse-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

.collapse-button:active {
    transform: scale(0.95);
}

.collapse-button i {
    font-size: 1.2rem;
    font-weight: bold;
    color: white !important;
    display: inline-block !important; /* Ensure display property */
    line-height: 1 !important; /* Ensure line height doesn't push it out */
}

.panel-content {
    padding: 1rem;
}

.current-state {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--p-surface-border);
}

.state-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.controls-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.control-group label {
    font-weight: 600;
    color: var(--p-text-color);
    font-size: 0.85rem;
}

.button-group {
    display: flex;
    gap: 0.5rem;
}

.mode-selector {
    display: flex;
    gap: 0.5rem;
}

.role-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}

.user-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
}

.impersonation-info,
.preview-info {
    background: var(--p-highlight-bg);
    padding: 0.5rem;
    border-radius: 4px;
    margin-top: 0.5rem;
    font-style: italic;
}

.impersonation-info {
    border-left: 3px solid var(--hoojams-orange);
}

.preview-info {
    border-left: 3px solid var(--p-primary-color);
}

.navigation-preview {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--p-surface-border);
}

.navigation-preview label {
    font-weight: 600;
    color: var(--p-text-color);
    font-size: 0.85rem;
    display: block;
    margin-bottom: 0.5rem;
}

.nav-items {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
}

.nav-tag {
    font-size: 0.75rem;
}

.tips {
    font-size: 0.8rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--p-surface-border);
}

.tips strong {
    color: var(--hoojams-orange);
    display: block;
    margin-bottom: 0.5rem;
}

.tips ul {
    margin: 0;
    padding-left: 1rem;
    line-height: 1.4;
}

.tips li {
    margin-bottom: 0.25rem;
}

.panel-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    align-items: center;
}

.position-controls {
    display: flex;
    gap: 0.5rem;
}

/* Hide in production builds */
@media (max-width: 768px) {
    .developer-panel {
        position: fixed;
        left: 1rem !important;
        top: 1rem !important;
        right: 1rem;
        max-width: none;
        width: calc(100vw - 2rem);
    }
    
    .role-buttons {
        grid-template-columns: 1fr;
    }
}
</style> 