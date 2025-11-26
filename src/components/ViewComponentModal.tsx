import React, { useState, useMemo } from 'react';
import { DatabaseEntry } from '../data/database';
import { PlasmidPart } from '../types';
import { X, Copy, ExternalLink } from 'lucide-react';

interface ViewComponentModalProps {
    part: PlasmidPart;
    entry: DatabaseEntry | null;
    onClose: () => void;
}

// Generate a mock DNA sequence for display (deterministic based on part id and length)
function generateSequence(partId: string, length: number): string {
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

// Format sequence with line breaks, numbering, and blocks of 10 bases
function formatSequence(sequence: string, basesPerLine: number = 100): string[] {
    const lines: string[] = [];
    const blockSize = 10; // 10 bases per block
    
    for (let i = 0; i < sequence.length; i += basesPerLine) {
        const lineStart = i;
        const lineEnd = Math.min(i + basesPerLine, sequence.length);
        const lineSequence = sequence.substring(lineStart, lineEnd);
        
        // Break into blocks of 10 bases with spaces
        const blocks: string[] = [];
        for (let j = 0; j < lineSequence.length; j += blockSize) {
            blocks.push(lineSequence.substring(j, j + blockSize));
        }
        const formattedLine = blocks.join(' ');
        
        // Line number (1-based, showing 1, 101, 201, etc.)
        const lineNumber = lineStart + 1;
        lines.push(`${lineNumber.toString().padStart(4, ' ')} ${formattedLine}`);
    }
    return lines;
}

export const ViewComponentModal: React.FC<ViewComponentModalProps> = ({ part, entry, onClose }) => {
    const [copied, setCopied] = useState(false);
    
    // Generate sequence once and memoize it
    const sequence = useMemo(() => {
        if (!entry || !entry.length) return '';
        return generateSequence(part.id, entry.length);
    }, [part.id, entry]);
    
    const formattedSequence = useMemo(() => {
        if (!sequence) return [];
        return formatSequence(sequence);
    }, [sequence]);
    
    // Handle backdrop click to close
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    
    if (!entry) {
        // For backbone parts or parts without database entries
        return (
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={handleBackdropClick}
            >
                <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                    <div className="flex items-center justify-between p-6 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">View Component</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-600 dark:hover:bg-slate-600 rounded-full transition-colors text-gray-700 dark:text-slate-300 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="p-6 overflow-auto">
                        <div className="space-y-4">
                            <div>
                                <span className="font-semibold text-gray-700 dark:text-slate-300">Name:</span>
                                <span className="ml-2 text-gray-900 dark:text-slate-100">{part.label}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700 dark:text-slate-300">Type:</span>
                                <span className="ml-2 text-gray-900 dark:text-slate-100 capitalize">{part.type}</span>
                            </div>
                            {part.isFixed && (
                                <div className="text-sm text-gray-500 dark:text-slate-400 italic">
                                    This is a backbone element and cannot be modified.
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Footer with Close Button */}
                    <div className="p-6 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-700 flex justify-end">
                        <button 
                            onClick={onClose}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 dark:bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-slate-500 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const copySequence = () => {
        navigator.clipboard.writeText(sequence);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            promoter: 'Promoters',
            orf: 'ORFs',
            linker: 'Linkers',
            regulatory: 'Regulatory Elements',
            backbone: 'Backbone Elements'
        };
        return labels[type] || type;
    };

    // Mock references - in a real app, these would come from the database
    const references = [
        { text: 'J Biol Chem. 267:16330 (1992)', url: '#' },
        { text: 'Nat Protoc. 7:171 (2012)', url: '#' }
    ];

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleBackdropClick}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">View Component</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-600 dark:hover:bg-slate-600 rounded-full transition-colors text-gray-700 dark:text-slate-300 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-auto p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-slate-300">Name:</span>
                        <span className="ml-2 text-gray-900 dark:text-slate-100">{entry.name}</span>
                    </div>

                    {/* Description */}
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-slate-300">Description:</span>
                        <p className="mt-1 text-gray-900 dark:text-slate-100">{entry.description}</p>
                    </div>

                    {/* Application Notes */}
                    {entry.notes && (
                        <div>
                            <span className="font-semibold text-gray-700 dark:text-slate-300">Application Notes:</span>
                            <p className="mt-1 text-gray-900 dark:text-slate-100">{entry.notes}</p>
                        </div>
                    )}

                    {/* Type */}
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-slate-300">Type:</span>
                        <span className="ml-2 text-gray-900 dark:text-slate-100">{getTypeLabel(part.type)}</span>
                    </div>

                    {/* References */}
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-slate-300">References:</span>
                        <div className="mt-1 space-y-1">
                            {references.map((ref, idx) => (
                                <a
                                    key={idx}
                                    href={ref.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                                >
                                    {ref.text}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Sequence */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">
                                Sequence (Length: {entry.length} bp)
                            </h3>
                            <button
                                onClick={copySequence}
                                className="flex items-center gap-2 px-4 py-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium transition-colors"
                            >
                                <Copy size={16} />
                                {copied ? 'Copied!' : 'Copy Sequence'}
                            </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                            <pre className="whitespace-pre text-gray-800 dark:text-slate-200 leading-relaxed">
                                {formattedSequence.join('\n')}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-700 flex gap-3 justify-end items-center">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors">
                        View Opposite Strand
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors">
                        Translate
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 dark:bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors">
                        <ExternalLink size={16} />
                        Open in VectorBee
                        <span className="text-red-500 text-xs">?</span>
                    </button>
                    <button 
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 dark:bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-slate-500 transition-colors ml-4"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

