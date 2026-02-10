// src/components/ScenarioManager.tsx
import { useState, useEffect } from 'react';
import type { MortgageInputs } from '../lib/types';
import {
    getSavedScenarios,
    saveScenario,
    deleteScenario,
    type SavedScenario,
} from '../lib/storage';
import { formatCurrency } from '../lib/formatters';

interface ScenarioManagerProps {
    currentInputs: MortgageInputs;
    onLoadScenario: (inputs: MortgageInputs) => void;
}

export default function ScenarioManager({ currentInputs, onLoadScenario }: ScenarioManagerProps) {
    const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
    const [scenarioName, setScenarioName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Load scenarios on mount
    useEffect(() => {
        setScenarios(getSavedScenarios());
    }, []);

    const handleSave = () => {
        if (!scenarioName.trim()) {
            setSaveMessage({ type: 'error', text: 'Please enter a scenario name' });
            return;
        }

        const result = saveScenario(scenarioName.trim(), currentInputs);
        if (result) {
            setScenarios(getSavedScenarios());
            setScenarioName('');
            setSaveMessage({ type: 'success', text: 'Scenario saved!' });
            setTimeout(() => setSaveMessage(null), 3000);
        } else {
            setSaveMessage({ type: 'error', text: 'Failed to save scenario' });
        }
    };

    const handleLoad = (scenario: SavedScenario) => {
        onLoadScenario(scenario.inputs);
        setSaveMessage({ type: 'success', text: `Loaded "${scenario.name}"` });
        setTimeout(() => setSaveMessage(null), 3000);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Delete scenario "${name}"?`)) {
            deleteScenario(id);
            setScenarios(getSavedScenarios());
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-blue-600 underline text-sm hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                aria-expanded={isOpen}
                aria-controls="scenario-panel"
            >
                {isOpen ? 'Hide Saved Scenarios' : 'Manage Saved Scenarios'}
            </button>

            {isOpen && (
                <div
                    id="scenario-panel"
                    className="mt-4 p-4 bg-white border rounded-lg shadow-sm"
                    role="region"
                    aria-label="Saved scenarios"
                >
                    {/* Save form */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <input
                            type="text"
                            value={scenarioName}
                            onChange={(e) => setScenarioName(e.target.value)}
                            placeholder="Scenario name..."
                            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            aria-label="Scenario name"
                            maxLength={50}
                        />
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none whitespace-nowrap"
                        >
                            Save Current
                        </button>
                    </div>

                    {/* Message */}
                    {saveMessage && (
                        <div
                            className={`p-2 mb-4 rounded text-sm ${
                                saveMessage.type === 'success'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                            role="status"
                            aria-live="polite"
                        >
                            {saveMessage.text}
                        </div>
                    )}

                    {/* Saved scenarios list */}
                    {scenarios.length === 0 ? (
                        <p className="text-gray-500 text-sm">No saved scenarios yet.</p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {scenarios.map((scenario) => (
                                <div
                                    key={scenario.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{scenario.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatCurrency(scenario.inputs.homeValue)} • {scenario.inputs.rate}% • {scenario.inputs.term}yr
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Saved {formatDate(scenario.updatedAt)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 mt-2 sm:mt-0">
                                        <button
                                            onClick={() => handleLoad(scenario)}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                            aria-label={`Load scenario ${scenario.name}`}
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => handleDelete(scenario.id, scenario.name)}
                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                            aria-label={`Delete scenario ${scenario.name}`}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                        Up to 10 scenarios can be saved. Oldest will be removed when limit is reached.
                    </p>
                </div>
            )}
        </div>
    );
}
