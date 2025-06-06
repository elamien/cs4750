import { ref, computed, onMounted } from 'vue';

// Define the User interface based on what's stored in localStorage
interface User {
  userId: number;
  role: 'anonymous' | 'general' | 'band_member' | 'band_leader' | 'exec';
  // Add other user properties if they exist in the stored object
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Reactive state for the current user
const currentUser = ref<User | null>(null);

export function useAuth() {

  // Computed property to easily check if a user is signed in
  const isSignedIn = computed(() => !!currentUser.value);

  // Computed property to get the user's role
  const userRole = computed(() => currentUser.value?.role || 'anonymous');
  
  // Function to check and initialize the user state from localStorage
  const checkAuthState = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        currentUser.value = JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
        localStorage.removeItem('currentUser');
        currentUser.value = null;
      }
    } else {
      currentUser.value = null;
    }
  };

  // Function to handle login
  const login = (user: User) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    currentUser.value = user;
  };
  
  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('currentUser');
    currentUser.value = null;
    // Optionally, redirect to home page after logout
    // This should be handled in the component calling logout
  };
  
  // On component mount, check the auth state
  // This ensures the state is reactive to changes in other tabs
  onMounted(checkAuthState);
  
  // Also add a listener for storage events to sync across tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'currentUser') {
      checkAuthState();
    }
  });

  return {
    currentUser,
    isSignedIn,
    userRole,
    login,
    logout,
    checkAuthState
  };
} 