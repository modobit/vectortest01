import { useMemo } from 'react';
import { PlasmidPart } from '../types';
import { Maximize2 } from 'lucide-react';

interface VectorSequenceViewerProps {
    parts: PlasmidPart[];
    selectedPartId: string | null;
    arcs?: Array<PlasmidPart & { startAngle: number; endAngle: number }>;
}

// Generate a deterministic DNA sequence for a part
function generatePartSequence(partId: string, length: number): string {
    const bases = ['A', 'T', 'G', 'C'];
    let sequence = '';
    // Use partId as seed for deterministic sequence
    let seed = 0;
    for (let i = 0; i < partId.length; i++) {
        seed += partId.charCodeAt(i);
    }
    // Simple seeded random
    const random = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
    
    for (let i = 0; i < length; i++) {
        sequence += bases[Math.floor(random() * bases.length)];
    }
    return sequence;
}

// Format sequence with line breaks and numbering (50 bases per line, 10 bases per block)
function formatSequence(sequence: string, startPos: number = 1): Array<{ lineNumber: number; blocks: string[] }> {
    const lines: Array<{ lineNumber: number; blocks: string[] }> = [];
    const basesPerLine = 50;
    const basesPerBlock = 10;
    
    for (let i = 0; i < sequence.length; i += basesPerLine) {
        const lineStart = startPos + i;
        const lineSequence = sequence.substring(i, i + basesPerLine);
        
        // Break into blocks of 10 bases
        const blocks: string[] = [];
        for (let j = 0; j < lineSequence.length; j += basesPerBlock) {
            blocks.push(lineSequence.substring(j, j + basesPerBlock));
        }
        
        lines.push({
            lineNumber: lineStart,
            blocks
        });
    }
    
    return lines;
}

export const VectorSequenceViewer: React.FC<VectorSequenceViewerProps> = ({
    parts,
    selectedPartId
}) => {
    // Calculate positions and generate sequences
    const sequenceData = useMemo(() => {
        let currentPos = 1;
        const data: Array<{
            part: PlasmidPart;
            start: number;
            end: number;
            sequence: string;
            isSelected: boolean;
        }> = [];

        for (const part of parts) {
            const start = currentPos;
            const end = currentPos + part.length - 1;
            const sequence = generatePartSequence(part.id, part.length);
            const isSelected = selectedPartId === part.id;
            
            data.push({
                part,
                start,
                end,
                sequence,
                isSelected
            });
            
            currentPos = end + 1;
        }

        return data;
    }, [parts, selectedPartId]);

    // Combine all sequences
    const fullSequence = useMemo(() => {
        return sequenceData.map(d => d.sequence).join('');
    }, [sequenceData]);

    const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
    const selectedPart = sequenceData.find(d => d.isSelected);
    const selectedRange = selectedPart 
        ? `Residue: ${selectedPart.start}-${selectedPart.end} (length: ${selectedPart.part.length})`
        : `Residue: 1-${totalLength} (length: ${totalLength})`;

    // Format the full sequence
    const formattedLines = formatSequence(fullSequence, 1);

    return (
        <div className="w-full flex flex-col bg-white dark:bg-slate-800 overflow-hidden" style={{ height: '890px' }}>
            {/* Header */}
            <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-700 shrink-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">Vector Sequence</h3>
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors">
                        <Maximize2 size={16} className="text-gray-600 dark:text-slate-300" />
                    </button>
                </div>
            </div>

            {/* Summary Info */}
            <div className="p-4 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-700 text-sm shrink-0">
                <div className="flex items-center gap-4 text-gray-700 dark:text-slate-300">
                    <span>Full length: {totalLength}</span>
                    <span>{selectedRange}</span>
                </div>
            </div>

            {/* Sequence Display - Scrollable with fixed height */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs" style={{ minHeight: 0 }}>
                <div className="space-y-1">
                    {formattedLines.map((line, lineIdx) => {
                        return (
                            <div key={lineIdx} className="flex items-center gap-2">
                                <span className="text-gray-500 dark:text-slate-400 w-16 text-right shrink-0">
                                    {line.lineNumber}
                                </span>
                                <div className="flex gap-1 flex-wrap">
                                    {line.blocks.map((block, blockIdx) => {
                                        const blockStart = line.lineNumber + (blockIdx * 10);
                                        
                                        // Check if this block is part of the selected part
                                        let blockPartData: typeof sequenceData[0] | null = null;
                                        for (const data of sequenceData) {
                                            if (blockStart >= data.start && blockStart <= data.end) {
                                                blockPartData = data;
                                                break;
                                            }
                                        }

                                        const isSelectedBlock = blockPartData?.isSelected || false;
                                        const blockPartColor = blockPartData?.part.color || '#9CA3AF';
                                        const hasPart = !!blockPartData;

                                        return (
                                            <span
                                                key={blockIdx}
                                                className={`
                                                    text-gray-900 dark:text-slate-100
                                                    ${isSelectedBlock 
                                                        ? 'bg-blue-100 dark:bg-blue-900/30 underline decoration-2' 
                                                        : hasPart
                                                            ? 'bg-green-50 dark:bg-green-900/20 underline decoration-1'
                                                            : ''
                                                    }
                                                `}
                                                style={{
                                                    textDecorationColor: isSelectedBlock 
                                                        ? '#3b82f6' 
                                                        : hasPart
                                                            ? blockPartColor 
                                                            : 'transparent',
                                                    textUnderlineOffset: '2px',
                                                    textDecorationThickness: isSelectedBlock ? '2px' : '1px'
                                                }}
                                            >
                                                {block}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

