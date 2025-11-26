import { useState } from 'react';
import { PlasmidPart } from './types';

const INITIAL_PARTS: PlasmidPart[] = [
    // Top / Start
    { id: '5itr', type: 'backbone', label: "5' ITR", color: '#9CA3AF', length: 50, isFixed: true },

    // User Steps
    { id: 'step1', type: 'promoter', label: 'Add Promoter', color: '#F49BC1', length: 30, stepIndex: 1 },
    { id: 'step2', type: 'orf', label: 'Add ORF #1', color: '#FF8C7A', length: 30, stepIndex: 2 },
    { id: 'step3', type: 'linker', label: 'Add Linker #1', color: '#A9E2F3', length: 20, stepIndex: 3 },
    { id: 'step4', type: 'orf', label: 'Add ORF #2', color: '#F4C542', length: 30, stepIndex: 4 },
    { id: 'step5', type: 'linker', label: 'Add Linker #2', color: '#A9E2F3', length: 20, stepIndex: 5 },
    { id: 'step6', type: 'orf', label: 'Add ORF #3', color: '#C97AF4', length: 30, stepIndex: 6 },
    { id: 'step7', type: 'regulatory', label: 'Add Regulatory Element', color: '#7ED957', length: 30, stepIndex: 7 },

    // Bottom / End Backbone
    { id: '3itr', type: 'backbone', label: "3' ITR", color: '#9CA3AF', length: 50, isFixed: true },
    { id: 'bgh', type: 'backbone', label: 'BGH pA', color: '#9CA3AF', length: 80, isFixed: true },
    { id: 'puc', type: 'backbone', label: 'pUC ori', color: '#60A5FA', length: 150, isFixed: true }, // Blue-ish
    { id: 'amp', type: 'backbone', label: 'Ampicillin', color: '#B91C1C', length: 200, isFixed: true }, // Red-ish
];

export function usePlasmidState() {
    const [parts, setParts] = useState<PlasmidPart[]>(INITIAL_PARTS);

    const updatePart = (id: string, name: string, length: number) => {
        setParts(prev => prev.map(part => {
            if (part.id !== id) return part;

            return {
                ...part,
                name: name,
                length: length,
                // Update label to show selection
                label: part.type === 'promoter' ? `Promoter - ${name}` : name
            };
        }));
    };

    const removePart = (id: string) => {
        setParts(prev => prev.map(part => {
            if (part.id !== id) return part;
            // Reset to empty state
            let defaultLength = 30;
            if (part.type === 'linker') defaultLength = 20;

            return {
                ...part,
                name: undefined,
                length: defaultLength,
                label: `Add ${part.type === 'orf' ? 'ORF' : part.type === 'linker' ? 'Linker' : 'Regulatory Element'}`
            };
        }));
    };

    return {
        parts,
        updatePart,
        removePart
    };
}
