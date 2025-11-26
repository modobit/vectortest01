import React from 'react';
import { DatabaseEntry } from '../data/database';
import { X } from 'lucide-react';

interface DatabaseModalProps {
    title: string;
    entries: DatabaseEntry[];
    onSelect: (entry: DatabaseEntry) => void;
    onClose: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ title, entries, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full transition-colors text-gray-700 dark:text-slate-300">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 dark:bg-slate-700 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 dark:text-slate-300 border-b dark:border-slate-600">Name</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-slate-300 border-b dark:border-slate-600">Length</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-slate-300 border-b dark:border-slate-600">Description</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-slate-300 border-b dark:border-slate-600">Application Notes</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-slate-300 border-b dark:border-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-700">
                            {entries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors group">
                                    <td className="p-4 font-medium text-gray-900 dark:text-slate-100">{entry.name}</td>
                                    <td className="p-4 text-gray-600 dark:text-slate-300 font-mono text-sm">{entry.length} bp</td>
                                    <td className="p-4 text-gray-600 dark:text-slate-300">{entry.description}</td>
                                    <td className="p-4 text-gray-500 dark:text-slate-400 text-sm">{entry.notes}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => onSelect(entry)}
                                            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        >
                                            Select
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-700 text-sm text-gray-500 dark:text-slate-400 text-right">
                    Showing {entries.length} entries
                </div>
            </div>
        </div>
    );
};
