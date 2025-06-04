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
import type { MenuItem } from 'primevue/menuitem';
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

// NEW: Mock user profile details that might influence UI, based on SQL schema
const mockUserProfile = ref({
    userId: null as number | null,
    hasCreatedBand: false, // Relevant for 'general' role, from general_user table
    hasPendingBandRequest: false, // Relevant for 'general' role, from general_user table
    bandId: null as number | null, // If they are a member or leader of a band
});

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
const anonymousItems: MenuItem[] = [
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
    // No Sign In button here, it's handled separately in the #end template
];

// Base menu items for all signed-in users (except anon)
// According to permissions: Edit account, Browse bands/events, Save favorites, Create events, Accept fill-in requests
const baseSignedInItems: MenuItem[] = [
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
    // Favorites is a dedicated icon button in navbar-end for signed-in users
    {
        label: 'Create Event',
        icon: 'pi pi-calendar-plus',
        route: '/create-event'
    },
    {
        label: 'Fill-In Opportunities', // Renamed from "Fill-In Requests" for clarity as this is where users find them
        icon: 'pi pi-bell',
        route: '/fill-in-requests',
        // badge: '3' // Mock notification count - can be added if actual notifications are implemented
    }
];

// Menu items specific to general users
// Permissions: Create 1 band OR Request to join 1 band (handled by JoinCreateBandView)
const generalUserExtraItems: MenuItem[] = [
    {
        label: 'Join or Create Band',
        icon: 'pi pi-plus-circle',
        route: '/join-create-band',
        // This view should handle the logic of "OR" based on user's status (has_created_band, has_pending_band_request)
    }
];

// Menu items for band members
// Permissions: Leave band, View band approved event(s) and select (available vs not)
const bandMemberExtraItems: MenuItem[] = [
    {
        label: 'My Band Dashboard', // For viewing events, setting availability, leaving band
        icon: 'pi pi-users',
        route: '/my-band' // MyBandView.vue
    }
];

// Menu items for band leaders
// Permissions: Create/Delete 1 band or Transfer lead, View/Accept/Deny event/member requests, Create fill-in, Remove members
const bandLeaderExtraItems: MenuItem[] = [
    {
        label: 'Manage My Band',
        icon: 'pi pi-cog', // Changed icon
        items: [
            {
                label: 'Band Dashboard', // Link to MyBandView for general member actions too
                icon: 'pi pi-desktop',
                route: '/my-band'
            },
            {
                label: 'Edit Band Info',
                icon: 'pi pi-info-circle',
                route: '/my-band/info'
            },
            {
                label: 'Manage Members', // View, Add (via requests), Remove
                icon: 'pi pi-users',
                route: '/my-band/members'
            },
            {
                label: 'Event Applications', // Bands apply to events, or are requested
                icon: 'pi pi-calendar-plus',
                route: '/my-band/event-requests',
                // badge: '2'
            },
            {
                label: 'Membership Requests',
                icon: 'pi pi-user-plus',
                route: '/my-band/member-requests',
                // badge: '1'
            },
            {
                label: 'Post Fill-In Request', // Leader creates a fill-in request for their band
                icon: 'pi pi-send',
                route: '/my-band/create-fill-in'
            }
        ]
    }
];

// Menu items for WXTJ executives
// Permissions: Manage all users/bands/events, Create 1 band OR Request to join 1 band
const wxtjExecExtraItems: MenuItem[] = [
     {
        label: 'Join or Create Band', // Also allowed for Execs
        icon: 'pi pi-plus-circle',
        route: '/join-create-band',
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
            },
            {
                label: 'System Reports', // Added based on AdminReportsView
                icon: 'pi pi-chart-bar',
                route: '/admin/reports'
            }
        ]
    }
];

// Dev-only items
const devItems: MenuItem[] = import.meta.env.DEV ? [] : [];

// Computed menu items based on user role
const menuItems = computed<MenuItem[]>(() => {
    if (!isSignedIn.value) {
        return [...anonymousItems, ...devItems];
    }
    
    let items = [...baseSignedInItems]; // Start with items all signed-in users get
    
    switch (userRole.value) {
        case 'general':
            items = [...items, ...generalUserExtraItems];
            break;
        case 'band_member':
            // Band members might also have general user capabilities if not exclusively a band member
            // For now, assume roles are somewhat exclusive for menu generation.
            // If a band member can also create/join *another* band, that needs clarification.
            // Based on current permissions, MyBand is their primary band-related action.
            items = [...items, ...bandMemberExtraItems];
            break;
        case 'band_leader':
            items = [...items, ...bandLeaderExtraItems];
            break;
        case 'exec':
            // Execs get their specific items. "Join or Create Band" is part of execItems.
            items = [...items, ...wxtjExecExtraItems];
            break;
    }
    
    return [...items, ...devItems];
});

// Profile menu items
const profileMenuItems = computed<MenuItem[]>(() => [
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
        mockUserProfile.value = { userId: null, hasCreatedBand: false, hasPendingBandRequest: false, bandId: null };
    } else {
        // Default to general user on mock sign-in, dev panel can change it
        userRole.value = 'general';
        mockUserProfile.value.userId = Date.now(); // Mock user ID
    }
};

const setUserRole = (role: 'general' | 'band_member' | 'band_leader' | 'exec') => {
    if (isSignedIn.value) {
        userRole.value = role;
        // Simulate some role-specific profile details
        if (role === 'band_member' || role === 'band_leader') {
            mockUserProfile.value.bandId = mockUserProfile.value.bandId || 123; // Mock band ID
            mockUserProfile.value.hasCreatedBand = false;
            mockUserProfile.value.hasPendingBandRequest = false;
        } else if (role === 'general') {
            mockUserProfile.value.bandId = null;
            // reset these flags, JoinCreateBandView will manage them
            // mockUserProfile.value.hasCreatedBand = false; 
            // mockUserProfile.value.hasPendingBandRequest = false;
        }
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
    mockUserProfile.value.userId = Date.now(); // Mock user ID
    mockUserProfile.value.hasCreatedBand = false; // Reset for new general user
    mockUserProfile.value.hasPendingBandRequest = false;
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
    mockUserProfile.value.userId = Date.now(); // Mock user ID
    mockUserProfile.value.hasCreatedBand = false;
    mockUserProfile.value.hasPendingBandRequest = false;
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
        userRole: userRole.value,
        profile: mockUserProfile.value // Expose mock profile too
    });
    
    console.log('🚧 Developer Controls Available:');
    console.log('- toggleSignIn() - Toggle sign in state');
    console.log('- setUserRole("general"|"band_member"|"band_leader"|"exec") - Set user role');
    console.log('- showAuthModal() - Show authentication modal');
    console.log('- triggerOnboarding() - Manually trigger onboarding flow');
    console.log('- getDevState() - Get current auth state');
}
</script>
