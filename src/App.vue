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
                        <InputText placeholder="Search" type="text" class="search-input" />
                        <ThemeToggle />
                        <Avatar v-if="isSignedIn" image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle" />
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
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { RouterView, useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';
import Badge from 'primevue/badge';
import InputText from 'primevue/inputtext';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import ThemeToggle from '@/components/ThemeToggle.vue';

// Router instance
const router = useRouter();

// User state - this would typically come from a store/auth service
const isSignedIn = ref(false);
const userRole = ref<'anonymous' | 'band_member' | 'band_leader' | 'exec'>('anonymous');

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

// Base menu items for anonymous users
const anonymousItems = [
    {
        label: 'About',
        icon: 'pi pi-info-circle',
        route: '/about'
    },
    {
        label: 'Contact',
        icon: 'pi pi-envelope',
        route: '/contact'
    }
];

// Dev-only items
const devItems = import.meta.env.DEV ? [
    // Removed onboarding from navbar - now part of registration flow
] : [];

// Additional menu items for signed-in users
const signedInItems = [
    {
        label: 'Dashboard',
        icon: 'pi pi-th-large',
        route: '/dashboard'
    },
    {
        label: 'Profile',
        icon: 'pi pi-user',
        route: '/profile'
    }
];

// Menu items for band members
const bandMemberItems = [
    {
        label: 'My Band',
        icon: 'pi pi-users',
        items: [
            {
                label: 'Schedule',
                icon: 'pi pi-calendar',
                route: '/band/schedule'
            },
            {
                label: 'Music Library',
                icon: 'pi pi-file-music',
                route: '/band/music'
            },
            {
                label: 'Attendance',
                icon: 'pi pi-check',
                route: '/band/attendance'
            }
        ]
    }
];

// Menu items for band leaders
const bandLeaderItems = [
    {
        label: 'Band Management',
        icon: 'pi pi-crown',
        items: [
            {
                label: 'Manage Members',
                icon: 'pi pi-users',
                route: '/leader/members'
            },
            {
                label: 'Schedule Events',
                icon: 'pi pi-calendar-plus',
                route: '/leader/schedule'
            },
            {
                label: 'Reports',
                icon: 'pi pi-chart-bar',
                route: '/leader/reports'
            },
            {
                label: 'Settings',
                icon: 'pi pi-cog',
                route: '/leader/settings'
            }
        ]
    }
];

// Menu items for executives
const execItems = [
    {
        label: 'Administration',
        icon: 'pi pi-shield',
        items: [
            {
                label: 'User Management',
                icon: 'pi pi-users',
                route: '/admin/users'
            },
            {
                label: 'Band Management',
                icon: 'pi pi-sitemap',
                route: '/admin/bands'
            },
            {
                label: 'System Settings',
                icon: 'pi pi-sliders-h',
                route: '/admin/settings'
            },
            {
                label: 'Analytics',
                icon: 'pi pi-chart-line',
                route: '/admin/analytics'
            }
        ]
    }
];

// Computed menu items based on user role
const menuItems = computed(() => {
    let items = [...anonymousItems, ...devItems];
    
    if (isSignedIn.value) {
        items = [...items, ...signedInItems];
        
        switch (userRole.value) {
            case 'band_member':
                items = [...items, ...bandMemberItems];
                break;
            case 'band_leader':
                items = [...items, ...bandMemberItems, ...bandLeaderItems];
                break;
            case 'exec':
                items = [...items, ...bandMemberItems, ...bandLeaderItems, ...execItems];
                break;
}
    }
    
    return items;
});

// Demo functions to test different user states (for development testing)
// You can use these in the browser console to test different user states:
// toggleSignIn(), setUserRole('band_leader'), etc.
const toggleSignIn = () => {
    isSignedIn.value = !isSignedIn.value;
    if (!isSignedIn.value) {
        userRole.value = 'anonymous';
    }
};

const setUserRole = (role: 'band_member' | 'band_leader' | 'exec') => {
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
    userRole.value = 'band_member'; // Default role
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
    
    console.log('🚧 Developer Controls Available:');
    console.log('- toggleSignIn() - Toggle sign in state');
    console.log('- setUserRole("band_member"|"band_leader"|"exec") - Set user role');
    console.log('- showAuthModal() - Show authentication modal');
    console.log('- triggerOnboarding() - Manually trigger onboarding flow');
  }
</script>

<style scoped>
.app {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

.main-content {
    padding: 2rem;
    flex: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.card {
    margin-bottom: 0;
    width: 100%;
}
</style>
