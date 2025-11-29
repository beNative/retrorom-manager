import React, { useState } from 'react';
import { BiosResult } from '../types';
import { Cpu, CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

interface BiosCheckerProps {
    basePath: string | null;
}

export const BiosChecker: React.FC<BiosCheckerProps> = ({ basePath }) => {
    const [results, setResults] = useState<BiosResult[]>([]);
    const [scanning, setScanning] = useState(false);
    const [hasScanned, setHasScanned] = useState(false);

    const handleScan = async () => {
        if (!basePath) return;
        setScanning(true);
        try {
            const data = await window.electron.checkBios(basePath);
            setResults(data);
            setHasScanned(true);
        } catch (error) {
            console.error("Error checking BIOS:", error);
        } finally {
            setScanning(false);
        }
    };

    const foundCount = results.filter(r => r.found).length;
    const missingCount = results.filter(r => !r.found && !r.definition.isOptional).length;

    return (
        <div className="flex flex-col h-full p-6 bg-gray-50 dark:bg-retro-900 text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Cpu className="text-retro-accent" /> BIOS Checker
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Check for common BIOS files required by emulators.
                    </p>
                </div>
                <button
                    onClick={handleScan}
                    disabled={scanning || !basePath}
                    className="flex items-center gap-2 px-4 py-2 bg-retro-accent hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {scanning ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    {hasScanned ? 'Rescan' : 'Check BIOS'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white dark:bg-retro-800 rounded-lg shadow border border-gray-200 dark:border-retro-700">
                {!hasScanned && !scanning && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Cpu size={48} className="mb-4 opacity-50" />
                        <p>Click "Check BIOS" to scan your folders.</p>
                    </div>
                )}

                {hasScanned && (
                    <div className="w-full">
                        <div className="p-4 border-b border-gray-200 dark:border-retro-700 bg-gray-50 dark:bg-retro-900/50 flex gap-6">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                                <CheckCircle2 size={20} /> Found: {foundCount}
                            </div>
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                                <XCircle size={20} /> Missing (Required): {missingCount}
                            </div>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 dark:bg-retro-900/30 text-gray-600 dark:text-gray-400 text-sm uppercase font-semibold">
                                <tr>
                                    <th className="p-4 border-b border-gray-200 dark:border-retro-700">Status</th>
                                    <th className="p-4 border-b border-gray-200 dark:border-retro-700">System</th>
                                    <th className="p-4 border-b border-gray-200 dark:border-retro-700">Filename</th>
                                    <th className="p-4 border-b border-gray-200 dark:border-retro-700">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-retro-700">
                                {results.map((result, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-retro-700/50 transition-colors">
                                        <td className="p-4">
                                            {result.found ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    <CheckCircle2 size={14} /> Found
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${result.definition.isOptional
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {result.definition.isOptional ? <AlertTriangle size={14} /> : <XCircle size={14} />}
                                                    {result.definition.isOptional ? 'Missing (Optional)' : 'Missing'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 font-medium">{result.definition.system}</td>
                                        <td className="p-4 font-mono text-sm">{result.definition.filename}</td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400">{result.definition.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
