import React, { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';

interface ResizableSplitterProps {
    onResize: (delta: number) => void;
    className?: string;
}

export const ResizableSplitter: React.FC<ResizableSplitterProps> = ({ onResize, className }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            onResize(e.movementX);
        }
    }, [isDragging, onResize]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            className={clsx(
                "w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-600 transition-colors z-10 flex flex-col justify-center items-center group",
                isDragging ? "bg-blue-600" : "bg-transparent",
                className
            )}
            onMouseDown={handleMouseDown}
        >
            {/* Visual handle */}
            <div className={clsx("h-8 w-1 rounded-full bg-gray-300 dark:bg-retro-600 group-hover:bg-blue-400 transition-colors", isDragging && "bg-blue-400")} />
        </div>
    );
};
