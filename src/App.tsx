
import { useState } from 'react';
import { PlasmidMap } from './components/PlasmidMap';
import { usePlasmidState } from './usePlasmidState';
import { useTheme } from './contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

function App() {
    const [orfCount, setOrfCount] = useState<number>(1);
    const { parts, updatePart, removePart } = usePlasmidState(orfCount);
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Vector Builder Designer</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Interactive Plasmid Map Editor</p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {isDark ? (
                            <Sun size={20} className="text-yellow-500" />
                        ) : (
                            <Moon size={20} className="text-slate-700" />
                        )}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left: Canvas Area */}
                <div className="flex-1 relative overflow-auto flex justify-center items-center p-8">
                    <PlasmidMap
                        parts={parts}
                        onUpdatePart={updatePart}
                        onRemovePart={removePart}
                        orfCount={orfCount}
                        onOrfCountChange={setOrfCount}
                    />
                </div>

                {/* Right: Sidebar (Optional Summary) */}
                <div className="w-full lg:w-80 bg-white dark:bg-slate-800 border-l dark:border-slate-700 p-6 overflow-y-auto hidden lg:block">
                    <h2 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Vector Summary</h2>
                    <div className="space-y-4">
                        {parts.map((part) => (
                            <div key={part.id} className="flex items-start gap-3 text-sm">
                                <div
                                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                                    style={{ backgroundColor: part.color }}
                                />
                                <div>
                                    <div className="font-medium text-slate-700 dark:text-slate-300">
                                        {part.stepIndex ? `Step ${part.stepIndex}: ` : ''}{part.label}
                                    </div>
                                    {part.name && (
                                        <div className="text-slate-500 dark:text-slate-400 text-xs">
                                            {part.length} bp
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="pt-4 border-t dark:border-slate-700 mt-4">
                            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100">
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
