export type PartType = 'backbone' | 'promoter' | 'orf' | 'linker' | 'regulatory';

export interface PlasmidPart {
    id: string;
    type: PartType;
    label: string;
    name?: string; // The specific selection (e.g., "CMV", "GFP")
    color: string;
    length: number; // Relative length for visualization
    startAngle?: number; // Calculated at render time
    endAngle?: number;   // Calculated at render time
    isFixed?: boolean;   // If true, cannot be removed/changed (backbone)
    stepIndex?: number;  // 1-based step index for user parts
}

export interface StepOption {
    label: string;
    value: string;
}

export const STEP_OPTIONS: Record<string, StepOption[]> = {
    promoter: [
        { label: 'CMV', value: 'CMV' },
        { label: 'EF1a', value: 'EF1a' },
        { label: 'CAG', value: 'CAG' },
        { label: 'UBC', value: 'UBC' },
        { label: 'Synapsin', value: 'Synapsin' },
    ],
    orf: [
        { label: 'GFP', value: 'GFP' },
        { label: 'mCherry', value: 'mCherry' },
        { label: 'LacZ', value: 'LacZ' },
        { label: 'Luciferase', value: 'Luciferase' },
        { label: 'Custom', value: 'Custom' },
    ],
    linker: [
        { label: 'T2A', value: 'T2A' },
        { label: 'P2A', value: 'P2A' },
        { label: 'IRES', value: 'IRES' },
    ],
    regulatory: [
        { label: 'WPRE', value: 'WPRE' },
        { label: 'PolyA', value: 'PolyA' },
        { label: 'Kozak', value: 'Kozak' },
        { label: 'UTR', value: 'UTR' },
    ]
};
