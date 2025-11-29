import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 200
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const showTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                let top = 0;
                let left = 0;

                // Basic positioning logic (can be improved with libraries like floating-ui)
                switch (position) {
                    case 'top':
                        top = rect.top - 8; // 8px gap
                        left = rect.left + rect.width / 2;
                        break;
                    case 'bottom':
                        top = rect.bottom + 8;
                        left = rect.left + rect.width / 2;
                        break;
                    case 'left':
                        top = rect.top + rect.height / 2;
                        left = rect.left - 8;
                        break;
                    case 'right':
                        top = rect.top + rect.height / 2;
                        left = rect.right + 8;
                        break;
                }

                setCoords({ top, left });
                setIsVisible(true);
            }
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                className="inline-block"
            >
                {children}
            </div>
            {isVisible && createPortal(
                <div
                    className="fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-100"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        // Adjust translation based on position
                        transform:
                            position === 'top' ? 'translate(-50%, -100%)' :
                                position === 'bottom' ? 'translate(-50%, 0)' :
                                    position === 'left' ? 'translate(-100%, -50%)' :
                                        'translate(0, -50%)'
                    }}
                >
                    {content}
                    {/* Arrow */}
                    <div
                        className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                                position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                                    position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
                                        'left-[-4px] top-1/2 -translate-y-1/2'
                            }`}
                    />
                </div>,
                document.body
            )}
        </>
    );
};
