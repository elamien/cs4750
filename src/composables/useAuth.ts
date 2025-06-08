import { ref, computed } from 'vue'

interface User {
  userId: string
  email: string
  firstName: string
  lastName: string
  roles?: string[]
}

// Global reactive state
const currentUser = ref<User | null>(null)
const isAuthenticated = computed(() => !!currentUser.value)

// Initialize from localStorage on module load
const initializeAuth = () => {
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser)
      currentUser.value = {
        userId: String(userData.userId),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roles: userData.roles || (userData.role ? [userData.role] : [])
      }
      console.log('Auth initialized with user:', currentUser.value)
    } catch (error) {
      console.error('Error parsing saved user from localStorage:', error)
      localStorage.removeItem('currentUser')
    }
  }
}

// Initialize immediately
initializeAuth()

export const useAuth = () => {
  const login = (userData: User) => {
    currentUser.value = userData
    localStorage.setItem('currentUser', JSON.stringify(userData))
    console.log('User logged in:', userData)
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('currentUser')
    console.log('User logged out')
  }

  const refreshUser = () => {
    initializeAuth()
  }

  const getUserId = () => {
    return currentUser.value?.userId || null
  }

  const getUserName = () => {
    if (!currentUser.value) return null
    return `${currentUser.value.firstName} ${currentUser.value.lastName}`
  }

  const getInitials = () => {
    if (!currentUser.value) return ''
    return `${currentUser.value.firstName.charAt(0)}${currentUser.value.lastName.charAt(0)}`.toUpperCase()
  }

  const hasRole = (roleName: string) => {
    return currentUser.value?.roles?.includes(roleName) || false
  }

  const isBandLeader = () => hasRole('Band Leader')
  const isBandMember = () => hasRole('Band Member')
  const isWXTJExecutive = () => hasRole('WXTJ Executive')
  const isGeneralUser = () => hasRole('General User')

  const getPrimaryRole = () => {
    if (!currentUser.value?.roles?.length) return null
    // Return first role alphabetically for consistency
    return currentUser.value.roles[0]
  }

  return {
    currentUser: computed(() => currentUser.value),
    isAuthenticated,
    login,
    logout,
    refreshUser,
    getUserId,
    getUserName,
    getInitials,
    hasRole,
    isBandLeader,
    isBandMember,
    isWXTJExecutive,
    isGeneralUser,
    getPrimaryRole
  }
}