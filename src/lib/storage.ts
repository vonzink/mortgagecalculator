// src/lib/storage.ts
import type { MortgageInputs } from './types';

const STORAGE_KEY = 'mortgage_scenarios';
const MAX_SCENARIOS = 10;

export interface SavedScenario {
    id: string;
    name: string;
    inputs: MortgageInputs;
    createdAt: string;
    updatedAt: string;
}

/**
 * Generate a unique ID for scenarios
 */
function generateId(): string {
    return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all saved scenarios from localStorage
 */
export function getSavedScenarios(): SavedScenario[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data) as SavedScenario[];
    } catch (error) {
        console.error('Error reading scenarios from localStorage:', error);
        return [];
    }
}

/**
 * Save a new scenario or update an existing one
 */
export function saveScenario(name: string, inputs: MortgageInputs, existingId?: string): SavedScenario | null {
    try {
        const scenarios = getSavedScenarios();
        const now = new Date().toISOString();

        if (existingId) {
            // Update existing scenario
            const index = scenarios.findIndex(s => s.id === existingId);
            if (index >= 0) {
                scenarios[index] = {
                    ...scenarios[index],
                    name,
                    inputs,
                    updatedAt: now,
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
                return scenarios[index];
            }
        }

        // Create new scenario
        if (scenarios.length >= MAX_SCENARIOS) {
            // Remove oldest scenario if at limit
            scenarios.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
            scenarios.shift();
        }

        const newScenario: SavedScenario = {
            id: generateId(),
            name,
            inputs,
            createdAt: now,
            updatedAt: now,
        };

        scenarios.push(newScenario);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
        return newScenario;
    } catch (error) {
        console.error('Error saving scenario to localStorage:', error);
        return null;
    }
}

/**
 * Delete a scenario by ID
 */
export function deleteScenario(id: string): boolean {
    try {
        const scenarios = getSavedScenarios();
        const filtered = scenarios.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting scenario from localStorage:', error);
        return false;
    }
}

/**
 * Load a scenario by ID
 */
export function loadScenario(id: string): SavedScenario | null {
    const scenarios = getSavedScenarios();
    return scenarios.find(s => s.id === id) || null;
}

/**
 * Clear all saved scenarios
 */
export function clearAllScenarios(): boolean {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing scenarios from localStorage:', error);
        return false;
    }
}
