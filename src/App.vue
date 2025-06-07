<template>
    <div class="app">
        <div :class="styles.card">
            <Menubar :model="menuItems">
                <template #start>
                    <router-link to="/home-dashboard" class="navbar-brand">
                        <img src="@/assets/hoojams-logo-v2.png" alt="HooJams Logo" class="navbar-logo" />
                        <span class="navbar-brand-text">HooJams</span>
                    </router-link>
                </template>
                <template #item="{ item, props, hasSubmenu, root }">
                    <router-link 
                        v-if="item.route && !hasSubmenu" 
                        :to="item.route" 
                        v-ripple 
                        class="flex items-center nav-link" 
                        active-class="nav-link-active"
                        v-bind="props.action">
                        <i v-if="item.icon" :class="item.icon" style="margin-right: 0.5rem;"></i>
                        <span>{{ item.label }}</span>
                        <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
                        <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
                    </router-link>
                    <a v-else v-ripple class="flex items-center" v-bind="props.action">
                        <i v-if="item.icon" :class="item.icon" style="margin-right: 0.5rem;"></i>
                        <span>{{ item.label }}</span>
                        <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
                        <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
                        <i v-if="hasSubmenu" :class="['pi pi-angle-down ml-auto', { 'pi-angle-down': root, 'pi-angle-right': !root }]"></i>
                    </a>
                </template>
                <template #end>
                    <div class="navbar-end">
                        <div v-if="isSignedIn" class="navbar-user-section">
                            <RouterLink 
                                v-if="userRole === 'exec'"
                                to="/admin"
                                v-ripple 
                                class="flex items-center nav-link"
                                active-class="nav-link-active"
                                title="Admin Panel"
                            >
                                <i class="pi pi-shield" style="margin-right: 0.5rem;"></i>
                                <span>Manage</span>
                            </RouterLink>
                            <RouterLink 
                                to="/favorites"
                                v-ripple 
                                class="flex items-center nav-link"
                                active-class="nav-link-active"
                                title="My Favorites"
                            >
                                <i class="pi pi-heart" style="margin-right: 0.5rem;"></i>
                                <span>Favorites</span>
                            </RouterLink>
                            <div class="profile-menu">
                                <div 
                                    class="nav-link profile-nav-link"
                                    @click="toggleProfileMenu"
                                    title="Profile Menu"
                                    ref="avatarRef"
                                    v-ripple
                                >
                                    <Avatar 
                                        :label="currentUser?.firstName && currentUser?.lastName ? getInitials(currentUser.firstName, currentUser.lastName) : 'U'" 
                                        shape="circle" 
                                        class="profile-avatar"
                                    />
                                </div>
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
        
        <!-- Ambient Music Background -->
        <AmbientMusicBackground />
        
        <main :class="styles.mainContent">
            <RouterView />
        </main>
        
        <!-- Background Music Player -->
        <BackgroundMusicPlayer />
        
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
                            <InputText id="firstName" v-model="authForm.firstName" type="text" placeholder="Enter your first name" class="w-full" :class="{'p-invalid': signUpErrors.firstName}" @input="validateSignUp" />
                            <small v-if="signUpErrors.firstName" class="p-error">{{ signUpErrors.firstName }}</small>
                        </div>
                        <div class="field">
                            <label for="lastName">Last Name</label>
                            <InputText id="lastName" v-model="authForm.lastName" type="text" placeholder="Enter your last name" class="w-full" :class="{'p-invalid': signUpErrors.lastName}" @input="validateSignUp" />
                            <small v-if="signUpErrors.lastName" class="p-error">{{ signUpErrors.lastName }}</small>
                        </div>
                        <div class="field">
                            <label for="email">Email</label>
                            <InputText id="email" v-model="authForm.email" type="email" placeholder="Enter your email" class="w-full" :class="{'p-invalid': signUpErrors.email}" @input="validateSignUp" />
                            <small v-if="signUpErrors.email" class="p-error">{{ signUpErrors.email }}</small>
                        </div>
                        <div class="field">
                            <label for="password">Password</label>
                            <Password id="password" v-model="authForm.password" placeholder="Create a password" :feedback="true" toggleMask class="w-full" :class="{'p-invalid': signUpErrors.password}" @input="validateSignUp" />
                            <small v-if="signUpErrors.password" class="p-error">{{ signUpErrors.password }}</small>
                        </div>
                        <div class="field">
                            <label for="confirmPassword">Confirm Password</label>
                            <Password id="confirmPassword" v-model="authForm.confirmPassword" placeholder="Confirm your password" :feedback="false" toggleMask class="w-full" :class="{'p-invalid': signUpErrors.confirmPassword}" @input="validateSignUp" />
                            <small v-if="signUpErrors.confirmPassword" class="p-error">{{ signUpErrors.confirmPassword }}</small>
                        </div>
                        <div class="field-checkbox my-3">
                            <Checkbox inputId="isWXTJExecutive" v-model="authForm.isWXTJExecutive" :binary="true" @change="validateSignUp" />
                            <label for="isWXTJExecutive" class="ml-2">I am a WXTJ Executive</label>
                        </div>
                        <div v-if="authForm.isWXTJExecutive" class="field">
                            <label for="wxtjAccessKey">WXTJ Access Key</label>
                            <InputText id="wxtjAccessKey" v-model="authForm.wxtjAccessKey" type="text" placeholder="Enter the executive access key" class="w-full" :class="{'p-invalid': signUpErrors.wxtjAccessKey}" @input="validateSignUp" />
                            <small v-if="signUpErrors.wxtjAccessKey" class="p-error">{{ signUpErrors.wxtjAccessKey }}</small>
                            <small class="p-text-secondary">You should have received this key from an already registered WXTJ executive</small>
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
        
                  <!-- Toast for notifications -->
        <Toast position="top-right" class="app-toast" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { RouterView, RouterLink, useRouter } from 'vue-router';
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
import Toast from 'primevue/toast';
import BackgroundMusicPlayer from './components/ui/BackgroundMusicPlayer.vue';
import AmbientMusicBackground from './components/ui/AmbientMusicBackground.vue';
import styles from './styles/App.module.css';
import { useAuth } from '@/composables/useAuth';
import { containsProfanity } from '@/utils/profanityFilter';

