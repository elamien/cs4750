<template>
  <div class="onboarding">
    <h2 v-if="currentStep === 1" class="welcome-title">Welcome to HooJams!</h2>
    <Card class="onboarding-container">
      <template #content>
        <div class="step-counter">
          <Tag :value="`Step ${currentStep} of ${totalSteps}`" severity="info" />
        </div>
        
        <ProgressBar :value="(currentStep / totalSteps) * 100" class="mb-4" />

      <div class="step-content">
        <!-- Welcome Step -->
        <div v-if="currentStep === 1" class="step">
          <div class="step-icon">
            <i class="pi pi-user-plus" style="font-size: 3rem; color: var(--p-primary-color);"></i>
          </div>
          <p>Let's get you set up! This will only take a few minutes.</p>
          <div class="step-actions">
            <Button label="Get Started" icon="pi pi-arrow-right" @click="nextStep" />
          </div>
        </div>

        <!-- Role Selection Step -->
        <div v-if="currentStep === 2" class="step">
          <div class="step-icon">
            <i class="pi pi-users" style="font-size: 3rem; color: var(--p-primary-color);"></i>
          </div>
          <h2>What's your role?</h2>
          <p>Select the option that best describes your position:</p>
          <div class="role-options">
            <div class="role-card" 
                 :class="{ active: selectedRole === 'band_member' }"
                 @click="selectedRole = 'band_member'">
              <i class="pi pi-user"></i>
              <h3>Band Member</h3>
              <p>I participate in band activities</p>
            </div>
            <div class="role-card" 
                 :class="{ active: selectedRole === 'band_leader' }"
                 @click="selectedRole = 'band_leader'">
              <i class="pi pi-crown"></i>
              <h3>Band Leader</h3>
              <p>I lead and manage a band</p>
            </div>
            <div class="role-card" 
                 :class="{ active: selectedRole === 'exec' }"
                 @click="selectedRole = 'exec'">
              <i class="pi pi-shield"></i>
              <h3>Executive</h3>
              <p>I manage multiple bands/system</p>
            </div>
          </div>
          <div class="step-actions between">
            <Button label="Back" icon="pi pi-arrow-left" severity="secondary" @click="prevStep" />
            <Button label="Continue" icon="pi pi-arrow-right" @click="nextStep" :disabled="!selectedRole" />
          </div>
        </div>

        <!-- Profile Setup Step -->
        <div v-if="currentStep === 3" class="step">
          <div class="step-icon">
            <i class="pi pi-id-card" style="font-size: 3rem; color: var(--p-primary-color);"></i>
          </div>
          <h2>Set up your profile</h2>
          <p>Tell us a bit about yourself:</p>
          <div class="form-fields">
            <div class="field">
              <label for="firstName">First Name</label>
              <InputText id="firstName" v-model="profile.firstName" placeholder="Enter your first name" />
            </div>
            <div class="field">
              <label for="lastName">Last Name</label>
              <InputText id="lastName" v-model="profile.lastName" placeholder="Enter your last name" />
            </div>
            <div class="field">
              <label for="instrument">Primary Instrument</label>
              <Dropdown 
                id="instrument"
                v-model="profile.instrument" 
                :options="instruments" 
                optionLabel="name"
                optionValue="value"
                placeholder="Select your instrument" 
              />
            </div>
          </div>
          <div class="step-actions between">
            <Button label="Back" icon="pi pi-arrow-left" severity="secondary" @click="prevStep" />
            <Button label="Continue" icon="pi pi-arrow-right" @click="nextStep" 
                    :disabled="!profile.firstName || !profile.lastName" />
          </div>
        </div>

        <!-- Completion Step -->
        <div v-if="currentStep === 4" class="step">
          <div class="step-icon success">
            <i class="pi pi-check-circle" style="font-size: 3rem;"></i>
          </div>
          <h2>All set!</h2>
          <p>Welcome to the band, {{ profile.firstName }}! You're ready to start using the system.</p>
          <div class="summary-card">
            <h3>Your Profile:</h3>
            <div class="summary-content">
              <p><strong>Role:</strong> {{ roleLabels[selectedRole] }}</p>
              <p><strong>Name:</strong> {{ profile.firstName }} {{ profile.lastName }}</p>
              <p><strong>Instrument:</strong> {{ profile.instrument }}</p>
            </div>
          </div>
          <div class="step-actions between">
            <Button label="Back" icon="pi pi-arrow-left" severity="secondary" @click="prevStep" />
            <Button label="Complete Setup" icon="pi pi-check" @click="completeOnboarding" />
          </div>
        </div>
      </div>

      <!-- Dev Navigation -->
      <div v-if="isDev" class="dev-controls">
        <h4>Dev Controls:</h4>
        <div class="dev-buttons">
          <Button 
            v-for="step in totalSteps" 
            :key="step"
            :label="`Step ${step}`" 
            size="small"
            :severity="currentStep === step ? 'primary' : 'secondary'"
            @click="currentStep = step" 
          />
        </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Card from 'primevue/card'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'

// Extend window interface for dev controls
declare global {
  interface Window {
    setUserRole?: (role: string) => void;
  }
}

const router = useRouter()
const isDev = import.meta.env.DEV

const currentStep = ref(1)
const totalSteps = ref(4)
const selectedRole = ref('')
const profile = ref({
  firstName: '',
  lastName: '',
  instrument: ''
})

const roleLabels = {
  'band_member': 'Band Member',
  'band_leader': 'Band Leader', 
  'exec': 'Executive'
}

const instruments = [
  { name: 'Flute', value: 'flute' },
  { name: 'Clarinet', value: 'clarinet' },
  { name: 'Saxophone', value: 'saxophone' },
  { name: 'Trumpet', value: 'trumpet' },
  { name: 'Trombone', value: 'trombone' },
  { name: 'French Horn', value: 'french_horn' },
  { name: 'Tuba', value: 'tuba' },
  { name: 'Percussion', value: 'percussion' },
  { name: 'Violin', value: 'violin' },
  { name: 'Viola', value: 'viola' },
  { name: 'Cello', value: 'cello' },
  { name: 'Bass', value: 'bass' },
  { name: 'Piano', value: 'piano' },
  { name: 'Other', value: 'other' }
]

const nextStep = () => {
  if (currentStep.value < totalSteps.value) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const completeOnboarding = () => {
  // In a real app, you'd save the data here
  console.log('Onboarding completed:', {
    role: selectedRole.value,
    profile: profile.value
  })
  
  // Set user role in parent (this would be done via store/auth service in real app)
  if (window.setUserRole && selectedRole.value) {
    window.setUserRole(selectedRole.value)
  }
  
  // Mark onboarding as completed for this user (would be saved to backend)
  console.log('✅ User onboarding completed - redirecting to dashboard')
  
  // Redirect to dashboard or home
  router.push('/dashboard')
}
</script>

<!-- Styles are now in src/assets/onboarding.css --> 