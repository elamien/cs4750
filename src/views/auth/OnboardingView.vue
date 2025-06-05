<template>
  <div class="onboarding">
    <div class="header">
      <h1>Welcome to HooJams!</h1>
      <p>Let's set up your profile to help you connect with the right musicians and opportunities</p>
    </div>

    <Card class="onboarding-card">
      <template #content>
        <Steps :model="steps" :readonly="false" />
        
        <!-- Step 1: Basic Info -->
        <div v-if="currentStep === 0" class="step-content">
          <h3>Tell us about yourself</h3>
          <div class="form-grid">
            <div class="field">
              <label for="firstName">First Name</label>
              <InputText id="firstName" v-model="profile.firstName" />
            </div>
            <div class="field">
              <label for="lastName">Last Name</label>
              <InputText id="lastName" v-model="profile.lastName" />
            </div>
            <div class="field span-2">
              <label for="bio">Bio</label>
              <Textarea 
                id="bio" 
                v-model="profile.bio" 
                placeholder="Tell us about your musical journey..."
                rows="4"
              />
            </div>
          </div>
        </div>

        <!-- Step 2: Musical Info -->
        <div v-if="currentStep === 1" class="step-content">
          <h3>Your musical background</h3>
          <div class="form-grid">
            <div class="field">
              <label for="instruments">Instruments</label>
              <MultiSelect 
                id="instruments"
                v-model="profile.instruments" 
                :options="instruments"
                optionLabel="name"
                placeholder="Select your instruments"
              />
            </div>
            <div class="field">
              <label for="genres">Preferred Genres</label>
              <MultiSelect 
                id="genres"
                v-model="profile.genres" 
                :options="genres"
                optionLabel="name"
                placeholder="Select your genres"
              />
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="step-navigation">
          <Button 
            v-if="currentStep > 0" 
            label="Previous" 
            severity="secondary" 
            outlined
            @click="previousStep"
          />
          <div class="spacer"></div>
          <Button 
            v-if="currentStep < steps.length - 1"
            label="Next" 
            @click="nextStep"
            :disabled="!canProceed"
          />
          <Button 
            v-else
            label="Complete Setup" 
            @click="completeOnboarding"
            :disabled="!canProceed"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Steps from 'primevue/steps'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import { useReferenceData } from '@/composables/useReferenceData'

const router = useRouter()
const { genres, instruments, initializeGenres, initializeInstruments } = useReferenceData()

const currentStep = ref(0)

const steps = ref([
  { label: 'Basic Info' },
  { label: 'Musical Background' }
])

const profile = ref<{
  firstName: string;
  lastName: string;
  bio: string;
  instruments: string[];
  genres: string[];
}>({
  firstName: '',
  lastName: '',
  bio: '',
  instruments: [],
  genres: []
})

// Initialize reference data on component mount
onMounted(async () => {
  await Promise.all([
    initializeGenres(),
    initializeInstruments()
  ])
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return profile.value.firstName && profile.value.lastName
    case 1:
      return profile.value.instruments.length > 0 && profile.value.genres.length > 0
    default:
      return false
  }
})

const nextStep = () => {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const completeOnboarding = () => {
  console.log('Onboarding completed:', profile.value)
  // Save profile and redirect
  router.push('/')
}
</script>

<style scoped>
.onboarding {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: var(--p-text-color);
  margin-bottom: 1rem;
}

.header p {
  color: var(--p-text-muted-color);
  font-size: 1.1rem;
}

.onboarding-card {
  width: 100%;
}

.step-content {
  margin: 2rem 0;
  min-height: 300px;
}

.step-content h3 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--p-text-color);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field.span-2 {
  grid-column: 1 / -1;
}

.field label {
  font-weight: 600;
  color: var(--p-text-color);
}

.step-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--p-surface-border);
}

.spacer {
  flex: 1;
}

@media (max-width: 768px) {
  .onboarding {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style> 