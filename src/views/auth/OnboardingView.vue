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
                :options="instrumentOptions"
                optionLabel="name"
                placeholder="Select your instruments"
              />
            </div>
            <div class="field">
              <label for="genres">Preferred Genres</label>
              <MultiSelect 
                id="genres"
                v-model="profile.genres" 
                :options="genreOptions"
                optionLabel="name"
                placeholder="Select your genres"
              />
            </div>
            <div class="field">
              <label for="experience">Experience Level</label>
              <Dropdown 
                id="experience"
                v-model="profile.experience" 
                :options="experienceOptions"
                optionLabel="label"
                placeholder="Select your experience level"
              />
            </div>
            <div class="field">
              <label for="availability">Availability</label>
              <MultiSelect 
                id="availability"
                v-model="profile.availability" 
                :options="availabilityOptions"
                optionLabel="label"
                placeholder="When are you available?"
              />
            </div>
          </div>
        </div>

        <!-- Step 3: Goals -->
        <div v-if="currentStep === 2" class="step-content">
          <h3>What are you looking for?</h3>
          <div class="goals-section">
            <div class="goal-option" v-for="goal in goalOptions" :key="goal.value">
              <div class="goal-card" 
                   :class="{ active: profile.goals.includes(goal.value) }"
                   @click="toggleGoal(goal.value)">
                <i :class="goal.icon"></i>
                <h4>{{ goal.label }}</h4>
                <p>{{ goal.description }}</p>
              </div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Steps from 'primevue/steps'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import MultiSelect from 'primevue/multiselect'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'

const router = useRouter()

const currentStep = ref(0)

const steps = ref([
  { label: 'Basic Info' },
  { label: 'Musical Background' },
  { label: 'Goals' }
])

const profile = ref({
  firstName: '',
  lastName: '',
  bio: '',
  instruments: [],
  genres: [],
  experience: null,
  availability: [],
  goals: []
})

const instrumentOptions = ref([
  { name: 'Guitar', value: 'guitar' },
  { name: 'Bass', value: 'bass' },
  { name: 'Drums', value: 'drums' },
  { name: 'Piano', value: 'piano' },
  { name: 'Vocals', value: 'vocals' },
  { name: 'Saxophone', value: 'saxophone' },
  { name: 'Trumpet', value: 'trumpet' },
  { name: 'Violin', value: 'violin' }
])

const genreOptions = ref([
  { name: 'Rock', value: 'rock' },
  { name: 'Jazz', value: 'jazz' },
  { name: 'Blues', value: 'blues' },
  { name: 'Folk', value: 'folk' },
  { name: 'Electronic', value: 'electronic' },
  { name: 'Pop', value: 'pop' },
  { name: 'Classical', value: 'classical' },
  { name: 'Country', value: 'country' }
])

const experienceOptions = ref([
  { label: 'Beginner (0-2 years)', value: '0-2' },
  { label: 'Intermediate (3-5 years)', value: '3-5' },
  { label: 'Advanced (5-10 years)', value: '5-10' },
  { label: 'Professional (10+ years)', value: '10+' }
])

const availabilityOptions = ref([
  { label: 'Weekdays', value: 'weekdays' },
  { label: 'Weekends', value: 'weekends' },
  { label: 'Mornings', value: 'mornings' },
  { label: 'Afternoons', value: 'afternoons' },
  { label: 'Evenings', value: 'evenings' },
  { label: 'Nights', value: 'nights' }
])

const goalOptions = ref([
  {
    value: 'join_band',
    label: 'Join a Band',
    description: 'Find an existing band to join',
    icon: 'pi pi-users'
  },
  {
    value: 'create_band',
    label: 'Start a Band',
    description: 'Create your own band and recruit members',
    icon: 'pi pi-plus-circle'
  },
  {
    value: 'find_gigs',
    label: 'Find Gigs',
    description: 'Look for performance opportunities',
    icon: 'pi pi-calendar'
  },
  {
    value: 'fill_in',
    label: 'Fill-In Work',
    description: 'Provide substitute musician services',
    icon: 'pi pi-refresh'
  }
])

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return profile.value.firstName && profile.value.lastName
    case 1:
      return profile.value.instruments.length > 0 && profile.value.genres.length > 0
    case 2:
      return profile.value.goals.length > 0
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

const toggleGoal = (goalValue: string) => {
  const index = profile.value.goals.indexOf(goalValue)
  if (index > -1) {
    profile.value.goals.splice(index, 1)
  } else {
    profile.value.goals.push(goalValue)
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

.goals-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.goal-card {
  padding: 1.5rem;
  border: 2px solid var(--p-surface-border);
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--p-surface-card);
}

.goal-card:hover {
  border-color: var(--hoojams-orange);
  background: var(--p-surface-hover);
}

.goal-card.active {
  border-color: var(--hoojams-orange);
  background: var(--hoojams-orange-light);
}

.goal-card i {
  font-size: 2rem;
  color: var(--hoojams-orange);
  margin-bottom: 1rem;
}

.goal-card h4 {
  margin: 0 0 0.5rem;
  color: var(--p-text-color);
}

.goal-card p {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
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
  
  .goals-section {
    grid-template-columns: 1fr;
  }
}
</style> 