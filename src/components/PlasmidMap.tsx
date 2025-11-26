
import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { PlasmidPart } from '../types';
import { DATABASE } from '../data/database';
import { DatabaseModal } from './DatabaseModal';
import { X, Database } from 'lucide-react';
import clsx from 'clsx';

interface PlasmidMapProps {
    parts: PlasmidPart[];
    onUpdatePart: (id: string, value: string, length: number) => void;
    onRemovePart: (id: string) => void;
}

export const PlasmidMap: React.FC<PlasmidMapProps> = ({ parts, onUpdatePart, onRemovePart }) => {

    const [activeModalPartId, setActiveModalPartId] = useState<string | null>(null);

    const activePart = parts.find(p => p.id === activeModalPartId);

    const width = 800;
    const height = 800;
    const radius = 200;
    const innerRadius = 180; // Ring thickness
    const labelRadius = 280; // Where labels sit

    // Calculate layout
    const { arcs } = useMemo(() => {
        const totalLength = parts.reduce((sum, part) => sum + part.length, 0);

        let currentAngle = 0;
        const arcs = parts.map(part => {
            const startAngle = currentAngle;
            const endAngle = currentAngle + (part.length / totalLength) * 2 * Math.PI;
            currentAngle = endAngle;
            return { ...part, startAngle, endAngle };
        });

        return { arcs };
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

        // Position for the leader line start (on the ring)
        const x0 = Math.sin(midAngle) * radius;
        const y0 = -Math.cos(midAngle) * radius;

        // Position for leader line elbow/end
        // We want labels to be somewhat aligned horizontally if possible, or just radial.
        // Radial is easier.

        return { x, y, x0, y0, midAngle };
    };

    return (
        <div className="relative flex justify-center items-center w-full h-full min-h-[800px] bg-white">
            <svg width={width} height={height} viewBox={`${-width / 2} ${-height / 2} ${width} ${height} `}>
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Draw Arcs */}
                <g transform="rotate(-90)"> {/* Rotate so 0 is at 12 o'clock? No, D3 0 is 12 o'clock. Wait, D3 0 is 12 o'clock usually? No, 0 is 12 o'clock if we use sin/cos correctly. d3.arc 0 is 12 o'clock. */}
                    {arcs.map((part) => (
                        <g key={part.id} className="transition-all duration-300 hover:opacity-80 cursor-pointer">
                            <path
                                d={arcGenerator({
                                    startAngle: part.startAngle,
                                    endAngle: part.endAngle,
                                }) || ''}
                                fill={part.name ? part.color : 'white'} // White fill for empty steps
                                stroke={part.color} // Colored stroke for empty steps
                                strokeWidth={2}
                                className="transition-all duration-500"
                            />
                            {/* Add arrow head if it's a directional part? */}
                        </g>
                    ))}
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
                                strokeWidth="1"
                            />
                            <foreignObject x={x - 100} y={y - 15} width={200} height={40}>
                                <div className={clsx(
                                    "flex justify-center items-center",
                                )}>
                                    {part.stepIndex ? (
                                        // Interactive Step Label
                                        <div className="relative">
                                            <button
                                                onClick={() => setActiveModalPartId(part.id)}
                                                className={clsx(
                                                    "flex items-center gap-2 px-3 py-1 rounded-md border text-sm font-medium shadow-sm transition-colors whitespace-nowrap bg-white",
                                                    part.name ? "border-pink-500 text-pink-600" : "border-gray-300 text-gray-600 hover:border-pink-400"
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
                                        <span className="text-gray-500 font-medium text-sm bg-white/80 px-2 py-1 rounded backdrop-blur-sm">
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
        </div>
    );
};

