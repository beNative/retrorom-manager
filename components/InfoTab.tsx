import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Book, Code, History, Info, Lightbulb, MessageSquare, AlertTriangle, AlertOctagon } from 'lucide-react';
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

    const components = {
        blockquote: ({ node, children, ...props }: any) => {
            // Check if the blockquote content starts with an alert marker
            // The structure usually is blockquote -> p -> text
            const firstChild = node?.children?.[0];
            if (firstChild?.tagName === 'p' && firstChild.children?.[0]?.value) {
                const text = firstChild.children[0].value;
                const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/);

                if (match) {
                    const type = match[1];
                    // Remove the marker from the text. 
                    // React-markdown renders children, so we need to handle this carefully.
                    // Since we can't easily modify the children prop deeply here without cloning,
                    // we'll use a CSS-based approach or a simplified structure for the alert title.
                    // A better way in react-markdown is to just render the alert container
                    // and let the children render, but the marker text will still be there.
                    // For a robust solution without writing a remark plugin, we can hide the marker via CSS
                    // or just accept it's there. 
                    // However, let's try to render a nice header and then the content.

                    // Actually, to strip the text properly we'd need a remark plugin. 
                    // For simplicity in this "styled hints" request, we will wrap the content 
                    // and style it based on type. The user will see "[!NOTE]" but it will be inside a styled box.
                    // To make it cleaner, we can try to suppress the first line if possible, but that's risky.

                    // Let's map types to styles and icons
                    let styles = "bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-500";
                    let Icon = Info;
                    let title = "Note";

                    switch (type) {
                        case 'TIP':
                            styles = "bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:text-green-200 dark:border-green-500";
                            Icon = Lightbulb;
                            title = "Tip";
                            break;
                        case 'IMPORTANT':
                            styles = "bg-purple-50 border-purple-500 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200 dark:border-purple-500";
                            Icon = MessageSquare;
                            title = "Important";
                            break;
                        case 'WARNING':
                            styles = "bg-yellow-50 border-yellow-500 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-500";
                            Icon = AlertTriangle;
                            title = "Warning";
                            break;
                        case 'CAUTION':
                            styles = "bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:text-red-200 dark:border-red-500";
                            Icon = AlertOctagon;
                            title = "Caution";
                            break;
                    }

                    return (
                        <div className={`my-4 rounded-md border-l-4 p-4 ${styles}`}>
                            <div className="flex items-center gap-2 font-bold mb-2">
                                <Icon size={18} />
                                {title}
                            </div>
                            <div className="text-sm opacity-90">
                                {children}
                            </div>
                        </div>
                    );
                }
            }

            return <blockquote {...props} className="border-l-4 border-retro-accent pl-4 italic my-4 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 py-2 pr-2 rounded-r">{children}</blockquote>;
        }
    };

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
                <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={components}
                >
                    {content}
                </Markdown>
            </div>
        </div>
    );
};