// Router instance
const router = useRouter();

// Authentication state from composable
const { isSignedIn, userRole, currentUser, login, logout, checkAuthState } = useAuth();

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
    acceptTerms: false,
    isWXTJExecutive: false,
    wxtjAccessKey: ''
});
const signUpErrors = ref<Record<string, string>>({});

// Menu items for anonymous users (not signed in)
const anonymousItems: MenuItem[] = [
    {
        label: 'Bands',
        icon: 'pi pi-users',
        route: '/bands'
    },
    {
        label: 'Events',
        icon: 'pi pi-calendar',
        route: '/events'
    },
    {
        label: 'About',
        icon: 'pi pi-info-circle',
        route: '/'
    }
    // No Sign In button here, it's handled separately in the #end template
];

// Base menu items for all signed-in users (except anon)
// According to permissions: Edit account, Browse events, Save favorites, Create events, Accept fill-in requests
const baseSignedInItems: MenuItem[] = [
    {
        label: 'Bands',
        icon: 'pi pi-users',
        route: '/join-create-band'
    },
    {
        label: 'Events',
        icon: 'pi pi-calendar',
        route: '/events'
    },
    {
        label: 'Fill In',
        icon: 'pi pi-bell',
        route: '/fill-in-requests',
        // badge: '3' // Mock notification count - can be added if actual notifications are implemented
    }
];

