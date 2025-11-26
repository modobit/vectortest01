import React from 'react';
import { PlasmidPart } from '../types';
import { DATABASE } from '../data/database';
import { Eye } from 'lucide-react';

interface VectorComponentsTableProps {
    parts: PlasmidPart[];
    arcs?: Array<PlasmidPart & { startAngle: number; endAngle: number }>;
    totalLength?: number;
    selectedPartId: string | null;
    onSelectPart: (partId: string | null) => void;
    onViewDetails: (part: PlasmidPart) => void;
}

// Calculate position in base pairs
function calculatePosition(
    part: PlasmidPart,
    parts: PlasmidPart[]
): { start: number; end: number; isComplement: boolean } {

    // Calculate cumulative position
    let currentPos = 1;
    for (const p of parts) {
        if (p.id === part.id) break;
        currentPos += p.length;
    }

    const start = currentPos;
    const end = currentPos + part.length - 1;
    
    // Backbone parts on the reverse strand (complement)
    const isComplement = !!(part.isFixed && (part.id === 'puc' || part.id === 'amp'));
    
    return { start, end, isComplement };
}

// Get type label
function getTypeLabel(part: PlasmidPart): string {
    if (part.type === 'promoter') return 'Promoter';
    if (part.type === 'orf') return 'CDS';
    if (part.type === 'linker') return 'Linker';
    if (part.type === 'regulatory') {
        if (part.name === 'WPRE') return 'Miscellaneous';
        if (part.name === 'BGH PolyA' || part.name === 'SV40 PolyA') return 'PolyA_signal';
        return 'Regulatory';
    }
    if (part.type === 'backbone') {
        if (part.id === 'puc') return 'Rep_origin';
        if (part.id === 'amp') return 'CDS';
        if (part.id === 'bgh') return 'PolyA_signal';
        return 'Backbone';
    }
    return part.type;
}

// Get description and notes from database
function getPartInfo(part: PlasmidPart): { description: string; notes: string } {
    if (!part.name) {
        return { description: 'None', notes: 'None' };
    }

    const entry = (DATABASE[part.type] || []).find(e => e.name === part.name);
    if (entry) {
        return {
            description: entry.description || 'None',
            notes: entry.notes || 'None'
        };
    }

    // Handle backbone parts
    if (part.type === 'backbone') {
        const descriptions: Record<string, string> = {
            '5\' ITR': 'Inverted terminal repeat',
            '3\' ITR': 'Inverted terminal repeat',
            'BGH pA': 'Bovine growth hormone polyadenylation signal',
            'pUC ori': 'pUC origin of replication',
            'Ampicillin': 'Ampicillin resistance gene'
        };
        const notes: Record<string, string> = {
            '5\' ITR': 'Required for vector integration',
            '3\' ITR': 'Required for vector integration',
            'BGH pA': 'Allows transcription termination and polyadenylation of mRNA transcribed by Pol II RNA polymerase.',
            'pUC ori': 'Facilitates plasmid replication in E. coli; regulates high-copy plasmid number (500-700).',
            'Ampicillin': 'Allows E. coli to be resistant to ampicillin.'
        };
        return {
            description: descriptions[part.label] || 'None',
            notes: notes[part.label] || 'None'
        };
    }

    return { description: 'None', notes: 'None' };
}

export const VectorComponentsTable: React.FC<VectorComponentsTableProps> = ({
    parts,
    selectedPartId,
    onSelectPart,
    onViewDetails
}) => {
    // Filter to show only parts with names or backbone parts
    const displayParts = parts.filter(part => part.name || part.isFixed || part.type === 'backbone');

    return (
        <div className="w-full min-w-0">
            <h2 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Vector Components</h2>
            {displayParts.length === 0 ? (
                <p className="text-gray-500 dark:text-slate-400 text-sm">No components to display. Add parts to see them here.</p>
            ) : (
            <div className="overflow-x-auto w-full min-w-0">
                <table className="w-full text-sm border-collapse" style={{ width: '100%', tableLayout: 'fixed', minWidth: '800px' }}>
                    <thead>
                        <tr className="bg-gray-100 dark:bg-slate-700 border-b dark:border-slate-600">
                            <th className="p-3 text-left font-semibold text-gray-700 dark:text-slate-300 border-r dark:border-slate-600" style={{ width: '12%' }}>Name</th>
                            <th className="p-3 text-left font-semibold text-gray-700 dark:text-slate-300 border-r dark:border-slate-600" style={{ width: '15%' }}>Position</th>
                            <th className="p-3 text-left font-semibold text-gray-700 dark:text-slate-300 border-r dark:border-slate-600" style={{ width: '8%' }}>Size (bp)</th>
                            <th className="p-3 text-left font-semibold text-gray-700 dark:text-slate-300 border-r dark:border-slate-600" style={{ width: '12%' }}>Type</th>
                            <th className="p-3 text-left font-semibold text-gray-700 dark:text-slate-300 border-r dark:border-slate-600" style={{ width: '25%' }}>Description</th>
                            <th className="p-3 text-left font-semibold text-gray-700 dark:text-slate-300 border-r dark:border-slate-600" style={{ width: '23%' }}>Application notes</th>
                            <th className="p-3 text-left font-semibold text-gray-700 dark:text-slate-300" style={{ width: '5%' }}>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayParts.map((part) => {
                            const { start, end, isComplement } = calculatePosition(part, parts);
                            const { description, notes } = getPartInfo(part);
                            const isSelected = selectedPartId === part.id;
                            const typeLabel = getTypeLabel(part);

                            return (
                                <tr
                                    key={part.id}
                                    onClick={() => onSelectPart(part.id)}
                                    className={`
                                        border-b dark:border-slate-700 cursor-pointer transition-colors
                                        ${isSelected 
                                            ? 'bg-blue-50 dark:bg-blue-900/30' 
                                            : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                        }
                                        ${!part.name ? 'bg-gray-100 dark:bg-slate-800/50' : ''}
                                    `}
                                >
                                    <td className="p-3 border-r dark:border-slate-700">
                                        <span className={`font-medium ${part.name ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'}`}>
                                            {part.name || part.label}
                                        </span>
                                    </td>
                                    <td className="p-3 border-r dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded-sm"
                                                style={{ backgroundColor: part.color }}
                                            />
                                            <span className="text-gray-700 dark:text-slate-300">
                                                {isComplement ? `complement (${start}-${end})` : `${start}-${end}`}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-3 border-r dark:border-slate-700 text-gray-700 dark:text-slate-300">
                                        {part.length}
                                    </td>
                                    <td className="p-3 border-r dark:border-slate-700 text-gray-700 dark:text-slate-300">
                                        {typeLabel}
                                    </td>
                                    <td className="p-3 border-r dark:border-slate-700">
                                        <span className={description === 'None' ? 'text-gray-400 dark:text-slate-500 italic' : 'text-gray-700 dark:text-slate-300'}>
                                            {description}
                                        </span>
                                    </td>
                                    <td className="p-3 border-r dark:border-slate-700">
                                        <span className={notes === 'None' ? 'text-gray-400 dark:text-slate-500 italic' : 'text-gray-700 dark:text-slate-300'}>
                                            {notes}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(part);
                                            }}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline flex items-center gap-1"
                                        >
                                            <Eye size={14} />
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    );
};

