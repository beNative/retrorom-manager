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
        <div className="flex flex-col h-full bg-retro-900 text-gray-300">
            <div className="flex border-b border-retro-700 bg-retro-800">
                {DOCS.map((doc) => (
                    <button
                        key={doc.id}
                        onClick={() => setActiveDoc(doc.id)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-retro-700",
                            activeDoc === doc.id ? "bg-retro-700 text-white border-b-2 border-retro-accent" : "text-gray-400"
                        )}
                    >
                        <doc.icon size={16} />
                        {doc.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-auto p-8 prose prose-invert max-w-none prose-headings:text-retro-accent prose-a:text-blue-400">
                <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
            </div>
        </div>
    );
};
