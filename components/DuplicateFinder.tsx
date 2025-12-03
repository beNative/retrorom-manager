import React, { useState, useMemo } from 'react';
import { System } from '../types';
import { Trash2, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface DuplicateFinderProps {
    systems: System[];
}

interface DuplicateFile {
    path: string;
    filename: string;
    systemId: string;
    size: number;
}

interface DuplicateGroup {
    name: string;
    files: DuplicateFile[];
}

export const DuplicateFinder: React.FC<DuplicateFinderProps> = ({ systems }) => {
    const [duplicates, setDuplicates] = useState<Record<string, DuplicateGroup[]>>({});
    const [scanning, setScanning] = useState(false);
    const [selectedToDelete, setSelectedToDelete] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState(false);

    const handleScan = async () => {
        setScanning(true);
        try {
            const results = await window.electron.findDuplicates(systems);
            setDuplicates(results);
            setSelectedToDelete(new Set()); // Reset selection
        } catch (error) {
            console.error("Error scanning duplicates:", error);
        } finally {
            setScanning(false);
        }
    };

    const toggleSelection = (filePath: string) => {
        const newSet = new Set(selectedToDelete);
        if (newSet.has(filePath)) {
            newSet.delete(filePath);
        } else {
            newSet.add(filePath);
        }
        setSelectedToDelete(newSet);
    };

    const handleDelete = async () => {
        if (selectedToDelete.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedToDelete.size} files? This cannot be undone.`)) return;

        setDeleting(true);
        try {
            const paths = Array.from(selectedToDelete);
            await window.electron.deleteFiles(paths);

            // Refresh scan
            await handleScan();
        } catch (error) {
            console.error("Error deleting files:", error);
        } finally {
            setDeleting(false);
        }
    };

    const autoSelect = (group: DuplicateGroup) => {
        // Heuristic: Keep the one with the most "standard" name (e.g. USA version, or shortest name)
        // For now, let's just keep the first one and select the rest for deletion
        // This is a "Select All Except First"
        const filesToDelete = group.files.slice(1);
        const newSet = new Set(selectedToDelete);
        filesToDelete.forEach(f => newSet.add(f.path));
        setSelectedToDelete(newSet);
    };

    const hasResults = Object.keys(duplicates).length > 0;

    // Flatten files for keyboard navigation
    const allFiles = useMemo(() => {
        return Object.values(duplicates).flatMap(groups =>
            groups.flatMap(group => group.files)
        );
    }, [duplicates]);

    const { handleKeyDown, setRef } = useKeyboardNavigation<HTMLInputElement>(
        allFiles.length,
        (index) => toggleSelection(allFiles[index].path),
        { loop: false }
    );

    let globalIndex = 0;

    return (
        <div className="flex flex-col h-full p-6 bg-gray-50 dark:bg-retro-900 text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Duplicate ROM Finder</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Scan your collection for duplicate games based on normalized filenames.
                    </p>
                </div>
                <div className="flex gap-4">
                    {hasResults && (
                        <button
                            onClick={handleDelete}
                            disabled={deleting || selectedToDelete.size === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Trash2 size={18} />
                            Delete Selected ({selectedToDelete.size})
                        </button>
                    )}
                    <button
                        onClick={handleScan}
                        disabled={scanning}
                        className="flex items-center gap-2 px-4 py-2 bg-retro-accent hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {scanning ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                        {hasResults ? 'Rescan' : 'Scan for Duplicates'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {!hasResults && !scanning && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <AlertTriangle size={48} className="mb-4 opacity-50" />
                        <p>No duplicates found or scan not started.</p>
                    </div>
                )}

                {Object.entries(duplicates).map(([systemId, groups]) => (
                    <div key={systemId} className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-retro-accent border-b border-gray-200 dark:border-retro-700 pb-2">
                            {systemId}
                        </h3>
                        <div className="space-y-4">
                            {groups.map((group, i) => (
                                <div key={i} className="bg-white dark:bg-retro-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-retro-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-lg">{group.name}</h4>
                                        <button
                                            onClick={() => autoSelect(group)}
                                            className="text-xs text-retro-accent hover:underline"
                                        >
                                            Select All Except First
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {group.files.map((file) => {
                                            const currentIndex = globalIndex++;
                                            return (
                                                <label
                                                    key={file.path}
                                                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${selectedToDelete.has(file.path)
                                                        ? 'bg-red-50 dark:bg-red-900/20'
                                                        : 'hover:bg-gray-50 dark:hover:bg-retro-700'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        ref={setRef(currentIndex)}
                                                        checked={selectedToDelete.has(file.path)}
                                                        onChange={() => toggleSelection(file.path)}
                                                        onKeyDown={(e) => handleKeyDown(e, currentIndex)}
                                                        className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                                    />
                                                    <span className={`flex-1 font-mono text-sm ${selectedToDelete.has(file.path) ? 'text-red-600 dark:text-red-400 line-through' : ''}`}>
                                                        {file.filename}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
