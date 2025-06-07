<template>
    <Card class="band-info-section">
        <template #title>
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>Band Information</span>
                <Button 
                    :label="editMode ? 'Cancel' : 'Edit'"
                    :icon="editMode ? 'pi pi-times' : 'pi pi-pencil'"
                    :severity="editMode ? 'secondary' : 'primary'"
                    @click="toggleEditMode"
                    size="small"
                    outlined
                />
            </div>
        </template>
        <template #content>
            <div v-if="!editMode" class="band-details">
                <div class="detail-item">
                    <strong>Genre:</strong> {{ bandInfo.genre || 'N/A' }}
                </div>
                <div class="detail-item">
                    <strong>Location:</strong> {{ bandInfo.location || 'N/A' }}
                </div>
                <div class="detail-item">
                    <strong>Description:</strong>
                    <p>{{ bandInfo.description || 'No description provided.' }}</p>
                </div>
            </div>

            <div v-else class="band-edit">
                <form @submit.prevent="saveBandInfo" class="edit-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="band-name">Band Name *</label>
                            <InputText 
                                id="band-name"
                                v-model="editForm.name" 
                                placeholder="Enter band name"
                                :class="{'p-invalid': editErrors.name}"
                                @input="validateForm"
                            />
                            <small v-if="editErrors.name" class="p-error">{{ editErrors.name }}</small>
                        </div>
                        <div class="form-group">
                            <label for="band-genre">Genre</label>
                            <InputText 
                                id="band-genre"
                                v-model="editForm.genre" 
                                placeholder="e.g., Rock, Jazz, Classical"
                            />
                        </div>
                        <div class="form-group">
                            <label for="band-location">Location</label>
                            <InputText 
                                id="band-location"
                                v-model="editForm.location" 
                                placeholder="e.g., Charlottesville, VA"
                            />
                        </div>
                        <div class="form-group full-width">
                            <label for="band-description">Description</label>
                            <Textarea 
                                id="band-description"
                                v-model="editForm.description" 
                                placeholder="Tell people about your band..."
                                rows="3"
                                :class="{'p-invalid': editErrors.description}"
                                @input="validateForm"
                                maxlength="255"
                            />
                            <div class="field-footer">
                                <small v-if="editErrors.description" class="p-error">{{ editErrors.description }}</small>
                                <small class="char-count" :class="{ 'char-limit-warning': editForm.description.length > 230 }">
                                    {{ editForm.description.length }}/255 characters
                                </small>
                            </div>
                        </div>
                    </div>
                    <div class="form-actions">
                        <Button 
                            type="submit" 
                            label="Save Changes" 
                            icon="pi pi-check"
                            :loading="saving"
                            size="small"
                        />
                        <Button 
                            type="button"
                            label="Cancel" 
                            icon="pi pi-times"
                            severity="secondary"
                            outlined
                            size="small"
                            @click="cancelEdit"
                        />
                    </div>
                </form>
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

// Import dedicated CSS file
import '@/assets/components/band-information.css';

import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { containsProfanity } from '@/utils/profanityFilter';

interface BandInfo {
    id: string;
    name: string;
    genre?: string | null;
    description?: string | null;
    location?: string | null;
    members: unknown[];
}

const props = defineProps<{
    bandInfo: BandInfo;
}>();

const emit = defineEmits<{
    'band-updated': [bandInfo: BandInfo];
}>();

const toast = useToast();

// Reactive data
const editMode = ref(false);
const saving = ref(false);

const editForm = ref({
    name: '',
    genre: '',
    location: '',
    description: ''
});
const editErrors = ref<Record<string, string>>({});

// Functions
const toggleEditMode = () => {
    if (!editMode.value) {
        // Starting edit mode - populate form with current data
        editForm.value = {
            name: props.bandInfo.name || '',
            genre: props.bandInfo.genre || '',
            location: props.bandInfo.location || '',
            description: props.bandInfo.description || ''
        };
        editErrors.value = {};
    }
    editMode.value = !editMode.value;
};

const cancelEdit = () => {
    editMode.value = false;
    editForm.value = {
        name: '',
        genre: '',
        location: '',
        description: ''
    };
    editErrors.value = {};
};

const validateForm = () => {
    editErrors.value = {};
    const { name, description } = editForm.value;

    if (!name.trim()) {
        editErrors.value.name = 'Band name is required.';
    } else if (containsProfanity(name)) {
        editErrors.value.name = 'Inappropriate language is not allowed.';
    }

    if (description.length > 255) {
        editErrors.value.description = 'Description must be 255 characters or less.';
    } else if (containsProfanity(description)) {
        editErrors.value.description = 'Inappropriate language is not allowed.';
    }
};

const saveBandInfo = async () => {
    validateForm();
    if (Object.keys(editErrors.value).length > 0) {
        toast.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: Object.values(editErrors.value)[0],
            life: 3000
        });
        return;
    }

    saving.value = true;
    try {
        const response = await fetch(`/api/bands/${props.bandInfo.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: editForm.value.name.trim(),
                genre: editForm.value.genre.trim() || null,
                location: editForm.value.location.trim() || null,
                description: editForm.value.description.trim() || null
            })
        });

        if (!response.ok) throw new Error('Failed to update band information');

        // Create updated band info object
        const updatedBandInfo = {
            ...props.bandInfo,
            name: editForm.value.name.trim(),
            genre: editForm.value.genre.trim() || null,
            location: editForm.value.location.trim() || null,
            description: editForm.value.description.trim() || null
        };

        // Emit the updated data to parent
        emit('band-updated', updatedBandInfo);

        editMode.value = false;
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Band information updated successfully',
            life: 3000
        });
    } catch (error) {
        console.error('Error saving band info:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update band information',
            life: 3000
        });
    } finally {
        saving.value = false;
    }
};
</script>

<!-- Styles moved to dedicated CSS file: src/assets/components/band-information.css --> 