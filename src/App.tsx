
import { PlasmidMap } from './components/PlasmidMap';
import { usePlasmidState } from './usePlasmidState';

function App() {
    const { parts, updatePart, removePart } = usePlasmidState();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b px-6 py-4 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800">Vector Builder Designer</h1>
                <p className="text-slate-500 text-sm">Interactive Plasmid Map Editor</p>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left: Canvas Area */}
                <div className="flex-1 relative overflow-auto flex justify-center items-center p-8">
                    <PlasmidMap
                        parts={parts}
                        onUpdatePart={updatePart}
                        onRemovePart={removePart}
                    />
                </div>

                {/* Right: Sidebar (Optional Summary) */}
                <div className="w-full lg:w-80 bg-white border-l p-6 overflow-y-auto hidden lg:block">
                    <h2 className="font-bold text-lg mb-4 text-slate-800">Vector Summary</h2>
                    <div className="space-y-4">
                        {parts.map((part) => (
                            <div key={part.id} className="flex items-start gap-3 text-sm">
                                <div
                                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                                    style={{ backgroundColor: part.color }}
                                />
                                <div>
                                    <div className="font-medium text-slate-700">
                                        {part.stepIndex ? `Step ${part.stepIndex}: ` : ''}{part.label}
                                    </div>
                                    {part.name && (
                                        <div className="text-slate-500 text-xs">
                                            {part.length} bp
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="pt-4 border-t mt-4">
                            <div className="flex justify-between font-bold text-slate-800">
                                <span>Total Size:</span>
                                <span>{parts.reduce((acc, p) => acc + p.length, 0)} bp</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
