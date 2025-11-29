import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Book, Code, History } from 'lucide-react';
import { clsx } from 'clsx';

const DOCS = [
    { id: 'README.md', label: 'Readme', icon: FileText },
    { id: 'FUNCTIONAL_MANUAL.md', label: 'Manual', icon: Book },
    { id: 'TECHNICAL_MANUAL.md', label: 'Technical', icon: Code },
    { id: 'VERSION_LOG.md', label: 'Changelog', icon: History },
];

export const InfoTab: React.FC = () => {
    const [activeDoc, setActiveDoc] = useState(DOCS[0].id);
    const [content, setContent] = useState('');

    useEffect(() => {
        const loadDoc = async () => {
            try {
                const text = await window.electron.getDocContent(activeDoc);
                setContent(text);
            } catch (error) {
                setContent('# Error loading document');
            }
        };
        loadDoc();
    }, [activeDoc]);

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-retro-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <div className="flex border-b border-gray-200 dark:border-retro-700 bg-white dark:bg-retro-800 transition-colors duration-200">
                {DOCS.map((doc) => (
                    <button
                        key={doc.id}
                        onClick={() => setActiveDoc(doc.id)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-retro-700",
                            activeDoc === doc.id
                                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600 dark:bg-retro-700 dark:text-white dark:border-retro-accent"
                                : "text-gray-500 dark:text-gray-400"
                        )}
                    >
                        <doc.icon size={16} />
                        {doc.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-auto p-8 markdown-content">
                <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
            </div>
        </div>
    );
};
