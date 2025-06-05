import { ref, computed, type Ref, type ComputedRef } from 'vue';

// Type definitions
interface OptionItem {
    name: string;
    value: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Global state for caching reference data
const genresCache: Ref<OptionItem[] | null> = ref(null);
const instrumentsCache: Ref<OptionItem[] | null> = ref(null);
const isLoadingGenres: Ref<boolean> = ref(false);
const isLoadingInstruments: Ref<boolean> = ref(false);

const API_BASE_URL = 'http://localhost:3001/api';

export function useReferenceData() {
    // Computed properties for reactive access
    const genres: ComputedRef<OptionItem[]> = computed(() => genresCache.value || []);
    const instruments: ComputedRef<OptionItem[]> = computed(() => instrumentsCache.value || []);
    const isGenresLoading: ComputedRef<boolean> = computed(() => isLoadingGenres.value);
    const isInstrumentsLoading: ComputedRef<boolean> = computed(() => isLoadingInstruments.value);

    // Fetch genres from API
    const fetchGenres = async (forceRefresh = false): Promise<OptionItem[]> => {
        // Return cached data if available and not forcing refresh
        if (genresCache.value && !forceRefresh) {
            return genresCache.value;
        }

        isLoadingGenres.value = true;
        try {
            const response = await fetch(`${API_BASE_URL}/reference/genres`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result: ApiResponse<OptionItem[]> = await response.json();
            if (result.success) {
                genresCache.value = result.data;
                return result.data;
            } else {
                throw new Error(result.message || 'Failed to fetch genres');
            }
        } catch (error) {
            console.error('Failed to fetch genres:', error);
            
            // Return empty array if API fails - data should be properly initialized in database
            console.warn('Genres API failed. Ensure database is properly initialized with core_db_structure.sql');
            genresCache.value = [];
            return [];
        } finally {
            isLoadingGenres.value = false;
        }
    };

    // Fetch instruments from API
    const fetchInstruments = async (forceRefresh = false): Promise<OptionItem[]> => {
        // Return cached data if available and not forcing refresh
        if (instrumentsCache.value && !forceRefresh) {
            return instrumentsCache.value;
        }

        isLoadingInstruments.value = true;
        try {
            const response = await fetch(`${API_BASE_URL}/reference/instruments`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result: ApiResponse<OptionItem[]> = await response.json();
            if (result.success) {
                instrumentsCache.value = result.data;
                return result.data;
            } else {
                throw new Error(result.message || 'Failed to fetch instruments');
            }
        } catch (error) {
            console.error('Failed to fetch instruments:', error);
            
            // Return empty array if API fails - data should be properly initialized in database
            console.warn('Instruments API failed. Ensure database is properly initialized with core_db_structure.sql');
            instrumentsCache.value = [];
            return [];
        } finally {
            isLoadingInstruments.value = false;
        }
    };

    // Initialize data on first use
    const initializeGenres = async (): Promise<OptionItem[]> => {
        if (!genresCache.value) {
            return await fetchGenres();
        }
        return genresCache.value;
    };

    const initializeInstruments = async (): Promise<OptionItem[]> => {
        if (!instrumentsCache.value) {
            return await fetchInstruments();
        }
        return instrumentsCache.value;
    };

    // Clear cache (useful for testing or forced refresh)
    const clearCache = (): void => {
        genresCache.value = null;
        instrumentsCache.value = null;
    };

    return {
        // Reactive data
        genres,
        instruments,
        isGenresLoading,
        isInstrumentsLoading,
        
        // Methods
        fetchGenres,
        fetchInstruments,
        initializeGenres,
        initializeInstruments,
        clearCache
    };
} 