// Menu items specific to general users
// Permissions: Create 1 band OR Request to join 1 band (handled by JoinCreateBandView)
// Note: Band-related items are now included in baseSignedInItems submenu
const generalUserExtraItems: MenuItem[] = [
    // General users get the base band menu from baseSignedInItems
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
const bandLeaderExtraItems: MenuItem[] = [];

// Menu items for WXTJ executives
// Permissions: Manage all users/bands/events, Create 1 band OR Request to join 1 band
const wxtjExecExtraItems: MenuItem[] = [];

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
    },
    {
        separator: true
    },
    {
        label: 'Sign Out',
        icon: 'pi pi-sign-out',
        command: () => {
            handleLogout();
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

// Real authentication functions
const handleSignIn = async () => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
        email: authForm.value.email,
                password: authForm.value.password
            })
    });
    
        const data = await response.json();

        if (!response.ok) {
            // Show error toast
            console.error('Login failed:', data.message);
            return;
        }

        // Successful login
        login(data.user); // Use the composable's login function
        
        showAuthModal.value = false;
        resetAuthForm();
        
        console.log('Login successful:', data.user);
    
    } catch (error) {
        console.error('Login error:', error);
    }
};

const validateSignUp = () => {
    signUpErrors.value = {};
    const { firstName, lastName, email, password, confirmPassword, isWXTJExecutive, wxtjAccessKey } = authForm.value;
    
    if (containsProfanity(firstName)) {
        signUpErrors.value.firstName = 'Inappropriate language is not allowed.';
    } else if (!firstName) {
        signUpErrors.value.firstName = 'First name is required.';
    }

    if (containsProfanity(lastName)) {
        signUpErrors.value.lastName = 'Inappropriate language is not allowed.';
    } else if (!lastName) {
        signUpErrors.value.lastName = 'Last name is required.';
    }

    if (!email) {
        signUpErrors.value.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        signUpErrors.value.email = 'Email is invalid.';
    }

    if (!password) {
        signUpErrors.value.password = 'Password is required.';
    } else if (password.length < 6) {
        signUpErrors.value.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
        signUpErrors.value.confirmPassword = 'Passwords do not match.';
    }

    if (isWXTJExecutive && !wxtjAccessKey) {
        signUpErrors.value.wxtjAccessKey = 'WXTJ Access Key is required for executives.';
    }

    return Object.keys(signUpErrors.value).length === 0;
};

const handleSignUp = async () => {
    if (!validateSignUp()) {
        return;
    }
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
        firstName: authForm.value.firstName,
        lastName: authForm.value.lastName,
        email: authForm.value.email,
                password: authForm.value.password,
                isWXTJExecutive: authForm.value.isWXTJExecutive,
                wxtjAccessKey: authForm.value.wxtjAccessKey
            })
        });
        
        const data = await response.json();

        if (!response.ok) {
            // Show error toast
            console.error('Registration failed:', data.message);
            return;
        }

        // Successful registration
        login(data.user); // Use the composable's login function
        
        showAuthModal.value = false;
        resetAuthForm();
        
        console.log('Registration successful:', data.user);
    
    // Redirect new users to onboarding
    router.push('/onboarding');
        
    } catch (error) {
        console.error('Registration error:', error);
    }
};

const resetAuthForm = () => {
    authForm.value = {
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        rememberMe: false,
        acceptTerms: false,
        isWXTJExecutive: false,
        wxtjAccessKey: ''
    };
    authMode.value = 'signin';
};

const handleLogout = () => {
    logout(); // Use the composable's logout function
    router.push('/');
};

// Utility functions
const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Initialize theme and authentication from localStorage
onMounted(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        isDarkMode.value = true;
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Initialize authentication state via composable
    checkAuthState();
    
    // Dynamically calculate navbar height for toast positioning
    const navbarElement = document.querySelector('.navbar');
    if (navbarElement) {
        const navbarHeight = navbarElement.getBoundingClientRect().height;
        const toastTopOffset = navbarHeight + 10; // 10px gap below navbar
        
        // Update CSS custom property for toast positioning
        document.documentElement.style.setProperty('--navbar-height', `${toastTopOffset}px`);
        
        console.log(`Navbar height detected: ${navbarHeight}px, toast offset: ${toastTopOffset}px`);
    }
});

</script>
