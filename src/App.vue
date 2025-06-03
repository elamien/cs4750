<template>
    <div class="app">
        <div class="card">
            <Menubar :model="menuItems">
                <template #start>
                    <router-link to="/" class="navbar-brand">
                        <img src="@/assets/hoojams-logo-v2.png" alt="HooJams Logo" class="navbar-logo" />
                        <span class="navbar-brand-text">HooJams</span>
                    </router-link>
                </template>
                <template #item="{ item, props, hasSubmenu, root }">
                    <router-link v-if="item.route && !hasSubmenu" :to="item.route" v-ripple class="flex items-center" v-bind="props.action">
                        <span>{{ item.label }}</span>
                        <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
                        <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
                    </router-link>
                    <a v-else v-ripple class="flex items-center" v-bind="props.action">
                        <span>{{ item.label }}</span>
                        <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
                        <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
                        <i v-if="hasSubmenu" :class="['pi pi-angle-down ml-auto', { 'pi-angle-down': root, 'pi-angle-right': !root }]"></i>
                    </a>
                </template>
                <template #end>
                    <div class="navbar-end">
                        <div v-if="isSignedIn" class="navbar-user-section">
                            <div 
                                class="favorites-button-wrapper"
                                @click="router.push('/favorites')"
                                title="My Favorites"
                            >
                                <i class="pi pi-heart favorites-icon"></i>
                                <span class="favorites-label">Favorites</span>
                            </div>
                            <div class="profile-menu">
                                <Avatar 
                                    image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" 
                                    shape="circle" 
                                    class="avatar-button"
                                    @click="toggleProfileMenu"
                                    title="Profile Menu"
                                    ref="avatarRef"
                                />
                                <Menu 
                                    ref="profileMenuRef" 
                                    :model="profileMenuItems" 
                                    :popup="true"
                                    class="profile-dropdown"
                                />
                            </div>
                        </div>
                        <Button v-else label="Sign In" icon="pi pi-sign-in" @click="showAuthModal = true" />
                    </div>
                </template>
            </Menubar>
        </div>
        
        <main class="main-content">
            <RouterView />
        </main>
        
        <!-- Authentication Modal -->
        <Dialog v-model:visible="showAuthModal" modal header="Welcome" :style="{ width: '25rem' }" :closable="true">
            <div class="auth-container">
                <!-- Sign In Form -->
                <div v-if="authMode === 'signin'" class="auth-form">
                    <h3>Sign In</h3>
                    <div class="form-fields">
                        <div class="field">
                            <label for="email">Email</label>
                            <InputText 
                                id="email" 
                                v-model="authForm.email" 
                                type="email" 
                                placeholder="Enter your email" 
                                class="w-full"
                            />
                        </div>
                        <div class="field">
                            <label for="password">Password</label>
                            <Password 
                                id="password"
                                v-model="authForm.password" 
                                placeholder="Enter your password"
                                :feedback="false"
                                toggleMask
                                class="w-full"
                            />
                        </div>
                        <div class="field-checkbox">
                            <Checkbox id="remember" v-model="authForm.rememberMe" :binary="true" />
                            <label for="remember">Remember me</label>
                        </div>
                    </div>
                    <div class="auth-actions">
                        <Button label="Sign In" icon="pi pi-sign-in" @click="handleSignIn" class="w-full" />
                        <div class="auth-links">
                            <Button 
                                label="Don't have an account? Sign up" 
                                link 
                                @click="authMode = 'signup'" 
                                class="p-0" 
                            />
                            <Button label="Forgot Password?" link class="p-0" />
                        </div>
                    </div>
                </div>
                
                <!-- Sign Up Form -->
                <div v-if="authMode === 'signup'" class="auth-form">
                    <h3>Create Account</h3>
                    <div class="form-fields">
                        <div class="field">
                            <label for="firstName">First Name</label>
                            <InputText 
                                id="firstName" 
                                v-model="authForm.firstName" 
                                placeholder="Enter your first name" 
                                class="w-full"
                            />
                        </div>
                        <div class="field">
                            <label for="lastName">Last Name</label>
                            <InputText 
                                id="lastName" 
                                v-model="authForm.lastName" 
                                placeholder="Enter your last name" 
                                class="w-full"
                            />
                        </div>
                        <div class="field">
                            <label for="signupEmail">Email</label>
                            <InputText 
                                id="signupEmail" 
                                v-model="authForm.email" 
                                type="email" 
                                placeholder="Enter your email" 
                                class="w-full"
                            />
                        </div>
                        <div class="field">
                            <label for="signupPassword">Password</label>
                            <Password 
                                id="signupPassword"
                                v-model="authForm.password" 
                                placeholder="Create a password"
                                :feedback="true"
                                toggleMask
                                class="w-full"
                            />
                        </div>
                        <div class="field">
                            <label for="confirmPassword">Confirm Password</label>
                            <Password 
                                id="confirmPassword"
                                v-model="authForm.confirmPassword" 
                                placeholder="Confirm your password"
                                :feedback="false"
                                toggleMask
                                class="w-full"
                            />
                        </div>
                        <div class="field-checkbox">
                            <Checkbox id="terms" v-model="authForm.acceptTerms" :binary="true" />
                            <label for="terms">I agree to the Terms and Conditions</label>
                        </div>
                    </div>
                    <div class="auth-actions">
                        <Button label="Create Account" icon="pi pi-user-plus" @click="handleSignUp" class="w-full" />
                        <div class="auth-links">
                            <Button 
                                label="Already have an account? Sign in" 
                                link 
                                @click="authMode = 'signin'" 
                                class="p-0" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
        
        <!-- Developer Panel (only in development) -->
        <DeveloperPanel />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { RouterView, useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';
import Badge from 'primevue/badge';
import InputText from 'primevue/inputtext';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Menu from 'primevue/menu';
import DeveloperPanel from '@/components/DeveloperPanel.vue';

// Router instance
const router = useRouter();

// User state - this would typically come from a store/auth service
const isSignedIn = ref(false);
const userRole = ref<'anonymous' | 'general' | 'band_member' | 'band_leader' | 'exec'>('anonymous');

// Theme state
const isDarkMode = ref(false);

// Profile menu refs
const profileMenuRef = ref();
const avatarRef = ref();

// Authentication modal state
const showAuthModal = ref(false);
const authMode = ref<'signin' | 'signup'>('signin');
const authForm = ref({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    rememberMe: false,
    acceptTerms: false
});

// Menu items for anonymous users (not signed in)
const anonymousItems = [
    {
        label: 'Browse Bands',
        icon: 'pi pi-users',
        route: '/browse/bands'
    },
    {
        label: 'Browse Events',
        icon: 'pi pi-calendar',
        route: '/browse/events'
    }
];

// Base menu items for all signed-in users
const baseSignedInItems = [
    {
        label: 'Browse Bands',
        icon: 'pi pi-users',
        route: '/browse/bands'
    },
    {
        label: 'Browse Events',
        icon: 'pi pi-calendar',
        route: '/browse/events'
    },
    {
        label: 'Favorites',
        icon: 'pi pi-heart',
        route: '/favorites'
    },
    {
        label: 'Create Event',
        icon: 'pi pi-calendar-plus',
        route: '/create-event'
    },
    {
        label: 'Fill-In Requests',
        icon: 'pi pi-bell',
        route: '/fill-in-requests',
        badge: '3' // Mock notification count
    }
];

// Menu items specific to general users
const generalItems = [
    {
        label: 'Join/Create Band',
        icon: 'pi pi-plus-circle',
        route: '/join-create-band'
    }
];

// Menu items for band members
const bandMemberItems = [
    {
        label: 'My Band',
        icon: 'pi pi-users',
        route: '/my-band'
    }
];

// Menu items for band leaders (includes band management)
const bandLeaderItems = [
    {
        label: 'My Band',
        icon: 'pi pi-users',
        items: [
            {
                label: 'Band Info',
                icon: 'pi pi-info-circle',
                route: '/my-band/info'
            },
            {
                label: 'Members',
                icon: 'pi pi-users',
                route: '/my-band/members'
            },
            {
                label: 'Event Requests',
                icon: 'pi pi-calendar-plus',
                route: '/my-band/event-requests',
                badge: '2'
            },
            {
                label: 'Member Requests',
                icon: 'pi pi-user-plus',
                route: '/my-band/member-requests',
                badge: '1'
            },
            {
                label: 'Create Fill-In Request',
                icon: 'pi pi-send',
                route: '/my-band/create-fill-in'
            }
        ]
    }
];

// Menu items for executives
const execItems = [
    {
        label: 'Join/Create Band',
        icon: 'pi pi-plus-circle',
        route: '/join-create-band'
    },
    {
        label: 'Admin Panel',
        icon: 'pi pi-shield',
        items: [
            {
                label: 'Manage Users',
                icon: 'pi pi-users',
                route: '/admin/users'
            },
            {
                label: 'Manage Bands',
                icon: 'pi pi-sitemap',
                route: '/admin/bands'
            },
            {
                label: 'Manage Events',
                icon: 'pi pi-calendar',
                route: '/admin/events'
            }
        ]
    }
];

// Dev-only items
const devItems = import.meta.env.DEV ? [] : [];

// Computed menu items based on user role
const menuItems = computed(() => {
    if (!isSignedIn.value) {
        return [...anonymousItems, ...devItems];
    }
    
    let currentBaseItems = [...baseSignedInItems];
    
    if (userRole.value === 'exec') {
        // For execs, remove the text-based "Favorites" from the main menu
        // as they have the dedicated heart icon button.
        currentBaseItems = currentBaseItems.filter(item => item.label !== 'Favorites');
    }
    
    let items = [...currentBaseItems];
    
    switch (userRole.value) {
        case 'general':
            items = [...items, ...generalItems];
            break;
        case 'band_member':
            items = [...items, ...bandMemberItems];
            break;
        case 'band_leader':
            items = [...items, ...bandLeaderItems];
            break;
        case 'exec':
            // execItems are added to the (potentially filtered) base items
            items = [...items, ...execItems];
            break;
    }
    
    return [...items, ...devItems];
});

// Profile menu items
const profileMenuItems = computed(() => [
    {
        label: 'Account Info',
        icon: 'pi pi-user',
        command: () => {
            router.push('/account');
        }
    },
    {
        separator: true
    },
    {
        label: isDarkMode.value ? 'Light Mode' : 'Dark Mode',
        icon: isDarkMode.value ? 'pi pi-sun' : 'pi pi-moon',
        command: () => {
            toggleTheme();
        }
    }
]);

// Theme toggle functionality
const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    
    if (isDarkMode.value) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
};

