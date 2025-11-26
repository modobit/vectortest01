
import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { PlasmidPart } from '../types';
import { DATABASE, DatabaseEntry } from '../data/database';
import { DatabaseModal } from './DatabaseModal';
import { ViewComponentModal } from './ViewComponentModal';
import { useTheme } from '../contexts/ThemeContext';
import { X, Database } from 'lucide-react';
import clsx from 'clsx';

interface PlasmidMapProps {
    parts: PlasmidPart[];
    onUpdatePart: (id: string, value: string, length: number) => void;
    onRemovePart: (id: string) => void;
    orfCount: number;
    onOrfCountChange: (count: number) => void;
    selectedPartId?: string | null;
    onPartSelect?: (partId: string | null) => void;
}

export const PlasmidMap: React.FC<PlasmidMapProps> = ({ 
    parts, 
    onUpdatePart, 
    onRemovePart, 
    orfCount, 
    onOrfCountChange,
    selectedPartId = null,
    onPartSelect
}) => {
    const { isDark } = useTheme();

    const [activeModalPartId, setActiveModalPartId] = useState<string | null>(null);
    const [viewPartId, setViewPartId] = useState<string | null>(null);

    const activePart = parts.find(p => p.id === activeModalPartId);
    const viewPart = parts.find(p => p.id === viewPartId);
    
    // Find database entry for the part being viewed
    const viewPartEntry: DatabaseEntry | null = useMemo(() => {
        if (!viewPart) return null;
        if (viewPart.name) {
            return (DATABASE[viewPart.type] || []).find(entry => entry.name === viewPart.name) || null;
        }
        return null;
    }, [viewPart]);

    const width = 800;
    const height = 800;
    const radius = 200;
    const innerRadius = 180; // Ring thickness
    const labelRadius = 320; // Where labels sit - increased to move annotations away from circle

    // Calculate layout
    const { arcs, totalBp } = useMemo(() => {
        const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
        
        // Calculate total BP only from parts that have been selected (have a name)
        const selectedBp = parts
            .filter(part => part.name && !part.isFixed) // Only count selected user parts, not backbone
            .reduce((sum, part) => sum + part.length, 0);

        let currentAngle = 0;
        const arcs = parts.map(part => {
            const startAngle = currentAngle;
            const endAngle = currentAngle + (part.length / totalLength) * 2 * Math.PI;
            currentAngle = endAngle;
            return { ...part, startAngle, endAngle };
        });

        return { arcs, totalBp: selectedBp };
    }, [parts]);

    // Arc generator
    const arcGenerator = d3.arc<any>()
        .innerRadius(innerRadius)
        .outerRadius(radius)
        .padAngle(0.01)
        .cornerRadius(4);

    // Arrow generator (for directionality - simplified as just arcs for now, maybe add markers later)
    // To make it look like the image (arrows at end of arcs), we'd need custom paths. 
    // For MVP, standard arcs are fine, maybe add a triangle at the end if time permits.

    const getLabelPos = (startAngle: number, endAngle: number) => {
        const midAngle = (startAngle + endAngle) / 2;
        // Position for the label text
        const x = Math.sin(midAngle) * labelRadius;
        const y = -Math.cos(midAngle) * labelRadius;

        // Position for the leader line start (slightly outside the ring to avoid touching)
        const leaderStartRadius = radius + 5; // Start 5px outside the ring
        const x0 = Math.sin(midAngle) * leaderStartRadius;
        const y0 = -Math.cos(midAngle) * leaderStartRadius;

        // Position for leader line elbow/end
        // We want labels to be somewhat aligned horizontally if possible, or just radial.
        // Radial is easier.

        return { x, y, x0, y0, midAngle };
    };

    return (
        <div className="relative flex flex-col justify-center items-center w-full h-full bg-white dark:bg-slate-900 overflow-visible">
            {/* ORF Selection Buttons - Top Center */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                {[1, 2, 3].map((count) => (
                    <button
                        key={count}
                        onClick={() => onOrfCountChange(count)}
                        className={`px-2 py-1 rounded border text-xs font-medium transition-colors ${
                            orfCount === count
                                ? 'bg-pink-500 text-white border-pink-500'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-pink-400 hover:text-pink-600'
                        }`}
                    >
                        {count} ORF{count > 1 ? 's' : ''}
                    </button>
                ))}
            </div>

            <svg width={width} height={height} viewBox={`${-width / 2 - 50} ${-height / 2 - 50} ${width + 100} ${height + 100}`} className="overflow-visible">
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Draw Arcs */}
                <g transform="rotate(-90)"> {/* Rotate so 0 is at 12 o'clock? No, D3 0 is 12 o'clock. Wait, D3 0 is 12 o'clock usually? No, 0 is 12 o'clock if we use sin/cos correctly. d3.arc 0 is 12 o'clock. */}
                    {arcs.map((part) => {
                        const isSelected = selectedPartId === part.id;
                        return (
                            <g 
                                key={part.id} 
                                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onPartSelect) {
                                        onPartSelect(part.id);
                                    } else {
                                        setViewPartId(part.id);
                                    }
                                }}
                            >
                                <path
                                    d={arcGenerator({
                                        startAngle: part.startAngle,
                                        endAngle: part.endAngle,
                                    }) || ''}
                                    fill={part.name ? part.color : (isDark ? '#374151' : '#ededed')} // Light gray for empty steps, darker in dark mode
                                    stroke={isSelected ? '#3b82f6' : part.color} // Blue stroke when selected
                                    strokeWidth={isSelected ? 4 : 2} // Thicker stroke when selected
                                    className="transition-all duration-500"
                                    style={{
                                        filter: isSelected ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none',
                                        opacity: isSelected ? 1 : undefined
                                    }}
                                />
                                {/* Add arrow head if it's a directional part? */}
                            </g>
                        );
                    })}
                </g>

                {/* Total BP Size in Center */}
                <g>
                    <text
                        x="0"
                        y="-20"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-slate-600 dark:fill-slate-400"
                        style={{ fontSize: '14px', fontWeight: '500' }}
                    >
                        Total Size
                    </text>
                    <text
                        x="0"
                        y="8"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-3xl font-bold fill-slate-800 dark:fill-slate-100"
                        style={{ fontSize: '32px', fontWeight: 'bold' }}
                    >
                        {totalBp > 0 ? `${totalBp.toLocaleString()} bp` : '0 bp'}
                    </text>
                </g>

                {/* Draw Labels & Leader Lines */}
                {arcs.map((part) => {
                    if (part.type === 'backbone' && !part.label) return null; // Skip unlabelled backbone parts if any

                    const { x, y, x0, y0 } = getLabelPos(part.startAngle, part.endAngle);


                    // Adjust label position to be more horizontal-ish?
                    // Let's stick to radial for now, but maybe push x out a bit.

                    return (
                        <g key={`label - ${part.id} `}>
                            <line
                                x1={x0} y1={y0}
                                x2={x} y2={y}
                                stroke="#9CA3AF"
                                className="dark:stroke-slate-600"
                                strokeWidth="1"
                            />
                            <foreignObject x={x - 120} y={y - 20} width={240} height={50} className="overflow-visible">
                                <div className={clsx(
                                    "flex justify-center items-center",
                                )}>
                                    {part.stepIndex ? (
                                        // Interactive Step Label
                                        <div className="relative">
                                            <button
                                                onClick={() => setActiveModalPartId(part.id)}
                                                className={clsx(
                                                    "flex items-center gap-2 px-3 py-1 rounded-md border text-sm font-medium shadow-sm transition-colors whitespace-nowrap bg-white dark:bg-slate-800",
                                                    part.name ? "border-pink-500 text-pink-600 dark:border-pink-500 dark:text-pink-400" : "border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-pink-400"
                                                )}
                                                style={{ borderColor: part.name ? part.color : undefined, color: part.name ? part.color : undefined }}
                                            >
                                                {part.stepIndex && <span className="font-bold">Step {part.stepIndex} |</span>}
                                                <span>{part.label}</span>
                                                <Database size={14} />
                                            </button>

                                            {/* Remove Button for optional parts */}
                                            {part.name && !part.isFixed && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRemovePart(part.id);
                                                    }}
                                                    className="absolute -right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        // Static Backbone Label
                                        <span className="text-gray-500 dark:text-slate-400 font-medium text-sm bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded backdrop-blur-sm">
                                            {part.label}
                                        </span>
                                    )}
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}
            </svg>

            {/* Database Modal */}
            {activeModalPartId && activePart && (
                <DatabaseModal
                    title={`Select from ${activePart.type === 'orf' ? 'ORF' : activePart.type.charAt(0).toUpperCase() + activePart.type.slice(1)} Database`}
                    entries={DATABASE[activePart.type] || []}
                    onClose={() => setActiveModalPartId(null)}
                    onSelect={(entry) => {
                        onUpdatePart(activeModalPartId, entry.name, entry.length);
                        setActiveModalPartId(null);
                    }}
                />
            )}

            {/* View Component Modal */}
            {viewPartId && viewPart ? (
                <ViewComponentModal
                    part={viewPart}
                    entry={viewPartEntry}
                    onClose={() => setViewPartId(null)}
                />
            ) : null}
        </div>
    );
};

