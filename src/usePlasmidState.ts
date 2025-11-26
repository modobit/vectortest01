import { useState, useEffect } from 'react';
import { PlasmidPart } from './types';

const BASE_PARTS: PlasmidPart[] = [
    // Top / Start
    { id: '5itr', type: 'backbone', label: "5' ITR", color: '#9CA3AF', length: 50, isFixed: true },

    // User Steps - will be dynamically generated
    { id: 'step1', type: 'promoter', label: 'Add Promoter', color: '#F49BC1', length: 30 },
    { id: 'step2', type: 'orf', label: 'Add ORF #1', color: '#FF8C7A', length: 30 },
    { id: 'step3', type: 'linker', label: 'Add Linker #1', color: '#A9E2F3', length: 20 },
    { id: 'step4', type: 'orf', label: 'Add ORF #2', color: '#F4C542', length: 30 },
    { id: 'step5', type: 'linker', label: 'Add Linker #2', color: '#A9E2F3', length: 20 },
    { id: 'step6', type: 'orf', label: 'Add ORF #3', color: '#C97AF4', length: 30 },
    { id: 'step7', type: 'regulatory', label: 'Add Regulatory Element', color: '#7ED957', length: 30 },

    // Bottom / End Backbone
    { id: '3itr', type: 'backbone', label: "3' ITR", color: '#9CA3AF', length: 50, isFixed: true },
    { id: 'bgh', type: 'backbone', label: 'BGH pA', color: '#9CA3AF', length: 80, isFixed: true },
    { id: 'puc', type: 'backbone', label: 'pUC ori', color: '#60A5FA', length: 150, isFixed: true }, // Blue-ish
    { id: 'amp', type: 'backbone', label: 'Ampicillin', color: '#B91C1C', length: 200, isFixed: true }, // Red-ish
];

function generateParts(orfCount: number, existingParts?: PlasmidPart[]): PlasmidPart[] {
    const parts: PlasmidPart[] = [];
    let stepIndex = 1;

    // Add backbone parts before user steps
    parts.push(BASE_PARTS[0]); // 5' ITR

    // Step 1: Promoter (always shown)
    const promoterPart = { ...BASE_PARTS[1], stepIndex: stepIndex++ };
    if (existingParts) {
        const existing = existingParts.find(p => p.id === 'step1');
        if (existing) {
            promoterPart.name = existing.name;
            promoterPart.length = existing.length;
            promoterPart.label = existing.label;
        }
    }
    parts.push(promoterPart);

    // ORF and Linker steps based on orfCount
    for (let i = 1; i <= orfCount; i++) {
        // Add ORF
        const orfId = `step${i === 1 ? 2 : i === 2 ? 4 : 6}`;
        const orfPart = { 
            ...BASE_PARTS.find(p => p.id === orfId)!, 
            stepIndex: stepIndex++,
            label: `Add ORF #${i}`
        };
        if (existingParts) {
            const existing = existingParts.find(p => p.id === orfId);
            if (existing) {
                orfPart.name = existing.name;
                orfPart.length = existing.length;
                orfPart.label = existing.label;
            }
        }
        parts.push(orfPart);

        // Add Linker (only if not the last ORF)
        if (i < orfCount) {
            const linkerId = `step${i === 1 ? 3 : 5}`;
            const linkerPart = { 
                ...BASE_PARTS.find(p => p.id === linkerId)!, 
                stepIndex: stepIndex++,
                label: `Add Linker #${i}`
            };
            if (existingParts) {
                const existing = existingParts.find(p => p.id === linkerId);
                if (existing) {
                    linkerPart.name = existing.name;
                    linkerPart.length = existing.length;
                    linkerPart.label = existing.label;
                }
            }
            parts.push(linkerPart);
        }
    }

    // Step 7: Regulatory Element (always shown)
    const regulatoryPart = { ...BASE_PARTS[7], stepIndex: stepIndex++ };
    if (existingParts) {
        const existing = existingParts.find(p => p.id === 'step7');
        if (existing) {
            regulatoryPart.name = existing.name;
            regulatoryPart.length = existing.length;
            regulatoryPart.label = existing.label;
        }
    }
    parts.push(regulatoryPart);

    // Add remaining backbone parts
    for (let i = 8; i < BASE_PARTS.length; i++) {
        parts.push(BASE_PARTS[i]);
    }

    return parts;
}

export function usePlasmidState(orfCount: number = 3) {
    const [parts, setParts] = useState<PlasmidPart[]>(() => generateParts(orfCount));

    // Regenerate parts when orfCount changes
    useEffect(() => {
        setParts(prev => generateParts(orfCount, prev));
    }, [orfCount]);

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

            // Determine the correct label based on part ID
            let label = '';
            if (part.type === 'orf') {
                if (id === 'step2') label = 'Add ORF #1';
                else if (id === 'step4') label = 'Add ORF #2';
                else if (id === 'step6') label = 'Add ORF #3';
                else label = 'Add ORF';
            } else if (part.type === 'linker') {
                if (id === 'step3') label = 'Add Linker #1';
                else if (id === 'step5') label = 'Add Linker #2';
                else label = 'Add Linker';
            } else if (part.type === 'regulatory') {
                label = 'Add Regulatory Element';
            } else {
                label = `Add ${part.type}`;
            }

            return {
                ...part,
                name: undefined,
                length: defaultLength,
                label
            };
        }));
    };

    return {
        parts,
        updatePart,
        removePart
    };
}
