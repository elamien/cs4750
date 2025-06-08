import { ref, computed } from 'vue'

interface UserRole {
  role_name: string
  context_type: 'general' | 'band' | 'event'
  context_id: number | null
}

interface User {
  userId: string
  email: string
  firstName: string
  lastName: string
  roles?: UserRole[]
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
      // Handle backward compatibility with old role format
      let roles: UserRole[] = []
      if (userData.roles) {
        if (Array.isArray(userData.roles)) {
          if (typeof userData.roles[0] === 'string') {
            // Old format: convert string array to new format
            roles = userData.roles.map((roleName: string) => ({
              role_name: roleName,
              context_type: 'general' as const,
              context_id: null
            }))
          } else {
            // New format: use as is
            roles = userData.roles
          }
        }
      } else if (userData.role) {
        // Very old format: single role string
        roles = [{
          role_name: userData.role,
          context_type: 'general' as const,
          context_id: null
        }]
      }
      
      currentUser.value = {
        userId: String(userData.userId),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roles: roles
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
    return currentUser.value?.roles?.some(role => role.role_name === roleName) || false
  }

  const hasRoleInContext = (roleName: string, contextType: string, contextId?: number) => {
    return currentUser.value?.roles?.some(role => 
      role.role_name === roleName && 
      role.context_type === contextType &&
      (contextId === undefined || role.context_id === contextId)
    ) || false
  }

  const isBandLeader = (bandId?: number) => {
    if (bandId !== undefined) {
      return hasRoleInContext('Band Leader', 'band', bandId)
    }
    return hasRole('Band Leader')
  }
  
  const isBandMember = (bandId?: number) => {
    if (bandId !== undefined) {
      return hasRoleInContext('Band Member', 'band', bandId)
    }
    return hasRole('Band Member')
  }
  
  const isWXTJExecutive = () => hasRole('WXTJ Executive')
  const isGeneralUser = () => hasRole('General User')

  const getBandLeadershipBands = () => {
    return currentUser.value?.roles?.filter(role => 
      role.role_name === 'Band Leader' && role.context_type === 'band'
    ).map(role => role.context_id).filter(id => id !== null) || []
  }

  const getPrimaryRole = () => {
    if (!currentUser.value?.roles?.length) return null
    // Return first role alphabetically for consistency
    return currentUser.value.roles[0].role_name
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
    hasRoleInContext,
    isBandLeader,
    isBandMember,
    isWXTJExecutive,
    isGeneralUser,
    getBandLeadershipBands,
    getPrimaryRole
  }
}