// Profile menu toggle
const toggleProfileMenu = (event: Event) => {
    profileMenuRef.value.toggle(event);
};

// Demo functions to test different user states (for development testing)
const toggleSignIn = () => {
    isSignedIn.value = !isSignedIn.value;
    if (!isSignedIn.value) {
        userRole.value = 'anonymous';
    }
};

const setUserRole = (role: 'general' | 'band_member' | 'band_leader' | 'exec') => {
    if (isSignedIn.value) {
        userRole.value = role;
    }
};

// Mock authentication functions
const handleSignIn = () => {
    console.log('Sign in attempted:', {
        email: authForm.value.email,
        rememberMe: authForm.value.rememberMe
    });
    
    // Mock successful sign in
    isSignedIn.value = true;
    userRole.value = 'general'; // Default role for new users
    showAuthModal.value = false;
    
    // Reset form
    resetAuthForm();
};

const handleSignUp = () => {
    console.log('Sign up attempted:', {
        firstName: authForm.value.firstName,
        lastName: authForm.value.lastName,
        email: authForm.value.email,
        acceptTerms: authForm.value.acceptTerms
    });
    
    // Mock successful sign up - redirect to onboarding for new users
    isSignedIn.value = true;
    userRole.value = 'general'; // New users start as general
    showAuthModal.value = false;
    
    // Reset form and redirect to onboarding for first-time users
    resetAuthForm();
    
    // Redirect new users to onboarding
    router.push('/onboarding');
};

const resetAuthForm = () => {
    authForm.value = {
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        rememberMe: false,
        acceptTerms: false
    };
    authMode.value = 'signin';
};

// Initialize theme from localStorage
onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        isDarkMode.value = true;
        document.documentElement.setAttribute('data-theme', 'dark');
    }
});

// Expose functions to window for development testing
if (import.meta.env.DEV) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).toggleSignIn = toggleSignIn;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).setUserRole = setUserRole;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).showAuthModal = () => showAuthModal.value = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).triggerOnboarding = () => router.push('/onboarding');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).getDevState = () => ({ 
        isSignedIn: isSignedIn.value, 
        userRole: userRole.value 
    });
    
    console.log('🚧 Developer Controls Available:');
    console.log('- toggleSignIn() - Toggle sign in state');
    console.log('- setUserRole("general"|"band_member"|"band_leader"|"exec") - Set user role');
    console.log('- showAuthModal() - Show authentication modal');
    console.log('- triggerOnboarding() - Manually trigger onboarding flow');
    console.log('- getDevState() - Get current auth state');
}
</script>
