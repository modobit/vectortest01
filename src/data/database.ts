import { PartType } from '../types';

export interface DatabaseEntry {
    id: string;
    name: string;
    length: number; // in bp
    description: string;
    notes?: string;
}

export const DATABASE: Record<PartType | string, DatabaseEntry[]> = {
    promoter: [
        { id: 'cmv', name: 'CMV', length: 589, description: 'Human cytomegalovirus immediate early enhancer/promoter', notes: 'Strong promoter; may have variable strength in some cell types.' },
        { id: 'cmv_intron', name: 'CMV+intron', length: 1242, description: 'CMV with beta-globin intron', notes: 'Enhances gene expression in eukaryotes.' },
        { id: 'ef1a', name: 'EF1a', length: 1179, description: 'Human eukaryotic translation elongation factor 1 alpha 1 promoter', notes: 'Strong promoter.' },
        { id: 'efs', name: 'EFS', length: 232, description: 'Short form of EF1a', notes: 'Medium-strength promoter.' },
        { id: 'cag', name: 'CAG', length: 1733, description: 'CMV early enhancer fused to modified chicken beta-actin promoter', notes: 'Strong promoter.' },
        { id: 'cbh', name: 'CBh', length: 798, description: 'Hybrid promoter', notes: 'Strong promoter.' },
        { id: 'cba', name: 'CBA', length: 850, description: 'Chicken beta-actin promoter', notes: 'Strong promoter.' },
        { id: 'ubc', name: 'UBC', length: 1200, description: 'Human ubiquitin C promoter', notes: 'Moderate expression across many tissues.' },
        { id: 'synapsin', name: 'Synapsin', length: 470, description: 'Neuron-specific promoter', notes: 'Specific to neurons.' },
    ],
    orf: [
        { id: 'gfp', name: 'GFP', length: 720, description: 'Green Fluorescent Protein', notes: 'Standard reporter.' },
        { id: 'mcherry', name: 'mCherry', length: 711, description: 'Red Fluorescent Protein', notes: 'Standard reporter.' },
        { id: 'lacz', name: 'LacZ', length: 3075, description: 'Beta-galactosidase', notes: 'Blue/White screening.' },
        { id: 'luciferase', name: 'Luciferase', length: 1650, description: 'Firefly Luciferase', notes: 'Bioluminescence.' },
        { id: 'cre', name: 'Cre', length: 1032, description: 'Cre Recombinase', notes: 'DNA recombination.' },
    ],
    linker: [
        { id: 't2a', name: 'T2A', length: 54, description: 'Thosea asigna virus 2A peptide', notes: 'Self-cleaving peptide.' },
        { id: 'p2a', name: 'P2A', length: 57, description: 'Porcine teschovirus-1 2A peptide', notes: 'High cleavage efficiency.' },
        { id: 'ires', name: 'IRES', length: 572, description: 'Internal Ribosome Entry Site', notes: 'Allows translation of second gene.' },
    ],
    regulatory: [
        { id: 'wpre', name: 'WPRE', length: 589, description: 'Woodchuck Hepatitis Virus Posttranscriptional Regulatory Element', notes: 'Enhances expression.' },
        { id: 'bgh_poly_a', name: 'BGH PolyA', length: 225, description: 'Bovine Growth Hormone PolyA', notes: 'Standard termination.' },
        { id: 'sv40_poly_a', name: 'SV40 PolyA', length: 240, description: 'Simian Virus 40 PolyA', notes: 'Efficient termination.' },
    ],
    backbone: [] // Not user selectable usually
};
